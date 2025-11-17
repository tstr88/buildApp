import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface RegistrationFormProps {
  onSubmit: (data: RegistrationData) => void;
  loading?: boolean;
  error?: string;
}

export interface RegistrationData {
  name: string;
  user_type: 'buyer' | 'supplier';
  buyer_role?: 'homeowner' | 'contractor';
}

export default function RegistrationForm({
  onSubmit,
  loading = false,
  error,
}: RegistrationFormProps) {
  const { t: _t } = useTranslation();
  const [formData, setFormData] = useState<RegistrationData>({
    name: '',
    user_type: 'buyer',
    buyer_role: 'homeowner',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof RegistrationData, string>>>({});

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof RegistrationData, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required / სახელი სავალდებულოა';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters / სახელი უნდა იყოს მინიმუმ 2 სიმბოლო';
    }

    if (formData.user_type === 'buyer' && !formData.buyer_role) {
      newErrors.buyer_role = 'Please select your role / გთხოვთ აირჩიოთ როლი';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validate()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Name Input */}
      <div>
        <label className="block text-sm font-medium mb-2 text-[var(--color-charcoal)]">
          სახელი / Name *
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          disabled={loading}
          placeholder="Enter your name"
          className={`
            block w-full px-4 py-3
            border rounded-lg
            focus:outline-none focus:ring-2
            disabled:opacity-50 disabled:cursor-not-allowed
            ${
              errors.name
                ? 'border-red-500 focus:ring-red-500'
                : 'border-[var(--color-concrete)] focus:ring-[var(--color-action)]'
            }
          `}
        />
        {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
      </div>

      {/* User Type Selection */}
      <div>
        <label className="block text-sm font-medium mb-3 text-[var(--color-charcoal)]">
          აირჩიეთ ტიპი / Select Type *
        </label>
        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => setFormData({ ...formData, user_type: 'buyer', buyer_role: 'homeowner' })}
            disabled={loading}
            className={`
              p-4 border-2 rounded-lg text-center
              transition-all
              disabled:opacity-50 disabled:cursor-not-allowed
              ${
                formData.user_type === 'buyer'
                  ? 'border-[var(--color-action)] bg-blue-50'
                  : 'border-[var(--color-concrete)] hover:border-[var(--color-action)]'
              }
            `}
          >
            <div className="text-2xl mb-2">🏠</div>
            <div className="font-semibold">მყიდველი</div>
            <div className="text-sm text-gray-600">Buyer</div>
          </button>

          <button
            type="button"
            onClick={() => setFormData({ ...formData, user_type: 'supplier', buyer_role: undefined })}
            disabled={loading}
            className={`
              p-4 border-2 rounded-lg text-center
              transition-all
              disabled:opacity-50 disabled:cursor-not-allowed
              ${
                formData.user_type === 'supplier'
                  ? 'border-[var(--color-action)] bg-blue-50'
                  : 'border-[var(--color-concrete)] hover:border-[var(--color-action)]'
              }
            `}
          >
            <div className="text-2xl mb-2">🏗️</div>
            <div className="font-semibold">მიმწოდებელი</div>
            <div className="text-sm text-gray-600">Supplier</div>
          </button>
        </div>
      </div>

      {/* Buyer Role Selection (only if user_type is buyer) */}
      {formData.user_type === 'buyer' && (
        <div>
          <label className="block text-sm font-medium mb-3 text-[var(--color-charcoal)]">
            როლი / Role *
          </label>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, buyer_role: 'homeowner' })}
              disabled={loading}
              className={`
                p-4 border-2 rounded-lg text-center
                transition-all
                disabled:opacity-50 disabled:cursor-not-allowed
                ${
                  formData.buyer_role === 'homeowner'
                    ? 'border-[var(--color-success)] bg-green-50'
                    : 'border-[var(--color-concrete)] hover:border-[var(--color-success)]'
                }
              `}
            >
              <div className="text-2xl mb-2">👤</div>
              <div className="font-semibold">მესაკუთრე</div>
              <div className="text-sm text-gray-600">Homeowner</div>
            </button>

            <button
              type="button"
              onClick={() => setFormData({ ...formData, buyer_role: 'contractor' })}
              disabled={loading}
              className={`
                p-4 border-2 rounded-lg text-center
                transition-all
                disabled:opacity-50 disabled:cursor-not-allowed
                ${
                  formData.buyer_role === 'contractor'
                    ? 'border-[var(--color-success)] bg-green-50'
                    : 'border-[var(--color-concrete)] hover:border-[var(--color-success)]'
                }
              `}
            >
              <div className="text-2xl mb-2">👷</div>
              <div className="font-semibold">კონტრაქტორი</div>
              <div className="text-sm text-gray-600">Contractor</div>
            </button>
          </div>
          {errors.buyer_role && (
            <p className="mt-1 text-sm text-red-500">{errors.buyer_role}</p>
          )}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
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
        {loading ? 'რეგისტრაცია... / Registering...' : 'რეგისტრაცია / Register'}
      </button>
    </form>
  );
}
