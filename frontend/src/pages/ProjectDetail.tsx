/**
 * ProjectDetail Page
 * Project detail view with tabs: Overview, Materials, Tools, RFQs, Orders, Deliveries, Rentals
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { projectsService } from '../services/api/projectsService';
import { api } from '../services/api';
import type { ProjectDetail as ProjectDetailType } from '../types/project';
import { Icons } from '../components/icons/Icons';
import { InstructionsTab } from '../components/project/InstructionsTab';
import { formatDate, formatCurrency } from '../utils/formatters';
import { colors, spacing, typography, borderRadius, shadows } from '../theme/tokens';

// Fix illustration_type for slab projects - maps step numbers to correct types
function fixSlabIllustrationTypes(instructions: any[], templateSlug?: string): any[] {
  if (templateSlug !== 'concrete_slab' && templateSlug !== 'slab') return instructions;

  const slabTypeMap: Record<number, string> = {
    1: 'site_preparation',
    2: 'gravel_base',
    3: 'formwork',
    4: 'rebar',
    5: 'concrete_pour',
    6: 'smoothing',
    7: 'curing',
    8: 'completion'
  };

  return instructions.map(inst => {
    const correctType = slabTypeMap[inst.step];
    if (correctType) {
      return { ...inst, illustration_type: correctType };
    }
    return inst;
  });
}

// Types for materials and tools
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

interface SupplierOrder {
  supplier_id: string;
  supplier_name: string;
  location: string | null;
  direct_order_available: boolean;
  materials: ProjectMaterial[];
  total: number;
}

interface ToolSupplier {
  supplier_id: string;
  supplier_name: string;
  logo_url: string | null;
  location: string | null;
  is_verified: boolean;
  direct_booking_available: boolean;
  delivery_option: string;
  trust_score: number | null;
  rental_tool_id: string;
  tool_name: string;
  day_rate: number;
  week_rate: number | null;
  deposit_amount: number | null;
  tools_available: number;
  total_tools_needed: number;
}

interface ProjectTool {
  id: string;
  project_id: string;
  rental_tool_id: string | null;
  name: string;
  category: string;
  description: string | null;
  rental_duration_days: number;
  daily_rate_estimate: number | null;
  estimated_total: number | null;
  status: 'need_to_buy' | 'already_have' | 'in_cart' | 'rfq_sent' | 'ordered' | 'delivered';
  supplier_id: string | null;
  supplier_name: string | null;
  template_slug: string | null;
  rental_rfq_id: string | null;
  booking_id: string | null;
  direct_booking_available: boolean;
  available_suppliers: ToolSupplier[];
  sort_order: number;
}

interface SupplierToolOrder {
  supplier_id: string;
  supplier_name: string;
  location: string | null;
  direct_booking_available: boolean;
  tools: ProjectTool[];
  total: number;
}

type TabType = 'overview' | 'materials' | 'tools' | 'instructions' | 'rfqs' | 'orders' | 'deliveries' | 'rentals';

export default function ProjectDetail() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [projectData, setProjectData] = useState<ProjectDetailType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadProject(id);
    }
  }, [id]);

  const loadProject = async (projectId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await projectsService.getProjectById(projectId);
      setProjectData(data);
    } catch (err: any) {
      console.error('Failed to load project:', err);
      setError(err.response?.data?.error || 'Failed to load project');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/projects');
  };

  const handleEdit = () => {
    navigate(`/projects/${id}/edit`);
  };

  const handleDelete = async () => {
    if (!id) return;

    if (!confirm(t('projects.detail.confirmDelete'))) {
      return;
    }

    try {
      await projectsService.deleteProject(id);
      navigate('/projects');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to delete project');
    }
  };

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
      }}>
        <div style={{
          width: '48px',
          height: '48px',
          border: `3px solid ${colors.border.light}`,
          borderTop: `3px solid ${colors.primary[600]}`,
          borderRadius: borderRadius.full,
          animation: 'spin 1s linear infinite',
        }}>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    );
  }

  if (error || !projectData) {
    return (
      <div style={{ padding: spacing[4] }}>
        <div style={{
          backgroundColor: '#FEF2F2',
          border: `1px solid ${colors.error[500]}`,
          borderRadius: borderRadius.lg,
          padding: spacing[4],
          textAlign: 'center',
        }}>
          <div style={{ marginBottom: spacing[2], display: 'flex', justifyContent: 'center' }}>
            <Icons.AlertCircle size={32} color={colors.error[500]} />
          </div>
          <p style={{
            color: '#7F1D1D',
            fontWeight: typography.fontWeight.medium,
            marginBottom: spacing[3],
          }}>{error || 'Project not found'}</p>
          <button
            onClick={handleBack}
            style={{
              fontSize: typography.fontSize.sm,
              color: colors.error[500],
              textDecoration: 'underline',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'none'}
            onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'underline'}
          >
            {t('common.back')}
          </button>
        </div>
      </div>
    );
  }

  const { project, rfqs, orders, deliveries, rentals } = projectData;

  // Get instructions count
  const instructionsCount = Array.isArray(project.instructions) ? project.instructions.length : 0;

  const tabs: { key: TabType; label: string; count?: number }[] = [
    { key: 'overview', label: t('projects.tabs.overview') },
    { key: 'materials', label: t('projects.tabs.materials', 'Materials') },
    { key: 'tools', label: t('projects.tabs.tools', 'Tool Rentals') },
    { key: 'instructions', label: t('projects.tabs.instructions', 'Instructions'), count: instructionsCount > 0 ? instructionsCount : undefined },
    { key: 'rfqs', label: t('projects.tabs.rfqs'), count: rfqs.length },
    { key: 'orders', label: t('projects.tabs.orders'), count: orders.length },
    { key: 'deliveries', label: t('projects.tabs.deliveries'), count: deliveries.length },
    { key: 'rentals', label: t('projects.tabs.rentals'), count: rentals.length },
  ];

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: colors.background.secondary,
      paddingBottom: spacing[20],
    }}>
      {/* Header */}
      <div style={{
        backgroundColor: colors.neutral[0],
        borderBottom: `1px solid ${colors.border.light}`,
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}>
        {/* Title Section */}
        <div style={{ padding: spacing[4], paddingBottom: 0 }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: spacing[4],
          }}>
            <button
              onClick={handleBack}
              aria-label={t('common.back')}
              style={{
                marginRight: spacing[3],
                padding: spacing[2],
                backgroundColor: 'transparent',
                border: 'none',
                borderRadius: borderRadius.lg,
                cursor: 'pointer',
                transition: 'background-color 200ms ease',
                display: 'flex',
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.neutral[100]}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <Icons.ChevronRight size={20} color={colors.text.secondary} style={{ transform: 'rotate(180deg)' }} />
            </button>
            <h1 style={{
              fontSize: typography.fontSize.xl,
              fontWeight: typography.fontWeight.bold,
              color: colors.text.primary,
              margin: 0,
              flex: 1,
            }}>{project.name}</h1>
            <button
              onClick={handleEdit}
              aria-label={t('common.edit')}
              style={{
                padding: spacing[2],
                backgroundColor: 'transparent',
                border: 'none',
                borderRadius: borderRadius.lg,
                cursor: 'pointer',
                transition: 'background-color 200ms ease',
                display: 'flex',
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.neutral[100]}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <Icons.Settings size={20} color={colors.text.secondary} />
            </button>
          </div>
        </div>

        {/* Tabs Section */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: spacing[2],
          padding: spacing[4],
          paddingTop: 0,
        }}>
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                style={{
                  padding: `${spacing[2]} ${spacing[4]}`,
                  borderRadius: borderRadius.lg,
                  fontWeight: typography.fontWeight.medium,
                  transition: 'all 200ms ease',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: activeTab === tab.key ? colors.primary[100] : colors.neutral[100],
                  color: activeTab === tab.key ? colors.primary[700] : colors.text.secondary,
                }}
                onMouseEnter={(e) => {
                  if (activeTab !== tab.key) e.currentTarget.style.backgroundColor = colors.neutral[200];
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== tab.key) e.currentTarget.style.backgroundColor = colors.neutral[100];
                }}
              >
                {tab.label}
                {tab.count !== undefined && tab.count > 0 && (
                  <span style={{
                    marginLeft: spacing[2],
                    padding: `2px ${spacing[2]}`,
                    fontSize: typography.fontSize.xs,
                    backgroundColor: colors.neutral[0],
                    borderRadius: borderRadius.full,
                  }}>{tab.count}</span>
                )}
              </button>
            ))}
        </div>
      </div>

      {/* Tab Content */}
      <div style={{ padding: spacing[4] }}>
        {activeTab === 'overview' && <OverviewTab project={project} onDelete={handleDelete} />}
        {activeTab === 'materials' && <MaterialsTab projectId={project.id} navigate={navigate} />}
        {activeTab === 'tools' && <ToolsTab projectId={project.id} navigate={navigate} />}
        {activeTab === 'instructions' && (
          <InstructionsTab
            instructions={fixSlabIllustrationTypes(
              Array.isArray(project.instructions) ? project.instructions : [],
              project.template_slug || undefined
            )}
            safetyNotes={Array.isArray(project.safety_notes) ? project.safety_notes : []}
            templateSlug={project.template_slug || undefined}
            templateInputs={project.template_inputs || undefined}
          />
        )}
        {activeTab === 'rfqs' && <RFQsTab rfqs={rfqs} navigate={navigate} projectId={project.id} />}
        {activeTab === 'orders' && <OrdersTab orders={orders} navigate={navigate} projectId={project.id} />}
        {activeTab === 'deliveries' && <DeliveriesTab deliveries={deliveries} />}
        {activeTab === 'rentals' && <RentalsTab rentals={rentals} />}
      </div>
    </div>
  );
}

