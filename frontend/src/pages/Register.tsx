import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import RegistrationForm, { type RegistrationData } from '../components/RegistrationForm';
import { completeRegistration } from '../services/authApi';
import { useAuth } from '../context/AuthContext';

interface LocationState {
  temp_token?: string;
  phone?: string;
}

export default function Register() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { i18n } = useTranslation();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const state = location.state as LocationState;
  const tempToken = state?.temp_token;
  const phone = state?.phone;

  // Redirect if no temp token
  useEffect(() => {
    if (!tempToken) {
      navigate('/login');
    }
  }, [tempToken, navigate]);

  const handleSubmit = async (data: RegistrationData) => {
    if (!tempToken) {
      setError('Session expired. Please login again.');
      setTimeout(() => navigate('/login'), 2000);
      return;
    }

    setError('');
    setLoading(true);

    try {
      const response = await completeRegistration(
        tempToken,
        data.name,
        data.user_type,
        data.buyer_role,
        i18n.language as 'ka' | 'en'
      );

      // Log in with the returned token
      login(response.token, response.user);

      // Redirect to home or onboarding
      navigate('/');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  if (!tempToken) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-concrete-light)] px-4">
      <div className="max-w-md w-full">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-[var(--color-charcoal)] mb-2">buildApp</h1>
          <p className="text-gray-600">დასრულეთ რეგისტრაცია / Complete Registration</p>
          {phone && (
            <p className="text-sm text-gray-500 mt-2">
              ნომერი: {phone}
            </p>
          )}
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <RegistrationForm
            onSubmit={handleSubmit}
            loading={loading}
            error={error}
          />
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-sm text-gray-600">
          უკვე გაქვთ ანგარიში? <br />
          Already have an account?{' '}
          <button
            onClick={() => navigate('/login')}
            className="text-[var(--color-action)] font-semibold hover:underline"
          >
            შესვლა / Sign In
          </button>
        </p>
      </div>
    </div>
  );
}
