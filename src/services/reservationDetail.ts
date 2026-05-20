import { ReservationDetailSchema } from "@/schemas/reservationDetail";
import { type ReservationDetail } from "@/types/reservationDetail";
import { buildApiUrl, parseApiError } from "@/lib/api";

export const getReservationDetail = async (
  token: string,
  reservationId: string
): Promise<ReservationDetail> => {
  const response = await fetch(
    buildApiUrl(`/reservas/${encodeURIComponent(reservationId)}`),
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw await parseApiError(response, "No se pudo cargar el detalle de la reserva");
  }

  const data = await response.json();
  return ReservationDetailSchema.parse(data);
};
