/**
 * Create RFQ Page
 * Full RFQ builder with all sections and review
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import * as Icons from 'lucide-react';
import { colors, spacing, typography, borderRadius, shadows } from '../theme/tokens';
import { RFQLineEditor, type RFQLine } from '../components/rfqs/RFQLineEditor';
import { ProjectSelector } from '../components/rfqs/ProjectSelector';
import { SupplierCheckboxList } from '../components/rfqs/SupplierCheckboxList';
import { WindowPicker } from '../components/rfqs/WindowPicker';
import { ConfidenceScoreMeter } from '../components/rfqs/ConfidenceScoreMeter';
import { Notification } from '../components/common/Notification';
import { AddressInput } from '../components/orders/AddressInput';

interface DeliveryWindow {
  start_date: string;
  end_date: string;
  time_slot: 'morning' | 'afternoon' | 'flexible';
  access_notes?: string;
}

export const CreateRFQ: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const skuIdFromUrl = searchParams.get('sku_id');

  // Form state
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [lines, setLines] = useState<RFQLine[]>([]);
  const [deliveryWindow, setDeliveryWindow] = useState<DeliveryWindow | null>(null);
  const [selectedSupplierIds, setSelectedSupplierIds] = useState<string[]>([]);
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [title, setTitle] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState<string>('');
  const [deliveryCoords, setDeliveryCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [deliveryPreference, setDeliveryPreference] = useState<'delivery' | 'pickup' | 'both'>('delivery');

  // UI state
  const [currentStep, setCurrentStep] = useState(1); // Always start at step 1 (Items)
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [projectLocation, setProjectLocation] = useState<{ lat: number; lng: number } | undefined>();
  const [selectedProject, setSelectedProject] = useState<any>(null); // Store full project details
  const [relatedSKUs, setRelatedSKUs] = useState<any[]>([]);
  const [loadingPreselected, setLoadingPreselected] = useState(!!skuIdFromUrl); // Start loading if coming from catalog
  const [preselectedSupplierId, setPreselectedSupplierId] = useState<string | null>(null);
  const [alternativeSuppliers, setAlternativeSuppliers] = useState<any[]>([]);
  const [loadingAlternatives, setLoadingAlternatives] = useState(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info' | 'warning';
    title: string;
    message?: string;
  } | null>(null);

  // Load project location when project is selected
  useEffect(() => {
    if (selectedProjectId) {
      fetchProjectLocation(selectedProjectId);
    }
  }, [selectedProjectId]);

  // Load preselected SKU when coming from product page
  useEffect(() => {
    if (skuIdFromUrl) {
      fetchPreselectedSKU(skuIdFromUrl);
    }
  }, [skuIdFromUrl]);

  // Load alternative suppliers when on review step with preselected supplier
  useEffect(() => {
    const hasSupplierStep = !preselectedSupplierId;
    const isReviewStep = (currentStep === 3 && !hasSupplierStep) || (currentStep === 4 && hasSupplierStep);
    if (isReviewStep && preselectedSupplierId && lines.length > 0) {
      fetchAlternativeSuppliers();
    }
  }, [currentStep, preselectedSupplierId, lines.length]);

  const fetchPreselectedSKU = async (skuId: string) => {
    setLoadingPreselected(true);
    try {
      const response = await fetch(`http://localhost:3001/api/catalog/skus/${skuId}`);
      if (response.ok) {
        const result = await response.json();
        const sku = result.data;

        // Add SKU as first line item
        const description = sku.name_en || sku.name_ka || sku.name || 'Product';

        const newLine: RFQLine = {
          id: `line-${Date.now()}`,
          sku_id: sku.id,
          description: description,
          quantity: 1,
          unit: sku.unit || 'm3',
          spec_notes: sku.spec_string || '',
          base_price: sku.base_price || undefined,
        };
        setLines([newLine]);

        // Auto-select supplier
        if (sku.supplier_id) {
          setPreselectedSupplierId(sku.supplier_id);
          setSelectedSupplierIds([sku.supplier_id]);

          // Fetch related SKUs from same supplier
          fetchRelatedSKUs(sku.supplier_id, [skuId]);
        }
      }
    } catch (error) {
      console.error('Failed to fetch preselected SKU:', error);
    } finally {
      setLoadingPreselected(false);
    }
  };

  const fetchRelatedSKUs = async (supplierId: string, excludeIds: string[]) => {
    try {
      const response = await fetch(
        `http://localhost:3001/api/catalog/skus?supplier_id=${supplierId}&sort=relevance`
      );
      if (response.ok) {
        const result = await response.json();
        const skus = (result.data?.skus || []).filter(
          (sku: any) => !excludeIds.includes(sku.id)
        );
        setRelatedSKUs(skus.slice(0, 5)); // Show max 5 related SKUs
      }
    } catch (error) {
      console.error('Error fetching related SKUs:', error);
    }
  };

  const handleAddRelatedSKU = (sku: any) => {
    const newLine: RFQLine = {
      id: `line-${Date.now()}-${Math.random()}`,
      sku_id: sku.id,
      description: sku.name_en || sku.name_ka || sku.name || 'Product',
      quantity: 1,
      unit: sku.unit || 'm3',
      spec_notes: sku.spec_string || '',
      base_price: sku.base_price || undefined,
    };
    setLines([...lines, newLine]);

    // Remove from related list
    setRelatedSKUs(relatedSKUs.filter((s) => s.id !== sku.id));
  };

  const fetchProjectLocation = async (projectId: string) => {
    try {
      const token = localStorage.getItem('buildapp_auth_token');
      const response = await fetch(`http://localhost:3001/api/buyers/projects/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        if (data.data) {
          setSelectedProject(data.data); // Store full project details
          setProjectLocation({
            lat: data.data.latitude,
            lng: data.data.longitude,
          });
        }
      }
    } catch (error) {
      console.error('Failed to fetch project location:', error);
    }
  };

  const fetchAlternativeSuppliers = async () => {
    setLoadingAlternatives(true);
    try {
      // Get the first line item's SKU ID to find similar products
      const firstSKU = lines[0]?.sku_id;
      if (!firstSKU) return;

      // Fetch the SKU details to get category/product type
      const skuResponse = await fetch(`http://localhost:3001/api/catalog/skus/${firstSKU}`);
      if (!skuResponse.ok) return;

      const skuData = await skuResponse.json();
      const sku = skuData.data;

      // Search for other suppliers offering similar products (same category)
      const suppliersResponse = await fetch(
        `http://localhost:3001/api/suppliers?category=${sku.category || 'concrete'}`
      );

      if (suppliersResponse.ok) {
        const suppliersData = await suppliersResponse.json();
        // Filter out the preselected supplier
        const alternatives = (suppliersData.data || []).filter(
          (s: any) => s.id !== preselectedSupplierId
        ).slice(0, 3); // Show max 3 alternatives

        setAlternativeSuppliers(alternatives);
      }
    } catch (error) {
      console.error('Failed to fetch alternative suppliers:', error);
    } finally {
      setLoadingAlternatives(false);
    }
  };

  const handleAddAlternativeSupplier = (supplierId: string) => {
    if (!selectedSupplierIds.includes(supplierId)) {
      setSelectedSupplierIds([...selectedSupplierIds, supplierId]);
      // Remove from alternatives list
      setAlternativeSuppliers(alternativeSuppliers.filter((s) => s.id !== supplierId));
    }
  };

  const showSuppliersStep = !preselectedSupplierId;

  const steps = showSuppliersStep
    ? [
        { id: 1, label: 'Items', icon: Icons.Package },
        { id: 2, label: 'Delivery', icon: Icons.Calendar },
        { id: 3, label: 'Suppliers', icon: Icons.Users },
        { id: 4, label: 'Review', icon: Icons.CheckCircle },
      ]
    : [
        { id: 1, label: 'Items', icon: Icons.Package },
        { id: 2, label: 'Delivery', icon: Icons.Calendar },
        { id: 3, label: 'Review', icon: Icons.CheckCircle },
      ];

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Project is optional - no validation needed

    if (lines.length === 0) {
      newErrors.lines = 'Please add at least one line item';
    } else {
      const invalidLines = lines.filter((line) => !line.description || line.quantity <= 0);
      if (invalidLines.length > 0) {
        newErrors.lines = 'All lines must have a description and quantity greater than 0';
      }
    }

    // Only require supplier selection if not preselected
    if (!preselectedSupplierId && selectedSupplierIds.length === 0) {
      newErrors.suppliers = 'Please select at least one supplier';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      setNotification({
        type: 'error',
        title: 'Validation Error',
        message: 'Please fix the errors before submitting',
      });
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('buildapp_auth_token');

      const payload = {
        project_id: selectedProjectId || undefined,
        title: title || `RFQ - ${new Date().toLocaleDateString()}`,
        lines: lines.map((line) => ({
          description: line.description,
          quantity: line.quantity,
          unit: line.unit,
          spec_notes: line.spec_notes,
        })),
        preferred_window_start: deliveryWindow?.start_date
          ? `${deliveryWindow.start_date}T08:00:00Z`
          : undefined,
        preferred_window_end: deliveryWindow?.end_date
          ? `${deliveryWindow.end_date}T17:00:00Z`
          : undefined,
        delivery_location_lat: projectLocation?.lat || undefined,
        delivery_location_lng: projectLocation?.lng || undefined,
        delivery_preference: deliveryPreference,
        additional_notes: additionalNotes || undefined,
        supplier_ids: selectedSupplierIds,
      };

      const response = await fetch('http://localhost:3001/api/buyers/rfqs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        setNotification({
          type: 'success',
          title: 'RFQ Sent Successfully!',
          message: `Your request has been sent to ${selectedSupplierIds.length} ${selectedSupplierIds.length === 1 ? 'supplier' : 'suppliers'}. You'll receive offers soon.`,
        });

        // Navigate after a short delay to allow user to see the notification
        setTimeout(() => {
          navigate('/rfqs');
        }, 2000);
      } else {
        const errorData = await response.json();
        setNotification({
          type: 'error',
          title: 'Failed to Send RFQ',
          message: errorData.error || 'Unknown error occurred. Please try again.',
        });
      }
    } catch (error) {
      console.error('Submit error:', error);
      setNotification({
        type: 'error',
        title: 'Network Error',
        message: 'Failed to send RFQ. Please check your connection and try again.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const canGoNext = () => {
    switch (currentStep) {
      case 1:
        return lines.length > 0 && lines.every((line) => line.description && line.quantity > 0);
      case 2:
        return true; // Delivery is optional
      case 3:
        return selectedSupplierIds.length > 0; // Only shown if not preselected
      default:
        return true;
    }
  };

  // Calculate confidence score
  const hasDetailedSpecs = lines.length > 0 && lines.every((line) => line.spec_notes && line.spec_notes.length > 10);
  const hasDeliveryWindow = deliveryWindow !== null && deliveryWindow.start_date && deliveryWindow.end_date;
  const hasAccessNotes = deliveryWindow !== null && deliveryWindow.access_notes && deliveryWindow.access_notes.length > 10;

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: colors.neutral[50],
        padding: spacing[4],
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
          Create RFQ
        </h1>
        <p
          style={{
            fontSize: typography.fontSize.base,
            color: colors.text.secondary,
            margin: 0,
          }}
        >
          Get quotes from multiple suppliers for your construction materials
        </p>
      </div>

      {/* Main Content */}
      <div
        className="rfq-main-content"
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: spacing[6],
          paddingBottom: spacing[12],
        }}
      >
        <style>{`
          @media (min-width: 768px) {
            .rfq-main-content {
              grid-template-columns: 1fr 320px !important;
            }
            .rfq-right-column {
              display: block !important;
            }
            .rfq-step-progress {
              display: flex !important;
            }
          }
        `}</style>
        {/* Left Column - Form Steps */}
        <div style={{ minHeight: '600px' }}>
          {/* Step Progress - Hidden on mobile */}
          <div
            className="rfq-step-progress"
            style={{
              backgroundColor: colors.neutral[0],
              borderRadius: borderRadius.lg,
              padding: spacing[6],
              marginBottom: spacing[6],
              boxShadow: shadows.sm,
              overflow: 'hidden',
              display: 'none',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: spacing[2], width: '100%' }}>
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
                        gap: spacing[1],
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
                          fontWeight: isActive || isCompleted ? typography.fontWeight.semibold : typography.fontWeight.medium,
                          color: isCompleted ? colors.success[700] : isActive ? colors.primary[600] : colors.text.secondary,
                          textAlign: 'center',
                        }}
                      >
                        {step.label}
                      </span>
                    </div>
                    {index < steps.length - 1 && (
                      <div
                        style={{
                          width: '40px',
                          height: '2px',
                          backgroundColor: isCompleted ? colors.success[600] : colors.neutral[200],
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

          {/* Step Content */}
          <div
            style={{
              backgroundColor: colors.neutral[0],
              borderRadius: borderRadius.lg,
              padding: spacing[6],
              boxShadow: shadows.sm,
              minHeight: '500px',
            }}
          >
            {currentStep === 1 && (
              <div>
                {/* Project Selector - Integrated into Items Step */}
                <div style={{ marginBottom: spacing[6] }}>
                  <ProjectSelector
                    selectedProjectId={selectedProjectId}
                    onSelectProject={setSelectedProjectId}
                    onCreateNew={() => navigate('/projects/new')}
                  />
                </div>

                {/* Line Items Editor */}
                {loadingPreselected ? (
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: spacing[12],
                    }}
                  >
                    <Icons.Loader
                      size={48}
                      color={colors.text.tertiary}
                      style={{ animation: 'spin 1s linear infinite', marginBottom: spacing[4] }}
                    />
                    <p
                      style={{
                        fontSize: typography.fontSize.base,
                        color: colors.text.secondary,
                        margin: 0,
                      }}
                    >
                      Loading product details...
                    </p>
                  </div>
                ) : (
                  <>
                    <RFQLineEditor lines={lines} onChange={setLines} />
                    {errors.lines && (
                      <p
                        style={{
                          fontSize: typography.fontSize.sm,
                          color: colors.error[600],
                          marginTop: spacing[3],
                        }}
                      >
                        {errors.lines}
                      </p>
                    )}
                  </>
                )}

                {/* Related Products from Same Supplier */}
                {!loadingPreselected && relatedSKUs.length > 0 && (
                  <div
                    style={{
                      marginTop: spacing[6],
                      padding: spacing[4],
                      backgroundColor: colors.primary[50],
                      border: `1px solid ${colors.primary[200]}`,
                      borderRadius: borderRadius.lg,
                    }}
                  >
                    <h3
                      style={{
                        fontSize: typography.fontSize.lg,
                        fontWeight: typography.fontWeight.semibold,
                        color: colors.text.primary,
                        marginBottom: spacing[1],
                        display: 'flex',
                        alignItems: 'center',
                        gap: spacing[2],
                      }}
                    >
                      <Icons.Plus size={20} />
                      Add more from the same supplier
                    </h3>
                    <p
                      style={{
                        fontSize: typography.fontSize.sm,
                        color: colors.text.secondary,
                        marginBottom: spacing[4],
                        margin: 0,
                        marginBottom: spacing[4],
                      }}
                    >
                      Add related products to your RFQ in one request
                    </p>
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                        gap: spacing[3],
                      }}
                    >
                      {relatedSKUs.map((sku) => {
                        const isAdded = lines.find((l) => l.sku_id === sku.id);
                        return (
                          <div
                            key={sku.id}
                            onClick={() => !isAdded && handleAddRelatedSKU(sku)}
                            style={{
                              padding: spacing[3],
                              backgroundColor: isAdded ? colors.neutral[100] : colors.neutral[0],
                              border: `1px solid ${isAdded ? colors.neutral[300] : colors.neutral[200]}`,
                              borderRadius: borderRadius.md,
                              cursor: isAdded ? 'default' : 'pointer',
                              opacity: isAdded ? 0.6 : 1,
                              transition: 'all 0.2s',
                            }}
                            onMouseEnter={(e) => {
                              if (!isAdded) {
                                e.currentTarget.style.borderColor = colors.primary[300];
                                e.currentTarget.style.backgroundColor = colors.neutral[50];
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (!isAdded) {
                                e.currentTarget.style.borderColor = colors.neutral[200];
                                e.currentTarget.style.backgroundColor = colors.neutral[0];
                              }
                            }}
                          >
                            <div
                              style={{
                                width: '100%',
                                height: '100px',
                                backgroundColor: colors.neutral[100],
                                borderRadius: borderRadius.md,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: spacing[2],
                              }}
                            >
                              {sku.thumbnail_url ? (
                                <img
                                  src={sku.thumbnail_url}
                                  alt={sku.name_en || sku.name_ka || 'Product'}
                                  style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',
                                    borderRadius: borderRadius.md,
                                  }}
                                />
                              ) : (
                                <Icons.Package size={32} color={colors.neutral[400]} />
                              )}
                            </div>
                            <h4
                              style={{
                                fontSize: typography.fontSize.sm,
                                fontWeight: typography.fontWeight.semibold,
                                color: colors.text.primary,
                                marginBottom: spacing[1],
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {sku.name_en || sku.name_ka || sku.name || 'Product'}
                            </h4>
                            {sku.spec_string && (
                              <p
                                style={{
                                  fontSize: typography.fontSize.xs,
                                  color: colors.text.secondary,
                                  marginBottom: spacing[2],
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                {sku.spec_string}
                              </p>
                            )}
                            {sku.base_price && (
                              <p
                                style={{
                                  fontSize: typography.fontSize.sm,
                                  fontWeight: typography.fontWeight.semibold,
                                  color: colors.primary[600],
                                }}
                              >
                                {sku.base_price.toLocaleString()} ₾/{sku.unit || 'm³'}
                              </p>
                            )}
                            {isAdded && (
                              <div
                                style={{
                                  marginTop: spacing[2],
                                  padding: `${spacing[1]}px ${spacing[2]}px`,
                                  backgroundColor: colors.success[100],
                                  color: colors.success[700],
                                  borderRadius: borderRadius.sm,
                                  fontSize: typography.fontSize.xs,
                                  fontWeight: typography.fontWeight.medium,
                                  textAlign: 'center',
                                }}
                              >
                                Added
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {currentStep === 2 && (
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
                  Delivery Details
                </h3>

                {/* Delivery or Pickup Preference */}
                <div style={{ marginBottom: spacing[6] }}>
                  <label
                    style={{
                      display: 'block',
                      fontSize: typography.fontSize.sm,
                      fontWeight: typography.fontWeight.medium,
                      color: colors.text.secondary,
                      marginBottom: spacing[3],
                    }}
                  >
                    Delivery Preference
                  </label>
                  <div style={{ display: 'flex', gap: spacing[3] }}>
                    {[
                      { value: 'delivery' as const, icon: Icons.Truck, label: 'Delivery' },
                      { value: 'pickup' as const, icon: Icons.MapPin, label: 'Pickup' },
                      { value: 'both' as const, icon: Icons.ArrowLeftRight, label: 'Either' },
                    ].map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setDeliveryPreference(option.value)}
                        style={{
                          flex: 1,
                          padding: spacing[4],
                          backgroundColor: deliveryPreference === option.value ? colors.primary[50] : colors.neutral[0],
                          border: `2px solid ${deliveryPreference === option.value ? colors.primary[600] : colors.border.light}`,
                          borderRadius: borderRadius.lg,
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: spacing[2],
                          transition: 'all 200ms ease',
                        }}
                        onMouseEnter={(e) => {
                          if (deliveryPreference !== option.value) {
                            e.currentTarget.style.borderColor = colors.primary[300];
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (deliveryPreference !== option.value) {
                            e.currentTarget.style.borderColor = colors.border.light;
                          }
                        }}
                      >
                        <option.icon
                          size={24}
                          color={deliveryPreference === option.value ? colors.primary[600] : colors.text.tertiary}
                        />
                        <span
                          style={{
                            fontSize: typography.fontSize.sm,
                            fontWeight: typography.fontWeight.medium,
                            color: deliveryPreference === option.value ? colors.primary[700] : colors.text.secondary,
                          }}
                        >
                          {option.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Delivery Address with Map - Only show for delivery or both */}
                {(deliveryPreference === 'delivery' || deliveryPreference === 'both') && (
                  <div style={{ marginBottom: spacing[6] }}>
                    <label
                      style={{
                        display: 'block',
                        fontSize: typography.fontSize.sm,
                        fontWeight: typography.fontWeight.medium,
                        color: colors.text.secondary,
                        marginBottom: spacing[2],
                      }}
                    >
                      Delivery Address
                    </label>
                    <AddressInput
                      value={deliveryAddress}
                      onChange={(address, coords) => {
                        setDeliveryAddress(address);
                        setDeliveryCoords(coords || null);
                      }}
                      placeholder="Start typing address for suggestions..."
                      latitude={deliveryCoords?.lat}
                      longitude={deliveryCoords?.lng}
                    />
                    <p
                      style={{
                        fontSize: typography.fontSize.xs,
                        color: colors.text.tertiary,
                        margin: 0,
                        marginTop: spacing[2],
                      }}
                    >
                      Enter the delivery address or select from map. This is optional if you've already selected a project.
                    </p>
                  </div>
                )}

                {/* Delivery Window */}
                <WindowPicker
                  window={deliveryWindow}
                  onChange={setDeliveryWindow}
                  mode={deliveryPreference === 'pickup' ? 'pickup' : 'delivery'}
                />
              </div>
            )}

            {currentStep === 3 && showSuppliersStep && (
              <div>
                <SupplierCheckboxList
                  selectedSupplierIds={selectedSupplierIds}
                  onSelectionChange={setSelectedSupplierIds}
                  projectLocation={projectLocation}
                />
                {errors.suppliers && (
                  <p
                    style={{
                      fontSize: typography.fontSize.sm,
                      color: colors.error[600],
                      marginTop: spacing[3],
                    }}
                  >
                    {errors.suppliers}
                  </p>
                )}
              </div>
            )}

            {((currentStep === 3 && !showSuppliersStep) || (currentStep === 4 && showSuppliersStep)) && (
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
                  Review & Send
                </h3>

                {/* Summary Cards */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[4] }}>
                  {/* Title */}
                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: typography.fontSize.sm,
                        fontWeight: typography.fontWeight.medium,
                        color: colors.text.secondary,
                        marginBottom: spacing[2],
                      }}
                    >
                      RFQ Title (Optional)
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder={`RFQ - ${new Date().toLocaleDateString()}`}
                      style={{
                        width: '100%',
                        padding: spacing[3],
                        border: `1px solid ${colors.border.light}`,
                        borderRadius: borderRadius.md,
                        fontSize: typography.fontSize.base,
                      }}
                    />
                  </div>

                  {/* Summary */}
                  <div
                    style={{
                      padding: spacing[4],
                      backgroundColor: colors.primary[50],
                      borderRadius: borderRadius.lg,
                      border: `1px solid ${colors.primary[200]}`,
                    }}
                  >
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr 1fr',
                        gap: spacing[4],
                      }}
                    >
                      <div>
                        <p
                          style={{
                            fontSize: typography.fontSize.xs,
                            color: colors.text.tertiary,
                            margin: 0,
                            marginBottom: spacing[1],
                          }}
                        >
                          Items
                        </p>
                        <p
                          style={{
                            fontSize: typography.fontSize['2xl'],
                            fontWeight: typography.fontWeight.bold,
                            color: colors.primary[700],
                            margin: 0,
                          }}
                        >
                          {lines.length}
                        </p>
                      </div>
                      <div>
                        <p
                          style={{
                            fontSize: typography.fontSize.xs,
                            color: colors.text.tertiary,
                            margin: 0,
                            marginBottom: spacing[1],
                          }}
                        >
                          Suppliers
                        </p>
                        <p
                          style={{
                            fontSize: typography.fontSize['2xl'],
                            fontWeight: typography.fontWeight.bold,
                            color: colors.primary[700],
                            margin: 0,
                          }}
                        >
                          {selectedSupplierIds.length}
                        </p>
                      </div>
                      <div>
                        <p
                          style={{
                            fontSize: typography.fontSize.xs,
                            color: colors.text.tertiary,
                            margin: 0,
                            marginBottom: spacing[1],
                          }}
                        >
                          {deliveryPreference === 'pickup' ? 'Pickup Window' : 'Delivery Window'}
                        </p>
                        <p
                          style={{
                            fontSize: typography.fontSize.sm,
                            fontWeight: typography.fontWeight.semibold,
                            color: colors.primary[700],
                            margin: 0,
                          }}
                        >
                          {hasDeliveryWindow ? 'Set' : 'Flexible'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Project Details (if selected) */}
                  {selectedProject && (
                    <div
                      style={{
                        backgroundColor: colors.neutral[0],
                        border: `1px solid ${colors.border.light}`,
                        borderRadius: borderRadius.lg,
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          padding: spacing[4],
                          backgroundColor: colors.neutral[50],
                          borderBottom: `1px solid ${colors.border.light}`,
                        }}
                      >
                        <h4
                          style={{
                            fontSize: typography.fontSize.base,
                            fontWeight: typography.fontWeight.semibold,
                            color: colors.text.primary,
                            margin: 0,
                          }}
                        >
                          Linked Project
                        </h4>
                      </div>
                      <div style={{ padding: spacing[4] }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: spacing[3] }}>
                          <Icons.MapPin size={20} color={colors.primary[600]} style={{ flexShrink: 0, marginTop: '2px' }} />
                          <div style={{ flex: 1 }}>
                            <p
                              style={{
                                fontSize: typography.fontSize.base,
                                fontWeight: typography.fontWeight.semibold,
                                color: colors.text.primary,
                                margin: 0,
                                marginBottom: spacing[1],
                              }}
                            >
                              {selectedProject.name}
                            </p>
                            {selectedProject.address && (
                              <p
                                style={{
                                  fontSize: typography.fontSize.sm,
                                  color: colors.text.secondary,
                                  margin: 0,
                                }}
                              >
                                {selectedProject.address}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Requested Items */}
                  <div
                    style={{
                      backgroundColor: colors.neutral[0],
                      border: `1px solid ${colors.border.light}`,
                      borderRadius: borderRadius.lg,
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        padding: spacing[4],
                        backgroundColor: colors.neutral[50],
                        borderBottom: `1px solid ${colors.border.light}`,
                      }}
                    >
                      <h4
                        style={{
                          fontSize: typography.fontSize.base,
                          fontWeight: typography.fontWeight.semibold,
                          color: colors.text.primary,
                          margin: 0,
                        }}
                      >
                        Requested Items
                      </h4>
                    </div>
                    <div style={{ padding: 0 }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                          <tr style={{ backgroundColor: colors.neutral[50], borderBottom: `1px solid ${colors.border.light}` }}>
                            <th style={{ padding: spacing[3], textAlign: 'left', fontSize: typography.fontSize.xs, fontWeight: typography.fontWeight.semibold, color: colors.text.secondary, textTransform: 'uppercase' }}>
                              Product
                            </th>
                            <th style={{ padding: spacing[3], textAlign: 'center', fontSize: typography.fontSize.xs, fontWeight: typography.fontWeight.semibold, color: colors.text.secondary, textTransform: 'uppercase', width: '100px' }}>
                              Quantity
                            </th>
                            <th style={{ padding: spacing[3], textAlign: 'right', fontSize: typography.fontSize.xs, fontWeight: typography.fontWeight.semibold, color: colors.text.secondary, textTransform: 'uppercase', width: '120px' }}>
                              Unit Price
                            </th>
                            <th style={{ padding: spacing[3], textAlign: 'right', fontSize: typography.fontSize.xs, fontWeight: typography.fontWeight.semibold, color: colors.text.secondary, textTransform: 'uppercase', width: '120px' }}>
                              Total
                            </th>
                            <th style={{ padding: spacing[3], textAlign: 'left', fontSize: typography.fontSize.xs, fontWeight: typography.fontWeight.semibold, color: colors.text.secondary, textTransform: 'uppercase' }}>
                              Notes
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {lines.map((line, index) => (
                            <tr
                              key={line.id}
                              style={{
                                borderBottom: index < lines.length - 1 ? `1px solid ${colors.border.light}` : 'none',
                              }}
                            >
                              <td style={{ padding: spacing[3] }}>
                                <p
                                  style={{
                                    fontSize: typography.fontSize.base,
                                    fontWeight: typography.fontWeight.semibold,
                                    color: colors.text.primary,
                                    margin: 0,
                                  }}
                                >
                                  {line.description}
                                </p>
                              </td>
                              <td style={{ padding: spacing[3], textAlign: 'center' }}>
                                <p
                                  style={{
                                    fontSize: typography.fontSize.lg,
                                    fontWeight: typography.fontWeight.bold,
                                    color: colors.primary[600],
                                    margin: 0,
                                  }}
                                >
                                  {line.quantity} {line.unit}
                                </p>
                              </td>
                              <td style={{ padding: spacing[3], textAlign: 'right' }}>
                                <p
                                  style={{
                                    fontSize: typography.fontSize.base,
                                    fontWeight: typography.fontWeight.medium,
                                    color: line.base_price ? colors.text.primary : colors.text.tertiary,
                                    margin: 0,
                                  }}
                                >
                                  {line.base_price ? `${line.base_price.toLocaleString()} ₾` : 'TBD'}
                                </p>
                              </td>
                              <td style={{ padding: spacing[3], textAlign: 'right' }}>
                                <p
                                  style={{
                                    fontSize: typography.fontSize.lg,
                                    fontWeight: typography.fontWeight.bold,
                                    color: line.base_price ? colors.primary[700] : colors.text.tertiary,
                                    margin: 0,
                                  }}
                                >
                                  {line.base_price ? `${(line.base_price * line.quantity).toLocaleString()} ₾` : 'TBD'}
                                </p>
                              </td>
                              <td style={{ padding: spacing[3] }}>
                                <p
                                  style={{
                                    fontSize: typography.fontSize.sm,
                                    color: colors.text.secondary,
                                    margin: 0,
                                  }}
                                >
                                  {line.spec_notes || 'Standard specifications'}
                                </p>
                              </td>
                            </tr>
                          ))}
                          {/* Total Row (if any items have prices) */}
                          {lines.some(line => line.base_price) && (
                            <tr style={{ backgroundColor: colors.neutral[50], borderTop: `2px solid ${colors.border.light}` }}>
                              <td colSpan={3} style={{ padding: spacing[4], textAlign: 'right' }}>
                                <p
                                  style={{
                                    fontSize: typography.fontSize.lg,
                                    fontWeight: typography.fontWeight.bold,
                                    color: colors.text.primary,
                                    margin: 0,
                                  }}
                                >
                                  Estimated Total:
                                </p>
                              </td>
                              <td style={{ padding: spacing[4], textAlign: 'right' }}>
                                <p
                                  style={{
                                    fontSize: typography.fontSize['2xl'],
                                    fontWeight: typography.fontWeight.bold,
                                    color: colors.primary[700],
                                    margin: 0,
                                  }}
                                >
                                  {lines.reduce((sum, line) => sum + (line.base_price ? line.base_price * line.quantity : 0), 0).toLocaleString()} ₾
                                </p>
                              </td>
                              <td style={{ padding: spacing[4] }}>
                                <p
                                  style={{
                                    fontSize: typography.fontSize.xs,
                                    color: colors.text.tertiary,
                                    margin: 0,
                                    fontStyle: 'italic',
                                  }}
                                >
                                  Approximate
                                </p>
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Recipients (Suppliers) */}
                  <div
                    style={{
                      backgroundColor: colors.neutral[0],
                      border: `1px solid ${colors.border.light}`,
                      borderRadius: borderRadius.lg,
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        padding: spacing[4],
                        backgroundColor: colors.neutral[50],
                        borderBottom: `1px solid ${colors.border.light}`,
                      }}
                    >
                      <h4
                        style={{
                          fontSize: typography.fontSize.base,
                          fontWeight: typography.fontWeight.semibold,
                          color: colors.text.primary,
                          margin: 0,
                        }}
                      >
                        RFQ Recipients ({selectedSupplierIds.length} {selectedSupplierIds.length === 1 ? 'Supplier' : 'Suppliers'})
                      </h4>
                    </div>
                    <div style={{ padding: spacing[4] }}>
                      <p
                        style={{
                          fontSize: typography.fontSize.sm,
                          color: colors.text.secondary,
                          margin: 0,
                        }}
                      >
                        Your RFQ will be sent to {selectedSupplierIds.length} selected {selectedSupplierIds.length === 1 ? 'supplier' : 'suppliers'}. They will receive your request and can submit competitive quotes.
                      </p>
                    </div>
                  </div>

                  {/* Delivery Details */}
                  {deliveryWindow && (
                    <div
                      style={{
                        backgroundColor: colors.neutral[0],
                        border: `1px solid ${colors.border.light}`,
                        borderRadius: borderRadius.lg,
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          padding: spacing[4],
                          backgroundColor: colors.neutral[50],
                          borderBottom: `1px solid ${colors.border.light}`,
                        }}
                      >
                        <h4
                          style={{
                            fontSize: typography.fontSize.base,
                            fontWeight: typography.fontWeight.semibold,
                            color: colors.text.primary,
                            margin: 0,
                          }}
                        >
                          {deliveryPreference === 'pickup'
                            ? 'Pickup Preferences'
                            : deliveryPreference === 'both'
                            ? 'Delivery/Pickup Preferences'
                            : 'Delivery Preferences'}
                        </h4>
                      </div>
                      <div style={{ padding: spacing[4] }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: spacing[4] }}>
                          <div>
                            <p
                              style={{
                                fontSize: typography.fontSize.xs,
                                color: colors.text.tertiary,
                                margin: 0,
                                marginBottom: spacing[1],
                              }}
                            >
                              {deliveryPreference === 'pickup' ? 'Pickup Window' : 'Delivery Window'}
                            </p>
                            <p
                              style={{
                                fontSize: typography.fontSize.sm,
                                fontWeight: typography.fontWeight.medium,
                                color: colors.text.primary,
                                margin: 0,
                              }}
                            >
                              {new Date(deliveryWindow.start_date).toLocaleDateString()} -{' '}
                              {new Date(deliveryWindow.end_date).toLocaleDateString()}
                            </p>
                          </div>
                          <div>
                            <p
                              style={{
                                fontSize: typography.fontSize.xs,
                                color: colors.text.tertiary,
                                margin: 0,
                                marginBottom: spacing[1],
                              }}
                            >
                              Time Preference
                            </p>
                            <p
                              style={{
                                fontSize: typography.fontSize.sm,
                                fontWeight: typography.fontWeight.medium,
                                color: colors.text.primary,
                                margin: 0,
                                textTransform: 'capitalize',
                              }}
                            >
                              {deliveryWindow.time_slot}
                            </p>
                          </div>
                        </div>
                        {deliveryWindow.access_notes && (
                          <div style={{ marginTop: spacing[3] }}>
                            <p
                              style={{
                                fontSize: typography.fontSize.xs,
                                color: colors.text.tertiary,
                                margin: 0,
                                marginBottom: spacing[1],
                              }}
                            >
                              Access Notes
                            </p>
                            <p
                              style={{
                                fontSize: typography.fontSize.sm,
                                color: colors.text.secondary,
                                margin: 0,
                              }}
                            >
                              {deliveryWindow.access_notes}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Alternative Suppliers */}
                  {preselectedSupplierId && alternativeSuppliers.length > 0 && (
                    <div
                      style={{
                        backgroundColor: colors.info[50],
                        border: `1px solid ${colors.info[200]}`,
                        borderRadius: borderRadius.lg,
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          padding: spacing[4],
                          borderBottom: `1px solid ${colors.info[200]}`,
                        }}
                      >
                        <h4
                          style={{
                            fontSize: typography.fontSize.base,
                            fontWeight: typography.fontWeight.semibold,
                            color: colors.info[900],
                            margin: 0,
                            marginBottom: spacing[1],
                          }}
                        >
                          Send to More Suppliers?
                        </h4>
                        <p
                          style={{
                            fontSize: typography.fontSize.sm,
                            color: colors.info[700],
                            margin: 0,
                          }}
                        >
                          Get competitive quotes by sending to these additional suppliers
                        </p>
                      </div>
                      <div style={{ padding: spacing[4] }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[3] }}>
                          {alternativeSuppliers.map((supplier) => (
                            <div
                              key={supplier.id}
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: spacing[3],
                                backgroundColor: colors.neutral[0],
                                border: `1px solid ${colors.border.light}`,
                                borderRadius: borderRadius.md,
                              }}
                            >
                              <div>
                                <p
                                  style={{
                                    fontSize: typography.fontSize.base,
                                    fontWeight: typography.fontWeight.medium,
                                    color: colors.text.primary,
                                    margin: 0,
                                    marginBottom: spacing[1],
                                  }}
                                >
                                  {supplier.business_name}
                                </p>
                                <p
                                  style={{
                                    fontSize: typography.fontSize.xs,
                                    color: colors.text.tertiary,
                                    margin: 0,
                                  }}
                                >
                                  {supplier.depot_address || 'Tbilisi, Georgia'}
                                </p>
                              </div>
                              <button
                                onClick={() => handleAddAlternativeSupplier(supplier.id)}
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
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.backgroundColor = colors.primary[700];
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.backgroundColor = colors.primary[600];
                                }}
                              >
                                <Icons.Plus size={16} />
                                Add
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Additional Notes */}
                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: typography.fontSize.sm,
                        fontWeight: typography.fontWeight.medium,
                        color: colors.text.secondary,
                        marginBottom: spacing[2],
                      }}
                    >
                      Additional Notes (Optional)
                    </label>
                    <textarea
                      value={additionalNotes}
                      onChange={(e) => setAdditionalNotes(e.target.value)}
                      placeholder="Any additional information for suppliers..."
                      rows={4}
                      style={{
                        width: '100%',
                        padding: spacing[3],
                        border: `1px solid ${colors.border.light}`,
                        borderRadius: borderRadius.md,
                        fontSize: typography.fontSize.base,
                        resize: 'vertical',
                        fontFamily: 'inherit',
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
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
                onClick={() => {
                  // Handle Previous navigation with conditional steps
                  if (currentStep === 4 && !showSuppliersStep) {
                    setCurrentStep(2); // Skip suppliers step when going back
                  } else {
                    setCurrentStep(Math.max(1, currentStep - 1));
                  }
                }}
                disabled={currentStep === 1}
                style={{
                  padding: `${spacing[3]} ${spacing[6]}`,
                  backgroundColor: 'transparent',
                  border: `1px solid ${colors.border.light}`,
                  borderRadius: borderRadius.md,
                  fontSize: typography.fontSize.base,
                  fontWeight: typography.fontWeight.medium,
                  color: colors.text.secondary,
                  cursor: currentStep === 1 ? 'not-allowed' : 'pointer',
                  opacity: currentStep === 1 ? 0.5 : 1,
                }}
              >
                Previous
              </button>

              {currentStep < (showSuppliersStep ? 4 : 3) ? (
                <button
                  onClick={() => {
                    // Handle Next navigation with conditional steps
                    if (currentStep === 2 && !showSuppliersStep) {
                      setCurrentStep(3); // Skip suppliers step when going forward (step 2 -> step 3 which is review)
                    } else {
                      setCurrentStep(currentStep + 1);
                    }
                  }}
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
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  style={{
                    padding: `${spacing[2]} ${spacing[4]}`,
                    backgroundColor: submitting ? colors.neutral[300] : colors.primary[600],
                    border: 'none',
                    borderRadius: borderRadius.lg,
                    fontSize: typography.fontSize.base,
                    fontWeight: typography.fontWeight.medium,
                    color: colors.text.inverse,
                    cursor: submitting ? 'not-allowed' : 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: spacing[2],
                    transition: 'background-color 200ms ease',
                  }}
                  onMouseEnter={(e) => {
                    if (!submitting) {
                      e.currentTarget.style.backgroundColor = colors.primary[700];
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!submitting) {
                      e.currentTarget.style.backgroundColor = colors.primary[600];
                    }
                  }}
                >
                  {submitting ? 'Sending...' : 'Send RFQ'}
                  {!submitting && <Icons.Send style={{ width: '16px', height: '16px' }} />}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Confidence Score - Hidden on mobile */}
        <div
          className="rfq-right-column"
          style={{ position: 'sticky', top: spacing[6], height: 'fit-content', display: 'none' }}
        >
          <ConfidenceScoreMeter
            hasProject={selectedProjectId !== null}
            hasLines={lines.length > 0}
            hasDetailedSpecs={hasDetailedSpecs}
            hasDeliveryWindow={hasDeliveryWindow}
            hasAccessNotes={hasAccessNotes}
            isProfileComplete={false} // TODO: Check user profile completion
          />
        </div>
      </div>

      {/* Notification */}
      {notification && (
        <Notification
          type={notification.type}
          title={notification.title}
          message={notification.message}
          onClose={() => setNotification(null)}
          duration={notification.type === 'success' ? 3000 : 5000}
        />
      )}
    </div>
  );
};
