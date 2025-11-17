/**
 * Projects API Service
 * Handles all project-related API calls
 */

import { apiClient } from './client';
import type { Project, ProjectDetail } from '../../types/project';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

interface CreateProjectDto {
  name: string;
  latitude?: number;
  longitude?: number;
  address?: string;
  notes?: string;
}

interface UpdateProjectDto {
  name?: string;
  latitude?: number;
  longitude?: number;
  address?: string;
  notes?: string;
}

/**
 * Get all projects for the authenticated user
 */
export async function getProjects(): Promise<Project[]> {
  const response = await apiClient.get<ApiResponse<Project[]>>('/buyers/projects');
  return response.data.data;
}

/**
 * Get a single project by ID with all related data
 */
export async function getProjectById(id: string): Promise<ProjectDetail> {
  const response = await apiClient.get<ApiResponse<ProjectDetail>>(`/buyers/projects/${id}`);
  return response.data.data;
}

/**
 * Create a new project
 */
export async function createProject(data: CreateProjectDto): Promise<Project> {
  const response = await apiClient.post<ApiResponse<Project>>('/buyers/projects', data);
  return response.data.data;
}

/**
 * Update an existing project
 */
export async function updateProject(id: string, data: UpdateProjectDto): Promise<Project> {
  const response = await apiClient.put<ApiResponse<Project>>(`/buyers/projects/${id}`, data);
  return response.data.data;
}

/**
 * Delete a project (soft delete)
 */
export async function deleteProject(id: string): Promise<void> {
  await apiClient.delete(`/buyers/projects/${id}`);
}

export const projectsService = {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
};

export default projectsService;
