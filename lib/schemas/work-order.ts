import { z } from "zod";

/**
 * Address schema
 */
export const addressSchema = z.object({
  street: z.string().min(1, "Street address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  postalCode: z.string().min(1, "Postal code is required"),
  country: z.string().min(1, "Country is required").default("Nigeria"),
});

/**
 * Work order creation schema
 */
export const createWorkOrderSchema = z
  .object({
    deviceId: z.string().cuid("Invalid device ID"),
    issueDescription: z
      .string()
      .min(10, "Issue description must be at least 10 characters")
      .max(2000, "Issue description is too long"),
    problemType: z.string().optional(), // Selected problem category
    dropoffType: z.enum(["DROPOFF", "DISPATCH"]),
    dispatchAddress: addressSchema.optional(),
    warrantyDecision: z
      .enum(["requested", "skipped", "requested_paid"])
      .optional(),
  })
  .refine(
    (data) => {
      // If DISPATCH, dispatch address is required
      if (data.dropoffType === "DISPATCH" && !data.dispatchAddress) {
        return false;
      }
      return true;
    },
    {
      message: "Dispatch address is required for dispatch orders",
      path: ["dispatchAddress"],
    }
  );

/**
 * Work order update schema (admin)
 */
export const updateWorkOrderSchema = z.object({
  status: z
    .enum([
      "CREATED",
      "ACCEPTED",
      "IN_REPAIR",
      "AWAITING_PARTS",
      "READY_FOR_PICKUP",
      "COMPLETED",
      "CANCELLED",
    ])
    .optional(),
  estimatedCost: z.number().positive().optional(),
  finalCost: z.number().positive().optional(),
  notes: z.string().max(2000).optional(),
  warrantyStatus: z
    .enum([
      "NONE",
      "PENDING",
      "IN_WARRANTY",
      "OUT_OF_WARRANTY",
      "MANUAL_REQUIRED",
    ])
    .optional(),
  warrantyProvider: z.string().optional(),
  warrantyExpiryDate: z.coerce.date().optional(),
});

/**
 * Work order query schema
 */
export const workOrderQuerySchema = z.object({
  status: z.string().optional(),
  paymentStatus: z.string().optional(),
  userId: z.string().cuid().optional(),
  deviceId: z.string().cuid().optional(),
  search: z.string().optional(),
});
