import type { Metadata } from "next";
import PlansTemplate from "@/components/features/planes/templates/PlansTemplate";
import { createPageMetadata } from "@/lib/seo";

const title = "Amaturis | Planes turísticos y aventuras en Caquetá";
const description =
  "Explora nuestra colección de planes en Caquetá: senderismo, rafting, cascadas y cultura local, con filtros por precio, duración y dificultad para elegir tu aventura ideal.";
export const metadata: Metadata = createPageMetadata({
  title,
  description,
  path: "/planes",
  imageAlt: "Selva amazónica del Caquetá",
});

export default function PlanesPage() {
  return <PlansTemplate />;
}
