/**
 * Fence Calculator Types
 */

export type FenceStyle = 'metal_privacy' | 'wood_on_metal';
export type GateType = 'none' | 'walk' | 'car';
export type TerrainType = 'flat' | 'sloped';

export interface FenceInputs {
  length: number; // meters
  height: number; // meters (1.5-2.5)
  style: FenceStyle;
  gates: GateType;
  terrain: TerrainType;
}

export interface FenceBOMItem {
  id: string;
  specification: string;
  specification_ka: string;
  specification_en: string;
  quantity: number;
  unit: string;
  unit_ka: string;
  unit_en: string;
  estimatedPrice: number;
  category: string;
}

export interface FenceToolItem {
  id: string;
  name: string;
  name_ka: string;
  name_en: string;
  category: string;
  rental_duration_days: number;
  daily_rate_estimate: number;
  estimated_total: number;
  notes?: string;
}

export interface FenceCalculationResult {
  inputs: FenceInputs;
  bom: FenceBOMItem[];
  tools: FenceToolItem[];
  totalMaterialPrice: number;
  totalToolPrice: number;
  totalPrice: number;
  notes: string[];
}

export interface ToolRentalSuggestion {
  id: string;
  name: string;
  name_ka: string;
  name_en: string;
  description: string;
  description_ka: string;
  description_en: string;
  items: string[];
  estimatedDailyRate: number;
}
