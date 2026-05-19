import type { Metadata } from "next";
import PlanDetailPageClient from "@/app/planes/[id]/PlanDetailPageClient";
import { getPlanDetail } from "@/services/planDetail";

const DEFAULT_IMAGE =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCnYgzb2OOjNV0klNlydE3WlXGb3G7x5_uIBQfCx3Q_1VvAQEVyUU2Qaf74rHnylTIcUbMHGqVglazKTWXrfStk_x5gINqYhHI9vFITVhRSnPftOIrsXQ94JQPjp1O_D1cLddjjij6MKPfzI7YIM7HWYiBiLfhSPqlRiSJhU3iKXPcEqMdc9UbLCyGFirZbK7GZDbIc3QBfmz8OgmWbSv7PLIXv_SNQGPAvT_zJZLJGH3d8reBOuGLbXoJAQBBxBm8c0Cm9PDUhTYA";

type PlanDetailPageProps = {
  params: Promise<{ id: string }>;
};

export const generateMetadata = async ({
  params,
}: PlanDetailPageProps): Promise<Metadata> => {
  const { id } = await params;
  const plan = await getPlanDetail(id);

  if (!plan) {
    return {
      title: "Amaturis | Plan no encontrado",
      description: "El plan turistico solicitado no esta disponible.",
    };
  }

  const description =
    plan.description.length > 160
      ? `${plan.description.slice(0, 157)}...`
      : plan.description;

  return {
    title: `Amaturis | ${plan.title}`,
    description,
    openGraph: {
      title: `Amaturis | ${plan.title}`,
      description,
      images: [
        {
          url: DEFAULT_IMAGE,
          alt: plan.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `Amaturis | ${plan.title}`,
      description,
      images: [DEFAULT_IMAGE],
    },
  };
};

export default async function PlanDetailPage({ params }: PlanDetailPageProps) {
  const { id } = await params;
  return <PlanDetailPageClient id={id} />;
}
