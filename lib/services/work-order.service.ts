// @ts-nocheck
import { db } from "@/lib/db";
import { Decimal } from "decimal.js";
import {
  NotFoundError,
  AuthorizationError,
  ValidationError,
} from "@/lib/errors";
import { logger } from "@/lib/logger";

export class WorkOrderService {
  /**
   * Calculate dispatch fee based on location
   */
  private calculateDispatchFee(address: any): number {
    // Simple calculation - can be enhanced with distance APIs
    const baseFee = 1000; // NGN
    const urgentFee = 500;

    return baseFee;
  }

  /**
   * Create a new work order
   */
  async createWorkOrder(
    userId: string,
    data: {
      deviceId: string;
      contactName?: string;
      contactEmail?: string;
      contactPhone?: string;
      issueDescription: string;
      problemType?: string;
      dropoffType: string;
      dispatchAddress?: any;
      warrantyDecision?: string;
    }
  ) {
    // Verify device ownership
    const device = await db.device.findUnique({
      where: { id: data.deviceId },
      select: { userId: true },
    });

    if (!device) {
      throw new NotFoundError("Device");
    }

    if (device.userId !== userId) {
      throw new AuthorizationError("You don't own this device");
    }

    // Calculate fees
    let dispatchFee: Decimal | null = null;
    let warrantyFee: Decimal | null = null;

    if (data.dropoffType === "DISPATCH" || data.dropoffType === "ONSITE") {
      if (!data.dispatchAddress) {
        throw new ValidationError(
          "Address is required for dispatch and onsite orders"
        );
      }
      dispatchFee = new Decimal(
        this.calculateDispatchFee(data.dispatchAddress)
      );
    }

    if (data.warrantyDecision === "requested_paid") {
      warrantyFee = new Decimal(500); // NGN 500 for warranty check
    }

    // Calculate total amount
    const totalAmount = new Decimal(0)
      .plus(dispatchFee || 0)
      .plus(warrantyFee || 0);

    const workOrder = await db.workOrder.create({
      data: {
        userId,
        deviceId: data.deviceId,
        contactName: data.contactName,
        contactEmail: data.contactEmail,
        contactPhone: data.contactPhone,
        issueDescription: data.issueDescription,
        problemType: data.problemType || null,
        dropoffType: data.dropoffType as any,
        dispatchAddress: data.dispatchAddress || null,
        dispatchFee,
        warrantyDecision: data.warrantyDecision,
        warrantyChecked: data.warrantyDecision === "requested_paid",
        totalAmount: totalAmount.toNumber() > 0 ? totalAmount : null,
        costBreakdown: {
          dispatchFee: dispatchFee?.toNumber() || 0,
          warrantyFee: warrantyFee?.toNumber() || 0,
        },
      },
      include: {
        device: {
          select: {
            brand: true,
            model: true,
            serialNumber: true,
          },
        },
      },
    });

    logger.info(`Work order created: ${workOrder.id} by user ${userId}`);

    return workOrder;
  }

  /**
   * Get work order by ID
   */
  async getWorkOrderById(
    workOrderId: string,
    userId?: string,
    isAdmin = false
  ) {
    const workOrder = await db.workOrder.findUnique({
      where: { id: workOrderId },
      include: {
        device: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        payments: {
          orderBy: { createdAt: "desc" },
        },
        parts: true,
        warrantyChecks: true,
        supportTickets: {
          select: {
            id: true,
            title: true,
            status: true,
          },
        },
      },
    });

    if (!workOrder) {
      throw new NotFoundError("Work order");
    }

    // Check authorization
    if (!isAdmin && userId && workOrder.userId !== userId) {
      throw new AuthorizationError("You don't have access to this work order");
    }

    return workOrder;
  }

  /**
   * Get user's work orders
   */
  async getUserWorkOrders(
    userId: string,
    filters?: {
      status?: string;
      paymentStatus?: string;
      deviceId?: string;
      page?: number;
      limit?: number;
    }
  ) {
    const page = filters?.page || 1;
    const limit = filters?.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = { userId };

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.paymentStatus) {
      where.paymentStatus = filters.paymentStatus;
    }

    if (filters?.deviceId) {
      where.deviceId = filters.deviceId;
    }

    const [workOrders, total] = await Promise.all([
      db.workOrder.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          device: {
            select: {
              brand: true,
              model: true,
              serialNumber: true,
            },
          },
          _count: {
            select: {
              payments: true,
              parts: true,
            },
          },
        },
      }),
      db.workOrder.count({ where }),
    ]);

    return {
      workOrders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Update work order (admin only)
   */
  async updateWorkOrder(
    workOrderId: string,
    data: {
      status?: string;
      estimatedCost?: number;
      finalCost?: number;
      notes?: string;
      warrantyStatus?: string;
      warrantyProvider?: string;
      warrantyExpiryDate?: Date;
    }
  ) {
    const workOrder = await db.workOrder.findUnique({
      where: { id: workOrderId },
    });

    if (!workOrder) {
      throw new NotFoundError("Work order");
    }

    const updated = await db.workOrder.update({
      where: { id: workOrderId },
      data: {
        ...(data.status && { status: data.status as any }),
        ...(data.estimatedCost !== undefined && {
          estimatedCost: new Decimal(data.estimatedCost),
        }),
        ...(data.finalCost !== undefined && {
          finalCost: new Decimal(data.finalCost),
        }),
        ...(data.notes && { notes: data.notes }),
        ...(data.warrantyStatus && {
          warrantyStatus: data.warrantyStatus as any,
        }),
        ...(data.warrantyProvider && {
          warrantyProvider: data.warrantyProvider,
        }),
        ...(data.warrantyExpiryDate && {
          warrantyExpiryDate: data.warrantyExpiryDate,
        }),
      },
    });

    logger.info(`Work order updated: ${workOrderId}`);

    return updated;
  }

  /**
   * Cancel work order
   */
  async cancelWorkOrder(workOrderId: string, userId: string) {
    const workOrder = await db.workOrder.findUnique({
      where: { id: workOrderId },
      select: { userId: true, status: true },
    });

    if (!workOrder) {
      throw new NotFoundError("Work order");
    }

    if (workOrder.userId !== userId) {
      throw new AuthorizationError("You can only cancel your own work orders");
    }

    if (workOrder.status === "COMPLETED" || workOrder.status === "CANCELLED") {
      throw new ValidationError(
        "Cannot cancel completed or already cancelled work orders"
      );
    }

    const cancelled = await db.workOrder.update({
      where: { id: workOrderId },
      data: { status: "CANCELLED" },
    });

    logger.info(`Work order cancelled: ${workOrderId} by user ${userId}`);

    return cancelled;
  }

  /**
   * Get work order statistics (admin)
   */
  async getStatistics() {
    const [total, byStatus, byPaymentStatus, recentOrders] = await Promise.all([
      db.workOrder.count(),
      db.workOrder.groupBy({
        by: ["status"],
        _count: true,
      }),
      db.workOrder.groupBy({
        by: ["paymentStatus"],
        _count: true,
      }),
      db.workOrder.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: { name: true, email: true },
          },
          device: {
            select: { brand: true, model: true },
          },
        },
      }),
    ]);

    return {
      total,
      byStatus,
      byPaymentStatus,
      recentOrders,
    };
  }
}

// Export singleton instance
export const workOrderService = new WorkOrderService();
