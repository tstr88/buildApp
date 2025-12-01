/**
 * Projects Page
 * List of user's projects with modern inbox-style design
 * Matches RFQs and Orders page style
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import * as Icons from 'lucide-react';
import type { Project } from '../types/project';
import { projectsService } from '../services/api/projectsService';
import { colors, spacing, typography, borderRadius, shadows, heights } from '../theme/tokens';

// Hook for mobile detection
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768;
    }
    return false;
  });

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile;
};

type TabType = 'all' | 'active' | 'completed';

export default function Projects() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('all');

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await projectsService.getProjects();
      setProjects(data || []);
    } catch (err: any) {
      console.error('Failed to load projects:', err);
      setError(err.response?.data?.error || 'Failed to load projects');
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const locale = i18n.language === 'ka' ? 'ka-GE' : 'en-US';
    return date.toLocaleDateString(locale, { month: 'short', day: 'numeric' });
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return formatDate(dateString);
  };

  // Filter projects by tab
  const filterByTab = (project: Project) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'active') return project.status === 'active';
    if (activeTab === 'completed') return project.status === 'completed';
    return true;
  };

  const filteredProjects = projects.filter(filterByTab);

  // Count for tabs
  const allCount = projects.length;
  const activeCount = projects.filter((p) => p.status === 'active').length;
  const completedCount = projects.filter((p) => p.status === 'completed').length;

  const tabs = [
    { id: 'all', label: t('projects.tabs.all', 'All Projects'), icon: Icons.FolderOpen },
    { id: 'active', label: t('projects.tabs.active', 'Active'), icon: Icons.Building2 },
    { id: 'completed', label: t('projects.tabs.completed', 'Completed'), icon: Icons.CheckCircle },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return { bg: colors.success[100], text: colors.success[700] };
      case 'completed':
        return { bg: colors.info[100], text: colors.info[700] };
      case 'on_hold':
        return { bg: colors.warning[100], text: colors.warning[700] };
      default:
        return { bg: colors.neutral[100], text: colors.neutral[600] };
    }
  };

  // Mobile Layout
  if (isMobile) {
    return (
      <div
        style={{
          minHeight: '100vh',
          backgroundColor: colors.neutral[100],
          paddingBottom: `calc(${heights.bottomNav} + env(safe-area-inset-bottom, 0px) + 20px)`,
        }}
      >
        {/* Header */}
        <div
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 100,
            backgroundColor: colors.primary[600],
            padding: spacing[4],
            paddingTop: `calc(${spacing[4]} + env(safe-area-inset-top, 0px))`,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h1
                style={{
                  fontSize: typography.fontSize.xl,
                  fontWeight: typography.fontWeight.bold,
                  color: colors.neutral[0],
                  margin: 0,
                }}
              >
                {t('projects.title', 'My Projects')}
              </h1>
              <p
                style={{
                  fontSize: typography.fontSize.sm,
                  color: 'rgba(255,255,255,0.8)',
                  margin: 0,
                  marginTop: spacing[1],
                }}
              >
                {t('projects.subtitle', 'Manage your construction projects')}
              </p>
            </div>
            <button
              onClick={() => navigate('/projects/new')}
              style={{
                width: '44px',
                height: '44px',
                borderRadius: borderRadius.full,
                backgroundColor: colors.neutral[0],
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: shadows.md,
              }}
            >
              <Icons.Plus size={24} color={colors.primary[600]} />
            </button>
          </div>

          {/* Tab Pills */}
          <div
            style={{
              display: 'flex',
              gap: spacing[2],
              marginTop: spacing[4],
              overflowX: 'auto',
              WebkitOverflowScrolling: 'touch',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
          >
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: spacing[2],
                    padding: `${spacing[2]} ${spacing[3]}`,
                    backgroundColor: isActive ? colors.neutral[0] : 'rgba(255,255,255,0.15)',
                    border: 'none',
                    borderRadius: borderRadius.full,
                    fontSize: typography.fontSize.sm,
                    fontWeight: typography.fontWeight.medium,
                    color: isActive ? colors.primary[700] : colors.neutral[0],
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                  }}
                >
                  <tab.icon size={16} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: spacing[4] }}>
          {loading ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: spacing[12],
              }}
            >
              <Icons.Loader
                size={32}
                color={colors.primary[600]}
                style={{ animation: 'spin 1s linear infinite' }}
              />
              <p style={{ color: colors.text.secondary, marginTop: spacing[3] }}>
                {t('common.loading', 'Loading...')}
              </p>
            </div>
          ) : error ? (
            <div
              style={{
                backgroundColor: colors.error[50],
                borderRadius: borderRadius.xl,
                padding: spacing[6],
                textAlign: 'center',
              }}
            >
              <Icons.AlertCircle size={32} color={colors.error[600]} style={{ marginBottom: spacing[3] }} />
              <p style={{ color: colors.error[700], marginBottom: spacing[3] }}>{error}</p>
              <button
                onClick={loadProjects}
                style={{
                  padding: `${spacing[2]} ${spacing[4]}`,
                  backgroundColor: colors.error[600],
                  color: colors.neutral[0],
                  border: 'none',
                  borderRadius: borderRadius.md,
                  cursor: 'pointer',
                }}
              >
                {t('common.tryAgain', 'Try Again')}
              </button>
            </div>
          ) : filteredProjects.length === 0 ? (
            <div
              style={{
                backgroundColor: colors.neutral[0],
                borderRadius: borderRadius.xl,
                padding: spacing[8],
                textAlign: 'center',
                boxShadow: shadows.sm,
              }}
            >
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: borderRadius.full,
                  backgroundColor: colors.primary[100],
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto',
                  marginBottom: spacing[4],
                }}
              >
                <Icons.FolderOpen size={32} color={colors.primary[600]} />
              </div>
              <h3
                style={{
                  fontSize: typography.fontSize.lg,
                  fontWeight: typography.fontWeight.semibold,
                  color: colors.text.primary,
                  margin: 0,
                  marginBottom: spacing[2],
                }}
              >
                {t('projects.empty.title', 'No projects found')}
              </h3>
              <p
                style={{
                  fontSize: typography.fontSize.sm,
                  color: colors.text.secondary,
                  margin: 0,
                  marginBottom: spacing[4],
                }}
              >
                {projects.length === 0
                  ? t('projects.empty.description', 'Create your first project to get started')
                  : t('projects.empty.noMatching', 'No projects match the current filter')}
              </p>
              {projects.length === 0 && (
                <button
                  onClick={() => navigate('/projects/new')}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: spacing[2],
                    padding: `${spacing[3]} ${spacing[5]}`,
                    backgroundColor: colors.primary[600],
                    color: colors.neutral[0],
                    border: 'none',
                    borderRadius: borderRadius.lg,
                    fontSize: typography.fontSize.base,
                    fontWeight: typography.fontWeight.medium,
                    cursor: 'pointer',
                  }}
                >
                  <Icons.Plus size={18} />
                  {t('projects.createNew', 'Create Project')}
                </button>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[3] }}>
              {filteredProjects.map((project) => {
                const statusColor = getStatusColor(project.status || 'active');

                return (
                  <div
                    key={project.id}
                    onClick={() => navigate(`/projects/${project.id}`)}
                    style={{
                      backgroundColor: colors.neutral[0],
                      borderRadius: borderRadius.lg,
                      padding: spacing[4],
                      boxShadow: shadows.sm,
                      cursor: 'pointer',
                      border: `1px solid ${colors.border.light}`,
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                  >
                    {/* Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing[2] }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2], marginBottom: spacing[1] }}>
                          <span
                            style={{
                              fontSize: typography.fontSize.xs,
                              fontWeight: typography.fontWeight.medium,
                              padding: `2px ${spacing[2]}`,
                              borderRadius: borderRadius.full,
                              backgroundColor: statusColor.bg,
                              color: statusColor.text,
                              textTransform: 'capitalize',
                            }}
                          >
                            {project.status || 'active'}
                          </span>
                        </div>
                        <h3
                          style={{
                            fontSize: typography.fontSize.base,
                            fontWeight: typography.fontWeight.semibold,
                            color: colors.text.primary,
                            margin: 0,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {project.name}
                        </h3>
                      </div>
                      <span
                        style={{
                          fontSize: typography.fontSize.xs,
                          color: colors.text.tertiary,
                          flexShrink: 0,
                        }}
                      >
                        {formatRelativeTime(project.created_at)}
                      </span>
                    </div>

                    {/* Address */}
                    {project.address && (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: spacing[2],
                          marginBottom: spacing[3],
                        }}
                      >
                        <Icons.MapPin size={14} color={colors.text.tertiary} />
                        <span
                          style={{
                            fontSize: typography.fontSize.sm,
                            color: colors.text.secondary,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {project.address}
                        </span>
                      </div>
                    )}

                    {/* Stats */}
                    <div
                      style={{
                        display: 'flex',
                        gap: spacing[4],
                        paddingTop: spacing[3],
                        borderTop: `1px solid ${colors.border.light}`,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2] }}>
                        <Icons.Calendar size={14} color={colors.text.tertiary} />
                        <span style={{ fontSize: typography.fontSize.sm, color: colors.text.secondary }}>
                          {formatDate(project.created_at)}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2] }}>
                        <Icons.Building2 size={14} color={colors.info[600]} />
                        <span style={{ fontSize: typography.fontSize.sm, color: colors.text.secondary }}>
                          {t('projects.project', 'Project')}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Spin animation */}
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // Desktop Layout
  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: colors.neutral[100],
      }}
    >
      {/* Header */}
      <div
        style={{
          backgroundColor: colors.primary[600],
          padding: spacing[6],
          paddingTop: spacing[8],
          paddingBottom: spacing[8],
        }}
      >
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h1
                style={{
                  fontSize: typography.fontSize['2xl'],
                  fontWeight: typography.fontWeight.bold,
                  color: colors.neutral[0],
                  margin: 0,
                }}
              >
                {t('projects.title', 'My Projects')}
              </h1>
              <p
                style={{
                  fontSize: typography.fontSize.base,
                  color: 'rgba(255,255,255,0.8)',
                  margin: 0,
                  marginTop: spacing[2],
                }}
              >
                {t('projects.subtitle', 'Manage your construction projects')}
              </p>
            </div>
            <button
              onClick={() => navigate('/projects/new')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: spacing[2],
                padding: `${spacing[3]} ${spacing[5]}`,
                backgroundColor: colors.neutral[0],
                color: colors.primary[700],
                border: 'none',
                borderRadius: borderRadius.lg,
                fontSize: typography.fontSize.base,
                fontWeight: typography.fontWeight.semibold,
                cursor: 'pointer',
                boxShadow: shadows.md,
              }}
            >
              <Icons.Plus size={20} />
              {t('projects.createNew', 'New Project')}
            </button>
          </div>

          {/* Tab Pills */}
          <div
            style={{
              display: 'flex',
              gap: spacing[2],
              marginTop: spacing[6],
            }}
          >
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: spacing[2],
                    padding: `${spacing[2]} ${spacing[4]}`,
                    backgroundColor: isActive ? colors.neutral[0] : 'rgba(255,255,255,0.15)',
                    border: 'none',
                    borderRadius: borderRadius.full,
                    fontSize: typography.fontSize.sm,
                    fontWeight: typography.fontWeight.medium,
                    color: isActive ? colors.primary[700] : colors.neutral[0],
                    cursor: 'pointer',
                    transition: 'all 200ms ease',
                  }}
                >
                  <tab.icon size={18} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: spacing[6] }}>
        {loading ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: spacing[16],
            }}
          >
            <Icons.Loader
              size={40}
              color={colors.primary[600]}
              style={{ animation: 'spin 1s linear infinite' }}
            />
            <p style={{ color: colors.text.secondary, marginTop: spacing[4] }}>
              {t('common.loading', 'Loading...')}
            </p>
          </div>
        ) : error ? (
          <div
            style={{
              backgroundColor: colors.error[50],
              borderRadius: borderRadius.xl,
              padding: spacing[8],
              textAlign: 'center',
            }}
          >
            <Icons.AlertCircle size={40} color={colors.error[600]} style={{ marginBottom: spacing[4] }} />
            <p style={{ color: colors.error[700], marginBottom: spacing[4], fontSize: typography.fontSize.lg }}>{error}</p>
            <button
              onClick={loadProjects}
              style={{
                padding: `${spacing[3]} ${spacing[5]}`,
                backgroundColor: colors.error[600],
                color: colors.neutral[0],
                border: 'none',
                borderRadius: borderRadius.lg,
                cursor: 'pointer',
                fontSize: typography.fontSize.base,
              }}
            >
              {t('common.tryAgain', 'Try Again')}
            </button>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div
            style={{
              backgroundColor: colors.neutral[0],
              borderRadius: borderRadius.xl,
              padding: spacing[12],
              textAlign: 'center',
              boxShadow: shadows.sm,
            }}
          >
            <div
              style={{
                width: '80px',
                height: '80px',
                borderRadius: borderRadius.full,
                backgroundColor: colors.primary[100],
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto',
                marginBottom: spacing[5],
              }}
            >
              <Icons.FolderOpen size={40} color={colors.primary[600]} />
            </div>
            <h3
              style={{
                fontSize: typography.fontSize.xl,
                fontWeight: typography.fontWeight.semibold,
                color: colors.text.primary,
                margin: 0,
                marginBottom: spacing[2],
              }}
            >
              {t('projects.empty.title', 'No projects found')}
            </h3>
            <p
              style={{
                fontSize: typography.fontSize.base,
                color: colors.text.secondary,
                margin: 0,
                marginBottom: spacing[6],
              }}
            >
              {projects.length === 0
                ? t('projects.empty.description', 'Create your first project to get started')
                : t('projects.empty.noMatching', 'No projects match the current filter')}
            </p>
            {projects.length === 0 && (
              <button
                onClick={() => navigate('/projects/new')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: spacing[2],
                  padding: `${spacing[3]} ${spacing[6]}`,
                  backgroundColor: colors.primary[600],
                  color: colors.neutral[0],
                  border: 'none',
                  borderRadius: borderRadius.lg,
                  fontSize: typography.fontSize.base,
                  fontWeight: typography.fontWeight.medium,
                  cursor: 'pointer',
                }}
              >
                <Icons.Plus size={20} />
                {t('projects.createFirstProject', 'Create Your First Project')}
              </button>
            )}
          </div>
        ) : (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: spacing[3],
            }}
          >
            {filteredProjects.map((project) => {
              const statusColor = getStatusColor(project.status || 'active');

              return (
                <div
                  key={project.id}
                  onClick={() => navigate(`/projects/${project.id}`)}
                  style={{
                    backgroundColor: colors.neutral[0],
                    borderRadius: borderRadius.lg,
                    padding: spacing[5],
                    boxShadow: shadows.sm,
                    cursor: 'pointer',
                    border: `1px solid ${colors.border.light}`,
                    transition: 'all 200ms ease',
                    position: 'relative',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    gap: spacing[5],
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = shadows.md;
                    e.currentTarget.style.backgroundColor = colors.neutral[50];
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = shadows.sm;
                    e.currentTarget.style.backgroundColor = colors.neutral[0];
                  }}
                >
                  {/* Icon */}
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: borderRadius.lg,
                      backgroundColor: colors.primary[100],
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Icons.Building2 size={24} color={colors.primary[600]} />
                  </div>

                  {/* Main Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {/* Status row */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: spacing[3], marginBottom: spacing[1] }}>
                      <span
                        style={{
                          fontSize: typography.fontSize.xs,
                          fontWeight: typography.fontWeight.medium,
                          padding: `${spacing[1]} ${spacing[2]}`,
                          borderRadius: borderRadius.full,
                          backgroundColor: statusColor.bg,
                          color: statusColor.text,
                          textTransform: 'capitalize',
                          flexShrink: 0,
                        }}
                      >
                        {project.status || 'active'}
                      </span>
                    </div>

                    {/* Project name */}
                    <h3
                      style={{
                        fontSize: typography.fontSize.base,
                        fontWeight: typography.fontWeight.semibold,
                        color: colors.text.primary,
                        margin: 0,
                        marginBottom: spacing[2],
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {project.name}
                    </h3>

                    {/* Info row */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: spacing[4] }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: spacing[1] }}>
                        <Icons.Calendar size={14} color={colors.text.tertiary} />
                        <span style={{ fontSize: typography.fontSize.sm, color: colors.text.secondary }}>
                          {formatDate(project.created_at)}
                        </span>
                      </div>
                      {project.address && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: spacing[1] }}>
                          <Icons.MapPin size={14} color={colors.text.tertiary} />
                          <span
                            style={{
                              fontSize: typography.fontSize.sm,
                              color: colors.text.secondary,
                              maxWidth: '300px',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {project.address}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right side - timestamp and arrow */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: spacing[4],
                      flexShrink: 0,
                    }}
                  >
                    <span
                      style={{
                        fontSize: typography.fontSize.sm,
                        color: colors.text.tertiary,
                      }}
                    >
                      {formatRelativeTime(project.created_at)}
                    </span>
                    <Icons.ChevronRight size={20} color={colors.text.tertiary} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Spin animation */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
