import React from "react";
import Image from "next/image";
import { type PlanDetail } from "@/types/planDetail";

const heroImage =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCnYgzb2OOjNV0klNlydE3WlXGb3G7x5_uIBQfCx3Q_1VvAQEVyUU2Qaf74rHnylTIcUbMHGqVglazKTWXrfStk_x5gINqYhHI9vFITVhRSnPftOIrsXQ94JQPjp1O_D1cLddjjij6MKPfzI7YIM7HWYiBiLfhSPqlRiSJhU3iKXPcEqMdc9UbLCyGFirZbK7GZDbIc3QBfmz8OgmWbSv7PLIXv_SNQGPAvT_zJZLJGH3d8reBOuGLbXoJAQBBxBm8c0Cm9PDUhTYA";

const formatDurationBadge = (days?: number | null) => {
  if (!days || days <= 0) return "Duración por definir";
  return days === 1 ? "1 Día" : `${days} Días`;
};

interface PlanDetailHeroProps {
  plan: PlanDetail;
}

const PlanDetailHero: React.FC<PlanDetailHeroProps> = ({ plan }) => {
  const categoryLabel = plan.categories?.[0] ?? "Aventura";
  const durationLabel = formatDurationBadge(plan.durationDays ?? undefined);
  const image = plan.heroImage ?? heroImage;

  return (
    <section className="relative h-[60vh] min-h-105 w-full overflow-hidden">
      <Image
        src={image}
        alt={plan.title}
        title={plan.title}
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/45 to-black/15" />
      <div className="absolute bottom-0 left-0 w-full px-4 sm:px-6 pb-10 lg:px-12 pt-16 text-white">
        <div className="max-w-3xl">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="px-3 py-1 bg-primary rounded-full text-xs font-bold uppercase tracking-wider">
              {categoryLabel}
            </span>
            <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-wider">
              {durationLabel}
            </span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tight">
            {plan.title}
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-slate-100 max-w-2xl font-light">
            {plan.description}
          </p>
        </div>
      </div>
    </section>
  );
};

export default PlanDetailHero;
