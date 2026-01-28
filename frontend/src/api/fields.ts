import client from "./client";

export type FieldStatus = "actief" | "inactief";

export interface Field {
  id: number;
  user_id: number;
  name: string;
  size: number; // in hectares
  soil_type: string;
  crops: string[];
  status: FieldStatus;
  last_crop?: string;
  next_action?: string;
  address?: string;
  lat?: number;
  lng?: number;
}

export interface FieldCreate {
  name: string;
  size: number;
  soil_type: string;
  crops?: string[];
  status?: FieldStatus;
  last_crop?: string;
  next_action?: string;
  address?: string;
  lat?: number;
  lng?: number;
}

export interface FieldUpdate extends FieldCreate {}

export async function getFields(): Promise<Field[]> {
  const res = await client.get("/fields/");
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(txt || `Failed to get fields (${res.status})`);
  }
  return res.json();
}

export async function getField(id: number): Promise<Field> {
  const res = await client.get(`/fields/${id}`);
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(txt || `Failed to get field (${res.status})`);
  }
  return res.json();
}

export async function createField(data: FieldCreate): Promise<Field> {
  const res = await client.post("/fields/", data);
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(txt || `Failed to create field (${res.status})`);
  }
  return res.json();
}

export async function updateField(id: number, data: FieldUpdate): Promise<Field> {
  const res = await client.put(`/fields/${id}`, data);
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(txt || `Failed to update field (${res.status})`);
  }
  return res.json();
}

export async function deleteField(id: number): Promise<void> {
  const res = await client.delete(`/fields/${id}`);
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(txt || `Failed to delete field (${res.status})`);
  }
}

export default {
  getFields,
  getField,
  createField,
  updateField,
  deleteField,
};