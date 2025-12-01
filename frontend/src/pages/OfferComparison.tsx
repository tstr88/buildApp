/**
 * OfferComparison Page
 * Compare and accept offers for an RFQ
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { OfferCard } from '../components/offers/OfferCard';
import { Icons } from '../components/icons/Icons';
import { colors, spacing, typography, borderRadius, shadows } from '../theme/tokens';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface Offer {
  id: string;
  supplier_id: string;
  supplier_name: string;
  line_prices: any[];
  total_amount: number;
  delivery_window_start?: string;
  delivery_window_end?: string;
  payment_terms: string;
  delivery_fee: number;
  notes?: string;
  expires_at: string;
  status: string;
  spec_reliability_pct: number;
  on_time_pct: number;
  issue_rate_pct: number;
  trust_sample_size: number;
}

export default function OfferComparison() {
  const { id: rfqId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOfferId, setSelectedOfferId] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isAccepting, setIsAccepting] = useState(false);

  useEffect(() => {
    if (rfqId) {
      fetchOffers();
    }
  }, [rfqId]);

  const fetchOffers = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('buildapp_auth_token');
      const response = await fetch(`${API_URL}/api/buyers/rfqs/${rfqId}/offers`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch offers');
      }

      const data = await response.json();
      setOffers(data.data || []);
    } catch (err: any) {
      console.error('Fetch offers error:', err);
      setError(err.message || 'Failed to load offers');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = (offerId: string) => {
    setSelectedOfferId(offerId);
    setShowConfirmModal(true);
  };

  const confirmAccept = async () => {
    if (!selectedOfferId) return;

    try {
      setIsAccepting(true);

      const token = localStorage.getItem('buildapp_auth_token');
      const response = await fetch(
        `${API_URL}/api/buyers/offers/${selectedOfferId}/accept`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to accept offer');
      }

      const data = await response.json();

      // Navigate to order detail page
      const orderId = data.data.order.id;
      alert('Offer accepted successfully! Order created.');
      navigate(`/orders/${orderId}`);
    } catch (err: any) {
      console.error('Accept offer error:', err);
      alert(err.message || 'Failed to accept offer');
    } finally {
      setIsAccepting(false);
      setShowConfirmModal(false);
    }
  };

  const handleMessage = (offerId: string) => {
    // TODO: Implement messaging
    alert('Messaging feature coming soon');
  };

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          backgroundColor: colors.background.secondary,
        }}
      >
        <div
          style={{
            width: '48px',
            height: '48px',
            border: `3px solid ${colors.border.light}`,
            borderTop: `3px solid ${colors.primary[600]}`,
            borderRadius: borderRadius.full,
            animation: 'spin 1s linear infinite',
          }}
        >
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          minHeight: '100vh',
          backgroundColor: colors.background.secondary,
          padding: spacing[4],
        }}
      >
        <div
          style={{
            backgroundColor: colors.error[50],
            border: `1px solid ${colors.error}`,
            borderRadius: borderRadius.lg,
            padding: spacing[4],
            textAlign: 'center',
          }}
        >
          <div style={{ marginBottom: spacing[2], display: 'flex', justifyContent: 'center' }}>
            <Icons.AlertCircle size={32} color={colors.error} />
          </div>
          <p
            style={{
              color: colors.error[700],
              fontWeight: typography.fontWeight.medium,
              marginBottom: spacing[3],
            }}
          >
            {error}
          </p>
          <button
            onClick={() => navigate(-1)}
            style={{
              fontSize: typography.fontSize.sm,
              color: colors.error,
              textDecoration: 'underline',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Find lowest price offer
  const lowestPrice = Math.min(...offers.map((o) => parseFloat(o.total_amount.toString()) + o.delivery_fee));

  // Filter out expired offers for display
  const activeOffers = offers.filter((o) => o.status !== 'expired');
  const expiredOffers = offers.filter((o) => o.status === 'expired');

  const selectedOffer = offers.find((o) => o.id === selectedOfferId);

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: colors.background.secondary,
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
        <div style={{ padding: spacing[4] }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: spacing[2] }}>
            <button
              onClick={() => navigate(-1)}
              aria-label="Go back"
              style={{
                marginRight: spacing[3],
                padding: spacing[2],
                backgroundColor: 'transparent',
                border: 'none',
                borderRadius: borderRadius.lg,
                cursor: 'pointer',
                transition: 'background-color 200ms ease',
                display: 'flex',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = colors.neutral[100])}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <Icons.ChevronRight
                size={20}
                color={colors.text.secondary}
                style={{ transform: 'rotate(180deg)' }}
              />
            </button>
            <h1
              style={{
                fontSize: typography.fontSize.xl,
                fontWeight: typography.fontWeight.bold,
                color: colors.text.primary,
                margin: 0,
              }}
            >
              Compare Offers
            </h1>
          </div>
          <p
            style={{
              fontSize: typography.fontSize.sm,
              color: colors.text.secondary,
              margin: 0,
              marginLeft: `calc(${spacing[2]} + ${spacing[3]} + 20px)`,
            }}
          >
            {offers.length} offer{offers.length !== 1 ? 's' : ''} received
          </p>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: spacing[4] }}>
        {offers.length === 0 ? (
          <div
            style={{
              backgroundColor: colors.neutral[0],
              borderRadius: borderRadius.lg,
              border: `1px solid ${colors.border.light}`,
              padding: spacing[8],
              textAlign: 'center',
            }}
          >
            <div style={{ marginBottom: spacing[3], display: 'flex', justifyContent: 'center' }}>
              <Icons.Mail size={48} color={colors.text.tertiary} />
            </div>
            <p style={{ color: colors.text.secondary }}>No offers received yet</p>
          </div>
        ) : (
          <>
            {/* Active offers */}
            {activeOffers.length > 0 && (
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: spacing[4],
                  marginBottom: spacing[6],
                }}
              >
                {activeOffers.map((offer) => {
                  const offerTotal = parseFloat(offer.total_amount.toString()) + offer.delivery_fee;
                  const isLowestPrice = offerTotal === lowestPrice;

                  return (
                    <div key={offer.id} style={{ flex: '1 1 350px', minWidth: '300px' }}>
                      <OfferCard
                        offer={offer}
                        isLowestPrice={isLowestPrice}
                        onAccept={handleAccept}
                        onMessage={handleMessage}
                      />
                    </div>
                  );
                })}
              </div>
            )}

            {/* Expired offers */}
            {expiredOffers.length > 0 && (
              <>
                <h2
                  style={{
                    fontSize: typography.fontSize.lg,
                    fontWeight: typography.fontWeight.bold,
                    color: colors.text.secondary,
                    marginTop: spacing[6],
                    marginBottom: spacing[4],
                  }}
                >
                  Expired Offers
                </h2>
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: spacing[4],
                  }}
                >
                  {expiredOffers.map((offer) => (
                    <div key={offer.id} style={{ flex: '1 1 350px', minWidth: '300px' }}>
                      <OfferCard offer={offer} onAccept={handleAccept} />
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && selectedOffer && (
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
            padding: spacing[4],
            overflowY: 'auto',
          }}
          onClick={() => !isAccepting && setShowConfirmModal(false)}
        >
          <div
            style={{
              backgroundColor: colors.neutral[0],
              borderRadius: borderRadius.lg,
              padding: spacing[6],
              maxWidth: '500px',
              width: '100%',
              boxShadow: shadows.lg,
              margin: 'auto',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2
              style={{
                fontSize: typography.fontSize.xl,
                fontWeight: typography.fontWeight.bold,
                color: colors.text.primary,
                marginTop: 0,
                marginBottom: spacing[4],
              }}
            >
              Accept Offer?
            </h2>

            <div style={{ marginBottom: spacing[4] }}>
              <p style={{ marginBottom: spacing[2], color: colors.text.secondary }}>
                <strong>Supplier:</strong> {selectedOffer.supplier_name}
              </p>
              <p style={{ marginBottom: spacing[2], color: colors.text.secondary }}>
                <strong>Total:</strong>{' '}
                <span
                  style={{
                    fontSize: typography.fontSize.lg,
                    fontWeight: typography.fontWeight.bold,
                    color: colors.primary[600],
                  }}
                >
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'GEL',
                  }).format(parseFloat(selectedOffer.total_amount.toString()) + selectedOffer.delivery_fee)}
                </span>
              </p>
              {selectedOffer.delivery_window_start && (
                <p style={{ marginBottom: spacing[2], color: colors.text.secondary }}>
                  <strong>Delivery:</strong> {new Date(selectedOffer.delivery_window_start).toLocaleDateString()}{' '}
                  {new Date(selectedOffer.delivery_window_start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              )}
            </div>

            <p
              style={{
                fontSize: typography.fontSize.sm,
                color: colors.text.secondary,
                marginBottom: spacing[4],
              }}
            >
              You will coordinate final scheduling with the supplier. Other offers will be automatically expired.
            </p>

            <div style={{ display: 'flex', gap: spacing[3] }}>
              <button
                onClick={() => setShowConfirmModal(false)}
                disabled={isAccepting}
                style={{
                  flex: 1,
                  padding: `${spacing[3]} ${spacing[4]}`,
                  backgroundColor: colors.neutral[0],
                  color: colors.text.primary,
                  border: `1px solid ${colors.border.light}`,
                  borderRadius: borderRadius.lg,
                  fontSize: typography.fontSize.base,
                  fontWeight: typography.fontWeight.medium,
                  cursor: isAccepting ? 'not-allowed' : 'pointer',
                  opacity: isAccepting ? 0.5 : 1,
                }}
              >
                Cancel
              </button>
              <button
                onClick={confirmAccept}
                disabled={isAccepting}
                style={{
                  flex: 1,
                  padding: `${spacing[3]} ${spacing[4]}`,
                  backgroundColor: colors.primary[600],
                  color: colors.text.inverse,
                  border: 'none',
                  borderRadius: borderRadius.lg,
                  fontSize: typography.fontSize.base,
                  fontWeight: typography.fontWeight.medium,
                  cursor: isAccepting ? 'not-allowed' : 'pointer',
                  opacity: isAccepting ? 0.7 : 1,
                }}
              >
                {isAccepting ? 'Accepting...' : 'Confirm Accept'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
