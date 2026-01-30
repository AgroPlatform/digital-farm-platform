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
  next_action?: string;
  address?: string;
  lat?: number;
  lng?: number;
  progress?: number; // Calculated progress percentage (0-100)
  planting_date?: string; // ISO date string
  growth_days?: number; // Total days for crop growth cycle
}

export interface FieldCreate {
  name: string;
  size: number;
  soil_type: string;
  crops?: string[];
  status?: FieldStatus;
  next_action?: string;
  address?: string;
  lat?: number;
  lng?: number;
  planting_date?: string; // ISO date string (YYYY-MM-DD)
  growth_days?: number; // Total days for crop growth cycle
}

export interface FieldUpdate extends FieldCreate {}

export interface FieldCropCreate {
  crop_id: number;
  planting_date?: string; // date string in YYYY-MM-DD format
  area: number; // in hectares (required)
}

export interface FieldCropDetail {
  id: number;
  name: string;
  type: string;
  season: string;
  duration: string;
  water_needs: string;
  expected_yield: string;
  status: string;
  icon: string;
  description?: string;
  soil_temp?: string;
  soil_type?: string;
  sunlight?: string;
  tips?: string;
  planting_date?: string;
  area?: number;
}

export interface ActivityLogCreate {
  crop_id: number;
  activity_type: string;
  date: string; // ISO string
  area: number;
  notes?: string;
}

export interface ActivityLog {
  id: number;
  field_id: number;
  crop_id: number;
  activity_type: string;
  date: string;
  area: number;
  notes?: string;
}

export async function getFields(): Promise<Field[]> {
  const res = await client.get("/fields/");
  return res.json();
}

export async function getField(id: number): Promise<Field> {
  const res = await client.get(`/fields/${id}`);
  return res.json();
}

export async function createField(data: FieldCreate): Promise<Field> {
  const res = await client.post("/fields/", data);
  return res.json();
}

export async function updateField(id: number, data: FieldUpdate): Promise<Field> {
  const res = await client.put(`/fields/${id}`, data);
  return res.json();
}

export async function deleteField(id: number): Promise<void> {
  await client.delete(`/fields/${id}`);
}

// Crop management for fields
export async function addCropToField(fieldId: number, data: FieldCropCreate): Promise<Field> {
  const res = await client.post(`/fields/${fieldId}/crops`, data);
  return res.json();
}

export async function removeCropFromField(fieldId: number, cropId: number): Promise<void> {
  await client.delete(`/fields/${fieldId}/crops/${cropId}`);
}

export async function getFieldCrops(fieldId: number): Promise<FieldCropDetail[]> {
  const res = await client.get(`/fields/${fieldId}/crops`);
  return res.json();
}

// Activity management for fields
export async function createActivityForField(fieldId: number, data: ActivityLogCreate): Promise<ActivityLog> {
  const res = await client.post(`/fields/${fieldId}/activities`, data);
  return res.json();
}

export async function getFieldActivities(fieldId: number): Promise<ActivityLog[]> {
  const res = await client.get(`/fields/${fieldId}/activities`);
  return res.json();
}

export default {
  getFields,
  getField,
  createField,
  updateField,
  deleteField,
  addCropToField,
  getFieldCrops,
  createActivityForField,
  getFieldActivities,
};
