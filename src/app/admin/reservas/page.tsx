import type { Metadata } from "next";
import AdminReservationsTemplate from "@/components/features/panel/templates/AdminReservationsTemplate";

export const metadata: Metadata = {
  title: "Amaturis | Admin - Reservas globales",
  description:
    "Trazabilidad global de reservas en administracion: filtros, KPIs y detalle por reserva.",
};

export default function AdminReservasPage() {
  return <AdminReservationsTemplate />;
}

