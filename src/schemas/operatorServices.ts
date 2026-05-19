import { z } from "zod";

export const OperatorServiceSchema = z.object({
  id: z.string(),
  nombre: z.string(),
  descripcion: z.string(),
  tipo_uri: z.string().nullable().optional(),
  tipo_nombre: z.string().nullable().optional(),
  estado_publicacion: z.string().nullable().optional(),
  url_imagen: z.string().url().nullable().optional(),
  agencia_uri: z.string().nullable().optional(),
  agencia_nombre: z.string().nullable().optional(),
  paquetes_vinculados: z.number().int().nonnegative().optional(),
});

export const OperatorServiceListSchema = z.array(OperatorServiceSchema);

export const OperatorServiceTypeSchema = z.object({
  uri: z.string(),
  nombre: z.string(),
});

export const OperatorServiceTypeListSchema = z.array(OperatorServiceTypeSchema);

export const ServiceOwnerSchema = z.object({
  uri: z.string(),
  nombre: z.string(),
});

export const ServiceOwnerListSchema = z.array(ServiceOwnerSchema);

export const OperatorServiceWriteSchema = z.object({
  nombre: z.string().min(3),
  descripcion: z.string().min(10),
  tipo_uri: z.string().nullable().optional(),
  estado_publicacion: z.string().nullable().optional(),
  url_imagen: z.string().nullable().optional(),
  agencia_uri: z.string().nullable().optional(),
});
