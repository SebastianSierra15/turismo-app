import { type NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DEFAULT_BACKEND_URL = "http://localhost:8000";
const backendBaseUrl = (
  process.env.NEXT_PUBLIC_API_URL ?? DEFAULT_BACKEND_URL
).trim();

const hopByHopHeaders = new Set([
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
  "host",
  "content-length",
]);

const buildTargetUrl = (request: NextRequest, pathSegments: string[]) => {
  const base = backendBaseUrl.replace(/\/+$/, "");
  const path = pathSegments.map(encodeURIComponent).join("/");
  const url = new URL(`${base}/${path}`);
  url.search = request.nextUrl.search;
  return url.toString();
};

const copyRequestHeaders = (request: NextRequest) => {
  const headers = new Headers();
  request.headers.forEach((value, key) => {
    const lower = key.toLowerCase();
    if (hopByHopHeaders.has(lower)) return;
    headers.set(key, value);
  });
  return headers;
};

const copyResponseHeaders = (response: Response) => {
  const headers = new Headers();
  response.headers.forEach((value, key) => {
    const lower = key.toLowerCase();
    if (hopByHopHeaders.has(lower)) return;
    headers.set(key, value);
  });
  return headers;
};

const proxy = async (
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) => {
  const { path } = await context.params;
  const targetUrl = buildTargetUrl(request, path ?? []);
  const method = request.method.toUpperCase();
  const hasBody = !["GET", "HEAD"].includes(method);

  const upstreamResponse = await fetch(targetUrl, {
    method,
    headers: copyRequestHeaders(request),
    body: hasBody ? await request.arrayBuffer() : undefined,
    redirect: "follow",
    cache: "no-store",
  });

  return new Response(upstreamResponse.body, {
    status: upstreamResponse.status,
    statusText: upstreamResponse.statusText,
    headers: copyResponseHeaders(upstreamResponse),
  });
};

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
export const OPTIONS = proxy;
export const HEAD = proxy;
