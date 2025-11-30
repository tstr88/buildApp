import React, { useState, useEffect } from 'react';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme/tokens';
import * as Icons from 'lucide-react';

// Hook for mobile detection
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

interface RentalDatePickerProps {
  startDate: Date | null;
  endDate: Date | null;
  onStartDateChange: (date: Date | null) => void;
  onEndDateChange: (date: Date | null) => void;
  unavailableDates?: Date[];
}

export const RentalDatePicker: React.FC<RentalDatePickerProps> = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  unavailableDates = [],
}) => {
  const isMobile = useIsMobile();
  const [durationPreset, setDurationPreset] = useState<string>('');

  const handleDurationPreset = (days: number) => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + days);

    onStartDateChange(start);
    onEndDateChange(end);
    setDurationPreset(`${days}`);
  };

  const calculateDuration = () => {
    if (!startDate || !endDate) return 0;
    const diff = endDate.getTime() - startDate.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const formatDate = (date: Date | null) => {
    if (!date) return '';
    return date.toISOString().split('T')[0];
  };

  const duration = calculateDuration();

  const presets = [
    { days: 1, label: '1 Day' },
    { days: 3, label: '3 Days' },
    { days: 7, label: '1 Week' },
    { days: 14, label: '2 Weeks' },
    { days: 30, label: '1 Month' },
  ];

  return (
    <div>
      {/* Quick Select Pills */}
      <div style={{ marginBottom: spacing[4] }}>
        <label
          style={{
            display: 'block',
            fontSize: typography.fontSize.xs,
            fontWeight: typography.fontWeight.medium,
            color: colors.text.tertiary,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: spacing[2],
          }}
        >
          Quick Select
        </label>
        <div
          style={{
            display: 'flex',
            gap: spacing[2],
            overflowX: 'auto',
            paddingBottom: spacing[1],
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {presets.map((preset) => {
            const isSelected = durationPreset === `${preset.days}`;
            return (
              <button
                key={preset.days}
                onClick={() => handleDurationPreset(preset.days)}
                style={{
                  padding: `${spacing[2]} ${spacing[3]}`,
                  backgroundColor: isSelected ? colors.primary[600] : colors.neutral[0],
                  color: isSelected ? colors.neutral[0] : colors.text.primary,
                  border: `1px solid ${isSelected ? colors.primary[600] : colors.border.light}`,
                  borderRadius: borderRadius.full,
                  fontSize: typography.fontSize.sm,
                  fontWeight: typography.fontWeight.medium,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                }}
              >
                {preset.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom Date Selection */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
          gap: spacing[3],
          marginBottom: spacing[4],
        }}
      >
        {/* Start Date */}
        <div>
          <label
            style={{
              display: 'block',
              fontSize: typography.fontSize.xs,
              fontWeight: typography.fontWeight.medium,
              color: colors.text.tertiary,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: spacing[2],
            }}
          >
            Start Date
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type="date"
              value={formatDate(startDate)}
              min={formatDate(new Date())}
              onChange={(e) => {
                const date = e.target.value ? new Date(e.target.value) : null;
                onStartDateChange(date);
                setDurationPreset('');
              }}
              style={{
                width: '100%',
                padding: spacing[3],
                paddingLeft: spacing[10],
                border: `1px solid ${colors.border.light}`,
                borderRadius: borderRadius.md,
                fontSize: '16px', // Prevent iOS zoom
                backgroundColor: colors.neutral[0],
                boxSizing: 'border-box',
                color: startDate ? colors.text.primary : colors.text.tertiary,
              }}
            />
            <Icons.Calendar
              size={18}
              color={colors.text.tertiary}
              style={{
                position: 'absolute',
                left: spacing[3],
                top: '50%',
                transform: 'translateY(-50%)',
                pointerEvents: 'none',
              }}
            />
          </div>
        </div>

        {/* End Date */}
        <div>
          <label
            style={{
              display: 'block',
              fontSize: typography.fontSize.xs,
              fontWeight: typography.fontWeight.medium,
              color: colors.text.tertiary,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: spacing[2],
            }}
          >
            End Date
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type="date"
              value={formatDate(endDate)}
              min={startDate ? formatDate(startDate) : formatDate(new Date())}
              onChange={(e) => {
                const date = e.target.value ? new Date(e.target.value) : null;
                onEndDateChange(date);
                setDurationPreset('');
              }}
              style={{
                width: '100%',
                padding: spacing[3],
                paddingLeft: spacing[10],
                border: `1px solid ${colors.border.light}`,
                borderRadius: borderRadius.md,
                fontSize: '16px', // Prevent iOS zoom
                backgroundColor: colors.neutral[0],
                boxSizing: 'border-box',
                color: endDate ? colors.text.primary : colors.text.tertiary,
              }}
            />
            <Icons.Calendar
              size={18}
              color={colors.text.tertiary}
              style={{
                position: 'absolute',
                left: spacing[3],
                top: '50%',
                transform: 'translateY(-50%)',
                pointerEvents: 'none',
              }}
            />
          </div>
        </div>
      </div>

      {/* Duration Display */}
      {startDate && endDate && duration > 0 && (
        <div
          style={{
            padding: spacing[3],
            backgroundColor: colors.primary[50],
            borderRadius: borderRadius.md,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: spacing[2],
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2] }}>
            <Icons.Clock size={18} color={colors.primary[600]} />
            <span
              style={{
                fontSize: typography.fontSize.sm,
                color: colors.primary[700],
                fontWeight: typography.fontWeight.medium,
              }}
            >
              Rental Duration
            </span>
          </div>
          <span
            style={{
              fontSize: typography.fontSize.base,
              fontWeight: typography.fontWeight.bold,
              color: colors.primary[600],
            }}
          >
            {duration} {duration === 1 ? 'day' : 'days'}
          </span>
        </div>
      )}

      {/* Unavailable Date Warning */}
      {unavailableDates.length > 0 && (
        <div
          style={{
            marginTop: spacing[3],
            padding: spacing[3],
            backgroundColor: colors.warning[50],
            border: `1px solid ${colors.warning[200]}`,
            borderRadius: borderRadius.md,
            display: 'flex',
            alignItems: 'flex-start',
            gap: spacing[2],
          }}
        >
          <Icons.AlertTriangle size={18} color={colors.warning[600]} style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <p
              style={{
                fontSize: typography.fontSize.sm,
                color: colors.warning[700],
                fontWeight: typography.fontWeight.medium,
                margin: 0,
                marginBottom: spacing[1],
              }}
            >
              Some dates may be unavailable
            </p>
            <p
              style={{
                fontSize: typography.fontSize.xs,
                color: colors.warning[600],
                margin: 0,
              }}
            >
              Please check availability with the supplier before confirming
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
