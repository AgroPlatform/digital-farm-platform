import apiClient from "./client";
import type { Crop } from "../types/crop";

export const getCrops = async (type?: string, season?: string): Promise<Crop[]> => {
  const params = new URLSearchParams();
  if (type && type !== 'all') params.append('type', type);
  if (season && season !== 'all') params.append('season', season);
  
  const response = await apiClient.get(`/crops?${params.toString()}`);
  return response.json();
};

export const createCrop = async (cropData: Omit<Crop, "id">): Promise<Crop> => {
  const response = await apiClient.post("/crops", cropData);
  return response.json();
};

export const updateCrop = async (cropId: number, cropData: Partial<Omit<Crop, "id">>): Promise<Crop> => {
  const response = await apiClient.put(`/crops/${cropId}`, cropData);
  return response.json();
};

export const deleteCrop = async (cropId: number): Promise<void> => {
  await apiClient.delete(`/crops/${cropId}`);
};
