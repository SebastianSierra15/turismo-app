"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { PanelLayout } from "@/components/features/missing-views/templates";
import Icon from "@/components/shared/atoms/Icon";
import PaginationControls from "@/components/shared/organisms/PaginationControls";
import { useAuth } from "@/context/AuthContext";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { isAdminRole, isOperatorOrAdminRole } from "@/lib/roles";
import {
  deleteOperatorService,
  getOperatorServiceDetail,
  getOperatorServices,
  getOperatorServiceTypes,
  getServiceOwners,
  saveOperatorService,
} from "@/services/operatorServices";
import {
  type OperatorService,
  type OperatorServiceType,
  type OperatorServiceWrite,
  type ServiceOwner,
} from "@/types/operatorServices";
import { extractPlanSlug } from "@/utils/planId";

type ServiceStatus = "publicado" | "borrador" | "pausado";
type StatusFilter = "todos" | ServiceStatus;

type ServiceFormState = {
  nombre: string;
  descripcion: string;
  tipo_uri: string;
  estado_publicacion: ServiceStatus;
  url_imagen: string;
  agencia_uri: string;
};

const statusFilters: Array<{ value: StatusFilter; label: string }> = [
  { value: "todos", label: "Todos" },
  { value: "publicado", label: "Publicados" },
  { value: "borrador", label: "Borradores" },
  { value: "pausado", label: "Pausados" },
];

const inputClass =
  "h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:bg-slate-50 disabled:text-slate-400";

const textareaClass =
  "min-h-28 w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:bg-slate-50 disabled:text-slate-400";

const numberFormatter = new Intl.NumberFormat("es-CO");

