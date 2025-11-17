/**
 * Contact Support Page
 * Contact form for customer support
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as Icons from 'lucide-react';
import { LanguageSwitcher } from '../components/common/LanguageSwitcher';
import { colors, spacing, typography, borderRadius, shadows } from '../theme/tokens';

export const Contact: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setSubmitting(false);
    setSubmitted(true);

    // Reset form after 3 seconds
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: '', email: '', subject: '', message: '' });
    }, 3000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
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
            Contact Support
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
            Get in Touch
          </h1>
          <p style={{ fontSize: typography.fontSize.base, color: colors.text.secondary, margin: 0 }}>
            Have a question or need help? Fill out the form below and we'll get back to you as soon as possible.
          </p>
        </div>

        <div
          style={{
            backgroundColor: colors.neutral[0],
            borderRadius: borderRadius.lg,
            padding: spacing[6],
            boxShadow: shadows.sm,
          }}
        >
          {submitted ? (
            <div style={{ textAlign: 'center', padding: spacing[6] }}>
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  backgroundColor: colors.success + '20',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto',
                  marginBottom: spacing[4],
                }}
              >
                <Icons.CheckCircle size={32} color={colors.success} />
              </div>
              <h2
                style={{
                  fontSize: typography.fontSize.xl,
                  fontWeight: typography.fontWeight.semibold,
                  color: colors.text.primary,
                  margin: 0,
                  marginBottom: spacing[2],
                }}
              >
                Message Sent!
              </h2>
              <p style={{ fontSize: typography.fontSize.base, color: colors.text.secondary, margin: 0 }}>
                Thank you for contacting us. We'll respond to your inquiry within 24 hours.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: spacing[4] }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: typography.fontSize.sm,
                    fontWeight: typography.fontWeight.medium,
                    color: colors.text.primary,
                    marginBottom: spacing[2],
                  }}
                >
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  style={{
                    width: '100%',
                    padding: spacing[3],
                    fontSize: typography.fontSize.base,
                    border: `1px solid ${colors.border.light}`,
                    borderRadius: borderRadius.md,
                    outline: 'none',
                  }}
                />
              </div>

              <div style={{ marginBottom: spacing[4] }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: typography.fontSize.sm,
                    fontWeight: typography.fontWeight.medium,
                    color: colors.text.primary,
                    marginBottom: spacing[2],
                  }}
                >
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  style={{
                    width: '100%',
                    padding: spacing[3],
                    fontSize: typography.fontSize.base,
                    border: `1px solid ${colors.border.light}`,
                    borderRadius: borderRadius.md,
                    outline: 'none',
                  }}
                />
              </div>

              <div style={{ marginBottom: spacing[4] }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: typography.fontSize.sm,
                    fontWeight: typography.fontWeight.medium,
                    color: colors.text.primary,
                    marginBottom: spacing[2],
                  }}
                >
                  Subject
                </label>
                <select
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  style={{
                    width: '100%',
                    padding: spacing[3],
                    fontSize: typography.fontSize.base,
                    border: `1px solid ${colors.border.light}`,
                    borderRadius: borderRadius.md,
                    outline: 'none',
                    backgroundColor: colors.neutral[0],
                  }}
                >
                  <option value="">Select a subject</option>
                  <option value="general">General Inquiry</option>
                  <option value="technical">Technical Support</option>
                  <option value="billing">Billing & Payments</option>
                  <option value="account">Account Issues</option>
                  <option value="feature">Feature Request</option>
                  <option value="bug">Report a Bug</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div style={{ marginBottom: spacing[6] }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: typography.fontSize.sm,
                    fontWeight: typography.fontWeight.medium,
                    color: colors.text.primary,
                    marginBottom: spacing[2],
                  }}
                >
                  Message
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={6}
                  style={{
                    width: '100%',
                    padding: spacing[3],
                    fontSize: typography.fontSize.base,
                    border: `1px solid ${colors.border.light}`,
                    borderRadius: borderRadius.md,
                    outline: 'none',
                    fontFamily: 'inherit',
                    resize: 'vertical',
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                style={{
                  width: '100%',
                  padding: spacing[4],
                  backgroundColor: submitting ? colors.primary[400] : colors.primary[600],
                  border: 'none',
                  borderRadius: borderRadius.md,
                  fontSize: typography.fontSize.base,
                  fontWeight: typography.fontWeight.medium,
                  color: colors.neutral[0],
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: spacing[2],
                }}
              >
                {submitting ? (
                  <>
                    <div
                      style={{
                        width: '16px',
                        height: '16px',
                        border: `2px solid ${colors.neutral[0]}`,
                        borderTopColor: 'transparent',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                      }}
                    />
                    Sending...
                  </>
                ) : (
                  <>
                    <Icons.Send size={20} />
                    Send Message
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Contact Info */}
        <div style={{ marginTop: spacing[8], display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: spacing[4] }}>
          <div
            style={{
              backgroundColor: colors.neutral[0],
              borderRadius: borderRadius.lg,
              padding: spacing[4],
              boxShadow: shadows.sm,
              textAlign: 'center',
            }}
          >
            <Icons.Mail size={32} color={colors.primary[600]} style={{ margin: '0 auto', marginBottom: spacing[2] }} />
            <h3
              style={{
                fontSize: typography.fontSize.base,
                fontWeight: typography.fontWeight.semibold,
                color: colors.text.primary,
                margin: 0,
                marginBottom: spacing[1],
              }}
            >
              Email
            </h3>
            <p style={{ fontSize: typography.fontSize.sm, color: colors.text.secondary, margin: 0 }}>
              support@buildapp.ge
            </p>
          </div>

          <div
            style={{
              backgroundColor: colors.neutral[0],
              borderRadius: borderRadius.lg,
              padding: spacing[4],
              boxShadow: shadows.sm,
              textAlign: 'center',
            }}
          >
            <Icons.Phone size={32} color={colors.primary[600]} style={{ margin: '0 auto', marginBottom: spacing[2] }} />
            <h3
              style={{
                fontSize: typography.fontSize.base,
                fontWeight: typography.fontWeight.semibold,
                color: colors.text.primary,
                margin: 0,
                marginBottom: spacing[1],
              }}
            >
              Phone
            </h3>
            <p style={{ fontSize: typography.fontSize.sm, color: colors.text.secondary, margin: 0 }}>
              +995 555 123 456
            </p>
          </div>

          <div
            style={{
              backgroundColor: colors.neutral[0],
              borderRadius: borderRadius.lg,
              padding: spacing[4],
              boxShadow: shadows.sm,
              textAlign: 'center',
            }}
          >
            <Icons.Clock size={32} color={colors.primary[600]} style={{ margin: '0 auto', marginBottom: spacing[2] }} />
            <h3
              style={{
                fontSize: typography.fontSize.base,
                fontWeight: typography.fontWeight.semibold,
                color: colors.text.primary,
                margin: 0,
                marginBottom: spacing[1],
              }}
            >
              Hours
            </h3>
            <p style={{ fontSize: typography.fontSize.sm, color: colors.text.secondary, margin: 0 }}>
              Mon-Fri: 9AM-6PM
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};
