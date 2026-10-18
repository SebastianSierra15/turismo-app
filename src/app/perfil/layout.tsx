import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Amaturis | Perfil de viajero",
  description: "Área privada para gestionar tu perfil y tus reservas en Amaturis.",
  path: "/perfil",
  noIndex: true,
});

export default function PerfilLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
