const API_URL = (import.meta.env.VITE_API_URL as string) || "http://localhost:8000";

export async function get(path: string, options: RequestInit = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    credentials: "include", // important to send/receive httpOnly cookies
    ...options,
  });
  return res;
}

export async function post(path: string, body: any, options: RequestInit = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include", // important to send/receive httpOnly cookies
    body: JSON.stringify(body),
    ...options,
  });
  return res;
}

export async function put(path: string, body: any, options: RequestInit = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include", // important to send/receive httpOnly cookies
    body: JSON.stringify(body),
    ...options,
  });
  return res;
}

export default {
  get,
  post,
  put,
};
