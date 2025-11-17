/**
 * Notification Service
 * Handles push notifications, SMS, and email
 * Integrations: Twilio (SMS), Firebase Cloud Messaging (Push), SendGrid (Email)
 */

import { ServiceUnavailableError } from '../utils/errors/CustomErrors';
import { Pool } from 'pg';
import pool from '../config/database';

/**
 * Notification types
 */
export enum NotificationType {
  SMS = 'sms',
  PUSH = 'push',
  EMAIL = 'email',
  IN_APP = 'in_app',
}

/**
 * Notification payload
 */
export interface NotificationPayload {
  userId: string;
  type: NotificationType;
  recipient: string; // Phone number, device token, or email
  message: string;
  title?: string;
  data?: Record<string, unknown>;
  deepLink?: string;
  notificationType?: string; // DB notification_type enum value
  isCritical?: boolean; // Override quiet hours
}

/**
 * Notification preferences from database
 */
interface NotificationPreferences {
  pushEnabled: boolean;
  smsEnabled: boolean;
  emailEnabled: boolean;
  inAppEnabled: boolean;
  quietHoursEnabled: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
}

/**
 * Device token from database
 */
interface DeviceToken {
  token: string;
  device_type: 'web' | 'ios' | 'android';
}

/**
 * Rate limiting tracker for SMS
 */
interface SMSRateLimit {
  count: number;
  resetAt: Date;
}

/**
 * Notification service class
 */
export class NotificationService {
  private isEnabled: boolean;
  private twilioClient: any; // Twilio client (optional dependency)
  private fcmAdmin: any; // Firebase Admin (optional dependency)
  private sendgridClient: any; // SendGrid client (optional dependency)
  private smsRateLimits: Map<string, SMSRateLimit> = new Map();
  private readonly MAX_SMS_PER_DAY = 3; // Max SMS per user per day (except critical)
  private dbPool: Pool;

  constructor() {
    this.isEnabled = process.env.NOTIFICATIONS_ENABLED === 'true';
    this.dbPool = pool;
    this.initializeClients();
  }

  /**
   * Initialize external service clients (Twilio, FCM, SendGrid)
   */
  private initializeClients() {
    // Initialize Twilio for SMS
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
      try {
        const twilio = require('twilio');
        this.twilioClient = twilio(
          process.env.TWILIO_ACCOUNT_SID,
          process.env.TWILIO_AUTH_TOKEN
        );
        console.log('[NotificationService] Twilio SMS initialized');
      } catch (error) {
        console.warn('[NotificationService] Twilio not available:', error);
      }
    }

