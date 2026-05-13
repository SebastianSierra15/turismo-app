import { PlansSchema } from "@/schemas/plan";
import { getPlanCatalog } from "@/services/planCatalog";
import { type Plan } from "@/types/plan";
import { type PlanCatalogItem } from "@/types/planCatalog";

const normalizeDifficultyToken = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

const pickTag = (badge?: string, difficulty?: string) => {
  if (badge && badge.trim()) {
    return badge.trim();
  }
  if (difficulty && difficulty.trim()) {
    return difficulty.trim();
  }
  return "Aventura";
};

const pickTagIcon = (difficulty: string) => {
  const normalized = normalizeDifficultyToken(difficulty);
  if (normalized.includes("desaf")) {
    return "terrain";
  }
  if (normalized.includes("facil")) {
    return "hiking";
  }
  return "forest";
};

const mapCatalogToFeatured = (plan: PlanCatalogItem): Plan => ({
  id: plan.id,
  title: plan.title,
  description: plan.description,
  image: plan.image,
  price: plan.price,
  rating: String(plan.popularity ?? 0),
  duration: plan.duration,
  tag: pickTag(plan.badge, plan.difficulty),
  tagIcon: pickTagIcon(plan.difficulty),
});

export const getFeaturedPlans = async (): Promise<Plan[]> => {
  const catalog = await getPlanCatalog({
    orden: "popularidad",
    limit: 3,
    offset: 0,
  });
  const featured = catalog.slice(0, 3).map(mapCatalogToFeatured);
  return PlansSchema.parse(featured);
};
