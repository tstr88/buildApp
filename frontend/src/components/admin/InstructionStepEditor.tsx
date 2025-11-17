/**
 * Instruction Step Editor Component
 */

import { colors, spacing, typography, borderRadius } from '../../theme/tokens';

interface InstructionStep {
  step: number;
  title_ka: string;
  title_en: string;
  description_ka: string;
  description_en: string;
  image_url?: string;
}

interface InstructionStepEditorProps {
  steps: InstructionStep[];
  onChange: (steps: InstructionStep[]) => void;
}

export function InstructionStepEditor({ steps, onChange }: InstructionStepEditorProps) {
  const addStep = () => {
    onChange([...steps, {
      step: steps.length + 1,
      title_ka: '',
      title_en: '',
      description_ka: '',
      description_en: '',
    }]);
  };

  const updateStep = (index: number, field: keyof InstructionStep, value: any) => {
    const newSteps = [...steps];
    newSteps[index] = { ...newSteps[index], [field]: value };
    onChange(newSteps);
  };

  const deleteStep = (index: number) => {
    const newSteps = steps.filter((_, i) => i !== index).map((step, i) => ({
      ...step,
      step: i + 1,
    }));
    onChange(newSteps);
  };

  return (
    <div>
      <div style={{ marginBottom: spacing[4], display: 'flex', justifyContent: 'space-between' }}>
        <h2 style={{ fontSize: typography.fontSize.xl, fontWeight: typography.fontWeight.bold }}>
          Instructions
        </h2>
        <button
          onClick={addStep}
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
          + Add Step
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[4] }}>
        {steps.map((step, index) => (
          <div
            key={index}
            style={{
              padding: spacing[4],
              backgroundColor: colors.neutral[50],
              border: `1px solid ${colors.border.light}`,
              borderRadius: borderRadius.md,
            }}
          >
            <div style={{ marginBottom: spacing[3], display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.semibold }}>
                Step {step.step}
              </h3>
              <button
                onClick={() => deleteStep(index)}
                style={{
                  padding: spacing[2],
                  backgroundColor: colors.error[600],
                  color: colors.neutral[0],
                  border: 'none',
                  borderRadius: borderRadius.sm,
                  cursor: 'pointer',
                  fontSize: typography.fontSize.sm,
                }}
              >
                Delete
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: spacing[3] }}>
              <div>
                <label style={{ display: 'block', marginBottom: spacing[1], fontSize: typography.fontSize.sm }}>
                  Title (Georgian)
                </label>
                <input
                  type="text"
                  value={step.title_ka}
                  onChange={(e) => updateStep(index, 'title_ka', e.target.value)}
                  placeholder="მონიშნეთ საზღვრები"
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
                <label style={{ display: 'block', marginBottom: spacing[1], fontSize: typography.fontSize.sm }}>
                  Title (English)
                </label>
                <input
                  type="text"
                  value={step.title_en}
                  onChange={(e) => updateStep(index, 'title_en', e.target.value)}
                  placeholder="Mark boundaries"
                  style={{
                    width: '100%',
                    padding: spacing[2],
                    border: `1px solid ${colors.border.light}`,
                    borderRadius: borderRadius.sm,
                    fontSize: typography.fontSize.sm,
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: spacing[3], marginTop: spacing[3] }}>
              <div>
                <label style={{ display: 'block', marginBottom: spacing[1], fontSize: typography.fontSize.sm }}>
                  Description (Georgian)
                </label>
                <textarea
                  value={step.description_ka}
                  onChange={(e) => updateStep(index, 'description_ka', e.target.value)}
                  rows={3}
                  style={{
                    width: '100%',
                    padding: spacing[2],
                    border: `1px solid ${colors.border.light}`,
                    borderRadius: borderRadius.sm,
                    fontSize: typography.fontSize.sm,
                    fontFamily: 'inherit',
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: spacing[1], fontSize: typography.fontSize.sm }}>
                  Description (English)
                </label>
                <textarea
                  value={step.description_en}
                  onChange={(e) => updateStep(index, 'description_en', e.target.value)}
                  rows={3}
                  style={{
                    width: '100%',
                    padding: spacing[2],
                    border: `1px solid ${colors.border.light}`,
                    borderRadius: borderRadius.sm,
                    fontSize: typography.fontSize.sm,
                    fontFamily: 'inherit',
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
