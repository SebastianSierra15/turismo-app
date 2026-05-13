import { ReservationDetailSchema } from "@/schemas/reservationDetail";
import { type ReservationDetail } from "@/types/reservationDetail";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export const getReservationDetail = async (
  token: string,
  reservationId: string
): Promise<ReservationDetail> => {
  const response = await fetch(
    `${API_URL}/reservas/${encodeURIComponent(reservationId)}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("No se pudo cargar el detalle de la reserva");
  }

  const data = await response.json();
  return ReservationDetailSchema.parse(data);
};
