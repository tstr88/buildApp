/**
 * Window Picker Component
 * Allows selecting delivery window with date range and time slots
 */

import React, { useState } from 'react';
import * as Icons from 'lucide-react';
import { colors, spacing, typography, borderRadius } from '../../theme/tokens';

interface DeliveryWindow {
  start_date: string;
  end_date: string;
  time_slot: 'morning' | 'afternoon' | 'flexible';
  access_notes?: string;
}

interface WindowPickerProps {
  window: DeliveryWindow | null;
  onChange: (window: DeliveryWindow) => void;
  mode?: 'delivery' | 'pickup';
}

export const WindowPicker: React.FC<WindowPickerProps> = ({ window, onChange, mode = 'delivery' }) => {
  const timeSlots = [
    { id: 'morning', label: 'Morning', time: '08:00-12:00', icon: Icons.Sunrise },
    { id: 'afternoon', label: 'Afternoon', time: '12:00-17:00', icon: Icons.Sun },
    { id: 'flexible', label: 'Flexible', time: 'Anytime', icon: Icons.Clock },
  ];

  const handleDateChange = (field: 'start_date' | 'end_date', value: string) => {
    onChange({
      start_date: window?.start_date || '',
      end_date: window?.end_date || '',
      time_slot: window?.time_slot || 'flexible',
      access_notes: window?.access_notes || '',
      [field]: value,
    });
  };

  const handleTimeSlotChange = (slot: 'morning' | 'afternoon' | 'flexible') => {
    onChange({
      start_date: window?.start_date || '',
      end_date: window?.end_date || '',
      time_slot: slot,
      access_notes: window?.access_notes || '',
    });
  };

  const handleNotesChange = (notes: string) => {
    onChange({
      start_date: window?.start_date || '',
      end_date: window?.end_date || '',
      time_slot: window?.time_slot || 'flexible',
      access_notes: notes,
    });
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div>
      {/* Header */}
      <h3
        style={{
          fontSize: typography.fontSize.lg,
          fontWeight: typography.fontWeight.semibold,
          color: colors.text.primary,
          margin: 0,
          marginBottom: spacing[1],
        }}
      >
        {mode === 'pickup' ? 'Preferred Pickup Window' : 'Preferred Delivery Window'}
      </h3>
      <p
        style={{
          fontSize: typography.fontSize.sm,
          color: colors.text.secondary,
          margin: 0,
          marginBottom: spacing[4],
        }}
      >
        {mode === 'pickup'
          ? 'When would you like to pick up? (Optional but recommended)'
          : 'When would you like to receive delivery? (Optional but recommended)'}
      </p>

      {/* Date Range */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: spacing[4],
          marginBottom: spacing[4],
        }}
      >
        <div>
          <label
            style={{
              display: 'block',
              fontSize: typography.fontSize.sm,
              fontWeight: typography.fontWeight.medium,
              color: colors.text.secondary,
              marginBottom: spacing[2],
            }}
          >
            From Date
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type="date"
              value={window?.start_date || ''}
              onChange={(e) => handleDateChange('start_date', e.target.value)}
              min={today}
              style={{
                width: '100%',
                padding: spacing[3],
                paddingLeft: spacing[10],
                border: `1px solid ${colors.border.light}`,
                borderRadius: borderRadius.md,
                fontSize: typography.fontSize.base,
              }}
              onFocus={(e) => {
                e.target.style.borderColor = colors.primary[600];
                e.target.style.boxShadow = `0 0 0 3px ${colors.primary[50]}`;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = colors.border.light;
                e.target.style.boxShadow = 'none';
              }}
            />
            <div
              style={{
                position: 'absolute',
                left: spacing[3],
                top: '50%',
                transform: 'translateY(-50%)',
                pointerEvents: 'none',
              }}
            >
              <Icons.Calendar size={20} color={colors.text.tertiary} />
            </div>
          </div>
        </div>

        <div>
          <label
            style={{
              display: 'block',
              fontSize: typography.fontSize.sm,
              fontWeight: typography.fontWeight.medium,
              color: colors.text.secondary,
              marginBottom: spacing[2],
            }}
          >
            To Date
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type="date"
              value={window?.end_date || ''}
              onChange={(e) => handleDateChange('end_date', e.target.value)}
              min={window?.start_date || today}
              style={{
                width: '100%',
                padding: spacing[3],
                paddingLeft: spacing[10],
                border: `1px solid ${colors.border.light}`,
                borderRadius: borderRadius.md,
                fontSize: typography.fontSize.base,
              }}
              onFocus={(e) => {
                e.target.style.borderColor = colors.primary[600];
                e.target.style.boxShadow = `0 0 0 3px ${colors.primary[50]}`;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = colors.border.light;
                e.target.style.boxShadow = 'none';
              }}
            />
            <div
              style={{
                position: 'absolute',
                left: spacing[3],
                top: '50%',
                transform: 'translateY(-50%)',
                pointerEvents: 'none',
              }}
            >
              <Icons.Calendar size={20} color={colors.text.tertiary} />
            </div>
          </div>
        </div>
      </div>

      {/* Time Slot Pills */}
      <div style={{ marginBottom: spacing[4] }}>
        <label
          style={{
            display: 'block',
            fontSize: typography.fontSize.sm,
            fontWeight: typography.fontWeight.medium,
            color: colors.text.secondary,
            marginBottom: spacing[2],
          }}
        >
          Preferred Time
        </label>
        <div style={{ display: 'flex', gap: spacing[3] }}>
          {timeSlots.map((slot) => {
            const isSelected = window?.time_slot === slot.id;
            const Icon = slot.icon;
            return (
              <button
                key={slot.id}
                onClick={() => handleTimeSlotChange(slot.id as any)}
                style={{
                  flex: 1,
                  padding: spacing[4],
                  backgroundColor: isSelected ? colors.primary[50] : colors.neutral[0],
                  border: `2px solid ${isSelected ? colors.primary[600] : colors.border.light}`,
                  borderRadius: borderRadius.lg,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.borderColor = colors.primary[300];
                    e.currentTarget.style.backgroundColor = colors.neutral[50];
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.borderColor = colors.border.light;
                    e.currentTarget.style.backgroundColor = colors.neutral[0];
                  }
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: spacing[2],
                  }}
                >
                  <Icon size={24} color={isSelected ? colors.primary[600] : colors.text.tertiary} />
                  <div>
                    <div
                      style={{
                        fontSize: typography.fontSize.sm,
                        fontWeight: typography.fontWeight.semibold,
                        color: isSelected ? colors.primary[700] : colors.text.primary,
                        marginBottom: spacing[1],
                      }}
                    >
                      {slot.label}
                    </div>
                    <div
                      style={{
                        fontSize: typography.fontSize.xs,
                        color: colors.text.tertiary,
                      }}
                    >
                      {slot.time}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Access Notes */}
      <div>
        <label
          style={{
            display: 'block',
            fontSize: typography.fontSize.sm,
            fontWeight: typography.fontWeight.medium,
            color: colors.text.secondary,
            marginBottom: spacing[2],
          }}
        >
          Access Notes (Optional)
        </label>
        <textarea
          value={window?.access_notes || ''}
          onChange={(e) => handleNotesChange(e.target.value)}
          placeholder="e.g., Gate code: 1234, Call when arriving, Park on side street..."
          rows={3}
          style={{
            width: '100%',
            padding: spacing[3],
            border: `1px solid ${colors.border.light}`,
            borderRadius: borderRadius.md,
            fontSize: typography.fontSize.base,
            resize: 'vertical',
            fontFamily: 'inherit',
          }}
          onFocus={(e) => {
            e.target.style.borderColor = colors.primary[600];
            e.target.style.boxShadow = `0 0 0 3px ${colors.primary[50]}`;
          }}
          onBlur={(e) => {
            e.target.style.borderColor = colors.border.light;
            e.target.style.boxShadow = 'none';
          }}
        />
        <p
          style={{
            fontSize: typography.fontSize.xs,
            color: colors.text.tertiary,
            margin: 0,
            marginTop: spacing[2],
          }}
        >
          {mode === 'pickup'
            ? 'Help suppliers prepare for your pickup with access instructions, parking info, or contact details'
            : 'Help suppliers plan delivery with access instructions, parking info, or contact details'}
        </p>
      </div>
    </div>
  );
};