// Overview Tab Component
function OverviewTab({ project, onDelete }: { project: ProjectDetailType['project']; onDelete: () => void }) {
  const { t } = useTranslation();
  const hasLocation = project.latitude !== null && project.longitude !== null;

  return (
    <div>
      {/* Location */}
      {hasLocation && (
        <div style={{
          backgroundColor: colors.neutral[0],
          borderRadius: borderRadius.lg,
          border: `1px solid ${colors.border.light}`,
          padding: spacing[6],
          boxShadow: shadows.sm,
          marginBottom: spacing[6],
        }}>
          <h3 style={{
            fontSize: typography.fontSize.sm,
            fontWeight: typography.fontWeight.medium,
            color: colors.text.secondary,
            marginBottom: spacing[3],
            display: 'flex',
            alignItems: 'center',
          }}>
            <div style={{ marginRight: spacing[2], display: 'flex' }}>
              <Icons.MapPin size={16} color={colors.text.secondary} />
            </div>
            {t('projects.detail.location')}
          </h3>
          {project.address && <p style={{
            color: colors.text.primary,
            marginBottom: spacing[2],
          }}>{project.address}</p>}
          <p style={{
            fontSize: typography.fontSize.sm,
            color: colors.text.secondary,
          }}>
            {t('projects.map.coordinates')}: {Number(project.latitude).toFixed(6)}, {Number(project.longitude).toFixed(6)}
          </p>
        </div>
      )}

      {/* Notes */}
      {project.notes && (
        <div style={{
          backgroundColor: colors.neutral[0],
          borderRadius: borderRadius.lg,
          border: `1px solid ${colors.border.light}`,
          padding: spacing[6],
          boxShadow: shadows.sm,
          marginBottom: spacing[6],
        }}>
          <h3 style={{
            fontSize: typography.fontSize.sm,
            fontWeight: typography.fontWeight.medium,
            color: colors.text.secondary,
            marginBottom: spacing[2],
          }}>{t('projects.detail.notes')}</h3>
          <p style={{
            color: colors.text.primary,
            whiteSpace: 'pre-wrap',
          }}>{project.notes}</p>
        </div>
      )}

      {/* Metadata */}
      <div style={{
        backgroundColor: colors.neutral[0],
        borderRadius: borderRadius.lg,
        border: `1px solid ${colors.border.light}`,
        padding: spacing[6],
        boxShadow: shadows.sm,
        marginBottom: spacing[6],
      }}>
        <h3 style={{
          fontSize: typography.fontSize.sm,
          fontWeight: typography.fontWeight.medium,
          color: colors.text.secondary,
          marginBottom: spacing[3],
        }}>{t('projects.detail.info')}</h3>
        <div style={{ fontSize: typography.fontSize.sm }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: spacing[2],
          }}>
            <span style={{ color: colors.text.secondary }}>{t('projects.detail.created')}</span>
            <span style={{ color: colors.text.primary }}>{formatDate(project.created_at)}</span>
          </div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: spacing[2],
          }}>
            <span style={{ color: colors.text.secondary }}>{t('projects.detail.updated')}</span>
            <span style={{ color: colors.text.primary }}>{formatDate(project.updated_at)}</span>
          </div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
          }}>
            <span style={{ color: colors.text.secondary }}>{t('projects.detail.status')}</span>
            <span style={{
              padding: `2px ${spacing[2]}`,
              borderRadius: borderRadius.full,
              fontSize: typography.fontSize.xs,
              fontWeight: typography.fontWeight.medium,
              backgroundColor: project.is_active ? '#D1FAE5' : colors.neutral[100],
              color: project.is_active ? '#065F46' : colors.text.secondary,
            }}>
              {project.is_active ? t('common.active') : t('common.inactive')}
            </span>
          </div>
        </div>
      </div>

      {/* Delete Button */}
      <button
        onClick={onDelete}
        style={{
          width: '100%',
          padding: `${spacing[3]} ${spacing[4]}`,
          backgroundColor: '#FEF2F2',
          color: colors.error[500],
          border: `1px solid #FECACA`,
          borderRadius: borderRadius.lg,
          fontWeight: typography.fontWeight.medium,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'background-color 200ms ease',
        }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FEE2E2'}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FEF2F2'}
      >
        <div style={{ marginRight: spacing[2], display: 'flex' }}>
          <Icons.AlertCircle size={20} color={colors.error[500]} />
        </div>
        {t('projects.detail.deleteProject')}
      </button>
    </div>
  );
}

