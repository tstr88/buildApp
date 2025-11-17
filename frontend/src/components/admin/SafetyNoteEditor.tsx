/**
 * Safety Note Editor Component
 */

import { colors, spacing, typography, borderRadius } from '../../theme/tokens';

interface SafetyNote {
  text_ka: string;
  text_en: string;
  severity: 'info' | 'warning' | 'critical';
}

interface SafetyNoteEditorProps {
  notes: SafetyNote[];
  onChange: (notes: SafetyNote[]) => void;
}

export function SafetyNoteEditor({ notes, onChange }: SafetyNoteEditorProps) {
  const addNote = () => {
    onChange([...notes, { text_ka: '', text_en: '', severity: 'warning' }]);
  };

  const updateNote = (index: number, field: keyof SafetyNote, value: any) => {
    const newNotes = [...notes];
    newNotes[index] = { ...newNotes[index], [field]: value };
    onChange(newNotes);
  };

  const deleteNote = (index: number) => {
    onChange(notes.filter((_, i) => i !== index));
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return { bg: colors.error[100], text: colors.error[700] };
      case 'warning':
        return { bg: colors.warning[100], text: colors.warning[700] };
      case 'info':
        return { bg: colors.info[100], text: colors.info[700] };
      default:
        return { bg: colors.neutral[100], text: colors.neutral[700] };
    }
  };

  return (
    <div>
      <div style={{ marginBottom: spacing[4], display: 'flex', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: typography.fontSize.xl, fontWeight: typography.fontWeight.bold, marginBottom: spacing[2] }}>
            Safety Notes
          </h2>
          <p style={{ fontSize: typography.fontSize.sm, color: colors.text.tertiary }}>
            Non-dismissable warnings shown to buyers
          </p>
        </div>
        <button
          onClick={addNote}
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
          + Add Safety Note
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[3] }}>
        {notes.map((note, index) => {
          const severityColors = getSeverityColor(note.severity);
          return (
            <div
              key={index}
              style={{
                padding: spacing[4],
                backgroundColor: severityColors.bg,
                border: `1px solid ${severityColors.text}`,
                borderLeft: `4px solid ${severityColors.text}`,
                borderRadius: borderRadius.md,
              }}
            >
              <div style={{ marginBottom: spacing[3], display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <select
                  value={note.severity}
                  onChange={(e) => updateNote(index, 'severity', e.target.value as any)}
                  style={{
                    padding: `${spacing[1]} ${spacing[2]}`,
                    border: `1px solid ${severityColors.text}`,
                    borderRadius: borderRadius.sm,
                    fontSize: typography.fontSize.sm,
                    fontWeight: typography.fontWeight.semibold,
                    color: severityColors.text,
                    backgroundColor: colors.neutral[0],
                  }}
                >
                  <option value="info">Info</option>
                  <option value="warning">Warning</option>
                  <option value="critical">Critical</option>
                </select>
                <button
                  onClick={() => deleteNote(index)}
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
                  <label style={{ display: 'block', marginBottom: spacing[1], fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.medium }}>
                    Text (Georgian)
                  </label>
                  <textarea
                    value={note.text_ka}
                    onChange={(e) => updateNote(index, 'text_ka', e.target.value)}
                    rows={3}
                    placeholder="შეამოწმეთ საკუთრების საზღვრები"
                    style={{
                      width: '100%',
                      padding: spacing[2],
                      border: `1px solid ${colors.border.light}`,
                      borderRadius: borderRadius.sm,
                      fontSize: typography.fontSize.sm,
                      fontFamily: 'inherit',
                      backgroundColor: colors.neutral[0],
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: spacing[1], fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.medium }}>
                    Text (English)
                  </label>
                  <textarea
                    value={note.text_en}
                    onChange={(e) => updateNote(index, 'text_en', e.target.value)}
                    rows={3}
                    placeholder="Check property boundaries"
                    style={{
                      width: '100%',
                      padding: spacing[2],
                      border: `1px solid ${colors.border.light}`,
                      borderRadius: borderRadius.sm,
                      fontSize: typography.fontSize.sm,
                      fontFamily: 'inherit',
                      backgroundColor: colors.neutral[0],
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
