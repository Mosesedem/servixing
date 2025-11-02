import { z } from "zod";

/**
 * Support ticket creation schema
 */
export const createTicketSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(200),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(2000),
  workOrderId: z.string().cuid().optional(),
  deviceId: z.string().cuid().optional(),
  priority: z.enum(["low", "normal", "high", "urgent"]).default("normal"),
});

/**
 * Ticket message schema
 */
export const createTicketMessageSchema = z.object({
  ticketId: z.string().cuid("Invalid ticket ID"),
  message: z.string().min(1, "Message cannot be empty").max(2000),
  attachments: z
    .array(z.string().url())
    .max(5, "Maximum 5 attachments allowed")
    .default([]),
});

/**
 * Ticket update schema (admin)
 */
export const updateTicketSchema = z.object({
  status: z.enum(["OPEN", "IN_PROGRESS", "PENDING", "CLOSED"]).optional(),
  priority: z.enum(["low", "normal", "high", "urgent"]).optional(),
  assignedTo: z.string().cuid().optional(),
});