// RFQs Tab Component
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function RFQsTab({ rfqs, navigate, projectId }: { rfqs: ProjectDetailType['rfqs']; navigate: any; projectId: string }) {
  const { t } = useTranslation();

  if (rfqs.length === 0) {
    return (
      <div style={{
        backgroundColor: colors.neutral[0],
        borderRadius: borderRadius.lg,
        border: `1px solid ${colors.border.light}`,
        padding: spacing[8],
        textAlign: 'center',
      }}>
        <div style={{ marginBottom: spacing[3], display: 'flex', justifyContent: 'center' }}>
          <Icons.FileText size={48} color={colors.text.tertiary} />
        </div>
        <p style={{ color: colors.text.secondary }}>{t('projects.detail.noRfqs')}</p>
      </div>
    );
  }

  return (
    <div>
      {rfqs.map((rfq, index) => (
        <div
          key={rfq.id}
          onClick={() => navigate(`/rfqs/${rfq.id}`, { state: { from: `/projects/${projectId}` } })}
          style={{
            backgroundColor: colors.neutral[0],
            borderRadius: borderRadius.lg,
            border: `1px solid ${colors.border.light}`,
            padding: spacing[4],
            boxShadow: shadows.sm,
            marginBottom: index < rfqs.length - 1 ? spacing[3] : 0,
            cursor: 'pointer',
            transition: 'all 200ms ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = shadows.md;
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = shadows.sm;
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            marginBottom: spacing[2],
          }}>
            <h4 style={{
              fontWeight: typography.fontWeight.medium,
              color: colors.text.primary,
              margin: 0,
            }}>{rfq.title}</h4>
            <span style={{
              padding: `${spacing[1]} ${spacing[2]}`,
              borderRadius: borderRadius.base,
              fontSize: typography.fontSize.xs,
              fontWeight: typography.fontWeight.medium,
              whiteSpace: 'nowrap',
              marginLeft: spacing[2],
              ...(rfq.status === 'active' ? { backgroundColor: '#D1FAE5', color: '#065F46' } :
                 rfq.status === 'draft' ? { backgroundColor: colors.neutral[100], color: colors.text.secondary } :
                 rfq.status === 'expired' ? { backgroundColor: '#FEE2E2', color: '#991B1B' } :
                 { backgroundColor: '#DBEAFE', color: '#1E40AF' }),
            }}>
              {t(`projects.rfqStatus.${rfq.status}`)}
            </span>
          </div>
          <p style={{
            fontSize: typography.fontSize.sm,
            color: colors.text.secondary,
            marginBottom: spacing[3],
          }}>{rfq.description}</p>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: typography.fontSize.sm,
          }}>
            <span style={{ color: colors.text.secondary }}>
              {rfq.offer_count} {t('projects.detail.offers')}
            </span>
            <span style={{ color: colors.text.tertiary }}>{formatDate(rfq.created_at)}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

// Orders Tab Component
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function OrdersTab({ orders, navigate, projectId }: { orders: ProjectDetailType['orders']; navigate: any; projectId: string }) {
  const { t } = useTranslation();

  if (orders.length === 0) {
    return (
      <div style={{
        backgroundColor: colors.neutral[0],
        borderRadius: borderRadius.lg,
        border: `1px solid ${colors.border.light}`,
        padding: spacing[8],
        textAlign: 'center',
      }}>
        <div style={{ marginBottom: spacing[3], display: 'flex', justifyContent: 'center' }}>
          <Icons.Package size={48} color={colors.text.tertiary} />
        </div>
        <p style={{ color: colors.text.secondary }}>{t('projects.detail.noOrders')}</p>
      </div>
    );
  }

  return (
    <div>
      {orders.map((order, index) => (
        <div
          key={order.id}
          onClick={() => navigate(`/orders/${order.order_number}`, { state: { from: `/projects/${projectId}` } })}
          style={{
            backgroundColor: colors.neutral[0],
            borderRadius: borderRadius.lg,
            border: `1px solid ${colors.border.light}`,
            padding: spacing[4],
            boxShadow: shadows.sm,
            marginBottom: index < orders.length - 1 ? spacing[3] : 0,
            cursor: 'pointer',
            transition: 'all 200ms ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = shadows.md;
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = shadows.sm;
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            marginBottom: spacing[2],
          }}>
            <div>
              <h4 style={{
                fontWeight: typography.fontWeight.medium,
                color: colors.text.primary,
                margin: 0,
              }}>{order.order_number}</h4>
              <p style={{
                fontSize: typography.fontSize.sm,
                color: colors.text.secondary,
                margin: 0,
              }}>{order.supplier_name}</p>
            </div>
            <span style={{
              padding: `${spacing[1]} ${spacing[2]}`,
              borderRadius: borderRadius.base,
              fontSize: typography.fontSize.xs,
              fontWeight: typography.fontWeight.medium,
              whiteSpace: 'nowrap',
              marginLeft: spacing[2],
              ...(order.status === 'completed' ? { backgroundColor: '#D1FAE5', color: '#065F46' } :
                 (order.status === 'cancelled' || order.status === 'disputed') ? { backgroundColor: '#FEE2E2', color: '#991B1B' } :
                 { backgroundColor: '#DBEAFE', color: '#1E40AF' }),
            }}>
              {t(`projects.orderStatus.${order.status}`)}
            </span>
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: spacing[3],
            paddingTop: spacing[3],
            borderTop: `1px solid ${colors.neutral[100]}`,
          }}>
            <span style={{
              fontSize: typography.fontSize.sm,
              fontWeight: typography.fontWeight.medium,
              color: colors.text.primary,
            }}>{formatCurrency(order.grand_total)}</span>
            <span style={{
              fontSize: typography.fontSize.xs,
              color: colors.text.tertiary,
            }}>{formatDate(order.created_at)}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

// Deliveries Tab Component
function DeliveriesTab({ deliveries }: { deliveries: ProjectDetailType['deliveries'] }) {
  const { t } = useTranslation();

  if (deliveries.length === 0) {
    return (
      <div style={{
        backgroundColor: colors.neutral[0],
        borderRadius: borderRadius.lg,
        border: `1px solid ${colors.border.light}`,
        padding: spacing[8],
        textAlign: 'center',
      }}>
        <div style={{ marginBottom: spacing[3], display: 'flex', justifyContent: 'center' }}>
          <Icons.Truck size={48} color={colors.text.tertiary} />
        </div>
        <p style={{ color: colors.text.secondary }}>{t('projects.detail.noDeliveries')}</p>
      </div>
    );
  }

  return (
    <div>
      {deliveries.map((delivery, index) => (
        <div key={delivery.id} style={{
          backgroundColor: colors.neutral[0],
          borderRadius: borderRadius.lg,
          border: `1px solid ${colors.border.light}`,
          padding: spacing[4],
          boxShadow: shadows.sm,
          marginBottom: index < deliveries.length - 1 ? spacing[3] : 0,
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            marginBottom: spacing[2],
          }}>
            <div>
              <h4 style={{
                fontWeight: typography.fontWeight.medium,
                color: colors.text.primary,
                margin: 0,
              }}>{delivery.order_number}</h4>
              <p style={{
                fontSize: typography.fontSize.sm,
                color: colors.text.secondary,
                margin: 0,
              }}>{delivery.supplier_name}</p>
            </div>
            <div style={{ display: 'flex' }}>
              <Icons.CheckCircle size={20} color={colors.success[500]} />
            </div>
          </div>
          <div style={{
            fontSize: typography.fontSize.sm,
            color: colors.text.secondary,
            marginBottom: spacing[2],
          }}>
            <span style={{ fontWeight: typography.fontWeight.medium }}>{t('projects.detail.deliveredBy')}:</span> {delivery.delivered_by_name}
          </div>
          {delivery.notes && <p style={{
            fontSize: typography.fontSize.sm,
            color: colors.text.secondary,
            marginBottom: spacing[2],
          }}>{delivery.notes}</p>}
          <div style={{
            fontSize: typography.fontSize.xs,
            color: colors.text.tertiary,
            display: 'flex',
            alignItems: 'center',
          }}>
            <div style={{ marginRight: spacing[1], display: 'flex' }}>
              <Icons.Clock size={14} color={colors.text.tertiary} />
            </div>
            {formatDate(delivery.delivered_at)}
          </div>
        </div>
      ))}
    </div>
  );
}

// Rentals Tab Component
function RentalsTab({ rentals }: { rentals: ProjectDetailType['rentals'] }) {
  const { t } = useTranslation();

  if (rentals.length === 0) {
    return (
      <div style={{
        backgroundColor: colors.neutral[0],
        borderRadius: borderRadius.lg,
        border: `1px solid ${colors.border.light}`,
        padding: spacing[8],
        textAlign: 'center',
      }}>
        <div style={{ marginBottom: spacing[3], display: 'flex', justifyContent: 'center' }}>
          <Icons.Wrench size={48} color={colors.text.tertiary} />
        </div>
        <p style={{ color: colors.text.secondary }}>{t('projects.detail.noRentals')}</p>
      </div>
    );
  }

  return (
    <div>
      {rentals.map((rental, index) => (
        <div key={rental.id} style={{
          backgroundColor: colors.neutral[0],
          borderRadius: borderRadius.lg,
          border: `1px solid ${colors.border.light}`,
          padding: spacing[4],
          boxShadow: shadows.sm,
          marginBottom: index < rentals.length - 1 ? spacing[3] : 0,
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            marginBottom: spacing[2],
          }}>
            <div>
              <h4 style={{
                fontWeight: typography.fontWeight.medium,
                color: colors.text.primary,
                margin: 0,
              }}>{rental.tool_name}</h4>
              <p style={{
                fontSize: typography.fontSize.sm,
                color: colors.text.secondary,
                margin: 0,
              }}>{rental.supplier_name}</p>
            </div>
            <span style={{
              padding: `${spacing[1]} ${spacing[2]}`,
              borderRadius: borderRadius.base,
              fontSize: typography.fontSize.xs,
              fontWeight: typography.fontWeight.medium,
              whiteSpace: 'nowrap',
              marginLeft: spacing[2],
              ...(rental.status === 'active' ? { backgroundColor: '#D1FAE5', color: '#065F46' } :
                 rental.status === 'completed' ? { backgroundColor: '#DBEAFE', color: '#1E40AF' } :
                 (rental.status === 'overdue' || rental.status === 'disputed') ? { backgroundColor: '#FEE2E2', color: '#991B1B' } :
                 { backgroundColor: colors.neutral[100], color: colors.text.secondary }),
            }}>
              {t(`projects.rentalStatus.${rental.status}`)}
            </span>
          </div>
          <div style={{
            fontSize: typography.fontSize.sm,
            color: colors.text.secondary,
            marginBottom: spacing[2],
          }}>
            {formatDate(rental.start_date)} → {formatDate(rental.end_date)}
          </div>
          <div style={{
            fontSize: typography.fontSize.sm,
            fontWeight: typography.fontWeight.medium,
            color: colors.text.primary,
          }}>{formatCurrency(rental.total_cost)}</div>
        </div>
      ))}
    </div>
  );
}

// Materials Tab Component - full functionality with supplier selection and order grouping
function MaterialsTab({ projectId, navigate }: { projectId: string; navigate: (path: string) => void }) {
  const { t } = useTranslation();
  const [materials, setMaterials] = useState<ProjectMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingIds, setSavingIds] = useState<Set<string>>(new Set());
  const [creatingOrder, setCreatingOrder] = useState<string | null>(null);

  const fetchMaterials = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get<{ materials?: ProjectMaterial[]; data?: { materials?: ProjectMaterial[] } }>(`/buyers/projects/${projectId}/materials`);
      if (response.success) {
        const mats = response.data?.materials || response.data?.data?.materials || [];
        setMaterials(Array.isArray(mats) ? mats : []);
      }
    } catch (err) {
      console.error('Failed to fetch materials:', err);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchMaterials();
  }, [fetchMaterials]);

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

    setSavingIds(prev => new Set(prev).add(materialId));
    try {
      await api.put(`/buyers/projects/${projectId}/materials/${materialId}`, {
        supplier_id: supplier.supplier_id,
        unit_price: supplier.unit_price,
        sku_id: supplier.sku_id,
      });
    } catch (err) {
      console.error('Failed to update supplier:', err);
      setMaterials(prev => prev.map(m => m.id === materialId ? { ...material } : m));
    } finally {
      setSavingIds(prev => { const next = new Set(prev); next.delete(materialId); return next; });
    }
  };

  // Mark as already have
  const markAsHave = async (materialId: string) => {
    const material = materials.find(m => m.id === materialId);
    if (!material) return;

    setMaterials(prev => prev.map(m => m.id === materialId ? { ...m, status: 'already_have' as const, supplier_id: null, supplier_name: null } : m));

    try {
      await api.put(`/buyers/projects/${projectId}/materials/${materialId}`, { status: 'already_have', supplier_id: null });
    } catch (err) {
      console.error('Failed to update status:', err);
      setMaterials(prev => prev.map(m => m.id === materialId ? { ...material } : m));
    }
  };

  // Group materials by supplier into orders
  const supplierOrders = useMemo((): SupplierOrder[] => {
    const orderMap: Record<string, SupplierOrder> = {};
    materials.forEach(m => {
      if ((m.status === 'need_to_buy' || m.status === 'rfq_sent') && m.supplier_id) {
        if (!orderMap[m.supplier_id]) {
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

  // Calculate totals
  const totals = useMemo(() => {
    return materials.reduce(
      (acc, m) => {
        if (m.status !== 'already_have') { acc.totalItems++; acc.totalEstimate += m.estimated_total || 0; }
        if (m.status === 'need_to_buy') { acc.needToBuy++; if (m.supplier_id) acc.withSupplier++; }
        if (m.status === 'already_have') acc.alreadyHave++;
        if (m.status === 'rfq_sent') acc.rfqSent++;
        if (m.status === 'ordered' || m.status === 'delivered') acc.ordered++;
        return acc;
      },
      { totalItems: 0, totalEstimate: 0, needToBuy: 0, withSupplier: 0, alreadyHave: 0, rfqSent: 0, ordered: 0 }
    );
  }, [materials]);

  // Create direct order or RFQ
  const handleCreateOrder = async (order: SupplierOrder, type: 'direct' | 'rfq') => {
    setCreatingOrder(order.supplier_id);
    try {
      if (type === 'direct') {
        const items = order.materials.map(m => ({
          project_material_id: m.id, project_id: projectId, sku_id: m.sku_id, supplier_id: m.supplier_id,
          name: m.name, description: m.description, quantity: m.quantity, unit: m.unit, unit_price: m.unit_price || 0, action_type: 'direct_order',
        }));
        await api.post('/buyers/cart/bulk', { items });
        navigate('/cart');
      } else {
        const rfqData = {
          project_id: projectId, supplier_id: order.supplier_id,
          lines: order.materials.map(m => ({ project_material_id: m.id, description: m.name + (m.description ? ` - ${m.description}` : ''), quantity: m.quantity, unit: m.unit, sku_id: m.sku_id })),
        };
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

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: spacing[8], gap: spacing[4] }}>
        <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: colors.primary[100], display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icons.Search size={28} color={colors.primary[600]} />
        </div>
        <p style={{ color: colors.text.secondary }}>{t('project.findingSuppliers', 'Finding Best Suppliers...')}</p>
        <div style={{ width: '150px', height: '4px', backgroundColor: colors.primary[100], borderRadius: borderRadius.full, overflow: 'hidden' }}>
          <div style={{ width: '40%', height: '100%', backgroundColor: colors.primary[600], borderRadius: borderRadius.full, animation: 'progress 1.5s ease-in-out infinite' }} />
        </div>
        <style>{`@keyframes progress { 0% { transform: translateX(-100%); } 50% { transform: translateX(150%); } 100% { transform: translateX(250%); } }`}</style>
      </div>
    );
  }

  if (materials.length === 0) {
    return (
      <div style={{ backgroundColor: colors.neutral[0], borderRadius: borderRadius.lg, border: `1px solid ${colors.border.light}`, padding: spacing[8], textAlign: 'center' }}>
        <div style={{ marginBottom: spacing[3], display: 'flex', justifyContent: 'center' }}><Icons.Package size={48} color={colors.text.tertiary} /></div>
        <p style={{ color: colors.text.secondary, marginBottom: spacing[4] }}>{t('projects.detail.noMaterials', 'No materials added yet')}</p>
        <button onClick={() => navigate('/templates')} style={{ padding: `${spacing[2]} ${spacing[4]}`, backgroundColor: colors.primary[600], color: colors.text.inverse, border: 'none', borderRadius: borderRadius.md, cursor: 'pointer', fontWeight: typography.fontWeight.medium }}>
          {t('project.useCalculator', 'Use a Calculator')}
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: spacing[2], marginBottom: spacing[4] }}>
        <SummaryCard label={t('project.needToBuy', 'Need')} value={totals.needToBuy} color={colors.warning[600] || '#EAB308'} bgColor={colors.warning[50] || '#FEF9C3'} />
        <SummaryCard label={t('project.withSupplier', 'Ready')} value={totals.withSupplier} color={colors.primary[600]} bgColor={colors.primary[50]} />
        <SummaryCard label={t('project.alreadyHave', 'Have')} value={totals.alreadyHave} color={colors.neutral[600]} bgColor={colors.neutral[100]} />
        <SummaryCard label={t('project.ordered', 'Ordered')} value={totals.ordered} color={colors.success?.[600] || '#16A34A'} bgColor={colors.success?.[50] || '#F0FDF4'} />
      </div>

      {/* Materials List */}
      <h3 style={{ fontSize: typography.fontSize.base, fontWeight: typography.fontWeight.semibold, marginBottom: spacing[3], display: 'flex', alignItems: 'center', gap: spacing[2] }}>
        <Icons.Package size={18} /> {t('project.materialsList', 'Materials List')}
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[3], marginBottom: spacing[6] }}>
        {materials.map(material => (
          <MaterialCard key={material.id} material={material} onSupplierSelect={(s) => updateSupplier(material.id, s)} onMarkAsHave={() => markAsHave(material.id)} isSaving={savingIds.has(material.id)} t={t} />
        ))}
      </div>

      {/* Orders Section */}
      {supplierOrders.length > 0 && (
        <>
          <h3 style={{ fontSize: typography.fontSize.base, fontWeight: typography.fontWeight.semibold, marginBottom: spacing[3], display: 'flex', alignItems: 'center', gap: spacing[2] }}>
            <Icons.ShoppingCart size={18} /> {t('project.yourOrders', 'Your Orders')} <span style={{ fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.normal, color: colors.text.secondary }}>({supplierOrders.length})</span>
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[4] }}>
            {supplierOrders.map(order => (
              <OrderCard key={order.supplier_id} order={order} onDirectOrder={() => handleCreateOrder(order, 'direct')} onSendRFQ={() => handleCreateOrder(order, 'rfq')} isCreating={creatingOrder === order.supplier_id} t={t} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// Summary Card Component
function SummaryCard({ label, value, color, bgColor }: { label: string; value: number; color: string; bgColor: string }) {
  return (
    <div style={{ padding: spacing[3], backgroundColor: bgColor, borderRadius: borderRadius.md, border: `1px solid ${color}20` }}>
      <div style={{ fontSize: typography.fontSize.xs, color }}>{label}</div>
      <div style={{ fontSize: typography.fontSize.xl, fontWeight: typography.fontWeight.bold, color }}>{value}</div>
    </div>
  );
}

// Material Card Component
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function MaterialCard({ material, onSupplierSelect, onMarkAsHave, isSaving, t }: { material: ProjectMaterial; onSupplierSelect: (s: Supplier) => void; onMarkAsHave: () => void; isSaving: boolean; t: any }) {
  const [showDropdown, setShowDropdown] = useState(false);

  const statusColors: Record<string, { bg: string; text: string }> = {
    need_to_buy: { bg: colors.warning[100] || '#FEF3C7', text: colors.warning[700] || '#A16207' },
    already_have: { bg: colors.neutral[100], text: colors.neutral[600] },
    rfq_sent: { bg: '#CFFAFE', text: '#0E7490' },
    ordered: { bg: '#DCFCE7', text: '#15803D' },
    delivered: { bg: '#F0FDF4', text: '#166534' },
  };
  const statusInfo = statusColors[material.status] || statusColors.need_to_buy;

  return (
    <div style={{ backgroundColor: colors.neutral[0], borderRadius: borderRadius.lg, border: `1px solid ${material.supplier_id ? colors.primary[200] : colors.border.light}`, padding: spacing[4], boxShadow: shadows.sm }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', flexWrap: 'wrap', gap: spacing[2] }}>
        <div style={{ flex: 1, minWidth: '150px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2] }}>
            <h4 style={{ fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.semibold, margin: 0 }}>{material.name}</h4>
            {isSaving && <div style={{ width: '12px', height: '12px', border: `2px solid ${colors.primary[200]}`, borderTopColor: colors.primary[600], borderRadius: '50%', animation: 'spin 1s linear infinite' }} />}
          </div>
          <div style={{ display: 'flex', gap: spacing[3], marginTop: spacing[1], fontSize: typography.fontSize.xs, color: colors.text.secondary, flexWrap: 'wrap' }}>
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
          <div style={{ position: 'relative' }}>
            <button onClick={() => setShowDropdown(!showDropdown)} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: spacing[2],
              backgroundColor: material.supplier_id ? '#F0FDF4' : '#FFFBEB', border: `1px solid ${material.supplier_id ? '#86EFAC' : '#FCD34D'}`,
              borderRadius: borderRadius.md, cursor: 'pointer', textAlign: 'left', fontSize: typography.fontSize.sm,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2] }}>
                {material.supplier_id ? (<><Icons.CheckCircle size={14} color="#16A34A" /><span style={{ fontWeight: typography.fontWeight.medium }}>{material.supplier_name}</span></>) : (<><Icons.AlertCircle size={14} color="#CA8A04" /><span>{t('project.selectSupplier', 'Select Supplier')}</span></>)}
              </div>
              <Icons.ChevronDown size={14} style={{ transform: showDropdown ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 150ms' }} />
            </button>

            {showDropdown && (
              <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50, marginTop: spacing[1], backgroundColor: colors.neutral[0], border: `1px solid ${colors.border.light}`, borderRadius: borderRadius.md, boxShadow: shadows.lg, maxHeight: '250px', overflowY: 'auto' }}>
                {material.available_suppliers.length === 0 ? (
                  <div style={{ padding: spacing[4], textAlign: 'center', color: colors.text.secondary, fontSize: typography.fontSize.sm }}>{t('project.noSuppliersAvailable', 'No suppliers available')}</div>
                ) : (
                  material.available_suppliers.map(supplier => (
                    <button key={supplier.supplier_id} onClick={() => { onSupplierSelect(supplier); setShowDropdown(false); }} style={{
                      display: 'block', width: '100%', padding: spacing[3], border: 'none', borderBottom: `1px solid ${colors.border.light}`,
                      backgroundColor: material.supplier_id === supplier.supplier_id ? colors.primary[50] : colors.neutral[0], cursor: 'pointer', textAlign: 'left',
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: spacing[1], marginBottom: spacing[1] }}>
                            <span style={{ fontWeight: typography.fontWeight.medium, fontSize: typography.fontSize.sm }}>{supplier.supplier_name}</span>
                            {supplier.is_verified && <Icons.CheckCircle size={12} color={colors.primary[600]} />}
                          </div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: spacing[2], fontSize: typography.fontSize.xs, color: colors.text.secondary }}>
                            {supplier.location && <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}><Icons.MapPin size={10} /> {supplier.location}</span>}
                            <span style={{ color: colors.primary[600], fontWeight: typography.fontWeight.medium }}>{supplier.products_available}/{supplier.total_products_needed}</span>
                            {supplier.direct_order_available ? <span style={{ color: '#16A34A' }}>Direct</span> : <span style={{ color: '#CA8A04' }}>RFQ</span>}
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: typography.fontSize.base, fontWeight: typography.fontWeight.bold, color: colors.primary[600] }}>{supplier.unit_price.toLocaleString()} ₾</div>
                          <div style={{ fontSize: typography.fontSize.xs, color: colors.text.secondary }}>/{material.unit}</div>
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
          <button onClick={onMarkAsHave} style={{ marginTop: spacing[2], padding: `${spacing[1]} ${spacing[2]}`, backgroundColor: 'transparent', color: colors.text.secondary, border: 'none', cursor: 'pointer', fontSize: typography.fontSize.xs }}>
            {t('project.markAsHave', 'I already have this')}
          </button>
        </div>
      )}
    </div>
  );
}

// Order Card Component
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function OrderCard({ order, onDirectOrder, onSendRFQ, isCreating, t }: { order: SupplierOrder; onDirectOrder: () => void; onSendRFQ: () => void; isCreating: boolean; t: any }) {
  return (
    <div style={{ backgroundColor: colors.neutral[0], borderRadius: borderRadius.lg, border: `2px solid ${colors.primary[200]}`, overflow: 'hidden', boxShadow: shadows.md }}>
      <div style={{ padding: spacing[3], backgroundColor: colors.primary[50], borderBottom: `1px solid ${colors.primary[200]}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: spacing[2] }}>
          <div>
            <h4 style={{ margin: 0, fontSize: typography.fontSize.base, fontWeight: typography.fontWeight.semibold }}>{order.supplier_name}</h4>
            {order.location && <p style={{ margin: 0, marginTop: spacing[1], fontSize: typography.fontSize.xs, color: colors.text.secondary, display: 'flex', alignItems: 'center', gap: spacing[1] }}><Icons.MapPin size={12} /> {order.location}</p>}
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: typography.fontSize.xs, color: colors.text.secondary }}>{order.materials.length} items</div>
            <div style={{ fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.bold, color: colors.primary[600] }}>{order.total.toLocaleString()} ₾</div>
          </div>
        </div>
      </div>
      <div style={{ padding: spacing[2], maxHeight: '120px', overflowY: 'auto' }}>
        {order.materials.map(m => (
          <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', padding: `${spacing[1]} 0`, borderBottom: `1px solid ${colors.border.light}`, fontSize: typography.fontSize.xs }}>
            <span>{m.name}</span>
            <span style={{ color: colors.text.secondary }}>{m.quantity} {m.unit} × {m.unit_price?.toLocaleString()} ₾</span>
          </div>
        ))}
      </div>
      <div style={{ padding: spacing[3], borderTop: `1px solid ${colors.border.light}`, display: 'flex', gap: spacing[2] }}>
        {order.direct_order_available && (
          <button onClick={onDirectOrder} disabled={isCreating} style={{ flex: 1, padding: spacing[2], backgroundColor: colors.primary[600], color: colors.text.inverse, border: 'none', borderRadius: borderRadius.md, cursor: isCreating ? 'not-allowed' : 'pointer', fontWeight: typography.fontWeight.medium, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: spacing[1], opacity: isCreating ? 0.7 : 1, fontSize: typography.fontSize.sm }}>
            <Icons.ShoppingCart size={14} /> {isCreating ? '...' : t('project.directOrder', 'Direct Order')}
          </button>
        )}
        <button onClick={onSendRFQ} disabled={isCreating} style={{ flex: 1, padding: spacing[2], backgroundColor: order.direct_order_available ? colors.neutral[100] : colors.primary[600], color: order.direct_order_available ? colors.text.primary : colors.text.inverse, border: 'none', borderRadius: borderRadius.md, cursor: isCreating ? 'not-allowed' : 'pointer', fontWeight: typography.fontWeight.medium, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: spacing[1], opacity: isCreating ? 0.7 : 1, fontSize: typography.fontSize.sm }}>
          <Icons.Send size={14} /> {isCreating ? '...' : t('project.sendRFQ', 'Send RFQ')}
        </button>
      </div>
    </div>
  );
}

// Tools Tab Component - full functionality with supplier selection and order grouping
function ToolsTab({ projectId, navigate }: { projectId: string; navigate: (path: string) => void }) {
  const { t } = useTranslation();
  const [tools, setTools] = useState<ProjectTool[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingIds, setSavingIds] = useState<Set<string>>(new Set());
  const [creatingOrder, setCreatingOrder] = useState<string | null>(null);

  const fetchTools = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get<{ tools?: ProjectTool[]; data?: { tools?: ProjectTool[] } }>(`/buyers/projects/${projectId}/tools`);
      if (response.success) {
        const toolsList = response.data?.tools || response.data?.data?.tools || [];
        setTools(Array.isArray(toolsList) ? toolsList : []);
      }
    } catch (err) {
      console.error('Failed to fetch tools:', err);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchTools();
  }, [fetchTools]);

  // Update tool supplier - optimistic update
  const updateToolSupplier = async (toolId: string, supplier: ToolSupplier) => {
    const tool = tools.find(t => t.id === toolId);
    if (!tool) return;

    // Optimistic update
    setTools(prev => prev.map(t => {
      if (t.id === toolId) {
        return {
          ...t,
          supplier_id: supplier.supplier_id,
          supplier_name: supplier.supplier_name,
          rental_tool_id: supplier.rental_tool_id,
          daily_rate_estimate: supplier.day_rate,
          estimated_total: t.rental_duration_days * supplier.day_rate,
        };
      }
      return t;
    }));

    setSavingIds(prev => new Set(prev).add(toolId));
    try {
      await api.put(`/buyers/projects/${projectId}/tools/${toolId}`, {
        supplier_id: supplier.supplier_id,
        supplier_name: supplier.supplier_name,
        rental_tool_id: supplier.rental_tool_id,
        daily_rate_estimate: supplier.day_rate,
      });
    } catch (err) {
      console.error('Failed to update tool supplier:', err);
      setTools(prev => prev.map(t => t.id === toolId ? { ...tool } : t));
    } finally {
      setSavingIds(prev => { const next = new Set(prev); next.delete(toolId); return next; });
    }
  };

  // Group tools by supplier into orders
  const supplierToolOrders = useMemo((): SupplierToolOrder[] => {
    const orderMap: Record<string, SupplierToolOrder> = {};
    tools.forEach(tool => {
      if ((tool.status === 'need_to_buy' || tool.status === 'rfq_sent') && tool.supplier_id) {
        if (!orderMap[tool.supplier_id]) {
          const supplierInfo = tool.available_suppliers.find(s => s.supplier_id === tool.supplier_id);
          orderMap[tool.supplier_id] = {
            supplier_id: tool.supplier_id,
            supplier_name: tool.supplier_name || supplierInfo?.supplier_name || 'Unknown',
            location: supplierInfo?.location || null,
            direct_booking_available: supplierInfo?.direct_booking_available ?? false,
            tools: [],
            total: 0,
          };
        }
        orderMap[tool.supplier_id].tools.push(tool);
        orderMap[tool.supplier_id].total += tool.estimated_total || 0;
      }
    });
    return Object.values(orderMap);
  }, [tools]);

  // Calculate totals
  const toolTotals = useMemo(() => {
    return tools.reduce(
      (acc, t) => {
        if (t.status !== 'already_have') { acc.totalItems++; acc.totalEstimate += t.estimated_total || 0; }
        if (t.status === 'need_to_buy') { acc.needToRent++; if (t.supplier_id) acc.withSupplier++; }
        if (t.status === 'already_have') acc.alreadyHave++;
        if (t.status === 'rfq_sent') acc.rfqSent++;
        if (t.status === 'ordered' || t.status === 'delivered') acc.booked++;
        return acc;
      },
      { totalItems: 0, totalEstimate: 0, needToRent: 0, withSupplier: 0, alreadyHave: 0, rfqSent: 0, booked: 0 }
    );
  }, [tools]);

  // Handle tool order (rental RFQ or direct booking)
  const handleCreateToolOrder = async (order: SupplierToolOrder, type: 'direct' | 'rfq') => {
    setCreatingOrder(order.supplier_id);
    try {
      const allToolsHaveRentalId = order.tools.every(t => t.rental_tool_id != null && t.rental_tool_id !== '');

      if (type === 'direct' && allToolsHaveRentalId) {
        const firstTool = order.tools[0];
        navigate(`/rentals/book/${firstTool.rental_tool_id}`, {
          state: {
            project_id: projectId,
            duration_days: firstTool.rental_duration_days,
            all_tools: order.tools.map(t => ({ project_tool_id: t.id, rental_tool_id: t.rental_tool_id, name: t.name, duration_days: t.rental_duration_days })),
          },
        });
      } else {
        const rentalToolIds = order.tools.filter(t => t.rental_tool_id).map(t => t.rental_tool_id as string);
        navigate('/rentals/rfq', { state: { preselectedTools: rentalToolIds, project_id: projectId, supplier_id: order.supplier_id } });
      }
    } catch (err) {
      console.error('Failed to create tool order:', err);
      alert(t('common.error', 'An error occurred'));
    } finally {
      setCreatingOrder(null);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: spacing[8], gap: spacing[4] }}>
        <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: colors.primary[100], display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icons.Wrench size={28} color={colors.primary[600]} />
        </div>
        <p style={{ color: colors.text.secondary }}>{t('project.findingRentalProviders', 'Finding Rental Providers...')}</p>
        <div style={{ width: '150px', height: '4px', backgroundColor: colors.primary[100], borderRadius: borderRadius.full, overflow: 'hidden' }}>
          <div style={{ width: '40%', height: '100%', backgroundColor: colors.primary[600], borderRadius: borderRadius.full, animation: 'progress 1.5s ease-in-out infinite' }} />
        </div>
      </div>
    );
  }

  if (tools.length === 0) {
    return (
      <div style={{ backgroundColor: colors.neutral[0], borderRadius: borderRadius.lg, border: `1px solid ${colors.border.light}`, padding: spacing[8], textAlign: 'center' }}>
        <div style={{ marginBottom: spacing[3], display: 'flex', justifyContent: 'center' }}><Icons.Wrench size={48} color={colors.text.tertiary} /></div>
        <p style={{ color: colors.text.secondary, marginBottom: spacing[4] }}>{t('projects.detail.noTools', 'No tool rentals added yet')}</p>
        <button onClick={() => navigate('/templates')} style={{ padding: `${spacing[2]} ${spacing[4]}`, backgroundColor: colors.primary[600], color: colors.text.inverse, border: 'none', borderRadius: borderRadius.md, cursor: 'pointer', fontWeight: typography.fontWeight.medium }}>
          {t('project.useCalculator', 'Use a Calculator')}
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: spacing[2], marginBottom: spacing[4] }}>
        <SummaryCard label={t('project.needToRent', 'Need')} value={toolTotals.needToRent} color={colors.warning[600] || '#EAB308'} bgColor={colors.warning[50] || '#FEF9C3'} />
        <SummaryCard label={t('project.withSupplier', 'Ready')} value={toolTotals.withSupplier} color={colors.primary[600]} bgColor={colors.primary[50]} />
        <SummaryCard label={t('project.alreadyHave', 'Have')} value={toolTotals.alreadyHave} color={colors.neutral[600]} bgColor={colors.neutral[100]} />
        <SummaryCard label={t('project.booked', 'Booked')} value={toolTotals.booked} color={colors.success?.[600] || '#16A34A'} bgColor={colors.success?.[50] || '#F0FDF4'} />
      </div>

      {/* Tools List */}
      <h3 style={{ fontSize: typography.fontSize.base, fontWeight: typography.fontWeight.semibold, marginBottom: spacing[3], display: 'flex', alignItems: 'center', gap: spacing[2] }}>
        <Icons.Wrench size={18} /> {t('project.toolsList', 'Tools to Rent')}
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[3], marginBottom: spacing[6] }}>
        {tools.map(tool => (
          <ToolCard key={tool.id} tool={tool} onSupplierSelect={(s) => updateToolSupplier(tool.id, s)} isSaving={savingIds.has(tool.id)} t={t} />
        ))}
      </div>

      {/* Tool Orders Section */}
      {supplierToolOrders.length > 0 && (
        <>
          <h3 style={{ fontSize: typography.fontSize.base, fontWeight: typography.fontWeight.semibold, marginBottom: spacing[3], display: 'flex', alignItems: 'center', gap: spacing[2] }}>
            <Icons.Calendar size={18} /> {t('project.yourToolRentals', 'Your Tool Rentals')} <span style={{ fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.normal, color: colors.text.secondary }}>({supplierToolOrders.length})</span>
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[4] }}>
            {supplierToolOrders.map(order => (
              <ToolOrderCard key={order.supplier_id} order={order} onDirectBook={() => handleCreateToolOrder(order, 'direct')} onSendRFQ={() => handleCreateToolOrder(order, 'rfq')} isCreating={creatingOrder === order.supplier_id} t={t} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// Tool Card Component
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ToolCard({ tool, onSupplierSelect, isSaving, t }: { tool: ProjectTool; onSupplierSelect: (s: ToolSupplier) => void; isSaving: boolean; t: any }) {
  const [showDropdown, setShowDropdown] = useState(false);

  const statusColors: Record<string, { bg: string; text: string }> = {
    need_to_buy: { bg: colors.warning[100] || '#FEF3C7', text: colors.warning[700] || '#A16207' },
    already_have: { bg: colors.neutral[100], text: colors.neutral[600] },
    rfq_sent: { bg: '#CFFAFE', text: '#0E7490' },
    ordered: { bg: '#DCFCE7', text: '#15803D' },
    delivered: { bg: '#F0FDF4', text: '#166534' },
  };
  const statusInfo = statusColors[tool.status] || statusColors.need_to_buy;

  return (
    <div style={{ backgroundColor: colors.neutral[0], borderRadius: borderRadius.lg, border: `1px solid ${tool.supplier_id ? colors.primary[200] : colors.border.light}`, padding: spacing[4], boxShadow: shadows.sm }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', flexWrap: 'wrap', gap: spacing[2] }}>
        <div style={{ flex: 1, minWidth: '150px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2] }}>
            <Icons.Wrench size={16} color={colors.primary[600]} />
            <h4 style={{ fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.semibold, margin: 0 }}>{tool.name}</h4>
            {isSaving && <div style={{ width: '12px', height: '12px', border: `2px solid ${colors.primary[200]}`, borderTopColor: colors.primary[600], borderRadius: '50%', animation: 'spin 1s linear infinite' }} />}
          </div>
          <div style={{ display: 'flex', gap: spacing[3], marginTop: spacing[1], fontSize: typography.fontSize.xs, color: colors.text.secondary, flexWrap: 'wrap' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: spacing[1] }}><Icons.Calendar size={12} /> {tool.rental_duration_days} {t('project.days', 'days')}</span>
            {tool.daily_rate_estimate && <span>{tool.daily_rate_estimate.toLocaleString()} ₾/{t('project.day', 'day')}</span>}
            {tool.estimated_total && <span style={{ fontWeight: typography.fontWeight.semibold, color: colors.primary[600] }}>= {tool.estimated_total.toLocaleString()} ₾</span>}
          </div>
          {tool.category && <div style={{ marginTop: spacing[1], fontSize: typography.fontSize.xs, color: colors.text.tertiary }}>{tool.category}</div>}
        </div>
        <span style={{ padding: `${spacing[1]} ${spacing[2]}`, backgroundColor: statusInfo.bg, color: statusInfo.text, fontSize: typography.fontSize.xs, fontWeight: typography.fontWeight.medium, borderRadius: borderRadius.full }}>
          {t(`project.status.${tool.status}`, tool.status)}
        </span>
      </div>

      {tool.status === 'need_to_buy' && (
        <div style={{ marginTop: spacing[3] }}>
          <div style={{ position: 'relative' }}>
            <button onClick={() => setShowDropdown(!showDropdown)} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: spacing[2],
              backgroundColor: tool.supplier_id ? '#F0FDF4' : '#FFFBEB', border: `1px solid ${tool.supplier_id ? '#86EFAC' : '#FCD34D'}`,
              borderRadius: borderRadius.md, cursor: 'pointer', textAlign: 'left', fontSize: typography.fontSize.sm,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2] }}>
                {tool.supplier_id ? (<><Icons.CheckCircle size={14} color="#16A34A" /><span style={{ fontWeight: typography.fontWeight.medium }}>{tool.supplier_name}</span></>) : (<><Icons.AlertCircle size={14} color="#CA8A04" /><span>{t('project.selectRentalSupplier', 'Select Rental Provider')}</span></>)}
              </div>
              <Icons.ChevronDown size={14} style={{ transform: showDropdown ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 150ms' }} />
            </button>

            {showDropdown && (
              <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50, marginTop: spacing[1], backgroundColor: colors.neutral[0], border: `1px solid ${colors.border.light}`, borderRadius: borderRadius.md, boxShadow: shadows.lg, maxHeight: '250px', overflowY: 'auto' }}>
                {tool.available_suppliers.length === 0 ? (
                  <div style={{ padding: spacing[4], textAlign: 'center', color: colors.text.secondary, fontSize: typography.fontSize.sm }}>{t('project.noRentalSuppliersAvailable', 'No rental providers available')}</div>
                ) : (
                  tool.available_suppliers.map(supplier => (
                    <button key={supplier.supplier_id} onClick={() => { onSupplierSelect(supplier); setShowDropdown(false); }} style={{
                      display: 'block', width: '100%', padding: spacing[3], border: 'none', borderBottom: `1px solid ${colors.border.light}`,
                      backgroundColor: tool.supplier_id === supplier.supplier_id ? colors.primary[50] : colors.neutral[0], cursor: 'pointer', textAlign: 'left',
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: spacing[1], marginBottom: spacing[1] }}>
                            <span style={{ fontWeight: typography.fontWeight.medium, fontSize: typography.fontSize.sm }}>{supplier.supplier_name}</span>
                            {supplier.is_verified && <Icons.CheckCircle size={12} color={colors.primary[600]} />}
                          </div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: spacing[2], fontSize: typography.fontSize.xs, color: colors.text.secondary }}>
                            {supplier.location && <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}><Icons.MapPin size={10} /> {supplier.location}</span>}
                            <span style={{ color: colors.primary[600], fontWeight: typography.fontWeight.medium }}>{supplier.tools_available}/{supplier.total_tools_needed}</span>
                            {supplier.direct_booking_available ? <span style={{ color: '#16A34A' }}>Direct</span> : <span style={{ color: '#CA8A04' }}>RFQ</span>}
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: typography.fontSize.base, fontWeight: typography.fontWeight.bold, color: colors.primary[600] }}>{supplier.day_rate.toLocaleString()} ₾</div>
                          <div style={{ fontSize: typography.fontSize.xs, color: colors.text.secondary }}>/{t('project.day', 'day')}</div>
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Tool Order Card Component
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ToolOrderCard({ order, onDirectBook, onSendRFQ, isCreating, t }: { order: SupplierToolOrder; onDirectBook: () => void; onSendRFQ: () => void; isCreating: boolean; t: any }) {
  return (
    <div style={{ backgroundColor: colors.neutral[0], borderRadius: borderRadius.lg, border: `2px solid ${colors.primary[200]}`, overflow: 'hidden', boxShadow: shadows.md }}>
      <div style={{ padding: spacing[3], backgroundColor: colors.primary[50], borderBottom: `1px solid ${colors.primary[200]}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: spacing[2] }}>
          <div>
            <h4 style={{ margin: 0, fontSize: typography.fontSize.base, fontWeight: typography.fontWeight.semibold }}>{order.supplier_name}</h4>
            {order.location && <p style={{ margin: 0, marginTop: spacing[1], fontSize: typography.fontSize.xs, color: colors.text.secondary, display: 'flex', alignItems: 'center', gap: spacing[1] }}><Icons.MapPin size={12} /> {order.location}</p>}
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: typography.fontSize.xs, color: colors.text.secondary }}>{order.tools.length} tools</div>
            <div style={{ fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.bold, color: colors.primary[600] }}>{order.total.toLocaleString()} ₾</div>
          </div>
        </div>
      </div>
      <div style={{ padding: spacing[2], maxHeight: '120px', overflowY: 'auto' }}>
        {order.tools.map(tool => (
          <div key={tool.id} style={{ display: 'flex', justifyContent: 'space-between', padding: `${spacing[1]} 0`, borderBottom: `1px solid ${colors.border.light}`, fontSize: typography.fontSize.xs }}>
            <div>
              <span>{tool.name}</span>
              <span style={{ color: colors.text.tertiary, marginLeft: spacing[1] }}>{tool.rental_duration_days} {t('project.days', 'days')}</span>
            </div>
            <span style={{ color: colors.text.secondary }}>{tool.daily_rate_estimate?.toLocaleString()} ₾/{t('project.day', 'day')}</span>
          </div>
        ))}
      </div>
      <div style={{ padding: spacing[3], borderTop: `1px solid ${colors.border.light}`, display: 'flex', gap: spacing[2] }}>
        {order.direct_booking_available && (
          <button onClick={onDirectBook} disabled={isCreating} style={{ flex: 1, padding: spacing[2], backgroundColor: colors.primary[600], color: colors.text.inverse, border: 'none', borderRadius: borderRadius.md, cursor: isCreating ? 'not-allowed' : 'pointer', fontWeight: typography.fontWeight.medium, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: spacing[1], opacity: isCreating ? 0.7 : 1, fontSize: typography.fontSize.sm }}>
            <Icons.Calendar size={14} /> {isCreating ? '...' : t('project.bookNow', 'Book Now')}
          </button>
        )}
        <button onClick={onSendRFQ} disabled={isCreating} style={{ flex: 1, padding: spacing[2], backgroundColor: order.direct_booking_available ? colors.neutral[100] : colors.primary[600], color: order.direct_booking_available ? colors.text.primary : colors.text.inverse, border: 'none', borderRadius: borderRadius.md, cursor: isCreating ? 'not-allowed' : 'pointer', fontWeight: typography.fontWeight.medium, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: spacing[1], opacity: isCreating ? 0.7 : 1, fontSize: typography.fontSize.sm }}>
          <Icons.Send size={14} /> {isCreating ? '...' : t('project.sendRentalRFQ', 'Request Quote')}
        </button>
      </div>
    </div>
  );
}
