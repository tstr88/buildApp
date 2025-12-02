/**
 * Buyer Home Screen
 * Main landing page for buyers with templates and quick actions
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import * as Icons from 'lucide-react';
import { TemplateCard } from '../components/home/TemplateCard';
import { QuickLinkButton } from '../components/home/QuickLinkButton';
import { EmptyState } from '../components/common/EmptyState';
import { NotificationBell } from '../components/navigation/NotificationBell';
import { CartIcon } from '../components/navigation/CartIcon';
import { getBuyerHome, getPublishedTemplates } from '../services/api/homeService';
import { colors, spacing, typography, shadows, borderRadius } from '../theme/tokens';
import { API_BASE_URL } from '../services/api/client';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface SKU {
  id: string;
  supplier_id: string;
  supplier_name_ka: string;
  supplier_name_en: string;
  name_ka: string;
  name_en: string;
  spec_string_ka?: string;
  spec_string_en?: string;
  category_ka: string;
  category_en: string;
  base_price?: number;
  unit_ka: string;
  unit_en: string;
  direct_order_available: boolean;
  thumbnail_url?: string;
}

interface RentalTool {
  id: string;
  tool_name: string;
  spec_string?: string;
  photo_url?: string;
  supplier_id: string;
  supplier_name: string;
  daily_rate?: number;
  direct_booking_available: boolean;
}

interface Supplier {
  id: string;
  business_name: string;
  depot_address: string;
  categories: string[];
  sku_count: number;
  has_direct_order: boolean;
}

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
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [materials, setMaterials] = useState<SKU[]>([]);
  const [rentalTools, setRentalTools] = useState<RentalTool[]>([]);
  const [factories, setFactories] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    active_projects: 0,
    active_rfqs: 0,
    pending_orders: 0,
  });
  const [notificationCount] = useState(0);

  useEffect(() => {
    loadHomeData();
    loadMaterials();
    loadRentalTools();
    loadFactories();
  }, [i18n.language]);

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

  const loadMaterials = async () => {
    try {
      const params = new URLSearchParams();
      params.set('limit', '10');
      params.set('sort', 'updated_desc');
      const response = await fetch(`${API_URL}/api/catalog/skus?${params.toString()}`);
      if (response.ok) {
        const result = await response.json();
        setMaterials(result.data?.skus || []);
      }
    } catch (error) {
      console.error('Error fetching materials:', error);
    }
  };

  const loadRentalTools = async () => {
    try {
      const params = new URLSearchParams();
      params.set('limit', '10');
      params.set('lang', i18n.language);
      const response = await fetch(`${API_BASE_URL}/rentals/tools?${params.toString()}`);
      if (response.ok) {
        const result = await response.json();
        setRentalTools(result.data?.tools || []);
      }
    } catch (error) {
      console.error('Error fetching rental tools:', error);
    }
  };

  const loadFactories = async () => {
    try {
      const params = new URLSearchParams();
      params.set('limit', '10');
      params.set('lang', i18n.language);
      const response = await fetch(`${API_URL}/api/factories?${params.toString()}`);
      if (response.ok) {
        const result = await response.json();
        setFactories(result.data?.suppliers || []);
      }
    } catch (error) {
      console.error('Error fetching factories:', error);
    }
  };

  const isGeorgian = i18n.language === 'ka';

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
      {/* Top Header - Premium branded */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 1020,
          background: `linear-gradient(135deg, ${colors.primary[600]} 0%, ${colors.primary[700]} 100%)`,
          boxShadow: shadows.lg,
        }}
      >
        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: `${spacing[5]} ${spacing[4]}`,
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
              color: colors.neutral[0],
              letterSpacing: '-0.5px',
            }}
          >
            buildApp
          </div>

          {/* Cart and Notification Icons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing[1] }}>
            <CartIcon variant="light" />
            <NotificationBell count={notificationCount} variant="light" />
          </div>
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

        {/* Materials Section */}
        {materials.length > 0 && (
          <section style={{ marginBottom: spacing[8] }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: spacing[4],
              }}
            >
              <h2
                style={{
                  fontSize: typography.fontSize.xl,
                  fontWeight: typography.fontWeight.semibold,
                  color: colors.text.primary,
                  margin: 0,
                }}
              >
                {t('home.materials')}
              </h2>
              <button
                onClick={() => navigate('/catalog')}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  fontSize: typography.fontSize.sm,
                  fontWeight: typography.fontWeight.medium,
                  color: colors.primary[600],
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: spacing[1],
                }}
              >
                {t('home.seeMore')}
                <Icons.ChevronRight size={16} />
              </button>
            </div>

            <div
              style={{
                display: 'flex',
                gap: spacing[3],
                overflowX: 'auto',
                paddingBottom: spacing[2],
                paddingLeft: spacing[1],
                paddingRight: spacing[1],
                WebkitOverflowScrolling: 'touch',
                scrollSnapType: 'x mandatory',
                msOverflowStyle: 'none',
                scrollbarWidth: 'none',
              }}
            >
              {materials.map((sku) => (
                <div
                  key={sku.id}
                  onClick={() => navigate(`/catalog/${sku.id}`)}
                  style={{
                    flexShrink: 0,
                    width: '200px',
                    backgroundColor: colors.neutral[0],
                    borderRadius: borderRadius.lg,
                    border: `1px solid ${colors.border.light}`,
                    overflow: 'hidden',
                    cursor: 'pointer',
                    scrollSnapAlign: 'start',
                  }}
                >
                  <div
                    style={{
                      width: '100%',
                      height: '120px',
                      backgroundColor: colors.neutral[100],
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                    }}
                  >
                    {sku.thumbnail_url ? (
                      <img
                        src={sku.thumbnail_url}
                        alt={isGeorgian ? sku.name_ka : sku.name_en}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <Icons.Package size={24} color={colors.primary[600]} />
                    )}
                    {sku.direct_order_available && (
                      <div
                        style={{
                          position: 'absolute',
                          top: spacing[1],
                          left: spacing[1],
                          padding: `${spacing[0.5]} ${spacing[1.5]}`,
                          backgroundColor: colors.warning[500],
                          color: colors.neutral[0],
                          borderRadius: borderRadius.full,
                          fontSize: '10px',
                          fontWeight: typography.fontWeight.semibold,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '2px',
                        }}
                      >
                        <Icons.Zap size={10} />
                      </div>
                    )}
                  </div>
                  <div style={{ padding: spacing[2] }}>
                    <p
                      style={{
                        fontSize: typography.fontSize.sm,
                        fontWeight: typography.fontWeight.semibold,
                        color: colors.text.primary,
                        margin: 0,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {sku.spec_string_ka || sku.spec_string_en
                        ? `${isGeorgian ? sku.spec_string_ka : sku.spec_string_en} ${isGeorgian ? sku.name_ka : sku.name_en}`
                        : (isGeorgian ? sku.name_ka : sku.name_en)}
                    </p>
                    <p
                      style={{
                        fontSize: typography.fontSize.xs,
                        color: colors.text.secondary,
                        margin: 0,
                        marginTop: spacing[0.5],
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {isGeorgian ? sku.supplier_name_ka : sku.supplier_name_en}
                    </p>
                    {sku.base_price && (
                      <p
                        style={{
                          fontSize: typography.fontSize.sm,
                          fontWeight: typography.fontWeight.bold,
                          color: colors.primary[600],
                          margin: 0,
                          marginTop: spacing[1],
                        }}
                      >
                        {Number(sku.base_price).toLocaleString()} ₾
                        <span
                          style={{
                            fontSize: typography.fontSize.xs,
                            fontWeight: typography.fontWeight.normal,
                            color: colors.text.secondary,
                          }}
                        >
                          {' '}/ {isGeorgian ? sku.unit_ka : sku.unit_en}
                        </span>
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Tool Rentals Section */}
        {rentalTools.length > 0 && (
          <section style={{ marginBottom: spacing[8] }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: spacing[4],
              }}
            >
              <h2
                style={{
                  fontSize: typography.fontSize.xl,
                  fontWeight: typography.fontWeight.semibold,
                  color: colors.text.primary,
                  margin: 0,
                }}
              >
                {t('home.toolRentals')}
              </h2>
              <button
                onClick={() => navigate('/rentals')}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  fontSize: typography.fontSize.sm,
                  fontWeight: typography.fontWeight.medium,
                  color: colors.primary[600],
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: spacing[1],
                }}
              >
                {t('home.seeMore')}
                <Icons.ChevronRight size={16} />
              </button>
            </div>

            <div
              style={{
                display: 'flex',
                gap: spacing[3],
                overflowX: 'auto',
                paddingBottom: spacing[2],
                paddingLeft: spacing[1],
                paddingRight: spacing[1],
                WebkitOverflowScrolling: 'touch',
                scrollSnapType: 'x mandatory',
                msOverflowStyle: 'none',
                scrollbarWidth: 'none',
              }}
            >
              {rentalTools.map((tool) => (
                <div
                  key={tool.id}
                  onClick={() => navigate(`/rentals/tools/${tool.id}`)}
                  style={{
                    flexShrink: 0,
                    width: '200px',
                    backgroundColor: colors.neutral[0],
                    borderRadius: borderRadius.lg,
                    border: `1px solid ${colors.border.light}`,
                    overflow: 'hidden',
                    cursor: 'pointer',
                    scrollSnapAlign: 'start',
                  }}
                >
                  <div
                    style={{
                      width: '100%',
                      height: '120px',
                      backgroundColor: colors.neutral[100],
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                    }}
                  >
                    {tool.photo_url ? (
                      <img
                        src={tool.photo_url}
                        alt={tool.tool_name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <Icons.Wrench size={24} color={colors.primary[600]} />
                    )}
                    {tool.direct_booking_available && (
                      <div
                        style={{
                          position: 'absolute',
                          top: spacing[1],
                          left: spacing[1],
                          padding: `${spacing[0.5]} ${spacing[1.5]}`,
                          backgroundColor: colors.warning[500],
                          color: colors.neutral[0],
                          borderRadius: borderRadius.full,
                          fontSize: '10px',
                          fontWeight: typography.fontWeight.semibold,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '2px',
                        }}
                      >
                        <Icons.Zap size={10} />
                      </div>
                    )}
                  </div>
                  <div style={{ padding: spacing[2] }}>
                    <p
                      style={{
                        fontSize: typography.fontSize.sm,
                        fontWeight: typography.fontWeight.semibold,
                        color: colors.text.primary,
                        margin: 0,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {tool.spec_string ? `${tool.spec_string} ${tool.tool_name}` : tool.tool_name}
                    </p>
                    <p
                      style={{
                        fontSize: typography.fontSize.xs,
                        color: colors.text.secondary,
                        margin: 0,
                        marginTop: spacing[0.5],
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {tool.supplier_name}
                    </p>
                    {tool.daily_rate && (
                      <p
                        style={{
                          fontSize: typography.fontSize.sm,
                          fontWeight: typography.fontWeight.bold,
                          color: colors.primary[600],
                          margin: 0,
                          marginTop: spacing[1],
                        }}
                      >
                        {tool.daily_rate.toLocaleString()} ₾
                        <span
                          style={{
                            fontSize: typography.fontSize.xs,
                            fontWeight: typography.fontWeight.normal,
                            color: colors.text.secondary,
                          }}
                        >
                          {' '}/ {t('rentalsPage.pricing.day')}
                        </span>
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Factories Section */}
        {factories.length > 0 && (
          <section style={{ marginBottom: spacing[8] }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: spacing[4],
              }}
            >
              <h2
                style={{
                  fontSize: typography.fontSize.xl,
                  fontWeight: typography.fontWeight.semibold,
                  color: colors.text.primary,
                  margin: 0,
                }}
              >
                {t('home.factories')}
              </h2>
              <button
                onClick={() => navigate('/factories')}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  fontSize: typography.fontSize.sm,
                  fontWeight: typography.fontWeight.medium,
                  color: colors.primary[600],
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: spacing[1],
                }}
              >
                {t('home.seeMore')}
                <Icons.ChevronRight size={16} />
              </button>
            </div>

            <div
              style={{
                display: 'flex',
                gap: spacing[3],
                overflowX: 'auto',
                paddingBottom: spacing[2],
                paddingLeft: spacing[1],
                paddingRight: spacing[1],
                WebkitOverflowScrolling: 'touch',
                scrollSnapType: 'x mandatory',
                msOverflowStyle: 'none',
                scrollbarWidth: 'none',
              }}
            >
              {factories.map((supplier) => (
                <div
                  key={supplier.id}
                  onClick={() => navigate(`/factories/${supplier.id}`)}
                  style={{
                    flexShrink: 0,
                    width: '220px',
                    backgroundColor: colors.neutral[0],
                    borderRadius: borderRadius.lg,
                    border: `1px solid ${colors.border.light}`,
                    padding: spacing[3],
                    cursor: 'pointer',
                    scrollSnapAlign: 'start',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: spacing[2],
                      marginBottom: spacing[2],
                    }}
                  >
                    <div
                      style={{
                        width: '40px',
                        height: '40px',
                        backgroundColor: colors.primary[50],
                        borderRadius: borderRadius.full,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Icons.Factory size={20} color={colors.primary[600]} />
                    </div>
                    {supplier.has_direct_order && (
                      <div
                        style={{
                          padding: `${spacing[0.5]} ${spacing[1.5]}`,
                          backgroundColor: colors.warning[500],
                          color: colors.neutral[0],
                          borderRadius: borderRadius.full,
                          fontSize: '10px',
                          fontWeight: typography.fontWeight.semibold,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '2px',
                        }}
                      >
                        <Icons.Zap size={10} />
                      </div>
                    )}
                  </div>
                  <p
                    style={{
                      fontSize: typography.fontSize.sm,
                      fontWeight: typography.fontWeight.semibold,
                      color: colors.text.primary,
                      margin: 0,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {supplier.business_name}
                  </p>
                  <p
                    style={{
                      fontSize: typography.fontSize.xs,
                      color: colors.text.secondary,
                      margin: 0,
                      marginTop: spacing[0.5],
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      display: 'flex',
                      alignItems: 'center',
                      gap: spacing[1],
                    }}
                  >
                    <Icons.MapPin size={12} />
                    {supplier.depot_address}
                  </p>
                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: spacing[1],
                      marginTop: spacing[2],
                    }}
                  >
                    {supplier.categories.slice(0, 3).map((cat) => (
                      <span
                        key={cat}
                        style={{
                          padding: `${spacing[0.5]} ${spacing[1.5]}`,
                          backgroundColor: colors.primary[50],
                          color: colors.primary[700],
                          borderRadius: borderRadius.sm,
                          fontSize: '10px',
                          fontWeight: typography.fontWeight.medium,
                        }}
                      >
                        {cat}
                      </span>
                    ))}
                  </div>
                  <p
                    style={{
                      fontSize: typography.fontSize.xs,
                      color: colors.text.tertiary,
                      margin: 0,
                      marginTop: spacing[2],
                      display: 'flex',
                      alignItems: 'center',
                      gap: spacing[1],
                    }}
                  >
                    <Icons.Package size={12} />
                    {supplier.sku_count} {t('factoriesPage.card.skusAvailable')}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

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
