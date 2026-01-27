import client from "./client";

export interface UserProfile {
  id: number;
  email: string;
  full_name?: string;
  phone?: string;
  job_title?: string;
  notification_preferences?: NotificationPreferences;
}

export interface NotificationPreferences {
  email_project_updates: boolean;
  email_team_messages: boolean;
  email_system_updates: boolean;
  push_browser_notifications: boolean;
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
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(txt || `Failed to get profile (${res.status})`);
  }
  return res.json();
}

export async function updateProfile(data: UpdateProfileRequest): Promise<UserProfile> {
  const res = await client.put("/user/profile", data);
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(txt || `Failed to update profile (${res.status})`);
  }
  return res.json();
}

export async function updatePassword(data: UpdatePasswordRequest): Promise<{ message: string }> {
  const res = await client.put("/user/password", data);
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(txt || `Failed to update password (${res.status})`);
  }
  return res.json();
}

export async function getNotifications(): Promise<NotificationPreferences> {
  const res = await client.get("/user/notifications");
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(txt || `Failed to get notifications (${res.status})`);
  }
  return res.json();
}

export async function updateNotifications(data: NotificationPreferences): Promise<NotificationPreferences> {
  const res = await client.put("/user/notifications", data);
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(txt || `Failed to update notifications (${res.status})`);
  }
  return res.json();
}

export default {
  getProfile,
  updateProfile,
  updatePassword,
  getNotifications,
  updateNotifications,
};
