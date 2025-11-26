/**
 * Supplier Onboarding Page
 * Multi-step flow for suppliers to get live on buildApp (≤60s target)
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import * as Icons from 'lucide-react';
import { colors, spacing, typography, borderRadius, shadows } from '../theme/tokens';
import { OnboardingProgress } from '../components/suppliers/OnboardingProgress';
import { MapPinPicker } from '../components/suppliers/MapPinPicker';
import { QuickProductForm, type QuickProduct } from '../components/suppliers/QuickProductForm';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

type Step = 1 | 2 | 3 | 4 | 5 | 'success';
type DeliveryZone = 'tbilisi_only' | 'tbilisi_25km' | 'tbilisi_50km' | 'all_georgia' | 'pickup_only';

interface OnboardingData {
  // Step 1: Business Info
  businessName: string;

  // Step 2: Location & Coverage
  depotLat: number | null;
  depotLng: number | null;
  depotAddress: string;
  deliveryZone: DeliveryZone | null;

  // Step 3: Categories & Products
  categories: string[];
  products: QuickProduct[];

  // Step 4: Payment & Terms
  paymentMethods: string[];
  minimumOrderValue: string;
  about: string;

  // Step 5: Agreement
  agreedToTerms: boolean;
}

export const SupplierOnboarding: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [data, setData] = useState<OnboardingData>({
    businessName: '',
    depotLat: null,
    depotLng: null,
    depotAddress: '',
    deliveryZone: null,
    categories: [],
    products: [],
    paymentMethods: [],
    minimumOrderValue: '',
    about: '',
    agreedToTerms: false,
  });

  const handleNext = () => {
    setError(null);

    // Validation for each step
    if (currentStep === 1) {
      if (!data.businessName.trim()) {
        setError(t('supplierOnboarding.businessInfo.businessNameRequired'));
        return;
      }
    }

    if (currentStep === 2) {
      if (!data.depotLat || !data.depotLng || !data.deliveryZone) {
        setError(t('supplierOnboarding.location.locationRequired'));
        return;
      }
    }

    if (currentStep === 3) {
      if (data.products.length < 1) {
        setError(t('supplierOnboarding.products.minimumProducts'));
        return;
      }
    }

    if (currentStep === 4) {
      if (data.paymentMethods.length === 0) {
        setError('Please select at least one payment method');
        return;
      }
    }

    if (currentStep === 5) {
      if (!data.agreedToTerms) {
        setError(t('supplierOnboarding.agreement.mustAgree'));
        return;
      }
      // Submit data
      handleSubmit();
      return;
    }

    // Move to next step
    setCurrentStep((prev) => (prev === 'success' ? 'success' : ((prev as number) + 1) as Step));
  };

  const handleBack = () => {
    if (currentStep === 1) {
      navigate(-1);
    } else {
      setCurrentStep((prev) => (prev === 'success' ? 'success' : ((prev as number) - 1) as Step));
    }
    setError(null);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/api/suppliers/onboard`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('buildapp_auth_token')}`,
        },
        body: JSON.stringify({
          business_name: data.businessName,
          depot_lat: data.depotLat,
          depot_lng: data.depotLng,
          depot_address: data.depotAddress,
          delivery_zone: data.deliveryZone,
          categories: data.categories,
          skus: data.products.map(p => ({
            name: p.name,
            unit: p.unit,
            base_price: parseFloat(p.base_price) || 0,
            delivery_option: p.delivery_option,
            direct_order_enabled: p.direct_order_enabled,
            lead_time: p.lead_time,
            custom_days: p.custom_days,
          })),
          payment_methods: data.paymentMethods,
          min_order_value: data.minimumOrderValue ? parseFloat(data.minimumOrderValue) : null,
          about: data.about,
        }),
      });

      if (response.ok) {
        setCurrentStep('success');
      } else {
        const result = await response.json();
        setError(result.message || t('supplierOnboarding.errors.failedToOnboard'));
      }
    } catch (err) {
      console.error('Onboarding error:', err);
      setError(t('supplierOnboarding.errors.pleaseTryAgain'));
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1BusinessInfo data={data} setData={setData} />;
      case 2:
        return <Step2Location data={data} setData={setData} />;
      case 3:
        return <Step3Products data={data} setData={setData} />;
      case 4:
        return <Step4Payment data={data} setData={setData} />;
      case 5:
        return <Step5Agreement data={data} setData={setData} />;
      case 'success':
        return <SuccessScreen onContinue={() => navigate('/supplier/dashboard')} />;
      default:
        return null;
    }
  };

  if (currentStep === 'success') {
    return (
      <div
        style={{
          minHeight: '100vh',
          backgroundColor: colors.neutral[50],
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: spacing[6],
        }}
      >
        <SuccessScreen onContinue={() => navigate('/supplier/dashboard')} />
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: colors.neutral[50],
      }}
    >
      {/* Progress Indicator */}
      <OnboardingProgress currentStep={currentStep as number} totalSteps={5} />

      {/* Main Content */}
      <div
        style={{
          maxWidth: '600px',
          margin: '0 auto',
          padding: spacing[6],
        }}
      >
        {/* Error Message */}
        {error && (
          <div
            style={{
              padding: spacing[3],
              backgroundColor: colors.red[50],
              border: `1px solid ${colors.error[500]}`,
              borderRadius: borderRadius.md,
              marginBottom: spacing[4],
              display: 'flex',
              alignItems: 'center',
              gap: spacing[2],
            }}
          >
            <Icons.AlertCircle size={20} color={colors.error[500]} />
            <span style={{ fontSize: typography.fontSize.sm, color: colors.error[500] }}>
              {error}
            </span>
          </div>
        )}

        {/* Step Content */}
        {renderStep()}

        {/* Navigation Buttons */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: spacing[6],
            gap: spacing[3],
          }}
        >
          <button
            onClick={handleBack}
            disabled={loading}
            style={{
              padding: `${spacing[3]} ${spacing[4]}`,
              backgroundColor: colors.neutral[0],
              border: `1px solid ${colors.border.light}`,
              borderRadius: borderRadius.md,
              fontSize: typography.fontSize.base,
              fontWeight: typography.fontWeight.medium,
              color: colors.text.primary,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.5 : 1,
            }}
          >
            {t('supplierOnboarding.buttons.back')}
          </button>

          <button
            onClick={handleNext}
            disabled={loading}
            style={{
              padding: `${spacing[3]} ${spacing[6]}`,
              backgroundColor: loading ? colors.primary[400] : colors.primary[600],
              border: 'none',
              borderRadius: borderRadius.md,
              fontSize: typography.fontSize.base,
              fontWeight: typography.fontWeight.semibold,
              color: colors.neutral[0],
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: spacing[2],
            }}
          >
            {loading ? (
              <>
                <div
                  style={{
                    width: '16px',
                    height: '16px',
                    border: `2px solid ${colors.neutral[0]}`,
                    borderTopColor: 'transparent',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                  }}
                />
                {t('common.loading')}
              </>
            ) : (
              <>
                {currentStep === 5
                  ? t('supplierOnboarding.buttons.complete')
                  : t('supplierOnboarding.buttons.next')}
                <Icons.ArrowRight size={20} />
              </>
            )}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

