const API_URL = (import.meta.env.VITE_API_URL as string) || "http://localhost:8000";

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
  const res = await fetch(`${API_URL}${path}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    credentials: "include", // important to send/receive httpOnly cookies
    ...options,
  });
  return handleResponse(res);
}

export async function post(path: string, body: any, options: RequestInit = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include", // important to send/receive httpOnly cookies
    body: JSON.stringify(body),
    ...options,
  });
  return handleResponse(res);
}

export async function put(path: string, body: any, options: RequestInit = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include", // important to send/receive httpOnly cookies
    body: JSON.stringify(body),
    ...options,
  });
  return handleResponse(res);
}

export async function del(path: string, options: RequestInit = {}) {
  const res = await fetch(`${API_URL}${path}`, {
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
