const RAW_API_URL = (import.meta.env.VITE_API_URL as string) || "http://localhost:8000";
const API_URL = RAW_API_URL.replace(/\/+$/, "");

function buildUrl(path: string) {
  if (!path.startsWith("/")) {
    return `${API_URL}/${path}`;
  }
  return `${API_URL}${path}`;
}

type UnauthorizedHandler = () => void;

let unauthorizedHandler: UnauthorizedHandler | null = null;

export function setUnauthorizedHandler(handler: UnauthorizedHandler | null) {
  unauthorizedHandler = handler;
}

async function handleResponse(res: Response) {
  if (res.status === 401 && unauthorizedHandler) {
    unauthorizedHandler();
  }

  return res;
}

export async function get(path: string, options: RequestInit = {}) {
  const res = await fetch(buildUrl(path), {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    credentials: "include", // important to send/receive httpOnly cookies
    ...options,
  });
  return handleResponse(res);
}

export async function post(path: string, body: any, options: RequestInit = {}) {
  const res = await fetch(buildUrl(path), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include", // important to send/receive httpOnly cookies
    body: JSON.stringify(body),
    ...options,
  });
  return handleResponse(res);
}

export async function put(path: string, body: any, options: RequestInit = {}) {
  const res = await fetch(buildUrl(path), {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include", // important to send/receive httpOnly cookies
    body: JSON.stringify(body),
    ...options,
  });
  return handleResponse(res);
}

export async function del(path: string, options: RequestInit = {}) {
  const res = await fetch(buildUrl(path), {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    ...options,
  });
  return handleResponse(res);
}

export default {
  get,
  post,
  put,
  delete: del,
};
