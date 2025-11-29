/**
 * Rental Booking Detail Page
 * View complete details of a rental booking with timeline
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import * as Icons from 'lucide-react';
import { colors, spacing, typography, borderRadius } from '../theme/tokens';
import { ConditionCheckForm } from '../components/rentals/ConditionCheckForm';
import { StatusBadge } from '../components/shared';
import { API_BASE_URL } from '../services/api/client';
import { useToast } from '../hooks/useToast';

interface RentalBooking {
  id: string;
  booking_number: string;
  supplier_id: string;
  supplier_name: string;
  supplier_address?: string;
  supplier_phone?: string;
  supplier_email?: string;
  project_id?: string;
  project_name?: string;
  tool: {
    id: string;
    name: string;
    spec: string;
    category: string;
    images: string[];
  };
  start_date: string;
  end_date: string;
  actual_start_date?: string;
  actual_end_date?: string;
  rental_duration_days: number;
  day_rate: number;
  total_rental_amount: number;
  deposit_amount: number;
  delivery_fee: number;
  late_return_fee: number;
  damage_fee: number;
  pickup_or_delivery: string;
  delivery_address?: string;
  payment_terms: string;
  status: string;
  notes?: string;
  buyer_notes?: string;
  supplier_notes?: string;
  confirmed_at?: string;
  cancelled_at?: string;
  cancellation_reason?: string;
  created_at: string;
  updated_at: string;
  handover?: {
    id: string;
    handover_scheduled_at?: string;
    handover_confirmed_at?: string;
    handover_photos?: string[];
    condition_notes?: string;
    created_at: string;
  };
  return?: {
    id: string;
    return_scheduled_at?: string;
    return_confirmed_at?: string;
    return_photos?: string[];
    condition_notes?: string;
    late_fee?: number;
    damage_fee?: number;
    created_at: string;
  };
}

const RentalBookingDetail: React.FC = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const toast = useToast();
  const [booking, setBooking] = useState<RentalBooking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showHandoverForm, setShowHandoverForm] = useState(false);
  const [showReturnForm, setShowReturnForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchBookingDetails();
  }, [bookingId]);

  const fetchBookingDetails = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('buildapp_auth_token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/buyers/rentals/${bookingId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch booking details');
      }

      const result = await response.json();
      setBooking(result.data.booking);
    } catch (err: any) {
      setError(err.message || 'Failed to load booking details');
    } finally {
      setLoading(false);
    }
  };

  const getStatusType = (status: string): string => {
    const statusMap: Record<string, string> = {
      pending: 'pending',
      confirmed: 'confirmed',
      active: 'active',
      completed: 'completed',
      overdue: 'disputed',
      cancelled: 'cancelled',
      disputed: 'disputed',
    };
    return statusMap[status] || 'pending';
  };

  const getStatusLabel = (status: string): string => {
    const labels: Record<string, string> = {
      pending: t('rentalDetail.status.pending', 'Pending'),
      confirmed: t('rentalDetail.status.confirmed', 'Confirmed'),
      active: t('rentalDetail.status.active', 'Active'),
      completed: t('rentalDetail.status.completed', 'Completed'),
      overdue: t('rentalDetail.status.overdue', 'Overdue'),
      cancelled: t('rentalDetail.status.cancelled', 'Cancelled'),
      disputed: t('rentalDetail.status.disputed', 'Disputed'),
    };
    return labels[status] || status;
  };

  const getTimelineSteps = () => {
    if (!booking) return [];

    const steps = [
      {
        label: t('rentalDetail.timeline.booked', 'Booked'),
        completed: true,
        date: booking.created_at,
        icon: Icons.CheckCircle,
      },
      {
        label: t('rentalDetail.timeline.confirmed', 'Confirmed'),
        completed: !!booking.confirmed_at,
        date: booking.confirmed_at,
        icon: Icons.CheckCircle,
      },
      {
        label: t('rentalDetail.timeline.handoverScheduled', 'Handover Scheduled'),
        completed: !!booking.handover?.handover_scheduled_at,
        date: booking.handover?.handover_scheduled_at,
        icon: Icons.Calendar,
      },
      {
        label: t('rentalDetail.timeline.handedOver', 'Handed Over'),
        completed: !!booking.handover?.handover_confirmed_at,
        date: booking.handover?.handover_confirmed_at,
        icon: Icons.Package,
      },
      {
        label: t('rentalDetail.timeline.returnScheduled', 'Return Scheduled'),
        completed: !!booking.return?.return_scheduled_at,
        date: booking.return?.return_scheduled_at,
        icon: Icons.Calendar,
      },
      {
        label: t('rentalDetail.timeline.returned', 'Returned'),
        completed: !!booking.return?.return_confirmed_at,
        date: booking.return?.return_confirmed_at,
        icon: Icons.PackageCheck,
      },
      {
        label: t('rentalDetail.timeline.completed', 'Completed'),
        completed: booking.status === 'completed',
        date: booking.status === 'completed' ? booking.updated_at : undefined,
        icon: Icons.CheckCircle2,
      },
    ];

    return steps;
  };

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return 'N/A';
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

  const formatDateOnly = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const convertFilesToDataURLs = async (files: File[]): Promise<string[]> => {
    const promises = files.map((file) => {
      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    });
    return Promise.all(promises);
  };

  const handleHandoverSubmit = async (data: { photos: File[]; notes: string }) => {
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('buildapp_auth_token');
      if (!token) {
        navigate('/login');
        return;
      }

      const photoUrls = await convertFilesToDataURLs(data.photos);

      const response = await fetch(
        `${API_BASE_URL}/buyers/rentals/${bookingId}/confirm-handover`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            photo_urls: photoUrls,
            condition_notes: data.notes,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to confirm handover');
      }

      toast.success(t('rentalDetail.handoverSuccess', 'Handover confirmed successfully!'));
      setShowHandoverForm(false);
      fetchBookingDetails();
    } catch (error: any) {
      console.error('Error confirming handover:', error);
      toast.error(error.message || t('rentalDetail.handoverError', 'Failed to confirm handover'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReturnSubmit = async (data: { photos: File[]; notes: string }) => {
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('buildapp_auth_token');
      if (!token) {
        navigate('/login');
        return;
      }

      const photoUrls = await convertFilesToDataURLs(data.photos);

      const response = await fetch(
        `${API_BASE_URL}/buyers/rentals/${bookingId}/confirm-return`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            photo_urls: photoUrls,
            condition_notes: data.notes,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to confirm return');
      }

      toast.success(t('rentalDetail.returnSuccess', 'Return confirmed successfully!'));
      setShowReturnForm(false);
      fetchBookingDetails();
    } catch (error: any) {
      console.error('Error confirming return:', error);
      toast.error(error.message || t('rentalDetail.returnError', 'Failed to confirm return'));
    } finally {
      setIsSubmitting(false);
    }
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
          <Icons.Loader2
            size={48}
            color={colors.primary[600]}
            style={{ margin: '0 auto', marginBottom: spacing[3], animation: 'spin 1s linear infinite' }}
          />
          <style>{`
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `}</style>
          <p style={{ fontSize: typography.fontSize.lg, color: colors.text.tertiary, margin: 0 }}>
            {t('rentalDetail.loading', 'Loading booking details...')}
          </p>
        </div>
      </div>
    );
  }

  if (error || !booking) {
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
          <Icons.AlertCircle size={48} color={colors.error[600]} style={{ margin: '0 auto', marginBottom: spacing[3] }} />
          <h2
            style={{
              fontSize: typography.fontSize['2xl'],
              fontWeight: typography.fontWeight.bold,
              color: colors.text.primary,
              margin: 0,
              marginBottom: spacing[2],
            }}
          >
            {t('rentalDetail.error', 'Error')}
          </h2>
          <p style={{ fontSize: typography.fontSize.base, color: colors.text.secondary, margin: 0, marginBottom: spacing[4] }}>
            {error || t('rentalDetail.notFound', 'Booking not found')}
          </p>
          <button
            onClick={() => navigate('/rentals/my')}
            style={{
              padding: `${spacing[3]} ${spacing[6]}`,
              backgroundColor: colors.primary[600],
              color: colors.neutral[0],
              border: 'none',
              borderRadius: borderRadius.md,
              fontSize: typography.fontSize.base,
              fontWeight: typography.fontWeight.medium,
              cursor: 'pointer',
            }}
          >
            {t('rentalDetail.backToRentals', 'Back to My Rentals')}
          </button>
        </div>
      </div>
    );
  }

  const timelineSteps = getTimelineSteps();
  const totalAmount =
    booking.total_rental_amount +
    (booking.delivery_fee || 0) +
    (booking.late_return_fee || 0) +
    (booking.damage_fee || 0);

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
        <button
          onClick={() => navigate('/rentals/my')}
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
          {t('rentalDetail.backToRentals', 'Back to My Rentals')}
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
              {booking.booking_number}
            </h1>
            <p
              style={{
                fontSize: typography.fontSize.base,
                color: colors.text.secondary,
                margin: 0,
              }}
            >
              {t('rentalDetail.placedOn', 'Booked on')} {formatDateTime(booking.created_at)}
            </p>
          </div>

          <StatusBadge status={getStatusType(booking.status)} label={getStatusLabel(booking.status)} />
        </div>
      </div>

      {/* Main Content - Two Column Grid */}
      <div
        className="rental-detail-grid"
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
            .rental-detail-grid {
              grid-template-columns: 1fr 380px !important;
            }
          }
        `}</style>

        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[4] }}>
          {/* Handover Action Prompt */}
          {booking.status === 'confirmed' && !booking.handover?.handover_confirmed_at && !showHandoverForm && (
            <div
              style={{
                backgroundColor: colors.warning[50],
                borderRadius: borderRadius.lg,
                border: `2px solid ${colors.warning[300]}`,
                padding: spacing[4],
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: spacing[4] }}>
                <Icons.AlertCircle size={24} color={colors.warning[700]} style={{ flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <h3
                    style={{
                      fontSize: typography.fontSize.lg,
                      fontWeight: typography.fontWeight.semibold,
                      color: colors.warning[900],
                      margin: 0,
                      marginBottom: spacing[1],
                    }}
                  >
                    {t('rentalDetail.handoverPending', 'Handover Pending')}
                  </h3>
                  <p
                    style={{
                      fontSize: typography.fontSize.sm,
                      color: colors.text.secondary,
                      margin: 0,
                      marginBottom: spacing[3],
                    }}
                  >
                    {t(
                      'rentalDetail.handoverPrompt',
                      'Please confirm handover once you receive the tool. Take photos of the tool condition and note any existing damage.'
                    )}
                  </p>
                  <button
                    onClick={() => setShowHandoverForm(true)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: spacing[2],
                      padding: `${spacing[2]} ${spacing[4]}`,
                      backgroundColor: colors.primary[600],
                      color: colors.neutral[0],
                      border: 'none',
                      borderRadius: borderRadius.md,
                      fontSize: typography.fontSize.sm,
                      fontWeight: typography.fontWeight.medium,
                      cursor: 'pointer',
                    }}
                  >
                    <Icons.CheckCircle size={18} />
                    {t('rentalDetail.confirmHandover', 'Confirm Handover')}
                  </button>
                </div>
              </div>
            </div>
          )}

          {showHandoverForm && (
            <div
              style={{
                backgroundColor: colors.neutral[0],
                borderRadius: borderRadius.lg,
                border: `1px solid ${colors.border.light}`,
                padding: spacing[4],
              }}
            >
              <ConditionCheckForm
                type="handover"
                onSubmit={handleHandoverSubmit}
                onCancel={() => setShowHandoverForm(false)}
                timeWindow={
                  booking.start_date
                    ? {
                        scheduledTime: new Date(booking.start_date),
                        windowHours: 2,
                      }
                    : undefined
                }
              />
            </div>
          )}

          {/* Return Action Prompt */}
          {booking.status === 'active' && !booking.return?.return_confirmed_at && !showReturnForm && (
            <div
              style={{
                backgroundColor: colors.info[50],
                borderRadius: borderRadius.lg,
                border: `2px solid ${colors.info[300]}`,
                padding: spacing[4],
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: spacing[4] }}>
                <Icons.AlertCircle size={24} color={colors.info[700]} style={{ flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <h3
                    style={{
                      fontSize: typography.fontSize.lg,
                      fontWeight: typography.fontWeight.semibold,
                      color: colors.info[900],
                      margin: 0,
                      marginBottom: spacing[1],
                    }}
                  >
                    {t('rentalDetail.returnPending', 'Return Pending')}
                  </h3>
                  <p
                    style={{
                      fontSize: typography.fontSize.sm,
                      color: colors.text.secondary,
                      margin: 0,
                      marginBottom: spacing[3],
                    }}
                  >
                    {t(
                      'rentalDetail.returnPrompt',
                      "Please confirm return once you've returned the tool to the supplier. Take photos showing the tool condition upon return."
                    )}
                  </p>
                  <button
                    onClick={() => setShowReturnForm(true)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: spacing[2],
                      padding: `${spacing[2]} ${spacing[4]}`,
                      backgroundColor: colors.primary[600],
                      color: colors.neutral[0],
                      border: 'none',
                      borderRadius: borderRadius.md,
                      fontSize: typography.fontSize.sm,
                      fontWeight: typography.fontWeight.medium,
                      cursor: 'pointer',
                    }}
                  >
                    <Icons.PackageCheck size={18} />
                    {t('rentalDetail.confirmReturn', 'Confirm Return')}
                  </button>
                </div>
              </div>
            </div>
          )}

          {showReturnForm && (
            <div
              style={{
                backgroundColor: colors.neutral[0],
                borderRadius: borderRadius.lg,
                border: `1px solid ${colors.border.light}`,
                padding: spacing[4],
              }}
            >
              <ConditionCheckForm
                type="return"
                onSubmit={handleReturnSubmit}
                onCancel={() => setShowReturnForm(false)}
                timeWindow={
                  booking.end_date
                    ? {
                        scheduledTime: new Date(booking.end_date),
                        windowHours: 24,
                      }
                    : undefined
                }
              />
            </div>
          )}

          {/* Tool Details Card */}
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
                {t('rentalDetail.toolDetails', 'Tool Details')}
              </h2>
            </div>

            <div style={{ padding: spacing[4] }}>
              <div style={{ display: 'flex', gap: spacing[4], alignItems: 'flex-start' }}>
                {booking.tool.images && booking.tool.images.length > 0 ? (
                  <img
                    src={booking.tool.images[0]}
                    alt={booking.tool.name}
                    style={{
                      width: '120px',
                      height: '120px',
                      objectFit: 'cover',
                      borderRadius: borderRadius.md,
                      flexShrink: 0,
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: '120px',
                      height: '120px',
                      backgroundColor: colors.neutral[100],
                      borderRadius: borderRadius.md,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Icons.Wrench size={48} color={colors.text.tertiary} />
                  </div>
                )}
                <div style={{ flex: 1 }}>
                  <h3
                    style={{
                      fontSize: typography.fontSize.xl,
                      fontWeight: typography.fontWeight.semibold,
                      color: colors.text.primary,
                      margin: 0,
                      marginBottom: spacing[1],
                    }}
                  >
                    {booking.tool.name}
                  </h3>
                  {booking.tool.spec && (
                    <p
                      style={{
                        fontSize: typography.fontSize.sm,
                        color: colors.text.secondary,
                        margin: 0,
                        marginBottom: spacing[2],
                      }}
                    >
                      {booking.tool.spec}
                    </p>
                  )}
                  {booking.tool.category && (
                    <span
                      style={{
                        display: 'inline-block',
                        padding: `${spacing[1]} ${spacing[2]}`,
                        backgroundColor: colors.neutral[100],
                        borderRadius: borderRadius.md,
                        fontSize: typography.fontSize.xs,
                        color: colors.text.secondary,
                        textTransform: 'capitalize',
                      }}
                    >
                      {booking.tool.category}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Rental Period Card */}
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
                marginBottom: spacing[4],
              }}
            >
              {t('rentalDetail.rentalPeriod', 'Rental Period')}
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: spacing[4] }}>
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
                    {t('rentalDetail.startDate', 'Start Date')}
                  </p>
                  <p
                    style={{
                      fontSize: typography.fontSize.base,
                      fontWeight: typography.fontWeight.medium,
                      color: colors.text.primary,
                      margin: 0,
                    }}
                  >
                    {formatDateOnly(booking.start_date)}
                  </p>
                </div>
              </div>

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
                    {t('rentalDetail.endDate', 'End Date')}
                  </p>
                  <p
                    style={{
                      fontSize: typography.fontSize.base,
                      fontWeight: typography.fontWeight.medium,
                      color: colors.text.primary,
                      margin: 0,
                    }}
                  >
                    {formatDateOnly(booking.end_date)}
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: spacing[3] }}>
                <Icons.Clock size={20} color={colors.primary[600]} style={{ flexShrink: 0, marginTop: '2px' }} />
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
                    {t('rentalDetail.duration', 'Duration')}
                  </p>
                  <p
                    style={{
                      fontSize: typography.fontSize.base,
                      fontWeight: typography.fontWeight.medium,
                      color: colors.text.primary,
                      margin: 0,
                    }}
                  >
                    {booking.rental_duration_days} {booking.rental_duration_days === 1 ? 'day' : 'days'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Delivery/Pickup Info Card */}
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
                marginBottom: spacing[4],
              }}
            >
              {booking.pickup_or_delivery === 'pickup'
                ? t('rentalDetail.pickupInfo', 'Pickup Information')
                : t('rentalDetail.deliveryInfo', 'Delivery Information')}
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[3] }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: spacing[3] }}>
                {booking.pickup_or_delivery === 'pickup' ? (
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
                    {booking.pickup_or_delivery === 'pickup'
                      ? t('rentalDetail.pickupLocation', 'Pickup Location')
                      : t('rentalDetail.deliveryAddress', 'Delivery Address')}
                  </p>
                  <p
                    style={{
                      fontSize: typography.fontSize.base,
                      color: colors.text.primary,
                      margin: 0,
                    }}
                  >
                    {booking.pickup_or_delivery === 'pickup'
                      ? booking.supplier_address || booking.supplier_name
                      : booking.delivery_address}
                  </p>
                </div>
              </div>

              {booking.project_name && (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: spacing[3] }}>
                  <Icons.FolderOpen size={20} color={colors.primary[600]} style={{ flexShrink: 0, marginTop: '2px' }} />
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
                      {t('rentalDetail.project', 'Project')}
                    </p>
                    <p
                      style={{
                        fontSize: typography.fontSize.base,
                        color: colors.text.primary,
                        margin: 0,
                      }}
                    >
                      {booking.project_name}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          {(booking.buyer_notes || booking.supplier_notes || booking.notes) && (
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
                {t('rentalDetail.notes', 'Notes')}
              </h3>

              {booking.buyer_notes && (
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
                    {t('rentalDetail.yourNotes', 'Your Notes')}
                  </p>
                  <p
                    style={{
                      fontSize: typography.fontSize.base,
                      color: colors.text.primary,
                      margin: 0,
                    }}
                  >
                    {booking.buyer_notes}
                  </p>
                </div>
              )}

              {booking.supplier_notes && (
                <div style={{ marginBottom: booking.notes ? spacing[3] : 0 }}>
                  <p
                    style={{
                      fontSize: typography.fontSize.sm,
                      fontWeight: typography.fontWeight.medium,
                      color: colors.text.tertiary,
                      margin: 0,
                      marginBottom: spacing[1],
                    }}
                  >
                    {t('rentalDetail.supplierNotes', 'Supplier Notes')}
                  </p>
                  <p
                    style={{
                      fontSize: typography.fontSize.base,
                      color: colors.text.primary,
                      margin: 0,
                    }}
                  >
                    {booking.supplier_notes}
                  </p>
                </div>
              )}

              {booking.notes && (
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
                    {t('rentalDetail.bookingNotes', 'Booking Notes')}
                  </p>
                  <p
                    style={{
                      fontSize: typography.fontSize.base,
                      color: colors.text.primary,
                      margin: 0,
                    }}
                  >
                    {booking.notes}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[4] }}>
          {/* Booking Timeline */}
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
                marginBottom: spacing[4],
              }}
            >
              {t('rentalDetail.bookingTimeline', 'Booking Timeline')}
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {timelineSteps.map((step, index) => {
                const Icon = step.icon;
                const isLast = index === timelineSteps.length - 1;

                return (
                  <div key={index} style={{ display: 'flex', gap: spacing[3] }}>
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                      }}
                    >
                      <div
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          backgroundColor: step.completed ? colors.success[600] : colors.neutral[200],
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Icon size={16} color={colors.neutral[0]} />
                      </div>
                      {!isLast && (
                        <div
                          style={{
                            width: '2px',
                            flex: 1,
                            minHeight: '24px',
                            backgroundColor:
                              step.completed && timelineSteps[index + 1]?.completed
                                ? colors.success[600]
                                : colors.neutral[200],
                          }}
                        />
                      )}
                    </div>
                    <div style={{ flex: 1, paddingBottom: spacing[3] }}>
                      <p
                        style={{
                          fontSize: typography.fontSize.sm,
                          fontWeight: typography.fontWeight.semibold,
                          color: step.completed ? colors.text.primary : colors.text.tertiary,
                          margin: 0,
                          marginBottom: spacing[1],
                        }}
                      >
                        {step.label}
                      </p>
                      {step.date && (
                        <p
                          style={{
                            fontSize: typography.fontSize.xs,
                            color: colors.text.tertiary,
                            margin: 0,
                          }}
                        >
                          {formatDateTime(step.date)}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

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
              {t('rentalDetail.supplierContact', 'Supplier Contact')}
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
                  {t('rentalDetail.businessName', 'Business Name')}
                </p>
                <p
                  style={{
                    fontSize: typography.fontSize.base,
                    fontWeight: typography.fontWeight.semibold,
                    color: colors.text.primary,
                    margin: 0,
                  }}
                >
                  {booking.supplier_name}
                </p>
              </div>

              {booking.supplier_phone && (
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
                    {t('rentalDetail.phone', 'Phone')}
                  </p>
                  <a
                    href={`tel:${booking.supplier_phone}`}
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
                    {booking.supplier_phone}
                  </a>
                </div>
              )}

              {booking.supplier_email && (
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
                    {t('rentalDetail.email', 'Email')}
                  </p>
                  <a
                    href={`mailto:${booking.supplier_email}`}
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
                    {booking.supplier_email}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Pricing Card */}
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
              <h3
                style={{
                  fontSize: typography.fontSize.lg,
                  fontWeight: typography.fontWeight.semibold,
                  color: colors.text.primary,
                  margin: 0,
                }}
              >
                {t('rentalDetail.pricing', 'Pricing')}
              </h3>
            </div>

            <div style={{ padding: spacing[4] }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: spacing[2],
                }}
              >
                <span style={{ fontSize: typography.fontSize.base, color: colors.text.secondary }}>
                  {t('rentalDetail.dailyRate', 'Daily Rate')}
                </span>
                <span
                  style={{
                    fontSize: typography.fontSize.base,
                    fontWeight: typography.fontWeight.medium,
                    color: colors.text.primary,
                  }}
                >
                  {booking.day_rate?.toLocaleString()} ₾
                </span>
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: spacing[2],
                }}
              >
                <span style={{ fontSize: typography.fontSize.base, color: colors.text.secondary }}>
                  {t('rentalDetail.rentalDuration', 'Rental Duration')}
                </span>
                <span
                  style={{
                    fontSize: typography.fontSize.base,
                    fontWeight: typography.fontWeight.medium,
                    color: colors.text.primary,
                  }}
                >
                  {booking.rental_duration_days} {t('rentalDetail.days', 'days')}
                </span>
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: spacing[2],
                }}
              >
                <span style={{ fontSize: typography.fontSize.base, color: colors.text.secondary }}>
                  {t('rentalDetail.rentalAmount', 'Rental Amount')}
                </span>
                <span
                  style={{
                    fontSize: typography.fontSize.base,
                    fontWeight: typography.fontWeight.medium,
                    color: colors.text.primary,
                  }}
                >
                  {booking.total_rental_amount?.toLocaleString()} ₾
                </span>
              </div>

              {booking.delivery_fee > 0 && (
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: spacing[2],
                  }}
                >
                  <span style={{ fontSize: typography.fontSize.base, color: colors.text.secondary }}>
                    {t('rentalDetail.deliveryFee', 'Delivery Fee')}
                  </span>
                  <span
                    style={{
                      fontSize: typography.fontSize.base,
                      fontWeight: typography.fontWeight.medium,
                      color: colors.text.primary,
                    }}
                  >
                    {booking.delivery_fee?.toLocaleString()} ₾
                  </span>
                </div>
              )}

              {booking.late_return_fee > 0 && (
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: spacing[2],
                  }}
                >
                  <span style={{ fontSize: typography.fontSize.base, color: colors.text.secondary }}>
                    {t('rentalDetail.lateReturnFee', 'Late Return Fee')}
                  </span>
                  <span
                    style={{
                      fontSize: typography.fontSize.base,
                      fontWeight: typography.fontWeight.medium,
                      color: colors.error[600],
                    }}
                  >
                    {booking.late_return_fee?.toLocaleString()} ₾
                  </span>
                </div>
              )}

              {booking.damage_fee > 0 && (
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: spacing[2],
                  }}
                >
                  <span style={{ fontSize: typography.fontSize.base, color: colors.text.secondary }}>
                    {t('rentalDetail.damageFee', 'Damage Fee')}
                  </span>
                  <span
                    style={{
                      fontSize: typography.fontSize.base,
                      fontWeight: typography.fontWeight.medium,
                      color: colors.error[600],
                    }}
                  >
                    {booking.damage_fee?.toLocaleString()} ₾
                  </span>
                </div>
              )}

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  paddingTop: spacing[3],
                  marginTop: spacing[2],
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
                  {t('rentalDetail.total', 'Total')}
                </span>
                <span
                  style={{
                    fontSize: typography.fontSize['2xl'],
                    fontWeight: typography.fontWeight.bold,
                    color: colors.primary[600],
                  }}
                >
                  {totalAmount?.toLocaleString()} ₾
                </span>
              </div>

              {booking.deposit_amount > 0 && (
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    paddingTop: spacing[3],
                    marginTop: spacing[3],
                    borderTop: `1px solid ${colors.border.light}`,
                  }}
                >
                  <span
                    style={{
                      fontSize: typography.fontSize.sm,
                      color: colors.text.tertiary,
                      fontStyle: 'italic',
                    }}
                  >
                    {t('rentalDetail.depositPaid', 'Deposit (paid to supplier)')}
                  </span>
                  <span
                    style={{
                      fontSize: typography.fontSize.base,
                      fontWeight: typography.fontWeight.medium,
                      color: colors.text.secondary,
                    }}
                  >
                    {booking.deposit_amount?.toLocaleString()} ₾
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Payment Method */}
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
              {t('rentalDetail.payment', 'Payment')}
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
                {booking.payment_terms === 'cod'
                  ? t('rentalDetail.cashOnDelivery', 'Cash on Delivery')
                  : t('rentalDetail.paymentOnDelivery', 'Payment on delivery')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RentalBookingDetail;
