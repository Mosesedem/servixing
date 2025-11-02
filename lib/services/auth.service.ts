import { hash, compare } from "bcryptjs";
import { db } from "@/lib/db";
import {
  ConflictError,
  AuthenticationError,
  NotFoundError,
  ValidationError,
} from "@/lib/errors";
import { logger } from "@/lib/logger";

export class AuthService {
  /**
   * Register a new user
   */
  async register(data: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    address?: string;
  }) {
    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new ConflictError("User with this email already exists");
    }

    // Hash password
    const passwordHash = await hash(data.password, 12);

    // Create user
    const user = await db.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: passwordHash,
        phone: data.phone,
        address: data.address,
        role: "CUSTOMER",
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    logger.info(`New user registered: ${user.email}`);

    return user;
  }

  /**
   * Verify user credentials
   */
  async verifyCredentials(email: string, password: string) {
    const user = await db.user.findUnique({
      where: { email },
    });

    if (!user || !user.password) {
      throw new AuthenticationError("Invalid email or password");
    }

    const isValidPassword = await compare(password, user.password);

    if (!isValidPassword) {
      throw new AuthenticationError("Invalid email or password");
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string) {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        role: true,
        image: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new NotFoundError("User");
    }

    return user;
  }

  /**
   * Update user profile
   */
  async updateProfile(
    userId: string,
    data: {
      name?: string;
      phone?: string;
      address?: string;
      image?: string;
    }
  ) {
    const user = await db.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        image: true,
        role: true,
        updatedAt: true,
      },
    });

    logger.info(`User profile updated: ${userId}`);

    return user;
  }

  /**
   * Change user password
   */
  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ) {
    const user = await db.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.password) {
      throw new NotFoundError("User");
    }

    // Verify current password
    const isValidPassword = await compare(currentPassword, user.password);

    if (!isValidPassword) {
      throw new ValidationError("Current password is incorrect");
    }

    // Hash new password
    const newPasswordHash = await hash(newPassword, 12);

    // Update password
    await db.user.update({
      where: { id: userId },
      data: { password: newPasswordHash },
    });

    logger.info(`Password changed for user: ${userId}`);

    return { success: true };
  }

  /**
   * Check if user has role (authorization)
   */
  async checkUserRole(userId: string, allowedRoles: string[]) {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!user) {
      throw new NotFoundError("User");
    }

    return allowedRoles.includes(user.role);
  }
}

// Export singleton instance
export const authService = new AuthService();
