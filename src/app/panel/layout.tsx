"use client";

import React from "react";
import RoleAccessGate from "@/components/shared/organisms/RoleAccessGate";

export default function PanelLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <RoleAccessGate allowedRoles={["Operador", "Admin"]} sectionLabel="panel operativo">
      {children}
    </RoleAccessGate>
  );
}
