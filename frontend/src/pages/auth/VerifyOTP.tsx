import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AuthCard } from '../../components/auth/AuthCard';
import { OTPInputField } from '../../components/auth/OTPInputField';
import { LoadingSpinner } from '../../components/auth/LoadingSpinner';
import { verifyOTP, requestOTP } from '../../services/authApi';
import { useAuth } from '../../context/AuthContext';

interface LocationState {
  phone?: string;
}

export default function VerifyOTP() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { login } = useAuth();

  const state = location.state as LocationState;
  const phone = state?.phone;

  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendCountdown, setResendCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  // Redirect if no phone number
  useEffect(() => {
    if (!phone) {
      navigate('/login');
    }
  }, [phone, navigate]);

  // Countdown timer for resend
  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => {
        setResendCountdown(resendCountdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [resendCountdown]);

  const maskPhone = (phoneNumber: string): string => {
    // Format as +995 XXX XX XX XX with middle digits masked
    const digits = phoneNumber.substring(4);
    if (digits.length === 9) {
      return `+995 ${digits.slice(0, 3)} XX XX ${digits.slice(7)}`;
    }
    return phoneNumber;
  };

  const handleComplete = async (otpValue: string) => {
    if (!phone) return;

    setError('');
    setLoading(true);

    try {
      const response = await verifyOTP(phone, otpValue);

      if (response.registration_required && response.temp_token) {
        // New user - redirect to registration
        navigate('/complete-registration', { state: { temp_token: response.temp_token, phone } });
      } else if (response.token && response.user) {
        // Existing user - log in
        login(response.token, response.user);

        // Redirect based on user type
        if (response.user.user_type === 'supplier') {
          navigate('/supplier/dashboard');
        } else {
          navigate('/home');
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t('common.error');
      setError(errorMessage);
      setOtp(''); // Clear OTP for retry
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!phone || !canResend) return;

    setError('');
    setLoading(true);
    setCanResend(false);
    setResendCountdown(60);

    try {
      await requestOTP(phone);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/login');
  };

  if (!phone) {
    return null; // Will redirect in useEffect
  }

  return (
    <AuthCard>
      {/* Header */}
      <div style={{
        textAlign: 'center',
        marginBottom: '32px',
      }}>
        <h1 style={{
          fontSize: '24px',
          fontWeight: 600,
          color: '#222',
          marginBottom: '8px',
        }}>
          {t('auth.verifyTitle')}
        </h1>
        <p style={{
          fontSize: '14px',
          color: '#757575',
          lineHeight: '1.5',
        }}>
          {t('auth.verifySubtext', { phone: maskPhone(phone) })}
        </p>
      </div>

      {/* Form Card */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
        padding: '24px',
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}>
          <OTPInputField
            value={otp}
            onChange={setOtp}
            onComplete={handleComplete}
            error={error}
            disabled={loading}
          />

          {/* Resend Link */}
          <div style={{ textAlign: 'center' }}>
            {canResend ? (
              <button
                type="button"
                onClick={handleResend}
                disabled={loading}
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: '#2563EB',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  textDecoration: 'underline',
                  padding: 0,
                }}
              >
                {t('auth.resendCode')}
              </button>
            ) : (
              <p style={{
                fontSize: '14px',
                color: '#757575',
                margin: 0,
              }}>
                {t('auth.resendCountdown', { seconds: resendCountdown })}
              </p>
            )}
          </div>

          {/* Back Button */}
          <button
            type="button"
            onClick={handleBack}
            disabled={loading}
            style={{
              width: '100%',
              height: '48px',
              backgroundColor: '#FFFFFF',
              color: '#222',
              fontSize: '16px',
              fontWeight: 600,
              border: '1px solid #E6E6E6',
              borderRadius: '8px',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background-color 200ms ease',
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.backgroundColor = '#F9F9F9';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.currentTarget.style.backgroundColor = '#FFFFFF';
              }
            }}
          >
            {t('auth.changePhone')}
          </button>
        </div>
      </div>

      {/* Loading Indicator */}
      {loading && (
        <div style={{
          marginTop: '16px',
          display: 'flex',
          justifyContent: 'center',
        }}>
          <LoadingSpinner size={24} color="#2563EB" />
        </div>
      )}
    </AuthCard>
  );
}
