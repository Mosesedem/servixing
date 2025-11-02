import { z } from "zod";

/**
 * Common validation schemas
 */

// ID validation
export const idSchema = z.string().cuid();

// Pagination
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
});

// Date range
export const dateRangeSchema = z.object({
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
});

// Sort order
export const sortOrderSchema = z.enum(["asc", "desc"]).default("desc");
