import { buildApiUrl, parseApiError } from "@/lib/api";
import {
  OperatorServiceListSchema,
  OperatorServiceSchema,
  OperatorServiceTypeListSchema,
  OperatorServiceWriteSchema,
  ServiceOwnerListSchema,
} from "@/schemas/operatorServices";
import {
  type OperatorService,
  type OperatorServiceTypeList,
  type OperatorServiceWrite,
  type ServiceOwnerList,
} from "@/types/operatorServices";
import { extractPlanSlug } from "@/utils/planId";

const authHeaders = (token: string) => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${token}`,
});

const swapLocalhostToIpv4 = (url: string) => {
  try {
    const parsed = new URL(url);
    if (parsed.hostname !== "localhost") return null;
    parsed.hostname = "127.0.0.1";
    return parsed.toString();
  } catch {
    return null;
  }
};

const swapPort = (url: string, nextPort: string) => {
  try {
    const parsed = new URL(url);
    parsed.port = nextPort;
    return parsed.toString();
  } catch {
    return null;
  }
};

const candidateUrls = (url: string) => {
  const candidates = [url];
  const ipv4 = swapLocalhostToIpv4(url);
  if (ipv4 && !candidates.includes(ipv4)) candidates.push(ipv4);

  try {
    const parsed = new URL(url);
    if (parsed.port === "8000") {
      const alt8000Host = swapPort(url, "8020");
      if (alt8000Host && !candidates.includes(alt8000Host)) {
        candidates.push(alt8000Host);
      }
      if (ipv4) {
        const altIpv4 = swapPort(ipv4, "8020");
        if (altIpv4 && !candidates.includes(altIpv4)) candidates.push(altIpv4);
      }
    }
  } catch {
    // noop
  }

  return candidates;
};

const fetchWithLocalRetry = async (
  input: string,
  init: RequestInit,
): Promise<Response> => {
  let lastError: unknown;
  const urls = candidateUrls(input);

  for (const url of urls) {
    try {
      return await fetch(url, init);
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      if (!message.includes("Failed to fetch")) {
        throw error;
      }
      lastError = error;
    }
  }

  throw lastError ?? new Error("Failed to fetch");
};

export const getOperatorServices = async (
  token: string,
  options?: {
    q?: string;
    estado?: string;
    tipo_uri?: string;
    limit?: number;
    offset?: number;
  },
) => {
  const url = buildApiUrl("/operador/servicios", {
      q: options?.q || undefined,
      estado: options?.estado || undefined,
      tipo_uri: options?.tipo_uri || undefined,
      limit: options?.limit ?? 300,
      offset: options?.offset ?? 0,
    });
  const response = await fetchWithLocalRetry(url, {
    method: "GET",
    headers: authHeaders(token),
    cache: "no-store",
  });

  if (!response.ok) {
    throw await parseApiError(response, "No se pudieron cargar los servicios");
  }

  return OperatorServiceListSchema.parse(await response.json());
};

export const getOperatorServiceTypes = async (
  token: string,
): Promise<OperatorServiceTypeList> => {
  const response = await fetchWithLocalRetry(buildApiUrl("/operador/servicios/tipos"), {
    method: "GET",
    headers: authHeaders(token),
    cache: "no-store",
  });

  if (!response.ok) {
    throw await parseApiError(response, "No se pudieron cargar los tipos de servicio");
  }

  return OperatorServiceTypeListSchema.parse(await response.json());
};

export const getServiceOwners = async (
  token: string,
): Promise<ServiceOwnerList> => {
  const response = await fetchWithLocalRetry(buildApiUrl("/operador/servicios/propietarios"), {
    method: "GET",
    headers: authHeaders(token),
    cache: "no-store",
  });

  if (!response.ok) {
    throw await parseApiError(response, "No se pudieron cargar los responsables");
  }

  return ServiceOwnerListSchema.parse(await response.json());
};

export const getOperatorServiceDetail = async (
  token: string,
  id: string,
): Promise<OperatorService> => {
  const response = await fetchWithLocalRetry(
    buildApiUrl(`/operador/servicios/${encodeURIComponent(extractPlanSlug(id))}`),
    {
      method: "GET",
      headers: authHeaders(token),
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw await parseApiError(response, "No se pudo cargar el servicio");
  }

  return OperatorServiceSchema.parse(await response.json());
};

export const saveOperatorService = async (
  token: string,
  payload: OperatorServiceWrite,
  id?: string,
) => {
  const body = OperatorServiceWriteSchema.parse(payload);
  const path = id
    ? `/operador/servicios/${encodeURIComponent(extractPlanSlug(id))}`
    : "/operador/servicios";

  const response = await fetchWithLocalRetry(buildApiUrl(path), {
    method: id ? "PUT" : "POST",
    headers: authHeaders(token),
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw await parseApiError(
      response,
      id ? "No se pudo actualizar el servicio" : "No se pudo crear el servicio",
    );
  }

  return OperatorServiceSchema.parse(await response.json());
};

export const deleteOperatorService = async (token: string, id: string) => {
  const response = await fetchWithLocalRetry(
    buildApiUrl(`/operador/servicios/${encodeURIComponent(extractPlanSlug(id))}`),
    {
      method: "DELETE",
      headers: authHeaders(token),
    },
  );

  if (!response.ok) {
    throw await parseApiError(response, "No se pudo eliminar el servicio");
  }
};
