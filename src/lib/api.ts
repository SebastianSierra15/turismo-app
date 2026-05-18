import axios from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

type QueryParams = Record<string, string | number | boolean | null | undefined>;

export const api = axios.create({
  baseURL: API_BASE_URL,
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
  const url = new URL(path, API_BASE_URL);

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
    throw new Error(`Error ${response.status} consultando ${path}`);
  }

  return response.json() as Promise<T>;
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
