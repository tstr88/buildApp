/**
 * Admin Audit Logs Page
 * View immutable audit trail of critical platform actions
 */

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { colors, spacing, typography } from '../../theme/tokens';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface AuditLog {
  id: string;
  timestamp: string;
  actor_id: string;
  actor_name: string;
  actor_type: string;
  action_type: string;
  target_type: string;
  target_id: string;
  details: any;
  ip_address: string;
}

export function AuditLogs() {
  const { t } = useTranslation();
  const { token } = useAuth();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionType, setActionType] = useState('all');
  const [actorType, setActorType] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [actionTypes, setActionTypes] = useState<string[]>([]);

  useEffect(() => {
    fetchActionTypes();
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [token, searchQuery, actionType, actorType, dateFrom, dateTo, page]);

  const fetchActionTypes = async () => {
    if (!token) return;
    try {
      const response = await fetch(`${API_URL}/api/admin/audit/action-types`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        const result = await response.json();
        setActionTypes(result.data.actionTypes || []);
      }
    } catch (error) {
      console.error('Failed to fetch action types:', error);
    }
  };

  const fetchLogs = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '50',
      });
      if (searchQuery) params.append('searchQuery', searchQuery);
      if (actionType !== 'all') params.append('actionType', actionType);
      if (actorType !== 'all') params.append('actorType', actorType);
      if (dateFrom) params.append('dateFrom', dateFrom);
      if (dateTo) params.append('dateTo', dateTo);

      const response = await fetch(`${API_URL}/api/admin/audit?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        setLogs(result.data.logs || []);
        setTotalPages(result.data.pagination?.totalPages || 1);
      }
    } catch (error) {
      console.error('Failed to fetch audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    if (!token) return;
    try {
      const response = await fetch(`${API_URL}/api/admin/audit/export`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ dateFrom, dateTo, actionType, format: 'csv' }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `audit_logs_${Date.now()}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const formatActionType = (actionType: string) => {
    return actionType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div style={{ maxWidth: '1600px', margin: '0 auto', padding: spacing[6] }}>
      {/* Header */}
      <div style={{ marginBottom: spacing[6] }}>
        <h1 style={{
          fontSize: typography.fontSize['2xl'],
          fontWeight: typography.fontWeight.bold,
          color: colors.text.primary,
          margin: 0,
          marginBottom: spacing[2]
        }}>
          Audit Logs
        </h1>
        <p style={{
          fontSize: typography.fontSize.base,
          color: colors.text.secondary,
          margin: 0
        }}>
          Immutable trail of critical platform actions
        </p>
      </div>

      {/* Filters */}
      <div style={{
        backgroundColor: colors.neutral[0],
        borderRadius: '8px',
        border: `1px solid ${colors.border.light}`,
        padding: spacing[5],
        marginBottom: spacing[5]
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: spacing[4] }}>
          <div>
            <label style={{
              display: 'block',
              fontSize: typography.fontSize.sm,
              fontWeight: typography.fontWeight.medium,
              marginBottom: spacing[2]
            }}>
              Search
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Order ID, User, Target ID..."
              style={{
                width: '100%',
                padding: spacing[2],
                border: `1px solid ${colors.border.default}`,
                borderRadius: '6px',
                fontSize: typography.fontSize.sm
              }}
            />
          </div>

          <div>
            <label style={{
              display: 'block',
              fontSize: typography.fontSize.sm,
              fontWeight: typography.fontWeight.medium,
              marginBottom: spacing[2]
            }}>
              Action Type
            </label>
            <select
              value={actionType}
              onChange={(e) => setActionType(e.target.value)}
              style={{
                width: '100%',
                padding: spacing[2],
                border: `1px solid ${colors.border.default}`,
                borderRadius: '6px',
                fontSize: typography.fontSize.sm
              }}
            >
              <option value="all">All</option>
              {actionTypes.map(type => (
                <option key={type} value={type}>{formatActionType(type)}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{
              display: 'block',
              fontSize: typography.fontSize.sm,
              fontWeight: typography.fontWeight.medium,
              marginBottom: spacing[2]
            }}>
              Actor Type
            </label>
            <select
              value={actorType}
              onChange={(e) => setActorType(e.target.value)}
              style={{
                width: '100%',
                padding: spacing[2],
                border: `1px solid ${colors.border.default}`,
                borderRadius: '6px',
                fontSize: typography.fontSize.sm
              }}
            >
              <option value="all">All</option>
              <option value="buyer">Buyer</option>
              <option value="supplier">Supplier</option>
              <option value="admin">Admin</option>
              <option value="system">System</option>
            </select>
          </div>

          <div>
            <label style={{
              display: 'block',
              fontSize: typography.fontSize.sm,
              fontWeight: typography.fontWeight.medium,
              marginBottom: spacing[2]
            }}>
              Date From
            </label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              style={{
                width: '100%',
                padding: spacing[2],
                border: `1px solid ${colors.border.default}`,
                borderRadius: '6px',
                fontSize: typography.fontSize.sm
              }}
            />
          </div>

          <div>
            <label style={{
              display: 'block',
              fontSize: typography.fontSize.sm,
              fontWeight: typography.fontWeight.medium,
              marginBottom: spacing[2]
            }}>
              Date To
            </label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              style={{
                width: '100%',
                padding: spacing[2],
                border: `1px solid ${colors.border.default}`,
                borderRadius: '6px',
                fontSize: typography.fontSize.sm
              }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button
              onClick={handleExport}
              style={{
                width: '100%',
                padding: spacing[2],
                backgroundColor: colors.neutral[700],
                color: colors.text.inverse,
                border: 'none',
                borderRadius: '6px',
                fontSize: typography.fontSize.sm,
                fontWeight: typography.fontWeight.medium,
                cursor: 'pointer'
              }}
            >
              Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div style={{
        backgroundColor: colors.neutral[0],
        borderRadius: '8px',
        border: `1px solid ${colors.border.light}`,
        overflow: 'hidden'
      }}>
        {loading ? (
          <div style={{ padding: spacing[8], textAlign: 'center', color: colors.text.tertiary }}>
            Loading...
          </div>
        ) : logs.length === 0 ? (
          <div style={{ padding: spacing[8], textAlign: 'center', color: colors.text.tertiary }}>
            No audit logs found
          </div>
        ) : (
          <>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: colors.neutral[50], borderBottom: `1px solid ${colors.border.light}` }}>
                    <th style={{ padding: spacing[3], textAlign: 'left', fontSize: typography.fontSize.xs, fontWeight: typography.fontWeight.semibold, color: colors.text.tertiary, textTransform: 'uppercase' }}>
                      Timestamp
                    </th>
                    <th style={{ padding: spacing[3], textAlign: 'left', fontSize: typography.fontSize.xs, fontWeight: typography.fontWeight.semibold, color: colors.text.tertiary, textTransform: 'uppercase' }}>
                      Actor
                    </th>
                    <th style={{ padding: spacing[3], textAlign: 'left', fontSize: typography.fontSize.xs, fontWeight: typography.fontWeight.semibold, color: colors.text.tertiary, textTransform: 'uppercase' }}>
                      Action
                    </th>
                    <th style={{ padding: spacing[3], textAlign: 'left', fontSize: typography.fontSize.xs, fontWeight: typography.fontWeight.semibold, color: colors.text.tertiary, textTransform: 'uppercase' }}>
                      Target
                    </th>
                    <th style={{ padding: spacing[3], textAlign: 'left', fontSize: typography.fontSize.xs, fontWeight: typography.fontWeight.semibold, color: colors.text.tertiary, textTransform: 'uppercase' }}>
                      IP Address
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log, index) => (
                    <tr key={log.id} style={{ borderBottom: index < logs.length - 1 ? `1px solid ${colors.border.light}` : 'none' }}>
                      <td style={{ padding: spacing[3], fontSize: typography.fontSize.sm, color: colors.text.secondary }}>
                        {formatTimestamp(log.timestamp)}
                      </td>
                      <td style={{ padding: spacing[3], fontSize: typography.fontSize.sm }}>
                        <div style={{ color: colors.text.primary, fontWeight: typography.fontWeight.medium }}>
                          {log.actor_name || 'System'}
                        </div>
                        <div style={{ fontSize: typography.fontSize.xs, color: colors.text.tertiary }}>
                          {log.actor_type}
                        </div>
                      </td>
                      <td style={{ padding: spacing[3], fontSize: typography.fontSize.sm }}>
                        <span style={{
                          padding: `${spacing[1]} ${spacing[2]}`,
                          backgroundColor: colors.primary[100],
                          color: colors.primary[700],
                          borderRadius: '4px',
                          fontSize: typography.fontSize.xs,
                          fontWeight: typography.fontWeight.medium
                        }}>
                          {formatActionType(log.action_type)}
                        </span>
                      </td>
                      <td style={{ padding: spacing[3], fontSize: typography.fontSize.sm }}>
                        <div style={{ color: colors.text.primary }}>
                          {log.target_type}: {log.target_id}
                        </div>
                        {log.details && Object.keys(log.details).length > 0 && (
                          <div style={{ fontSize: typography.fontSize.xs, color: colors.text.tertiary, marginTop: spacing[1] }}>
                            {JSON.stringify(log.details).substring(0, 60)}...
                          </div>
                        )}
                      </td>
                      <td style={{ padding: spacing[3], fontSize: typography.fontSize.sm, color: colors.text.tertiary }}>
                        {log.ip_address || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: spacing[3],
                padding: spacing[4],
                borderTop: `1px solid ${colors.border.light}`
              }}>
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  style={{
                    padding: `${spacing[2]} ${spacing[3]}`,
                    backgroundColor: page === 1 ? colors.neutral[100] : colors.neutral[0],
                    border: `1px solid ${colors.border.default}`,
                    borderRadius: '6px',
                    fontSize: typography.fontSize.sm,
                    cursor: page === 1 ? 'not-allowed' : 'pointer'
                  }}
                >
                  Previous
                </button>
                <span style={{ fontSize: typography.fontSize.sm, color: colors.text.secondary }}>
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  style={{
                    padding: `${spacing[2]} ${spacing[3]}`,
                    backgroundColor: page === totalPages ? colors.neutral[100] : colors.neutral[0],
                    border: `1px solid ${colors.border.default}`,
                    borderRadius: '6px',
                    fontSize: typography.fontSize.sm,
                    cursor: page === totalPages ? 'not-allowed' : 'pointer'
                  }}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
