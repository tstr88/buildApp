/**
 * RFQs List Page
 * Shows user's RFQs with tabs for different statuses
 * Professional modern design matching BookRentalTool style
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import * as Icons from 'lucide-react';
import { colors, spacing, typography, borderRadius, shadows, heights } from '../theme/tokens';
import { useWebSocket } from '../context/WebSocketContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Hook for mobile detection
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768;
    }
    return false;
  });

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile;
};

interface RFQLine {
  description: string;
  quantity: number;
  unit: string;
  sku_id?: string;
  spec_notes?: string;
}

interface RFQ {
  id: string;
  project_id: string;
  project_name: string;
  title: string | null;
  lines: RFQLine[];
  status: 'draft' | 'active' | 'expired' | 'closed';
  supplier_count: number;
  offer_count: number;
  unread_offer_count: number;
  created_at: string;
  expires_at: string;
}

type TabType = 'active' | 'offers' | 'accepted' | 'expired';

// Generate a short reference code from UUID (first 8 chars uppercase)
const getRfqCode = (id: string): string => {
  return `#${id.slice(0, 8).toUpperCase()}`;
};

// Generate smart RFQ display name based on items
const getRfqDisplayInfo = (rfq: RFQ): { title: string; subtitle: string } => {
  const code = getRfqCode(rfq.id);

  // If RFQ has a custom title, use it
  if (rfq.title) {
    return {
      title: `${code} · ${rfq.title}`,
      subtitle: rfq.lines.length > 0
        ? `${rfq.lines[0].description}${rfq.lines.length > 1 ? ` +${rfq.lines.length - 1} more` : ''}`
        : '',
    };
  }

  // Generate title from first item
  if (rfq.lines.length > 0) {
    const firstItem = rfq.lines[0].description;
    const moreCount = rfq.lines.length - 1;

    return {
      title: code,
      subtitle: moreCount > 0 ? `${firstItem} +${moreCount} more` : firstItem,
    };
  }

  // Fallback
  return {
    title: code,
    subtitle: 'No items',
  };
};

export const RFQs: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [rfqs, setRfqs] = useState<RFQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('active');
  const { socket } = useWebSocket();

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    fetchRFQs();
  }, [activeTab]);

  // Subscribe to real-time RFQ list updates
  useEffect(() => {
    if (!socket) return;

    const handleOfferCreated = () => {
      fetchRFQs();
    };

    const handleRfqsListUpdated = () => {
      fetchRFQs();
    };

    socket.on('offer:created', handleOfferCreated);
    socket.on('rfqs:list-updated', handleRfqsListUpdated);

    return () => {
      socket.off('offer:created', handleOfferCreated);
      socket.off('rfqs:list-updated', handleRfqsListUpdated);
    };
  }, [socket]);

  const fetchRFQs = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('buildapp_auth_token');
      const statusMap: Record<TabType, string | undefined> = {
        active: 'active',
        offers: 'active',
        accepted: undefined,
        expired: 'expired',
      };

      const status = statusMap[activeTab];
      const url = status
        ? `${API_URL}/api/buyers/rfqs?status=${status}`
        : `${API_URL}/api/buyers/rfqs`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        let filteredRfqs = data.data || [];

        if (activeTab === 'offers') {
          filteredRfqs = filteredRfqs.filter((rfq: RFQ) => rfq.offer_count > 0);
        }

        setRfqs(filteredRfqs);
      }
    } catch (error) {
      console.error('Failed to fetch RFQs:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const locale = i18n.language === 'ka' ? 'ka-GE' : 'en-US';
    return date.toLocaleDateString(locale, { month: 'short', day: 'numeric' });
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return formatDate(dateString);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return { bg: colors.success[100], text: colors.success[700], border: colors.success[200] };
      case 'expired':
        return { bg: colors.neutral[100], text: colors.neutral[600], border: colors.neutral[200] };
      case 'closed':
        return { bg: colors.info[100], text: colors.info[700], border: colors.info[200] };
      case 'draft':
        return { bg: colors.warning[100], text: colors.warning[700], border: colors.warning[200] };
      default:
        return { bg: colors.neutral[100], text: colors.neutral[600], border: colors.neutral[200] };
    }
  };

  // Count for tabs
  const totalCount = rfqs.length;
  const offersCount = rfqs.filter((rfq) => rfq.offer_count > 0).length;
  const unreadCount = rfqs.reduce((sum, rfq) => sum + rfq.unread_offer_count, 0);

  const tabs = [
    { id: 'active', label: t('rfqsPage.tabs.active', 'Active'), icon: Icons.FileText },
    { id: 'offers', label: t('rfqsPage.tabs.offers', 'With Offers'), icon: Icons.Mail, badge: unreadCount > 0 ? unreadCount : undefined },
    { id: 'accepted', label: t('rfqsPage.tabs.accepted', 'Accepted'), icon: Icons.CheckCircle },
    { id: 'expired', label: t('rfqsPage.tabs.expired', 'Expired'), icon: Icons.Clock },
  ];

  // Mobile Layout
  if (isMobile) {
    return (
      <div
        style={{
          minHeight: '100vh',
          backgroundColor: colors.neutral[100],
          paddingBottom: `calc(${heights.bottomNav} + env(safe-area-inset-bottom, 0px) + 20px)`,
        }}
      >
        {/* Header */}
        <div
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 100,
            backgroundColor: colors.primary[600],
            padding: spacing[4],
            paddingTop: `calc(${spacing[4]} + env(safe-area-inset-top, 0px))`,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h1
                style={{
                  fontSize: typography.fontSize.xl,
                  fontWeight: typography.fontWeight.bold,
                  color: colors.neutral[0],
                  margin: 0,
                }}
              >
                {t('rfqsPage.title', 'My RFQs')}
              </h1>
              <p
                style={{
                  fontSize: typography.fontSize.sm,
                  color: 'rgba(255,255,255,0.8)',
                  margin: 0,
                  marginTop: spacing[1],
                }}
              >
                {t('rfqsPage.subtitle', 'Manage your quote requests')}
              </p>
            </div>
            <button
              onClick={() => navigate('/rfqs/create')}
              style={{
                width: '44px',
                height: '44px',
                borderRadius: borderRadius.full,
                backgroundColor: colors.neutral[0],
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: shadows.md,
              }}
            >
              <Icons.Plus size={24} color={colors.primary[600]} />
            </button>
          </div>

          {/* Tab Pills */}
          <div
            style={{
              display: 'flex',
              gap: spacing[2],
              marginTop: spacing[4],
              overflowX: 'auto',
              WebkitOverflowScrolling: 'touch',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
          >
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: spacing[2],
                    padding: `${spacing[2]} ${spacing[3]}`,
                    backgroundColor: isActive ? colors.neutral[0] : 'rgba(255,255,255,0.15)',
                    border: 'none',
                    borderRadius: borderRadius.full,
                    fontSize: typography.fontSize.sm,
                    fontWeight: typography.fontWeight.medium,
                    color: isActive ? colors.primary[700] : colors.neutral[0],
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                    position: 'relative',
                  }}
                >
                  <tab.icon size={16} />
                  {tab.label}
                  {tab.badge && (
                    <span
                      style={{
                        minWidth: '18px',
                        height: '18px',
                        borderRadius: borderRadius.full,
                        backgroundColor: colors.error[600],
                        color: colors.neutral[0],
                        fontSize: typography.fontSize.xs,
                        fontWeight: typography.fontWeight.bold,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '0 4px',
                      }}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: spacing[4] }}>
          {loading ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: spacing[12],
              }}
            >
              <Icons.Loader
                size={32}
                color={colors.primary[600]}
                style={{ animation: 'spin 1s linear infinite' }}
              />
              <p style={{ color: colors.text.secondary, marginTop: spacing[3] }}>
                {t('common.loading', 'Loading...')}
              </p>
            </div>
          ) : rfqs.length === 0 ? (
            <div
              style={{
                backgroundColor: colors.neutral[0],
                borderRadius: borderRadius.xl,
                padding: spacing[8],
                textAlign: 'center',
                boxShadow: shadows.sm,
              }}
            >
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: borderRadius.full,
                  backgroundColor: colors.primary[100],
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto',
                  marginBottom: spacing[4],
                }}
              >
                <Icons.FileText size={32} color={colors.primary[600]} />
              </div>
              <h3
                style={{
                  fontSize: typography.fontSize.lg,
                  fontWeight: typography.fontWeight.semibold,
                  color: colors.text.primary,
                  margin: 0,
                  marginBottom: spacing[2],
                }}
              >
                {t('rfqsPage.empty.title', 'No RFQs found')}
              </h3>
              <p
                style={{
                  fontSize: typography.fontSize.sm,
                  color: colors.text.secondary,
                  margin: 0,
                  marginBottom: spacing[4],
                }}
              >
                {activeTab === 'active'
                  ? t('rfqsPage.empty.noRfqs', 'Create your first RFQ to get started')
                  : activeTab === 'offers'
                  ? t('rfqsPage.empty.noOffers', 'RFQs with offers will appear here')
                  : activeTab === 'accepted'
                  ? t('rfqsPage.empty.noAccepted', 'Accepted RFQs will appear here')
                  : t('rfqsPage.empty.noExpired', 'Expired RFQs will appear here')}
              </p>
              {activeTab === 'active' && (
                <button
                  onClick={() => navigate('/rfqs/create')}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: spacing[2],
                    padding: `${spacing[3]} ${spacing[5]}`,
                    backgroundColor: colors.primary[600],
                    color: colors.neutral[0],
                    border: 'none',
                    borderRadius: borderRadius.lg,
                    fontSize: typography.fontSize.base,
                    fontWeight: typography.fontWeight.medium,
                    cursor: 'pointer',
                  }}
                >
                  <Icons.Plus size={18} />
                  Create RFQ
                </button>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[3] }}>
              {rfqs.map((rfq) => {
                const statusColor = getStatusColor(rfq.status);
                const hasUnread = rfq.unread_offer_count > 0;
                const displayInfo = getRfqDisplayInfo(rfq);

                return (
                  <div
                    key={rfq.id}
                    onClick={() => navigate(`/rfqs/${rfq.id}`)}
                    style={{
                      backgroundColor: colors.neutral[0],
                      borderRadius: borderRadius.lg,
                      padding: spacing[4],
                      boxShadow: shadows.sm,
                      cursor: 'pointer',
                      border: hasUnread ? `2px solid ${colors.primary[400]}` : `1px solid ${colors.border.light}`,
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                  >
                    {/* Unread indicator line */}
                    {hasUnread && (
                      <div
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          height: '3px',
                          backgroundColor: colors.primary[600],
                        }}
                      />
                    )}

                    {/* Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing[2] }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2], marginBottom: spacing[1] }}>
                          <span
                            style={{
                              fontSize: typography.fontSize.xs,
                              fontWeight: typography.fontWeight.bold,
                              color: colors.primary[600],
                              fontFamily: 'monospace',
                            }}
                          >
                            {displayInfo.title}
                          </span>
                          <span
                            style={{
                              fontSize: typography.fontSize.xs,
                              fontWeight: typography.fontWeight.medium,
                              padding: `2px ${spacing[2]}`,
                              borderRadius: borderRadius.full,
                              backgroundColor: statusColor.bg,
                              color: statusColor.text,
                              textTransform: 'capitalize',
                            }}
                          >
                            {rfq.status}
                          </span>
                          {hasUnread && (
                            <span
                              style={{
                                fontSize: typography.fontSize.xs,
                                fontWeight: typography.fontWeight.bold,
                                padding: `2px ${spacing[2]}`,
                                borderRadius: borderRadius.full,
                                backgroundColor: colors.error[600],
                                color: colors.neutral[0],
                              }}
                            >
                              {rfq.unread_offer_count} new
                            </span>
                          )}
                        </div>
                        <h3
                          style={{
                            fontSize: typography.fontSize.base,
                            fontWeight: hasUnread ? typography.fontWeight.bold : typography.fontWeight.semibold,
                            color: colors.text.primary,
                            margin: 0,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {displayInfo.subtitle}
                        </h3>
                      </div>
                      <span
                        style={{
                          fontSize: typography.fontSize.xs,
                          color: colors.text.tertiary,
                          flexShrink: 0,
                        }}
                      >
                        {formatRelativeTime(rfq.created_at)}
                      </span>
                    </div>

                    {/* Project */}
                    {rfq.project_name && (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: spacing[2],
                          marginBottom: spacing[3],
                        }}
                      >
                        <Icons.MapPin size={14} color={colors.text.tertiary} />
                        <span
                          style={{
                            fontSize: typography.fontSize.sm,
                            color: colors.text.secondary,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {rfq.project_name}
                        </span>
                      </div>
                    )}

                    {/* Stats */}
                    <div
                      style={{
                        display: 'flex',
                        gap: spacing[4],
                        paddingTop: spacing[3],
                        borderTop: `1px solid ${colors.border.light}`,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2] }}>
                        <div
                          style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: borderRadius.md,
                            backgroundColor: colors.info[100],
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Icons.Package size={14} color={colors.info[600]} />
                        </div>
                        <div>
                          <p style={{ fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.semibold, color: colors.text.primary, margin: 0 }}>
                            {rfq.lines.length}
                          </p>
                          <p style={{ fontSize: typography.fontSize.xs, color: colors.text.tertiary, margin: 0 }}>
                            Items
                          </p>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2] }}>
                        <div
                          style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: borderRadius.md,
                            backgroundColor: colors.secondary[100],
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Icons.Users size={14} color={colors.secondary[700]} />
                        </div>
                        <div>
                          <p style={{ fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.semibold, color: colors.text.primary, margin: 0 }}>
                            {rfq.supplier_count}
                          </p>
                          <p style={{ fontSize: typography.fontSize.xs, color: colors.text.tertiary, margin: 0 }}>
                            Suppliers
                          </p>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2] }}>
                        <div
                          style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: borderRadius.md,
                            backgroundColor: rfq.offer_count > 0 ? colors.success[100] : colors.neutral[100],
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Icons.Mail size={14} color={rfq.offer_count > 0 ? colors.success[600] : colors.text.tertiary} />
                        </div>
                        <div>
                          <p
                            style={{
                              fontSize: typography.fontSize.sm,
                              fontWeight: typography.fontWeight.semibold,
                              color: rfq.offer_count > 0 ? colors.success[600] : colors.text.primary,
                              margin: 0,
                            }}
                          >
                            {rfq.offer_count}
                          </p>
                          <p style={{ fontSize: typography.fontSize.xs, color: colors.text.tertiary, margin: 0 }}>
                            Offers
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Chevron */}
                    <div
                      style={{
                        position: 'absolute',
                        right: spacing[3],
                        top: '50%',
                        transform: 'translateY(-50%)',
                      }}
                    >
                      <Icons.ChevronRight size={20} color={colors.text.tertiary} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Spin animation */}
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // Desktop Layout
  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: colors.neutral[50],
        padding: spacing[6],
      }}
    >
      {/* Header */}
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          marginBottom: spacing[6],
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1
              style={{
                fontSize: typography.fontSize['3xl'],
                fontWeight: typography.fontWeight.bold,
                color: colors.text.primary,
                margin: 0,
                marginBottom: spacing[2],
              }}
            >
              {t('rfqsPage.title', 'My RFQs')}
            </h1>
            <p
              style={{
                fontSize: typography.fontSize.base,
                color: colors.text.secondary,
                margin: 0,
              }}
            >
              {t('rfqsPage.subtitle', 'Manage your quote requests')}
            </p>
          </div>
          <button
            onClick={() => navigate('/rfqs/create')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: spacing[2],
              padding: `${spacing[3]} ${spacing[5]}`,
              backgroundColor: colors.primary[600],
              color: colors.neutral[0],
              border: 'none',
              borderRadius: borderRadius.lg,
              fontSize: typography.fontSize.base,
              fontWeight: typography.fontWeight.medium,
              cursor: 'pointer',
              boxShadow: shadows.sm,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = colors.primary[700];
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = colors.primary[600];
            }}
          >
            <Icons.Plus size={20} />
            {t('rfqsPage.newRfq', 'Create New RFQ')}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          marginBottom: spacing[4],
        }}
      >
        <div
          style={{
            backgroundColor: colors.neutral[0],
            borderRadius: borderRadius.lg,
            padding: spacing[1],
            display: 'inline-flex',
            gap: spacing[1],
            boxShadow: shadows.sm,
          }}
        >
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: spacing[2],
                  padding: `${spacing[2]} ${spacing[4]}`,
                  backgroundColor: isActive ? colors.primary[600] : 'transparent',
                  border: 'none',
                  borderRadius: borderRadius.md,
                  fontSize: typography.fontSize.sm,
                  fontWeight: typography.fontWeight.medium,
                  color: isActive ? colors.neutral[0] : colors.text.secondary,
                  cursor: 'pointer',
                  transition: 'all 200ms ease',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = colors.neutral[100];
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                <tab.icon size={16} />
                {tab.label}
                {tab.badge && (
                  <span
                    style={{
                      minWidth: '20px',
                      height: '20px',
                      borderRadius: borderRadius.full,
                      backgroundColor: isActive ? colors.neutral[0] : colors.error[600],
                      color: isActive ? colors.primary[600] : colors.neutral[0],
                      fontSize: typography.fontSize.xs,
                      fontWeight: typography.fontWeight.bold,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '0 6px',
                    }}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
        }}
      >
        {loading ? (
          <div
            style={{
              backgroundColor: colors.neutral[0],
              borderRadius: borderRadius.lg,
              padding: spacing[12],
              textAlign: 'center',
              boxShadow: shadows.sm,
            }}
          >
            <Icons.Loader
              size={40}
              color={colors.primary[600]}
              style={{ animation: 'spin 1s linear infinite' }}
            />
            <p style={{ color: colors.text.secondary, marginTop: spacing[4] }}>
              {t('common.loading', 'Loading your RFQs...')}
            </p>
          </div>
        ) : rfqs.length === 0 ? (
          <div
            style={{
              backgroundColor: colors.neutral[0],
              borderRadius: borderRadius.xl,
              padding: spacing[12],
              textAlign: 'center',
              boxShadow: shadows.sm,
            }}
          >
            <div
              style={{
                width: '80px',
                height: '80px',
                borderRadius: borderRadius.full,
                backgroundColor: colors.primary[100],
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto',
                marginBottom: spacing[4],
              }}
            >
              <Icons.FileText size={40} color={colors.primary[600]} />
            </div>
            <h3
              style={{
                fontSize: typography.fontSize.xl,
                fontWeight: typography.fontWeight.semibold,
                color: colors.text.primary,
                margin: 0,
                marginBottom: spacing[2],
              }}
            >
              {t('rfqsPage.empty.title', 'No RFQs found')}
            </h3>
            <p
              style={{
                fontSize: typography.fontSize.base,
                color: colors.text.secondary,
                margin: 0,
                marginBottom: spacing[6],
                maxWidth: '400px',
                marginLeft: 'auto',
                marginRight: 'auto',
              }}
            >
              {activeTab === 'active'
                ? t('rfqsPage.empty.noRfqs', 'Create your first RFQ to start receiving quotes from suppliers')
                : activeTab === 'offers'
                ? t('rfqsPage.empty.noOffers', 'RFQs with offers will appear here')
                : activeTab === 'accepted'
                ? t('rfqsPage.empty.noAccepted', 'Accepted RFQs will appear here')
                : t('rfqsPage.empty.noExpired', 'Expired RFQs will appear here')}
            </p>
            {activeTab === 'active' && (
              <button
                onClick={() => navigate('/rfqs/create')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: spacing[2],
                  padding: `${spacing[3]} ${spacing[6]}`,
                  backgroundColor: colors.primary[600],
                  color: colors.neutral[0],
                  border: 'none',
                  borderRadius: borderRadius.lg,
                  fontSize: typography.fontSize.base,
                  fontWeight: typography.fontWeight.medium,
                  cursor: 'pointer',
                }}
              >
                <Icons.Plus size={20} />
                Create Your First RFQ
              </button>
            )}
          </div>
        ) : (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: spacing[3],
            }}
          >
            {rfqs.map((rfq) => {
              const statusColor = getStatusColor(rfq.status);
              const hasUnread = rfq.unread_offer_count > 0;
              const displayInfo = getRfqDisplayInfo(rfq);

              return (
                <div
                  key={rfq.id}
                  onClick={() => navigate(`/rfqs/${rfq.id}`)}
                  style={{
                    backgroundColor: colors.neutral[0],
                    borderRadius: borderRadius.lg,
                    padding: spacing[5],
                    boxShadow: shadows.sm,
                    cursor: 'pointer',
                    border: hasUnread ? `2px solid ${colors.primary[400]}` : `1px solid ${colors.border.light}`,
                    transition: 'all 200ms ease',
                    position: 'relative',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    gap: spacing[5],
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = shadows.md;
                    e.currentTarget.style.backgroundColor = colors.neutral[50];
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = shadows.sm;
                    e.currentTarget.style.backgroundColor = colors.neutral[0];
                  }}
                >
                  {/* Unread indicator - left border */}
                  {hasUnread && (
                    <div
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        bottom: 0,
                        width: '4px',
                        backgroundColor: colors.primary[600],
                      }}
                    />
                  )}

                  {/* Icon */}
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: borderRadius.lg,
                      backgroundColor: hasUnread ? colors.primary[100] : colors.neutral[100],
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Icons.FileText size={24} color={hasUnread ? colors.primary[600] : colors.text.tertiary} />
                  </div>

                  {/* Main Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {/* Code and status row */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: spacing[3], marginBottom: spacing[1] }}>
                      <span
                        style={{
                          fontSize: typography.fontSize.sm,
                          fontWeight: typography.fontWeight.bold,
                          color: colors.primary[600],
                          fontFamily: 'monospace',
                        }}
                      >
                        {displayInfo.title}
                      </span>
                      <span
                        style={{
                          fontSize: typography.fontSize.xs,
                          fontWeight: typography.fontWeight.medium,
                          padding: `${spacing[1]} ${spacing[2]}`,
                          borderRadius: borderRadius.full,
                          backgroundColor: statusColor.bg,
                          color: statusColor.text,
                          textTransform: 'capitalize',
                          flexShrink: 0,
                        }}
                      >
                        {rfq.status}
                      </span>
                      {hasUnread && (
                        <span
                          style={{
                            fontSize: typography.fontSize.xs,
                            fontWeight: typography.fontWeight.bold,
                            padding: `${spacing[1]} ${spacing[2]}`,
                            borderRadius: borderRadius.full,
                            backgroundColor: colors.error[600],
                            color: colors.neutral[0],
                            flexShrink: 0,
                          }}
                        >
                          {rfq.unread_offer_count} new
                        </span>
                      )}
                    </div>

                    {/* Item description */}
                    <h3
                      style={{
                        fontSize: typography.fontSize.base,
                        fontWeight: hasUnread ? typography.fontWeight.bold : typography.fontWeight.semibold,
                        color: colors.text.primary,
                        margin: 0,
                        marginBottom: spacing[2],
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {displayInfo.subtitle}
                    </h3>

                    {/* Project name and stats row */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: spacing[4] }}>
                      {rfq.project_name && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: spacing[1] }}>
                          <Icons.MapPin size={14} color={colors.text.tertiary} />
                          <span
                            style={{
                              fontSize: typography.fontSize.sm,
                              color: colors.text.secondary,
                              maxWidth: '200px',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {rfq.project_name}
                          </span>
                        </div>
                      )}
                      <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2] }}>
                        <Icons.Package size={14} color={colors.info[600]} />
                        <span style={{ fontSize: typography.fontSize.sm, color: colors.text.secondary }}>
                          {rfq.lines.length} item{rfq.lines.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2] }}>
                        <Icons.Users size={14} color={colors.secondary[700]} />
                        <span style={{ fontSize: typography.fontSize.sm, color: colors.text.secondary }}>
                          {rfq.supplier_count} supplier{rfq.supplier_count !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2] }}>
                        <Icons.Mail size={14} color={rfq.offer_count > 0 ? colors.success[600] : colors.text.tertiary} />
                        <span
                          style={{
                            fontSize: typography.fontSize.sm,
                            color: rfq.offer_count > 0 ? colors.success[600] : colors.text.secondary,
                            fontWeight: rfq.offer_count > 0 ? typography.fontWeight.medium : typography.fontWeight.normal,
                          }}
                        >
                          {rfq.offer_count} offer{rfq.offer_count !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right side - timestamp and arrow */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: spacing[4],
                      flexShrink: 0,
                    }}
                  >
                    <span
                      style={{
                        fontSize: typography.fontSize.sm,
                        color: colors.text.tertiary,
                      }}
                    >
                      {formatRelativeTime(rfq.created_at)}
                    </span>
                    <Icons.ChevronRight size={20} color={colors.text.tertiary} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Spin animation */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
