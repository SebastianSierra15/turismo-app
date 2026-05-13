"use client";

import React from "react";
import RoleAccessGate from "@/components/shared/organisms/RoleAccessGate";

export default function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <RoleAccessGate allowedRoles={["Admin"]} sectionLabel="administracion">
      {children}
    </RoleAccessGate>
  );
}