// ============================================================================
// STEP 1: Business Information
// ============================================================================

interface StepProps {
  data: OnboardingData;
  setData: React.Dispatch<React.SetStateAction<OnboardingData>>;
}

const Step1BusinessInfo: React.FC<StepProps> = ({ data, setData }) => {
  const { t } = useTranslation();

  return (
    <div
      style={{
        backgroundColor: colors.neutral[0],
        borderRadius: borderRadius.lg,
        padding: spacing[6],
        border: `1px solid ${colors.border.light}`,
      }}
    >
      <h2
        style={{
          fontSize: typography.fontSize['2xl'],
          fontWeight: typography.fontWeight.bold,
          color: colors.text.primary,
          margin: 0,
          marginBottom: spacing[2],
        }}
      >
        {t('supplierOnboarding.businessInfo.title')}
      </h2>
      <p
        style={{
          fontSize: typography.fontSize.base,
          color: colors.text.secondary,
          margin: 0,
          marginBottom: spacing[6],
        }}
      >
        {t('supplierOnboarding.businessInfo.subtitle')}
      </p>

      <div>
        <label
          style={{
            display: 'block',
            fontSize: typography.fontSize.sm,
            fontWeight: typography.fontWeight.medium,
            color: colors.text.primary,
            marginBottom: spacing[2],
          }}
        >
          {t('supplierOnboarding.businessInfo.businessName')}
        </label>
        <input
          type="text"
          value={data.businessName}
          onChange={(e) => setData({ ...data, businessName: e.target.value })}
          placeholder={t('supplierOnboarding.businessInfo.businessNamePlaceholder')}
          autoFocus
          style={{
            width: '100%',
            padding: spacing[3],
            fontSize: typography.fontSize.base,
            border: `1px solid ${colors.border.light}`,
            borderRadius: borderRadius.md,
            outline: 'none',
          }}
        />
      </div>
    </div>
  );
};

