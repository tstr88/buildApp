/**
 * FenceCalculator Component
 * Main fence calculator with form inputs, BOM generation, and actions
 */

import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { UnitInput } from '../forms/UnitInput';
import { PillSelector } from '../forms/PillSelector';
import type { PillOption } from '../forms/PillSelector';
import { BOMTable } from '../bom/BOMTable';
import { SafetyNoticeCard } from '../common/SafetyNoticeCard';
import type { SafetyNotice } from '../common/SafetyNoticeCard';
import { Icons } from '../icons/Icons';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme/tokens';
import type {
  FenceInputs,
  FenceStyle,
  GateType,
  TerrainType,
  FenceCalculationResult,
} from '../../types/fence';

interface FenceCalculatorProps {
  onCalculate?: (result: FenceCalculationResult) => void;
}

export const FenceCalculator: React.FC<FenceCalculatorProps> = ({ onCalculate }) => {
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

  // Form state
  const [inputs, setInputs] = useState<FenceInputs>({
    length: 0,
    height: 2.0,
    style: 'metal_privacy',
    gates: 'none',
    terrain: 'flat',
  });

  const [calculationResult, setCalculationResult] = useState<FenceCalculationResult | null>(
    null
  );
  const [isCalculating, setIsCalculating] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Style options
  const styleOptions: PillOption[] = [
    {
      value: 'metal_privacy',
      label: t('fence.style.metalPrivacy'),
    },
    {
      value: 'wood_on_metal',
      label: t('fence.style.woodOnMetal'),
    },
  ];

  // Gate options
  const gateOptions: PillOption[] = [
    { value: 'none', label: t('fence.gates.none') },
    { value: 'walk', label: t('fence.gates.walk') },
    { value: 'car', label: t('fence.gates.car') },
  ];

  // Terrain options
  const terrainOptions: PillOption[] = [
    { value: 'flat', label: t('fence.terrain.flat') },
    { value: 'sloped', label: t('fence.terrain.sloped') },
  ];

  // Safety notices
  const safetyNotices: SafetyNotice[] = [
    {
      id: '1',
      message: t('fence.safety.boundaries'),
      severity: 'warning',
    },
    {
      id: '2',
      message: t('fence.safety.utilities'),
      severity: 'error',
    },
    {
      id: '3',
      message: t('fence.safety.foundation'),
      severity: 'info',
    },
  ];

  // Validation
  const validate = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (inputs.length <= 0) {
      newErrors.length = t('fence.errors.lengthRequired');
    }

    if (inputs.height < 1.5 || inputs.height > 2.5) {
      newErrors.height = t('fence.errors.heightRange');
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

      // Client-side calculation (will be replaced with API call)
      const result = calculateFenceBOM(inputs);
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
  const calculateFenceBOM = (inputs: FenceInputs): FenceCalculationResult => {
    const { length, height, style, gates, terrain } = inputs;

    // Calculate number of posts (every 2.5m + corners)
    const postSpacing = 2.5;
    const numPosts = Math.ceil(length / postSpacing) + 2; // +2 for end posts

    // Add extra posts for gates
    const gateExtraPosts = gates === 'walk' ? 2 : gates === 'car' ? 2 : 0;
    const totalPosts = numPosts + gateExtraPosts;

    // Calculate materials based on style
    const isWood = style === 'wood_on_metal';

    // Metal sheets or wood panels
    const panelArea = length * height;
    const panelsNeeded = Math.ceil(panelArea / 2.0); // 2m² per panel

    // Fasteners (8 per post)
    const fasteners = totalPosts * 8;

    // Foundation concrete (0.04 m³ per post, M300 grade)
    const concreteCubicMeters = totalPosts * 0.04;

    // Terrain adjustment (+15% if sloped)
    const terrainMultiplier = terrain === 'sloped' ? 1.15 : 1.0;

    const bom: any[] = [
      {
        id: '1',
        specification: `Metal fence post ${height}m`,
        specification_ka: `მეტალის ღობის სვეტი ${height}მ`,
        specification_en: `Metal fence post ${height}m`,
        quantity: Math.ceil(totalPosts * terrainMultiplier),
        unit: 'pcs',
        unit_ka: 'ცალი',
        unit_en: 'pcs',
        estimatedPrice: 45,
        category: 'structure',
      },
      {
        id: '2',
        specification: isWood
          ? 'Wood panels on metal frame'
          : `Metal privacy sheets ${height}m`,
        specification_ka: isWood
          ? 'ხის პანელები მეტალის კარკასზე'
          : `მეტალის დამცავი ფურცლები ${height}მ`,
        specification_en: isWood
          ? 'Wood panels on metal frame'
          : `Metal privacy sheets ${height}m`,
        quantity: Math.ceil(panelsNeeded * terrainMultiplier),
        unit: 'pcs',
        unit_ka: 'ცალი',
        unit_en: 'pcs',
        estimatedPrice: isWood ? 65 : 85,
        category: 'panels',
      },
      {
        id: '3',
        specification: 'Fasteners (screws/bolts)',
        specification_ka: 'დამამაგრებლები (ხრახნები/ჭანჭიკები)',
        specification_en: 'Fasteners (screws/bolts)',
        quantity: Math.ceil(fasteners * terrainMultiplier),
        unit: 'pcs',
        unit_ka: 'ცალი',
        unit_en: 'pcs',
        estimatedPrice: 0.5,
        category: 'hardware',
      },
      {
        id: '4',
        specification: 'Foundation concrete M300',
        specification_ka: 'საძირკვლის ბეტონი M300',
        specification_en: 'Foundation concrete M300',
        quantity: concreteCubicMeters * terrainMultiplier,
        unit: 'm³',
        unit_ka: 'მ³',
        unit_en: 'm³',
        estimatedPrice: 180,
        category: 'foundation',
      },
    ];

    // Add gate hardware if needed
    if (gates === 'walk') {
      bom.push({
        id: '5',
        specification: 'Walk gate with hardware',
        specification_ka: 'საპეშო კარიბჭე აქსესუარებით',
        specification_en: 'Walk gate with hardware',
        quantity: 1,
        unit: 'set',
        unit_ka: 'კომპლექტი',
        unit_en: 'set',
        estimatedPrice: 250,
        category: 'gates',
      });
    } else if (gates === 'car') {
      bom.push({
        id: '5',
        specification: 'Car gate with hardware',
        specification_ka: 'სატრანსპორტო კარიბჭე აქსესუარებით',
        specification_en: 'Car gate with hardware',
        quantity: 1,
        unit: 'set',
        unit_ka: 'კომპლექტი',
        unit_en: 'set',
        estimatedPrice: 650,
        category: 'gates',
      });
    }

    const totalPrice = bom.reduce(
      (sum, item) => sum + item.quantity * item.estimatedPrice,
      0
    );

    return {
      inputs,
      bom,
      totalPrice,
      notes: [],
    };
  };

  const ToolsIcon = Icons.Wrench;
  const ChevronIcon = Icons.ChevronRight;

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
              {t('fence.calculator.title')}
            </h2>

            {/* Length Input */}
            <UnitInput
              label={t('fence.inputs.length')}
              value={inputs.length}
              onChange={(value) => setInputs({ ...inputs, length: value })}
              unit="მ"
              min={0}
              step={0.5}
              placeholder="0"
              error={errors.length}
            />

            {/* Height Input */}
            <UnitInput
              label={t('fence.inputs.height')}
              value={inputs.height}
              onChange={(value) => setInputs({ ...inputs, height: value })}
              unit="მ"
              min={1.5}
              max={2.5}
              step={0.1}
              error={errors.height}
            />

            {/* Style Selector */}
            <PillSelector
              label={t('fence.inputs.style')}
              options={styleOptions}
              value={inputs.style}
              onChange={(value) => setInputs({ ...inputs, style: value as FenceStyle })}
            />

            {/* Gates Selector */}
            <PillSelector
              label={t('fence.inputs.gates')}
              options={gateOptions}
              value={inputs.gates}
              onChange={(value) => setInputs({ ...inputs, gates: value as GateType })}
            />

            {/* Terrain Selector */}
            <PillSelector
              label={t('fence.inputs.terrain')}
              options={terrainOptions}
              value={inputs.terrain}
              onChange={(value) => setInputs({ ...inputs, terrain: value as TerrainType })}
            />

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
              {isCalculating ? t('common.calculating') : t('fence.calculator.calculate')}
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
            title={t('fence.safety.title')}
            notices={safetyNotices}
            sticky={false}
          />
        </div>
      </div>

      {/* BOM Results (shown after calculation) */}
      {calculationResult && (
        <div ref={resultsRef} style={{ marginTop: spacing[8], scrollMarginTop: spacing[6], width: '100%', maxWidth: '100%', overflow: 'hidden', boxSizing: 'border-box' }}>
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

          {/* Action Buttons */}
          <div
            style={{
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              gap: spacing[3],
              marginTop: spacing[6],
            }}
          >
            {/* Primary: Request Offers */}
            <button
              onClick={() => {
                // Navigate to RFQ builder with pre-filled data
                navigate('/rfq/create', { state: { bom: calculationResult.bom } });
              }}
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
              {t('fence.actions.requestOffers')}
              <ChevronIcon size={20} />
            </button>

            {/* Secondary: Direct Order */}
            <button
              onClick={() => {
                // Navigate to direct order page
                navigate('/orders/direct');
              }}
              style={{
                flex: isMobile ? 'none' : 1,
                padding: `${spacing[4]} ${spacing[6]}`,
                fontSize: typography.fontSize.base,
                fontWeight: typography.fontWeight.semibold,
                color: colors.neutral[0],
                backgroundColor: colors.success[600],
                border: 'none',
                borderRadius: borderRadius.lg,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: spacing[2],
                transition: 'all 200ms ease',
                minHeight: '52px',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = colors.success[700];
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = colors.success[600];
              }}
            >
              <Icons.Zap size={20} />
              {t('fence.actions.directOrder')}
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
              <ToolsIcon size={20} />
              {t('fence.actions.toolRental')}
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
                    {t('fence.toolRental.title')}
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
                    {t('fence.toolRental.description')}
                  </p>
                  <ul
                    style={{
                      margin: 0,
                      paddingLeft: spacing[4],
                      fontSize: typography.fontSize.sm,
                      color: colors.text.secondary,
                    }}
                  >
                    <li>{t('fence.toolRental.postDigger')}</li>
                    <li>{t('fence.toolRental.level')}</li>
                    <li>{t('fence.toolRental.mixer')}</li>
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
                {t('fence.toolRental.viewOptions')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
