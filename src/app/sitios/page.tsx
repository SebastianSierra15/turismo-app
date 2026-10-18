import type { Metadata } from "next";
import SitesTemplate from "@/components/features/sitios/templates/SitesTemplate";
import { createPageMetadata } from "@/lib/seo";

const title = "Amaturis | Sitios y destinos en Caquetá";
const description =
  "Explora ríos, cascadas, reservas y ecosistemas en Caquetá con información clara sobre ubicación, capacidad diaria y detalles del lugar. Encuentra destinos auténticos para tu próxima aventura.";
export const metadata: Metadata = createPageMetadata({
  title,
  description,
  path: "/sitios",
  imageAlt: "Selva y ríos del Caquetá",
});

export default function SitiosPage() {
  return <SitesTemplate />;
}
