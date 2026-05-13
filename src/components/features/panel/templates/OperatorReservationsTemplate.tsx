"use client";

import React from "react";
import Image from "next/image";
import { PanelLayout } from "@/components/features/missing-views/templates";
import PaginationControls from "@/components/shared/organisms/PaginationControls";
import { useAuth } from "@/context/AuthContext";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import {
  getOperatorReservations,
  updateOperatorReservationStatus,
  type OperatorReservationFilters,
} from "@/services/operatorReservations";
import {
  type OperatorReservation,
  type OperatorReservationStatus,
} from "@/types/operatorReservations";

const statusOptions: Array<{ value: OperatorReservationStatus; label: string }> = [
  { value: "pendiente", label: "Pendiente de pago" },
  { value: "confirmada", label: "Confirmada" },
  { value: "cancelada", label: "Cancelada" },
  { value: "completada", label: "Completada" },
];

const statusClass: Record<OperatorReservationStatus, string> = {
  pendiente: "bg-amber-100 text-amber-700",
  confirmada: "bg-emerald-100 text-emerald-700",
  cancelada: "bg-rose-100 text-rose-700",
  completada: "bg-slate-200 text-slate-700",
};

const OperatorReservationsTemplate: React.FC = () => {
  const { token, loading, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const reservaFromUrl = searchParams.get("reserva")?.trim() ?? "";
  const [rows, setRows] = React.useState<OperatorReservation[]>([]);
  const [error, setError] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [selected, setSelected] = React.useState<OperatorReservation | null>(null);
  const [statusDraftById, setStatusDraftById] = React.useState<Record<string, OperatorReservationStatus>>({});
  const [updatingId, setUpdatingId] = React.useState<string | null>(null);
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);
  const [filters, setFilters] = React.useState<OperatorReservationFilters>({
    q: "",
    estado: "",
    fecha_desde: "",
    fecha_hasta: "",
  });
  const debouncedQuery = useDebouncedValue(filters.q ?? "", 300);
  const [appliedFilters, setAppliedFilters] = React.useState<OperatorReservationFilters>({
    estado: "",
    fecha_desde: "",
    fecha_hasta: "",
  });

  const canOperate = React.useMemo(() => {
    const role = (user?.rol ?? "").toString().toLowerCase();
    return role === "operador" || role === "admin";
  }, [user?.rol]);

  const loadData = React.useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    setError("");
    try {
      const data = await getOperatorReservations(token, appliedFilters);
      setRows(data);
      const defaults = data.reduce<Record<string, OperatorReservationStatus>>((acc, current) => {
        acc[current.id] = current.estado;
        return acc;
      }, {});
      setStatusDraftById(defaults);
      setPage(1);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "No se pudo cargar la tabla operativa.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [appliedFilters, token]);

  React.useEffect(() => {
    if (!loading && !token) {
      router.push("/login");
      return;
    }
    if (token && canOperate) {
      loadData().catch(() => setError("No se pudieron cargar reservas operativas."));
    }
  }, [canOperate, loadData, loading, router, token]);

  const onApplyFilters = async (event: React.FormEvent<HTMLFormElement>) => {
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

  const visibleRows = React.useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase();
    const sorted = [...rows].sort((a, b) => b.fecha.localeCompare(a.fecha));
    return sorted.filter((row) => {
      if (appliedFilters.estado && row.estado !== appliedFilters.estado) {
        return false;
      }

      if (!q) return true;

      const searchable = [
        row.id,
        row.paquete.id,
        row.paquete.nombre,
        row.turista.nombre,
        row.turista.email,
      ]
        .join(" ")
        .toLowerCase();
      return searchable.includes(q);
    });
  }, [appliedFilters.estado, debouncedQuery, rows]);

  const totalPages = Math.max(1, Math.ceil(visibleRows.length / pageSize));
  const safePage = Math.min(Math.max(page, 1), totalPages);
  const paginatedRows = React.useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return visibleRows.slice(start, start + pageSize);
  }, [pageSize, safePage, visibleRows]);

  React.useEffect(() => {
    if (page !== safePage) setPage(safePage);
  }, [page, safePage]);

  React.useEffect(() => {
    setPage(1);
  }, [debouncedQuery, appliedFilters.estado, appliedFilters.fecha_desde, appliedFilters.fecha_hasta]);

  React.useEffect(() => {
    if (!reservaFromUrl || rows.length === 0 || selected) return;
    const match = rows.find(
      (row) => row.id.toLowerCase() === reservaFromUrl.toLowerCase()
    );
    if (match) {
      setSelected(match);
    }
  }, [reservaFromUrl, rows, selected]);

  const clearReservaQueryParam = React.useCallback(() => {
    if (!reservaFromUrl) return;
    const params = new URLSearchParams(searchParams.toString());
    params.delete("reserva");
    const nextQuery = params.toString();
    router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, { scroll: false });
  }, [pathname, reservaFromUrl, router, searchParams]);

  const closeDetailModal = React.useCallback(() => {
    setSelected(null);
    clearReservaQueryParam();
  }, [clearReservaQueryParam]);

  const onUpdateStatus = async (reservationId: string) => {
    if (!token) return;
    const draftStatus = statusDraftById[reservationId];
    if (!draftStatus) return;

    try {
      setUpdatingId(reservationId);
      await updateOperatorReservationStatus(token, reservationId, draftStatus);
      await loadData();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "No se pudo actualizar el estado.";
      setError(message);
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background-light">
        <div className="text-sm font-semibold text-slate-500">Cargando panel operativo...</div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background-light">
        <div className="text-sm font-semibold text-slate-500">Redirigiendo a inicio de sesion...</div>
      </div>
    );
  }

  if (!canOperate) {
    return (
      <PanelLayout active="Reservas" title="Reservas Operativas" subtitle="Gestiona el estado de las reservas.">
        <div className="mx-auto flex w-full max-w-4xl flex-1 items-center justify-center px-4 py-16">
          <div className="w-full rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center">
            <h1 className="text-xl font-black text-rose-700">Acceso restringido</h1>
            <p className="mt-2 text-sm font-semibold text-rose-700">
              Solo usuarios con rol Operador o Admin pueden gestionar reservas.
            </p>
          </div>
        </div>
      </PanelLayout>
    );
  }

  return (
    <PanelLayout
      active="Reservas"
      title="Reservas Operativas"
      subtitle="Todas las reservas se muestran por fecha descendente."
    >
      <section className="mx-auto w-full max-w-7xl">
          <div className="mb-6">
            <p className="mt-2 text-sm font-semibold text-slate-500">
              Usa el buscador para paquete, reserva o usuario. El estado se filtra en su selector.
            </p>
          </div>

          <form
            onSubmit={onApplyFilters}
            className="mb-6 grid grid-cols-1 gap-3 rounded-2xl border border-primary/10 bg-white p-4 lg:grid-cols-5"
          >
            <input
              type="text"
              value={filters.q ?? ""}
              onChange={(event) =>
                setFilters((prev) => ({ ...prev, q: event.target.value }))
              }
              placeholder="Buscar por paquete, ID reserva o usuario"
              className="h-11 rounded-xl border border-slate-200 px-3 text-sm font-semibold text-slate-700 lg:col-span-2"
              title="Buscador general"
            />
            <select
              value={filters.estado ?? ""}
              onChange={(event) =>
                setFilters((prev) => ({
                  ...prev,
                  estado: event.target.value as OperatorReservationFilters["estado"],
                }))
              }
              className="h-11 rounded-xl border border-slate-200 px-3 text-sm font-semibold text-slate-700"
              title="Filtrar por estado"
            >
              <option value="">Todos los estados</option>
              {statusOptions.map((option) => (
                <option key={`status-filter-${option.value}`} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <input
              type="date"
              value={filters.fecha_desde}
              onChange={(event) =>
                setFilters((prev) => ({ ...prev, fecha_desde: event.target.value }))
              }
              className="h-11 rounded-xl border border-slate-200 px-3 text-sm font-semibold text-slate-700"
              title="Fecha desde"
            />

            <input
              type="date"
              value={filters.fecha_hasta}
              onChange={(event) =>
                setFilters((prev) => ({ ...prev, fecha_hasta: event.target.value }))
              }
              className="h-11 rounded-xl border border-slate-200 px-3 text-sm font-semibold text-slate-700"
              title="Fecha hasta"
            />

            <div className="grid grid-cols-2 gap-2">
              <button
                type="submit"
                className="h-11 rounded-xl bg-primary px-3 text-sm font-bold text-white"
              >
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
            <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
              {error}
            </div>
          ) : null}

          <div className="overflow-x-auto rounded-2xl border border-primary/10 bg-white">
            <table className="min-w-[1080px] w-full border-collapse">
              <thead className="bg-slate-50 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Reserva</th>
                  <th className="px-4 py-3">Paquete</th>
                  <th className="px-4 py-3">Viajero</th>
                  <th className="px-4 py-3">Fecha</th>
                  <th className="px-4 py-3">Viajeros</th>
                  <th className="px-4 py-3">Total</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary/10">
                {!isLoading && visibleRows.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-10 text-center text-sm font-semibold text-slate-500">
                      No hay reservas con los filtros actuales.
                    </td>
                  </tr>
                ) : null}
                {paginatedRows.map((row) => (
                  <tr key={row.id} className="align-top">
                    <td className="px-4 py-4 text-sm font-bold text-slate-900">{row.id}</td>
                    <td className="px-4 py-4 text-sm font-semibold text-slate-700">{row.paquete.nombre}</td>
                    <td className="px-4 py-4 text-sm text-slate-700">
                      <div className="font-semibold text-slate-900">{row.turista.nombre}</div>
                      <div className="text-xs text-slate-500">{row.turista.email}</div>
                    </td>
                    <td className="px-4 py-4 text-sm font-semibold text-slate-700">{row.fecha}</td>
                    <td className="px-4 py-4 text-sm font-semibold text-slate-700">{row.personas}</td>
                    <td className="px-4 py-4 text-sm font-bold text-slate-900">{row.total_label}</td>
                    <td className="px-4 py-4">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${statusClass[row.estado]}`}>
                        {row.estado_label}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setSelected(row)}
                          className="rounded-full border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700"
                        >
                          Detalle
                        </button>
                        <select
                          value={statusDraftById[row.id] ?? row.estado}
                          onChange={(event) =>
                            setStatusDraftById((prev) => ({
                              ...prev,
                              [row.id]: event.target.value as OperatorReservationStatus,
                            }))
                          }
                          className="h-9 rounded-full border border-slate-200 px-3 text-xs font-bold text-slate-700"
                          title="Seleccionar estado"
                        >
                          {statusOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => void onUpdateStatus(row.id)}
                          disabled={updatingId === row.id || (statusDraftById[row.id] ?? row.estado) === row.estado}
                          className="rounded-full bg-slate-900 px-3 py-2 text-xs font-bold text-white disabled:opacity-40"
                          title={
                            (statusDraftById[row.id] ?? row.estado) === row.estado
                              ? "Selecciona un estado diferente para actualizar"
                              : "Actualizar estado de la reserva"
                          }
                        >
                          {updatingId === row.id
                            ? "Actualizando..."
                            : (statusDraftById[row.id] ?? row.estado) === row.estado
                            ? "Sin cambios"
                            : "Actualizar"}
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
            totalItems={visibleRows.length}
            onPageChange={setPage}
            onPageSizeChange={(nextSize) => {
              setPageSize(nextSize);
              setPage(1);
            }}
          />
      </section>

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
                <p><span className="font-bold text-slate-900">Viajeros:</span> {selected.personas}</p>
                <p><span className="font-bold text-slate-900">Precio por persona:</span> {selected.precio_unitario_label}</p>
                <p><span className="font-bold text-slate-900">Total:</span> {selected.total_label}</p>
                <p><span className="font-bold text-slate-900">Estado:</span> {selected.estado_label}</p>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </PanelLayout>
  );
};

export default OperatorReservationsTemplate;
