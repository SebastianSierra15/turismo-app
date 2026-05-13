import type { Metadata } from "next";
import PaymentGatewayClient from "./PaymentGatewayClient";

type PasarelaPageProps = {
  searchParams: Promise<{
    paquete_id?: string;
    fecha_viaje?: string;
    cantidad_personas?: string;
  }>;
};

export const metadata: Metadata = {
  title: "Amaturis | Pasarela segura de pagos turisticos",
  description:
    "Finaliza tu reserva en Amaturis con una pasarela de pagos segura y validaciones obligatorias.",
};

export default async function PasarelaPagosPage({ searchParams }: PasarelaPageProps) {
  const params = await searchParams;
  const paqueteId = params.paquete_id ?? "paquete";
  const fechaViaje = params.fecha_viaje ?? "Fecha por confirmar";
  const viajeros = Number(params.cantidad_personas ?? "1");

  return (
    <PaymentGatewayClient
      paqueteId={paqueteId}
      fechaViaje={fechaViaje}
      viajeros={Number.isNaN(viajeros) ? 1 : Math.max(1, viajeros)}
    />
  );
}
