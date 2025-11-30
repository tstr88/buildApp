/**
 * Admin Data Exports Page
 * Generate CSV/XLSX/JSON exports of platform data
 */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { colors, spacing, typography } from '../../theme/tokens';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

type ExportCategory = 'orders' | 'rfqs' | 'deliveries' | 'rentals' | 'disputes' | 'suppliers' | 'billing';

export function Exports() {
  const { t } = useTranslation();
  const { token } = useAuth();
  const [activeCategory, setActiveCategory] = useState<ExportCategory>('orders');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    if (!token) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/admin/exports/${activeCategory}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ dateFrom, dateTo, format: 'csv' }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${activeCategory}_export_${Date.now()}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories: { key: ExportCategory; label: string }[] = [
    { key: 'orders', label: 'Orders (Materials)' },
    { key: 'rfqs', label: 'RFQs & Offers' },
    { key: 'deliveries', label: 'Deliveries' },
    { key: 'rentals', label: 'Rentals' },
    { key: 'disputes', label: 'Disputes' },
    { key: 'suppliers', label: 'Supplier Stats' },
    { key: 'billing', label: 'Billing' },
  ];

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: spacing[6] }}>
      <div style={{ marginBottom: spacing[6] }}>
        <h1 style={{ fontSize: typography.fontSize['2xl'], fontWeight: typography.fontWeight.bold, color: colors.text.primary, margin: 0, marginBottom: spacing[2] }}>
          Data Exports
        </h1>
        <p style={{ fontSize: typography.fontSize.base, color: colors.text.secondary, margin: 0 }}>
          Generate CSV exports of platform data
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: spacing[6] }}>
        {/* Category Sidebar */}
        <div style={{ backgroundColor: colors.neutral[0], borderRadius: '8px', border: `1px solid ${colors.border.light}`, padding: spacing[4] }}>
          <h3 style={{ fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.semibold, color: colors.text.tertiary, textTransform: 'uppercase', margin: 0, marginBottom: spacing[3] }}>
            Export Categories
          </h3>
          {categories.map(cat => (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              style={{
                width: '100%',
                textAlign: 'left',
                padding: spacing[3],
                marginBottom: spacing[1],
                backgroundColor: activeCategory === cat.key ? colors.primary[50] : 'transparent',
                border: 'none',
                borderRadius: '6px',
                color: activeCategory === cat.key ? colors.primary[700] : colors.text.primary,
                fontWeight: activeCategory === cat.key ? typography.fontWeight.semibold : typography.fontWeight.normal,
                cursor: 'pointer',
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Export Form */}
        <div style={{ backgroundColor: colors.neutral[0], borderRadius: '8px', border: `1px solid ${colors.border.light}`, padding: spacing[6] }}>
          <h2 style={{ fontSize: typography.fontSize.xl, fontWeight: typography.fontWeight.bold, margin: 0, marginBottom: spacing[4] }}>
            {categories.find(c => c.key === activeCategory)?.label}
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[4] }}>
            <div>
              <label style={{ display: 'block', fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.medium, marginBottom: spacing[2] }}>
                Date From
              </label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                style={{ width: '100%', padding: spacing[2], border: `1px solid ${colors.border.default}`, borderRadius: '6px' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.medium, marginBottom: spacing[2] }}>
                Date To
              </label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                style={{ width: '100%', padding: spacing[2], border: `1px solid ${colors.border.default}`, borderRadius: '6px' }}
              />
            </div>

            <button
              onClick={handleExport}
              disabled={loading}
              style={{
                padding: `${spacing[3]} ${spacing[4]}`,
                backgroundColor: loading ? colors.neutral[300] : colors.primary[600],
                color: colors.text.inverse,
                border: 'none',
                borderRadius: '6px',
                fontSize: typography.fontSize.base,
                fontWeight: typography.fontWeight.semibold,
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? 'Generating...' : 'Generate Export (CSV)'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
