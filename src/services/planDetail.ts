import { fetchApiJson } from "@/lib/api";
import { getPlanCatalog } from "@/services/planCatalog";
import { PaqueteDetalleApiSchema } from "@/schemas/paqueteDetalleApi";
import { PlanDetailSchema } from "@/schemas/planDetail";
import { type PlanDetail } from "@/types/planDetail";
import { type PlanCatalogItem } from "@/types/planCatalog";
import { extractPlanSlug, matchesPlanSlug } from "@/utils/planId";

const formatPrice = (value: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value);

const parseNumericPrice = (value: string) => {
  const parsed = Number(value.replace(/[^0-9]/g, ""));
  return Number.isNaN(parsed) ? 0 : parsed;
};

const splitTextList = (value?: string | null) => {
  if (!value) return [];
  return value
    .split(/\s*\|\s*|\s*;\s*|\r?\n+/)
    .map((item) => item.trim())
    .filter(Boolean);
};

const splitImageList = (value?: string | null) => {
  if (!value) return [];
  return value
    .split(/\s*,\s*|\s*\|\s*|\r?\n+/)
    .map((item) => item.trim())
    .filter(Boolean);
};

const mapFromApi = (data: unknown, slug: string): PlanDetail => {
  const parsed = PaqueteDetalleApiSchema.parse(data);
  const categories = (parsed.destinos ?? [])
    .map((dest) => dest.categoria)
    .filter((item): item is string => Boolean(item));
  const uniqueCategories = Array.from(new Set(categories));

  const destinations = (parsed.destinos ?? []).map((dest) => ({
    id: dest.id ?? undefined,
    name: dest.nombre,
    municipality: dest.municipio ?? undefined,
    latitude: dest.latitud ?? undefined,
    longitude: dest.longitud ?? undefined,
    category: dest.categoria ?? undefined,
    image: dest.url_imagen ?? undefined,
    galleryImages: splitImageList(dest.galeria_imagenes),
  }));

  const activities = (parsed.servicios ?? [])
    .map((service) => service.nombre)
    .filter(Boolean);

  const itinerary = (parsed.itinerarios ?? [])
    .map((item) => item.descripcion ?? item.titulo ?? "")
    .filter(Boolean);

  const detail: PlanDetail = {
    id: parsed.id,
    slug,
    title: parsed.nombre,
    description: parsed.descripcion,
    price: formatPrice(parsed.precio),
    priceValue: parsed.precio,
    durationDays: parsed.duracion_dias ?? undefined,
    difficulty: parsed.dificultad ?? undefined,
    capacityMax: parsed.capacidad_max_personas ?? undefined,
    heroImage: parsed.url_imagen ?? undefined,
    galleryImages: splitImageList(parsed.galeria_imagenes),
    categories: uniqueCategories.length ? uniqueCategories : undefined,
    destinations: destinations.length ? destinations : undefined,
    activities: activities.length ? activities : undefined,
    includes: splitTextList(parsed.incluye_descripcion) || undefined,
    excludes: splitTextList(parsed.no_incluye) || undefined,
    itinerary: itinerary.length ? itinerary : undefined,
  };

  return PlanDetailSchema.parse(detail);
};

const buildDestinationsFromCatalog = (plan: PlanCatalogItem) => {
  const destinations =
    plan.destinations && plan.destinations.length
      ? plan.destinations
      : plan.location
        ? [plan.location]
        : [];
  const municipalities = plan.municipalities ?? [];

  return destinations.map((name, index) => ({
    name,
    municipality: municipalities[index] ?? municipalities[0],
  }));
};

const mapFromCatalog = (plan: PlanCatalogItem, slug: string): PlanDetail => {
  const priceValue = plan.priceValue ?? parseNumericPrice(plan.price);
  const destinations = buildDestinationsFromCatalog(plan);

  const detail: PlanDetail = {
    id: plan.id,
    slug,
    title: plan.title,
    description: plan.description,
    price: formatPrice(priceValue),
    priceValue,
    durationDays: plan.durationDays ?? undefined,
    difficulty: plan.difficulty ?? undefined,
    capacityMax: plan.capacityMax ?? undefined,
    heroImage: plan.image,
    galleryImages: [plan.image],
    categories: plan.categories?.length ? plan.categories : undefined,
    destinations: destinations.length ? destinations : undefined,
    activities: undefined,
    includes: undefined,
    excludes: undefined,
    itinerary: undefined,
  };

  return PlanDetailSchema.parse(detail);
};

export const getPlanDetail = async (slugOrId: string) => {
  const slug = extractPlanSlug(slugOrId);

  try {
    const data = await fetchApiJson<unknown>(`/paquetes/${slug}`);
    return mapFromApi(data, slug);
  } catch (error) {
    try {
      const catalog = await getPlanCatalog();
      const plan = catalog.find((item) => matchesPlanSlug(item.id, slug));
      if (!plan) {
        return null;
      }
      return mapFromCatalog(plan, slug);
    } catch (fallbackError) {
      console.error("Error cargando detalle del plan:", error);
      console.error("Error al usar fallback:", fallbackError);
      return null;
    }
  }
};
