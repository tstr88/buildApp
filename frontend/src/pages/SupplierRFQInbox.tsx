/**
 * Supplier RFQ Inbox
 * View and manage RFQs from buyers with tabs for different statuses
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import * as Icons from 'lucide-react';
import { colors, spacing, typography, borderRadius, shadows } from '../theme/tokens';
import { useWebSocket } from '../context/WebSocketContext';

type TabType = 'new' | 'sent' | 'accepted' | 'expired';

interface RFQCard {
  id: string;
  rfq_id: string;
  buyer_type: 'homeowner' | 'contractor';
  buyer_name: string;
  is_new_buyer: boolean;
  project_location: string;
  distance_km: number;
  item_count: number;
  preferred_window_start: string | null;
  preferred_window_end: string | null;
  received_at: string;
  relative_time: string;
  viewed_at?: string | null;
  offer_status?: 'pending' | 'accepted' | 'rejected' | 'expired' | null;
  offer_total?: number | null;
}

export function SupplierRFQInbox() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<TabType>((searchParams.get('tab') as TabType) || 'new');
  const [rfqs, setRfqs] = useState<RFQCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState({
    new: 0,
    sent: 0,
    accepted: 0,
    expired: 0,
  });
  const { socket, subscribeToOrders, unsubscribeFromOrders } = useWebSocket();

  useEffect(() => {
    const tab = searchParams.get('tab') as TabType;
    if (tab && ['new', 'sent', 'accepted', 'expired'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchRFQs();
  }, [activeTab]);

  // Subscribe to real-time RFQ updates
  useEffect(() => {
    if (!socket) return;

    // Subscribe to orders list updates (RFQs are part of orders system)
    subscribeToOrders();

    // Listen for RFQ list update event
    const handleRFQsListUpdate = () => {
      console.log('[SupplierRFQInbox] RFQs list updated, refreshing...');
      fetchRFQs();
    };

    socket.on('rfqs:list-updated', handleRFQsListUpdate);
    socket.on('orders:list-updated', handleRFQsListUpdate);

    // Cleanup on unmount
    return () => {
      socket.off('rfqs:list-updated', handleRFQsListUpdate);
      socket.off('orders:list-updated', handleRFQsListUpdate);
      unsubscribeFromOrders();
    };
  }, [socket, subscribeToOrders, unsubscribeFromOrders]);

  const fetchRFQs = async () => {
    console.log('[SupplierRFQInbox] fetchRFQs called, activeTab:', activeTab);
    setLoading(true);
    try {
      const token = localStorage.getItem('buildapp_auth_token');
      console.log('[SupplierRFQInbox] Token exists:', !!token);

      const url = `http://localhost:3001/api/suppliers/rfqs?status=${activeTab}`;
      console.log('[SupplierRFQInbox] Fetching from:', url);

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('[SupplierRFQInbox] Response status:', response.status, response.statusText);

      if (response.ok) {
        const data = await response.json();
        console.log('[SupplierRFQInbox] Raw response data:', data);
        console.log('[SupplierRFQInbox] RFQ array:', data.data);
        console.log('[SupplierRFQInbox] RFQ count:', data.data?.length);
        console.log('[SupplierRFQInbox] Counts:', data.counts);
        console.log('[SupplierRFQInbox] Setting rfqs state with:', data.data || []);
        setRfqs(data.data || []);
        setCounts(data.counts || counts);
        console.log('[SupplierRFQInbox] State updated');
      } else {
        const errorText = await response.text();
        console.error('[SupplierRFQInbox] Response not OK:', response.status, response.statusText);
        console.error('[SupplierRFQInbox] Error body:', errorText);
      }
    } catch (error) {
      console.error('[SupplierRFQInbox] Failed to fetch RFQs:', error);
    } finally {
      setLoading(false);
      console.log('[SupplierRFQInbox] Loading set to false');
    }
  };

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  const getBuyerBadgeColor = (buyerType: 'homeowner' | 'contractor') => {
    return buyerType === 'homeowner' ? colors.info[100] : colors.primary[100];
  };

  const getBuyerBadgeTextColor = (buyerType: 'homeowner' | 'contractor') => {
    return buyerType === 'homeowner' ? colors.info[700] : colors.primary[700];
  };

  const formatDeliveryWindow = (start: string | null, end: string | null) => {
    if (!start || !end) {
      return t('common.notSpecified', 'Not specified');
    }
    const startDate = new Date(start);
    const endDate = new Date(end);
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
    const locale = i18n.language === 'ka' ? 'ka-GE' : 'en-US';

    if (startDate.toDateString() === endDate.toDateString()) {
      return startDate.toLocaleDateString(locale, options);
    }
    return `${startDate.toLocaleDateString(locale, options)} - ${endDate.toLocaleDateString(locale, options)}`;
  };

  return (
    <div
      style={{
        maxWidth: '1000px',
        margin: '0 auto',
        padding: spacing[6],
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: spacing[6] }}>
        <h1
          style={{
            fontSize: typography.fontSize['2xl'],
            fontWeight: typography.fontWeight.bold,
            color: colors.text.primary,
            margin: 0,
            marginBottom: spacing[2],
          }}
        >
          {t('supplierRFQInbox.title', 'RFQ Inbox')}
        </h1>
        <p
          style={{
            fontSize: typography.fontSize.base,
            color: colors.text.secondary,
            margin: 0,
          }}
        >
          {t('supplierRFQInbox.subtitle', 'Manage quote requests from buyers')}
        </p>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: 'flex',
          gap: spacing[2],
          marginBottom: spacing[5],
          borderBottom: `1px solid ${colors.border.light}`,
          overflowX: 'auto',
        }}
      >
        <button
          onClick={() => handleTabChange('new')}
          style={{
            padding: `${spacing[3]} ${spacing[4]}`,
            backgroundColor: 'transparent',
            border: 'none',
            borderBottom: `2px solid ${activeTab === 'new' ? colors.primary[600] : 'transparent'}`,
            color: activeTab === 'new' ? colors.primary[600] : colors.text.secondary,
            fontSize: typography.fontSize.base,
            fontWeight: activeTab === 'new' ? typography.fontWeight.semibold : typography.fontWeight.medium,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: spacing[2],
            transition: 'color 0.2s',
          }}
        >
          {t('supplierRFQInbox.tabs.new', 'New')}
          {counts.new > 0 && (
            <span
              style={{
                backgroundColor: colors.error[500],
                color: colors.neutral[0],
                fontSize: typography.fontSize.xs,
                fontWeight: typography.fontWeight.bold,
                padding: `${spacing[1]} ${spacing[2]}`,
                borderRadius: borderRadius.full,
                minWidth: '20px',
                textAlign: 'center',
              }}
            >
              {counts.new}
            </span>
          )}
        </button>

        <button
          onClick={() => handleTabChange('sent')}
          style={{
            padding: `${spacing[3]} ${spacing[4]}`,
            backgroundColor: 'transparent',
            border: 'none',
            borderBottom: `2px solid ${activeTab === 'sent' ? colors.primary[600] : 'transparent'}`,
            color: activeTab === 'sent' ? colors.primary[600] : colors.text.secondary,
            fontSize: typography.fontSize.base,
            fontWeight: activeTab === 'sent' ? typography.fontWeight.semibold : typography.fontWeight.medium,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: spacing[2],
          }}
        >
          {t('supplierRFQInbox.tabs.sent', 'Sent Offers')}
          {counts.sent > 0 && (
            <span
              style={{
                backgroundColor: colors.neutral[400],
                color: colors.neutral[0],
                fontSize: typography.fontSize.xs,
                fontWeight: typography.fontWeight.bold,
                padding: `${spacing[1]} ${spacing[2]}`,
                borderRadius: borderRadius.full,
                minWidth: '20px',
                textAlign: 'center',
              }}
            >
              {counts.sent}
            </span>
          )}
        </button>

        <button
          onClick={() => handleTabChange('accepted')}
          style={{
            padding: `${spacing[3]} ${spacing[4]}`,
            backgroundColor: 'transparent',
            border: 'none',
            borderBottom: `2px solid ${activeTab === 'accepted' ? colors.primary[600] : 'transparent'}`,
            color: activeTab === 'accepted' ? colors.primary[600] : colors.text.secondary,
            fontSize: typography.fontSize.base,
            fontWeight: activeTab === 'accepted' ? typography.fontWeight.semibold : typography.fontWeight.medium,
            cursor: 'pointer',
          }}
        >
          {t('supplierRFQInbox.tabs.accepted', 'Accepted')}
        </button>

        <button
          onClick={() => handleTabChange('expired')}
          style={{
            padding: `${spacing[3]} ${spacing[4]}`,
            backgroundColor: 'transparent',
            border: 'none',
            borderBottom: `2px solid ${activeTab === 'expired' ? colors.primary[600] : 'transparent'}`,
            color: activeTab === 'expired' ? colors.primary[600] : colors.text.secondary,
            fontSize: typography.fontSize.base,
            fontWeight: activeTab === 'expired' ? typography.fontWeight.semibold : typography.fontWeight.medium,
            cursor: 'pointer',
          }}
        >
          {t('supplierRFQInbox.tabs.expired', 'Expired')}
        </button>
      </div>

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
        <div
          style={{
            textAlign: 'center',
            padding: spacing[8],
            backgroundColor: colors.neutral[0],
            borderRadius: borderRadius.lg,
            border: `1px solid ${colors.border.light}`,
          }}
        >
          <Icons.Inbox size={48} color={colors.neutral[400]} style={{ marginBottom: spacing[3] }} />
          <div
            style={{
              fontSize: typography.fontSize.lg,
              fontWeight: typography.fontWeight.medium,
              color: colors.text.primary,
              marginBottom: spacing[2],
            }}
          >
            {t('supplierRFQInbox.noRFQs', 'No RFQs found')}
          </div>
          <div style={{ fontSize: typography.fontSize.sm, color: colors.text.tertiary }}>
            {activeTab === 'new' && t('supplierRFQInbox.noNewRFQs', 'New quote requests will appear here')}
            {activeTab === 'sent' && t('supplierRFQInbox.noSentOffers', 'Offers you send will appear here')}
            {activeTab === 'accepted' && t('supplierRFQInbox.noAcceptedOffers', 'Accepted offers will appear here')}
            {activeTab === 'expired' && t('supplierRFQInbox.noExpiredRFQs', 'Expired RFQs will appear here')}
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[3] }}>
          {rfqs.map((rfq) => (
            <div
              key={rfq.id}
              onClick={() => navigate(`/supplier/rfqs/${rfq.rfq_id}`)}
              style={{
                backgroundColor: colors.neutral[0],
                padding: spacing[4],
                borderRadius: borderRadius.lg,
                border: `1px solid ${!rfq.viewed_at && activeTab === 'new' ? colors.primary[300] : colors.border.light}`,
                boxShadow: shadows.sm,
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s',
                position: 'relative',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = shadows.md;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = shadows.sm;
              }}
            >
              {/* Unread indicator */}
              {!rfq.viewed_at && activeTab === 'new' && (
                <div
                  style={{
                    position: 'absolute',
                    top: spacing[4],
                    right: spacing[4],
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: colors.primary[600],
                  }}
                />
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: spacing[3] }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2], flexWrap: 'wrap' }}>
                  <span
                    style={{
                      fontSize: typography.fontSize.sm,
                      fontWeight: typography.fontWeight.semibold,
                      color: colors.text.primary,
                    }}
                  >
                    RFQ #{rfq.rfq_id.slice(0, 8)}
                  </span>

                  {/* Buyer Type Badge */}
                  <span
                    style={{
                      fontSize: typography.fontSize.xs,
                      fontWeight: typography.fontWeight.medium,
                      padding: `${spacing[1]} ${spacing[2]}`,
                      borderRadius: borderRadius.sm,
                      backgroundColor: getBuyerBadgeColor(rfq.buyer_type),
                      color: getBuyerBadgeTextColor(rfq.buyer_type),
                    }}
                  >
                    {rfq.buyer_type === 'homeowner' ? t('common.homeowner', 'Homeowner') : t('common.contractor', 'Contractor')}
                  </span>

                  {/* New Buyer Indicator */}
                  {rfq.is_new_buyer && (
                    <span
                      style={{
                        fontSize: typography.fontSize.xs,
                        fontWeight: typography.fontWeight.medium,
                        padding: `${spacing[1]} ${spacing[2]}`,
                        borderRadius: borderRadius.sm,
                        backgroundColor: colors.success[100],
                        color: colors.success[700],
                      }}
                    >
                      {t('supplierRFQInbox.newBuyer', 'New buyer')}
                    </span>
                  )}
                </div>

                <span style={{ fontSize: typography.fontSize.xs, color: colors.text.tertiary, whiteSpace: 'nowrap' }}>
                  {rfq.relative_time}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: spacing[3] }}>
                {/* Location & Distance */}
                <div>
                  <div style={{ fontSize: typography.fontSize.xs, color: colors.text.tertiary, marginBottom: spacing[1] }}>
                    {t('supplierRFQInbox.location', 'Location')}
                  </div>
                  <div style={{ fontSize: typography.fontSize.sm, color: colors.text.primary, display: 'flex', alignItems: 'center', gap: spacing[1] }}>
                    <Icons.MapPin size={14} />
                    {rfq.project_location}
                  </div>
                  <div style={{ fontSize: typography.fontSize.xs, color: colors.text.tertiary }}>
                    {rfq.distance_km.toFixed(1)} km {t('common.fromYourDepot', 'from your depot')}
                  </div>
                </div>

                {/* Item Count */}
                <div>
                  <div style={{ fontSize: typography.fontSize.xs, color: colors.text.tertiary, marginBottom: spacing[1] }}>
                    {t('supplierRFQInbox.items', 'Items')}
                  </div>
                  <div style={{ fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.medium, color: colors.text.primary }}>
                    {rfq.item_count} {t('common.items', 'items')}
                  </div>
                </div>

                {/* Delivery Window */}
                <div>
                  <div style={{ fontSize: typography.fontSize.xs, color: colors.text.tertiary, marginBottom: spacing[1] }}>
                    {t('supplierRFQInbox.deliveryWindow', 'Delivery Window')}
                  </div>
                  <div style={{ fontSize: typography.fontSize.sm, color: colors.text.primary, display: 'flex', alignItems: 'center', gap: spacing[1] }}>
                    <Icons.Calendar size={14} />
                    {formatDeliveryWindow(rfq.preferred_window_start, rfq.preferred_window_end)}
                  </div>
                </div>

                {/* Offer Status (for sent/accepted tabs) */}
                {activeTab !== 'new' && rfq.offer_total && (
                  <div>
                    <div style={{ fontSize: typography.fontSize.xs, color: colors.text.tertiary, marginBottom: spacing[1] }}>
                      {t('supplierRFQInbox.offerAmount', 'Offer Amount')}
                    </div>
                    <div style={{ fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.semibold, color: colors.text.primary }}>
                      ₾{Number(rfq.offer_total).toFixed(2)}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
