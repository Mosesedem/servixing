import { hash, compare } from "bcryptjs";
import { randomBytes, createHash } from "crypto";
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

  /**
   * Generate a password reset token and return metadata for email delivery
   */
  async requestPasswordReset(email: string) {
    const normalizedEmail = email.toLowerCase().trim();
    const user = await db.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true, email: true, name: true, deletedAt: true },
    });

    if (!user || !user.email || user.deletedAt) {
      logger.warn(
        `Password reset requested for non-existent or inactive account: ${normalizedEmail}`
      );
      return null;
    }

    // Remove existing tokens for this identifier
    await db.verificationToken.deleteMany({
      where: { identifier: user.email },
    });

    // Generate a 6-digit numeric PIN for better UX
    // Note: Lower entropy than a random token, so we shorten expiry and recommend rate limiting
    const pin = Math.floor(Math.random() * 1_000_000)
      .toString()
      .padStart(6, "0");
    const hashedToken = createHash("sha256").update(pin).digest("hex");
    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

    await db.verificationToken.create({
      data: {
        identifier: user.email,
        token: hashedToken,
        expires,
      },
    });

    logger.info(`Password reset PIN generated for user: ${user.email}`);

    return {
      token: pin,
      expires,
      email: user.email,
      name: user.name,
    };
  }

  /**
   * Reset password using a valid token
   */
  async resetPassword(token: string, newPassword: string) {
    const hashedToken = createHash("sha256").update(token).digest("hex");

    const verificationRecord = await db.verificationToken.findFirst({
      where: { token: hashedToken },
    });

    if (!verificationRecord) {
      throw new ValidationError("Invalid or expired reset token");
    }

    if (verificationRecord.expires < new Date()) {
      await db.verificationToken.delete({
        where: {
          identifier_token: {
            identifier: verificationRecord.identifier,
            token: verificationRecord.token,
          },
        },
      });
      throw new ValidationError("Reset token has expired");
    }

    const user = await db.user.findUnique({
      where: { email: verificationRecord.identifier },
    });

    if (!user) {
      throw new NotFoundError("User");
    }

    const passwordHash = await hash(newPassword, 12);

    await db.user.update({
      where: { id: user.id },
      data: {
        password: passwordHash,
        emailVerified: user.emailVerified ?? new Date(),
      },
    });

    await db.verificationToken.delete({
      where: {
        identifier_token: {
          identifier: verificationRecord.identifier,
          token: verificationRecord.token,
        },
      },
    });

    logger.info(`Password reset completed for user: ${user.email}`);

    return { success: true, userId: user.id };
  }

  /**
   * Verify a password reset token/PIN without consuming it
   */
  async verifyResetToken(token: string) {
    const hashedToken = createHash("sha256").update(token).digest("hex");

    const verificationRecord = await db.verificationToken.findFirst({
      where: { token: hashedToken },
    });

    if (!verificationRecord) {
      throw new ValidationError("Invalid or expired reset token");
    }

    if (verificationRecord.expires < new Date()) {
      await db.verificationToken.delete({
        where: {
          identifier_token: {
            identifier: verificationRecord.identifier,
            token: verificationRecord.token,
          },
        },
      });
      throw new ValidationError("Reset token has expired");
    }

    return {
      identifier: verificationRecord.identifier,
      expires: verificationRecord.expires,
      valid: true,
    };
  }
}

// Export singleton instance
export const authService = new AuthService();
