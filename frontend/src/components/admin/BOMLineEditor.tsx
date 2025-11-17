/**
 * BOM Line Editor Component
 * For managing bill-of-materials logic
 */

import { useState } from 'react';
import { colors, spacing, typography, borderRadius } from '../../theme/tokens';

interface BOMLine {
  item_spec: string;
  quantity_formula: string;
  unit: string;
  price_per_unit?: number;
}

interface BOMLineEditorProps {
  bomLines: BOMLine[];
  onChange: (bomLines: BOMLine[]) => void;
}

export function BOMLineEditor({ bomLines, onChange }: BOMLineEditorProps) {
  const [editing, setEditing] = useState<number | null>(null);

  const addLine = () => {
    onChange([...bomLines, { item_spec: '', quantity_formula: '', unit: '' }]);
    setEditing(bomLines.length);
  };

  const updateLine = (index: number, field: keyof BOMLine, value: any) => {
    const newLines = [...bomLines];
    newLines[index] = { ...newLines[index], [field]: value };
    onChange(newLines);
  };

  const deleteLine = (index: number) => {
    onChange(bomLines.filter((_, i) => i !== index));
  };

  return (
    <div>
      <div style={{ marginBottom: spacing[4], display: 'flex', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: typography.fontSize.xl, fontWeight: typography.fontWeight.bold, marginBottom: spacing[2] }}>
            BOM Logic
          </h2>
          <p style={{ fontSize: typography.fontSize.sm, color: colors.text.tertiary }}>
            Define how inputs map to bill-of-materials. Formulas are for documentation only.
          </p>
        </div>
        <button
          onClick={addLine}
          style={{
            padding: `${spacing[2]} ${spacing[4]}`,
            backgroundColor: colors.primary[600],
            color: colors.neutral[0],
            border: 'none',
            borderRadius: borderRadius.md,
            fontSize: typography.fontSize.sm,
            cursor: 'pointer',
          }}
        >
          + Add BOM Line
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[3] }}>
        {bomLines.map((line, index) => (
          <div
            key={index}
            style={{
              padding: spacing[4],
              backgroundColor: colors.neutral[50],
              border: `1px solid ${colors.border.light}`,
              borderRadius: borderRadius.md,
            }}
          >
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 3fr 1fr 1fr auto', gap: spacing[3], alignItems: 'end' }}>
              <div>
                <label style={{ display: 'block', marginBottom: spacing[1], fontSize: typography.fontSize.xs }}>
                  Item Spec
                </label>
                <input
                  type="text"
                  value={line.item_spec}
                  onChange={(e) => updateLine(index, 'item_spec', e.target.value)}
                  placeholder="Concrete M300"
                  style={{
                    width: '100%',
                    padding: spacing[2],
                    border: `1px solid ${colors.border.light}`,
                    borderRadius: borderRadius.sm,
                    fontSize: typography.fontSize.sm,
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: spacing[1], fontSize: typography.fontSize.xs }}>
                  Quantity Formula (description)
                </label>
                <input
                  type="text"
                  value={line.quantity_formula}
                  onChange={(e) => updateLine(index, 'quantity_formula', e.target.value)}
                  placeholder="(length × height) / 2"
                  style={{
                    width: '100%',
                    padding: spacing[2],
                    border: `1px solid ${colors.border.light}`,
                    borderRadius: borderRadius.sm,
                    fontSize: typography.fontSize.sm,
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: spacing[1], fontSize: typography.fontSize.xs }}>
                  Unit
                </label>
                <input
                  type="text"
                  value={line.unit}
                  onChange={(e) => updateLine(index, 'unit', e.target.value)}
                  placeholder="m³"
                  style={{
                    width: '100%',
                    padding: spacing[2],
                    border: `1px solid ${colors.border.light}`,
                    borderRadius: borderRadius.sm,
                    fontSize: typography.fontSize.sm,
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: spacing[1], fontSize: typography.fontSize.xs }}>
                  Price/Unit (₾)
                </label>
                <input
                  type="number"
                  value={line.price_per_unit || ''}
                  onChange={(e) => updateLine(index, 'price_per_unit', parseFloat(e.target.value) || undefined)}
                  placeholder="120"
                  style={{
                    width: '100%',
                    padding: spacing[2],
                    border: `1px solid ${colors.border.light}`,
                    borderRadius: borderRadius.sm,
                    fontSize: typography.fontSize.sm,
                  }}
                />
              </div>
              <button
                onClick={() => deleteLine(index)}
                style={{
                  padding: spacing[2],
                  backgroundColor: colors.error[600],
                  color: colors.neutral[0],
                  border: 'none',
                  borderRadius: borderRadius.sm,
                  cursor: 'pointer',
                }}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
