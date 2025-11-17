/**
 * Notification Templates
 * Generates localized notification content for each notification type
 */

export interface NotificationContent {
  titleEn: string;
  titleKa: string;
  messageEn: string;
  messageKa: string;
  deepLink?: string;
  isCritical: boolean;
  includeSMS: boolean;
}

export interface NotificationData {
  // Common fields
  orderId?: string;
  rfqId?: string;
  offerId?: string;
  deliveryId?: string;
  rentalId?: string;
  disputeId?: string;

  // Entity names
  supplierName?: string;
  buyerName?: string;
  buyerType?: string;
  location?: string;
  productName?: string;

  // Time-based fields
  expiresInHours?: number;
  deliveryTime?: string;
  deliveryDate?: string;
  dueDate?: string;

  // Counts and summaries
  count?: number;
  amount?: number;

  // Issue details
  issueType?: string;
  issueDescription?: string;
}

export class NotificationTemplates {
  /**
   * Generate notification content based on type and data
   */
  static generate(
    notificationType: string,
    data: NotificationData,
    locale: string = 'ka'
  ): NotificationContent {
    const content = this.getTemplate(notificationType, data);

    // Add deep link if applicable
    if (data.orderId) {
      content.deepLink = `buildapp://orders/${data.orderId}`;
    } else if (data.rfqId) {
      content.deepLink = `buildapp://rfqs/${data.rfqId}`;
    } else if (data.offerId) {
      content.deepLink = `buildapp://offers/${data.offerId}`;
    } else if (data.deliveryId) {
      content.deepLink = `buildapp://deliveries/${data.deliveryId}`;
    } else if (data.rentalId) {
      content.deepLink = `buildapp://rentals/${data.rentalId}`;
    } else if (data.disputeId) {
      content.deepLink = `buildapp://disputes/${data.disputeId}`;
    }

    return content;
  }

