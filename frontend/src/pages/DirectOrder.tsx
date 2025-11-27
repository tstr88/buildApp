/**
 * Direct Order Page
 * Complete flow for placing direct orders with suppliers
 * 5 Steps: Supplier Selection → Cart/Items → Pickup/Delivery → Scheduling → Review
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import * as Icons from 'lucide-react';
import { colors, spacing, typography, borderRadius, shadows } from '../theme/tokens';
import { DirectOrderCart } from '../components/orders/DirectOrderCart';
import type { CartItem } from '../components/orders/DirectOrderCart';
import { PickupDeliveryToggle } from '../components/orders/PickupDeliveryToggle';
import { WindowSlotPicker } from '../components/orders/WindowSlotPicker';
import { OrderReviewCard } from '../components/orders/OrderReviewCard';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface Supplier {
  id: string;
  business_name: string;
  depot_address?: string;
  depot_latitude?: number;
  depot_longitude?: number;
  min_order_value?: number;
  payment_terms?: string[];
}

interface SKU {
  id: string;
  name_ka: string;
  name_en: string;
  spec_string_ka?: string;
  spec_string_en?: string;
  category_ka: string;
  category_en: string;
  unit_ka: string;
  unit_en: string;
  base_price: number;
  direct_order_available: boolean;
  delivery_options: 'both' | 'pickup' | 'delivery';
  approx_lead_time_label?: string;
  negotiable: boolean;
  stock_status: string;
}

export const DirectOrder: React.FC = () => {
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const { supplierId: urlSupplierId } = useParams();
  const [searchParams] = useSearchParams();

  const isGeorgian = i18n.language === 'ka';

  // Check if supplier_id is in query params
  const supplierIdFromQuery = searchParams.get('supplier_id');
  const initialSupplierId = urlSupplierId || supplierIdFromQuery;

  // Step management
  const [currentStep, setCurrentStep] = useState(initialSupplierId ? 2 : 1);

  // Step 1: Supplier Selection
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [loadingSuppliers, setLoadingSuppliers] = useState(false);

  // Step 2: Cart/Items
  const [availableSKUs, setAvailableSKUs] = useState<SKU[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loadingSKUs, setLoadingSKUs] = useState(false);

  // Step 3: Pickup/Delivery
  const [pickupOrDelivery, setPickupOrDelivery] = useState<'pickup' | 'delivery'>('delivery');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [deliveryAddress, setDeliveryAddress] = useState<string>('');
  const [deliveryCoords, setDeliveryCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [deliveryNotes, setDeliveryNotes] = useState<string>('');

  // Step 4: Scheduling
  const [scheduleMode, setScheduleMode] = useState<'approximate' | 'negotiable'>('approximate');
  const [selectedWindowId, setSelectedWindowId] = useState<string | null>(null);
  const [windowStart, setWindowStart] = useState<string | undefined>();
  const [windowEnd, setWindowEnd] = useState<string | undefined>();
  const [preferredNote, setPreferredNote] = useState<string>('');

  // Step 5: Review & Submit
  const [submitting, setSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [orderDetails, setOrderDetails] = useState<{ id: string; order_number: string } | null>(null);

  useEffect(() => {
    if (currentStep === 1) {
      fetchSuppliers();
    }
  }, [currentStep]);

  useEffect(() => {
    if (initialSupplierId && currentStep === 2) {
      fetchSupplierById(initialSupplierId);
    }
  }, [initialSupplierId, currentStep]);

  useEffect(() => {
    if (selectedSupplier && currentStep === 2) {
      fetchSupplierSKUs(selectedSupplier.id);
    }
  }, [selectedSupplier, currentStep]);

  useEffect(() => {
    // Pre-populate cart from URL params if provided
    const skuId = searchParams.get('sku_id');
    const quantityParam = searchParams.get('quantity');
    if (skuId && availableSKUs.length > 0 && cartItems.length === 0) {
      const sku = availableSKUs.find(s => s.id === skuId);
      if (sku) {
        const quantity = quantityParam ? parseFloat(quantityParam) : 1;
        addToCart(sku, quantity);
      }
    }
  }, [availableSKUs, searchParams, cartItems.length]);

  const fetchSuppliers = async () => {
    setLoadingSuppliers(true);
    try {
      const token = localStorage.getItem('buildapp_auth_token');
      // TODO: Create proper endpoint - for now using mock data
      // const response = await fetch('http://localhost:3001/api/suppliers?direct_order_enabled=true', {
      //   headers: { Authorization: `Bearer ${token}` },
      // });

      // Mock data for now
      setSuppliers([
        {
          id: 'supplier-1',
          business_name: 'BuildMart Concrete',
          depot_address: 'Tbilisi Industrial Zone, Building 12',
          min_order_value: 100,
          payment_terms: ['cod'],
        },
        {
          id: 'supplier-2',
          business_name: 'Premium Materials Ltd',
          depot_address: 'Rustavi Highway Km 15',
          min_order_value: 200,
          payment_terms: ['cod', 'net30'],
        },
      ]);
    } catch (error) {
      console.error('Failed to fetch suppliers:', error);
    } finally {
      setLoadingSuppliers(false);
    }
  };

  const fetchSupplierById = async (id: string) => {
    try {
      const token = localStorage.getItem('buildapp_auth_token');
      const response = await fetch(`${API_URL}/api/factories/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setSelectedSupplier({
          id: data.data.id,
          business_name: data.data.business_name,
          depot_address: data.data.depot_address,
          depot_latitude: data.data.depot_latitude,
          depot_longitude: data.data.depot_longitude,
          min_order_value: data.data.min_order_value,
          payment_terms: data.data.payment_terms || ['cod'],
        });
      } else {
        console.error('Failed to fetch supplier');
        // Fallback to mock data for now
        setSelectedSupplier({
          id,
          business_name: 'BuildMart Concrete',
          depot_address: 'Tbilisi Industrial Zone, Building 12',
          min_order_value: 100,
          payment_terms: ['cod'],
        });
      }
    } catch (error) {
      console.error('Failed to fetch supplier:', error);
      // Fallback to mock data
      setSelectedSupplier({
        id,
        business_name: 'BuildMart Concrete',
        depot_address: 'Tbilisi Industrial Zone, Building 12',
        min_order_value: 100,
        payment_terms: ['cod'],
      });
    }
  };

  const fetchSupplierSKUs = async (supplierId: string) => {
    setLoadingSKUs(true);
    try {
      const token = localStorage.getItem('buildapp_auth_token');
      const lang = localStorage.getItem('i18nextLng') || 'en';
      const response = await fetch(`${API_URL}/api/factories/${supplierId}/catalog?lang=${lang}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        const skus: SKU[] = data.data.skus.map((item: any) => ({
          id: item.id,
          name_ka: item.name_ka,
          name_en: item.name_en,
          spec_string_ka: item.spec_string_ka,
          spec_string_en: item.spec_string_en,
          category_ka: item.category_ka,
          category_en: item.category_en,
          unit_ka: item.unit_ka,
          unit_en: item.unit_en,
          base_price: item.base_price,
          direct_order_available: item.direct_order_available,
          delivery_options: item.pickup_available && item.delivery_available ? 'both' :
                          item.delivery_available ? 'delivery' : 'pickup',
          approx_lead_time_label: item.lead_time_category,
          negotiable: false, // Not in API response yet
          stock_status: 'in_stock', // Default value
        }));

        setAvailableSKUs(skus);

        // Determine schedule mode based on SKUs
        const hasNegotiable = skus.some(sku => sku.negotiable);
        setScheduleMode(hasNegotiable ? 'negotiable' : 'approximate');
      } else {
        console.error('Failed to fetch SKUs');
        setAvailableSKUs([]);
      }
    } catch (error) {
      console.error('Failed to fetch SKUs:', error);
      setAvailableSKUs([]);
    } finally {
      setLoadingSKUs(false);
    }
  };

  const addToCart = (sku: SKU, quantity: number = 1) => {
    const existingIndex = cartItems.findIndex(item => item.sku_id === sku.id);

    if (existingIndex >= 0) {
      // Update quantity
      const newItems = [...cartItems];
      newItems[existingIndex].quantity += quantity;
      newItems[existingIndex].subtotal = newItems[existingIndex].quantity * newItems[existingIndex].unit_price;
      setCartItems(newItems);
    } else {
      // Add new item
      const name = isGeorgian ? sku.name_ka : sku.name_en;
      const specString = isGeorgian ? sku.spec_string_ka : sku.spec_string_en;
      const unit = isGeorgian ? sku.unit_ka : sku.unit_en;
      const description = specString ? `${specString} ${name}` : name;

      setCartItems([
        ...cartItems,
        {
          sku_id: sku.id,
          description,
          quantity,
          unit,
          unit_price: sku.base_price,
          subtotal: quantity * sku.base_price,
        },
      ]);
    }
  };

  const updateCartQuantity = (index: number, quantity: number) => {
    const newItems = [...cartItems];
    newItems[index].quantity = quantity;
    newItems[index].subtotal = quantity * newItems[index].unit_price;
    setCartItems(newItems);
  };

  const removeCartItem = (index: number) => {
    setCartItems(cartItems.filter((_, i) => i !== index));
  };

  const handleProjectSelect = async (projectId: string) => {
    setSelectedProjectId(projectId);

    // Fetch project details for address
    try {
      const token = localStorage.getItem('buildapp_auth_token');
      const response = await fetch(`${API_URL}/api/buyers/projects/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setDeliveryAddress(data.data.address);
        setDeliveryCoords({
          lat: data.data.latitude,
          lng: data.data.longitude,
        });
      }
    } catch (error) {
      console.error('Failed to fetch project:', error);
    }
  };

  const handleManualAddressChange = (address: string, coords?: { lat: number; lng: number }) => {
    setDeliveryAddress(address);
    setDeliveryCoords(coords || null);
    // Clear project selection when using manual address
    setSelectedProjectId(null);
  };

  const [windowDisplayLabel, setWindowDisplayLabel] = useState<string>('');

  const handleWindowSelect = (windowId: string, start: string, end: string, displayLabel?: string) => {
    setSelectedWindowId(windowId);
    setWindowStart(start);
    setWindowEnd(end);
    setWindowDisplayLabel(displayLabel || '');
  };

  const handlePlaceOrder = async () => {
    if (!selectedSupplier) return;

    setSubmitting(true);
    try {
      const token = localStorage.getItem('buildapp_auth_token');

      const payload = {
        supplier_id: selectedSupplier.id,
        project_id: pickupOrDelivery === 'delivery' ? selectedProjectId : null,
        items: cartItems,
        pickup_or_delivery: pickupOrDelivery,
        delivery_address: pickupOrDelivery === 'delivery' ? deliveryAddress : null,
        delivery_latitude: pickupOrDelivery === 'delivery' ? deliveryCoords?.lat : null,
        delivery_longitude: pickupOrDelivery === 'delivery' ? deliveryCoords?.lng : null,
        promised_window_start: windowStart,
        promised_window_end: windowEnd,
        payment_terms: selectedSupplier.payment_terms?.[0] || 'cod',
        negotiable: scheduleMode === 'negotiable',
        notes: scheduleMode === 'negotiable' ? preferredNote : undefined,
      };

      const response = await fetch(`${API_URL}/api/buyers/orders/direct`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        setOrderDetails({
          id: data.data.id,
          order_number: data.data.order_number,
        });
        setShowSuccessModal(true);

        // Navigate after showing success modal for 2 seconds
        setTimeout(() => {
          navigate(`/orders/${data.data.order_number}`);
        }, 2000);
      } else {
        const errorData = await response.json();
        alert(`Failed to place order: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Place order error:', error);
      alert('Failed to place order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const canGoNext = () => {
    switch (currentStep) {
      case 1:
        return selectedSupplier !== null;
      case 2:
        return cartItems.length > 0;
      case 3:
        if (pickupOrDelivery === 'delivery') {
          // Allow next if either project is selected OR manual address is provided
          return selectedProjectId !== null || deliveryAddress.trim().length > 0;
        }
        return true;
      case 4:
        if (scheduleMode === 'negotiable') return true;
        return selectedWindowId !== null;
      default:
        return true;
    }
  };

  const goNext = () => {
    if (canGoNext()) {
      setCurrentStep(Math.min(5, currentStep + 1));
    }
  };

  const goBack = () => {
    const minStep = showSupplierStep ? 1 : 2;
    setCurrentStep(Math.max(minStep, currentStep - 1));
  };

  // Hide supplier step if coming from product detail page
  const showSupplierStep = !initialSupplierId;

  const steps = showSupplierStep
    ? [
        { id: 1, label: 'Supplier', icon: Icons.Factory },
        { id: 2, label: 'Items', icon: Icons.Package },
        { id: 3, label: 'Delivery', icon: Icons.Truck },
        { id: 4, label: 'Schedule', icon: Icons.Calendar },
        { id: 5, label: 'Review', icon: Icons.CheckCircle },
      ]
    : [
        { id: 2, label: 'Items', icon: Icons.Package },
        { id: 3, label: 'Delivery', icon: Icons.Truck },
        { id: 4, label: 'Schedule', icon: Icons.Calendar },
        { id: 5, label: 'Review', icon: Icons.CheckCircle },
      ];

  const isMobile = window.innerWidth < 768;
  const total = cartItems.reduce((sum, item) => sum + item.subtotal, 0);

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: colors.neutral[50],
        padding: isMobile ? spacing[3] : spacing[6],
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
          onClick={() => navigate(-1)}
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
          Back
        </button>

        <h1
          style={{
            fontSize: typography.fontSize['3xl'],
            fontWeight: typography.fontWeight.bold,
            color: colors.text.primary,
            margin: 0,
            marginBottom: spacing[2],
          }}
        >
          Direct Order
        </h1>
        <p
          style={{
            fontSize: typography.fontSize.base,
            color: colors.text.secondary,
            margin: 0,
          }}
        >
          Order materials directly from suppliers with immediate checkout
        </p>
      </div>

      {/* Progress Steps - Hidden on mobile */}
      {!isMobile && (
        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            marginBottom: spacing[6],
          }}
        >
          <div
            style={{
              backgroundColor: colors.neutral[0],
              borderRadius: borderRadius.lg,
              padding: spacing[4],
              boxShadow: shadows.sm,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              {steps.map((step, index) => {
                const Icon = step.icon;
                const isActive = currentStep === step.id;
                const isCompleted = currentStep > step.id;

                return (
                  <React.Fragment key={step.id}>
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: spacing[2],
                        flex: '0 1 auto',
                        minWidth: '80px',
                      }}
                    >
                      <div
                        style={{
                          position: 'relative',
                          width: '48px',
                          height: '48px',
                          borderRadius: borderRadius.full,
                          backgroundColor: isCompleted
                            ? colors.success[100]
                            : isActive
                            ? colors.primary[600]
                            : colors.neutral[100],
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Icon
                          size={24}
                          color={
                            isCompleted
                              ? colors.success[700]
                              : isActive
                              ? colors.neutral[0]
                              : colors.text.tertiary
                          }
                        />
                        {isCompleted && (
                          <div
                            style={{
                              position: 'absolute',
                              bottom: '-4px',
                              right: '-4px',
                              width: '20px',
                              height: '20px',
                              borderRadius: borderRadius.full,
                              backgroundColor: colors.success[600],
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              border: `2px solid ${colors.neutral[0]}`,
                            }}
                          >
                            <Icons.Check size={12} color={colors.neutral[0]} />
                          </div>
                        )}
                      </div>
                      <span
                        style={{
                          fontSize: typography.fontSize.sm,
                          fontWeight:
                            isActive || isCompleted
                              ? typography.fontWeight.semibold
                              : typography.fontWeight.medium,
                          color: isCompleted
                            ? colors.success[700]
                            : isActive
                            ? colors.primary[600]
                            : colors.text.secondary,
                          textAlign: 'center',
                        }}
                      >
                        {step.label}
                      </span>
                    </div>
                    {index < steps.length - 1 && (
                      <div
                        style={{
                          width: '60px',
                          height: '2px',
                          backgroundColor: isCompleted
                            ? colors.success[600]
                            : colors.neutral[200],
                          marginBottom: spacing[8],
                          flexShrink: 0,
                        }}
                      />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : currentStep === 5 ? '1fr 400px' : '1fr 320px',
          gap: spacing[6],
          paddingBottom: spacing[12],
        }}
      >
        {/* Left Column - Step Content */}
        <div>
          <div
            style={{
              backgroundColor: colors.neutral[0],
              borderRadius: borderRadius.lg,
              padding: isMobile ? spacing[4] : spacing[6],
              boxShadow: shadows.sm,
              minHeight: '500px',
            }}
          >
            {/* Step 1: Supplier Selection */}
            {currentStep === 1 && (
              <div>
                <h3
                  style={{
                    fontSize: typography.fontSize.lg,
                    fontWeight: typography.fontWeight.semibold,
                    color: colors.text.primary,
                    margin: 0,
                    marginBottom: spacing[4],
                  }}
                >
                  Select Supplier
                </h3>

                {loadingSuppliers ? (
                  <div style={{ padding: spacing[6], textAlign: 'center' }}>
                    <Icons.Loader size={32} color={colors.text.tertiary} />
                    <p style={{ marginTop: spacing[2], color: colors.text.tertiary }}>
                      Loading suppliers...
                    </p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[3] }}>
                    {suppliers.map((supplier) => (
                      <button
                        key={supplier.id}
                        onClick={() => setSelectedSupplier(supplier)}
                        style={{
                          padding: spacing[4],
                          border: `2px solid ${
                            selectedSupplier?.id === supplier.id
                              ? colors.primary[600]
                              : colors.border.light
                          }`,
                          borderRadius: borderRadius.lg,
                          backgroundColor:
                            selectedSupplier?.id === supplier.id
                              ? colors.primary[50]
                              : colors.neutral[0],
                          cursor: 'pointer',
                          textAlign: 'left',
                          transition: 'all 200ms ease',
                        }}
                        onMouseEnter={(e) => {
                          if (selectedSupplier?.id !== supplier.id) {
                            e.currentTarget.style.borderColor = colors.primary[300];
                            e.currentTarget.style.backgroundColor = colors.neutral[50];
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (selectedSupplier?.id !== supplier.id) {
                            e.currentTarget.style.borderColor = colors.border.light;
                            e.currentTarget.style.backgroundColor = colors.neutral[0];
                          }
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                          }}
                        >
                          <div>
                            <h4
                              style={{
                                fontSize: typography.fontSize.lg,
                                fontWeight: typography.fontWeight.semibold,
                                color:
                                  selectedSupplier?.id === supplier.id
                                    ? colors.primary[700]
                                    : colors.text.primary,
                                margin: 0,
                                marginBottom: spacing[1],
                              }}
                            >
                              {supplier.business_name}
                            </h4>
                            {supplier.depot_address && (
                              <p
                                style={{
                                  fontSize: typography.fontSize.sm,
                                  color: colors.text.secondary,
                                  margin: 0,
                                  marginBottom: spacing[1],
                                }}
                              >
                                <Icons.MapPin
                                  size={14}
                                  style={{ display: 'inline', marginRight: spacing[1] }}
                                />
                                {supplier.depot_address}
                              </p>
                            )}
                            {supplier.min_order_value && (
                              <p
                                style={{
                                  fontSize: typography.fontSize.xs,
                                  color: colors.text.tertiary,
                                  margin: 0,
                                }}
                              >
                                Min. order: ₾{supplier.min_order_value}
                              </p>
                            )}
                          </div>
                          {selectedSupplier?.id === supplier.id && (
                            <Icons.CheckCircle size={24} color={colors.primary[600]} />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Cart (Main Content) */}
            {currentStep === 2 && (
              <div>
                <h3
                  style={{
                    fontSize: typography.fontSize['2xl'],
                    fontWeight: typography.fontWeight.bold,
                    color: colors.text.primary,
                    margin: 0,
                    marginBottom: spacing[2],
                  }}
                >
                  Your Order
                </h3>
                <p
                  style={{
                    fontSize: typography.fontSize.base,
                    color: colors.text.secondary,
                    margin: 0,
                    marginBottom: spacing[6],
                  }}
                >
                  Review and adjust quantities for {selectedSupplier?.business_name}
                </p>

                <DirectOrderCart
                  items={cartItems}
                  onUpdateQuantity={updateCartQuantity}
                  onRemoveItem={removeCartItem}
                  minOrderValue={selectedSupplier?.min_order_value}
                  isMobile={isMobile}
                />
              </div>
            )}

            {/* Step 3: Pickup or Delivery */}
            {currentStep === 3 && selectedSupplier && (
              <PickupDeliveryToggle
                selectedOption={pickupOrDelivery}
                onOptionChange={setPickupOrDelivery}
                selectedProjectId={selectedProjectId}
                onProjectSelect={handleProjectSelect}
                supplierLocation={{
                  address: selectedSupplier.depot_address || '',
                  latitude: selectedSupplier.depot_latitude,
                  longitude: selectedSupplier.depot_longitude,
                }}
                availableOptions="both"
                onManualAddressChange={handleManualAddressChange}
                manualAddress={deliveryAddress}
                onDeliveryNotesChange={setDeliveryNotes}
                deliveryNotes={deliveryNotes}
              />
            )}

            {/* Step 4: Scheduling */}
            {currentStep === 4 && selectedSupplier && (
              <WindowSlotPicker
                supplierId={selectedSupplier.id}
                mode={scheduleMode}
                selectedWindowId={selectedWindowId}
                onWindowSelect={handleWindowSelect}
                preferredWindowNote={preferredNote}
                onPreferredNoteChange={setPreferredNote}
                pickupOrDelivery={pickupOrDelivery}
              />
            )}

            {/* Step 5: Review - Content shown in right sidebar on desktop */}
            {currentStep === 5 && !isMobile && (
              <div>
                <h3
                  style={{
                    fontSize: typography.fontSize.lg,
                    fontWeight: typography.fontWeight.semibold,
                    color: colors.text.primary,
                    margin: 0,
                    marginBottom: spacing[4],
                  }}
                >
                  Almost There!
                </h3>
                <p
                  style={{
                    fontSize: typography.fontSize.base,
                    color: colors.text.secondary,
                    margin: 0,
                    marginBottom: spacing[4],
                  }}
                >
                  Review your order details in the panel on the right, then click "Place Direct
                  Order" to complete your purchase.
                </p>
                <div
                  style={{
                    padding: spacing[4],
                    backgroundColor: colors.primary[50],
                    border: `1px solid ${colors.primary[200]}`,
                    borderRadius: borderRadius.lg,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: spacing[3] }}>
                    <Icons.Info size={24} color={colors.primary[600]} />
                    <p
                      style={{
                        fontSize: typography.fontSize.sm,
                        color: colors.text.primary,
                        margin: 0,
                      }}
                    >
                      Your order will be sent directly to the supplier for immediate processing.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            {currentStep < 5 && (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginTop: spacing[6],
                  paddingTop: spacing[6],
                  borderTop: `1px solid ${colors.border.light}`,
                }}
              >
                <button
                  onClick={goBack}
                  disabled={currentStep === (showSupplierStep ? 1 : 2)}
                  style={{
                    padding: `${spacing[3]} ${spacing[6]}`,
                    backgroundColor: 'transparent',
                    border: `1px solid ${colors.border.light}`,
                    borderRadius: borderRadius.md,
                    fontSize: typography.fontSize.base,
                    fontWeight: typography.fontWeight.medium,
                    color: colors.text.secondary,
                    cursor: currentStep === (showSupplierStep ? 1 : 2) ? 'not-allowed' : 'pointer',
                    opacity: currentStep === (showSupplierStep ? 1 : 2) ? 0.5 : 1,
                  }}
                >
                  Previous
                </button>

                <button
                  onClick={goNext}
                  disabled={!canGoNext()}
                  style={{
                    padding: `${spacing[3]} ${spacing[6]}`,
                    backgroundColor: canGoNext() ? colors.primary[600] : colors.neutral[300],
                    border: 'none',
                    borderRadius: borderRadius.md,
                    fontSize: typography.fontSize.base,
                    fontWeight: typography.fontWeight.semibold,
                    color: colors.neutral[0],
                    cursor: canGoNext() ? 'pointer' : 'not-allowed',
                  }}
                  onMouseEnter={(e) => {
                    if (canGoNext()) {
                      e.currentTarget.style.backgroundColor = colors.primary[700];
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (canGoNext()) {
                      e.currentTarget.style.backgroundColor = colors.primary[600];
                    }
                  }}
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Add Items (Step 2) or Review (Step 5) */}
        <div style={{ position: isMobile ? 'static' : 'sticky', top: spacing[6], height: 'fit-content' }}>
          {currentStep === 2 ? (
            <div
              style={{
                backgroundColor: colors.neutral[0],
                borderRadius: borderRadius.lg,
                padding: spacing[4],
                boxShadow: shadows.sm,
              }}
            >
              <h4
                style={{
                  fontSize: typography.fontSize.lg,
                  fontWeight: typography.fontWeight.semibold,
                  color: colors.text.primary,
                  margin: 0,
                  marginBottom: spacing[1],
                }}
              >
                Add More Items
              </h4>
              <p
                style={{
                  fontSize: typography.fontSize.sm,
                  color: colors.text.secondary,
                  margin: 0,
                  marginBottom: spacing[4],
                }}
              >
                Other products from this supplier
              </p>

              {loadingSKUs ? (
                <div style={{ padding: spacing[4], textAlign: 'center' }}>
                  <Icons.Loader size={24} color={colors.text.tertiary} />
                  <p style={{ marginTop: spacing[2], fontSize: typography.fontSize.sm, color: colors.text.tertiary }}>
                    Loading...
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[3], maxHeight: '600px', overflowY: 'auto' }}>
                  {availableSKUs
                    .filter(sku => !cartItems.some(item => item.sku_id === sku.id))
                    .slice(0, 5)
                    .map((sku) => {
                      const name = isGeorgian ? sku.name_ka : sku.name_en;
                      const specString = isGeorgian ? sku.spec_string_ka : sku.spec_string_en;
                      const unit = isGeorgian ? sku.unit_ka : sku.unit_en;

                      return (
                        <div
                          key={sku.id}
                          style={{
                            padding: spacing[3],
                            border: `1px solid ${colors.border.light}`,
                            borderRadius: borderRadius.md,
                            backgroundColor: colors.neutral[0],
                          }}
                        >
                          <h5
                            style={{
                              fontSize: typography.fontSize.sm,
                              fontWeight: typography.fontWeight.semibold,
                              color: colors.text.primary,
                              margin: 0,
                              marginBottom: spacing[1],
                            }}
                          >
                            {specString ? `${specString} ${name}` : name}
                          </h5>
                          <p
                            style={{
                              fontSize: typography.fontSize.sm,
                              fontWeight: typography.fontWeight.medium,
                              color: colors.primary[600],
                              margin: 0,
                              marginBottom: spacing[2],
                            }}
                          >
                            ₾{sku.base_price.toFixed(2)} / {unit}
                          </p>
                          <button
                            onClick={() => addToCart(sku)}
                            style={{
                              width: '100%',
                              padding: `${spacing[2]} ${spacing[3]}`,
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
                              gap: spacing[1],
                              transition: 'all 200ms ease',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = colors.primary[50];
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = colors.neutral[0];
                            }}
                          >
                            <Icons.Plus size={14} />
                            Add
                          </button>
                        </div>
                      );
                    })}
                  {availableSKUs.filter(sku => !cartItems.some(item => item.sku_id === sku.id)).length === 0 && (
                    <p style={{ fontSize: typography.fontSize.sm, color: colors.text.tertiary, textAlign: 'center', padding: spacing[4] }}>
                      No more items available
                    </p>
                  )}
                </div>
              )}
            </div>
          ) : currentStep === 5 && selectedSupplier ? (
            <OrderReviewCard
              supplierName={selectedSupplier.business_name}
              items={cartItems}
              total={total}
              deliveryFee={0}
              grandTotal={total}
              pickupOrDelivery={pickupOrDelivery}
              deliveryAddress={deliveryAddress}
              scheduledWindowLabel={windowDisplayLabel}
              isNegotiable={scheduleMode === 'negotiable'}
              paymentTerms={selectedSupplier.payment_terms?.[0] || 'cod'}
              onPlaceOrder={handlePlaceOrder}
              isSubmitting={submitting}
            />
          ) : null}
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && orderDetails && (
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
            zIndex: 9999,
          }}
        >
          <div
            style={{
              backgroundColor: colors.neutral[0],
              borderRadius: borderRadius.xl,
              padding: spacing[8],
              maxWidth: '500px',
              width: '90%',
              boxShadow: shadows.xl,
              textAlign: 'center',
              animation: 'slideIn 0.3s ease-out',
            }}
          >
            <div
              style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                backgroundColor: colors.success[100],
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto',
                marginBottom: spacing[4],
              }}
            >
              <Icons.CheckCircle size={48} color={colors.success[600]} />
            </div>
            <h2
              style={{
                fontSize: typography.fontSize['2xl'],
                fontWeight: typography.fontWeight.bold,
                color: colors.text.primary,
                margin: 0,
                marginBottom: spacing[2],
              }}
            >
              Order Placed Successfully!
            </h2>
            <p
              style={{
                fontSize: typography.fontSize.lg,
                color: colors.text.secondary,
                margin: 0,
                marginBottom: spacing[1],
              }}
            >
              Order #{orderDetails.order_number}
            </p>
            <p
              style={{
                fontSize: typography.fontSize.sm,
                color: colors.text.tertiary,
                margin: 0,
                marginTop: spacing[4],
              }}
            >
              Redirecting to order details...
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