    // Initialize Firebase Cloud Messaging for Push
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      try {
        const admin = require('firebase-admin');
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

        if (!admin.apps.length) {
          admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
          });
        }
        this.fcmAdmin = admin;
        console.log('[NotificationService] Firebase Cloud Messaging initialized');
      } catch (error) {
        console.warn('[NotificationService] FCM not available:', error);
      }
    }

    // Initialize SendGrid for Email
    if (process.env.SENDGRID_API_KEY) {
      try {
        const sgMail = require('@sendgrid/mail');
        sgMail.setApiKey(process.env.SENDGRID_API_KEY);
        this.sendgridClient = sgMail;
        console.log('[NotificationService] SendGrid email initialized');
      } catch (error) {
        console.warn('[NotificationService] SendGrid not available:', error);
      }
    }
  }

  /**
   * Get user's notification preferences
   */
  private async getUserPreferences(userId: string, notificationType: string): Promise<NotificationPreferences | null> {
    try {
      const result = await this.dbPool.query(
        `SELECT push_enabled, sms_enabled, email_enabled, in_app_enabled,
                quiet_hours_enabled, quiet_hours_start, quiet_hours_end
         FROM notification_preferences
         WHERE user_id = $1 AND notification_type = $2`,
        [userId, notificationType]
      );

      if (result.rows.length === 0) {
        return null; // Will use defaults
      }

      const row = result.rows[0];
      return {
        pushEnabled: row.push_enabled,
        smsEnabled: row.sms_enabled,
        emailEnabled: row.email_enabled,
        inAppEnabled: row.in_app_enabled,
        quietHoursEnabled: row.quiet_hours_enabled,
        quietHoursStart: row.quiet_hours_start,
        quietHoursEnd: row.quiet_hours_end,
      };
    } catch (error) {
      console.error('[NotificationService] Error fetching preferences:', error);
      return null;
    }
  }

  /**
   * Check if current time is in user's quiet hours
   */
  private isInQuietHours(prefs: NotificationPreferences | null): boolean {
    if (!prefs || !prefs.quietHoursEnabled) {
      return false;
    }

    const now = new Date();
    const currentTime = now.toTimeString().split(' ')[0]; // HH:MM:SS format

    const start = prefs.quietHoursStart;
    const end = prefs.quietHoursEnd;

    // Handle quiet hours spanning midnight (e.g., 22:00 to 08:00)
    if (start > end) {
      return currentTime >= start || currentTime < end;
    } else {
      return currentTime >= start && currentTime < end;
    }
  }

  /**
   * Check SMS rate limit for user
   */
  private checkSMSRateLimit(userId: string, isCritical: boolean): boolean {
    if (isCritical) {
      return true; // Critical SMS bypass rate limits
    }

    const limit = this.smsRateLimits.get(userId);
    const now = new Date();

    if (!limit || now > limit.resetAt) {
      // Reset limit (new day)
      this.smsRateLimits.set(userId, {
        count: 1,
        resetAt: new Date(now.getTime() + 24 * 60 * 60 * 1000), // 24h from now
      });
      return true;
    }

    if (limit.count >= this.MAX_SMS_PER_DAY) {
      console.warn(`[NotificationService] SMS rate limit exceeded for user ${userId}`);
      return false;
    }

    limit.count++;
    return true;
  }

  /**
   * Get user's device tokens for push notifications
   */
  private async getUserDeviceTokens(userId: string): Promise<DeviceToken[]> {
    try {
      const result = await this.dbPool.query(
        'SELECT token, device_type FROM device_tokens WHERE user_id = $1 ORDER BY last_used_at DESC',
        [userId]
      );
      return result.rows;
    } catch (error) {
      console.error('[NotificationService] Error fetching device tokens:', error);
      return [];
    }
  }

  /**
   * Send SMS notification via Twilio
   */
  async sendSMS(phone: string, message: string, userId?: string, isCritical: boolean = false): Promise<boolean> {
    console.log(`[NotificationService] Sending SMS to ${phone}: ${message}`);

    if (!this.isEnabled) {
      console.log('[NotificationService] SMS notifications disabled, skipping');
      return true;
    }

    // Check rate limit
    if (userId && !this.checkSMSRateLimit(userId, isCritical)) {
      console.log('[NotificationService] SMS rate limit exceeded, skipping');
      return false;
    }

    // Use Twilio if available
    if (this.twilioClient && process.env.TWILIO_PHONE_NUMBER) {
      try {
        await this.twilioClient.messages.create({
          body: `${message} - buildApp`,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: phone,
        });
        console.log(`[NotificationService] SMS sent via Twilio to ${phone}`);
        return true;
      } catch (error) {
        console.error('[NotificationService] Twilio SMS failed:', error);
        return false;
      }
    }

    // Fallback: log only (MVP mode)
    console.log(`[NotificationService] SMS would be sent: ${phone} - ${message}`);
    return true;
  }

  /**
   * Send push notification via Firebase Cloud Messaging
   */
  async sendPushNotification(
    deviceToken: string,
    title: string,
    body: string,
    data?: Record<string, unknown>
  ): Promise<boolean> {
    console.log(`[NotificationService] Sending push to ${deviceToken}: ${title} - ${body}`);

    if (!this.isEnabled) {
      console.log('[NotificationService] Push notifications disabled, skipping');
      return true;
    }

    // Use FCM if available
    if (this.fcmAdmin) {
      try {
        const message = {
          notification: {
            title,
            body,
          },
          data: data ? this.sanitizeDataForFCM(data) : {},
          token: deviceToken,
        };

        await this.fcmAdmin.messaging().send(message);
        console.log(`[NotificationService] Push sent via FCM to ${deviceToken}`);
        return true;
      } catch (error) {
        console.error('[NotificationService] FCM push failed:', error);
        return false;
      }
    }

    // Fallback: log only (MVP mode)
    console.log(`[NotificationService] Push would be sent:`, { deviceToken, title, body, data });
    return true;
  }

  /**
   * Sanitize data object for FCM (all values must be strings)
   */
  private sanitizeDataForFCM(data: Record<string, unknown>): Record<string, string> {
    const sanitized: Record<string, string> = {};
    for (const [key, value] of Object.entries(data)) {
      sanitized[key] = typeof value === 'string' ? value : JSON.stringify(value);
    }
    return sanitized;
  }

  /**
   * Send push notifications to all user's devices
   */
  async sendPushToUser(userId: string, title: string, body: string, data?: Record<string, unknown>): Promise<boolean> {
    const devices = await this.getUserDeviceTokens(userId);

    if (devices.length === 0) {
      console.log(`[NotificationService] No device tokens found for user ${userId}`);
      return false;
    }

    const results = await Promise.allSettled(
      devices.map(device => this.sendPushNotification(device.token, title, body, data))
    );

    const successCount = results.filter(r => r.status === 'fulfilled' && r.value).length;
    console.log(`[NotificationService] Push sent to ${successCount}/${devices.length} devices for user ${userId}`);

    return successCount > 0;
  }

  /**
   * Send email notification via SendGrid
   */
  async sendEmail(email: string, subject: string, body: string): Promise<boolean> {
    console.log(`[NotificationService] Sending email to ${email}: ${subject}`);

    if (!this.isEnabled) {
      console.log('[NotificationService] Email notifications disabled, skipping');
      return true;
    }

    // Use SendGrid if available
    if (this.sendgridClient && process.env.SENDGRID_FROM_EMAIL) {
      try {
        await this.sendgridClient.send({
          to: email,
          from: process.env.SENDGRID_FROM_EMAIL,
          subject,
          html: body,
        });
        console.log(`[NotificationService] Email sent via SendGrid to ${email}`);
        return true;
      } catch (error) {
        console.error('[NotificationService] SendGrid email failed:', error);
        return false;
      }
    }

    // Fallback: log only (MVP mode)
    console.log(`[NotificationService] Email would be sent: ${email} - ${subject}`);
    return true;
  }

  /**
   * Send notification through appropriate channel(s) based on user preferences
   */
  async send(payload: NotificationPayload): Promise<boolean> {
    try {
      const {
        userId,
        type,
        recipient,
        message,
        title,
        data,
        deepLink,
        notificationType,
        isCritical = false,
      } = payload;

      // Get user preferences
      const prefs = notificationType
        ? await this.getUserPreferences(userId, notificationType)
        : null;

      // Check quiet hours (unless critical)
      if (!isCritical && this.isInQuietHours(prefs)) {
        console.log(`[NotificationService] Skipping notification (quiet hours) for user ${userId}`);
        return false;
      }

      // Check if this channel is enabled for the user
      if (prefs) {
        if (type === NotificationType.PUSH && !prefs.pushEnabled) {
          console.log(`[NotificationService] Push disabled for user ${userId}, skipping`);
          return false;
        }
        if (type === NotificationType.SMS && !prefs.smsEnabled) {
          console.log(`[NotificationService] SMS disabled for user ${userId}, skipping`);
          return false;
        }
        if (type === NotificationType.EMAIL && !prefs.emailEnabled) {
          console.log(`[NotificationService] Email disabled for user ${userId}, skipping`);
          return false;
        }
      }

      // Send via appropriate channel
      switch (type) {
        case NotificationType.SMS:
          return await this.sendSMS(recipient, message, userId, isCritical);

        case NotificationType.PUSH:
          return await this.sendPushToUser(userId, title || 'buildApp', message, {
            ...data,
            deepLink,
          });

        case NotificationType.EMAIL:
          return await this.sendEmail(recipient, title || 'buildApp Notification', message);

        case NotificationType.IN_APP:
          // In-app notifications are handled by database triggers
          return true;

        default:
          console.error(`[NotificationService] Unknown notification type: ${type}`);
          return false;
      }
    } catch (error) {
      console.error('[NotificationService] Error sending notification:', error);
      throw new ServiceUnavailableError(
        'Failed to send notification',
        { error: error instanceof Error ? error.message : String(error) }
      );
    }
  }

  /**
   * Send multi-channel notification (push + SMS for critical events)
   */
  async sendMultiChannel(
    userId: string,
    phone: string,
    title: string,
    message: string,
    options: {
      notificationType?: string;
      deepLink?: string;
      data?: Record<string, unknown>;
      includeSMS?: boolean;
      isCritical?: boolean;
    } = {}
  ): Promise<{ push: boolean; sms: boolean }> {
    const { notificationType, deepLink, data, includeSMS = false, isCritical = false } = options;

    // Send push notification
    const pushResult = await this.send({
      userId,
      type: NotificationType.PUSH,
      recipient: '', // Not used for push (uses device tokens)
      title,
      message,
      deepLink,
      data,
      notificationType,
      isCritical,
    });

    // Send SMS if requested
    let smsResult = false;
    if (includeSMS) {
      smsResult = await this.send({
        userId,
        type: NotificationType.SMS,
        recipient: phone,
        message: `${title}: ${message}`,
        notificationType,
        isCritical,
      });
    }

    return { push: pushResult, sms: smsResult };
  }

  /**
   * Send bulk notifications
   */
  async sendBulk(payloads: NotificationPayload[]): Promise<boolean[]> {
    const results = await Promise.allSettled(
      payloads.map(payload => this.send(payload))
    );

    return results.map(result => result.status === 'fulfilled' && result.value);
  }

  /**
   * Queue notification for later delivery
   */
  async queueNotification(payload: NotificationPayload, scheduledAt?: Date): Promise<void> {
    console.log(`[NotificationService] Queuing notification for ${scheduledAt || 'immediate delivery'}`);

    // TODO: Integrate with job queue (Bull, BullMQ, etc.)
    // For now, send immediately if no schedule, otherwise log
    if (!scheduledAt || scheduledAt <= new Date()) {
      await this.send(payload);
    } else {
      console.log(`[NotificationService] Scheduled notification stored:`, { payload, scheduledAt });
      // In production, add to queue with delay
    }
  }

  /**
   * Register device token for push notifications
   */
  async registerDeviceToken(
    userId: string,
    token: string,
    deviceType: 'web' | 'ios' | 'android',
    deviceName?: string
  ): Promise<boolean> {
    try {
      await this.dbPool.query(
        `INSERT INTO device_tokens (user_id, token, device_type, device_name, last_used_at)
         VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
         ON CONFLICT (user_id, token)
         DO UPDATE SET last_used_at = CURRENT_TIMESTAMP, device_name = COALESCE($4, device_tokens.device_name)`,
        [userId, token, deviceType, deviceName]
      );
      console.log(`[NotificationService] Device token registered for user ${userId}`);
      return true;
    } catch (error) {
      console.error('[NotificationService] Error registering device token:', error);
      return false;
    }
  }

  /**
   * Unregister device token
   */
  async unregisterDeviceToken(userId: string, token: string): Promise<boolean> {
    try {
      await this.dbPool.query(
        'DELETE FROM device_tokens WHERE user_id = $1 AND token = $2',
        [userId, token]
      );
      console.log(`[NotificationService] Device token unregistered for user ${userId}`);
      return true;
    } catch (error) {
      console.error('[NotificationService] Error unregistering device token:', error);
      return false;
    }
  }
}

// Export singleton instance
export default new NotificationService();
