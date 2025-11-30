/**
 * RFQ Line Editor Component
 * Allows adding/editing/removing line items with SKU autocomplete
 */

import React, { useState } from 'react';
import * as Icons from 'lucide-react';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme/tokens';

export type RFQLine = {
  id: string;
  sku_id?: string;
  description: string;
  quantity: number;
  unit: string;
  spec_notes?: string;
  base_price?: number; // Optional approximate price per unit
};

interface RFQLineEditorProps {
  lines: RFQLine[];
  onChange: (lines: RFQLine[]) => void;
}

export const RFQLineEditor: React.FC<RFQLineEditorProps> = ({ lines, onChange }) => {
  const [editingLine, setEditingLine] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const addNewLine = () => {
    const newLine: RFQLine = {
      id: `line-${Date.now()}`,
      description: '',
      quantity: 1,
      unit: 'm3',
      spec_notes: '',
    };
    onChange([...lines, newLine]);
    setEditingLine(newLine.id);
  };

  const updateLine = (lineId: string, updates: Partial<RFQLine>) => {
    onChange(
      lines.map((line) =>
        line.id === lineId ? { ...line, ...updates } : line
      )
    );
  };

  const removeLine = (lineId: string) => {
    onChange(lines.filter((line) => line.id !== lineId));
  };

  const units = ['m3', 'ton', 'piece', 'bag', 'kg', 'm', 'm2'];

  return (
    <div>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: spacing[4],
        }}
      >
        <div>
          <h3
            style={{
              fontSize: typography.fontSize.lg,
              fontWeight: typography.fontWeight.semibold,
              color: colors.text.primary,
              margin: 0,
            }}
          >
            Line Items
          </h3>
          <p
            style={{
              fontSize: typography.fontSize.sm,
              color: colors.text.secondary,
              margin: 0,
              marginTop: spacing[1],
            }}
          >
            Add materials or products you need
          </p>
        </div>
        <button
          onClick={addNewLine}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: spacing[2],
            padding: `${spacing[2]} ${spacing[4]}`,
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
          <Icons.Plus size={16} />
          Add Line
        </button>
      </div>

      {/* Lines Table/Cards */}
      {lines.length === 0 ? (
        <div
          style={{
            backgroundColor: colors.neutral[50],
            border: `2px dashed ${colors.border.light}`,
            borderRadius: borderRadius.lg,
            padding: spacing[8],
            textAlign: 'center',
          }}
        >
          <div style={{ marginBottom: spacing[4] }}>
            <Icons.Package size={48} color={colors.text.tertiary} style={{ margin: '0 auto' }} />
          </div>
          <p
            style={{
              fontSize: typography.fontSize.base,
              color: colors.text.secondary,
              margin: 0,
              marginBottom: spacing[2],
            }}
          >
            No items added yet
          </p>
          <p
            style={{
              fontSize: typography.fontSize.sm,
              color: colors.text.tertiary,
              margin: 0,
            }}
          >
            Click "Add Line" to add materials to your RFQ
          </p>
        </div>
      ) : window.innerWidth >= 768 ? (
        // Desktop: Table Layout
        <div
          style={{
            backgroundColor: colors.neutral[0],
            border: `1px solid ${colors.border.light}`,
            borderRadius: borderRadius.lg,
            overflow: 'hidden',
          }}
        >
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: colors.neutral[50] }}>
                <th
                  style={{
                    padding: spacing[3],
                    textAlign: 'left',
                    fontSize: typography.fontSize.xs,
                    fontWeight: typography.fontWeight.semibold,
                    color: colors.text.secondary,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  Description / Spec
                </th>
                <th
                  style={{
                    padding: spacing[3],
                    textAlign: 'left',
                    fontSize: typography.fontSize.xs,
                    fontWeight: typography.fontWeight.semibold,
                    color: colors.text.secondary,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    width: '120px',
                  }}
                >
                  Quantity
                </th>
                <th
                  style={{
                    padding: spacing[3],
                    textAlign: 'left',
                    fontSize: typography.fontSize.xs,
                    fontWeight: typography.fontWeight.semibold,
                    color: colors.text.secondary,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    width: '100px',
                  }}
                >
                  Unit
                </th>
                <th
                  style={{
                    padding: spacing[3],
                    textAlign: 'left',
                    fontSize: typography.fontSize.xs,
                    fontWeight: typography.fontWeight.semibold,
                    color: colors.text.secondary,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  Notes
                </th>
                <th style={{ width: '60px' }}></th>
              </tr>
            </thead>
            <tbody>
              {lines.map((line, index) => (
                <tr
                  key={line.id}
                  style={{
                    borderTop: index > 0 ? `1px solid ${colors.border.light}` : 'none',
                  }}
                >
                  <td style={{ padding: spacing[3] }}>
                    <input
                      type="text"
                      value={line.description}
                      onChange={(e) => updateLine(line.id, { description: e.target.value })}
                      placeholder="e.g., M250 Concrete"
                      style={{
                        width: '100%',
                        padding: spacing[2],
                        border: `1px solid ${colors.border.light}`,
                        borderRadius: borderRadius.md,
                        fontSize: typography.fontSize.sm,
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
                  </td>
                  <td style={{ padding: spacing[3] }}>
                    <input
                      type="number"
                      value={line.quantity}
                      onChange={(e) =>
                        updateLine(line.id, { quantity: parseFloat(e.target.value) || 0 })
                      }
                      min="0"
                      step="0.01"
                      style={{
                        width: '100%',
                        padding: spacing[2],
                        border: `1px solid ${colors.border.light}`,
                        borderRadius: borderRadius.md,
                        fontSize: typography.fontSize.sm,
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
                  </td>
                  <td style={{ padding: spacing[3] }}>
                    <select
                      value={line.unit}
                      onChange={(e) => updateLine(line.id, { unit: e.target.value })}
                      style={{
                        width: '100%',
                        padding: spacing[2],
                        height: '38px',
                        border: `1px solid ${colors.border.light}`,
                        borderRadius: borderRadius.md,
                        fontSize: typography.fontSize.sm,
                        backgroundColor: colors.neutral[0],
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = colors.primary[600];
                        e.target.style.boxShadow = `0 0 0 3px ${colors.primary[50]}`;
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = colors.border.light;
                        e.target.style.boxShadow = 'none';
                      }}
                    >
                      {units.map((unit) => (
                        <option key={unit} value={unit}>
                          {unit}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td style={{ padding: spacing[3] }}>
                    <input
                      type="text"
                      value={line.spec_notes || ''}
                      onChange={(e) => updateLine(line.id, { spec_notes: e.target.value })}
                      placeholder="Optional notes"
                      style={{
                        width: '100%',
                        padding: spacing[2],
                        border: `1px solid ${colors.border.light}`,
                        borderRadius: borderRadius.md,
                        fontSize: typography.fontSize.sm,
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
                  </td>
                  <td style={{ padding: spacing[3], textAlign: 'center' }}>
                    <button
                      onClick={() => removeLine(line.id)}
                      style={{
                        padding: spacing[2],
                        border: 'none',
                        backgroundColor: 'transparent',
                        cursor: 'pointer',
                        borderRadius: borderRadius.md,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = colors.error[50];
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      <Icons.Trash2 size={16} color={colors.error[600]} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        // Mobile: Card Layout
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[3] }}>
          {lines.map((line, index) => (
            <div
              key={line.id}
              style={{
                backgroundColor: colors.neutral[0],
                border: `1px solid ${colors.border.light}`,
                borderRadius: borderRadius.lg,
                padding: spacing[4],
                boxShadow: shadows.sm,
              }}
            >
              {/* Card Header with Delete Button */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: spacing[3],
                }}
              >
                <span
                  style={{
                    fontSize: typography.fontSize.xs,
                    fontWeight: typography.fontWeight.semibold,
                    color: colors.text.tertiary,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  Item {index + 1}
                </span>
                <button
                  onClick={() => removeLine(line.id)}
                  style={{
                    padding: spacing[2],
                    border: 'none',
                    backgroundColor: 'transparent',
                    cursor: 'pointer',
                    borderRadius: borderRadius.md,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = colors.error[50];
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <Icons.Trash2 size={16} color={colors.error[600]} />
                </button>
              </div>

              {/* Description Field */}
              <div style={{ marginBottom: spacing[3] }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: typography.fontSize.xs,
                    fontWeight: typography.fontWeight.medium,
                    color: colors.text.secondary,
                    marginBottom: spacing[1],
                  }}
                >
                  Description
                </label>
                <input
                  type="text"
                  value={line.description}
                  onChange={(e) => updateLine(line.id, { description: e.target.value })}
                  placeholder="e.g., M250 Concrete"
                  style={{
                    width: '100%',
                    padding: spacing[3],
                    border: `1px solid ${colors.border.light}`,
                    borderRadius: borderRadius.md,
                    fontSize: typography.fontSize.sm,
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

              {/* Quantity and Unit Fields */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: spacing[3],
                  marginBottom: spacing[3],
                }}
              >
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: typography.fontSize.xs,
                      fontWeight: typography.fontWeight.medium,
                      color: colors.text.secondary,
                      marginBottom: spacing[1],
                    }}
                  >
                    Quantity
                  </label>
                  <input
                    type="number"
                    value={line.quantity}
                    onChange={(e) =>
                      updateLine(line.id, { quantity: parseFloat(e.target.value) || 0 })
                    }
                    min="0"
                    step="0.01"
                    style={{
                      width: '100%',
                      padding: spacing[3],
                      height: '48px',
                      boxSizing: 'border-box',
                      border: `1px solid ${colors.border.light}`,
                      borderRadius: borderRadius.md,
                      fontSize: typography.fontSize.sm,
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
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: typography.fontSize.xs,
                      fontWeight: typography.fontWeight.medium,
                      color: colors.text.secondary,
                      marginBottom: spacing[1],
                    }}
                  >
                    Unit
                  </label>
                  <select
                    value={line.unit}
                    onChange={(e) => updateLine(line.id, { unit: e.target.value })}
                    style={{
                      width: '100%',
                      padding: spacing[3],
                      height: '48px',
                      boxSizing: 'border-box',
                      border: `1px solid ${colors.border.light}`,
                      borderRadius: borderRadius.md,
                      fontSize: typography.fontSize.sm,
                      backgroundColor: colors.neutral[0],
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = colors.primary[600];
                      e.target.style.boxShadow = `0 0 0 3px ${colors.primary[50]}`;
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = colors.border.light;
                      e.target.style.boxShadow = 'none';
                    }}
                  >
                    {units.map((unit) => (
                      <option key={unit} value={unit}>
                        {unit}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Notes Field */}
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: typography.fontSize.xs,
                    fontWeight: typography.fontWeight.medium,
                    color: colors.text.secondary,
                    marginBottom: spacing[1],
                  }}
                >
                  Notes (Optional)
                </label>
                <input
                  type="text"
                  value={line.spec_notes || ''}
                  onChange={(e) => updateLine(line.id, { spec_notes: e.target.value })}
                  placeholder="Optional notes"
                  style={{
                    width: '100%',
                    padding: spacing[3],
                    border: `1px solid ${colors.border.light}`,
                    borderRadius: borderRadius.md,
                    fontSize: typography.fontSize.sm,
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
            </div>
          ))}
        </div>
      )}

      {/* Line count and limit warning */}
      {lines.length > 0 && (
        <div
          style={{
            marginTop: spacing[3],
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <p
            style={{
              fontSize: typography.fontSize.sm,
              color: colors.text.tertiary,
              margin: 0,
            }}
          >
            {lines.length} {lines.length === 1 ? 'item' : 'items'} added
          </p>
          {lines.length >= 50 && (
            <p
              style={{
                fontSize: typography.fontSize.sm,
                color: colors.warning[700],
                margin: 0,
              }}
            >
              Maximum 50 items per RFQ
            </p>
          )}
        </div>
      )}
    </div>
  );
};
