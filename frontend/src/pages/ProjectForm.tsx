/**
 * ProjectForm Page
 * Create or edit a project
 */

import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { projectsService } from '../services/api/projectsService';
import MapPinPicker from '../components/map/MapPinPicker';
import { Icons } from '../components/icons/Icons';
import { colors, spacing, typography, borderRadius, shadows } from '../theme/tokens';

export default function ProjectForm() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  const [isLoading, setIsLoading] = useState(isEditMode);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [latitude, setLatitude] = useState<number | undefined>();
  const [longitude, setLongitude] = useState<number | undefined>();
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');

  // Load existing project if in edit mode
  useEffect(() => {
    if (isEditMode && id) {
      loadProject(id);
    }
  }, [id, isEditMode]);

  const loadProject = async (projectId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await projectsService.getProjectById(projectId);
      const project = data.project;

      setName(project.name);
      setLatitude(project.latitude || undefined);
      setLongitude(project.longitude || undefined);
      setAddress(project.address || '');
      setNotes(project.notes || '');
    } catch (err: any) {
      console.error('Failed to load project:', err);
      setError(err.response?.data?.error || 'Failed to load project');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMapChange = (lat: number, lng: number) => {
    setLatitude(lat);
    setLongitude(lng);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (name.trim().length === 0) {
      setError(t('projects.form.nameRequired'));
      return;
    }

    if (name.length > 100) {
      setError(t('projects.form.nameTooLong'));
      return;
    }

    try {
      setIsSaving(true);
      setError(null);

      const data = {
        name: name.trim(),
        latitude,
        longitude,
        address: address.trim() || undefined,
        notes: notes.trim() || undefined,
      };

      if (isEditMode && id) {
        await projectsService.updateProject(id, data);
      } else {
        await projectsService.createProject(data);
      }

      // Navigate back to projects list
      navigate('/projects');
    } catch (err: any) {
      console.error('Failed to save project:', err);
      setError(err.response?.data?.error || 'Failed to save project');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    navigate(isEditMode && id ? `/projects/${id}` : '/projects');
  };

  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{
          width: '48px',
          height: '48px',
          border: `3px solid ${colors.border.light}`,
          borderTop: `3px solid ${colors.primary[600]}`,
          borderRadius: borderRadius.full,
          animation: 'spin 1s linear infinite',
        }}>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: colors.background.secondary,
      paddingBottom: spacing[20],
    }}>
      {/* Header */}
      <div style={{
        backgroundColor: colors.neutral[0],
        borderBottom: `1px solid ${colors.border.light}`,
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}>
        <div style={{
          padding: spacing[4],
          display: 'flex',
          alignItems: 'center',
        }}>
          <button
            onClick={handleCancel}
            aria-label={t('common.back')}
            style={{
              marginRight: spacing[3],
              padding: spacing[2],
              backgroundColor: 'transparent',
              border: 'none',
              borderRadius: borderRadius.lg,
              cursor: 'pointer',
              transition: 'background-color 200ms ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.neutral[100]}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <Icons.ChevronRight style={{
              width: '20px',
              height: '20px',
              color: colors.text.secondary,
              transform: 'rotate(180deg)',
            }} />
          </button>
          <h1 style={{
            fontSize: typography.fontSize.xl,
            fontWeight: typography.fontWeight.bold,
            color: colors.text.primary,
            margin: 0,
          }}>
            {isEditMode ? t('projects.form.editTitle') : t('projects.form.createTitle')}
          </h1>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} style={{ padding: spacing[4] }}>
        {/* Error Message */}
        {error && (
          <div style={{
            backgroundColor: '#FEF2F2',
            border: `1px solid ${colors.error}`,
            borderRadius: borderRadius.lg,
            padding: spacing[4],
            display: 'flex',
            alignItems: 'flex-start',
            marginBottom: spacing[6],
          }}>
            <Icons.AlertCircle style={{
              width: '20px',
              height: '20px',
              color: colors.error,
              marginRight: spacing[2],
              flexShrink: 0,
              marginTop: '2px',
            }} />
            <p style={{
              fontSize: typography.fontSize.sm,
              color: '#7F1D1D',
              margin: 0,
            }}>{error}</p>
          </div>
        )}

        {/* Project Name */}
        <div style={{
          backgroundColor: colors.neutral[0],
          borderRadius: borderRadius.lg,
          border: `1px solid ${colors.border.light}`,
          padding: spacing[6],
          boxShadow: shadows.sm,
          marginBottom: spacing[6],
        }}>
          <label htmlFor="name" style={{
            display: 'block',
            fontSize: typography.fontSize.sm,
            fontWeight: typography.fontWeight.medium,
            color: colors.text.secondary,
            marginBottom: spacing[2],
          }}>
            {t('projects.form.name')} <span style={{ color: colors.error }}>*</span>
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={100}
            placeholder={t('projects.form.namePlaceholder')}
            required
            style={{
              width: '100%',
              padding: spacing[3],
              border: `1px solid ${colors.border.light}`,
              borderRadius: borderRadius.md,
              fontSize: typography.fontSize.base,
              outline: 'none',
              fontFamily: typography.fontFamily.base,
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
          <p style={{
            marginTop: spacing[1],
            fontSize: typography.fontSize.xs,
            color: colors.text.tertiary,
          }}>
            {name.length}/100 {t('common.characters')}
          </p>
        </div>

        {/* Map Pin Picker */}
        <div style={{
          backgroundColor: colors.neutral[0],
          borderRadius: borderRadius.lg,
          border: `1px solid ${colors.border.light}`,
          padding: spacing[6],
          boxShadow: shadows.sm,
          marginBottom: spacing[6],
        }}>
          <label style={{
            display: 'block',
            fontSize: typography.fontSize.sm,
            fontWeight: typography.fontWeight.medium,
            color: colors.text.secondary,
            marginBottom: spacing[4],
          }}>
            {t('projects.form.location')}
          </label>
          <MapPinPicker latitude={latitude} longitude={longitude} onChange={handleMapChange} />
        </div>

        {/* Address */}
        <div style={{
          backgroundColor: colors.neutral[0],
          borderRadius: borderRadius.lg,
          border: `1px solid ${colors.border.light}`,
          padding: spacing[6],
          boxShadow: shadows.sm,
          marginBottom: spacing[6],
        }}>
          <label htmlFor="address" style={{
            display: 'block',
            fontSize: typography.fontSize.sm,
            fontWeight: typography.fontWeight.medium,
            color: colors.text.secondary,
            marginBottom: spacing[2],
          }}>
            {t('projects.form.address')}
          </label>
          <input
            type="text"
            id="address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder={t('projects.form.addressPlaceholder')}
            style={{
              width: '100%',
              padding: spacing[3],
              border: `1px solid ${colors.border.light}`,
              borderRadius: borderRadius.md,
              fontSize: typography.fontSize.base,
              outline: 'none',
              fontFamily: typography.fontFamily.base,
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
          <p style={{
            marginTop: spacing[1],
            fontSize: typography.fontSize.xs,
            color: colors.text.tertiary,
          }}>{t('projects.form.addressHint')}</p>
        </div>

        {/* Notes */}
        <div style={{
          backgroundColor: colors.neutral[0],
          borderRadius: borderRadius.lg,
          border: `1px solid ${colors.border.light}`,
          padding: spacing[6],
          boxShadow: shadows.sm,
          marginBottom: spacing[6],
        }}>
          <label htmlFor="notes" style={{
            display: 'block',
            fontSize: typography.fontSize.sm,
            fontWeight: typography.fontWeight.medium,
            color: colors.text.secondary,
            marginBottom: spacing[2],
          }}>
            {t('projects.form.notes')}
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            placeholder={t('projects.form.notesPlaceholder')}
            style={{
              width: '100%',
              padding: spacing[3],
              border: `1px solid ${colors.border.light}`,
              borderRadius: borderRadius.md,
              fontSize: typography.fontSize.base,
              outline: 'none',
              resize: 'none',
              fontFamily: typography.fontFamily.base,
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

        {/* Action Buttons */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: spacing[3],
        }}>
          <button
            type="button"
            onClick={handleCancel}
            disabled={isSaving}
            style={{
              padding: `${spacing[3]} ${spacing[4]}`,
              fontSize: typography.fontSize.base,
              fontWeight: typography.fontWeight.medium,
              color: colors.text.primary,
              backgroundColor: colors.neutral[0],
              border: `1px solid ${colors.border.light}`,
              borderRadius: borderRadius.lg,
              cursor: isSaving ? 'not-allowed' : 'pointer',
              transition: 'background-color 200ms ease',
              opacity: isSaving ? 0.5 : 1,
            }}
            onMouseEnter={(e) => {
              if (!isSaving) e.currentTarget.style.backgroundColor = colors.neutral[50];
            }}
            onMouseLeave={(e) => {
              if (!isSaving) e.currentTarget.style.backgroundColor = colors.neutral[0];
            }}
          >
            {t('common.cancel')}
          </button>
          <button
            type="submit"
            disabled={isSaving}
            style={{
              padding: `${spacing[3]} ${spacing[4]}`,
              fontSize: typography.fontSize.base,
              fontWeight: typography.fontWeight.semibold,
              color: colors.text.inverse,
              backgroundColor: isSaving ? colors.neutral[300] : colors.primary[600],
              border: 'none',
              borderRadius: borderRadius.lg,
              cursor: isSaving ? 'not-allowed' : 'pointer',
              transition: 'all 200ms ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onMouseEnter={(e) => {
              if (!isSaving) {
                e.currentTarget.style.backgroundColor = colors.primary[700];
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = shadows.md;
              }
            }}
            onMouseLeave={(e) => {
              if (!isSaving) {
                e.currentTarget.style.backgroundColor = colors.primary[600];
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }
            }}
          >
            {isSaving ? (
              <>
                <svg
                  style={{
                    width: '20px',
                    height: '20px',
                    marginRight: spacing[2],
                    animation: 'spin 1s linear infinite',
                  }}
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    style={{ opacity: 0.25 }}
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    style={{ opacity: 0.75 }}
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                {t('common.saving')}
              </>
            ) : (
              t('common.save')
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
