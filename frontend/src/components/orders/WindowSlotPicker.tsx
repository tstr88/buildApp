/**
 * Window Slot Picker Component
 * Modern date/time picker for delivery/pickup scheduling
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
  onWindowSelect: (windowId: string, start: string, end: string, displayLabel?: string) => void;
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

  useEffect(() => {
    if (windowsData && windowsData.days.length > 0 && !selectedDayId) {
      setSelectedDayId(windowsData.days[0].id);
    }
  }, [windowsData, selectedDayId]);

  const fetchAvailableWindows = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('buildapp_auth_token');
      // Send timezone offset so server can calculate correct local time
      const tzOffset = new Date().getTimezoneOffset();
      const response = await fetch(
        `${API_URL}/api/buyers/suppliers/${supplierId}/available-windows?tzOffset=${tzOffset}`,
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

  // Get day of week short name
  const getDayOfWeek = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short' });
  };

  // Get day number
  const getDayNumber = (dateStr: string) => {
    return new Date(dateStr).getDate();
  };

  // Get month name
  const getMonthName = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short' });
  };

  // Check if date is today
  const isToday = (dateStr: string) => {
    const today = new Date();
    const date = new Date(dateStr);
    return today.toDateString() === date.toDateString();
  };

  // Check if date is tomorrow
  const isTomorrow = (dateStr: string) => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const date = new Date(dateStr);
    return tomorrow.toDateString() === date.toDateString();
  };

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
                The supplier will propose a {pickupOrDelivery} time after you place the order.
              </p>
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
              boxSizing: 'border-box',
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: spacing[5] }}>
        <h3
          style={{
            fontSize: typography.fontSize.lg,
            fontWeight: typography.fontWeight.semibold,
            color: colors.text.primary,
            margin: 0,
            marginBottom: spacing[1],
          }}
        >
          When do you need it?
        </h3>
        <p
          style={{
            fontSize: typography.fontSize.sm,
            color: colors.text.tertiary,
            margin: 0,
          }}
        >
          Select your preferred {pickupOrDelivery} date and time
        </p>
      </div>

      {loading ? (
        <div
          style={{
            padding: spacing[8],
            textAlign: 'center',
          }}
        >
          <Icons.Loader
            size={32}
            color={colors.primary[500]}
            style={{ animation: 'spin 1s linear infinite' }}
          />
          <p style={{ margin: 0, marginTop: spacing[3], color: colors.text.tertiary }}>
            Loading available times...
          </p>
        </div>
      ) : !windowsData || windowsData.days.length === 0 ? (
        <div
          style={{
            padding: spacing[6],
            backgroundColor: colors.neutral[50],
            borderRadius: borderRadius.xl,
            textAlign: 'center',
          }}
        >
          <Icons.CalendarX
            size={48}
            color={colors.text.tertiary}
            style={{ marginBottom: spacing[3] }}
          />
          <p style={{ fontSize: typography.fontSize.base, color: colors.text.secondary, margin: 0 }}>
            No available time slots
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[5] }}>
          {/* Date Selector - Horizontal scrollable calendar */}
          <div style={{ overflow: 'visible' }}>
            <div
              style={{
                display: 'flex',
                gap: spacing[2],
                overflowX: 'auto',
                paddingTop: spacing[3],
                paddingBottom: spacing[2],
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
              }}
            >
              {windowsData.days.map((day) => {
                const isSelected = selectedDayId === day.id;

                return (
                  <button
                    key={day.id}
                    onClick={() => {
                      setSelectedDayId(day.id);
                      if (selectedWindowId) {
                        onWindowSelect('', '', '', '');
                      }
                    }}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minWidth: '72px',
                      padding: `${spacing[3]} ${spacing[2]}`,
                      border: 'none',
                      borderRadius: borderRadius.xl,
                      backgroundColor: isSelected ? colors.primary[600] : colors.neutral[100],
                      cursor: 'pointer',
                      transition: 'all 150ms ease',
                      position: 'relative',
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.backgroundColor = colors.neutral[200];
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.backgroundColor = colors.neutral[100];
                      }
                    }}
                  >
                    {/* Today/Tomorrow badge */}
                    {(isToday(day.fullDate) || isTomorrow(day.fullDate)) && (
                      <span
                        style={{
                          position: 'absolute',
                          top: '-8px',
                          left: '50%',
                          transform: 'translateX(-50%)',
                          fontSize: '10px',
                          fontWeight: typography.fontWeight.semibold,
                          color: isSelected ? colors.neutral[0] : colors.primary[600],
                          backgroundColor: isSelected ? colors.primary[500] : colors.primary[100],
                          padding: '2px 8px',
                          borderRadius: borderRadius.full,
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {isToday(day.fullDate) ? 'Today' : 'Tomorrow'}
                      </span>
                    )}

                    {/* Day of week */}
                    <span
                      style={{
                        fontSize: typography.fontSize.xs,
                        fontWeight: typography.fontWeight.medium,
                        color: isSelected ? colors.primary[100] : colors.text.tertiary,
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                      }}
                    >
                      {getDayOfWeek(day.fullDate)}
                    </span>

                    {/* Day number */}
                    <span
                      style={{
                        fontSize: typography.fontSize['2xl'],
                        fontWeight: typography.fontWeight.bold,
                        color: isSelected ? colors.neutral[0] : colors.text.primary,
                        lineHeight: 1.2,
                        marginTop: spacing[1],
                      }}
                    >
                      {getDayNumber(day.fullDate)}
                    </span>

                    {/* Month */}
                    <span
                      style={{
                        fontSize: typography.fontSize.xs,
                        fontWeight: typography.fontWeight.medium,
                        color: isSelected ? colors.primary[100] : colors.text.tertiary,
                      }}
                    >
                      {getMonthName(day.fullDate)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time Slots */}
          {selectedDay && (
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: spacing[2],
                  marginBottom: spacing[3],
                }}
              >
                <Icons.Clock size={16} color={colors.text.tertiary} />
                <span
                  style={{
                    fontSize: typography.fontSize.sm,
                    fontWeight: typography.fontWeight.medium,
                    color: colors.text.secondary,
                  }}
                >
                  Available times for {selectedDay.label}
                </span>
              </div>

              {selectedDay.timeSlots.length === 0 ? (
                <div
                  style={{
                    padding: spacing[4],
                    backgroundColor: colors.neutral[50],
                    borderRadius: borderRadius.lg,
                    textAlign: 'center',
                  }}
                >
                  <p style={{ fontSize: typography.fontSize.sm, color: colors.text.tertiary, margin: 0 }}>
                    No times available for this date
                  </p>
                </div>
              ) : (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: spacing[2],
                  }}
                >
                  {selectedDay.timeSlots.map((slot) => {
                    const isSelected = selectedWindowId === slot.id;
                    // Use the label from backend which is already formatted correctly
                    // e.g., "8:00 AM - 9:00 AM" -> extract just "8:00 AM"
                    const startTime = slot.label.split(' - ')[0];

                    // Create display label combining day and time for review step
                    // e.g., "Friday, November 28 at 4:00 PM"
                    const displayLabel = `${selectedDay.label} at ${startTime}`;

                    return (
                      <button
                        key={slot.id}
                        onClick={() => onWindowSelect(slot.id, slot.start, slot.end, displayLabel)}
                        disabled={!slot.available}
                        style={{
                          padding: `${spacing[3]} ${spacing[2]}`,
                          border: isSelected
                            ? `2px solid ${colors.primary[600]}`
                            : `1px solid ${colors.border.light}`,
                          borderRadius: borderRadius.lg,
                          backgroundColor: isSelected
                            ? colors.primary[50]
                            : slot.available
                              ? colors.neutral[0]
                              : colors.neutral[50],
                          cursor: slot.available ? 'pointer' : 'not-allowed',
                          opacity: slot.available ? 1 : 0.5,
                          transition: 'all 150ms ease',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: spacing[2],
                        }}
                        onMouseEnter={(e) => {
                          if (slot.available && !isSelected) {
                            e.currentTarget.style.borderColor = colors.primary[300];
                            e.currentTarget.style.backgroundColor = colors.primary[25] || colors.neutral[50];
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isSelected) {
                            e.currentTarget.style.borderColor = colors.border.light;
                            e.currentTarget.style.backgroundColor = slot.available
                              ? colors.neutral[0]
                              : colors.neutral[50];
                          }
                        }}
                      >
                        {isSelected && (
                          <Icons.Check size={16} color={colors.primary[600]} strokeWidth={3} />
                        )}
                        <span
                          style={{
                            fontSize: typography.fontSize.sm,
                            fontWeight: isSelected
                              ? typography.fontWeight.semibold
                              : typography.fontWeight.medium,
                            color: isSelected
                              ? colors.primary[700]
                              : slot.available
                                ? colors.text.primary
                                : colors.text.tertiary,
                          }}
                        >
                          {startTime}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Selection Summary */}
          {selectedWindowId && selectedDay && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: spacing[3],
                padding: spacing[4],
                backgroundColor: colors.success[50],
                borderRadius: borderRadius.xl,
                border: `1px solid ${colors.success[200]}`,
              }}
            >
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: borderRadius.full,
                  backgroundColor: colors.success[100],
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Icons.CalendarCheck size={20} color={colors.success[700]} />
              </div>
              <div>
                <p
                  style={{
                    fontSize: typography.fontSize.sm,
                    fontWeight: typography.fontWeight.semibold,
                    color: colors.success[900],
                    margin: 0,
                  }}
                >
                  {pickupOrDelivery === 'pickup' ? 'Pickup' : 'Delivery'} scheduled
                </p>
                <p
                  style={{
                    fontSize: typography.fontSize.sm,
                    color: colors.success[700],
                    margin: 0,
                  }}
                >
                  {new Date(selectedDay.fullDate).toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                  })} at {selectedDay.timeSlots.find(s => s.id === selectedWindowId)?.label.split(' - ')[0]}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add keyframes for spinner */}
      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};
