import type { Metadata } from "next";
import OperatorReservationsTemplate from "@/components/features/panel/templates/OperatorReservationsTemplate";

export const metadata: Metadata = {
  title: "Amaturis | Operador - Reservas",
  description:
    "Gestion operativa de reservas para operadores: filtros por estado y fecha, detalle y actualizacion de estado.",
};

export default function PanelReservasOperadorPage() {
  return <OperatorReservationsTemplate />;
}
