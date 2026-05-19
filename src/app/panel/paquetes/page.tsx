import type { Metadata } from "next";
import OperatorPackagesTemplate from "@/components/features/panel/templates/OperatorPackagesTemplate";

export const metadata: Metadata = {
  title: "Amaturis | Gestion de paquetes",
  description:
    "Administra paquetes turisticos, precios, cupos, estado e informacion operativa.",
};

export default function PanelPaquetesPage() {
  return <OperatorPackagesTemplate />;
}
