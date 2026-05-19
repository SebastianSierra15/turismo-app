import { z } from "zod";
import {
  OperatorServiceListSchema,
  OperatorServiceSchema,
  OperatorServiceTypeListSchema,
  OperatorServiceTypeSchema,
  OperatorServiceWriteSchema,
  ServiceOwnerListSchema,
  ServiceOwnerSchema,
} from "@/schemas/operatorServices";

export type OperatorService = z.infer<typeof OperatorServiceSchema>;
export type OperatorServiceList = z.infer<typeof OperatorServiceListSchema>;
export type OperatorServiceType = z.infer<typeof OperatorServiceTypeSchema>;
export type OperatorServiceTypeList = z.infer<typeof OperatorServiceTypeListSchema>;
export type ServiceOwner = z.infer<typeof ServiceOwnerSchema>;
export type ServiceOwnerList = z.infer<typeof ServiceOwnerListSchema>;
export type OperatorServiceWrite = z.infer<typeof OperatorServiceWriteSchema>;
