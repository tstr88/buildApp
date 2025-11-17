/**
 * Working Buyer Home Screen
 * With all UI components but static data (no API calls)
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import { TemplateCard } from '../components/home/TemplateCard';
import { QuickLinkButton } from '../components/home/QuickLinkButton';
import { NotificationBell } from '../components/navigation/NotificationBell';
import { colors, spacing, typography, shadows, borderRadius } from '../theme/tokens';

export const BuyerHomeWorking: React.FC = () => {
  const { t, i18n } = useTranslation();

  // Static template data
  const templates = [
    {
      id: '1',
      slug: 'fence',
      title_ka: 'ღობე',
      title_en: 'Fence',
      description_ka: 'აშენე ღობე',
      description_en: 'Build a fence',
      category: 'fence',
      estimated_duration_days: 5,
      difficulty_level: 'medium',
      images: [],
    },
    {
      id: '2',
      slug: 'slab',
      title_ka: 'ბეტონის ფილა',
      title_en: 'Concrete Slab',
      description_ka: 'ჩაასხი ბეტონის ფილა',
      description_en: 'Pour a concrete slab',
      category: 'foundation',
      estimated_duration_days: 3,
      difficulty_level: 'easy',
      images: [],
    },
  ];

  const getLocalizedTitle = (template: typeof templates[0]) => {
    return i18n.language === 'ka' ? template.title_ka : template.title_en;
  };

  const getLocalizedDescription = (template: typeof templates[0]) => {
    return i18n.language === 'ka' ? template.description_ka : template.description_en;
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: colors.background.secondary,
        paddingBottom: '80px', // Space for bottom nav
      }}
    >
      {/* Top Header */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 1020,
          backgroundColor: colors.neutral[0],
          borderBottom: `1px solid ${colors.border.light}`,
          boxShadow: shadows.sm,
        }}
      >
        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: `${spacing[4]} ${spacing[4]}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {/* Logo */}
          <div
            style={{
              fontSize: typography.fontSize['2xl'],
              fontWeight: typography.fontWeight.bold,
              color: colors.primary[600],
            }}
          >
            buildApp
          </div>

          {/* Notification Bell */}
          <NotificationBell count={0} />
        </div>
      </header>

      {/* Main Content */}
      <main
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: spacing[4],
        }}
      >
        {/* Welcome Section */}
        <section style={{ marginBottom: spacing[8] }}>
          <h1
            style={{
              fontSize: typography.fontSize['3xl'],
              fontWeight: typography.fontWeight.bold,
              color: colors.text.primary,
              margin: 0,
              marginBottom: spacing[2],
            }}
          >
            {t('home.welcome')}
          </h1>
          <p
            style={{
              fontSize: typography.fontSize.lg,
              color: colors.text.secondary,
              margin: 0,
            }}
          >
            {t('home.subtitle')}
          </p>
        </section>

        {/* Templates Section */}
        <section style={{ marginBottom: spacing[8] }}>
          <h2
            style={{
              fontSize: typography.fontSize.xl,
              fontWeight: typography.fontWeight.semibold,
              color: colors.text.primary,
              margin: 0,
              marginBottom: spacing[4],
            }}
          >
            {t('home.startNewProject')}
          </h2>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: spacing[4],
            }}
          >
            {templates.map((template) => (
              <TemplateCard
                key={template.id}
                id={template.id}
                slug={template.slug}
                title={getLocalizedTitle(template)}
                description={getLocalizedDescription(template)}
                icon={template.category === 'fence' ? 'Ruler' : 'Hammer'}
                imageUrl={undefined}
                estimatedDuration={template.estimated_duration_days}
                difficulty={template.difficulty_level as any}
              />
            ))}
          </div>

          {/* Legal Disclaimer */}
          <div
            style={{
              marginTop: spacing[4],
              padding: spacing[3],
              backgroundColor: colors.neutral[100],
              borderRadius: borderRadius.base,
              borderLeft: `4px solid ${colors.warning}`,
            }}
          >
            <p
              style={{
                fontSize: typography.fontSize.sm,
                color: colors.text.secondary,
                margin: 0,
                lineHeight: typography.lineHeight.relaxed,
              }}
            >
              ⚠️ {t('home.legalDisclaimer')}
            </p>
          </div>
        </section>

        {/* Quick Links Section */}
        <section style={{ marginBottom: spacing[8] }}>
          <h2
            style={{
              fontSize: typography.fontSize.xl,
              fontWeight: typography.fontWeight.semibold,
              color: colors.text.primary,
              margin: 0,
              marginBottom: spacing[4],
            }}
          >
            {t('home.quickActions')}
          </h2>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: spacing[3],
            }}
          >
            <QuickLinkButton
              icon="Catalog"
              label={t('home.browseCatalog')}
              path="/catalog"
            />
            <QuickLinkButton
              icon="Factory"
              label={t('home.viewFactories')}
              path="/factories"
            />
            <QuickLinkButton
              icon="FileText"
              label={t('home.myRfqsOrders')}
              path="/orders"
              badge={0}
            />
          </div>
        </section>
      </main>
    </div>
  );
};
