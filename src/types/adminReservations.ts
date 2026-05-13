import { z } from "zod";
import {
  AdminReservationSchema,
  AdminReservationsSchema,
  AdminReservationsKpisSchema,
  AdminReservationStatusSchema,
} from "@/schemas/adminReservations";

export type AdminReservation = z.infer<typeof AdminReservationSchema>;
export type AdminReservations = z.infer<typeof AdminReservationsSchema>;
export type AdminReservationStatus = z.infer<typeof AdminReservationStatusSchema>;
export type AdminReservationsKpis = z.infer<typeof AdminReservationsKpisSchema>;

