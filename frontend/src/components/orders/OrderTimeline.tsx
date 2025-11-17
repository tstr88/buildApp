/**
 * Order Timeline Component
 * Vertical stepper showing order status progression
 */

import React from 'react';
import * as Icons from 'lucide-react';
import { colors, spacing, typography, borderRadius } from '../../theme/tokens';

interface TimelineStep {
  label: string;
  status: 'completed' | 'current' | 'upcoming';
  timestamp?: string;
  description?: string;
  photo?: string;
}

interface OrderTimelineProps {
  orderStatus: string;
  createdAt: string;
  scheduledStart?: string;
  scheduledEnd?: string;
  deliveredAt?: string;
  confirmedAt?: string;
  deliveryProofPhoto?: string;
}

export const OrderTimeline: React.FC<OrderTimelineProps> = ({
  orderStatus,
  createdAt,
  scheduledStart,
  scheduledEnd,
  deliveredAt,
  confirmedAt,
  deliveryProofPhoto,
}) => {
  const formatTimestamp = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatTimeWindow = () => {
    if (!scheduledStart || !scheduledEnd) return 'To be confirmed';
    return `${formatTimestamp(scheduledStart)} - ${formatTimestamp(scheduledEnd)}`;
  };

  // Determine step statuses based on order status
  const getStepStatus = (stepKey: string): 'completed' | 'current' | 'upcoming' => {
    const statusOrder = [
      'created',
      'window_confirmed',
      'in_transit',
      'delivered',
      'buyer_confirmed',
    ];

    const currentIndex = statusOrder.indexOf(
      orderStatus === 'pending' || orderStatus === 'pending_schedule'
        ? 'created'
        : orderStatus === 'scheduled' || orderStatus === 'confirmed'
        ? 'window_confirmed'
        : orderStatus === 'in_transit'
        ? 'in_transit'
        : orderStatus === 'delivered'
        ? 'delivered'
        : orderStatus === 'completed'
        ? 'buyer_confirmed'
        : 'created'
    );

    const stepIndex = statusOrder.indexOf(stepKey);

    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'current';
    return 'upcoming';
  };

  const steps: TimelineStep[] = [
    {
      label: 'Order Created',
      status: getStepStatus('created'),
      timestamp: formatTimestamp(createdAt),
      description: 'Order placed successfully',
    },
    {
      label: 'Window Confirmed',
      status: getStepStatus('window_confirmed'),
      timestamp: scheduledStart ? formatTimeWindow() : undefined,
      description: scheduledStart
        ? 'Delivery schedule confirmed'
        : 'Waiting for supplier to confirm schedule',
    },
    {
      label: 'Out for Delivery',
      status: getStepStatus('in_transit'),
      timestamp:
        orderStatus === 'in_transit' || orderStatus === 'delivered' || orderStatus === 'completed'
          ? 'In transit'
          : undefined,
      description: 'Order is on the way',
    },
    {
      label: 'Delivered',
      status: getStepStatus('delivered'),
      timestamp: deliveredAt ? formatTimestamp(deliveredAt) : undefined,
      description: deliveredAt ? 'Order delivered to location' : 'Pending delivery',
      photo: deliveryProofPhoto,
    },
    {
      label: 'Your Confirmation',
      status: getStepStatus('buyer_confirmed'),
      timestamp: confirmedAt ? formatTimestamp(confirmedAt) : undefined,
      description: confirmedAt
        ? 'Order completed'
        : deliveredAt
        ? '24-hour confirmation period'
        : 'Awaiting delivery',
    },
  ];

  const getStepIcon = (step: TimelineStep, index: number) => {
    if (step.status === 'completed') {
      return <Icons.CheckCircle size={24} color={colors.success[600]} />;
    } else if (step.status === 'current') {
      return (
        <div
          style={{
            width: '24px',
            height: '24px',
            borderRadius: borderRadius.full,
            backgroundColor: colors.primary[600],
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            animation: 'pulse 2s ease-in-out infinite',
          }}
        >
          <div
            style={{
              width: '12px',
              height: '12px',
              borderRadius: borderRadius.full,
              backgroundColor: colors.neutral[0],
            }}
          />
        </div>
      );
    } else {
      return (
        <div
          style={{
            width: '24px',
            height: '24px',
            borderRadius: borderRadius.full,
            backgroundColor: colors.neutral[200],
            border: `2px solid ${colors.neutral[300]}`,
          }}
        />
      );
    }
  };

  return (
    <div>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
      `}</style>

      <h3
        style={{
          fontSize: typography.fontSize.lg,
          fontWeight: typography.fontWeight.semibold,
          color: colors.text.primary,
          margin: 0,
          marginBottom: spacing[4],
        }}
      >
        Order Status
      </h3>

      <div style={{ position: 'relative' }}>
        {steps.map((step, index) => (
          <div
            key={index}
            style={{
              position: 'relative',
              paddingBottom: index < steps.length - 1 ? spacing[6] : 0,
            }}
          >
            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div
                style={{
                  position: 'absolute',
                  left: '11px',
                  top: '32px',
                  bottom: 0,
                  width: '2px',
                  backgroundColor:
                    step.status === 'completed'
                      ? colors.success[300]
                      : colors.neutral[200],
                }}
              />
            )}

            {/* Step Content */}
            <div style={{ display: 'flex', gap: spacing[3], position: 'relative' }}>
              {/* Icon */}
              <div style={{ flexShrink: 0, zIndex: 1 }}>{getStepIcon(step, index)}</div>

              {/* Details */}
              <div style={{ flex: 1, paddingTop: '2px' }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: spacing[1],
                  }}
                >
                  <h4
                    style={{
                      fontSize: typography.fontSize.base,
                      fontWeight:
                        step.status === 'current'
                          ? typography.fontWeight.semibold
                          : typography.fontWeight.medium,
                      color:
                        step.status === 'upcoming'
                          ? colors.text.tertiary
                          : colors.text.primary,
                      margin: 0,
                    }}
                  >
                    {step.label}
                  </h4>
                  {step.timestamp && (
                    <span
                      style={{
                        fontSize: typography.fontSize.xs,
                        color: colors.text.tertiary,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {step.timestamp}
                    </span>
                  )}
                </div>

                {step.description && (
                  <p
                    style={{
                      fontSize: typography.fontSize.sm,
                      color: colors.text.secondary,
                      margin: 0,
                      marginBottom: spacing[2],
                    }}
                  >
                    {step.description}
                  </p>
                )}

                {/* Delivery Photo Thumbnail */}
                {step.photo && (
                  <div
                    style={{
                      marginTop: spacing[2],
                      width: '80px',
                      height: '80px',
                      borderRadius: borderRadius.md,
                      overflow: 'hidden',
                      border: `2px solid ${colors.success[200]}`,
                    }}
                  >
                    <img
                      src={step.photo}
                      alt="Delivery proof"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
