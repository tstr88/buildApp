/**
 * Template Preview Component
 * Shows how the template will appear to buyers
 */

import { useState } from 'react';
import { colors, spacing, typography, borderRadius } from '../../theme/tokens';

interface TemplatePreviewProps {
  template: any;
}

export function TemplatePreview({ template }: TemplatePreviewProps) {
  const [language, setLanguage] = useState<'ka' | 'en'>('en');
  const [formData, setFormData] = useState<Record<string, any>>({});

  const getLabel = (item: any) => {
    return language === 'ka' ? item.label_ka || item.title_ka || item.text_ka : item.label_en || item.title_en || item.text_en;
  };

  const renderField = (field: any) => {
    switch (field.type) {
      case 'number':
        return (
          <div key={field.name} style={{ marginBottom: spacing[4] }}>
            <label style={{ display: 'block', marginBottom: spacing[2], fontWeight: typography.fontWeight.medium }}>
              {getLabel(field)} {field.validation?.required && <span style={{ color: colors.error[600] }}>*</span>}
            </label>
            {field.help_ka && language === 'ka' && (
              <p style={{ fontSize: typography.fontSize.xs, color: colors.text.tertiary, marginBottom: spacing[1] }}>
                {field.help_ka}
              </p>
            )}
            {field.help_en && language === 'en' && (
              <p style={{ fontSize: typography.fontSize.xs, color: colors.text.tertiary, marginBottom: spacing[1] }}>
                {field.help_en}
              </p>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2] }}>
              <input
                type="number"
                min={field.validation?.min}
                max={field.validation?.max}
                value={formData[field.name] || ''}
                onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                style={{
                  flex: 1,
                  padding: spacing[2],
                  border: `1px solid ${colors.border.light}`,
                  borderRadius: borderRadius.md,
                  fontSize: typography.fontSize.sm,
                }}
              />
              {field.unit && <span style={{ color: colors.text.tertiary }}>{field.unit}</span>}
            </div>
          </div>
        );

      case 'text':
        return (
          <div key={field.name} style={{ marginBottom: spacing[4] }}>
            <label style={{ display: 'block', marginBottom: spacing[2], fontWeight: typography.fontWeight.medium }}>
              {getLabel(field)} {field.validation?.required && <span style={{ color: colors.error[600] }}>*</span>}
            </label>
            <input
              type="text"
              value={formData[field.name] || ''}
              onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
              style={{
                width: '100%',
                padding: spacing[2],
                border: `1px solid ${colors.border.light}`,
                borderRadius: borderRadius.md,
                fontSize: typography.fontSize.sm,
              }}
            />
          </div>
        );

      case 'pills':
        return (
          <div key={field.name} style={{ marginBottom: spacing[4] }}>
            <label style={{ display: 'block', marginBottom: spacing[2], fontWeight: typography.fontWeight.medium }}>
              {getLabel(field)} {field.validation?.required && <span style={{ color: colors.error[600] }}>*</span>}
            </label>
            <div style={{ display: 'flex', gap: spacing[2], flexWrap: 'wrap' }}>
              {field.validation?.options?.map((option: any) => (
                <button
                  key={option.value}
                  onClick={() => setFormData({ ...formData, [field.name]: option.value })}
                  style={{
                    padding: `${spacing[2]} ${spacing[3]}`,
                    backgroundColor: formData[field.name] === option.value ? colors.primary[600] : colors.neutral[100],
                    color: formData[field.name] === option.value ? colors.neutral[0] : colors.text.primary,
                    border: `1px solid ${formData[field.name] === option.value ? colors.primary[600] : colors.border.light}`,
                    borderRadius: borderRadius.full,
                    fontSize: typography.fontSize.sm,
                    cursor: 'pointer',
                  }}
                >
                  {getLabel(option)}
                </button>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return { bg: colors.error[50], border: colors.error[600] };
      case 'warning':
        return { bg: colors.warning[50], border: colors.warning[600] };
      case 'info':
        return { bg: colors.info[50], border: colors.info[600] };
      default:
        return { bg: colors.neutral[50], border: colors.neutral[600] };
    }
  };

  return (
    <div>
      <div style={{ marginBottom: spacing[4], display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: typography.fontSize.xl, fontWeight: typography.fontWeight.bold }}>
          Template Preview
        </h2>
        <div style={{ display: 'flex', gap: spacing[2] }}>
          <button
            onClick={() => setLanguage('ka')}
            style={{
              padding: `${spacing[2]} ${spacing[3]}`,
              backgroundColor: language === 'ka' ? colors.primary[600] : 'transparent',
              color: language === 'ka' ? colors.neutral[0] : colors.text.secondary,
              border: `1px solid ${language === 'ka' ? colors.primary[600] : colors.border.light}`,
              borderRadius: borderRadius.md,
              fontSize: typography.fontSize.sm,
              cursor: 'pointer',
            }}
          >
            ქართული
          </button>
          <button
            onClick={() => setLanguage('en')}
            style={{
              padding: `${spacing[2]} ${spacing[3]}`,
              backgroundColor: language === 'en' ? colors.primary[600] : 'transparent',
              color: language === 'en' ? colors.neutral[0] : colors.text.secondary,
              border: `1px solid ${language === 'en' ? colors.primary[600] : colors.border.light}`,
              borderRadius: borderRadius.md,
              fontSize: typography.fontSize.sm,
              cursor: 'pointer',
            }}
          >
            English
          </button>
        </div>
      </div>

      <div
        style={{
          maxWidth: '600px',
          margin: '0 auto',
          backgroundColor: colors.neutral[0],
          border: `1px solid ${colors.border.light}`,
          borderRadius: borderRadius.lg,
          padding: spacing[6],
        }}
      >
        {/* Template Title */}
        <h1 style={{ fontSize: typography.fontSize['2xl'], fontWeight: typography.fontWeight.bold, marginBottom: spacing[2] }}>
          {language === 'ka' ? template.titleKa : template.titleEn}
        </h1>
        {(template.descriptionKa || template.descriptionEn) && (
          <p style={{ fontSize: typography.fontSize.base, color: colors.text.secondary, marginBottom: spacing[6] }}>
            {language === 'ka' ? template.descriptionKa : template.descriptionEn}
          </p>
        )}

        {/* Safety Notes */}
        {template.safetyNotes && template.safetyNotes.length > 0 && (
          <div style={{ marginBottom: spacing[6] }}>
            {template.safetyNotes.map((note: any, index: number) => {
              const severityColors = getSeverityColor(note.severity);
              return (
                <div
                  key={index}
                  style={{
                    padding: spacing[3],
                    backgroundColor: severityColors.bg,
                    borderLeft: `4px solid ${severityColors.border}`,
                    borderRadius: borderRadius.md,
                    marginBottom: spacing[2],
                    fontSize: typography.fontSize.sm,
                  }}
                >
                  ⚠️ {getLabel(note)}
                </div>
              );
            })}
          </div>
        )}

        {/* Fields */}
        <div>
          {template.fields && template.fields.map((field: any) => renderField(field))}
        </div>

        {/* Instructions (collapsible) */}
        {template.instructions && template.instructions.length > 0 && (
          <div style={{ marginTop: spacing[6], padding: spacing[4], backgroundColor: colors.neutral[50], borderRadius: borderRadius.md }}>
            <h3 style={{ fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.bold, marginBottom: spacing[3] }}>
              {language === 'ka' ? 'ინსტრუქციები' : 'Instructions'}
            </h3>
            {template.instructions.map((step: any) => (
              <div key={step.step} style={{ marginBottom: spacing[3] }}>
                <div style={{ fontWeight: typography.fontWeight.semibold, marginBottom: spacing[1] }}>
                  {step.step}. {getLabel(step)}
                </div>
                <div style={{ fontSize: typography.fontSize.sm, color: colors.text.secondary }}>
                  {language === 'ka' ? step.description_ka : step.description_en}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* BOM Preview (if fields filled) */}
        {template.bomLogic && template.bomLogic.length > 0 && Object.keys(formData).length > 0 && (
          <div style={{ marginTop: spacing[6], padding: spacing[4], backgroundColor: colors.primary[50], borderRadius: borderRadius.md }}>
            <h3 style={{ fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.bold, marginBottom: spacing[3] }}>
              {language === 'ka' ? 'სავარაუდო მასალები' : 'Estimated Materials'}
            </h3>
            {template.bomLogic.map((line: any, index: number) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: spacing[2],
                  borderBottom: index < template.bomLogic.length - 1 ? `1px solid ${colors.border.light}` : 'none',
                }}
              >
                <span>{line.item_spec}</span>
                <span style={{ color: colors.text.tertiary, fontSize: typography.fontSize.sm }}>
                  {line.unit} {line.price_per_unit && `(₾${line.price_per_unit})`}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
