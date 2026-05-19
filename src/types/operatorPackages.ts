import { z } from "zod";
import {
  OperatorPackageDetailSchema,
  OperatorPackageListSchema,
  OperatorPackageWriteSchema,
  PackageServiceCatalogItemSchema,
  PackageServiceCatalogSchema,
  PackageOwnerListSchema,
  PackageOwnerSchema,
} from "@/schemas/operatorPackages";

export type OperatorPackage = z.infer<typeof OperatorPackageListSchema>[number];
export type OperatorPackageDetail = z.infer<typeof OperatorPackageDetailSchema>;
export type OperatorPackageWrite = z.infer<typeof OperatorPackageWriteSchema>;
export type PackageOwner = z.infer<typeof PackageOwnerSchema>;
export type PackageOwnerList = z.infer<typeof PackageOwnerListSchema>;
export type PackageServiceCatalogItem = z.infer<typeof PackageServiceCatalogItemSchema>;
export type PackageServiceCatalog = z.infer<typeof PackageServiceCatalogSchema>;
