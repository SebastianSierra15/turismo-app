import { z } from "zod";

export const ReservationAvailabilityDestinationSchema = z.object({
  id: z.string(),
  nombre: z.string(),
  capacidad_diaria: z.number().nullable().optional(),
});

export const ReservationAvailabilitySchema = z.object({
  paquete_id: z.string(),
  fecha_minima: z.string(),
  dias: z.number().int().positive(),
  viajeros: z.number().int().positive(),
  capacidad_paquete: z.number().nullable().optional(),
  destinos_limitados: z.array(ReservationAvailabilityDestinationSchema),
  fechas_disponibles: z.array(z.string()),
  fechas_no_disponibles: z.array(z.string()),
});
