/**
 * FAQs Page
 * Frequently Asked Questions
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as Icons from 'lucide-react';
import { LanguageSwitcher } from '../components/common/LanguageSwitcher';
import { colors, spacing, typography, borderRadius, shadows } from '../theme/tokens';

interface FAQItem {
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  {
    question: 'How do I create an RFQ (Request for Quotation)?',
    answer: 'To create an RFQ, go to the Projects page, select your project, and click "Create RFQ". Fill in the required materials, quantities, and delivery details. Suppliers will then submit their quotes for you to review.',
  },
  {
    question: 'How do I place a direct order?',
    answer: 'You can place a direct order from the Catalog page by selecting materials and clicking "Direct Order", or from a Factory profile by browsing their products. Fill in your order details and submit.',
  },
  {
    question: 'How do delivery and pickup options work?',
    answer: 'When creating an order or RFQ, you can choose between delivery (materials delivered to your location) or pickup (you collect from supplier). Delivery fees and availability vary by supplier.',
  },
  {
    question: 'What payment methods are accepted?',
    answer: 'Payment terms are negotiated between you and the supplier. Common options include Cash on Delivery (COD), bank transfer, or payment upon invoice. Specific terms are agreed upon when accepting a quote or placing an order.',
  },
  {
    question: 'How do I track my orders?',
    answer: 'Go to the Orders page to see all your orders. Click on any order to see detailed status, tracking information, and supplier contact details.',
  },
  {
    question: 'Can I rent construction tools?',
    answer: 'Yes! Visit the Rentals page to browse available tools. You can either create a rental RFQ for multiple suppliers to quote, or directly book a specific tool if available.',
  },
  {
    question: 'How do I cancel an order?',
    answer: 'Contact the supplier directly through the order details page. Cancellation policies vary by supplier and order status. Orders that have already been shipped may not be cancellable.',
  },
  {
    question: 'What if I receive damaged materials?',
    answer: 'If you receive damaged materials, document the damage with photos and contact the supplier immediately through the order details page. Most suppliers will arrange for replacement or refund according to their policies.',
  },
  {
    question: 'How do I change my account settings?',
    answer: 'Go to your Profile page from the bottom navigation or sidebar. There you can update your name, language preference, buyer role, and notification settings.',
  },
  {
    question: 'How do I delete my account?',
    answer: 'Go to your Profile page and scroll to the Danger Zone section. Click "Delete Account" and follow the confirmation steps. Note that this action cannot be undone.',
  },
];

export const FAQs: React.FC = () => {
  const navigate = useNavigate();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

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
            Back
          </button>
          <div
            style={{
              fontSize: typography.fontSize.xl,
              fontWeight: typography.fontWeight.semibold,
              color: colors.text.primary,
            }}
          >
            FAQs
          </div>
          <LanguageSwitcher />
        </div>
      </header>

      {/* Content */}
      <main
        style={{
          maxWidth: '800px',
          margin: '0 auto',
          padding: spacing[6],
        }}
      >
        <div style={{ marginBottom: spacing[6] }}>
          <h1
            style={{
              fontSize: typography.fontSize['3xl'],
              fontWeight: typography.fontWeight.bold,
              color: colors.text.primary,
              margin: 0,
              marginBottom: spacing[2],
            }}
          >
            Frequently Asked Questions
          </h1>
          <p style={{ fontSize: typography.fontSize.base, color: colors.text.secondary, margin: 0 }}>
            Find answers to common questions about using buildApp
          </p>
        </div>

        {faqData.map((faq, index) => (
          <div
            key={index}
            style={{
              backgroundColor: colors.neutral[0],
              borderRadius: borderRadius.lg,
              marginBottom: spacing[3],
              boxShadow: shadows.sm,
              overflow: 'hidden',
            }}
          >
            <button
              onClick={() => toggleFAQ(index)}
              style={{
                width: '100%',
                padding: spacing[4],
                border: 'none',
                backgroundColor: 'transparent',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                textAlign: 'left',
              }}
            >
              <span
                style={{
                  fontSize: typography.fontSize.base,
                  fontWeight: typography.fontWeight.semibold,
                  color: colors.text.primary,
                  paddingRight: spacing[4],
                }}
              >
                {faq.question}
              </span>
              <Icons.ChevronDown
                size={20}
                color={colors.text.secondary}
                style={{
                  transform: expandedIndex === index ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s',
                  flexShrink: 0,
                }}
              />
            </button>

            {expandedIndex === index && (
              <div
                style={{
                  padding: `0 ${spacing[4]} ${spacing[4]} ${spacing[4]}`,
                  fontSize: typography.fontSize.base,
                  color: colors.text.secondary,
                  lineHeight: typography.lineHeight.relaxed,
                }}
              >
                {faq.answer}
              </div>
            )}
          </div>
        ))}

        <div
          style={{
            marginTop: spacing[8],
            padding: spacing[6],
            backgroundColor: colors.primary[50],
            borderRadius: borderRadius.lg,
            textAlign: 'center',
          }}
        >
          <h2
            style={{
              fontSize: typography.fontSize.xl,
              fontWeight: typography.fontWeight.semibold,
              color: colors.text.primary,
              margin: 0,
              marginBottom: spacing[2],
            }}
          >
            Still have questions?
          </h2>
          <p style={{ fontSize: typography.fontSize.base, color: colors.text.secondary, marginBottom: spacing[4] }}>
            Can't find the answer you're looking for? Get in touch with our support team.
          </p>
          <button
            onClick={() => navigate('/contact')}
            style={{
              padding: `${spacing[3]} ${spacing[6]}`,
              backgroundColor: colors.primary[600],
              border: 'none',
              borderRadius: borderRadius.md,
              fontSize: typography.fontSize.base,
              fontWeight: typography.fontWeight.medium,
              color: colors.neutral[0],
              cursor: 'pointer',
            }}
          >
            Contact Support
          </button>
        </div>
      </main>
    </div>
  );
};
