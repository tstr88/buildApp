/**
 * Privacy Policy Page
 * Privacy policy and data handling information
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import * as Icons from 'lucide-react';
import { LanguageSwitcher } from '../components/common/LanguageSwitcher';
import { colors, spacing, typography, borderRadius, shadows } from '../theme/tokens';

export const Privacy: React.FC = () => {
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
            Privacy Policy
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
            Privacy Policy
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
                1. Introduction
              </h2>
              <p style={{ marginBottom: spacing[4] }}>
                buildApp ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application and services.
              </p>
              <p style={{ marginBottom: spacing[4] }}>
                Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the application.
              </p>
            </section>

            <section style={{ marginBottom: spacing[6] }}>
              <h2 style={{ fontSize: typography.fontSize.xl, fontWeight: typography.fontWeight.semibold, marginBottom: spacing[3] }}>
                2. Information We Collect
              </h2>
              <h3 style={{ fontSize: typography.fontSize.base, fontWeight: typography.fontWeight.semibold, marginTop: spacing[4], marginBottom: spacing[2] }}>
                Personal Information
              </h3>
              <p style={{ marginBottom: spacing[4] }}>
                We may collect personal information that you provide to us, including:
              </p>
              <ul style={{ marginLeft: spacing[6], marginBottom: spacing[4] }}>
                <li>Name and contact information (phone number, email address)</li>
                <li>Account credentials</li>
                <li>Business information (company name, role)</li>
                <li>Location data (for delivery purposes)</li>
                <li>Transaction history and order information</li>
              </ul>

              <h3 style={{ fontSize: typography.fontSize.base, fontWeight: typography.fontWeight.semibold, marginTop: spacing[4], marginBottom: spacing[2] }}>
                Usage Data
              </h3>
              <p style={{ marginBottom: spacing[4] }}>
                We automatically collect certain information when you use our application, including:
              </p>
              <ul style={{ marginLeft: spacing[6], marginBottom: spacing[4] }}>
                <li>Device information (model, operating system, unique device identifiers)</li>
                <li>Log data (IP address, app features used, time and date of use)</li>
                <li>Performance data and crash reports</li>
              </ul>
            </section>

            <section style={{ marginBottom: spacing[6] }}>
              <h2 style={{ fontSize: typography.fontSize.xl, fontWeight: typography.fontWeight.semibold, marginBottom: spacing[3] }}>
                3. How We Use Your Information
              </h2>
              <p style={{ marginBottom: spacing[4] }}>
                We use the information we collect for various purposes, including:
              </p>
              <ul style={{ marginLeft: spacing[6], marginBottom: spacing[4] }}>
                <li>To provide, maintain, and improve our services</li>
                <li>To process your transactions and manage your orders</li>
                <li>To send you notifications about your transactions and account</li>
                <li>To respond to your inquiries and provide customer support</li>
                <li>To detect, prevent, and address technical issues and fraudulent activity</li>
                <li>To analyze usage patterns and improve user experience</li>
                <li>To comply with legal obligations</li>
              </ul>
            </section>

            <section style={{ marginBottom: spacing[6] }}>
              <h2 style={{ fontSize: typography.fontSize.xl, fontWeight: typography.fontWeight.semibold, marginBottom: spacing[3] }}>
                4. Information Sharing and Disclosure
              </h2>
              <p style={{ marginBottom: spacing[4] }}>
                We may share your information in the following circumstances:
              </p>
              <ul style={{ marginLeft: spacing[6], marginBottom: spacing[4] }}>
                <li><strong>With Other Users:</strong> Your profile information may be visible to other users when you create RFQs or place orders</li>
                <li><strong>With Service Providers:</strong> We may share information with third-party service providers who perform services on our behalf</li>
                <li><strong>For Business Transfers:</strong> Information may be transferred as part of a merger, acquisition, or sale of assets</li>
                <li><strong>For Legal Purposes:</strong> We may disclose information if required by law or in response to valid requests by public authorities</li>
              </ul>
              <p style={{ marginBottom: spacing[4] }}>
                We do not sell your personal information to third parties.
              </p>
            </section>

            <section style={{ marginBottom: spacing[6] }}>
              <h2 style={{ fontSize: typography.fontSize.xl, fontWeight: typography.fontWeight.semibold, marginBottom: spacing[3] }}>
                5. Data Security
              </h2>
              <p style={{ marginBottom: spacing[4] }}>
                We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
              </p>
              <p style={{ marginBottom: spacing[4] }}>
                However, no method of transmission over the Internet or electronic storage is 100% secure. While we strive to protect your personal information, we cannot guarantee its absolute security.
              </p>
            </section>

            <section style={{ marginBottom: spacing[6] }}>
              <h2 style={{ fontSize: typography.fontSize.xl, fontWeight: typography.fontWeight.semibold, marginBottom: spacing[3] }}>
                6. Your Data Rights
              </h2>
              <p style={{ marginBottom: spacing[4] }}>
                You have certain rights regarding your personal information:
              </p>
              <ul style={{ marginLeft: spacing[6], marginBottom: spacing[4] }}>
                <li><strong>Access:</strong> You can request access to your personal information</li>
                <li><strong>Correction:</strong> You can update or correct your personal information through your account settings</li>
                <li><strong>Deletion:</strong> You can request deletion of your account and personal information</li>
                <li><strong>Opt-out:</strong> You can opt-out of receiving promotional communications</li>
              </ul>
              <p style={{ marginBottom: spacing[4] }}>
                To exercise these rights, please contact us through the Contact Support page.
              </p>
            </section>

            <section style={{ marginBottom: spacing[6] }}>
              <h2 style={{ fontSize: typography.fontSize.xl, fontWeight: typography.fontWeight.semibold, marginBottom: spacing[3] }}>
                7. Data Retention
              </h2>
              <p style={{ marginBottom: spacing[4] }}>
                We retain your personal information for as long as necessary to provide our services and fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required by law.
              </p>
              <p style={{ marginBottom: spacing[4] }}>
                When you delete your account, we will anonymize your personal information while retaining transaction records for legal and analytical purposes.
              </p>
            </section>

            <section style={{ marginBottom: spacing[6] }}>
              <h2 style={{ fontSize: typography.fontSize.xl, fontWeight: typography.fontWeight.semibold, marginBottom: spacing[3] }}>
                8. Children's Privacy
              </h2>
              <p style={{ marginBottom: spacing[4] }}>
                Our service is not intended for use by children under the age of 18. We do not knowingly collect personal information from children under 18. If you become aware that a child has provided us with personal information, please contact us.
              </p>
            </section>

            <section style={{ marginBottom: spacing[6] }}>
              <h2 style={{ fontSize: typography.fontSize.xl, fontWeight: typography.fontWeight.semibold, marginBottom: spacing[3] }}>
                9. Changes to This Privacy Policy
              </h2>
              <p style={{ marginBottom: spacing[4] }}>
                We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
              </p>
              <p style={{ marginBottom: spacing[4] }}>
                You are advised to review this Privacy Policy periodically for any changes.
              </p>
            </section>

            <section>
              <h2 style={{ fontSize: typography.fontSize.xl, fontWeight: typography.fontWeight.semibold, marginBottom: spacing[3] }}>
                10. Contact Us
              </h2>
              <p style={{ marginBottom: spacing[4] }}>
                If you have any questions about this Privacy Policy, please contact us through our Contact Support page.
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};
