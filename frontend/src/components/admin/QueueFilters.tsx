/**
 * Queue Filters Component
 * Reusable filter panel for admin queues
 */

import React from 'react';
import { colors, spacing, typography, borderRadius } from '../../theme/tokens';

export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterDef {
  key: string;
  label: string;
  type: 'select' | 'search' | 'date';
  options?: FilterOption[];
  placeholder?: string;
}

interface QueueFiltersProps {
  filters: FilterDef[];
  values: Record<string, string>;
  onChange: (key: string, value: string) => void;
  onReset?: () => void;
}

export function QueueFilters({ filters, values, onChange, onReset }: QueueFiltersProps) {
  return (
    <div
      style={{
        backgroundColor: colors.neutral[0],
        padding: spacing[4],
        borderRadius: borderRadius.lg,
        border: `1px solid ${colors.border.light}`,
        marginBottom: spacing[4],
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: spacing[4],
        }}
      >
        {filters.map((filter) => (
          <div key={filter.key}>
            <label
              style={{
                display: 'block',
                fontSize: typography.fontSize.sm,
                fontWeight: typography.fontWeight.medium,
                color: colors.text.secondary,
                marginBottom: spacing[2],
              }}
            >
              {filter.label}
            </label>
            {filter.type === 'select' && filter.options && (
              <select
                value={values[filter.key] || ''}
                onChange={(e) => onChange(filter.key, e.target.value)}
                style={{
                  width: '100%',
                  padding: spacing[2],
                  fontSize: typography.fontSize.sm,
                  border: `1px solid ${colors.border.light}`,
                  borderRadius: borderRadius.md,
                  backgroundColor: colors.neutral[0],
                  cursor: 'pointer',
                }}
              >
                {filter.options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            )}
            {filter.type === 'search' && (
              <input
                type="text"
                value={values[filter.key] || ''}
                onChange={(e) => onChange(filter.key, e.target.value)}
                placeholder={filter.placeholder}
                style={{
                  width: '100%',
                  padding: spacing[2],
                  fontSize: typography.fontSize.sm,
                  border: `1px solid ${colors.border.light}`,
                  borderRadius: borderRadius.md,
                }}
              />
            )}
            {filter.type === 'date' && (
              <input
                type="date"
                value={values[filter.key] || ''}
                onChange={(e) => onChange(filter.key, e.target.value)}
                style={{
                  width: '100%',
                  padding: spacing[2],
                  fontSize: typography.fontSize.sm,
                  border: `1px solid ${colors.border.light}`,
                  borderRadius: borderRadius.md,
                }}
              />
            )}
          </div>
        ))}
      </div>
      {onReset && (
        <div style={{ marginTop: spacing[4] }}>
          <button
            onClick={onReset}
            style={{
              padding: `${spacing[2]} ${spacing[3]}`,
              fontSize: typography.fontSize.sm,
              fontWeight: typography.fontWeight.medium,
              color: colors.text.secondary,
              backgroundColor: colors.neutral[100],
              border: 'none',
              borderRadius: borderRadius.md,
              cursor: 'pointer',
            }}
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
}
