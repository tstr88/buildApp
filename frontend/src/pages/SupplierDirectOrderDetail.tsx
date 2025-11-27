/**
 * Supplier Direct Order Detail
 * View and manage a specific direct order
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import * as Icons from 'lucide-react';
import { colors, spacing, typography, borderRadius, shadows } from '../theme/tokens';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
import { WindowProposalModal } from '../components/supplier/WindowProposalModal';
import { MarkDeliveredModal } from '../components/supplier/MarkDeliveredModal';
import { useWebSocket } from '../context/WebSocketContext';

interface OrderItem {
  sku_id?: string;
  description: string;
  quantity: number;
  unit: string;
  unit_price: number;
  total: number;
}

interface OrderDetail {
  id: string;
  order_id: string;
  buyer_name: string;
  buyer_phone: string;
  buyer_type: 'homeowner' | 'contractor';
  items: OrderItem[];
  total_amount: number;
  delivery_type: 'pickup' | 'delivery';
  delivery_address?: string;
  delivery_location?: { lat: number; lng: number };
  status: 'pending' | 'confirmed' | 'in_transit' | 'delivered' | 'completed' | 'cancelled' | 'disputed';
  scheduling_type?: 'approximate' | 'negotiable';
  scheduled_window_start?: string;
  scheduled_window_end?: string;
  proposed_window_start?: string;
  proposed_window_end?: string;
  proposed_by?: 'supplier' | 'buyer';
  proposal_status?: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  prep_checklist?: {
    items_prepared: boolean;
    vehicle_assigned: boolean;
    contact_confirmed: boolean;
  };
  delivery_event?: {
    delivered_at: string;
    photos: string[];
    quantities_delivered: Record<string, number>;
    confirmation_deadline: string;
  };
}

export function SupplierDirectOrderDetail() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [showWindowProposalModal, setShowWindowProposalModal] = useState(false);
  const [showMarkDeliveredModal, setShowMarkDeliveredModal] = useState(false);
  const [showAcceptSuccess, setShowAcceptSuccess] = useState(false);
  const [prepChecklist, setPrepChecklist] = useState({
    items_prepared: false,
    vehicle_assigned: false,
    contact_confirmed: false,
  });
  const [internalNotes, setInternalNotes] = useState('');
  const { socket, subscribeToOrder, unsubscribeFromOrder } = useWebSocket();

  useEffect(() => {
    if (orderId) {
      fetchOrderDetail();
    }
  }, [orderId]);

  // Subscribe to real-time updates for this specific order
  useEffect(() => {
    if (!socket || !orderId) return;

    console.log('[SupplierDirectOrderDetail] Subscribing to order:', orderId);
    subscribeToOrder(orderId);

    const handleOrderUpdate = () => {
      console.log('[SupplierDirectOrderDetail] Order updated, refreshing...');
      fetchOrderDetail();
    };

    socket.on('order:updated', handleOrderUpdate);
    socket.on('order:window-proposed', handleOrderUpdate);
    socket.on('order:window-accepted', handleOrderUpdate);
    socket.on('order:status-changed', handleOrderUpdate);

    return () => {
      console.log('[SupplierDirectOrderDetail] Unsubscribing from order:', orderId);
      socket.off('order:updated', handleOrderUpdate);
      socket.off('order:window-proposed', handleOrderUpdate);
      socket.off('order:window-accepted', handleOrderUpdate);
      socket.off('order:status-changed', handleOrderUpdate);
      unsubscribeFromOrder(orderId);
    };
  }, [socket, orderId, subscribeToOrder, unsubscribeFromOrder]);

  const fetchOrderDetail = async () => {
    console.log('[SupplierOrderDetail] fetchOrderDetail called, setting loading=true');
    setLoading(true);
    try {
      const token = localStorage.getItem('buildapp_auth_token');
      const response = await fetch(`${API_URL}/api/suppliers/orders/${orderId}`, {
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('[SupplierOrderDetail] Received order data:', {
          order_id: data.order_id,
          status: data.status,
          proposed_by: data.proposed_by,
          proposal_status: data.proposal_status,
          proposed_window_start: data.proposed_window_start,
          proposed_window_end: data.proposed_window_end,
        });
        console.log('[SupplierOrderDetail] Calling setOrder with new data');
        setOrder(data);
        setPrepChecklist(data.prep_checklist || prepChecklist);
        console.log('[SupplierOrderDetail] State updated successfully');
      } else {
        console.error('Failed to fetch order detail');
      }
    } catch (error) {
      console.error('Failed to fetch order detail:', error);
    } finally {
      console.log('[SupplierOrderDetail] fetchOrderDetail complete, setting loading=false');
      setLoading(false);
    }
  };

  const handleChecklistUpdate = async (field: keyof typeof prepChecklist) => {
    const newChecklist = { ...prepChecklist, [field]: !prepChecklist[field] };
    setPrepChecklist(newChecklist);

    try {
      const token = localStorage.getItem('buildapp_auth_token');
      await fetch(`${API_URL}/api/suppliers/orders/${orderId}/checklist`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
        body: JSON.stringify({ checklist: newChecklist }),
      });
    } catch (error) {
      console.error('Failed to update checklist:', error);
    }
  };

  const handleProposeWindow = () => {
    setShowWindowProposalModal(true);
  };

  const handleMarkDelivered = () => {
    setShowMarkDeliveredModal(true);
  };

  const handleAcceptBuyerWindow = async () => {
    if (!order) return;

    try {
      const token = localStorage.getItem('buildapp_auth_token');
      const response = await fetch(
        `${API_URL}/api/suppliers/orders/${order.order_id}/accept-window`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        setShowAcceptSuccess(true);
        await fetchOrderDetail();
        // Auto-hide success message after 2 seconds
        setTimeout(() => {
          setShowAcceptSuccess(false);
        }, 2000);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to accept buyer window');
      }
    } catch (error) {
      console.error('Failed to accept buyer window:', error);
      alert('Failed to accept buyer window');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; color: string; bgColor: string }> = {
      pending: { label: t('supplierOrders.status.needsScheduling', 'Needs Scheduling'), color: colors.warning[700], bgColor: colors.warning[100] },
      confirmed: { label: t('supplierOrders.status.scheduled', 'Scheduled'), color: colors.success[700], bgColor: colors.success[100] },
      in_transit: { label: t('supplierOrders.status.inTransit', 'In Transit'), color: colors.primary[700], bgColor: colors.primary[100] },
      delivered: { label: t('supplierOrders.status.delivered', 'Delivered'), color: colors.info[700], bgColor: colors.info[100] },
      completed: { label: t('supplierOrders.status.completed', 'Completed'), color: colors.success[700], bgColor: colors.success[100] },
      cancelled: { label: t('supplierOrders.status.cancelled', 'Cancelled'), color: colors.neutral[700], bgColor: colors.neutral[100] },
      disputed: { label: t('supplierOrders.status.disputed', 'Disputed'), color: colors.error[700], bgColor: colors.error[100] },
    };

    const config = statusConfig[status] || statusConfig.pending;

    return (
      <span
        style={{
          fontSize: typography.fontSize.sm,
          fontWeight: typography.fontWeight.medium,
          padding: `${spacing[2]} ${spacing[3]}`,
          borderRadius: borderRadius.sm,
          backgroundColor: config.bgColor,
          color: config.color,
        }}
      >
        {config.label}
      </span>
    );
  };

  const isDeliveryDay = () => {
    if (!order?.scheduled_window_start) return false;
    const today = new Date();
    const deliveryDate = new Date(order.scheduled_window_start);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return deliveryDate.toDateString() === today.toDateString() ||
           deliveryDate.toDateString() === tomorrow.toDateString();
  };

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '400px',
        }}
      >
        <div style={{ color: colors.text.tertiary }}>{t('common.loading')}</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div
        style={{
          textAlign: 'center',
          padding: spacing[8],
        }}
      >
        <div
          style={{
            fontSize: typography.fontSize.lg,
            fontWeight: typography.fontWeight.medium,
            color: colors.text.primary,
            marginBottom: spacing[2],
          }}
        >
          {t('supplierOrders.orderNotFound', 'Order not found')}
        </div>
        <button
          onClick={() => navigate('/supplier/orders')}
          style={{
            padding: `${spacing[2]} ${spacing[4]}`,
            backgroundColor: colors.primary[600],
            color: colors.text.inverse,
            border: 'none',
            borderRadius: borderRadius.md,
            fontSize: typography.fontSize.sm,
            fontWeight: typography.fontWeight.medium,
            cursor: 'pointer',
          }}
        >
          {t('common.back', 'Back')}
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        maxWidth: '1000px',
        margin: '0 auto',
        padding: spacing[6],
      }}
    >
      {/* Success Toast */}
      {showAcceptSuccess && (
        <div
          style={{
            position: 'fixed',
            top: spacing[4],
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 9999,
            backgroundColor: colors.success[600],
            color: colors.neutral[0],
            padding: `${spacing[3]} ${spacing[6]}`,
            borderRadius: borderRadius.lg,
            boxShadow: shadows.xl,
            display: 'flex',
            alignItems: 'center',
            gap: spacing[2],
            animation: 'slideDown 0.3s ease-out',
          }}
        >
          <Icons.CheckCircle size={24} />
          <span style={{ fontSize: typography.fontSize.base, fontWeight: typography.fontWeight.medium }}>
            {t('supplierOrders.timeConfirmed', 'Time confirmed! Order scheduled successfully.')}
          </span>
        </div>
      )}
      {/* Back Button */}
      <button
        onClick={() => navigate('/supplier/orders')}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: spacing[2],
          padding: `${spacing[2]} ${spacing[3]}`,
          marginBottom: spacing[4],
          backgroundColor: 'transparent',
          border: `1px solid ${colors.border.light}`,
          borderRadius: borderRadius.md,
          fontSize: typography.fontSize.sm,
          color: colors.text.secondary,
          cursor: 'pointer',
          transition: 'all 0.2s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = colors.neutral[50];
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
        }}
      >
        <Icons.ArrowLeft size={16} />
        {t('common.back', 'Back')}
      </button>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: spacing[6] }}>
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
            {t('supplierOrders.orderId', 'Order')} #{order.order_id.slice(0, 8)}
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2], flexWrap: 'wrap' }}>
            <span
              style={{
                fontSize: typography.fontSize.xs,
                fontWeight: typography.fontWeight.medium,
                padding: `${spacing[1]} ${spacing[2]}`,
                borderRadius: borderRadius.sm,
                backgroundColor: order.buyer_type === 'homeowner' ? colors.info[100] : colors.primary[100],
                color: order.buyer_type === 'homeowner' ? colors.info[700] : colors.primary[700],
              }}
            >
              {order.buyer_type === 'homeowner' ? t('common.homeowner', 'Homeowner') : t('common.contractor', 'Contractor')}
            </span>
            <span
              style={{
                fontSize: typography.fontSize.xs,
                fontWeight: typography.fontWeight.medium,
                padding: `${spacing[1]} ${spacing[2]}`,
                borderRadius: borderRadius.sm,
                backgroundColor: colors.neutral[100],
                color: colors.text.secondary,
                display: 'flex',
                alignItems: 'center',
                gap: spacing[1],
              }}
            >
              {order.delivery_type === 'pickup' ? <Icons.Package size={12} /> : <Icons.Truck size={12} />}
              {order.delivery_type === 'pickup' ? t('common.pickup', 'Pickup') : t('common.delivery', 'Delivery')}
            </span>
          </div>
        </div>
        {getStatusBadge(order.status)}
      </div>

      {/* Buyer Contact */}
      <div
        style={{
          backgroundColor: colors.neutral[0],
          padding: spacing[4],
          borderRadius: borderRadius.lg,
          border: `1px solid ${colors.border.light}`,
          marginBottom: spacing[4],
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing[3], marginBottom: spacing[3] }}>
          <Icons.User size={20} color={colors.text.secondary} />
          <div style={{ fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.semibold, color: colors.text.primary }}>
            {t('supplierOrders.buyerContact', 'Buyer Contact')}
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: spacing[3] }}>
          <div>
            <div style={{ fontSize: typography.fontSize.xs, color: colors.text.tertiary, marginBottom: spacing[1] }}>
              {t('supplierOrders.name', 'Name')}
            </div>
            <div style={{ fontSize: typography.fontSize.sm, color: colors.text.primary }}>{order.buyer_name}</div>
          </div>
          <div>
            <div style={{ fontSize: typography.fontSize.xs, color: colors.text.tertiary, marginBottom: spacing[1] }}>
              {t('supplierOrders.phone', 'Phone')}
            </div>
            <a
              href={`tel:${order.buyer_phone}`}
              style={{
                fontSize: typography.fontSize.sm,
                color: colors.primary[600],
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: spacing[1],
              }}
            >
              <Icons.Phone size={14} />
              {order.buyer_phone}
            </a>
          </div>
          {order.delivery_type === 'delivery' && order.delivery_address && (
            <div>
              <div style={{ fontSize: typography.fontSize.xs, color: colors.text.tertiary, marginBottom: spacing[1] }}>
                {t('supplierOrders.deliveryAddress', 'Delivery Address')}
              </div>
              <div style={{ fontSize: typography.fontSize.sm, color: colors.text.primary }}>{order.delivery_address}</div>
            </div>
          )}
        </div>
      </div>

      {/* Items Table */}
      <div
        style={{
          backgroundColor: colors.neutral[0],
          padding: spacing[4],
          borderRadius: borderRadius.lg,
          border: `1px solid ${colors.border.light}`,
          marginBottom: spacing[4],
        }}
      >
        <div style={{ fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.semibold, color: colors.text.primary, marginBottom: spacing[3] }}>
          {t('supplierOrders.orderItems', 'Order Items')}
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${colors.border.light}` }}>
                <th style={{ padding: spacing[2], textAlign: 'left', fontSize: typography.fontSize.xs, color: colors.text.tertiary, fontWeight: typography.fontWeight.medium }}>
                  {t('supplierOrders.specification', 'Specification')}
                </th>
                <th style={{ padding: spacing[2], textAlign: 'right', fontSize: typography.fontSize.xs, color: colors.text.tertiary, fontWeight: typography.fontWeight.medium }}>
                  {t('supplierOrders.quantity', 'Quantity')}
                </th>
                <th style={{ padding: spacing[2], textAlign: 'right', fontSize: typography.fontSize.xs, color: colors.text.tertiary, fontWeight: typography.fontWeight.medium }}>
                  {t('supplierOrders.unitPrice', 'Unit Price')}
                </th>
                <th style={{ padding: spacing[2], textAlign: 'right', fontSize: typography.fontSize.xs, color: colors.text.tertiary, fontWeight: typography.fontWeight.medium }}>
                  {t('supplierOrders.subtotal', 'Subtotal')}
                </th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item, index) => (
                <tr key={item.sku_id || index} style={{ borderBottom: `1px solid ${colors.border.light}` }}>
                  <td style={{ padding: spacing[2], fontSize: typography.fontSize.sm, color: colors.text.primary }}>{item.description}</td>
                  <td style={{ padding: spacing[2], fontSize: typography.fontSize.sm, color: colors.text.primary, textAlign: 'right' }}>
                    {item.quantity} {item.unit}
                  </td>
                  <td style={{ padding: spacing[2], fontSize: typography.fontSize.sm, color: colors.text.primary, textAlign: 'right' }}>₾{(item.unit_price || 0).toFixed(2)}</td>
                  <td style={{ padding: spacing[2], fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.medium, color: colors.text.primary, textAlign: 'right' }}>
                    ₾{(item.total || 0).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={3} style={{ padding: spacing[2], fontSize: typography.fontSize.base, fontWeight: typography.fontWeight.semibold, color: colors.text.primary, textAlign: 'right' }}>
                  {t('supplierOrders.total', 'Total')}:
                </td>
                <td style={{ padding: spacing[2], fontSize: typography.fontSize.base, fontWeight: typography.fontWeight.bold, color: colors.text.primary, textAlign: 'right' }}>
                  ₾{order.total_amount.toFixed(2)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Scheduling Section */}
      {(order.status === 'pending' || order.status === 'confirmed') && (
        <div
          style={{
            backgroundColor: colors.neutral[0],
            padding: spacing[4],
            borderRadius: borderRadius.lg,
            border: `1px solid ${colors.border.light}`,
            marginBottom: spacing[4],
          }}
        >
          <div style={{ fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.semibold, color: colors.text.primary, marginBottom: spacing[3] }}>
            {t('supplierOrders.scheduling', 'Scheduling')}
          </div>

          {/* Show pending proposal UI if there's an active proposal */}
          {order.proposal_status === 'pending' && order.proposed_window_start && order.proposed_window_end ? (
            <div>
              {/* Show buyer's counter-proposal if exists */}
              {order.proposed_by === 'buyer' ? (
                <div>
                  <div
                    style={{
                      padding: spacing[3],
                      backgroundColor: colors.info[50],
                      borderRadius: borderRadius.md,
                      border: `2px solid ${colors.info[300]}`,
                      marginBottom: spacing[3],
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2], marginBottom: spacing[2] }}>
                      <Icons.Clock size={20} color={colors.info[600]} />
                      <span style={{ fontSize: typography.fontSize.base, fontWeight: typography.fontWeight.semibold, color: colors.info[900] }}>
                        Buyer Proposed Time
                      </span>
                    </div>
                    <div style={{ fontSize: typography.fontSize.base, color: colors.text.primary, marginBottom: spacing[3] }}>
                      {new Date(order.proposed_window_start).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                      {' at '}
                      {new Date(order.proposed_window_start).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                    </div>
                    <div style={{ display: 'flex', gap: spacing[2] }}>
                      <button
                        onClick={handleAcceptBuyerWindow}
                        style={{
                          padding: `${spacing[2]} ${spacing[4]}`,
                          backgroundColor: colors.success[600],
                          color: colors.text.inverse,
                          border: 'none',
                          borderRadius: borderRadius.md,
                          fontSize: typography.fontSize.sm,
                          fontWeight: typography.fontWeight.medium,
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = colors.success[700];
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = colors.success[600];
                        }}
                      >
                        {t('supplierOrders.acceptBuyerProposal', 'Accept Buyer\'s Proposal')}
                      </button>
                      <button
                        onClick={() => setShowWindowProposalModal(true)}
                        style={{
                          padding: `${spacing[2]} ${spacing[4]}`,
                          backgroundColor: 'transparent',
                          color: colors.text.secondary,
                          border: `1px solid ${colors.border.default}`,
                          borderRadius: borderRadius.md,
                          fontSize: typography.fontSize.sm,
                          fontWeight: typography.fontWeight.medium,
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = colors.neutral[50];
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                      >
                        {t('supplierOrders.counterProposeDifferentTime', 'Counter-Propose Different Time')}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    padding: spacing[3],
                    backgroundColor: colors.warning[50],
                    borderRadius: borderRadius.md,
                    border: `1px solid ${colors.warning[200]}`,
                    marginBottom: spacing[3],
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2], marginBottom: spacing[2] }}>
                    <Icons.Clock size={20} color={colors.warning[600]} />
                    <span style={{ fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.medium, color: colors.warning[700] }}>
                      {t('supplierOrders.waitingForBuyerResponse', 'Waiting for Buyer Response')}
                    </span>
                  </div>
                  <div style={{ fontSize: typography.fontSize.sm, color: colors.text.secondary }}>
                    {t('supplierOrders.proposed', 'Proposed')}: {new Date(order.proposed_window_start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    {' '}
                    {new Date(order.proposed_window_start).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    {' - '}
                    {new Date(order.proposed_window_end).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              )}
            </div>
          ) : order.status === 'confirmed' && order.scheduled_window_start && order.scheduled_window_end ? (
            <div>
              <div
                style={{
                  padding: spacing[3],
                  backgroundColor: colors.success[50],
                  borderRadius: borderRadius.md,
                  border: `1px solid ${colors.success[200]}`,
                  marginBottom: spacing[3],
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2], marginBottom: spacing[1] }}>
                  <Icons.CheckCircle size={16} color={colors.success[600]} />
                  <span style={{ fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.medium, color: colors.success[700] }}>
                    {order.delivery_type === 'pickup' ? t('supplierOrders.pickupScheduled', 'Pickup Scheduled') : t('supplierOrders.deliveryScheduled', 'Delivery Scheduled')}
                  </span>
                </div>
                <div style={{ fontSize: typography.fontSize.base, fontWeight: typography.fontWeight.semibold, color: colors.text.primary }}>
                  {new Date(order.scheduled_window_start).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  {' '}
                  {new Date(order.scheduled_window_start).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                  {' - '}
                  {new Date(order.scheduled_window_end).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
              <button
                onClick={handleProposeWindow}
                style={{
                  padding: `${spacing[2]} ${spacing[4]}`,
                  backgroundColor: 'transparent',
                  border: `1px solid ${colors.border.default}`,
                  borderRadius: borderRadius.md,
                  fontSize: typography.fontSize.sm,
                  fontWeight: typography.fontWeight.medium,
                  color: colors.text.primary,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = colors.neutral[50];
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                {t('supplierOrders.requestReschedule', 'Request Reschedule')}
              </button>
            </div>
          ) : order.status === 'pending' ? (
            <div>
              <div
                style={{
                  padding: spacing[3],
                  backgroundColor: colors.warning[50],
                  borderRadius: borderRadius.md,
                  border: `1px solid ${colors.warning[200]}`,
                  marginBottom: spacing[3],
                  display: 'flex',
                  alignItems: 'center',
                  gap: spacing[2],
                }}
              >
                <Icons.AlertCircle size={20} color={colors.warning[600]} />
                <span style={{ fontSize: typography.fontSize.sm, color: colors.warning[700] }}>
                  {order.delivery_type === 'pickup'
                    ? t('supplierOrders.confirmPickupTime', 'Please confirm pickup time')
                    : t('supplierOrders.confirmDeliveryTime', 'Please confirm delivery time')}
                </span>
              </div>
              <button
                onClick={handleProposeWindow}
                style={{
                  padding: `${spacing[2]} ${spacing[4]}`,
                  backgroundColor: colors.primary[600],
                  color: colors.text.inverse,
                  border: 'none',
                  borderRadius: borderRadius.md,
                  fontSize: typography.fontSize.sm,
                  fontWeight: typography.fontWeight.medium,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = colors.primary[700];
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = colors.primary[600];
                }}
              >
                {order.delivery_type === 'pickup'
                  ? t('supplierOrders.confirmPickup', 'Confirm Pickup Time')
                  : t('supplierOrders.confirmDelivery', 'Confirm Delivery Time')}
              </button>
            </div>
          ) : null}
        </div>
      )}

      {/* Delivery/Pickup Prep */}
      {order.status === 'scheduled' && (
        <div
          style={{
            backgroundColor: colors.neutral[0],
            padding: spacing[4],
            borderRadius: borderRadius.lg,
            border: `1px solid ${colors.border.light}`,
            marginBottom: spacing[4],
          }}
        >
          <div style={{ fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.semibold, color: colors.text.primary, marginBottom: spacing[3] }}>
            {order.delivery_type === 'pickup' ? t('supplierOrders.pickupPrep', 'Pickup Preparation') : t('supplierOrders.deliveryPrep', 'Delivery Preparation')}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[2], marginBottom: spacing[3] }}>
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: spacing[2],
                cursor: 'pointer',
              }}
            >
              <input
                type="checkbox"
                checked={prepChecklist.items_prepared}
                onChange={() => handleChecklistUpdate('items_prepared')}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
              <span style={{ fontSize: typography.fontSize.sm, color: colors.text.primary }}>
                {t('supplierOrders.itemsPrepared', 'Items prepared')}
              </span>
            </label>
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: spacing[2],
                cursor: 'pointer',
              }}
            >
              <input
                type="checkbox"
                checked={prepChecklist.vehicle_assigned}
                onChange={() => handleChecklistUpdate('vehicle_assigned')}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
              <span style={{ fontSize: typography.fontSize.sm, color: colors.text.primary }}>
                {order.delivery_type === 'pickup'
                  ? t('supplierOrders.slotAssigned', 'Pickup slot assigned')
                  : t('supplierOrders.vehicleAssigned', 'Delivery vehicle assigned')}
              </span>
            </label>
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: spacing[2],
                cursor: 'pointer',
              }}
            >
              <input
                type="checkbox"
                checked={prepChecklist.contact_confirmed}
                onChange={() => handleChecklistUpdate('contact_confirmed')}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
              <span style={{ fontSize: typography.fontSize.sm, color: colors.text.primary }}>
                {t('supplierOrders.contactConfirmed', 'Buyer contact confirmed')}
              </span>
            </label>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.medium, color: colors.text.primary, marginBottom: spacing[2] }}>
              {t('supplierOrders.internalNotes', 'Internal Notes')}
              <span style={{ fontSize: typography.fontSize.xs, color: colors.text.tertiary, fontWeight: typography.fontWeight.normal, marginLeft: spacing[1] }}>
                ({t('supplierOrders.notVisibleToBuyer', 'not visible to buyer')})
              </span>
            </label>
            <textarea
              value={internalNotes}
              onChange={(e) => setInternalNotes(e.target.value)}
              placeholder={t('supplierOrders.notesPlaceholder', 'Add internal notes...')}
              style={{
                width: '100%',
                minHeight: '80px',
                padding: spacing[3],
                fontSize: typography.fontSize.sm,
                border: `1px solid ${colors.border.default}`,
                borderRadius: borderRadius.md,
                fontFamily: 'inherit',
                resize: 'vertical',
              }}
            />
          </div>
        </div>
      )}

      {/* Mark Delivered Button */}
      {isDeliveryDay() && order.status === 'scheduled' && (
        <div
          style={{
            backgroundColor: colors.primary[50],
            padding: spacing[4],
            borderRadius: borderRadius.lg,
            border: `1px solid ${colors.primary[200]}`,
            marginBottom: spacing[4],
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2], marginBottom: spacing[3] }}>
            <Icons.CheckCircle size={20} color={colors.primary[600]} />
            <span style={{ fontSize: typography.fontSize.base, fontWeight: typography.fontWeight.semibold, color: colors.primary[700] }}>
              {order.delivery_type === 'pickup'
                ? t('supplierOrders.readyForPickup', 'Ready for pickup?')
                : t('supplierOrders.readyForDelivery', 'Ready to deliver?')}
            </span>
          </div>
          <button
            onClick={handleMarkDelivered}
            style={{
              padding: `${spacing[3]} ${spacing[5]}`,
              backgroundColor: colors.primary[600],
              color: colors.text.inverse,
              border: 'none',
              borderRadius: borderRadius.md,
              fontSize: typography.fontSize.base,
              fontWeight: typography.fontWeight.semibold,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = colors.primary[700];
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = colors.primary[600];
            }}
          >
            {order.delivery_type === 'pickup' ? t('supplierOrders.markHandedOver', 'Mark as Handed Over') : t('supplierOrders.markDelivered', 'Mark as Delivered')}
          </button>
        </div>
      )}

      {/* Post-Delivery Status */}
      {order.status === 'delivered' && order.delivery_event && (
        <div
          style={{
            backgroundColor: colors.neutral[0],
            padding: spacing[4],
            borderRadius: borderRadius.lg,
            border: `1px solid ${colors.border.light}`,
            marginBottom: spacing[4],
          }}
        >
          <div style={{ fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.semibold, color: colors.text.primary, marginBottom: spacing[3] }}>
            {t('supplierOrders.deliveryStatus', 'Delivery Status')}
          </div>
          <div
            style={{
              padding: spacing[3],
              backgroundColor: colors.info[50],
              borderRadius: borderRadius.md,
              border: `1px solid ${colors.info[200]}`,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2], marginBottom: spacing[2] }}>
              <Icons.Clock size={16} color={colors.info[600]} />
              <span style={{ fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.medium, color: colors.info[700] }}>
                {t('supplierOrders.deliveredOn', 'Delivered on')} {new Date(order.delivery_event.delivered_at).toLocaleString()}
              </span>
            </div>
            <div style={{ fontSize: typography.fontSize.sm, color: colors.text.secondary }}>
              {t('supplierOrders.waitingForConfirmation', 'Waiting for buyer confirmation')}
            </div>
            <div style={{ fontSize: typography.fontSize.xs, color: colors.text.tertiary, marginTop: spacing[1] }}>
              {t('supplierOrders.confirmationDeadline', 'Confirmation deadline')}: {new Date(order.delivery_event.confirmation_deadline).toLocaleString()}
            </div>
          </div>
        </div>
      )}

      {order.status === 'completed' && (
        <div
          style={{
            padding: spacing[3],
            backgroundColor: colors.success[50],
            borderRadius: borderRadius.md,
            border: `1px solid ${colors.success[200]}`,
            display: 'flex',
            alignItems: 'center',
            gap: spacing[2],
          }}
        >
          <Icons.CheckCircle size={20} color={colors.success[600]} />
          <span style={{ fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.medium, color: colors.success[700] }}>
            {t('supplierOrders.orderCompleted', 'Order completed successfully')}
          </span>
        </div>
      )}

      {/* Modals */}
      {showWindowProposalModal && (
        <WindowProposalModal
          orderId={orderId!}
          deliveryType={order.delivery_type}
          currentWindow={
            order.scheduled_window_start && order.scheduled_window_end
              ? { start: order.scheduled_window_start, end: order.scheduled_window_end }
              : undefined
          }
          onClose={() => setShowWindowProposalModal(false)}
          onSuccess={async () => {
            console.log('[SupplierOrderDetail] Window proposal success, refreshing order data');
            await fetchOrderDetail();
            console.log('[SupplierOrderDetail] Order data refreshed after proposal');
          }}
        />
      )}
      {showMarkDeliveredModal && (
        <MarkDeliveredModal
          orderId={orderId!}
          deliveryType={order.delivery_type}
          items={order.items}
          onClose={() => setShowMarkDeliveredModal(false)}
          onSuccess={() => {
            fetchOrderDetail();
          }}
        />
      )}
    </div>
  );
}
