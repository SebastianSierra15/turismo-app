import { buildApiUrl, parseApiError } from "@/lib/api";
import { ApiHttpError } from "@/lib/api";
import { ReservationAvailabilitySchema } from "@/schemas/reservationAvailability";
import { extractPlanSlug } from "@/utils/planId";
import { getTomorrowDateInputValue, toDateInputValue } from "@/utils/dateInput";

const fallbackAvailability = (
  paqueteId: string,
  dias: number,
  viajeros: number,
) => {
  const minimum = getTomorrowDateInputValue();
  const start = new Date(`${minimum}T00:00:00`);
  const fechas = Array.from({ length: dias }, (_, index) => {
    const current = new Date(start);
    current.setDate(start.getDate() + index);
    return toDateInputValue(current);
  });

  return ReservationAvailabilitySchema.parse({
    paquete_id: extractPlanSlug(paqueteId),
    fecha_minima: minimum,
    dias,
    viajeros,
    capacidad_paquete: null,
    destinos_limitados: [],
    fechas_disponibles: fechas,
    fechas_no_disponibles: [],
  });
};

export const getReservationAvailability = async (
  paqueteId: string,
  options?: {
    dias?: number;
    viajeros?: number;
  },
) => {
  const dias = options?.dias ?? 120;
  const viajeros = options?.viajeros ?? 1;
  const url = buildApiUrl(
    `/reservas/disponibilidad/${encodeURIComponent(extractPlanSlug(paqueteId))}`,
    {
      dias,
      viajeros,
    },
  );

  const response = await fetch(url, {
    method: "GET",
    cache: "no-store",
  });

  if (!response.ok) {
    const parsed = await parseApiError(
      response,
      "No se pudo consultar la disponibilidad del plan.",
    );
    if (parsed instanceof ApiHttpError && parsed.status === 404) {
      return fallbackAvailability(paqueteId, dias, viajeros);
    }
    throw parsed;
  }

  return ReservationAvailabilitySchema.parse(await response.json());
};
