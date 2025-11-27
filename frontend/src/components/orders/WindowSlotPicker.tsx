/**
 * Window Slot Picker Component
 * Allows buyer to select delivery/pickup time windows
 * Two-step selection: First pick a day, then pick a time slot
 */

import React, { useState, useEffect } from 'react';
import * as Icons from 'lucide-react';
import { colors, spacing, typography, borderRadius } from '../../theme/tokens';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface TimeSlot {
  id: string;
  label: string;
  start: string;
  end: string;
  available: boolean;
}

interface AvailableDay {
  id: string;
  offset: number;
  label: string;
  date: string;
  fullDate: string;
  timeSlots: TimeSlot[];
}

interface WindowsData {
  sameDayCutoff: string;
  currentTime: string;
  isSameDayAvailable: boolean;
  days: AvailableDay[];
}

interface WindowSlotPickerProps {
  supplierId: string;
  mode: 'approximate' | 'negotiable';
  selectedWindowId?: string | null;
  onWindowSelect: (windowId: string, start: string, end: string) => void;
  preferredWindowNote?: string;
  onPreferredNoteChange?: (note: string) => void;
  pickupOrDelivery?: 'pickup' | 'delivery';
}

export const WindowSlotPicker: React.FC<WindowSlotPickerProps> = ({
  supplierId,
  mode,
  selectedWindowId,
  onWindowSelect,
  preferredWindowNote,
  onPreferredNoteChange,
  pickupOrDelivery = 'delivery',
}) => {
  const [windowsData, setWindowsData] = useState<WindowsData | null>(null);
  const [selectedDayId, setSelectedDayId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (mode === 'approximate') {
      fetchAvailableWindows();
    }
  }, [supplierId, mode]);

  // Auto-select first day when data loads
  useEffect(() => {
    if (windowsData && windowsData.days.length > 0 && !selectedDayId) {
      setSelectedDayId(windowsData.days[0].id);
    }
  }, [windowsData, selectedDayId]);

  const fetchAvailableWindows = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('buildapp_auth_token');
      const response = await fetch(
        `${API_URL}/api/buyers/suppliers/${supplierId}/available-windows`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.ok) {
        const data = await response.json();
        setWindowsData(data.data || null);
      }
    } catch (error) {
      console.error('Failed to fetch available windows:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectedDay = windowsData?.days.find(d => d.id === selectedDayId);

  if (mode === 'negotiable') {
    return (
      <div>
        <h3
          style={{
            fontSize: typography.fontSize.lg,
            fontWeight: typography.fontWeight.semibold,
            color: colors.text.primary,
            margin: 0,
            marginBottom: spacing[4],
          }}
        >
          {pickupOrDelivery === 'pickup' ? 'Pickup' : 'Delivery'} Schedule
        </h3>

        {/* Negotiable Banner */}
        <div
          style={{
            padding: spacing[4],
            backgroundColor: colors.warning[50],
            border: `1px solid ${colors.warning[200]}`,
            borderRadius: borderRadius.lg,
            marginBottom: spacing[4],
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: spacing[3] }}>
            <Icons.Clock
              size={24}
              color={colors.warning[700]}
              style={{ flexShrink: 0, marginTop: '2px' }}
            />
            <div>
              <h4
                style={{
                  fontSize: typography.fontSize.base,
                  fontWeight: typography.fontWeight.semibold,
                  color: colors.warning[900],
                  margin: 0,
                  marginBottom: spacing[1],
                }}
              >
                Schedule to be confirmed
              </h4>
              <p
                style={{
                  fontSize: typography.fontSize.sm,
                  color: colors.warning[900],
                  margin: 0,
                }}
              >
                The supplier will propose a {pickupOrDelivery} time after you place the order. You'll be able
                to accept or negotiate the proposed schedule.
              </p>
            </div>
          </div>
        </div>

        {/* Optional Preferred Window Input */}
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
            Preferred Time (Optional)
          </label>
          <textarea
            value={preferredWindowNote || ''}
            onChange={(e) => onPreferredNoteChange?.(e.target.value)}
            placeholder="e.g., Morning delivery preferred, weekdays only"
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
              marginTop: spacing[1],
            }}
          >
            Share your preferred {pickupOrDelivery} window and the supplier will try to accommodate.
          </p>
        </div>
      </div>
    );
  }

  // Approximate Lead Time Mode - Two-step selection
  return (
    <div>
      <h3
        style={{
          fontSize: typography.fontSize.lg,
          fontWeight: typography.fontWeight.semibold,
          color: colors.text.primary,
          margin: 0,
          marginBottom: spacing[4],
        }}
      >
        Select {pickupOrDelivery === 'pickup' ? 'Pickup' : 'Delivery'} Time
      </h3>

      {loading ? (
        <div
          style={{
            padding: spacing[6],
            textAlign: 'center',
            color: colors.text.tertiary,
          }}
        >
          <Icons.Loader size={32} color={colors.text.tertiary} style={{ margin: '0 auto', marginBottom: spacing[2] }} />
          <p style={{ margin: 0 }}>Loading available time slots...</p>
        </div>
      ) : !windowsData || windowsData.days.length === 0 ? (
        <div
          style={{
            padding: spacing[6],
            backgroundColor: colors.neutral[50],
            border: `1px solid ${colors.border.light}`,
            borderRadius: borderRadius.lg,
            textAlign: 'center',
          }}
        >
          <Icons.Calendar
            size={48}
            color={colors.text.tertiary}
            style={{ margin: '0 auto', marginBottom: spacing[3] }}
          />
          <p
            style={{
              fontSize: typography.fontSize.base,
              color: colors.text.secondary,
              margin: 0,
            }}
          >
            No time slots available
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[4] }}>
          {/* Step 1: Select Day */}
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
              1. Select Day
            </label>
            <div style={{ display: 'flex', gap: spacing[2], flexWrap: 'wrap' }}>
              {windowsData.days.map((day) => (
                <button
                  key={day.id}
                  onClick={() => {
                    setSelectedDayId(day.id);
                    // Clear selected time slot when day changes
                    if (selectedWindowId) {
                      onWindowSelect('', '', '');
                    }
                  }}
                  style={{
                    padding: `${spacing[2]} ${spacing[4]}`,
                    border: `2px solid ${selectedDayId === day.id ? colors.primary[600] : colors.border.light}`,
                    borderRadius: borderRadius.lg,
                    backgroundColor: selectedDayId === day.id ? colors.primary[50] : colors.neutral[0],
                    cursor: 'pointer',
                    transition: 'all 200ms ease',
                    minWidth: '100px',
                  }}
                  onMouseEnter={(e) => {
                    if (selectedDayId !== day.id) {
                      e.currentTarget.style.borderColor = colors.primary[300];
                      e.currentTarget.style.backgroundColor = colors.neutral[50];
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedDayId !== day.id) {
                      e.currentTarget.style.borderColor = colors.border.light;
                      e.currentTarget.style.backgroundColor = colors.neutral[0];
                    }
                  }}
                >
                  <div
                    style={{
                      fontSize: typography.fontSize.sm,
                      fontWeight: typography.fontWeight.semibold,
                      color: selectedDayId === day.id ? colors.primary[700] : colors.text.primary,
                    }}
                  >
                    {day.label}
                  </div>
                  <div
                    style={{
                      fontSize: typography.fontSize.xs,
                      color: selectedDayId === day.id ? colors.primary[600] : colors.text.tertiary,
                      marginTop: spacing[1],
                    }}
                  >
                    {new Date(day.fullDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Step 2: Select Time Slot */}
          {selectedDay && (
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
                2. Select Time
              </label>
              {selectedDay.timeSlots.length === 0 ? (
                <div
                  style={{
                    padding: spacing[4],
                    backgroundColor: colors.neutral[50],
                    border: `1px solid ${colors.border.light}`,
                    borderRadius: borderRadius.lg,
                    textAlign: 'center',
                  }}
                >
                  <p
                    style={{
                      fontSize: typography.fontSize.sm,
                      color: colors.text.secondary,
                      margin: 0,
                    }}
                  >
                    No time slots available for this day
                  </p>
                </div>
              ) : (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                    gap: spacing[2],
                  }}
                >
                  {selectedDay.timeSlots.map((slot) => (
                    <button
                      key={slot.id}
                      onClick={() => onWindowSelect(slot.id, slot.start, slot.end)}
                      disabled={!slot.available}
                      style={{
                        padding: spacing[3],
                        border: `2px solid ${
                          selectedWindowId === slot.id
                            ? colors.primary[600]
                            : slot.available
                            ? colors.border.light
                            : colors.neutral[200]
                        }`,
                        borderRadius: borderRadius.md,
                        backgroundColor:
                          selectedWindowId === slot.id
                            ? colors.primary[50]
                            : slot.available
                            ? colors.neutral[0]
                            : colors.neutral[50],
                        cursor: slot.available ? 'pointer' : 'not-allowed',
                        opacity: slot.available ? 1 : 0.6,
                        textAlign: 'center',
                        transition: 'all 200ms ease',
                      }}
                      onMouseEnter={(e) => {
                        if (slot.available && selectedWindowId !== slot.id) {
                          e.currentTarget.style.borderColor = colors.primary[300];
                          e.currentTarget.style.backgroundColor = colors.neutral[50];
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (selectedWindowId !== slot.id) {
                          e.currentTarget.style.borderColor = slot.available
                            ? colors.border.light
                            : colors.neutral[200];
                          e.currentTarget.style.backgroundColor = slot.available
                            ? colors.neutral[0]
                            : colors.neutral[50];
                        }
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: spacing[2],
                        }}
                      >
                        {selectedWindowId === slot.id && (
                          <Icons.Check size={16} color={colors.primary[600]} />
                        )}
                        <span
                          style={{
                            fontSize: typography.fontSize.sm,
                            fontWeight: selectedWindowId === slot.id ? typography.fontWeight.semibold : typography.fontWeight.medium,
                            color:
                              selectedWindowId === slot.id
                                ? colors.primary[700]
                                : slot.available
                                ? colors.text.primary
                                : colors.text.tertiary,
                          }}
                        >
                          {slot.label}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Selected Time Confirmation */}
      {selectedWindowId && selectedDay && (
        <div
          style={{
            marginTop: spacing[4],
            padding: spacing[3],
            backgroundColor: colors.success[50],
            border: `1px solid ${colors.success[200]}`,
            borderRadius: borderRadius.md,
            display: 'flex',
            alignItems: 'center',
            gap: spacing[2],
          }}
        >
          <Icons.CheckCircle size={16} color={colors.success[700]} />
          <span
            style={{
              fontSize: typography.fontSize.sm,
              color: colors.success[900],
              fontWeight: typography.fontWeight.medium,
            }}
          >
            {pickupOrDelivery === 'pickup' ? 'Pickup' : 'Delivery'} scheduled for {selectedDay.label},{' '}
            {selectedDay.timeSlots.find(s => s.id === selectedWindowId)?.label}
          </span>
        </div>
      )}
    </div>
  );
};
