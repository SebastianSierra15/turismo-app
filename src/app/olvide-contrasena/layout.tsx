import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Amaturis | Recuperar contraseña",
  description: "Recupera el acceso a tu cuenta de Amaturis.",
  path: "/olvide-contrasena",
  noIndex: true,
});

export default function OlvideContrasenaLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
