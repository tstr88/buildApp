/**
 * Template List Page
 * Admin page for viewing and managing construction templates
 */

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme/tokens';

interface Template {
  id: string;
  slug: string;
  titleKa: string;
  titleEn: string;
  descriptionKa?: string;
  descriptionEn?: string;
  iconUrl?: string;
  status: 'draft' | 'published';
  version: number;
  updatedAt: string;
  versionCount: number;
}

export function TemplateList() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'published'>('all');

  useEffect(() => {
    fetchTemplates();
  }, [token, statusFilter]);

  const fetchTemplates = async () => {
    if (!token) return;

    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }

      const response = await fetch(`http://localhost:3001/api/admin/templates?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        setTemplates(result.data.templates);
      }
    } catch (error) {
      console.error('Failed to fetch templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTitle = (template: Template) => {
    return i18n.language === 'ka' ? template.titleKa : template.titleEn;
  };

  const getDescription = (template: Template) => {
    return i18n.language === 'ka' ? template.descriptionKa : template.descriptionEn;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getStatusBadge = (status: string) => {
    const config = {
      published: { bg: colors.success[100], text: colors.success[700], label: 'Published' },
      draft: { bg: colors.warning[100], text: colors.warning[700], label: 'Draft' },
    };

    const statusConfig = config[status as keyof typeof config] || config.draft;

    return (
      <span
        style={{
          padding: `${spacing[1]} ${spacing[3]}`,
          backgroundColor: statusConfig.bg,
          color: statusConfig.text,
          borderRadius: borderRadius.full,
          fontSize: typography.fontSize.xs,
          fontWeight: typography.fontWeight.semibold,
        }}
      >
        {statusConfig.label}
      </span>
    );
  };

  return (
    <div style={{ padding: spacing[6], maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: spacing[6], display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1
            style={{
              fontSize: typography.fontSize['3xl'],
              fontWeight: typography.fontWeight.bold,
              color: colors.text.primary,
              marginBottom: spacing[2],
            }}
          >
            {t('admin.templates.title', 'Template Manager')}
          </h1>
          <p style={{ fontSize: typography.fontSize.base, color: colors.text.secondary }}>
            {t('admin.templates.subtitle', 'Create and manage construction project templates')}
          </p>
        </div>
        <button
          onClick={() => navigate('/admin/templates/new')}
          style={{
            padding: `${spacing[3]} ${spacing[4]}`,
            backgroundColor: colors.primary[600],
            color: colors.neutral[0],
            border: 'none',
            borderRadius: borderRadius.md,
            fontSize: typography.fontSize.sm,
            fontWeight: typography.fontWeight.semibold,
            cursor: 'pointer',
            boxShadow: shadows.sm,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = colors.primary[700];
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = colors.primary[600];
          }}
        >
          + {t('admin.templates.createNew', 'Create New Template')}
        </button>
      </div>

      {/* Filters */}
      <div style={{ marginBottom: spacing[4], display: 'flex', gap: spacing[2] }}>
        {(['all', 'published', 'draft'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            style={{
              padding: `${spacing[2]} ${spacing[4]}`,
              backgroundColor: statusFilter === status ? colors.primary[100] : 'transparent',
              border: `1px solid ${statusFilter === status ? colors.primary[600] : colors.border.light}`,
              borderRadius: borderRadius.md,
              color: statusFilter === status ? colors.primary[700] : colors.text.secondary,
              fontSize: typography.fontSize.sm,
              fontWeight: statusFilter === status ? typography.fontWeight.semibold : typography.fontWeight.normal,
              cursor: 'pointer',
            }}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Template Cards */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: spacing[8], color: colors.text.tertiary }}>
          {t('common.loading', 'Loading...')}
        </div>
      ) : templates.length === 0 ? (
        <div style={{ textAlign: 'center', padding: spacing[8], color: colors.text.tertiary }}>
          {t('admin.templates.noTemplates', 'No templates found')}
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
            gap: spacing[4],
          }}
        >
          {templates.map((template) => (
            <div
              key={template.id}
              style={{
                backgroundColor: colors.neutral[0],
                border: `1px solid ${colors.border.light}`,
                borderRadius: borderRadius.lg,
                padding: spacing[5],
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: shadows.sm,
              }}
              onClick={() => navigate(`/admin/templates/${template.slug}/edit`)}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = shadows.md;
                e.currentTarget.style.borderColor = colors.primary[300];
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = shadows.sm;
                e.currentTarget.style.borderColor = colors.border.light;
              }}
            >
              {/* Header */}
              <div style={{ marginBottom: spacing[3], display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3
                    style={{
                      fontSize: typography.fontSize.xl,
                      fontWeight: typography.fontWeight.bold,
                      color: colors.text.primary,
                      marginBottom: spacing[1],
                    }}
                  >
                    {getTitle(template)}
                  </h3>
                  <p
                    style={{
                      fontSize: typography.fontSize.sm,
                      color: colors.text.secondary,
                      marginBottom: spacing[2],
                    }}
                  >
                    {getDescription(template)}
                  </p>
                </div>
                {getStatusBadge(template.status)}
              </div>

              {/* Metadata */}
              <div style={{ display: 'flex', gap: spacing[4], fontSize: typography.fontSize.xs, color: colors.text.tertiary }}>
                <div>
                  <span style={{ fontWeight: typography.fontWeight.semibold }}>Version:</span> {template.version}
                </div>
                <div>
                  <span style={{ fontWeight: typography.fontWeight.semibold }}>Versions:</span> {template.versionCount}
                </div>
                <div>
                  <span style={{ fontWeight: typography.fontWeight.semibold }}>Updated:</span> {formatDate(template.updatedAt)}
                </div>
              </div>

              {/* Actions */}
              <div style={{ marginTop: spacing[4], display: 'flex', gap: spacing[2] }}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/admin/templates/${template.slug}/edit`);
                  }}
                  style={{
                    flex: 1,
                    padding: `${spacing[2]} ${spacing[3]}`,
                    backgroundColor: colors.primary[600],
                    color: colors.neutral[0],
                    border: 'none',
                    borderRadius: borderRadius.md,
                    fontSize: typography.fontSize.sm,
                    fontWeight: typography.fontWeight.medium,
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = colors.primary[700];
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = colors.primary[600];
                  }}
                >
                  Edit
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    // TODO: Implement duplicate
                    console.log('Duplicate', template.slug);
                  }}
                  style={{
                    padding: `${spacing[2]} ${spacing[3]}`,
                    backgroundColor: 'transparent',
                    color: colors.text.secondary,
                    border: `1px solid ${colors.border.light}`,
                    borderRadius: borderRadius.md,
                    fontSize: typography.fontSize.sm,
                    fontWeight: typography.fontWeight.medium,
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = colors.neutral[100];
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  Duplicate
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
