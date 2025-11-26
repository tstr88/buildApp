/**
 * Supplier Catalog Page
 * Manage supplier's product catalog with Direct Order controls
 */

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Upload, AlertCircle } from 'lucide-react';
import ProductForm from '../components/catalog/ProductForm';
import { colors, spacing, typography, borderRadius, shadows } from '../theme/tokens';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

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
  images?: string[];
  direct_order_available: boolean;
  delivery_options: 'pickup' | 'delivery' | 'both';
  approx_lead_time_label?: string;
  negotiable: boolean;
  min_order_quantity?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  is_stale: boolean;
}

interface CatalogStats {
  total_skus: number;
  direct_order_enabled: number;
  stale_prices: number;
}

const SupplierCatalog: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isGeorgian = i18n.language === 'ka';

  // State
  const [skus, setSKUs] = useState<SKU[]>([]);
  const [stats, setStats] = useState<CatalogStats>({
    total_skus: 0,
    direct_order_enabled: 0,
    stale_prices: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [directOrderFilter, setDirectOrderFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('updated_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // UI State
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingSKU, setEditingSKU] = useState<SKU | null>(null);
  const [selectedSKUs, setSelectedSKUs] = useState<string[]>([]);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);

  // Fetch catalog data
  const fetchCatalog = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (categoryFilter) params.append('category', categoryFilter);
      if (directOrderFilter === 'true') params.append('direct_order', 'on');
      if (directOrderFilter === 'false') params.append('direct_order', 'off');
      if (statusFilter !== 'all') params.append('status', statusFilter);
      params.append('sort_by', sortBy);
      params.append('sort_order', sortOrder);

      const token = localStorage.getItem('buildapp_auth_token');
      const response = await fetch(`${API_URL}/api/suppliers/catalog/skus?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch catalog');
      }

      const data = await response.json();
      setSKUs(data.skus || []);
      setStats(data.stats || { total_skus: 0, direct_order_enabled: 0, stale_prices: 0 });
    } catch (err: any) {
      console.error('Error fetching catalog:', err);
      setError(err.message || t('messages.error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalog();
  }, [categoryFilter, directOrderFilter, statusFilter, sortBy, sortOrder]);

  const handleAddProduct = () => {
    setEditingSKU(null);
    setShowProductForm(true);
  };

  const handleEditProduct = (sku: SKU) => {
    setEditingSKU(sku);
    setShowProductForm(true);
  };

  const handleProductSaved = () => {
    setShowProductForm(false);
    setEditingSKU(null);
    fetchCatalog();
  };

  const handleToggleSelect = (skuId: string) => {
    setSelectedSKUs((prev) =>
      prev.includes(skuId) ? prev.filter((id) => id !== skuId) : [...prev, skuId]
    );
  };

  const handleSelectAll = () => {
    if (selectedSKUs.length === skus.length) {
      setSelectedSKUs([]);
    } else {
      setSelectedSKUs(skus.map((s) => s.id));
    }
  };

  const handleBulkUpdate = async (updates: any) => {
    if (selectedSKUs.length === 0) return;

    setBulkActionLoading(true);
    try {
      const token = localStorage.getItem('buildapp_auth_token');
      const response = await fetch(`${API_URL}/api/suppliers/catalog/skus/bulk`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sku_ids: selectedSKUs,
          updates,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update SKUs');
      }

      // Clear selection and refresh catalog
      setSelectedSKUs([]);
      await fetchCatalog();
    } catch (err: any) {
      console.error('Error updating SKUs:', err);
      setError(err.message || t('messages.error'));
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleActivateDirectOrder = () => {
    handleBulkUpdate({ direct_order_available: true });
  };

  const handleDeactivateDirectOrder = () => {
    handleBulkUpdate({ direct_order_available: false });
  };

  const handleActivateProduct = () => {
    handleBulkUpdate({ is_active: true });
  };

  const handleDeactivateProduct = () => {
    handleBulkUpdate({ is_active: false });
  };

  const handleDeleteProduct = async () => {
    if (selectedSKUs.length === 0) return;

    // Confirm deletion
    if (!window.confirm(t('catalog.bulk.confirmDelete', `Are you sure you want to permanently delete ${selectedSKUs.length} product(s)? This action cannot be undone.`))) {
      return;
    }

    setBulkActionLoading(true);
    try {
      const token = localStorage.getItem('buildapp_auth_token');

      // Delete each SKU individually with permanent=true
      const deletePromises = selectedSKUs.map(skuId =>
        fetch(`${API_URL}/api/suppliers/catalog/skus/${skuId}?permanent=true`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })
      );

      await Promise.all(deletePromises);

      // Clear selection and refresh catalog
      setSelectedSKUs([]);
      await fetchCatalog();
    } catch (err: any) {
      console.error('Error deleting SKUs:', err);
      setError(err.message || t('messages.error'));
    } finally {
      setBulkActionLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: colors.background.secondary,
      paddingBottom: spacing[20],
    }}>
      {/* Header */}
      <div style={{
        backgroundColor: colors.background.primary,
        borderBottom: `1px solid ${colors.border.light}`,
      }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: `${spacing[6]} ${spacing[4]}`,
        }}>
          <h1 style={{
            fontSize: typography.fontSize['2xl'],
            fontWeight: typography.fontWeight.bold,
            color: colors.text.primary,
            marginBottom: spacing[6],
          }}>{t('catalog.title')}</h1>

          {/* Stats */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: spacing[4],
            marginBottom: spacing[6],
          }}>
            <div style={{
              backgroundColor: colors.info[50],
              borderRadius: borderRadius.lg,
              padding: spacing[4],
            }}>
              <div style={{
                fontSize: typography.fontSize.sm,
                color: colors.info[600],
                fontWeight: typography.fontWeight.medium,
              }}>{t('catalog.totalSkus')}</div>
              <div style={{
                fontSize: typography.fontSize['3xl'],
                fontWeight: typography.fontWeight.bold,
                color: colors.info[900],
                marginTop: spacing[1],
              }}>{stats.total_skus}</div>
            </div>

            <div style={{
              backgroundColor: colors.success[50],
              borderRadius: borderRadius.lg,
              padding: spacing[4],
            }}>
              <div style={{
                fontSize: typography.fontSize.sm,
                color: colors.success[600],
                fontWeight: typography.fontWeight.medium,
              }}>
                {t('catalog.directOrderEnabled')}
              </div>
              <div style={{
                fontSize: typography.fontSize['3xl'],
                fontWeight: typography.fontWeight.bold,
                color: colors.success[900],
                marginTop: spacing[1],
              }}>
                {stats.direct_order_enabled}
              </div>
            </div>

            <div style={{
              backgroundColor: colors.warning[50],
              borderRadius: borderRadius.lg,
              padding: spacing[4],
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: spacing[2],
              }}>
                <div style={{
                  fontSize: typography.fontSize.sm,
                  color: colors.warning[600],
                  fontWeight: typography.fontWeight.medium,
                }}>{t('catalog.stalePrices')}</div>
                {stats.stale_prices > 0 && <AlertCircle style={{ width: '16px', height: '16px', color: colors.warning[500] }} />}
              </div>
              <div style={{
                fontSize: typography.fontSize['3xl'],
                fontWeight: typography.fontWeight.bold,
                color: colors.warning[900],
                marginTop: spacing[1],
              }}>{stats.stale_prices}</div>
              {stats.stale_prices > 0 && (
                <div style={{
                  fontSize: typography.fontSize.xs,
                  color: colors.warning[600],
                  marginTop: spacing[2],
                }}>
                  {t('catalog.messages.updatePricesNudge', { count: stats.stale_prices })}
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: spacing[3],
          }}>
            <button
              onClick={handleAddProduct}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: spacing[2],
                padding: `${spacing[2]} ${spacing[4]}`,
                backgroundColor: colors.primary[600],
                color: colors.text.inverse,
                fontWeight: typography.fontWeight.medium,
                borderRadius: borderRadius.lg,
                border: 'none',
                cursor: 'pointer',
                transition: 'background-color 0.2s',
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = colors.primary[700]}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = colors.primary[600]}
            >
              <Plus style={{ width: '20px', height: '20px' }} />
              {t('catalog.addProduct')}
            </button>

            <button
              disabled
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: spacing[2],
                padding: `${spacing[2]} ${spacing[4]}`,
                backgroundColor: colors.neutral[100],
                color: colors.text.disabled,
                fontWeight: typography.fontWeight.medium,
                borderRadius: borderRadius.lg,
                border: 'none',
                cursor: 'not-allowed',
              }}
            >
              <Upload style={{ width: '20px', height: '20px' }} />
              {t('catalog.bulkUpload')} (V2)
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div style={{
        backgroundColor: colors.background.primary,
        borderBottom: `1px solid ${colors.border.light}`,
      }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: `${spacing[4]} ${spacing[4]}`,
        }}>
          {/* Basic Filters - Always visible */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: spacing[4],
          }}>
            {/* Category and Sort - Side by side on all screens */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: spacing[3],
            }}>
              {/* Category Filter */}
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                style={{
                  padding: `${spacing[3]} ${spacing[4]}`,
                  paddingRight: spacing[10],
                  border: `1px solid ${colors.border.default}`,
                  borderRadius: borderRadius.md,
                  fontSize: typography.fontSize.sm,
                  color: colors.text.primary,
                  backgroundColor: colors.background.primary,
                  cursor: 'pointer',
                  fontWeight: typography.fontWeight.medium,
                  appearance: 'none',
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23666' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 16px center',
                  lineHeight: '1.5',
                }}
              >
                <option value="">{t('catalog.allCategories')}</option>
                <option value="concrete">{isGeorgian ? 'ბეტონი' : 'Concrete'}</option>
                <option value="cement">{isGeorgian ? 'ცემენტი' : 'Cement'}</option>
                <option value="steel">{isGeorgian ? 'ფოლადი' : 'Steel'}</option>
                <option value="brick">{isGeorgian ? 'აგური' : 'Brick'}</option>
              </select>

              {/* Sort */}
              <select
                value={`${sortBy}_${sortOrder}`}
                onChange={(e) => {
                  const [newSortBy, newSortOrder] = e.target.value.split('_');
                  setSortBy(newSortBy);
                  setSortOrder(newSortOrder as 'asc' | 'desc');
                }}
                style={{
                  padding: `${spacing[3]} ${spacing[4]}`,
                  paddingRight: spacing[10],
                  border: `1px solid ${colors.border.default}`,
                  borderRadius: borderRadius.md,
                  fontSize: typography.fontSize.sm,
                  color: colors.text.primary,
                  backgroundColor: colors.background.primary,
                  cursor: 'pointer',
                  fontWeight: typography.fontWeight.medium,
                  appearance: 'none',
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23666' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 16px center',
                  lineHeight: '1.5',
                }}
              >
                <option value="updated_at_desc">{t('catalog.recentFirst')}</option>
                <option value="updated_at_asc">{t('catalog.staleFirst')}</option>
                <option value="name_asc">{t('catalog.nameAZ')}</option>
              </select>
            </div>

            {/* Desktop Advanced Filters - Only visible on desktop */}
            <div className="desktop-advanced-filters" style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: spacing[4],
              alignItems: 'center',
            }}>
              {/* Direct Order Label and Toggles */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: spacing[3],
              }}>
                <span style={{
                  fontSize: typography.fontSize.sm,
                  fontWeight: typography.fontWeight.medium,
                  color: colors.text.secondary,
                  whiteSpace: 'nowrap',
                }}>
                  {isGeorgian ? 'პირდაპირი შეკვეთა:' : 'Direct Order:'}
                </span>
                <div style={{
                  display: 'inline-flex',
                  backgroundColor: colors.neutral[100],
                  borderRadius: borderRadius.full,
                  padding: spacing[1],
                  gap: spacing[1],
                }}>
                  <button
                    onClick={() => setDirectOrderFilter('all')}
                    style={{
                      padding: `${spacing[2]} ${spacing[4]}`,
                      fontSize: typography.fontSize.sm,
                      fontWeight: typography.fontWeight.medium,
                      borderRadius: borderRadius.full,
                      border: 'none',
                      backgroundColor: directOrderFilter === 'all' ? colors.background.primary : 'transparent',
                      color: directOrderFilter === 'all' ? colors.text.primary : colors.text.secondary,
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                      boxShadow: directOrderFilter === 'all' ? shadows.sm : 'none',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {isGeorgian ? 'ყველა' : 'All'}
                  </button>
                  <button
                    onClick={() => setDirectOrderFilter('true')}
                    style={{
                      padding: `${spacing[2]} ${spacing[4]}`,
                      fontSize: typography.fontSize.sm,
                      fontWeight: typography.fontWeight.medium,
                      borderRadius: borderRadius.full,
                      border: 'none',
                      backgroundColor: directOrderFilter === 'true' ? colors.background.primary : 'transparent',
                      color: directOrderFilter === 'true' ? colors.success[700] : colors.text.secondary,
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                      boxShadow: directOrderFilter === 'true' ? shadows.sm : 'none',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {isGeorgian ? 'ჩართული' : 'On'}
                  </button>
                  <button
                    onClick={() => setDirectOrderFilter('false')}
                    style={{
                      padding: `${spacing[2]} ${spacing[4]}`,
                      fontSize: typography.fontSize.sm,
                      fontWeight: typography.fontWeight.medium,
                      borderRadius: borderRadius.full,
                      border: 'none',
                      backgroundColor: directOrderFilter === 'false' ? colors.background.primary : 'transparent',
                      color: directOrderFilter === 'false' ? colors.text.primary : colors.text.secondary,
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                      boxShadow: directOrderFilter === 'false' ? shadows.sm : 'none',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {isGeorgian ? 'გამორთული' : 'Off'}
                  </button>
                </div>
              </div>

              {/* Divider */}
              <div style={{
                width: '1px',
                height: '32px',
                backgroundColor: colors.border.default,
              }} />

              {/* Product Status Label and Toggles */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: spacing[3],
              }}>
                <span style={{
                  fontSize: typography.fontSize.sm,
                  fontWeight: typography.fontWeight.medium,
                  color: colors.text.secondary,
                  whiteSpace: 'nowrap',
                }}>
                  {isGeorgian ? 'სტატუსი:' : 'Status:'}
                </span>
                <div style={{
                  display: 'inline-flex',
                  backgroundColor: colors.neutral[100],
                  borderRadius: borderRadius.full,
                  padding: spacing[1],
                  gap: spacing[1],
                }}>
                  <button
                    onClick={() => setStatusFilter('all')}
                    style={{
                      padding: `${spacing[2]} ${spacing[4]}`,
                      fontSize: typography.fontSize.sm,
                      fontWeight: typography.fontWeight.medium,
                      borderRadius: borderRadius.full,
                      border: 'none',
                      backgroundColor: statusFilter === 'all' ? colors.background.primary : 'transparent',
                      color: statusFilter === 'all' ? colors.text.primary : colors.text.secondary,
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                      boxShadow: statusFilter === 'all' ? shadows.sm : 'none',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {isGeorgian ? 'ყველა' : 'All'}
                  </button>
                  <button
                    onClick={() => setStatusFilter('active')}
                    style={{
                      padding: `${spacing[2]} ${spacing[4]}`,
                      fontSize: typography.fontSize.sm,
                      fontWeight: typography.fontWeight.medium,
                      borderRadius: borderRadius.full,
                      border: 'none',
                      backgroundColor: statusFilter === 'active' ? colors.background.primary : 'transparent',
                      color: statusFilter === 'active' ? colors.success[700] : colors.text.secondary,
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                      boxShadow: statusFilter === 'active' ? shadows.sm : 'none',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {isGeorgian ? 'აქტიური' : 'Active'}
                  </button>
                  <button
                    onClick={() => setStatusFilter('inactive')}
                    style={{
                      padding: `${spacing[2]} ${spacing[4]}`,
                      fontSize: typography.fontSize.sm,
                      fontWeight: typography.fontWeight.medium,
                      borderRadius: borderRadius.full,
                      border: 'none',
                      backgroundColor: statusFilter === 'inactive' ? colors.background.primary : 'transparent',
                      color: statusFilter === 'inactive' ? colors.error[700] : colors.text.secondary,
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                      boxShadow: statusFilter === 'inactive' ? shadows.sm : 'none',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {isGeorgian ? 'გაუქმებული' : 'Inactive'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedSKUs.length > 0 && (
        <div style={{
          backgroundColor: colors.primary[50],
          borderBottom: `1px solid ${colors.primary[200]}`,
        }}>
          <div style={{
            maxWidth: '1280px',
            margin: '0 auto',
            padding: `${spacing[3]} ${spacing[4]}`,
          }}>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: spacing[3],
            }}>
              <div style={{
                fontSize: typography.fontSize.sm,
                fontWeight: typography.fontWeight.medium,
                color: colors.primary[900],
              }}>
                {t('catalog.selected', { count: selectedSKUs.length })}
              </div>
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: spacing[2],
              }}>
                <button
                  onClick={handleActivateDirectOrder}
                  disabled={bulkActionLoading}
                  style={{
                    padding: `${spacing[2]} ${spacing[3]}`,
                    fontSize: typography.fontSize.sm,
                    backgroundColor: colors.background.primary,
                    border: `1px solid ${colors.success[300]}`,
                    color: colors.success[700],
                    borderRadius: borderRadius.lg,
                    cursor: bulkActionLoading ? 'not-allowed' : 'pointer',
                    opacity: bulkActionLoading ? 0.6 : 1,
                    transition: 'background-color 0.2s',
                    whiteSpace: 'nowrap',
                  }}
                  onMouseOver={(e) => !bulkActionLoading && (e.currentTarget.style.backgroundColor = colors.success[50])}
                  onMouseOut={(e) => !bulkActionLoading && (e.currentTarget.style.backgroundColor = colors.background.primary)}
                >
                  {bulkActionLoading ? t('messages.updating', 'Updating...') : t('catalog.bulk.activateDirectOrder', 'Activate Direct Order')}
                </button>
                <button
                  onClick={handleDeactivateDirectOrder}
                  disabled={bulkActionLoading}
                  style={{
                    padding: `${spacing[2]} ${spacing[3]}`,
                    fontSize: typography.fontSize.sm,
                    backgroundColor: colors.background.primary,
                    border: `1px solid ${colors.warning[300]}`,
                    color: colors.warning[700],
                    borderRadius: borderRadius.lg,
                    cursor: bulkActionLoading ? 'not-allowed' : 'pointer',
                    opacity: bulkActionLoading ? 0.6 : 1,
                    transition: 'background-color 0.2s',
                    whiteSpace: 'nowrap',
                  }}
                  onMouseOver={(e) => !bulkActionLoading && (e.currentTarget.style.backgroundColor = colors.warning[50])}
                  onMouseOut={(e) => !bulkActionLoading && (e.currentTarget.style.backgroundColor = colors.background.primary)}
                >
                  {bulkActionLoading ? t('messages.updating', 'Updating...') : t('catalog.bulk.deactivateDirectOrder', 'Deactivate Direct Order')}
                </button>
                <button
                  onClick={handleActivateProduct}
                  disabled={bulkActionLoading}
                  style={{
                    padding: `${spacing[2]} ${spacing[3]}`,
                    fontSize: typography.fontSize.sm,
                    backgroundColor: colors.background.primary,
                    border: `1px solid ${colors.info[300]}`,
                    color: colors.info[700],
                    borderRadius: borderRadius.lg,
                    cursor: bulkActionLoading ? 'not-allowed' : 'pointer',
                    opacity: bulkActionLoading ? 0.6 : 1,
                    transition: 'background-color 0.2s',
                    whiteSpace: 'nowrap',
                  }}
                  onMouseOver={(e) => !bulkActionLoading && (e.currentTarget.style.backgroundColor = colors.info[50])}
                  onMouseOut={(e) => !bulkActionLoading && (e.currentTarget.style.backgroundColor = colors.background.primary)}
                >
                  {bulkActionLoading ? t('messages.updating', 'Updating...') : t('catalog.bulk.activateProduct', 'Activate Product')}
                </button>
                <button
                  onClick={handleDeactivateProduct}
                  disabled={bulkActionLoading}
                  style={{
                    padding: `${spacing[2]} ${spacing[3]}`,
                    fontSize: typography.fontSize.sm,
                    backgroundColor: colors.background.primary,
                    border: `1px solid ${colors.neutral[300]}`,
                    color: colors.neutral[700],
                    borderRadius: borderRadius.lg,
                    cursor: bulkActionLoading ? 'not-allowed' : 'pointer',
                    opacity: bulkActionLoading ? 0.6 : 1,
                    transition: 'background-color 0.2s',
                    whiteSpace: 'nowrap',
                  }}
                  onMouseOver={(e) => !bulkActionLoading && (e.currentTarget.style.backgroundColor = colors.neutral[50])}
                  onMouseOut={(e) => !bulkActionLoading && (e.currentTarget.style.backgroundColor = colors.background.primary)}
                >
                  {bulkActionLoading ? t('messages.updating', 'Updating...') : t('catalog.bulk.deactivateProduct', 'Deactivate Product')}
                </button>
                <button
                  onClick={handleDeleteProduct}
                  disabled={bulkActionLoading}
                  style={{
                    padding: `${spacing[2]} ${spacing[3]}`,
                    fontSize: typography.fontSize.sm,
                    backgroundColor: colors.background.primary,
                    border: `1px solid ${colors.error[300]}`,
                    color: colors.error[700],
                    borderRadius: borderRadius.lg,
                    cursor: bulkActionLoading ? 'not-allowed' : 'pointer',
                    opacity: bulkActionLoading ? 0.6 : 1,
                    transition: 'background-color 0.2s',
                    whiteSpace: 'nowrap',
                  }}
                  onMouseOver={(e) => !bulkActionLoading && (e.currentTarget.style.backgroundColor = colors.error[50])}
                  onMouseOut={(e) => !bulkActionLoading && (e.currentTarget.style.backgroundColor = colors.background.primary)}
                >
                  {bulkActionLoading ? t('messages.deleting', 'Deleting...') : t('catalog.bulk.deleteProduct', 'Delete Product')}
                </button>
                <button
                  onClick={() => setSelectedSKUs([])}
                  style={{
                    padding: `${spacing[2]} ${spacing[3]}`,
                    fontSize: typography.fontSize.sm,
                    color: colors.text.secondary,
                    backgroundColor: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'color 0.2s',
                    whiteSpace: 'nowrap',
                  }}
                  onMouseOver={(e) => e.currentTarget.style.color = colors.text.primary}
                  onMouseOut={(e) => e.currentTarget.style.color = colors.text.secondary}
                >
                  {t('catalog.actions.clear')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: `${spacing[6]} ${spacing[4]}`,
      }}>
        {loading ? (
          <div style={{
            textAlign: 'center',
            paddingTop: spacing[12],
            paddingBottom: spacing[12],
          }}>
            <div style={{
              display: 'inline-block',
              width: '32px',
              height: '32px',
              border: `2px solid ${colors.primary[600]}`,
              borderTopColor: 'transparent',
              borderRadius: borderRadius.full,
              animation: 'spin 1s linear infinite',
            }}></div>
            <div style={{
              marginTop: spacing[2],
              fontSize: typography.fontSize.sm,
              color: colors.text.tertiary,
            }}>{t('common.loading')}</div>
          </div>
        ) : error ? (
          <div style={{
            textAlign: 'center',
            paddingTop: spacing[12],
            paddingBottom: spacing[12],
          }}>
            <div style={{
              color: colors.error[600],
              marginBottom: spacing[2],
            }}>{error}</div>
            <button
              onClick={fetchCatalog}
              style={{
                fontSize: typography.fontSize.sm,
                color: colors.primary[600],
                fontWeight: typography.fontWeight.medium,
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                transition: 'color 0.2s',
              }}
              onMouseOver={(e) => e.currentTarget.style.color = colors.primary[700]}
              onMouseOut={(e) => e.currentTarget.style.color = colors.primary[600]}
            >
              {t('messages.tryAgain')}
            </button>
          </div>
        ) : skus.length === 0 ? (
          <div style={{
            textAlign: 'center',
            paddingTop: spacing[12],
            paddingBottom: spacing[12],
          }}>
            <div style={{
              color: colors.text.tertiary,
              marginBottom: spacing[4],
            }}>{t('catalog.messages.noProducts')}</div>
            <button
              onClick={handleAddProduct}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: spacing[2],
                padding: `${spacing[2]} ${spacing[4]}`,
                backgroundColor: colors.primary[600],
                color: colors.text.inverse,
                fontWeight: typography.fontWeight.medium,
                borderRadius: borderRadius.lg,
                border: 'none',
                cursor: 'pointer',
                transition: 'background-color 0.2s',
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = colors.primary[700]}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = colors.primary[600]}
            >
              <Plus style={{ width: '20px', height: '20px' }} />
              {t('catalog.addProduct')}
            </button>
          </div>
        ) : (
          <div style={{
            backgroundColor: colors.background.primary,
            borderRadius: borderRadius.lg,
            boxShadow: shadows.base,
            overflow: 'hidden',
          }}>
            {/* Desktop Table View */}
            <div className="desktop-table-view" style={{
              overflowX: 'auto',
            }}>
              <table style={{
                minWidth: '100%',
                borderCollapse: 'collapse',
              }}>
                <thead style={{
                  backgroundColor: colors.neutral[50],
                }}>
                  <tr>
                    <th style={{
                      padding: `${spacing[3]} ${spacing[4]}`,
                      textAlign: 'left',
                    }}>
                      <input
                        type="checkbox"
                        checked={selectedSKUs.length === skus.length}
                        onChange={handleSelectAll}
                        style={{
                          borderRadius: borderRadius.sm,
                          cursor: 'pointer',
                        }}
                      />
                    </th>
                    <th style={{
                      padding: `${spacing[3]} ${spacing[4]}`,
                      textAlign: 'left',
                      fontSize: typography.fontSize.xs,
                      fontWeight: typography.fontWeight.medium,
                      color: colors.text.tertiary,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}>
                      {t('catalog.productName')}
                    </th>
                    <th style={{
                      padding: `${spacing[3]} ${spacing[4]}`,
                      textAlign: 'left',
                      fontSize: typography.fontSize.xs,
                      fontWeight: typography.fontWeight.medium,
                      color: colors.text.tertiary,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}>
                      {t('catalog.unit')} | {t('catalog.basePrice')}
                    </th>
                    <th style={{
                      padding: `${spacing[3]} ${spacing[4]}`,
                      textAlign: 'left',
                      fontSize: typography.fontSize.xs,
                      fontWeight: typography.fontWeight.medium,
                      color: colors.text.tertiary,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}>
                      {t('catalog.updated')}
                    </th>
                    <th style={{
                      padding: `${spacing[3]} ${spacing[4]}`,
                      textAlign: 'left',
                      fontSize: typography.fontSize.xs,
                      fontWeight: typography.fontWeight.medium,
                      color: colors.text.tertiary,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}>
                      {t('catalog.directOrder')}
                    </th>
                    <th style={{
                      padding: `${spacing[3]} ${spacing[4]}`,
                      textAlign: 'left',
                      fontSize: typography.fontSize.xs,
                      fontWeight: typography.fontWeight.medium,
                      color: colors.text.tertiary,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}>
                      {t('catalog.actionsHeader')}
                    </th>
                  </tr>
                </thead>
                <tbody style={{
                  backgroundColor: colors.background.primary,
                }}>
                  {skus.map((sku) => (
                    <tr
                      key={sku.id}
                      style={{
                        borderTop: `1px solid ${colors.border.light}`,
                        transition: 'background-color 0.15s',
                      }}
                      onMouseOver={(e) => e.currentTarget.style.backgroundColor = colors.neutral[50]}
                      onMouseOut={(e) => e.currentTarget.style.backgroundColor = colors.background.primary}
                    >
                      <td style={{
                        padding: `${spacing[4]} ${spacing[4]}`,
                      }}>
                        <input
                          type="checkbox"
                          checked={selectedSKUs.includes(sku.id)}
                          onChange={() => handleToggleSelect(sku.id)}
                          style={{
                            borderRadius: borderRadius.sm,
                            cursor: 'pointer',
                          }}
                        />
                      </td>
                      <td style={{
                        padding: `${spacing[4]} ${spacing[4]}`,
                      }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: spacing[3],
                        }}>
                          {sku.images && sku.images.length > 0 ? (
                            <img
                              src={sku.images[0]}
                              alt={isGeorgian ? sku.name_ka : sku.name_en}
                              style={{
                                width: '48px',
                                height: '48px',
                                borderRadius: borderRadius.base,
                                objectFit: 'cover',
                                backgroundColor: colors.neutral[100],
                              }}
                            />
                          ) : (
                            <div style={{
                              width: '48px',
                              height: '48px',
                              borderRadius: borderRadius.base,
                              backgroundColor: colors.neutral[200],
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: colors.neutral[400],
                              fontSize: typography.fontSize.xs,
                            }}>
                              No img
                            </div>
                          )}
                          <div>
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: spacing[2],
                            }}>
                              <span style={{
                                fontWeight: typography.fontWeight.medium,
                                color: sku.is_active ? colors.text.primary : colors.text.tertiary,
                                textDecoration: sku.is_active ? 'none' : 'line-through',
                              }}>
                                {isGeorgian ? sku.name_ka : sku.name_en}
                              </span>
                              {!sku.is_active && (
                                <span style={{
                                  fontSize: typography.fontSize.xs,
                                  fontWeight: typography.fontWeight.medium,
                                  padding: `${spacing[1]} ${spacing[2]}`,
                                  borderRadius: borderRadius.sm,
                                  backgroundColor: colors.error[100],
                                  color: colors.error[700],
                                }}>
                                  {t('catalog.deactivated', 'Deactivated')}
                                </span>
                              )}
                            </div>
                            {(isGeorgian ? sku.spec_string_ka : sku.spec_string_en) && (
                              <div style={{
                                fontSize: typography.fontSize.sm,
                                color: colors.text.tertiary,
                              }}>
                                {isGeorgian ? sku.spec_string_ka : sku.spec_string_en}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td style={{
                        padding: `${spacing[4]} ${spacing[4]}`,
                      }}>
                        <div style={{
                          fontSize: typography.fontSize.sm,
                        }}>
                          <div style={{
                            color: colors.text.tertiary,
                          }}>
                            {isGeorgian ? sku.unit_ka : sku.unit_en}
                          </div>
                          <div style={{
                            fontWeight: typography.fontWeight.medium,
                            color: colors.text.primary,
                          }}>
                            ₾{Number(sku.base_price).toFixed(2)}
                          </div>
                        </div>
                      </td>
                      <td style={{
                        padding: `${spacing[4]} ${spacing[4]}`,
                      }}>
                        {sku.is_stale ? (
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            padding: `${spacing[1]} ${spacing[2]}`,
                            borderRadius: borderRadius.full,
                            fontSize: typography.fontSize.xs,
                            fontWeight: typography.fontWeight.medium,
                            backgroundColor: colors.warning[100],
                            color: colors.warning[800],
                          }}>
                            {t('catalog.stale')}
                          </span>
                        ) : (
                          <div style={{
                            fontSize: typography.fontSize.sm,
                            color: colors.text.tertiary,
                          }}>
                            {t('catalog.daysAgo', {
                              count: Math.floor(
                                (Date.now() - new Date(sku.updated_at).getTime()) /
                                  (1000 * 60 * 60 * 24)
                              ),
                            })}
                          </div>
                        )}
                      </td>
                      <td style={{
                        padding: `${spacing[4]} ${spacing[4]}`,
                      }}>
                        {sku.direct_order_available ? (
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            padding: `${spacing[1]} ${spacing[2]}`,
                            borderRadius: borderRadius.full,
                            fontSize: typography.fontSize.xs,
                            fontWeight: typography.fontWeight.medium,
                            backgroundColor: colors.success[100],
                            color: colors.success[800],
                          }}>
                            ON
                          </span>
                        ) : (
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            padding: `${spacing[1]} ${spacing[2]}`,
                            borderRadius: borderRadius.full,
                            fontSize: typography.fontSize.xs,
                            fontWeight: typography.fontWeight.medium,
                            backgroundColor: colors.neutral[100],
                            color: colors.neutral[800],
                          }}>
                            OFF
                          </span>
                        )}
                      </td>
                      <td style={{
                        padding: `${spacing[4]} ${spacing[4]}`,
                      }}>
                        <button
                          onClick={() => handleEditProduct(sku)}
                          style={{
                            fontSize: typography.fontSize.sm,
                            color: colors.primary[600],
                            fontWeight: typography.fontWeight.medium,
                            backgroundColor: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            transition: 'color 0.2s',
                          }}
                          onMouseOver={(e) => e.currentTarget.style.color = colors.primary[700]}
                          onMouseOut={(e) => e.currentTarget.style.color = colors.primary[600]}
                        >
                          {t('catalog.edit')}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="mobile-card-view" style={{
              flexDirection: 'column',
              gap: spacing[3],
              padding: spacing[3],
            }}>
              {skus.map((sku) => (
                <div
                  key={sku.id}
                  style={{
                    backgroundColor: colors.neutral[0],
                    padding: spacing[4],
                    borderRadius: borderRadius.lg,
                    border: `1px solid ${colors.border.light}`,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = shadows.md;
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.05)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  {/* Header: Checkbox and Image */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: spacing[3],
                    marginBottom: spacing[3],
                  }}>
                    <input
                      type="checkbox"
                      checked={selectedSKUs.includes(sku.id)}
                      onChange={() => handleToggleSelect(sku.id)}
                      style={{
                        marginTop: spacing[1],
                        borderRadius: borderRadius.sm,
                        cursor: 'pointer',
                      }}
                    />
                    {sku.images && sku.images.length > 0 ? (
                      <img
                        src={sku.images[0]}
                        alt={isGeorgian ? sku.name_ka : sku.name_en}
                        style={{
                          width: '72px',
                          height: '72px',
                          borderRadius: borderRadius.md,
                          objectFit: 'cover',
                          backgroundColor: colors.neutral[100],
                          flexShrink: 0,
                        }}
                      />
                    ) : (
                      <div style={{
                        width: '72px',
                        height: '72px',
                        borderRadius: borderRadius.md,
                        backgroundColor: colors.neutral[200],
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: colors.neutral[400],
                        fontSize: typography.fontSize.xs,
                        flexShrink: 0,
                      }}>
                        No img
                      </div>
                    )}
                    <div style={{
                      flex: 1,
                      minWidth: 0,
                    }}>
                      <h3 style={{
                        fontSize: typography.fontSize.base,
                        fontWeight: typography.fontWeight.semibold,
                        color: sku.is_active ? colors.text.primary : colors.text.tertiary,
                        margin: 0,
                        marginBottom: spacing[1],
                        letterSpacing: '-0.01em',
                        textDecoration: sku.is_active ? 'none' : 'line-through',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                      }}>
                        {isGeorgian ? sku.name_ka : sku.name_en}
                      </h3>
                      {(isGeorgian ? sku.spec_string_ka : sku.spec_string_en) && (
                        <p style={{
                          fontSize: typography.fontSize.sm,
                          color: colors.text.secondary,
                          margin: 0,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          lineHeight: '1.5',
                        }}>
                          {isGeorgian ? sku.spec_string_ka : sku.spec_string_en}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Info grid */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: spacing[3],
                    marginBottom: spacing[3],
                    padding: spacing[3],
                    backgroundColor: colors.neutral[50],
                    borderRadius: borderRadius.md,
                  }}>
                    {/* Unit */}
                    <div>
                      <div style={{
                        fontSize: typography.fontSize.xs,
                        color: colors.text.tertiary,
                        marginBottom: spacing[1],
                        fontWeight: typography.fontWeight.medium,
                      }}>
                        {t('catalog.unit')}
                      </div>
                      <div style={{
                        fontSize: typography.fontSize.sm,
                        color: colors.text.primary,
                        fontWeight: typography.fontWeight.medium,
                      }}>
                        {isGeorgian ? sku.unit_ka : sku.unit_en}
                      </div>
                    </div>

                    {/* Price */}
                    <div>
                      <div style={{
                        fontSize: typography.fontSize.xs,
                        color: colors.text.tertiary,
                        marginBottom: spacing[1],
                        fontWeight: typography.fontWeight.medium,
                      }}>
                        {t('catalog.basePrice')}
                      </div>
                      <div style={{
                        fontSize: typography.fontSize.lg,
                        color: colors.text.primary,
                        fontWeight: typography.fontWeight.bold,
                      }}>
                        ₾{Number(sku.base_price).toFixed(2)}
                      </div>
                    </div>
                  </div>

                  {/* Status badges */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: spacing[2],
                    flexWrap: 'wrap',
                    marginBottom: spacing[3],
                  }}>
                    {!sku.is_active && (
                      <span style={{
                        fontSize: typography.fontSize.xs,
                        fontWeight: typography.fontWeight.semibold,
                        padding: `${spacing[1]} ${spacing[2.5]}`,
                        borderRadius: borderRadius.full,
                        backgroundColor: colors.error[100],
                        color: colors.error[700],
                      }}>
                        {t('catalog.deactivated', 'Deactivated')}
                      </span>
                    )}
                    {sku.direct_order_available ? (
                      <span style={{
                        fontSize: typography.fontSize.xs,
                        fontWeight: typography.fontWeight.semibold,
                        padding: `${spacing[1]} ${spacing[2.5]}`,
                        borderRadius: borderRadius.full,
                        backgroundColor: colors.success[100],
                        color: colors.success[700],
                      }}>
                        Direct Order ON
                      </span>
                    ) : (
                      <span style={{
                        fontSize: typography.fontSize.xs,
                        fontWeight: typography.fontWeight.semibold,
                        padding: `${spacing[1]} ${spacing[2.5]}`,
                        borderRadius: borderRadius.full,
                        backgroundColor: colors.neutral[100],
                        color: colors.neutral[700],
                      }}>
                        RFQ Only
                      </span>
                    )}
                    {sku.is_stale && (
                      <span style={{
                        fontSize: typography.fontSize.xs,
                        fontWeight: typography.fontWeight.semibold,
                        padding: `${spacing[1]} ${spacing[2.5]}`,
                        borderRadius: borderRadius.full,
                        backgroundColor: colors.warning[100],
                        color: colors.warning[700],
                      }}>
                        {t('catalog.stale')}
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                  }}>
                    <button
                      onClick={() => handleEditProduct(sku)}
                      style={{
                        fontSize: typography.fontSize.sm,
                        color: colors.primary[600],
                        fontWeight: typography.fontWeight.semibold,
                        backgroundColor: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'color 0.2s',
                        padding: `${spacing[1.5]} ${spacing[3]}`,
                      }}
                      onMouseOver={(e) => e.currentTarget.style.color = colors.primary[700]}
                      onMouseOut={(e) => e.currentTarget.style.color = colors.primary[600]}
                    >
                      {t('catalog.edit')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Product Form Modal */}
      {showProductForm && (
        <ProductForm
          sku={editingSKU}
          onClose={() => {
            setShowProductForm(false);
            setEditingSKU(null);
          }}
          onSaved={handleProductSaved}
        />
      )}

      {/* Responsive display styles and animations */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .desktop-table-view {
          display: block;
        }

        .mobile-card-view {
          display: none;
        }

        .desktop-advanced-filters {
          display: flex !important;
        }

        @media (max-width: 767px) {
          .desktop-table-view {
            display: none !important;
          }

          .mobile-card-view {
            display: flex !important;
          }

          .desktop-advanced-filters {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default SupplierCatalog;
