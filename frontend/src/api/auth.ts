import client from "./client";

export async function login(email: string, password: string) {
  const res = await client.post("/auth/login", { email, password });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(txt || `Login failed (${res.status})`);
  }
  return res.json();
}

export default { login };
