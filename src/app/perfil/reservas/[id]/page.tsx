import type { Metadata } from "next";
import ReservationDetailTemplate from "@/components/features/reservas/templates/ReservationDetailTemplate";

type ReservaDetallePageProps = {
  params: Promise<{ id: string }>;
};

export const metadata: Metadata = {
  title: "Amaturis | Detalle de reserva",
  description:
    "Consulta el detalle de tu reserva en Amaturis: plan, itinerario, viajeros, pagos y contacto del proveedor.",
};

export default async function ReservaDetallePage({
  params,
}: ReservaDetallePageProps) {
  const { id } = await params;
  return <ReservationDetailTemplate reservationId={id} />;
}