// ============================================================================
// STEP 2: Location & Coverage (Text-only for now, map integration later)
// ============================================================================

const Step2Location: React.FC<StepProps> = ({ data, setData }) => {
  const { t } = useTranslation();

  const zones: DeliveryZone[] = [
    'tbilisi_only',
    'tbilisi_25km',
    'tbilisi_50km',
    'all_georgia',
    'pickup_only',
  ];

  const getZoneLabel = (zone: DeliveryZone) => {
    return t(`supplierOnboarding.location.zones.${zone}`);
  };

  return (
    <div
      style={{
        backgroundColor: colors.neutral[0],
        borderRadius: borderRadius.lg,
        padding: spacing[6],
        border: `1px solid ${colors.border.light}`,
      }}
    >
      <h2
        style={{
          fontSize: typography.fontSize['2xl'],
          fontWeight: typography.fontWeight.bold,
          color: colors.text.primary,
          margin: 0,
          marginBottom: spacing[2],
        }}
      >
        {t('supplierOnboarding.location.title')}
      </h2>
      <p
        style={{
          fontSize: typography.fontSize.base,
          color: colors.text.secondary,
          margin: 0,
          marginBottom: spacing[6],
        }}
      >
        {t('supplierOnboarding.location.subtitle')}
      </p>

      {/* Depot Location Map Picker */}
      <div style={{ marginBottom: spacing[6] }}>
        <label
          style={{
            display: 'block',
            fontSize: typography.fontSize.sm,
            fontWeight: typography.fontWeight.medium,
            color: colors.text.primary,
            marginBottom: spacing[3],
          }}
        >
          {t('supplierOnboarding.location.depotLocation')}
        </label>

        <MapPinPicker
          onLocationSelect={(lat, lng, address) => {
            setData({
              ...data,
              depotLat: lat,
              depotLng: lng,
              depotAddress: address,
            });
          }}
          initialLat={data.depotLat}
          initialLng={data.depotLng}
          initialAddress={data.depotAddress}
        />
      </div>

      {/* Delivery Zones */}
      <div>
        <label
          style={{
            display: 'block',
            fontSize: typography.fontSize.sm,
            fontWeight: typography.fontWeight.medium,
            color: colors.text.primary,
            marginBottom: spacing[3],
          }}
        >
          {t('supplierOnboarding.location.deliveryZones')}
        </label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[2] }}>
          {zones.map((zone) => (
            <button
              key={zone}
              type="button"
              onClick={() => setData({ ...data, deliveryZone: zone })}
              style={{
                padding: spacing[3],
                backgroundColor:
                  data.deliveryZone === zone ? colors.primary[50] : colors.neutral[0],
                border: `2px solid ${
                  data.deliveryZone === zone ? colors.primary[600] : colors.border.light
                }`,
                borderRadius: borderRadius.md,
                fontSize: typography.fontSize.base,
                fontWeight: typography.fontWeight.medium,
                color: data.deliveryZone === zone ? colors.primary[700] : colors.text.primary,
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s',
              }}
            >
              {getZoneLabel(zone)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// STEP 3: Categories & Products
// ============================================================================

const Step3Products: React.FC<StepProps> = ({ data, setData }) => {
  const { t } = useTranslation();

  const categories = [
    'concrete',
    'blocks',
    'rebarMesh',
    'aggregates',
    'metalProfiles',
    'toolRentals',
    'other',
  ];

  const getCategoryLabel = (category: string) => {
    return t(`supplierOnboarding.products.categories.${category}`);
  };

  const toggleCategory = (category: string) => {
    const newCategories = data.categories.includes(category)
      ? data.categories.filter((c) => c !== category)
      : [...data.categories, category];
    setData({ ...data, categories: newCategories });
  };

  const addProduct = () => {
    const newProduct: QuickProduct = {
      id: `product-${Date.now()}`,
      name: '',
      unit: 'm3',
      base_price: '',
      delivery_option: 'pickup',
      direct_order_enabled: true,
      lead_time: 'next_day',
    };
    setData({ ...data, products: [...data.products, newProduct] });
  };

  const updateProduct = (productId: string, updatedProduct: QuickProduct) => {
    setData({
      ...data,
      products: data.products.map((p) => (p.id === productId ? updatedProduct : p)),
    });
  };

  const removeProduct = (productId: string) => {
    setData({
      ...data,
      products: data.products.filter((p) => p.id !== productId),
    });
  };

  return (
    <div
      style={{
        backgroundColor: colors.neutral[0],
        borderRadius: borderRadius.lg,
        padding: spacing[6],
        border: `1px solid ${colors.border.light}`,
      }}
    >
      <h2
        style={{
          fontSize: typography.fontSize['2xl'],
          fontWeight: typography.fontWeight.bold,
          color: colors.text.primary,
          margin: 0,
          marginBottom: spacing[2],
        }}
      >
        {t('supplierOnboarding.products.title')}
      </h2>
      <p
        style={{
          fontSize: typography.fontSize.base,
          color: colors.text.secondary,
          margin: 0,
          marginBottom: spacing[6],
        }}
      >
        {t('supplierOnboarding.products.subtitle')}
      </p>

      {/* Categories */}
      <div style={{ marginBottom: spacing[6] }}>
        <label
          style={{
            display: 'block',
            fontSize: typography.fontSize.sm,
            fontWeight: typography.fontWeight.medium,
            color: colors.text.primary,
            marginBottom: spacing[3],
          }}
        >
          {t('supplierOnboarding.products.categoriesLabel')}
        </label>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
            gap: spacing[2],
          }}
        >
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => toggleCategory(category)}
              style={{
                padding: spacing[3],
                backgroundColor: data.categories.includes(category)
                  ? colors.primary[50]
                  : colors.neutral[0],
                border: `2px solid ${
                  data.categories.includes(category) ? colors.primary[600] : colors.border.light
                }`,
                borderRadius: borderRadius.md,
                fontSize: typography.fontSize.sm,
                fontWeight: typography.fontWeight.medium,
                color: data.categories.includes(category) ? colors.primary[700] : colors.text.primary,
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: spacing[2],
              }}
            >
              {data.categories.includes(category) && (
                <Icons.Check size={16} color={colors.primary[600]} />
              )}
              {getCategoryLabel(category)}
            </button>
          ))}
        </div>
      </div>

      {/* Products Section */}
      <div style={{ marginBottom: spacing[4] }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: spacing[3],
          }}
        >
          <label
            style={{
              fontSize: typography.fontSize.sm,
              fontWeight: typography.fontWeight.medium,
              color: colors.text.primary,
            }}
          >
            {t('supplierOnboarding.products.addProductsLabel')}
          </label>
          {data.products.length > 0 && (
            <div
              style={{
                fontSize: typography.fontSize.sm,
                fontWeight: typography.fontWeight.medium,
                color: data.products.length >= 1 ? colors.success[600] : colors.text.tertiary,
              }}
            >
              {t('supplierOnboarding.products.productsAdded', { count: data.products.length })}
            </div>
          )}
        </div>

        {/* Product Forms */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[3] }}>
          {data.products.map((product) => (
            <QuickProductForm
              key={product.id}
              product={product}
              onChange={(updatedProduct) => updateProduct(product.id, updatedProduct)}
              onRemove={() => removeProduct(product.id)}
              showRemove={data.products.length > 1}
            />
          ))}
        </div>

        {/* Add Product Button */}
        <button
          type="button"
          onClick={addProduct}
          style={{
            width: '100%',
            padding: spacing[3],
            marginTop: spacing[3],
            backgroundColor: colors.neutral[0],
            border: `2px dashed ${colors.border.light}`,
            borderRadius: borderRadius.md,
            fontSize: typography.fontSize.base,
            fontWeight: typography.fontWeight.medium,
            color: colors.text.secondary,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: spacing[2],
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = colors.primary[600];
            e.currentTarget.style.color = colors.primary[600];
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = colors.border.light;
            e.currentTarget.style.color = colors.text.secondary;
          }}
        >
          <Icons.Plus size={20} />
          {t('supplierOnboarding.products.productForm.addProduct')}
        </button>
      </div>
    </div>
  );
};

