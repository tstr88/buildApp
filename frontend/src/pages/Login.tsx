import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PhoneInput from '../components/PhoneInput';
import OTPInput from '../components/OTPInput';
import { requestOTP, verifyOTP } from '../services/authApi';
import { useAuth } from '../context/AuthContext';

type Step = 'phone' | 'otp';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [otpExpiry, setOtpExpiry] = useState<number>(0);
  const [remainingAttempts, setRemainingAttempts] = useState<number>(3);

  // Handle phone submission
  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!phone || phone.length !== 13) {
      setError('გთხოვთ შეიყვანოთ სწორი ტელეფონის ნომერი / Please enter a valid phone number');
      return;
    }

    setLoading(true);

    try {
      const response = await requestOTP(phone);
      setOtpExpiry(response.expiresIn);
      setRemainingAttempts(response.remainingAttempts);
      setStep('otp');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  // Handle OTP verification
  const handleOTPSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (otp.length !== 6) {
      setError('გთხოვთ შეიყვანოთ 6-ნიშნა კოდი / Please enter the 6-digit code');
      return;
    }

    setLoading(true);

    try {
      const response = await verifyOTP(phone, otp);

      if (response.registration_required && response.temp_token) {
        // New user - redirect to registration
        navigate('/register', { state: { temp_token: response.temp_token, phone } });
      } else if (response.token && response.user) {
        // Existing user - log in
        login(response.token, response.user);
        navigate('/');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Verification failed';
      setError(errorMessage);

      // If invalid OTP, allow retry
      if (errorMessage.includes('Invalid OTP') || errorMessage.includes('attempts')) {
        setOtp(''); // Clear OTP for retry
      }
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOTP = async () => {
    setError('');
    setOtp('');
    setLoading(true);

    try {
      const response = await requestOTP(phone);
      setOtpExpiry(response.expiresIn);
      setRemainingAttempts(response.remainingAttempts);
      setError(''); // Clear previous errors
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  // Go back to phone step
  const handleBackToPhone = () => {
    setStep('phone');
    setOtp('');
    setError('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-concrete-light)] px-4">
      <div className="max-w-md w-full">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-[var(--color-charcoal)] mb-2">buildApp</h1>
          <p className="text-gray-600">
            {step === 'phone'
              ? 'შედით ანგარიშზე / Sign In'
              : 'დაადასტურეთ ნომერი / Verify Number'}
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {step === 'phone' ? (
            <form onSubmit={handlePhoneSubmit} className="space-y-6">
              <PhoneInput
                value={phone}
                onChange={setPhone}
                error={error}
                disabled={loading}
              />

              <button
                type="submit"
                disabled={loading || phone.length !== 13}
                className={`
                  w-full py-3 px-6
                  bg-[var(--color-action)] text-white
                  rounded-lg font-semibold
                  transition-all
                  disabled:opacity-50 disabled:cursor-not-allowed
                  hover:bg-blue-700
                  focus:outline-none focus:ring-2 focus:ring-[var(--color-action)] focus:ring-offset-2
                `}
              >
                {loading ? 'იგზავნება... / Sending...' : 'გაგრძელება / Continue'}
              </button>

              <p className="text-sm text-gray-600 text-center">
                კოდი გამოიგზავნება SMS-ით
                <br />
                Code will be sent via SMS
              </p>
            </form>
          ) : (
            <form onSubmit={handleOTPSubmit} className="space-y-6">
              <div>
                <p className="text-sm text-gray-600 mb-4 text-center">
                  კოდი გამოგზავნილია ნომერზე
                  <br />
                  Code sent to
                  <br />
                  <span className="font-semibold text-[var(--color-charcoal)]">{phone}</span>
                </p>
              </div>

              <OTPInput
                value={otp}
                onChange={setOtp}
                error={error}
                disabled={loading}
              />

              {remainingAttempts < 3 && !error && (
                <p className="text-sm text-gray-600 text-center">
                  {remainingAttempts} attempts remaining / დარჩა {remainingAttempts} მცდელობა
                </p>
              )}

              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className={`
                  w-full py-3 px-6
                  bg-[var(--color-action)] text-white
                  rounded-lg font-semibold
                  transition-all
                  disabled:opacity-50 disabled:cursor-not-allowed
                  hover:bg-blue-700
                  focus:outline-none focus:ring-2 focus:ring-[var(--color-action)] focus:ring-offset-2
                `}
              >
                {loading ? 'მოწმდება... / Verifying...' : 'დადასტურება / Verify'}
              </button>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleBackToPhone}
                  disabled={loading}
                  className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  უკან / Back
                </button>
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={loading}
                  className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  ხელახლა გაგზავნა / Resend
                </button>
              </div>

              {otpExpiry > 0 && (
                <p className="text-xs text-gray-500 text-center">
                  კოდი ძალაშია {Math.floor(otpExpiry / 60)} წუთის განმავლობაში
                  <br />
                  Code valid for {Math.floor(otpExpiry / 60)} minutes
                </p>
              )}
            </form>
          )}
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-sm text-gray-600">
          ანგარიშის შექმნით თქვენ ეთანხმებით <br />
          By continuing, you agree to our terms
        </p>
      </div>
    </div>
  );
}
