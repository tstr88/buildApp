/**
 * NotificationPreferences Page
 * Dedicated page for managing all notification preferences
 */

import { NotificationPreferences } from '../components/profile/NotificationPreferences';

export default function NotificationPreferencesPage() {
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">
            Notification Preferences
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Manage how you receive notifications for different events
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <NotificationPreferences />
      </div>
    </div>
  );
}
