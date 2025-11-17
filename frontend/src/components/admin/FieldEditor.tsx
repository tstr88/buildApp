/**
 * Field Editor Component
 * For managing template input fields with drag & drop
 */

import { useState } from 'react';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme/tokens';
import { Icons } from '../icons/Icons';

interface FieldDefinition {
  name: string;
  type: 'number' | 'text' | 'pills' | 'toggle';
  label_ka: string;
  label_en: string;
  unit?: string;
  validation: {
    required?: boolean;
    min?: number;
    max?: number;
    options?: Array<{ value: string; label_ka: string; label_en: string }>;
  };
  default?: any;
  help_ka?: string;
  help_en?: string;
}

interface FieldEditorProps {
  fields: FieldDefinition[];
  onChange: (fields: FieldDefinition[]) => void;
}

export function FieldEditor({ fields, onChange }: FieldEditorProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingField, setEditingField] = useState<FieldDefinition | null>(null);

  const addField = () => {
    const newField: FieldDefinition = {
      name: '',
      type: 'number',
      label_ka: '',
      label_en: '',
      validation: {},
    };
    setEditingField(newField);
    setEditingIndex(fields.length);
  };

  const saveField = () => {
    if (!editingField || editingIndex === null) return;

    const newFields = [...fields];
    if (editingIndex < fields.length) {
      newFields[editingIndex] = editingField;
    } else {
      newFields.push(editingField);
    }
    onChange(newFields);
    setEditingField(null);
    setEditingIndex(null);
  };

  const deleteField = (index: number) => {
    const newFields = fields.filter((_, i) => i !== index);
    onChange(newFields);
  };

  const moveField = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= fields.length) return;

    const newFields = [...fields];
    [newFields[index], newFields[newIndex]] = [newFields[newIndex], newFields[index]];
    onChange(newFields);
  };

  return (
    <div>
      <div style={{ marginBottom: spacing[4], display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: typography.fontSize.xl, fontWeight: typography.fontWeight.bold }}>
          Template Fields
        </h2>
        <button
          onClick={addField}
          style={{
            padding: `${spacing[2]} ${spacing[4]}`,
            backgroundColor: colors.primary[600],
            color: colors.neutral[0],
            border: 'none',
            borderRadius: borderRadius.md,
            fontSize: typography.fontSize.sm,
            fontWeight: typography.fontWeight.semibold,
            cursor: 'pointer',
          }}
        >
          + Add Field
        </button>
      </div>

      {/* Field List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[3], marginBottom: spacing[6] }}>
        {fields.map((field, index) => (
          <div
            key={index}
            style={{
              padding: spacing[4],
              backgroundColor: colors.neutral[0],
              border: `1px solid ${colors.border.light}`,
              borderRadius: borderRadius.md,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: typography.fontWeight.semibold, marginBottom: spacing[1] }}>
                {field.label_en} ({field.name})
              </div>
              <div style={{ fontSize: typography.fontSize.sm, color: colors.text.tertiary }}>
                Type: {field.type} {field.unit && `| Unit: ${field.unit}`} {field.validation.required && '| Required'}
              </div>
            </div>
            <div style={{ display: 'flex', gap: spacing[2] }}>
              <button
                onClick={() => moveField(index, 'up')}
                disabled={index === 0}
                style={{
                  padding: spacing[2],
                  backgroundColor: 'transparent',
                  border: `1px solid ${colors.border.light}`,
                  borderRadius: borderRadius.sm,
                  cursor: index === 0 ? 'not-allowed' : 'pointer',
                  opacity: index === 0 ? 0.5 : 1,
                }}
              >
                ↑
              </button>
              <button
                onClick={() => moveField(index, 'down')}
                disabled={index === fields.length - 1}
                style={{
                  padding: spacing[2],
                  backgroundColor: 'transparent',
                  border: `1px solid ${colors.border.light}`,
                  borderRadius: borderRadius.sm,
                  cursor: index === fields.length - 1 ? 'not-allowed' : 'pointer',
                  opacity: index === fields.length - 1 ? 0.5 : 1,
                }}
              >
                ↓
              </button>
              <button
                onClick={() => {
                  setEditingField({ ...field });
                  setEditingIndex(index);
                }}
                style={{
                  padding: spacing[2],
                  backgroundColor: 'transparent',
                  border: `1px solid ${colors.border.light}`,
                  borderRadius: borderRadius.sm,
                  cursor: 'pointer',
                }}
              >
                Edit
              </button>
              <button
                onClick={() => deleteField(index)}
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

      {/* Edit Modal */}
      {editingField && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: colors.neutral[0],
              borderRadius: borderRadius.lg,
              padding: spacing[6],
              maxWidth: '600px',
              width: '90%',
              maxHeight: '80vh',
              overflow: 'auto',
              boxShadow: shadows.xl,
            }}
          >
            <h3 style={{ fontSize: typography.fontSize.xl, fontWeight: typography.fontWeight.bold, marginBottom: spacing[4] }}>
              {editingIndex !== null && editingIndex < fields.length ? 'Edit Field' : 'Add New Field'}
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[4] }}>
              <div>
                <label style={{ display: 'block', marginBottom: spacing[2], fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.medium }}>
                  Field Name (slug) *
                </label>
                <input
                  type="text"
                  value={editingField.name}
                  onChange={(e) => setEditingField({ ...editingField, name: e.target.value })}
                  placeholder="length, height, style, etc."
                  style={{
                    width: '100%',
                    padding: spacing[2],
                    border: `1px solid ${colors.border.light}`,
                    borderRadius: borderRadius.md,
                    fontSize: typography.fontSize.sm,
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: spacing[2], fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.medium }}>
                  Field Type *
                </label>
                <select
                  value={editingField.type}
                  onChange={(e) => setEditingField({ ...editingField, type: e.target.value as any })}
                  style={{
                    width: '100%',
                    padding: spacing[2],
                    border: `1px solid ${colors.border.light}`,
                    borderRadius: borderRadius.md,
                    fontSize: typography.fontSize.sm,
                  }}
                >
                  <option value="number">Number</option>
                  <option value="text">Text</option>
                  <option value="pills">Pills (Single/Multi-select)</option>
                  <option value="toggle">Toggle</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: spacing[3] }}>
                <div>
                  <label style={{ display: 'block', marginBottom: spacing[2], fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.medium }}>
                    Label (Georgian) *
                  </label>
                  <input
                    type="text"
                    value={editingField.label_ka}
                    onChange={(e) => setEditingField({ ...editingField, label_ka: e.target.value })}
                    placeholder="სიგრძე"
                    style={{
                      width: '100%',
                      padding: spacing[2],
                      border: `1px solid ${colors.border.light}`,
                      borderRadius: borderRadius.md,
                      fontSize: typography.fontSize.sm,
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: spacing[2], fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.medium }}>
                    Label (English) *
                  </label>
                  <input
                    type="text"
                    value={editingField.label_en}
                    onChange={(e) => setEditingField({ ...editingField, label_en: e.target.value })}
                    placeholder="Length"
                    style={{
                      width: '100%',
                      padding: spacing[2],
                      border: `1px solid ${colors.border.light}`,
                      borderRadius: borderRadius.md,
                      fontSize: typography.fontSize.sm,
                    }}
                  />
                </div>
              </div>

              {editingField.type === 'number' && (
                <>
                  <div>
                    <label style={{ display: 'block', marginBottom: spacing[2], fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.medium }}>
                      Unit
                    </label>
                    <input
                      type="text"
                      value={editingField.unit || ''}
                      onChange={(e) => setEditingField({ ...editingField, unit: e.target.value })}
                      placeholder="m, m², cm, etc."
                      style={{
                        width: '100%',
                        padding: spacing[2],
                        border: `1px solid ${colors.border.light}`,
                        borderRadius: borderRadius.md,
                        fontSize: typography.fontSize.sm,
                      }}
                    />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: spacing[3] }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: spacing[2], fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.medium }}>
                        Min Value
                      </label>
                      <input
                        type="number"
                        value={editingField.validation.min || ''}
                        onChange={(e) => setEditingField({
                          ...editingField,
                          validation: { ...editingField.validation, min: parseFloat(e.target.value) }
                        })}
                        style={{
                          width: '100%',
                          padding: spacing[2],
                          border: `1px solid ${colors.border.light}`,
                          borderRadius: borderRadius.md,
                          fontSize: typography.fontSize.sm,
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: spacing[2], fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.medium }}>
                        Max Value
                      </label>
                      <input
                        type="number"
                        value={editingField.validation.max || ''}
                        onChange={(e) => setEditingField({
                          ...editingField,
                          validation: { ...editingField.validation, max: parseFloat(e.target.value) }
                        })}
                        style={{
                          width: '100%',
                          padding: spacing[2],
                          border: `1px solid ${colors.border.light}`,
                          borderRadius: borderRadius.md,
                          fontSize: typography.fontSize.sm,
                        }}
                      />
                    </div>
                  </div>
                </>
              )}

              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: spacing[2], cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={editingField.validation.required || false}
                    onChange={(e) => setEditingField({
                      ...editingField,
                      validation: { ...editingField.validation, required: e.target.checked }
                    })}
                  />
                  <span style={{ fontSize: typography.fontSize.sm }}>Required field</span>
                </label>
              </div>
            </div>

            <div style={{ marginTop: spacing[6], display: 'flex', gap: spacing[2], justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setEditingField(null);
                  setEditingIndex(null);
                }}
                style={{
                  padding: `${spacing[2]} ${spacing[4]}`,
                  backgroundColor: 'transparent',
                  color: colors.text.secondary,
                  border: `1px solid ${colors.border.light}`,
                  borderRadius: borderRadius.md,
                  fontSize: typography.fontSize.sm,
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={saveField}
                style={{
                  padding: `${spacing[2]} ${spacing[4]}`,
                  backgroundColor: colors.primary[600],
                  color: colors.neutral[0],
                  border: 'none',
                  borderRadius: borderRadius.md,
                  fontSize: typography.fontSize.sm,
                  fontWeight: typography.fontWeight.semibold,
                  cursor: 'pointer',
                }}
              >
                Save Field
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
