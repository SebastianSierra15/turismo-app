"use client";

import React from "react";
import SearchBar from "@/components/shared/molecules/SearchBar";
import PlansFilters from "@/components/features/planes/organisms/PlansFilters";
import PlansGridClient from "@/components/features/planes/organisms/PlansGridClient";
import PlansPagination from "@/components/features/planes/organisms/PlansPagination";
import { type PlanCatalogItem } from "@/types/planCatalog";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  addFavoritePlan,
  getFavoritePlans,
  removeFavoritePlan,
} from "@/services/profile";
import { extractPlanSlug } from "@/utils/planId";

const PAGE_SIZE = 12;
const PRICE_STEP = 10000;

const parseNumericPrice = (price: string) => {
  const numeric = Number(price.replace(/[^\d]/g, ""));
  return Number.isNaN(numeric) ? 0 : numeric;
};

const parseDurationDays = (duration: string) => {
  const match = duration.match(/\d+/);
  return match ? Number(match[0]) : 0;
};

const normalizeToken = (value: string) => value.trim().toLowerCase();

const roundDown = (value: number, step: number) =>
  Math.floor(value / step) * step;

const roundUp = (value: number, step: number) =>
  Math.ceil(value / step) * step;

const durationOptions = [
  { key: "1-2", label: "1-2 días", min: 1, max: 2 },
  { key: "3-5", label: "3-5 días", min: 3, max: 5 },
  { key: "6+", label: "6+ días", min: 6, max: Number.POSITIVE_INFINITY },
];

interface PlansExplorerProps {
  initialPlans: PlanCatalogItem[];
}

interface SearchFilters {
  destination: string;
  startDate: string;
  endDate: string;
  travelers: number;
}

const parseSearchFiltersFromQuery = (
  params: URLSearchParams,
): SearchFilters | null => {
  const destination = (params.get("destino") ?? "").trim();
  const startDate = (params.get("fecha_inicio") ?? "").trim();
  const endDate = (params.get("fecha_fin") ?? "").trim();
  const travelersRaw = (params.get("viajeros") ?? "").trim();

  if (!destination && !startDate && !endDate && !travelersRaw) {
    return null;
  }

  const travelers = Number(travelersRaw);
  const datesValid =
    Boolean(startDate) &&
    Boolean(endDate) &&
    !Number.isNaN(new Date(startDate).getTime()) &&
    !Number.isNaN(new Date(endDate).getTime()) &&
    startDate <= endDate;

  if (!destination || !datesValid || !Number.isInteger(travelers)) {
    return null;
  }

  if (travelers < 1 || travelers > 30) {
    return null;
  }

  return {
    destination,
    startDate,
    endDate,
    travelers,
  };
};

