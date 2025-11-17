/**
 * Projects Page
 * List of user's projects with search/filter and create button
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { Project } from '../types/project';
import { projectsService } from '../services/api/projectsService';
import ProjectCard from '../components/projects/ProjectCard';
import { Icons } from '../components/icons/Icons';
import { EmptyState } from '../components/common/EmptyState';
import { colors, spacing, typography, borderRadius, shadows } from '../theme/tokens';

export default function Projects() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Load projects
  useEffect(() => {
    loadProjects();
  }, []);

  // Filter projects when search query changes
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredProjects(projects);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = projects.filter(
        (project) =>
          project.name.toLowerCase().includes(query) ||
          project.address?.toLowerCase().includes(query) ||
          project.notes?.toLowerCase().includes(query)
      );
      setFilteredProjects(filtered);
    }
  }, [searchQuery, projects]);

  const loadProjects = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await projectsService.getProjects();
      setProjects(data);
      setFilteredProjects(data);
    } catch (err: any) {
      console.error('Failed to load projects:', err);
      setError(err.response?.data?.error || 'Failed to load projects');
    } finally {
      setIsLoading(false);
    }
  };

  const handleProjectClick = (id: string) => {
    navigate(`/projects/${id}`);
  };

  const handleCreateProject = () => {
    navigate('/projects/new');
  };

  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{
          width: '48px',
          height: '48px',
          border: `3px solid ${colors.border.light}`,
          borderTop: `3px solid ${colors.primary[600]}`,
          borderRadius: borderRadius.full,
          animation: 'spin 1s linear infinite',
        }}>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: spacing[4] }}>
        <div style={{
          backgroundColor: '#FEF2F2',
          border: `1px solid ${colors.error}`,
          borderRadius: borderRadius.lg,
          padding: spacing[4],
          textAlign: 'center',
        }}>
          <Icons.AlertCircle style={{
            width: '32px',
            height: '32px',
            color: colors.error,
            margin: `0 auto ${spacing[2]}`,
          }} />
          <p style={{
            color: '#7F1D1D',
            fontWeight: typography.fontWeight.medium,
            marginBottom: spacing[3],
          }}>{error}</p>
          <button
            onClick={loadProjects}
            style={{
              fontSize: typography.fontSize.sm,
              color: colors.error,
              textDecoration: 'underline',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'none'}
            onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'underline'}
          >
            {t('common.tryAgain')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: colors.background.secondary,
      paddingBottom: spacing[20],
    }}>
      {/* Header */}
      <div style={{
        backgroundColor: colors.neutral[0],
        borderBottom: `1px solid ${colors.border.light}`,
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}>
        <div style={{ padding: spacing[4] }}>
          <h1 style={{
            fontSize: typography.fontSize['2xl'],
            fontWeight: typography.fontWeight.bold,
            color: colors.text.primary,
            margin: 0,
            marginBottom: spacing[4],
          }}>
            {t('projects.title')}
          </h1>

          {/* Search Bar */}
          {projects.length > 0 && (
            <div style={{ position: 'relative' }}>
              <Icons.Search style={{
                position: 'absolute',
                left: spacing[3],
                top: '50%',
                transform: 'translateY(-50%)',
                width: '20px',
                height: '20px',
                color: colors.text.tertiary,
              }} />
              <input
                type="text"
                placeholder={t('projects.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  paddingLeft: '40px',
                  paddingRight: spacing[4],
                  paddingTop: spacing[2],
                  paddingBottom: spacing[2],
                  border: `1px solid ${colors.border.light}`,
                  borderRadius: borderRadius.lg,
                  fontSize: typography.fontSize.base,
                  outline: 'none',
                  fontFamily: typography.fontFamily.base,
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = colors.primary[600];
                  e.target.style.boxShadow = `0 0 0 3px ${colors.primary[50]}`;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = colors.border.light;
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: spacing[4] }}>
        {filteredProjects.length === 0 ? (
          projects.length === 0 ? (
            // Empty state - no projects at all
            <EmptyState
              icon={<Icons.FolderOpen style={{ width: '64px', height: '64px', color: colors.text.tertiary }} />}
              title={t('projects.empty.title')}
              description={t('projects.empty.description')}
              action={
                <button
                  onClick={handleCreateProject}
                  style={{
                    marginTop: spacing[4],
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: `${spacing[2]} ${spacing[4]}`,
                    backgroundColor: colors.primary[600],
                    color: colors.text.inverse,
                    borderRadius: borderRadius.lg,
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: typography.fontSize.base,
                    fontWeight: typography.fontWeight.medium,
                    transition: 'background-color 200ms ease',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.primary[700]}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = colors.primary[600]}
                >
                  <Icons.Plus style={{ width: '20px', height: '20px', marginRight: spacing[2] }} />
                  {t('projects.createNew')}
                </button>
              }
            />
          ) : (
            // No search results
            <EmptyState
              icon={<Icons.Search style={{ width: '64px', height: '64px', color: colors.text.tertiary }} />}
              title={t('projects.noResults.title')}
              description={t('projects.noResults.description')}
            />
          )
        ) : (
          // Projects Grid
          <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[3] }}>
            {filteredProjects.map((project) => (
              <ProjectCard key={project.id} project={project} onClick={handleProjectClick} />
            ))}
          </div>
        )}
      </div>

      {/* Floating Action Button */}
      {projects.length > 0 && (
        <button
          onClick={handleCreateProject}
          aria-label={t('projects.createNew')}
          style={{
            position: 'fixed',
            bottom: spacing[20],
            right: spacing[4],
            width: '56px',
            height: '56px',
            backgroundColor: colors.primary[600],
            color: colors.text.inverse,
            borderRadius: borderRadius.full,
            boxShadow: shadows.lg,
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 20,
            transition: 'all 200ms ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = colors.primary[700];
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = shadows.xl;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = colors.primary[600];
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = shadows.lg;
          }}
        >
          <Icons.Plus style={{ width: '24px', height: '24px' }} />
        </button>
      )}
    </div>
  );
}
