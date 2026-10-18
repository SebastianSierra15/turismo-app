import type { Metadata } from "next";
import PlanDetailPageClient from "@/app/planes/[id]/PlanDetailPageClient";
import { getPlanDetail } from "@/services/planDetail";
import { createPageMetadata, DEFAULT_SOCIAL_IMAGE } from "@/lib/seo";

type PlanDetailPageProps = {
  params: Promise<{ id: string }>;
};

export const generateMetadata = async ({
  params,
}: PlanDetailPageProps): Promise<Metadata> => {
  const { id } = await params;
  const plan = await getPlanDetail(id);

  if (!plan) {
    return createPageMetadata({
      title: "Amaturis | Plan no encontrado",
      description: "El plan turistico solicitado no esta disponible.",
      path: `/planes/${id}`,
      noIndex: true,
    });
  }

  const description =
    plan.description.length > 160
      ? `${plan.description.slice(0, 157)}...`
      : plan.description;

  return createPageMetadata({
    title: `Amaturis | ${plan.title}`,
    description,
    path: `/planes/${plan.slug}`,
    image: plan.heroImage ?? DEFAULT_SOCIAL_IMAGE,
    imageAlt: plan.title,
  });
};

export default async function PlanDetailPage({ params }: PlanDetailPageProps) {
  const { id } = await params;
  return <PlanDetailPageClient id={id} />;
}
