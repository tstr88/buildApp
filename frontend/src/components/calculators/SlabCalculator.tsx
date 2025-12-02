/**
 * SlabCalculator Component
 * Concrete slab calculator with form inputs, BOM generation, and actions
 */

import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { UnitInput } from '../forms/UnitInput';
import { PillSelector } from '../forms/PillSelector';
import type { PillOption } from '../forms/PillSelector';
import { Toggle } from '../forms/Toggle';
import { BOMTable } from '../bom/BOMTable';
import { SafetyNoticeCard } from '../common/SafetyNoticeCard';
import type { SafetyNotice } from '../common/SafetyNoticeCard';
import { SaveToProjectModal } from '../modals/SaveToProjectModal';
import { Icons } from '../icons/Icons';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme/tokens';
import type {
  SlabInputs,
  SlabPurpose,
  SlabCalculationResult,
} from '../../types/slab';

interface SlabCalculatorProps {
  onCalculate?: (result: SlabCalculationResult) => void;
}

export const SlabCalculator: React.FC<SlabCalculatorProps> = ({ onCalculate }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const resultsRef = useRef<HTMLDivElement>(null);
  // Initialize with SSR-safe check
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768;
    }
    return false;
  });

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile(); // Re-check on mount
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Default thickness based on purpose
  const getDefaultThickness = (purpose: SlabPurpose): number => {
    switch (purpose) {
      case 'parking_pad':
        return 15;
      case 'patio':
        return 10;
      case 'walkway':
        return 10;
      case 'custom':
        return 12;
      default:
        return 12;
    }
  };

  // Form state
  const [inputs, setInputs] = useState<SlabInputs>({
    purpose: 'patio',
    length: 0,
    width: 0,
    thickness: 10,
    edgeFormsNeeded: true,
  });

  const [calculationResult, setCalculationResult] = useState<SlabCalculationResult | null>(
    null
  );
  const [isCalculating, setIsCalculating] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showSaveModal, setShowSaveModal] = useState(false);

  // Update thickness when purpose changes
  useEffect(() => {
    setInputs((prev) => ({
      ...prev,
      thickness: getDefaultThickness(prev.purpose),
    }));
  }, [inputs.purpose]);

  // Purpose options
  const purposeOptions: PillOption[] = [
    { value: 'parking_pad', label: t('slab.purpose.parkingPad') },
    { value: 'patio', label: t('slab.purpose.patio') },
    { value: 'walkway', label: t('slab.purpose.walkway') },
    { value: 'custom', label: t('slab.purpose.custom') },
  ];

  // Safety notices
  const safetyNotices: SafetyNotice[] = [
    {
      id: '1',
      message: t('slab.safety.nonStructural'),
      severity: 'warning',
    },
    {
      id: '2',
      message: t('slab.safety.consultEngineer'),
      severity: 'error',
    },
    {
      id: '3',
      message: t('slab.safety.subBase'),
      severity: 'info',
    },
    {
      id: '4',
      message: t('slab.safety.cureTime'),
      severity: 'info',
    },
  ];

  // Validation
  const validate = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (inputs.length <= 0) {
      newErrors.length = t('slab.errors.lengthRequired');
    }

    if (inputs.width <= 0) {
      newErrors.width = t('slab.errors.widthRequired');
    }

    if (inputs.thickness < 8 || inputs.thickness > 20) {
      newErrors.thickness = t('slab.errors.thicknessRange');
    }

    // Calculate volume for validation
    const volume = inputs.length * inputs.width * (inputs.thickness / 100);

    if (volume < 0.5) {
      newErrors.general = t('slab.errors.volumeTooSmall');
    }

    if (volume > 20) {
      newErrors.general = t('slab.errors.volumeTooLarge');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Calculate BOM
  const handleCalculate = async () => {
    if (!validate()) {
      return;
    }

    setIsCalculating(true);

    try {
      // Simulate API delay for smooth loading experience
      await new Promise(resolve => setTimeout(resolve, 500));

      const result = calculateSlabBOM(inputs);
      setCalculationResult(result);

      if (onCalculate) {
        onCalculate(result);
      }

      // Scroll to results after calculation
      setTimeout(() => {
        if (resultsRef.current) {
          resultsRef.current.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
          });
        }
      }, 100);
    } catch (error) {
      console.error('Calculation error:', error);
    } finally {
      setIsCalculating(false);
    }
  };

  // Client-side BOM calculation
  const calculateSlabBOM = (inputs: SlabInputs): SlabCalculationResult => {
    const { length, width, thickness, edgeFormsNeeded } = inputs;

    // Calculate volume and area
    const area = length * width; // m²
    const volume = area * (thickness / 100); // m³

    // Concrete with waste factor
    const concreteVolume = volume * 1.05;

    // Determine if pump is recommended
    const pumpRecommended = volume > 3;

    // Determine reinforcement type based on thickness
    const useRebar = thickness > 12;

    const warnings: string[] = [];
    const notes: string[] = [];

    // Warning for thick slabs
    if (thickness > 15) {
      warnings.push(t('slab.warnings.engineeringRequired'));
    }

    // Note about pump
    if (pumpRecommended) {
      notes.push(t('slab.notes.pumpRecommended'));
    }

    const bom: any[] = [
      {
        id: '1',
        specification: 'Concrete M300',
        specification_ka: 'ბეტონი M300',
        specification_en: 'Concrete M300',
        quantity: concreteVolume,
        unit: 'm³',
        unit_ka: 'მ³',
        unit_en: 'm³',
        estimatedPrice: 180,
        category: 'concrete',
      },
    ];

    // Add reinforcement
    if (useRebar) {
      // Rebar calculation: grid pattern
      const rebarSpacing = 0.2; // 20cm grid
      const lengthRebars = Math.ceil(width / rebarSpacing) * length;
      const widthRebars = Math.ceil(length / rebarSpacing) * width;
      const totalRebarLength = lengthRebars + widthRebars;

      bom.push({
        id: '2',
        specification: 'Rebar A500 Ø12mm',
        specification_ka: 'არმატურა A500 Ø12მმ',
        specification_en: 'Rebar A500 Ø12mm',
        quantity: totalRebarLength,
        unit: 'm',
        unit_ka: 'მ',
        unit_en: 'm',
        estimatedPrice: 2.5,
        category: 'reinforcement',
      });
    } else {
      // Mesh reinforcement
      bom.push({
        id: '2',
        specification: 'Reinforcement mesh Ø4mm',
        specification_ka: 'გამაძლიერებელი ბადე Ø4მმ',
        specification_en: 'Reinforcement mesh Ø4mm',
        quantity: area * 1.1, // 10% overlap
        unit: 'm²',
        unit_ka: 'მ²',
        unit_en: 'm²',
        estimatedPrice: 8,
        category: 'reinforcement',
      });
    }

    // Form boards if needed
    if (edgeFormsNeeded) {
      const perimeter = (length + width) * 2;
      const formBoardLength = perimeter * 2; // Both sides

      bom.push({
        id: '3',
        specification: 'Form boards 50×150mm',
        specification_ka: 'ყალიბის დაფები 50×150მმ',
        specification_en: 'Form boards 50×150mm',
        quantity: formBoardLength,
        unit: 'm',
        unit_ka: 'მ',
        unit_en: 'm',
        estimatedPrice: 3.5,
        category: 'formwork',
      });
    }

    // Sub-base gravel
    const gravelVolume = area * 0.125; // 12.5cm average depth
    bom.push({
      id: '4',
      specification: 'Compacted gravel sub-base',
      specification_ka: 'შებრუნებული ხრეში საძირკველი',
      specification_en: 'Compacted gravel sub-base',
      quantity: gravelVolume,
      unit: 'm³',
      unit_ka: 'მ³',
      unit_en: 'm³',
      estimatedPrice: 45,
      category: 'preparation',
    });

    const totalPrice = bom.reduce(
      (sum, item) => sum + item.quantity * item.estimatedPrice,
      0
    );

    return {
      inputs,
      bom,
      totalPrice,
      volume,
      area,
      pumpRecommended,
      warnings,
      notes,
    };
  };

  const ToolsIcon = Icons.Wrench;
  const ChevronIcon = Icons.ChevronRight;
  const AlertIcon = Icons.AlertCircle;

  return (
    <div>
      {/* Grid Layout: Form on left, Safety on right (desktop) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: spacing[6],
        }}
      >
        {/* Left Column: Form */}
        <div>
          {/* Input Form */}
          <div
            style={{
              backgroundColor: colors.neutral[0],
              borderRadius: borderRadius.lg,
              border: `1px solid ${colors.border.light}`,
              padding: spacing[6],
              boxShadow: shadows.sm,
              marginBottom: spacing[6],
            }}
          >
            <h2
              style={{
                fontSize: typography.fontSize['2xl'],
                fontWeight: typography.fontWeight.bold,
                color: colors.text.primary,
                margin: 0,
                marginBottom: spacing[6],
              }}
            >
              {t('slab.calculator.title')}
            </h2>

            {/* Purpose Selector */}
            <PillSelector
              label={t('slab.inputs.purpose')}
              options={purposeOptions}
              value={inputs.purpose}
              onChange={(value) => setInputs({ ...inputs, purpose: value as SlabPurpose })}
            />

            {/* Length Input */}
            <UnitInput
              label={t('slab.inputs.length')}
              value={inputs.length}
              onChange={(value) => setInputs({ ...inputs, length: value })}
              unit="მ"
              min={0}
              step={0.5}
              placeholder="0"
              error={errors.length}
            />

            {/* Width Input */}
            <UnitInput
              label={t('slab.inputs.width')}
              value={inputs.width}
              onChange={(value) => setInputs({ ...inputs, width: value })}
              unit="მ"
              min={0}
              step={0.5}
              placeholder="0"
              error={errors.width}
            />

            {/* Thickness Input */}
            <UnitInput
              label={t('slab.inputs.thickness')}
              value={inputs.thickness}
              onChange={(value) => setInputs({ ...inputs, thickness: value })}
              unit="სმ"
              min={8}
              max={20}
              step={1}
              error={errors.thickness}
            />

            {/* Edge Forms Toggle */}
            <Toggle
              label={t('slab.inputs.edgeForms')}
              value={inputs.edgeFormsNeeded}
              onChange={(value) => setInputs({ ...inputs, edgeFormsNeeded: value })}
              description={t('slab.inputs.edgeFormsDescription')}
            />

            {/* General Error */}
            {errors.general && (
              <div
                style={{
                  padding: spacing[3],
                  backgroundColor: colors.error + '10',
                  border: `1px solid ${colors.error}`,
                  borderRadius: borderRadius.md,
                  marginBottom: spacing[4],
                }}
              >
                <p
                  style={{
                    fontSize: typography.fontSize.sm,
                    color: colors.error,
                    margin: 0,
                  }}
                >
                  {errors.general}
                </p>
              </div>
            )}

            {/* Calculate Button */}
            <button
              onClick={handleCalculate}
              disabled={isCalculating}
              style={{
                width: '100%',
                padding: `${spacing[4]} ${spacing[6]}`,
                fontSize: typography.fontSize.lg,
                fontWeight: typography.fontWeight.semibold,
                color: colors.text.inverse,
                backgroundColor: isCalculating ? colors.neutral[300] : colors.primary[600],
                border: 'none',
                borderRadius: borderRadius.lg,
                cursor: isCalculating ? 'not-allowed' : 'pointer',
                transition: 'all 200ms ease',
                marginTop: spacing[4],
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: spacing[2],
              }}
              onMouseEnter={(e) => {
                if (!isCalculating) {
                  e.currentTarget.style.backgroundColor = colors.primary[700];
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = shadows.md;
                }
              }}
              onMouseLeave={(e) => {
                if (!isCalculating) {
                  e.currentTarget.style.backgroundColor = colors.primary[600];
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }
              }}
            >
              {isCalculating && (
                <div
                  style={{
                    width: '20px',
                    height: '20px',
                    border: `3px solid ${colors.neutral[0]}`,
                    borderTopColor: 'transparent',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                  }}
                />
              )}
              {isCalculating ? t('common.calculating') : t('slab.calculator.calculate')}
            </button>
            <style>
              {`
                @keyframes spin {
                  to { transform: rotate(360deg); }
                }
              `}
            </style>
          </div>

          {/* Safety Notices */}
          <SafetyNoticeCard
            title={t('slab.safety.title')}
            notices={safetyNotices}
            sticky={false}
          />
        </div>
      </div>

      {/* BOM Results (shown after calculation) */}
      {calculationResult && (
        <div ref={resultsRef} style={{ marginTop: spacing[8], scrollMarginTop: spacing[6], width: '100%', maxWidth: '100%', overflow: 'hidden', boxSizing: 'border-box' }}>
          {/* Warnings */}
          {calculationResult.warnings.length > 0 && (
            <div
              style={{
                padding: spacing[4],
                backgroundColor: colors.warning + '10',
                border: `2px solid ${colors.warning}`,
                borderRadius: borderRadius.lg,
                marginBottom: spacing[6],
                display: 'flex',
                alignItems: 'start',
                gap: spacing[3],
              }}
            >
              <AlertIcon size={24} color={colors.warning} />
              <div>
                <h3
                  style={{
                    fontSize: typography.fontSize.lg,
                    fontWeight: typography.fontWeight.bold,
                    color: colors.text.primary,
                    margin: 0,
                    marginBottom: spacing[2],
                  }}
                >
                  {t('slab.warnings.title')}
                </h3>
                <ul
                  style={{
                    margin: 0,
                    paddingLeft: spacing[5],
                  }}
                >
                  {calculationResult.warnings.map((warning, index) => (
                    <li
                      key={index}
                      style={{
                        fontSize: typography.fontSize.base,
                        color: colors.text.primary,
                        marginBottom: spacing[1],
                      }}
                    >
                      {warning}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Volume & Area Summary */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: spacing[4],
              marginBottom: spacing[6],
            }}
          >
            <div
              style={{
                padding: spacing[4],
                backgroundColor: colors.primary[50],
                borderRadius: borderRadius.lg,
                border: `1px solid ${colors.primary[200]}`,
              }}
            >
              <div
                style={{
                  fontSize: typography.fontSize.sm,
                  color: colors.text.secondary,
                  marginBottom: spacing[1],
                }}
              >
                {t('slab.summary.volume')}
              </div>
              <div
                style={{
                  fontSize: typography.fontSize['2xl'],
                  fontWeight: typography.fontWeight.bold,
                  color: colors.primary[600],
                }}
              >
                {calculationResult.volume.toFixed(2)} მ³
              </div>
            </div>

            <div
              style={{
                padding: spacing[4],
                backgroundColor: colors.primary[50],
                borderRadius: borderRadius.lg,
                border: `1px solid ${colors.primary[200]}`,
              }}
            >
              <div
                style={{
                  fontSize: typography.fontSize.sm,
                  color: colors.text.secondary,
                  marginBottom: spacing[1],
                }}
              >
                {t('slab.summary.area')}
              </div>
              <div
                style={{
                  fontSize: typography.fontSize['2xl'],
                  fontWeight: typography.fontWeight.bold,
                  color: colors.primary[600],
                }}
              >
                {calculationResult.area.toFixed(2)} მ²
              </div>
            </div>
          </div>

          {/* BOM Header */}
          <h2
            style={{
              fontSize: typography.fontSize['2xl'],
              fontWeight: typography.fontWeight.bold,
              color: colors.text.primary,
              margin: 0,
              marginBottom: spacing[4],
            }}
          >
            {t('bom.title')}
          </h2>

          {/* BOM Table */}
          <BOMTable
            items={calculationResult.bom}
            currency="₾"
            showTotal={true}
            disclaimer={t('bom.disclaimer')}
          />

          {/* Notes */}
          {calculationResult.notes.length > 0 && (
            <div
              style={{
                marginTop: spacing[4],
                padding: spacing[4],
                backgroundColor: colors.primary[50],
                borderRadius: borderRadius.lg,
                border: `1px solid ${colors.primary[200]}`,
              }}
            >
              <ul
                style={{
                  margin: 0,
                  paddingLeft: spacing[5],
                }}
              >
                {calculationResult.notes.map((note, index) => (
                  <li
                    key={index}
                    style={{
                      fontSize: typography.fontSize.base,
                      color: colors.text.primary,
                      marginBottom: spacing[1],
                    }}
                  >
                    {note}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Action Buttons */}
          <div
            style={{
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              gap: spacing[3],
              marginTop: spacing[6],
            }}
          >
            {/* Primary: Save to Project */}
            <button
              onClick={() => setShowSaveModal(true)}
              style={{
                flex: isMobile ? 'none' : 1,
                padding: `${spacing[4]} ${spacing[6]}`,
                fontSize: typography.fontSize.base,
                fontWeight: typography.fontWeight.semibold,
                color: colors.text.inverse,
                backgroundColor: colors.primary[600],
                border: 'none',
                borderRadius: borderRadius.lg,
                cursor: 'pointer',
                transition: 'all 200ms ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: spacing[2],
                minHeight: '52px',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = colors.primary[700];
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = colors.primary[600];
              }}
            >
              <Icons.FolderPlus size={20} />
              {t('slab.actions.saveToProject', 'Save to Project')}
            </button>

            {/* Secondary: Request Offers (direct to RFQ) */}
            <button
              onClick={() => {
                navigate('/rfq/create', { state: { bom: calculationResult.bom } });
              }}
              style={{
                flex: isMobile ? 'none' : 1,
                padding: `${spacing[4]} ${spacing[6]}`,
                fontSize: typography.fontSize.base,
                fontWeight: typography.fontWeight.medium,
                color: colors.primary[600],
                backgroundColor: colors.neutral[0],
                border: `1px solid ${colors.primary[600]}`,
                borderRadius: borderRadius.lg,
                cursor: 'pointer',
                transition: 'all 200ms ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: spacing[2],
                minHeight: '52px',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = colors.primary[50];
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = colors.neutral[0];
              }}
            >
              {t('slab.actions.requestOffers')}
              <ChevronIcon size={20} />
            </button>

            {/* Tertiary: Tool Rental */}
            <button
              onClick={() => {
                navigate('/tools/rental');
              }}
              style={{
                flex: isMobile ? 'none' : 1,
                padding: `${spacing[4]} ${spacing[6]}`,
                fontSize: typography.fontSize.base,
                fontWeight: typography.fontWeight.medium,
                color: colors.text.secondary,
                backgroundColor: colors.neutral[0],
                border: `1px solid ${colors.border.default}`,
                borderRadius: borderRadius.lg,
                cursor: 'pointer',
                transition: 'all 200ms ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: spacing[2],
                minHeight: '52px',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = colors.neutral[50];
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = colors.neutral[0];
              }}
            >
              <ToolsIcon size={20} />
              {t('slab.actions.toolRental')}
            </button>
          </div>

          {/* Tool Rental Suggestion Card */}
          <div
            style={{
              marginTop: spacing[6],
              padding: isMobile ? spacing[3] : spacing[6],
              backgroundColor: colors.neutral[50],
              borderRadius: borderRadius.lg,
              border: `1px solid ${colors.border.light}`,
              width: '100%',
              boxSizing: 'border-box',
            }}
          >
            <div style={{
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              alignItems: isMobile ? 'stretch' : 'start',
              gap: spacing[3]
            }}>
              {/* Icon and Content */}
              <div style={{
                display: 'flex',
                alignItems: 'start',
                gap: spacing[3],
                flex: 1,
                minWidth: 0,
              }}>
                <div
                  style={{
                    width: isMobile ? '40px' : '48px',
                    height: isMobile ? '40px' : '48px',
                    minWidth: isMobile ? '40px' : '48px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: colors.primary[100],
                    borderRadius: borderRadius.md,
                  }}
                >
                  <ToolsIcon size={isMobile ? 20 : 24} color={colors.primary[600]} />
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3
                    style={{
                      fontSize: isMobile ? typography.fontSize.base : typography.fontSize.lg,
                      fontWeight: typography.fontWeight.semibold,
                      color: colors.text.primary,
                      margin: 0,
                      marginBottom: spacing[2],
                      wordBreak: 'break-word',
                    }}
                  >
                    {t('slab.toolRental.title')}
                  </h3>
                  <p
                    style={{
                      fontSize: typography.fontSize.sm,
                      color: colors.text.secondary,
                      margin: 0,
                      marginBottom: spacing[2],
                      wordBreak: 'break-word',
                    }}
                  >
                    {t('slab.toolRental.description')}
                  </p>
                  <ul
                    style={{
                      margin: 0,
                      paddingLeft: spacing[4],
                      fontSize: typography.fontSize.sm,
                      color: colors.text.secondary,
                    }}
                  >
                    <li>{t('slab.toolRental.screed')}</li>
                    <li>{t('slab.toolRental.float')}</li>
                    <li>{t('slab.toolRental.edger')}</li>
                    <li>
                      {calculationResult.pumpRecommended
                        ? t('slab.toolRental.pump')
                        : t('slab.toolRental.mixer')}
                    </li>
                  </ul>
                </div>
              </div>

              {/* Button */}
              <button
                onClick={() => navigate('/tools/rental')}
                style={{
                  padding: `${spacing[3]} ${spacing[4]}`,
                  fontSize: typography.fontSize.sm,
                  fontWeight: typography.fontWeight.medium,
                  color: colors.primary[600],
                  backgroundColor: colors.neutral[0],
                  border: `1px solid ${colors.primary[600]}`,
                  borderRadius: borderRadius.md,
                  cursor: 'pointer',
                  minHeight: '44px',
                  width: isMobile ? '100%' : 'auto',
                  flexShrink: 0,
                }}
              >
                {t('slab.toolRental.viewOptions')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Save to Project Modal */}
      {calculationResult && (
        <SaveToProjectModal
          isOpen={showSaveModal}
          onClose={() => setShowSaveModal(false)}
          bom={calculationResult.bom}
          templateSlug="slab"
          templateInputs={calculationResult.inputs}
          totalPrice={calculationResult.totalPrice}
        />
      )}
    </div>
  );
};
