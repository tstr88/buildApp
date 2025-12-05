/**
 * SaveToProjectModal Component
 * Modal for saving template calculation results to a project
 */

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { Icons } from '../icons/Icons';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme/tokens';

interface Project {
  id: string;
  name: string;
  site_address?: string;
  created_at: string;
}

interface BOMItem {
  id: string;
  specification: string;
  specification_ka?: string;
  specification_en?: string;
  quantity: number;
  unit: string;
  unit_ka?: string;
  unit_en?: string;
  estimatedPrice?: number;
  category?: string;
}

interface ToolItem {
  id: string;
  name: string;
  name_ka?: string;
  name_en?: string;
  category: string;
  rental_duration_days: number;
  daily_rate_estimate: number;
  estimated_total: number;
  notes?: string;
}

interface InstructionStep {
  step: number;
  title_ka: string;
  title_en: string;
  description_ka: string;
  description_en: string;
  image_url?: string;
  duration_minutes?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  tools_needed?: string[];
  materials_needed?: string[];
  tips_ka?: string[];
  tips_en?: string[];
  warnings_ka?: string[];
  warnings_en?: string[];
  substeps?: Array<{
    text_ka: string;
    text_en: string;
    image_url?: string;
  }>;
}

interface SafetyNote {
  text_ka: string;
  text_en: string;
  severity: 'info' | 'warning' | 'critical';
  icon?: string;
}

interface TemplateInstructions {
  title_ka: string;
  title_en: string;
  estimated_duration_hours: number;
  difficulty: 'easy' | 'medium' | 'hard';
  people_required: number;
  steps: InstructionStep[];
  safety_notes: SafetyNote[];
}

interface SaveToProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  bom: BOMItem[];
  tools?: ToolItem[];
  templateSlug: string;
  templateInputs: Record<string, any>;
  totalPrice?: number;
  instructions?: TemplateInstructions;
}

