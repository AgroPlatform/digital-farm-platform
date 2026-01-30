import client from "./client";

export async function login(email: string, password: string) {
  const res = await client.post("/auth/login", { email, password });
  return res.json();
}

export async function register(email: string, password: string, fullName?: string) {
  const res = await client.post("/auth/register", { email, password, full_name: fullName });
  return res.json();
}

export default { login, register };
