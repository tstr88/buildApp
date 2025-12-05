/**
 * Order Detail Page
 * View complete details of a single order with tracking
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import * as Icons from 'lucide-react';
import { colors, spacing, typography, borderRadius, shadows } from '../theme/tokens';
import { OrderTimeline } from '../components/orders/OrderTimeline';
import { DeliveryProofCard } from '../components/orders/DeliveryProofCard';
import { ConfirmationBar } from '../components/orders/ConfirmationBar';
import { DisputeForm } from '../components/orders/DisputeForm';
import { BuyerWindowProposalModal } from '../components/buyer/BuyerWindowProposalModal';
import { useWebSocket } from '../context/WebSocketContext';
import { useToast } from '../hooks/useToast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

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
  order_number: string;
  buyer_id: string;
  supplier_id: string;
  supplier_name: string;
  supplier_address: string;
  supplier_phone: string;
  supplier_email: string;
  project_id?: string;
  project_name?: string;
  project_address?: string;
  order_type: 'material' | 'rental';
  items: OrderItem[];
  total_amount: number;
  delivery_fee: number;
  tax_amount: number;
  grand_total: number;
  pickup_or_delivery: 'pickup' | 'delivery';
  delivery_address?: string;
  promised_window_start?: string;
  promised_window_end?: string;
  proposed_window_start?: string;
  proposed_window_end?: string;
  proposed_by?: 'supplier' | 'buyer';
  proposal_status?: 'pending' | 'accepted' | 'rejected';
  payment_terms: string;
  negotiable: boolean;
  status: string;
  notes?: string;
  buyer_notes?: string;
  supplier_notes?: string;
  created_at: string;
  updated_at: string;
  delivered_at?: string;
  confirmed_at?: string;
  delivery_proof_photo?: string;
  delivery_note?: string;
  driver_name?: string;
  ordering_phone?: string;
}

export const OrderDetail: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const [order, setOrder] = useState<OrderDetail | null>(null);

  // Get the source page to navigate back to (from location state or default to /orders)
  const fromPath = (location.state as { from?: string } | null)?.from || '/orders';
  const [loading, setLoading] = useState(true);
  const [showDisputeForm, setShowDisputeForm] = useState(false);
  const [showCounterProposeModal, setShowCounterProposeModal] = useState(false);
  const [showCounterProposeSuccess, setShowCounterProposeSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { socket, subscribeToOrder, unsubscribeFromOrder } = useWebSocket();
  const toast = useToast();

  useEffect(() => {
    if (id) {
      fetchOrder(id);
    }
  }, [id]);

  // Subscribe to real-time updates for this specific order
  useEffect(() => {
    if (!socket || !id) return;

    console.log('[OrderDetail] Subscribing to order:', id);
    subscribeToOrder(id);

    const handleOrderUpdate = () => {
      console.log('[OrderDetail] Order updated, refreshing...');
      if (id) {
        fetchOrder(id);
      }
    };

    socket.on('order:updated', handleOrderUpdate);
    socket.on('order:window-proposed', handleOrderUpdate);
    socket.on('order:window-accepted', handleOrderUpdate);
    socket.on('order:status-changed', handleOrderUpdate);

    return () => {
      console.log('[OrderDetail] Unsubscribing from order:', id);
      socket.off('order:updated', handleOrderUpdate);
      socket.off('order:window-proposed', handleOrderUpdate);
      socket.off('order:window-accepted', handleOrderUpdate);
      socket.off('order:status-changed', handleOrderUpdate);
      unsubscribeFromOrder(id);
    };
  }, [socket, id, subscribeToOrder, unsubscribeFromOrder]);

  const fetchOrder = async (orderId: string) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('buildapp_auth_token');
      console.log('[fetchOrder] Fetching order:', orderId);
      const response = await fetch(`${API_URL}/api/buyers/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log('[fetchOrder] Response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('[fetchOrder] Order data received:', data.data?.order_number);
        setOrder(data.data);
      } else {
        const errorData = await response.json();
        console.error('[fetchOrder] Error:', errorData);
        toast.error('Order not found');
        navigate(fromPath);
      }
    } catch (error) {
      console.error('Failed to fetch order:', error);
      toast.error('Failed to load order');
      navigate(fromPath);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptWindow = async () => {
    if (!order) return;

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('buildapp_auth_token');
      const response = await fetch(
        `${API_URL}/api/buyers/orders/${order.order_number}/accept-window`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        toast.success('Window accepted successfully');
        fetchOrder(order.order_number);
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to accept window');
      }
    } catch (error) {
      console.error('Failed to accept window:', error);
      toast.error('Failed to accept window');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRejectWindow = async () => {
    if (!order) return;

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('buildapp_auth_token');
      const response = await fetch(
        `${API_URL}/api/buyers/orders/${order.order_number}/reject-window`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        toast.success('Window rejected successfully');
        fetchOrder(order.order_number);
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to reject window');
      }
    } catch (error) {
      console.error('Failed to reject window:', error);
      toast.error('Failed to reject window');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCounterPropose = () => {
    setShowCounterProposeModal(true);
  };

  const handleCounterProposeSuccess = async () => {
    if (order) {
      // Refresh the order without redirecting on error
      try {
        console.log('[OrderDetail] Counter-propose success, refreshing order data');
        const token = localStorage.getItem('buildapp_auth_token');
        const response = await fetch(`${API_URL}/api/buyers/orders/${order.order_number}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          console.log('[OrderDetail] Received refreshed order data:', {
            order_number: data.data.order_number,
            proposed_by: data.data.proposed_by,
            proposal_status: data.data.proposal_status,
            proposed_window_start: data.data.proposed_window_start,
            proposed_window_end: data.data.proposed_window_end,
          });
          console.log('[OrderDetail] BEFORE setOrder - Current order.proposed_by:', order.proposed_by);
          console.log('[OrderDetail] BEFORE setOrder - New data.data.proposed_by:', data.data.proposed_by);

          // Force complete state reset by clearing first, then setting
          setOrder(null);
          setTimeout(() => {
            console.log('[OrderDetail] Setting order with new data');
            setOrder(data.data);
            console.log('[OrderDetail] AFTER setOrder - order should now have proposed_by:', data.data.proposed_by);

            // Show success toast
            setShowCounterProposeSuccess(true);
            setTimeout(() => {
              setShowCounterProposeSuccess(false);
            }, 2000);
          }, 0);
        } else {
          console.error('[OrderDetail] Failed to refresh order after counter-propose - HTTP error:', response.status);
          // Don't redirect, just stay on the page
        }
      } catch (error) {
        console.error('[OrderDetail] Error refreshing order:', error);
        // Don't redirect, just stay on the page
      }
    }
  };

  const handleConfirmDelivery = async () => {
    if (!order) return;

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('buildapp_auth_token');
      const response = await fetch(
        `${API_URL}/api/buyers/orders/${order.order_number}/confirm`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        toast.success('Delivery confirmed successfully');
        fetchOrder(order.order_number);
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to confirm delivery');
      }
    } catch (error) {
      console.error('Failed to confirm delivery:', error);
      toast.error('Failed to confirm delivery');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Confirm pickup for buyer (for pickup orders: in_transit -> delivered)
  const handleConfirmPickup = async () => {
    if (!order) return;

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('buildapp_auth_token');
      const response = await fetch(
        `${API_URL}/api/buyers/orders/${order.order_number}/confirm-pickup`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        toast.success('Pickup confirmed successfully');
        fetchOrder(order.order_number);
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to confirm pickup');
      }
    } catch (error) {
      console.error('Failed to confirm pickup:', error);
      toast.error('Failed to confirm pickup');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitDispute = async (issue: string, description: string, photos: File[]) => {
    if (!order) return;

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('buildapp_auth_token');

      const formData = new FormData();
      formData.append('issue_type', issue);
      formData.append('description', description);
      photos.forEach((photo) => {
        formData.append('photos', photo);
      });

      const response = await fetch(
        `${API_URL}/api/buyers/orders/${order.order_number}/dispute`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (response.ok) {
        toast.success('Dispute reported successfully', 'The supplier will be notified.');
        setShowDisputeForm(false);
        fetchOrder(order.order_number);
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to submit dispute');
      }
    } catch (error) {
      console.error('Failed to submit dispute:', error);
      toast.error('Failed to submit dispute');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return { bg: colors.success[50], text: colors.success[700], border: colors.success[200] };
      case 'confirmed':
      case 'scheduled':
        return { bg: colors.primary[50], text: colors.primary[700], border: colors.primary[200] };
      case 'in_transit':
      case 'delivered':
        return { bg: colors.info[50], text: colors.info[700], border: colors.info[200] };
      case 'pending':
      case 'pending_schedule':
        return { bg: colors.warning[50], text: colors.warning[700], border: colors.warning[200] };
      case 'cancelled':
      case 'disputed':
        return { bg: colors.error[50], text: colors.error[700], border: colors.error[200] };
      default:
        return { bg: colors.neutral[50], text: colors.text.secondary, border: colors.border.light };
    }
  };

  const getStatusLabel = (status: string) => {
    // For pickup orders, use different labels for in_transit and delivered
    if (order?.pickup_or_delivery === 'pickup') {
      const pickupLabels: Record<string, string> = {
        pending: 'Pending',
        pending_schedule: 'Schedule TBD',
        scheduled: 'Scheduled',
        confirmed: 'Confirmed',
        in_transit: 'Ready for Pickup',
        delivered: 'Picked Up',
        completed: 'Completed',
        cancelled: 'Cancelled',
        disputed: 'Disputed',
      };
      return pickupLabels[status] || status;
    }
    const labels: Record<string, string> = {
      pending: 'Pending',
      pending_schedule: 'Schedule TBD',
      scheduled: 'Scheduled',
      confirmed: 'Confirmed',
      in_transit: 'In Transit',
      delivered: 'Delivered',
      completed: 'Completed',
      cancelled: 'Cancelled',
      disputed: 'Disputed',
    };
    return labels[status] || status;
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  // Format scheduled time - shows "Friday, November 28 at 4:00 PM"
  const formatScheduledTime = (dateString: string) => {
    const date = new Date(dateString);
    const dateStr = date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
    const timeStr = date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
    return `${dateStr} at ${timeStr}`;
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          backgroundColor: colors.neutral[50],
          padding: spacing[6],
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <Icons.Loader size={48} color={colors.text.tertiary} style={{ margin: '0 auto', marginBottom: spacing[3] }} />
          <p style={{ fontSize: typography.fontSize.lg, color: colors.text.tertiary, margin: 0 }}>
            Loading order...
          </p>
        </div>
      </div>
    );
  }

  if (!order) {
    return null;
  }

  const statusColors = getStatusColor(order.status);

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: colors.neutral[50],
        padding: spacing[6],
      }}
    >
      {/* Success Toast Notification */}
      {showCounterProposeSuccess && (
        <div
          style={{
            position: 'fixed',
            top: spacing[4],
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 9999,
            backgroundColor: colors.success[600],
            color: colors.neutral[0],
            padding: `${spacing[3]} ${spacing[5]}`,
            borderRadius: borderRadius.lg,
            boxShadow: shadows.xl,
            display: 'flex',
            alignItems: 'center',
            gap: spacing[3],
            fontSize: typography.fontSize.base,
            fontWeight: typography.fontWeight.medium,
            animation: 'slideDown 0.3s ease-out',
          }}
        >
          <Icons.CheckCircle size={24} />
          <span>Counter-proposal sent successfully! Waiting for supplier response...</span>
        </div>
      )}

      {/* Header */}
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          marginBottom: spacing[6],
        }}
      >
        <button
          onClick={() => navigate(fromPath)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: spacing[2],
            padding: `${spacing[2]} ${spacing[3]}`,
            backgroundColor: 'transparent',
            border: 'none',
            color: colors.text.secondary,
            fontSize: typography.fontSize.sm,
            cursor: 'pointer',
            marginBottom: spacing[4],
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = colors.primary[600];
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = colors.text.secondary;
          }}
        >
          <Icons.ArrowLeft size={16} />
          {fromPath.includes('/projects/') ? 'Back to Project' : 'Back to Orders'}
        </button>

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
              {order.order_number}
            </h1>
            <p
              style={{
                fontSize: typography.fontSize.base,
                color: colors.text.secondary,
                margin: 0,
              }}
            >
              Placed on {formatDateTime(order.created_at)}
            </p>
          </div>

          <div
            style={{
              padding: `${spacing[2]} ${spacing[4]}`,
              backgroundColor: statusColors.bg,
              border: `1px solid ${statusColors.border}`,
              borderRadius: borderRadius.lg,
            }}
          >
            <span
              style={{
                fontSize: typography.fontSize.base,
                fontWeight: typography.fontWeight.semibold,
                color: statusColors.text,
              }}
            >
              {getStatusLabel(order.status)}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div
        className="order-detail-grid"
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: spacing[6],
        }}
      >
        <style>{`
          @media (min-width: 768px) {
            .order-detail-grid {
              grid-template-columns: 1fr 380px !important;
            }
          }
        `}</style>

        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[4] }}>
          {/* Items */}
          <div
            style={{
              backgroundColor: colors.neutral[0],
              borderRadius: borderRadius.lg,
              border: `1px solid ${colors.border.light}`,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                padding: spacing[4],
                borderBottom: `1px solid ${colors.border.light}`,
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
                Order Items
              </h2>
            </div>

            <div style={{ padding: spacing[4] }}>
              {order.items.map((item, index) => (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    padding: spacing[3],
                    backgroundColor: colors.neutral[50],
                    borderRadius: borderRadius.md,
                    marginBottom: index < order.items.length - 1 ? spacing[2] : 0,
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <h4
                      style={{
                        fontSize: typography.fontSize.base,
                        fontWeight: typography.fontWeight.medium,
                        color: colors.text.primary,
                        margin: 0,
                        marginBottom: spacing[1],
                      }}
                    >
                      {item.description}
                    </h4>
                    <p
                      style={{
                        fontSize: typography.fontSize.sm,
                        color: colors.text.tertiary,
                        margin: 0,
                      }}
                    >
                      {item.quantity} {item.unit} × ₾{Number(item.unit_price || 0).toFixed(2)}
                    </p>
                  </div>
                  <p
                    style={{
                      fontSize: typography.fontSize.lg,
                      fontWeight: typography.fontWeight.semibold,
                      color: colors.text.primary,
                      margin: 0,
                    }}
                  >
                    ₾{Number(item.total || 0).toFixed(2)}
                  </p>
                </div>
              ))}

              {/* Price Breakdown */}
              <div
                style={{
                  marginTop: spacing[4],
                  paddingTop: spacing[4],
                  borderTop: `1px solid ${colors.border.light}`,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: spacing[2],
                  }}
                >
                  <span style={{ fontSize: typography.fontSize.base, color: colors.text.secondary }}>
                    Subtotal
                  </span>
                  <span
                    style={{
                      fontSize: typography.fontSize.base,
                      fontWeight: typography.fontWeight.medium,
                      color: colors.text.primary,
                    }}
                  >
                    ₾{Number(order.total_amount || 0).toFixed(2)}
                  </span>
                </div>

                {order.delivery_fee > 0 && (
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: spacing[2],
                    }}
                  >
                    <span style={{ fontSize: typography.fontSize.base, color: colors.text.secondary }}>
                      Delivery Fee
                    </span>
                    <span
                      style={{
                        fontSize: typography.fontSize.base,
                        fontWeight: typography.fontWeight.medium,
                        color: colors.text.primary,
                      }}
                    >
                      ₾{Number(order.delivery_fee || 0).toFixed(2)}
                    </span>
                  </div>
                )}

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    paddingTop: spacing[3],
                    borderTop: `1px solid ${colors.border.light}`,
                  }}
                >
                  <span
                    style={{
                      fontSize: typography.fontSize.lg,
                      fontWeight: typography.fontWeight.semibold,
                      color: colors.text.primary,
                    }}
                  >
                    Total
                  </span>
                  <span
                    style={{
                      fontSize: typography.fontSize['2xl'],
                      fontWeight: typography.fontWeight.bold,
                      color: colors.primary[600],
                    }}
                  >
                    ₾{Number(order.grand_total || order.total_amount || 0).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Delivery/Pickup Info */}
          <div
            style={{
              backgroundColor: colors.neutral[0],
              borderRadius: borderRadius.lg,
              border: `1px solid ${colors.border.light}`,
              padding: spacing[4],
            }}
          >
            <h3
              style={{
                fontSize: typography.fontSize.lg,
                fontWeight: typography.fontWeight.semibold,
                color: colors.text.primary,
                margin: 0,
                marginBottom: spacing[3],
              }}
            >
              {order.pickup_or_delivery === 'pickup' ? 'Pickup' : 'Delivery'} Information
            </h3>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: spacing[3], marginBottom: spacing[3] }}>
              {order.pickup_or_delivery === 'pickup' ? (
                <Icons.MapPin size={20} color={colors.primary[600]} style={{ flexShrink: 0, marginTop: '2px' }} />
              ) : (
                <Icons.Truck size={20} color={colors.primary[600]} style={{ flexShrink: 0, marginTop: '2px' }} />
              )}
              <div>
                <p
                  style={{
                    fontSize: typography.fontSize.sm,
                    fontWeight: typography.fontWeight.medium,
                    color: colors.text.tertiary,
                    margin: 0,
                    marginBottom: spacing[1],
                  }}
                >
                  {order.pickup_or_delivery === 'pickup' ? 'Pickup Location' : 'Delivery Address'}
                </p>
                <p
                  style={{
                    fontSize: typography.fontSize.base,
                    color: colors.text.primary,
                    margin: 0,
                  }}
                >
                  {order.pickup_or_delivery === 'pickup' ? order.supplier_address : order.delivery_address}
                </p>
              </div>
            </div>

            {order.promised_window_start && order.promised_window_end && (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: spacing[3] }}>
                <Icons.Calendar size={20} color={colors.primary[600]} style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <p
                    style={{
                      fontSize: typography.fontSize.sm,
                      fontWeight: typography.fontWeight.medium,
                      color: colors.text.tertiary,
                      margin: 0,
                      marginBottom: spacing[1],
                    }}
                  >
                    Scheduled Window
                  </p>
                  <p
                    style={{
                      fontSize: typography.fontSize.base,
                      color: colors.text.primary,
                      margin: 0,
                    }}
                  >
                    {formatScheduledTime(order.promised_window_start)}
                  </p>
                </div>
              </div>
            )}

            {/* Supplier Proposal - Pending Buyer Response */}
            {order.proposed_by === 'supplier' && order.proposal_status === 'pending' && order.proposed_window_start && order.proposed_window_end && (
              <div
                style={{
                  marginTop: spacing[4],
                  padding: spacing[4],
                  backgroundColor: colors.warning[50],
                  border: `2px solid ${colors.warning[300]}`,
                  borderRadius: borderRadius.lg,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2], marginBottom: spacing[3] }}>
                  <Icons.Clock size={20} color={colors.warning[700]} />
                  <h3
                    style={{
                      fontSize: typography.fontSize.lg,
                      fontWeight: typography.fontWeight.semibold,
                      color: colors.warning[900],
                      margin: 0,
                    }}
                  >
                    Supplier Proposed {order.pickup_or_delivery === 'pickup' ? 'Pickup' : 'Delivery'} Time
                  </h3>
                </div>
                <p
                  style={{
                    fontSize: typography.fontSize.base,
                    color: colors.text.primary,
                    margin: 0,
                    marginBottom: spacing[3],
                  }}
                >
                  {formatDateTime(order.proposed_window_start)} - {formatDateTime(order.proposed_window_end)}
                </p>
                <div style={{ display: 'flex', gap: spacing[2], flexWrap: 'wrap' }}>
                  <button
                    onClick={handleAcceptWindow}
                    disabled={isSubmitting}
                    style={{
                      padding: `${spacing[2]} ${spacing[4]}`,
                      backgroundColor: colors.success[600],
                      color: colors.neutral[0],
                      border: 'none',
                      borderRadius: borderRadius.md,
                      fontSize: typography.fontSize.sm,
                      fontWeight: typography.fontWeight.medium,
                      cursor: isSubmitting ? 'not-allowed' : 'pointer',
                      opacity: isSubmitting ? 0.6 : 1,
                    }}
                  >
                    Accept
                  </button>
                  <button
                    onClick={handleRejectWindow}
                    disabled={isSubmitting}
                    style={{
                      padding: `${spacing[2]} ${spacing[4]}`,
                      backgroundColor: colors.error[600],
                      color: colors.neutral[0],
                      border: 'none',
                      borderRadius: borderRadius.md,
                      fontSize: typography.fontSize.sm,
                      fontWeight: typography.fontWeight.medium,
                      cursor: isSubmitting ? 'not-allowed' : 'pointer',
                      opacity: isSubmitting ? 0.6 : 1,
                    }}
                  >
                    Reject
                  </button>
                  <button
                    onClick={handleCounterPropose}
                    disabled={isSubmitting}
                    style={{
                      padding: `${spacing[2]} ${spacing[4]}`,
                      backgroundColor: colors.neutral[0],
                      color: colors.primary[600],
                      border: `1px solid ${colors.primary[600]}`,
                      borderRadius: borderRadius.md,
                      fontSize: typography.fontSize.sm,
                      fontWeight: typography.fontWeight.medium,
                      cursor: isSubmitting ? 'not-allowed' : 'pointer',
                      opacity: isSubmitting ? 0.6 : 1,
                    }}
                  >
                    Propose Different Time
                  </button>
                </div>
              </div>
            )}

            {/* Buyer's Counter-Proposal - Waiting for Supplier */}
            {order.proposed_by === 'buyer' && order.proposal_status === 'pending' && order.proposed_window_start && order.proposed_window_end && (
              <div
                style={{
                  marginTop: spacing[4],
                  padding: spacing[4],
                  backgroundColor: colors.info[50],
                  border: `2px solid ${colors.info[300]}`,
                  borderRadius: borderRadius.lg,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2], marginBottom: spacing[3] }}>
                  <Icons.Clock size={20} color={colors.info[700]} />
                  <h3
                    style={{
                      fontSize: typography.fontSize.lg,
                      fontWeight: typography.fontWeight.semibold,
                      color: colors.info[900],
                      margin: 0,
                    }}
                  >
                    Your Proposed Time - Waiting for Supplier Response
                  </h3>
                </div>
                <p
                  style={{
                    fontSize: typography.fontSize.base,
                    color: colors.text.primary,
                    margin: 0,
                  }}
                >
                  {formatDateTime(order.proposed_window_start)} - {formatDateTime(order.proposed_window_end)}
                </p>
              </div>
            )}

            {order.negotiable && (
              <div
                style={{
                  marginTop: spacing[3],
                  padding: spacing[3],
                  backgroundColor: colors.warning[50],
                  border: `1px solid ${colors.warning[200]}`,
                  borderRadius: borderRadius.md,
                }}
              >
                <p
                  style={{
                    fontSize: typography.fontSize.sm,
                    color: colors.warning[900],
                    margin: 0,
                  }}
                >
                  Schedule to be confirmed by supplier
                </p>
              </div>
            )}
          </div>

          {/* Notes */}
          {(order.notes || order.buyer_notes || order.supplier_notes) && (
            <div
              style={{
                backgroundColor: colors.neutral[0],
                borderRadius: borderRadius.lg,
                border: `1px solid ${colors.border.light}`,
                padding: spacing[4],
              }}
            >
              <h3
                style={{
                  fontSize: typography.fontSize.lg,
                  fontWeight: typography.fontWeight.semibold,
                  color: colors.text.primary,
                  margin: 0,
                  marginBottom: spacing[3],
                }}
              >
                Notes
              </h3>

              {order.notes && (
                <div style={{ marginBottom: spacing[3] }}>
                  <p
                    style={{
                      fontSize: typography.fontSize.sm,
                      fontWeight: typography.fontWeight.medium,
                      color: colors.text.tertiary,
                      margin: 0,
                      marginBottom: spacing[1],
                    }}
                  >
                    Order Notes
                  </p>
                  <p
                    style={{
                      fontSize: typography.fontSize.base,
                      color: colors.text.primary,
                      margin: 0,
                    }}
                  >
                    {order.notes}
                  </p>
                </div>
              )}

              {order.supplier_notes && (
                <div>
                  <p
                    style={{
                      fontSize: typography.fontSize.sm,
                      fontWeight: typography.fontWeight.medium,
                      color: colors.text.tertiary,
                      margin: 0,
                      marginBottom: spacing[1],
                    }}
                  >
                    Supplier Notes
                  </p>
                  <p
                    style={{
                      fontSize: typography.fontSize.base,
                      color: colors.text.primary,
                      margin: 0,
                    }}
                  >
                    {order.supplier_notes}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[4] }}>
          {/* Order Timeline */}
          <div
            style={{
              backgroundColor: colors.neutral[0],
              borderRadius: borderRadius.lg,
              border: `1px solid ${colors.border.light}`,
              padding: spacing[4],
            }}
          >
            <OrderTimeline
              orderStatus={order.status}
              createdAt={order.created_at}
              scheduledStart={order.promised_window_start}
              scheduledEnd={order.promised_window_end}
              deliveredAt={order.delivered_at}
              confirmedAt={order.confirmed_at}
              deliveryProofPhoto={order.delivery_proof_photo}
              pickupOrDelivery={order.pickup_or_delivery}
            />
          </div>

          {/* Ready for Pickup Banner (for pickup orders when status is in_transit) */}
          {order.pickup_or_delivery === 'pickup' && order.status === 'in_transit' && (
            <div
              style={{
                backgroundColor: colors.success[50],
                borderRadius: borderRadius.lg,
                border: `2px solid ${colors.success[300]}`,
                padding: spacing[4],
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2], marginBottom: spacing[2] }}>
                <Icons.Package size={24} color={colors.success[600]} />
                <h3
                  style={{
                    fontSize: typography.fontSize.lg,
                    fontWeight: typography.fontWeight.semibold,
                    color: colors.success[700],
                    margin: 0,
                  }}
                >
                  Order Ready for Pickup!
                </h3>
              </div>
              <p
                style={{
                  fontSize: typography.fontSize.sm,
                  color: colors.text.secondary,
                  margin: 0,
                  marginBottom: spacing[3],
                }}
              >
                Your order is ready at the supplier location. Please pick it up at your scheduled time.
              </p>
              <div
                style={{
                  padding: spacing[3],
                  backgroundColor: colors.neutral[0],
                  borderRadius: borderRadius.md,
                  border: `1px solid ${colors.border.light}`,
                  marginBottom: spacing[3],
                }}
              >
                <p style={{ fontSize: typography.fontSize.sm, color: colors.text.tertiary, margin: 0, marginBottom: spacing[1] }}>
                  Pickup Location
                </p>
                <p style={{ fontSize: typography.fontSize.base, fontWeight: typography.fontWeight.medium, color: colors.text.primary, margin: 0 }}>
                  {order.supplier_name}
                </p>
                {order.supplier_address && (
                  <p style={{ fontSize: typography.fontSize.sm, color: colors.text.secondary, margin: 0, marginTop: spacing[1] }}>
                    {order.supplier_address}
                  </p>
                )}
              </div>
              <button
                onClick={handleConfirmPickup}
                disabled={isSubmitting}
                style={{
                  padding: `${spacing[3]} ${spacing[5]}`,
                  backgroundColor: colors.success[600],
                  color: colors.text.inverse,
                  border: 'none',
                  borderRadius: borderRadius.md,
                  fontSize: typography.fontSize.base,
                  fontWeight: typography.fontWeight.semibold,
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  opacity: isSubmitting ? 0.7 : 1,
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: spacing[2],
                }}
                onMouseEnter={(e) => {
                  if (!isSubmitting) e.currentTarget.style.backgroundColor = colors.success[700];
                }}
                onMouseLeave={(e) => {
                  if (!isSubmitting) e.currentTarget.style.backgroundColor = colors.success[600];
                }}
              >
                <Icons.CheckCircle size={18} />
                {isSubmitting ? 'Confirming...' : 'I Picked Up My Order'}
              </button>
            </div>
          )}

          {/* Delivery Proof (if delivered) */}
          {order.delivered_at && order.delivery_proof_photo && !showDisputeForm && (
            <DeliveryProofCard
              deliveredAt={order.delivered_at}
              photoUrl={order.delivery_proof_photo}
              deliveryNote={order.delivery_note}
              driverName={order.driver_name}
            />
          )}

          {/* Dispute Form (if showing) */}
          {showDisputeForm && (
            <DisputeForm
              orderId={order.order_number}
              onSubmit={handleSubmitDispute}
              onCancel={() => setShowDisputeForm(false)}
              isSubmitting={isSubmitting}
            />
          )}

          {/* Supplier Contact */}
          <div
            style={{
              backgroundColor: colors.neutral[0],
              borderRadius: borderRadius.lg,
              border: `1px solid ${colors.border.light}`,
              padding: spacing[4],
            }}
          >
            <h3
              style={{
                fontSize: typography.fontSize.lg,
                fontWeight: typography.fontWeight.semibold,
                color: colors.text.primary,
                margin: 0,
                marginBottom: spacing[3],
              }}
            >
              Supplier Contact
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[3] }}>
              <div>
                <p
                  style={{
                    fontSize: typography.fontSize.sm,
                    fontWeight: typography.fontWeight.medium,
                    color: colors.text.tertiary,
                    margin: 0,
                    marginBottom: spacing[1],
                  }}
                >
                  Business Name
                </p>
                <p
                  style={{
                    fontSize: typography.fontSize.base,
                    fontWeight: typography.fontWeight.semibold,
                    color: colors.text.primary,
                    margin: 0,
                  }}
                >
                  {order.supplier_name}
                </p>
              </div>

              {order.supplier_phone && (
                <div>
                  <p
                    style={{
                      fontSize: typography.fontSize.sm,
                      fontWeight: typography.fontWeight.medium,
                      color: colors.text.tertiary,
                      margin: 0,
                      marginBottom: spacing[1],
                    }}
                  >
                    Phone
                  </p>
                  <a
                    href={`tel:${order.supplier_phone}`}
                    style={{
                      fontSize: typography.fontSize.base,
                      color: colors.primary[600],
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: spacing[1],
                    }}
                  >
                    <Icons.Phone size={16} />
                    {order.supplier_phone}
                  </a>
                </div>
              )}

              {order.supplier_email && (
                <div>
                  <p
                    style={{
                      fontSize: typography.fontSize.sm,
                      fontWeight: typography.fontWeight.medium,
                      color: colors.text.tertiary,
                      margin: 0,
                      marginBottom: spacing[1],
                    }}
                  >
                    Email
                  </p>
                  <a
                    href={`mailto:${order.supplier_email}`}
                    style={{
                      fontSize: typography.fontSize.base,
                      color: colors.primary[600],
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: spacing[1],
                    }}
                  >
                    <Icons.Mail size={16} />
                    {order.supplier_email}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Payment Info */}
          <div
            style={{
              backgroundColor: colors.neutral[0],
              borderRadius: borderRadius.lg,
              border: `1px solid ${colors.border.light}`,
              padding: spacing[4],
            }}
          >
            <h3
              style={{
                fontSize: typography.fontSize.lg,
                fontWeight: typography.fontWeight.semibold,
                color: colors.text.primary,
                margin: 0,
                marginBottom: spacing[3],
              }}
            >
              Payment
            </h3>

            <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2] }}>
              <Icons.CreditCard size={20} color={colors.primary[600]} />
              <p
                style={{
                  fontSize: typography.fontSize.base,
                  color: colors.text.primary,
                  margin: 0,
                }}
              >
                {order.payment_terms === 'cod' ? 'Cash on Delivery' : 'Payment on delivery'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Bar (sticky at bottom when delivered but not confirmed) */}
      {order.delivered_at && !order.confirmed_at && !showDisputeForm && (
        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            marginTop: spacing[6],
          }}
        >
          <ConfirmationBar
            deliveredAt={order.delivered_at}
            onConfirm={handleConfirmDelivery}
            onDispute={() => setShowDisputeForm(true)}
            isSubmitting={isSubmitting}
            canConfirm={true} // TODO: Check if current user phone matches ordering_phone
          />
        </div>
      )}

      {/* Counter-Propose Window Modal */}
      {showCounterProposeModal && order && (
        <BuyerWindowProposalModal
          orderId={order.order_number}
          deliveryType={order.pickup_or_delivery}
          currentProposal={
            order.proposed_window_start && order.proposed_window_end
              ? { start: order.proposed_window_start, end: order.proposed_window_end }
              : undefined
          }
          onClose={() => setShowCounterProposeModal(false)}
          onSuccess={handleCounterProposeSuccess}
        />
      )}
    </div>
  );
};
