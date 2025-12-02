/**
 * Cart Page
 * Shopping cart with items grouped by supplier
 * Allows checkout to create orders/RFQs
 */

import React, { useState, useEffect, useCallback } from 'react';
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

export const Cart: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [supplierGroups, setSupplierGroups] = useState<SupplierGroup[]>([]);
  const [summary, setSummary] = useState<CartSummary>({ total_items: 0, total_suppliers: 0, total_amount: 0 });
  const [loading, setLoading] = useState(true);
  const [checkingOut, setCheckingOut] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        pickup_or_delivery: 'delivery',
        payment_terms: 'cod',
      });

      if (response.success && response.data) {
        const orders = response.data.orders || [];
        const rfqs = response.data.rfqs || [];

        // Show success and redirect
        if (orders.length > 0 && rfqs.length === 0) {
          navigate('/orders', { state: { message: t('cart.ordersCreated', `${orders.length} order(s) created successfully!`) } });
        } else if (rfqs.length > 0 && orders.length === 0) {
          navigate('/rfqs', { state: { message: t('cart.rfqsCreated', `${rfqs.length} RFQ(s) sent successfully!`) } });
        } else if (orders.length > 0 && rfqs.length > 0) {
          navigate('/orders', { state: { message: t('cart.ordersAndRfqsCreated', `${orders.length} order(s) and ${rfqs.length} RFQ(s) created!`) } });
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
    <div style={{ padding: spacing[4], maxWidth: '1000px', margin: '0 auto' }}>
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
                color: colors.error[600] || colors.error,
                border: `1px solid ${colors.error[300] || colors.error}`,
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
            backgroundColor: colors.error[50] || '#FEF2F2',
            border: `1px solid ${colors.error[200] || colors.error}`,
            borderRadius: borderRadius.md,
            marginBottom: spacing[4],
            display: 'flex',
            alignItems: 'center',
            gap: spacing[2],
          }}
        >
          <Icons.AlertCircle size={20} color={colors.error[600] || colors.error} />
          <span style={{ color: colors.error[700] || colors.error }}>{error}</span>
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
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: spacing[6] }}>
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
                              backgroundColor: item.action_type === 'direct_order' ? colors.success[100] || '#D4EDDA' : colors.info?.[100] || '#D1ECF1',
                              color: item.action_type === 'direct_order' ? colors.success[700] || '#155724' : colors.info?.[700] || '#0C5460',
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
                              color: colors.error[500] || colors.error,
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
                  backgroundColor: checkingOut ? colors.neutral[400] : colors.success[600] || '#28A745',
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
