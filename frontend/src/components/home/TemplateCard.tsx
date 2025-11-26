/**
 * TemplateCard Component
 * Card for displaying project templates
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Icons } from '../icons/Icons';
import { colors, spacing, shadows, borderRadius, transitions, typography } from '../../theme/tokens';

interface TemplateCardProps {
  id: string;
  slug: string;
  title: string;
  description: string;
  icon?: keyof typeof Icons;
  imageUrl?: string;
  estimatedDuration?: number;
  difficulty?: 'easy' | 'medium' | 'hard' | 'beginner' | 'intermediate' | 'advanced' | 'professional';
}

export const TemplateCard: React.FC<TemplateCardProps> = ({
  slug,
  title,
  description,
  icon = 'Hammer',
  imageUrl,
  estimatedDuration,
  difficulty,
}) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [isPressed, setIsPressed] = useState(false);
  const Icon = Icons[icon];

  const handleClick = () => {
    navigate(`/template/${slug}`);
  };

  const difficultyColors: Record<string, any> = {
    easy: colors.success,
    beginner: colors.success,
    medium: colors.warning,
    intermediate: colors.warning,
    hard: colors.error,
    advanced: colors.error,
    professional: colors.error,
  };

  return (
    <button
      onClick={handleClick}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      style={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        padding: 0,
        border: `1px solid ${colors.border.light}`,
        backgroundColor: colors.neutral[0],
        borderRadius: borderRadius.lg,
        boxShadow: isPressed ? shadows.sm : shadows.md,
        cursor: 'pointer',
        transition: `all ${transitions.fast} ease`,
        transform: isPressed ? 'scale(0.98)' : 'scale(1)',
        textAlign: 'left',
        overflow: 'hidden',
        WebkitTapHighlightColor: 'transparent',
      }}
      aria-label={`${title} template`}
    >
      {/* Image or Icon Section */}
      <div
        style={{
          position: 'relative',
          height: '160px',
          backgroundColor: imageUrl ? colors.neutral[100] : colors.primary[50],
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        ) : (
          <Icon
            size={48}
            strokeWidth={1.5}
            color={colors.primary[600]}
          />
        )}

        {/* Difficulty Badge */}
        {difficulty && (
          <div
            style={{
              position: 'absolute',
              top: spacing[3],
              right: spacing[3],
              padding: `${spacing[1]} ${spacing[2]}`,
              backgroundColor: colors.neutral[0],
              borderRadius: borderRadius.base,
              fontSize: typography.fontSize.xs,
              fontWeight: typography.fontWeight.medium,
              color: difficultyColors[difficulty],
              boxShadow: shadows.sm,
            }}
          >
            {t(`difficulty.${difficulty}`)}
          </div>
        )}
      </div>

      {/* Content Section */}
      <div
        style={{
          padding: spacing[4],
          display: 'flex',
          flexDirection: 'column',
          gap: spacing[2],
        }}
      >
        {/* Title */}
        <h3
          style={{
            fontSize: typography.fontSize.lg,
            fontWeight: typography.fontWeight.semibold,
            color: colors.text.primary,
            margin: 0,
            lineHeight: typography.lineHeight.tight,
          }}
        >
          {title}
        </h3>

        {/* Description */}
        <p
          style={{
            fontSize: typography.fontSize.sm,
            color: colors.text.secondary,
            margin: 0,
            lineHeight: typography.lineHeight.normal,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {description}
        </p>

        {/* Meta Info */}
        {estimatedDuration && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: spacing[2],
              marginTop: spacing[1],
            }}
          >
            <Icons.Clock
              size={14}
              color={colors.text.tertiary}
            />
            <span
              style={{
                fontSize: typography.fontSize.xs,
                color: colors.text.tertiary,
              }}
            >
              {t('template.estimatedDuration', { days: estimatedDuration })}
            </span>
          </div>
        )}

        {/* CTA */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: spacing[2],
            paddingTop: spacing[3],
            borderTop: `1px solid ${colors.border.light}`,
          }}
        >
          <span
            style={{
              fontSize: typography.fontSize.sm,
              fontWeight: typography.fontWeight.medium,
              color: colors.primary[600],
            }}
          >
            {t('template.startProject')}
          </span>
          <Icons.ChevronRight
            size={20}
            color={colors.primary[600]}
          />
        </div>
      </div>
    </button>
  );
};
