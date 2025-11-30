import { z } from "zod";

/**
 * Environment variables schema
 * Validates all required environment variables at runtime
 */
const envSchema = z.object({
  // Node environment
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),

  // Database
  DATABASE_URL: z.string().url(),
  DATABASE_URL_UNPOOLED: z.string().url().optional(),

  // NextAuth
  NEXTAUTH_URL: z.string().url(),
  NEXTAUTH_SECRET: z.string().min(32),

  // Google OAuth (optional)
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),

  // Paystack
  PAYSTACK_SECRET_KEY: z.string().startsWith("sk_"),
  NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY: z.string().startsWith("pk_"),

  // Etegram
  ETEGRAM_PROJECT_ID: z.string().optional(),
  ETEGRAM_PUBLIC_KEY: z.string().optional(),

  // Flutterwave
  FLUTTERWAVE_ACCESS_TOKEN: z.string().optional(),
  FLUTTERWAVE_SECRET_HASH: z.string().optional(),

  // Redis/Upstash (optional for MVP)
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),

  // Email (optional for MVP)
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().email().optional(),

  // eBay (optional)
  EBAY_APP_ID: z.string().optional(),
  EBAY_CERT_ID: z.string().optional(),
  EBAY_OAUTH_TOKEN: z.string().optional(),

  // Cloudinary (for future use)
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),

  // Warranty and Device Status APIs
  WARRANTY_API_KEY: z.string().optional(),
  GSMA_API_KEY: z.string().optional(),

  // Apple Warranty API (optional)
  APPLE_API_KEY: z.string().optional(),
  APPLE_API_SECRET: z.string().optional(),

  // Dell Warranty API (optional)
  DELL_API_KEY: z.string().optional(),

  // Cron secret for Vercel
  CRON_SECRET: z.string().optional(),
});

/**
 * Validated environment variables
 * Use this instead of process.env
 */
export const env = envSchema.parse(process.env);

/**
 * Type-safe environment variables
 */
export type Env = z.infer<typeof envSchema>;

/**
 * Validate environment on server startup
 */
export function validateEnv() {
  try {
    envSchema.parse(process.env);
    console.log("✅ Environment variables validated successfully");
  } catch (error) {
    console.error("❌ Invalid environment variables:");
    if (error instanceof z.ZodError) {
      error.errors.forEach((err) => {
        console.error(`  - ${err.path.join(".")}: ${err.message}`);
      });
    }
    process.exit(1);
  }
}
