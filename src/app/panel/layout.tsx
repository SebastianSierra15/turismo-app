import { createPageMetadata } from "@/lib/seo";
import React from "react";
import RoleAccessGate from "@/components/shared/organisms/RoleAccessGate";

export const metadata = createPageMetadata({
  title: "Amaturis | Panel de aliados",
  description: "Área privada para la gestión operativa de aliados de Amaturis.",
  path: "/panel",
  noIndex: true,
});

export default function PanelLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <RoleAccessGate allowedRoles={["Operador", "Admin"]} sectionLabel="panel operativo">
      {children}
    </RoleAccessGate>
  );
}
