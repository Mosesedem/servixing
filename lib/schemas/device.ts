import { z } from "zod";

/**
 * Device creation schema
 */
export const createDeviceSchema = z.object({
  deviceType: z.string().min(1, "Device type is required"),
  brand: z.string().min(1, "Brand is required"),
  model: z.string().min(1, "Model is required"),
  serialNumber: z.string().optional(),
  imei: z.string().optional(),
  color: z.string().optional(),
  description: z.string().max(1000).optional(),
  images: z
    .array(z.string().url())
    .max(10, "Maximum 10 images allowed")
    .default([]),
});

/**
 * Device update schema
 */
export const updateDeviceSchema = z.object({
  deviceType: z.string().min(1).optional(),
  brand: z.string().min(1).optional(),
  model: z.string().min(1).optional(),
  serialNumber: z.string().optional(),
  imei: z.string().optional(),
  color: z.string().optional(),
  description: z.string().max(1000).optional(),
  images: z.array(z.string().url()).max(10).optional(),
});

/**
 * Device query schema
 */
export const deviceQuerySchema = z.object({
  search: z.string().optional(),
  deviceType: z.string().optional(),
  brand: z.string().optional(),
});
