/**
 * Terms & Conditions Page
 * Legal terms and conditions for using buildApp
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import * as Icons from 'lucide-react';
import { LanguageSwitcher } from '../components/common/LanguageSwitcher';
import { colors, spacing, typography, borderRadius, shadows } from '../theme/tokens';

export const Terms: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

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
            Terms & Conditions
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
        <div
          style={{
            backgroundColor: colors.neutral[0],
            borderRadius: borderRadius.lg,
            padding: spacing[8],
            boxShadow: shadows.sm,
          }}
        >
          <h1
            style={{
              fontSize: typography.fontSize['3xl'],
              fontWeight: typography.fontWeight.bold,
              color: colors.text.primary,
              margin: 0,
              marginBottom: spacing[2],
            }}
          >
            Terms & Conditions
          </h1>
          <p
            style={{
              fontSize: typography.fontSize.sm,
              color: colors.text.tertiary,
              margin: 0,
              marginBottom: spacing[6],
            }}
          >
            Last updated: October 31, 2025
          </p>

          <div style={{ lineHeight: typography.lineHeight.relaxed, color: colors.text.primary }}>
            <section style={{ marginBottom: spacing[6] }}>
              <h2 style={{ fontSize: typography.fontSize.xl, fontWeight: typography.fontWeight.semibold, marginBottom: spacing[3] }}>
                1. Acceptance of Terms
              </h2>
              <p style={{ marginBottom: spacing[4] }}>
                By accessing and using buildApp, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to these Terms & Conditions, please do not use our service.
              </p>
            </section>

            <section style={{ marginBottom: spacing[6] }}>
              <h2 style={{ fontSize: typography.fontSize.xl, fontWeight: typography.fontWeight.semibold, marginBottom: spacing[3] }}>
                2. Use of Service
              </h2>
              <p style={{ marginBottom: spacing[4] }}>
                buildApp provides a platform for buyers and suppliers in the construction materials industry to connect, communicate, and transact. You agree to use the service only for lawful purposes and in accordance with these Terms.
              </p>
              <p style={{ marginBottom: spacing[4] }}>
                You agree not to:
              </p>
              <ul style={{ marginLeft: spacing[6], marginBottom: spacing[4] }}>
                <li>Use the service for any illegal or unauthorized purpose</li>
                <li>Interfere with or disrupt the service or servers</li>
                <li>Attempt to gain unauthorized access to any portion of the service</li>
                <li>Post false, inaccurate, or misleading information</li>
              </ul>
            </section>

            <section style={{ marginBottom: spacing[6] }}>
              <h2 style={{ fontSize: typography.fontSize.xl, fontWeight: typography.fontWeight.semibold, marginBottom: spacing[3] }}>
                3. User Accounts
              </h2>
              <p style={{ marginBottom: spacing[4] }}>
                When you create an account with us, you must provide accurate, complete, and current information. You are responsible for maintaining the confidentiality of your account and password.
              </p>
              <p style={{ marginBottom: spacing[4] }}>
                You agree to accept responsibility for all activities that occur under your account. You must notify us immediately upon becoming aware of any breach of security or unauthorized use of your account.
              </p>
            </section>

            <section style={{ marginBottom: spacing[6] }}>
              <h2 style={{ fontSize: typography.fontSize.xl, fontWeight: typography.fontWeight.semibold, marginBottom: spacing[3] }}>
                4. Transactions and Payments
              </h2>
              <p style={{ marginBottom: spacing[4] }}>
                buildApp facilitates connections between buyers and suppliers but is not a party to the actual transactions. All transactions, including pricing, delivery, quality, and payment, are between the buyer and supplier.
              </p>
              <p style={{ marginBottom: spacing[4] }}>
                We are not responsible for disputes arising from transactions conducted through our platform. Users agree to resolve disputes directly with their transaction partners.
              </p>
            </section>

            <section style={{ marginBottom: spacing[6] }}>
              <h2 style={{ fontSize: typography.fontSize.xl, fontWeight: typography.fontWeight.semibold, marginBottom: spacing[3] }}>
                5. Intellectual Property
              </h2>
              <p style={{ marginBottom: spacing[4] }}>
                The service and its original content, features, and functionality are owned by buildApp and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
              </p>
            </section>

            <section style={{ marginBottom: spacing[6] }}>
              <h2 style={{ fontSize: typography.fontSize.xl, fontWeight: typography.fontWeight.semibold, marginBottom: spacing[3] }}>
                6. Limitation of Liability
              </h2>
              <p style={{ marginBottom: spacing[4] }}>
                In no event shall buildApp, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses.
              </p>
            </section>

            <section style={{ marginBottom: spacing[6] }}>
              <h2 style={{ fontSize: typography.fontSize.xl, fontWeight: typography.fontWeight.semibold, marginBottom: spacing[3] }}>
                7. Changes to Terms
              </h2>
              <p style={{ marginBottom: spacing[4] }}>
                We reserve the right to modify or replace these Terms at any time. We will provide notice of any changes by posting the new Terms on this page and updating the "Last updated" date.
              </p>
              <p style={{ marginBottom: spacing[4] }}>
                Your continued use of the service after any changes constitutes acceptance of the new Terms.
              </p>
            </section>

            <section>
              <h2 style={{ fontSize: typography.fontSize.xl, fontWeight: typography.fontWeight.semibold, marginBottom: spacing[3] }}>
                8. Contact Us
              </h2>
              <p style={{ marginBottom: spacing[4] }}>
                If you have any questions about these Terms & Conditions, please contact us through our Contact Support page.
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};
