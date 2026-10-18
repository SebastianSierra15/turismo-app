import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Amaturis | Crear cuenta",
  description: "Crea tu cuenta para reservar experiencias en Caquetá.",
  path: "/registro",
  noIndex: true,
});

export default function RegistroLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
