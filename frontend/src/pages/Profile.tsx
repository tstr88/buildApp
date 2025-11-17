/**
 * Profile & Settings Page
 * Displays user profile, account settings, and preferences
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import * as Icons from 'lucide-react';
import { colors, spacing, typography, borderRadius, shadows } from '../theme/tokens';
import { EditProfileModal } from '../components/profile/EditProfileModal';
import { DeleteAccountModal } from '../components/profile/DeleteAccountModal';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface ProfileData {
  profile: {
    id: string;
    phone: string;
    name: string;
    user_type: string;
    buyer_role: string;
    language: string;
    email?: string;
    profile_photo_url?: string;
    is_verified: boolean;
    created_at: string;
  };
  stats: {
    active_projects: number;
    active_orders: number;
    completed_orders: number;
  };
  notification_preferences: {
    push_enabled: boolean;
    sms_enabled: boolean;
    quiet_hours_enabled: boolean;
    quiet_hours_start: string;
    quiet_hours_end: string;
    categories: {
      rfq_offers: { enabled: boolean };
      delivery_updates: { enabled: boolean };
      rental_handovers: { enabled: boolean };
      tips_suggestions: { enabled: boolean };
    };
  };
}

export const Profile: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const token = localStorage.getItem('buildapp_auth_token');
      const response = await fetch(`${API_URL}/api/buyers/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setProfileData(data.data);
      } else if (response.status === 401) {
        navigate('/login');
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateNotificationCategory = async (category: string, enabled: boolean) => {
    try {
      const token = localStorage.getItem('buildapp_auth_token');
      const response = await fetch(`${API_URL}/api/buyers/profile/notifications`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          categories: {
            [category]: { enabled },
          },
        }),
      });

      if (response.ok) {
        // Update local state
        setProfileData((prev) =>
          prev
            ? {
                ...prev,
                notification_preferences: {
                  ...prev.notification_preferences,
                  categories: {
                    ...prev.notification_preferences.categories,
                    [category]: { enabled },
                  },
                },
              }
            : null
        );
      }
    } catch (error) {
      console.error('Failed to update notification preferences:', error);
    }
  };

  const updateGlobalNotificationSetting = async (field: 'push_enabled' | 'sms_enabled', value: boolean) => {
    try {
      const token = localStorage.getItem('buildapp_auth_token');
      const response = await fetch(`${API_URL}/api/buyers/profile/notifications`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          [field]: value,
        }),
      });

      if (response.ok) {
        setProfileData((prev) =>
          prev
            ? {
                ...prev,
                notification_preferences: {
                  ...prev.notification_preferences,
                  [field]: value,
                },
              }
            : null
        );
      }
    } catch (error) {
      console.error('Failed to update global notification setting:', error);
    }
  };

  const changeLanguage = async (lng: string) => {
    try {
      // Update i18n immediately
      await i18n.changeLanguage(lng);

      // Update backend
      const token = localStorage.getItem('buildapp_auth_token');
      const response = await fetch(`${API_URL}/api/buyers/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          language: lng,
        }),
      });

      if (response.ok) {
        // Update local state
        setProfileData((prev) =>
          prev
            ? {
                ...prev,
                profile: {
                  ...prev.profile,
                  language: lng,
                },
              }
            : null
        );
      }
    } catch (error) {
      console.error('Failed to change language:', error);
    }
  };

  const maskPhone = (phone: string): string => {
    // Format: +995 XXX XX XX 45 (show only last 2 digits)
    if (!phone) return '';
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length < 11) return phone;

    const countryCode = cleaned.substring(0, 3);
    const lastTwo = cleaned.slice(-2);
    return `+${countryCode} XXX XX XX ${lastTwo}`;
  };

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          backgroundColor: colors.background.secondary,
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              fontSize: typography.fontSize.lg,
              color: colors.text.secondary,
            }}
          >
            {t('common.loading')}
          </div>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          backgroundColor: colors.background.secondary,
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              fontSize: typography.fontSize.lg,
              color: colors.text.secondary,
            }}
          >
            {t('profilePage.failedToLoad')}
          </div>
        </div>
      </div>
    );
  }

  const { profile, stats, notification_preferences } = profileData;

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: colors.background.secondary,
        paddingBottom: '80px',
      }}
    >
      {/* Header */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 1020,
          backgroundColor: colors.neutral[0],
          borderBottom: `1px solid ${colors.border.light}`,
          boxShadow: shadows.sm,
        }}
      >
        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: `${spacing[4]} ${spacing[4]}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <button
            onClick={() => navigate(-1)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: spacing[2],
              color: colors.text.secondary,
              fontSize: typography.fontSize.base,
            }}
          >
            <Icons.ArrowLeft size={20} />
            {t('profilePage.back')}
          </button>
          <div
            style={{
              fontSize: typography.fontSize.xl,
              fontWeight: typography.fontWeight.semibold,
              color: colors.text.primary,
            }}
          >
            {t('profilePage.title')}
          </div>
          <div style={{ width: '60px' }} /> {/* Spacer for centering */}
        </div>
      </header>

      {/* Main Content */}
      <main
        style={{
          maxWidth: '800px',
          margin: '0 auto',
          padding: spacing[4],
        }}
      >
        {/* Profile Header */}
        <section
          style={{
            backgroundColor: colors.neutral[0],
            borderRadius: borderRadius.lg,
            padding: spacing[6],
            marginBottom: spacing[4],
            boxShadow: shadows.sm,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: spacing[4],
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: spacing[4] }}>
              {/* Profile Photo */}
              <div
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  backgroundColor: colors.primary[100],
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: typography.fontSize['2xl'],
                  fontWeight: typography.fontWeight.bold,
                  color: colors.primary[600],
                }}
              >
                {profile.name.charAt(0).toUpperCase()}
              </div>

              {/* Name and Details */}
              <div>
                <h1
                  style={{
                    fontSize: typography.fontSize['2xl'],
                    fontWeight: typography.fontWeight.bold,
                    color: colors.text.primary,
                    margin: 0,
                    marginBottom: spacing[1],
                  }}
                >
                  {profile.name}
                </h1>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: spacing[2],
                    marginBottom: spacing[2],
                  }}
                >
                  <Icons.Phone size={16} color={colors.text.tertiary} />
                  <span style={{ fontSize: typography.fontSize.sm, color: colors.text.secondary }}>
                    {maskPhone(profile.phone)}
                  </span>
                </div>
                <div
                  style={{
                    display: 'inline-block',
                    padding: `${spacing[1]} ${spacing[3]}`,
                    backgroundColor: colors.primary[50],
                    borderRadius: borderRadius.full,
                    fontSize: typography.fontSize.sm,
                    fontWeight: typography.fontWeight.medium,
                    color: colors.primary[700],
                  }}
                >
                  {profile.user_type === 'buyer' ? t('profilePage.userType.buyer') : profile.user_type} - {profile.buyer_role === 'homeowner' ? t('profilePage.buyerRole.homeowner') : t('profilePage.buyerRole.contractor')}
                </div>
              </div>
            </div>

            {/* Edit Button */}
            <button
              onClick={() => setShowEditModal(true)}
              style={{
                padding: `${spacing[2]} ${spacing[4]}`,
                backgroundColor: colors.neutral[0],
                border: `1px solid ${colors.border.light}`,
                borderRadius: borderRadius.md,
                fontSize: typography.fontSize.sm,
                fontWeight: typography.fontWeight.medium,
                color: colors.text.primary,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: spacing[2],
              }}
            >
              <Icons.Edit2 size={16} />
              {t('profilePage.editProfile')}
            </button>
          </div>
        </section>

        {/* Account Details Section */}
        <section
          style={{
            backgroundColor: colors.neutral[0],
            borderRadius: borderRadius.lg,
            padding: spacing[6],
            marginBottom: spacing[4],
            boxShadow: shadows.sm,
          }}
        >
          <h2
            style={{
              fontSize: typography.fontSize.xl,
              fontWeight: typography.fontWeight.semibold,
              color: colors.text.primary,
              margin: 0,
              marginBottom: spacing[4],
            }}
          >
            {t('profilePage.sections.accountDetails.title')}
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[4] }}>
            <div>
              <div style={{ fontSize: typography.fontSize.sm, color: colors.text.tertiary, marginBottom: spacing[1] }}>
                {t('profilePage.sections.accountDetails.fullName')}
              </div>
              <div style={{ fontSize: typography.fontSize.base, color: colors.text.primary, fontWeight: typography.fontWeight.medium }}>
                {profile.name}
              </div>
            </div>

            <div>
              <div style={{ fontSize: typography.fontSize.sm, color: colors.text.tertiary, marginBottom: spacing[1] }}>
                {t('profilePage.sections.accountDetails.phoneNumber')}
              </div>
              <div style={{ fontSize: typography.fontSize.base, color: colors.text.primary, fontWeight: typography.fontWeight.medium }}>
                {profile.phone}
              </div>
            </div>

            <div>
              <div style={{ fontSize: typography.fontSize.sm, color: colors.text.tertiary, marginBottom: spacing[1] }}>
                {t('profilePage.sections.accountDetails.buyerRole')}
              </div>
              <div style={{ fontSize: typography.fontSize.base, color: colors.text.primary, fontWeight: typography.fontWeight.medium }}>
                {profile.buyer_role === 'homeowner' ? t('profilePage.buyerRole.homeowner') : t('profilePage.buyerRole.contractor')}
              </div>
            </div>

            <div>
              <div style={{ fontSize: typography.fontSize.sm, color: colors.text.tertiary, marginBottom: spacing[2] }}>
                {t('profilePage.sections.accountDetails.languagePreference')}
              </div>
              <div style={{ display: 'flex', gap: spacing[2] }}>
                <button
                  onClick={() => changeLanguage('ka')}
                  style={{
                    padding: `${spacing[2]} ${spacing[4]}`,
                    backgroundColor: profile.language === 'ka' ? colors.primary[600] : colors.neutral[100],
                    color: profile.language === 'ka' ? colors.neutral[0] : colors.text.secondary,
                    border: 'none',
                    borderRadius: borderRadius.full,
                    fontSize: typography.fontSize.sm,
                    fontWeight: typography.fontWeight.medium,
                    cursor: 'pointer',
                    transition: 'all 200ms ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: spacing[2],
                  }}
                  onMouseEnter={(e) => {
                    if (profile.language !== 'ka') {
                      e.currentTarget.style.backgroundColor = colors.neutral[200];
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (profile.language !== 'ka') {
                      e.currentTarget.style.backgroundColor = colors.neutral[100];
                    }
                  }}
                >
                  <Icons.Globe size={14} />
                  Georgian (ქართული)
                </button>
                <button
                  onClick={() => changeLanguage('en')}
                  style={{
                    padding: `${spacing[2]} ${spacing[4]}`,
                    backgroundColor: profile.language === 'en' ? colors.primary[600] : colors.neutral[100],
                    color: profile.language === 'en' ? colors.neutral[0] : colors.text.secondary,
                    border: 'none',
                    borderRadius: borderRadius.full,
                    fontSize: typography.fontSize.sm,
                    fontWeight: typography.fontWeight.medium,
                    cursor: 'pointer',
                    transition: 'all 200ms ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: spacing[2],
                  }}
                  onMouseEnter={(e) => {
                    if (profile.language !== 'en') {
                      e.currentTarget.style.backgroundColor = colors.neutral[200];
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (profile.language !== 'en') {
                      e.currentTarget.style.backgroundColor = colors.neutral[100];
                    }
                  }}
                >
                  <Icons.Globe size={14} />
                  English
                </button>
              </div>
            </div>

            <div>
              <div style={{ fontSize: typography.fontSize.sm, color: colors.text.tertiary, marginBottom: spacing[1] }}>
                {t('profilePage.sections.accountDetails.accountCreated')}
              </div>
              <div style={{ fontSize: typography.fontSize.base, color: colors.text.primary, fontWeight: typography.fontWeight.medium }}>
                {new Date(profile.created_at).toLocaleDateString(i18n.language === 'ka' ? 'ka-GE' : 'en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Active Projects Section */}
        <section
          style={{
            backgroundColor: colors.neutral[0],
            borderRadius: borderRadius.lg,
            padding: spacing[6],
            marginBottom: spacing[4],
            boxShadow: shadows.sm,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing[4] }}>
            <h2
              style={{
                fontSize: typography.fontSize.xl,
                fontWeight: typography.fontWeight.semibold,
                color: colors.text.primary,
                margin: 0,
              }}
            >
              {t('profilePage.sections.activeProjects.title')}
            </h2>
            <span
              style={{
                fontSize: typography.fontSize.lg,
                fontWeight: typography.fontWeight.bold,
                color: colors.primary[600],
              }}
            >
              {stats.active_projects}
            </span>
          </div>
          <button
            onClick={() => navigate('/projects')}
            style={{
              width: '100%',
              padding: spacing[3],
              backgroundColor: colors.neutral[0],
              border: `1px solid ${colors.border.light}`,
              borderRadius: borderRadius.md,
              fontSize: typography.fontSize.base,
              color: colors.text.primary,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span>{t('profilePage.sections.activeProjects.viewAll')}</span>
            <Icons.ChevronRight size={20} />
          </button>
        </section>

        {/* Order History Section */}
        <section
          style={{
            backgroundColor: colors.neutral[0],
            borderRadius: borderRadius.lg,
            padding: spacing[6],
            marginBottom: spacing[4],
            boxShadow: shadows.sm,
          }}
        >
          <h2
            style={{
              fontSize: typography.fontSize.xl,
              fontWeight: typography.fontWeight.semibold,
              color: colors.text.primary,
              margin: 0,
              marginBottom: spacing[4],
            }}
          >
            {t('profilePage.sections.orderHistory.title')}
          </h2>

          <div style={{ display: 'flex', gap: spacing[4], marginBottom: spacing[4] }}>
            <div style={{ flex: 1, textAlign: 'center', padding: spacing[4], backgroundColor: colors.primary[50], borderRadius: borderRadius.md }}>
              <div style={{ fontSize: typography.fontSize['2xl'], fontWeight: typography.fontWeight.bold, color: colors.primary[600] }}>
                {stats.active_orders}
              </div>
              <div style={{ fontSize: typography.fontSize.sm, color: colors.text.secondary }}>{t('profilePage.sections.orderHistory.activeOrders')}</div>
            </div>
            <div style={{ flex: 1, textAlign: 'center', padding: spacing[4], backgroundColor: colors.neutral[100], borderRadius: borderRadius.md }}>
              <div style={{ fontSize: typography.fontSize['2xl'], fontWeight: typography.fontWeight.bold, color: colors.text.primary }}>
                {stats.completed_orders}
              </div>
              <div style={{ fontSize: typography.fontSize.sm, color: colors.text.secondary }}>{t('profilePage.sections.orderHistory.completedOrders')}</div>
            </div>
          </div>

          <button
            onClick={() => navigate('/orders')}
            style={{
              width: '100%',
              padding: spacing[3],
              backgroundColor: colors.neutral[0],
              border: `1px solid ${colors.border.light}`,
              borderRadius: borderRadius.md,
              fontSize: typography.fontSize.base,
              color: colors.text.primary,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span>{t('profilePage.sections.orderHistory.viewFull')}</span>
            <Icons.ChevronRight size={20} />
          </button>
        </section>

        {/* Notification Preferences Section */}
        <section
          style={{
            backgroundColor: colors.neutral[0],
            borderRadius: borderRadius.lg,
            padding: spacing[6],
            marginBottom: spacing[4],
            boxShadow: shadows.sm,
          }}
        >
          <h2
            style={{
              fontSize: typography.fontSize.xl,
              fontWeight: typography.fontWeight.semibold,
              color: colors.text.primary,
              margin: 0,
              marginBottom: spacing[4],
            }}
          >
            {t('profilePage.sections.notifications.title')}
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[4] }}>
            {/* Global Push Notifications Toggle */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingBottom: spacing[4],
                borderBottom: `1px solid ${colors.border.light}`,
              }}
            >
              <div>
                <div style={{ fontSize: typography.fontSize.base, fontWeight: typography.fontWeight.medium, color: colors.text.primary }}>
                  {t('profilePage.sections.notifications.pushNotifications')}
                </div>
                <div style={{ fontSize: typography.fontSize.sm, color: colors.text.tertiary }}>
                  {t('profilePage.sections.notifications.pushDescription')}
                </div>
              </div>
              <button
                onClick={() => updateGlobalNotificationSetting('push_enabled', !notification_preferences.push_enabled)}
                style={{
                  width: '50px',
                  height: '28px',
                  borderRadius: '14px',
                  backgroundColor: notification_preferences.push_enabled ? colors.primary[600] : colors.neutral[300],
                  border: 'none',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'background-color 0.2s',
                }}
              >
                <div
                  style={{
                    width: '22px',
                    height: '22px',
                    borderRadius: '50%',
                    backgroundColor: colors.neutral[0],
                    position: 'absolute',
                    top: '3px',
                    left: notification_preferences.push_enabled ? '25px' : '3px',
                    transition: 'left 0.2s',
                  }}
                />
              </button>
            </div>

            {/* Global SMS Notifications Toggle */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingBottom: spacing[4],
                borderBottom: `1px solid ${colors.border.light}`,
              }}
            >
              <div>
                <div style={{ fontSize: typography.fontSize.base, fontWeight: typography.fontWeight.medium, color: colors.text.primary }}>
                  {t('profilePage.sections.notifications.smsNotifications')}
                </div>
                <div style={{ fontSize: typography.fontSize.sm, color: colors.text.tertiary }}>
                  {t('profilePage.sections.notifications.smsDescription')}
                </div>
              </div>
              <button
                onClick={() => updateGlobalNotificationSetting('sms_enabled', !notification_preferences.sms_enabled)}
                style={{
                  width: '50px',
                  height: '28px',
                  borderRadius: '14px',
                  backgroundColor: notification_preferences.sms_enabled ? colors.primary[600] : colors.neutral[300],
                  border: 'none',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'background-color 0.2s',
                }}
              >
                <div
                  style={{
                    width: '22px',
                    height: '22px',
                    borderRadius: '50%',
                    backgroundColor: colors.neutral[0],
                    position: 'absolute',
                    top: '3px',
                    left: notification_preferences.sms_enabled ? '25px' : '3px',
                    transition: 'left 0.2s',
                  }}
                />
              </button>
            </div>

            {/* Quiet Hours */}
            <div
              style={{
                paddingBottom: spacing[4],
                borderBottom: `2px solid ${colors.border.light}`,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing[3] }}>
                <div>
                  <div style={{ fontSize: typography.fontSize.base, fontWeight: typography.fontWeight.medium, color: colors.text.primary }}>
                    {t('profilePage.sections.notifications.quietHours')}
                  </div>
                  <div style={{ fontSize: typography.fontSize.sm, color: colors.text.tertiary }}>
                    {t('profilePage.sections.notifications.quietHoursDescription')}
                  </div>
                </div>
                <button
                  onClick={() => {
                    // Toggle quiet hours (backend doesn't support this yet, but we can add UI)
                    setProfileData((prev) =>
                      prev
                        ? {
                            ...prev,
                            notification_preferences: {
                              ...prev.notification_preferences,
                              quiet_hours_enabled: !prev.notification_preferences.quiet_hours_enabled,
                            },
                          }
                        : null
                    );
                  }}
                  style={{
                    width: '50px',
                    height: '28px',
                    borderRadius: '14px',
                    backgroundColor: notification_preferences.quiet_hours_enabled ? colors.primary[600] : colors.neutral[300],
                    border: 'none',
                    cursor: 'pointer',
                    position: 'relative',
                    transition: 'background-color 0.2s',
                  }}
                >
                  <div
                    style={{
                      width: '22px',
                      height: '22px',
                      borderRadius: '50%',
                      backgroundColor: colors.neutral[0],
                      position: 'absolute',
                      top: '3px',
                      left: notification_preferences.quiet_hours_enabled ? '25px' : '3px',
                      transition: 'left 0.2s',
                    }}
                  />
                </button>
              </div>

              {notification_preferences.quiet_hours_enabled && (
                <div style={{ display: 'flex', gap: spacing[3], marginTop: spacing[3] }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: typography.fontSize.sm, color: colors.text.secondary, display: 'block', marginBottom: spacing[1] }}>
                      {t('profilePage.sections.notifications.startTime')}
                    </label>
                    <input
                      type="time"
                      value={notification_preferences.quiet_hours_start}
                      onChange={(e) => {
                        setProfileData((prev) =>
                          prev
                            ? {
                                ...prev,
                                notification_preferences: {
                                  ...prev.notification_preferences,
                                  quiet_hours_start: e.target.value,
                                },
                              }
                            : null
                        );
                      }}
                      style={{
                        width: '100%',
                        padding: spacing[2],
                        fontSize: typography.fontSize.base,
                        border: `1px solid ${colors.border.light}`,
                        borderRadius: borderRadius.md,
                      }}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: typography.fontSize.sm, color: colors.text.secondary, display: 'block', marginBottom: spacing[1] }}>
                      {t('profilePage.sections.notifications.endTime')}
                    </label>
                    <input
                      type="time"
                      value={notification_preferences.quiet_hours_end}
                      onChange={(e) => {
                        setProfileData((prev) =>
                          prev
                            ? {
                                ...prev,
                                notification_preferences: {
                                  ...prev.notification_preferences,
                                  quiet_hours_end: e.target.value,
                                },
                              }
                            : null
                        );
                      }}
                      style={{
                        width: '100%',
                        padding: spacing[2],
                        fontSize: typography.fontSize.base,
                        border: `1px solid ${colors.border.light}`,
                        borderRadius: borderRadius.md,
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Category Heading */}
            <div style={{ marginTop: spacing[2] }}>
              <h3 style={{ fontSize: typography.fontSize.base, fontWeight: typography.fontWeight.semibold, color: colors.text.secondary, margin: 0, marginBottom: spacing[2] }}>
                {t('profilePage.sections.notifications.categoriesTitle')}
              </h3>
            </div>

            {/* RFQ & Offers */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingBottom: spacing[4],
                borderBottom: `1px solid ${colors.border.light}`,
              }}
            >
              <div>
                <div style={{ fontSize: typography.fontSize.base, fontWeight: typography.fontWeight.medium, color: colors.text.primary }}>
                  {t('profilePage.sections.notifications.categories.rfqOffers.title')}
                </div>
                <div style={{ fontSize: typography.fontSize.sm, color: colors.text.tertiary }}>
                  {t('profilePage.sections.notifications.categories.rfqOffers.description')}
                </div>
              </div>
              <button
                onClick={() => updateNotificationCategory('rfq_offers', !notification_preferences.categories.rfq_offers.enabled)}
                style={{
                  width: '50px',
                  height: '28px',
                  borderRadius: '14px',
                  backgroundColor: notification_preferences.categories.rfq_offers.enabled ? colors.primary[600] : colors.neutral[300],
                  border: 'none',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'background-color 0.2s',
                }}
              >
                <div
                  style={{
                    width: '22px',
                    height: '22px',
                    borderRadius: '50%',
                    backgroundColor: colors.neutral[0],
                    position: 'absolute',
                    top: '3px',
                    left: notification_preferences.categories.rfq_offers.enabled ? '25px' : '3px',
                    transition: 'left 0.2s',
                  }}
                />
              </button>
            </div>

            {/* Delivery Updates */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingBottom: spacing[4],
                borderBottom: `1px solid ${colors.border.light}`,
              }}
            >
              <div>
                <div style={{ fontSize: typography.fontSize.base, fontWeight: typography.fontWeight.medium, color: colors.text.primary }}>
                  {t('profilePage.sections.notifications.categories.deliveryUpdates.title')}
                </div>
                <div style={{ fontSize: typography.fontSize.sm, color: colors.text.tertiary }}>
                  {t('profilePage.sections.notifications.categories.deliveryUpdates.description')}
                </div>
              </div>
              <button
                onClick={() => updateNotificationCategory('delivery_updates', !notification_preferences.categories.delivery_updates.enabled)}
                style={{
                  width: '50px',
                  height: '28px',
                  borderRadius: '14px',
                  backgroundColor: notification_preferences.categories.delivery_updates.enabled ? colors.primary[600] : colors.neutral[300],
                  border: 'none',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'background-color 0.2s',
                }}
              >
                <div
                  style={{
                    width: '22px',
                    height: '22px',
                    borderRadius: '50%',
                    backgroundColor: colors.neutral[0],
                    position: 'absolute',
                    top: '3px',
                    left: notification_preferences.categories.delivery_updates.enabled ? '25px' : '3px',
                    transition: 'left 0.2s',
                  }}
                />
              </button>
            </div>

            {/* Rental Handovers */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingBottom: spacing[4],
                borderBottom: `1px solid ${colors.border.light}`,
              }}
            >
              <div>
                <div style={{ fontSize: typography.fontSize.base, fontWeight: typography.fontWeight.medium, color: colors.text.primary }}>
                  {t('profilePage.sections.notifications.categories.rentalHandovers.title')}
                </div>
                <div style={{ fontSize: typography.fontSize.sm, color: colors.text.tertiary }}>
                  {t('profilePage.sections.notifications.categories.rentalHandovers.description')}
                </div>
              </div>
              <button
                onClick={() => updateNotificationCategory('rental_handovers', !notification_preferences.categories.rental_handovers.enabled)}
                style={{
                  width: '50px',
                  height: '28px',
                  borderRadius: '14px',
                  backgroundColor: notification_preferences.categories.rental_handovers.enabled ? colors.primary[600] : colors.neutral[300],
                  border: 'none',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'background-color 0.2s',
                }}
              >
                <div
                  style={{
                    width: '22px',
                    height: '22px',
                    borderRadius: '50%',
                    backgroundColor: colors.neutral[0],
                    position: 'absolute',
                    top: '3px',
                    left: notification_preferences.categories.rental_handovers.enabled ? '25px' : '3px',
                    transition: 'left 0.2s',
                  }}
                />
              </button>
            </div>

            {/* Tips & Suggestions */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ fontSize: typography.fontSize.base, fontWeight: typography.fontWeight.medium, color: colors.text.primary }}>
                  {t('profilePage.sections.notifications.categories.tipsSuggestions.title')}
                </div>
                <div style={{ fontSize: typography.fontSize.sm, color: colors.text.tertiary }}>
                  {t('profilePage.sections.notifications.categories.tipsSuggestions.description')}
                </div>
              </div>
              <button
                onClick={() => updateNotificationCategory('tips_suggestions', !notification_preferences.categories.tips_suggestions.enabled)}
                style={{
                  width: '50px',
                  height: '28px',
                  borderRadius: '14px',
                  backgroundColor: notification_preferences.categories.tips_suggestions.enabled ? colors.primary[600] : colors.neutral[300],
                  border: 'none',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'background-color 0.2s',
                }}
              >
                <div
                  style={{
                    width: '22px',
                    height: '22px',
                    borderRadius: '50%',
                    backgroundColor: colors.neutral[0],
                    position: 'absolute',
                    top: '3px',
                    left: notification_preferences.categories.tips_suggestions.enabled ? '25px' : '3px',
                    transition: 'left 0.2s',
                  }}
                />
              </button>
            </div>
          </div>
        </section>

        {/* Help & Legal Section */}
        <section
          style={{
            backgroundColor: colors.neutral[0],
            borderRadius: borderRadius.lg,
            padding: spacing[6],
            marginBottom: spacing[4],
            boxShadow: shadows.sm,
          }}
        >
          <h2
            style={{
              fontSize: typography.fontSize.xl,
              fontWeight: typography.fontWeight.semibold,
              color: colors.text.primary,
              margin: 0,
              marginBottom: spacing[4],
            }}
          >
            {t('profilePage.sections.helpLegal.title')}
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[2] }}>
            <button
              onClick={() => navigate('/faqs')}
              style={{
                width: '100%',
                padding: spacing[3],
                backgroundColor: 'transparent',
                border: 'none',
                borderRadius: borderRadius.md,
                fontSize: typography.fontSize.base,
                color: colors.text.primary,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                textAlign: 'left',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: spacing[3] }}>
                <Icons.HelpCircle size={20} color={colors.text.tertiary} />
                <span>{t('profilePage.sections.helpLegal.faqs')}</span>
              </div>
              <Icons.ChevronRight size={20} color={colors.text.tertiary} />
            </button>

            <button
              onClick={() => navigate('/terms')}
              style={{
                width: '100%',
                padding: spacing[3],
                backgroundColor: 'transparent',
                border: 'none',
                borderRadius: borderRadius.md,
                fontSize: typography.fontSize.base,
                color: colors.text.primary,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                textAlign: 'left',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: spacing[3] }}>
                <Icons.FileText size={20} color={colors.text.tertiary} />
                <span>{t('profilePage.sections.helpLegal.terms')}</span>
              </div>
              <Icons.ChevronRight size={20} color={colors.text.tertiary} />
            </button>

            <button
              onClick={() => navigate('/privacy')}
              style={{
                width: '100%',
                padding: spacing[3],
                backgroundColor: 'transparent',
                border: 'none',
                borderRadius: borderRadius.md,
                fontSize: typography.fontSize.base,
                color: colors.text.primary,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                textAlign: 'left',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: spacing[3] }}>
                <Icons.Shield size={20} color={colors.text.tertiary} />
                <span>{t('profilePage.sections.helpLegal.privacy')}</span>
              </div>
              <Icons.ChevronRight size={20} color={colors.text.tertiary} />
            </button>

            <button
              onClick={() => navigate('/contact')}
              style={{
                width: '100%',
                padding: spacing[3],
                backgroundColor: 'transparent',
                border: 'none',
                borderRadius: borderRadius.md,
                fontSize: typography.fontSize.base,
                color: colors.text.primary,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                textAlign: 'left',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: spacing[3] }}>
                <Icons.MessageCircle size={20} color={colors.text.tertiary} />
                <span>{t('profilePage.sections.helpLegal.contact')}</span>
              </div>
              <Icons.ChevronRight size={20} color={colors.text.tertiary} />
            </button>
          </div>
        </section>

        {/* Danger Zone Section */}
        <section
          style={{
            backgroundColor: colors.neutral[0],
            borderRadius: borderRadius.lg,
            padding: spacing[6],
            marginBottom: spacing[4],
            boxShadow: shadows.sm,
            border: `1px solid ${colors.error}`,
          }}
        >
          <h2
            style={{
              fontSize: typography.fontSize.xl,
              fontWeight: typography.fontWeight.semibold,
              color: colors.error,
              margin: 0,
              marginBottom: spacing[2],
            }}
          >
            {t('profilePage.sections.dangerZone.title')}
          </h2>
          <p
            style={{
              fontSize: typography.fontSize.sm,
              color: colors.text.secondary,
              margin: 0,
              marginBottom: spacing[4],
            }}
          >
            {t('profilePage.sections.dangerZone.description')}
          </p>
          <button
            onClick={() => setShowDeleteModal(true)}
            style={{
              padding: `${spacing[3]} ${spacing[4]}`,
              backgroundColor: colors.neutral[0],
              border: `2px solid ${colors.error}`,
              borderRadius: borderRadius.md,
              fontSize: typography.fontSize.base,
              fontWeight: typography.fontWeight.medium,
              color: colors.error,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: spacing[2],
            }}
          >
            <Icons.Trash2 size={20} />
            {t('profilePage.sections.dangerZone.deleteAccount')}
          </button>
        </section>
      </main>

      {/* Modals */}
      {showEditModal && (
        <EditProfileModal
          profile={profile}
          onClose={() => setShowEditModal(false)}
          onSuccess={() => {
            setShowEditModal(false);
            loadProfile();
          }}
        />
      )}

      {showDeleteModal && (
        <DeleteAccountModal
          phone={profile.phone}
          onClose={() => setShowDeleteModal(false)}
          onSuccess={() => {
            // Logout and redirect to home
            localStorage.removeItem('buildapp_auth_token');
            navigate('/');
          }}
        />
      )}
    </div>
  );
};