export const SaveToProjectModal: React.FC<SaveToProjectModalProps> = ({
  isOpen,
  onClose,
  bom,
  tools = [],
  templateSlug,
  templateInputs,
  totalPrice,
  instructions,
}) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const isGeorgian = i18n.language === 'ka';

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  // Fetch user's projects
  useEffect(() => {
    if (isOpen) {
      fetchProjects();
    }
  }, [isOpen]);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const response = await api.get<{ projects?: Project[]; data?: Project[] }>('/buyers/projects');
      if (response.success) {
        const projectList = response.data?.projects || response.data?.data || [];
        setProjects(Array.isArray(projectList) ? projectList : []);
        // Auto-select first project if exists
        if (projectList.length > 0) {
          setSelectedProjectId(projectList[0].id);
        } else {
          setIsCreatingNew(true);
        }
      }
    } catch (err) {
      console.error('Failed to fetch projects:', err);
      setError(t('common.errorFetchingData'));
    } finally {
      setLoading(false);
    }
  };

  // Transform BOM items to materials format
  const transformBomToMaterials = () => {
    return bom.map((item, index) => ({
      name: isGeorgian ? (item.specification_ka || item.specification) : (item.specification_en || item.specification),
      description: item.category || null,
      quantity: item.quantity,
      unit: isGeorgian ? (item.unit_ka || item.unit) : (item.unit_en || item.unit),
      unit_price: item.estimatedPrice || null,
      estimated_total: item.estimatedPrice ? item.quantity * item.estimatedPrice : null,
      status: 'need_to_buy',
      sort_order: index,
    }));
  };

  // Transform tools to project tools format
  const transformToolsToProjectTools = () => {
    return tools.map((tool, index) => ({
      name: isGeorgian ? (tool.name_ka || tool.name) : (tool.name_en || tool.name),
      category: tool.category,
      description: tool.notes || null,
      rental_duration_days: tool.rental_duration_days,
      daily_rate_estimate: tool.daily_rate_estimate,
      estimated_total: tool.estimated_total,
      status: 'need_to_buy',
      sort_order: index,
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);

    try {
      // If creating new project, redirect to project form with materials and tools data
      if (isCreatingNew) {
        onClose();
        navigate('/projects/new', {
          state: {
            pendingMaterials: {
              materials: transformBomToMaterials(),
              tools: transformToolsToProjectTools(),
              template_slug: templateSlug,
              template_inputs: templateInputs,
              instructions: instructions?.steps || [],
              safety_notes: instructions?.safety_notes || [],
            },
          },
        });
        return;
      }

      const projectId = selectedProjectId;

      if (!projectId) {
        setError(t('project.errors.selectProject', 'Please select a project'));
        setSaving(false);
        return;
      }

      // Add materials to existing project
      const addMaterialsResponse = await api.post(`/buyers/projects/${projectId}/materials`, {
        materials: transformBomToMaterials(),
        template_slug: templateSlug,
        template_inputs: templateInputs,
      });

      // Add tools to existing project (if any)
      if (tools.length > 0) {
        const toolsResponse = await api.post(`/buyers/projects/${projectId}/tools`, {
          tools: transformToolsToProjectTools(),
          template_slug: templateSlug,
        });
        if (!toolsResponse.success) {
          console.error('Failed to save tools:', toolsResponse);
        }
      }

      // Save instructions to project (if any)
      if (instructions) {
        await api.put(`/buyers/projects/${projectId}/instructions`, {
          instructions: instructions.steps,
          safety_notes: instructions.safety_notes,
          template_slug: templateSlug,
          template_inputs: templateInputs,
        });
      }

      if (addMaterialsResponse.success) {
        onClose();
        // Navigate to the project detail page (instructions tab will be available)
        navigate(`/projects/${projectId}`);
      } else {
        throw new Error('Failed to add materials');
      }
    } catch (err) {
      console.error('Failed to save:', err);
      setError(t('common.saveFailed', 'Failed to save. Please try again.'));
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: spacing[4],
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          backgroundColor: colors.neutral[0],
          borderRadius: borderRadius.xl,
          boxShadow: shadows.xl,
          width: '100%',
          maxWidth: '480px',
          maxHeight: '90vh',
          overflow: 'auto',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: spacing[6],
            borderBottom: `1px solid ${colors.border.light}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing[3] }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                backgroundColor: colors.primary[100],
                borderRadius: borderRadius.md,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icons.FolderPlus size={20} color={colors.primary[600]} />
            </div>
            <div>
              <h2
                style={{
                  fontSize: typography.fontSize.xl,
                  fontWeight: typography.fontWeight.bold,
                  color: colors.text.primary,
                  margin: 0,
                }}
              >
                {t('project.saveToProject', 'Save to Project')}
              </h2>
              <p
                style={{
                  fontSize: typography.fontSize.sm,
                  color: colors.text.secondary,
                  margin: 0,
                }}
              >
                {bom.length} {t('project.materialsCount', 'materials')}
                {tools.length > 0 && `, ${tools.length} ${t('project.toolsCount', 'tools')}`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: 'none',
              backgroundColor: 'transparent',
              cursor: 'pointer',
              borderRadius: borderRadius.md,
            }}
          >
            <Icons.X size={20} color={colors.text.secondary} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: spacing[6] }}>
          {loading ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: spacing[8],
              }}
            >
              <div
                style={{
                  width: '24px',
                  height: '24px',
                  border: `3px solid ${colors.primary[200]}`,
                  borderTopColor: colors.primary[600],
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                }}
              />
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          ) : (
            <>
              {/* Toggle: Existing vs New */}
              <div
                style={{
                  display: 'flex',
                  backgroundColor: colors.neutral[100],
                  borderRadius: borderRadius.lg,
                  padding: '4px',
                  marginBottom: spacing[4],
                }}
              >
                <button
                  onClick={() => {
                    if (projects.length > 0) {
                      setIsCreatingNew(false);
                    }
                  }}
                  disabled={projects.length === 0}
                  style={{
                    flex: 1,
                    padding: `${spacing[3]} ${spacing[4]}`,
                    fontSize: typography.fontSize.sm,
                    fontWeight: typography.fontWeight.medium,
                    color: !isCreatingNew ? colors.text.inverse : colors.text.secondary,
                    backgroundColor: !isCreatingNew ? colors.primary[600] : 'transparent',
                    border: 'none',
                    borderRadius: borderRadius.md,
                    cursor: projects.length === 0 ? 'not-allowed' : 'pointer',
                    transition: 'all 200ms ease',
                    opacity: projects.length === 0 ? 0.5 : 1,
                  }}
                >
                  {t('project.existingProject', 'Existing Project')}
                </button>
                <button
                  onClick={() => setIsCreatingNew(true)}
                  style={{
                    flex: 1,
                    padding: `${spacing[3]} ${spacing[4]}`,
                    fontSize: typography.fontSize.sm,
                    fontWeight: typography.fontWeight.medium,
                    color: isCreatingNew ? colors.text.inverse : colors.text.secondary,
                    backgroundColor: isCreatingNew ? colors.primary[600] : 'transparent',
                    border: 'none',
                    borderRadius: borderRadius.md,
                    cursor: 'pointer',
                    transition: 'all 200ms ease',
                  }}
                >
                  {t('project.newProject', 'New Project')}
                </button>
              </div>

              {isCreatingNew ? (
                /* New Project Info */
                <div
                  style={{
                    padding: spacing[4],
                    backgroundColor: colors.primary[50],
                    borderRadius: borderRadius.md,
                    border: `1px solid ${colors.primary[200]}`,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2], marginBottom: spacing[2] }}>
                    <Icons.MapPin size={18} color={colors.primary[600]} />
                    <span style={{ fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.medium, color: colors.primary[700] }}>
                      {t('project.createNewWithLocation', 'Create New Project')}
                    </span>
                  </div>
                  <p style={{ fontSize: typography.fontSize.sm, color: colors.text.secondary, margin: 0 }}>
                    {t('project.newProjectInfo', "You'll be redirected to create a new project with name, location, and address. Your materials will be saved automatically.")}
                  </p>
                </div>
              ) : (
                /* Project List */
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: typography.fontSize.sm,
                      fontWeight: typography.fontWeight.medium,
                      color: colors.text.primary,
                      marginBottom: spacing[2],
                    }}
                  >
                    {t('project.selectProject', 'Select Project')}
                  </label>
                  <div
                    style={{
                      maxHeight: '240px',
                      overflowY: 'auto',
                      border: `1px solid ${colors.border.light}`,
                      borderRadius: borderRadius.md,
                    }}
                  >
                    {projects.map((project) => (
                      <div
                        key={project.id}
                        onClick={() => setSelectedProjectId(project.id)}
                        style={{
                          padding: spacing[4],
                          borderBottom: `1px solid ${colors.border.light}`,
                          cursor: 'pointer',
                          backgroundColor:
                            selectedProjectId === project.id
                              ? colors.primary[50]
                              : colors.neutral[0],
                          transition: 'background-color 150ms ease',
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: spacing[3],
                          }}
                        >
                          <div
                            style={{
                              width: '20px',
                              height: '20px',
                              borderRadius: '50%',
                              border: `2px solid ${
                                selectedProjectId === project.id
                                  ? colors.primary[600]
                                  : colors.border.default
                              }`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            {selectedProjectId === project.id && (
                              <div
                                style={{
                                  width: '10px',
                                  height: '10px',
                                  borderRadius: '50%',
                                  backgroundColor: colors.primary[600],
                                }}
                              />
                            )}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div
                              style={{
                                fontSize: typography.fontSize.base,
                                fontWeight: typography.fontWeight.medium,
                                color: colors.text.primary,
                              }}
                            >
                              {project.name}
                            </div>
                            {project.site_address && (
                              <div
                                style={{
                                  fontSize: typography.fontSize.sm,
                                  color: colors.text.secondary,
                                }}
                              >
                                {project.site_address}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div
                  style={{
                    marginTop: spacing[4],
                    padding: spacing[3],
                    backgroundColor: colors.error[50] || '#FEF2F2',
                    border: `1px solid ${colors.error[200] || '#E53935'}`,
                    borderRadius: borderRadius.md,
                    display: 'flex',
                    alignItems: 'center',
                    gap: spacing[2],
                  }}
                >
                  <Icons.AlertCircle size={16} color={colors.error[600] || '#E53935'} />
                  <span
                    style={{
                      fontSize: typography.fontSize.sm,
                      color: colors.error[700] || '#D32F2F',
                    }}
                  >
                    {error}
                  </span>
                </div>
              )}

              {/* Summary */}
              <div
                style={{
                  marginTop: spacing[4],
                  padding: spacing[4],
                  backgroundColor: colors.neutral[50],
                  borderRadius: borderRadius.md,
                }}
              >
                <div
                  style={{
                    fontSize: typography.fontSize.sm,
                    color: colors.text.secondary,
                    marginBottom: spacing[2],
                  }}
                >
                  {t('project.summary', 'Summary')}
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <span
                      style={{
                        fontSize: typography.fontSize.base,
                        color: colors.text.primary,
                      }}
                    >
                      {bom.length} {t('project.materials', 'materials')}
                    </span>
                    {tools.length > 0 && (
                      <span
                        style={{
                          fontSize: typography.fontSize.base,
                          color: colors.text.secondary,
                          marginLeft: spacing[2],
                        }}
                      >
                        + {tools.length} {t('project.tools', 'tools')}
                      </span>
                    )}
                  </div>
                  {totalPrice !== undefined && (
                    <span
                      style={{
                        fontSize: typography.fontSize.lg,
                        fontWeight: typography.fontWeight.bold,
                        color: colors.primary[600],
                      }}
                    >
                      ≈ {totalPrice.toLocaleString()} ₾
                    </span>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: spacing[6],
            borderTop: `1px solid ${colors.border.light}`,
            display: 'flex',
            gap: spacing[3],
          }}
        >
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: `${spacing[3]} ${spacing[4]}`,
              fontSize: typography.fontSize.base,
              fontWeight: typography.fontWeight.medium,
              color: colors.text.primary,
              backgroundColor: colors.neutral[100],
              border: 'none',
              borderRadius: borderRadius.md,
              cursor: 'pointer',
            }}
          >
            {t('common.cancel', 'Cancel')}
          </button>
          <button
            onClick={handleSave}
            disabled={saving || loading}
            style={{
              flex: 1,
              padding: `${spacing[3]} ${spacing[4]}`,
              fontSize: typography.fontSize.base,
              fontWeight: typography.fontWeight.semibold,
              color: colors.text.inverse,
              backgroundColor: saving ? colors.neutral[400] : colors.primary[600],
              border: 'none',
              borderRadius: borderRadius.md,
              cursor: saving || loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: spacing[2],
            }}
          >
            {saving ? (
              <>
                <div
                  style={{
                    width: '16px',
                    height: '16px',
                    border: `2px solid ${colors.neutral[0]}`,
                    borderTopColor: 'transparent',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                  }}
                />
                {t('common.saving', 'Saving...')}
              </>
            ) : isCreatingNew ? (
              <>
                {t('project.continueToCreate', 'Continue to Create Project')}
                <Icons.ChevronRight size={18} />
              </>
            ) : (
              <>
                <Icons.Check size={18} />
                {t('project.saveAndView', 'Save & View Materials')}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
