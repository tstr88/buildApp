/**
 * InstructionsTab Component
 * IKEA-style step-by-step assembly/construction instructions
 * Visually stunning with clear iconography and progress tracking
 */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Icons } from '../icons/Icons';
import { InstructionIllustration } from '../instructions/AnimatedIllustrations';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme/tokens';

interface InstructionStep {
  step: number;
  title_ka: string;
  title_en: string;
  description_ka: string;
  description_en: string;
  image_url?: string;
  illustration_type?: string; // CSS animation type: 'digging', 'post_install', 'concrete_mixing', etc.
  duration_minutes?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  tools_needed?: string[];
  materials_needed?: string[];
  tips_ka?: string[];
  tips_en?: string[];
  warnings_ka?: string[];
  warnings_en?: string[];
  substeps?: Array<{
    text_ka: string;
    text_en: string;
    image_url?: string;
  }>;
}

interface SafetyNote {
  text_ka: string;
  text_en: string;
  severity: 'info' | 'warning' | 'critical';
  icon?: string;
}

interface InstructionsTabProps {
  instructions: InstructionStep[];
  safetyNotes: SafetyNote[];
  templateSlug?: string;
  templateInputs?: Record<string, any>;
}

export const InstructionsTab: React.FC<InstructionsTabProps> = ({
  instructions,
  safetyNotes,
  templateSlug,
  templateInputs,
}) => {
  const { t, i18n } = useTranslation();
  const isGeorgian = i18n.language === 'ka';
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [expandedStep, setExpandedStep] = useState<number | null>(1);

  // Calculate total duration
  const totalDuration = instructions.reduce((sum, step) => sum + (step.duration_minutes || 0), 0);
  const completedDuration = instructions
    .filter(step => completedSteps.has(step.step))
    .reduce((sum, step) => sum + (step.duration_minutes || 0), 0);

  // Progress percentage
  const progressPercent = instructions.length > 0
    ? Math.round((completedSteps.size / instructions.length) * 100)
    : 0;

  const toggleStepComplete = (stepNumber: number) => {
    setCompletedSteps(prev => {
      const next = new Set(prev);
      if (next.has(stepNumber)) {
        next.delete(stepNumber);
      } else {
        next.add(stepNumber);
      }
      return next;
    });
  };

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case 'easy': return { bg: '#DCFCE7', text: '#166534', icon: '🟢' };
      case 'medium': return { bg: '#FEF3C7', text: '#92400E', icon: '🟡' };
      case 'hard': return { bg: '#FEE2E2', text: '#991B1B', icon: '🔴' };
      default: return { bg: colors.neutral[100], text: colors.text.secondary, icon: '⚪' };
    }
  };

  const getSeverityStyle = (severity: string) => {
    switch (severity) {
      case 'critical': return { bg: '#FEE2E2', border: '#FCA5A5', text: '#991B1B', icon: '🚨' };
      case 'warning': return { bg: '#FEF3C7', border: '#FCD34D', text: '#92400E', icon: '⚠️' };
      default: return { bg: '#DBEAFE', border: '#93C5FD', text: '#1E40AF', icon: 'ℹ️' };
    }
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} ${isGeorgian ? 'წთ' : 'min'}`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (mins === 0) return `${hours} ${isGeorgian ? 'სთ' : 'hr'}`;
    return `${hours}${isGeorgian ? 'სთ' : 'h'} ${mins}${isGeorgian ? 'წთ' : 'm'}`;
  };

  if (!instructions || instructions.length === 0) {
    return (
      <div style={{
        backgroundColor: colors.neutral[0],
        borderRadius: borderRadius.lg,
        border: `1px solid ${colors.border.light}`,
        padding: spacing[8],
        textAlign: 'center',
      }}>
        <div style={{ marginBottom: spacing[3], display: 'flex', justifyContent: 'center' }}>
          <Icons.FileText size={48} color={colors.text.tertiary} />
        </div>
        <p style={{ color: colors.text.secondary, marginBottom: spacing[4] }}>
          {isGeorgian ? 'ინსტრუქციები ჯერ არ არის დამატებული' : 'No instructions added yet'}
        </p>
        <p style={{ fontSize: typography.fontSize.sm, color: colors.text.tertiary }}>
          {isGeorgian
            ? 'გამოიყენეთ კალკულატორი მასალებისა და ინსტრუქციების გენერაციისთვის'
            : 'Use a calculator to generate materials and instructions'}
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Header with Progress */}
      <div style={{
        backgroundColor: colors.neutral[0],
        borderRadius: borderRadius.xl,
        border: `1px solid ${colors.border.light}`,
        padding: spacing[5],
        marginBottom: spacing[4],
        boxShadow: shadows.sm,
      }}>
        {/* Title and Stats Row */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: spacing[4],
          flexWrap: 'wrap',
          gap: spacing[3],
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing[3] }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: borderRadius.lg,
              backgroundColor: colors.primary[100],
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Icons.FileText size={24} color={colors.primary[600]} />
            </div>
            <div>
              <h3 style={{
                fontSize: typography.fontSize.lg,
                fontWeight: typography.fontWeight.bold,
                color: colors.text.primary,
                margin: 0,
              }}>
                {isGeorgian ? 'მონტაჟის ინსტრუქცია' : 'Assembly Instructions'}
              </h3>
              <p style={{
                fontSize: typography.fontSize.sm,
                color: colors.text.secondary,
                margin: 0,
              }}>
                {instructions.length} {isGeorgian ? 'ნაბიჯი' : 'steps'} • {formatDuration(totalDuration)}
              </p>
            </div>
          </div>

          {/* Progress Circle */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: spacing[3],
          }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{
                fontSize: typography.fontSize.sm,
                color: colors.text.secondary,
              }}>
                {isGeorgian ? 'პროგრესი' : 'Progress'}
              </div>
              <div style={{
                fontSize: typography.fontSize.lg,
                fontWeight: typography.fontWeight.bold,
                color: progressPercent === 100 ? '#16A34A' : colors.primary[600],
              }}>
                {completedSteps.size}/{instructions.length}
              </div>
            </div>
            <div style={{
              position: 'relative',
              width: '56px',
              height: '56px',
            }}>
              <svg viewBox="0 0 36 36" style={{ transform: 'rotate(-90deg)' }}>
                <circle
                  cx="18" cy="18" r="16"
                  fill="none"
                  stroke={colors.neutral[200]}
                  strokeWidth="3"
                />
                <circle
                  cx="18" cy="18" r="16"
                  fill="none"
                  stroke={progressPercent === 100 ? '#16A34A' : colors.primary[600]}
                  strokeWidth="3"
                  strokeDasharray={`${progressPercent} 100`}
                  strokeLinecap="round"
                />
              </svg>
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                fontSize: typography.fontSize.sm,
                fontWeight: typography.fontWeight.bold,
                color: progressPercent === 100 ? '#16A34A' : colors.primary[600],
              }}>
                {progressPercent}%
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div style={{
          height: '8px',
          backgroundColor: colors.neutral[200],
          borderRadius: borderRadius.full,
          overflow: 'hidden',
        }}>
          <div style={{
            height: '100%',
            width: `${progressPercent}%`,
            backgroundColor: progressPercent === 100 ? '#16A34A' : colors.primary[600],
            borderRadius: borderRadius.full,
            transition: 'width 300ms ease',
          }} />
        </div>
      </div>

      {/* Safety Notes Section */}
      {safetyNotes && safetyNotes.length > 0 && (
        <div style={{
          marginBottom: spacing[4],
        }}>
          <h4 style={{
            fontSize: typography.fontSize.sm,
            fontWeight: typography.fontWeight.semibold,
            color: colors.text.secondary,
            marginBottom: spacing[3],
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            display: 'flex',
            alignItems: 'center',
            gap: spacing[2],
          }}>
            <Icons.Shield size={16} />
            {isGeorgian ? 'უსაფრთხოების შეხსენებები' : 'Safety Reminders'}
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[2] }}>
            {safetyNotes.map((note, index) => {
              const style = getSeverityStyle(note.severity);
              return (
                <div
                  key={index}
                  style={{
                    backgroundColor: style.bg,
                    border: `1px solid ${style.border}`,
                    borderRadius: borderRadius.lg,
                    padding: spacing[3],
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: spacing[3],
                  }}
                >
                  <span style={{ fontSize: '18px', lineHeight: 1 }}>{style.icon}</span>
                  <span style={{
                    fontSize: typography.fontSize.sm,
                    color: style.text,
                    fontWeight: note.severity === 'critical' ? typography.fontWeight.semibold : typography.fontWeight.medium,
                  }}>
                    {isGeorgian ? note.text_ka : note.text_en}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Steps List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[3] }}>
        {instructions.map((step) => {
          const isCompleted = completedSteps.has(step.step);
          const isExpanded = expandedStep === step.step;
          const difficultyStyle = getDifficultyColor(step.difficulty);

          return (
            <div
              key={step.step}
              style={{
                backgroundColor: colors.neutral[0],
                borderRadius: borderRadius.xl,
                border: `2px solid ${isCompleted ? '#86EFAC' : isExpanded ? colors.primary[300] : colors.border.light}`,
                overflow: 'hidden',
                boxShadow: isExpanded ? shadows.md : shadows.sm,
                transition: 'all 200ms ease',
              }}
            >
              {/* Step Header */}
              <div
                onClick={() => setExpandedStep(isExpanded ? null : step.step)}
                style={{
                  padding: spacing[4],
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: spacing[3],
                  backgroundColor: isCompleted ? '#F0FDF4' : 'transparent',
                }}
              >
                {/* Step Number / Checkbox */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleStepComplete(step.step);
                  }}
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: borderRadius.full,
                    border: `2px solid ${isCompleted ? '#16A34A' : colors.primary[400]}`,
                    backgroundColor: isCompleted ? '#16A34A' : colors.neutral[0],
                    color: isCompleted ? colors.neutral[0] : colors.primary[600],
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: typography.fontSize.lg,
                    fontWeight: typography.fontWeight.bold,
                    cursor: 'pointer',
                    flexShrink: 0,
                    transition: 'all 200ms ease',
                  }}
                >
                  {isCompleted ? <Icons.Check size={20} /> : step.step}
                </button>

                {/* Step Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: spacing[2],
                    flexWrap: 'wrap',
                  }}>
                    <h4 style={{
                      fontSize: typography.fontSize.base,
                      fontWeight: typography.fontWeight.semibold,
                      color: isCompleted ? '#166534' : colors.text.primary,
                      margin: 0,
                      textDecoration: isCompleted ? 'line-through' : 'none',
                    }}>
                      {isGeorgian ? step.title_ka : step.title_en}
                    </h4>
                    {step.difficulty && (
                      <span style={{
                        fontSize: typography.fontSize.xs,
                        padding: `${spacing[1]} ${spacing[2]}`,
                        backgroundColor: difficultyStyle.bg,
                        color: difficultyStyle.text,
                        borderRadius: borderRadius.full,
                        fontWeight: typography.fontWeight.medium,
                      }}>
                        {difficultyStyle.icon} {isGeorgian
                          ? (step.difficulty === 'easy' ? 'მარტივი' : step.difficulty === 'medium' ? 'საშუალო' : 'რთული')
                          : step.difficulty}
                      </span>
                    )}
                  </div>
                  {step.duration_minutes && (
                    <p style={{
                      fontSize: typography.fontSize.sm,
                      color: colors.text.secondary,
                      margin: 0,
                      marginTop: spacing[1],
                      display: 'flex',
                      alignItems: 'center',
                      gap: spacing[1],
                    }}>
                      <Icons.Clock size={14} />
                      {formatDuration(step.duration_minutes)}
                    </p>
                  )}
                </div>

                {/* Expand Arrow */}
                <div style={{
                  transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 200ms ease',
                  color: colors.text.secondary,
                }}>
                  <Icons.ChevronDown size={20} />
                </div>
              </div>

              {/* Expanded Content */}
              {isExpanded && (
                <div style={{
                  padding: spacing[4],
                  paddingTop: 0,
                  borderTop: `1px solid ${colors.border.light}`,
                }}>
                  {/* Main Description */}
                  <p style={{
                    fontSize: typography.fontSize.base,
                    color: colors.text.primary,
                    lineHeight: 1.6,
                    margin: 0,
                    marginTop: spacing[4],
                    marginBottom: spacing[4],
                  }}>
                    {isGeorgian ? step.description_ka : step.description_en}
                  </p>

                  {/* Animated Illustration */}
                  {step.illustration_type && (
                    <div style={{
                      width: '100%',
                      backgroundColor: '#FAFAFA',
                      borderRadius: borderRadius.lg,
                      marginBottom: spacing[4],
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: spacing[6],
                      border: `2px solid ${colors.border.light}`,
                      boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)',
                    }}>
                      <InstructionIllustration type={step.illustration_type} size={320} />
                    </div>
                  )}

                  {/* Substeps */}
                  {step.substeps && step.substeps.length > 0 && (
                    <div style={{ marginBottom: spacing[4] }}>
                      <h5 style={{
                        fontSize: typography.fontSize.sm,
                        fontWeight: typography.fontWeight.semibold,
                        color: colors.text.secondary,
                        marginBottom: spacing[3],
                      }}>
                        {isGeorgian ? 'დეტალური ნაბიჯები:' : 'Detailed Steps:'}
                      </h5>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[2] }}>
                        {step.substeps.map((substep, idx) => (
                          <div
                            key={idx}
                            style={{
                              display: 'flex',
                              alignItems: 'flex-start',
                              gap: spacing[3],
                              padding: spacing[3],
                              backgroundColor: colors.neutral[50],
                              borderRadius: borderRadius.md,
                            }}
                          >
                            <div style={{
                              width: '24px',
                              height: '24px',
                              borderRadius: borderRadius.full,
                              backgroundColor: colors.primary[100],
                              color: colors.primary[700],
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: typography.fontSize.xs,
                              fontWeight: typography.fontWeight.bold,
                              flexShrink: 0,
                            }}>
                              {idx + 1}
                            </div>
                            <span style={{
                              fontSize: typography.fontSize.sm,
                              color: colors.text.primary,
                            }}>
                              {isGeorgian ? substep.text_ka : substep.text_en}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tools and Materials Row */}
                  {(step.tools_needed || step.materials_needed) && (
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                      gap: spacing[3],
                      marginBottom: spacing[4],
                    }}>
                      {step.tools_needed && step.tools_needed.length > 0 && (
                        <div style={{
                          padding: spacing[3],
                          backgroundColor: '#EFF6FF',
                          borderRadius: borderRadius.lg,
                          border: '1px solid #BFDBFE',
                        }}>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: spacing[2],
                            marginBottom: spacing[2],
                          }}>
                            <Icons.Wrench size={14} color="#2563EB" />
                            <span style={{
                              fontSize: typography.fontSize.xs,
                              fontWeight: typography.fontWeight.semibold,
                              color: '#1E40AF',
                              textTransform: 'uppercase',
                            }}>
                              {isGeorgian ? 'საჭირო ინსტრუმენტები' : 'Tools Needed'}
                            </span>
                          </div>
                          <ul style={{
                            margin: 0,
                            paddingLeft: spacing[4],
                            fontSize: typography.fontSize.sm,
                            color: '#1E40AF',
                          }}>
                            {step.tools_needed.map((tool, idx) => (
                              <li key={idx}>{tool}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {step.materials_needed && step.materials_needed.length > 0 && (
                        <div style={{
                          padding: spacing[3],
                          backgroundColor: '#F0FDF4',
                          borderRadius: borderRadius.lg,
                          border: '1px solid #BBF7D0',
                        }}>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: spacing[2],
                            marginBottom: spacing[2],
                          }}>
                            <Icons.Package size={14} color="#16A34A" />
                            <span style={{
                              fontSize: typography.fontSize.xs,
                              fontWeight: typography.fontWeight.semibold,
                              color: '#166534',
                              textTransform: 'uppercase',
                            }}>
                              {isGeorgian ? 'საჭირო მასალები' : 'Materials Needed'}
                            </span>
                          </div>
                          <ul style={{
                            margin: 0,
                            paddingLeft: spacing[4],
                            fontSize: typography.fontSize.sm,
                            color: '#166534',
                          }}>
                            {step.materials_needed.map((mat, idx) => (
                              <li key={idx}>{mat}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Tips */}
                  {((isGeorgian ? step.tips_ka : step.tips_en) || []).length > 0 && (
                    <div style={{
                      padding: spacing[3],
                      backgroundColor: '#ECFDF5',
                      borderRadius: borderRadius.lg,
                      border: '1px solid #A7F3D0',
                      marginBottom: spacing[3],
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: spacing[2],
                        marginBottom: spacing[2],
                      }}>
                        <span style={{ fontSize: '16px' }}>💡</span>
                        <span style={{
                          fontSize: typography.fontSize.sm,
                          fontWeight: typography.fontWeight.semibold,
                          color: '#065F46',
                        }}>
                          {isGeorgian ? 'რჩევები' : 'Tips'}
                        </span>
                      </div>
                      <ul style={{
                        margin: 0,
                        paddingLeft: spacing[4],
                        fontSize: typography.fontSize.sm,
                        color: '#065F46',
                      }}>
                        {(isGeorgian ? step.tips_ka : step.tips_en)?.map((tip, idx) => (
                          <li key={idx} style={{ marginBottom: spacing[1] }}>{tip}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Warnings */}
                  {((isGeorgian ? step.warnings_ka : step.warnings_en) || []).length > 0 && (
                    <div style={{
                      padding: spacing[3],
                      backgroundColor: '#FEF3C7',
                      borderRadius: borderRadius.lg,
                      border: '1px solid #FCD34D',
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: spacing[2],
                        marginBottom: spacing[2],
                      }}>
                        <span style={{ fontSize: '16px' }}>⚠️</span>
                        <span style={{
                          fontSize: typography.fontSize.sm,
                          fontWeight: typography.fontWeight.semibold,
                          color: '#92400E',
                        }}>
                          {isGeorgian ? 'გაფრთხილება' : 'Warning'}
                        </span>
                      </div>
                      <ul style={{
                        margin: 0,
                        paddingLeft: spacing[4],
                        fontSize: typography.fontSize.sm,
                        color: '#92400E',
                      }}>
                        {(isGeorgian ? step.warnings_ka : step.warnings_en)?.map((warning, idx) => (
                          <li key={idx} style={{ marginBottom: spacing[1] }}>{warning}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Mark Complete Button */}
                  <button
                    onClick={() => toggleStepComplete(step.step)}
                    style={{
                      width: '100%',
                      marginTop: spacing[4],
                      padding: spacing[3],
                      backgroundColor: isCompleted ? colors.neutral[100] : '#16A34A',
                      color: isCompleted ? colors.text.secondary : colors.neutral[0],
                      border: 'none',
                      borderRadius: borderRadius.lg,
                      fontSize: typography.fontSize.base,
                      fontWeight: typography.fontWeight.semibold,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: spacing[2],
                      transition: 'all 200ms ease',
                    }}
                  >
                    {isCompleted ? (
                      <>
                        <Icons.X size={18} />
                        {isGeorgian ? 'მონიშვნის მოხსნა' : 'Mark Incomplete'}
                      </>
                    ) : (
                      <>
                        <Icons.Check size={18} />
                        {isGeorgian ? 'დასრულებულად მონიშვნა' : 'Mark as Complete'}
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Completion Celebration */}
      {progressPercent === 100 && (
        <div style={{
          marginTop: spacing[6],
          padding: spacing[6],
          background: 'linear-gradient(135deg, #16A34A 0%, #22C55E 100%)',
          borderRadius: borderRadius.xl,
          textAlign: 'center',
          color: colors.neutral[0],
        }}>
          <div style={{ fontSize: '48px', marginBottom: spacing[3] }}>🎉</div>
          <h3 style={{
            fontSize: typography.fontSize.xl,
            fontWeight: typography.fontWeight.bold,
            margin: 0,
            marginBottom: spacing[2],
          }}>
            {isGeorgian ? 'გილოცავთ!' : 'Congratulations!'}
          </h3>
          <p style={{
            fontSize: typography.fontSize.base,
            margin: 0,
            opacity: 0.9,
          }}>
            {isGeorgian
              ? 'თქვენ დაასრულეთ ყველა ნაბიჯი. კარგი სამუშაო!'
              : "You've completed all steps. Great job!"}
          </p>
        </div>
      )}
    </div>
  );
};
