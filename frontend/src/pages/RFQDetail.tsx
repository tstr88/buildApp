/**
 * RFQ Detail Page
 * Shows full RFQ information with offers
 * Mobile-optimized responsive design
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as Icons from 'lucide-react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { colors, spacing, typography, borderRadius, shadows } from '../theme/tokens';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Fix Leaflet icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface RFQDetail {
  id: string;
  title: string | null;
  project_name: string;
  project_latitude: number;
  project_longitude: number;
  project_address: string | null;
  lines: any[];
  preferred_window_start: string | null;
  preferred_window_end: string | null;
  additional_notes: string | null;
  status: string;
  created_at: string;
  expires_at: string;
  recipients: any[];
  offers: any[];
}

export const RFQDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [rfq, setRfq] = useState<RFQDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [selectedOfferId, setSelectedOfferId] = useState<string | null>(null);
  const [declineReason, setDeclineReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (id) {
      fetchRFQDetail();
    }
  }, [id]);

  const fetchRFQDetail = async () => {
    try {
      const token = localStorage.getItem('buildapp_auth_token');
      const response = await fetch(`${API_URL}/api/buyers/rfqs/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setRfq(data.data);
      } else {
        alert('Failed to load RFQ');
        navigate('/rfqs');
      }
    } catch (error) {
      console.error('Failed to fetch RFQ detail:', error);
      alert('Failed to load RFQ');
      navigate('/rfqs');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not specified';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Generate a short reference code from UUID (first 8 chars uppercase)
  const getRfqCode = (rfqId: string): string => {
    return `#${rfqId.slice(0, 8).toUpperCase()}`;
  };

  // Generate smart RFQ display name based on items
  const getRfqDisplayTitle = (rfqData: RFQDetail): string => {
    const code = getRfqCode(rfqData.id);

    // If RFQ has a custom title, use it with code
    if (rfqData.title) {
      return `${code} · ${rfqData.title}`;
    }

    // Generate title from first item
    if (rfqData.lines && rfqData.lines.length > 0) {
      const firstItem = rfqData.lines[0].description;
      const moreCount = rfqData.lines.length - 1;
      const itemDesc = moreCount > 0 ? `${firstItem} +${moreCount} more` : firstItem;
      return `${code} · ${itemDesc}`;
    }

    // Fallback
    return code;
  };

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return 'Not specified';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const handleAcceptOffer = async () => {
    if (!selectedOfferId) return;

    setActionLoading(true);
    try {
      const token = localStorage.getItem('buildapp_auth_token');
      const response = await fetch(`${API_URL}/api/buyers/offers/${selectedOfferId}/accept`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setShowAcceptModal(false);
        navigate('/orders');
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to accept offer');
      }
    } catch (error) {
      console.error('Failed to accept offer:', error);
      alert('Failed to accept offer');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeclineOffer = async () => {
    if (!selectedOfferId) return;

    setActionLoading(true);
    try {
      const token = localStorage.getItem('buildapp_auth_token');
      const response = await fetch(`${API_URL}/api/buyers/offers/${selectedOfferId}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ rejection_reason: declineReason }),
      });

      if (response.ok) {
        setShowDeclineModal(false);
        setDeclineReason('');
        fetchRFQDetail();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to decline offer');
      }
    } catch (error) {
      console.error('Failed to decline offer:', error);
      alert('Failed to decline offer');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          backgroundColor: colors.neutral[50],
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: spacing[4],
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <Icons.Loader size={40} color={colors.text.tertiary} style={{ margin: '0 auto', marginBottom: spacing[3] }} />
          <p style={{ fontSize: typography.fontSize.base, color: colors.text.tertiary, margin: 0 }}>
            Loading RFQ...
          </p>
        </div>
      </div>
    );
  }

  if (!rfq) {
    return (
      <div
        style={{
          minHeight: '100vh',
          backgroundColor: colors.neutral[50],
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: spacing[4],
        }}
      >
        <p style={{ fontSize: typography.fontSize.base, color: colors.text.tertiary, margin: 0 }}>
          RFQ not found
        </p>
      </div>
    );
  }

  return (
    <div
      className="rfq-detail-page"
      style={{
        minHeight: '100vh',
        backgroundColor: colors.neutral[50],
      }}
    >
      <style>{`
        .rfq-detail-page {
          padding: ${spacing[3]};
        }
        @media (min-width: 640px) {
          .rfq-detail-page {
            padding: ${spacing[6]};
          }
        }
        .rfq-two-col-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: ${spacing[3]};
        }
        @media (min-width: 640px) {
          .rfq-two-col-grid {
            grid-template-columns: 1fr 1fr;
            gap: ${spacing[4]};
          }
        }
        .rfq-offer-info-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: ${spacing[2]};
        }
        @media (min-width: 480px) {
          .rfq-offer-info-grid {
            grid-template-columns: 1fr 1fr;
            gap: ${spacing[3]};
          }
        }
        .rfq-action-buttons {
          display: flex;
          flex-direction: column;
          gap: ${spacing[2]};
        }
        @media (min-width: 480px) {
          .rfq-action-buttons {
            flex-direction: row;
            gap: ${spacing[3]};
          }
        }
        .rfq-header-meta {
          display: flex;
          flex-direction: column;
          gap: ${spacing[2]};
        }
        @media (min-width: 480px) {
          .rfq-header-meta {
            flex-direction: row;
            align-items: center;
            gap: ${spacing[4]};
          }
        }
        .rfq-map-container {
          height: 200px;
        }
        @media (min-width: 640px) {
          .rfq-map-container {
            height: 300px;
          }
        }
        .rfq-modal-buttons {
          display: flex;
          flex-direction: column-reverse;
          gap: ${spacing[2]};
        }
        @media (min-width: 480px) {
          .rfq-modal-buttons {
            flex-direction: row;
            gap: ${spacing[3]};
          }
        }
      `}</style>

      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <button
          onClick={() => navigate('/rfqs')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: spacing[2],
            padding: `${spacing[2]} 0`,
            backgroundColor: 'transparent',
            border: 'none',
            color: colors.text.secondary,
            fontSize: typography.fontSize.sm,
            cursor: 'pointer',
            marginBottom: spacing[3],
          }}
        >
          <Icons.ArrowLeft size={16} />
          Back to RFQs
        </button>

        {/* Title Section */}
        <div style={{ marginBottom: spacing[4] }}>
          <h1
            style={{
              fontSize: typography.fontSize['2xl'],
              fontWeight: typography.fontWeight.bold,
              color: colors.text.primary,
              margin: 0,
              marginBottom: spacing[2],
              lineHeight: 1.2,
            }}
          >
            {getRfqDisplayTitle(rfq)}
          </h1>
          <div className="rfq-header-meta">
            <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2] }}>
              <Icons.MapPin size={16} color={colors.text.tertiary} />
              <span style={{ fontSize: typography.fontSize.sm, color: colors.text.secondary }}>
                {rfq.project_name}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2] }}>
              <Icons.Calendar size={16} color={colors.text.tertiary} />
              <span style={{ fontSize: typography.fontSize.sm, color: colors.text.secondary }}>
                {formatDate(rfq.created_at)}
              </span>
            </div>
          </div>
        </div>

        {/* Project Location Map */}
        {rfq.project_latitude && rfq.project_longitude && (
          <div
            className="rfq-map-container"
            style={{
              backgroundColor: colors.neutral[0],
              borderRadius: borderRadius.lg,
              overflow: 'hidden',
              marginBottom: spacing[4],
              boxShadow: shadows.sm,
            }}
          >
            <MapContainer
              center={[rfq.project_latitude, rfq.project_longitude]}
              zoom={14}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker position={[rfq.project_latitude, rfq.project_longitude]} />
            </MapContainer>
          </div>
        )}

        {/* Line Items - Mobile-friendly card layout */}
        <div
          style={{
            backgroundColor: colors.neutral[0],
            borderRadius: borderRadius.lg,
            padding: spacing[4],
            marginBottom: spacing[4],
            boxShadow: shadows.sm,
          }}
        >
          <h2
            style={{
              fontSize: typography.fontSize.lg,
              fontWeight: typography.fontWeight.semibold,
              color: colors.text.primary,
              margin: 0,
              marginBottom: spacing[3],
            }}
          >
            Line Items ({rfq.lines.length})
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[3] }}>
            {rfq.lines.map((line, index) => (
              <div
                key={index}
                style={{
                  padding: spacing[3],
                  backgroundColor: colors.neutral[50],
                  borderRadius: borderRadius.md,
                  border: `1px solid ${colors.border.light}`,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing[2] }}>
                  <p
                    style={{
                      fontSize: typography.fontSize.base,
                      fontWeight: typography.fontWeight.medium,
                      color: colors.text.primary,
                      margin: 0,
                      flex: 1,
                    }}
                  >
                    {line.description}
                  </p>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'baseline',
                      gap: spacing[1],
                      marginLeft: spacing[3],
                      flexShrink: 0,
                    }}
                  >
                    <span
                      style={{
                        fontSize: typography.fontSize.lg,
                        fontWeight: typography.fontWeight.bold,
                        color: colors.primary[600],
                      }}
                    >
                      {line.quantity}
                    </span>
                    <span
                      style={{
                        fontSize: typography.fontSize.sm,
                        color: colors.text.secondary,
                      }}
                    >
                      {line.unit}
                    </span>
                  </div>
                </div>
                {line.spec_notes && (
                  <p
                    style={{
                      fontSize: typography.fontSize.sm,
                      color: colors.text.tertiary,
                      margin: 0,
                      fontStyle: 'italic',
                    }}
                  >
                    {line.spec_notes}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Delivery Window & Notes - Responsive grid */}
        <div className="rfq-two-col-grid" style={{ marginBottom: spacing[4] }}>
          {/* Delivery Window */}
          <div
            style={{
              backgroundColor: colors.neutral[0],
              borderRadius: borderRadius.lg,
              padding: spacing[4],
              boxShadow: shadows.sm,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2], marginBottom: spacing[3] }}>
              <Icons.Calendar size={18} color={colors.primary[600]} />
              <h3
                style={{
                  fontSize: typography.fontSize.base,
                  fontWeight: typography.fontWeight.semibold,
                  color: colors.text.primary,
                  margin: 0,
                }}
              >
                Delivery Window
              </h3>
            </div>
            {rfq.preferred_window_start && rfq.preferred_window_end ? (
              <p
                style={{
                  fontSize: typography.fontSize.sm,
                  color: colors.text.secondary,
                  margin: 0,
                }}
              >
                {formatDateTime(rfq.preferred_window_start)} - {formatDateTime(rfq.preferred_window_end)}
              </p>
            ) : (
              <p
                style={{
                  fontSize: typography.fontSize.sm,
                  color: colors.text.tertiary,
                  margin: 0,
                }}
              >
                Flexible delivery window
              </p>
            )}
          </div>

          {/* Additional Notes */}
          <div
            style={{
              backgroundColor: colors.neutral[0],
              borderRadius: borderRadius.lg,
              padding: spacing[4],
              boxShadow: shadows.sm,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2], marginBottom: spacing[3] }}>
              <Icons.FileText size={18} color={colors.primary[600]} />
              <h3
                style={{
                  fontSize: typography.fontSize.base,
                  fontWeight: typography.fontWeight.semibold,
                  color: colors.text.primary,
                  margin: 0,
                }}
              >
                Notes
              </h3>
            </div>
            <p
              style={{
                fontSize: typography.fontSize.sm,
                color: rfq.additional_notes ? colors.text.primary : colors.text.tertiary,
                margin: 0,
              }}
            >
              {rfq.additional_notes || 'No notes'}
            </p>
          </div>
        </div>

        {/* Suppliers Sent To */}
        <div
          style={{
            backgroundColor: colors.neutral[0],
            borderRadius: borderRadius.lg,
            padding: spacing[4],
            marginBottom: spacing[4],
            boxShadow: shadows.sm,
          }}
        >
          <h2
            style={{
              fontSize: typography.fontSize.lg,
              fontWeight: typography.fontWeight.semibold,
              color: colors.text.primary,
              margin: 0,
              marginBottom: spacing[3],
            }}
          >
            Suppliers ({rfq.recipients.length})
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[2] }}>
            {rfq.recipients.map((recipient) => (
              <div
                key={recipient.id}
                style={{
                  padding: spacing[3],
                  backgroundColor: colors.neutral[50],
                  borderRadius: borderRadius.md,
                  border: `1px solid ${colors.border.light}`,
                }}
              >
                <h4
                  style={{
                    fontSize: typography.fontSize.sm,
                    fontWeight: typography.fontWeight.semibold,
                    color: colors.text.primary,
                    margin: 0,
                    marginBottom: spacing[1],
                  }}
                >
                  {recipient.business_name_en || recipient.business_name_ka || recipient.business_name}
                </h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: spacing[2] }}>
                  <span style={{ fontSize: typography.fontSize.xs, color: colors.text.tertiary }}>
                    Sent {formatDate(recipient.notified_at)}
                  </span>
                  {recipient.viewed_at && (
                    <span
                      style={{
                        fontSize: typography.fontSize.xs,
                        color: colors.success[600],
                        fontWeight: typography.fontWeight.medium,
                        display: 'flex',
                        alignItems: 'center',
                        gap: spacing[1],
                      }}
                    >
                      <Icons.Check size={12} />
                      Viewed
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Offers Section */}
        <div
          style={{
            backgroundColor: colors.neutral[0],
            borderRadius: borderRadius.lg,
            padding: spacing[4],
            boxShadow: shadows.sm,
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[3], marginBottom: spacing[4] }}>
            <h2
              style={{
                fontSize: typography.fontSize.lg,
                fontWeight: typography.fontWeight.semibold,
                color: colors.text.primary,
                margin: 0,
              }}
            >
              Offers ({rfq.offers.length})
            </h2>
            {rfq.offers.length > 0 && (
              <button
                onClick={() => navigate(`/rfqs/${rfq.id}/offers`)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: spacing[2],
                  padding: `${spacing[3]} ${spacing[4]}`,
                  backgroundColor: colors.primary[600],
                  color: colors.text.inverse,
                  border: 'none',
                  borderRadius: borderRadius.lg,
                  fontSize: typography.fontSize.sm,
                  fontWeight: typography.fontWeight.medium,
                  cursor: 'pointer',
                  width: '100%',
                }}
              >
                <Icons.GitCompare size={18} />
                Compare Offers
              </button>
            )}
          </div>

          {rfq.offers.length === 0 ? (
            <div style={{ textAlign: 'center', padding: spacing[6] }}>
              <Icons.Mail size={40} color={colors.text.tertiary} style={{ margin: '0 auto', marginBottom: spacing[3] }} />
              <p style={{ fontSize: typography.fontSize.sm, color: colors.text.tertiary, margin: 0 }}>
                No offers received yet
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[3] }}>
              {rfq.offers.map((offer) => (
                <div
                  key={offer.id}
                  style={{
                    padding: spacing[4],
                    backgroundColor: colors.primary[50],
                    borderRadius: borderRadius.lg,
                    border: `1px solid ${colors.primary[200]}`,
                  }}
                >
                  {/* Supplier name and price */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing[3] }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h4
                        style={{
                          fontSize: typography.fontSize.base,
                          fontWeight: typography.fontWeight.semibold,
                          color: colors.text.primary,
                          margin: 0,
                          marginBottom: spacing[1],
                        }}
                      >
                        {offer.business_name_en || offer.business_name_ka || offer.business_name}
                      </h4>
                      <span style={{ fontSize: typography.fontSize.xs, color: colors.text.tertiary }}>
                        {formatDate(offer.created_at)}
                      </span>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: spacing[2] }}>
                      <p
                        style={{
                          fontSize: typography.fontSize.xl,
                          fontWeight: typography.fontWeight.bold,
                          color: colors.primary[700],
                          margin: 0,
                        }}
                      >
                        ₾{offer.total_amount}
                      </p>
                      {offer.delivery_fee > 0 && (
                        <p
                          style={{
                            fontSize: typography.fontSize.xs,
                            color: colors.text.secondary,
                            margin: 0,
                          }}
                        >
                          + ₾{offer.delivery_fee} delivery
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Delivery/Payment Info */}
                  <div
                    className="rfq-offer-info-grid"
                    style={{
                      padding: spacing[3],
                      backgroundColor: colors.neutral[0],
                      borderRadius: borderRadius.md,
                      marginBottom: spacing[3],
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: typography.fontSize.xs,
                          color: colors.text.tertiary,
                          marginBottom: spacing[1],
                          textTransform: 'uppercase',
                          fontWeight: typography.fontWeight.semibold,
                        }}
                      >
                        Delivery
                      </div>
                      <div style={{ fontSize: typography.fontSize.sm, color: colors.text.primary }}>
                        {offer.delivery_window_start
                          ? formatDateTime(offer.delivery_window_start)
                          : 'Not specified'}
                      </div>
                    </div>
                    <div>
                      <div
                        style={{
                          fontSize: typography.fontSize.xs,
                          color: colors.text.tertiary,
                          marginBottom: spacing[1],
                          textTransform: 'uppercase',
                          fontWeight: typography.fontWeight.semibold,
                        }}
                      >
                        Payment
                      </div>
                      <div style={{ fontSize: typography.fontSize.sm, color: colors.text.primary }}>
                        {offer.payment_terms === 'cod'
                          ? 'Cash on Delivery'
                          : offer.payment_terms === 'net_7'
                          ? 'Bank Transfer'
                          : offer.payment_terms === 'net_15'
                          ? 'Net 15'
                          : 'Prepayment'}
                      </div>
                    </div>
                  </div>

                  {offer.notes && (
                    <p
                      style={{
                        fontSize: typography.fontSize.sm,
                        color: colors.text.secondary,
                        margin: 0,
                        marginBottom: spacing[3],
                        padding: spacing[3],
                        backgroundColor: colors.neutral[0],
                        borderRadius: borderRadius.md,
                      }}
                    >
                      {offer.notes}
                    </p>
                  )}

                  {/* Action Buttons */}
                  {offer.status === 'pending' && (
                    <div className="rfq-action-buttons">
                      <button
                        onClick={() => {
                          setSelectedOfferId(offer.id);
                          setShowAcceptModal(true);
                        }}
                        style={{
                          flex: 1,
                          padding: spacing[3],
                          backgroundColor: colors.success[600],
                          color: colors.neutral[0],
                          border: 'none',
                          borderRadius: borderRadius.md,
                          fontSize: typography.fontSize.sm,
                          fontWeight: typography.fontWeight.semibold,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: spacing[2],
                        }}
                      >
                        <Icons.CheckCircle size={18} />
                        Accept
                      </button>
                      <button
                        onClick={() => {
                          setSelectedOfferId(offer.id);
                          setShowDeclineModal(true);
                        }}
                        style={{
                          flex: 1,
                          padding: spacing[3],
                          backgroundColor: colors.neutral[0],
                          color: colors.error[600],
                          border: `2px solid ${colors.error[300]}`,
                          borderRadius: borderRadius.md,
                          fontSize: typography.fontSize.sm,
                          fontWeight: typography.fontWeight.semibold,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: spacing[2],
                        }}
                      >
                        <Icons.XCircle size={18} />
                        Decline
                      </button>
                    </div>
                  )}

                  {/* Status Badge */}
                  {offer.status !== 'pending' && (
                    <div
                      style={{
                        padding: spacing[2],
                        backgroundColor:
                          offer.status === 'accepted'
                            ? colors.success[100]
                            : offer.status === 'rejected'
                            ? colors.error[100]
                            : colors.neutral[100],
                        borderRadius: borderRadius.md,
                        textAlign: 'center',
                      }}
                    >
                      <span
                        style={{
                          fontSize: typography.fontSize.sm,
                          fontWeight: typography.fontWeight.semibold,
                          color:
                            offer.status === 'accepted'
                              ? colors.success[700]
                              : offer.status === 'rejected'
                              ? colors.error[700]
                              : colors.text.secondary,
                          textTransform: 'capitalize',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: spacing[2],
                        }}
                      >
                        {offer.status === 'accepted' && <Icons.CheckCircle size={16} />}
                        {offer.status === 'rejected' && <Icons.XCircle size={16} />}
                        {offer.status}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Accept Modal */}
      {showAcceptModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            zIndex: 1000,
            padding: spacing[3],
          }}
          onClick={() => setShowAcceptModal(false)}
        >
          <div
            style={{
              backgroundColor: colors.neutral[0],
              borderRadius: `${borderRadius.xl} ${borderRadius.xl} 0 0`,
              padding: spacing[4],
              width: '100%',
              maxWidth: '500px',
              maxHeight: '90vh',
              overflow: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: spacing[3], marginBottom: spacing[3] }}>
              <Icons.CheckCircle size={28} color={colors.success[600]} />
              <h2
                style={{
                  fontSize: typography.fontSize.lg,
                  fontWeight: typography.fontWeight.bold,
                  color: colors.text.primary,
                  margin: 0,
                }}
              >
                Accept Offer
              </h2>
            </div>
            <p
              style={{
                fontSize: typography.fontSize.sm,
                color: colors.text.secondary,
                marginBottom: spacing[4],
                margin: 0,
                marginBottom: spacing[4],
              }}
            >
              This will create an order and close the RFQ.
            </p>
            <div className="rfq-modal-buttons">
              <button
                onClick={() => setShowAcceptModal(false)}
                disabled={actionLoading}
                style={{
                  flex: 1,
                  padding: spacing[3],
                  backgroundColor: colors.neutral[0],
                  color: colors.text.secondary,
                  border: `2px solid ${colors.border.light}`,
                  borderRadius: borderRadius.md,
                  fontSize: typography.fontSize.sm,
                  fontWeight: typography.fontWeight.semibold,
                  cursor: actionLoading ? 'not-allowed' : 'pointer',
                  opacity: actionLoading ? 0.5 : 1,
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleAcceptOffer}
                disabled={actionLoading}
                style={{
                  flex: 1,
                  padding: spacing[3],
                  backgroundColor: colors.success[600],
                  color: colors.neutral[0],
                  border: 'none',
                  borderRadius: borderRadius.md,
                  fontSize: typography.fontSize.sm,
                  fontWeight: typography.fontWeight.semibold,
                  cursor: actionLoading ? 'not-allowed' : 'pointer',
                  opacity: actionLoading ? 0.7 : 1,
                }}
              >
                {actionLoading ? 'Processing...' : 'Accept Offer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Decline Modal */}
      {showDeclineModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            zIndex: 1000,
            padding: spacing[3],
          }}
          onClick={() => {
            setShowDeclineModal(false);
            setDeclineReason('');
          }}
        >
          <div
            style={{
              backgroundColor: colors.neutral[0],
              borderRadius: `${borderRadius.xl} ${borderRadius.xl} 0 0`,
              padding: spacing[4],
              width: '100%',
              maxWidth: '500px',
              maxHeight: '90vh',
              overflow: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: spacing[3], marginBottom: spacing[3] }}>
              <Icons.XCircle size={28} color={colors.error[600]} />
              <h2
                style={{
                  fontSize: typography.fontSize.lg,
                  fontWeight: typography.fontWeight.bold,
                  color: colors.text.primary,
                  margin: 0,
                }}
              >
                Decline Offer
              </h2>
            </div>
            <p
              style={{
                fontSize: typography.fontSize.sm,
                color: colors.text.secondary,
                margin: 0,
                marginBottom: spacing[3],
              }}
            >
              Reason (optional):
            </p>
            <textarea
              value={declineReason}
              onChange={(e) => setDeclineReason(e.target.value)}
              placeholder="e.g., Price is too high..."
              rows={3}
              style={{
                width: '100%',
                padding: spacing[3],
                border: `1px solid ${colors.border.light}`,
                borderRadius: borderRadius.md,
                fontSize: typography.fontSize.base,
                resize: 'vertical',
                fontFamily: 'inherit',
                marginBottom: spacing[4],
                boxSizing: 'border-box',
              }}
            />
            <div className="rfq-modal-buttons">
              <button
                onClick={() => {
                  setShowDeclineModal(false);
                  setDeclineReason('');
                }}
                disabled={actionLoading}
                style={{
                  flex: 1,
                  padding: spacing[3],
                  backgroundColor: colors.neutral[0],
                  color: colors.text.secondary,
                  border: `2px solid ${colors.border.light}`,
                  borderRadius: borderRadius.md,
                  fontSize: typography.fontSize.sm,
                  fontWeight: typography.fontWeight.semibold,
                  cursor: actionLoading ? 'not-allowed' : 'pointer',
                  opacity: actionLoading ? 0.5 : 1,
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleDeclineOffer}
                disabled={actionLoading}
                style={{
                  flex: 1,
                  padding: spacing[3],
                  backgroundColor: colors.error[600],
                  color: colors.neutral[0],
                  border: 'none',
                  borderRadius: borderRadius.md,
                  fontSize: typography.fontSize.sm,
                  fontWeight: typography.fontWeight.semibold,
                  cursor: actionLoading ? 'not-allowed' : 'pointer',
                  opacity: actionLoading ? 0.7 : 1,
                }}
              >
                {actionLoading ? 'Processing...' : 'Decline'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
