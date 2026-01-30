import client from "./client";

export interface UserProfile {
  id: number;
  email: string;
  full_name?: string;
  phone?: string;
  job_title?: string;
}

export interface UpdateProfileRequest {
  full_name?: string;
  phone?: string;
  job_title?: string;
}

export interface UpdatePasswordRequest {
  current_password: string;
  new_password: string;
}

export async function getProfile(): Promise<UserProfile> {
  const res = await client.get("/user/profile");
  return res.json();
}

export async function updateProfile(data: UpdateProfileRequest): Promise<UserProfile> {
  const res = await client.put("/user/profile", data);
  return res.json();
}

export async function updatePassword(data: UpdatePasswordRequest): Promise<{ message: string }> {
  const res = await client.put("/user/password", data);
  return res.json();
}

export default {
  getProfile,
  updateProfile,
  updatePassword,
};
