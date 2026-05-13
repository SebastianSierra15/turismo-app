import { z } from "zod";

export const ReservationStatusSchema = z.enum([
  "confirmada",
  "pendiente",
  "completada",
  "cancelada",
]);

export const ReservationDetailSchema = z.object({
  label: z.string(),
  value: z.string().optional(),
  icon: z.string(),
  tone: z.enum(["primary", "tertiary", "secondary"]),
  rating: z.number().int().min(1).max(5).optional(),
});

export const ReservationActionSchema = z.object({
  label: z.string(),
  variant: z.enum(["primary", "dark", "outline"]),
  title: z.string(),
  href: z.string().optional(),
});

export const ReservationSchema = z.object({
  id: z.string(),
  title: z.string(),
  status: ReservationStatusSchema,
  statusLabel: z.string(),
  image: z.string().url(),
  imageAlt: z.string(),
  details: z.array(ReservationDetailSchema),
  totalLabel: z.string(),
  totalAmount: z.string(),
  primaryAction: ReservationActionSchema,
  secondaryAction: z
    .object({
      icon: z.string(),
      title: z.string(),
      href: z.string().optional(),
    })
    .optional(),
});

export const ReservationsSchema = z.array(ReservationSchema);
