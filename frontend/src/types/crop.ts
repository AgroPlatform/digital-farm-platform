export interface Crop {
  id: number;
  name: string;
  type: string;
  season: string;
  duration: string;
  water_needs: string;
  expected_yield: string;
  status: 'actief' | 'inactief';
  icon: string;
  description?: string;
  soil_temp?: string;
  soil_type?: string;
  sunlight?: string;
  tips?: string;
}
