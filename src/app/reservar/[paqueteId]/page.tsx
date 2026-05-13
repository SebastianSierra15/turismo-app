import type { Metadata } from "next";
import BookingCheckoutClient from "./BookingCheckoutClient";

type BookingPageProps = {
  params: Promise<{ paqueteId: string }>;
};

export const metadata: Metadata = {
  title: "Amaturis | Finalizar reserva",
  description:
    "Completa los datos del viajero y confirma disponibilidad para tu reserva.",
};

export default async function BookingPage({ params }: BookingPageProps) {
  const { paqueteId } = await params;
  return <BookingCheckoutClient paqueteId={paqueteId} />;
}
