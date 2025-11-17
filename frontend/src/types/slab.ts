/**
 * Slab/Concrete Calculator Types
 */

export type SlabPurpose = 'parking_pad' | 'patio' | 'walkway' | 'custom';

export interface SlabInputs {
  purpose: SlabPurpose;
  length: number; // meters
  width: number; // meters
  thickness: number; // centimeters
  edgeFormsNeeded: boolean;
}

export interface SlabBOMItem {
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

export interface SlabCalculationResult {
  inputs: SlabInputs;
  bom: SlabBOMItem[];
  totalPrice: number;
  volume: number; // m³
  area: number; // m²
  pumpRecommended: boolean;
  warnings: string[];
  notes: string[];
}

export interface SlabToolRentalSuggestion {
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
