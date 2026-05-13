import { SiteCatalogSchema } from "@/schemas/siteCatalog";
import { SitiosApiSchema } from "@/schemas/sitioApi";
import { SitioFiltrosApiSchema } from "@/schemas/sitioFiltrosApi";
import { type SiteCatalogItem } from "@/types/siteCatalog";
import { type SiteFilterOptions } from "@/types/siteFilters";
import { fetchApiJson } from "@/lib/api";

const DEFAULT_SITE_IMAGE =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuC60HHqwkAqT8z-9WISh1b9hH_JzHZ3PM0tdgKb3we9ybV--hQpkzhZu_1Axy7QaFw0LJo32u1-XiLBlcWIE2anlVnaxSQ15MWjG7NQlAFKuNGa2DioIYSh79OitxMxz1VvErYQEdZ9FHZcSX8rZ4x6JV86ObCM7sD87gaTSGE3yHfiNpz_cj72iSQM32u7tpJyEmXxyPnKaloxR2fFcWPu3c9g7mTMWSq-Guer5saCW9DwSbeshh252y4Hvw0acDkvAOV4GjNJmO2y";

const splitValues = (value?: string | null) => {
  if (!value) {
    return [];
  }
  return value
    .split("|")
    .map((item) => item.trim())
    .filter(Boolean);
};

const formatCapacity = (value?: number | null) => {
  if (!value || value <= 0) {
    return "Sin capacidad";
  }
  return `${value} pax/día`;
};

const pickLocation = (municipio?: string | null) => {
  if (municipio && municipio.trim()) {
    return `${municipio}, Caquetá`;
  }
  return "Caquetá";
};

const pickType = (tipos?: string | null) => {
  const first = splitValues(tipos)[0];
  return first || "Destino";
};

export const getSiteCatalog = async (): Promise<SiteCatalogItem[]> => {
  try {
    const data = await fetchApiJson<unknown>(
      "/sitios",
      {
        busqueda: "",
        tipo: "",
        municipio: "",
        orden: "popularidad",
        limit: 300,
        offset: 0,
      },
    );

    const sitios = SitiosApiSchema.parse(data);

    const mapped: SiteCatalogItem[] = sitios.map((item) => ({
      id: item.id,
      name: item.nombre,
      type: pickType(item.tipos),
      location: pickLocation(item.municipio ?? undefined),
      description: item.descripcion ?? "Sin descripción disponible.",
      capacityPerDay: formatCapacity(item.capacidad_diaria ?? undefined),
      image: item.url_imagen ?? DEFAULT_SITE_IMAGE,
      capacityValue: item.capacidad_diaria ?? undefined,
      popularity: item.popularidad ?? undefined,
      types: splitValues(item.tipos),
      municipality: item.municipio ?? undefined,
    }));

    return SiteCatalogSchema.parse(mapped);
  } catch (error) {
    console.error("Error cargando sitios desde la API:", error);
    return SiteCatalogSchema.parse([]);
  }
};

export const getSiteFilters = async (): Promise<SiteFilterOptions> => {
  try {
    const data = await fetchApiJson<unknown>("/sitios/filtros");
    const filtros = SitioFiltrosApiSchema.parse(data);
    return {
      types: filtros.tipos.map((tipo) => tipo.nombre),
      municipalities: filtros.municipios.map((municipio) => municipio.nombre),
      capacityMin: filtros.capacidad_min ?? undefined,
      capacityMax: filtros.capacidad_max ?? undefined,
    };
  } catch (error) {
    console.error("Error cargando filtros de sitios:", error);
    return {
      types: [],
      municipalities: [],
    };
  }
};
