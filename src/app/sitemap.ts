import type { MetadataRoute } from "next";
import { getPlanCatalog } from "@/services/planCatalog";
import { getSiteCatalog } from "@/services/siteCatalog";
import { SITE_URL } from "@/lib/seo";
import { extractPlanSlug } from "@/utils/planId";
import { extractSiteSlug } from "@/utils/siteId";

const publicRoutes: MetadataRoute.Sitemap = [
  { url: SITE_URL, changeFrequency: "weekly", priority: 1 },
  { url: `${SITE_URL}/planes`, changeFrequency: "daily", priority: 0.9 },
  { url: `${SITE_URL}/sitios`, changeFrequency: "daily", priority: 0.9 },
  { url: `${SITE_URL}/acerca_de`, changeFrequency: "monthly", priority: 0.6 },
  {
    url: `${SITE_URL}/centro-de-ayuda`,
    changeFrequency: "monthly",
    priority: 0.5,
  },
  {
    url: `${SITE_URL}/politica-de-privacidad`,
    changeFrequency: "yearly",
    priority: 0.3,
  },
  {
    url: `${SITE_URL}/terminos-del-servicio`,
    changeFrequency: "yearly",
    priority: 0.3,
  },
];

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [plans, sites] = await Promise.all([getPlanCatalog(), getSiteCatalog()]);

  return [
    ...publicRoutes,
    ...plans.map((plan) => ({
      url: `${SITE_URL}/planes/${extractPlanSlug(plan.id)}`,
      changeFrequency: "weekly" as const,
      priority: 0.8,
      images: [plan.image],
    })),
    ...sites.map((site) => ({
      url: `${SITE_URL}/sitios/${extractSiteSlug(site.id)}`,
      changeFrequency: "weekly" as const,
      priority: 0.8,
      images: [site.image],
    })),
  ];
}
