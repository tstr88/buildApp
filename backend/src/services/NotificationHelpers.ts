/**
 * Notification Helper Functions
 * Easy-to-use functions for creating notifications with proper templates
 */

import pool from '../config/database';
import { NotificationTemplates, NotificationData } from './NotificationTemplates';
import { NotificationService, NotificationType } from './NotificationService';

const notificationService = new NotificationService();

interface CreateNotificationParams {
  userId: string;
  notificationType: string;
  data: NotificationData;
  locale?: string;
  forceSend?: boolean;
}

/**
 * Create a notification with proper template and send via appropriate channels
 */
export async function createNotification(params: CreateNotificationParams): Promise<void> {
  const { userId, notificationType, data, locale = 'ka', forceSend = false } = params;

  try {
    // Generate notification content from template
    const content = NotificationTemplates.generate(notificationType, data, locale);

    // Get user's phone number
    const userResult = await pool.query(
      'SELECT phone FROM users WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      console.error('[NotificationHelpers] User not found:', userId);
      return;
    }

    const phone = userResult.rows[0].phone;

    // Create notification in database
    const title = locale === 'en' ? content.titleEn : content.titleKa;
    const message = locale === 'en' ? content.messageEn : content.messageKa;

    await pool.query(
      `SELECT create_notification($1, $2, $3, $4, $5, $6)`,
      [
        userId,
        notificationType,
        title,
        message,
        content.deepLink || null,
        forceSend,
      ]
    );

    // Send via push (and SMS if critical)
    if (content.includeSMS && content.isCritical) {
      await notificationService.sendMultiChannel(
        userId,
        phone,
        title,
        message,
        {
          notificationType,
          deepLink: content.deepLink,
          includeSMS: true,
          isCritical: content.isCritical,
        }
      );
    } else {
      // Just send push notification
      await notificationService.send({
        userId,
        type: NotificationType.PUSH,
        recipient: '',
        title,
        message,
        deepLink: content.deepLink,
        notificationType,
        isCritical: content.isCritical,
      });
    }
  } catch (error) {
    console.error('[NotificationHelpers] Failed to create notification:', error);
  }
}

// ===== BUYER NOTIFICATION HELPERS =====

export async function notifyOfferReceived(
  buyerId: string,
  supplierName: string,
  rfqId: string,
  offerId: string
): Promise<void> {
  await createNotification({
    userId: buyerId,
    notificationType: 'offer_received',
    data: {
      supplierName,
      rfqId,
      offerId,
    },
  });
}

export async function notifyOfferExpiring(
  buyerId: string,
  supplierName: string,
  offerId: string,
  expiresInHours: number
): Promise<void> {
  await createNotification({
    userId: buyerId,
    notificationType: 'offer_expiring',
    data: {
      supplierName,
      offerId,
      expiresInHours,
    },
  });
}

export async function notifyDeliveryApproaching(
  buyerId: string,
  orderId: string,
  deliveryTime: string
): Promise<void> {
  await createNotification({
    userId: buyerId,
    notificationType: 'delivery_approaching',
    data: {
      orderId,
      deliveryTime,
    },
    forceSend: true, // Critical - bypass quiet hours
  });
}

export async function notifyDeliveryCompleted(
  buyerId: string,
  orderId: string
): Promise<void> {
  await createNotification({
    userId: buyerId,
    notificationType: 'delivery_completed',
    data: {
      orderId,
    },
    forceSend: true, // Critical - bypass quiet hours
  });
}

export async function notifyOrderAutoCompleted(
  buyerId: string,
  orderId: string
): Promise<void> {
  await createNotification({
    userId: buyerId,
    notificationType: 'order_auto_completed',
    data: {
      orderId,
    },
  });
}

export async function notifyRentalHandoverDue(
  buyerId: string,
  rentalId: string,
  orderId: string
): Promise<void> {
  await createNotification({
    userId: buyerId,
    notificationType: 'rental_handover_due',
    data: {
      rentalId,
      orderId,
    },
    forceSend: true, // Critical - bypass quiet hours
  });
}

export async function notifyRentalReturnReminder(
  buyerId: string,
  rentalId: string,
  deliveryTime: string
): Promise<void> {
  await createNotification({
    userId: buyerId,
    notificationType: 'rental_return_reminder',
    data: {
      rentalId,
      deliveryTime,
    },
  });
}

export async function notifyWindowConfirmed(
  buyerId: string,
  orderId: string,
  deliveryDate: string
): Promise<void> {
  await createNotification({
    userId: buyerId,
    notificationType: 'window_confirmed',
    data: {
      orderId,
      deliveryDate,
    },
  });
}

// ===== SUPPLIER NOTIFICATION HELPERS =====

export async function notifyRfqReceived(
  supplierId: string,
  buyerType: string,
  location: string,
  rfqId: string
): Promise<void> {
  await createNotification({
    userId: supplierId,
    notificationType: 'rfq_received',
    data: {
      buyerType,
      location,
      rfqId,
    },
  });
}