const PlansExplorer: React.FC<PlansExplorerProps> = ({ initialPlans }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { token, loading: authLoading } = useAuth();
  const [plans, setPlans] = React.useState<PlanCatalogItem[]>(initialPlans);
  const [selectedDurations, setSelectedDurations] = React.useState<string[]>(
    [],
  );
  const [selectedCategories, setSelectedCategories] = React.useState<string[]>(
    [],
  );
  const [selectedMunicipalities, setSelectedMunicipalities] = React.useState<
    string[]
  >([]);
  const [sortOrder, setSortOrder] = React.useState("popular");
  const [currentPage, setCurrentPage] = React.useState(1);
  const [searchFilters, setSearchFilters] = React.useState<SearchFilters | null>(
    null,
  );
  const [searchResetSignal, setSearchResetSignal] = React.useState(0);

  const urlSearchFilters = React.useMemo(() => {
    const params = new URLSearchParams(searchParams.toString());
    return parseSearchFiltersFromQuery(params);
  }, [searchParams]);

  React.useEffect(() => {
    setSearchFilters(urlSearchFilters);
  }, [urlSearchFilters]);

  React.useEffect(() => {
    setPlans(initialPlans);
  }, [initialPlans]);

  React.useEffect(() => {
    if (authLoading || !token) {
      return;
    }

    let isMounted = true;

    getFavoritePlans(token)
      .then((favorites) => {
        if (!isMounted) return;
        const favoriteSlugs = new Set(
          favorites.map((plan) => extractPlanSlug(plan.id)),
        );
        setPlans((currentPlans) =>
          currentPlans.map((plan) => ({
            ...plan,
            isFavorite: favoriteSlugs.has(extractPlanSlug(plan.id)),
          })),
        );
      })
      .catch((error) => {
        console.error("Error cargando favoritos:", error);
      });

    return () => {
      isMounted = false;
    };
  }, [authLoading, initialPlans, token]);

  const priceStats = React.useMemo(() => {
    if (!plans.length) {
      return { min: 0, max: 0 };
    }
    const values = plans.map((plan) =>
      plan.priceValue ?? parseNumericPrice(plan.price),
    );
    const rawMin = Math.min(...values);
    const rawMax = Math.max(...values);
    return {
      min: roundDown(rawMin, PRICE_STEP),
      max: roundUp(rawMax, PRICE_STEP),
    };
  }, [plans]);

  const [priceValue, setPriceValue] = React.useState(priceStats.max);

  React.useEffect(() => {
    setPriceValue(priceStats.max);
  }, [priceStats.max]);

  const categoryOptions = React.useMemo(() => {
    const fromCategories = plans.flatMap((plan) => plan.categories ?? []);
    const fromDestinations = plans.flatMap((plan) => plan.destinations ?? []);
    const source = fromCategories.length ? fromCategories : fromDestinations;
    return Array.from(
      new Set(source.map((item) => item.trim()).filter(Boolean)),
    );
  }, [plans]);

  const municipalityOptions = React.useMemo(() => {
    const values = plans.flatMap((plan) => plan.municipalities ?? []);
    return Array.from(
      new Set(values.map((item) => item.trim()).filter(Boolean)),
    );
  }, [plans]);

  const destinationOptions = React.useMemo(() => {
    const counts = new Map<string, number>();
    plans.forEach((plan) => {
      const targets = plan.destinations?.length
        ? plan.destinations
        : [plan.location];
      targets.forEach((item) => {
        const cleaned = item.trim();
        if (!cleaned) return;
        counts.set(cleaned, (counts.get(cleaned) ?? 0) + 1);
      });
    });
    const sorted = Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
    const all = sorted.map(([name]) => name);
    return {
      all,
      top: all.slice(0, 8),
    };
  }, [plans]);

  const searchRangeDays = React.useMemo(() => {
    if (!searchFilters) {
      return null;
    }
    const start = new Date(`${searchFilters.startDate}T00:00:00`);
    const end = new Date(`${searchFilters.endDate}T00:00:00`);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return null;
    }
    const diff = Math.floor(
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
    );
    return diff >= 0 ? diff + 1 : null;
  }, [searchFilters]);

  const filteredPlans = React.useMemo(() => {
    const priceFilterActive = priceValue < priceStats.max;
    return plans.filter((plan) => {
      const planPrice = plan.priceValue ?? parseNumericPrice(plan.price);
      if (priceFilterActive && planPrice > priceValue) {
        return false;
      }

      const durationDays =
        plan.durationDays ?? parseDurationDays(plan.duration);
      const matchesDuration =
        selectedDurations.length === 0 ||
        selectedDurations.some((key) => {
          const option = durationOptions.find((item) => item.key === key);
          if (!option) return false;
          return durationDays >= option.min && durationDays <= option.max;
        });
      if (!matchesDuration) {
        return false;
      }

      const planCategories = (plan.categories ?? plan.destinations ?? []).map(
        normalizeToken,
      );
      const selectedTokens = selectedCategories.map(normalizeToken);
      const matchesCategory =
        selectedTokens.length === 0 ||
        planCategories.some((cat) => selectedTokens.includes(cat));
      if (!matchesCategory) {
        return false;
      }

      const selectedMunicipalityTokens = selectedMunicipalities.map(
        normalizeToken,
      );
      const planMunicipalities = (plan.municipalities ?? []).map(normalizeToken);
      const matchesMunicipality =
        selectedMunicipalityTokens.length === 0 ||
        planMunicipalities.some((mun) =>
          selectedMunicipalityTokens.includes(mun),
        );
      if (!matchesMunicipality) {
        return false;
      }

      if (searchFilters) {
        const destinationToken = normalizeToken(searchFilters.destination);
        const planDestinations = (plan.destinations ?? []).map(normalizeToken);
        const locationToken = normalizeToken(plan.location);
        const matchesDestination =
          planDestinations.includes(destinationToken) ||
          locationToken === destinationToken;
        if (!matchesDestination) {
          return false;
        }

        if (searchRangeDays && durationDays > 0) {
          if (durationDays > searchRangeDays) {
            return false;
          }
        }

        if (
          typeof plan.capacityMax === "number" &&
          searchFilters.travelers > plan.capacityMax
        ) {
          return false;
        }
      }

      return true;
    });
  }, [
    plans,
    priceValue,
    priceStats.max,
    selectedDurations,
    selectedCategories,
    selectedMunicipalities,
    searchFilters,
    searchRangeDays,
  ]);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [
    priceValue,
    selectedDurations,
    selectedCategories,
    selectedMunicipalities,
    sortOrder,
    searchFilters,
  ]);

  const sortedPlans = React.useMemo(() => {
    if (sortOrder === "popular") {
      return [...filteredPlans].sort(
        (a, b) => (b.popularity ?? 0) - (a.popularity ?? 0),
      );
    }

    const sorted = [...filteredPlans];

    if (sortOrder === "price") {
      sorted.sort((a, b) => {
        const priceA = a.priceValue ?? parseNumericPrice(a.price);
        const priceB = b.priceValue ?? parseNumericPrice(b.price);
        return priceA - priceB;
      });
      return sorted;
    }

    if (sortOrder === "newest") {
      sorted.sort((a, b) => b.id.localeCompare(a.id));
      return sorted;
    }

    return sorted;
  }, [filteredPlans, sortOrder]);

  const totalPlans = sortedPlans.length;
  const totalPages = Math.max(1, Math.ceil(totalPlans / PAGE_SIZE));
  const clampedPage = Math.min(currentPage, totalPages);

  const paginatedPlans = sortedPlans.slice(
    (clampedPage - 1) * PAGE_SIZE,
    clampedPage * PAGE_SIZE,
  );

  const rangeStart = totalPlans === 0 ? 0 : (clampedPage - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(totalPlans, clampedPage * PAGE_SIZE);

  const handleToggleFavorite = async (id: string) => {
    if (!token) {
      router.push("/login");
      return;
    }

    const selectedPlan = plans.find((plan) => plan.id === id);
    const shouldFavorite = !selectedPlan?.isFavorite;

    setPlans((prevPlans) =>
      prevPlans.map((plan) =>
        plan.id === id ? { ...plan, isFavorite: shouldFavorite } : plan,
      ),
    );

    try {
      if (shouldFavorite) {
        await addFavoritePlan(token, id);
      } else {
        await removeFavoritePlan(token, id);
      }
    } catch (error) {
      console.error("Error actualizando favorito:", error);
      setPlans((prevPlans) =>
        prevPlans.map((plan) =>
          plan.id === id ? { ...plan, isFavorite: !shouldFavorite } : plan,
        ),
      );
    }
  };

  const handleToggleDuration = (key: string) => {
    setSelectedDurations((prev) =>
      prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key],
    );
  };

  const handleToggleCategory = (value: string) => {
    setSelectedCategories((prev) =>
      prev.includes(value)
        ? prev.filter((item) => item !== value)
        : [...prev, value],
    );
  };

  const handleToggleMunicipality = (value: string) => {
    setSelectedMunicipalities((prev) =>
      prev.includes(value)
        ? prev.filter((item) => item !== value)
        : [...prev, value],
    );
  };

  const handleResetFilters = () => {
    setSelectedDurations([]);
    setSelectedCategories([]);
    setSelectedMunicipalities([]);
    setPriceValue(priceStats.max);
    setCurrentPage(1);
    setSortOrder("popular");
    setSearchFilters(null);
    setSearchResetSignal((prev) => prev + 1);
    router.replace("/planes", { scroll: false });
  };

  const handleSearch = (filters: SearchFilters) => {
    setSearchFilters(filters);
    setCurrentPage(1);
    const params = new URLSearchParams(searchParams.toString());
    params.set("destino", filters.destination);
    params.set("fecha_inicio", filters.startDate);
    params.set("fecha_fin", filters.endDate);
    params.set("viajeros", String(filters.travelers));
    router.replace(`/planes?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="space-y-10">
      <div className="flex justify-center">
        <SearchBar
          destinations={destinationOptions.all}
          topDestinations={destinationOptions.top}
          defaultFilters={searchFilters ?? undefined}
          onSearch={handleSearch}
          resetSignal={searchResetSignal}
        />
      </div>
      <div className="flex flex-col lg:flex-row gap-8">
        <PlansFilters
          priceMin={priceStats.min}
          priceMax={priceStats.max}
          priceValue={priceValue}
          onPriceChange={setPriceValue}
          durationOptions={durationOptions}
          selectedDurations={selectedDurations}
          onToggleDuration={handleToggleDuration}
          municipalities={municipalityOptions}
          selectedMunicipalities={selectedMunicipalities}
          onToggleMunicipality={handleToggleMunicipality}
          categories={categoryOptions}
          selectedCategories={selectedCategories}
          onToggleCategory={handleToggleCategory}
          onReset={handleResetFilters}
          onApply={() => setCurrentPage(1)}
        />
        <div className="flex-1">
          <PlansGridClient
            plans={paginatedPlans}
            total={totalPlans}
            rangeStart={rangeStart}
            rangeEnd={rangeEnd}
            sortOrder={sortOrder}
            onSortChange={setSortOrder}
            onToggleFavorite={handleToggleFavorite}
          />
          <PlansPagination
            currentPage={clampedPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>
    </div>
  );
};

export default PlansExplorer;