const normalizeText = (value: string | null | undefined) =>
  (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();

const normalizeStatus = (value: string | null | undefined): ServiceStatus => {
  const text = normalizeText(value);
  if (text.includes("borr") || text.includes("pend")) return "borrador";
  if (text.includes("paus") || text.includes("inactiv")) return "pausado";
  return "publicado";
};

const statusLabel: Record<ServiceStatus, string> = {
  publicado: "Publicado",
  borrador: "Borrador",
  pausado: "Pausado",
};

const statusClass: Record<ServiceStatus, string> = {
  publicado: "bg-emerald-100 text-emerald-700",
  borrador: "bg-amber-100 text-amber-700",
  pausado: "bg-slate-200 text-slate-700",
};

const emptyForm = (ownerUri = ""): ServiceFormState => ({
  nombre: "",
  descripcion: "",
  tipo_uri: "",
  estado_publicacion: "publicado",
  url_imagen: "",
  agencia_uri: ownerUri,
});

const formFromDetail = (
  detail: OperatorService,
  owners: ServiceOwner[],
): ServiceFormState => ({
  nombre: detail.nombre ?? "",
  descripcion: detail.descripcion ?? "",
  tipo_uri: detail.tipo_uri ?? "",
  estado_publicacion: normalizeStatus(detail.estado_publicacion),
  url_imagen: detail.url_imagen ?? "",
  agencia_uri: detail.agencia_uri ?? owners[0]?.uri ?? "",
});

const toNullableText = (value: string) => {
  const clean = value.trim();
  return clean ? clean : null;
};

const buildPayload = (
  form: ServiceFormState,
  isAdmin: boolean,
): { payload?: OperatorServiceWrite; error?: string } => {
  const nombre = form.nombre.trim();
  const descripcion = form.descripcion.trim();
  const url = form.url_imagen.trim();

  if (nombre.length < 3) {
    return { error: "El nombre debe tener minimo 3 caracteres." };
  }
  if (descripcion.length < 10) {
    return { error: "La descripcion debe tener minimo 10 caracteres." };
  }
  if (isAdmin && !form.agencia_uri) {
    return { error: "Selecciona una agencia o prestador responsable." };
  }

  return {
    payload: {
      nombre,
      descripcion,
      tipo_uri: toNullableText(form.tipo_uri),
      estado_publicacion: form.estado_publicacion,
      url_imagen: url ? url : null,
      agencia_uri: isAdmin ? form.agencia_uri : null,
    },
  };
};

const ServiceStatusBadge = ({ status }: { status: ServiceStatus }) => (
  <span
    className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ${statusClass[status]}`}
  >
    {statusLabel[status]}
  </span>
);

const OperatorServicesTemplate: React.FC = () => {
  const { token, loading, user } = useAuth();
  const router = useRouter();
  const [services, setServices] = React.useState<OperatorService[]>([]);
  const [owners, setOwners] = React.useState<ServiceOwner[]>([]);
  const [types, setTypes] = React.useState<OperatorServiceType[]>([]);
  const [error, setError] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<StatusFilter>("todos");
  const [typeFilter, setTypeFilter] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);
  const [isEditorOpen, setIsEditorOpen] = React.useState(false);
  const [editingServiceId, setEditingServiceId] = React.useState<string | null>(
    null,
  );
  const [editorLoading, setEditorLoading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [formError, setFormError] = React.useState("");
  const [form, setForm] = React.useState<ServiceFormState>(() => emptyForm());
  const debouncedSearch = useDebouncedValue(search, 250);

  const canOperate = React.useMemo(
    () => isOperatorOrAdminRole(user?.rol),
    [user?.rol],
  );
  const isAdmin = React.useMemo(() => isAdminRole(user?.rol), [user?.rol]);

  const loadData = React.useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    setError("");
    const [servicesResult, ownersResult, typesResult] = await Promise.allSettled([
      getOperatorServices(token, { q: "", limit: 300, offset: 0 }),
      getServiceOwners(token),
      getOperatorServiceTypes(token),
    ]);

    if (servicesResult.status === "fulfilled") {
      setServices(servicesResult.value);
    } else {
      const reason = servicesResult.reason;
      const message =
        reason instanceof Error && reason.message === "Failed to fetch"
          ? "No se pudo conectar con el backend (http://localhost:8000)."
          : reason instanceof Error
            ? reason.message
            : "No se pudieron cargar los servicios.";
      setError(message);
    }

    if (ownersResult.status === "fulfilled") {
      setOwners(ownersResult.value);
    } else {
      setOwners([]);
    }

    if (typesResult.status === "fulfilled") {
      setTypes(typesResult.value);
    } else {
      setTypes([]);
    }

    setIsLoading(false);
  }, [token]);

  React.useEffect(() => {
    if (!loading && !token) {
      router.push("/login");
      return;
    }

    if (token && canOperate) {
      loadData().catch(() => setError("No se pudieron cargar los servicios."));
    }
  }, [canOperate, loadData, loading, router, token]);

  React.useEffect(() => {
    setPage(1);
  }, [debouncedSearch, statusFilter, typeFilter]);

  React.useEffect(() => {
    if (!isEditorOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isEditorOpen]);

  const visibleServices = React.useMemo(() => {
    const q = normalizeText(debouncedSearch);
    return services
      .filter((item) => {
        const status = normalizeStatus(item.estado_publicacion);
        return statusFilter === "todos" || status === statusFilter;
      })
      .filter((item) => (typeFilter ? item.tipo_uri === typeFilter : true))
      .filter((item) => {
        if (!q) return true;
        const searchable = [
          item.nombre,
          item.descripcion,
          item.tipo_nombre,
          item.agencia_nombre,
          extractPlanSlug(item.id),
        ]
          .join(" ")
          .toLowerCase();
        return normalizeText(searchable).includes(q);
      })
      .sort((a, b) => a.nombre.localeCompare(b.nombre));
  }, [debouncedSearch, services, statusFilter, typeFilter]);

  const stats = React.useMemo(() => {
    const total = services.length;
    const published = services.filter(
      (item) => normalizeStatus(item.estado_publicacion) === "publicado",
    ).length;
    const linkedPackages = services.reduce(
      (sum, item) => sum + (item.paquetes_vinculados ?? 0),
      0,
    );
    return { total, published, linkedPackages };
  }, [services]);

  const totalPages = Math.max(1, Math.ceil(visibleServices.length / pageSize));
  const safePage = Math.min(Math.max(page, 1), totalPages);
  const paginatedServices = React.useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return visibleServices.slice(start, start + pageSize);
  }, [pageSize, safePage, visibleServices]);

  React.useEffect(() => {
    if (page !== safePage) setPage(safePage);
  }, [page, safePage]);

  const resetFilters = () => {
    setSearch("");
    setStatusFilter("todos");
    setTypeFilter("");
    setPage(1);
  };

  const closeEditor = React.useCallback(() => {
    if (saving) return;
    setIsEditorOpen(false);
    setEditingServiceId(null);
    setEditorLoading(false);
    setFormError("");
  }, [saving]);

  const openCreate = () => {
    setEditingServiceId(null);
    setForm(emptyForm(owners[0]?.uri ?? ""));
    setFormError("");
    setEditorLoading(false);
    setIsEditorOpen(true);
  };

  const openEdit = async (item: OperatorService) => {
    if (!token) return;
    setEditingServiceId(item.id);
    setForm(emptyForm(item.agencia_uri ?? owners[0]?.uri ?? ""));
    setFormError("");
    setEditorLoading(true);
    setIsEditorOpen(true);

    try {
      const detail = await getOperatorServiceDetail(token, item.id);
      setForm(formFromDetail(detail, owners));
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "No se pudo cargar el servicio.";
      setFormError(message);
    } finally {
      setEditorLoading(false);
    }
  };

  const onSubmitService = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token) return;
    const result = buildPayload(form, isAdmin);
    if (result.error || !result.payload) {
      setFormError(result.error ?? "Revisa los datos del servicio.");
      return;
    }

    setSaving(true);
    setFormError("");
    try {
      await saveOperatorService(token, result.payload, editingServiceId ?? undefined);
      setIsEditorOpen(false);
      setEditingServiceId(null);
      await loadData();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "No se pudo guardar el servicio.";
      setFormError(message);
    } finally {
      setSaving(false);
    }
  };

  const onDeleteService = async (item: OperatorService) => {
    if (!token) return;
    const confirmed = window.confirm(
      `Eliminar servicio "${item.nombre}"? Esta accion no se puede deshacer.`,
    );
    if (!confirmed) return;

    setError("");
    try {
      await deleteOperatorService(token, item.id);
      await loadData();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "No se pudo eliminar el servicio.";
      setError(message);
    }
  };

  const updateForm = <Key extends keyof ServiceFormState>(
    key: Key,
    value: ServiceFormState[Key],
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
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
        active="Servicios"
        title="Gestion de servicios"
        subtitle="Administra actividades destacadas, categorias y estado."
      >
        <div className="mx-auto flex w-full max-w-4xl flex-1 items-center justify-center px-4 py-16">
          <div className="w-full rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center">
            <h1 className="text-xl font-black text-rose-700">Acceso restringido</h1>
            <p className="mt-2 text-sm font-semibold text-rose-700">
              Solo usuarios con rol Operador o Admin pueden gestionar servicios.
            </p>
          </div>
        </div>
      </PanelLayout>
    );
  }

  return (
    <PanelLayout
      active="Servicios"
      title="Gestion de servicios"
      subtitle="Administra actividades destacadas, categorias y estado."
      admin={isAdmin}
    >
      <section className="mx-auto w-full max-w-7xl min-w-0 overflow-hidden">
        <div className="mb-6 grid gap-3 md:grid-cols-3">
          <article className="rounded-2xl border border-primary/10 bg-white p-4 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
              Servicios
            </p>
            <p className="mt-2 text-2xl font-black text-slate-950">
              {numberFormatter.format(stats.total)}
            </p>
          </article>
          <article className="rounded-2xl border border-primary/10 bg-white p-4 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
              Publicados
            </p>
            <p className="mt-2 text-2xl font-black text-primary">
              {numberFormatter.format(stats.published)}
            </p>
          </article>
          <article className="rounded-2xl border border-primary/10 bg-white p-4 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
              Uso en paquetes
            </p>
            <p className="mt-2 text-2xl font-black text-slate-950">
              {numberFormatter.format(stats.linkedPackages)}
            </p>
          </article>
        </div>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <h2 className="text-lg font-black text-slate-950">
                Servicios turisticos
              </h2>
              <button
                type="button"
                onClick={openCreate}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-bold text-white cursor-pointer"
              >
                <Icon name="add" className="text-lg" />
                Crear servicio
              </button>
            </div>

            <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_180px_220px]">
              <label className="relative block">
                <Icon
                  name="search"
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Buscar por nombre, tipo o responsable"
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </label>

              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value as StatusFilter)
                }
                className={inputClass}
                title="Filtrar por estado"
              >
                {statusFilters.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>

              <select
                value={typeFilter}
                onChange={(event) => setTypeFilter(event.target.value)}
                className={inputClass}
                title="Filtrar por tipo"
              >
                <option value="">Todos los tipos</option>
                {types.map((type) => (
                  <option key={type.uri} value={type.uri}>
                    {type.nombre}
                  </option>
                ))}
              </select>
            </div>

            {(search || statusFilter !== "todos" || typeFilter) && (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={resetFilters}
                  className="text-sm font-bold text-primary hover:underline"
                >
                  Limpiar filtros
                </button>
              </div>
            )}

            {error ? (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
                {error}
              </div>
            ) : null}

            <div className="hidden overflow-x-auto lg:block">
              <table className="min-w-full text-left text-sm text-slate-700">
                <thead className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-3 py-3 font-black">Servicio</th>
                    <th className="px-3 py-3 font-black">Tipo</th>
                    <th className="px-3 py-3 font-black">Responsable</th>
                    <th className="px-3 py-3 font-black">Estado</th>
                    <th className="px-3 py-3 font-black text-center">Uso</th>
                    <th className="px-3 py-3 font-black text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {isLoading ? (
                    <tr>
                      <td colSpan={6} className="px-3 py-8 text-center text-sm font-semibold text-slate-500">
                        Cargando servicios...
                      </td>
                    </tr>
                  ) : null}
                  {!isLoading && paginatedServices.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-3 py-8 text-center text-sm font-semibold text-slate-500">
                        No hay servicios para los filtros actuales.
                      </td>
                    </tr>
                  ) : null}
                  {!isLoading
                    ? paginatedServices.map((item) => {
                        const status = normalizeStatus(item.estado_publicacion);
                        return (
                          <tr key={item.id}>
                            <td className="px-3 py-3 align-top">
                              <p className="font-black text-slate-900">{item.nombre}</p>
                              <p className="mt-1 line-clamp-2 max-w-md text-xs font-semibold text-slate-500">
                                {item.descripcion}
                              </p>
                            </td>
                            <td className="px-3 py-3 align-top text-xs font-semibold text-slate-600">
                              {item.tipo_nombre ?? "Sin categoria"}
                            </td>
                            <td className="px-3 py-3 align-top text-xs font-semibold text-slate-600">
                              {item.agencia_nombre ?? "Sin responsable"}
                            </td>
                            <td className="px-3 py-3 align-top">
                              <ServiceStatusBadge status={status} />
                            </td>
                            <td className="px-3 py-3 align-top text-center text-xs font-bold text-slate-700">
                              {item.paquetes_vinculados ?? 0}
                            </td>
                            <td className="px-3 py-3 align-top">
                              <div className="flex justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => openEdit(item)}
                                  className="inline-flex h-9 items-center gap-1 rounded-lg border border-slate-200 px-3 text-xs font-bold text-slate-700 cursor-pointer"
                                >
                                  <Icon name="edit" className="text-sm" />
                                  Editar
                                </button>
                                <button
                                  type="button"
                                  onClick={() => onDeleteService(item)}
                                  className="inline-flex h-9 items-center gap-1 rounded-lg border border-rose-200 px-3 text-xs font-bold text-rose-700 cursor-pointer"
                                >
                                  <Icon name="delete" className="text-sm" />
                                  Eliminar
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    : null}
                </tbody>
              </table>
            </div>

            <div className="space-y-3 lg:hidden">
              {isLoading ? (
                <div className="rounded-xl border border-slate-200 p-4 text-sm font-semibold text-slate-500">
                  Cargando servicios...
                </div>
              ) : null}
              {!isLoading && paginatedServices.length === 0 ? (
                <div className="rounded-xl border border-slate-200 p-4 text-sm font-semibold text-slate-500">
                  No hay servicios para los filtros actuales.
                </div>
              ) : null}
              {!isLoading
                ? paginatedServices.map((item) => {
                    const status = normalizeStatus(item.estado_publicacion);
                    return (
                      <article
                        key={item.id}
                        className="rounded-xl border border-slate-200 bg-white p-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <h3 className="text-sm font-black text-slate-900">{item.nombre}</h3>
                          <ServiceStatusBadge status={status} />
                        </div>
                        <p className="mt-2 text-xs font-semibold text-slate-500">
                          {item.tipo_nombre ?? "Sin categoria"}
                          {" - "}
                          {item.agencia_nombre ?? "Sin responsable"}
                        </p>
                        <p className="mt-2 line-clamp-3 text-xs text-slate-600">
                          {item.descripcion}
                        </p>
                        <p className="mt-2 text-xs font-bold text-slate-500">
                          Uso en paquetes: {item.paquetes_vinculados ?? 0}
                        </p>
                        <div className="mt-3 flex gap-2">
                          <button
                            type="button"
                            onClick={() => openEdit(item)}
                            className="inline-flex h-9 items-center gap-1 rounded-lg border border-slate-200 px-3 text-xs font-bold text-slate-700 cursor-pointer"
                          >
                            <Icon name="edit" className="text-sm" />
                            Editar
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteService(item)}
                            className="inline-flex h-9 items-center gap-1 rounded-lg border border-rose-200 px-3 text-xs font-bold text-rose-700 cursor-pointer"
                          >
                            <Icon name="delete" className="text-sm" />
                            Eliminar
                          </button>
                        </div>
                      </article>
                    );
                  })
                : null}
            </div>

            <PaginationControls
              page={safePage}
              pageSize={pageSize}
              totalItems={visibleServices.length}
              onPageChange={setPage}
              onPageSizeChange={(value) => {
                setPageSize(value);
                setPage(1);
              }}
            />
          </div>
        </section>
      </section>

      {isEditorOpen ? (
        <div className="fixed inset-0 z-[70] flex items-center justify-center overflow-y-auto bg-slate-950/45 p-4">
          <form
            onSubmit={onSubmitService}
            className="max-h-[calc(100vh-2rem)] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-5 shadow-xl"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-black text-slate-950">
                  {editingServiceId ? "Editar servicio" : "Crear servicio"}
                </h2>
                <p className="mt-1 text-sm font-semibold text-slate-500">
                  {editingServiceId
                    ? extractPlanSlug(editingServiceId)
                    : "Nuevo registro"}
                </p>
              </div>
              <button
                type="button"
                onClick={closeEditor}
                className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 cursor-pointer"
              >
                Cerrar
              </button>
            </div>

            {formError ? (
              <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
                {formError}
              </div>
            ) : null}

            <fieldset
              disabled={editorLoading || saving}
              className="mt-5 grid gap-4 md:grid-cols-2"
            >
              <label className="space-y-1.5 text-sm font-bold text-slate-700">
                <span>Nombre</span>
                <input
                  value={form.nombre}
                  onChange={(event) => updateForm("nombre", event.target.value)}
                  className={inputClass}
                  placeholder="Nombre del servicio"
                />
              </label>

              <label className="space-y-1.5 text-sm font-bold text-slate-700">
                <span>Estado</span>
                <select
                  value={form.estado_publicacion}
                  onChange={(event) =>
                    updateForm(
                      "estado_publicacion",
                      event.target.value as ServiceStatus,
                    )
                  }
                  className={inputClass}
                  title="Estado de publicacion"
                >
                  <option value="publicado">Publicado</option>
                  <option value="borrador">Borrador</option>
                  <option value="pausado">Pausado</option>
                </select>
              </label>

              {isAdmin ? (
                <label className="space-y-1.5 text-sm font-bold text-slate-700">
                  <span>Agencia o prestador</span>
                  <select
                    value={form.agencia_uri}
                    onChange={(event) =>
                      updateForm("agencia_uri", event.target.value)
                    }
                    className={inputClass}
                    title="Responsable del servicio"
                  >
                    <option value="">Seleccionar responsable</option>
                    {owners.map((owner) => (
                      <option key={owner.uri} value={owner.uri}>
                        {owner.nombre}
                      </option>
                    ))}
                  </select>
                </label>
              ) : null}

              <label className="space-y-1.5 text-sm font-bold text-slate-700">
                <span>Categoria</span>
                <select
                  value={form.tipo_uri}
                  onChange={(event) => updateForm("tipo_uri", event.target.value)}
                  className={inputClass}
                  title="Tipo de servicio"
                >
                  <option value="">Sin categoria</option>
                  {types.map((type) => (
                    <option key={type.uri} value={type.uri}>
                      {type.nombre}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-1.5 text-sm font-bold text-slate-700 md:col-span-2">
                <span>URL de imagen</span>
                <input
                  value={form.url_imagen}
                  onChange={(event) => updateForm("url_imagen", event.target.value)}
                  className={inputClass}
                  placeholder="https://..."
                />
              </label>

              <label className="space-y-1.5 text-sm font-bold text-slate-700 md:col-span-2">
                <span>Descripcion</span>
                <textarea
                  value={form.descripcion}
                  onChange={(event) =>
                    updateForm("descripcion", event.target.value)
                  }
                  className={textareaClass}
                  placeholder="Describe la actividad, alcance, condiciones y valor para el turista"
                />
              </label>
            </fieldset>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeEditor}
                disabled={saving}
                className="h-11 rounded-xl border border-slate-200 px-5 text-sm font-bold text-slate-700 disabled:opacity-50 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={editorLoading || saving}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-bold text-white disabled:opacity-50 cursor-pointer"
              >
                {saving ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <Icon name="save" className="text-lg" />
                )}
                {saving ? "Guardando..." : "Guardar servicio"}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </PanelLayout>
  );
};

export default OperatorServicesTemplate;
