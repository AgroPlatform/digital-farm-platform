const RAW_API_URL = (import.meta.env.VITE_API_URL as string) || "http://localhost:8000";
const API_URL = RAW_API_URL.replace(/\/+$/, "");

function buildUrl(path: string) {
  if (!path.startsWith("/")) {
    return `${API_URL}/${path}`;
  }
  return `${API_URL}${path}`;
}

type UnauthorizedHandler = () => void;
type RequestErrorHandler = (error: Error) => void;

let unauthorizedHandler: UnauthorizedHandler | null = null;
let requestErrorHandler: RequestErrorHandler | null = null;

export function setUnauthorizedHandler(handler: UnauthorizedHandler | null) {
  unauthorizedHandler = handler;
}

export function setRequestErrorHandler(handler: RequestErrorHandler | null) {
  requestErrorHandler = handler;
}

type RequestOptions = RequestInit & {
  timeoutMs?: number;
};

const extractErrorMessage = (payload: string, fallback: string) => {
  if (!payload) {
    return fallback;
  }

  try {
    const parsed = JSON.parse(payload);
    if (typeof parsed?.detail === "string") {
      return parsed.detail;
    }
    if (Array.isArray(parsed?.detail)) {
      const first = parsed.detail[0];
      if (typeof first?.msg === "string") {
        return first.msg;
      }
    }
  } catch (error) {
    return payload;
  }

  return payload;
};

async function request(path: string, options: RequestOptions = {}) {
  const { timeoutMs, ...fetchOptions } = options;
  let controller: AbortController | null = null;
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let didTimeout = false;

  if (timeoutMs) {
    controller = new AbortController();
    if (fetchOptions.signal) {
      fetchOptions.signal.addEventListener("abort", () => controller?.abort(), { once: true });
    }
    timeoutId = setTimeout(() => {
      didTimeout = true;
      controller?.abort();
    }, timeoutMs);
  }

  try {
    const res = await fetch(buildUrl(path), {
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      ...fetchOptions,
      signal: controller?.signal ?? fetchOptions.signal,
    });

    if (res.status === 401 && unauthorizedHandler) {
      unauthorizedHandler();
    }

    if (!res.ok) {
      const txt = await res.text();
      const message = extractErrorMessage(txt, `Request failed (${res.status})`);
      const error = new Error(message);
      error.name = "HttpError";
      if (requestErrorHandler) {
        requestErrorHandler(error);
      }
      throw error;
    }

    return res;
  } catch (error) {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    if (error instanceof Error) {
      if (error.name === "HttpError") {
        throw error;
      }
      if (didTimeout || error.name === "AbortError") {
        const timeoutError = new Error("Verzoek verlopen");
        if (requestErrorHandler) {
          requestErrorHandler(timeoutError);
        }
        throw timeoutError;
      }

      const networkError = new Error("Backend niet bereikbaar");
      if (requestErrorHandler) {
        requestErrorHandler(networkError);
      }
      throw networkError;
    }

    const fallbackError = new Error("Backend niet bereikbaar");
    if (requestErrorHandler) {
      requestErrorHandler(fallbackError);
    }
    throw fallbackError;
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }
}

export async function get(path: string, options: RequestOptions = {}) {
  return request(path, { method: "GET", ...options });
}

export async function post(path: string, body: any, options: RequestOptions = {}) {
  return request(path, { method: "POST", body: JSON.stringify(body), ...options });
}

export async function put(path: string, body: any, options: RequestOptions = {}) {
  return request(path, { method: "PUT", body: JSON.stringify(body), ...options });
}

export async function del(path: string, options: RequestOptions = {}) {
  return request(path, { method: "DELETE", ...options });
}

export default {
  get,
  post,
  put,
  delete: del,
};
