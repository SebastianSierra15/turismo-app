import type { Metadata } from "next";
import HomeTemplate from "@/components/features/inicio/templates/HomeTemplate";
import { createPageMetadata, DEFAULT_SOCIAL_IMAGE } from "@/lib/seo";

const title = "Amaturis | Experiencias turísticas en Caquetá";
const description =
  "Descubre planes turísticos auténticos en Caquetá con aventuras en selva, ríos y cascadas, guías locales y reservas sencillas para tu próximo viaje.";
export const metadata: Metadata = createPageMetadata({
  title,
  description,
  path: "/",
  image: DEFAULT_SOCIAL_IMAGE,
  imageAlt: "Paisaje amazónico del Caquetá",
});

export const dynamic = "force-dynamic";

export default function Home() {
  return <HomeTemplate />;
}
