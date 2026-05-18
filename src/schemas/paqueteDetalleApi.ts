import { z } from "zod";

export const PaqueteDetalleDestinoApiSchema = z.object({
  id: z.string().optional().nullable(),
  nombre: z.string(),
  municipio: z.string().optional().nullable(),
  latitud: z.number().optional().nullable(),
  longitud: z.number().optional().nullable(),
  categoria: z.string().optional().nullable(),
  url_imagen: z.string().url().optional().nullable(),
  galeria_imagenes: z.string().optional().nullable(),
});

export const PaqueteDetalleServicioApiSchema = z.object({
  nombre: z.string(),
  tipo: z.string().optional().nullable(),
});

export const PaqueteDetalleItinerarioApiSchema = z.object({
  id: z.string().optional().nullable(),
  titulo: z.string().optional().nullable(),
  descripcion: z.string().optional().nullable(),
});

export const PaqueteDetalleApiSchema = z.object({
  id: z.string(),
  nombre: z.string(),
  descripcion: z.string(),
  precio: z.number(),
  duracion_dias: z.number().optional().nullable(),
  dificultad: z.string().optional().nullable(),
  capacidad_max_personas: z.number().optional().nullable(),
  incluye_descripcion: z.string().optional().nullable(),
  no_incluye: z.string().optional().nullable(),
  agencia_uri: z.string().optional().nullable(),
  agencia_nombre: z.string().optional().nullable(),
  url_imagen: z.string().url().optional().nullable(),
  galeria_imagenes: z.string().optional().nullable(),
  destinos: z.array(PaqueteDetalleDestinoApiSchema).optional().nullable(),
  servicios: z.array(PaqueteDetalleServicioApiSchema).optional().nullable(),
  itinerarios: z.array(PaqueteDetalleItinerarioApiSchema).optional().nullable(),
});
