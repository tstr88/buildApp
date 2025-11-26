/**
 * Buyer Home Screen
 * Main landing page for buyers with templates and quick actions
 */

import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TemplateCard } from '../components/home/TemplateCard';
import { QuickLinkButton } from '../components/home/QuickLinkButton';
import { EmptyState } from '../components/common/EmptyState';
import { NotificationBell } from '../components/navigation/NotificationBell';
import { getBuyerHome, getPublishedTemplates } from '../services/api/homeService';
import { colors, spacing, typography, shadows, borderRadius } from '../theme/tokens';

interface Template {
  id: string;
  slug: string;
  title_ka: string;
  title_en: string;
  description_ka: string;
  description_en: string;
  category: string;
  estimated_duration_days: number | null;
  difficulty_level: string | null;
  images: string[];
}

export const BuyerHome: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    active_projects: 0,
    active_rfqs: 0,
    pending_orders: 0,
  });
  const [notificationCount] = useState(0);

  useEffect(() => {
    loadHomeData();
  }, []);

  const loadHomeData = async () => {
    try {
      setLoading(true);

      // Load templates
      const templatesData = await getPublishedTemplates();
      setTemplates(templatesData.templates || []);

      // Try to load buyer-specific data (may fail if not authenticated)
      try {
        const homeData = await getBuyerHome();
        if (homeData && homeData.stats) {
          setStats(homeData.stats);
        }
        // Set notification count from user data if available
      } catch (error) {
        // User not authenticated, show templates only
        console.log('Not authenticated, showing public data only');
      }
    } catch (error) {
      console.error('Failed to load home data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getLocalizedTitle = (template: Template) => {
    return i18n.language === 'ka' ? template.title_ka : template.title_en;
  };

  const getLocalizedDescription = (template: Template) => {
    return i18n.language === 'ka' ? template.description_ka : template.description_en;
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: colors.background.secondary,
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontSize: typography.fontSize.lg,
            color: colors.text.secondary,
          }}>
            {t('common.loading')}
          </div>
        </div>
      </div>
    );
  }

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
          <NotificationBell count={notificationCount} />
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

          {templates.length === 0 ? (
            <EmptyState
              icon="Hammer"
              title={t('home.noTemplates')}
              description={t('home.noTemplatesDescription')}
            />
          ) : (
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
                  icon={template.category === 'fence' ? 'Ruler' : template.category === 'slab' ? 'Box' : 'Hammer'}
                  imageUrl={template.images?.[0]}
                  estimatedDuration={template.estimated_duration_days || undefined}
                  difficulty={template.difficulty_level as any}
                />
              ))}
            </div>
          )}

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
              icon="Zap"
              label={t('home.newDirectOrder')}
              path="/orders/direct"
              variant="primary"
            />
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
              badge={stats.pending_orders}
            />
          </div>
        </section>

        {/* Empty State for No Projects */}
        {stats.active_projects === 0 && (
          <section>
            <EmptyState
              icon="FolderOpen"
              title={t('home.noProjects')}
              description={t('home.noProjectsDescription')}
              actionLabel={t('home.startFirstProject')}
              onAction={() => {
                // Scroll to templates section
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          </section>
        )}
      </main>
    </div>
  );
};
