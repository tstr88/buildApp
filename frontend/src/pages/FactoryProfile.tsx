/**
 * Factory Profile Page
 * Individual supplier profile with catalog, about, and coverage tabs
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import * as Icons from 'lucide-react';
import { colors, spacing, typography, borderRadius } from '../theme/tokens';
import { TrustLabelDisplay } from '../components/factories/TrustLabelDisplay';
import { SKUCard } from '../components/catalog/SKUCard';
import { SKURow } from '../components/catalog/SKURow';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface SupplierProfile {
  id: string;
  business_name: string;
  depot_address: string;
  depot_lat: number;
  depot_lng: number;
  categories: string[];
  trust_metrics: {
    spec_reliability: number;
    on_time_delivery: number;
    issue_rate: number;
    total_deliveries: number;
  };
  about_text?: string;
  operating_hours?: string;
  languages?: string[];
  photos?: string[];
  payment_terms: string[];
  minimum_order_value?: number;
  lead_time_notes?: string;
  delivery_zones?: Array<{ lat: number; lng: number }>;
  distance_km?: number;
}

interface SKU {
  id: string;
  supplier_id: string;
  supplier_name_ka: string;
  supplier_name_en: string;
  name_ka: string;
  name_en: string;
  spec_string_ka?: string;
  spec_string_en?: string;
  category_ka: string;
  category_en: string;
  base_price?: number;
  unit_ka: string;
  unit_en: string;
  direct_order_available: boolean;
  lead_time_category?: 'same_day' | 'next_day' | 'negotiable';
  pickup_available: boolean;
  delivery_available: boolean;
  updated_at: string;
  thumbnail_url?: string;
}

type TabType = 'catalog' | 'about' | 'coverage';

const CATEGORY_LABELS: Record<string, string> = {
  concrete: 'Concrete',
  blocks: 'Blocks',
  rebar: 'Rebar/Mesh',
  aggregates: 'Aggregates',
  metal: 'Metal Profiles',
  tools: 'Tools',
};

export const FactoryProfile: React.FC = () => {
  const navigate = useNavigate();
  const { supplierId } = useParams<{ supplierId: string }>();

  const [supplier, setSupplier] = useState<SupplierProfile | null>(null);
  const [skus, setSkus] = useState<SKU[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('catalog');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (supplierId) {
      fetchSupplierProfile();
      fetchSupplierCatalog();
    }
  }, [supplierId]);

  const fetchSupplierProfile = async () => {
    try {
      const response = await fetch(`${API_URL}/api/factories/${supplierId}`);
      if (response.ok) {
        const data = await response.json();
        setSupplier(data.data);
      } else {
        console.error('Failed to fetch supplier profile');
      }
    } catch (error) {
      console.error('Error fetching supplier profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSupplierCatalog = async () => {
    try {
      const response = await fetch(`${API_URL}/api/factories/${supplierId}/catalog`);
      if (response.ok) {
        const data = await response.json();
        setSkus(data.data?.skus || []);
      } else {
        console.error('Failed to fetch supplier catalog');
      }
    } catch (error) {
      console.error('Error fetching supplier catalog:', error);
    }
  };

  const handleAddToRFQ = (sku: SKU) => {
    navigate(`/rfqs/create?sku_id=${sku.id}`);
  };

  const handleDirectOrder = (sku: SKU) => {
    navigate(`/orders/direct/${supplierId}?sku_id=${sku.id}`);
  };

  const filteredSkus = skus.filter((sku) =>
    sku.name_ka.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sku.name_en.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (sku.spec_string_ka && sku.spec_string_ka.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (sku.spec_string_en && sku.spec_string_en.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          backgroundColor: colors.neutral[50],
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icons.Loader
          size={48}
          color={colors.text.tertiary}
          style={{ animation: 'spin 1s linear infinite' }}
        />
      </div>
    );
  }

  if (!supplier) {
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
        <div style={{ textAlign: 'center' }}>
          <Icons.Building size={64} color={colors.text.tertiary} style={{ margin: '0 auto', marginBottom: spacing[4] }} />
          <h2
            style={{
              fontSize: typography.fontSize['2xl'],
              fontWeight: typography.fontWeight.bold,
              color: colors.text.primary,
              margin: 0,
              marginBottom: spacing[2],
            }}
          >
            Supplier not found
          </h2>
          <button
            onClick={() => navigate('/factories')}
            style={{
              padding: `${spacing[2]} ${spacing[4]}`,
              backgroundColor: colors.primary[600],
              color: colors.neutral[0],
              border: 'none',
              borderRadius: borderRadius.md,
              fontSize: typography.fontSize.base,
              fontWeight: typography.fontWeight.medium,
              cursor: 'pointer',
            }}
          >
            Back to Directory
          </button>
        </div>
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
      {/* Header */}
      <div
        style={{
          backgroundColor: colors.neutral[0],
          borderBottom: `1px solid ${colors.border.light}`,
        }}
      >
        <div
          style={{
            maxWidth: '1400px',
            margin: '0 auto',
            padding: spacing[6],
          }}
        >
          {/* Back Button */}
          <button
            onClick={() => navigate('/factories')}
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
            Back to Directory
          </button>

          {/* Supplier Header */}
          <div style={{ marginBottom: spacing[4] }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: spacing[3],
              }}
            >
              <div>
                <h1
                  style={{
                    fontSize: typography.fontSize['3xl'],
                    fontWeight: typography.fontWeight.bold,
                    color: colors.text.primary,
                    margin: 0,
                    marginBottom: spacing[2],
                  }}
                >
                  {supplier.business_name}
                </h1>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: spacing[2],
                    marginBottom: spacing[2],
                  }}
                >
                  <Icons.MapPin size={16} color={colors.text.tertiary} />
                  <span
                    style={{
                      fontSize: typography.fontSize.base,
                      color: colors.text.secondary,
                    }}
                  >
                    {supplier.depot_address}
                  </span>
                  {supplier.distance_km !== undefined && (
                    <span
                      style={{
                        fontSize: typography.fontSize.base,
                        color: colors.primary[600],
                        fontWeight: typography.fontWeight.medium,
                      }}
                    >
                      • {supplier.distance_km.toFixed(1)} km away
                    </span>
                  )}
                </div>

                {/* Categories */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: spacing[2] }}>
                  {supplier.categories.map((cat) => (
                    <div
                      key={cat}
                      style={{
                        padding: `${spacing[1]} ${spacing[2]}`,
                        backgroundColor: colors.primary[50],
                        color: colors.primary[700],
                        borderRadius: borderRadius.sm,
                        fontSize: typography.fontSize.sm,
                        fontWeight: typography.fontWeight.medium,
                      }}
                    >
                      {CATEGORY_LABELS[cat] || cat}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Trust Labels */}
            <TrustLabelDisplay metrics={supplier.trust_metrics} variant="compact" />
          </div>

          {/* Tabs */}
          <div
            style={{
              display: 'flex',
              borderBottom: `1px solid ${colors.border.light}`,
            }}
          >
            {[
              { key: 'catalog', label: 'Catalog', icon: Icons.Package },
              { key: 'about', label: 'About', icon: Icons.Info },
              { key: 'coverage', label: 'Coverage & Terms', icon: Icons.MapPin },
            ].map((tab) => {
              const IconComponent = tab.icon;
              const isActive = activeTab === tab.key;

              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as TabType)}
                  style={{
                    padding: `${spacing[3]} ${spacing[4]}`,
                    backgroundColor: 'transparent',
                    border: 'none',
                    borderBottom: `2px solid ${isActive ? colors.primary[600] : 'transparent'}`,
                    color: isActive ? colors.primary[600] : colors.text.secondary,
                    fontSize: typography.fontSize.base,
                    fontWeight: typography.fontWeight.medium,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: spacing[2],
                    transition: 'all 200ms ease',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) e.currentTarget.style.color = colors.text.primary;
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) e.currentTarget.style.color = colors.text.secondary;
                  }}
                >
                  <IconComponent size={18} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div
        style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: spacing[6],
        }}
      >
        {activeTab === 'catalog' && (
          <div>
            {/* Search & View Controls */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: spacing[3],
                marginBottom: spacing[4],
              }}
            >
              <div style={{ flex: 1, maxWidth: '500px', position: 'relative' }}>
                <Icons.Search
                  size={20}
                  color={colors.text.tertiary}
                  style={{
                    position: 'absolute',
                    left: spacing[3],
                    top: '50%',
                    transform: 'translateY(-50%)',
                  }}
                />
                <input
                  type="text"
                  placeholder="Search SKUs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: `${spacing[2]} ${spacing[3]} ${spacing[2]} ${spacing[10]}`,
                    fontSize: typography.fontSize.base,
                    border: `1px solid ${colors.border.light}`,
                    borderRadius: borderRadius.md,
                    outline: 'none',
                  }}
                />
              </div>

              {/* View Mode Toggle */}
              <div
                style={{
                  display: 'flex',
                  border: `1px solid ${colors.border.light}`,
                  borderRadius: borderRadius.md,
                  overflow: 'hidden',
                }}
              >
                <button
                  onClick={() => setViewMode('grid')}
                  style={{
                    padding: spacing[2],
                    backgroundColor: viewMode === 'grid' ? colors.primary[50] : colors.neutral[0],
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icons.Grid size={18} color={viewMode === 'grid' ? colors.primary[600] : colors.text.tertiary} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  style={{
                    padding: spacing[2],
                    backgroundColor: viewMode === 'list' ? colors.primary[50] : colors.neutral[0],
                    border: 'none',
                    borderLeft: `1px solid ${colors.border.light}`,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icons.List size={18} color={viewMode === 'list' ? colors.primary[600] : colors.text.tertiary} />
                </button>
              </div>
            </div>

            {/* SKUs Grid/List */}
            {filteredSkus.length === 0 ? (
              <div style={{ textAlign: 'center', padding: spacing[12] }}>
                <Icons.Package size={64} color={colors.text.tertiary} style={{ margin: '0 auto', marginBottom: spacing[4] }} />
                <p style={{ fontSize: typography.fontSize.lg, color: colors.text.secondary, margin: 0 }}>
                  No SKUs found
                </p>
              </div>
            ) : (
              <div
                style={{
                  display: viewMode === 'grid' ? 'grid' : 'flex',
                  flexDirection: viewMode === 'list' ? 'column' : undefined,
                  gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fill, minmax(280px, 1fr))' : undefined,
                  gap: spacing[4],
                }}
              >
                {filteredSkus.map((sku) =>
                  viewMode === 'grid' ? (
                    <SKUCard
                      key={sku.id}
                      sku={sku}
                      onAddToRFQ={() => handleAddToRFQ(sku)}
                      onDirectOrder={() => handleDirectOrder(sku)}
                    />
                  ) : (
                    <SKURow
                      key={sku.id}
                      sku={sku}
                      onAddToRFQ={() => handleAddToRFQ(sku)}
                      onDirectOrder={() => handleDirectOrder(sku)}
                    />
                  )
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'about' && (
          <div style={{ maxWidth: '800px' }}>
            {/* About Text */}
            {supplier.about_text && (
              <div
                style={{
                  backgroundColor: colors.neutral[0],
                  borderRadius: borderRadius.lg,
                  border: `1px solid ${colors.border.light}`,
                  padding: spacing[4],
                  marginBottom: spacing[4],
                }}
              >
                <h3
                  style={{
                    fontSize: typography.fontSize.lg,
                    fontWeight: typography.fontWeight.semibold,
                    color: colors.text.primary,
                    margin: 0,
                    marginBottom: spacing[3],
                  }}
                >
                  About
                </h3>
                <p
                  style={{
                    fontSize: typography.fontSize.base,
                    color: colors.text.secondary,
                    margin: 0,
                    lineHeight: 1.6,
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {supplier.about_text}
                </p>
              </div>
            )}

            {/* Operating Hours */}
            {supplier.operating_hours && (
              <div
                style={{
                  backgroundColor: colors.neutral[0],
                  borderRadius: borderRadius.lg,
                  border: `1px solid ${colors.border.light}`,
                  padding: spacing[4],
                  marginBottom: spacing[4],
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2], marginBottom: spacing[2] }}>
                  <Icons.Clock size={20} color={colors.primary[600]} />
                  <h3
                    style={{
                      fontSize: typography.fontSize.lg,
                      fontWeight: typography.fontWeight.semibold,
                      color: colors.text.primary,
                      margin: 0,
                    }}
                  >
                    Operating Hours
                  </h3>
                </div>
                <p
                  style={{
                    fontSize: typography.fontSize.base,
                    color: colors.text.secondary,
                    margin: 0,
                  }}
                >
                  {supplier.operating_hours}
                </p>
              </div>
            )}

            {/* Languages */}
            {supplier.languages && supplier.languages.length > 0 && (
              <div
                style={{
                  backgroundColor: colors.neutral[0],
                  borderRadius: borderRadius.lg,
                  border: `1px solid ${colors.border.light}`,
                  padding: spacing[4],
                  marginBottom: spacing[4],
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2], marginBottom: spacing[2] }}>
                  <Icons.Languages size={20} color={colors.primary[600]} />
                  <h3
                    style={{
                      fontSize: typography.fontSize.lg,
                      fontWeight: typography.fontWeight.semibold,
                      color: colors.text.primary,
                      margin: 0,
                    }}
                  >
                    Languages Spoken
                  </h3>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: spacing[2] }}>
                  {supplier.languages.map((lang) => (
                    <div
                      key={lang}
                      style={{
                        padding: `${spacing[1]} ${spacing[3]}`,
                        backgroundColor: colors.neutral[100],
                        borderRadius: borderRadius.full,
                        fontSize: typography.fontSize.sm,
                      }}
                    >
                      {lang}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Photos */}
            {supplier.photos && supplier.photos.length > 0 && (
              <div
                style={{
                  backgroundColor: colors.neutral[0],
                  borderRadius: borderRadius.lg,
                  border: `1px solid ${colors.border.light}`,
                  padding: spacing[4],
                }}
              >
                <h3
                  style={{
                    fontSize: typography.fontSize.lg,
                    fontWeight: typography.fontWeight.semibold,
                    color: colors.text.primary,
                    margin: 0,
                    marginBottom: spacing[3],
                  }}
                >
                  Photos
                </h3>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                    gap: spacing[3],
                  }}
                >
                  {supplier.photos.map((photo, index) => (
                    <div
                      key={index}
                      style={{
                        paddingBottom: '75%',
                        position: 'relative',
                        borderRadius: borderRadius.md,
                        overflow: 'hidden',
                        border: `1px solid ${colors.border.light}`,
                      }}
                    >
                      <img
                        src={photo}
                        alt={`${supplier.business_name} photo ${index + 1}`}
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Trust Metrics - Detailed View */}
            <div style={{ marginTop: spacing[4] }}>
              <TrustLabelDisplay metrics={supplier.trust_metrics} variant="detailed" />
            </div>
          </div>
        )}

        {activeTab === 'coverage' && (
          <div style={{ maxWidth: '800px' }}>
            {/* Delivery Zones Map */}
            <div
              style={{
                backgroundColor: colors.neutral[0],
                borderRadius: borderRadius.lg,
                border: `1px solid ${colors.border.light}`,
                padding: spacing[4],
                marginBottom: spacing[4],
              }}
            >
              <h3
                style={{
                  fontSize: typography.fontSize.lg,
                  fontWeight: typography.fontWeight.semibold,
                  color: colors.text.primary,
                  margin: 0,
                  marginBottom: spacing[3],
                }}
              >
                Delivery Zones
              </h3>
              <div
                style={{
                  height: '300px',
                  backgroundColor: colors.neutral[100],
                  borderRadius: borderRadius.md,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <div style={{ textAlign: 'center' }}>
                  <Icons.Map size={48} color={colors.text.tertiary} />
                  <p style={{ fontSize: typography.fontSize.sm, color: colors.text.tertiary, margin: spacing[2], marginBottom: 0 }}>
                    Map with delivery zone overlay coming soon
                  </p>
                </div>
              </div>
            </div>

            {/* Payment Terms */}
            <div
              style={{
                backgroundColor: colors.neutral[0],
                borderRadius: borderRadius.lg,
                border: `1px solid ${colors.border.light}`,
                padding: spacing[4],
                marginBottom: spacing[4],
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2], marginBottom: spacing[3] }}>
                <Icons.CreditCard size={20} color={colors.primary[600]} />
                <h3
                  style={{
                    fontSize: typography.fontSize.lg,
                    fontWeight: typography.fontWeight.semibold,
                    color: colors.text.primary,
                    margin: 0,
                  }}
                >
                  Payment Terms Accepted
                </h3>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: spacing[2] }}>
                {supplier.payment_terms.map((term) => (
                  <div
                    key={term}
                    style={{
                      padding: `${spacing[2]} ${spacing[3]}`,
                      backgroundColor: colors.success[50],
                      border: `1px solid ${colors.success[200]}`,
                      borderRadius: borderRadius.md,
                      fontSize: typography.fontSize.sm,
                      fontWeight: typography.fontWeight.medium,
                      color: colors.success[700],
                    }}
                  >
                    {term === 'cod' ? 'Cash on Delivery' : term === 'bank' ? 'Bank Transfer' : term === 'prepay' ? 'Prepayment' : term}
                  </div>
                ))}
              </div>
            </div>

            {/* Minimum Order Value */}
            {supplier.minimum_order_value && (
              <div
                style={{
                  backgroundColor: colors.neutral[0],
                  borderRadius: borderRadius.lg,
                  border: `1px solid ${colors.border.light}`,
                  padding: spacing[4],
                  marginBottom: spacing[4],
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2], marginBottom: spacing[2] }}>
                  <Icons.DollarSign size={20} color={colors.primary[600]} />
                  <h3
                    style={{
                      fontSize: typography.fontSize.lg,
                      fontWeight: typography.fontWeight.semibold,
                      color: colors.text.primary,
                      margin: 0,
                    }}
                  >
                    Minimum Order Value
                  </h3>
                </div>
                <p
                  style={{
                    fontSize: typography.fontSize.xl,
                    fontWeight: typography.fontWeight.bold,
                    color: colors.primary[600],
                    margin: 0,
                  }}
                >
                  ₾{Number(supplier.minimum_order_value).toLocaleString()}
                </p>
              </div>
            )}

            {/* Lead Times */}
            {supplier.lead_time_notes && (
              <div
                style={{
                  backgroundColor: colors.neutral[0],
                  borderRadius: borderRadius.lg,
                  border: `1px solid ${colors.border.light}`,
                  padding: spacing[4],
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2], marginBottom: spacing[2] }}>
                  <Icons.Clock size={20} color={colors.primary[600]} />
                  <h3
                    style={{
                      fontSize: typography.fontSize.lg,
                      fontWeight: typography.fontWeight.semibold,
                      color: colors.text.primary,
                      margin: 0,
                    }}
                  >
                    Lead Times
                  </h3>
                </div>
                <p
                  style={{
                    fontSize: typography.fontSize.base,
                    color: colors.text.secondary,
                    margin: 0,
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {supplier.lead_time_notes}
                </p>
              </div>
            )}
          </div>
        )}
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
