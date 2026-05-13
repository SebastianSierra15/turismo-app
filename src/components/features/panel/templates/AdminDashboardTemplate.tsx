"use client";

import React from "react";
import Link from "next/link";
import { PanelLayout } from "@/components/features/missing-views/templates";
import { useAuth } from "@/context/AuthContext";
import { getAdminReservations, getAdminReservationsKpis } from "@/services/adminReservations";
import { type AdminReservation, type AdminReservationsKpis } from "@/types/adminReservations";

const EMPTY_KPIS: AdminReservationsKpis = {
  total_reservas: 0,
  confirmadas: 0,
  canceladas: 0,
  ingresos_estimados: 0,
  ingresos_estimados_label: "$0 COP",
  ingresos_confirmados: 0,
  ingresos_confirmados_label: "$0 COP",
};

const AdminDashboardTemplate: React.FC = () => {
  const { token, loading } = useAuth();
  const [kpis, setKpis] = React.useState<AdminReservationsKpis>(EMPTY_KPIS);
  const [latest, setLatest] = React.useState<AdminReservation[]>([]);
  const [error, setError] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    const load = async () => {
      if (!token) return;
      setIsLoading(true);
      setError("");
      try {
        const [kpisData, reservas] = await Promise.all([
          getAdminReservationsKpis(token),
          getAdminReservations(token),
        ]);
        setKpis(kpisData);
        setLatest(
          [...reservas]
            .sort((a, b) => b.fecha.localeCompare(a.fecha))
            .slice(0, 8)
        );
      } catch (err) {
        const message = err instanceof Error ? err.message : "No se pudo cargar el dashboard admin.";
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };

    if (!loading && token) {
      void load();
    }
  }, [loading, token]);

  return (
    <PanelLayout
      admin
      active="Resumen"
      title="Administrador general"
      subtitle="Metricas globales, trazabilidad y monitoreo de reservas."
    >
      {error ? (
        <div className="mb-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
          {error}
        </div>
      ) : null}

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

      <section className="mt-6 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
        <div className="flex items-center justify-between border-b border-slate-100 p-5">
          <h2 className="text-lg font-black text-slate-950">Trazabilidad reciente</h2>
          <Link href="/admin/reservas" className="text-sm font-bold text-primary" title="Ver trazabilidad completa">
            Ver todas las reservas
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-[920px] w-full border-collapse">
            <thead className="bg-slate-50 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Reserva</th>
                <th className="px-4 py-3">Paquete</th>
                <th className="px-4 py-3">Viajero</th>
                <th className="px-4 py-3">Fecha</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3 text-right">Accion</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {!isLoading && latest.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-sm font-semibold text-slate-500">
                    No hay reservas disponibles para trazabilidad.
                  </td>
                </tr>
              ) : null}
              {latest.map((row) => (
                <tr key={`admin-latest-${row.id}`}>
                  <td className="px-4 py-3 text-sm font-bold text-slate-900">{row.id}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-slate-700">{row.paquete.nombre}</td>
                  <td className="px-4 py-3 text-sm text-slate-700">
                    <div className="font-semibold">{row.turista.nombre}</div>
                    <div className="text-xs text-slate-500">{row.turista.email}</div>
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-slate-700">{row.fecha}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">
                      {row.estado_label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/reservas?reserva=${encodeURIComponent(row.id)}`}
                      className="text-xs font-bold text-primary hover:underline"
                      title="Abrir detalle"
                    >
                      Abrir
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </PanelLayout>
  );
};

export default AdminDashboardTemplate;

