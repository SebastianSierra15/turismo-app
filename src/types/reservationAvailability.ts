import { z } from "zod";
import {
  ReservationAvailabilityDestinationSchema,
  ReservationAvailabilitySchema,
} from "@/schemas/reservationAvailability";

export type ReservationAvailabilityDestination = z.infer<
  typeof ReservationAvailabilityDestinationSchema
>;
export type ReservationAvailability = z.infer<
  typeof ReservationAvailabilitySchema
>;
