"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PanelLayout } from "@/components/features/missing-views/templates";
import Icon from "@/components/shared/atoms/Icon";
import PaginationControls from "@/components/shared/organisms/PaginationControls";
import { useAuth } from "@/context/AuthContext";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { isAdminRole, isOperatorOrAdminRole } from "@/lib/roles";
import {
  getPackageServices,
  getOperatorPackageDetail,
  getOperatorPackages,
  getPackageOwners,
  saveOperatorPackage,
} from "@/services/operatorPackages";
import { getSiteCatalog } from "@/services/siteCatalog";
import {
  type OperatorPackage,
  type OperatorPackageDetail,
  type OperatorPackageWrite,
  type PackageOwner,
  type PackageServiceCatalogItem,
} from "@/types/operatorPackages";
import { type SiteCatalogItem } from "@/types/siteCatalog";
import { extractPlanSlug } from "@/utils/planId";

type PackageStatus = "publicado" | "borrador" | "pausado";
type StatusFilter = "todos" | PackageStatus;

type PackageFormState = {
  nombre: string;
  descripcion: string;
  precio: string;
  duracion_dias: string;
  dificultad: string;
  capacidad_max_personas: string;
  incluye_descripcion: string;
  no_incluye: string;
  image_urls: string[];
  estado_publicacion: PackageStatus;
  destino_ids: string[];
  servicio_ids: string[];
  itinerarios: ItineraryFormItem[];
  agencia_uri: string;
};

type ItineraryFormItem = {
  id: string;
  titulo: string;
  descripcion: string;
};

type ImageDraftFile = {
  id: string;
  file: File;
  previewUrl: string;
};

type BlobUploadResult = {
  url: string;
  error?: string;
};

const MAX_PACKAGE_IMAGES = 6;
const MAX_PACKAGE_DESTINATIONS = 6;
const MAX_PACKAGE_SERVICES = 20;
const MAX_PACKAGE_ITINERARIES = 20;
const MAX_IMAGE_SIZE = 4 * 1024 * 1024;

const statusFilters: Array<{ value: StatusFilter; label: string }> = [
  { value: "todos", label: "Todos" },
  { value: "publicado", label: "Publicados" },
  { value: "borrador", label: "Borradores" },
  { value: "pausado", label: "Pausados" },
];

const difficultyOptions = ["Facil", "Moderado", "Dificil", "Extremo"];

const moneyFormatter = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

const numberFormatter = new Intl.NumberFormat("es-CO");

