"use client";

import React from "react";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { PanelLayout } from "@/components/features/missing-views/templates";
import PaginationControls from "@/components/shared/organisms/PaginationControls";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useAuth } from "@/context/AuthContext";
import {
  getAdminReservations,
  getAdminReservationsKpis,
  type AdminReservationFilters,
} from "@/services/adminReservations";
import {
  type AdminReservation,
  type AdminReservationStatus,
  type AdminReservationsKpis,
} from "@/types/adminReservations";

const statusOptions: Array<{ value: AdminReservationStatus; label: string }> = [
  { value: "pendiente", label: "Pendiente de pago" },
  { value: "confirmada", label: "Confirmada" },
  { value: "cancelada", label: "Cancelada" },
  { value: "completada", label: "Completada" },
];

const statusClass: Record<AdminReservationStatus, string> = {
  pendiente: "bg-amber-100 text-amber-700",
  confirmada: "bg-emerald-100 text-emerald-700",
  cancelada: "bg-rose-100 text-rose-700",
  completada: "bg-slate-200 text-slate-700",
};

const EMPTY_KPIS: AdminReservationsKpis = {
  total_reservas: 0,
  confirmadas: 0,
  canceladas: 0,
  ingresos_estimados: 0,
  ingresos_estimados_label: "$0 COP",
  ingresos_confirmados: 0,
  ingresos_confirmados_label: "$0 COP",
};

