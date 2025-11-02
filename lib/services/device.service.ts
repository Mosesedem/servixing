import { db } from "@/lib/db";
import {
  NotFoundError,
  AuthorizationError,
  ValidationError,
} from "@/lib/errors";
import { logger } from "@/lib/logger";

export class DeviceService {
  /**
   * Create a new device
   */
  async createDevice(
    userId: string,
    data: {
      deviceType: string;
      brand: string;
      model: string;
      serialNumber?: string;
      imei?: string;
      color?: string;
      description?: string;
      images?: string[];
    }
  ) {
    const device = await db.device.create({
      data: {
        ...data,
        userId,
        images: data.images || [],
      },
    });

    logger.info(`Device created: ${device.id} by user ${userId}`);

    return device;
  }

  /**
   * Get device by ID
   */
  async getDeviceById(deviceId: string, userId?: string) {
    const device = await db.device.findUnique({
      where: { id: deviceId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        workOrders: {
          select: {
            id: true,
            status: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 5,
        },
      },
    });

    if (!device) {
      throw new NotFoundError("Device");
    }

    // Check authorization if userId provided
    if (userId && device.userId !== userId) {
      throw new AuthorizationError("You don't have access to this device");
    }

    return device;
  }

  /**
   * Get all devices for a user
   */
  async getUserDevices(
    userId: string,
    filters?: {
      search?: string;
      deviceType?: string;
      brand?: string;
      page?: number;
      limit?: number;
    }
  ) {
    const page = filters?.page || 1;
    const limit = filters?.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = {
      userId,
    };

    // Apply filters
    if (filters?.search) {
      where.OR = [
        { model: { contains: filters.search, mode: "insensitive" } },
        { brand: { contains: filters.search, mode: "insensitive" } },
        { serialNumber: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    if (filters?.deviceType) {
      where.deviceType = filters.deviceType;
    }

    if (filters?.brand) {
      where.brand = filters.brand;
    }

    const [devices, total] = await Promise.all([
      db.device.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          _count: {
            select: { workOrders: true },
          },
        },
      }),
      db.device.count({ where }),
    ]);

    return {
      devices,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Update device
   */
  async updateDevice(
    deviceId: string,
    userId: string,
    data: {
      deviceType?: string;
      brand?: string;
      model?: string;
      serialNumber?: string;
      imei?: string;
      color?: string;
      description?: string;
      images?: string[];
    }
  ) {
    // Verify ownership
    const device = await db.device.findUnique({
      where: { id: deviceId },
      select: { userId: true },
    });

    if (!device) {
      throw new NotFoundError("Device");
    }

    if (device.userId !== userId) {
      throw new AuthorizationError(
        "You don't have permission to update this device"
      );
    }

    const updated = await db.device.update({
      where: { id: deviceId },
      data,
    });

    logger.info(`Device updated: ${deviceId} by user ${userId}`);

    return updated;
  }

  /**
   * Delete device (soft delete)
   */
  async deleteDevice(deviceId: string, userId: string) {
    // Verify ownership
    const device = await db.device.findUnique({
      where: { id: deviceId },
      select: { userId: true },
    });

    if (!device) {
      throw new NotFoundError("Device");
    }

    if (device.userId !== userId) {
      throw new AuthorizationError(
        "You don't have permission to delete this device"
      );
    }

    // Check if device has active work orders
    const activeWorkOrders = await db.workOrder.count({
      where: {
        deviceId,
        status: {
          in: ["CREATED", "ACCEPTED", "IN_REPAIR", "AWAITING_PARTS"],
        },
      },
    });

    if (activeWorkOrders > 0) {
      throw new ValidationError("Cannot delete device with active work orders");
    }

    // Soft delete
    await db.device.delete({
      where: { id: deviceId },
    });

    logger.info(`Device deleted: ${deviceId} by user ${userId}`);

    return { success: true };
  }
}

// Export singleton instance
export const deviceService = new DeviceService();
