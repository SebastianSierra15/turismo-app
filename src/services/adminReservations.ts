import { buildApiUrl } from "@/lib/api";
import {
  AdminReservationsKpisSchema,
  AdminReservationsSchema,
} from "@/schemas/adminReservations";
import { type AdminReservationStatus, type AdminReservations, type AdminReservationsKpis } from "@/types/adminReservations";

export type AdminReservationFilters = {
  q?: string;
  estado?: AdminReservationStatus | "";
  fecha_desde?: string;
  fecha_hasta?: string;
};

export const getAdminReservations = async (
  token: string,
  filters: AdminReservationFilters = {}
): Promise<AdminReservations> => {
  const response = await fetch(
    buildApiUrl("/admin/reservas", {
      q: filters.q || undefined,
      estado: filters.estado || undefined,
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
    let detail = "No se pudo cargar el listado global de reservas";
    try {
      const payload = await response.json();
      if (payload && typeof payload.detail === "string" && payload.detail.trim()) {
        detail = payload.detail;
      }
    } catch {
      // noop
    }
    throw new Error(detail);
  }

  const data = await response.json();
  return AdminReservationsSchema.parse(data);
};

export const getAdminReservationsKpis = async (
  token: string,
  filters: AdminReservationFilters = {}
): Promise<AdminReservationsKpis> => {
  const response = await fetch(
    buildApiUrl("/admin/reservas/kpis", {
      q: filters.q || undefined,
      estado: filters.estado || undefined,
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
    let detail = "No se pudieron cargar los KPIs globales";
    try {
      const payload = await response.json();
      if (payload && typeof payload.detail === "string" && payload.detail.trim()) {
        detail = payload.detail;
      }
    } catch {
      // noop
    }
    throw new Error(detail);
  }

  const data = await response.json();
  return AdminReservationsKpisSchema.parse(data);
};
