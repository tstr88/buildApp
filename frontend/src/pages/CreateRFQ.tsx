/**
 * Create RFQ Page
 * Full RFQ builder with all sections and review
 * Redesigned with BookRentalTool design style
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import * as Icons from 'lucide-react';
import { colors, spacing, typography, borderRadius, shadows, heights } from '../theme/tokens';
import { RFQProductList, type RFQProduct } from '../components/rfqs/RFQProductList';
import { ProjectSelector } from '../components/rfqs/ProjectSelector';
import { SupplierCheckboxList } from '../components/rfqs/SupplierCheckboxList';
import { WindowPicker } from '../components/rfqs/WindowPicker';
import { ConfidenceScoreMeter } from '../components/rfqs/ConfidenceScoreMeter';
import { Notification } from '../components/common/Notification';
import { AddressInput } from '../components/orders/AddressInput';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Hook for mobile detection with proper SSR support
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768;
    }
    return false;
  });

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile;
};

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
  const isMobile = useIsMobile();

  // Form state
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [lines, setLines] = useState<RFQProduct[]>([]);
  const [deliveryWindow, setDeliveryWindow] = useState<DeliveryWindow | null>(null);
  const [selectedSupplierIds, setSelectedSupplierIds] = useState<string[]>([]);
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [title, setTitle] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState<string>('');
  const [deliveryCoords, setDeliveryCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [deliveryPreference, setDeliveryPreference] = useState<'delivery' | 'pickup' | 'both'>('delivery');

  // UI state
  const [currentStep, setCurrentStep] = useState(1);

  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [projectLocation, setProjectLocation] = useState<{ lat: number; lng: number } | undefined>();
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [relatedSKUs, setRelatedSKUs] = useState<any[]>([]);
  const [loadingPreselected, setLoadingPreselected] = useState(!!skuIdFromUrl);
  const [preselectedSupplierId, setPreselectedSupplierId] = useState<string | null>(null);
  const [selectedSuppliers, setSelectedSuppliers] = useState<any[]>([]);
  const [alternativeSuppliers, setAlternativeSuppliers] = useState<any[]>([]);
  const [loadingAlternatives, setLoadingAlternatives] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [rfqDetails, setRfqDetails] = useState<any>(null);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info' | 'warning';
    title: string;
    message?: string;
  } | null>(null);

  // Scroll to top on mount and step change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentStep]);

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

  // Load prefill data from ProjectMaterials page
  useEffect(() => {
    const prefillData = sessionStorage.getItem('rfq_prefill');
    if (prefillData) {
      try {
        const data = JSON.parse(prefillData);
        sessionStorage.removeItem('rfq_prefill'); // Clear after reading

        // Set project
        if (data.project_id) {
          setSelectedProjectId(data.project_id);
        }

        // Set supplier
        if (data.supplier_id) {
          setPreselectedSupplierId(data.supplier_id);
          setSelectedSupplierIds([data.supplier_id]);
        }

        // Set products
        if (data.lines && data.lines.length > 0) {
          const newProducts: RFQProduct[] = data.lines.map((line: any, index: number) => ({
            id: `product-${Date.now()}-${index}`,
            sku_id: line.sku_id || undefined,
            description: line.description || '',
            quantity: line.quantity || 1,
            unit: line.unit || 'm3',
            spec_notes: '',
          }));
          setLines(newProducts);
        }
      } catch (error) {
        console.error('Failed to parse prefill data:', error);
      }
    }
  }, []);

  // Load alternative suppliers when on review step
  useEffect(() => {
    const hasSupplierStep = !preselectedSupplierId;
    const isReviewStep = (currentStep === 3 && !hasSupplierStep) || (currentStep === 4 && hasSupplierStep);
    if (isReviewStep && lines.length > 0 && selectedSupplierIds.length > 0) {
      fetchAlternativeSuppliers();
    }
  }, [currentStep, preselectedSupplierId, lines.length, selectedSupplierIds.length]);

  // Fetch selected supplier details when supplier IDs change
  useEffect(() => {
    if (selectedSupplierIds.length > 0) {
      fetchSelectedSuppliers();
    } else {
      setSelectedSuppliers([]);
    }
  }, [selectedSupplierIds]);

  const fetchPreselectedSKU = async (skuId: string) => {
    setLoadingPreselected(true);
    try {
      const response = await fetch(`${API_URL}/api/catalog/skus/${skuId}`);
      if (response.ok) {
        const result = await response.json();
        const sku = result.data;

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

        if (sku.supplier_id) {
          setPreselectedSupplierId(sku.supplier_id);
          setSelectedSupplierIds([sku.supplier_id]);
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
        `${API_URL}/api/catalog/skus?supplier_id=${supplierId}&sort=relevance`
      );
      if (response.ok) {
        const result = await response.json();
        const skus = (result.data?.skus || []).filter(
          (sku: any) => !excludeIds.includes(sku.id)
        );
        setRelatedSKUs(skus.slice(0, 5));
      }
    } catch (error) {
      console.error('Error fetching related SKUs:', error);
    }
  };

  const handleAddRelatedSKU = (sku: any) => {
    const newProduct: RFQProduct = {
      id: `product-${Date.now()}-${Math.random()}`,
      sku_id: sku.id,
      description: sku.name_en || sku.name_ka || sku.name || 'Product',
      quantity: 1,
      unit: sku.unit || 'm3',
      spec_notes: sku.spec_string || '',
      base_price: sku.base_price || undefined,
    };
    setLines([...lines, newProduct]);
    setRelatedSKUs(relatedSKUs.filter((s) => s.id !== sku.id));
  };

  const handleAddProduct = () => {
    const newProduct: RFQProduct = {
      id: `product-${Date.now()}`,
      description: '',
      quantity: 1,
      unit: 'm3',
      spec_notes: '',
    };
    setLines([...lines, newProduct]);
  };

  const handleUpdateProduct = (id: string, updates: Partial<RFQProduct>) => {
    setLines(lines.map((p) => (p.id === id ? { ...p, ...updates } : p)));
  };

  const handleRemoveProduct = (id: string) => {
    setLines(lines.filter((p) => p.id !== id));
  };

  const fetchProjectLocation = async (projectId: string) => {
    try {
      const token = localStorage.getItem('buildapp_auth_token');
      const response = await fetch(`${API_URL}/api/buyers/projects/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        const project = data.data?.project || data.data;
        if (project) {
          setSelectedProject(project);
          if (project.latitude && project.longitude) {
            setProjectLocation({
              lat: project.latitude,
              lng: project.longitude,
            });
            setDeliveryCoords({
              lat: project.latitude,
              lng: project.longitude,
            });
          }
          // Set delivery address from project
          if (project.address) {
            setDeliveryAddress(project.address);
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch project location:', error);
    }
  };

  const fetchSelectedSuppliers = async () => {
    try {
      const supplierDetails = await Promise.all(
        selectedSupplierIds.map(async (supplierId) => {
          try {
            const response = await fetch(`${API_URL}/api/factories/${supplierId}`);
            if (response.ok) {
              const data = await response.json();
              return data.data;
            }
            return null;
          } catch (error) {
            console.error(`Failed to fetch supplier ${supplierId}:`, error);
            return null;
          }
        })
      );
      setSelectedSuppliers(supplierDetails.filter(Boolean));
    } catch (error) {
      console.error('Failed to fetch selected suppliers:', error);
    }
  };

  const fetchAlternativeSuppliers = async () => {
    setLoadingAlternatives(true);
    try {
      const firstSKU = lines[0]?.sku_id;
      if (!firstSKU) return;

      const skuResponse = await fetch(`${API_URL}/api/catalog/skus/${firstSKU}`);
      if (!skuResponse.ok) return;

      const skuData = await skuResponse.json();
      const sku = skuData.data;

      const suppliersResponse = await fetch(
        `${API_URL}/api/suppliers?category=${sku.category || 'concrete'}`
      );

      if (suppliersResponse.ok) {
        const suppliersData = await suppliersResponse.json();
        const alternatives = (suppliersData.data || []).filter(
          (s: any) => !selectedSupplierIds.includes(s.id)
        ).slice(0, 3);

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
      setAlternativeSuppliers(alternativeSuppliers.filter((s) => s.id !== supplierId));
    }
  };

  const showSuppliersStep = !preselectedSupplierId;

  const steps = showSuppliersStep
    ? [
        { id: 1, label: 'Products', icon: Icons.Package },
        { id: 2, label: 'Delivery', icon: Icons.Truck },
        { id: 3, label: 'Suppliers', icon: Icons.Users },
        { id: 4, label: 'Review', icon: Icons.CheckCircle },
      ]
    : [
        { id: 1, label: 'Products', icon: Icons.Package },
        { id: 2, label: 'Delivery', icon: Icons.Truck },
        { id: 3, label: 'Review', icon: Icons.CheckCircle },
      ];

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (lines.length === 0) {
      newErrors.lines = 'Please add at least one product';
    } else {
      const invalidLines = lines.filter((line) => !line.description || line.quantity <= 0);
      if (invalidLines.length > 0) {
        newErrors.lines = 'All products must have a description and quantity greater than 0';
      }
    }

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
        title: title || undefined,
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

      const response = await fetch(`${API_URL}/api/buyers/rfqs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        setRfqDetails(data.data);
        setShowSuccessModal(true);

        setTimeout(() => {
          navigate(`/rfqs/${data.data.id}`);
        }, 3000);
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
        return true;
      case 3:
        return showSuppliersStep ? selectedSupplierIds.length > 0 : true;
      default:
        return true;
    }
  };

  const goNext = () => {
    if (currentStep === 2 && !showSuppliersStep) {
      setCurrentStep(3);
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const goBack = () => {
    if (currentStep === 3 && !showSuppliersStep) {
      setCurrentStep(2);
    } else {
      setCurrentStep(Math.max(1, currentStep - 1));
    }
  };

  // Calculate confidence score
  const hasDetailedSpecs = lines.length > 0 && lines.every((line) => line.spec_notes && line.spec_notes.length > 10);
  const hasDeliveryWindow = !!(deliveryWindow !== null && deliveryWindow.start_date && deliveryWindow.end_date);
  const hasAccessNotes = !!(deliveryWindow !== null && deliveryWindow.access_notes && deliveryWindow.access_notes.length > 10);

  const isReviewStep = (currentStep === 3 && !showSuppliersStep) || (currentStep === 4 && showSuppliersStep);
  const maxStep = showSuppliersStep ? 4 : 3;

  // Mobile Layout
  if (isMobile) {
    return (
      <div
        style={{
          minHeight: '100vh',
          backgroundColor: colors.neutral[100],
          paddingBottom: `calc(${heights.bottomNav} + env(safe-area-inset-bottom, 0px) + 80px)`,
        }}
      >
        {/* Header */}
        <div
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 100,
            backgroundColor: colors.primary[600],
            padding: spacing[4],
            paddingTop: `calc(${spacing[4]} + env(safe-area-inset-top, 0px))`,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing[3] }}>
            <button
              onClick={() => {
                if (currentStep > 1) {
                  goBack();
                } else {
                  navigate(-1);
                }
              }}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: borderRadius.full,
                backgroundColor: 'rgba(255,255,255,0.2)',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <Icons.ArrowLeft size={20} color={colors.neutral[0]} />
            </button>
            <div style={{ flex: 1 }}>
              <h1
                style={{
                  fontSize: typography.fontSize.xl,
                  fontWeight: typography.fontWeight.bold,
                  color: colors.neutral[0],
                  margin: 0,
                }}
              >
                Create RFQ
              </h1>
              <p
                style={{
                  fontSize: typography.fontSize.sm,
                  color: 'rgba(255,255,255,0.8)',
                  margin: 0,
                }}
              >
                Request for Quotation
              </p>
            </div>
          </div>

          {/* Step Indicator */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: spacing[2],
              marginTop: spacing[4],
            }}
          >
            {steps.map((step, index) => {
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;
              return (
                <React.Fragment key={step.id}>
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: borderRadius.full,
                      backgroundColor: isCompleted
                        ? colors.neutral[0]
                        : isActive
                        ? 'rgba(255,255,255,0.3)'
                        : 'rgba(255,255,255,0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {isCompleted ? (
                      <Icons.Check size={14} color={colors.primary[600]} />
                    ) : (
                      <span
                        style={{
                          fontSize: typography.fontSize.xs,
                          fontWeight: typography.fontWeight.semibold,
                          color: isActive ? colors.neutral[0] : 'rgba(255,255,255,0.6)',
                        }}
                      >
                        {index + 1}
                      </span>
                    )}
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      style={{
                        flex: 1,
                        height: '2px',
                        backgroundColor: isCompleted
                          ? colors.neutral[0]
                          : 'rgba(255,255,255,0.2)',
                      }}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: spacing[4] }}>
          {/* Step 1: Products */}
          {currentStep === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[4] }}>
              {/* Project Selector */}
              <div
                style={{
                  backgroundColor: colors.neutral[0],
                  borderRadius: borderRadius.lg,
                  overflow: 'hidden',
                  boxShadow: shadows.sm,
                }}
              >
                <div
                  style={{
                    padding: spacing[4],
                    borderBottom: `1px solid ${colors.border.light}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: spacing[3],
                  }}
                >
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: borderRadius.md,
                      backgroundColor: colors.info[100],
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Icons.FolderOpen size={18} color={colors.info[600]} />
                  </div>
                  <h3
                    style={{
                      fontSize: typography.fontSize.lg,
                      fontWeight: typography.fontWeight.semibold,
                      color: colors.text.primary,
                      margin: 0,
                    }}
                  >
                    Project (Optional)
                  </h3>
                </div>
                <div style={{ padding: spacing[4] }}>
                  <ProjectSelector
                    selectedProjectId={selectedProjectId}
                    onSelectProject={setSelectedProjectId}
                    onCreateNew={() => navigate('/projects/new')}
                  />
                </div>
              </div>

              {/* Products */}
              <div
                style={{
                  backgroundColor: colors.neutral[0],
                  borderRadius: borderRadius.lg,
                  overflow: 'hidden',
                  boxShadow: shadows.sm,
                }}
              >
                <div
                  style={{
                    padding: spacing[4],
                    borderBottom: `1px solid ${colors.border.light}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: spacing[3],
                  }}
                >
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: borderRadius.md,
                      backgroundColor: colors.primary[100],
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Icons.Package size={18} color={colors.primary[600]} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3
                      style={{
                        fontSize: typography.fontSize.lg,
                        fontWeight: typography.fontWeight.semibold,
                        color: colors.text.primary,
                        margin: 0,
                      }}
                    >
                      Products to Request
                    </h3>
                    <p
                      style={{
                        fontSize: typography.fontSize.sm,
                        color: colors.text.secondary,
                        margin: 0,
                      }}
                    >
                      {lines.length} {lines.length === 1 ? 'product' : 'products'}
                    </p>
                  </div>
                </div>
                <div style={{ padding: spacing[4] }}>
                  {loadingPreselected ? (
                    <div style={{ textAlign: 'center', padding: spacing[6] }}>
                      <Icons.Loader size={32} color={colors.text.tertiary} style={{ animation: 'spin 1s linear infinite' }} />
                      <p style={{ color: colors.text.secondary, marginTop: spacing[2] }}>
                        Loading product details...
                      </p>
                    </div>
                  ) : (
                    <>
                      <RFQProductList
                        products={lines}
                        onUpdateProduct={handleUpdateProduct}
                        onRemoveProduct={handleRemoveProduct}
                        onAddProduct={handleAddProduct}
                        isMobile={isMobile}
                      />
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
                </div>
              </div>

              {/* Related Products */}
              {!loadingPreselected && relatedSKUs.length > 0 && (
                <div
                  style={{
                    backgroundColor: colors.neutral[0],
                    borderRadius: borderRadius.lg,
                    overflow: 'hidden',
                    boxShadow: shadows.sm,
                  }}
                >
                  <div
                    style={{
                      padding: spacing[4],
                      borderBottom: `1px solid ${colors.border.light}`,
                      display: 'flex',
                      alignItems: 'center',
                      gap: spacing[3],
                    }}
                  >
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: borderRadius.md,
                        backgroundColor: colors.secondary[100],
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Icons.Plus size={18} color={colors.secondary[700]} />
                    </div>
                    <h3
                      style={{
                        fontSize: typography.fontSize.lg,
                        fontWeight: typography.fontWeight.semibold,
                        color: colors.text.primary,
                        margin: 0,
                      }}
                    >
                      Add More Products
                    </h3>
                  </div>
                  <div
                    style={{
                      padding: spacing[4],
                      overflowX: 'auto',
                      WebkitOverflowScrolling: 'touch',
                    }}
                  >
                    <div style={{ display: 'flex', gap: spacing[3], minWidth: 'max-content' }}>
                      {relatedSKUs.map((sku) => {
                        const isAdded = lines.find((l) => l.sku_id === sku.id);
                        return (
                          <div
                            key={sku.id}
                            onClick={() => !isAdded && handleAddRelatedSKU(sku)}
                            style={{
                              width: '150px',
                              padding: spacing[3],
                              backgroundColor: isAdded ? colors.neutral[100] : colors.neutral[0],
                              border: `1px solid ${isAdded ? colors.success[300] : colors.border.light}`,
                              borderRadius: borderRadius.lg,
                              cursor: isAdded ? 'default' : 'pointer',
                              flexShrink: 0,
                            }}
                          >
                            <h5
                              style={{
                                fontSize: typography.fontSize.sm,
                                fontWeight: typography.fontWeight.medium,
                                color: colors.text.primary,
                                margin: 0,
                                marginBottom: spacing[1],
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {sku.name_en || sku.name_ka || 'Product'}
                            </h5>
                            {sku.base_price && (
                              <p
                                style={{
                                  fontSize: typography.fontSize.sm,
                                  fontWeight: typography.fontWeight.semibold,
                                  color: colors.primary[600],
                                  margin: 0,
                                  marginBottom: spacing[2],
                                }}
                              >
                                {sku.base_price.toLocaleString()} ₾
                              </p>
                            )}
                            {isAdded ? (
                              <div
                                style={{
                                  padding: spacing[2],
                                  backgroundColor: colors.success[100],
                                  color: colors.success[700],
                                  borderRadius: borderRadius.md,
                                  fontSize: typography.fontSize.xs,
                                  fontWeight: typography.fontWeight.medium,
                                  textAlign: 'center',
                                }}
                              >
                                Added
                              </div>
                            ) : (
                              <button
                                style={{
                                  width: '100%',
                                  padding: spacing[2],
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
                                  gap: spacing[1],
                                }}
                              >
                                <Icons.Plus size={14} />
                                Add
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Delivery */}
          {currentStep === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[4] }}>
              {/* Delivery Preference */}
              <div
                style={{
                  backgroundColor: colors.neutral[0],
                  borderRadius: borderRadius.lg,
                  overflow: 'hidden',
                  boxShadow: shadows.sm,
                }}
              >
                <div
                  style={{
                    padding: spacing[4],
                    borderBottom: `1px solid ${colors.border.light}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: spacing[3],
                  }}
                >
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: borderRadius.md,
                      backgroundColor: colors.info[100],
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Icons.Truck size={18} color={colors.info[600]} />
                  </div>
                  <h3
                    style={{
                      fontSize: typography.fontSize.lg,
                      fontWeight: typography.fontWeight.semibold,
                      color: colors.text.primary,
                      margin: 0,
                    }}
                  >
                    Delivery Preference
                  </h3>
                </div>
                <div style={{ padding: spacing[4] }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[3] }}>
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
                          padding: spacing[4],
                          backgroundColor: deliveryPreference === option.value ? colors.primary[50] : colors.neutral[0],
                          border: `2px solid ${deliveryPreference === option.value ? colors.primary[600] : colors.border.light}`,
                          borderRadius: borderRadius.lg,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: spacing[3],
                        }}
                      >
                        <option.icon
                          size={24}
                          color={deliveryPreference === option.value ? colors.primary[600] : colors.text.tertiary}
                        />
                        <span
                          style={{
                            fontSize: typography.fontSize.base,
                            fontWeight: typography.fontWeight.medium,
                            color: deliveryPreference === option.value ? colors.primary[700] : colors.text.secondary,
                          }}
                        >
                          {option.label}
                        </span>
                        {deliveryPreference === option.value && (
                          <Icons.CheckCircle size={20} color={colors.primary[600]} style={{ marginLeft: 'auto' }} />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Delivery Address */}
              {(deliveryPreference === 'delivery' || deliveryPreference === 'both') && (
                <div
                  style={{
                    backgroundColor: colors.neutral[0],
                    borderRadius: borderRadius.lg,
                    overflow: 'hidden',
                    boxShadow: shadows.sm,
                  }}
                >
                  <div
                    style={{
                      padding: spacing[4],
                      borderBottom: `1px solid ${colors.border.light}`,
                      display: 'flex',
                      alignItems: 'center',
                      gap: spacing[3],
                    }}
                  >
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: borderRadius.md,
                        backgroundColor: colors.warning[100],
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Icons.MapPin size={18} color={colors.warning[700]} />
                    </div>
                    <h3
                      style={{
                        fontSize: typography.fontSize.lg,
                        fontWeight: typography.fontWeight.semibold,
                        color: colors.text.primary,
                        margin: 0,
                      }}
                    >
                      Delivery Address
                    </h3>
                  </div>
                  <div style={{ padding: spacing[4] }}>
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
                  </div>
                </div>
              )}

              {/* Delivery Window */}
              <div
                style={{
                  backgroundColor: colors.neutral[0],
                  borderRadius: borderRadius.lg,
                  overflow: 'hidden',
                  boxShadow: shadows.sm,
                }}
              >
                <div
                  style={{
                    padding: spacing[4],
                    borderBottom: `1px solid ${colors.border.light}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: spacing[3],
                  }}
                >
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: borderRadius.md,
                      backgroundColor: colors.success[100],
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Icons.Calendar size={18} color={colors.success[600]} />
                  </div>
                  <h3
                    style={{
                      fontSize: typography.fontSize.lg,
                      fontWeight: typography.fontWeight.semibold,
                      color: colors.text.primary,
                      margin: 0,
                    }}
                  >
                    {deliveryPreference === 'pickup' ? 'Pickup Window' : 'Delivery Window'}
                  </h3>
                </div>
                <div style={{ padding: spacing[4] }}>
                  <WindowPicker
                    window={deliveryWindow}
                    onChange={setDeliveryWindow}
                    mode={deliveryPreference === 'pickup' ? 'pickup' : 'delivery'}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Suppliers (conditional) */}
          {currentStep === 3 && showSuppliersStep && (
            <div
              style={{
                backgroundColor: colors.neutral[0],
                borderRadius: borderRadius.lg,
                overflow: 'hidden',
                boxShadow: shadows.sm,
              }}
            >
              <div
                style={{
                  padding: spacing[4],
                  borderBottom: `1px solid ${colors.border.light}`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: spacing[3],
                }}
              >
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: borderRadius.md,
                    backgroundColor: colors.secondary[100],
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icons.Users size={18} color={colors.secondary[700]} />
                </div>
                <div style={{ flex: 1 }}>
                  <h3
                    style={{
                      fontSize: typography.fontSize.lg,
                      fontWeight: typography.fontWeight.semibold,
                      color: colors.text.primary,
                      margin: 0,
                    }}
                  >
                    Select Suppliers
                  </h3>
                  <p
                    style={{
                      fontSize: typography.fontSize.sm,
                      color: colors.text.secondary,
                      margin: 0,
                    }}
                  >
                    {selectedSupplierIds.length} selected
                  </p>
                </div>
              </div>
              <div style={{ padding: spacing[4] }}>
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
            </div>
          )}

          {/* Review Step */}
          {isReviewStep && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[4] }}>
              {/* RFQ Title */}
              <div
                style={{
                  backgroundColor: colors.neutral[0],
                  borderRadius: borderRadius.lg,
                  overflow: 'hidden',
                  boxShadow: shadows.sm,
                }}
              >
                <div
                  style={{
                    padding: spacing[4],
                    borderBottom: `1px solid ${colors.border.light}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: spacing[3],
                  }}
                >
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: borderRadius.md,
                      backgroundColor: colors.primary[100],
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Icons.FileText size={18} color={colors.primary[600]} />
                  </div>
                  <h3
                    style={{
                      fontSize: typography.fontSize.lg,
                      fontWeight: typography.fontWeight.semibold,
                      color: colors.text.primary,
                      margin: 0,
                    }}
                  >
                    RFQ Details
                  </h3>
                </div>
                <div style={{ padding: spacing[4] }}>
                  <label
                    style={{
                      display: 'block',
                      fontSize: typography.fontSize.sm,
                      fontWeight: typography.fontWeight.medium,
                      color: colors.text.secondary,
                      marginBottom: spacing[2],
                    }}
                  >
                    Title (Optional)
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Optional - leave blank for auto-generated name"
                    style={{
                      width: '100%',
                      padding: spacing[3],
                      border: `1px solid ${colors.border.light}`,
                      borderRadius: borderRadius.md,
                      fontSize: '16px',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>

              {/* Summary */}
              <div
                style={{
                  backgroundColor: colors.primary[50],
                  borderRadius: borderRadius.lg,
                  padding: spacing[4],
                  border: `1px solid ${colors.primary[200]}`,
                }}
              >
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: spacing[3], textAlign: 'center' }}>
                  <div>
                    <p style={{ fontSize: typography.fontSize.xs, color: colors.text.tertiary, margin: 0 }}>Products</p>
                    <p style={{ fontSize: typography.fontSize.xl, fontWeight: typography.fontWeight.bold, color: colors.primary[700], margin: 0 }}>
                      {lines.length}
                    </p>
                  </div>
                  <div>
                    <p style={{ fontSize: typography.fontSize.xs, color: colors.text.tertiary, margin: 0 }}>Suppliers</p>
                    <p style={{ fontSize: typography.fontSize.xl, fontWeight: typography.fontWeight.bold, color: colors.primary[700], margin: 0 }}>
                      {selectedSupplierIds.length}
                    </p>
                  </div>
                  <div>
                    <p style={{ fontSize: typography.fontSize.xs, color: colors.text.tertiary, margin: 0 }}>Window</p>
                    <p style={{ fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.semibold, color: colors.primary[700], margin: 0 }}>
                      {hasDeliveryWindow ? 'Set' : 'Flex'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Products List */}
              <div
                style={{
                  backgroundColor: colors.neutral[0],
                  borderRadius: borderRadius.lg,
                  overflow: 'hidden',
                  boxShadow: shadows.sm,
                }}
              >
                <div
                  style={{
                    padding: spacing[4],
                    borderBottom: `1px solid ${colors.border.light}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: spacing[3],
                  }}
                >
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: borderRadius.md,
                      backgroundColor: colors.info[100],
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Icons.Package size={18} color={colors.info[600]} />
                  </div>
                  <h3
                    style={{
                      fontSize: typography.fontSize.lg,
                      fontWeight: typography.fontWeight.semibold,
                      color: colors.text.primary,
                      margin: 0,
                    }}
                  >
                    Requested Products
                  </h3>
                </div>
                <div style={{ padding: spacing[4] }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[3] }}>
                    {lines.map((line) => (
                      <div
                        key={line.id}
                        style={{
                          padding: spacing[3],
                          backgroundColor: colors.neutral[50],
                          borderRadius: borderRadius.md,
                        }}
                      >
                        <p
                          style={{
                            fontSize: typography.fontSize.base,
                            fontWeight: typography.fontWeight.medium,
                            color: colors.text.primary,
                            margin: 0,
                            marginBottom: spacing[2],
                          }}
                        >
                          {line.description}
                        </p>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.bold, color: colors.primary[600] }}>
                            {line.quantity} {line.unit}
                          </span>
                          {line.base_price && (
                            <span style={{ fontSize: typography.fontSize.sm, color: colors.text.secondary }}>
                              ~{(line.base_price * line.quantity).toLocaleString()} ₾
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Suppliers */}
              <div
                style={{
                  backgroundColor: colors.neutral[0],
                  borderRadius: borderRadius.lg,
                  overflow: 'hidden',
                  boxShadow: shadows.sm,
                }}
              >
                <div
                  style={{
                    padding: spacing[4],
                    borderBottom: `1px solid ${colors.border.light}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: spacing[3],
                  }}
                >
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: borderRadius.md,
                      backgroundColor: colors.success[100],
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Icons.Building2 size={18} color={colors.success[600]} />
                  </div>
                  <h3
                    style={{
                      fontSize: typography.fontSize.lg,
                      fontWeight: typography.fontWeight.semibold,
                      color: colors.text.primary,
                      margin: 0,
                    }}
                  >
                    Recipients ({selectedSupplierIds.length})
                  </h3>
                </div>
                <div style={{ padding: spacing[4] }}>
                  {selectedSuppliers.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[2] }}>
                      {selectedSuppliers.map((supplier) => (
                        <div
                          key={supplier.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: spacing[3],
                            padding: spacing[3],
                            backgroundColor: colors.primary[50],
                            borderRadius: borderRadius.md,
                          }}
                        >
                          <Icons.Building2 size={18} color={colors.primary[600]} />
                          <span style={{ flex: 1, fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.medium, color: colors.text.primary }}>
                            {supplier.business_name_en || supplier.business_name_ka || supplier.business_name}
                          </span>
                          <Icons.CheckCircle size={18} color={colors.success[600]} />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ fontSize: typography.fontSize.sm, color: colors.text.secondary }}>
                      {selectedSupplierIds.length} suppliers selected
                    </p>
                  )}
                </div>
              </div>

              {/* Additional Notes */}
              <div
                style={{
                  backgroundColor: colors.neutral[0],
                  borderRadius: borderRadius.lg,
                  overflow: 'hidden',
                  boxShadow: shadows.sm,
                }}
              >
                <div
                  style={{
                    padding: spacing[4],
                    borderBottom: `1px solid ${colors.border.light}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: spacing[3],
                  }}
                >
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: borderRadius.md,
                      backgroundColor: colors.warning[100],
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Icons.MessageSquare size={18} color={colors.warning[700]} />
                  </div>
                  <h3
                    style={{
                      fontSize: typography.fontSize.lg,
                      fontWeight: typography.fontWeight.semibold,
                      color: colors.text.primary,
                      margin: 0,
                    }}
                  >
                    Notes (Optional)
                  </h3>
                </div>
                <div style={{ padding: spacing[4] }}>
                  <textarea
                    value={additionalNotes}
                    onChange={(e) => setAdditionalNotes(e.target.value)}
                    placeholder="Any additional information for suppliers..."
                    rows={3}
                    style={{
                      width: '100%',
                      padding: spacing[3],
                      border: `1px solid ${colors.border.light}`,
                      borderRadius: borderRadius.md,
                      fontSize: '16px',
                      resize: 'vertical',
                      fontFamily: 'inherit',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Fixed Bottom CTA */}
        <div
          style={{
            position: 'fixed',
            bottom: `calc(${heights.bottomNav} + env(safe-area-inset-bottom, 0px))`,
            left: 0,
            right: 0,
            backgroundColor: colors.neutral[0],
            padding: spacing[4],
            borderTop: `1px solid ${colors.border.light}`,
            boxShadow: shadows.lg,
            zIndex: 100,
          }}
        >
          <div style={{ display: 'flex', gap: spacing[3] }}>
            {currentStep > 1 && (
              <button
                onClick={goBack}
                style={{
                  flex: 1,
                  padding: spacing[4],
                  backgroundColor: colors.neutral[100],
                  border: 'none',
                  borderRadius: borderRadius.lg,
                  fontSize: typography.fontSize.base,
                  fontWeight: typography.fontWeight.medium,
                  color: colors.text.primary,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: spacing[2],
                }}
              >
                <Icons.ArrowLeft size={18} />
                Back
              </button>
            )}
            {!isReviewStep ? (
              <button
                onClick={goNext}
                disabled={!canGoNext()}
                style={{
                  flex: currentStep === 1 ? 1 : 2,
                  padding: spacing[4],
                  backgroundColor: canGoNext() ? colors.primary[600] : colors.neutral[300],
                  border: 'none',
                  borderRadius: borderRadius.lg,
                  fontSize: typography.fontSize.base,
                  fontWeight: typography.fontWeight.semibold,
                  color: colors.neutral[0],
                  cursor: canGoNext() ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: spacing[2],
                }}
              >
                Continue
                <Icons.ArrowRight size={18} />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                style={{
                  flex: 2,
                  padding: spacing[4],
                  backgroundColor: submitting ? colors.neutral[300] : colors.primary[600],
                  border: 'none',
                  borderRadius: borderRadius.lg,
                  fontSize: typography.fontSize.base,
                  fontWeight: typography.fontWeight.semibold,
                  color: colors.neutral[0],
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: spacing[2],
                }}
              >
                {submitting ? (
                  <>
                    <Icons.Loader size={18} style={{ animation: 'spin 1s linear infinite' }} />
                    Sending...
                  </>
                ) : (
                  <>
                    <Icons.Send size={18} />
                    Send RFQ
                  </>
                )}
              </button>
            )}
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

        {/* Success Modal */}
        {showSuccessModal && rfqDetails && (
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
              padding: spacing[4],
            }}
          >
            <div
              style={{
                backgroundColor: colors.neutral[0],
                borderRadius: borderRadius.xl,
                padding: spacing[6],
                maxWidth: '400px',
                width: '100%',
                boxShadow: shadows.xl,
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  backgroundColor: colors.success[100],
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto',
                  marginBottom: spacing[4],
                }}
              >
                <Icons.CheckCircle size={36} color={colors.success[600]} />
              </div>
              <h2
                style={{
                  fontSize: typography.fontSize.xl,
                  fontWeight: typography.fontWeight.bold,
                  color: colors.text.primary,
                  margin: 0,
                  marginBottom: spacing[2],
                }}
              >
                RFQ Sent!
              </h2>
              <p
                style={{
                  fontSize: typography.fontSize.base,
                  color: colors.text.secondary,
                  margin: 0,
                }}
              >
                Sent to {selectedSupplierIds.length} {selectedSupplierIds.length === 1 ? 'supplier' : 'suppliers'}
              </p>
              <p
                style={{
                  fontSize: typography.fontSize.sm,
                  color: colors.text.tertiary,
                  margin: 0,
                  marginTop: spacing[4],
                }}
              >
                Redirecting to RFQ details...
              </p>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Desktop Layout
  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: colors.neutral[50],
        padding: spacing[6],
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

      {/* Progress Steps */}
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

      {/* Main Content */}
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: '1fr 320px',
          gap: spacing[6],
          paddingBottom: spacing[12],
        }}
      >
        {/* Left Column */}
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              backgroundColor: colors.neutral[0],
              borderRadius: borderRadius.lg,
              padding: spacing[6],
              boxShadow: shadows.sm,
              minHeight: '500px',
            }}
          >
            {/* Step 1: Products */}
            {currentStep === 1 && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: spacing[3], marginBottom: spacing[4] }}>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: borderRadius.md,
                      backgroundColor: colors.primary[100],
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Icons.Package size={18} color={colors.primary[600]} />
                  </div>
                  <h3
                    style={{
                      fontSize: typography.fontSize.lg,
                      fontWeight: typography.fontWeight.semibold,
                      color: colors.text.primary,
                      margin: 0,
                    }}
                  >
                    Products & Project
                  </h3>
                </div>

                {/* Project Selector */}
                <div style={{ marginBottom: spacing[6] }}>
                  <ProjectSelector
                    selectedProjectId={selectedProjectId}
                    onSelectProject={setSelectedProjectId}
                    onCreateNew={() => navigate('/projects/new')}
                  />
                </div>

                {/* Products */}
                {loadingPreselected ? (
                  <div style={{ textAlign: 'center', padding: spacing[12] }}>
                    <Icons.Loader size={48} color={colors.text.tertiary} style={{ animation: 'spin 1s linear infinite' }} />
                    <p style={{ marginTop: spacing[4], color: colors.text.secondary }}>
                      Loading product details...
                    </p>
                  </div>
                ) : (
                  <>
                    <RFQProductList
                      products={lines}
                      onUpdateProduct={handleUpdateProduct}
                      onRemoveProduct={handleRemoveProduct}
                      onAddProduct={handleAddProduct}
                      isMobile={false}
                    />
                    {errors.lines && (
                      <p style={{ fontSize: typography.fontSize.sm, color: colors.error[600], marginTop: spacing[3] }}>
                        {errors.lines}
                      </p>
                    )}
                  </>
                )}

                {/* Related Products */}
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
                    <h4 style={{ fontSize: typography.fontSize.base, fontWeight: typography.fontWeight.semibold, color: colors.text.primary, margin: 0, marginBottom: spacing[3] }}>
                      Add more from the same supplier
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: spacing[3] }}>
                      {relatedSKUs.map((sku) => {
                        const isAdded = lines.find((l) => l.sku_id === sku.id);
                        return (
                          <div
                            key={sku.id}
                            onClick={() => !isAdded && handleAddRelatedSKU(sku)}
                            style={{
                              padding: spacing[3],
                              backgroundColor: isAdded ? colors.neutral[100] : colors.neutral[0],
                              border: `1px solid ${isAdded ? colors.success[300] : colors.border.light}`,
                              borderRadius: borderRadius.md,
                              cursor: isAdded ? 'default' : 'pointer',
                            }}
                          >
                            <h5 style={{ fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.medium, color: colors.text.primary, margin: 0, marginBottom: spacing[1] }}>
                              {sku.name_en || sku.name_ka || 'Product'}
                            </h5>
                            {sku.base_price && (
                              <p style={{ fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.semibold, color: colors.primary[600], margin: 0 }}>
                                {sku.base_price.toLocaleString()} ₾
                              </p>
                            )}
                            {isAdded && (
                              <div style={{ marginTop: spacing[2], padding: spacing[1], backgroundColor: colors.success[100], color: colors.success[700], borderRadius: borderRadius.sm, fontSize: typography.fontSize.xs, textAlign: 'center' }}>
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

            {/* Step 2: Delivery */}
            {currentStep === 2 && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: spacing[3], marginBottom: spacing[4] }}>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: borderRadius.md,
                      backgroundColor: colors.info[100],
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Icons.Truck size={18} color={colors.info[600]} />
                  </div>
                  <h3
                    style={{
                      fontSize: typography.fontSize.lg,
                      fontWeight: typography.fontWeight.semibold,
                      color: colors.text.primary,
                      margin: 0,
                    }}
                  >
                    Delivery Details
                  </h3>
                </div>

                {/* Delivery Preference */}
                <div style={{ marginBottom: spacing[6] }}>
                  <label style={{ display: 'block', fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.medium, color: colors.text.secondary, marginBottom: spacing[3] }}>
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
                        }}
                      >
                        <option.icon size={24} color={deliveryPreference === option.value ? colors.primary[600] : colors.text.tertiary} />
                        <span style={{ fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.medium, color: deliveryPreference === option.value ? colors.primary[700] : colors.text.secondary }}>
                          {option.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Delivery Address */}
                {(deliveryPreference === 'delivery' || deliveryPreference === 'both') && (
                  <div style={{ marginBottom: spacing[6] }}>
                    <label style={{ display: 'block', fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.medium, color: colors.text.secondary, marginBottom: spacing[2] }}>
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

            {/* Step 3: Suppliers (conditional) */}
            {currentStep === 3 && showSuppliersStep && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: spacing[3], marginBottom: spacing[4] }}>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: borderRadius.md,
                      backgroundColor: colors.secondary[100],
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Icons.Users size={18} color={colors.secondary[700]} />
                  </div>
                  <h3
                    style={{
                      fontSize: typography.fontSize.lg,
                      fontWeight: typography.fontWeight.semibold,
                      color: colors.text.primary,
                      margin: 0,
                    }}
                  >
                    Select Suppliers
                  </h3>
                </div>

                <SupplierCheckboxList
                  selectedSupplierIds={selectedSupplierIds}
                  onSelectionChange={setSelectedSupplierIds}
                  projectLocation={projectLocation}
                />
                {errors.suppliers && (
                  <p style={{ fontSize: typography.fontSize.sm, color: colors.error[600], marginTop: spacing[3] }}>
                    {errors.suppliers}
                  </p>
                )}
              </div>
            )}

            {/* Review Step */}
            {isReviewStep && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: spacing[3], marginBottom: spacing[4] }}>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: borderRadius.md,
                      backgroundColor: colors.success[100],
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Icons.CheckCircle size={18} color={colors.success[600]} />
                  </div>
                  <h3
                    style={{
                      fontSize: typography.fontSize.lg,
                      fontWeight: typography.fontWeight.semibold,
                      color: colors.text.primary,
                      margin: 0,
                    }}
                  >
                    Review & Send
                  </h3>
                </div>

                {/* Title */}
                <div style={{ marginBottom: spacing[4] }}>
                  <label style={{ display: 'block', fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.medium, color: colors.text.secondary, marginBottom: spacing[2] }}>
                    RFQ Title (Optional)
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Optional - leave blank for auto-generated name"
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
                <div style={{ padding: spacing[4], backgroundColor: colors.primary[50], borderRadius: borderRadius.lg, border: `1px solid ${colors.primary[200]}`, marginBottom: spacing[4] }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: spacing[4] }}>
                    <div>
                      <p style={{ fontSize: typography.fontSize.xs, color: colors.text.tertiary, margin: 0 }}>Products</p>
                      <p style={{ fontSize: typography.fontSize['2xl'], fontWeight: typography.fontWeight.bold, color: colors.primary[700], margin: 0 }}>{lines.length}</p>
                    </div>
                    <div>
                      <p style={{ fontSize: typography.fontSize.xs, color: colors.text.tertiary, margin: 0 }}>Suppliers</p>
                      <p style={{ fontSize: typography.fontSize['2xl'], fontWeight: typography.fontWeight.bold, color: colors.primary[700], margin: 0 }}>{selectedSupplierIds.length}</p>
                    </div>
                    <div>
                      <p style={{ fontSize: typography.fontSize.xs, color: colors.text.tertiary, margin: 0 }}>Window</p>
                      <p style={{ fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.semibold, color: colors.primary[700], margin: 0 }}>{hasDeliveryWindow ? 'Set' : 'Flexible'}</p>
                    </div>
                  </div>
                </div>

                {/* Products Table */}
                <div style={{ backgroundColor: colors.neutral[0], border: `1px solid ${colors.border.light}`, borderRadius: borderRadius.lg, overflow: 'hidden', marginBottom: spacing[4] }}>
                  <div style={{ padding: spacing[3], backgroundColor: colors.neutral[50], borderBottom: `1px solid ${colors.border.light}` }}>
                    <h4 style={{ fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.semibold, color: colors.text.primary, margin: 0 }}>Requested Products</h4>
                  </div>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: `1px solid ${colors.border.light}` }}>
                        <th style={{ padding: spacing[3], textAlign: 'left', fontSize: typography.fontSize.xs, color: colors.text.secondary }}>Product</th>
                        <th style={{ padding: spacing[3], textAlign: 'center', fontSize: typography.fontSize.xs, color: colors.text.secondary }}>Quantity</th>
                        <th style={{ padding: spacing[3], textAlign: 'right', fontSize: typography.fontSize.xs, color: colors.text.secondary }}>Est. Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {lines.map((line, index) => (
                        <tr key={line.id} style={{ borderBottom: index < lines.length - 1 ? `1px solid ${colors.border.light}` : 'none' }}>
                          <td style={{ padding: spacing[3] }}>
                            <p style={{ fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.medium, color: colors.text.primary, margin: 0 }}>{line.description}</p>
                          </td>
                          <td style={{ padding: spacing[3], textAlign: 'center' }}>
                            <p style={{ fontSize: typography.fontSize.base, fontWeight: typography.fontWeight.bold, color: colors.primary[600], margin: 0 }}>{line.quantity} {line.unit}</p>
                          </td>
                          <td style={{ padding: spacing[3], textAlign: 'right' }}>
                            <p style={{ fontSize: typography.fontSize.sm, color: line.base_price ? colors.text.primary : colors.text.tertiary, margin: 0 }}>
                              {line.base_price ? `${(line.base_price * line.quantity).toLocaleString()} ₾` : 'TBD'}
                            </p>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Additional Notes */}
                <div>
                  <label style={{ display: 'block', fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.medium, color: colors.text.secondary, marginBottom: spacing[2] }}>
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
                onClick={goBack}
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

              {!isReviewStep ? (
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
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  style={{
                    padding: `${spacing[3]} ${spacing[6]}`,
                    backgroundColor: submitting ? colors.neutral[300] : colors.primary[600],
                    border: 'none',
                    borderRadius: borderRadius.md,
                    fontSize: typography.fontSize.base,
                    fontWeight: typography.fontWeight.semibold,
                    color: colors.neutral[0],
                    cursor: submitting ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: spacing[2],
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
                  {!submitting && <Icons.Send size={16} />}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Confidence Score */}
        <div style={{ position: 'sticky', top: spacing[6], height: 'fit-content' }}>
          <ConfidenceScoreMeter
            hasProject={selectedProjectId !== null}
            hasLines={lines.length > 0}
            hasDetailedSpecs={hasDetailedSpecs}
            hasDeliveryWindow={hasDeliveryWindow}
            hasAccessNotes={hasAccessNotes}
            isProfileComplete={false}
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

      {/* Success Modal */}
      {showSuccessModal && rfqDetails && (
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
              RFQ Sent Successfully!
            </h2>
            <p
              style={{
                fontSize: typography.fontSize.lg,
                color: colors.text.secondary,
                margin: 0,
              }}
            >
              Sent to {selectedSupplierIds.length} {selectedSupplierIds.length === 1 ? 'supplier' : 'suppliers'}
            </p>
            <p
              style={{
                fontSize: typography.fontSize.sm,
                color: colors.text.tertiary,
                margin: 0,
                marginTop: spacing[4],
              }}
            >
              Redirecting to RFQ details...
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
