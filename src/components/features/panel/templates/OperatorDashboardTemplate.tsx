"use client";

import React from "react";
import Link from "next/link";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { PanelLayout } from "@/components/features/missing-views/templates";
import Icon from "@/components/shared/atoms/Icon";
import { useAuth } from "@/context/AuthContext";
import { isOperatorOrAdminRole } from "@/lib/roles";
import { getOperatorReservations } from "@/services/operatorReservations";
import {
  type OperatorReservation,
  type OperatorReservationStatus,
} from "@/types/operatorReservations";

type PeriodRange = "all" | "30d" | "60d" | "90d";
type DemandMetric = "reservas" | "viajeros" | "ingresos";
type TrendGrouping = "semana" | "mes";

type NormalizedReservation = OperatorReservation & {
  travelKey: string;
  bookingKey: string;
  travelDate: Date;
  bookingDate: Date;
};

type StatusAggregate = {
  key: OperatorReservationStatus;
  label: string;
  color: string;
  reservas: number;
  viajeros: number;
  ingresos: number;
};

const MONTHS_SHORT = [
  "ene",
  "feb",
  "mar",
  "abr",
  "may",
  "jun",
  "jul",
  "ago",
  "sep",
  "oct",
  "nov",
  "dic",
];
const STATUS_ORDER: OperatorReservationStatus[] = [
  "pendiente",
  "confirmada",
  "completada",
  "cancelada",
];
const STATUS_META: Record<
  OperatorReservationStatus,
  { label: string; color: string; tone: string }
> = {
  pendiente: {
    label: "Pendiente",
    color: "#F59E0B",
    tone: "bg-amber-100 text-amber-700",
  },
  confirmada: {
    label: "Confirmada",
    color: "#10B981",
    tone: "bg-emerald-100 text-emerald-700",
  },
  completada: {
    label: "Completada",
    color: "#3B82F6",
    tone: "bg-blue-100 text-blue-700",
  },
  cancelada: {
    label: "Cancelada",
    color: "#F43F5E",
    tone: "bg-rose-100 text-rose-700",
  },
};
const PACKAGE_COLORS = [
  "#6F9B69",
  "#3B82F6",
  "#10B981",
  "#A855F7",
  "#F59E0B",
  "#EF4444",
  "#14B8A6",
  "#6366F1",
];

const parseDateSafe = (dateString: string) => {
  const date = new Date(`${dateString}T00:00:00`);
  if (Number.isNaN(date.getTime())) {
    return new Date("1970-01-01T00:00:00");
  }
  return date;
};

const toKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatDateShort = (date: Date) => {
  const day = date.getDate();
  const month = MONTHS_SHORT[date.getMonth()] ?? "";
  return `${day} ${month}`;
};

const toPeso = (value: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value);