// ============================================================================
// STEP 4: Payment & Terms
// ============================================================================

const Step4Payment: React.FC<StepProps> = ({ data, setData }) => {
  const { t } = useTranslation();

  const paymentMethods = ['cashOnDelivery', 'bankTransfer', 'prepay'];

  const togglePaymentMethod = (method: string) => {
    const newMethods = data.paymentMethods.includes(method)
      ? data.paymentMethods.filter((m) => m !== method)
      : [...data.paymentMethods, method];
    setData({ ...data, paymentMethods: newMethods });
  };

  const handleAboutChange = (value: string) => {
    if (value.length <= 300) {
      setData({ ...data, about: value });
    }
  };

  return (
    <div
      style={{
        backgroundColor: colors.neutral[0],
        borderRadius: borderRadius.lg,
        padding: spacing[6],
        border: `1px solid ${colors.border.light}`,
      }}
    >
      <h2
        style={{
          fontSize: typography.fontSize['2xl'],
          fontWeight: typography.fontWeight.bold,
          color: colors.text.primary,
          margin: 0,
          marginBottom: spacing[2],
        }}
      >
        {t('supplierOnboarding.payment.title')}
      </h2>
      <p
        style={{
          fontSize: typography.fontSize.base,
          color: colors.text.secondary,
          margin: 0,
          marginBottom: spacing[6],
        }}
      >
        {t('supplierOnboarding.payment.subtitle')}
      </p>

      {/* Payment Methods */}
      <div style={{ marginBottom: spacing[6] }}>
        <label
          style={{
            display: 'block',
            fontSize: typography.fontSize.sm,
            fontWeight: typography.fontWeight.medium,
            color: colors.text.primary,
            marginBottom: spacing[3],
          }}
        >
          {t('supplierOnboarding.payment.paymentMethods')}
        </label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[2] }}>
          {paymentMethods.map((method) => (
            <button
              key={method}
              type="button"
              onClick={() => togglePaymentMethod(method)}
              style={{
                padding: spacing[3],
                backgroundColor: data.paymentMethods.includes(method)
                  ? colors.primary[50]
                  : colors.neutral[0],
                border: `2px solid ${
                  data.paymentMethods.includes(method) ? colors.primary[600] : colors.border.light
                }`,
                borderRadius: borderRadius.md,
                fontSize: typography.fontSize.base,
                fontWeight: typography.fontWeight.medium,
                color: data.paymentMethods.includes(method)
                  ? colors.primary[700]
                  : colors.text.primary,
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: spacing[2],
              }}
            >
              {data.paymentMethods.includes(method) && (
                <Icons.Check size={18} color={colors.primary[600]} />
              )}
              {t(`supplierOnboarding.payment.methods.${method}`)}
            </button>
          ))}
        </div>
      </div>

      {/* Minimum Order Value */}
      <div style={{ marginBottom: spacing[6] }}>
        <label
          style={{
            display: 'block',
            fontSize: typography.fontSize.sm,
            fontWeight: typography.fontWeight.medium,
            color: colors.text.primary,
            marginBottom: spacing[2],
          }}
        >
          {t('supplierOnboarding.payment.minimumOrder')}
        </label>
        <input
          type="number"
          value={data.minimumOrderValue}
          onChange={(e) => setData({ ...data, minimumOrderValue: e.target.value })}
          placeholder="0"
          min="0"
          step="1"
          style={{
            width: '100%',
            padding: spacing[3],
            fontSize: typography.fontSize.base,
            border: `1px solid ${colors.border.light}`,
            borderRadius: borderRadius.md,
            outline: 'none',
          }}
        />
      </div>

      {/* About */}
      <div>
        <label
          style={{
            display: 'block',
            fontSize: typography.fontSize.sm,
            fontWeight: typography.fontWeight.medium,
            color: colors.text.primary,
            marginBottom: spacing[2],
          }}
        >
          {t('supplierOnboarding.payment.about')}
        </label>
        <textarea
          value={data.about}
          onChange={(e) => handleAboutChange(e.target.value)}
          placeholder={t('supplierOnboarding.payment.aboutPlaceholder')}
          rows={4}
          style={{
            width: '100%',
            padding: spacing[3],
            fontSize: typography.fontSize.base,
            border: `1px solid ${colors.border.light}`,
            borderRadius: borderRadius.md,
            outline: 'none',
            resize: 'vertical',
            fontFamily: 'inherit',
          }}
        />
        <div
          style={{
            fontSize: typography.fontSize.xs,
            color: data.about.length >= 300 ? colors.error[500] : colors.text.tertiary,
            textAlign: 'right',
            marginTop: spacing[1],
          }}
        >
          {data.about.length} / 300
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// STEP 5: Agreement
// ============================================================================