const normalizeText = (value: string | null | undefined) =>
  (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();

const normalizeStatus = (value: string | null | undefined): PackageStatus => {
  const text = normalizeText(value);
  if (text.includes("borr") || text.includes("pend")) return "borrador";
  if (text.includes("paus") || text.includes("inactiv")) return "pausado";
  return "publicado";
};

const statusLabel: Record<PackageStatus, string> = {
  publicado: "Publicado",
  borrador: "Borrador",
  pausado: "Pausado",
};

const statusClass: Record<PackageStatus, string> = {
  publicado: "bg-emerald-100 text-emerald-700",
  borrador: "bg-amber-100 text-amber-700",
  pausado: "bg-slate-200 text-slate-700",
};

const splitValues = (value: string | null | undefined) =>
  (value ?? "")
    .split("|")
    .map((item) => item.trim())
    .filter(Boolean);

const splitImageUrls = (value: string | null | undefined) =>
  (value ?? "")
    .split(/[|,]/)
    .map((item) => item.trim())
    .filter(Boolean);

const uniqueStrings = (values: Array<string | null | undefined>) => {
  const seen = new Set<string>();
  return values.filter((value): value is string => {
    const clean = (value ?? "").trim();
    if (!clean || seen.has(clean)) return false;
    seen.add(clean);
    return true;
  });
};

const formatBytes = (bytes: number) => {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB"];
  const index = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1,
  );
  return `${(bytes / 1024 ** index).toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
};

const createDraftFileId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const createEmptyItinerary = (index = 1): ItineraryFormItem => ({
  id: createDraftFileId(),
  titulo: `Dia ${index}`,
  descripcion: "",
});

const normalizeItineraries = (
  itineraries: OperatorPackageDetail["itinerarios"],
) => {
  const rows =
    itineraries
      ?.map((item, index) => ({
        id: item.id ?? createDraftFileId(),
        titulo: item.titulo?.trim() || `Dia ${index + 1}`,
        descripcion: item.descripcion?.trim() ?? "",
      }))
      .filter((item) => item.titulo || item.descripcion) ?? [];

  return rows.length > 0 ? rows : [createEmptyItinerary()];
};

const withImageUrls = (
  payload: OperatorPackageWrite,
  imageUrls: string[],
): OperatorPackageWrite => ({
  ...payload,
  url_imagen: imageUrls[0] ?? null,
  galeria_imagenes: imageUrls.length > 0 ? imageUrls.join("|") : null,
});

const uploadPackageImages = async (
  files: ImageDraftFile[],
  packageId: string,
  hasExistingMainImage: boolean,
) => {
  const uploadedUrls: string[] = [];

  for (const [index, draft] of files.entries()) {
    const formData = new FormData();
    const isMainImage = !hasExistingMainImage && index === 0;
    formData.set("file", draft.file);
    formData.set("entityType", "paquetes");
    formData.set("individualId", extractPlanSlug(packageId));
    formData.set("property", isMainImage ? "urlImagen" : "galeriaImagenes");
    formData.set(
      "imageRole",
      isMainImage ? "principal" : `galeria-${index + 1}`,
    );

    const response = await fetch("/api/blob/upload", {
      method: "POST",
      body: formData,
    });
    const payload = (await response.json()) as BlobUploadResult;

    if (!response.ok) {
      throw new Error(payload.error ?? "No se pudo subir una imagen.");
    }

    uploadedUrls.push(payload.url);
  }

  return uploadedUrls;
};

const emptyForm = (ownerUri = ""): PackageFormState => ({
  nombre: "",
  descripcion: "",
  precio: "",
  duracion_dias: "1",
  dificultad: "Moderado",
  capacidad_max_personas: "1",
  incluye_descripcion: "",
  no_incluye: "",
  image_urls: [],
  estado_publicacion: "publicado",
  destino_ids: [],
  servicio_ids: [],
  itinerarios: [createEmptyItinerary()],
  agencia_uri: ownerUri,
});

const formFromDetail = (
  detail: OperatorPackageDetail,
  owners: PackageOwner[],
): PackageFormState => ({
  nombre: detail.nombre ?? "",
  descripcion: detail.descripcion ?? "",
  precio: String(Math.round(detail.precio ?? 0)),
  duracion_dias: detail.duracion_dias ? String(detail.duracion_dias) : "1",
  dificultad: detail.dificultad ?? "Moderado",
  capacidad_max_personas: detail.capacidad_max_personas
    ? String(detail.capacidad_max_personas)
    : "1",
  incluye_descripcion: detail.incluye_descripcion ?? "",
  no_incluye: detail.no_incluye ?? "",
  image_urls: uniqueStrings([
    detail.url_imagen,
    ...splitImageUrls(detail.galeria_imagenes),
  ]),
  estado_publicacion: normalizeStatus(detail.estado_publicacion),
  destino_ids:
    detail.destinos
      ?.map((destino) => destino.id)
      .filter((id): id is string => Boolean(id)) ?? [],
  servicio_ids:
    detail.servicios
      ?.map((servicio) => servicio.id)
      .filter((id): id is string => Boolean(id)) ?? [],
  itinerarios: normalizeItineraries(detail.itinerarios),
  agencia_uri: detail.agencia_uri ?? owners[0]?.uri ?? "",
});

const parsePositiveNumber = (value: string) => Number(value.replace(",", "."));

const toNullableText = (value: string) => {
  const clean = value.trim();
  return clean ? clean : null;
};

const buildPayload = (
  form: PackageFormState,
  isAdmin: boolean,
): { payload?: OperatorPackageWrite; error?: string } => {
  const nombre = form.nombre.trim();
  const descripcion = form.descripcion.trim();
  const precio = parsePositiveNumber(form.precio);
  const duracion = parsePositiveNumber(form.duracion_dias);
  const capacidad = parsePositiveNumber(form.capacidad_max_personas);
  const itinerarios = form.itinerarios
    .map((item) => ({
      titulo: item.titulo.trim(),
      descripcion: toNullableText(item.descripcion),
    }))
    .filter((item) => item.titulo || item.descripcion);

  if (nombre.length < 3) {
    return { error: "El nombre debe tener minimo 3 caracteres." };
  }

  if (descripcion.length < 10) {
    return { error: "La descripcion debe tener minimo 10 caracteres." };
  }

  if (!Number.isFinite(precio) || precio <= 0) {
    return { error: "El precio debe ser mayor a cero." };
  }

  if (!Number.isInteger(duracion) || duracion < 1 || duracion > 60) {
    return { error: "La duracion debe estar entre 1 y 60 dias." };
  }

  if (!Number.isInteger(capacidad) || capacidad < 1 || capacidad > 500) {
    return { error: "La capacidad debe estar entre 1 y 500 personas." };
  }

  if (form.destino_ids.length === 0) {
    return { error: "Selecciona al menos un destino." };
  }

  if (isAdmin && !form.agencia_uri) {
    return { error: "Selecciona una agencia o prestador responsable." };
  }

  if (itinerarios.length === 0) {
    return { error: "Agrega al menos una etapa del itinerario." };
  }

  if (itinerarios.some((item) => item.titulo.length === 0)) {
    return { error: "Cada etapa del itinerario debe tener titulo." };
  }

  return {
    payload: withImageUrls(
      {
        nombre,
        descripcion,
        precio,
        duracion_dias: duracion,
        dificultad: form.dificultad || "Moderado",
        capacidad_max_personas: capacidad,
        incluye_descripcion: toNullableText(form.incluye_descripcion),
        no_incluye: toNullableText(form.no_incluye),
        url_imagen: null,
        galeria_imagenes: null,
        estado_publicacion: form.estado_publicacion,
        destino_ids: form.destino_ids,
        servicio_ids: form.servicio_ids,
        itinerarios,
        agencia_uri: isAdmin ? form.agencia_uri : null,
      },
      form.image_urls,
    ),
  };
};

const PackageStatusBadge = ({ status }: { status: PackageStatus }) => (
  <span
    className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ${statusClass[status]}`}
  >
    {statusLabel[status]}
  </span>
);

const Field = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <label className="space-y-1.5 text-sm font-bold text-slate-700">
    <span>{label}</span>
    {children}
  </label>
);

const inputClass =
  "h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:bg-slate-50 disabled:text-slate-400";

const textareaClass =
  "min-h-28 w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:bg-slate-50 disabled:text-slate-400";

