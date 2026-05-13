import { z } from "zod";
import { OperatorReservationSchema, OperatorReservationStatusSchema } from "@/schemas/operatorReservations";

export const AdminReservationStatusSchema = OperatorReservationStatusSchema;
export const AdminReservationSchema = OperatorReservationSchema;
export const AdminReservationsSchema = z.array(AdminReservationSchema);

export const AdminReservationsKpisSchema = z.object({
  total_reservas: z.number(),
  confirmadas: z.number(),
  canceladas: z.number(),
  ingresos_estimados: z.number(),
  ingresos_estimados_label: z.string(),
  ingresos_confirmados: z.number().optional(),
  ingresos_confirmados_label: z.string().optional(),
});

