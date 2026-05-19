import { z } from "zod";
import { PaqueteApiSchema } from "@/schemas/paqueteApi";
import { PaqueteDetalleApiSchema } from "@/schemas/paqueteDetalleApi";

export const PackageOwnerSchema = z.object({
  uri: z.string(),
  nombre: z.string(),
});

export const PackageOwnerListSchema = z.array(PackageOwnerSchema);

export const PackageServiceCatalogItemSchema = z.object({
  id: z.string(),
  nombre: z.string(),
  tipo: z.string().optional().nullable(),
});

export const PackageServiceCatalogSchema = z.array(
  PackageServiceCatalogItemSchema,
);

export const OperatorPackageListSchema = z.array(PaqueteApiSchema);

export const OperatorPackageDetailSchema = PaqueteDetalleApiSchema;

export const OperatorPackageItineraryWriteSchema = z.object({
  titulo: z.string().min(1),
  descripcion: z.string().nullable().optional(),
});

export const OperatorPackageWriteSchema = z.object({
  nombre: z.string().min(3),
  descripcion: z.string().min(10),
  precio: z.number().positive(),
  duracion_dias: z.number().int().min(1).max(60).nullable().optional(),
  dificultad: z.string().nullable().optional(),
  capacidad_max_personas: z.number().int().min(1).max(500).nullable().optional(),
  incluye_descripcion: z.string().nullable().optional(),
  no_incluye: z.string().nullable().optional(),
  url_imagen: z.string().nullable().optional(),
  galeria_imagenes: z.string().nullable().optional(),
  estado_publicacion: z.string().nullable().optional(),
  destino_ids: z.array(z.string()),
  servicio_ids: z.array(z.string()).nullable().optional(),
  itinerarios: z.array(OperatorPackageItineraryWriteSchema).nullable().optional(),
  agencia_uri: z.string().nullable().optional(),
});
