/**
 * RFQ Detail Page
 * Shows full RFQ information with offers
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
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return 'Not specified';
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
        fetchRFQDetail(); // Refresh to show updated status
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
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <Icons.Loader size={48} color={colors.text.tertiary} style={{ margin: '0 auto', marginBottom: spacing[4] }} />
          <p style={{ fontSize: typography.fontSize.base, color: colors.text.tertiary }}>
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
        }}
      >
        <p style={{ fontSize: typography.fontSize.base, color: colors.text.tertiary }}>
          RFQ not found
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: colors.neutral[50],
        padding: spacing[6],
      }}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <button
          onClick={() => navigate('/rfqs')}
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
          Back to RFQs
        </button>

        {/* Title Section */}
        <div style={{ marginBottom: spacing[6] }}>
          <h1
            style={{
              fontSize: typography.fontSize['3xl'],
              fontWeight: typography.fontWeight.bold,
              color: colors.text.primary,
              margin: 0,
              marginBottom: spacing[2],
            }}
          >
            {rfq.title || `RFQ - ${formatDate(rfq.created_at)}`}
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing[4] }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2] }}>
              <Icons.MapPin size={18} color={colors.text.tertiary} />
              <span style={{ fontSize: typography.fontSize.base, color: colors.text.secondary }}>
                {rfq.project_name}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2] }}>
              <Icons.Calendar size={18} color={colors.text.tertiary} />
              <span style={{ fontSize: typography.fontSize.base, color: colors.text.secondary }}>
                Created {formatDate(rfq.created_at)}
              </span>
            </div>
          </div>
        </div>

        {/* Project Location Map */}
        {rfq.project_latitude && rfq.project_longitude && (
          <div
            style={{
              backgroundColor: colors.neutral[0],
              borderRadius: borderRadius.lg,
              overflow: 'hidden',
              marginBottom: spacing[6],
              boxShadow: shadows.sm,
              height: '300px',
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

        {/* Line Items */}
        <div
          style={{
            backgroundColor: colors.neutral[0],
            borderRadius: borderRadius.lg,
            padding: spacing[6],
            marginBottom: spacing[6],
            boxShadow: shadows.sm,
          }}
        >
          <h2
            style={{
              fontSize: typography.fontSize.xl,
              fontWeight: typography.fontWeight.semibold,
              color: colors.text.primary,
              margin: 0,
              marginBottom: spacing[4],
            }}
          >
            Line Items
          </h2>
          <div
            style={{
              border: `1px solid ${colors.border.light}`,
              borderRadius: borderRadius.md,
              overflow: 'hidden',
            }}
          >
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: colors.neutral[50] }}>
                  <th
                    style={{
                      padding: spacing[3],
                      textAlign: 'left',
                      fontSize: typography.fontSize.xs,
                      fontWeight: typography.fontWeight.semibold,
                      color: colors.text.secondary,
                      textTransform: 'uppercase',
                    }}
                  >
                    Description
                  </th>
                  <th
                    style={{
                      padding: spacing[3],
                      textAlign: 'right',
                      fontSize: typography.fontSize.xs,
                      fontWeight: typography.fontWeight.semibold,
                      color: colors.text.secondary,
                      textTransform: 'uppercase',
                    }}
                  >
                    Quantity
                  </th>
                  <th
                    style={{
                      padding: spacing[3],
                      textAlign: 'left',
                      fontSize: typography.fontSize.xs,
                      fontWeight: typography.fontWeight.semibold,
                      color: colors.text.secondary,
                      textTransform: 'uppercase',
                    }}
                  >
                    Unit
                  </th>
                  <th
                    style={{
                      padding: spacing[3],
                      textAlign: 'left',
                      fontSize: typography.fontSize.xs,
                      fontWeight: typography.fontWeight.semibold,
                      color: colors.text.secondary,
                      textTransform: 'uppercase',
                    }}
                  >
                    Notes
                  </th>
                </tr>
              </thead>
              <tbody>
                {rfq.lines.map((line, index) => (
                  <tr
                    key={index}
                    style={{
                      borderTop: index > 0 ? `1px solid ${colors.border.light}` : 'none',
                    }}
                  >
                    <td
                      style={{
                        padding: spacing[3],
                        fontSize: typography.fontSize.sm,
                        color: colors.text.primary,
                      }}
                    >
                      {line.description}
                    </td>
                    <td
                      style={{
                        padding: spacing[3],
                        textAlign: 'right',
                        fontSize: typography.fontSize.sm,
                        color: colors.text.primary,
                        fontWeight: typography.fontWeight.medium,
                      }}
                    >
                      {line.quantity}
                    </td>
                    <td
                      style={{
                        padding: spacing[3],
                        fontSize: typography.fontSize.sm,
                        color: colors.text.secondary,
                      }}
                    >
                      {line.unit}
                    </td>
                    <td
                      style={{
                        padding: spacing[3],
                        fontSize: typography.fontSize.sm,
                        color: colors.text.tertiary,
                      }}
                    >
                      {line.spec_notes || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Delivery Window & Notes */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: spacing[6],
            marginBottom: spacing[6],
          }}
        >
          {/* Delivery Window */}
          <div
            style={{
              backgroundColor: colors.neutral[0],
              borderRadius: borderRadius.lg,
              padding: spacing[6],
              boxShadow: shadows.sm,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2], marginBottom: spacing[4] }}>
              <Icons.Calendar size={20} color={colors.primary[600]} />
              <h3
                style={{
                  fontSize: typography.fontSize.lg,
                  fontWeight: typography.fontWeight.semibold,
                  color: colors.text.primary,
                  margin: 0,
                }}
              >
                Delivery Window
              </h3>
            </div>
            {rfq.preferred_window_start && rfq.preferred_window_end ? (
              <div>
                <p
                  style={{
                    fontSize: typography.fontSize.sm,
                    color: colors.text.secondary,
                    margin: 0,
                    marginBottom: spacing[2],
                  }}
                >
                  {formatDateTime(rfq.preferred_window_start)} - {formatDateTime(rfq.preferred_window_end)}
                </p>
              </div>
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
              padding: spacing[6],
              boxShadow: shadows.sm,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2], marginBottom: spacing[4] }}>
              <Icons.FileText size={20} color={colors.primary[600]} />
              <h3
                style={{
                  fontSize: typography.fontSize.lg,
                  fontWeight: typography.fontWeight.semibold,
                  color: colors.text.primary,
                  margin: 0,
                }}
              >
                Additional Notes
              </h3>
            </div>
            <p
              style={{
                fontSize: typography.fontSize.sm,
                color: rfq.additional_notes ? colors.text.primary : colors.text.tertiary,
                margin: 0,
              }}
            >
              {rfq.additional_notes || 'No additional notes provided'}
            </p>
          </div>
        </div>

        {/* Suppliers Sent To */}
        <div
          style={{
            backgroundColor: colors.neutral[0],
            borderRadius: borderRadius.lg,
            padding: spacing[6],
            marginBottom: spacing[6],
            boxShadow: shadows.sm,
          }}
        >
          <h2
            style={{
              fontSize: typography.fontSize.xl,
              fontWeight: typography.fontWeight.semibold,
              color: colors.text.primary,
              margin: 0,
              marginBottom: spacing[4],
            }}
          >
            Suppliers ({rfq.recipients.length})
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[3] }}>
            {rfq.recipients.map((recipient) => (
              <div
                key={recipient.id}
                style={{
                  padding: spacing[4],
                  backgroundColor: colors.neutral[50],
                  borderRadius: borderRadius.md,
                  border: `1px solid ${colors.border.light}`,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <h4
                      style={{
                        fontSize: typography.fontSize.base,
                        fontWeight: typography.fontWeight.semibold,
                        color: colors.text.primary,
                        margin: 0,
                        marginBottom: spacing[1],
                      }}
                    >
                      {recipient.business_name_en || recipient.business_name_ka || recipient.business_name}
                    </h4>
                    <div style={{ display: 'flex', alignItems: 'center', gap: spacing[4] }}>
                      <span style={{ fontSize: typography.fontSize.sm, color: colors.text.tertiary }}>
                        Sent {formatDate(recipient.notified_at)}
                      </span>
                      {recipient.viewed_at && (
                        <span
                          style={{
                            fontSize: typography.fontSize.sm,
                            color: colors.success[600],
                            fontWeight: typography.fontWeight.medium,
                          }}
                        >
                          ✓ Viewed {formatDate(recipient.viewed_at)}
                        </span>
                      )}
                    </div>
                  </div>
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
            padding: spacing[6],
            boxShadow: shadows.sm,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing[4] }}>
            <h2
              style={{
                fontSize: typography.fontSize.xl,
                fontWeight: typography.fontWeight.semibold,
                color: colors.text.primary,
                margin: 0,
              }}
            >
              Offers Received ({rfq.offers.length})
            </h2>
            {rfq.offers.length > 0 && (
              <button
                onClick={() => navigate(`/rfqs/${rfq.id}/offers`)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: spacing[2],
                  padding: `${spacing[3]} ${spacing[4]}`,
                  backgroundColor: colors.primary[600],
                  color: colors.text.inverse,
                  border: 'none',
                  borderRadius: borderRadius.lg,
                  fontSize: typography.fontSize.base,
                  fontWeight: typography.fontWeight.medium,
                  cursor: 'pointer',
                  transition: 'background-color 200ms ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = colors.primary[700])}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = colors.primary[600])}
              >
                <Icons.GitCompare size={18} />
                Compare Offers
              </button>
            )}
          </div>
          {rfq.offers.length === 0 ? (
            <div style={{ textAlign: 'center', padding: spacing[8] }}>
              <Icons.Mail size={48} color={colors.text.tertiary} style={{ margin: '0 auto', marginBottom: spacing[3] }} />
              <p style={{ fontSize: typography.fontSize.base, color: colors.text.tertiary }}>
                No offers received yet
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[4] }}>
              {rfq.offers.map((offer) => (
                <div
                  key={offer.id}
                  style={{
                    padding: spacing[6],
                    backgroundColor: colors.primary[50],
                    borderRadius: borderRadius.lg,
                    border: `1px solid ${colors.primary[200]}`,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: spacing[4] }}>
                    <div>
                      <h4
                        style={{
                          fontSize: typography.fontSize.lg,
                          fontWeight: typography.fontWeight.semibold,
                          color: colors.text.primary,
                          margin: 0,
                          marginBottom: spacing[1],
                        }}
                      >
                        {offer.business_name_en || offer.business_name_ka || offer.business_name}
                      </h4>
                      <span style={{ fontSize: typography.fontSize.sm, color: colors.text.tertiary }}>
                        Received {formatDate(offer.created_at)}
                      </span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p
                        style={{
                          fontSize: typography.fontSize['2xl'],
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
                            fontSize: typography.fontSize.sm,
                            color: colors.text.secondary,
                            margin: 0,
                          }}
                        >
                          + ₾{offer.delivery_fee} delivery
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Delivery/Pickup Information */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: spacing[4],
                    marginBottom: spacing[3],
                    padding: spacing[3],
                    backgroundColor: colors.neutral[0],
                    borderRadius: borderRadius.md,
                  }}>
                    <div>
                      <div style={{
                        fontSize: typography.fontSize.xs,
                        color: colors.text.tertiary,
                        marginBottom: spacing[1],
                        textTransform: 'uppercase',
                        fontWeight: typography.fontWeight.semibold,
                      }}>
                        Delivery Window
                      </div>
                      <div style={{ fontSize: typography.fontSize.sm, color: colors.text.primary }}>
                        {offer.delivery_window_start && offer.delivery_window_end ? (
                          <>
                            {formatDateTime(offer.delivery_window_start)} - {formatDateTime(offer.delivery_window_end)}
                          </>
                        ) : (
                          'Not specified'
                        )}
                      </div>
                    </div>
                    <div>
                      <div style={{
                        fontSize: typography.fontSize.xs,
                        color: colors.text.tertiary,
                        marginBottom: spacing[1],
                        textTransform: 'uppercase',
                        fontWeight: typography.fontWeight.semibold,
                      }}>
                        Payment Terms
                      </div>
                      <div style={{ fontSize: typography.fontSize.sm, color: colors.text.primary }}>
                        {offer.payment_terms === 'cod' ? 'Cash on Delivery' :
                         offer.payment_terms === 'net_7' ? 'Bank Transfer 50/50' :
                         offer.payment_terms === 'net_15' ? 'Net 15' :
                         'Full Prepayment'}
                      </div>
                    </div>
                  </div>
                  {offer.notes && (
                    <p
                      style={{
                        fontSize: typography.fontSize.sm,
                        color: colors.text.secondary,
                        margin: 0,
                        marginTop: spacing[3],
                        padding: spacing[3],
                        backgroundColor: colors.neutral[0],
                        borderRadius: borderRadius.md,
                      }}
                    >
                      {offer.notes}
                    </p>
                  )}

                  {/* Action Buttons - Only show for pending offers */}
                  {offer.status === 'pending' && (
                    <div
                      style={{
                        display: 'flex',
                        gap: spacing[3],
                        marginTop: spacing[4],
                        paddingTop: spacing[4],
                        borderTop: `1px solid ${colors.border.light}`,
                      }}
                    >
                      <button
                        onClick={() => {
                          setSelectedOfferId(offer.id);
                          setShowAcceptModal(true);
                        }}
                        style={{
                          flex: 1,
                          padding: `${spacing[3]} ${spacing[5]}`,
                          backgroundColor: colors.success[600],
                          color: colors.neutral[0],
                          border: 'none',
                          borderRadius: borderRadius.md,
                          fontSize: typography.fontSize.base,
                          fontWeight: typography.fontWeight.semibold,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: spacing[2],
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = colors.success[700];
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = colors.success[600];
                        }}
                      >
                        <Icons.CheckCircle size={20} />
                        Accept Offer
                      </button>
                      <button
                        onClick={() => {
                          setSelectedOfferId(offer.id);
                          setShowDeclineModal(true);
                        }}
                        style={{
                          flex: 1,
                          padding: `${spacing[3]} ${spacing[5]}`,
                          backgroundColor: colors.neutral[0],
                          color: colors.error[600],
                          border: `2px solid ${colors.error[600]}`,
                          borderRadius: borderRadius.md,
                          fontSize: typography.fontSize.base,
                          fontWeight: typography.fontWeight.semibold,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: spacing[2],
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = colors.error[50];
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = colors.neutral[0];
                        }}
                      >
                        <Icons.XCircle size={20} />
                        Decline
                      </button>
                    </div>
                  )}

                  {/* Status Badge - Show for non-pending offers */}
                  {offer.status !== 'pending' && (
                    <div
                      style={{
                        marginTop: spacing[4],
                        padding: spacing[3],
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
                        }}
                      >
                        {offer.status === 'accepted' && <Icons.CheckCircle size={16} style={{ display: 'inline', marginRight: spacing[2] }} />}
                        {offer.status === 'rejected' && <Icons.XCircle size={16} style={{ display: 'inline', marginRight: spacing[2] }} />}
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

      {/* Accept Offer Modal */}
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
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={() => setShowAcceptModal(false)}
        >
          <div
            style={{
              backgroundColor: colors.neutral[0],
              borderRadius: borderRadius.lg,
              padding: spacing[6],
              maxWidth: '500px',
              width: '90%',
              boxShadow: shadows.xl,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: spacing[3], marginBottom: spacing[4] }}>
              <Icons.CheckCircle size={32} color={colors.success[600]} />
              <h2
                style={{
                  fontSize: typography.fontSize.xl,
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
                fontSize: typography.fontSize.base,
                color: colors.text.secondary,
                marginBottom: spacing[6],
              }}
            >
              Are you sure you want to accept this offer? This will create an order and close the RFQ.
            </p>
            <div style={{ display: 'flex', gap: spacing[3] }}>
              <button
                onClick={() => setShowAcceptModal(false)}
                disabled={actionLoading}
                style={{
                  flex: 1,
                  padding: `${spacing[3]} ${spacing[4]}`,
                  backgroundColor: colors.neutral[0],
                  color: colors.text.secondary,
                  border: `2px solid ${colors.border.light}`,
                  borderRadius: borderRadius.md,
                  fontSize: typography.fontSize.base,
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
                  padding: `${spacing[3]} ${spacing[4]}`,
                  backgroundColor: colors.success[600],
                  color: colors.neutral[0],
                  border: 'none',
                  borderRadius: borderRadius.md,
                  fontSize: typography.fontSize.base,
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

      {/* Decline Offer Modal */}
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
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={() => {
            setShowDeclineModal(false);
            setDeclineReason('');
          }}
        >
          <div
            style={{
              backgroundColor: colors.neutral[0],
              borderRadius: borderRadius.lg,
              padding: spacing[6],
              maxWidth: '500px',
              width: '90%',
              boxShadow: shadows.xl,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: spacing[3], marginBottom: spacing[4] }}>
              <Icons.XCircle size={32} color={colors.error[600]} />
              <h2
                style={{
                  fontSize: typography.fontSize.xl,
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
                fontSize: typography.fontSize.base,
                color: colors.text.secondary,
                marginBottom: spacing[4],
              }}
            >
              Please provide a reason for declining this offer (optional):
            </p>
            <textarea
              value={declineReason}
              onChange={(e) => setDeclineReason(e.target.value)}
              placeholder="e.g., Price is too high, delivery window doesn't work..."
              rows={4}
              style={{
                width: '100%',
                padding: spacing[3],
                border: `1px solid ${colors.border.light}`,
                borderRadius: borderRadius.md,
                fontSize: typography.fontSize.base,
                resize: 'vertical',
                fontFamily: 'inherit',
                marginBottom: spacing[6],
              }}
            />
            <div style={{ display: 'flex', gap: spacing[3] }}>
              <button
                onClick={() => {
                  setShowDeclineModal(false);
                  setDeclineReason('');
                }}
                disabled={actionLoading}
                style={{
                  flex: 1,
                  padding: `${spacing[3]} ${spacing[4]}`,
                  backgroundColor: colors.neutral[0],
                  color: colors.text.secondary,
                  border: `2px solid ${colors.border.light}`,
                  borderRadius: borderRadius.md,
                  fontSize: typography.fontSize.base,
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
                  padding: `${spacing[3]} ${spacing[4]}`,
                  backgroundColor: colors.error[600],
                  color: colors.neutral[0],
                  border: 'none',
                  borderRadius: borderRadius.md,
                  fontSize: typography.fontSize.base,
                  fontWeight: typography.fontWeight.semibold,
                  cursor: actionLoading ? 'not-allowed' : 'pointer',
                  opacity: actionLoading ? 0.7 : 1,
                }}
              >
                {actionLoading ? 'Processing...' : 'Decline Offer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
