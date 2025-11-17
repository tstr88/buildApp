/**
 * Admin Queue Table Component
 * Reusable table for admin queue pages with sorting, filtering, and batch actions
 */

import React, { ReactNode } from 'react';
import { colors, spacing, typography, borderRadius } from '../../theme/tokens';

export interface ColumnDef<T> {
  key: string;
  header: string;
  render: (item: T) => ReactNode;
  sortable?: boolean;
  width?: string;
}

interface AdminQueueTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  keyExtractor: (item: T) => string;
  onSort?: (key: string) => void;
  sortKey?: string;
  sortDirection?: 'asc' | 'desc';
  selectable?: boolean;
  selectedItems?: Set<string>;
  onSelectItem?: (id: string) => void;
  onSelectAll?: () => void;
  emptyMessage?: string;
}

export function AdminQueueTable<T>({
  columns,
  data,
  keyExtractor,
  onSort,
  sortKey,
  sortDirection,
  selectable = false,
  selectedItems,
  onSelectItem,
  onSelectAll,
  emptyMessage = 'No items found',
}: AdminQueueTableProps<T>) {
  const handleHeaderClick = (columnKey: string, sortable?: boolean) => {
    if (sortable && onSort) {
      onSort(columnKey);
    }
  };

  const allSelected = selectable && selectedItems && data.length > 0 && data.every(item => selectedItems.has(keyExtractor(item)));

  return (
    <div style={{ overflowX: 'auto' }}>
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          backgroundColor: colors.neutral[0],
          borderRadius: borderRadius.lg,
          overflow: 'hidden',
        }}
      >
        <thead>
          <tr style={{ backgroundColor: colors.neutral[50], borderBottom: `1px solid ${colors.border.light}` }}>
            {selectable && (
              <th style={{ padding: spacing[3], textAlign: 'left', width: '40px' }}>
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={onSelectAll}
                  style={{ cursor: 'pointer' }}
                />
              </th>
            )}
            {columns.map((column) => (
              <th
                key={column.key}
                onClick={() => handleHeaderClick(column.key, column.sortable)}
                style={{
                  padding: spacing[3],
                  textAlign: 'left',
                  fontSize: typography.fontSize.sm,
                  fontWeight: typography.fontWeight.semibold,
                  color: colors.text.secondary,
                  cursor: column.sortable ? 'pointer' : 'default',
                  userSelect: 'none',
                  width: column.width,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: spacing[1] }}>
                  {column.header}
                  {column.sortable && sortKey === column.key && (
                    <span style={{ fontSize: '12px' }}>
                      {sortDirection === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length + (selectable ? 1 : 0)}
                style={{
                  padding: `${spacing[8]} ${spacing[3]}`,
                  textAlign: 'center',
                  color: colors.text.tertiary,
                  fontSize: typography.fontSize.sm,
                }}
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((item, index) => {
              const itemKey = keyExtractor(item);
              const isSelected = selectable && selectedItems?.has(itemKey);
              return (
                <tr
                  key={itemKey}
                  style={{
                    borderBottom: index < data.length - 1 ? `1px solid ${colors.border.light}` : 'none',
                    backgroundColor: isSelected ? colors.primary[50] : 'transparent',
                    transition: 'background-color 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.backgroundColor = colors.neutral[50];
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  {selectable && (
                    <td style={{ padding: spacing[3] }}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onSelectItem?.(itemKey)}
                        style={{ cursor: 'pointer' }}
                      />
                    </td>
                  )}
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      style={{
                        padding: spacing[3],
                        fontSize: typography.fontSize.sm,
                        color: colors.text.primary,
                      }}
                    >
                      {column.render(item)}
                    </td>
                  ))}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