const Step5Agreement: React.FC<StepProps> = ({ data, setData }) => {
  const { t } = useTranslation();

  const agreementSections = [
    {
      key: 'marketplaceRole',
      icon: <Icons.Store size={24} color={colors.primary[600]} />,
    },
    {
      key: 'successFee',
      icon: <Icons.DollarSign size={24} color={colors.primary[600]} />,
    },
    {
      key: 'deliveryStandards',
      icon: <Icons.Truck size={24} color={colors.primary[600]} />,
    },
    {
      key: 'trustMetrics',
      icon: <Icons.TrendingUp size={24} color={colors.primary[600]} />,
    },
  ];

  return (
    <div
      style={{
        backgroundColor: colors.neutral[0],
        borderRadius: borderRadius.lg,
        padding: spacing[6],
        border: `1px solid ${colors.border.light}`,
      }}
    >
      <h2
        style={{
          fontSize: typography.fontSize['2xl'],
          fontWeight: typography.fontWeight.bold,
          color: colors.text.primary,
          margin: 0,
          marginBottom: spacing[2],
        }}
      >
        {t('supplierOnboarding.agreement.title')}
      </h2>

      {/* Scrollable Agreement Content */}
      <div
        style={{
          maxHeight: '400px',
          overflowY: 'auto',
          padding: spacing[4],
          backgroundColor: colors.neutral[50],
          borderRadius: borderRadius.md,
          border: `1px solid ${colors.border.light}`,
          marginBottom: spacing[6],
        }}
      >
        {agreementSections.map((section) => (
          <div
            key={section.key}
            style={{
              marginBottom: spacing[5],
              paddingBottom: spacing[5],
              borderBottom: `1px solid ${colors.border.light}`,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: spacing[2],
                marginBottom: spacing[2],
              }}
            >
              {section.icon}
              <h3
                style={{
                  fontSize: typography.fontSize.lg,
                  fontWeight: typography.fontWeight.semibold,
                  color: colors.text.primary,
                  margin: 0,
                }}
              >
                {t(`supplierOnboarding.agreement.content.${section.key}.title`)}
              </h3>
            </div>
            <p
              style={{
                fontSize: typography.fontSize.sm,
                color: colors.text.secondary,
                margin: 0,
                lineHeight: typography.lineHeight.relaxed,
              }}
            >
              {t(`supplierOnboarding.agreement.content.${section.key}.description`, {
                rate: '8',
              })}
            </p>
          </div>
        ))}
      </div>

      {/* I Agree Checkbox */}
      <div
        style={{
          padding: spacing[4],
          backgroundColor: colors.primary[50],
          borderRadius: borderRadius.md,
          border: `2px solid ${data.agreedToTerms ? colors.primary[600] : colors.border.light}`,
          cursor: 'pointer',
          transition: 'all 0.2s',
        }}
        onClick={() => setData({ ...data, agreedToTerms: !data.agreedToTerms })}
      >
        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: spacing[3],
            cursor: 'pointer',
          }}
        >
          <div
            style={{
              width: '24px',
              height: '24px',
              borderRadius: borderRadius.sm,
              border: `2px solid ${data.agreedToTerms ? colors.primary[600] : colors.border.default}`,
              backgroundColor: data.agreedToTerms ? colors.primary[600] : colors.neutral[0],
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              transition: 'all 0.2s',
            }}
          >
            {data.agreedToTerms && <Icons.Check size={16} color={colors.neutral[0]} />}
          </div>
          <span
            style={{
              fontSize: typography.fontSize.base,
              fontWeight: typography.fontWeight.medium,
              color: colors.text.primary,
            }}
          >
            {t('supplierOnboarding.agreement.iAgree')}
          </span>
        </label>
      </div>
    </div>
  );
};

