/**
 * ProjectDetail Page
 * Project detail view with tabs: Overview, RFQs, Orders, Deliveries, Rentals
 */

import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { projectsService } from '../services/api/projectsService';
import type { ProjectDetail as ProjectDetailType } from '../types/project';
import { Icons } from '../components/icons/Icons';
import { formatDate, formatCurrency } from '../utils/formatters';
import { colors, spacing, typography, borderRadius, shadows } from '../theme/tokens';

type TabType = 'overview' | 'rfqs' | 'orders' | 'deliveries' | 'rentals';

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
          border: `1px solid ${colors.error}`,
          borderRadius: borderRadius.lg,
          padding: spacing[4],
          textAlign: 'center',
        }}>
          <div style={{ marginBottom: spacing[2], display: 'flex', justifyContent: 'center' }}>
            <Icons.AlertCircle size={32} color={colors.error} />
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
              color: colors.error,
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

  const tabs: { key: TabType; label: string; count?: number }[] = [
    { key: 'overview', label: t('projects.tabs.overview') },
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
        {activeTab === 'rfqs' && <RFQsTab rfqs={rfqs} navigate={navigate} />}
        {activeTab === 'orders' && <OrdersTab orders={orders} navigate={navigate} />}
        {activeTab === 'deliveries' && <DeliveriesTab deliveries={deliveries} />}
        {activeTab === 'rentals' && <RentalsTab rentals={rentals} />}
      </div>
    </div>
  );
}

// Overview Tab Component
function OverviewTab({ project, onDelete }: { project: ProjectDetailType['project']; onDelete: () => void }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const hasLocation = project.latitude !== null && project.longitude !== null;

  return (
    <div>
      {/* Materials Quick Action */}
      <button
        onClick={() => navigate(`/projects/${project.id}/materials`)}
        style={{
          width: '100%',
          padding: spacing[4],
          backgroundColor: colors.primary[600],
          color: colors.text.inverse,
          border: 'none',
          borderRadius: borderRadius.lg,
          fontWeight: typography.fontWeight.semibold,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: spacing[2],
          cursor: 'pointer',
          marginBottom: spacing[6],
          fontSize: typography.fontSize.base,
          transition: 'background-color 200ms ease',
        }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.primary[700]}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = colors.primary[600]}
      >
        <Icons.ClipboardCheck size={20} />
        {t('projects.detail.viewMaterials', 'View Materials List')}
      </button>

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
          color: colors.error,
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
          <Icons.AlertCircle size={20} color={colors.error} />
        </div>
        {t('projects.detail.deleteProject')}
      </button>
    </div>
  );
}

// RFQs Tab Component
function RFQsTab({ rfqs, navigate }: { rfqs: ProjectDetailType['rfqs']; navigate: (path: string) => void }) {
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
          onClick={() => navigate(`/rfqs/${rfq.id}`)}
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
function OrdersTab({ orders, navigate }: { orders: ProjectDetailType['orders']; navigate: (path: string) => void }) {
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
          onClick={() => navigate(`/orders/${order.order_number}`)}
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
              <Icons.CheckCircle size={20} color={colors.success} />
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
