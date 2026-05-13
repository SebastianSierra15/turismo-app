import { z } from "zod";
import {
  OperatorReservationSchema,
  OperatorReservationsSchema,
  OperatorReservationStatusSchema,
} from "@/schemas/operatorReservations";

export type OperatorReservation = z.infer<typeof OperatorReservationSchema>;
export type OperatorReservations = z.infer<typeof OperatorReservationsSchema>;
export type OperatorReservationStatus = z.infer<typeof OperatorReservationStatusSchema>;
