import { z } from "zod";

export const OperatorReservationStatusSchema = z.enum([
  "pendiente",
  "confirmada",
  "cancelada",
  "completada",
]);

export const OperatorReservationSchema = z.object({
  id: z.string(),
  fecha: z.string(),
  estado: OperatorReservationStatusSchema,
  estado_label: z.string(),
  personas: z.number(),
  total: z.number(),
  total_label: z.string(),
  precio_unitario_label: z.string(),
  paquete: z.object({
    id: z.string(),
    nombre: z.string(),
    imagen: z.string().url(),
  }),
  turista: z.object({
    nombre: z.string(),
    email: z.string(),
  }),
  proveedor: z.string(),
  fecha_reserva: z.string().optional(),
});

export const OperatorReservationsSchema = z.array(OperatorReservationSchema);
