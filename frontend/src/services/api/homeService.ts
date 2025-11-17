/**
 * Home Screen API Service
 */

import { apiClient } from './client';

export interface HomeScreenData {
  user: {
    id: string;
    name: string;
    user_type: string;
  };
  templates: Array<{
    id: string;
    slug: string;
    title_ka: string;
    title_en: string;
    description_ka: string;
    description_en: string;
    category: string;
    estimated_duration_days: number | null;
    difficulty_level: string | null;
    images: string[];
  }>;
  stats: {
    active_projects: number;
    active_rfqs: number;
    pending_orders: number;
  };
  recent_activity: Array<{
    id: string;
    type: string;
    title: string;
    date: string;
  }>;
}

/**
 * Get buyer home screen data
 */
export async function getBuyerHome(): Promise<HomeScreenData> {
  const response = await apiClient.get<HomeScreenData>('/buyers/home');
  return response.data;
}

/**
 * Get published templates
 */
export async function getPublishedTemplates() {
  const response = await apiClient.get('/templates', {
    params: { is_published: true },
  });
  return response.data;
}
