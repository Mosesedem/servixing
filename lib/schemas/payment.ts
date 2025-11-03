import { z } from "zod";

/**
 * Payment initialization schema
 */
export const initializePaymentSchema = z.object({
  workOrderId: z.string().cuid("Invalid work order ID").optional(),
  amount: z.number().positive("Amount must be positive"),
  email: z.string().email("Invalid email address"),
  metadata: z.record(z.any()).optional(),
});

/**
 * Payment verification schema
 */
export const verifyPaymentSchema = z.object({
  reference: z.string().min(1, "Payment reference is required"),
});

/**
 * Paystack webhook schema
 */
export const paystackWebhookSchema = z.object({
  event: z.string(),
  data: z.object({
    reference: z.string(),
    amount: z.number(),
    status: z.string(),
    paid_at: z.string().optional(),
    customer: z.object({
      email: z.string().email(),
    }),
    authorization: z
      .object({
        authorization_code: z.string().optional(),
      })
      .optional(),
    metadata: z.any().optional(),
  }),
});
