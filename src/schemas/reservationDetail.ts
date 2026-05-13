import { z } from "zod";

export const ReservationDetailStatusSchema = z.enum([
  "confirmada",
  "pendiente",
  "completada",
  "cancelada",
]);

export const ReservationDetailItinerarySchema = z.object({
  title: z.string(),
  time: z.string(),
  duration: z.string(),
  attraction: z.string(),
  icon: z.string(),
});

export const ReservationDetailPlanSchema = z.object({
  title: z.string(),
  description: z.string(),
  image: z.string().url(),
  imageAlt: z.string(),
  pricePerPerson: z.string(),
  duration: z.string(),
  dates: z.string(),
});

export const ReservationDetailAttractionSchema = z.object({
  name: z.string(),
  location: z.string(),
  image: z.string().url(),
  imageAlt: z.string(),
  mapUrl: z.string().url(),
});

export const ReservationDetailPaymentSchema = z.object({
  people: z.string(),
  method: z.string(),
  total: z.string(),
});

export const ReservationDetailTravelerSchema = z.object({
  name: z.string(),
  email: z.string(),
  initials: z.string(),
});

export const ReservationDetailProviderSchema = z.object({
  name: z.string(),
  phone: z.string(),
  email: z.string(),
});

export const ReservationDetailSchema = z.object({
  id: z.string(),
  status: ReservationDetailStatusSchema,
  statusLabel: z.string(),
  createdAt: z.string(),
  plan: ReservationDetailPlanSchema,
  itinerary: z.array(ReservationDetailItinerarySchema),
  attraction: ReservationDetailAttractionSchema,
  payment: ReservationDetailPaymentSchema,
  traveler: ReservationDetailTravelerSchema,
  provider: ReservationDetailProviderSchema,
  trustNote: z.string(),
});
