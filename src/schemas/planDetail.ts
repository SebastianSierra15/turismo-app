import { z } from "zod";

export const PlanDestinationSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  municipality: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  category: z.string().optional(),
  image: z.string().url().optional(),
  galleryImages: z.array(z.string().url()).optional(),
});

export const PlanItineraryStepSchema = z.object({
  id: z.string().optional(),
  stepNumber: z.number().int().positive(),
  title: z.string(),
  description: z.string(),
  location: z.string().optional(),
});

export const PlanDetailSchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  description: z.string(),
  price: z.string(),
  priceValue: z.number(),
  durationDays: z.number().optional().nullable(),
  difficulty: z.string().optional().nullable(),
  capacityMax: z.number().optional().nullable(),
  agencyUri: z.string().optional(),
  agencyName: z.string().optional(),
  heroImage: z.string().url().optional(),
  galleryImages: z.array(z.string().url()).optional(),
  categories: z.array(z.string()).optional(),
  destinations: z.array(PlanDestinationSchema).optional(),
  activities: z.array(z.string()).optional(),
  includes: z.array(z.string()).optional(),
  excludes: z.array(z.string()).optional(),
  itinerary: z.array(PlanItineraryStepSchema).optional(),
});
