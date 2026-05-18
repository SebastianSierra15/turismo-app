import type { Metadata } from "next";
import OperatorDashboardTemplate from "@/components/features/panel/templates/OperatorDashboardTemplate";

export const metadata: Metadata = {
  title: "Amaturis | Panel de aliados",
  description:
    "Dashboard operativo para agencias, prestadores y aliados de Amaturis.",
};

export default function PanelPage() {
  return <OperatorDashboardTemplate />;
}
