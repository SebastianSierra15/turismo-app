import { ReservationsSchema } from "@/schemas/reservations";
import { type Reservations } from "@/types/reservations";
import { buildApiUrl, parseApiError } from "@/lib/api";

export const getReservations = async (token: string): Promise<Reservations> => {
  const response = await fetch(buildApiUrl("/reservas/mias"), {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw await parseApiError(response, "No se pudo cargar la lista de reservas");
  }

  const data = await response.json();
  return ReservationsSchema.parse(data);
};

export const cancelReservation = async (
  token: string,
  reservationId: string
): Promise<void> => {
  const response = await fetch(
    buildApiUrl(`/reservas/${encodeURIComponent(reservationId)}/cancelar`),
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw await parseApiError(response, "No se pudo cancelar la reserva");
  }
};
