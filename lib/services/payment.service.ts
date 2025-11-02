// @ts-nocheck
import { db } from "@/lib/db";
import { Decimal } from "decimal.js";
import {
  NotFoundError,
  PaymentError,
  ExternalServiceError,
} from "@/lib/errors";
import { logger } from "@/lib/logger";
import { env } from "@/lib/env";

export class PaymentService {
  /**
   * Initialize Paystack payment
   */
  async initializePayment(data: {
    workOrderId: string;
    userId: string;
    email: string;
    amount: number;
    metadata?: any;
  }) {
    // Verify work order exists
    const workOrder = await db.workOrder.findUnique({
      where: { id: data.workOrderId },
      select: {
        id: true,
        userId: true,
        totalAmount: true,
        paymentStatus: true,
      },
    });

    if (!workOrder) {
      throw new NotFoundError("Work order");
    }

    if (workOrder.userId !== data.userId) {
      throw new PaymentError("Unauthorized payment attempt");
    }

    if (workOrder.paymentStatus === "PAID") {
      throw new PaymentError("Work order already paid");
    }

    // Create payment record
    const payment = await db.payment.create({
      data: {
        userId: data.userId,
        workOrderId: data.workOrderId,
        amount: new Decimal(data.amount),
        status: "PENDING",
        provider: "paystack",
        metadata: data.metadata || {},
      },
    });

    // Initialize Paystack transaction
    try {
      const response = await fetch(
        "https://api.paystack.co/transaction/initialize",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${env.PAYSTACK_SECRET_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: data.email,
            amount: Math.round(data.amount * 100), // Convert to kobo
            reference: payment.id,
            metadata: {
              paymentId: payment.id,
              workOrderId: data.workOrderId,
              ...data.metadata,
            },
            callback_url: `${env.NEXTAUTH_URL}/dashboard/work-orders/${data.workOrderId}`,
          }),
        }
      );

      const result = await response.json();

      if (!result.status) {
        throw new PaymentError(
          result.message || "Failed to initialize payment"
        );
      }

      // Update payment with Paystack details
      await db.payment.update({
        where: { id: payment.id },
        data: {
          paystackReference: payment.id,
          paystackAccessCode: result.data.access_code,
        },
      });

      // Log payment initialization
      await db.paymentLog.create({
        data: {
          paymentId: payment.id,
          event: "initialized",
          response: result,
        },
      });

      logger.info(
        `Payment initialized: ${payment.id} for work order ${data.workOrderId}`
      );

      return {
        paymentId: payment.id,
        reference: payment.id,
        authorizationUrl: result.data.authorization_url,
        accessCode: result.data.access_code,
      };
    } catch (error) {
      logger.error(
        "Paystack initialization failed:",
        error instanceof Error ? error : new Error(String(error))
      );
      throw new ExternalServiceError(
        "Paystack",
        "Failed to initialize payment"
      );
    }
  }

  /**
   * Verify payment
   */
  async verifyPayment(reference: string) {
    try {
      const response = await fetch(
        `https://api.paystack.co/transaction/verify/${reference}`,
        {
          headers: {
            Authorization: `Bearer ${env.PAYSTACK_SECRET_KEY}`,
          },
        }
      );

      const result = await response.json();

      if (!result.status) {
        throw new PaymentError("Payment verification failed");
      }

      const paymentData = result.data;

      // Find payment record
      const payment = await db.payment.findUnique({
        where: { paystackReference: reference },
        include: { workOrder: true },
      });

      if (!payment) {
        throw new NotFoundError("Payment");
      }

      // Update payment status
      const updatedPayment = await db.payment.update({
        where: { id: payment.id },
        data: {
          status: paymentData.status === "success" ? "PAID" : "FAILED",
          webhookVerified: true,
          webhookVerifiedAt: new Date(),
          paystackAuthCode: paymentData.authorization?.authorization_code,
        },
      });

      // Log verification
      await db.paymentLog.create({
        data: {
          paymentId: payment.id,
          event: "verified",
          response: result,
        },
      });

      // Update work order if payment successful
      if (paymentData.status === "success") {
        await db.workOrder.update({
          where: { id: payment.workOrderId! },
          data: {
            paymentStatus: "PAID",
            paymentReference: reference,
          },
        });

        logger.info(
          `Payment verified and work order updated: ${payment.workOrderId}`
        );
      }

      return {
        status: paymentData.status,
        amount: paymentData.amount / 100, // Convert from kobo
        payment: updatedPayment,
      };
    } catch (error) {
      logger.error(
        "Payment verification failed:",
        error instanceof Error ? error : new Error(String(error))
      );
      throw new PaymentError("Failed to verify payment");
    }
  }

  /**
   * Handle Paystack webhook
   */
  async handleWebhook(event: string, data: any) {
    try {
      if (event === "charge.success") {
        const reference = data.reference;
        const payment = await db.payment.findUnique({
          where: { paystackReference: reference },
        });

        if (!payment) {
          logger.warn(`Payment not found for reference: ${reference}`);
          return;
        }

        // Update payment
        await db.payment.update({
          where: { id: payment.id },
          data: {
            status: "PAID",
            webhookVerified: true,
            webhookVerifiedAt: new Date(),
            paystackAuthCode: data.authorization?.authorization_code,
          },
        });

        // Update work order
        if (payment.workOrderId) {
          await db.workOrder.update({
            where: { id: payment.workOrderId },
            data: {
              paymentStatus: "PAID",
              paymentReference: reference,
            },
          });
        }

        // Log webhook
        await db.paymentLog.create({
          data: {
            paymentId: payment.id,
            event: "webhook_success",
            response: data,
          },
        });

        logger.info(`Webhook processed: ${event} for payment ${payment.id}`);
      }
    } catch (error) {
      logger.error(
        "Webhook handling failed:",
        error instanceof Error ? error : new Error(String(error))
      );
      throw error;
    }
  }

  /**
   * Get payment history
   */
  async getPaymentHistory(userId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [payments, total] = await Promise.all([
      db.payment.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          workOrder: {
            select: {
              id: true,
              device: {
                select: {
                  brand: true,
                  model: true,
                },
              },
            },
          },
        },
      }),
      db.payment.count({ where: { userId } }),
    ]);

    return {
      payments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}

// Export singleton instance
export const paymentService = new PaymentService();
