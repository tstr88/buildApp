import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { AuthCard } from '../../components/auth/AuthCard';
import { LoadingSpinner } from '../../components/auth/LoadingSpinner';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function Login() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { login: authLogin } = useAuth();

  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Login form state
  const [loginData, setLoginData] = useState({
    identifier: '',
    password: '',
  });

  // Register form state
  const [registerData, setRegisterData] = useState({
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    name: '',
    user_type: 'buyer' as 'buyer' | 'supplier' | 'admin',
    buyer_role: 'homeowner' as 'homeowner' | 'contractor',
    language: 'ka' as 'ka' | 'en',
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!loginData.identifier || !loginData.password) {
      setError(t('auth.fillAllFields') || 'Please fill all fields');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/api/auth/login`, {
        identifier: loginData.identifier,
        password: loginData.password,
      });

      if (response.data.success) {
        authLogin(response.data.token, response.data.user);

        // Navigate based on user type
        const dashboardPath =
          response.data.user.user_type === 'admin'
            ? '/admin'
            : response.data.user.user_type === 'supplier'
            ? '/supplier/dashboard'
            : '/home';

        navigate(dashboardPath, { replace: true });
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(
        err.response?.data?.error ||
          t('auth.loginFailed') ||
          'Login failed. Please check your credentials.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!registerData.email || !registerData.password || !registerData.name) {
      setError(t('auth.fillAllFields') || 'Please fill all required fields');
      return;
    }

    if (registerData.password.length < 6) {
      setError(t('auth.passwordTooShort') || 'Password must be at least 6 characters');
      return;
    }

    if (registerData.password !== registerData.confirmPassword) {
      setError(t('auth.passwordMismatch') || 'Passwords do not match');
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(registerData.email)) {
      setError(t('auth.invalidEmail') || 'Invalid email format');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/api/auth/register`, {
        email: registerData.email,
        phone: registerData.phone || undefined,
        password: registerData.password,
        name: registerData.name,
        user_type: registerData.user_type,
        buyer_role: registerData.user_type === 'buyer' ? registerData.buyer_role : undefined,
        language: registerData.language,
      });

      if (response.data.success) {
        authLogin(response.data.token, response.data.user);

        // Navigate based on user type
        const dashboardPath =
          response.data.user.user_type === 'admin'
            ? '/admin'
            : response.data.user.user_type === 'supplier'
            ? '/supplier/dashboard'
            : '/home';

        navigate(dashboardPath, { replace: true });
      }
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(
        err.response?.data?.error ||
          t('auth.registrationFailed') ||
          'Registration failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard>
      {/* Hero Section */}
      <div
        style={{
          textAlign: 'center',
          marginBottom: '32px',
        }}
      >
        <h1
          style={{
            fontSize: '32px',
            fontWeight: 600,
            color: '#222',
            marginBottom: '8px',
          }}
        >
          {t('app.name')}
        </h1>
        <p
          style={{
            fontSize: '14px',
            color: '#757575',
            lineHeight: '1.5',
          }}
        >
          {t('auth.tagline') || 'Construction Materials Marketplace'}
        </p>
      </div>

      {/* Form Card */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
          padding: '24px',
        }}
      >
        {/* Toggle Tabs */}
        <div
          style={{
            display: 'flex',
            borderBottom: '2px solid #E5E7EB',
            marginBottom: '24px',
          }}
        >
          <button
            type="button"
            onClick={() => {
              setIsLogin(true);
              setError('');
            }}
            style={{
              flex: 1,
              padding: '12px',
              fontSize: '16px',
              fontWeight: 600,
              color: isLogin ? '#2563EB' : '#6B7280',
              backgroundColor: 'transparent',
              border: 'none',
              borderBottom: isLogin ? '3px solid #2563EB' : 'none',
              cursor: 'pointer',
              transition: 'all 200ms ease',
            }}
          >
            {t('auth.login') || 'Login'}
          </button>
          <button
            type="button"
            onClick={() => {
              setIsLogin(false);
              setError('');
            }}
            style={{
              flex: 1,
              padding: '12px',
              fontSize: '16px',
              fontWeight: 600,
              color: !isLogin ? '#2563EB' : '#6B7280',
              backgroundColor: 'transparent',
              border: 'none',
              borderBottom: !isLogin ? '3px solid #2563EB' : 'none',
              cursor: 'pointer',
              transition: 'all 200ms ease',
            }}
          >
            {t('auth.register') || 'Register'}
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div
            style={{
              padding: '12px',
              marginBottom: '16px',
              backgroundColor: '#FEE2E2',
              border: '1px solid #FCA5A5',
              borderRadius: '6px',
              color: '#991B1B',
              fontSize: '14px',
            }}
          >
            {error}
          </div>
        )}

        {/* Login Form */}
        {isLogin ? (
          <form
            onSubmit={handleLogin}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: 500,
                  color: '#374151',
                  marginBottom: '6px',
                }}
              >
                {t('auth.emailOrPhone') || 'Email or Phone'}
              </label>
              <input
                type="text"
                required
                value={loginData.identifier}
                onChange={(e) =>
                  setLoginData({ ...loginData, identifier: e.target.value })
                }
                disabled={loading}
                placeholder={t('auth.emailOrPhonePlaceholder') || 'Enter your email or phone'}
                style={{
                  width: '100%',
                  height: '48px',
                  padding: '0 12px',
                  fontSize: '16px',
                  border: '1px solid #D1D5DB',
                  borderRadius: '6px',
                  outline: 'none',
                  transition: 'border-color 200ms ease',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#2563EB';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#D1D5DB';
                }}
              />
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: 500,
                  color: '#374151',
                  marginBottom: '6px',
                }}
              >
                {t('auth.password') || 'Password'}
              </label>
              <input
                type="password"
                required
                value={loginData.password}
                onChange={(e) =>
                  setLoginData({ ...loginData, password: e.target.value })
                }
                disabled={loading}
                placeholder={t('auth.passwordPlaceholder') || 'Enter your password'}
                style={{
                  width: '100%',
                  height: '48px',
                  padding: '0 12px',
                  fontSize: '16px',
                  border: '1px solid #D1D5DB',
                  borderRadius: '6px',
                  outline: 'none',
                  transition: 'border-color 200ms ease',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#2563EB';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#D1D5DB';
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                height: '48px',
                backgroundColor: loading ? '#BDBDBD' : '#2563EB',
                color: '#FFFFFF',
                fontSize: '16px',
                fontWeight: 600,
                border: 'none',
                borderRadius: '8px',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'background-color 200ms ease',
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.backgroundColor = '#1D4ED8';
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.currentTarget.style.backgroundColor = '#2563EB';
                }
              }}
            >
              {loading && <LoadingSpinner size={20} color="#FFFFFF" />}
              {loading ? t('auth.loggingIn') || 'Logging in...' : t('auth.login') || 'Login'}
            </button>
          </form>
        ) : (
          /* Register Form */
          <form
            onSubmit={handleRegister}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: 500,
                  color: '#374151',
                  marginBottom: '6px',
                }}
              >
                {t('auth.email') || 'Email'} *
              </label>
              <input
                type="email"
                required
                value={registerData.email}
                onChange={(e) =>
                  setRegisterData({ ...registerData, email: e.target.value })
                }
                disabled={loading}
                placeholder="your@email.com"
                style={{
                  width: '100%',
                  height: '48px',
                  padding: '0 12px',
                  fontSize: '16px',
                  border: '1px solid #D1D5DB',
                  borderRadius: '6px',
                  outline: 'none',
                  transition: 'border-color 200ms ease',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#2563EB';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#D1D5DB';
                }}
              />
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: 500,
                  color: '#374151',
                  marginBottom: '6px',
                }}
              >
                {t('auth.phone') || 'Phone'} ({t('common.optional') || 'optional'})
              </label>
              <input
                type="tel"
                value={registerData.phone}
                onChange={(e) =>
                  setRegisterData({ ...registerData, phone: e.target.value })
                }
                disabled={loading}
                placeholder="+995555123456"
                style={{
                  width: '100%',
                  height: '48px',
                  padding: '0 12px',
                  fontSize: '16px',
                  border: '1px solid #D1D5DB',
                  borderRadius: '6px',
                  outline: 'none',
                  transition: 'border-color 200ms ease',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#2563EB';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#D1D5DB';
                }}
              />
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: 500,
                  color: '#374151',
                  marginBottom: '6px',
                }}
              >
                {t('auth.fullName') || 'Full Name'} *
              </label>
              <input
                type="text"
                required
                value={registerData.name}
                onChange={(e) =>
                  setRegisterData({ ...registerData, name: e.target.value })
                }
                disabled={loading}
                placeholder={t('auth.fullNamePlaceholder') || 'John Doe'}
                style={{
                  width: '100%',
                  height: '48px',
                  padding: '0 12px',
                  fontSize: '16px',
                  border: '1px solid #D1D5DB',
                  borderRadius: '6px',
                  outline: 'none',
                  transition: 'border-color 200ms ease',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#2563EB';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#D1D5DB';
                }}
              />
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: 500,
                  color: '#374151',
                  marginBottom: '6px',
                }}
              >
                {t('auth.password') || 'Password'} * ({t('auth.minChars') || 'min 6 characters'})
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={registerData.password}
                onChange={(e) =>
                  setRegisterData({ ...registerData, password: e.target.value })
                }
                disabled={loading}
                placeholder="••••••"
                style={{
                  width: '100%',
                  height: '48px',
                  padding: '0 12px',
                  fontSize: '16px',
                  border: '1px solid #D1D5DB',
                  borderRadius: '6px',
                  outline: 'none',
                  transition: 'border-color 200ms ease',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#2563EB';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#D1D5DB';
                }}
              />
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: 500,
                  color: '#374151',
                  marginBottom: '6px',
                }}
              >
                {t('auth.confirmPassword') || 'Confirm Password'} *
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={registerData.confirmPassword}
                onChange={(e) =>
                  setRegisterData({ ...registerData, confirmPassword: e.target.value })
                }
                disabled={loading}
                placeholder="••••••"
                style={{
                  width: '100%',
                  height: '48px',
                  padding: '0 12px',
                  fontSize: '16px',
                  border: '1px solid #D1D5DB',
                  borderRadius: '6px',
                  outline: 'none',
                  transition: 'border-color 200ms ease',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#2563EB';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#D1D5DB';
                }}
              />
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: 500,
                  color: '#374151',
                  marginBottom: '6px',
                }}
              >
                {t('auth.accountType') || 'Account Type'} *
              </label>
              <select
                value={registerData.user_type}
                onChange={(e) =>
                  setRegisterData({
                    ...registerData,
                    user_type: e.target.value as 'buyer' | 'supplier',
                  })
                }
                disabled={loading}
                style={{
                  width: '100%',
                  height: '48px',
                  padding: '0 12px',
                  fontSize: '16px',
                  border: '1px solid #D1D5DB',
                  borderRadius: '6px',
                  outline: 'none',
                  backgroundColor: '#FFFFFF',
                  cursor: 'pointer',
                  transition: 'border-color 200ms ease',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#2563EB';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#D1D5DB';
                }}
              >
                <option value="buyer">{t('auth.buyer') || 'Buyer'}</option>
                <option value="supplier">{t('auth.supplier') || 'Supplier'}</option>
              </select>
            </div>

            {registerData.user_type === 'buyer' && (
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: 500,
                    color: '#374151',
                    marginBottom: '6px',
                  }}
                >
                  {t('auth.buyerRole') || 'Buyer Role'} *
                </label>
                <select
                  value={registerData.buyer_role}
                  onChange={(e) =>
                    setRegisterData({
                      ...registerData,
                      buyer_role: e.target.value as 'homeowner' | 'contractor',
                    })
                  }
                  disabled={loading}
                  style={{
                    width: '100%',
                    height: '48px',
                    padding: '0 12px',
                    fontSize: '16px',
                    border: '1px solid #D1D5DB',
                    borderRadius: '6px',
                    outline: 'none',
                    backgroundColor: '#FFFFFF',
                    cursor: 'pointer',
                    transition: 'border-color 200ms ease',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#2563EB';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#D1D5DB';
                  }}
                >
                  <option value="homeowner">{t('auth.homeowner') || 'Homeowner'}</option>
                  <option value="contractor">{t('auth.contractor') || 'Contractor'}</option>
                </select>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                height: '48px',
                backgroundColor: loading ? '#BDBDBD' : '#2563EB',
                color: '#FFFFFF',
                fontSize: '16px',
                fontWeight: 600,
                border: 'none',
                borderRadius: '8px',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'background-color 200ms ease',
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.backgroundColor = '#1D4ED8';
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.currentTarget.style.backgroundColor = '#2563EB';
                }
              }}
            >
              {loading && <LoadingSpinner size={20} color="#FFFFFF" />}
              {loading
                ? t('auth.creatingAccount') || 'Creating Account...'
                : t('auth.register') || 'Register'}
            </button>
          </form>
        )}
      </div>

      {/* Footer */}
      <p
        style={{
          marginTop: '16px',
          textAlign: 'center',
          fontSize: '12px',
          color: '#757575',
        }}
      >
        {t('auth.termsText') ||
          "By continuing, you agree to buildApp's Terms of Service and Privacy Policy"}
      </p>
    </AuthCard>
  );
}
