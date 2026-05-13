import type { Metadata } from "next";
import AdminDashboardTemplate from "@/components/features/panel/templates/AdminDashboardTemplate";

export const metadata: Metadata = {
  title: "Amaturis | Administrador general",
  description:
    "Panel de control general para usuarios, roles, prestadores, pagos y servicios.",
};

export default function AdminPage() {
  return <AdminDashboardTemplate />;
}
