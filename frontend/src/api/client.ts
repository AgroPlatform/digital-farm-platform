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

async function handleResponse(res: Response) {
  if (res.status === 401 && unauthorizedHandler) {
    unauthorizedHandler();
  }

  return res;
}

export async function get(path: string, options: RequestInit = {}) {
  try {
    const res = await fetch(buildUrl(path), {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include", // important to send/receive httpOnly cookies
      ...options,
    });
    return handleResponse(res);
  } catch (error) {
    if (requestErrorHandler && error instanceof Error) {
      requestErrorHandler(error);
    }
    throw error;
  }
}

export async function post(path: string, body: any, options: RequestInit = {}) {
  try {
    const res = await fetch(buildUrl(path), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include", // important to send/receive httpOnly cookies
      body: JSON.stringify(body),
      ...options,
    });
    return handleResponse(res);
  } catch (error) {
    if (requestErrorHandler && error instanceof Error) {
      requestErrorHandler(error);
    }
    throw error;
  }
}

export async function put(path: string, body: any, options: RequestInit = {}) {
  try {
    const res = await fetch(buildUrl(path), {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include", // important to send/receive httpOnly cookies
      body: JSON.stringify(body),
      ...options,
    });
    return handleResponse(res);
  } catch (error) {
    if (requestErrorHandler && error instanceof Error) {
      requestErrorHandler(error);
    }
    throw error;
  }
}

export async function del(path: string, options: RequestInit = {}) {
  try {
    const res = await fetch(buildUrl(path), {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      ...options,
    });
    return handleResponse(res);
  } catch (error) {
    if (requestErrorHandler && error instanceof Error) {
      requestErrorHandler(error);
    }
    throw error;
  }
}

export default {
  get,
  post,
  put,
  delete: del,
};
