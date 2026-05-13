import { buildApiUrl } from "@/lib/api";
import { OperatorReservationsSchema } from "@/schemas/operatorReservations";
import { type OperatorReservationStatus, type OperatorReservations } from "@/types/operatorReservations";

export type OperatorReservationFilters = {
  q?: string;
  estado?: OperatorReservationStatus | "";
  fecha_desde?: string;
  fecha_hasta?: string;
};

export const getOperatorReservations = async (
  token: string,
  filters: OperatorReservationFilters = {}
): Promise<OperatorReservations> => {
  const response = await fetch(
    buildApiUrl("/operador/reservas", {
      fecha_desde: filters.fecha_desde || undefined,
      fecha_hasta: filters.fecha_hasta || undefined,
    }),
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error("No se pudo cargar la lista operativa de reservas");
  }

  const data = await response.json();
  return OperatorReservationsSchema.parse(data);
};

export const updateOperatorReservationStatus = async (
  token: string,
  reservationId: string,
  estado: OperatorReservationStatus
): Promise<void> => {
  const response = await fetch(
    buildApiUrl(`/operador/reservas/${encodeURIComponent(reservationId)}/estado`),
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ estado }),
    }
  );

  if (!response.ok) {
    const maybeBody = await response.text();
    throw new Error(maybeBody || "No se pudo actualizar el estado de la reserva");
  }
};