const toCompactPeso = (value: number) => {
  if (Math.abs(value) >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(1)}M`;
  }
  if (Math.abs(value) >= 1_000) {
    return `$${(value / 1_000).toFixed(0)}K`;
  }
  return `$${Math.round(value)}`;
};

const toPercent = (value: number) => `${Math.round(value * 100)}%`;

const getWeekStart = (date: Date) => {
  const copy = new Date(date.getTime());
  const day = copy.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  copy.setDate(copy.getDate() + diff);
  copy.setHours(0, 0, 0, 0);
  return copy;
};

const bookingBucketFor = (date: Date, grouping: TrendGrouping) => {
  if (grouping === "mes") {
    const year = date.getFullYear();
    const month = date.getMonth();
    return {
      key: `${year}-${String(month + 1).padStart(2, "0")}`,
      label: `${MONTHS_SHORT[month]} ${year}`,
      sort: year * 100 + month,
    };
  }

  const monday = getWeekStart(date);
  return {
    key: toKey(monday),
    label: `Sem ${formatDateShort(monday)}`,
    sort: monday.getTime(),
  };
};

const clip = (value: string, max = 26) =>
  value.length > max ? `${value.slice(0, max - 1)}…` : value;

type RechartsClickState = {
  activePayload?: Array<{ payload?: Record<string, unknown> }>;
};

const getActivePayloadValue = (
  state: unknown,
  key: string,
): string | undefined => {
  if (typeof state !== "object" || state === null) return undefined;
  const activePayload = (state as RechartsClickState).activePayload;
  if (!Array.isArray(activePayload) || activePayload.length === 0)
    return undefined;
  const value = activePayload[0]?.payload?.[key];
  return typeof value === "string" ? value : undefined;
};

const OperatorDashboardTemplate: React.FC = () => {
  const { token, loading, user } = useAuth();
  const [rows, setRows] = React.useState<NormalizedReservation[]>([]);
  const [error, setError] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);

  const [period, setPeriod] = React.useState<PeriodRange>("all");
  const [demandMetric, setDemandMetric] =
    React.useState<DemandMetric>("reservas");
  const [trendGrouping, setTrendGrouping] =
    React.useState<TrendGrouping>("semana");
  const [topLimit, setTopLimit] = React.useState(5);
  const [selectedStatus, setSelectedStatus] = React.useState<
    OperatorReservationStatus | ""
  >("");
  const [selectedPackageId, setSelectedPackageId] = React.useState("");
  const [selectedTravelDateKey, setSelectedTravelDateKey] = React.useState("");
  const [selectedBookingBucket, setSelectedBookingBucket] = React.useState("");

  const canOperate = React.useMemo(
    () => isOperatorOrAdminRole(user?.rol),
    [user?.rol],
  );

  React.useEffect(() => {
    const load = async () => {
      if (!token || !canOperate) return;
      setIsLoading(true);
      setError("");
      try {
        const data = await getOperatorReservations(token);
        const normalized = data.map<NormalizedReservation>((item) => {
          const travelDate = parseDateSafe(item.fecha);
          const bookingRaw = item.fecha_reserva?.trim() || item.fecha;
          const bookingDate = parseDateSafe(bookingRaw);
          return {
            ...item,
            travelDate,
            bookingDate,
            travelKey: toKey(travelDate),
            bookingKey: toKey(bookingDate),
          };
        });
        setRows(normalized);
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "No se pudo cargar el dashboard operativo.";
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };

    if (!loading && token && canOperate) {
      void load();
    }
  }, [canOperate, loading, token]);

  const periodFilteredRows = React.useMemo(() => {
    if (period === "all") return rows;
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const cut = new Date(now.getTime());
    const daysBack = period === "30d" ? 30 : period === "60d" ? 60 : 90;
    cut.setDate(cut.getDate() - daysBack);
    return rows.filter((row) => row.travelDate >= cut);
  }, [period, rows]);

  const filteredRows = React.useMemo(() => {
    return periodFilteredRows.filter((row) => {
      if (selectedStatus && row.estado !== selectedStatus) return false;
      if (selectedPackageId && row.paquete.id !== selectedPackageId)
        return false;
      if (selectedTravelDateKey && row.travelKey !== selectedTravelDateKey)
        return false;
      if (selectedBookingBucket) {
        const bucket = bookingBucketFor(row.bookingDate, trendGrouping).key;
        if (bucket !== selectedBookingBucket) return false;
      }
      return true;
    });
  }, [
    periodFilteredRows,
    selectedBookingBucket,
    selectedPackageId,
    selectedStatus,
    selectedTravelDateKey,
    trendGrouping,
  ]);

  const packageOptions = React.useMemo(() => {
    const map = new Map<string, string>();
    periodFilteredRows.forEach((row) => {
      if (!map.has(row.paquete.id)) {
        map.set(row.paquete.id, row.paquete.nombre);
      }
    });
    return Array.from(map.entries())
      .map(([id, nombre]) => ({ id, nombre }))
      .sort((a, b) => a.nombre.localeCompare(b.nombre));
  }, [periodFilteredRows]);

  const kpis = React.useMemo(() => {
    const totalReservas = filteredRows.length;
    const activas = filteredRows.filter(
      (row) => row.estado === "pendiente" || row.estado === "confirmada",
    ).length;
    const ingresos = filteredRows
      .filter((row) => row.estado !== "cancelada")
      .reduce((sum, row) => sum + row.total, 0);
    const nowKey = toKey(new Date());
    const inSevenDays = new Date();
    inSevenDays.setDate(inSevenDays.getDate() + 7);
    const inSevenDaysKey = toKey(inSevenDays);
    const cuposProximos = filteredRows
      .filter(
        (row) =>
          row.travelKey >= nowKey &&
          row.travelKey <= inSevenDaysKey &&
          (row.estado === "pendiente" || row.estado === "confirmada"),
      )
      .reduce((sum, row) => sum + row.personas, 0);
    const positivas = filteredRows.filter(
      (row) => row.estado === "confirmada" || row.estado === "completada",
    ).length;
    const efectividad = totalReservas === 0 ? 0 : positivas / totalReservas;

    return {
      activas,
      ingresos,
      cuposProximos,
      efectividad,
      totalReservas,
    };
  }, [filteredRows]);

  const demandByTravelDate = React.useMemo(() => {
    const grouped = new Map<
      string,
      { travelDate: Date; reservas: number; viajeros: number; ingresos: number }
    >();
    filteredRows.forEach((row) => {
      const existing = grouped.get(row.travelKey);
      if (existing) {
        existing.reservas += 1;
        existing.viajeros += row.personas;
        existing.ingresos += row.total;
        return;
      }
      grouped.set(row.travelKey, {
        travelDate: row.travelDate,
        reservas: 1,
        viajeros: row.personas,
        ingresos: row.total,
      });
    });

    return Array.from(grouped.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([key, value]) => ({
        key,
        label: formatDateShort(value.travelDate),
        reservas: value.reservas,
        viajeros: value.viajeros,
        ingresos: value.ingresos,
      }));
  }, [filteredRows]);

  const packageRanking = React.useMemo(() => {
    const grouped = new Map<
      string,
      {
        id: string;
        nombre: string;
        reservas: number;
        viajeros: number;
        ingresos: number;
      }
    >();
    filteredRows.forEach((row) => {
      const key = row.paquete.id;
      const existing = grouped.get(key);
      if (existing) {
        existing.reservas += 1;
        existing.viajeros += row.personas;
        existing.ingresos += row.total;
        return;
      }
      grouped.set(key, {
        id: row.paquete.id,
        nombre: row.paquete.nombre,
        reservas: 1,
        viajeros: row.personas,
        ingresos: row.total,
      });
    });
    return Array.from(grouped.values())
      .sort((a, b) => b.reservas - a.reservas || b.ingresos - a.ingresos)
      .slice(0, topLimit)
      .map((item, index) => ({
        ...item,
        shortName: clip(item.nombre, 30),
        color: PACKAGE_COLORS[index % PACKAGE_COLORS.length],
      }));
  }, [filteredRows, topLimit]);

  const statusBreakdown = React.useMemo<StatusAggregate[]>(() => {
    return STATUS_ORDER.map((status) => {
      const subset = filteredRows.filter((row) => row.estado === status);
      return {
        key: status,
        label: STATUS_META[status].label,
        color: STATUS_META[status].color,
        reservas: subset.length,
        viajeros: subset.reduce((sum, row) => sum + row.personas, 0),
        ingresos: subset.reduce((sum, row) => sum + row.total, 0),
      };
    });
  }, [filteredRows]);

  const donutData = React.useMemo(() => {
    const total = statusBreakdown.reduce((sum, item) => sum + item.reservas, 0);
    if (total === 0) {
      return [
        { key: "sin-datos", label: "Sin datos", reservas: 1, color: "#E2E8F0" },
      ];
    }
    return statusBreakdown
      .filter((item) => item.reservas > 0)
      .map((item) => ({
        key: item.key,
        label: item.label,
        reservas: item.reservas,
        color: item.color,
      }));
  }, [statusBreakdown]);

  const travellerLoadRadar = React.useMemo(() => {
    return statusBreakdown.map((item) => ({
      estado: item.label,
      viajeros: item.viajeros,
      reservas: item.reservas,
      key: item.key,
    }));
  }, [statusBreakdown]);

  const incomeTrend = React.useMemo(() => {
    const grouped = new Map<
      string,
      {
        key: string;
        label: string;
        sort: number;
        ingresos: number;
        reservas: number;
        ticketPromedio: number;
      }
    >();
    filteredRows.forEach((row) => {
      const bucket = bookingBucketFor(row.bookingDate, trendGrouping);
      const existing = grouped.get(bucket.key);
      if (existing) {
        existing.reservas += 1;
        existing.ingresos += row.total;
        return;
      }
      grouped.set(bucket.key, {
        key: bucket.key,
        label: bucket.label,
        sort: bucket.sort,
        ingresos: row.total,
        reservas: 1,
        ticketPromedio: 0,
      });
    });

    return Array.from(grouped.values())
      .sort((a, b) => a.sort - b.sort)
      .map((item) => ({
        ...item,
        ticketPromedio:
          item.reservas > 0 ? Math.round(item.ingresos / item.reservas) : 0,
      }));
  }, [filteredRows, trendGrouping]);

  const upcomingReservations = React.useMemo(() => {
    const nowKey = toKey(new Date());
    return [...filteredRows]
      .filter(
        (row) =>
          row.travelKey >= nowKey &&
          (row.estado === "pendiente" || row.estado === "confirmada"),
      )
      .sort((a, b) => a.travelKey.localeCompare(b.travelKey))
      .slice(0, 5);
  }, [filteredRows]);

  const pendingTasks = React.useMemo(() => {
    const pendientes =
      statusBreakdown.find((item) => item.key === "pendiente")?.reservas ?? 0;
    const confirmadas =
      statusBreakdown.find((item) => item.key === "confirmada")?.reservas ?? 0;
    const canceladas =
      statusBreakdown.find((item) => item.key === "cancelada")?.reservas ?? 0;
    return [
      {
        icon: "check_circle",
        title: "Confirmar punto de encuentro",
        meta: pendientes > 0 ? `${pendientes} pendientes` : "Sin pendientes",
      },
      {
        icon: "event_available",
        title: "Ajustar cupos confirmados",
        meta: `${confirmadas} reservas activas`,
      },
      {
        icon: "report_problem",
        title: "Revisar cancelaciones",
        meta: canceladas > 0 ? `${canceladas} canceladas` : "Sin alertas",
      },
    ];
  }, [statusBreakdown]);

  const clearCrossFilters = () => {
    setSelectedStatus("");
    setSelectedPackageId("");
    setSelectedTravelDateKey("");
    setSelectedBookingBucket("");
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background-light">
        <div className="text-sm font-semibold text-slate-500">
          Cargando panel operativo...
        </div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background-light">
        <div className="text-sm font-semibold text-slate-500">
          Redirigiendo a inicio de sesion...
        </div>
      </div>
    );
  }

  if (!canOperate) {
    return (
      <PanelLayout
        active="Resumen"
        title="Dashboard operativo"
        subtitle="Reservas, ingresos, cupos y tareas de tus experiencias."
      >
        <div className="mx-auto flex w-full max-w-4xl flex-1 items-center justify-center px-4 py-16">
          <div className="w-full rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center">
            <h1 className="text-xl font-black text-rose-700">
              Acceso restringido
            </h1>
            <p className="mt-2 text-sm font-semibold text-rose-700">
              Solo usuarios con rol Operador o Admin pueden ver este panel.
            </p>
          </div>
        </div>
      </PanelLayout>
    );
  }

  return (
    <PanelLayout
      active="Resumen"
      title="Dashboard operativo"
      subtitle="Reservas, ingresos, cupos y tareas de tus experiencias."
    >
      {error ? (
        <div className="mb-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
          {error}
        </div>
      ) : null}

      <section className="mb-5 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          <label className="space-y-1 text-xs font-bold uppercase tracking-wider text-slate-500">
            Periodo
            <select
              value={period}
              onChange={(event) => setPeriod(event.target.value as PeriodRange)}
              className="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm font-bold normal-case tracking-normal text-slate-700"
            >
              <option value="all">Todo el historico</option>
              <option value="30d">Ultimos 30 dias</option>
              <option value="60d">Ultimos 60 dias</option>
              <option value="90d">Ultimos 90 dias</option>
            </select>
          </label>
          <label className="space-y-1 text-xs font-bold uppercase tracking-wider text-slate-500">
            Estado
            <select
              value={selectedStatus}
              onChange={(event) =>
                setSelectedStatus(
                  event.target.value as OperatorReservationStatus | "",
                )
              }
              className="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm font-bold normal-case tracking-normal text-slate-700"
            >
              <option value="">Todos</option>
              {STATUS_ORDER.map((status) => (
                <option key={`status-filter-${status}`} value={status}>
                  {STATUS_META[status].label}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1 text-xs font-bold uppercase tracking-wider text-slate-500 md:col-span-2 xl:col-span-2">
            Paquete
            <select
              value={selectedPackageId}
              onChange={(event) => setSelectedPackageId(event.target.value)}
              className="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm font-bold normal-case tracking-normal text-slate-700"
            >
              <option value="">Todos</option>
              {packageOptions.map((item) => (
                <option key={`pkg-filter-${item.id}`} value={item.id}>
                  {item.nombre}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            onClick={clearCrossFilters}
            className="h-10 self-end rounded-xl border border-slate-200 px-3 text-sm font-bold text-slate-700 hover:border-primary hover:text-primary cursor-pointer"
          >
            Limpiar filtros
          </button>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
          {selectedStatus ? (
            <span className="rounded-full bg-primary/10 px-2.5 py-1 font-bold text-primary">
              Estado: {STATUS_META[selectedStatus].label}
            </span>
          ) : null}
          {selectedPackageId ? (
            <span className="rounded-full bg-primary/10 px-2.5 py-1 font-bold text-primary">
              Paquete:{" "}
              {packageOptions.find((item) => item.id === selectedPackageId)
                ?.nombre ?? selectedPackageId}
            </span>
          ) : null}
          {selectedTravelDateKey ? (
            <span className="rounded-full bg-primary/10 px-2.5 py-1 font-bold text-primary">
              Fecha viaje: {selectedTravelDateKey}
            </span>
          ) : null}
          {selectedBookingBucket ? (
            <span className="rounded-full bg-primary/10 px-2.5 py-1 font-bold text-primary">
              Periodo reserva: {selectedBookingBucket}
            </span>
          ) : null}
          {!selectedStatus &&
          !selectedPackageId &&
          !selectedTravelDateKey &&
          !selectedBookingBucket ? (
            <span className="font-semibold text-slate-500">
              Sin filtros cruzados activos.
            </span>
          ) : null}
        </div>
      </section>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <div className="flex items-center justify-between">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Icon name="event_available" />
            </span>
            <span className="text-xs font-bold text-primary">
              {kpis.totalReservas} total
            </span>
          </div>
          <p className="mt-5 text-sm font-bold text-slate-500">
            Reservas activas
          </p>
          <p className="mt-1 text-3xl font-black text-slate-950">
            {kpis.activas}
          </p>
        </article>
        <article className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <div className="flex items-center justify-between">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Icon name="payments" />
            </span>
            <span className="text-xs font-bold text-primary">
              {kpis.totalReservas} reservas
            </span>
          </div>
          <p className="mt-5 text-sm font-bold text-slate-500">
            Ingresos estimados
          </p>
          <p className="mt-1 text-3xl font-black text-slate-950">
            {toCompactPeso(kpis.ingresos)}
          </p>
        </article>
        <article className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <div className="flex items-center justify-between">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Icon name="groups" />
            </span>
            <span className="text-xs font-bold text-primary">7 dias</span>
          </div>
          <p className="mt-5 text-sm font-bold text-slate-500">
            Cupos proximos
          </p>
          <p className="mt-1 text-3xl font-black text-slate-950">
            {kpis.cuposProximos}
          </p>
        </article>
        <article className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <div className="flex items-center justify-between">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Icon name="verified" />
            </span>
            <span className="text-xs font-bold text-primary">
              {kpis.totalReservas === 0
                ? "sin datos"
                : `${kpis.totalReservas} eval.`}
            </span>
          </div>
          <p className="mt-5 text-sm font-bold text-slate-500">Efectividad</p>
          <p className="mt-1 text-3xl font-black text-slate-950">
            {toPercent(kpis.efectividad)}
          </p>
        </article>
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_360px]">
        <section className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
          <div className="flex items-center justify-between border-b border-slate-100 p-5">
            <h2 className="font-black text-slate-950">Proximas reservas</h2>
            <Link
              href="/panel/reservas"
              className="text-sm font-bold text-primary"
              title="Ver reservas operativas"
            >
              Ver todo
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-5 py-3 font-black">Reserva</th>
                  <th className="px-5 py-3 font-black">Viajero</th>
                  <th className="px-5 py-3 font-black">Fecha</th>
                  <th className="px-5 py-3 font-black">Estado</th>
                  <th className="px-5 py-3 font-black text-right">Accion</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {upcomingReservations.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-5 py-7 text-center text-sm font-semibold text-slate-500"
                    >
                      No hay reservas proximas para el filtro actual.
                    </td>
                  </tr>
                ) : null}
                {upcomingReservations.map((row) => (
                  <tr key={`upcoming-${row.id}`} className="text-slate-700">
                    <td className="px-5 py-4 font-bold text-slate-900">
                      {row.id}
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-semibold">{row.turista.nombre}</div>
                      <div className="text-xs text-slate-500">
                        {row.turista.email}
                      </div>
                    </td>
                    <td className="px-5 py-4 font-semibold">{row.fecha}</td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${STATUS_META[row.estado].tone}`}
                      >
                        {row.estado_label}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Link
                        href={`/panel/reservas?reserva=${encodeURIComponent(row.id)}`}
                        className="text-xs font-bold text-primary hover:underline"
                        title="Abrir detalle de reserva"
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

        <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <h2 className="font-black text-slate-950">Tareas pendientes</h2>
          <div className="mt-5 space-y-3">
            {pendingTasks.map((task) => (
              <div
                key={task.title}
                className="flex gap-3 rounded-xl bg-slate-50 p-3"
              >
                <Icon name={task.icon} className="text-primary" />
                <div>
                  <p className="text-sm font-bold">{task.title}</p>
                  <p className="text-xs text-slate-400">{task.meta}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-2xl font-black text-slate-950">
                Demanda por fecha de viaje
              </h3>
              <p className="text-sm font-semibold text-slate-500">
                Cada punto permite filtrar por fecha de viaje.
              </p>
            </div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Metrica
              <select
                value={demandMetric}
                onChange={(event) =>
                  setDemandMetric(event.target.value as DemandMetric)
                }
                className="ml-2 h-9 rounded-xl border border-slate-200 px-3 text-sm font-bold normal-case tracking-normal text-slate-700"
              >
                <option value="reservas">Reservas</option>
                <option value="viajeros">Viajeros</option>
                <option value="ingresos">Ingresos</option>
              </select>
            </label>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={demandByTravelDate}
                margin={{ top: 8, right: 16, left: 6, bottom: 0 }}
                onClick={(state: unknown) => {
                  const key = getActivePayloadValue(state, "key");
                  if (key) {
                    setSelectedTravelDateKey((prev) =>
                      prev === key ? "" : key,
                    );
                  }
                }}
              >
                <defs>
                  <linearGradient id="demandArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6F9B69" stopOpacity={0.48} />
                    <stop
                      offset="100%"
                      stopColor="#6F9B69"
                      stopOpacity={0.08}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis
                  dataKey="label"
                  tick={{ fill: "#64748b", fontSize: 12 }}
                />
                <YAxis tick={{ fill: "#64748b", fontSize: 12 }} />
                <Tooltip
                  formatter={(value: number) => {
                    if (demandMetric === "ingresos")
                      return [toPeso(value), "Ingresos"];
                    if (demandMetric === "viajeros") return [value, "Viajeros"];
                    return [value, "Reservas"];
                  }}
                  contentStyle={{ borderRadius: 12, borderColor: "#cbd5e1" }}
                />
                <Area
                  isAnimationActive
                  type="monotone"
                  dataKey={demandMetric}
                  stroke="#6F9B69"
                  strokeWidth={3}
                  fill="url(#demandArea)"
                  activeDot={{
                    r: 6,
                    stroke: "#6F9B69",
                    strokeWidth: 2,
                    fill: "#ffffff",
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-2xl font-black text-slate-950">
                Top paquetes por reservas
              </h3>
              <p className="text-sm font-semibold text-slate-500">
                Haz clic en una barra para filtrar por paquete.
              </p>
            </div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Top
              <select
                value={topLimit}
                onChange={(event) => setTopLimit(Number(event.target.value))}
                className="ml-2 h-9 rounded-xl border border-slate-200 px-3 text-sm font-bold normal-case tracking-normal text-slate-700"
              >
                <option value={3}>3</option>
                <option value={5}>5</option>
                <option value={8}>8</option>
              </select>
            </label>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={packageRanking}
                layout="vertical"
                margin={{ top: 4, right: 12, left: 4, bottom: 4 }}
                onClick={(state: unknown) => {
                  const id = getActivePayloadValue(state, "id");
                  if (id) {
                    setSelectedPackageId((prev) => (prev === id ? "" : id));
                  }
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis
                  type="number"
                  tick={{ fill: "#64748b", fontSize: 12 }}
                  allowDecimals={false}
                />
                <YAxis
                  type="category"
                  dataKey="shortName"
                  width={150}
                  tick={{ fill: "#334155", fontSize: 12 }}
                />
                <Tooltip
                  formatter={(value: number, key: string) => {
                    if (key === "ingresos") return [toPeso(value), "Ingresos"];
                    if (key === "viajeros") return [value, "Viajeros"];
                    return [value, "Reservas"];
                  }}
                  contentStyle={{ borderRadius: 12, borderColor: "#cbd5e1" }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar
                  dataKey="reservas"
                  name="Reservas"
                  radius={[0, 8, 8, 0]}
                  fill="#6F9B69"
                  isAnimationActive
                >
                  {packageRanking.map((item) => (
                    <Cell key={`pkg-bar-${item.id}`} fill={item.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="mb-4">
            <h3 className="text-2xl font-black text-slate-950">
              Estado actual de reservas
            </h3>
            <p className="text-sm font-semibold text-slate-500">
              Cada seccion del anillo funciona como filtro por estado.
            </p>
          </div>
          <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
            <div className="relative h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart
                  onClick={(state: unknown) => {
                    const status = getActivePayloadValue(state, "key");
                    if (status && status !== "sin-datos") {
                      setSelectedStatus((prev) =>
                        prev === status
                          ? ""
                          : (status as OperatorReservationStatus),
                      );
                    }
                  }}
                >
                  <Tooltip
                    formatter={(
                      value: number,
                      _name: string,
                      data: unknown,
                    ) => {
                      const payload =
                        typeof data === "object" &&
                        data !== null &&
                        "payload" in data
                          ? ((data as { payload?: { label?: string } })
                              .payload ?? undefined)
                          : undefined;
                      return [value, payload?.label ?? "Estado"];
                    }}
                    contentStyle={{ borderRadius: 12, borderColor: "#cbd5e1" }}
                  />
                  <Pie
                    data={donutData}
                    dataKey="reservas"
                    nameKey="label"
                    innerRadius={70}
                    outerRadius={110}
                    strokeWidth={2}
                    isAnimationActive
                  >
                    {donutData.map((entry) => (
                      <Cell key={`donut-${entry.key}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xs font-black uppercase tracking-wider text-slate-500">
                  Total
                </span>
                <span className="text-3xl font-black text-slate-950">
                  {kpis.totalReservas}
                </span>
              </div>
            </div>
            <div className="space-y-2">
              {statusBreakdown.map((status) => (
                <button
                  key={`status-row-${status.key}`}
                  type="button"
                  onClick={() =>
                    setSelectedStatus((prev) =>
                      prev === status.key ? "" : status.key,
                    )
                  }
                  className={`flex w-full items-center justify-between rounded-xl border px-3 py-2 text-left transition ${
                    selectedStatus === status.key
                      ? "border-primary bg-primary/10"
                      : "border-slate-200 bg-slate-50 hover:border-primary/40"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span
                      className="inline-flex h-3 w-3 rounded-full"
                      style={{ backgroundColor: status.color }}
                    />
                    <span className="text-sm font-bold text-slate-700">
                      {status.label}
                    </span>
                  </span>
                  <span className="text-sm font-black text-slate-900">
                    {status.reservas}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="mb-4">
            <h3 className="text-2xl font-black text-slate-950">
              Carga de viajeros por estado
            </h3>
            <p className="text-sm font-semibold text-slate-500">
              Se reemplazo por radar para comparar peso de viajeros por estado.
            </p>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart
                data={travellerLoadRadar}
                margin={{ top: 8, right: 24, left: 24, bottom: 8 }}
                onClick={(state: unknown) => {
                  const key = getActivePayloadValue(state, "key");
                  if (key) {
                    setSelectedStatus((prev) =>
                      prev === key ? "" : (key as OperatorReservationStatus),
                    );
                  }
                }}
              >
                <PolarGrid stroke="#d1d5db" />
                <PolarAngleAxis
                  dataKey="estado"
                  tick={{ fill: "#475569", fontSize: 12 }}
                />
                <Tooltip
                  formatter={(value: number, key: string) => [
                    value,
                    key === "reservas" ? "Reservas" : "Viajeros",
                  ]}
                  contentStyle={{ borderRadius: 12, borderColor: "#cbd5e1" }}
                />
                <Radar
                  name="Viajeros"
                  dataKey="viajeros"
                  stroke="#6F9B69"
                  fill="#6F9B69"
                  fillOpacity={0.35}
                  isAnimationActive
                />
                <Radar
                  name="Reservas"
                  dataKey="reservas"
                  stroke="#3B82F6"
                  fill="#3B82F6"
                  fillOpacity={0.2}
                  isAnimationActive
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 xl:col-span-2">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-2xl font-black text-slate-950">
                Ingresos y ticket por periodo de reserva
              </h3>
              <p className="text-sm font-semibold text-slate-500">
                Cada barra permite filtrar por periodo de reserva.
              </p>
            </div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Agrupar por
              <select
                value={trendGrouping}
                onChange={(event) => {
                  setTrendGrouping(event.target.value as TrendGrouping);
                  setSelectedBookingBucket("");
                }}
                className="ml-2 h-9 rounded-xl border border-slate-200 px-3 text-sm font-bold normal-case tracking-normal text-slate-700"
              >
                <option value="semana">Semana</option>
                <option value="mes">Mes</option>
              </select>
            </label>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={incomeTrend}
                margin={{ top: 8, right: 16, left: 8, bottom: 8 }}
                onClick={(state: unknown) => {
                  const key = getActivePayloadValue(state, "key");
                  if (key) {
                    setSelectedBookingBucket((prev) =>
                      prev === key ? "" : key,
                    );
                  }
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis
                  dataKey="label"
                  tick={{ fill: "#64748b", fontSize: 12 }}
                />
                <YAxis
                  yAxisId="left"
                  tick={{ fill: "#64748b", fontSize: 12 }}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fill: "#64748b", fontSize: 12 }}
                />
                <Tooltip
                  formatter={(value: number, key: string) => {
                    if (key === "ingresos") return [toPeso(value), "Ingresos"];
                    if (key === "ticketPromedio")
                      return [toPeso(value), "Ticket promedio"];
                    return [value, "Reservas"];
                  }}
                  contentStyle={{ borderRadius: 12, borderColor: "#cbd5e1" }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar
                  yAxisId="left"
                  dataKey="ingresos"
                  name="Ingresos"
                  fill="#6F9B69"
                  radius={[8, 8, 0, 0]}
                  isAnimationActive
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="ticketPromedio"
                  name="Ticket promedio"
                  stroke="#1D4ED8"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                  isAnimationActive
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      {isLoading ? (
        <div className="mt-6 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-500">
          Actualizando datos del dashboard...
        </div>
      ) : null}
    </PanelLayout>
  );
};

export default OperatorDashboardTemplate;
