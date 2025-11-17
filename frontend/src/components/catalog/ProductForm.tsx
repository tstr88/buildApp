/**
 * Product Form Component
 * Add/Edit product in supplier catalog with Direct Order controls
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Upload, Zap, AlertCircle, Truck, Package, Calendar } from 'lucide-react';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme/tokens';
import { translateText, debounce } from '../../utils/translation';

interface ProductFormProps {
  sku?: any; // SKU to edit, null for new product
  onClose: () => void;
  onSaved: () => void;
}

const ProductForm: React.FC<ProductFormProps> = ({ sku, onClose, onSaved }) => {
  const { t, i18n } = useTranslation();
  const isGeorgian = i18n.language === 'ka';
  const isEdit = !!sku;

  // Responsive check
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Form state
  const [formData, setFormData] = useState({
    name_ka: '',
    name_en: '',
    spec_string_ka: '',
    spec_string_en: '',
    category_ka: '',
    category_en: '',
    unit_ka: '',
    unit_en: '',
    base_price: '',
    description_ka: '',
    description_en: '',
    direct_order_available: true,
    delivery_options: 'both' as 'pickup' | 'delivery' | 'both',
    approx_lead_time_label: 'next_day',
    custom_lead_time: '',
    negotiable: false,
    min_order_quantity: '',
    images: [] as string[],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [saveAndAddAnother, setSaveAndAddAnother] = useState(false);

  // Hover states
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Auto-translation state
  const [translating, setTranslating] = useState<Record<string, boolean>>({});
  const [autoTranslated, setAutoTranslated] = useState<Record<string, boolean>>({});
  const translationTimeouts = useRef<Record<string, NodeJS.Timeout>>({});

  // Load SKU data if editing
  useEffect(() => {
    if (sku) {
      setFormData({
        name_ka: sku.name_ka || '',
        name_en: sku.name_en || '',
        spec_string_ka: sku.spec_string_ka || '',
        spec_string_en: sku.spec_string_en || '',
        category_ka: sku.category_ka || '',
        category_en: sku.category_en || '',
        unit_ka: sku.unit_ka || '',
        unit_en: sku.unit_en || '',
        base_price: sku.base_price?.toString() || '',
        description_ka: sku.description_ka || '',
        description_en: sku.description_en || '',
        direct_order_available: sku.direct_order_available !== false,
        delivery_options: sku.delivery_options || 'both',
        approx_lead_time_label: sku.approx_lead_time_label || 'next_day',
        custom_lead_time: '',
        negotiable: sku.negotiable || false,
        min_order_quantity: sku.min_order_quantity?.toString() || '',
        images: sku.images || [],
      });
    }
  }, [sku]);

  // Auto-translate field handler
  const handleAutoTranslate = useCallback(async (
    sourceField: string,
    targetField: string,
    sourceLang: 'ka' | 'en',
    targetLang: 'ka' | 'en',
    value: string
  ) => {
    // Clear any existing timeout for this field
    if (translationTimeouts.current[targetField]) {
      clearTimeout(translationTimeouts.current[targetField]);
    }

    // Don't translate if empty
    if (!value || value.trim() === '') {
      return;
    }

    // Don't auto-translate if target field was manually edited
    if (formData[targetField as keyof typeof formData] && !autoTranslated[targetField]) {
      return;
    }

    // Debounce translation (wait 1 second after user stops typing)
    translationTimeouts.current[targetField] = setTimeout(async () => {
      setTranslating((prev) => ({ ...prev, [targetField]: true }));

      try {
        const translated = await translateText(value, sourceLang, targetLang);
        setFormData((prev) => ({ ...prev, [targetField]: translated }));
        setAutoTranslated((prev) => ({ ...prev, [targetField]: true }));
      } catch (error) {
        console.error('Translation failed:', error);
      } finally {
        setTranslating((prev) => ({ ...prev, [targetField]: false }));
      }
    }, 1000);
  }, [formData, autoTranslated]);

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Mark as manually edited if user changes an auto-translated field
    if (autoTranslated[field]) {
      setAutoTranslated((prev) => ({ ...prev, [field]: false }));
    }

    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }

    // Auto-translate to other language
    if (field === 'name_en') {
      handleAutoTranslate('name_en', 'name_ka', 'en', 'ka', value);
    } else if (field === 'name_ka') {
      handleAutoTranslate('name_ka', 'name_en', 'ka', 'en', value);
    } else if (field === 'spec_string_en') {
      handleAutoTranslate('spec_string_en', 'spec_string_ka', 'en', 'ka', value);
    } else if (field === 'spec_string_ka') {
      handleAutoTranslate('spec_string_ka', 'spec_string_en', 'ka', 'en', value);
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name_ka.trim()) {
      newErrors.name_ka = t('catalog.productForm.nameRequired');
    }
    if (!formData.name_en.trim()) {
      newErrors.name_en = t('catalog.productForm.nameRequired');
    }
    if (!formData.category_ka || !formData.category_en) {
      newErrors.category = t('catalog.productForm.categoryRequired');
    }
    if (!formData.unit_ka || !formData.unit_en) {
      newErrors.unit = t('catalog.productForm.unitRequired');
    }
    if (!formData.base_price || parseFloat(formData.base_price) <= 0) {
      newErrors.base_price = t('catalog.productForm.basePriceRequired');
    }
    if (formData.direct_order_available && !formData.delivery_options) {
      newErrors.delivery_options = t('catalog.productForm.deliveryOptionsRequired');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setLoading(true);

    try {
      const payload = {
        name_ka: formData.name_ka.trim(),
        name_en: formData.name_en.trim(),
        spec_string_ka: formData.spec_string_ka.trim() || null,
        spec_string_en: formData.spec_string_en.trim() || null,
        category_ka: formData.category_ka,
        category_en: formData.category_en,
        unit_ka: formData.unit_ka,
        unit_en: formData.unit_en,
        base_price: parseFloat(formData.base_price),
        description_ka: formData.description_ka.trim() || null,
        description_en: formData.description_en.trim() || null,
        direct_order_available: formData.direct_order_available,
        delivery_options: formData.direct_order_available ? formData.delivery_options : null,
        approx_lead_time_label:
          formData.direct_order_available && formData.approx_lead_time_label === 'custom'
            ? formData.custom_lead_time
            : formData.direct_order_available
            ? formData.approx_lead_time_label
            : null,
        negotiable: formData.negotiable,
        min_order_quantity: formData.min_order_quantity ? parseFloat(formData.min_order_quantity) : null,
        images: formData.images,
      };

      const token = localStorage.getItem('buildapp_auth_token');
      const url = isEdit
        ? `http://localhost:3001/api/suppliers/catalog/skus/${sku.id}`
        : 'http://localhost:3001/api/suppliers/catalog/skus';

      const response = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save product');
      }

      if (saveAndAddAnother && !isEdit) {
        // Reset form for another entry
        setFormData({
          name_ka: '',
          name_en: '',
          spec_string_ka: '',
          spec_string_en: '',
          category_ka: formData.category_ka, // Keep category
          category_en: formData.category_en,
          unit_ka: formData.unit_ka, // Keep unit
          unit_en: formData.unit_en,
          base_price: '',
          description_ka: '',
          description_en: '',
          direct_order_available: formData.direct_order_available, // Keep Direct Order settings
          delivery_options: formData.delivery_options,
          approx_lead_time_label: formData.approx_lead_time_label,
          custom_lead_time: '',
          negotiable: false,
          min_order_quantity: '',
          images: [],
        });
        setSaveAndAddAnother(false);
      } else {
        onSaved();
      }
    } catch (err: any) {
      console.error('Error saving product:', err);
      setErrors({ submit: err.message || t('messages.error') });
    } finally {
      setLoading(false);
    }
  };

  // Category options
  const categories = [
    { ka: 'ბეტონი', en: 'Concrete' },
    { ka: 'ცემენტი', en: 'Cement' },
    { ka: 'ფოლადი', en: 'Steel' },
    { ka: 'აგური', en: 'Brick' },
    { ka: 'ქვა', en: 'Stone' },
    { ka: 'ქვიშა', en: 'Sand' },
    { ka: 'ხრეში', en: 'Gravel' },
  ];

  // Unit options
  const units = [
    { ka: 'მ³', en: 'm³' },
    { ka: 'მ²', en: 'm²' },
    { ka: 'მ', en: 'm' },
    { ka: 'ცალი', en: 'pcs' },
    { ka: 'კგ', en: 'kg' },
    { ka: 'ტონა', en: 'ton' },
    { ka: 'ტომარა', en: 'bag' },
    { ka: 'ყუთი', en: 'box' },
  ];

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'center',
      zIndex: 50,
      padding: spacing[4],
      overflowY: 'auto',
    }}>
      <div style={{
        backgroundColor: colors.background.primary,
        borderRadius: borderRadius.lg,
        maxWidth: '56rem',
        width: '100%',
        margin: `${spacing[8]} auto`,
        maxHeight: 'calc(100vh - 4rem)',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: spacing[6],
          borderBottom: `1px solid ${colors.border.light}`,
        }}>
          <h2 style={{
            fontSize: typography.fontSize.xl,
            fontWeight: typography.fontWeight.bold,
            color: colors.text.primary,
          }}>
            {isEdit ? t('catalog.editProduct') : t('catalog.addProduct')}
          </h2>
          <button
            onClick={onClose}
            onMouseEnter={() => setHoveredButton('close')}
            onMouseLeave={() => setHoveredButton(null)}
            style={{
              color: hoveredButton === 'close' ? colors.neutral[600] : colors.neutral[400],
              cursor: loading ? 'not-allowed' : 'pointer',
              background: 'none',
              border: 'none',
              padding: 0,
            }}
            disabled={loading}
          >
            <X style={{ width: spacing[6], height: spacing[6] }} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{
          padding: spacing[6],
          overflowY: 'auto',
          flex: 1,
        }}>
          {/* Product Name */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
            gap: spacing[4],
            marginBottom: spacing[6],
          }}>
            <div>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: spacing[2],
                fontSize: typography.fontSize.sm,
                fontWeight: typography.fontWeight.medium,
                color: colors.text.secondary,
                marginBottom: spacing[1],
              }}>
                <span>{t('catalog.productName')} (ქართული) *</span>
                {translating.name_ka && (
                  <span style={{
                    fontSize: typography.fontSize.xs,
                    color: colors.primary[600],
                    fontStyle: 'italic',
                  }}>
                    Auto-translating...
                  </span>
                )}
                {autoTranslated.name_ka && !translating.name_ka && (
                  <span style={{
                    fontSize: typography.fontSize.xs,
                    color: colors.success[600],
                    fontStyle: 'italic',
                  }}>
                    ✓ Auto-translated
                  </span>
                )}
              </label>
              <input
                type="text"
                value={formData.name_ka}
                onChange={(e) => handleChange('name_ka', e.target.value)}
                placeholder={t('catalog.productForm.namePlaceholder')}
                style={{
                  width: '100%',
                  padding: `${spacing[2]} ${spacing[3]}`,
                  border: `1px solid ${errors.name_ka ? colors.error[500] : colors.border.default}`,
                  borderRadius: borderRadius.lg,
                  fontSize: typography.fontSize.base,
                  outline: 'none',
                }}
                onFocus={(e) => {
                  if (!errors.name_ka) {
                    e.target.style.borderColor = colors.info[500];
                    e.target.style.boxShadow = `0 0 0 3px ${colors.info[50]}`;
                  }
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = errors.name_ka ? colors.error[500] : colors.border.default;
                  e.target.style.boxShadow = 'none';
                }}
              />
              {errors.name_ka && <p style={{
                color: colors.error[500],
                fontSize: typography.fontSize.xs,
                marginTop: spacing[1],
              }}>{errors.name_ka}</p>}
            </div>

            <div>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: spacing[2],
                fontSize: typography.fontSize.sm,
                fontWeight: typography.fontWeight.medium,
                color: colors.text.secondary,
                marginBottom: spacing[1],
              }}>
                <span>{t('catalog.productName')} (English) *</span>
                {translating.name_en && (
                  <span style={{
                    fontSize: typography.fontSize.xs,
                    color: colors.primary[600],
                    fontStyle: 'italic',
                  }}>
                    Auto-translating...
                  </span>
                )}
                {autoTranslated.name_en && !translating.name_en && (
                  <span style={{
                    fontSize: typography.fontSize.xs,
                    color: colors.success[600],
                    fontStyle: 'italic',
                  }}>
                    ✓ Auto-translated
                  </span>
                )}
              </label>
              <input
                type="text"
                value={formData.name_en}
                onChange={(e) => handleChange('name_en', e.target.value)}
                placeholder="e.g., Concrete M300"
                style={{
                  width: '100%',
                  padding: `${spacing[2]} ${spacing[3]}`,
                  border: `1px solid ${errors.name_en ? colors.error[500] : colors.border.default}`,
                  borderRadius: borderRadius.lg,
                  fontSize: typography.fontSize.base,
                  outline: 'none',
                }}
                onFocus={(e) => {
                  if (!errors.name_en) {
                    e.target.style.borderColor = colors.info[500];
                    e.target.style.boxShadow = `0 0 0 3px ${colors.info[50]}`;
                  }
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = errors.name_en ? colors.error[500] : colors.border.default;
                  e.target.style.boxShadow = 'none';
                }}
              />
              {errors.name_en && <p style={{
                color: colors.error[500],
                fontSize: typography.fontSize.xs,
                marginTop: spacing[1],
              }}>{errors.name_en}</p>}
            </div>
          </div>

          {/* Specification */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
            gap: spacing[4],
            marginBottom: spacing[6],
          }}>
            <div>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: spacing[2],
                fontSize: typography.fontSize.sm,
                fontWeight: typography.fontWeight.medium,
                color: colors.text.secondary,
                marginBottom: spacing[1],
              }}>
                <span>{t('catalog.specString')} (ქართული)</span>
                {translating.spec_string_ka && (
                  <span style={{
                    fontSize: typography.fontSize.xs,
                    color: colors.primary[600],
                    fontStyle: 'italic',
                  }}>
                    Auto-translating...
                  </span>
                )}
                {autoTranslated.spec_string_ka && !translating.spec_string_ka && (
                  <span style={{
                    fontSize: typography.fontSize.xs,
                    color: colors.success[600],
                    fontStyle: 'italic',
                  }}>
                    ✓ Auto-translated
                  </span>
                )}
              </label>
              <input
                type="text"
                value={formData.spec_string_ka}
                onChange={(e) => handleChange('spec_string_ka', e.target.value)}
                placeholder={t('catalog.productForm.specStringPlaceholder')}
                style={{
                  width: '100%',
                  padding: `${spacing[2]} ${spacing[3]}`,
                  border: `1px solid ${colors.border.default}`,
                  borderRadius: borderRadius.lg,
                  fontSize: typography.fontSize.base,
                  outline: 'none',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = colors.info[500];
                  e.target.style.boxShadow = `0 0 0 3px ${colors.info[50]}`;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = colors.border.default;
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            <div>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: spacing[2],
                fontSize: typography.fontSize.sm,
                fontWeight: typography.fontWeight.medium,
                color: colors.text.secondary,
                marginBottom: spacing[1],
              }}>
                <span>{t('catalog.specString')} (English)</span>
                {translating.spec_string_en && (
                  <span style={{
                    fontSize: typography.fontSize.xs,
                    color: colors.primary[600],
                    fontStyle: 'italic',
                  }}>
                    Auto-translating...
                  </span>
                )}
                {autoTranslated.spec_string_en && !translating.spec_string_en && (
                  <span style={{
                    fontSize: typography.fontSize.xs,
                    color: colors.success[600],
                    fontStyle: 'italic',
                  }}>
                    ✓ Auto-translated
                  </span>
                )}
              </label>
              <input
                type="text"
                value={formData.spec_string_en}
                onChange={(e) => handleChange('spec_string_en', e.target.value)}
                placeholder="e.g., 15-20 slump, standard aggregate"
                style={{
                  width: '100%',
                  padding: `${spacing[2]} ${spacing[3]}`,
                  border: `1px solid ${colors.border.default}`,
                  borderRadius: borderRadius.lg,
                  fontSize: typography.fontSize.base,
                  outline: 'none',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = colors.info[500];
                  e.target.style.boxShadow = `0 0 0 3px ${colors.info[50]}`;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = colors.border.default;
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
          </div>

          {/* Category & Unit */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
            gap: spacing[4],
            marginBottom: spacing[6],
          }}>
            <div>
              <label style={{
                display: 'block',
                fontSize: typography.fontSize.sm,
                fontWeight: typography.fontWeight.medium,
                color: colors.text.secondary,
                marginBottom: spacing[1],
              }}>
                {t('catalog.category')} *
              </label>
              <select
                value={formData.category_en}
                onChange={(e) => {
                  const selectedCategory = categories.find((c) => c.en === e.target.value);
                  if (selectedCategory) {
                    handleChange('category_ka', selectedCategory.ka);
                    handleChange('category_en', selectedCategory.en);
                  }
                }}
                style={{
                  width: '100%',
                  padding: `${spacing[2]} ${spacing[3]}`,
                  border: `1px solid ${errors.category ? colors.error[500] : colors.border.default}`,
                  borderRadius: borderRadius.lg,
                  fontSize: typography.fontSize.base,
                  outline: 'none',
                  backgroundColor: colors.background.primary,
                }}
                onFocus={(e) => {
                  if (!errors.category) {
                    e.target.style.borderColor = colors.info[500];
                    e.target.style.boxShadow = `0 0 0 3px ${colors.info[50]}`;
                  }
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = errors.category ? colors.error[500] : colors.border.default;
                  e.target.style.boxShadow = 'none';
                }}
              >
                <option value="">{t('catalog.productForm.selectCategory')}</option>
                {categories.map((cat) => (
                  <option key={cat.en} value={cat.en}>
                    {isGeorgian ? cat.ka : cat.en}
                  </option>
                ))}
              </select>
              {errors.category && <p style={{
                color: colors.error[500],
                fontSize: typography.fontSize.xs,
                marginTop: spacing[1],
              }}>{errors.category}</p>}
            </div>

            <div>
              <label style={{
                display: 'block',
                fontSize: typography.fontSize.sm,
                fontWeight: typography.fontWeight.medium,
                color: colors.text.secondary,
                marginBottom: spacing[1],
              }}>
                {t('catalog.unit')} *
              </label>
              <select
                value={formData.unit_en}
                onChange={(e) => {
                  const selectedUnit = units.find((u) => u.en === e.target.value);
                  if (selectedUnit) {
                    handleChange('unit_ka', selectedUnit.ka);
                    handleChange('unit_en', selectedUnit.en);
                  }
                }}
                style={{
                  width: '100%',
                  padding: `${spacing[2]} ${spacing[3]}`,
                  border: `1px solid ${errors.unit ? colors.error[500] : colors.border.default}`,
                  borderRadius: borderRadius.lg,
                  fontSize: typography.fontSize.base,
                  outline: 'none',
                  backgroundColor: colors.background.primary,
                }}
                onFocus={(e) => {
                  if (!errors.unit) {
                    e.target.style.borderColor = colors.info[500];
                    e.target.style.boxShadow = `0 0 0 3px ${colors.info[50]}`;
                  }
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = errors.unit ? colors.error[500] : colors.border.default;
                  e.target.style.boxShadow = 'none';
                }}
              >
                <option value="">{t('catalog.productForm.selectUnit')}</option>
                {units.map((unit) => (
                  <option key={unit.en} value={unit.en}>
                    {isGeorgian ? unit.ka : unit.en}
                  </option>
                ))}
              </select>
              {errors.unit && <p style={{
                color: colors.error[500],
                fontSize: typography.fontSize.xs,
                marginTop: spacing[1],
              }}>{errors.unit}</p>}
            </div>
          </div>

          {/* Base Price */}
          <div style={{ marginBottom: spacing[6] }}>
            <label style={{
              display: 'block',
              fontSize: typography.fontSize.sm,
              fontWeight: typography.fontWeight.medium,
              color: colors.text.secondary,
              marginBottom: spacing[1],
            }}>
              {t('catalog.basePrice')} (₾) *
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.base_price}
              onChange={(e) => handleChange('base_price', e.target.value)}
              placeholder={t('catalog.productForm.basePricePlaceholder')}
              style={{
                width: '100%',
                padding: `${spacing[2]} ${spacing[3]}`,
                border: `1px solid ${errors.base_price ? colors.error[500] : colors.border.default}`,
                borderRadius: borderRadius.lg,
                fontSize: typography.fontSize.base,
                outline: 'none',
              }}
              onFocus={(e) => {
                if (!errors.base_price) {
                  e.target.style.borderColor = colors.info[500];
                  e.target.style.boxShadow = `0 0 0 3px ${colors.info[50]}`;
                }
              }}
              onBlur={(e) => {
                e.target.style.borderColor = errors.base_price ? colors.error[500] : colors.border.default;
                e.target.style.boxShadow = 'none';
              }}
            />
            {errors.base_price && <p style={{
              color: colors.error[500],
              fontSize: typography.fontSize.xs,
              marginTop: spacing[1],
            }}>{errors.base_price}</p>}
          </div>

          {/* DIRECT ORDER TOGGLE - PROMINENT */}
          <div style={{
            background: `linear-gradient(to right, ${colors.success[50]}, ${colors.info[50]})`,
            border: `2px solid ${colors.success[300]}`,
            borderRadius: borderRadius.lg,
            padding: spacing[6],
            marginBottom: spacing[6],
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: spacing[4],
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: spacing[3] }}>
                <div style={{
                  backgroundColor: colors.success[500],
                  padding: spacing[2],
                  borderRadius: borderRadius.lg,
                }}>
                  <Zap style={{ width: spacing[6], height: spacing[6], color: colors.text.inverse }} />
                </div>
                <div>
                  <div style={{
                    fontWeight: typography.fontWeight.bold,
                    fontSize: typography.fontSize.lg,
                    color: colors.text.primary,
                  }}>
                    {t('catalog.productForm.directOrderAvailable')}
                  </div>
                  <div style={{
                    fontSize: typography.fontSize.sm,
                    color: colors.text.secondary,
                  }}>
                    {t('catalog.productForm.directOrderTooltip')}
                  </div>
                </div>
              </div>
              <label style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={formData.direct_order_available}
                  onChange={(e) => handleChange('direct_order_available', e.target.checked)}
                  style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }}
                />
                <div style={{
                  position: 'relative',
                  width: '3.5rem',
                  height: '2rem',
                  backgroundColor: formData.direct_order_available ? colors.success[500] : colors.neutral[200],
                  borderRadius: borderRadius.full,
                  transition: 'background-color 0.2s',
                }}>
                  <div style={{
                    position: 'absolute',
                    top: '0.25rem',
                    left: formData.direct_order_available ? '1.75rem' : '0.25rem',
                    width: '1.5rem',
                    height: '1.5rem',
                    backgroundColor: colors.neutral[0],
                    borderRadius: borderRadius.full,
                    transition: 'left 0.2s',
                    border: `1px solid ${colors.neutral[300]}`,
                  }}></div>
                </div>
              </label>
            </div>

            {/* Conditional fields when Direct Order is ON */}
            {formData.direct_order_available ? (
              <div style={{
                marginTop: spacing[4],
                paddingTop: spacing[4],
                borderTop: `1px solid ${colors.success[200]}`,
              }}>
                {/* Delivery Options */}
                <div style={{ marginBottom: spacing[4] }}>
                  <label style={{
                    display: 'block',
                    fontSize: typography.fontSize.sm,
                    fontWeight: typography.fontWeight.medium,
                    color: colors.text.secondary,
                    marginBottom: spacing[2],
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2] }}>
                      <Truck style={{ width: spacing[4], height: spacing[4] }} />
                      {t('catalog.productForm.deliveryOptions')} *
                    </div>
                  </label>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
                    gap: spacing[3],
                  }}>
                    <button
                      type="button"
                      onClick={() => handleChange('delivery_options', 'pickup')}
                      onMouseEnter={() => setHoveredButton('delivery-pickup')}
                      onMouseLeave={() => setHoveredButton(null)}
                      style={{
                        padding: `${spacing[2]} ${spacing[4]}`,
                        borderRadius: borderRadius.lg,
                        border: `2px solid ${formData.delivery_options === 'pickup' ? colors.success[500] : hoveredButton === 'delivery-pickup' ? colors.neutral[400] : colors.neutral[300]}`,
                        backgroundColor: formData.delivery_options === 'pickup' ? colors.success[50] : colors.background.primary,
                        color: formData.delivery_options === 'pickup' ? colors.success[700] : colors.text.secondary,
                        fontWeight: typography.fontWeight.medium,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Package style={{ width: spacing[5], height: spacing[5], marginBottom: spacing[1] }} />
                      {t('catalog.productForm.pickup')}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleChange('delivery_options', 'delivery')}
                      onMouseEnter={() => setHoveredButton('delivery-delivery')}
                      onMouseLeave={() => setHoveredButton(null)}
                      style={{
                        padding: `${spacing[2]} ${spacing[4]}`,
                        borderRadius: borderRadius.lg,
                        border: `2px solid ${formData.delivery_options === 'delivery' ? colors.success[500] : hoveredButton === 'delivery-delivery' ? colors.neutral[400] : colors.neutral[300]}`,
                        backgroundColor: formData.delivery_options === 'delivery' ? colors.success[50] : colors.background.primary,
                        color: formData.delivery_options === 'delivery' ? colors.success[700] : colors.text.secondary,
                        fontWeight: typography.fontWeight.medium,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Truck style={{ width: spacing[5], height: spacing[5], marginBottom: spacing[1] }} />
                      {t('catalog.productForm.delivery')}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleChange('delivery_options', 'both')}
                      onMouseEnter={() => setHoveredButton('delivery-both')}
                      onMouseLeave={() => setHoveredButton(null)}
                      style={{
                        padding: `${spacing[2]} ${spacing[4]}`,
                        borderRadius: borderRadius.lg,
                        border: `2px solid ${formData.delivery_options === 'both' ? colors.success[500] : hoveredButton === 'delivery-both' ? colors.neutral[400] : colors.neutral[300]}`,
                        backgroundColor: formData.delivery_options === 'both' ? colors.success[50] : colors.background.primary,
                        color: formData.delivery_options === 'both' ? colors.success[700] : colors.text.secondary,
                        fontWeight: typography.fontWeight.medium,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {t('catalog.productForm.both')}
                    </button>
                  </div>
                </div>

                {/* Lead Time */}
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: typography.fontSize.sm,
                    fontWeight: typography.fontWeight.medium,
                    color: colors.text.secondary,
                    marginBottom: spacing[2],
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2] }}>
                      <Calendar style={{ width: spacing[4], height: spacing[4] }} />
                      {t('catalog.productForm.leadTime')}
                    </div>
                  </label>
                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: spacing[2],
                  }}>
                    {['sameDayAM', 'sameDayPM', 'nextDay', 'custom', 'negotiable'].map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => handleChange('approx_lead_time_label', option)}
                        onMouseEnter={() => setHoveredButton(`leadtime-${option}`)}
                        onMouseLeave={() => setHoveredButton(null)}
                        style={{
                          padding: `${spacing[2]} ${spacing[3]}`,
                          borderRadius: borderRadius.lg,
                          border: `2px solid ${formData.approx_lead_time_label === option ? colors.success[500] : hoveredButton === `leadtime-${option}` ? colors.neutral[400] : colors.neutral[300]}`,
                          backgroundColor: formData.approx_lead_time_label === option ? colors.success[50] : colors.background.primary,
                          color: formData.approx_lead_time_label === option ? colors.success[700] : colors.text.secondary,
                          fontSize: typography.fontSize.sm,
                          fontWeight: typography.fontWeight.medium,
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          whiteSpace: 'nowrap',
                          flexShrink: 0,
                        }}
                      >
                        {t(`catalog.productForm.${option}`)}
                      </button>
                    ))}
                  </div>
                  {formData.approx_lead_time_label === 'custom' && (
                    <input
                      type="text"
                      value={formData.custom_lead_time}
                      onChange={(e) => handleChange('custom_lead_time', e.target.value)}
                      placeholder={t('catalog.productForm.customLeadTimePlaceholder')}
                      style={{
                        marginTop: spacing[2],
                        width: '100%',
                        padding: `${spacing[2]} ${spacing[3]}`,
                        border: `1px solid ${colors.border.default}`,
                        borderRadius: borderRadius.lg,
                        fontSize: typography.fontSize.base,
                        outline: 'none',
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = colors.success[500];
                        e.target.style.boxShadow = `0 0 0 3px ${colors.success[50]}`;
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = colors.border.default;
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                  )}
                </div>
              </div>
            ) : (
              <div style={{
                marginTop: spacing[4],
                paddingTop: spacing[4],
                borderTop: `1px solid ${colors.border.light}`,
                display: 'flex',
                alignItems: 'center',
                gap: spacing[2],
                fontSize: typography.fontSize.sm,
                color: colors.text.tertiary,
              }}>
                <AlertCircle style={{ width: spacing[4], height: spacing[4] }} />
                {t('catalog.productForm.disabledNote')}
              </div>
            )}
          </div>

          {/* Min Order Quantity */}
          <div style={{ marginBottom: spacing[6] }}>
            <label style={{
              display: 'block',
              fontSize: typography.fontSize.sm,
              fontWeight: typography.fontWeight.medium,
              color: colors.text.secondary,
              marginBottom: spacing[1],
            }}>
              {t('catalog.productForm.minOrderQty')}
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.min_order_quantity}
              onChange={(e) => handleChange('min_order_quantity', e.target.value)}
              placeholder={t('catalog.productForm.minOrderQtyPlaceholder')}
              style={{
                width: '100%',
                padding: `${spacing[2]} ${spacing[3]}`,
                border: `1px solid ${colors.border.default}`,
                borderRadius: borderRadius.lg,
                fontSize: typography.fontSize.base,
                outline: 'none',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = colors.info[500];
                e.target.style.boxShadow = `0 0 0 3px ${colors.info[50]}`;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = colors.border.default;
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          {/* Images Upload */}
          <div style={{ marginBottom: spacing[6] }}>
            <label style={{
              display: 'block',
              fontSize: typography.fontSize.sm,
              fontWeight: typography.fontWeight.medium,
              color: colors.text.secondary,
              marginBottom: spacing[2],
            }}>
              {t('catalog.images')}
            </label>
            <input
              type="file"
              id="image-upload"
              accept="image/*"
              multiple
              style={{ display: 'none' }}
              onChange={(e) => {
                const files = e.target.files;
                if (files && files.length > 0) {
                  setUploadingImage(true);
                  // For now, just create data URLs (in production, you'd upload to a storage service)
                  const newImages: string[] = [];
                  const maxImages = 3 - formData.images.length;
                  const filesToProcess = Math.min(files.length, maxImages);

                  let processed = 0;
                  for (let i = 0; i < filesToProcess; i++) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      if (event.target?.result) {
                        newImages.push(event.target.result as string);
                      }
                      processed++;
                      if (processed === filesToProcess) {
                        handleChange('images', [...formData.images, ...newImages]);
                        setUploadingImage(false);
                      }
                    };
                    reader.readAsDataURL(files[i]);
                  }
                }
                e.target.value = '';
              }}
            />
            <label
              htmlFor="image-upload"
              style={{
                border: `2px dashed ${colors.border.default}`,
                borderRadius: borderRadius.lg,
                padding: spacing[6],
                textAlign: 'center',
                backgroundColor: colors.neutral[50],
                display: 'block',
                cursor: formData.images.length >= 3 ? 'not-allowed' : 'pointer',
                opacity: formData.images.length >= 3 ? 0.5 : 1,
              }}
            >
              <Upload style={{
                width: '48px',
                height: '48px',
                margin: '0 auto',
                marginBottom: spacing[3],
                color: colors.neutral[400],
              }} />
              <div style={{
                fontSize: typography.fontSize.sm,
                color: colors.text.tertiary,
                marginBottom: spacing[2],
              }}>
                {uploadingImage ? t('common.loading') : t('catalog.uploadImages')}
              </div>
              <div style={{
                fontSize: typography.fontSize.xs,
                color: colors.text.tertiary,
              }}>
                {t('catalog.imageNote')}
              </div>
              {formData.images.length > 0 && (
                <div style={{
                  marginTop: spacing[4],
                  display: 'flex',
                  gap: spacing[2],
                  justifyContent: 'center',
                  flexWrap: 'wrap',
                }}>
                  {formData.images.map((img, idx) => (
                    <div
                      key={idx}
                      style={{
                        position: 'relative',
                        width: '80px',
                        height: '80px',
                        borderRadius: borderRadius.base,
                        overflow: 'hidden',
                        border: `1px solid ${colors.border.default}`,
                      }}
                    >
                      <img
                        src={img}
                        alt={`Product ${idx + 1}`}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          const newImages = formData.images.filter((_, i) => i !== idx);
                          handleChange('images', newImages);
                        }}
                        style={{
                          position: 'absolute',
                          top: '4px',
                          right: '4px',
                          width: '20px',
                          height: '20px',
                          borderRadius: borderRadius.full,
                          backgroundColor: colors.error[500],
                          color: colors.text.inverse,
                          border: 'none',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: typography.fontSize.xs,
                          fontWeight: typography.fontWeight.bold,
                          padding: 0,
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </label>
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <div style={{
              backgroundColor: colors.error[50],
              border: `1px solid ${colors.error[200]}`,
              borderRadius: borderRadius.lg,
              padding: spacing[3],
              display: 'flex',
              alignItems: 'center',
              gap: spacing[2],
              color: colors.error[700],
              marginBottom: spacing[6],
            }}>
              <AlertCircle style={{ width: spacing[5], height: spacing[5], flexShrink: 0 }} />
              {errors.submit}
            </div>
          )}

          {/* Actions */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: spacing[4],
            borderTop: `1px solid ${colors.border.light}`,
            marginTop: spacing[2],
            flexWrap: 'wrap',
            gap: spacing[3],
          }}>
            <button
              type="button"
              onClick={onClose}
              onMouseEnter={() => setHoveredButton('cancel')}
              onMouseLeave={() => setHoveredButton(null)}
              disabled={loading}
              style={{
                padding: `${spacing[2]} ${spacing[4]}`,
                color: colors.text.secondary,
                backgroundColor: hoveredButton === 'cancel' && !loading ? colors.neutral[200] : colors.neutral[100],
                borderRadius: borderRadius.lg,
                fontWeight: typography.fontWeight.medium,
                opacity: loading ? 0.5 : 1,
                cursor: loading ? 'not-allowed' : 'pointer',
                border: 'none',
                transition: 'all 0.2s',
              }}
            >
              {t('common.cancel')}
            </button>
            <div style={{ display: 'flex', gap: spacing[3] }}>
              {!isEdit && (
                <button
                  type="submit"
                  onClick={() => setSaveAndAddAnother(true)}
                  onMouseEnter={() => setHoveredButton('saveAndAdd')}
                  onMouseLeave={() => setHoveredButton(null)}
                  disabled={loading}
                  style={{
                    padding: `${spacing[2]} ${spacing[4]}`,
                    color: colors.info[700],
                    backgroundColor: hoveredButton === 'saveAndAdd' && !loading ? colors.info[100] : colors.info[50],
                    border: `1px solid ${colors.info[300]}`,
                    borderRadius: borderRadius.lg,
                    fontWeight: typography.fontWeight.medium,
                    opacity: loading ? 0.5 : 1,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  {loading && saveAndAddAnother ? t('common.saving') : t('catalog.productForm.saveAndAddAnother')}
                </button>
              )}
              <button
                type="submit"
                onMouseEnter={() => setHoveredButton('save')}
                onMouseLeave={() => setHoveredButton(null)}
                disabled={loading}
                style={{
                  padding: `${spacing[2]} ${spacing[4]}`,
                  backgroundColor: hoveredButton === 'save' && !loading ? colors.info[700] : colors.info[600],
                  color: colors.text.inverse,
                  borderRadius: borderRadius.lg,
                  fontWeight: typography.fontWeight.medium,
                  opacity: loading ? 0.5 : 1,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  border: 'none',
                  transition: 'all 0.2s',
                }}
              >
                {loading && !saveAndAddAnother ? t('common.saving') : t('common.save')}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;
