/**
 * ProjectMaterials Page
 * Displays and manages materials for a specific project
 * Allows supplier selection, status changes, and adding to cart
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '../services/api';
import { Icons } from '../components/icons/Icons';
import { colors, spacing, typography, borderRadius, shadows } from '../theme/tokens';

interface Supplier {
  supplier_id: string;
  supplier_name: string;
  unit_price: number;
  sku_id: string;
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

const STATUS_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  need_to_buy: { bg: colors.warning[100] || '#FFF3CD', text: colors.warning[700] || '#856404', label: 'Need to Buy' },
  already_have: { bg: colors.neutral[100], text: colors.neutral[600], label: 'Already Have' },
  in_cart: { bg: colors.primary[100], text: colors.primary[700], label: 'In Cart' },
  rfq_sent: { bg: colors.info?.[100] || '#D1ECF1', text: colors.info?.[700] || '#0C5460', label: 'RFQ Sent' },
  ordered: { bg: colors.success[100] || '#D4EDDA', text: colors.success[700] || '#155724', label: 'Ordered' },
  delivered: { bg: colors.success[50] || '#D4EDDA', text: colors.success[800] || '#155724', label: 'Delivered' },
};

export const ProjectMaterials: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [project, setProject] = useState<Project | null>(null);
  const [materials, setMaterials] = useState<ProjectMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [addingToCart, setAddingToCart] = useState(false);

  // Fetch project and materials
  const fetchData = useCallback(async () => {
    if (!projectId) return;

    setLoading(true);
    setError(null);

    try {
      // Fetch project details
      const projectRes = await api.get<{ project?: Project; data?: Project }>(`/buyers/projects/${projectId}`);
      if (projectRes.success) {
        setProject(projectRes.data?.project || projectRes.data as Project);
      }

      // Fetch materials
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

  // Toggle selection
  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  // Select all
  const selectAll = () => {
    const buyableMaterials = materials.filter(m => m.status === 'need_to_buy' && m.supplier_id);
    if (selectedIds.size === buyableMaterials.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(buyableMaterials.map(m => m.id)));
    }
  };

  // Update material supplier
  const updateSupplier = async (materialId: string, supplierId: string, unitPrice: number) => {
    try {
      await api.put(`/buyers/projects/${projectId}/materials/${materialId}`, {
        supplier_id: supplierId,
        unit_price: unitPrice,
      });
      await fetchData();
    } catch (err) {
      console.error('Failed to update supplier:', err);
    }
  };

  // Mark as already have
  const markAsHave = async (materialId: string) => {
    try {
      await api.put(`/buyers/projects/${projectId}/materials/${materialId}`, {
        status: 'already_have',
      });
      await fetchData();
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  // Add selected to cart
  const addSelectedToCart = async () => {
    const selectedMaterials = materials.filter(m => selectedIds.has(m.id));
    const itemsWithSuppliers = selectedMaterials.filter(m => m.supplier_id);

    if (itemsWithSuppliers.length === 0) {
      alert(t('project.selectSupplierFirst', 'Please select suppliers for items first'));
      return;
    }

    setAddingToCart(true);
    try {
      const items = itemsWithSuppliers.map(m => ({
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
      setSelectedIds(new Set());
      await fetchData();
    } catch (err) {
      console.error('Failed to add to cart:', err);
      alert(t('common.error', 'An error occurred'));
    } finally {
      setAddingToCart(false);
    }
  };

  // Calculate totals
  const totals = materials.reduce(
    (acc, m) => {
      if (m.status !== 'already_have') {
        acc.totalItems++;
        acc.totalEstimate += m.estimated_total || 0;
      }
      if (m.status === 'need_to_buy') {
        acc.needToBuy++;
      }
      if (m.status === 'in_cart') {
        acc.inCart++;
      }
      if (m.status === 'ordered' || m.status === 'delivered') {
        acc.ordered++;
      }
      return acc;
    },
    { totalItems: 0, totalEstimate: 0, needToBuy: 0, inCart: 0, ordered: 0 }
  );

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

  if (error) {
    return (
      <div style={{ padding: spacing[6], textAlign: 'center' }}>
        <Icons.AlertCircle size={48} color={colors.error[500] || colors.error} />
        <p style={{ color: colors.text.secondary, marginTop: spacing[4] }}>{error}</p>
        <button
          onClick={fetchData}
          style={{
            marginTop: spacing[4],
            padding: `${spacing[2]} ${spacing[4]}`,
            backgroundColor: colors.primary[600],
            color: colors.text.inverse,
            border: 'none',
            borderRadius: borderRadius.md,
            cursor: 'pointer',
          }}
        >
          {t('common.retry', 'Retry')}
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: spacing[4], maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: spacing[6] }}>
        <button
          onClick={() => navigate('/projects')}
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
          {t('common.back', 'Back to Projects')}
        </button>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', flexWrap: 'wrap', gap: spacing[4] }}>
          <div>
            <h1 style={{ fontSize: typography.fontSize['2xl'], fontWeight: typography.fontWeight.bold, margin: 0 }}>
              {project?.name || t('project.materials', 'Project Materials')}
            </h1>
            {project?.site_address && (
              <p style={{ color: colors.text.secondary, margin: 0, marginTop: spacing[1] }}>
                <Icons.MapPin size={14} style={{ marginRight: spacing[1] }} />
                {project.site_address}
              </p>
            )}
          </div>

          <button
            onClick={() => navigate('/cart')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: spacing[2],
              padding: `${spacing[3]} ${spacing[4]}`,
              backgroundColor: colors.primary[600],
              color: colors.text.inverse,
              border: 'none',
              borderRadius: borderRadius.md,
              cursor: 'pointer',
              fontWeight: typography.fontWeight.medium,
            }}
          >
            <Icons.ShoppingCart size={18} />
            {t('cart.viewCart', 'View Cart')}
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: spacing[3],
          marginBottom: spacing[6],
        }}
      >
        <div style={{ padding: spacing[4], backgroundColor: colors.neutral[0], borderRadius: borderRadius.lg, border: `1px solid ${colors.border.light}` }}>
          <div style={{ fontSize: typography.fontSize.sm, color: colors.text.secondary }}>{t('project.totalItems', 'Total Items')}</div>
          <div style={{ fontSize: typography.fontSize['2xl'], fontWeight: typography.fontWeight.bold }}>{totals.totalItems}</div>
        </div>
        <div style={{ padding: spacing[4], backgroundColor: colors.warning[50] || '#FFF3CD', borderRadius: borderRadius.lg, border: `1px solid ${colors.warning[200] || '#FFE69C'}` }}>
          <div style={{ fontSize: typography.fontSize.sm, color: colors.warning[700] || '#856404' }}>{t('project.needToBuy', 'Need to Buy')}</div>
          <div style={{ fontSize: typography.fontSize['2xl'], fontWeight: typography.fontWeight.bold, color: colors.warning[700] || '#856404' }}>{totals.needToBuy}</div>
        </div>
        <div style={{ padding: spacing[4], backgroundColor: colors.primary[50], borderRadius: borderRadius.lg, border: `1px solid ${colors.primary[200]}` }}>
          <div style={{ fontSize: typography.fontSize.sm, color: colors.primary[700] }}>{t('project.inCart', 'In Cart')}</div>
          <div style={{ fontSize: typography.fontSize['2xl'], fontWeight: typography.fontWeight.bold, color: colors.primary[700] }}>{totals.inCart}</div>
        </div>
        <div style={{ padding: spacing[4], backgroundColor: colors.success[50] || '#D4EDDA', borderRadius: borderRadius.lg, border: `1px solid ${colors.success[200] || '#C3E6CB'}` }}>
          <div style={{ fontSize: typography.fontSize.sm, color: colors.success[700] || '#155724' }}>{t('project.ordered', 'Ordered')}</div>
          <div style={{ fontSize: typography.fontSize['2xl'], fontWeight: typography.fontWeight.bold, color: colors.success[700] || '#155724' }}>{totals.ordered}</div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedIds.size > 0 && (
        <div
          style={{
            position: 'sticky',
            top: spacing[4],
            zIndex: 10,
            backgroundColor: colors.primary[600],
            color: colors.text.inverse,
            padding: spacing[4],
            borderRadius: borderRadius.lg,
            marginBottom: spacing[4],
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: spacing[3],
            boxShadow: shadows.lg,
          }}
        >
          <span style={{ fontWeight: typography.fontWeight.medium }}>
            {selectedIds.size} {t('common.selected', 'selected')}
          </span>
          <div style={{ display: 'flex', gap: spacing[2] }}>
            <button
              onClick={() => setSelectedIds(new Set())}
              style={{
                padding: `${spacing[2]} ${spacing[3]}`,
                backgroundColor: 'rgba(255,255,255,0.2)',
                color: colors.text.inverse,
                border: 'none',
                borderRadius: borderRadius.md,
                cursor: 'pointer',
              }}
            >
              {t('common.cancel', 'Cancel')}
            </button>
            <button
              onClick={addSelectedToCart}
              disabled={addingToCart}
              style={{
                padding: `${spacing[2]} ${spacing[3]}`,
                backgroundColor: colors.neutral[0],
                color: colors.primary[600],
                border: 'none',
                borderRadius: borderRadius.md,
                cursor: addingToCart ? 'not-allowed' : 'pointer',
                fontWeight: typography.fontWeight.medium,
                display: 'flex',
                alignItems: 'center',
                gap: spacing[2],
              }}
            >
              <Icons.ShoppingCart size={16} />
              {addingToCart ? t('common.adding', 'Adding...') : t('cart.addToCart', 'Add to Cart')}
            </button>
          </div>
        </div>
      )}

      {/* Materials List */}
      {materials.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: spacing[8],
            backgroundColor: colors.neutral[50],
            borderRadius: borderRadius.lg,
          }}
        >
          <Icons.Package size={48} color={colors.text.secondary} />
          <p style={{ color: colors.text.secondary, marginTop: spacing[4] }}>
            {t('project.noMaterials', 'No materials in this project yet')}
          </p>
          <button
            onClick={() => navigate('/templates')}
            style={{
              marginTop: spacing[4],
              padding: `${spacing[3]} ${spacing[4]}`,
              backgroundColor: colors.primary[600],
              color: colors.text.inverse,
              border: 'none',
              borderRadius: borderRadius.md,
              cursor: 'pointer',
            }}
          >
            {t('project.useCalculator', 'Use a Calculator')}
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[3] }}>
          {/* Select All */}
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing[3], marginBottom: spacing[2] }}>
            <button
              onClick={selectAll}
              style={{
                padding: `${spacing[2]} ${spacing[3]}`,
                backgroundColor: colors.neutral[100],
                color: colors.text.primary,
                border: 'none',
                borderRadius: borderRadius.md,
                cursor: 'pointer',
                fontSize: typography.fontSize.sm,
              }}
            >
              {selectedIds.size === materials.filter(m => m.status === 'need_to_buy' && m.supplier_id).length
                ? t('common.deselectAll', 'Deselect All')
                : t('common.selectAll', 'Select All Ready')}
            </button>
            <span style={{ fontSize: typography.fontSize.sm, color: colors.text.secondary }}>
              {t('project.estimatedTotal', 'Estimated Total')}: <strong>{totals.totalEstimate.toLocaleString()} ₾</strong>
            </span>
          </div>

          {/* Material Cards */}
          {materials.map((material) => (
            <MaterialCard
              key={material.id}
              material={material}
              isSelected={selectedIds.has(material.id)}
              onSelect={() => toggleSelect(material.id)}
              onSupplierChange={(supplierId, unitPrice) => updateSupplier(material.id, supplierId, unitPrice)}
              onMarkAsHave={() => markAsHave(material.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Material Card Component
interface MaterialCardProps {
  material: ProjectMaterial;
  isSelected: boolean;
  onSelect: () => void;
  onSupplierChange: (supplierId: string, unitPrice: number) => void;
  onMarkAsHave: () => void;
}

const MaterialCard: React.FC<MaterialCardProps> = ({
  material,
  isSelected,
  onSelect,
  onSupplierChange,
  onMarkAsHave,
}) => {
  const { t } = useTranslation();
  const [showSuppliers, setShowSuppliers] = useState(false);
  const statusInfo = STATUS_COLORS[material.status] || STATUS_COLORS.need_to_buy;
  const canSelect = material.status === 'need_to_buy' && material.supplier_id;

  return (
    <div
      style={{
        backgroundColor: colors.neutral[0],
        borderRadius: borderRadius.lg,
        border: `1px solid ${isSelected ? colors.primary[400] : colors.border.light}`,
        padding: spacing[4],
        boxShadow: isSelected ? `0 0 0 2px ${colors.primary[200]}` : shadows.sm,
        transition: 'all 150ms ease',
      }}
    >
      <div style={{ display: 'flex', gap: spacing[3], alignItems: 'start' }}>
        {/* Checkbox */}
        {canSelect && (
          <button
            onClick={onSelect}
            style={{
              width: '24px',
              height: '24px',
              minWidth: '24px',
              borderRadius: borderRadius.md,
              border: `2px solid ${isSelected ? colors.primary[600] : colors.border.default}`,
              backgroundColor: isSelected ? colors.primary[600] : 'transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: '2px',
            }}
          >
            {isSelected && <Icons.Check size={14} color={colors.neutral[0]} />}
          </button>
        )}

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', flexWrap: 'wrap', gap: spacing[2] }}>
            <div>
              <h3 style={{ fontSize: typography.fontSize.base, fontWeight: typography.fontWeight.semibold, margin: 0 }}>
                {material.name}
              </h3>
              {material.description && (
                <p style={{ fontSize: typography.fontSize.sm, color: colors.text.secondary, margin: 0, marginTop: spacing[1] }}>
                  {material.description}
                </p>
              )}
            </div>

            {/* Status Badge */}
            <span
              style={{
                padding: `${spacing[1]} ${spacing[2]}`,
                backgroundColor: statusInfo.bg,
                color: statusInfo.text,
                fontSize: typography.fontSize.xs,
                fontWeight: typography.fontWeight.medium,
                borderRadius: borderRadius.full,
                whiteSpace: 'nowrap',
              }}
            >
              {t(`project.status.${material.status}`, statusInfo.label)}
            </span>
          </div>

          {/* Quantity & Price */}
          <div style={{ display: 'flex', gap: spacing[4], marginTop: spacing[3], flexWrap: 'wrap' }}>
            <div>
              <span style={{ fontSize: typography.fontSize.sm, color: colors.text.secondary }}>{t('common.quantity', 'Quantity')}: </span>
              <span style={{ fontWeight: typography.fontWeight.medium }}>{material.quantity} {material.unit}</span>
            </div>
            {material.unit_price && (
              <div>
                <span style={{ fontSize: typography.fontSize.sm, color: colors.text.secondary }}>{t('common.unitPrice', 'Unit Price')}: </span>
                <span style={{ fontWeight: typography.fontWeight.medium }}>{material.unit_price.toLocaleString()} ₾</span>
              </div>
            )}
            {material.estimated_total && (
              <div>
                <span style={{ fontSize: typography.fontSize.sm, color: colors.text.secondary }}>{t('common.total', 'Total')}: </span>
                <span style={{ fontWeight: typography.fontWeight.bold, color: colors.primary[600] }}>{material.estimated_total.toLocaleString()} ₾</span>
              </div>
            )}
          </div>

          {/* Supplier Selection */}
          {material.status === 'need_to_buy' && (
            <div style={{ marginTop: spacing[3] }}>
              {material.supplier_id ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2] }}>
                  <Icons.CheckCircle size={16} color={colors.success[600] || colors.success} />
                  <span style={{ fontSize: typography.fontSize.sm, color: colors.success[700] || colors.success }}>
                    {material.supplier_name}
                  </span>
                  <button
                    onClick={() => setShowSuppliers(!showSuppliers)}
                    style={{
                      fontSize: typography.fontSize.sm,
                      color: colors.primary[600],
                      backgroundColor: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      textDecoration: 'underline',
                    }}
                  >
                    {t('common.change', 'Change')}
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowSuppliers(!showSuppliers)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: spacing[2],
                    padding: `${spacing[2]} ${spacing[3]}`,
                    backgroundColor: colors.warning[100] || '#FFF3CD',
                    color: colors.warning[700] || '#856404',
                    border: `1px solid ${colors.warning[300] || '#FFDA6A'}`,
                    borderRadius: borderRadius.md,
                    cursor: 'pointer',
                    fontSize: typography.fontSize.sm,
                  }}
                >
                  <Icons.AlertCircle size={16} />
                  {t('project.selectSupplier', 'Select Supplier')}
                  <Icons.ChevronDown size={16} />
                </button>
              )}

              {/* Supplier Options */}
              {showSuppliers && material.available_suppliers && material.available_suppliers.length > 0 && (
                <div
                  style={{
                    marginTop: spacing[2],
                    padding: spacing[3],
                    backgroundColor: colors.neutral[50],
                    borderRadius: borderRadius.md,
                    border: `1px solid ${colors.border.light}`,
                  }}
                >
                  {material.available_suppliers.map((supplier) => (
                    <button
                      key={supplier.supplier_id}
                      onClick={() => {
                        onSupplierChange(supplier.supplier_id, supplier.unit_price);
                        setShowSuppliers(false);
                      }}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        width: '100%',
                        padding: spacing[3],
                        backgroundColor: material.supplier_id === supplier.supplier_id ? colors.primary[50] : colors.neutral[0],
                        border: `1px solid ${material.supplier_id === supplier.supplier_id ? colors.primary[300] : colors.border.light}`,
                        borderRadius: borderRadius.md,
                        cursor: 'pointer',
                        marginBottom: spacing[2],
                        textAlign: 'left',
                      }}
                    >
                      <span style={{ fontWeight: typography.fontWeight.medium }}>{supplier.supplier_name}</span>
                      <span style={{ color: colors.primary[600], fontWeight: typography.fontWeight.bold }}>
                        {supplier.unit_price.toLocaleString()} ₾/{material.unit}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {showSuppliers && (!material.available_suppliers || material.available_suppliers.length === 0) && (
                <div
                  style={{
                    marginTop: spacing[2],
                    padding: spacing[3],
                    backgroundColor: colors.neutral[50],
                    borderRadius: borderRadius.md,
                    textAlign: 'center',
                    color: colors.text.secondary,
                    fontSize: typography.fontSize.sm,
                  }}
                >
                  {t('project.noSuppliersAvailable', 'No suppliers available for this item')}
                </div>
              )}
            </div>
          )}

          {/* Mark as have button */}
          {material.status === 'need_to_buy' && (
            <button
              onClick={onMarkAsHave}
              style={{
                marginTop: spacing[3],
                padding: `${spacing[1]} ${spacing[2]}`,
                backgroundColor: 'transparent',
                color: colors.text.secondary,
                border: 'none',
                cursor: 'pointer',
                fontSize: typography.fontSize.sm,
                textDecoration: 'underline',
              }}
            >
              {t('project.markAsHave', 'I already have this')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectMaterials;
