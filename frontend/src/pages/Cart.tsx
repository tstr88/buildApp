/**
 * Cart Page
 * Shopping cart with items grouped by supplier
 * Allows checkout to create orders/RFQs
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '../services/api';
import { Icons } from '../components/icons/Icons';
import { colors, spacing, typography, borderRadius, shadows } from '../theme/tokens';

interface CartItem {
  id: string;
  sku_id: string | null;
  project_material_id: string | null;
  project_id: string | null;
  project_name: string | null;
  project_address: string | null;
  name: string;
  description: string | null;
  quantity: number;
  unit: string;
  unit_price: number;
  total: number;
  action_type: 'direct_order' | 'rfq';
  images: string[] | null;
}

interface SupplierGroup {
  supplier_id: string;
  supplier_name: string;
  supplier_logo: string | null;
  supplier_address: string | null;
  items: CartItem[];
  subtotal: number;
  item_count: number;
}

interface CartSummary {
  total_items: number;
  total_suppliers: number;
  total_amount: number;
}

interface CartResponse {
  suppliers: SupplierGroup[];
  summary: CartSummary;
}

type PaymentOption = 'cod' | 'bank_transfer' | 'prepay';
type DeliveryOption = 'delivery' | 'pickup';

export const Cart: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [supplierGroups, setSupplierGroups] = useState<SupplierGroup[]>([]);
  const [summary, setSummary] = useState<CartSummary>({ total_items: 0, total_suppliers: 0, total_amount: 0 });
  const [loading, setLoading] = useState(true);
  const [checkingOut, setCheckingOut] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Checkout options
  const [paymentOption, setPaymentOption] = useState<PaymentOption>('cod');
  const [deliveryOption, setDeliveryOption] = useState<DeliveryOption>('delivery');

  // Success notification
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [redirectProjectId, setRedirectProjectId] = useState<string | null>(null);

  // Extract project address from cart items
  const projectAddress = useMemo(() => {
    for (const group of supplierGroups) {
      for (const item of group.items) {
        if (item.project_address) {
          return item.project_address;
        }
      }
    }
    return null;
  }, [supplierGroups]);

  // Extract first project ID for redirect
  const firstProjectId = useMemo(() => {
    for (const group of supplierGroups) {
      for (const item of group.items) {
        if (item.project_id) {
          return item.project_id;
        }
      }
    }
    return null;
  }, [supplierGroups]);

  // Fetch cart
  const fetchCart = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get<CartResponse | { data: CartResponse }>('/buyers/cart');
      if (response.success && response.data) {
        const data = (response.data as any).suppliers ? response.data as CartResponse : (response.data as any).data as CartResponse;
        setSupplierGroups(data?.suppliers || []);
        setSummary(data?.summary || { total_items: 0, total_suppliers: 0, total_amount: 0 });
      }
    } catch (err) {
      console.error('Failed to fetch cart:', err);
      setError(t('common.errorFetchingData', 'Failed to load cart'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // Remove item from cart
  const removeItem = async (cartItemId: string) => {
    try {
      await api.delete(`/buyers/cart/${cartItemId}`);
      await fetchCart();
    } catch (err) {
      console.error('Failed to remove item:', err);
    }
  };

  // Update item quantity
  const updateQuantity = async (cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(cartItemId);
      return;
    }
    try {
      await api.put(`/buyers/cart/${cartItemId}`, { quantity });
      await fetchCart();
    } catch (err) {
      console.error('Failed to update quantity:', err);
    }
  };

  // Toggle action type
  const toggleActionType = async (cartItemId: string, currentType: string) => {
    const newType = currentType === 'direct_order' ? 'rfq' : 'direct_order';
    try {
      await api.put(`/buyers/cart/${cartItemId}`, { action_type: newType });
      await fetchCart();
    } catch (err) {
      console.error('Failed to toggle action type:', err);
    }
  };

  // Checkout
  const handleCheckout = async () => {
    setCheckingOut(true);
    setError(null);

    try {
      const response = await api.post<{ orders?: any[]; rfqs?: any[]; processed_items?: number }>('/buyers/cart/checkout', {
        pickup_or_delivery: deliveryOption,
        payment_terms: paymentOption,
      });

      if (response.success && response.data) {
        const orders = response.data.orders || [];
        const rfqs = response.data.rfqs || [];

        // Build success message
        let message = '';
        if (orders.length > 0 && rfqs.length === 0) {
          message = t('cart.ordersCreated', '{{count}} order(s) created successfully!', { count: orders.length });
        } else if (rfqs.length > 0 && orders.length === 0) {
          message = t('cart.rfqsCreated', '{{count}} RFQ(s) sent successfully!', { count: rfqs.length });
        } else if (orders.length > 0 && rfqs.length > 0) {
          message = t('cart.ordersAndRfqsCreated', '{{orderCount}} order(s) and {{rfqCount}} RFQ(s) created!', { orderCount: orders.length, rfqCount: rfqs.length });
        }

        if (message) {
          setSuccessMessage(message);
          setRedirectProjectId(firstProjectId);
          setShowSuccess(true);

          // Auto-redirect after 3 seconds
          setTimeout(() => {
            if (firstProjectId) {
              navigate(`/projects/${firstProjectId}/materials`);
            } else {
              navigate('/projects');
            }
          }, 3000);
        } else {
          await fetchCart();
        }
      }
    } catch (err) {
      console.error('Checkout failed:', err);
      setError(t('cart.checkoutFailed', 'Checkout failed. Please try again.'));
    } finally {
      setCheckingOut(false);
    }
  };

  // Clear cart
  const clearCart = async () => {
    if (!confirm(t('cart.confirmClear', 'Are you sure you want to clear your cart?'))) return;

    try {
      await api.delete('/buyers/cart');
      await fetchCart();
    } catch (err) {
      console.error('Failed to clear cart:', err);
    }
  };

  // Success notification popup
  if (showSuccess) {
    return (
      <div style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: spacing[4],
      }}>
        <div style={{
          backgroundColor: colors.neutral[0],
          borderRadius: borderRadius.xl,
          padding: spacing[8],
          maxWidth: '400px',
          width: '100%',
          textAlign: 'center',
          animation: 'slideUp 0.3s ease-out',
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            backgroundColor: colors.success[100],
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto',
            marginBottom: spacing[4],
            animation: 'scaleIn 0.5s ease-out',
          }}>
            <Icons.CheckCircle size={48} color={colors.success[600]} />
          </div>

          <h2 style={{
            fontSize: typography.fontSize['xl'],
            fontWeight: typography.fontWeight.bold,
            color: colors.text.primary,
            marginBottom: spacing[2],
          }}>
            {t('cart.success', 'Success!')}
          </h2>

          <p style={{
            fontSize: typography.fontSize.base,
            color: colors.text.secondary,
            marginBottom: spacing[6],
          }}>
            {successMessage}
          </p>

          <button
            onClick={() => {
              if (redirectProjectId) {
                navigate(`/projects/${redirectProjectId}/materials`);
              } else {
                navigate('/projects');
              }
            }}
            style={{
              width: '100%',
              padding: spacing[4],
              backgroundColor: colors.primary[600],
              color: colors.text.inverse,
              border: 'none',
              borderRadius: borderRadius.lg,
              cursor: 'pointer',
              fontWeight: typography.fontWeight.semibold,
              fontSize: typography.fontSize.base,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: spacing[2],
            }}
          >
            <Icons.ChevronRight size={20} />
            {t('cart.continueOrdering', 'Continue Ordering')}
          </button>

          <p style={{
            fontSize: typography.fontSize.sm,
            color: colors.text.tertiary,
            marginTop: spacing[3],
          }}>
            {t('cart.redirecting', 'Redirecting in 3 seconds...')}
          </p>
        </div>

        <style>{`
          @keyframes slideUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes scaleIn {
            from { transform: scale(0); }
            to { transform: scale(1); }
          }
        `}</style>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ padding: spacing[6], display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <div
          style={{
            width: '32px',
            height: '32px',
            border: `3px solid ${colors.primary[200]}`,
            borderTopColor: colors.primary[600],
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
          }}
        />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ padding: spacing[4], maxWidth: '1000px', margin: '0 auto', paddingBottom: spacing[20] }}>
      {/* Header */}
      <div style={{ marginBottom: spacing[6] }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: spacing[2],
            color: colors.text.secondary,
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
            marginBottom: spacing[3],
          }}
        >
          <Icons.ArrowLeft size={20} />
          {t('common.back', 'Back')}
        </button>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: spacing[3] }}>
          <h1 style={{ fontSize: typography.fontSize['2xl'], fontWeight: typography.fontWeight.bold, margin: 0 }}>
            <Icons.ShoppingCart size={28} style={{ marginRight: spacing[2], verticalAlign: 'middle' }} />
            {t('cart.title', 'Shopping Cart')}
          </h1>
          {supplierGroups.length > 0 && (
            <button
              onClick={clearCart}
              style={{
                padding: `${spacing[2]} ${spacing[3]}`,
                backgroundColor: 'transparent',
                color: colors.error[600],
                border: `1px solid ${colors.error[300]}`,
                borderRadius: borderRadius.md,
                cursor: 'pointer',
                fontSize: typography.fontSize.sm,
              }}
            >
              {t('cart.clearCart', 'Clear Cart')}
            </button>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div
          style={{
            padding: spacing[4],
            backgroundColor: colors.error[50],
            border: `1px solid ${colors.error[200]}`,
            borderRadius: borderRadius.md,
            marginBottom: spacing[4],
            display: 'flex',
            alignItems: 'center',
            gap: spacing[2],
          }}
        >
          <Icons.AlertCircle size={20} color={colors.error[600]} />
          <span style={{ color: colors.error[700] }}>{error}</span>
        </div>
      )}

      {/* Empty Cart */}
      {supplierGroups.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: spacing[8],
            backgroundColor: colors.neutral[50],
            borderRadius: borderRadius.lg,
          }}
        >
          <Icons.ShoppingCart size={64} color={colors.text.secondary} />
          <h2 style={{ color: colors.text.primary, marginTop: spacing[4] }}>
            {t('cart.empty', 'Your cart is empty')}
          </h2>
          <p style={{ color: colors.text.secondary }}>
            {t('cart.emptyDescription', 'Add materials from your projects to get started')}
          </p>
          <button
            onClick={() => navigate('/projects')}
            style={{
              marginTop: spacing[4],
              padding: `${spacing[3]} ${spacing[5]}`,
              backgroundColor: colors.primary[600],
              color: colors.text.inverse,
              border: 'none',
              borderRadius: borderRadius.md,
              cursor: 'pointer',
              fontWeight: typography.fontWeight.medium,
            }}
          >
            {t('cart.browseProjects', 'Browse Projects')}
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[6] }}>
          {/* Delivery Address */}
          {projectAddress && (
            <div style={{
              backgroundColor: colors.info[50],
              border: `1px solid ${colors.info[200]}`,
              borderRadius: borderRadius.lg,
              padding: spacing[4],
            }}>
              <div style={{ display: 'flex', alignItems: 'start', gap: spacing[3] }}>
                <Icons.MapPin size={20} color={colors.info[600]} style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <div style={{ fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.medium, color: colors.info[700], marginBottom: spacing[1] }}>
                    {t('cart.deliveryAddress', 'Delivery Address')}
                  </div>
                  <div style={{ fontSize: typography.fontSize.base, color: colors.text.primary }}>
                    {projectAddress}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Supplier Groups */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[4] }}>
            {supplierGroups.map((group) => (
              <div
                key={group.supplier_id}
                style={{
                  backgroundColor: colors.neutral[0],
                  borderRadius: borderRadius.lg,
                  border: `1px solid ${colors.border.light}`,
                  overflow: 'hidden',
                }}
              >
                {/* Supplier Header */}
                <div
                  style={{
                    padding: spacing[4],
                    backgroundColor: colors.neutral[50],
                    borderBottom: `1px solid ${colors.border.light}`,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: spacing[3] }}>
                    {group.supplier_logo ? (
                      <img
                        src={group.supplier_logo}
                        alt={group.supplier_name}
                        style={{ width: '40px', height: '40px', borderRadius: borderRadius.md, objectFit: 'cover' }}
                      />
                    ) : (
                      <div
                        style={{
                          width: '40px',
                          height: '40px',
                          backgroundColor: colors.primary[100],
                          borderRadius: borderRadius.md,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Icons.Factory size={20} color={colors.primary[600]} />
                      </div>
                    )}
                    <div>
                      <h3 style={{ margin: 0, fontSize: typography.fontSize.base, fontWeight: typography.fontWeight.semibold }}>
                        {group.supplier_name}
                      </h3>
                      <span style={{ fontSize: typography.fontSize.sm, color: colors.text.secondary }}>
                        {group.item_count} {t('common.items', 'items')}
                      </span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: typography.fontSize.sm, color: colors.text.secondary }}>{t('cart.subtotal', 'Subtotal')}</div>
                    <div style={{ fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.bold, color: colors.primary[600] }}>
                      {group.subtotal.toLocaleString()} ₾
                    </div>
                  </div>
                </div>

                {/* Items */}
                <div>
                  {group.items.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        padding: spacing[4],
                        borderBottom: `1px solid ${colors.border.light}`,
                        display: 'flex',
                        gap: spacing[3],
                        alignItems: 'start',
                      }}
                    >
                      {/* Item Info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: spacing[2] }}>
                          <div>
                            <h4 style={{ margin: 0, fontSize: typography.fontSize.base, fontWeight: typography.fontWeight.medium }}>
                              {item.name}
                            </h4>
                            {item.project_name && (
                              <p style={{ fontSize: typography.fontSize.sm, color: colors.text.secondary, margin: 0, marginTop: spacing[1] }}>
                                {t('cart.fromProject', 'From')}: {item.project_name}
                              </p>
                            )}
                          </div>

                          {/* Action Type Toggle */}
                          <button
                            onClick={() => toggleActionType(item.id, item.action_type)}
                            style={{
                              padding: `${spacing[1]} ${spacing[2]}`,
                              backgroundColor: item.action_type === 'direct_order' ? colors.success[100] : colors.info[100],
                              color: item.action_type === 'direct_order' ? colors.success[700] : colors.info[700],
                              border: 'none',
                              borderRadius: borderRadius.full,
                              fontSize: typography.fontSize.xs,
                              cursor: 'pointer',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {item.action_type === 'direct_order' ? t('cart.directOrder', 'Direct Order') : t('cart.rfq', 'RFQ')}
                          </button>
                        </div>

                        {/* Quantity Controls */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: spacing[4], marginTop: spacing[3], flexWrap: 'wrap' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2] }}>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              style={{
                                width: '28px',
                                height: '28px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: colors.neutral[100],
                                border: `1px solid ${colors.border.default}`,
                                borderRadius: borderRadius.md,
                                cursor: 'pointer',
                              }}
                            >
                              <Icons.Minus size={14} />
                            </button>
                            <span style={{ minWidth: '60px', textAlign: 'center', fontWeight: typography.fontWeight.medium }}>
                              {item.quantity} {item.unit}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              style={{
                                width: '28px',
                                height: '28px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: colors.neutral[100],
                                border: `1px solid ${colors.border.default}`,
                                borderRadius: borderRadius.md,
                                cursor: 'pointer',
                              }}
                            >
                              <Icons.Plus size={14} />
                            </button>
                          </div>

                          <span style={{ color: colors.text.secondary, fontSize: typography.fontSize.sm }}>
                            @ {item.unit_price.toLocaleString()} ₾/{item.unit}
                          </span>

                          <span style={{ fontWeight: typography.fontWeight.bold, color: colors.primary[600] }}>
                            {item.total.toLocaleString()} ₾
                          </span>

                          <button
                            onClick={() => removeItem(item.id)}
                            style={{
                              marginLeft: 'auto',
                              padding: spacing[2],
                              backgroundColor: 'transparent',
                              border: 'none',
                              cursor: 'pointer',
                              color: colors.error[500],
                            }}
                          >
                            <Icons.Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Checkout Options */}
          <div style={{
            backgroundColor: colors.neutral[0],
            borderRadius: borderRadius.lg,
            border: `1px solid ${colors.border.light}`,
            padding: spacing[4],
          }}>
            <h3 style={{ fontSize: typography.fontSize.base, fontWeight: typography.fontWeight.semibold, margin: 0, marginBottom: spacing[4] }}>
              {t('cart.checkoutOptions', 'Checkout Options')}
            </h3>

            {/* Delivery Option */}
            <div style={{ marginBottom: spacing[4] }}>
              <div style={{ fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.medium, color: colors.text.secondary, marginBottom: spacing[2] }}>
                {t('cart.deliveryMethod', 'Delivery Method')}
              </div>
              <div style={{ display: 'flex', gap: spacing[2] }}>
                <button
                  onClick={() => setDeliveryOption('delivery')}
                  style={{
                    flex: 1,
                    padding: spacing[3],
                    backgroundColor: deliveryOption === 'delivery' ? colors.primary[50] : colors.neutral[50],
                    border: `2px solid ${deliveryOption === 'delivery' ? colors.primary[600] : colors.border.light}`,
                    borderRadius: borderRadius.md,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: spacing[2],
                  }}
                >
                  <Icons.Truck size={18} color={deliveryOption === 'delivery' ? colors.primary[600] : colors.text.secondary} />
                  <span style={{ fontWeight: typography.fontWeight.medium, color: deliveryOption === 'delivery' ? colors.primary[600] : colors.text.primary }}>
                    {t('cart.delivery', 'Delivery')}
                  </span>
                </button>
                <button
                  onClick={() => setDeliveryOption('pickup')}
                  style={{
                    flex: 1,
                    padding: spacing[3],
                    backgroundColor: deliveryOption === 'pickup' ? colors.primary[50] : colors.neutral[50],
                    border: `2px solid ${deliveryOption === 'pickup' ? colors.primary[600] : colors.border.light}`,
                    borderRadius: borderRadius.md,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: spacing[2],
                  }}
                >
                  <Icons.Package size={18} color={deliveryOption === 'pickup' ? colors.primary[600] : colors.text.secondary} />
                  <span style={{ fontWeight: typography.fontWeight.medium, color: deliveryOption === 'pickup' ? colors.primary[600] : colors.text.primary }}>
                    {t('cart.pickup', 'Pickup')}
                  </span>
                </button>
              </div>
            </div>

            {/* Payment Option */}
            <div>
              <div style={{ fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.medium, color: colors.text.secondary, marginBottom: spacing[2] }}>
                {t('cart.paymentMethod', 'Payment Method')}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[2] }}>
                {[
                  { value: 'cod' as PaymentOption, label: t('cart.paymentCod', 'Cash on Delivery'), icon: Icons.DollarSign },
                  { value: 'bank_transfer' as PaymentOption, label: t('cart.paymentBank', 'Bank Transfer'), icon: Icons.Factory },
                  { value: 'prepay' as PaymentOption, label: t('cart.paymentPrepay', 'Prepayment'), icon: Icons.Shield },
                ].map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    onClick={() => setPaymentOption(value)}
                    style={{
                      padding: spacing[3],
                      backgroundColor: paymentOption === value ? colors.primary[50] : colors.neutral[50],
                      border: `2px solid ${paymentOption === value ? colors.primary[600] : colors.border.light}`,
                      borderRadius: borderRadius.md,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: spacing[3],
                      textAlign: 'left',
                    }}
                  >
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: borderRadius.md,
                      backgroundColor: paymentOption === value ? colors.primary[100] : colors.neutral[100],
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <Icon size={18} color={paymentOption === value ? colors.primary[600] : colors.text.secondary} />
                    </div>
                    <span style={{ fontWeight: typography.fontWeight.medium, color: paymentOption === value ? colors.primary[600] : colors.text.primary }}>
                      {label}
                    </span>
                    {paymentOption === value && (
                      <Icons.CheckCircle size={20} color={colors.primary[600]} style={{ marginLeft: 'auto' }} />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Summary & Checkout */}
          <div
            style={{
              position: 'sticky',
              bottom: spacing[4],
              backgroundColor: colors.neutral[0],
              borderRadius: borderRadius.lg,
              border: `1px solid ${colors.border.light}`,
              padding: spacing[4],
              boxShadow: shadows.lg,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing[4] }}>
              <div>
                <div style={{ fontSize: typography.fontSize.sm, color: colors.text.secondary }}>
                  {summary.total_items} {t('common.items', 'items')} {t('cart.from', 'from')} {summary.total_suppliers} {t('cart.suppliers', 'suppliers')}
                </div>
                <div style={{ fontSize: typography.fontSize['2xl'], fontWeight: typography.fontWeight.bold }}>
                  {summary.total_amount.toLocaleString()} ₾
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={checkingOut || summary.total_items === 0}
                style={{
                  padding: `${spacing[4]} ${spacing[6]}`,
                  backgroundColor: checkingOut ? colors.neutral[400] : colors.success[600],
                  color: colors.text.inverse,
                  border: 'none',
                  borderRadius: borderRadius.lg,
                  cursor: checkingOut ? 'not-allowed' : 'pointer',
                  fontWeight: typography.fontWeight.semibold,
                  fontSize: typography.fontSize.base,
                  display: 'flex',
                  alignItems: 'center',
                  gap: spacing[2],
                }}
              >
                {checkingOut ? (
                  <>
                    <div
                      style={{
                        width: '18px',
                        height: '18px',
                        border: `2px solid ${colors.neutral[0]}`,
                        borderTopColor: 'transparent',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                      }}
                    />
                    {t('cart.processing', 'Processing...')}
                  </>
                ) : (
                  <>
                    <Icons.Check size={20} />
                    {t('cart.checkout', 'Checkout')}
                  </>
                )}
              </button>
            </div>

            <p style={{ fontSize: typography.fontSize.sm, color: colors.text.secondary, margin: 0, textAlign: 'center' }}>
              {t('cart.checkoutNote', 'Items marked as "Direct Order" will create orders. Items marked as "RFQ" will send quote requests.')}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
