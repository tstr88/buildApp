/**
 * Supplier RFQ Detail
 * View RFQ details and submit offer
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import * as Icons from 'lucide-react';
import { colors, spacing, typography, borderRadius, shadows } from '../theme/tokens';

const API_URL = import.meta.env.VITE_API_URL || '${API_URL}';

interface RFQLine {
  index: number;
  description: string;
  quantity: number;
  unit: string;
  spec_notes?: string;
}

interface ExistingOffer {
  id: string;
  line_prices: Array<{
    line_index: number;
    unit_price: number;
    total_price: number;
    notes?: string;
  }>;
  total_amount: number;
  delivery_window_start: string;
  delivery_window_end: string;
  payment_terms: string;
  delivery_fee: number;
  notes?: string;
  expires_at: string;
  status: string;
  created_at: string;
  version_number?: number;
  superseded_at?: string;
}

interface RFQDetail {
  id: string;
  buyer_type: 'homeowner' | 'contractor';
  buyer_name: string;
  is_new_buyer: boolean;
  project_location: string;
  project_address: string;
  delivery_lat: number;
  delivery_lng: number;
  distance_km: number;
  lines: RFQLine[];
  preferred_window_start: string;
  preferred_window_end: string;
  additional_notes?: string;
  access_notes?: string;
  created_at: string;
  has_existing_offer: boolean;
  existing_offer?: ExistingOffer | null;
}

interface LinePrice {
  line_index: number;
  unit_price: string;
  notes: string;
  subtotal_input?: string; // Track raw subtotal input
}

type PaymentTerm = 'cod' | 'net_7' | 'advance_100';

export function SupplierRFQDetail() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { rfqId } = useParams<{ rfqId: string }>();

  const [rfq, setRfq] = useState<RFQDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isEditingOffer, setIsEditingOffer] = useState(false);
  const [offerHistory, setOfferHistory] = useState<ExistingOffer[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  // Offer form state
  const [linePrices, setLinePrices] = useState<LinePrice[]>([]);
  const [deliveryDate, setDeliveryDate] = useState('');
  const [deliveryTime, setDeliveryTime] = useState('09:00');
  const [paymentTerm, setPaymentTerm] = useState<PaymentTerm>('cod');
  const [deliveryFee, setDeliveryFee] = useState('');
  const [offerNotes, setOfferNotes] = useState('');
  const [offerExpiry, setOfferExpiry] = useState('48h');
  const [error, setError] = useState('');

  useEffect(() => {
    if (rfqId) {
      fetchRFQDetail();
    }
  }, [rfqId]);

  const fetchRFQDetail = async () => {
    try {
      const token = localStorage.getItem('buildapp_auth_token');
      const response = await fetch(`${API_URL}/api/suppliers/rfqs/${rfqId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
        },
        cache: 'no-store',
      });

      if (response.ok) {
        const data = await response.json();
        setRfq(data.rfq);

        // Initialize line prices - add index to each line if not present
        const linesWithIndex = data.rfq.lines.map((line: any, idx: number) => ({
          ...line,
          index: line.index !== undefined ? line.index : idx,
        }));

        const initialPrices = linesWithIndex.map((line: RFQLine) => ({
          line_index: line.index,
          unit_price: '',
          notes: '',
        }));
        setLinePrices(initialPrices);

        // Update rfq with indexed lines
        setRfq({ ...data.rfq, lines: linesWithIndex });

        // Set default delivery date to preferred window start
        if (data.rfq.preferred_window_start) {
          setDeliveryDate(data.rfq.preferred_window_start.split('T')[0]);
        }
      } else {
        setError('Failed to load RFQ');
      }
    } catch (err) {
      console.error('Failed to fetch RFQ:', err);
      setError('Failed to load RFQ');
    } finally {
      setLoading(false);
    }
  };

  const fetchOfferHistory = async () => {
    try {
      const token = localStorage.getItem('buildapp_auth_token');
      const response = await fetch(`${API_URL}/api/suppliers/rfqs/${rfqId}/offer-history`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setOfferHistory(data.history || []);
      }
    } catch (err) {
      console.error('Failed to fetch offer history:', err);
    }
  };

  const handleEditOffer = () => {
    if (rfq?.existing_offer) {
      // Load existing offer data into form
      const offer = rfq.existing_offer;

      // Set line prices from existing offer
      const prices: LinePrice[] = offer.line_prices.map((lp) => ({
        line_index: lp.line_index,
        unit_price: lp.unit_price.toString(),
        notes: lp.notes || '',
      }));
      setLinePrices(prices);

      // Set delivery date and time from existing offer
      if (offer.delivery_window_start) {
        const dateTime = new Date(offer.delivery_window_start);
        setDeliveryDate(offer.delivery_window_start.split('T')[0]);
        const hours = dateTime.getHours().toString().padStart(2, '0');
        const minutes = dateTime.getMinutes().toString().padStart(2, '0');
        setDeliveryTime(`${hours}:${minutes}`);
      }

      // Set payment term and delivery fee
      setPaymentTerm(offer.payment_terms as PaymentTerm);
      setDeliveryFee(offer.delivery_fee.toString());
      setOfferNotes(offer.notes || '');

      // Fetch offer history
      fetchOfferHistory();

      // Switch to edit mode
      setIsEditingOffer(true);
    }
  };

  const handleCancelEdit = () => {
    setIsEditingOffer(false);
    // Reset form to initial state
    if (rfq) {
      const initialPrices = rfq.lines.map((line: RFQLine) => ({
        line_index: line.index,
        unit_price: '',
        notes: '',
      }));
      setLinePrices(initialPrices);
      setDeliveryFee('');
      setOfferNotes('');
    }
  };

  const handlePriceChange = (lineIndex: number, price: string) => {
    setLinePrices((prev) =>
      prev.map((lp) => (lp.line_index === lineIndex ? { ...lp, unit_price: price, subtotal_input: undefined } : lp))
    );
  };

  const handleTotalChange = (lineIndex: number, total: string) => {
    const line = rfq?.lines.find((l) => l.index === lineIndex);
    if (!line || line.quantity === 0) return;

    // Store the raw input value
    setLinePrices((prev) =>
      prev.map((lp) => (lp.line_index === lineIndex ? { ...lp, subtotal_input: total } : lp))
    );

    // Only calculate unit price if input is a valid number
    const totalPrice = parseFloat(total);
    if (total === '' || isNaN(totalPrice)) {
      // Clear unit price if total is empty or invalid
      setLinePrices((prev) =>
        prev.map((lp) => (lp.line_index === lineIndex ? { ...lp, unit_price: '', subtotal_input: total } : lp))
      );
      return;
    }

    if (totalPrice < 0) return; // Ignore negative values

    // Calculate unit price from total
    const unitPrice = (totalPrice / line.quantity).toFixed(2);
    setLinePrices((prev) =>
      prev.map((lp) => (lp.line_index === lineIndex ? { ...lp, unit_price: unitPrice, subtotal_input: total } : lp))
    );
  };

  const handleLineNoteChange = (lineIndex: number, notes: string) => {
    setLinePrices((prev) =>
      prev.map((lp) => (lp.line_index === lineIndex ? { ...lp, notes } : lp))
    );
  };

  const calculateLineTotal = (lineIndex: number): number => {
    const linePrice = linePrices.find((lp) => lp.line_index === lineIndex);
    const line = rfq?.lines.find((l) => l.index === lineIndex);

    if (!linePrice || !line || !linePrice.unit_price) return 0;

    const unitPrice = parseFloat(linePrice.unit_price);
    if (isNaN(unitPrice)) return 0;

    return unitPrice * line.quantity;
  };

  const calculateTotal = (): number => {
    const linesTotal = linePrices.reduce((sum, lp, idx) => sum + calculateLineTotal(idx), 0);
    const fee = deliveryFee ? parseFloat(deliveryFee) : 0;
    return linesTotal + (isNaN(fee) ? 0 : fee);
  };

  const validateOffer = (): boolean => {
    setError('');

    // Check all lines have prices
    const allPricesFilled = linePrices.every((lp) => {
      const price = parseFloat(lp.unit_price);
      return !isNaN(price) && price > 0;
    });

    if (!allPricesFilled) {
      setError('Please enter valid prices for all items');
      return false;
    }

    // Check delivery date and time
    if (!deliveryDate) {
      setError('Please select a delivery date');
      return false;
    }

    if (!deliveryTime) {
      setError('Please select a delivery time');
      return false;
    }

    return true;
  };

  const handleSendOffer = async () => {
    if (!validateOffer()) return;

    setSubmitting(true);
    try {
      const expiresAt = new Date();
      const hours = offerExpiry === '24h' ? 24 : offerExpiry === '48h' ? 48 : offerExpiry === '72h' ? 72 : 168;
      expiresAt.setHours(expiresAt.getHours() + hours);

      const token = localStorage.getItem('buildapp_auth_token');
      const response = await fetch(`${API_URL}/api/suppliers/rfqs/${rfqId}/offers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          line_prices: linePrices.map((lp) => ({
            line_index: lp.line_index,
            unit_price: parseFloat(lp.unit_price),
            total_price: calculateLineTotal(lp.line_index),
            notes: lp.notes || null,
          })),
          total_amount: calculateTotal(),
          delivery_window_start: `${deliveryDate}T${deliveryTime}:00`,
          delivery_window_end: `${deliveryDate}T${deliveryTime}:00`,
          payment_terms: paymentTerm,
          delivery_fee: deliveryFee ? parseFloat(deliveryFee) : 0,
          notes: offerNotes || null,
          expires_at: expiresAt.toISOString(),
        }),
      });

      if (response.ok) {
        if (isEditingOffer) {
          // If editing, reload the RFQ detail to show updated offer
          setIsEditingOffer(false);
          await fetchRFQDetail();
          // Scroll to the top to see the updated offer
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          // Show success and redirect to sent offers tab for new offers
          navigate('/supplier/rfqs?tab=sent');
        }
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to send offer');
      }
    } catch (err) {
      console.error('Failed to send offer:', err);
      setError('Failed to send offer');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDecline = async () => {
    if (!confirm(t('supplierRFQDetail.confirmDecline', 'Are you sure you want to decline this RFQ?'))) {
      return;
    }

    try {
      const token = localStorage.getItem('buildapp_auth_token');
      const response = await fetch(`${API_URL}/api/suppliers/rfqs/${rfqId}/decline`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        navigate('/supplier/rfqs');
      }
    } catch (err) {
      console.error('Failed to decline RFQ:', err);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div style={{ color: colors.text.tertiary }}>{t('common.loading')}</div>
      </div>
    );
  }

  if (!rfq) {
    return (
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: spacing[6] }}>
        <div style={{ textAlign: 'center', padding: spacing[8] }}>
          <div style={{ fontSize: typography.fontSize.lg, color: colors.text.primary, marginBottom: spacing[2] }}>
            {t('supplierRFQDetail.notFound', 'RFQ not found')}
          </div>
          <button
            onClick={() => navigate('/supplier/rfqs')}
            style={{
              padding: `${spacing[2]} ${spacing[4]}`,
              backgroundColor: colors.primary[600],
              color: colors.neutral[0],
              border: 'none',
              borderRadius: borderRadius.md,
              cursor: 'pointer',
            }}
          >
            {t('common.backToInbox', 'Back to Inbox')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: spacing[6] }}>
      {/* Header */}
      <div style={{ marginBottom: spacing[5] }}>
        <button
          onClick={() => navigate('/supplier/rfqs')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: spacing[2],
            padding: spacing[2],
            backgroundColor: 'transparent',
            border: 'none',
            color: colors.text.secondary,
            fontSize: typography.fontSize.sm,
            cursor: 'pointer',
            marginBottom: spacing[3],
          }}
        >
          <Icons.ArrowLeft size={16} />
          {t('common.backToInbox', 'Back to Inbox')}
        </button>

        <h1
          style={{
            fontSize: typography.fontSize['2xl'],
            fontWeight: typography.fontWeight.bold,
            color: colors.text.primary,
            margin: 0,
            marginBottom: spacing[2],
          }}
        >
          {t('supplierRFQDetail.title', 'RFQ')} #{rfq.id.slice(0, 8)}
        </h1>
      </div>

      {/* Error Message */}
      {error && (
        <div
          style={{
            padding: spacing[3],
            backgroundColor: colors.error[50],
            border: `1px solid ${colors.error[500]}`,
            borderRadius: borderRadius.md,
            marginBottom: spacing[4],
            display: 'flex',
            alignItems: 'center',
            gap: spacing[2],
          }}
        >
          <Icons.AlertCircle size={20} color={colors.error[500]} />
          <span style={{ fontSize: typography.fontSize.sm, color: colors.error[700] }}>{error}</span>
        </div>
      )}

      {/* Buyer Context */}
      <div
        style={{
          backgroundColor: colors.neutral[0],
          padding: spacing[5],
          borderRadius: borderRadius.lg,
          border: `1px solid ${colors.border.light}`,
          marginBottom: spacing[4],
        }}
      >
        <h2
          style={{
            fontSize: typography.fontSize.lg,
            fontWeight: typography.fontWeight.semibold,
            color: colors.text.primary,
            margin: 0,
            marginBottom: spacing[4],
          }}
        >
          {t('supplierRFQDetail.buyerContext', 'Buyer Information')}
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: spacing[4] }}>
          <div>
            <div style={{ fontSize: typography.fontSize.xs, color: colors.text.tertiary, marginBottom: spacing[1] }}>
              {t('supplierRFQDetail.buyerType', 'Buyer Type')}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2] }}>
              <span
                style={{
                  fontSize: typography.fontSize.sm,
                  fontWeight: typography.fontWeight.medium,
                  padding: `${spacing[1]} ${spacing[2]}`,
                  borderRadius: borderRadius.sm,
                  backgroundColor: rfq.buyer_type === 'homeowner' ? colors.info[100] : colors.primary[100],
                  color: rfq.buyer_type === 'homeowner' ? colors.info[700] : colors.primary[700],
                }}
              >
                {rfq.buyer_type === 'homeowner' ? t('common.homeowner', 'Homeowner') : t('common.contractor', 'Contractor')}
              </span>
              {rfq.is_new_buyer && (
                <span
                  style={{
                    fontSize: typography.fontSize.xs,
                    padding: `${spacing[1]} ${spacing[2]}`,
                    borderRadius: borderRadius.sm,
                    backgroundColor: colors.success[100],
                    color: colors.success[700],
                  }}
                >
                  {t('supplierRFQDetail.newBuyer', 'New buyer')}
                </span>
              )}
            </div>
          </div>

          <div>
            <div style={{ fontSize: typography.fontSize.xs, color: colors.text.tertiary, marginBottom: spacing[1] }}>
              {t('supplierRFQDetail.projectLocation', 'Project Location')}
            </div>
            <div style={{ fontSize: typography.fontSize.sm, color: colors.text.primary }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: spacing[1], marginBottom: spacing[1] }}>
                <Icons.MapPin size={14} />
                {rfq.project_location}
              </div>
              <div style={{ fontSize: typography.fontSize.xs, color: colors.text.tertiary }}>
                {rfq.distance_km.toFixed(1)} km {t('common.fromYourDepot', 'from your depot')}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Request Details */}
      <div
        style={{
          backgroundColor: colors.neutral[0],
          padding: spacing[5],
          borderRadius: borderRadius.lg,
          border: `1px solid ${colors.border.light}`,
          marginBottom: spacing[4],
        }}
      >
        <h2
          style={{
            fontSize: typography.fontSize.lg,
            fontWeight: typography.fontWeight.semibold,
            color: colors.text.primary,
            margin: 0,
            marginBottom: spacing[4],
          }}
        >
          {t('supplierRFQDetail.requestDetails', 'Request Details')}
        </h2>

        {/* Lines Table */}
        <div style={{ overflowX: 'auto', marginBottom: spacing[4] }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: `2px solid ${colors.border.light}` }}>
                <th
                  style={{
                    textAlign: 'left',
                    padding: spacing[2],
                    fontSize: typography.fontSize.xs,
                    fontWeight: typography.fontWeight.semibold,
                    color: colors.text.tertiary,
                    textTransform: 'uppercase',
                  }}
                >
                  {t('supplierRFQDetail.item', 'Item')}
                </th>
                <th
                  style={{
                    textAlign: 'right',
                    padding: spacing[2],
                    fontSize: typography.fontSize.xs,
                    fontWeight: typography.fontWeight.semibold,
                    color: colors.text.tertiary,
                    textTransform: 'uppercase',
                  }}
                >
                  {t('supplierRFQDetail.quantity', 'Qty')}
                </th>
                <th
                  style={{
                    textAlign: 'left',
                    padding: spacing[2],
                    fontSize: typography.fontSize.xs,
                    fontWeight: typography.fontWeight.semibold,
                    color: colors.text.tertiary,
                    textTransform: 'uppercase',
                  }}
                >
                  {t('supplierRFQDetail.unit', 'Unit')}
                </th>
              </tr>
            </thead>
            <tbody>
              {rfq.lines.map((line) => (
                <tr key={line.index} style={{ borderBottom: `1px solid ${colors.border.light}` }}>
                  <td style={{ padding: spacing[3] }}>
                    <div style={{ fontSize: typography.fontSize.sm, color: colors.text.primary, marginBottom: spacing[1] }}>
                      {line.description}
                    </div>
                    {line.spec_notes && (
                      <div style={{ fontSize: typography.fontSize.xs, color: colors.text.tertiary }}>{line.spec_notes}</div>
                    )}
                  </td>
                  <td style={{ textAlign: 'right', padding: spacing[3], fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.medium }}>
                    {line.quantity}
                  </td>
                  <td style={{ padding: spacing[3], fontSize: typography.fontSize.sm }}>{line.unit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Preferred Window */}
        <div style={{ marginBottom: spacing[3] }}>
          <div style={{ fontSize: typography.fontSize.xs, color: colors.text.tertiary, marginBottom: spacing[1] }}>
            {t('supplierRFQDetail.preferredWindow', 'Preferred Delivery Window')}
          </div>
          <div style={{ fontSize: typography.fontSize.sm, color: colors.text.primary, display: 'flex', alignItems: 'center', gap: spacing[1] }}>
            <Icons.Calendar size={14} />
            {new Date(rfq.preferred_window_start).toLocaleDateString()} - {new Date(rfq.preferred_window_end).toLocaleDateString()}
          </div>
        </div>

        {/* Additional Notes */}
        {rfq.additional_notes && (
          <div>
            <div style={{ fontSize: typography.fontSize.xs, color: colors.text.tertiary, marginBottom: spacing[1] }}>
              {t('supplierRFQDetail.additionalNotes', 'Additional Notes')}
            </div>
            <div
              style={{
                fontSize: typography.fontSize.sm,
                color: colors.text.primary,
                padding: spacing[3],
                backgroundColor: colors.background.secondary,
                borderRadius: borderRadius.md,
              }}
            >
              {rfq.additional_notes}
            </div>
          </div>
        )}
      </div>

      {/* Offer Form */}
      {(!rfq.has_existing_offer || isEditingOffer) && (
        <div
          style={{
            backgroundColor: colors.neutral[0],
            padding: spacing[5],
            borderRadius: borderRadius.lg,
            border: `1px solid ${colors.border.light}`,
            marginBottom: spacing[4],
          }}
        >
          <h2
            style={{
              fontSize: typography.fontSize.lg,
              fontWeight: typography.fontWeight.semibold,
              color: colors.text.primary,
              margin: 0,
              marginBottom: spacing[4],
            }}
          >
            {t('supplierRFQDetail.submitOffer', 'Submit Your Offer')}
          </h2>

          {/* Price Inputs */}
          <div style={{ marginBottom: spacing[5] }}>
            <h3
              style={{
                fontSize: typography.fontSize.base,
                fontWeight: typography.fontWeight.medium,
                color: colors.text.primary,
                margin: 0,
                marginBottom: spacing[3],
              }}
            >
              {t('supplierRFQDetail.pricing', 'Pricing')}
            </h3>

            {rfq.lines.map((line, idx) => {
              const linePrice = linePrices[idx];
              const total = calculateLineTotal(idx);
              const subtotalValue = linePrice?.subtotal_input !== undefined ? linePrice.subtotal_input : (total > 0 ? total.toFixed(2) : '');

              return (
                <div
                  key={line.index}
                  style={{
                    padding: spacing[3],
                    backgroundColor: colors.background.secondary,
                    borderRadius: borderRadius.md,
                    marginBottom: spacing[3],
                  }}
                >
                  <div style={{ marginBottom: spacing[3] }}>
                    <div style={{ fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.medium, color: colors.text.primary, marginBottom: spacing[1] }}>
                      {line.description}
                    </div>
                    <div style={{ fontSize: typography.fontSize.xs, color: colors.text.tertiary }}>
                      {line.quantity} {line.unit}
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: spacing[3] }}>
                    <div>
                      <label style={{ fontSize: typography.fontSize.xs, color: colors.text.tertiary, display: 'block', marginBottom: spacing[1] }}>
                        {t('supplierRFQDetail.unitPrice', 'Unit Price')} (₾)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={linePrice.unit_price}
                        onChange={(e) => handlePriceChange(idx, e.target.value)}
                        style={{
                          width: '100%',
                          padding: spacing[2],
                          border: `1px solid ${colors.border.default}`,
                          borderRadius: borderRadius.md,
                          fontSize: typography.fontSize.sm,
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: typography.fontSize.xs, color: colors.text.tertiary, display: 'block', marginBottom: spacing[1] }}>
                        {t('supplierRFQDetail.subtotal', 'Subtotal')} (₾)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={subtotalValue}
                        onChange={(e) => handleTotalChange(idx, e.target.value)}
                        placeholder="0.00"
                        style={{
                          width: '100%',
                          padding: spacing[2],
                          border: `1px solid ${colors.border.default}`,
                          borderRadius: borderRadius.md,
                          fontSize: typography.fontSize.sm,
                          fontWeight: typography.fontWeight.semibold,
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Delivery Date & Time */}
          <div style={{ marginBottom: spacing[5] }}>
            <h3
              style={{
                fontSize: typography.fontSize.base,
                fontWeight: typography.fontWeight.medium,
                color: colors.text.primary,
                margin: 0,
                marginBottom: spacing[3],
              }}
            >
              {t('supplierRFQDetail.deliveryDateTime', 'Delivery Date & Time')}
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: spacing[3] }}>
              <div>
                <label style={{ fontSize: typography.fontSize.xs, color: colors.text.tertiary, display: 'block', marginBottom: spacing[1] }}>
                  {t('supplierRFQDetail.deliveryDate', 'Date')}
                </label>
                <input
                  type="date"
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                  style={{
                    width: '100%',
                    padding: spacing[2],
                    border: `1px solid ${colors.border.default}`,
                    borderRadius: borderRadius.md,
                    fontSize: typography.fontSize.sm,
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: typography.fontSize.xs, color: colors.text.tertiary, display: 'block', marginBottom: spacing[1] }}>
                  {t('supplierRFQDetail.deliveryTime', 'Time')}
                </label>
                <input
                  type="time"
                  value={deliveryTime}
                  onChange={(e) => setDeliveryTime(e.target.value)}
                  style={{
                    width: '100%',
                    padding: spacing[2],
                    border: `1px solid ${colors.border.default}`,
                    borderRadius: borderRadius.md,
                    fontSize: typography.fontSize.sm,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Payment Terms */}
          <div style={{ marginBottom: spacing[5] }}>
            <label style={{ fontSize: typography.fontSize.xs, color: colors.text.tertiary, display: 'block', marginBottom: spacing[2] }}>
              {t('supplierRFQDetail.paymentTerms', 'Payment Terms')}
            </label>
            <select
              value={paymentTerm}
              onChange={(e) => setPaymentTerm(e.target.value as PaymentTerm)}
              style={{
                width: '100%',
                padding: spacing[2],
                border: `1px solid ${colors.border.default}`,
                borderRadius: borderRadius.md,
                fontSize: typography.fontSize.sm,
              }}
            >
              <option value="cod">{t('supplierRFQDetail.cod', 'Cash on Delivery')}</option>
              <option value="net_7">{t('supplierRFQDetail.net7', 'Bank Transfer 50/50')}</option>
              <option value="advance_100">{t('supplierRFQDetail.advance', 'Full Prepayment')}</option>
            </select>
          </div>

          {/* Delivery Fee */}
          <div style={{ marginBottom: spacing[5] }}>
            <label style={{ fontSize: typography.fontSize.xs, color: colors.text.tertiary, display: 'block', marginBottom: spacing[1] }}>
              {t('supplierRFQDetail.deliveryFee', 'Delivery Fee')} (₾) - {t('common.optional', 'Optional')}
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={deliveryFee}
              onChange={(e) => setDeliveryFee(e.target.value)}
              placeholder="0.00"
              style={{
                width: '100%',
                padding: spacing[2],
                border: `1px solid ${colors.border.default}`,
                borderRadius: borderRadius.md,
                fontSize: typography.fontSize.sm,
              }}
            />
          </div>

          {/* Notes */}
          <div style={{ marginBottom: spacing[5] }}>
            <label style={{ fontSize: typography.fontSize.xs, color: colors.text.tertiary, display: 'block', marginBottom: spacing[1] }}>
              {t('supplierRFQDetail.notes', 'Additional Notes')} - {t('common.optional', 'Optional')}
            </label>
            <textarea
              value={offerNotes}
              onChange={(e) => setOfferNotes(e.target.value)}
              maxLength={500}
              rows={4}
              placeholder={t('supplierRFQDetail.notesPlaceholder', 'Add any additional information about your offer...')}
              style={{
                width: '100%',
                padding: spacing[2],
                border: `1px solid ${colors.border.default}`,
                borderRadius: borderRadius.md,
                fontSize: typography.fontSize.sm,
                resize: 'vertical',
                fontFamily: 'inherit',
              }}
            />
          </div>

          {/* Offer Expiry */}
          <div style={{ marginBottom: spacing[5] }}>
            <label style={{ fontSize: typography.fontSize.xs, color: colors.text.tertiary, display: 'block', marginBottom: spacing[2] }}>
              {t('supplierRFQDetail.offerExpiry', 'Offer Valid For')}
            </label>
            <select
              value={offerExpiry}
              onChange={(e) => setOfferExpiry(e.target.value)}
              style={{
                width: '100%',
                padding: spacing[2],
                border: `1px solid ${colors.border.default}`,
                borderRadius: borderRadius.md,
                fontSize: typography.fontSize.sm,
              }}
            >
              <option value="24h">{t('supplierRFQDetail.24hours', '24 hours')}</option>
              <option value="48h">{t('supplierRFQDetail.48hours', '48 hours')}</option>
              <option value="72h">{t('supplierRFQDetail.72hours', '72 hours')}</option>
              <option value="1week">{t('supplierRFQDetail.1week', '1 week')}</option>
            </select>
          </div>

          {/* Total */}
          <div
            style={{
              padding: spacing[4],
              backgroundColor: colors.primary[50],
              borderRadius: borderRadius.md,
              marginBottom: spacing[5],
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.medium, color: colors.text.primary }}>
                {t('supplierRFQDetail.total', 'Total Amount')}
              </span>
              <span style={{ fontSize: typography.fontSize['2xl'], fontWeight: typography.fontWeight.bold, color: colors.primary[700] }}>
                ₾{calculateTotal().toFixed(2)}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: spacing[3] }}>
            <button
              onClick={handleSendOffer}
              disabled={submitting}
              style={{
                flex: 1,
                padding: `${spacing[3]} ${spacing[5]}`,
                backgroundColor: colors.primary[600],
                color: colors.neutral[0],
                border: 'none',
                borderRadius: borderRadius.md,
                fontSize: typography.fontSize.base,
                fontWeight: typography.fontWeight.semibold,
                cursor: submitting ? 'not-allowed' : 'pointer',
                opacity: submitting ? 0.6 : 1,
              }}
            >
              {submitting
                ? t('common.sending', 'Sending...')
                : isEditingOffer
                ? t('supplierRFQDetail.submitRevisedOffer', 'Submit Revised Offer')
                : t('supplierRFQDetail.sendOffer', 'Send Offer')}
            </button>

            <button
              onClick={handleDecline}
              disabled={submitting}
              style={{
                padding: `${spacing[3]} ${spacing[5]}`,
                backgroundColor: colors.neutral[0],
                color: colors.text.secondary,
                border: `1px solid ${colors.border.default}`,
                borderRadius: borderRadius.md,
                fontSize: typography.fontSize.base,
                cursor: submitting ? 'not-allowed' : 'pointer',
              }}
            >
              {t('supplierRFQDetail.decline', 'Decline')}
            </button>
          </div>
        </div>
      )}

      {rfq.has_existing_offer && rfq.existing_offer && (
        <div
          style={{
            backgroundColor: colors.neutral[0],
            padding: spacing[5],
            borderRadius: borderRadius.lg,
            border: `1px solid ${colors.border.light}`,
            marginBottom: spacing[4],
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2], marginBottom: spacing[4] }}>
            <Icons.CheckCircle size={24} color={colors.success[600]} />
            <h2
              style={{
                fontSize: typography.fontSize.lg,
                fontWeight: typography.fontWeight.semibold,
                color: colors.text.primary,
                margin: 0,
              }}
            >
              {t('supplierRFQDetail.yourOffer', 'Your Offer')}
            </h2>
            <span
              style={{
                marginLeft: 'auto',
                fontSize: typography.fontSize.xs,
                padding: `${spacing[1]} ${spacing[2]}`,
                borderRadius: borderRadius.sm,
                backgroundColor:
                  rfq.existing_offer.status === 'accepted'
                    ? colors.success[100]
                    : rfq.existing_offer.status === 'rejected'
                    ? colors.error[100]
                    : colors.warning[100],
                color:
                  rfq.existing_offer.status === 'accepted'
                    ? colors.success[700]
                    : rfq.existing_offer.status === 'rejected'
                    ? colors.error[700]
                    : colors.warning[700],
                fontWeight: typography.fontWeight.medium,
              }}
            >
              {rfq.existing_offer.status.charAt(0).toUpperCase() + rfq.existing_offer.status.slice(1)}
            </span>
          </div>

          {/* Offer Line Items */}
          <div style={{ marginBottom: spacing[4] }}>
            <h3
              style={{
                fontSize: typography.fontSize.base,
                fontWeight: typography.fontWeight.medium,
                color: colors.text.primary,
                margin: 0,
                marginBottom: spacing[3],
              }}
            >
              {t('supplierRFQDetail.pricing', 'Pricing')}
            </h3>

            {rfq.existing_offer.line_prices.map((linePrice) => {
              const line = rfq.lines.find((l) => l.index === linePrice.line_index);
              if (!line) return null;

              return (
                <div
                  key={linePrice.line_index}
                  style={{
                    padding: spacing[3],
                    backgroundColor: colors.background.secondary,
                    borderRadius: borderRadius.md,
                    marginBottom: spacing[2],
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: spacing[2] }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.medium, color: colors.text.primary, marginBottom: spacing[1] }}>
                        {line.description}
                      </div>
                      <div style={{ fontSize: typography.fontSize.xs, color: colors.text.tertiary }}>
                        {line.quantity} {line.unit} × ₾{Number(linePrice.unit_price).toFixed(2)}
                      </div>
                    </div>
                    <div style={{ fontSize: typography.fontSize.base, fontWeight: typography.fontWeight.semibold, color: colors.text.primary }}>
                      ₾{Number(linePrice.total_price).toFixed(2)}
                    </div>
                  </div>
                  {linePrice.notes && (
                    <div style={{ fontSize: typography.fontSize.xs, color: colors.text.secondary, fontStyle: 'italic' }}>
                      {linePrice.notes}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Delivery Details */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: spacing[4], marginBottom: spacing[4] }}>
            <div>
              <div style={{ fontSize: typography.fontSize.xs, color: colors.text.tertiary, marginBottom: spacing[1] }}>
                {t('supplierRFQDetail.deliveryDateTime', 'Delivery Date & Time')}
              </div>
              <div style={{ fontSize: typography.fontSize.sm, color: colors.text.primary }}>
                {new Date(rfq.existing_offer.delivery_window_start).toLocaleDateString()}{' '}
                {new Date(rfq.existing_offer.delivery_window_start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>

            <div>
              <div style={{ fontSize: typography.fontSize.xs, color: colors.text.tertiary, marginBottom: spacing[1] }}>
                {t('supplierRFQDetail.paymentTerms', 'Payment Terms')}
              </div>
              <div style={{ fontSize: typography.fontSize.sm, color: colors.text.primary }}>
                {rfq.existing_offer.payment_terms === 'cod'
                  ? t('supplierRFQDetail.cod', 'Cash on Delivery')
                  : rfq.existing_offer.payment_terms === 'net_7'
                  ? t('supplierRFQDetail.net7', 'Bank Transfer 50/50')
                  : t('supplierRFQDetail.advance', 'Full Prepayment')}
              </div>
            </div>

            {rfq.existing_offer.delivery_fee > 0 && (
              <div>
                <div style={{ fontSize: typography.fontSize.xs, color: colors.text.tertiary, marginBottom: spacing[1] }}>
                  {t('supplierRFQDetail.deliveryFee', 'Delivery Fee')}
                </div>
                <div style={{ fontSize: typography.fontSize.sm, color: colors.text.primary }}>₾{Number(rfq.existing_offer.delivery_fee).toFixed(2)}</div>
              </div>
            )}

            <div>
              <div style={{ fontSize: typography.fontSize.xs, color: colors.text.tertiary, marginBottom: spacing[1] }}>
                {t('supplierRFQDetail.offerExpiry', 'Offer Valid Until')}
              </div>
              <div style={{ fontSize: typography.fontSize.sm, color: colors.text.primary }}>
                {new Date(rfq.existing_offer.expires_at).toLocaleString()}
              </div>
            </div>
          </div>

          {/* Notes */}
          {rfq.existing_offer.notes && (
            <div style={{ marginBottom: spacing[4] }}>
              <div style={{ fontSize: typography.fontSize.xs, color: colors.text.tertiary, marginBottom: spacing[1] }}>
                {t('supplierRFQDetail.notes', 'Additional Notes')}
              </div>
              <div
                style={{
                  fontSize: typography.fontSize.sm,
                  color: colors.text.primary,
                  padding: spacing[3],
                  backgroundColor: colors.background.secondary,
                  borderRadius: borderRadius.md,
                }}
              >
                {rfq.existing_offer.notes}
              </div>
            </div>
          )}

          {/* Total */}
          <div
            style={{
              padding: spacing[4],
              backgroundColor: colors.primary[50],
              borderRadius: borderRadius.md,
              marginBottom: spacing[4],
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.medium, color: colors.text.primary }}>
                {t('supplierRFQDetail.total', 'Total Amount')}
              </span>
              <span style={{ fontSize: typography.fontSize['2xl'], fontWeight: typography.fontWeight.bold, color: colors.primary[700] }}>
                ₾{Number(rfq.existing_offer.total_amount).toFixed(2)}
              </span>
            </div>
          </div>

          {/* Edit and History Actions */}
          <div style={{ display: 'flex', gap: spacing[3], marginBottom: spacing[4] }}>
            <button
              onClick={handleEditOffer}
              style={{
                flex: 1,
                padding: `${spacing[3]} ${spacing[4]}`,
                backgroundColor: colors.primary[600],
                color: colors.neutral[0],
                border: 'none',
                borderRadius: borderRadius.md,
                fontSize: typography.fontSize.sm,
                fontWeight: typography.fontWeight.medium,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: spacing[2],
              }}
            >
              <Icons.Edit2 size={16} />
              {t('supplierRFQDetail.editOffer', 'Revise Offer')}
            </button>
            <button
              onClick={() => {
                fetchOfferHistory();
                setShowHistory(!showHistory);
              }}
              style={{
                flex: 1,
                padding: `${spacing[3]} ${spacing[4]}`,
                backgroundColor: colors.neutral[0],
                color: colors.primary[600],
                border: `1px solid ${colors.primary[600]}`,
                borderRadius: borderRadius.md,
                fontSize: typography.fontSize.sm,
                fontWeight: typography.fontWeight.medium,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: spacing[2],
              }}
            >
              <Icons.History size={16} />
              {showHistory
                ? t('supplierRFQDetail.hideHistory', 'Hide History')
                : t('supplierRFQDetail.showHistory', 'Show Previous Offers')}
            </button>
          </div>

          <div style={{ fontSize: typography.fontSize.xs, color: colors.text.tertiary, textAlign: 'center' }}>
            {t('supplierRFQDetail.sentOn', 'Sent on')} {new Date(rfq.existing_offer.created_at).toLocaleString()}
          </div>
        </div>
      )}

      {/* Offer History */}
      {rfq.has_existing_offer && showHistory && offerHistory.length > 0 && (
        <div
          style={{
            backgroundColor: colors.neutral[0],
            padding: spacing[5],
            borderRadius: borderRadius.lg,
            border: `1px solid ${colors.border.light}`,
            marginBottom: spacing[4],
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2], marginBottom: spacing[4] }}>
            <Icons.History size={24} color={colors.text.tertiary} />
            <h2
              style={{
                fontSize: typography.fontSize.lg,
                fontWeight: typography.fontWeight.semibold,
                color: colors.text.primary,
                margin: 0,
              }}
            >
              {t('supplierRFQDetail.previousOffers', 'Previous Offers')}
            </h2>
            <span
              style={{
                marginLeft: 'auto',
                fontSize: typography.fontSize.xs,
                color: colors.text.tertiary,
              }}
            >
              {offerHistory.length} {offerHistory.length === 1 ? 'version' : 'versions'}
            </span>
          </div>

          {offerHistory.map((historyOffer, index) => (
            <div
              key={historyOffer.id}
              style={{
                padding: spacing[4],
                backgroundColor: colors.background.secondary,
                borderRadius: borderRadius.md,
                marginBottom: spacing[3],
                border: `1px solid ${colors.border.light}`,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing[3] }}>
                <div>
                  <span
                    style={{
                      fontSize: typography.fontSize.xs,
                      padding: `${spacing[1]} ${spacing[2]}`,
                      borderRadius: borderRadius.sm,
                      backgroundColor: colors.neutral[100],
                      color: colors.text.secondary,
                      fontWeight: typography.fontWeight.medium,
                    }}
                  >
                    Version {historyOffer.version_number}
                  </span>
                </div>
                <div style={{ fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.bold, color: colors.primary[700] }}>
                  ₾{Number(historyOffer.total_amount).toFixed(2)}
                </div>
              </div>

              {/* Line items summary */}
              <div style={{ marginBottom: spacing[3] }}>
                {historyOffer.line_prices.map((linePrice) => {
                  const line = rfq.lines.find((l) => l.index === linePrice.line_index);
                  if (!line) return null;

                  return (
                    <div
                      key={linePrice.line_index}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: typography.fontSize.xs,
                        color: colors.text.secondary,
                        marginBottom: spacing[1],
                      }}
                    >
                      <span>
                        {line.quantity} {line.unit} × ₾{Number(linePrice.unit_price).toFixed(2)}
                      </span>
                      <span>₾{Number(linePrice.total_price).toFixed(2)}</span>
                    </div>
                  );
                })}
              </div>

              {/* Delivery and Payment Details */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: spacing[2],
                  marginBottom: spacing[2],
                  paddingBottom: spacing[2],
                  borderBottom: `1px solid ${colors.border.light}`,
                }}
              >
                <div>
                  <div style={{ fontSize: typography.fontSize.xs, color: colors.text.tertiary, marginBottom: spacing[1] }}>
                    Delivery Date & Time
                  </div>
                  <div style={{ fontSize: typography.fontSize.xs, color: colors.text.secondary }}>
                    {historyOffer.delivery_window_start
                      ? `${new Date(historyOffer.delivery_window_start).toLocaleDateString()} ${new Date(historyOffer.delivery_window_start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                      : 'Not specified'}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: typography.fontSize.xs, color: colors.text.tertiary, marginBottom: spacing[1] }}>
                    Payment Terms
                  </div>
                  <div style={{ fontSize: typography.fontSize.xs, color: colors.text.secondary }}>
                    {historyOffer.payment_terms === 'cod'
                      ? 'Cash on Delivery'
                      : historyOffer.payment_terms === 'net_7'
                      ? 'Bank Transfer 50/50'
                      : 'Full Prepayment'}
                  </div>
                </div>
              </div>

              {historyOffer.delivery_fee > 0 && (
                <div
                  style={{
                    fontSize: typography.fontSize.xs,
                    color: colors.text.secondary,
                    marginBottom: spacing[2],
                  }}
                >
                  Delivery Fee: ₾{Number(historyOffer.delivery_fee).toFixed(2)}
                </div>
              )}

              <div
                style={{
                  fontSize: typography.fontSize.xs,
                  color: colors.text.tertiary,
                  paddingTop: spacing[2],
                  borderTop: `1px solid ${colors.border.light}`,
                }}
              >
                Submitted: {new Date(historyOffer.created_at).toLocaleString()} • Superseded:{' '}
                {new Date(historyOffer.superseded_at).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Form when isEditingOffer is true */}
      {isEditingOffer && (
        <div
          style={{
            backgroundColor: colors.warning[50],
            padding: spacing[5],
            borderRadius: borderRadius.lg,
            border: `2px solid ${colors.warning[300]}`,
            marginBottom: spacing[4],
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2], marginBottom: spacing[4] }}>
            <Icons.AlertCircle size={24} color={colors.warning[600]} />
            <h2
              style={{
                fontSize: typography.fontSize.lg,
                fontWeight: typography.fontWeight.semibold,
                color: colors.text.primary,
                margin: 0,
              }}
            >
              {t('supplierRFQDetail.editingOffer', 'Revising Your Offer')}
            </h2>
          </div>
          <div
            style={{
              fontSize: typography.fontSize.sm,
              color: colors.text.secondary,
              marginBottom: spacing[4],
              padding: spacing[3],
              backgroundColor: colors.neutral[0],
              borderRadius: borderRadius.md,
            }}
          >
            {t(
              'supplierRFQDetail.editWarning',
              'You are revising your offer. The current offer will be saved to history. Update the fields below and click "Submit Revised Offer" to send the new version.'
            )}
          </div>
          <button
            onClick={handleCancelEdit}
            style={{
              padding: `${spacing[2]} ${spacing[4]}`,
              backgroundColor: colors.neutral[0],
              color: colors.text.secondary,
              border: `1px solid ${colors.border.light}`,
              borderRadius: borderRadius.md,
              fontSize: typography.fontSize.sm,
              cursor: 'pointer',
            }}
          >
            {t('common.cancel', 'Cancel')}
          </button>
        </div>
      )}
    </div>
  );
}
