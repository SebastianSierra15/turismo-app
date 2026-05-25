import Image from "next/image";
import SearchBar from "@/components/shared/molecules/SearchBar";
import { getPlanCatalog } from "@/services/planCatalog";

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
    <section className="relative h-[95vh] sm:h-[85vh] w-full overflow-hidden">
      <div className="absolute inset-0">
        <Image
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuB6aB1OqFsG8iGytQuO0egF3B0bKBfpBOOPUgucjEZsQF_C29aXAs250nRCqTowYlR5YST7RoQ0sPNEiWUySv_-vOGT0bAwo-NJSckOjK8luPe6JV91KXnxy0g9tHbrY5bpSSdymFd6udL5qYgiCelDClo4xtYLod-BZwqGDsJhj7w8Zuvdhak-yA9F7Y0pvkzD2Bd4voVVI8J1yrI7y-jtkXRBvqBD50I1StK3NahD_YV2fo1ng7iW5FIWu2n7Cd-Ro7-oh6UNpJo"
          alt="Paisaje amazónico con río y cascada"
          title="Paisaje amazónico con río y cascada"
          fill
          sizes="100vw"
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/70" />
      </div>

      <div className="relative h-full max-w-7xl mx-auto px-4 flex flex-col items-center justify-center text-center">
        <div className="pt-10 md:pt-0 max-w-3xl mb-12">
          <h1 className="text-white text-5xl md:text-7xl font-extrabold leading-tight tracking-tight mb-6">
            Descubre el Corazón del&nbsp;
            <span className="text-primary">Caquetá</span>
          </h1>
          <p className="text-white/90 text-lg md:text-xl font-medium max-w-2xl mx-auto leading-relaxed">
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
