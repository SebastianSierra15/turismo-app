import type { Metadata } from "next";
import { notFound } from "next/navigation";
import SiteDetailTemplate from "@/components/features/sitios/templates/SiteDetailTemplate";
import { getSiteDetail, getSiteRelatedPlans } from "@/services/siteDetail";
import { createPageMetadata, DEFAULT_SOCIAL_IMAGE } from "@/lib/seo";

type SiteDetailPageProps = {
  params: Promise<{ id: string }>;
};

export const generateMetadata = async (
  { params }: SiteDetailPageProps,
): Promise<Metadata> => {
  const { id } = await params;
  const site = await getSiteDetail(id);

  if (!site) {
    return createPageMetadata({
      title: "Amaturis | Sitio no encontrado",
      description: "El sitio turistico solicitado no esta disponible.",
      path: `/sitios/${id}`,
      noIndex: true,
    });
  }

  const description = site.description[0]
    ? site.description[0].length > 160
      ? `${site.description[0].slice(0, 157)}...`
      : site.description[0]
    : "Explora destinos autenticos en Caqueta.";

  return createPageMetadata({
    title: `Amaturis | ${site.name}`,
    description,
    path: `/sitios/${id}`,
    image: site.heroImage ?? DEFAULT_SOCIAL_IMAGE,
    imageAlt: site.name,
  });
};

export default async function SiteDetailPage({ params }: SiteDetailPageProps) {
  const { id } = await params;
  const site = await getSiteDetail(id);
  if (!site) {
    notFound();
  }

  const relatedPlans = await getSiteRelatedPlans(id);

  return <SiteDetailTemplate site={site} relatedPlans={relatedPlans} />;
}