// ============================================================================
// SUCCESS SCREEN
// ============================================================================

interface SuccessScreenProps {
  onContinue?: () => void;
}

const SuccessScreen: React.FC<SuccessScreenProps> = ({ onContinue }) => {
  const { t } = useTranslation();

  return (
    <div
      style={{
        backgroundColor: colors.neutral[0],
        borderRadius: borderRadius.lg,
        padding: spacing[8],
        border: `1px solid ${colors.border.light}`,
        textAlign: 'center',
        maxWidth: '500px',
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
          fontSize: typography.fontSize['3xl'],
          fontWeight: typography.fontWeight.bold,
          color: colors.text.primary,
          margin: 0,
          marginBottom: spacing[2],
        }}
      >
        {t('supplierOnboarding.success.title')}
      </h2>

      <p
        style={{
          fontSize: typography.fontSize.lg,
          color: colors.text.secondary,
          margin: 0,
          marginBottom: spacing[1],
        }}
      >
        {t('supplierOnboarding.success.subtitle')}
      </p>

      <p
        style={{
          fontSize: typography.fontSize.sm,
          color: colors.text.tertiary,
          margin: 0,
          marginBottom: spacing[6],
        }}
      >
        {t('supplierOnboarding.success.nextSteps')}
      </p>

      <button
        onClick={onContinue}
        style={{
          padding: `${spacing[3]} ${spacing[6]}`,
          backgroundColor: colors.primary[600],
          border: 'none',
          borderRadius: borderRadius.md,
          fontSize: typography.fontSize.base,
          fontWeight: typography.fontWeight.semibold,
          color: colors.neutral[0],
          cursor: 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          gap: spacing[2],
        }}
      >
        {t('supplierOnboarding.buttons.goToDashboard')}
        <Icons.ArrowRight size={20} />
      </button>
    </div>
  );
};
