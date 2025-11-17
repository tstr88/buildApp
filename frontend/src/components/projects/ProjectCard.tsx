/**
 * ProjectCard Component
 * Displays a single project card with summary information
 */

import { useTranslation } from 'react-i18next';
import type { Project } from '../../types/project';
import { Icons } from '../icons/Icons';
import { formatDate } from '../../utils/formatters';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme/tokens';

interface ProjectCardProps {
  project: Project;
  onClick: (id: string) => void;
}

export default function ProjectCard({ project, onClick }: ProjectCardProps) {
  const { t } = useTranslation();

  const hasLocation = project.latitude !== null && project.longitude !== null;

  return (
    <div
      onClick={() => onClick(project.id)}
      style={{
        backgroundColor: colors.neutral[0],
        borderRadius: borderRadius.lg,
        border: `1px solid ${colors.border.light}`,
        padding: spacing[4],
        boxShadow: shadows.sm,
        cursor: 'pointer',
        transition: 'box-shadow 200ms ease',
      }}
      onMouseEnter={(e) => e.currentTarget.style.boxShadow = shadows.md}
      onMouseLeave={(e) => e.currentTarget.style.boxShadow = shadows.sm}
    >
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        marginBottom: spacing[3],
      }}>
        <div style={{ flex: 1 }}>
          <h3 style={{
            fontSize: typography.fontSize.lg,
            fontWeight: typography.fontWeight.semibold,
            color: colors.text.primary,
            margin: 0,
            marginBottom: spacing[1],
          }}>{project.name}</h3>
          {hasLocation && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              fontSize: typography.fontSize.sm,
              color: colors.text.secondary,
            }}>
              <div style={{ marginRight: spacing[1], display: 'flex' }}>
                <Icons.MapPin size={16} color={colors.text.secondary} />
              </div>
              <span>
                {project.address || `${Number(project.latitude).toFixed(4)}, ${Number(project.longitude).toFixed(4)}`}
              </span>
            </div>
          )}
        </div>
        <div style={{ flexShrink: 0, marginLeft: spacing[2], display: 'flex' }}>
          <Icons.ChevronRight size={20} color={colors.text.tertiary} />
        </div>
      </div>

      {/* Date */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        fontSize: typography.fontSize.xs,
        color: colors.text.tertiary,
        marginBottom: spacing[3],
      }}>
        <div style={{ marginRight: spacing[1], display: 'flex' }}>
          <Icons.Calendar size={14} color={colors.text.tertiary} />
        </div>
        <span>{formatDate(project.created_at)}</span>
      </div>

      {/* Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: spacing[2],
        paddingTop: spacing[3],
        borderTop: `1px solid ${colors.neutral[100]}`,
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontSize: typography.fontSize.lg,
            fontWeight: typography.fontWeight.semibold,
            color: colors.text.primary,
          }}>{project.rfq_count || 0}</div>
          <div style={{
            fontSize: typography.fontSize.xs,
            color: colors.text.secondary,
          }}>{t('projects.card.rfqs')}</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontSize: typography.fontSize.lg,
            fontWeight: typography.fontWeight.semibold,
            color: colors.text.primary,
          }}>{project.order_count || 0}</div>
          <div style={{
            fontSize: typography.fontSize.xs,
            color: colors.text.secondary,
          }}>{t('projects.card.orders')}</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontSize: typography.fontSize.lg,
            fontWeight: typography.fontWeight.semibold,
            color: colors.text.primary,
          }}>{project.delivery_count || 0}</div>
          <div style={{
            fontSize: typography.fontSize.xs,
            color: colors.text.secondary,
          }}>{t('projects.card.deliveries')}</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontSize: typography.fontSize.lg,
            fontWeight: typography.fontWeight.semibold,
            color: colors.text.primary,
          }}>{project.rental_count || 0}</div>
          <div style={{
            fontSize: typography.fontSize.xs,
            color: colors.text.secondary,
          }}>{t('projects.card.rentals')}</div>
        </div>
      </div>

      {/* Notes Preview */}
      {project.notes && (
        <div style={{
          marginTop: spacing[3],
          paddingTop: spacing[3],
          borderTop: `1px solid ${colors.neutral[100]}`,
        }}>
          <p style={{
            fontSize: typography.fontSize.sm,
            color: colors.text.secondary,
            margin: 0,
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            textOverflow: 'ellipsis',
          }}>{project.notes}</p>
        </div>
      )}
    </div>
  );
}
