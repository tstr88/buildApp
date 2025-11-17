import React, { useState } from 'react';
import { colors, spacing, typography, borderRadius } from '../../theme/tokens';
import * as Icons from 'lucide-react';

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

  const isDateUnavailable = (date: Date) => {
    return unavailableDates.some(
      unavailable => unavailable.toDateString() === date.toDateString()
    );
  };

  const duration = calculateDuration();

  return (
    <div>
      {/* Duration Preset Pills */}
      <div style={{ marginBottom: spacing[4] }}>
        <label
          style={{
            display: 'block',
            fontSize: typography.fontSize.sm,
            fontWeight: typography.fontWeight.medium,
            color: colors.text.primary,
            marginBottom: spacing[2],
          }}
        >
          Quick Select
        </label>
        <div
          style={{
            display: 'flex',
            gap: spacing[2],
            flexWrap: 'wrap',
          }}
        >
          {[
            { days: 1, label: '1 Day' },
            { days: 3, label: '3 Days' },
            { days: 7, label: '1 Week' },
            { days: 14, label: '2 Weeks' },
            { days: 30, label: '1 Month' },
          ].map((preset) => (
            <button
              key={preset.days}
              onClick={() => handleDurationPreset(preset.days)}
              style={{
                padding: `${spacing[2]}px ${spacing[3]}px`,
                backgroundColor:
                  durationPreset === `${preset.days}`
                    ? colors.primary[600]
                    : colors.neutral[0],
                color:
                  durationPreset === `${preset.days}`
                    ? colors.neutral[0]
                    : colors.text.primary,
                border: `1px solid ${
                  durationPreset === `${preset.days}`
                    ? colors.primary[600]
                    : colors.neutral[300]
                }`,
                borderRadius: borderRadius.full,
                fontSize: typography.fontSize.sm,
                fontWeight: typography.fontWeight.medium,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Custom Date Selection */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: spacing[3],
          marginBottom: spacing[4],
        }}
      >
        {/* Start Date */}
        <div>
          <label
            style={{
              display: 'block',
              fontSize: typography.fontSize.sm,
              fontWeight: typography.fontWeight.medium,
              color: colors.text.primary,
              marginBottom: spacing[2],
            }}
          >
            Start Date
          </label>
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
              border: `1px solid ${colors.neutral[300]}`,
              borderRadius: borderRadius.md,
              fontSize: typography.fontSize.sm,
              backgroundColor: colors.neutral[0],
            }}
          />
        </div>

        {/* End Date */}
        <div>
          <label
            style={{
              display: 'block',
              fontSize: typography.fontSize.sm,
              fontWeight: typography.fontWeight.medium,
              color: colors.text.primary,
              marginBottom: spacing[2],
            }}
          >
            End Date
          </label>
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
              border: `1px solid ${colors.neutral[300]}`,
              borderRadius: borderRadius.md,
              fontSize: typography.fontSize.sm,
              backgroundColor: colors.neutral[0],
            }}
          />
        </div>
      </div>

      {/* Duration Display */}
      {startDate && endDate && duration > 0 && (
        <div
          style={{
            padding: spacing[3],
            backgroundColor: colors.info[50],
            border: `1px solid ${colors.info[200]}`,
            borderRadius: borderRadius.md,
            display: 'flex',
            alignItems: 'center',
            gap: spacing[2],
          }}
        >
          <Icons.Calendar size={18} color={colors.info[700]} />
          <span
            style={{
              fontSize: typography.fontSize.sm,
              color: colors.info[700],
              fontWeight: typography.fontWeight.medium,
            }}
          >
            Rental Duration: {duration} {duration === 1 ? 'day' : 'days'}
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
          <Icons.AlertTriangle size={18} color={colors.warning[700]} style={{ flexShrink: 0 }} />
          <div>
            <p
              style={{
                fontSize: typography.fontSize.sm,
                color: colors.warning[700],
                fontWeight: typography.fontWeight.medium,
                marginBottom: spacing[1],
              }}
            >
              Some dates may be unavailable
            </p>
            <p
              style={{
                fontSize: typography.fontSize.xs,
                color: colors.warning[600],
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
