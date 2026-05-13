import { ReservationsSchema } from "@/schemas/reservations";
import { type Reservations } from "@/types/reservations";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export const getReservations = async (token: string): Promise<Reservations> => {
  const response = await fetch(`${API_URL}/reservas/mias`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("No se pudo cargar la lista de reservas");
  }

  const data = await response.json();
  return ReservationsSchema.parse(data);
};

export const cancelReservation = async (
  token: string,
  reservationId: string
): Promise<void> => {
  const response = await fetch(
    `${API_URL}/reservas/${encodeURIComponent(reservationId)}/cancelar`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("No se pudo cancelar la reserva");
  }
};
