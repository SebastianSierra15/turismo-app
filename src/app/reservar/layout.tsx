import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Amaturis | Finalizar reserva",
  description: "Área privada para completar una reserva en Amaturis.",
  path: "/reservar",
  noIndex: true,
});

export default function ReservarLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
