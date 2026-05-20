import axios from "axios";

const DEFAULT_API_BASE_URL = "http://localhost:8000";
const API_PROXY_BASE_URL = "/api/backend";
const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? DEFAULT_API_BASE_URL
).trim();

type QueryParams = Record<string, string | number | boolean | null | undefined>;

const isAbsoluteUrl = (value: string) => /^https?:\/\//i.test(value);

const isInsecureHttpUrl = (value: string) => /^http:\/\//i.test(value);

const trimTrailingSlash = (value: string) => value.replace(/\/+$/, "");

const buildRelativeUrl = (
  base: string,
  path: string,
  params?: QueryParams,
) => {
  const prefix = trimTrailingSlash(base);
  const cleanPath = path.startsWith("/") ? path.slice(1) : path;
  const url = `${prefix}/${cleanPath}`;

  if (!params) return url;

  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      search.set(key, String(value));
    }
  });

  const query = search.toString();
  return query ? `${url}?${query}` : url;
};

export const resolveApiBaseUrl = () => {
  if (
    typeof window !== "undefined" &&
    window.location.protocol === "https:" &&
    isInsecureHttpUrl(API_BASE_URL)
  ) {
    return API_PROXY_BASE_URL;
  }

  return API_BASE_URL || DEFAULT_API_BASE_URL;
};

export const api = axios.create({
  baseURL: resolveApiBaseUrl(),
  headers: {
    "Content-Type": "application/json",
  },
});

export class ApiHttpError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiHttpError";
    this.status = status;
  }
}

export const buildApiUrl = (path: string, params?: QueryParams) => {
  const baseUrl = resolveApiBaseUrl();

  if (!isAbsoluteUrl(baseUrl)) {
    return buildRelativeUrl(baseUrl, path, params);
  }

  const normalizedBase = `${trimTrailingSlash(baseUrl)}/`;
  const normalizedPath = path.startsWith("/") ? path.slice(1) : path;
  const url = new URL(normalizedPath, normalizedBase);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.set(key, String(value));
      }
    });
  }
  return url.toString();
};

export const fetchApiJson = async <T>(
  path: string,
  params?: QueryParams,
  init?: RequestInit,
): Promise<T> => {
  const response = await fetch(buildApiUrl(path, params), {
    cache: "no-store",
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  if (!response.ok) {
    const bodyClone = response.clone();
    let detail = `Error ${response.status} consultando ${path}`;

    try {
      const payload = await bodyClone.json();
      if (payload && typeof payload.detail === "string" && payload.detail.trim()) {
        detail = payload.detail;
      }
    } catch {
      try {
        const text = (await bodyClone.text()).trim();
        if (text) {
          detail = text.slice(0, 240);
        }
      } catch {
        // noop
      }
    }

    throw new ApiHttpError(detail, response.status);
  }

  const okClone = response.clone();
  try {
    return (await response.json()) as T;
  } catch {
    const text = (await okClone.text()).trim();
    throw new Error(
      text
        ? `La API devolvio contenido no JSON: ${text.slice(0, 240)}`
        : `La API devolvio una respuesta no JSON en ${path}`,
    );
  }
};

export const isUnauthorizedResponse = (response: Response) =>
  response.status === 401 || response.status === 403;

const clearClientSession = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

export const forceLoginRedirect = () => {
  if (typeof window === "undefined") return;
  clearClientSession();
  if (window.location.pathname !== "/login") {
    window.location.assign("/login");
  }
};

export const parseApiError = async (
  response: Response,
  fallbackMessage: string,
) => {
  let detail = fallbackMessage;

  try {
    const payload = await response.json();
    if (payload && typeof payload.detail === "string" && payload.detail.trim()) {
      detail = payload.detail;
    }
  } catch {
    // noop
  }

  if (isUnauthorizedResponse(response)) {
    forceLoginRedirect();
  }

  return new ApiHttpError(detail, response.status);
};

// Funcion para enviar mensajes al chatbot
export const sendChatMessage = async (message: string, userId?: string) => {
  try {
    const response = await api.post("/chat", {
      message,
      user_id: userId,
    });
    return response.data;
  } catch (error) {
    console.error("Error en la comunicacion con el chatbot:", error);
    throw error;
  }
};
