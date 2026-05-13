import type { Metadata } from "next";
import CancelReservationClient from "./CancelReservationClient";

type CancelReservationPageProps = {
  params: Promise<{ id: string }>;
};

export const metadata: Metadata = {
  title: "Amaturis | Cancelar reserva",
  description:
    "Revisa la política de cancelación y confirma la solicitud de forma segura.",
};

export default async function CancelReservationPage({
  params,
}: CancelReservationPageProps) {
  const { id } = await params;
  return <CancelReservationClient reservationId={id} />;
}
