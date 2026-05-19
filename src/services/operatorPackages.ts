import { ApiHttpError, buildApiUrl, parseApiError } from "@/lib/api";
import {
  OperatorPackageDetailSchema,
  OperatorPackageListSchema,
  OperatorPackageWriteSchema,
  PackageServiceCatalogSchema,
  PackageOwnerListSchema,
} from "@/schemas/operatorPackages";
import {
  type OperatorPackage,
  type OperatorPackageDetail,
  type OperatorPackageWrite,
  type PackageServiceCatalog,
  type PackageOwnerList,
} from "@/types/operatorPackages";
import { extractPlanSlug } from "@/utils/planId";

const authHeaders = (token: string) => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${token}`,
});

export const getOperatorPackages = async (
  token: string,
  q = "",
): Promise<OperatorPackage[]> => {
  const response = await fetch(
    buildApiUrl("/operador/paquetes", {
      q: q || undefined,
      limit: 300,
      offset: 0,
    }),
    {
      method: "GET",
      headers: authHeaders(token),
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw await parseApiError(response, "No se pudieron cargar los paquetes");
  }

  return OperatorPackageListSchema.parse(await response.json());
};

export const getPackageOwners = async (
  token: string,
): Promise<PackageOwnerList> => {
  const response = await fetch(buildApiUrl("/operador/paquetes/propietarios"), {
    method: "GET",
    headers: authHeaders(token),
    cache: "no-store",
  });

  if (!response.ok) {
    throw await parseApiError(response, "No se pudieron cargar los responsables");
  }

  return PackageOwnerListSchema.parse(await response.json());
};

export const getPackageServices = async (
  token: string,
): Promise<PackageServiceCatalog> => {
  const response = await fetch(buildApiUrl("/operador/paquetes/servicios"), {
    method: "GET",
    headers: authHeaders(token),
    cache: "no-store",
  });

  if (!response.ok) {
    throw await parseApiError(response, "No se pudieron cargar las actividades");
  }

  return PackageServiceCatalogSchema.parse(await response.json());
};

export const getOperatorPackageDetail = async (
  token: string,
  id: string,
): Promise<OperatorPackageDetail> => {
  const response = await fetch(
    buildApiUrl(`/operador/paquetes/${encodeURIComponent(extractPlanSlug(id))}`),
    {
      method: "GET",
      headers: authHeaders(token),
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw await parseApiError(response, "No se pudo cargar el paquete");
  }

  return OperatorPackageDetailSchema.parse(await response.json());
};

export const getOperatorPackageDetailForPlanAccess = async (
  token: string,
  id: string,
): Promise<OperatorPackageDetail> => {
  const response = await fetch(
    buildApiUrl(`/operador/paquetes/${encodeURIComponent(extractPlanSlug(id))}`),
    {
      method: "GET",
      headers: authHeaders(token),
      cache: "no-store",
    },
  );

  if (!response.ok) {
    let detail = "No autorizado para ver este paquete";
    try {
      const payload = await response.json();
      if (payload && typeof payload.detail === "string" && payload.detail.trim()) {
        detail = payload.detail;
      }
    } catch {
      // noop
    }
    throw new ApiHttpError(detail, response.status);
  }

  return OperatorPackageDetailSchema.parse(await response.json());
};

export const saveOperatorPackage = async (
  token: string,
  payload: OperatorPackageWrite,
  id?: string,
): Promise<OperatorPackageDetail> => {
  const body = OperatorPackageWriteSchema.parse(payload);
  const path = id
    ? `/operador/paquetes/${encodeURIComponent(extractPlanSlug(id))}`
    : "/operador/paquetes";
  const response = await fetch(buildApiUrl(path), {
    method: id ? "PUT" : "POST",
    headers: authHeaders(token),
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw await parseApiError(
      response,
      id ? "No se pudo actualizar el paquete" : "No se pudo crear el paquete",
    );
  }

  return OperatorPackageDetailSchema.parse(await response.json());
};
