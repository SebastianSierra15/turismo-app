import { z } from "zod";

export const ProfileStatsSchema = z.object({
  totalTrips: z.number(),
  explorerLevel: z.string(),
  memberSince: z.string(),
});

export const ProfileBookingSchema = z.object({
  id: z.string(),
  title: z.string(),
  status: z.enum(["Confirmado", "Pendiente de pago"]),
  dateRange: z.string(),
  people: z.string(),
  image: z.string().url(),
  href: z.string().optional(),
});

export const ProfileHistoryItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  date: z.string(),
  status: z.string(),
  actionLabel: z.string(),
  href: z.string().optional(),
});

export const ProfileMapSchema = z.object({
  title: z.string(),
  subtitle: z.string(),
  lat: z.number(),
  lng: z.number(),
});

export const ProfileSchema = z.object({
  name: z.string(),
  location: z.string(),
  avatar: z.string().url(),
  bio: z.string().optional(),
  stats: ProfileStatsSchema,
  bookings: z.array(ProfileBookingSchema),
  history: z.array(ProfileHistoryItemSchema),
  map: ProfileMapSchema,
});
