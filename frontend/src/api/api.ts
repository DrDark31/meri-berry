export type ApiMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type QueryValue = string | number | boolean | null | undefined;
export type QueryParams = Record<string, QueryValue>;

export type ApiRequestOptions<TPayload = unknown> = {
  method: ApiMethod;
  path: string;
  payload?: TPayload;
  headers?: HeadersInit;
  signal?: AbortSignal;
};

export class ApiRequestError extends Error {
  status: number;
  details: unknown;

  constructor(message: string, status: number, details: unknown) {
    super(message);
    this.name = "ApiRequestError";
    this.status = status;
    this.details = details;
  }
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

function toAbsolutePath(path: string): string {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  if (path.startsWith("/")) {
    return `${API_BASE_URL}${path}`;
  }

  return `${API_BASE_URL}/${path}`;
}

function attachQueryParams(url: string, query?: QueryParams): string {
  if (!query) {
    return url;
  }

  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null) {
      continue;
    }
    searchParams.append(key, String(value));
  }

  const queryString = searchParams.toString();
  if (!queryString) {
    return url;
  }

  return `${url}${url.includes("?") ? "&" : "?"}${queryString}`;
}

export async function apiRequest<TResponse, TPayload = unknown>(
  options: ApiRequestOptions<TPayload>,
): Promise<TResponse> {
  const { method, path, payload, headers, signal } = options;

  const isGetWithPayload =
    method === "GET" &&
    payload !== undefined &&
    typeof payload === "object" &&
    !Array.isArray(payload);

  const url = attachQueryParams(
    toAbsolutePath(path),
    isGetWithPayload ? (payload as QueryParams) : undefined,
  );

  const requestHeaders = new Headers(headers);
  const requestInit: RequestInit = {
    method,
    headers: requestHeaders,
    signal,
  };

  if (method !== "GET" && payload !== undefined) {
    requestHeaders.set("Content-Type", "application/json");
    requestInit.body = JSON.stringify(payload);
  }

  const response = await fetch(url, requestInit);
  const isJson = response.headers.get("content-type")?.includes("application/json");
  const parsedBody = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    const errorMessage =
      typeof parsedBody === "object" &&
      parsedBody !== null &&
      "message" in parsedBody &&
      typeof parsedBody.message === "string"
        ? parsedBody.message
        : `Request failed with status ${response.status}`;
    throw new ApiRequestError(errorMessage, response.status, parsedBody);
  }

  return parsedBody as TResponse;
}
