/**
 * Admin Dashboard Tile Component
 * Card displaying metric with breakdown and CTA
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import * as Icons from 'lucide-react';
import { colors, spacing, typography, borderRadius, shadows } from '../theme/tokens';
import { AlertBadge } from './AlertBadge';

interface StatItem {
  label: string;
  value: number | string;
  severity?: 'warning' | 'error' | 'info';
  color?: string;
}

interface AdminDashboardTileProps {
  title: string;
  count: number;
  icon: keyof typeof Icons;
  stats?: StatItem[];
  ctaLabel: string;
  ctaPath?: string;
  onCtaClick?: () => void;
}

export function AdminDashboardTile({ title, count, icon, stats, ctaLabel, ctaPath, onCtaClick }: AdminDashboardTileProps) {
  const navigate = useNavigate();
  const Icon = Icons[icon];

  const handleCta = () => {
    if (onCtaClick) {
      onCtaClick();
    } else if (ctaPath) {
      navigate(ctaPath);
    }
  };

  return (
    <div
      style={{
        backgroundColor: colors.neutral[0],
        padding: spacing[5],
        borderRadius: borderRadius.lg,
        border: `1px solid ${colors.border.light}`,
        boxShadow: shadows.md,
        display: 'flex',
        flexDirection: 'column',
        minHeight: '280px',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between', marginBottom: spacing[4] }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2], marginBottom: spacing[2] }}>
            <Icon size={20} color={colors.primary[600]} />
            <h3
              style={{
                fontSize: typography.fontSize.base,
                fontWeight: typography.fontWeight.semibold,
                color: colors.text.secondary,
                margin: 0,
              }}
            >
              {title}
            </h3>
          </div>
          <div
            style={{
              fontSize: typography.fontSize['3xl'],
              fontWeight: typography.fontWeight.bold,
              color: colors.text.primary,
            }}
          >
            {typeof count === 'number' ? count.toLocaleString() : count}
          </div>
        </div>
      </div>

      {/* Stats Breakdown */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: spacing[2], marginBottom: spacing[4] }}>
        {stats && stats.length > 0 && stats.map((stat, index) => (
          <div key={index} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: typography.fontSize.sm, color: colors.text.tertiary }}>{stat.label}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2] }}>
              {stat.severity && typeof stat.value === 'number' ? (
                <AlertBadge count={stat.value} severity={stat.severity} />
              ) : (
                <span
                  style={{
                    fontSize: typography.fontSize.sm,
                    fontWeight: typography.fontWeight.semibold,
                    color: stat.color || colors.text.primary,
                  }}
                >
                  {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* CTA Button */}
      <button
        onClick={handleCta}
        style={{
          width: '100%',
          padding: `${spacing[2]} ${spacing[4]}`,
          backgroundColor: colors.primary[600],
          border: 'none',
          borderRadius: borderRadius.md,
          color: colors.neutral[0],
          fontSize: typography.fontSize.sm,
          fontWeight: typography.fontWeight.medium,
          cursor: 'pointer',
          transition: 'background-color 0.2s',
          marginTop: 'auto',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = colors.primary[700];
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = colors.primary[600];
        }}
      >
        {ctaLabel}
      </button>
    </div>
  );
}
