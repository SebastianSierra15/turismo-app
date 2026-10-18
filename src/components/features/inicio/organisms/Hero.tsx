import SearchBar from "@/components/shared/molecules/SearchBar";
import { getPlanCatalog } from "@/services/planCatalog";
import HeroBackgroundCarousel from "@/components/features/inicio/organisms/HeroBackgroundCarousel";

const Hero = async () => {
  const plans = await getPlanCatalog({
    orden: "popularidad",
    limit: 300,
    offset: 0,
  });

  const destinationCounts = new Map<string, number>();
  plans.forEach((plan) => {
    const candidates = new Set([
      ...(plan.destinations?.length ? plan.destinations : [plan.location]),
      ...(plan.municipalities ?? []),
    ]);
    candidates.forEach((item) => {
      const value = item.trim();
      if (!value) return;
      destinationCounts.set(value, (destinationCounts.get(value) ?? 0) + 1);
    });
  });

  const sortedDestinations = Array.from(destinationCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([name]) => name);

  return (
    <section className="relative min-h-[calc(100svh-4rem)] w-full overflow-hidden sm:h-[85vh] sm:min-h-0">
      <HeroBackgroundCarousel />

      <div className="relative min-h-[calc(100svh-4rem)] sm:h-full max-w-7xl mx-auto px-4 py-4 sm:py-0 flex flex-col items-center justify-start sm:justify-center text-center">
        <div className="pt-0 sm:pt-10 md:pt-0 max-w-3xl mb-4 sm:mb-12">
          <h1 className="text-white text-4xl sm:text-5xl md:text-7xl font-extrabold leading-[1.08] tracking-tight mb-2 sm:mb-6">
            Descubre el Corazón del&nbsp;
            <span className="text-primary">Caquetá</span>
          </h1>
          <p className="text-white/90 text-base sm:text-lg md:text-xl font-medium max-w-2xl mx-auto leading-relaxed">
            Aventuras inolvidables en las selvas y ríos indómitos del Caquetá,
            Colombia. Tu portal hacia lo inexplorado.
          </p>
        </div>

        <SearchBar
          destinations={sortedDestinations}
          topDestinations={sortedDestinations.slice(0, 8)}
        />
      </div>
    </section>
  );
};

export default Hero;
