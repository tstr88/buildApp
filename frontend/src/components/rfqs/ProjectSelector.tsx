/**
 * Project Selector Component
 * Allows selecting existing project or creating new one for RFQ
 */

import React, { useState, useEffect } from 'react';
import * as Icons from 'lucide-react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme/tokens';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Fix Leaflet default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface Project {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  address?: string;
}

interface ProjectSelectorProps {
  selectedProjectId: string | null;
  onSelectProject: (projectId: string | null) => void;
  onCreateNew: () => void;
}

export const ProjectSelector: React.FC<ProjectSelectorProps> = ({
  selectedProjectId,
  onSelectProject,
  onCreateNew,
}) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const token = localStorage.getItem('buildapp_auth_token');
      const response = await fetch(`${API_URL}/api/buyers/projects`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setProjects(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectedProject = projects.find((p) => p.id === selectedProjectId);

  return (
    <div>
      <h3
        style={{
          fontSize: typography.fontSize.lg,
          fontWeight: typography.fontWeight.semibold,
          color: colors.text.primary,
          margin: 0,
          marginBottom: spacing[1],
        }}
      >
        Project <span style={{ fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.normal, color: colors.text.tertiary }}>(Optional)</span>
      </h3>
      <p
        style={{
          fontSize: typography.fontSize.sm,
          color: colors.text.secondary,
          margin: 0,
          marginBottom: spacing[4],
        }}
      >
        Select a project to link this RFQ, or skip to continue without a project
      </p>

      {/* Project Dropdown */}
      <div style={{ position: 'relative', marginBottom: spacing[4] }}>
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          style={{
            width: '100%',
            padding: spacing[3],
            backgroundColor: colors.neutral[0],
            border: `1px solid ${colors.border.light}`,
            borderRadius: borderRadius.md,
            fontSize: typography.fontSize.base,
            textAlign: 'left',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2] }}>
            {selectedProject ? (
              <Icons.MapPin size={20} color={colors.text.primary} />
            ) : (
              <Icons.X size={20} color={colors.text.tertiary} />
            )}
            <span style={{ color: selectedProject ? colors.text.primary : colors.text.tertiary }}>
              {selectedProject ? selectedProject.name : 'None (Skip project)'}
            </span>
          </div>
          <Icons.ChevronDown size={20} color={colors.text.tertiary} />
        </button>

        {showDropdown && (
          <div
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              marginTop: spacing[1],
              backgroundColor: colors.neutral[0],
              border: `1px solid ${colors.border.light}`,
              borderRadius: borderRadius.md,
              boxShadow: shadows.lg,
              zIndex: 10,
              maxHeight: '300px',
              overflowY: 'auto',
            }}
          >
            {/* None Option */}
            <button
              onClick={() => {
                onSelectProject(null);
                setShowDropdown(false);
              }}
              style={{
                width: '100%',
                padding: spacing[3],
                backgroundColor: selectedProjectId === null ? colors.neutral[100] : 'transparent',
                border: 'none',
                borderBottom: `1px solid ${colors.border.light}`,
                textAlign: 'left',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: spacing[2],
              }}
              onMouseEnter={(e) => {
                if (selectedProjectId !== null) {
                  e.currentTarget.style.backgroundColor = colors.neutral[50];
                }
              }}
              onMouseLeave={(e) => {
                if (selectedProjectId !== null) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              <Icons.X size={20} color={colors.text.tertiary} />
              <span
                style={{
                  color: colors.text.tertiary,
                  fontWeight: typography.fontWeight.medium,
                  fontSize: typography.fontSize.sm,
                }}
              >
                None (Skip project)
              </span>
            </button>

            {/* Create New Project */}
            <button
              onClick={() => {
                setShowDropdown(false);
                onCreateNew();
              }}
              style={{
                width: '100%',
                padding: spacing[3],
                backgroundColor: 'transparent',
                border: 'none',
                borderBottom: `1px solid ${colors.border.light}`,
                textAlign: 'left',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: spacing[2],
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = colors.primary[50];
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <Icons.Plus size={20} color={colors.primary[600]} />
              <span
                style={{
                  color: colors.primary[600],
                  fontWeight: typography.fontWeight.medium,
                  fontSize: typography.fontSize.sm,
                }}
              >
                Create New Project
              </span>
            </button>

            {/* Existing Projects */}
            {loading ? (
              <div style={{ padding: spacing[4], textAlign: 'center' }}>
                <p style={{ fontSize: typography.fontSize.sm, color: colors.text.tertiary }}>
                  Loading projects...
                </p>
              </div>
            ) : projects.length === 0 ? (
              <div style={{ padding: spacing[4], textAlign: 'center' }}>
                <p style={{ fontSize: typography.fontSize.sm, color: colors.text.tertiary }}>
                  No projects yet
                </p>
              </div>
            ) : (
              projects.map((project) => (
                <button
                  key={project.id}
                  onClick={() => {
                    onSelectProject(project.id);
                    setShowDropdown(false);
                  }}
                  style={{
                    width: '100%',
                    padding: spacing[3],
                    backgroundColor:
                      selectedProjectId === project.id ? colors.primary[50] : 'transparent',
                    border: 'none',
                    borderBottom: `1px solid ${colors.border.light}`,
                    textAlign: 'left',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => {
                    if (selectedProjectId !== project.id) {
                      e.currentTarget.style.backgroundColor = colors.neutral[50];
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedProjectId !== project.id) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  <div
                    style={{
                      fontSize: typography.fontSize.base,
                      color: colors.text.primary,
                      fontWeight: typography.fontWeight.medium,
                      marginBottom: spacing[1],
                    }}
                  >
                    {project.name}
                  </div>
                  {project.address && (
                    <div
                      style={{
                        fontSize: typography.fontSize.sm,
                        color: colors.text.tertiary,
                      }}
                    >
                      {project.address}
                    </div>
                  )}
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {/* Selected Project Map Preview */}
      {selectedProject && (
        <div
          style={{
            backgroundColor: colors.neutral[0],
            border: `1px solid ${colors.border.light}`,
            borderRadius: borderRadius.lg,
            overflow: 'hidden',
            height: '200px',
          }}
        >
          <MapContainer
            center={[selectedProject.latitude, selectedProject.longitude]}
            zoom={15}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={[selectedProject.latitude, selectedProject.longitude]} />
          </MapContainer>
        </div>
      )}
    </div>
  );
};