const packageMatches = (item: OperatorPackage, query: string) => {
  const text = normalizeText(query);
  if (!text) return true;

  const searchable = [
    item.nombre,
    item.descripcion,
    item.destinos,
    item.municipios,
    item.categorias,
    item.agencia_nombre,
    extractPlanSlug(item.id),
  ]
    .join(" ")
    .toLowerCase();

  return normalizeText(searchable).includes(text);
};

const OperatorPackagesTemplate: React.FC = () => {
  const { token, loading, user } = useAuth();
  const router = useRouter();
  const [packages, setPackages] = React.useState<OperatorPackage[]>([]);
  const [owners, setOwners] = React.useState<PackageOwner[]>([]);
  const [sites, setSites] = React.useState<SiteCatalogItem[]>([]);
  const [services, setServices] = React.useState<PackageServiceCatalogItem[]>([]);
  const [error, setError] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<StatusFilter>("todos");
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);
  const [isEditorOpen, setIsEditorOpen] = React.useState(false);
  const [editingPackageId, setEditingPackageId] = React.useState<string | null>(
    null,
  );
  const [editorLoading, setEditorLoading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [savePhase, setSavePhase] = React.useState<
    "idle" | "saving" | "uploading"
  >("idle");
  const [formError, setFormError] = React.useState("");
  const [form, setForm] = React.useState<PackageFormState>(() => emptyForm());
  const [imageFiles, setImageFiles] = React.useState<ImageDraftFile[]>([]);
  const debouncedSearch = useDebouncedValue(search, 250);

  const canOperate = React.useMemo(
    () => isOperatorOrAdminRole(user?.rol),
    [user?.rol],
  );
  const isAdmin = React.useMemo(() => isAdminRole(user?.rol), [user?.rol]);
  const siteById = React.useMemo(
    () => new Map(sites.map((site) => [site.id, site])),
    [sites],
  );
  const selectedDestinations = React.useMemo(
    () =>
      form.destino_ids.map((id) => ({
        id,
        label: siteById.get(id)?.name ?? extractPlanSlug(id),
        municipality: siteById.get(id)?.municipality,
      })),
    [form.destino_ids, siteById],
  );
  const serviceById = React.useMemo(
    () => new Map(services.map((service) => [service.id, service])),
    [services],
  );
  const selectedServices = React.useMemo(
    () =>
      form.servicio_ids.map((id) => ({
        id,
        label: serviceById.get(id)?.nombre ?? extractPlanSlug(id),
        type: serviceById.get(id)?.tipo,
      })),
    [form.servicio_ids, serviceById],
  );
  const availableImageSlots = Math.max(
    0,
    MAX_PACKAGE_IMAGES - form.image_urls.length - imageFiles.length,
  );
  const saveButtonLabel = saving
    ? savePhase === "uploading"
      ? "Subiendo imagenes..."
      : "Guardando..."
    : "Guardar paquete";

  const loadData = React.useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    setError("");
    try {
      const [packageRows, ownerRows, siteRows, serviceRows] = await Promise.all([
        getOperatorPackages(token),
        getPackageOwners(token),
        getSiteCatalog(),
        getPackageServices(token),
      ]);
      setPackages(packageRows);
      setOwners(ownerRows);
      setSites(siteRows);
      setServices(serviceRows);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "No se pudieron cargar los paquetes.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  React.useEffect(() => {
    if (!loading && !token) {
      router.push("/login");
      return;
    }

    if (token && canOperate) {
      loadData().catch(() => setError("No se pudieron cargar los paquetes."));
    }
  }, [canOperate, loadData, loading, router, token]);

  React.useEffect(() => {
    setPage(1);
  }, [debouncedSearch, statusFilter]);

  React.useEffect(() => {
    if (page < 1) setPage(1);
  }, [page]);

  React.useEffect(() => {
    if (!isEditorOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isEditorOpen]);

  const visiblePackages = React.useMemo(() => {
    return packages
      .filter((item) => {
        const status = normalizeStatus(item.estado_publicacion);
        return statusFilter === "todos" || status === statusFilter;
      })
      .filter((item) => packageMatches(item, debouncedSearch))
      .sort((a, b) => a.nombre.localeCompare(b.nombre));
  }, [debouncedSearch, packages, statusFilter]);

  const stats = React.useMemo(() => {
    const total = packages.length;
    const published = packages.filter(
      (item) => normalizeStatus(item.estado_publicacion) === "publicado",
    ).length;
    const capacity = packages.reduce(
      (sum, item) => sum + (item.capacidad_max_personas ?? 0),
      0,
    );
    const averagePrice =
      total > 0
        ? packages.reduce((sum, item) => sum + item.precio, 0) / total
        : 0;

    return { total, published, capacity, averagePrice };
  }, [packages]);

  const totalPages = Math.max(1, Math.ceil(visiblePackages.length / pageSize));
  const safePage = Math.min(Math.max(page, 1), totalPages);
  const paginatedPackages = React.useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return visiblePackages.slice(start, start + pageSize);
  }, [pageSize, safePage, visiblePackages]);

  React.useEffect(() => {
    if (page !== safePage) setPage(safePage);
  }, [page, safePage]);

  const resetFilters = () => {
    setSearch("");
    setStatusFilter("todos");
    setPage(1);
  };

  const clearImageFiles = React.useCallback(() => {
    setImageFiles((current) => {
      current.forEach((item) => URL.revokeObjectURL(item.previewUrl));
      return [];
    });
  }, []);

  const closeEditor = React.useCallback(() => {
    if (saving) return;
    setIsEditorOpen(false);
    setEditingPackageId(null);
    setEditorLoading(false);
    setFormError("");
    setSavePhase("idle");
    clearImageFiles();
  }, [clearImageFiles, saving]);

  const openCreate = () => {
    clearImageFiles();
    setEditingPackageId(null);
    setForm(emptyForm(owners[0]?.uri ?? ""));
    setFormError("");
    setSavePhase("idle");
    setEditorLoading(false);
    setIsEditorOpen(true);
  };

  const openEdit = async (item: OperatorPackage) => {
    if (!token) return;
    clearImageFiles();
    setEditingPackageId(item.id);
    setForm(emptyForm(item.agencia_uri ?? owners[0]?.uri ?? ""));
    setFormError("");
    setSavePhase("idle");
    setEditorLoading(true);
    setIsEditorOpen(true);

    try {
      const detail = await getOperatorPackageDetail(token, item.id);
      setForm(formFromDetail(detail, owners));
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "No se pudo cargar el paquete.";
      setFormError(message);
    } finally {
      setEditorLoading(false);
    }
  };

  const onSubmitPackage = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token) return;

    const result = buildPayload(form, isAdmin);
    if (result.error || !result.payload) {
      setFormError(result.error ?? "Revisa los datos del paquete.");
      return;
    }

    setSaving(true);
    setSavePhase("saving");
    setFormError("");
    try {
      let payload = result.payload;
      let targetPackageId = editingPackageId;

      if (!targetPackageId && imageFiles.length > 0) {
        const created = await saveOperatorPackage(token, payload);
        targetPackageId = created.id;
        setEditingPackageId(created.id);
      }

      if (imageFiles.length > 0) {
        if (!targetPackageId) {
          throw new Error(
            "No se pudo resolver el ID del paquete para subir imagenes.",
          );
        }

        setSavePhase("uploading");
        const uploadedUrls = await uploadPackageImages(
          imageFiles,
          targetPackageId,
          form.image_urls.length > 0,
        );
        payload = withImageUrls(
          payload,
          uniqueStrings([...form.image_urls, ...uploadedUrls]),
        );
        setSavePhase("saving");
      }

      await saveOperatorPackage(token, payload, targetPackageId ?? undefined);
      setIsEditorOpen(false);
      setEditingPackageId(null);
      clearImageFiles();
      await loadData();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "No se pudo guardar el paquete.";
      setFormError(message);
    } finally {
      setSaving(false);
      setSavePhase("idle");
    }
  };

  const updateForm = <Key extends keyof PackageFormState>(
    key: Key,
    value: PackageFormState[Key],
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const addDestination = (destinationId: string) => {
    if (!destinationId) return;
    if (form.destino_ids.length >= MAX_PACKAGE_DESTINATIONS) {
      setFormError(
        `Solo puedes asociar hasta ${MAX_PACKAGE_DESTINATIONS} destinos.`,
      );
      return;
    }
    setForm((prev) => {
      if (prev.destino_ids.includes(destinationId)) return prev;
      return { ...prev, destino_ids: [...prev.destino_ids, destinationId] };
    });
  };

  const removeDestination = (destinationId: string) => {
    setForm((prev) => ({
      ...prev,
      destino_ids: prev.destino_ids.filter((id) => id !== destinationId),
    }));
  };

  const addService = (serviceId: string) => {
    if (!serviceId) return;
    if (form.servicio_ids.length >= MAX_PACKAGE_SERVICES) {
      setFormError(
        `Solo puedes asociar hasta ${MAX_PACKAGE_SERVICES} actividades.`,
      );
      return;
    }
    setForm((prev) => {
      if (prev.servicio_ids.includes(serviceId)) return prev;
      return { ...prev, servicio_ids: [...prev.servicio_ids, serviceId] };
    });
  };

  const removeService = (serviceId: string) => {
    setForm((prev) => ({
      ...prev,
      servicio_ids: prev.servicio_ids.filter((id) => id !== serviceId),
    }));
  };

  const removeImageUrl = (imageUrl: string) => {
    setForm((prev) => ({
      ...prev,
      image_urls: prev.image_urls.filter((url) => url !== imageUrl),
    }));
  };

  const onImageFilesChange = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setFormError("");
    const availableSlots =
      MAX_PACKAGE_IMAGES - form.image_urls.length - imageFiles.length;

    if (availableSlots <= 0) {
      setFormError(`Solo puedes asociar hasta ${MAX_PACKAGE_IMAGES} imagenes.`);
      return;
    }

    const accepted: ImageDraftFile[] = [];
    for (const file of Array.from(files).slice(0, availableSlots)) {
      if (!file.type.startsWith("image/")) {
        setFormError("Solo se permiten archivos de imagen.");
        continue;
      }
      if (file.size > MAX_IMAGE_SIZE) {
        setFormError("Cada imagen debe pesar maximo 4 MB.");
        continue;
      }
      accepted.push({
        id: `${file.name}-${file.lastModified}-${createDraftFileId()}`,
        file,
        previewUrl: URL.createObjectURL(file),
      });
    }

    if (accepted.length === 0) return;
    setImageFiles((prev) => [...prev, ...accepted]);
  };

  const removeImageFile = (fileId: string) => {
    setImageFiles((prev) => {
      const target = prev.find((item) => item.id === fileId);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((item) => item.id !== fileId);
    });
  };

  const addItinerary = () => {
    if (form.itinerarios.length >= MAX_PACKAGE_ITINERARIES) {
      setFormError(
        `Solo puedes agregar hasta ${MAX_PACKAGE_ITINERARIES} etapas.`,
      );
      return;
    }

    setForm((prev) => ({
      ...prev,
      itinerarios: [
        ...prev.itinerarios,
        createEmptyItinerary(prev.itinerarios.length + 1),
      ],
    }));
  };

  const updateItinerary = (
    itemId: string,
    field: "titulo" | "descripcion",
    value: string,
  ) => {
    setForm((prev) => ({
      ...prev,
      itinerarios: prev.itinerarios.map((item) =>
        item.id === itemId ? { ...item, [field]: value } : item,
      ),
    }));
  };

  const removeItinerary = (itemId: string) => {
    setForm((prev) => ({
      ...prev,
      itinerarios:
        prev.itinerarios.length > 1
          ? prev.itinerarios.filter((item) => item.id !== itemId)
          : prev.itinerarios,
    }));
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
        active="Paquetes"
        title="Gestion de paquetes"
        subtitle="Administra publicaciones, precios, cupos y disponibilidad."
      >
        <div className="mx-auto flex w-full max-w-4xl flex-1 items-center justify-center px-4 py-16">
          <div className="w-full rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center">
            <h1 className="text-xl font-black text-rose-700">
              Acceso restringido
            </h1>
            <p className="mt-2 text-sm font-semibold text-rose-700">
              Solo usuarios con rol Operador o Admin pueden gestionar paquetes.
            </p>
          </div>
        </div>
      </PanelLayout>
    );
  }

  return (
    <PanelLayout
      active="Paquetes"
      title="Gestion de paquetes"
      subtitle="Administra publicaciones, precios, cupos y disponibilidad."
      admin={isAdmin}
    >
      <section className="mx-auto w-full max-w-7xl min-w-0 overflow-hidden">
        <div className="mb-6 grid gap-3 md:grid-cols-4">
          <article className="rounded-2xl border border-primary/10 bg-white p-4 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
              Paquetes
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
              Cupos maximos
            </p>
            <p className="mt-2 text-2xl font-black text-slate-950">
              {numberFormatter.format(stats.capacity)}
            </p>
          </article>
          <article className="rounded-2xl border border-primary/10 bg-white p-4 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
              Precio promedio
            </p>
            <p className="mt-2 text-2xl font-black text-slate-950">
              {moneyFormatter.format(stats.averagePrice)}
            </p>
          </article>
        </div>

        <div className="mb-6 rounded-2xl border border-primary/10 bg-white p-4">
          <div className="flex min-w-0 flex-col gap-4 2xl:flex-row 2xl:items-center 2xl:justify-between">
            <div className="grid min-w-0 gap-3 sm:grid-cols-[minmax(0,1fr)_auto] 2xl:min-w-[520px]">
              <div className="relative">
                <Icon
                  name="search"
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-base text-slate-400"
                />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Buscar por paquete, destino, municipio o agencia"
                  className="h-11 w-full rounded-xl border border-slate-200 pl-10 pr-3 text-sm font-semibold text-slate-700 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  title="Buscar paquetes"
                />
              </div>
              <button
                type="button"
                onClick={resetFilters}
                className="h-11 rounded-xl border border-slate-200 px-4 text-sm font-bold text-slate-700 cursor-pointer"
              >
                Limpiar
              </button>
            </div>

            <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between 2xl:justify-end">
              <div className="flex max-w-full gap-2 overflow-x-auto pb-1 sm:pb-0">
                {statusFilters.map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setStatusFilter(item.value)}
                    className={`h-10 shrink-0 rounded-full px-4 text-sm font-bold transition cursor-pointer ${
                      item.value === statusFilter
                        ? "bg-primary text-white"
                        : "bg-slate-50 text-slate-600 ring-1 ring-slate-200 hover:text-primary"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={openCreate}
                className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-bold text-white shadow-sm cursor-pointer"
              >
                <Icon name="add" className="text-lg" />
                Crear paquete
              </button>
            </div>
          </div>
        </div>

        {error ? (
          <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
            {error}
          </div>
        ) : null}

        <div className="hidden overflow-x-auto rounded-2xl border border-primary/10 bg-white lg:block">
          <table className="min-w-[960px] w-full border-collapse">
            <thead className="bg-slate-50 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Paquete</th>
                <th className="px-4 py-3">Destino</th>
                <th className="px-4 py-3">Agencia</th>
                <th className="px-4 py-3">Precio</th>
                <th className="px-4 py-3">Cupos</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary/10">
              {!isLoading && visiblePackages.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-10 text-center text-sm font-semibold text-slate-500"
                  >
                    No hay paquetes con los filtros actuales.
                  </td>
                </tr>
              ) : null}

              {isLoading ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-10 text-center text-sm font-semibold text-slate-500"
                  >
                    Cargando paquetes...
                  </td>
                </tr>
              ) : null}

              {!isLoading &&
                paginatedPackages.map((item) => {
                  const status = normalizeStatus(item.estado_publicacion);
                  const destinos = splitValues(item.destinos);
                  const municipios = splitValues(item.municipios);

                  return (
                    <tr key={item.id} className="align-top">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          {item.url_imagen ? (
                            <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-xl border border-primary/10">
                              <Image
                                src={item.url_imagen}
                                alt={`Imagen de ${item.nombre}`}
                                fill
                                sizes="80px"
                                className="object-cover"
                              />
                            </div>
                          ) : (
                            <div className="flex h-14 w-20 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                              <Icon name="landscape" />
                            </div>
                          )}
                          <div>
                            <p className="font-black text-slate-950">
                              {item.nombre}
                            </p>
                            <p className="mt-1 line-clamp-1 max-w-[260px] text-xs font-semibold text-slate-500">
                              ID: {extractPlanSlug(item.id)}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm font-semibold text-slate-700">
                        <div>{destinos[0] ?? "Sin destino"}</div>
                        <div className="text-xs text-slate-500">
                          {municipios[0] ?? "Sin municipio"}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm font-semibold text-slate-700">
                        {item.agencia_nombre ?? "Sin responsable"}
                      </td>
                      <td className="px-4 py-4 text-sm font-black text-slate-950">
                        {moneyFormatter.format(item.precio)}
                      </td>
                      <td className="px-4 py-4 text-sm font-semibold text-slate-700">
                        {item.capacidad_max_personas ?? 0}
                      </td>
                      <td className="px-4 py-4">
                        <PackageStatusBadge status={status} />
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/planes/${extractPlanSlug(item.id)}`}
                            className="inline-flex h-9 items-center justify-center rounded-full border border-slate-200 px-3 text-xs font-bold text-slate-700"
                          >
                            Ver
                          </Link>
                          <button
                            type="button"
                            onClick={() => void openEdit(item)}
                            className="inline-flex h-9 items-center justify-center rounded-full bg-primary px-3 text-xs font-bold text-white cursor-pointer"
                          >
                            Editar
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>

        <div className="grid gap-4 lg:hidden">
          {isLoading ? (
            <div className="rounded-2xl border border-primary/10 bg-white p-6 text-center text-sm font-semibold text-slate-500">
              Cargando paquetes...
            </div>
          ) : null}

          {!isLoading && visiblePackages.length === 0 ? (
            <div className="rounded-2xl border border-primary/10 bg-white p-6 text-center text-sm font-semibold text-slate-500">
              No hay paquetes con los filtros actuales.
            </div>
          ) : null}

          {!isLoading &&
            paginatedPackages.map((item) => {
              const status = normalizeStatus(item.estado_publicacion);
              const destinos = splitValues(item.destinos);
              const municipios = splitValues(item.municipios);

              return (
                <article
                  key={`card-${item.id}`}
                  className="overflow-hidden rounded-2xl border border-primary/10 bg-white shadow-sm"
                >
                  {item.url_imagen ? (
                    <div className="relative h-40 w-full">
                      <Image
                        src={item.url_imagen}
                        alt={`Imagen de ${item.nombre}`}
                        fill
                        sizes="100vw"
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="flex h-24 items-center justify-center bg-primary/10 text-primary">
                      <Icon name="landscape" className="text-3xl" />
                    </div>
                  )}
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <h2 className="text-lg font-black leading-tight text-slate-950">
                        {item.nombre}
                      </h2>
                      <PackageStatusBadge status={status} />
                    </div>
                    <div className="mt-3 grid gap-2 text-sm font-semibold text-slate-600">
                      <p>
                        {destinos[0] ?? "Sin destino"}
                        {municipios[0] ? `, ${municipios[0]}` : ""}
                      </p>
                      <p>{item.agencia_nombre ?? "Sin responsable"}</p>
                      <p className="font-black text-slate-950">
                        {moneyFormatter.format(item.precio)} ·{" "}
                        {item.capacidad_max_personas ?? 0} cupos
                      </p>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <Link
                        href={`/planes/${extractPlanSlug(item.id)}`}
                        className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 text-sm font-bold text-slate-700"
                      >
                        Ver
                      </Link>
                      <button
                        type="button"
                        onClick={() => void openEdit(item)}
                        className="inline-flex h-10 items-center justify-center rounded-xl bg-primary text-sm font-bold text-white cursor-pointer"
                      >
                        Editar
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
        </div>

        <PaginationControls
          page={safePage}
          pageSize={pageSize}
          totalItems={visiblePackages.length}
          onPageChange={setPage}
          onPageSizeChange={(nextSize) => {
            setPageSize(nextSize);
            setPage(1);
          }}
        />
      </section>

      {isEditorOpen ? (
        <div className="fixed inset-0 z-[70] flex items-center justify-center overflow-y-auto bg-slate-950/45 p-4">
          <form
            onSubmit={onSubmitPackage}
            className="max-h-[calc(100vh-2rem)] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white p-5 shadow-xl"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-black text-slate-950">
                  {editingPackageId ? "Editar paquete" : "Crear paquete"}
                </h2>
                <p className="mt-1 text-sm font-semibold text-slate-500">
                  {editingPackageId
                    ? extractPlanSlug(editingPackageId)
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
              <Field label="Nombre">
                <input
                  value={form.nombre}
                  onChange={(event) => updateForm("nombre", event.target.value)}
                  className={inputClass}
                  placeholder="Nombre del paquete"
                />
              </Field>

              <Field label="Estado">
                <select
                  value={form.estado_publicacion}
                  onChange={(event) =>
                    updateForm(
                      "estado_publicacion",
                      event.target.value as PackageStatus,
                    )
                  }
                  className={inputClass}
                  title="Estado de publicacion"
                >
                  <option value="publicado">Publicado</option>
                  <option value="borrador">Borrador</option>
                  <option value="pausado">Pausado</option>
                </select>
              </Field>

              {isAdmin ? (
                <Field label="Agencia o prestador">
                  <select
                    value={form.agencia_uri}
                    onChange={(event) =>
                      updateForm("agencia_uri", event.target.value)
                    }
                    className={inputClass}
                    title="Responsable del paquete"
                  >
                    <option value="">Seleccionar responsable</option>
                    {owners.map((owner) => (
                      <option key={owner.uri} value={owner.uri}>
                        {owner.nombre}
                      </option>
                    ))}
                  </select>
                </Field>
              ) : null}

              <div className="space-y-0.5 text-sm font-bold text-slate-700">
                <div className="flex items-center justify-between gap-3">
                  <span>Destinos del paquete</span>
                  <span className="text-xs font-bold text-slate-400">
                    {form.destino_ids.length}/{MAX_PACKAGE_DESTINATIONS}
                  </span>
                </div>
                <select
                  value=""
                  onChange={(event) => addDestination(event.target.value)}
                  className={inputClass}
                  disabled={form.destino_ids.length >= MAX_PACKAGE_DESTINATIONS}
                  title="Agregar destino"
                >
                  <option value="">Agregar destino</option>
                  {sites
                    .filter((site) => !form.destino_ids.includes(site.id))
                    .map((site) => (
                      <option key={site.id} value={site.id}>
                        {site.name}
                        {site.municipality ? ` - ${site.municipality}` : ""}
                      </option>
                    ))}
                </select>
                <div className="flex min-h-10 flex-wrap gap-2">
                  {selectedDestinations.length === 0 ? (
                    <span className="inline-flex items-center rounded-full bg-slate-50 px-3 py-2 text-xs font-bold text-slate-400 ring-1 ring-slate-200">
                      Sin destinos seleccionados
                    </span>
                  ) : null}
                  {selectedDestinations.map((destination, index) => (
                    <span
                      key={destination.id}
                      className="inline-flex max-w-full items-center gap-2 rounded-full bg-primary/10 px-3 py-2 text-xs font-bold text-primary"
                    >
                      <span className="truncate">
                        {index === 0 ? "Principal: " : ""}
                        {destination.label}
                        {destination.municipality
                          ? ` - ${destination.municipality}`
                          : ""}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeDestination(destination.id)}
                        className="shrink-0 rounded-full text-primary cursor-pointer"
                        title="Quitar destino"
                      >
                        <Icon name="close" className="text-sm" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-0.5 text-sm font-bold text-slate-700">
                <div className="flex items-center justify-between gap-3">
                  <span>Actividades destacadas</span>
                  <span className="text-xs font-bold text-slate-400">
                    {form.servicio_ids.length}/{MAX_PACKAGE_SERVICES}
                  </span>
                </div>
                <select
                  value=""
                  onChange={(event) => addService(event.target.value)}
                  className={inputClass}
                  disabled={form.servicio_ids.length >= MAX_PACKAGE_SERVICES}
                  title="Agregar actividad"
                >
                  <option value="">Agregar actividad</option>
                  {services
                    .filter((service) => !form.servicio_ids.includes(service.id))
                    .map((service) => (
                      <option key={service.id} value={service.id}>
                        {service.nombre}
                        {service.tipo ? ` - ${service.tipo}` : ""}
                      </option>
                    ))}
                </select>
                <div className="flex min-h-10 flex-wrap gap-2">
                  {selectedServices.length === 0 ? (
                    <span className="inline-flex items-center rounded-full bg-slate-50 px-3 py-2 text-xs font-bold text-slate-400 ring-1 ring-slate-200">
                      Sin actividades seleccionadas
                    </span>
                  ) : null}
                  {selectedServices.map((service) => (
                    <span
                      key={service.id}
                      className="inline-flex max-w-full items-center gap-2 rounded-full bg-primary/10 px-3 py-2 text-xs font-bold text-primary"
                    >
                      <span className="truncate">
                        {service.label}
                        {service.type ? ` - ${service.type}` : ""}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeService(service.id)}
                        className="shrink-0 rounded-full text-primary cursor-pointer"
                        title="Quitar actividad"
                      >
                        <Icon name="close" className="text-sm" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <Field label="Precio por persona">
                <input
                  type="number"
                  min="1"
                  value={form.precio}
                  onChange={(event) => updateForm("precio", event.target.value)}
                  className={inputClass}
                  placeholder="0"
                />
              </Field>

              <Field label="Duracion en dias">
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={form.duracion_dias}
                  onChange={(event) =>
                    updateForm("duracion_dias", event.target.value)
                  }
                  className={inputClass}
                  placeholder="1"
                />
              </Field>

              <Field label="Capacidad maxima">
                <input
                  type="number"
                  min="1"
                  max="500"
                  value={form.capacidad_max_personas}
                  onChange={(event) =>
                    updateForm("capacidad_max_personas", event.target.value)
                  }
                  className={inputClass}
                  placeholder="1"
                />
              </Field>

              <Field label="Dificultad">
                <select
                  value={form.dificultad}
                  onChange={(event) =>
                    updateForm("dificultad", event.target.value)
                  }
                  className={inputClass}
                  title="Dificultad"
                >
                  {difficultyOptions.map((difficulty) => (
                    <option key={difficulty} value={difficulty}>
                      {difficulty}
                    </option>
                  ))}
                </select>
              </Field>

              <div className="space-y-3 md:col-span-2">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-bold text-slate-700">
                      Imagenes del paquete
                    </p>
                    <p className="text-xs font-semibold text-slate-500">
                      La primera imagen sera la principal.
                    </p>
                  </div>
                  <span className="text-xs font-bold text-slate-400">
                    {form.image_urls.length + imageFiles.length}/
                    {MAX_PACKAGE_IMAGES}
                  </span>
                </div>

                <label
                  className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed px-5 py-8 text-center transition ${
                    availableImageSlots > 0
                      ? "border-slate-300 bg-slate-50 hover:border-primary/60 hover:bg-primary/5"
                      : "border-slate-200 bg-slate-50 opacity-60"
                  }`}
                >
                  <Icon
                    name="add_photo_alternate"
                    className="text-4xl text-primary"
                  />
                  <span className="mt-3 text-sm font-black text-slate-900">
                    Seleccionar imagenes
                  </span>
                  <span className="mt-1 text-xs font-bold text-slate-400">
                    PNG, JPG, WebP o GIF - maximo 4 MB
                  </span>
                  <input
                    accept="image/*"
                    className="sr-only"
                    disabled={availableImageSlots <= 0}
                    multiple
                    onChange={(event) => {
                      onImageFilesChange(event.target.files);
                      event.currentTarget.value = "";
                    }}
                    type="file"
                  />
                </label>

                {form.image_urls.length > 0 || imageFiles.length > 0 ? (
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {form.image_urls.map((imageUrl, index) => (
                      <div
                        key={imageUrl}
                        className="overflow-hidden rounded-2xl border border-slate-200 bg-white"
                      >
                        <div
                          className="h-32 bg-slate-100 bg-cover bg-center"
                          style={{ backgroundImage: `url("${imageUrl}")` }}
                        />
                        <div className="flex items-center justify-between gap-2 p-3">
                          <div className="min-w-0">
                            <p className="text-xs font-black text-slate-900">
                              {index === 0 ? "Principal" : "Galeria"}
                            </p>
                            <p className="truncate text-xs font-semibold text-slate-500">
                              Guardada
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeImageUrl(imageUrl)}
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-200 text-slate-500 cursor-pointer"
                            title="Quitar imagen"
                          >
                            <Icon name="close" className="text-base" />
                          </button>
                        </div>
                      </div>
                    ))}
                    {imageFiles.map((draft) => (
                      <div
                        key={draft.id}
                        className="overflow-hidden rounded-2xl border border-primary/20 bg-white"
                      >
                        <div
                          className="h-32 bg-slate-100 bg-cover bg-center"
                          style={{
                            backgroundImage: `url("${draft.previewUrl}")`,
                          }}
                        />
                        <div className="flex items-center justify-between gap-2 p-3">
                          <div className="min-w-0">
                            <p className="truncate text-xs font-black text-slate-900">
                              {draft.file.name}
                            </p>
                            <p className="text-xs font-semibold text-primary">
                              Por subir - {formatBytes(draft.file.size)}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeImageFile(draft.id)}
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-200 text-slate-500 cursor-pointer"
                            title="Quitar imagen"
                          >
                            <Icon name="close" className="text-base" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>

              <div className="md:col-span-2">
                <Field label="Descripcion">
                  <textarea
                    value={form.descripcion}
                    onChange={(event) =>
                      updateForm("descripcion", event.target.value)
                    }
                    className={textareaClass}
                    placeholder="Descripcion del paquete"
                  />
                </Field>
              </div>

              <div className="space-y-3 md:col-span-2">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-bold text-slate-700">
                      Itinerario
                    </p>
                    <p className="text-xs font-semibold text-slate-500">
                      Ordena las etapas del recorrido que vera el turista.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={addItinerary}
                    disabled={form.itinerarios.length >= MAX_PACKAGE_ITINERARIES}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-primary px-4 text-sm font-bold text-primary disabled:opacity-50 cursor-pointer"
                  >
                    <Icon name="add" className="text-lg" />
                    Agregar etapa
                  </button>
                </div>

                <div className="space-y-3">
                  {form.itinerarios.map((item, index) => (
                    <article
                      key={item.id}
                      className="rounded-2xl border border-slate-200 bg-slate-50 p-3"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-black text-primary">
                          Etapa {index + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeItinerary(item.id)}
                          disabled={form.itinerarios.length <= 1}
                          className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 disabled:opacity-40 cursor-pointer"
                          title="Quitar etapa"
                        >
                          <Icon name="close" className="text-base" />
                        </button>
                      </div>
                      <div className="mt-3 grid gap-3 md:grid-cols-[minmax(0,280px)_minmax(0,1fr)]">
                        <label className="space-y-1.5 text-sm font-bold text-slate-700">
                          <span>Titulo</span>
                          <input
                            value={item.titulo}
                            onChange={(event) =>
                              updateItinerary(
                                item.id,
                                "titulo",
                                event.target.value,
                              )
                            }
                            className={inputClass}
                            placeholder={`Dia ${index + 1}`}
                          />
                        </label>
                        <label className="space-y-1.5 text-sm font-bold text-slate-700">
                          <span>Descripcion</span>
                          <textarea
                            value={item.descripcion}
                            onChange={(event) =>
                              updateItinerary(
                                item.id,
                                "descripcion",
                                event.target.value,
                              )
                            }
                            className="min-h-24 w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:bg-slate-50 disabled:text-slate-400"
                            placeholder="Actividades, tiempos, recorridos y recomendaciones"
                          />
                        </label>
                      </div>
                    </article>
                  ))}
                </div>
              </div>

              <Field label="Incluye">
                <textarea
                  value={form.incluye_descripcion}
                  onChange={(event) =>
                    updateForm("incluye_descripcion", event.target.value)
                  }
                  className={textareaClass}
                  placeholder="Elementos incluidos"
                />
              </Field>

              <Field label="No incluye">
                <textarea
                  value={form.no_incluye}
                  onChange={(event) =>
                    updateForm("no_incluye", event.target.value)
                  }
                  className={textareaClass}
                  placeholder="Elementos no incluidos"
                />
              </Field>
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
                {saveButtonLabel}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </PanelLayout>
  );
};

export default OperatorPackagesTemplate;
