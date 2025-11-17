import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AuthCard } from '../../components/auth/AuthCard';
import { PillButton } from '../../components/auth/PillButton';
import { LoadingSpinner } from '../../components/auth/LoadingSpinner';
import { completeRegistration } from '../../services/authApi';
import { useAuth } from '../../context/AuthContext';

interface LocationState {
  temp_token?: string;
  phone?: string;
}

export default function CompleteRegistration() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const { login } = useAuth();

  const state = location.state as LocationState;
  const tempToken = state?.temp_token;
  const phone = state?.phone;

  const [name, setName] = useState('');
  const [userType, setUserType] = useState<'buyer' | 'supplier' | null>(null);
  const [buyerRole, setBuyerRole] = useState<'homeowner' | 'contractor' | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Redirect if no temp token
  useEffect(() => {
    if (!tempToken) {
      navigate('/login');
    }
  }, [tempToken, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate name
    if (!name || name.trim().length < 2) {
      setError(t('auth.nameTooShort'));
      return;
    }

    if (name.length > 100) {
      setError(t('auth.nameTooLong'));
      return;
    }

    // Validate user type
    if (!userType) {
      setError('Please select a user type');
      return;
    }

    // Validate buyer role if user is a buyer
    if (userType === 'buyer' && !buyerRole) {
      setError('Please select your role');
      return;
    }

    if (!tempToken) {
      setError('Session expired. Please login again.');
      setTimeout(() => navigate('/login'), 2000);
      return;
    }

    setLoading(true);

    try {
      const response = await completeRegistration(
        tempToken,
        name.trim(),
        userType,
        buyerRole || undefined,
        i18n.language as 'ka' | 'en'
      );

      // Log in with the returned token
      login(response.token, response.user);

      // Redirect based on user type
      if (userType === 'supplier') {
        navigate('/supplier/dashboard');
      } else {
        navigate('/home');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  if (!tempToken) {
    return null; // Will redirect in useEffect
  }

  const isFormValid = name.trim().length >= 2 && userType && (userType === 'supplier' || buyerRole);

  // Icons as SVG components
  const ShoppingCartIcon = () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
      <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
    </svg>
  );

  const FactoryIcon = () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M3 3a1 1 0 011-1h2a1 1 0 011 1v2h4V3a1 1 0 011-1h2a1 1 0 011 1v6.586l3.707 3.707A1 1 0 0118 14v4a1 1 0 01-1 1H3a1 1 0 01-1-1V4a1 1 0 011-1zm3 2v2h4V5H6zm0 4v2h4V9H6zm-2 6h12v-2H4v2z" clipRule="evenodd" />
    </svg>
  );

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
          {t('auth.completeProfileTitle')}
        </h1>
        {phone && (
          <p style={{
            fontSize: '14px',
            color: '#757575',
          }}>
            {phone}
          </p>
        )}
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
          gap: '20px',
        }}>
          {/* Name Input */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: 500,
              marginBottom: '8px',
              color: '#222',
            }}>
              {t('auth.nameLabel')}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('auth.namePlaceholder')}
              disabled={loading}
              style={{
                width: '100%',
                height: '48px',
                padding: '0 12px',
                fontSize: '16px',
                border: '1px solid #E6E6E6',
                borderRadius: '8px',
                outline: 'none',
                backgroundColor: loading ? '#F2F2F2' : '#FFFFFF',
                color: '#222',
                transition: 'border-color 200ms ease',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#2563EB';
                e.target.style.borderWidth = '2px';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#E6E6E6';
                e.target.style.borderWidth = '1px';
              }}
            />
          </div>

          {/* User Type Selection */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: 500,
              marginBottom: '8px',
              color: '#222',
            }}>
              {t('auth.userTypeLabel')}
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <PillButton
                selected={userType === 'buyer'}
                onClick={() => {
                  setUserType('buyer');
                  setBuyerRole(null); // Reset buyer role
                }}
                icon={<ShoppingCartIcon />}
                disabled={loading}
              >
                {t('auth.userTypeBuyer')}
              </PillButton>
              <PillButton
                selected={userType === 'supplier'}
                onClick={() => {
                  setUserType('supplier');
                  setBuyerRole(null); // Clear buyer role
                }}
                icon={<FactoryIcon />}
                disabled={loading}
              >
                {t('auth.userTypeSupplier')}
              </PillButton>
            </div>
          </div>

          {/* Buyer Role Selection (shown only if buyer selected) */}
          {userType === 'buyer' && (
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: 500,
                marginBottom: '8px',
                color: '#222',
              }}>
                {t('auth.buyerRoleLabel')}
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <div style={{ flex: 1 }}>
                  <PillButton
                    selected={buyerRole === 'homeowner'}
                    onClick={() => setBuyerRole('homeowner')}
                    size="small"
                    disabled={loading}
                  >
                    {t('auth.buyerRoleHomeowner')}
                  </PillButton>
                </div>
                <div style={{ flex: 1 }}>
                  <PillButton
                    selected={buyerRole === 'contractor'}
                    onClick={() => setBuyerRole('contractor')}
                    size="small"
                    disabled={loading}
                  >
                    {t('auth.buyerRoleContractor')}
                  </PillButton>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <p style={{
              fontSize: '14px',
              color: '#DC2626',
              textAlign: 'center',
              margin: 0,
            }}>
              {error}
            </p>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !isFormValid}
            style={{
              width: '100%',
              height: '48px',
              backgroundColor: loading || !isFormValid ? '#BDBDBD' : '#2563EB',
              color: '#FFFFFF',
              fontSize: '16px',
              fontWeight: 600,
              border: 'none',
              borderRadius: '8px',
              cursor: loading || !isFormValid ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'background-color 200ms ease',
            }}
            onMouseEnter={(e) => {
              if (!loading && isFormValid) {
                e.currentTarget.style.backgroundColor = '#1D4ED8';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading && isFormValid) {
                e.currentTarget.style.backgroundColor = '#2563EB';
              }
            }}
          >
            {loading && <LoadingSpinner size={20} color="#FFFFFF" />}
            {loading ? t('auth.registering') : t('auth.getStarted')}
          </button>
        </form>
      </div>
    </AuthCard>
  );
}