const AdminReservationsTemplate: React.FC = () => {
  const { token, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const reservaFromUrl = searchParams.get("reserva")?.trim() ?? "";

  const [rows, setRows] = React.useState<AdminReservation[]>([]);
  const [kpis, setKpis] = React.useState<AdminReservationsKpis>(EMPTY_KPIS);
  const [selected, setSelected] = React.useState<AdminReservation | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  const [filters, setFilters] = React.useState<AdminReservationFilters>({
    q: "",
    estado: "",
    fecha_desde: "",
    fecha_hasta: "",
  });
  const debouncedQuery = useDebouncedValue(filters.q ?? "", 300);
  const [appliedFilters, setAppliedFilters] = React.useState<AdminReservationFilters>({
    estado: "",
    fecha_desde: "",
    fecha_hasta: "",
  });
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);

  const loadData = React.useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    setError("");
    try {
      const backendFilters: AdminReservationFilters = {
        estado: appliedFilters.estado,
        fecha_desde: appliedFilters.fecha_desde,
        fecha_hasta: appliedFilters.fecha_hasta,
      };
      const [reservas, summary] = await Promise.all([
        getAdminReservations(token, backendFilters),
        getAdminReservationsKpis(token, {
          ...backendFilters,
          q: debouncedQuery || undefined,
        }),
      ]);
      setRows(reservas);
      setKpis(summary);
    } catch (err) {
      const message = err instanceof Error ? err.message : "No se pudieron cargar las reservas globales.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [appliedFilters.estado, appliedFilters.fecha_desde, appliedFilters.fecha_hasta, debouncedQuery, token]);

  React.useEffect(() => {
    if (!loading && !token) {
      router.push("/login");
      return;
    }
    if (token) {
      void loadData();
    }
  }, [loadData, loading, router, token]);

  const onApplyFilters = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAppliedFilters({
      estado: filters.estado || "",
      fecha_desde: filters.fecha_desde || "",
      fecha_hasta: filters.fecha_hasta || "",
    });
  };

  const onResetFilters = () => {
    setFilters({ q: "", estado: "", fecha_desde: "", fecha_hasta: "" });
    setAppliedFilters({ estado: "", fecha_desde: "", fecha_hasta: "" });
    setPage(1);
  };

  React.useEffect(() => {
    if (!reservaFromUrl) return;
    setFilters((prev) => ({ ...prev, q: reservaFromUrl }));
  }, [reservaFromUrl]);

  const filteredRows = React.useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase();
    const sorted = [...rows].sort((a, b) => b.fecha.localeCompare(a.fecha));
    if (!q) return sorted;
    return sorted.filter((row) => {
      const searchable = [
        row.id,
        row.paquete.id,
        row.paquete.nombre,
        row.turista.nombre,
        row.turista.email,
        row.proveedor,
      ]
        .join(" ")
        .toLowerCase();
      return searchable.includes(q);
    });
  }, [debouncedQuery, rows]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const safePage = Math.min(Math.max(page, 1), totalPages);
  const paginatedRows = React.useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filteredRows.slice(start, start + pageSize);
  }, [filteredRows, pageSize, safePage]);

  React.useEffect(() => {
    if (page !== safePage) {
      setPage(safePage);
    }
  }, [page, safePage]);

  React.useEffect(() => {
    setPage(1);
  }, [debouncedQuery, appliedFilters.estado, appliedFilters.fecha_desde, appliedFilters.fecha_hasta]);

  React.useEffect(() => {
    if (!reservaFromUrl || rows.length === 0 || selected) return;
    const match = rows.find((row) => row.id.toLowerCase() === reservaFromUrl.toLowerCase());
    if (match) {
      setSelected(match);
    }
  }, [reservaFromUrl, rows, selected]);

  const clearReservaQueryParam = React.useCallback(() => {
    if (!reservaFromUrl) return;
    const params = new URLSearchParams(searchParams.toString());
    params.delete("reserva");
    const next = params.toString();
    router.replace(next ? `${pathname}?${next}` : pathname, { scroll: false });
  }, [pathname, reservaFromUrl, router, searchParams]);

  const closeDetailModal = React.useCallback(() => {
    setSelected(null);
    clearReservaQueryParam();
  }, [clearReservaQueryParam]);

  return (
    <PanelLayout
      admin
      active="Reservas"
      title="Reservas globales"
      subtitle="Trazabilidad completa de reservas, estados e ingresos."
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Total reservas</p>
          <p className="mt-2 text-3xl font-black text-slate-950">{kpis.total_reservas}</p>
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Confirmadas</p>
          <p className="mt-2 text-3xl font-black text-emerald-700">{kpis.confirmadas}</p>
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Canceladas</p>
          <p className="mt-2 text-3xl font-black text-rose-700">{kpis.canceladas}</p>
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Ingresos estimados</p>
          <p className="mt-2 text-3xl font-black text-primary">{kpis.ingresos_estimados_label}</p>
        </div>
      </div>

      <form
        onSubmit={onApplyFilters}
        className="mt-6 grid grid-cols-1 gap-3 rounded-2xl border border-primary/10 bg-white p-4 lg:grid-cols-5"
      >
        <input
          type="text"
          value={filters.q ?? ""}
          onChange={(event) => setFilters((prev) => ({ ...prev, q: event.target.value }))}
          placeholder="Buscar por paquete, ID, viajero o proveedor"
          className="h-11 rounded-xl border border-slate-200 px-3 text-sm font-semibold text-slate-700 lg:col-span-2"
          title="Buscador general"
        />
        <select
          value={filters.estado ?? ""}
          onChange={(event) =>
            setFilters((prev) => ({
              ...prev,
              estado: event.target.value as AdminReservationFilters["estado"],
            }))
          }
          className="h-11 rounded-xl border border-slate-200 px-3 text-sm font-semibold text-slate-700"
          title="Filtrar por estado"
        >
          <option value="">Todos los estados</option>
          {statusOptions.map((option) => (
            <option key={`admin-status-${option.value}`} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <input
          type="date"
          value={filters.fecha_desde}
          onChange={(event) => setFilters((prev) => ({ ...prev, fecha_desde: event.target.value }))}
          className="h-11 rounded-xl border border-slate-200 px-3 text-sm font-semibold text-slate-700"
          title="Fecha desde"
        />
        <input
          type="date"
          value={filters.fecha_hasta}
          onChange={(event) => setFilters((prev) => ({ ...prev, fecha_hasta: event.target.value }))}
          className="h-11 rounded-xl border border-slate-200 px-3 text-sm font-semibold text-slate-700"
          title="Fecha hasta"
        />
        <div className="grid grid-cols-2 gap-2">
          <button type="submit" className="h-11 rounded-xl bg-primary px-3 text-sm font-bold text-white">
            Filtrar
          </button>
          <button
            type="button"
            onClick={onResetFilters}
            className="h-11 rounded-xl border border-slate-200 px-3 text-sm font-bold text-slate-700"
          >
            Limpiar
          </button>
        </div>
      </form>

      {error ? (
        <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
          {error}
        </div>
      ) : null}

      <div className="mt-5 overflow-x-auto rounded-2xl border border-primary/10 bg-white">
        <table className="min-w-[1120px] w-full border-collapse">
          <thead className="bg-slate-50 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Reserva</th>
              <th className="px-4 py-3">Paquete</th>
              <th className="px-4 py-3">Viajero</th>
              <th className="px-4 py-3">Proveedor</th>
              <th className="px-4 py-3">Fecha</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-primary/10">
            {!isLoading && filteredRows.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-sm font-semibold text-slate-500">
                  No hay reservas con los filtros actuales.
                </td>
              </tr>
            ) : null}
            {paginatedRows.map((row) => (
              <tr key={`admin-row-${row.id}`} className="align-top">
                <td className="px-4 py-4 text-sm font-bold text-slate-900">{row.id}</td>
                <td className="px-4 py-4 text-sm font-semibold text-slate-700">{row.paquete.nombre}</td>
                <td className="px-4 py-4 text-sm text-slate-700">
                  <div className="font-semibold text-slate-900">{row.turista.nombre}</div>
                  <div className="text-xs text-slate-500">{row.turista.email}</div>
                </td>
                <td className="px-4 py-4 text-sm font-semibold text-slate-700">{row.proveedor}</td>
                <td className="px-4 py-4 text-sm font-semibold text-slate-700">{row.fecha}</td>
                <td className="px-4 py-4">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${statusClass[row.estado]}`}>
                    {row.estado_label}
                  </span>
                </td>
                <td className="px-4 py-4 text-sm font-bold text-slate-900">{row.total_label}</td>
                <td className="px-4 py-4">
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => setSelected(row)}
                      className="rounded-full border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700"
                    >
                      Detalle
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <PaginationControls
        page={safePage}
        pageSize={pageSize}
        totalItems={filteredRows.length}
        onPageChange={setPage}
        onPageSizeChange={(nextSize) => {
          setPageSize(nextSize);
          setPage(1);
        }}
      />

      {selected ? (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/45 p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-5 shadow-xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-black text-slate-900">Detalle de reserva</h2>
                <p className="text-sm font-semibold text-slate-500">ID: {selected.id}</p>
              </div>
              <button
                type="button"
                onClick={closeDetailModal}
                className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700"
              >
                Cerrar
              </button>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-[220px_1fr]">
              <div className="relative h-36 w-full overflow-hidden rounded-xl border border-primary/10">
                <Image
                  src={selected.paquete.imagen}
                  alt={`Imagen de ${selected.paquete.nombre}`}
                  fill
                  className="object-cover"
                  sizes="220px"
                />
              </div>
              <div className="space-y-2 text-sm">
                <p><span className="font-bold text-slate-900">Paquete:</span> {selected.paquete.nombre}</p>
                <p><span className="font-bold text-slate-900">Proveedor:</span> {selected.proveedor}</p>
                <p><span className="font-bold text-slate-900">Viajero:</span> {selected.turista.nombre}</p>
                <p><span className="font-bold text-slate-900">Correo:</span> {selected.turista.email}</p>
                <p><span className="font-bold text-slate-900">Fecha de viaje:</span> {selected.fecha}</p>
                <p><span className="font-bold text-slate-900">Estado:</span> {selected.estado_label}</p>
                <p><span className="font-bold text-slate-900">Total:</span> {selected.total_label}</p>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </PanelLayout>
  );
};

export default AdminReservationsTemplate;