export async function notifyOfferAccepted(
  supplierId: string,
  buyerName: string,
  offerId: string,
  orderId: string
): Promise<void> {
  await createNotification({
    userId: supplierId,
    notificationType: 'offer_accepted',
    data: {
      buyerName,
      offerId,
      orderId,
    },
    forceSend: true, // Critical - bypass quiet hours
  });
}

export async function notifyDirectOrderPlaced(
  supplierId: string,
  buyerName: string,
  orderId: string
): Promise<void> {
  await createNotification({
    userId: supplierId,
    notificationType: 'direct_order_placed',
    data: {
      buyerName,
      orderId,
    },
    forceSend: true, // Critical - bypass quiet hours
  });
}

export async function notifyDeliveryDueToday(
  supplierId: string,
  count: number
): Promise<void> {
  await createNotification({
    userId: supplierId,
    notificationType: 'delivery_due_today',
    data: {
      count,
    },
  });
}

export async function notifyBuyerConfirmedDelivery(
  supplierId: string,
  buyerName: string,
  orderId: string
): Promise<void> {
  await createNotification({
    userId: supplierId,
    notificationType: 'buyer_confirmed_delivery',
    data: {
      buyerName,
      orderId,
    },
  });
}

export async function notifyBuyerReportedIssue(
  supplierId: string,
  buyerName: string,
  issueType: string,
  orderId: string
): Promise<void> {
  await createNotification({
    userId: supplierId,
    notificationType: 'buyer_reported_issue',
    data: {
      buyerName,
      issueType,
      orderId,
    },
    forceSend: true, // Critical - bypass quiet hours
  });
}

export async function notifyCatalogPricesStale(supplierId: string): Promise<void> {
  await createNotification({
    userId: supplierId,
    notificationType: 'catalog_prices_stale',
    data: {},
  });
}

// ===== ADMIN NOTIFICATION HELPERS =====

export async function notifyUnansweredRfqsSummary(
  adminId: string,
  count: number
): Promise<void> {
  await createNotification({
    userId: adminId,
    notificationType: 'unanswered_rfqs_summary',
    data: {
      count,
    },
  });
}

export async function notifyDisputesSummary(
  adminId: string,
  count: number
): Promise<void> {
  await createNotification({
    userId: adminId,
    notificationType: 'disputes_summary',
    data: {
      count,
    },
  });
}

export async function notifyPlatformHealthReport(adminId: string): Promise<void> {
  await createNotification({
    userId: adminId,
    notificationType: 'platform_health_report',
    data: {},
  });
}

// ===== BACKWARD COMPATIBILITY HELPERS =====

export async function notifyOrderConfirmed(
  buyerId: string,
  supplierName: string,
  orderId: string
): Promise<void> {
  await createNotification({
    userId: buyerId,
    notificationType: 'order_confirmed',
    data: {
      supplierName,
      orderId,
    },
  });
}

export async function notifyDeliveryScheduled(
  buyerId: string,
  deliveryDate: string,
  orderId: string
): Promise<void> {
  await createNotification({
    userId: buyerId,
    notificationType: 'delivery_scheduled',
    data: {
      deliveryDate,
      orderId,
    },
  });
}

export async function notifyConfirmationReminder(
  buyerId: string,
  orderId: string
): Promise<void> {
  await createNotification({
    userId: buyerId,
    notificationType: 'confirmation_reminder',
    data: {
      orderId,
    },
  });
}

export async function notifyDisputeRaised(
  userId: string,
  orderId: string,
  disputeId: string
): Promise<void> {
  await createNotification({
    userId,
    notificationType: 'dispute_raised',
    data: {
      orderId,
      disputeId,
    },
    forceSend: true, // Critical - bypass quiet hours
  });
}

export async function notifyPaymentDue(
  userId: string,
  amount: number,
  orderId: string
): Promise<void> {
  await createNotification({
    userId,
    notificationType: 'payment_due',
    data: {
      amount,
      orderId,
    },
    forceSend: true, // Critical - bypass quiet hours
  });
}

export async function notifyRentalDue(
  buyerId: string,
  dueDate: string,
  rentalId: string
): Promise<void> {
  await createNotification({
    userId: buyerId,
    notificationType: 'rental_due',
    data: {
      dueDate,
      rentalId,
    },
  });
}

export async function notifyReturnReminder(
  buyerId: string,
  dueDate: string,
  rentalId: string
): Promise<void> {
  await createNotification({
    userId: buyerId,
    notificationType: 'return_reminder',
    data: {
      dueDate,
      rentalId,
    },
  });
}

export async function notifySystemMessage(
  userId: string,
  titleEn: string,
  titleKa: string,
  messageEn: string,
  messageKa: string,
  locale: string = 'ka'
): Promise<void> {
  const title = locale === 'en' ? titleEn : titleKa;
  const message = locale === 'en' ? messageEn : messageKa;

  await pool.query(
    `SELECT create_notification($1, $2, $3, $4, $5, $6)`,
    [userId, 'system_message', title, message, null, false]
  );
}
