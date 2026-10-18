import PlanCard from "@/components/shared/molecules/PlanCard";
import Icon from "@/components/shared/atoms/Icon";
import Link from "next/link";
import { getFeaturedPlans } from "@/services/planes";

const FeaturedPlans = async () => {
  const plans = await getFeaturedPlans();

  return (
    <section
      aria-labelledby="featured-plans-title"
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20"
    >
      <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
        <div className="max-w-2xl">
          <span className="text-primary font-bold tracking-widest uppercase text-sm mb-2 block">
            Experiencias Únicas
          </span>
          <h2
            id="featured-plans-title"
            className="text-3xl md:text-4xl font-extrabold text-slate-900"
          >
            Planes Destacados
          </h2>
          <p className="mt-4 text-slate-600">
            Seleccionamos las mejores rutas para que vivas la selva con
            seguridad y respeto por la naturaleza.
          </p>
        </div>
        <Link
          className="group flex items-center gap-2 text-primary font-bold"
          href="/planes"
          title="Ver todos los planes"
        >
          Ver todos los planes
          <Icon
            name="arrow_forward"
            className="transition-transform duration-300 group-hover:translate-x-1"
          />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <PlanCard key={plan.id} {...plan} />
        ))}
      </div>
    </section>
  );
};

export default FeaturedPlans;