  private static getTemplate(
    notificationType: string,
    data: NotificationData
  ): NotificationContent {
    switch (notificationType) {
      // ===== BUYER NOTIFICATIONS =====

      case 'offer_received':
        return {
          titleEn: `New Offer from ${data.supplierName || 'Supplier'}`,
          titleKa: `ახალი შეთავაზება ${data.supplierName || 'მიმწოდებლისგან'}`,
          messageEn: `You have received a new offer for your RFQ. Review and accept before it expires.`,
          messageKa: `თქვენ მიიღეთ ახალი შეთავაზება თქვენი RFQ-ის შესახებ. გადახედეთ და მიიღეთ ვადის გასვლამდე.`,
          isCritical: false,
          includeSMS: false,
        };

      case 'offer_expiring':
        return {
          titleEn: `Offer Expiring Soon`,
          titleKa: `შეთავაზება მალე იწურება`,
          messageEn: `An offer from ${data.supplierName || 'supplier'} expires in ${data.expiresInHours || 4} hours. Review it now!`,
          messageKa: `${data.supplierName || 'მიმწოდებლის'} შეთავაზება იწურება ${data.expiresInHours || 4} საათში. გადახედეთ ახლავე!`,
          isCritical: false,
          includeSMS: false,
        };

      case 'delivery_approaching':
        return {
          titleEn: `Delivery in 1 Hour`,
          titleKa: `მიწოდება 1 საათში`,
          messageEn: `Your delivery is scheduled for ${data.deliveryTime || 'soon'}. Please be available to receive it.`,
          messageKa: `თქვენი მიწოდება დაგეგმილია ${data.deliveryTime || 'მალე'}. გთხოვთ იყოთ ხელმისაწვდომი მისაღებად.`,
          isCritical: true,
          includeSMS: true,
        };

      case 'delivery_completed':
        return {
          titleEn: `Delivery Completed`,
          titleKa: `მიწოდება დასრულდა`,
          messageEn: `Your order has been delivered. Please confirm receipt within 24 hours.`,
          messageKa: `თქვენი შეკვეთა მიწოდებულია. გთხოვთ დაადასტუროთ მიღება 24 საათის განმავლობაში.`,
          isCritical: true,
          includeSMS: true,
        };

      case 'order_auto_completed':
        return {
          titleEn: `Order Auto-Completed`,
          titleKa: `შეკვეთა ავტომატურად დასრულდა`,
          messageEn: `Your order was automatically completed after 24 hours without confirmation.`,
          messageKa: `თქვენი შეკვეთა ავტომატურად დასრულდა 24 საათის შემდეგ დადასტურების გარეშე.`,
          isCritical: false,
          includeSMS: false,
        };

      case 'rental_handover_due':
        return {
          titleEn: `Rental Handover Due`,
          titleKa: `გაქირავების გადაცემა დადგა`,
          messageEn: `Please confirm rental handover within 2 hours or contact the supplier.`,
          messageKa: `გთხოვთ დაადასტუროთ გაქირავების გადაცემა 2 საათის განმავლობაში ან დაუკავშირდით მიმწოდებელს.`,
          isCritical: true,
          includeSMS: true,
        };

      case 'rental_return_reminder':
        return {
          titleEn: `Rental Return Tomorrow`,
          titleKa: `გაქირავების დაბრუნება ხვალ`,
          messageEn: `Your rental is due for return tomorrow at ${data.deliveryTime || 'the scheduled time'}.`,
          messageKa: `თქვენი გაქირავება ხვალ უნდა დაბრუნდეს ${data.deliveryTime || 'დაგეგმილ დროს'}.`,
          isCritical: false,
          includeSMS: false,
        };

      case 'window_confirmed':
        return {
          titleEn: `Delivery Window Confirmed`,
          titleKa: `მიწოდების ფანჯარა დადასტურდა`,
          messageEn: `Your delivery is scheduled for ${data.deliveryDate || 'soon'}. You'll receive a reminder 1 hour before.`,
          messageKa: `თქვენი მიწოდება დაგეგმილია ${data.deliveryDate || 'მალე'}. მიიღებთ შეხსენებას 1 საათით ადრე.`,
          isCritical: false,
          includeSMS: false,
        };

      // ===== SUPPLIER NOTIFICATIONS =====

      case 'rfq_received':
        return {
          titleEn: `New RFQ from ${data.buyerType || 'Buyer'}`,
          titleKa: `ახალი RFQ ${data.buyerType || 'მყიდველისგან'}`,
          messageEn: `New RFQ in ${data.location || 'your area'}. Submit your offer to win the business.`,
          messageKa: `ახალი RFQ ${data.location || 'თქვენს რეგიონში'}. წარადგინეთ თქვენი შეთავაზება ბიზნესის მოსაგებად.`,
          isCritical: false,
          includeSMS: false,
        };

      case 'offer_accepted':
        return {
          titleEn: `Your Offer Was Accepted!`,
          titleKa: `თქვენი შეთავაზება მიღებულია!`,
          messageEn: `Congratulations! ${data.buyerName || 'The buyer'} accepted your offer. Prepare for delivery.`,
          messageKa: `გილოცავთ! ${data.buyerName || 'მყიდველმა'} მიიღო თქვენი შეთავაზება. მოემზადეთ მიწოდებისთვის.`,
          isCritical: true,
          includeSMS: true,
        };

      case 'direct_order_placed':
        return {
          titleEn: `New Direct Order`,
          titleKa: `ახალი პირდაპირი შეკვეთა`,
          messageEn: `${data.buyerName || 'A buyer'} placed a direct order. Confirm and schedule delivery.`,
          messageKa: `${data.buyerName || 'მყიდველმა'} განათავსა პირდაპირი შეკვეთა. დაადასტურეთ და დაგეგმეთ მიწოდება.`,
          isCritical: true,
          includeSMS: true,
        };

      case 'delivery_due_today':
        return {
          titleEn: `Delivery Due Today`,
          titleKa: `მიწოდება დღეს`,
          messageEn: `You have ${data.count || 1} delivery scheduled for today. Check your delivery schedule.`,
          messageKa: `თქვენ გაქვთ ${data.count || 1} მიწოდება დაგეგმილი დღეს. შეამოწმეთ თქვენი მიწოდების განრიგი.`,
          isCritical: false,
          includeSMS: false,
        };

      case 'buyer_confirmed_delivery':
        return {
          titleEn: `Delivery Confirmed`,
          titleKa: `მიწოდება დადასტურდა`,
          messageEn: `${data.buyerName || 'The buyer'} confirmed receipt of the delivery. Payment is being processed.`,
          messageKa: `${data.buyerName || 'მყიდველმა'} დაადასტურა მიწოდების მიღება. გადახდა მუშავდება.`,
          isCritical: false,
          includeSMS: false,
        };

      case 'buyer_reported_issue':
        return {
          titleEn: `Issue Reported`,
          titleKa: `პრობლემა დაფიქსირდა`,
          messageEn: `${data.buyerName || 'A buyer'} reported an issue: ${data.issueType || 'delivery problem'}. Please respond promptly.`,
          messageKa: `${data.buyerName || 'მყიდველმა'} დააფიქსირა პრობლემა: ${data.issueType || 'მიწოდების პრობლემა'}. გთხოვთ უპასუხოთ დაუყოვნებლივ.`,
          isCritical: true,
          includeSMS: true,
        };

      case 'catalog_prices_stale':
        return {
          titleEn: `Update Your Catalog Prices`,
          titleKa: `განაახლეთ თქვენი კატალოგის ფასები`,
          messageEn: `Your catalog prices haven't been updated in over 7 days. Keep them current to win more business.`,
          messageKa: `თქვენი კატალოგის ფასები არ განახლებულა 7 დღეზე მეტი ხნის განმავლობაში. გააქტიურეთ ისინი მეტი ბიზნესის მოსაგებად.`,
          isCritical: false,
          includeSMS: false,
        };

      // ===== ADMIN NOTIFICATIONS =====

      case 'unanswered_rfqs_summary':
        return {
          titleEn: `Daily RFQ Report`,
          titleKa: `დღიური RFQ რეპორტი`,
          messageEn: `${data.count || 0} RFQs have been unanswered for over 24 hours. Review and take action.`,
          messageKa: `${data.count || 0} RFQ-ს არ მიუღია პასუხი 24 საათზე მეტი ხნის განმავლობაში. გადახედეთ და მიიღეთ ზომები.`,
          isCritical: false,
          includeSMS: false,
        };

      case 'disputes_summary':
        return {
          titleEn: `Daily Disputes Report`,
          titleKa: `დღიური დავების რეპორტი`,
          messageEn: `${data.count || 0} new disputes were opened today. Review and mediate as needed.`,
          messageKa: `${data.count || 0} ახალი დავა გაიხსნა დღეს. გადახედეთ და შუამდგომლობა გაუწიეთ საჭიროების მიხედვით.`,
          isCritical: false,
          includeSMS: false,
        };

      case 'platform_health_report':
        return {
          titleEn: `Weekly Platform Health Report`,
          titleKa: `კვირეული პლატფორმის ჯანმრთელობის რეპორტი`,
          messageEn: `Your weekly platform health report is ready. Review key metrics and trends.`,
          messageKa: `თქვენი კვირეული პლატფორმის ჯანმრთელობის რეპორტი მზადაა. გადახედეთ ძირითად მეტრიკებს და ტენდენციებს.`,
          isCritical: false,
          includeSMS: false,
        };

      // ===== EXISTING NOTIFICATION TYPES (for backward compatibility) =====

      case 'order_confirmed':
        return {
          titleEn: `Order Confirmed`,
          titleKa: `შეკვეთა დადასტურდა`,
          messageEn: `Your order has been confirmed by ${data.supplierName || 'the supplier'}. Delivery will be scheduled soon.`,
          messageKa: `თქვენი შეკვეთა დადასტურდა ${data.supplierName || 'მიმწოდებლის მიერ'}. მიწოდება მალე დაიგეგმება.`,
          isCritical: false,
          includeSMS: false,
        };

      case 'delivery_scheduled':
        return {
          titleEn: `Delivery Scheduled`,
          titleKa: `მიწოდება დაგეგმილია`,
          messageEn: `Your delivery is scheduled for ${data.deliveryDate || 'soon'}.`,
          messageKa: `თქვენი მიწოდება დაგეგმილია ${data.deliveryDate || 'მალე'}.`,
          isCritical: false,
          includeSMS: false,
        };

      case 'confirmation_reminder':
        return {
          titleEn: `Confirm Your Delivery`,
          titleKa: `დაადასტურეთ მიწოდება`,
          messageEn: `Please confirm receipt of your delivery to complete the order.`,
          messageKa: `გთხოვთ დაადასტუროთ თქვენი მიწოდების მიღება შეკვეთის დასასრულებლად.`,
          isCritical: false,
          includeSMS: false,
        };

      case 'dispute_raised':
        return {
          titleEn: `Dispute Raised`,
          titleKa: `დავა წამოიწყო`,
          messageEn: `A dispute has been raised regarding order. Our team will review it shortly.`,
          messageKa: `დავა წამოიწყო შეკვეთასთან დაკავშირებით. ჩვენი გუნდი მალე განიხილავს მას.`,
          isCritical: true,
          includeSMS: true,
        };

      case 'payment_due':
        return {
          titleEn: `Payment Due`,
          titleKa: `გადახდის ვადა`,
          messageEn: `Payment of ${data.amount || 'the amount'} is due. Please process payment to avoid delays.`,
          messageKa: `გადახდა ${data.amount || 'თანხის'} ვადა დადგა. გთხოვთ განახორციელოთ გადახდა დაგვიანების თავიდან ასაცილებლად.`,
          isCritical: true,
          includeSMS: true,
        };

      case 'rental_due':
        return {
          titleEn: `Rental Due`,
          titleKa: `გაქირავება დადგა`,
          messageEn: `Your rental is due for return on ${data.dueDate || 'the scheduled date'}.`,
          messageKa: `თქვენი გაქირავება დაბრუნების ვადა არის ${data.dueDate || 'დაგეგმილ თარიღზე'}.`,
          isCritical: false,
          includeSMS: false,
        };

      case 'return_reminder':
        return {
          titleEn: `Return Reminder`,
          titleKa: `დაბრუნების შეხსენება`,
          messageEn: `Don't forget to return your rental equipment by ${data.dueDate || 'the due date'}.`,
          messageKa: `არ დაგავიწყდეთ დაბრუნოთ გაქირავებული აღჭურვილობა ${data.dueDate || 'ვადის გასვლამდე'}.`,
          isCritical: false,
          includeSMS: false,
        };

      case 'system_message':
        return {
          titleEn: `System Notification`,
          titleKa: `სისტემური შეტყობინება`,
          messageEn: `Important system update or maintenance notification.`,
          messageKa: `მნიშვნელოვანი სისტემური განახლება ან მოვლის შეტყობინება.`,
          isCritical: false,
          includeSMS: false,
        };

      default:
        return {
          titleEn: `Notification`,
          titleKa: `შეტყობინება`,
          messageEn: `You have a new notification.`,
          messageKa: `თქვენ გაქვთ ახალი შეტყობინება.`,
          isCritical: false,
          includeSMS: false,
        };
    }
  }

  /**
   * Get title in specific locale
   */
  static getTitle(notificationType: string, data: NotificationData, locale: string = 'ka'): string {
    const content = this.generate(notificationType, data, locale);
    return locale === 'en' ? content.titleEn : content.titleKa;
  }

  /**
   * Get message in specific locale
   */
  static getMessage(notificationType: string, data: NotificationData, locale: string = 'ka'): string {
    const content = this.generate(notificationType, data, locale);
    return locale === 'en' ? content.messageEn : content.messageKa;
  }

  /**
   * Check if notification type is critical
   */
  static isCritical(notificationType: string): boolean {
    const content = this.generate(notificationType, {});
    return content.isCritical;
  }

  /**
   * Check if notification type should include SMS
   */
  static shouldIncludeSMS(notificationType: string): boolean {
    const content = this.generate(notificationType, {});
    return content.includeSMS;
  }
}
