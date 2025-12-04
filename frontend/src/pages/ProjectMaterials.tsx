/**
 * ProjectMaterials Page
 * Displays and manages materials for a specific project
 * Allows supplier selection, status changes, and creating orders
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '../services/api';
import { Icons } from '../components/icons/Icons';
import { colors, spacing, typography, borderRadius, shadows } from '../theme/tokens';

interface Supplier {
  supplier_id: string;
  supplier_name: string;
  logo_url: string | null;
  location: string | null;
  is_verified: boolean;
  direct_order_available: boolean;
  trust_score: number | null;
  sku_id: string;
  sku_name: string;
  unit_price: number;
  unit: string;
  images: string[] | null;
  products_available: number;
  total_products_needed: number;
}

interface ProjectMaterial {
  id: string;
  project_id: string;
  sku_id: string | null;
  name: string;
  description: string | null;
  quantity: number;
  unit: string;
  status: 'need_to_buy' | 'already_have' | 'in_cart' | 'rfq_sent' | 'ordered' | 'delivered';
  supplier_id: string | null;
  supplier_name: string | null;
  unit_price: number | null;
  estimated_total: number | null;
  template_slug: string | null;
  rfq_id: string | null;
  order_id: string | null;
  cart_item_id: string | null;
  images: string[] | null;
  available_suppliers: Supplier[];
  sort_order: number;
}

interface Project {
  id: string;
  name: string;
  site_address?: string;
}

interface SupplierOrder {
  supplier_id: string;
  supplier_name: string;
  location: string | null;
  direct_order_available: boolean;
  materials: ProjectMaterial[];
  total: number;
}

export const ProjectMaterials: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [project, setProject] = useState<Project | null>(null);
  const [materials, setMaterials] = useState<ProjectMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingIds, setSavingIds] = useState<Set<string>>(new Set());
  const [creatingOrder, setCreatingOrder] = useState<string | null>(null);

  // Fetch project and materials
  const fetchData = useCallback(async () => {
    if (!projectId) return;

    setLoading(true);
    setError(null);

    try {
      const projectRes = await api.get<{ project?: Project; data?: Project }>(`/buyers/projects/${projectId}`);
      if (projectRes.success) {
        setProject(projectRes.data?.project || projectRes.data as Project);
      }

      const materialsRes = await api.get<{ materials?: ProjectMaterial[]; data?: { materials?: ProjectMaterial[] } }>(`/buyers/projects/${projectId}/materials`);
      if (materialsRes.success) {
        const mats = materialsRes.data?.materials || materialsRes.data?.data?.materials || [];
        setMaterials(Array.isArray(mats) ? mats : []);
      }
    } catch (err) {
      console.error('Failed to fetch project materials:', err);
      setError(t('common.errorFetchingData', 'Failed to load data'));
    } finally {
      setLoading(false);
    }
  }, [projectId, t]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Update material supplier - optimistic update
  const updateSupplier = async (materialId: string, supplier: Supplier) => {
    const material = materials.find(m => m.id === materialId);
    if (!material) return;

    // Optimistic update
    setMaterials(prev => prev.map(m => {
      if (m.id === materialId) {
        return {
          ...m,
          supplier_id: supplier.supplier_id,
          supplier_name: supplier.supplier_name,
          sku_id: supplier.sku_id,
          unit_price: supplier.unit_price,
          estimated_total: m.quantity * supplier.unit_price,
        };
      }
      return m;
    }));

    // Save in background
    setSavingIds(prev => new Set(prev).add(materialId));
    try {
      await api.put(`/buyers/projects/${projectId}/materials/${materialId}`, {
        supplier_id: supplier.supplier_id,
        unit_price: supplier.unit_price,
        sku_id: supplier.sku_id,
      });
    } catch (err) {
      console.error('Failed to update supplier:', err);
      // Revert on error
      setMaterials(prev => prev.map(m => {
        if (m.id === materialId) {
          return { ...material };
        }
        return m;
      }));
    } finally {
      setSavingIds(prev => {
        const next = new Set(prev);
        next.delete(materialId);
        return next;
      });
    }
  };

  // Mark as already have - optimistic update
  const markAsHave = async (materialId: string) => {
    const material = materials.find(m => m.id === materialId);
    if (!material) return;

    // Optimistic update
    setMaterials(prev => prev.map(m => {
      if (m.id === materialId) {
        return { ...m, status: 'already_have' as const, supplier_id: null, supplier_name: null };
      }
      return m;
    }));

    try {
      await api.put(`/buyers/projects/${projectId}/materials/${materialId}`, {
        status: 'already_have',
        supplier_id: null,
      });
    } catch (err) {
      console.error('Failed to update status:', err);
      setMaterials(prev => prev.map(m => {
        if (m.id === materialId) {
          return { ...material };
        }
        return m;
      }));
    }
  };

  // Group materials by selected supplier into orders
  const supplierOrders = useMemo((): SupplierOrder[] => {
    const orderMap: Record<string, SupplierOrder> = {};

    materials.forEach(m => {
      if (m.status === 'need_to_buy' && m.supplier_id) {
        if (!orderMap[m.supplier_id]) {
          // Find supplier info from available_suppliers
          const supplierInfo = m.available_suppliers.find(s => s.supplier_id === m.supplier_id);
          orderMap[m.supplier_id] = {
            supplier_id: m.supplier_id,
            supplier_name: m.supplier_name || supplierInfo?.supplier_name || 'Unknown',
            location: supplierInfo?.location || null,
            direct_order_available: supplierInfo?.direct_order_available ?? true,
            materials: [],
            total: 0,
          };
        }
        orderMap[m.supplier_id].materials.push(m);
        orderMap[m.supplier_id].total += m.estimated_total || 0;
      }
    });

    return Object.values(orderMap);
  }, [materials]);

  // Create direct order or RFQ
  const handleCreateOrder = async (order: SupplierOrder, type: 'direct' | 'rfq') => {
    setCreatingOrder(order.supplier_id);
    try {
      if (type === 'direct') {
        // Add items to cart
        const items = order.materials.map(m => ({
          project_material_id: m.id,
          project_id: projectId,
          sku_id: m.sku_id,
          supplier_id: m.supplier_id,
          name: m.name,
          description: m.description,
          quantity: m.quantity,
          unit: m.unit,
          unit_price: m.unit_price || 0,
          action_type: 'direct_order',
        }));

        await api.post('/buyers/cart/bulk', { items });
        navigate('/cart');
      } else {
        // Navigate to RFQ creation page with pre-filled data
        const rfqData = {
          project_id: projectId,
          supplier_id: order.supplier_id,
          lines: order.materials.map(m => ({
            description: m.name + (m.description ? ` - ${m.description}` : ''),
            quantity: m.quantity,
            unit: m.unit,
            sku_id: m.sku_id,
          })),
        };

        // Store RFQ data in sessionStorage for CreateRFQ page to pick up
        sessionStorage.setItem('rfq_prefill', JSON.stringify(rfqData));
        navigate('/rfqs/create');
      }
    } catch (err) {
      console.error('Failed to create order:', err);
      alert(t('common.error', 'An error occurred'));
    } finally {
      setCreatingOrder(null);
    }
  };

  // Calculate totals
  const totals = useMemo(() => {
    return materials.reduce(
      (acc, m) => {
        if (m.status !== 'already_have') {
          acc.totalItems++;
          acc.totalEstimate += m.estimated_total || 0;
        }
        if (m.status === 'need_to_buy') {
          acc.needToBuy++;
          if (m.supplier_id) acc.withSupplier++;
        }
        if (m.status === 'already_have') acc.alreadyHave++;
        if (m.status === 'rfq_sent') acc.rfqSent++;
        if (m.status === 'ordered' || m.status === 'delivered') acc.ordered++;
        return acc;
      },
      { totalItems: 0, totalEstimate: 0, needToBuy: 0, withSupplier: 0, alreadyHave: 0, rfqSent: 0, ordered: 0 }
    );
  }, [materials]);

  if (loading) {
    return (
      <div style={{
        padding: spacing[6],
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '400px',
        gap: spacing[6],
      }}>
        {/* Animated search icon with pulse */}
        <div style={{ position: 'relative' }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            backgroundColor: colors.primary[100],
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            animation: 'pulse 2s ease-in-out infinite',
          }}>
            <Icons.Search size={36} color={colors.primary[600]} style={{ animation: 'bounce 1s ease-in-out infinite' }} />
          </div>
          {/* Orbiting dots */}
          <div style={{
            position: 'absolute',
            top: '-10px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            backgroundColor: colors.primary[400],
            animation: 'orbit 2s linear infinite',
          }} />
          <div style={{
            position: 'absolute',
            top: '50%',
            right: '-10px',
            transform: 'translateY(-50%)',
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            backgroundColor: colors.primary[300],
            animation: 'orbit 2s linear infinite 0.5s',
          }} />
          <div style={{
            position: 'absolute',
            bottom: '-10px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: colors.primary[200],
            animation: 'orbit 2s linear infinite 1s',
          }} />
        </div>

        {/* Animated text */}
        <div style={{ textAlign: 'center' }}>
          <h2 style={{
            fontSize: typography.fontSize.xl,
            fontWeight: typography.fontWeight.semibold,
            color: colors.text.primary,
            margin: 0,
            marginBottom: spacing[2],
          }}>
            {t('project.findingSuppliers', 'Finding Best Suppliers')}
          </h2>
          <p style={{
            fontSize: typography.fontSize.base,
            color: colors.text.secondary,
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: spacing[1],
          }}>
            {t('project.searchingSuppliers', 'Searching for the best prices for your materials')}
            <span style={{ animation: 'dots 1.5s steps(4, end) infinite' }}>...</span>
          </p>
        </div>

        {/* Progress indicator */}
        <div style={{
          width: '200px',
          height: '4px',
          backgroundColor: colors.primary[100],
          borderRadius: borderRadius.full,
          overflow: 'hidden',
        }}>
          <div style={{
            width: '40%',
            height: '100%',
            backgroundColor: colors.primary[600],
            borderRadius: borderRadius.full,
            animation: 'progress 1.5s ease-in-out infinite',
          }} />
        </div>

        <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }
          @keyframes pulse {
            0%, 100% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.05); opacity: 0.8; }
          }
          @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-4px); }
          }
          @keyframes orbit {
            0% { opacity: 0.3; transform: scale(0.8); }
            50% { opacity: 1; transform: scale(1.2); }
            100% { opacity: 0.3; transform: scale(0.8); }
          }
          @keyframes progress {
            0% { transform: translateX(-100%); }
            50% { transform: translateX(150%); }
            100% { transform: translateX(250%); }
          }
          @keyframes dots {
            0% { content: ''; }
            25% { content: '.'; }
            50% { content: '..'; }
            75% { content: '...'; }
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: spacing[6], textAlign: 'center' }}>
        <Icons.AlertCircle size={48} color={colors.error[500] || colors.error} />
        <p style={{ color: colors.text.secondary, marginTop: spacing[4] }}>{error}</p>
        <button onClick={fetchData} style={{ marginTop: spacing[4], padding: `${spacing[2]} ${spacing[4]}`, backgroundColor: colors.primary[600], color: colors.text.inverse, border: 'none', borderRadius: borderRadius.md, cursor: 'pointer' }}>
          {t('common.retry', 'Retry')}
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: spacing[4], maxWidth: '1200px', margin: '0 auto', paddingBottom: spacing[20] }}>
      {/* Header */}
      <div style={{ marginBottom: spacing[6] }}>
        <button onClick={() => navigate('/projects')} style={{ display: 'flex', alignItems: 'center', gap: spacing[2], color: colors.text.secondary, backgroundColor: 'transparent', border: 'none', cursor: 'pointer', padding: 0, marginBottom: spacing[3] }}>
          <Icons.ArrowLeft size={20} />
          {t('common.back', 'Back to Projects')}
        </button>

        <h1 style={{ fontSize: typography.fontSize['2xl'], fontWeight: typography.fontWeight.bold, margin: 0 }}>
          {project?.name || t('project.materials', 'Project Materials')}
        </h1>
        {project?.site_address && (
          <p style={{ color: colors.text.secondary, margin: 0, marginTop: spacing[1], display: 'flex', alignItems: 'center', gap: spacing[1] }}>
            <Icons.MapPin size={14} />
            {project.site_address}
          </p>
        )}
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: spacing[3], marginBottom: spacing[6] }}>
        <SummaryCard label={t('project.needToBuy', 'Need to Buy')} value={totals.needToBuy} color={colors.warning[600] || '#EAB308'} bgColor={colors.warning[50] || '#FEF9C3'} />
        <SummaryCard label={t('project.withSupplier', 'With Supplier')} value={totals.withSupplier} color={colors.primary[600]} bgColor={colors.primary[50]} />
        <SummaryCard label={t('project.alreadyHave', 'Already Have')} value={totals.alreadyHave} color={colors.neutral[600]} bgColor={colors.neutral[100]} />
        <SummaryCard label={t('project.rfqSent', 'RFQ Sent')} value={totals.rfqSent} color={colors.info?.[600] || '#0891B2'} bgColor={colors.info?.[50] || '#ECFEFF'} />
      </div>

      {materials.length === 0 ? (
        <EmptyState navigate={navigate} t={t} />
      ) : (
        <>
          {/* Materials Section */}
          <div style={{ marginBottom: spacing[8] }}>
            <h2 style={{ fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.semibold, marginBottom: spacing[4], display: 'flex', alignItems: 'center', gap: spacing[2] }}>
              <Icons.Package size={20} />
              {t('project.materialsList', 'Materials List')}
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[3] }}>
              {materials.map(material => (
                <MaterialCard
                  key={material.id}
                  material={material}
                  onSupplierSelect={(supplier) => updateSupplier(material.id, supplier)}
                  onMarkAsHave={() => markAsHave(material.id)}
                  isSaving={savingIds.has(material.id)}
                  t={t}
                />
              ))}
            </div>
          </div>

          {/* Orders Section */}
          {supplierOrders.length > 0 && (
            <div>
              <h2 style={{ fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.semibold, marginBottom: spacing[4], display: 'flex', alignItems: 'center', gap: spacing[2] }}>
                <Icons.ShoppingCart size={20} />
                {t('project.yourOrders', 'Your Orders')}
                <span style={{ fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.normal, color: colors.text.secondary }}>
                  ({supplierOrders.length} {t('project.suppliers', 'suppliers')})
                </span>
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[4] }}>
                {supplierOrders.map(order => (
                  <OrderCard
                    key={order.supplier_id}
                    order={order}
                    onDirectOrder={() => handleCreateOrder(order, 'direct')}
                    onSendRFQ={() => handleCreateOrder(order, 'rfq')}
                    isCreating={creatingOrder === order.supplier_id}
                    t={t}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

// Summary Card Component
const SummaryCard: React.FC<{ label: string; value: number; color: string; bgColor: string }> = ({ label, value, color, bgColor }) => (
  <div style={{ padding: spacing[4], backgroundColor: bgColor, borderRadius: borderRadius.lg, border: `1px solid ${color}20` }}>
    <div style={{ fontSize: typography.fontSize.sm, color }}>{label}</div>
    <div style={{ fontSize: typography.fontSize['2xl'], fontWeight: typography.fontWeight.bold, color }}>{value}</div>
  </div>
);

// Empty State Component
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const EmptyState: React.FC<{ navigate: (path: string) => void; t: any }> = ({ navigate, t }) => (
  <div style={{ textAlign: 'center', padding: spacing[8], backgroundColor: colors.neutral[50], borderRadius: borderRadius.lg }}>
    <Icons.Package size={48} color={colors.text.secondary} />
    <p style={{ color: colors.text.secondary, marginTop: spacing[4] }}>{t('project.noMaterials', 'No materials in this project yet')}</p>
    <button onClick={() => navigate('/templates')} style={{ marginTop: spacing[4], padding: `${spacing[3]} ${spacing[4]}`, backgroundColor: colors.primary[600], color: colors.text.inverse, border: 'none', borderRadius: borderRadius.md, cursor: 'pointer' }}>
      {t('project.useCalculator', 'Use a Calculator')}
    </button>
  </div>
);

// Material Card Component
interface MaterialCardProps {
  material: ProjectMaterial;
  onSupplierSelect: (supplier: Supplier) => void;
  onMarkAsHave: () => void;
  isSaving: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  t: any;
}

const MaterialCard: React.FC<MaterialCardProps> = ({ material, onSupplierSelect, onMarkAsHave, isSaving, t }) => {
  const [showDropdown, setShowDropdown] = useState(false);

  const statusColors: Record<string, { bg: string; text: string }> = {
    need_to_buy: { bg: colors.warning[100] || '#FEF3C7', text: colors.warning[700] || '#A16207' },
    already_have: { bg: colors.neutral[100], text: colors.neutral[600] },
    rfq_sent: { bg: colors.info?.[100] || '#CFFAFE', text: colors.info?.[700] || '#0E7490' },
    ordered: { bg: colors.success[100] || '#DCFCE7', text: colors.success[700] || '#15803D' },
    delivered: { bg: colors.success[50] || '#F0FDF4', text: colors.success[800] || '#166534' },
  };

  const statusInfo = statusColors[material.status] || statusColors.need_to_buy;

  return (
    <div style={{ backgroundColor: colors.neutral[0], borderRadius: borderRadius.lg, border: `1px solid ${material.supplier_id ? colors.primary[200] : colors.border.light}`, padding: spacing[4], boxShadow: shadows.sm, transition: 'border-color 150ms' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', flexWrap: 'wrap', gap: spacing[2] }}>
        <div style={{ flex: 1, minWidth: '200px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2] }}>
            <h3 style={{ fontSize: typography.fontSize.base, fontWeight: typography.fontWeight.semibold, margin: 0 }}>{material.name}</h3>
            {isSaving && <div style={{ width: '14px', height: '14px', border: `2px solid ${colors.primary[200]}`, borderTopColor: colors.primary[600], borderRadius: '50%', animation: 'spin 1s linear infinite' }} />}
          </div>
          <div style={{ display: 'flex', gap: spacing[4], marginTop: spacing[2], fontSize: typography.fontSize.sm, color: colors.text.secondary, flexWrap: 'wrap' }}>
            <span>{material.quantity} {material.unit}</span>
            {material.unit_price && <span>{material.unit_price.toLocaleString()} ₾/{material.unit}</span>}
            {material.estimated_total && <span style={{ fontWeight: typography.fontWeight.semibold, color: colors.primary[600] }}>= {material.estimated_total.toLocaleString()} ₾</span>}
          </div>
        </div>

        <span style={{ padding: `${spacing[1]} ${spacing[2]}`, backgroundColor: statusInfo.bg, color: statusInfo.text, fontSize: typography.fontSize.xs, fontWeight: typography.fontWeight.medium, borderRadius: borderRadius.full }}>
          {t(`project.status.${material.status}`, material.status)}
        </span>
      </div>

      {material.status === 'need_to_buy' && (
        <div style={{ marginTop: spacing[3] }}>
          {/* Supplier Selection */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: spacing[3],
                backgroundColor: material.supplier_id ? colors.success[50] || '#F0FDF4' : colors.warning[50] || '#FFFBEB',
                border: `1px solid ${material.supplier_id ? colors.success[300] || '#86EFAC' : colors.warning[300] || '#FCD34D'}`,
                borderRadius: borderRadius.md, cursor: 'pointer', textAlign: 'left',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2] }}>
                {material.supplier_id ? (
                  <>
                    <Icons.CheckCircle size={16} color={colors.success[600] || '#16A34A'} />
                    <span style={{ fontWeight: typography.fontWeight.medium }}>{material.supplier_name}</span>
                  </>
                ) : (
                  <>
                    <Icons.AlertCircle size={16} color={colors.warning[600] || '#CA8A04'} />
                    <span>{t('project.selectSupplier', 'Select Supplier')}</span>
                  </>
                )}
              </div>
              <Icons.ChevronDown size={16} style={{ transform: showDropdown ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 150ms' }} />
            </button>

            {/* Dropdown */}
            {showDropdown && (
              <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50, marginTop: spacing[1], backgroundColor: colors.neutral[0], border: `1px solid ${colors.border.light}`, borderRadius: borderRadius.md, boxShadow: shadows.lg, maxHeight: '300px', overflowY: 'auto' }}>
                {material.available_suppliers.length === 0 ? (
                  <div style={{ padding: spacing[4], textAlign: 'center', color: colors.text.secondary, fontSize: typography.fontSize.sm }}>
                    {t('project.noSuppliersAvailable', 'No suppliers available')}
                  </div>
                ) : (
                  material.available_suppliers.map(supplier => (
                    <button
                      key={supplier.supplier_id}
                      onClick={() => { onSupplierSelect(supplier); setShowDropdown(false); }}
                      style={{
                        display: 'block', width: '100%', padding: spacing[3], border: 'none', borderBottom: `1px solid ${colors.border.light}`,
                        backgroundColor: material.supplier_id === supplier.supplier_id ? colors.primary[50] : colors.neutral[0],
                        cursor: 'pointer', textAlign: 'left',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2], marginBottom: spacing[1] }}>
                            <span style={{ fontWeight: typography.fontWeight.medium }}>{supplier.supplier_name}</span>
                            {supplier.is_verified && <Icons.CheckCircle size={14} color={colors.primary[600]} />}
                          </div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: spacing[2], fontSize: typography.fontSize.xs, color: colors.text.secondary }}>
                            {supplier.location && (
                              <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                                <Icons.MapPin size={12} /> {supplier.location}
                              </span>
                            )}
                            {supplier.trust_score && (
                              <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                                <Icons.Star size={12} /> {supplier.trust_score}%
                              </span>
                            )}
                            <span style={{ color: colors.primary[600], fontWeight: typography.fontWeight.medium }}>
                              {supplier.products_available}/{supplier.total_products_needed} {t('project.products', 'products')}
                            </span>
                          </div>
                          <div style={{ marginTop: spacing[1], fontSize: typography.fontSize.xs }}>
                            {supplier.direct_order_available ? (
                              <span style={{ color: colors.success[600] || '#16A34A' }}>{t('project.directOrderAvailable', 'Direct order available')}</span>
                            ) : (
                              <span style={{ color: colors.warning[600] || '#CA8A04' }}>{t('project.rfqOnly', 'RFQ only')}</span>
                            )}
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.bold, color: colors.primary[600] }}>
                            {supplier.unit_price.toLocaleString()} ₾
                          </div>
                          <div style={{ fontSize: typography.fontSize.xs, color: colors.text.secondary }}>/{material.unit}</div>
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Mark as have button */}
          <button
            onClick={onMarkAsHave}
            style={{ marginTop: spacing[2], padding: `${spacing[1]} ${spacing[2]}`, backgroundColor: 'transparent', color: colors.text.secondary, border: 'none', cursor: 'pointer', fontSize: typography.fontSize.sm }}
          >
            {t('project.markAsHave', 'I already have this')}
          </button>
        </div>
      )}
    </div>
  );
};

// Order Card Component
interface OrderCardProps {
  order: SupplierOrder;
  onDirectOrder: () => void;
  onSendRFQ: () => void;
  isCreating: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  t: any;
}

const OrderCard: React.FC<OrderCardProps> = ({ order, onDirectOrder, onSendRFQ, isCreating, t }) => (
  <div style={{ backgroundColor: colors.neutral[0], borderRadius: borderRadius.lg, border: `2px solid ${colors.primary[200]}`, overflow: 'hidden', boxShadow: shadows.md }}>
    {/* Header */}
    <div style={{ padding: spacing[4], backgroundColor: colors.primary[50], borderBottom: `1px solid ${colors.primary[200]}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: spacing[2] }}>
        <div>
          <h3 style={{ margin: 0, fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.semibold }}>{order.supplier_name}</h3>
          {order.location && (
            <p style={{ margin: 0, marginTop: spacing[1], fontSize: typography.fontSize.sm, color: colors.text.secondary, display: 'flex', alignItems: 'center', gap: spacing[1] }}>
              <Icons.MapPin size={14} /> {order.location}
            </p>
          )}
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: typography.fontSize.sm, color: colors.text.secondary }}>{order.materials.length} {t('project.items', 'items')}</div>
          <div style={{ fontSize: typography.fontSize.xl, fontWeight: typography.fontWeight.bold, color: colors.primary[600] }}>{order.total.toLocaleString()} ₾</div>
        </div>
      </div>
    </div>

    {/* Materials List */}
    <div style={{ padding: spacing[3], maxHeight: '200px', overflowY: 'auto' }}>
      {order.materials.map(m => (
        <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', padding: `${spacing[2]} 0`, borderBottom: `1px solid ${colors.border.light}` }}>
          <span style={{ fontSize: typography.fontSize.sm }}>{m.name}</span>
          <span style={{ fontSize: typography.fontSize.sm, color: colors.text.secondary }}>{m.quantity} {m.unit} × {m.unit_price?.toLocaleString()} ₾</span>
        </div>
      ))}
    </div>

    {/* Actions */}
    <div style={{ padding: spacing[4], borderTop: `1px solid ${colors.border.light}`, display: 'flex', gap: spacing[3] }}>
      {order.direct_order_available ? (
        <button
          onClick={onDirectOrder}
          disabled={isCreating}
          style={{
            flex: 1, padding: spacing[3], backgroundColor: colors.primary[600], color: colors.text.inverse, border: 'none',
            borderRadius: borderRadius.md, cursor: isCreating ? 'not-allowed' : 'pointer', fontWeight: typography.fontWeight.semibold,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: spacing[2], opacity: isCreating ? 0.7 : 1,
          }}
        >
          <Icons.ShoppingCart size={18} />
          {isCreating ? t('common.creating', 'Creating...') : t('project.directOrder', 'Direct Order')}
        </button>
      ) : null}
      <button
        onClick={onSendRFQ}
        disabled={isCreating}
        style={{
          flex: 1, padding: spacing[3], backgroundColor: order.direct_order_available ? colors.neutral[100] : colors.primary[600],
          color: order.direct_order_available ? colors.text.primary : colors.text.inverse, border: 'none',
          borderRadius: borderRadius.md, cursor: isCreating ? 'not-allowed' : 'pointer', fontWeight: typography.fontWeight.medium,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: spacing[2], opacity: isCreating ? 0.7 : 1,
        }}
      >
        <Icons.Send size={18} />
        {isCreating ? t('common.creating', 'Creating...') : t('project.sendRFQ', 'Send RFQ')}
      </button>
    </div>
  </div>
);

export default ProjectMaterials;
