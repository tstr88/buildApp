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

interface SaveToProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  bom: BOMItem[];
  templateSlug: string;
  templateInputs: Record<string, any>;
  totalPrice?: number;
}

export const SaveToProjectModal: React.FC<SaveToProjectModalProps> = ({
  isOpen,
  onClose,
  bom,
  templateSlug,
  templateInputs,
  totalPrice,
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
  const [newProjectName, setNewProjectName] = useState('');

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

  const handleSave = async () => {
    setSaving(true);
    setError(null);

    try {
      let projectId = selectedProjectId;

      // Create new project if needed
      if (isCreatingNew) {
        if (!newProjectName.trim()) {
          setError(t('project.errors.nameRequired', 'Project name is required'));
          setSaving(false);
          return;
        }

        const createResponse = await api.post<{ project?: { id: string }; data?: { id: string } }>('/buyers/projects', {
          name: newProjectName.trim(),
        });

        if (createResponse.success) {
          projectId = createResponse.data?.project?.id || createResponse.data?.data?.id;
        } else {
          throw new Error('Failed to create project');
        }
      }

      if (!projectId) {
        setError(t('project.errors.selectProject', 'Please select a project'));
        setSaving(false);
        return;
      }

      // Transform BOM items to materials format
      const materials = bom.map((item, index) => ({
        name: isGeorgian ? (item.specification_ka || item.specification) : (item.specification_en || item.specification),
        description: item.category || null,
        quantity: item.quantity,
        unit: isGeorgian ? (item.unit_ka || item.unit) : (item.unit_en || item.unit),
        unit_price: item.estimatedPrice || null,
        estimated_total: item.estimatedPrice ? item.quantity * item.estimatedPrice : null,
        status: 'need_to_buy',
        sort_order: index,
      }));

      // Add materials to project
      const addResponse = await api.post(`/buyers/projects/${projectId}/materials`, {
        materials,
        template_slug: templateSlug,
        template_inputs: templateInputs,
      });

      if (addResponse.success) {
        onClose();
        // Navigate to the project materials page
        navigate(`/projects/${projectId}/materials`);
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
                  onClick={() => setIsCreatingNew(false)}
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
                /* New Project Form */
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
                    {t('project.projectName', 'Project Name')}
                  </label>
                  <input
                    type="text"
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    placeholder={t('project.projectNamePlaceholder', 'e.g., Home Renovation')}
                    style={{
                      width: '100%',
                      padding: spacing[3],
                      fontSize: typography.fontSize.base,
                      border: `1px solid ${colors.border.default}`,
                      borderRadius: borderRadius.md,
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                    autoFocus
                  />
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
                    border: `1px solid ${colors.error[200] || colors.error}`,
                    borderRadius: borderRadius.md,
                    display: 'flex',
                    alignItems: 'center',
                    gap: spacing[2],
                  }}
                >
                  <Icons.AlertCircle size={16} color={colors.error[600] || colors.error} />
                  <span
                    style={{
                      fontSize: typography.fontSize.sm,
                      color: colors.error[700] || colors.error,
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
                  <span
                    style={{
                      fontSize: typography.fontSize.base,
                      color: colors.text.primary,
                    }}
                  >
                    {bom.length} {t('project.items', 'items')}
                  </span>
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
