import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { AuthCard } from '../../components/auth/AuthCard';
import { PhoneInputField } from '../../components/auth/PhoneInputField';
import { LoadingSpinner } from '../../components/auth/LoadingSpinner';
import { requestOTP } from '../../services/authApi';

export default function Login() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { login } = useAuth();

  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate phone number (must be exactly 13 characters: +995 + 9 digits)
    if (!phone || phone.length !== 13) {
      setError(t('auth.phoneInvalid'));
      return;
    }

    setLoading(true);

    try {
      const response = await requestOTP(phone);
      console.log('[Login] Response from requestOTP:', response);

      // Development mode: auto-login response includes token
      if (response.token && response.user) {
        console.log('[Login] Auto-login successful, user:', response.user);
        // Use AuthContext login to save token and user
        login(response.token, response.user);

        const dashboardPath =
          response.user.user_type === 'admin' ? '/admin' :
          response.user.user_type === 'supplier' ? '/supplier/dashboard' :
          '/home';

        console.log('[Login] Navigating to:', dashboardPath);
        navigate(dashboardPath, { replace: true });
        return;
      }

      // Development mode: new user needs registration
      if (response.registration_required && response.temp_token) {
        navigate('/register', { state: { phone, temp_token: response.temp_token } });
        return;
      }

      // Production mode: navigate to OTP verification
      navigate('/verify-otp', { state: { phone } });
    } catch (err) {
      setError(err instanceof Error ? err.message : t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard>
      {/* Hero Section */}
      <div style={{
        textAlign: 'center',
        marginBottom: '32px',
      }}>
        <h1 style={{
          fontSize: '32px',
          fontWeight: 600,
          color: '#222',
          marginBottom: '8px',
        }}>
          {t('app.name')}
        </h1>
        <p style={{
          fontSize: '14px',
          color: '#757575',
          lineHeight: '1.5',
        }}>
          {t('auth.tagline')}
        </p>
      </div>

      {/* Form Card */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
        padding: '24px',
      }}>
        <form onSubmit={handleSubmit} style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}>
          <PhoneInputField
            value={phone}
            onChange={setPhone}
            error={error}
            disabled={loading}
          />

          <button
            type="submit"
            disabled={loading || phone.length !== 13}
            style={{
              width: '100%',
              height: '48px',
              backgroundColor: loading || phone.length !== 13 ? '#BDBDBD' : '#2563EB',
              color: '#FFFFFF',
              fontSize: '16px',
              fontWeight: 600,
              border: 'none',
              borderRadius: '8px',
              cursor: loading || phone.length !== 13 ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'background-color 200ms ease',
            }}
            onMouseEnter={(e) => {
              if (!loading && phone.length === 13) {
                e.currentTarget.style.backgroundColor = '#1D4ED8';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading && phone.length === 13) {
                e.currentTarget.style.backgroundColor = '#2563EB';
              }
            }}
          >
            {loading && <LoadingSpinner size={20} color="#FFFFFF" />}
            {loading ? t('auth.sending') : t('auth.continue')}
          </button>

          <p style={{
            fontSize: '14px',
            color: '#757575',
            textAlign: 'center',
            margin: 0,
          }}>
            {t('auth.codeSentViaSms')}
          </p>
        </form>
      </div>

      {/* Footer */}
      <p style={{
        marginTop: '16px',
        textAlign: 'center',
        fontSize: '12px',
        color: '#757575',
      }}>
        {t('auth.termsText')}
      </p>
    </AuthCard>
  );
}
