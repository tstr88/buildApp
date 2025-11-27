/**
 * RFQs List Page
 * Shows user's RFQs with tabs for different statuses
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import * as Icons from 'lucide-react';
import { colors, spacing, typography, borderRadius, shadows } from '../theme/tokens';
import { useWebSocket } from '../context/WebSocketContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface RFQ {
  id: string;
  project_id: string;
  project_name: string;
  title: string | null;
  lines: any[];
  status: 'draft' | 'active' | 'expired' | 'closed';
  supplier_count: number;
  offer_count: number;
  unread_offer_count: number;
  created_at: string;
  expires_at: string;
}

type TabType = 'active' | 'offers' | 'accepted' | 'expired';

export const RFQs: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [rfqs, setRfqs] = useState<RFQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('active');
  const { socket } = useWebSocket();

  useEffect(() => {
    fetchRFQs();
  }, [activeTab]);

  // Subscribe to real-time RFQ list updates
  useEffect(() => {
    if (!socket) return;

    console.log('[RFQs] Setting up WebSocket listeners');

    const handleOfferCreated = () => {
      console.log('[RFQs] Offer created event received, refreshing RFQ list');
      fetchRFQs();
    };

    const handleRfqsListUpdated = () => {
      console.log('[RFQs] RFQ list updated event received, refreshing RFQ list');
      fetchRFQs();
    };

    socket.on('offer:created', handleOfferCreated);
    socket.on('rfqs:list-updated', handleRfqsListUpdated);

    return () => {
      console.log('[RFQs] Cleaning up WebSocket listeners');
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
        offers: 'active', // Filter on client side by offer_count > 0
        accepted: undefined, // TODO: Add accepted status
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

        // Client-side filtering for "offers" tab
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

  const tabs: { id: TabType; label: string; icon: any }[] = [
    { id: 'active', label: t('rfqsPage.tabs.active'), icon: Icons.Clock },
    { id: 'offers', label: t('rfqsPage.tabs.offers'), icon: Icons.Mail },
    { id: 'accepted', label: t('rfqsPage.tabs.accepted'), icon: Icons.CheckCircle },
    { id: 'expired', label: t('rfqsPage.tabs.expired'), icon: Icons.XCircle },
  ];

  const getStatusBadge = (status: string) => {
    const styles: Record<string, { bg: string; text: string; label: string }> = {
      active: { bg: colors.success[50], text: colors.success[700], label: t('rfqsPage.status.active') },
      draft: { bg: colors.neutral[100], text: colors.text.secondary, label: t('rfqsPage.status.draft') },
      expired: { bg: colors.error[50], text: colors.error[700], label: t('rfqsPage.status.expired') },
      closed: { bg: colors.neutral[100], text: colors.text.secondary, label: t('rfqsPage.status.closed') },
    };

    const style = styles[status] || styles.draft;

    return (
      <span
        style={{
          padding: `${spacing[1]} ${spacing[3]}`,
          backgroundColor: style.bg,
          color: style.text,
          fontSize: typography.fontSize.xs,
          fontWeight: typography.fontWeight.semibold,
          borderRadius: borderRadius.full,
        }}
      >
        {style.label}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const locale = i18n.language === 'ka' ? 'ka-GE' : 'en-US';
    return date.toLocaleDateString(locale, { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: colors.neutral[50],
        paddingBottom: spacing[20],
      }}
    >
      {/* Header */}
      <div
        style={{
          backgroundColor: colors.neutral[0],
          borderBottom: `1px solid ${colors.border.light}`,
          position: 'sticky',
          top: 0,
          zIndex: 10,
        }}
      >
        {/* Title Section */}
        <div style={{ padding: spacing[4], paddingBottom: 0 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: spacing[4],
            }}
          >
            <div>
              <h1
                style={{
                  fontSize: typography.fontSize['2xl'],
                  fontWeight: typography.fontWeight.bold,
                  color: colors.text.primary,
                  margin: 0,
                  marginBottom: spacing[2],
                }}
              >
                {t('rfqsPage.title')}
              </h1>
              <p
                style={{
                  fontSize: typography.fontSize.base,
                  color: colors.text.secondary,
                  margin: 0,
                }}
              >
                {t('rfqsPage.subtitle')}
              </p>
            </div>

            <button
              onClick={() => navigate('/rfqs/create')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: spacing[2],
                padding: `${spacing[2]} ${spacing[4]}`,
                backgroundColor: colors.primary[600],
                color: colors.text.inverse,
                border: 'none',
                borderRadius: borderRadius.lg,
                fontSize: typography.fontSize.base,
                fontWeight: typography.fontWeight.medium,
                cursor: 'pointer',
                boxShadow: shadows.sm,
                transition: 'background-color 200ms ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = colors.primary[700];
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = colors.primary[600];
              }}
            >
              <Icons.Plus size={20} />
              {t('rfqsPage.newRfq')}
            </button>
          </div>
        </div>

        {/* Tabs Section */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: spacing[2],
            padding: spacing[4],
            paddingTop: 0,
          }}
        >
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: spacing[2],
                    padding: `${spacing[2]} ${spacing[4]}`,
                    backgroundColor: isActive ? colors.primary[100] : colors.neutral[100],
                    color: isActive ? colors.primary[700] : colors.text.secondary,
                    border: 'none',
                    borderRadius: borderRadius.lg,
                    fontSize: typography.fontSize.sm,
                    fontWeight: typography.fontWeight.medium,
                    cursor: 'pointer',
                    transition: 'all 200ms ease',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = colors.neutral[200];
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = colors.neutral[100];
                    }
                  }}
                >
                  <Icon size={18} />
                  {tab.label}
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
              textAlign: 'center',
              padding: spacing[12],
              backgroundColor: colors.neutral[0],
              borderRadius: borderRadius.lg,
              boxShadow: shadows.sm,
            }}
          >
            <Icons.Loader size={48} color={colors.text.tertiary} style={{ margin: '0 auto', marginBottom: spacing[4] }} />
            <p style={{ fontSize: typography.fontSize.base, color: colors.text.tertiary }}>
              {t('rfqsPage.loading')}
            </p>
          </div>
        ) : rfqs.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: spacing[12],
              backgroundColor: colors.neutral[0],
              borderRadius: borderRadius.lg,
              boxShadow: shadows.sm,
            }}
          >
            <Icons.FileText size={64} color={colors.text.tertiary} style={{ margin: '0 auto', marginBottom: spacing[4] }} />
            <h3
              style={{
                fontSize: typography.fontSize.xl,
                fontWeight: typography.fontWeight.semibold,
                color: colors.text.primary,
                margin: 0,
                marginBottom: spacing[2],
              }}
            >
              {t('rfqsPage.empty.title')}
            </h3>
            <p
              style={{
                fontSize: typography.fontSize.base,
                color: colors.text.secondary,
                margin: 0,
                marginBottom: spacing[6],
              }}
            >
              {activeTab === 'active' && t('rfqsPage.empty.noRfqs')}
              {activeTab === 'offers' && t('rfqsPage.empty.noOffers')}
              {activeTab === 'accepted' && t('rfqsPage.empty.noAccepted')}
              {activeTab === 'expired' && t('rfqsPage.empty.noExpired')}
            </p>
            {activeTab === 'active' && (
              <button
                onClick={() => navigate('/rfqs/create')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: spacing[2],
                  padding: `${spacing[2]} ${spacing[4]}`,
                  backgroundColor: colors.primary[600],
                  color: colors.text.inverse,
                  border: 'none',
                  borderRadius: borderRadius.lg,
                  fontSize: typography.fontSize.base,
                  fontWeight: typography.fontWeight.medium,
                  cursor: 'pointer',
                  transition: 'background-color 200ms ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = colors.primary[700];
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = colors.primary[600];
                }}
              >
                <Icons.Plus size={20} />
                {t('rfqsPage.empty.createFirst')}
              </button>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[4] }}>
            {rfqs.map((rfq) => (
              <div
                key={rfq.id}
                onClick={() => navigate(`/rfqs/${rfq.id}`)}
                style={{
                  backgroundColor: colors.neutral[0],
                  borderRadius: borderRadius.lg,
                  padding: spacing[6],
                  boxShadow: shadows.sm,
                  cursor: 'pointer',
                  border: `1px solid ${colors.border.light}`,
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = colors.primary[300];
                  e.currentTarget.style.boxShadow = shadows.md;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = colors.border.light;
                  e.currentTarget.style.boxShadow = shadows.sm;
                }}
              >
                <div style={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between' }}>
                  <div style={{ flex: 1 }}>
                    {/* Header */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: spacing[3], marginBottom: spacing[3] }}>
                      <h3
                        style={{
                          fontSize: typography.fontSize.lg,
                          fontWeight: typography.fontWeight.semibold,
                          color: colors.text.primary,
                          margin: 0,
                        }}
                      >
                        {rfq.title || `RFQ - ${formatDate(rfq.created_at)}`}
                      </h3>
                      {getStatusBadge(rfq.status)}
                      {rfq.unread_offer_count > 0 && (
                        <span
                          style={{
                            padding: `${spacing[1]} ${spacing[2]}`,
                            backgroundColor: colors.error[600],
                            color: colors.neutral[0],
                            fontSize: typography.fontSize.xs,
                            fontWeight: typography.fontWeight.bold,
                            borderRadius: borderRadius.full,
                          }}
                        >
                          {rfq.unread_offer_count} {t('rfqsPage.new')}
                        </span>
                      )}
                    </div>

                    {/* Project */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2], marginBottom: spacing[4] }}>
                      <Icons.MapPin size={16} color={colors.text.tertiary} />
                      <span style={{ fontSize: typography.fontSize.sm, color: colors.text.secondary }}>
                        {rfq.project_name}
                      </span>
                    </div>

                    {/* Stats */}
                    <div style={{ display: 'flex', gap: spacing[6] }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2] }}>
                        <Icons.Package size={16} color={colors.text.tertiary} />
                        <span style={{ fontSize: typography.fontSize.sm, color: colors.text.secondary }}>
                          {rfq.lines.length} {rfq.lines.length === 1 ? t('rfqsPage.item') : t('rfqsPage.items')}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2] }}>
                        <Icons.Users size={16} color={colors.text.tertiary} />
                        <span style={{ fontSize: typography.fontSize.sm, color: colors.text.secondary }}>
                          {rfq.supplier_count} {rfq.supplier_count === 1 ? t('rfqsPage.supplier') : t('rfqsPage.suppliers')}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2] }}>
                        <Icons.Mail size={16} color={colors.text.tertiary} />
                        <span style={{ fontSize: typography.fontSize.sm, color: colors.text.secondary }}>
                          {rfq.offer_count} {rfq.offer_count === 1 ? t('rfqsPage.offer') : t('rfqsPage.offers')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Arrow */}
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Icons.ChevronRight size={24} color={colors.text.tertiary} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
