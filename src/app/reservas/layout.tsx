import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Amaturis | Reservas",
  description: "Área privada para consultar el estado de una reserva.",
  path: "/reservas",
  noIndex: true,
});

export default function ReservasLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
