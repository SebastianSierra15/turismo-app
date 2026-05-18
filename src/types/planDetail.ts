import { z } from "zod";
import {
  PlanDetailSchema,
  PlanDestinationSchema,
  PlanItineraryStepSchema,
} from "@/schemas/planDetail";

export type PlanDetail = z.infer<typeof PlanDetailSchema>;
export type PlanDestination = z.infer<typeof PlanDestinationSchema>;
export type PlanItineraryStep = z.infer<typeof PlanItineraryStepSchema>;
