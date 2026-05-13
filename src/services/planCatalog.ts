import { PlanCatalogSchema } from "@/schemas/planCatalog";
import { PaquetesApiSchema } from "@/schemas/paqueteApi";
import { type PlanCatalogItem } from "@/types/planCatalog";
import { fetchApiJson } from "@/lib/api";

const DEFAULT_PLAN_IMAGE =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAREAoYNXk7XtCVxCzUhyjO6lMcI_QrHEtxD2kFQoNnCE_GjTO5m0ax8SUzR8sIob_3EigB8Ln0hYrvMKP5xMwLVy1VsJV1JNT68j_oUj6ZRbPQltc8q_c8a-79R4YGGBhI1geChmVhfZ4PRe38x7CU3-pc6RVQyHVRRiuRBKSKgj3CJjsQaS9ADZS25yLQdwxoG2psE6ntWRW4ka_YSFNj8uDQYu0mYhidx7tD8WT9zWqUYDvqQl-HOsEgfWHenoV-QJwM0hE1bQg";

const formatPrice = (value: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value);

const formatDuration = (days?: number | null) => {
  if (!days || days <= 0) {
    return "Sin duración";
  }
  return days === 1 ? "1 Día" : `${days} Días`;
};

const normalizeDifficulty = (
  value?: string | null
): PlanCatalogItem["difficulty"] => {
  if (!value) {
    return "Moderado";
  }
  const lowered = value.toLowerCase();
  if (lowered.includes("facil")) {
    return "Fácil";
  }
  if (lowered.includes("moder")) {
    return "Moderado";
  }
  if (lowered.includes("desaf")) {
    return "Desafiante";
  }
  return "Moderado";
};

const pickBadge = (categorias?: string | null) => {
  if (!categorias) {
    return undefined;
  }
  const first = categorias.split("|")[0]?.trim();
  return first || undefined;
};

const splitValues = (value?: string | null) => {
  if (!value) {
    return [];
  }
  return value
    .split("|")
    .map((item) => item.trim())
    .filter(Boolean);
};

const pickLocation = (municipios?: string | null, destinos?: string | null) => {
  if (municipios && municipios.trim()) {
    return municipios;
  }
  if (destinos && destinos.trim()) {
    return destinos;
  }
  return "Caquetá";
};

interface PlanCatalogOptions {
  busqueda?: string;
  maxPrecio?: number;
  orden?: "nombre" | "popularidad" | "precio";
  limit?: number;
  offset?: number;
}

export const mapPaquetesToCatalog = (
  paquetes: ReturnType<typeof PaquetesApiSchema.parse>,
): PlanCatalogItem[] => {
  const mapped: PlanCatalogItem[] = paquetes.map((item) => ({
    id: item.id,
    title: item.nombre,
    description: item.descripcion,
    image: item.url_imagen ?? DEFAULT_PLAN_IMAGE,
    price: formatPrice(item.precio),
    location: pickLocation(item.municipios, item.destinos),
    duration: formatDuration(item.duracion_dias ?? undefined),
    difficulty: normalizeDifficulty(item.dificultad),
    badge: pickBadge(item.categorias),
    isFavorite: false,
    durationDays: item.duracion_dias ?? undefined,
    priceValue: item.precio,
    categories: splitValues(item.categorias),
    destinations: splitValues(item.destinos),
    municipalities: splitValues(item.municipios),
    capacityMax: item.capacidad_max_personas ?? undefined,
    popularity: item.popularidad ?? undefined,
  }));

  return PlanCatalogSchema.parse(mapped);
};

export const getPlanCatalog = async (
  options: PlanCatalogOptions = {},
): Promise<PlanCatalogItem[]> => {
  const {
    busqueda = "",
    maxPrecio = 2_000_000,
    orden = "popularidad",
    limit = 300,
    offset = 0,
  } = options;

  try {
    const data = await fetchApiJson<unknown>(
      "/paquetes",
      {
        busqueda,
        max_precio: maxPrecio,
        orden,
        limit,
        offset,
      },
    );

    const paquetes = PaquetesApiSchema.parse(data);
    return mapPaquetesToCatalog(paquetes);
  } catch (error) {
    console.error("Error cargando planes desde la API:", error);
    return PlanCatalogSchema.parse([]);
  }
};
