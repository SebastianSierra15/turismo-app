import { z } from "zod";

export const PaqueteApiSchema = z.object({
  id: z.string(),
  nombre: z.string(),
  precio: z.number(),
  descripcion: z.string(),
  duracion_dias: z.number().optional().nullable(),
  dificultad: z.string().optional().nullable(),
  destinos: z.string().optional().nullable(),
  municipios: z.string().optional().nullable(),
  categorias: z.string().optional().nullable(),
  capacidad_max_personas: z.number().optional().nullable(),
  popularidad: z.number().optional().nullable(),
  url_imagen: z.string().url().optional().nullable(),
  galeria_imagenes: z.string().optional().nullable(),
  agencia_uri: z.string().optional().nullable(),
  agencia_nombre: z.string().optional().nullable(),
  estado_publicacion: z.string().optional().nullable(),
});

export const PaquetesApiSchema = z.array(PaqueteApiSchema);
