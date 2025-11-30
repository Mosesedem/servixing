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
   * Initialize payment with selected provider
   */
  async initializePayment(data: {
    workOrderId?: string;
    userId: string;
    email: string;
    amount: number;
    provider: "paystack" | "etegram" | "flutterwave";
    metadata?: any;
  }) {
    // Check if this is for an existing payment
    let payment;
    if (data.metadata?.existingPaymentId) {
      payment = await db.payment.findUnique({
        where: { id: data.metadata.existingPaymentId },
      });

      if (!payment) {
        throw new NotFoundError("Existing payment");
      }

      if (payment.userId !== data.userId) {
        throw new PaymentError("Unauthorized payment access");
      }

      if (payment.status !== "PENDING") {
        throw new PaymentError("Payment already processed");
      }

      // Update the existing payment with new provider
      payment = await db.payment.update({
        where: { id: payment.id },
        data: { provider: data.provider },
      });
    } else {
      // Verify work order exists if provided
      if (data.workOrderId) {
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
      }

      // Create payment record
      payment = await db.payment.create({
        data: {
          userId: data.userId,
          workOrderId: data.workOrderId || null,
          amount: new Decimal(data.amount),
          status: "PENDING",
          provider: data.provider,
          metadata: data.metadata || {},
        },
      });
    }

    // Initialize payment based on provider
    switch (data.provider) {
      case "paystack":
        return this.initializePaystackPayment(payment, data);
      case "etegram":
        return this.initializeEtegramPayment(payment, data);
      case "flutterwave":
        return this.initializeFlutterwavePayment(payment, data);
      default:
        throw new PaymentError(
          `Unsupported payment provider: ${data.provider}`
        );
    }
  }

  /**
   * Initialize Paystack payment
   */
  private async initializePaystackPayment(payment: any, data: any) {
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
            callback_url: data.workOrderId
              ? `${env.NEXTAUTH_URL}/dashboard/work-orders/${data.workOrderId}`
              : `${env.NEXTAUTH_URL}/services/warranty-device-check?payment=${payment.id}`,
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
        `Paystack payment initialized: ${payment.id} for work order ${data.workOrderId}`
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
   * Initialize Etegram payment
   */
  private async initializeEtegramPayment(payment: any, data: any) {
    try {
      const projectId = env.ETEGRAM_PROJECT_ID;
      const publicKey = env.ETEGRAM_PUBLIC_KEY;

      if (!projectId || !publicKey) {
        throw new PaymentError("Etegram configuration missing");
      }

      const response = await fetch(
        `https://api-checkout.etegram.com/api/transaction/initialize/${projectId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${publicKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            amount: data.amount,
            email: data.email,
            phone: data.metadata?.phone || "",
            firstname: data.metadata?.firstName || "",
            lastname: data.metadata?.lastName || "",
            reference: payment.id,
          }),
        }
      );

      const result = await response.json();

      if (!result.status) {
        throw new PaymentError(
          result.message || "Failed to initialize Etegram payment"
        );
      }

      // Update payment with Etegram details
      await db.payment.update({
        where: { id: payment.id },
        data: {
          paystackReference: result.data.reference, // Using paystackReference field for consistency
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
        `Etegram payment initialized: ${payment.id} for work order ${data.workOrderId}`
      );

      return {
        paymentId: payment.id,
        reference: result.data.reference,
        authorizationUrl: result.data.authorization_url,
        accessCode: result.data.access_code,
      };
    } catch (error) {
      logger.error(
        "Etegram initialization failed:",
        error instanceof Error ? error : new Error(String(error))
      );
      throw new ExternalServiceError("Etegram", "Failed to initialize payment");
    }
  }

  /**
   * Initialize Flutterwave payment
   */
  private async initializeFlutterwavePayment(payment: any, data: any) {
    try {
      const accessToken = env.FLUTTERWAVE_ACCESS_TOKEN;

      if (!accessToken) {
        throw new PaymentError("Flutterwave configuration missing");
      }

      const response = await fetch(
        "https://api.flutterwave.com/orchestration/direct-charges",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
            "X-Trace-Id": payment.id,
            "X-Idempotency-Key": payment.id,
          },
          body: JSON.stringify({
            amount: data.amount,
            currency: "NGN",
            reference: payment.id,
            customer: {
              email: data.email,
              name: {
                first: data.metadata?.firstName || "",
                last: data.metadata?.lastName || "",
              },
              phone: {
                country_code: "234",
                number: data.metadata?.phone || "",
              },
            },
            payment_method: {
              type: "card", // Default to card, can be extended
            },
            meta: {
              paymentId: payment.id,
              workOrderId: data.workOrderId,
              ...data.metadata,
            },
            redirect_url: data.workOrderId
              ? `${env.NEXTAUTH_URL}/dashboard/work-orders/${data.workOrderId}`
              : `${env.NEXTAUTH_URL}/services/warranty-device-check?payment=${payment.id}`,
          }),
        }
      );

      const result = await response.json();

      if (result.status !== "success") {
        throw new PaymentError(
          result.message || "Failed to initialize Flutterwave payment"
        );
      }

      // Update payment with Flutterwave details
      await db.payment.update({
        where: { id: payment.id },
        data: {
          paystackReference: result.data.reference || payment.id,
          paystackAccessCode: result.data.id,
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
        `Flutterwave payment initialized: ${payment.id} for work order ${data.workOrderId}`
      );

      return {
        paymentId: payment.id,
        reference: result.data.reference || payment.id,
        authorizationUrl: result.data.next_action?.redirect?.url,
        accessCode: result.data.id,
      };
    } catch (error) {
      logger.error(
        "Flutterwave initialization failed:",
        error instanceof Error ? error : new Error(String(error))
      );
      throw new ExternalServiceError(
        "Flutterwave",
        "Failed to initialize payment"
      );
    }
  }

  /**
   * Verify payment
   */
  async verifyPayment(reference: string) {
    try {
      // Find payment record
      const payment = await db.payment.findUnique({
        where: { paystackReference: reference },
        include: { workOrder: true },
      });

      if (!payment) {
        throw new NotFoundError("Payment");
      }

      // Verify based on provider
      switch (payment.provider) {
        case "paystack":
          return this.verifyPaystackPayment(reference, payment);
        case "etegram":
          return this.verifyEtegramPayment(reference, payment);
        case "flutterwave":
          return this.verifyFlutterwavePayment(reference, payment);
        default:
          throw new PaymentError(
            `Unsupported payment provider: ${payment.provider}`
          );
      }
    } catch (error) {
      logger.error(
        "Payment verification failed:",
        error instanceof Error ? error : new Error(String(error))
      );
      throw new PaymentError("Failed to verify payment");
    }
  }

  /**
   * Verify Paystack payment
   */
  private async verifyPaystackPayment(reference: string, payment: any) {
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
    if (paymentData.status === "success" && payment.workOrderId) {
      await db.workOrder.update({
        where: { id: payment.workOrderId },
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
  }

  /**
   * Verify Etegram payment
   */
  private async verifyEtegramPayment(reference: string, payment: any) {
    // Etegram verification - assuming similar to Paystack for now
    // This would need to be updated based on Etegram's verification API
    const projectId = env.ETEGRAM_PROJECT_ID;
    const publicKey = env.ETEGRAM_PUBLIC_KEY;

    const response = await fetch(
      `https://api-checkout.etegram.com/api/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${publicKey}`,
        },
      }
    );

    const result = await response.json();

    if (!result.status) {
      throw new PaymentError("Etegram payment verification failed");
    }

    const paymentData = result.data;

    // Update payment status
    const updatedPayment = await db.payment.update({
      where: { id: payment.id },
      data: {
        status: paymentData.status === "success" ? "PAID" : "FAILED",
        webhookVerified: true,
        webhookVerifiedAt: new Date(),
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
    if (paymentData.status === "success" && payment.workOrderId) {
      await db.workOrder.update({
        where: { id: payment.workOrderId },
        data: {
          paymentStatus: "PAID",
          paymentReference: reference,
        },
      });

      logger.info(
        `Etegram payment verified and work order updated: ${payment.workOrderId}`
      );
    }

    return {
      status: paymentData.status,
      amount: paymentData.amount,
      payment: updatedPayment,
    };
  }

  /**
   * Verify Flutterwave payment
   */
  private async verifyFlutterwavePayment(reference: string, payment: any) {
    const accessToken = env.FLUTTERWAVE_ACCESS_TOKEN;

    const response = await fetch(
      `https://api.flutterwave.com/charges/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const result = await response.json();

    if (result.status !== "success") {
      throw new PaymentError("Flutterwave payment verification failed");
    }

    const paymentData = result.data;

    // Update payment status
    const updatedPayment = await db.payment.update({
      where: { id: payment.id },
      data: {
        status: paymentData.status === "successful" ? "PAID" : "FAILED",
        webhookVerified: true,
        webhookVerifiedAt: new Date(),
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
    if (paymentData.status === "successful" && payment.workOrderId) {
      await db.workOrder.update({
        where: { id: payment.workOrderId },
        data: {
          paymentStatus: "PAID",
          paymentReference: reference,
        },
      });

      logger.info(
        `Flutterwave payment verified and work order updated: ${payment.workOrderId}`
      );
    }

    return {
      status: paymentData.status,
      amount: paymentData.amount,
      payment: updatedPayment,
    };
  }

  /**
   * Handle webhook from payment provider
   */
  async handleWebhook(provider: string, event: string, data: any) {
    try {
      switch (provider) {
        case "paystack":
          return this.handlePaystackWebhook(event, data);
        case "etegram":
          return this.handleEtegramWebhook(event, data);
        case "flutterwave":
          return this.handleFlutterwaveWebhook(event, data);
        default:
          logger.warn(`Unsupported webhook provider: ${provider}`);
          return;
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
   * Handle Paystack webhook
   */
  private async handlePaystackWebhook(event: string, data: any) {
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

      logger.info(
        `Paystack webhook processed: ${event} for payment ${payment.id}`
      );
    }
  }

  /**
   * Handle Etegram webhook
   */
  private async handleEtegramWebhook(event: string, data: any) {
    // Assuming Etegram has similar webhook structure
    if (event === "payment.success" || event === "charge.success") {
      const reference = data.reference;
      const payment = await db.payment.findUnique({
        where: { paystackReference: reference },
      });

      if (!payment) {
        logger.warn(`Etegram payment not found for reference: ${reference}`);
        return;
      }

      // Update payment
      await db.payment.update({
        where: { id: payment.id },
        data: {
          status: "PAID",
          webhookVerified: true,
          webhookVerifiedAt: new Date(),
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

      logger.info(
        `Etegram webhook processed: ${event} for payment ${payment.id}`
      );
    }
  }

  /**
   * Handle Flutterwave webhook
   */
  private async handleFlutterwaveWebhook(event: string, data: any) {
    if (event === "charge.completed" || data.status === "successful") {
      const reference = data.tx_ref || data.reference;
      const payment = await db.payment.findUnique({
        where: { paystackReference: reference },
      });

      if (!payment) {
        logger.warn(
          `Flutterwave payment not found for reference: ${reference}`
        );
        return;
      }

      // Update payment
      await db.payment.update({
        where: { id: payment.id },
        data: {
          status: "PAID",
          webhookVerified: true,
          webhookVerifiedAt: new Date(),
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

      logger.info(
        `Flutterwave webhook processed: ${event} for payment ${payment.id}`
      );
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

  /**
   * Initiate refund for a payment
   */
  async initiateRefund(data: {
    paymentId: string;
    amount?: number; // Optional partial refund
    reason: string;
    requestedBy: string; // Admin user ID
  }) {
    const payment = await db.payment.findUnique({
      where: { id: data.paymentId },
      include: {
        workOrder: true,
        user: true,
      },
    });

    if (!payment) {
      throw new NotFoundError("Payment");
    }

    if (payment.status !== "PAID") {
      throw new PaymentError("Only paid payments can be refunded");
    }

    if (payment.status === "REFUNDED") {
      throw new PaymentError("Payment already refunded");
    }

    const refundAmount = data.amount || Number(payment.amount);
    if (refundAmount > Number(payment.amount)) {
      throw new PaymentError("Refund amount exceeds payment amount");
    }

    try {
      // Initiate Paystack refund
      const response = await fetch("https://api.paystack.co/refund", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          transaction: payment.paystackReference,
          amount: Math.round(refundAmount * 100), // Convert to kobo
          merchant_note: data.reason,
        }),
      });

      const result = await response.json();

      if (!result.status) {
        throw new PaymentError(result.message || "Refund initiation failed");
      }

      // Create refund record
      const refund = await db.refund.create({
        data: {
          paymentId: payment.id,
          amount: new Decimal(refundAmount),
          reason: data.reason,
          status: "PENDING",
          requestedBy: data.requestedBy,
          paystackRefundId: result.data.id?.toString(),
        },
      });

      // Log refund initiation
      await db.paymentLog.create({
        data: {
          paymentId: payment.id,
          event: "refund_initiated",
          response: result,
        },
      });

      // Update payment status if full refund
      if (refundAmount === Number(payment.amount)) {
        await db.payment.update({
          where: { id: payment.id },
          data: { status: "REFUNDED" },
        });

        // Update work order
        if (payment.workOrderId) {
          await db.workOrder.update({
            where: { id: payment.workOrderId },
            data: { paymentStatus: "REFUNDED" },
          });
        }
      }

      logger.info(
        `Refund initiated: ${refund.id} for payment ${payment.id}, Amount: ₦${refundAmount}`
      );

      return {
        refundId: refund.id,
        amount: refundAmount,
        status: "PENDING",
      };
    } catch (error) {
      logger.error(
        "Refund initiation failed:",
        error instanceof Error ? error : new Error(String(error))
      );
      throw new PaymentError("Failed to initiate refund");
    }
  }

  /**
   * Get refund details
   */
  async getRefund(refundId: string) {
    const refund = await db.refund.findUnique({
      where: { id: refundId },
      include: {
        payment: {
          include: {
            workOrder: {
              include: {
                device: true,
              },
            },
            user: true,
          },
        },
      },
    });

    if (!refund) {
      throw new NotFoundError("Refund");
    }

    return refund;
  }

  /**
   * Get payment analytics
   */
  async getPaymentAnalytics(dateFrom?: Date, dateTo?: Date) {
    const where =
      dateFrom && dateTo
        ? {
            createdAt: {
              gte: dateFrom,
              lte: dateTo,
            },
          }
        : {};

    const [
      totalPayments,
      successfulPayments,
      failedPayments,
      refundedPayments,
      totalRevenue,
      avgTransactionValue,
    ] = await Promise.all([
      db.payment.count({ where }),
      db.payment.count({ where: { ...where, status: "PAID" } }),
      db.payment.count({ where: { ...where, status: "FAILED" } }),
      db.payment.count({ where: { ...where, status: "REFUNDED" } }),
      db.payment.aggregate({
        where: { ...where, status: "PAID" },
        _sum: { amount: true },
      }),
      db.payment.aggregate({
        where: { ...where, status: "PAID" },
        _avg: { amount: true },
      }),
    ]);

    const totalRefunds = await db.refund.aggregate({
      where: {
        status: "COMPLETED",
        createdAt:
          dateFrom && dateTo ? { gte: dateFrom, lte: dateTo } : undefined,
      },
      _sum: { amount: true },
    });

    const successRate =
      totalPayments > 0 ? (successfulPayments / totalPayments) * 100 : 0;

    return {
      totalPayments,
      successfulPayments,
      failedPayments,
      refundedPayments,
      totalRevenue: Number(totalRevenue._sum.amount || 0),
      totalRefunds: Number(totalRefunds._sum.amount || 0),
      netRevenue:
        Number(totalRevenue._sum.amount || 0) -
        Number(totalRefunds._sum.amount || 0),
      avgTransactionValue: Number(avgTransactionValue._avg.amount || 0),
      successRate: Number(successRate.toFixed(2)),
    };
  }

  /**
   * Get recent payments (for admin dashboard)
   */
  async getRecentPayments(limit = 10) {
    return db.payment.findMany({
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
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
    });
  }
}

// Export singleton instance
export const paymentService = new PaymentService();
