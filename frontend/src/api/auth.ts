import client from "./client";

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

export async function login(email: string, password: string) {
  const res = await client.post("/auth/login", { email, password });
  if (!res.ok) {
    const txt = await res.text();
    const message = extractErrorMessage(txt, `Login failed (${res.status})`);
    throw new Error(message);
  }
  return res.json();
}

export async function register(email: string, password: string, fullName?: string) {
  const res = await client.post("/auth/register", { email, password, full_name: fullName });
  if (!res.ok) {
    const txt = await res.text();
    const message = extractErrorMessage(txt, `Registration failed (${res.status})`);
    throw new Error(message);
  }
  return res.json();
}

export default { login, register };
