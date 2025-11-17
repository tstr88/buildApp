import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { colors, spacing, typography, borderRadius, shadows } from '../theme/tokens';
import * as Icons from 'lucide-react';
import { ConditionCheckForm } from '../components/rentals/ConditionCheckForm';

interface RentalBooking {
  id: string;
  booking_number: string;
  supplier_id: string;
  supplier_name: string;
  supplier_address?: string;
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
  const [booking, setBooking] = useState<RentalBooking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showHandoverForm, setShowHandoverForm] = useState(false);
  const [showReturnForm, setShowReturnForm] = useState(false);

  useEffect(() => {
    fetchBookingDetails();
  }, [bookingId]);

  const fetchBookingDetails = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch(`http://localhost:3001/api/buyers/rentals/${bookingId}`, {
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

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'confirmed':
        return colors.primary;
      case 'active':
        return colors.success;
      case 'completed':
        return colors.textSecondary;
      case 'overdue':
        return colors.error;
      case 'cancelled':
        return colors.textTertiary;
      case 'disputed':
        return colors.warning;
      default:
        return colors.textSecondary;
    }
  };

  const getStatusLabel = (status: string): string => {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'confirmed':
        return 'Confirmed';
      case 'active':
        return 'Active';
      case 'completed':
        return 'Completed';
      case 'overdue':
        return 'Overdue';
      case 'cancelled':
        return 'Cancelled';
      case 'disputed':
        return 'Disputed';
      default:
        return status;
    }
  };

  const getTimelineSteps = () => {
    if (!booking) return [];

    const steps = [
      {
        label: 'Booked',
        completed: true,
        date: booking.created_at,
        icon: Icons.CheckCircle,
      },
      {
        label: 'Confirmed',
        completed: !!booking.confirmed_at,
        date: booking.confirmed_at,
        icon: Icons.CheckCircle,
      },
      {
        label: 'Handover Scheduled',
        completed: !!booking.handover?.handover_scheduled_at,
        date: booking.handover?.handover_scheduled_at,
        icon: Icons.Calendar,
      },
      {
        label: 'Handed Over',
        completed: !!booking.handover?.handover_confirmed_at,
        date: booking.handover?.handover_confirmed_at,
        icon: Icons.Package,
      },
      {
        label: 'Return Scheduled',
        completed: !!booking.return?.return_scheduled_at,
        date: booking.return?.return_scheduled_at,
        icon: Icons.Calendar,
      },
      {
        label: 'Returned',
        completed: !!booking.return?.return_confirmed_at,
        date: booking.return?.return_confirmed_at,
        icon: Icons.PackageCheck,
      },
      {
        label: 'Completed',
        completed: booking.status === 'completed',
        date: booking.status === 'completed' ? booking.updated_at : undefined,
        icon: Icons.CheckCircle2,
      },
    ];

    return steps;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
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
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      // Convert photos to data URLs (simulate upload)
      const photoUrls = await convertFilesToDataURLs(data.photos);

      const response = await fetch(
        `http://localhost:3001/api/buyers/rentals/${bookingId}/confirm-handover`,
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

      alert('Handover confirmed successfully!');
      setShowHandoverForm(false);
      fetchBookingDetails(); // Refresh booking data
    } catch (error: any) {
      console.error('Error confirming handover:', error);
      alert(error.message || 'Failed to confirm handover');
      throw error;
    }
  };

  const handleReturnSubmit = async (data: { photos: File[]; notes: string }) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      // Convert photos to data URLs (simulate upload)
      const photoUrls = await convertFilesToDataURLs(data.photos);

      const response = await fetch(
        `http://localhost:3001/api/buyers/rentals/${bookingId}/confirm-return`,
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

      alert('Return confirmed successfully!');
      setShowReturnForm(false);
      fetchBookingDetails(); // Refresh booking data
    } catch (error: any) {
      console.error('Error confirming return:', error);
      alert(error.message || 'Failed to confirm return');
      throw error;
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingContainer}>
          <Icons.Loader2 size={48} color={colors.primary} style={{ animation: 'spin 1s linear infinite' }} />
          <p style={styles.loadingText}>Loading booking details...</p>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div style={styles.container}>
        <div style={styles.errorContainer}>
          <Icons.AlertCircle size={48} color={colors.error} />
          <h2 style={styles.errorTitle}>Error</h2>
          <p style={styles.errorMessage}>{error || 'Booking not found'}</p>
          <button style={styles.backButton} onClick={() => navigate('/rentals')}>
            Back to Rentals
          </button>
        </div>
      </div>
    );
  }

  const timelineSteps = getTimelineSteps();

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={() => navigate('/rentals')}>
          <Icons.ArrowLeft size={20} />
        </button>
        <div style={styles.headerContent}>
          <h1 style={styles.title}>Rental Booking</h1>
          <p style={styles.bookingNumber}>{booking.booking_number}</p>
        </div>
        <div style={{ ...styles.statusBadge, backgroundColor: getStatusColor(booking.status) }}>
          {getStatusLabel(booking.status)}
        </div>
      </div>

      {/* Timeline */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Booking Timeline</h2>
        <div style={styles.timeline}>
          {timelineSteps.map((step, index) => {
            const Icon = step.icon;
            const isLast = index === timelineSteps.length - 1;

            return (
              <div key={index} style={styles.timelineItem}>
                <div style={styles.timelineIconContainer}>
                  <div
                    style={{
                      ...styles.timelineIcon,
                      backgroundColor: step.completed ? colors.success : colors.border,
                    }}
                  >
                    <Icon size={16} color={colors.background} />
                  </div>
                  {!isLast && (
                    <div
                      style={{
                        ...styles.timelineLine,
                        backgroundColor: step.completed && timelineSteps[index + 1]?.completed
                          ? colors.success
                          : colors.border,
                      }}
                    />
                  )}
                </div>
                <div style={styles.timelineContent}>
                  <p style={{ ...styles.timelineLabel, color: step.completed ? colors.text : colors.textSecondary }}>
                    {step.label}
                  </p>
                  {step.date && <p style={styles.timelineDate}>{formatDate(step.date)}</p>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Handover Confirmation */}
      {booking.status === 'confirmed' && !booking.handover?.handover_confirmed_at && !showHandoverForm && (
        <div style={styles.section}>
          <div style={styles.actionPrompt}>
            <Icons.AlertCircle size={24} color={colors.primary} />
            <div style={{ flex: 1 }}>
              <h3 style={styles.actionTitle}>Handover Pending</h3>
              <p style={styles.actionText}>
                Please confirm handover once you receive the tool. Take photos of the tool condition and note any existing damage.
              </p>
            </div>
            <button style={styles.actionButton} onClick={() => setShowHandoverForm(true)}>
              <Icons.CheckCircle size={20} />
              <span>Confirm Handover</span>
            </button>
          </div>
        </div>
      )}

      {showHandoverForm && (
        <div style={styles.section}>
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

      {/* Return Confirmation */}
      {booking.status === 'active' && !booking.return?.return_confirmed_at && !showReturnForm && (
        <div style={styles.section}>
          <div style={styles.actionPrompt}>
            <Icons.AlertCircle size={24} color={colors.warning} />
            <div style={{ flex: 1 }}>
              <h3 style={styles.actionTitle}>Return Pending</h3>
              <p style={styles.actionText}>
                Please confirm return once you've returned the tool to the supplier. Take photos showing the tool condition upon return.
              </p>
            </div>
            <button style={styles.actionButton} onClick={() => setShowReturnForm(true)}>
              <Icons.PackageCheck size={20} />
              <span>Confirm Return</span>
            </button>
          </div>
        </div>
      )}

      {showReturnForm && (
        <div style={styles.section}>
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

      {/* Tool Details */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Tool Details</h2>
        <div style={styles.toolCard}>
          {booking.tool.images && booking.tool.images.length > 0 ? (
            <img src={booking.tool.images[0]} alt={booking.tool.name} style={styles.toolImage} />
          ) : (
            <div style={styles.toolImagePlaceholder}>
              <Icons.Wrench size={48} color={colors.textTertiary} />
            </div>
          )}
          <div style={styles.toolInfo}>
            <h3 style={styles.toolName}>{booking.tool.name}</h3>
            <p style={styles.toolSpec}>{booking.tool.spec}</p>
            <div style={styles.toolMeta}>
              <span style={styles.categoryBadge}>{booking.tool.category}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Rental Period */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Rental Period</h2>
        <div style={styles.infoGrid}>
          <div style={styles.infoItem}>
            <Icons.Calendar size={20} color={colors.textSecondary} />
            <div>
              <p style={styles.infoLabel}>Start Date</p>
              <p style={styles.infoValue}>{formatDateOnly(booking.start_date)}</p>
            </div>
          </div>
          <div style={styles.infoItem}>
            <Icons.Calendar size={20} color={colors.textSecondary} />
            <div>
              <p style={styles.infoLabel}>End Date</p>
              <p style={styles.infoValue}>{formatDateOnly(booking.end_date)}</p>
            </div>
          </div>
          <div style={styles.infoItem}>
            <Icons.Clock size={20} color={colors.textSecondary} />
            <div>
              <p style={styles.infoLabel}>Duration</p>
              <p style={styles.infoValue}>{booking.rental_duration_days} days</p>
            </div>
          </div>
        </div>
      </div>

      {/* Supplier & Delivery */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Supplier & Delivery</h2>
        <div style={styles.infoGrid}>
          <div style={styles.infoItem}>
            <Icons.Building2 size={20} color={colors.textSecondary} />
            <div>
              <p style={styles.infoLabel}>Supplier</p>
              <p style={styles.infoValue}>{booking.supplier_name}</p>
            </div>
          </div>
          <div style={styles.infoItem}>
            <Icons.Truck size={20} color={colors.textSecondary} />
            <div>
              <p style={styles.infoLabel}>Method</p>
              <p style={styles.infoValue}>
                {booking.pickup_or_delivery === 'delivery' ? 'Delivery' : 'Pickup'}
              </p>
            </div>
          </div>
          {booking.delivery_address && (
            <div style={styles.infoItem}>
              <Icons.MapPin size={20} color={colors.textSecondary} />
              <div>
                <p style={styles.infoLabel}>Delivery Address</p>
                <p style={styles.infoValue}>{booking.delivery_address}</p>
              </div>
            </div>
          )}
          {booking.project_name && (
            <div style={styles.infoItem}>
              <Icons.FolderOpen size={20} color={colors.textSecondary} />
              <div>
                <p style={styles.infoLabel}>Project</p>
                <p style={styles.infoValue}>{booking.project_name}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Pricing */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Pricing</h2>
        <div style={styles.pricingCard}>
          <div style={styles.pricingRow}>
            <span style={styles.pricingLabel}>Daily Rate</span>
            <span style={styles.pricingValue}>{booking.day_rate.toLocaleString()} ₾</span>
          </div>
          <div style={styles.pricingRow}>
            <span style={styles.pricingLabel}>Rental Duration</span>
            <span style={styles.pricingValue}>{booking.rental_duration_days} days</span>
          </div>
          <div style={styles.pricingRow}>
            <span style={styles.pricingLabel}>Rental Amount</span>
            <span style={styles.pricingValue}>{booking.total_rental_amount.toLocaleString()} ₾</span>
          </div>
          {booking.delivery_fee > 0 && (
            <div style={styles.pricingRow}>
              <span style={styles.pricingLabel}>Delivery Fee</span>
              <span style={styles.pricingValue}>{booking.delivery_fee.toLocaleString()} ₾</span>
            </div>
          )}
          {booking.late_return_fee > 0 && (
            <div style={styles.pricingRow}>
              <span style={styles.pricingLabel}>Late Return Fee</span>
              <span style={{ ...styles.pricingValue, color: colors.error }}>
                {booking.late_return_fee.toLocaleString()} ₾
              </span>
            </div>
          )}
          {booking.damage_fee > 0 && (
            <div style={styles.pricingRow}>
              <span style={styles.pricingLabel}>Damage Fee</span>
              <span style={{ ...styles.pricingValue, color: colors.error }}>
                {booking.damage_fee.toLocaleString()} ₾
              </span>
            </div>
          )}
          <div style={{ ...styles.pricingRow, ...styles.pricingTotal }}>
            <span style={styles.pricingLabel}>Total</span>
            <span style={styles.pricingValue}>
              {(
                booking.total_rental_amount +
                booking.delivery_fee +
                booking.late_return_fee +
                booking.damage_fee
              ).toLocaleString()}{' '}
              ₾
            </span>
          </div>
          <div style={{ ...styles.pricingRow, marginTop: spacing.md, paddingTop: spacing.md, borderTop: `1px solid ${colors.border}` }}>
            <span style={styles.depositLabel}>Deposit (paid to supplier)</span>
            <span style={styles.depositValue}>{booking.deposit_amount.toLocaleString()} ₾</span>
          </div>
        </div>
      </div>

      {/* Notes */}
      {(booking.buyer_notes || booking.supplier_notes || booking.notes) && (
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Notes</h2>
          {booking.buyer_notes && (
            <div style={styles.noteCard}>
              <p style={styles.noteLabel}>Your Notes</p>
              <p style={styles.noteText}>{booking.buyer_notes}</p>
            </div>
          )}
          {booking.supplier_notes && (
            <div style={styles.noteCard}>
              <p style={styles.noteLabel}>Supplier Notes</p>
              <p style={styles.noteText}>{booking.supplier_notes}</p>
            </div>
          )}
          {booking.notes && (
            <div style={styles.noteCard}>
              <p style={styles.noteLabel}>Booking Notes</p>
              <p style={styles.noteText}>{booking.notes}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    padding: spacing.xl,
    maxWidth: '1200px',
    margin: '0 auto',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '400px',
    gap: spacing.md,
  },
  loadingText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  errorContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '400px',
    gap: spacing.md,
  },
  errorTitle: {
    ...typography.h2,
    color: colors.text,
    margin: 0,
  },
  errorMessage: {
    ...typography.body,
    color: colors.textSecondary,
  },
  backButton: {
    padding: `${spacing.sm} ${spacing.lg}`,
    backgroundColor: colors.primary,
    color: colors.background,
    border: 'none',
    borderRadius: borderRadius.md,
    ...typography.body,
    fontWeight: 600,
    cursor: 'pointer',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: spacing.lg,
    marginBottom: spacing.xl,
    padding: spacing.lg,
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    boxShadow: shadows.sm,
  },
  backBtn: {
    padding: spacing.sm,
    backgroundColor: 'transparent',
    border: `1px solid ${colors.border}`,
    borderRadius: borderRadius.md,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: colors.text,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    ...typography.h2,
    margin: 0,
    marginBottom: spacing.xs,
  },
  bookingNumber: {
    ...typography.body,
    color: colors.textSecondary,
    margin: 0,
  },
  statusBadge: {
    padding: `${spacing.xs} ${spacing.md}`,
    borderRadius: borderRadius.md,
    ...typography.caption,
    fontWeight: 600,
    color: colors.background,
  },
  section: {
    marginBottom: spacing.xl,
    padding: spacing.lg,
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    boxShadow: shadows.sm,
  },
  sectionTitle: {
    ...typography.h3,
    marginBottom: spacing.lg,
  },
  timeline: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.md,
  },
  timelineItem: {
    display: 'flex',
    gap: spacing.md,
  },
  timelineIconContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  timelineIcon: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineLine: {
    width: '2px',
    flex: 1,
    minHeight: '20px',
  },
  timelineContent: {
    flex: 1,
    paddingBottom: spacing.sm,
  },
  timelineLabel: {
    ...typography.body,
    fontWeight: 600,
    margin: 0,
    marginBottom: spacing.xs,
  },
  timelineDate: {
    ...typography.caption,
    color: colors.textSecondary,
    margin: 0,
  },
  toolCard: {
    display: 'flex',
    gap: spacing.lg,
    alignItems: 'start',
  },
  toolImage: {
    width: '120px',
    height: '120px',
    objectFit: 'cover',
    borderRadius: borderRadius.md,
  },
  toolImagePlaceholder: {
    width: '120px',
    height: '120px',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.md,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  toolInfo: {
    flex: 1,
  },
  toolName: {
    ...typography.h3,
    margin: 0,
    marginBottom: spacing.xs,
  },
  toolSpec: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  toolMeta: {
    display: 'flex',
    gap: spacing.sm,
  },
  categoryBadge: {
    padding: `${spacing.xs} ${spacing.sm}`,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.sm,
    ...typography.caption,
    color: colors.textSecondary,
    textTransform: 'capitalize',
  },
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: spacing.lg,
  },
  infoItem: {
    display: 'flex',
    gap: spacing.sm,
    alignItems: 'start',
  },
  infoLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    margin: 0,
    marginBottom: spacing.xs,
  },
  infoValue: {
    ...typography.body,
    color: colors.text,
    margin: 0,
    fontWeight: 500,
  },
  pricingCard: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.sm,
  },
  pricingRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: `${spacing.sm} 0`,
  },
  pricingLabel: {
    ...typography.body,
    color: colors.textSecondary,
  },
  pricingValue: {
    ...typography.body,
    color: colors.text,
    fontWeight: 600,
  },
  pricingTotal: {
    borderTop: `2px solid ${colors.border}`,
    paddingTop: spacing.md,
    marginTop: spacing.sm,
  },
  depositLabel: {
    ...typography.body,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  depositValue: {
    ...typography.body,
    color: colors.textSecondary,
    fontWeight: 600,
  },
  noteCard: {
    padding: spacing.md,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  noteLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    margin: 0,
    marginBottom: spacing.xs,
    fontWeight: 600,
  },
  noteText: {
    ...typography.body,
    color: colors.text,
    margin: 0,
  },
  actionPrompt: {
    display: 'flex',
    alignItems: 'center',
    gap: spacing.lg,
    padding: spacing.lg,
    backgroundColor: '#FFF9C4',
    borderRadius: borderRadius.md,
    border: `1px solid ${colors.warning}`,
  },
  actionTitle: {
    ...typography.h3,
    margin: 0,
    marginBottom: spacing.xs,
    color: colors.text,
  },
  actionText: {
    ...typography.body,
    color: colors.textSecondary,
    margin: 0,
  },
  actionButton: {
    padding: `${spacing.sm} ${spacing.lg}`,
    backgroundColor: colors.primary,
    color: colors.background,
    border: 'none',
    borderRadius: borderRadius.md,
    ...typography.body,
    fontWeight: 600,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: spacing.sm,
    whiteSpace: 'nowrap',
  },
};

export default RentalBookingDetail;
