import type { Metadata } from "next";
import { AboutFullTemplate } from "@/components/features/missing-views/templates";
import { createPageMetadata } from "@/lib/seo";

const title = "Amaturis | Conoce nuestra mision en Caqueta";
const description =
  "Amaturis conecta viajeros con planes responsables en Caqueta, promoviendo conservacion, cultura local y experiencias seguras en la Amazonia colombiana.";
export const metadata: Metadata = createPageMetadata({
  title,
  description,
  path: "/acerca_de",
  imageAlt: "Paisaje amazónico del Caquetá",
});

export default function AcercaDePage() {
  return <AboutFullTemplate />;
}
