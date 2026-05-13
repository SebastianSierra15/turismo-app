import { fetchApiJson } from "@/lib/api";
import { SiteDetailSchema } from "@/schemas/siteDetail";
import { SitioDetalleApiSchema } from "@/schemas/sitioDetalleApi";
import { PaquetesApiSchema } from "@/schemas/paqueteApi";
import { getSiteCatalog } from "@/services/siteCatalog";
import { mapPaquetesToCatalog } from "@/services/planCatalog";
import { type SiteDetail } from "@/types/siteDetail";
import { type PlanCatalogItem } from "@/types/planCatalog";
import { extractSiteSlug, matchesSiteSlug } from "@/utils/siteId";

const DEFAULT_HERO_IMAGE =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuACIPCeuaxb96R-SaywaQUN_XcMFMUXM6NRMH8C0_MIoTvgdbx6cajPu0Pns7DkGzf3l23-ZCWs_dnOJrOSwnulwtShpSnolzUN3rTeqennEgUShJkEzYXRbHZ0a_BxbZ6ph31B12OJm5sYafBAONYMqSlyzV0nqfwxSx4Ov4IA0Vqvwv60YqAlXeRdvd6YT99i-kEsRK34To1I-bYFSESkXLare6F8LE3mX2CsxN4I-lU7iL5dZx2qmnbOyyOX0Ox7HbgrruIdJh6r";

const DEFAULT_VIDEO_COVER =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuC9djbj_yIrFOfLLaLfmLW76_Z4hE5lLE0S0BTy0Lu5VkNnLpAMaLXrjITqMyvSlwMAjSFdaU2vRdvHKN1vdUPEjM5KqS--LVvIPiJGkt0GNQyreeFnU85o9XP3yYVO0RJHDTO7laLVOZBR9XZvHwMl008TbbmA4rPT2mlEs-cb0vWjBni8-tHdRYOffK8j6On6hESmzYiadk7qzCZrFwlB7N8cq2CTLi5cWgrNTcuwva4wfuvoKpuA0XAZQCqrmrqeUPPWb0FecDeK";

const splitValues = (value?: string | null) => {
  if (!value) {
    return [];
  }
  return value
    .split("|")
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

const normalizeImageUrl = (value?: string | null) => {
  if (!value) return null;
  const clean = value.trim();
  return clean.length > 0 ? clean : null;
};

const ensureGalleryImages = (images: string[], heroImage: string) => {
  const merged = [heroImage, ...images]
    .map((item) => item.trim())
    .filter(Boolean);

  const unique = Array.from(new Set(merged));
  return unique.length > 0 ? unique : [heroImage];
};

const formatCapacity = (value?: number | null) => {
  if (!value || value <= 0) {
    return "Sin capacidad";
  }
  return `${value} personas/dia`;
};

const splitDescription = (value?: string | null) => {
  if (!value) {
    return ["Sin descripcion disponible."];
  }
  const parts = value
    .split(/\r?\n+/)
    .map((item) => item.trim())
    .filter(Boolean);
  return parts.length ? parts : [value];
};

const pickType = (value?: string | null) => {
  const first = splitValues(value)[0];
  return first || "Destino";
};

const buildLocation = (municipio?: string | null) => {
  if (municipio && municipio.trim()) {
    return `${municipio}, Caqueta`;
  }
  return "Caqueta";
};

const mapFromApi = (data: unknown): SiteDetail => {
  const parsed = SitioDetalleApiSchema.parse(data);
  const heroImage = normalizeImageUrl(parsed.url_imagen) ?? DEFAULT_HERO_IMAGE;
  const galleryImages = ensureGalleryImages(
    splitImageList(parsed.galeria_imagenes),
    heroImage,
  );
  const detail: SiteDetail = {
    id: parsed.id,
    name: parsed.nombre,
    type: pickType(parsed.tipos),
    location: buildLocation(parsed.municipio ?? undefined),
    heroImage,
    capacityPerDay: formatCapacity(parsed.capacidad_diaria ?? undefined),
    description: splitDescription(parsed.descripcion ?? undefined),
    galleryImages,
    videoCover: DEFAULT_VIDEO_COVER,
    mapLat: parsed.latitud ?? 0,
    mapLng: parsed.longitud ?? 0,
  };

  return SiteDetailSchema.parse(detail);
};

const mapFromCatalog = (slug: string, catalog: Awaited<ReturnType<typeof getSiteCatalog>>) => {
  const site = catalog.find((item) => matchesSiteSlug(item.id, slug));
  if (!site) {
    return null;
  }
  const heroImage = normalizeImageUrl(site.image) ?? DEFAULT_HERO_IMAGE;
  const detail: SiteDetail = {
    id: site.id,
    name: site.name,
    type: site.type,
    location: site.location,
    heroImage,
    capacityPerDay: site.capacityPerDay,
    description: [site.description],
    galleryImages: ensureGalleryImages([site.image], heroImage),
    videoCover: DEFAULT_VIDEO_COVER,
    mapLat: 0,
    mapLng: 0,
  };
  return SiteDetailSchema.parse(detail);
};

export const getSiteDetail = async (slugOrId: string) => {
  const slug = extractSiteSlug(slugOrId);

  try {
    const data = await fetchApiJson<unknown>(`/sitios/${slug}`);
    return mapFromApi(data);
  } catch (error) {
    try {
      const catalog = await getSiteCatalog();
      const fallback = mapFromCatalog(slug, catalog);
      if (!fallback) {
        return null;
      }
      return fallback;
    } catch (fallbackError) {
      console.error("Error cargando detalle del sitio:", error);
      console.error("Error al usar fallback:", fallbackError);
      return null;
    }
  }
};

export const getSiteRelatedPlans = async (slugOrId: string): Promise<PlanCatalogItem[]> => {
  const slug = extractSiteSlug(slugOrId);
  try {
    const data = await fetchApiJson<unknown>(
      `/sitios/${slug}/planes`,
      {
        limit: 3,
        offset: 0,
      },
    );
    const paquetes = PaquetesApiSchema.parse(data);
    return mapPaquetesToCatalog(paquetes);
  } catch (error) {
    console.error("Error cargando planes relacionados:", error);
    return [];
  }
};
