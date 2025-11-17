/**
 * NotificationPreferences Component
 * Manage notification preferences per notification type
 */

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Icons } from '../icons/Icons';
import { api } from '../../services/api';

interface NotificationPreference {
  notification_type: string;
  push_enabled: boolean;
  sms_enabled: boolean;
  email_enabled: boolean;
  in_app_enabled: boolean;
  quiet_hours_enabled: boolean;
  quiet_hours_start: string;
  quiet_hours_end: string;
}

interface NotificationTypeGroup {
  title: string;
  types: string[];
}

export const NotificationPreferences = () => {
  const { t } = useTranslation();
  const [preferences, setPreferences] = useState<NotificationPreference[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [globalQuietHours, setGlobalQuietHours] = useState({
    enabled: true,
    start: '22:00:00',
    end: '08:00:00',
  });

  // Group notification types by category
  const notificationGroups: NotificationTypeGroup[] = [
    {
      title: t('profile.notifications.categories.rfqOffers.title'),
      types: ['offer_received', 'offer_expiring', 'rfq_received', 'offer_accepted'],
    },
    {
      title: t('profile.notifications.categories.deliveryUpdates.title'),
      types: [
        'delivery_approaching',
        'delivery_completed',
        'delivery_due_today',
        'delivery_scheduled',
        'window_confirmed',
        'buyer_confirmed_delivery',
      ],
    },
    {
      title: t('profile.notifications.categories.rentalHandovers.title'),
      types: [
        'rental_handover_due',
        'rental_return_reminder',
        'rental_due',
        'return_reminder',
      ],
    },
    {
      title: 'Orders & Confirmations',
      types: [
        'direct_order_placed',
        'order_confirmed',
        'order_auto_completed',
        'confirmation_reminder',
      ],
    },
    {
      title: 'Issues & Disputes',
      types: ['buyer_reported_issue', 'dispute_raised'],
    },
    {
      title: 'System & Admin',
      types: [
        'system_message',
        'payment_due',
        'catalog_prices_stale',
        'unanswered_rfqs_summary',
        'disputes_summary',
        'platform_health_report',
      ],
    },
  ];

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      setLoading(true);
      const response = await api.get<{ preferences: NotificationPreference[] }>(
        '/notifications/preferences'
      );

      if (response.success && response.data) {
        setPreferences(response.data.preferences);

        // Set global quiet hours from first preference
        if (response.data.preferences.length > 0) {
          const first = response.data.preferences[0];
          setGlobalQuietHours({
            enabled: first.quiet_hours_enabled,
            start: first.quiet_hours_start,
            end: first.quiet_hours_end,
          });
        }
      }
    } catch (error) {
      console.error('Failed to fetch notification preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const updatePreference = async (
    notificationType: string,
    field: keyof NotificationPreference,
    value: boolean | string
  ) => {
    try {
      setSaving(true);

      const body: Record<string, unknown> = {
        [field === 'push_enabled' ? 'pushEnabled' :
         field === 'sms_enabled' ? 'smsEnabled' :
         field === 'email_enabled' ? 'emailEnabled' :
         field === 'in_app_enabled' ? 'inAppEnabled' :
         field === 'quiet_hours_enabled' ? 'quietHoursEnabled' :
         field === 'quiet_hours_start' ? 'quietHoursStart' :
         field === 'quiet_hours_end' ? 'quietHoursEnd' : field]: value,
      };

      const response = await api.put(
        `/notifications/preferences/${notificationType}`,
        body
      );

      if (response.success) {
        // Update local state
        setPreferences(prev =>
          prev.map(pref =>
            pref.notification_type === notificationType
              ? { ...pref, [field]: value }
              : pref
          )
        );
      }
    } catch (error) {
      console.error('Failed to update preference:', error);
    } finally {
      setSaving(false);
    }
  };

  const updateAllQuietHours = async () => {
    try {
      setSaving(true);

      // Update all notification types with the global quiet hours
      const updates = preferences.map(pref =>
        api.put(`/notifications/preferences/${pref.notification_type}`, {
          quietHoursEnabled: globalQuietHours.enabled,
          quietHoursStart: globalQuietHours.start,
          quietHoursEnd: globalQuietHours.end,
        })
      );

      await Promise.all(updates);

      // Update local state
      setPreferences(prev =>
        prev.map(pref => ({
          ...pref,
          quiet_hours_enabled: globalQuietHours.enabled,
          quiet_hours_start: globalQuietHours.start,
          quiet_hours_end: globalQuietHours.end,
        }))
      );
    } catch (error) {
      console.error('Failed to update quiet hours:', error);
    } finally {
      setSaving(false);
    }
  };

  const getPreference = (notificationType: string): NotificationPreference | undefined => {
    return preferences.find(p => p.notification_type === notificationType);
  };

  const formatNotificationType = (type: string): string => {
    return type
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Quiet Hours Section */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center gap-3 mb-4">
          <Icons.Clock className="h-5 w-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            {t('profile.notifications.quietHours')}
          </h3>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          {t('profile.notifications.quietHoursDescription')}
        </p>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Enable Quiet Hours</span>
            <button
              onClick={() => {
                setGlobalQuietHours(prev => ({ ...prev, enabled: !prev.enabled }));
              }}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                globalQuietHours.enabled ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  globalQuietHours.enabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {globalQuietHours.enabled && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('profile.notifications.startTime')}
                  </label>
                  <input
                    type="time"
                    value={globalQuietHours.start.slice(0, 5)}
                    onChange={e =>
                      setGlobalQuietHours(prev => ({
                        ...prev,
                        start: `${e.target.value}:00`,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('profile.notifications.endTime')}
                  </label>
                  <input
                    type="time"
                    value={globalQuietHours.end.slice(0, 5)}
                    onChange={e =>
                      setGlobalQuietHours(prev => ({
                        ...prev,
                        end: `${e.target.value}:00`,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <button
                onClick={updateAllQuietHours}
                disabled={saving}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {saving ? t('common.saving') : t('common.save')} Quiet Hours
              </button>
            </>
          )}
        </div>
      </div>

      {/* Notification Type Groups */}
      {notificationGroups.map(group => (
        <div key={group.title} className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{group.title}</h3>

          <div className="space-y-4">
            {group.types.map(type => {
              const pref = getPreference(type);
              if (!pref) return null;

              return (
                <div key={type} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">
                    {formatNotificationType(type)}
                  </h4>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {/* In-App Toggle */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600">In-App</span>
                      <button
                        onClick={() => updatePreference(type, 'in_app_enabled', !pref.in_app_enabled)}
                        disabled={saving}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                          pref.in_app_enabled ? 'bg-blue-600' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                            pref.in_app_enabled ? 'translate-x-5' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Push Toggle */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600">Push</span>
                      <button
                        onClick={() => updatePreference(type, 'push_enabled', !pref.push_enabled)}
                        disabled={saving}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                          pref.push_enabled ? 'bg-blue-600' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                            pref.push_enabled ? 'translate-x-5' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    {/* SMS Toggle */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600">SMS</span>
                      <button
                        onClick={() => updatePreference(type, 'sms_enabled', !pref.sms_enabled)}
                        disabled={saving}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                          pref.sms_enabled ? 'bg-blue-600' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                            pref.sms_enabled ? 'translate-x-5' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Email Toggle */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600">Email</span>
                      <button
                        onClick={() => updatePreference(type, 'email_enabled', !pref.email_enabled)}
                        disabled={saving}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                          pref.email_enabled ? 'bg-blue-600' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                            pref.email_enabled ? 'translate-x-5' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};
