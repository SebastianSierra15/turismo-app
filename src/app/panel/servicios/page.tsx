import type { Metadata } from "next";
import OperatorServicesTemplate from "@/components/features/panel/templates/OperatorServicesTemplate";

export const metadata: Metadata = {
  title: "Amaturis | Gestion de servicios",
  description:
    "Administra servicios turisticos, sitios vinculados y productos locales.",
};

export default function PanelServiciosPage() {
  return <OperatorServicesTemplate />;
}
