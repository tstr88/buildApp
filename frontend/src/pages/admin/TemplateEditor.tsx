/**
 * Template Editor Page
 * Tabbed interface for editing template configuration
 */

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme/tokens';
import { FieldEditor } from '../../components/admin/FieldEditor';
import { BOMLineEditor } from '../../components/admin/BOMLineEditor';
import { InstructionStepEditor } from '../../components/admin/InstructionStepEditor';
import { SafetyNoteEditor } from '../../components/admin/SafetyNoteEditor';
import { TemplatePreview } from '../../components/admin/TemplatePreview';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

type Tab = 'basic' | 'fields' | 'bom' | 'instructions' | 'safety' | 'preview';

interface TemplateData {
  slug: string;
  titleKa: string;
  titleEn: string;
  descriptionKa: string;
  descriptionEn: string;
  iconUrl: string;
  status: 'draft' | 'published';
  version: number;
  fields: any[];
  bomLogic: any[];
  instructions: any[];
  safetyNotes: any[];
}

export function TemplateEditor() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('basic');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [template, setTemplate] = useState<TemplateData>({
    slug: '',
    titleKa: '',
    titleEn: '',
    descriptionKa: '',
    descriptionEn: '',
    iconUrl: '',
    status: 'draft',
    version: 1,
    fields: [],
    bomLogic: [],
    instructions: [],
    safetyNotes: [],
  });

  const isNew = slug === 'new';

  useEffect(() => {
    if (!isNew && slug) {
      fetchTemplate();
    } else {
      setLoading(false);
    }
  }, [slug, token]);

  const fetchTemplate = async () => {
    if (!token || !slug) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/admin/templates/${slug}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        setTemplate(result.data.template);
      }
    } catch (error) {
      console.error('Failed to fetch template:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (publish = false) => {
    if (!token) return;

    setSaving(true);
    try {
      const url = isNew
        ? `${API_URL}/api/admin/templates`
        : `${API_URL}/api/admin/templates/${slug}`;

      const method = 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(template),
      });

      if (response.ok) {
        if (publish && !isNew) {
          // Publish after save
          await fetch(`${API_URL}/api/admin/templates/${slug}/publish`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ changeNotes: 'Published from editor' }),
          });
        }

        alert(publish ? 'Template published successfully!' : 'Template saved successfully!');
        navigate('/admin/templates');
      }
    } catch (error) {
      console.error('Failed to save template:', error);
      alert('Failed to save template');
    } finally {
      setSaving(false);
    }
  };

  const tabs: { id: Tab; label: string }[] = [
    { id: 'basic', label: t('admin.templateEditor.tabs.basic', 'Basic Info') },
    { id: 'fields', label: t('admin.templateEditor.tabs.fields', 'Fields') },
    { id: 'bom', label: t('admin.templateEditor.tabs.bom', 'BOM Logic') },
    { id: 'instructions', label: t('admin.templateEditor.tabs.instructions', 'Instructions') },
    { id: 'safety', label: t('admin.templateEditor.tabs.safety', 'Safety Notes') },
    { id: 'preview', label: t('admin.templateEditor.tabs.preview', 'Preview') },
  ];

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: spacing[8], color: colors.text.tertiary }}>
        {t('common.loading', 'Loading...')}
      </div>
    );
  }

  return (
    <div style={{ padding: spacing[6], maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: spacing[6], display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1
            style={{
              fontSize: typography.fontSize['3xl'],
              fontWeight: typography.fontWeight.bold,
              color: colors.text.primary,
              marginBottom: spacing[2],
            }}
          >
            {isNew ? t('admin.templateEditor.titleNew', 'Create New Template') : template.titleEn}
          </h1>
          {!isNew && (
            <div style={{ display: 'flex', gap: spacing[3], alignItems: 'center' }}>
              <span
                style={{
                  padding: `${spacing[1]} ${spacing[3]}`,
                  backgroundColor: template.status === 'published' ? colors.success[100] : colors.warning[100],
                  color: template.status === 'published' ? colors.success[700] : colors.warning[700],
                  borderRadius: borderRadius.full,
                  fontSize: typography.fontSize.xs,
                  fontWeight: typography.fontWeight.semibold,
                }}
              >
                {template.status === 'published' ? 'Published' : 'Draft'}
              </span>
              <span style={{ fontSize: typography.fontSize.sm, color: colors.text.tertiary }}>
                Version {template.version}
              </span>
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: spacing[2] }}>
          <button
            onClick={() => navigate('/admin/templates')}
            style={{
              padding: `${spacing[2]} ${spacing[4]}`,
              backgroundColor: 'transparent',
              color: colors.text.secondary,
              border: `1px solid ${colors.border.light}`,
              borderRadius: borderRadius.md,
              fontSize: typography.fontSize.sm,
              fontWeight: typography.fontWeight.medium,
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            onClick={() => handleSave(false)}
            disabled={saving}
            style={{
              padding: `${spacing[2]} ${spacing[4]}`,
              backgroundColor: colors.neutral[700],
              color: colors.neutral[0],
              border: 'none',
              borderRadius: borderRadius.md,
              fontSize: typography.fontSize.sm,
              fontWeight: typography.fontWeight.semibold,
              cursor: saving ? 'not-allowed' : 'pointer',
              opacity: saving ? 0.6 : 1,
            }}
          >
            {saving ? 'Saving...' : 'Save Draft'}
          </button>
          <button
            onClick={() => handleSave(true)}
            disabled={saving || isNew}
            style={{
              padding: `${spacing[2]} ${spacing[4]}`,
              backgroundColor: colors.primary[600],
              color: colors.neutral[0],
              border: 'none',
              borderRadius: borderRadius.md,
              fontSize: typography.fontSize.sm,
              fontWeight: typography.fontWeight.semibold,
              cursor: saving || isNew ? 'not-allowed' : 'pointer',
              opacity: saving || isNew ? 0.6 : 1,
              boxShadow: shadows.sm,
            }}
          >
            Publish
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div
        style={{
          borderBottom: `1px solid ${colors.border.light}`,
          marginBottom: spacing[6],
          display: 'flex',
          gap: spacing[1],
        }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: `${spacing[3]} ${spacing[4]}`,
              backgroundColor: 'transparent',
              border: 'none',
              borderBottom: `2px solid ${activeTab === tab.id ? colors.primary[600] : 'transparent'}`,
              color: activeTab === tab.id ? colors.primary[600] : colors.text.secondary,
              fontSize: typography.fontSize.sm,
              fontWeight: activeTab === tab.id ? typography.fontWeight.semibold : typography.fontWeight.normal,
              cursor: 'pointer',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'basic' && (
          <div style={{ maxWidth: '800px' }}>
            <h2 style={{ fontSize: typography.fontSize.xl, fontWeight: typography.fontWeight.bold, marginBottom: spacing[4] }}>
              Basic Information
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[4] }}>
              <div>
                <label style={{ display: 'block', marginBottom: spacing[2], fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.medium }}>
                  Template Slug {isNew && '*'}
                </label>
                <input
                  type="text"
                  value={template.slug}
                  onChange={(e) => setTemplate({ ...template, slug: e.target.value })}
                  disabled={!isNew}
                  placeholder="fence, slab, etc."
                  style={{
                    width: '100%',
                    padding: spacing[3],
                    border: `1px solid ${colors.border.light}`,
                    borderRadius: borderRadius.md,
                    fontSize: typography.fontSize.sm,
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: spacing[2], fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.medium }}>
                  Title (Georgian) *
                </label>
                <input
                  type="text"
                  value={template.titleKa}
                  onChange={(e) => setTemplate({ ...template, titleKa: e.target.value })}
                  placeholder="ღობე"
                  style={{
                    width: '100%',
                    padding: spacing[3],
                    border: `1px solid ${colors.border.light}`,
                    borderRadius: borderRadius.md,
                    fontSize: typography.fontSize.sm,
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: spacing[2], fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.medium }}>
                  Title (English) *
                </label>
                <input
                  type="text"
                  value={template.titleEn}
                  onChange={(e) => setTemplate({ ...template, titleEn: e.target.value })}
                  placeholder="Fence"
                  style={{
                    width: '100%',
                    padding: spacing[3],
                    border: `1px solid ${colors.border.light}`,
                    borderRadius: borderRadius.md,
                    fontSize: typography.fontSize.sm,
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: spacing[2], fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.medium }}>
                  Description (Georgian)
                </label>
                <textarea
                  value={template.descriptionKa}
                  onChange={(e) => setTemplate({ ...template, descriptionKa: e.target.value })}
                  rows={3}
                  placeholder="მეტალის პრივატული ღობის დამონტაჟება"
                  style={{
                    width: '100%',
                    padding: spacing[3],
                    border: `1px solid ${colors.border.light}`,
                    borderRadius: borderRadius.md,
                    fontSize: typography.fontSize.sm,
                    fontFamily: 'inherit',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: spacing[2], fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.medium }}>
                  Description (English)
                </label>
                <textarea
                  value={template.descriptionEn}
                  onChange={(e) => setTemplate({ ...template, descriptionEn: e.target.value })}
                  rows={3}
                  placeholder="Metal privacy fence installation"
                  style={{
                    width: '100%',
                    padding: spacing[3],
                    border: `1px solid ${colors.border.light}`,
                    borderRadius: borderRadius.md,
                    fontSize: typography.fontSize.sm,
                    fontFamily: 'inherit',
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'fields' && (
          <FieldEditor
            fields={template.fields}
            onChange={(fields) => setTemplate({ ...template, fields })}
          />
        )}

        {activeTab === 'bom' && (
          <BOMLineEditor
            bomLines={template.bomLogic}
            onChange={(bomLogic) => setTemplate({ ...template, bomLogic })}
          />
        )}

        {activeTab === 'instructions' && (
          <InstructionStepEditor
            steps={template.instructions}
            onChange={(instructions) => setTemplate({ ...template, instructions })}
          />
        )}

        {activeTab === 'safety' && (
          <SafetyNoteEditor
            notes={template.safetyNotes}
            onChange={(safetyNotes) => setTemplate({ ...template, safetyNotes })}
          />
        )}

        {activeTab === 'preview' && (
          <TemplatePreview template={template} />
        )}
      </div>
    </div>
  );
}
