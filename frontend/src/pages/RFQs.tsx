/**
 * RFQs List Page
 * Shows user's RFQs with tabs for different statuses
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FileText, MapPin, Package, Users, Mail, Plus } from 'lucide-react';
import { colors, spacing, typography, borderRadius, shadows } from '../theme/tokens';
import { useWebSocket } from '../context/WebSocketContext';
import { TabNavigation, PageHeader, EmptyState, StatusBadge, ListCard } from '../components/shared';

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

  const handleTabChange = (tab: string) => {
    setActiveTab(tab as TabType);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const locale = i18n.language === 'ka' ? 'ka-GE' : 'en-US';
    return date.toLocaleDateString(locale, { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Count for tabs
  const offersCount = rfqs.filter((rfq) => rfq.offer_count > 0).length;
  const unreadCount = rfqs.reduce((sum, rfq) => sum + rfq.unread_offer_count, 0);

  const tabs = [
    { id: 'active', label: t('rfqsPage.tabs.active', 'Active'), count: rfqs.length },
    { id: 'offers', label: t('rfqsPage.tabs.offers', 'With Offers'), count: offersCount, hasAlert: unreadCount > 0 },
    { id: 'accepted', label: t('rfqsPage.tabs.accepted', 'Accepted') },
    { id: 'expired', label: t('rfqsPage.tabs.expired', 'Expired') },
  ];

  const CreateRFQButton = () => (
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
      <Plus size={20} />
      {t('rfqsPage.newRfq', 'New RFQ')}
    </button>
  );

  return (
    <div
      style={{
        maxWidth: '1000px',
        margin: '0 auto',
        padding: spacing[6],
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: spacing[6],
        }}
      >
        <PageHeader
          title={t('rfqsPage.title', 'My RFQs')}
          subtitle={t('rfqsPage.subtitle', 'Manage your quote requests')}
        />
        <CreateRFQButton />
      </div>

      <TabNavigation
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />

      {/* RFQ List */}
      {loading ? (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '300px',
          }}
        >
          <div style={{ color: colors.text.tertiary }}>{t('common.loading')}</div>
        </div>
      ) : rfqs.length === 0 ? (
        <EmptyState
          icon={FileText}
          title={t('rfqsPage.empty.title', 'No RFQs found')}
          description={
            activeTab === 'active'
              ? t('rfqsPage.empty.noRfqs', 'Create your first RFQ to get started')
              : activeTab === 'offers'
                ? t('rfqsPage.empty.noOffers', 'RFQs with offers will appear here')
                : activeTab === 'accepted'
                  ? t('rfqsPage.empty.noAccepted', 'Accepted RFQs will appear here')
                  : t('rfqsPage.empty.noExpired', 'Expired RFQs will appear here')
          }
          action={activeTab === 'active' ? <CreateRFQButton /> : undefined}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[3] }}>
          {rfqs.map((rfq) => (
            <ListCard
              key={rfq.id}
              onClick={() => navigate(`/rfqs/${rfq.id}`)}
              isUnread={rfq.unread_offer_count > 0}
            >
              {/* Header Row */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: spacing[3],
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2], flexWrap: 'wrap' }}>
                  <span
                    style={{
                      fontSize: typography.fontSize.base,
                      fontWeight: typography.fontWeight.semibold,
                      color: colors.text.primary,
                    }}
                  >
                    {rfq.title || `RFQ - ${formatDate(rfq.created_at)}`}
                  </span>

                  {/* Status Badge */}
                  <StatusBadge
                    status={rfq.status}
                    label={t(`rfqsPage.status.${rfq.status}`, rfq.status)}
                    size="sm"
                  />

                  {/* Unread Offers Badge */}
                  {rfq.unread_offer_count > 0 && (
                    <span
                      style={{
                        fontSize: typography.fontSize.xs,
                        fontWeight: typography.fontWeight.bold,
                        padding: `${spacing[0.5]} ${spacing[2]}`,
                        borderRadius: borderRadius.full,
                        backgroundColor: colors.error[600],
                        color: colors.neutral[0],
                      }}
                    >
                      {rfq.unread_offer_count} {t('rfqsPage.new', 'new')}
                    </span>
                  )}
                </div>

                <span style={{ fontSize: typography.fontSize.xs, color: colors.text.tertiary, whiteSpace: 'nowrap' }}>
                  {formatDate(rfq.created_at)}
                </span>
              </div>

              {/* Project Name */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: spacing[2],
                  fontSize: typography.fontSize.sm,
                  color: colors.text.secondary,
                  marginBottom: spacing[3],
                }}
              >
                <MapPin size={14} color={colors.text.tertiary} />
                {rfq.project_name}
              </div>

              {/* Info Grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                  gap: spacing[4],
                }}
              >
                {/* Items */}
                <div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: spacing[1],
                      fontSize: typography.fontSize.xs,
                      color: colors.text.tertiary,
                      marginBottom: spacing[1],
                    }}
                  >
                    <Package size={12} />
                    {t('rfqsPage.items', 'Items')}
                  </div>
                  <div style={{ fontSize: typography.fontSize.sm, color: colors.text.primary }}>
                    {rfq.lines.length} {rfq.lines.length === 1 ? t('rfqsPage.item', 'item') : t('rfqsPage.items', 'items')}
                  </div>
                </div>

                {/* Suppliers */}
                <div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: spacing[1],
                      fontSize: typography.fontSize.xs,
                      color: colors.text.tertiary,
                      marginBottom: spacing[1],
                    }}
                  >
                    <Users size={12} />
                    {t('rfqsPage.suppliers', 'Suppliers')}
                  </div>
                  <div style={{ fontSize: typography.fontSize.sm, color: colors.text.primary }}>
                    {rfq.supplier_count} {rfq.supplier_count === 1 ? t('rfqsPage.supplier', 'supplier') : t('rfqsPage.suppliers', 'suppliers')}
                  </div>
                </div>

                {/* Offers */}
                <div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: spacing[1],
                      fontSize: typography.fontSize.xs,
                      color: colors.text.tertiary,
                      marginBottom: spacing[1],
                    }}
                  >
                    <Mail size={12} />
                    {t('rfqsPage.offers', 'Offers')}
                  </div>
                  <div
                    style={{
                      fontSize: typography.fontSize.sm,
                      fontWeight: rfq.offer_count > 0 ? typography.fontWeight.medium : typography.fontWeight.normal,
                      color: rfq.offer_count > 0 ? colors.success[600] : colors.text.primary,
                    }}
                  >
                    {rfq.offer_count} {rfq.offer_count === 1 ? t('rfqsPage.offer', 'offer') : t('rfqsPage.offers', 'offers')}
                  </div>
                </div>
              </div>
            </ListCard>
          ))}
        </div>
      )}
    </div>
  );
};
