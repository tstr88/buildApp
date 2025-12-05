/**
 * Professional Construction Instruction Diagrams
 * Clean, simple, and professional illustrations
 * Focus on clarity and essential details
 */

import React from 'react';
import { useTranslation } from 'react-i18next';

interface AnimationProps {
  size?: number;
  templateInputs?: Record<string, any>;
}

// Translations for Site Preparation Animation
const sitePreparationTranslations = {
  en: {
    step1Title: 'STEP 1: MARK THE AREA',
    step2Title: 'STEP 2: REMOVE GRASS & TOPSOIL',
    step3Title: 'STEP 3: LEVEL THE SURFACE',
    step4Title: 'STEP 4: COMPACT THE SOIL',
    topsoilRoots: 'TOPSOIL + ROOTS',
    subsoil: 'SUBSOIL',
    levelLine: 'LEVEL LINE',
    remove: 'REMOVE',
    depth: '15-20 cm',
    dim9m: '9m',
    dim10m: '10m',
    phase1Label: 'Mark corners with stakes, stretch string line',
    phase2Label1: 'Dig out grass, roots, and topsoil',
    phase2Label2: 'Depth: 15-20cm across entire marked area',
    phase3Label1: 'Use rake to level the excavated surface',
    phase3Label2: 'Remove high spots, fill low spots',
    phase4Label1: 'Compact soil with plate compactor or tamper',
    phase4Label2: 'Creates stable base for gravel layer',
  },
  ka: {
    step1Title: 'ნაბიჯი 1: მონიშნეთ ფართობი',
    step2Title: 'ნაბიჯი 2: მოაშორეთ ბალახი',
    step3Title: 'ნაბიჯი 3: გაასწორეთ ზედაპირი',
    step4Title: 'ნაბიჯი 4: დატკეპნეთ ნიადაგი',
    topsoilRoots: 'მიწის ზედაფენა + ფესვები',
    subsoil: 'ქვენიადაგი',
    levelLine: 'დონის ხაზი',
    remove: 'მოშორება',
    depth: '15-20 სმ',
    dim9m: '9მ',
    dim10m: '10მ',
    phase1Label: 'მონიშნეთ კუთხეები, გაჭიმეთ თოკი',
    phase2Label1: 'ამოთხარეთ ბალახი, ფესვები და მიწის ზედაფენა',
    phase2Label2: 'სიღრმე: 15-20სმ მთელ მონიშნულ ფართობზე',
    phase3Label1: 'გამოიყენეთ ფოცხი ზედაპირის გასასწორებლად',
    phase3Label2: 'მოაშორეთ ამობურცულები, შეავსეთ ჩაზნექილები',
    phase4Label1: 'დატკეპნეთ ნიადაგი ვიბროტამპით ან ხელით',
    phase4Label2: 'ქმნის სტაბილურ საფუძველს ხრეშის ფენისთვის',
  },
};

// Clean professional color palette
const palette = {
  soil: '#8B7355',
  soilDark: '#5D4E37',
  wood: '#D4A574',
  woodDark: '#8B6914',
  concrete: '#9E9E9E',
  concreteDark: '#757575',
  concreteLight: '#BDBDBD',
  gravel: '#A09080',
  gravelDark: '#706050',
  metal: '#78909C',
  metalDark: '#546E7A',
  rebar: '#5D4037',
  grass: '#7CB342',
  dimension: '#1565C0',
  dimensionBg: '#E3F2FD',
  arrow: '#E53935',
  white: '#FFFFFF',
  black: '#333333',
  gray: '#757575',
  lightGray: '#F5F5F5',
};

// ============================================================================
// SITE PREPARATION - Animated 4-phase sequence
// Phase 1: Top view - mark area with dimensions
// Phase 2: Side view - dig and remove grass/topsoil
// Phase 3: Level the surface
// Phase 4: Compact the soil
// ============================================================================
export const SitePreparationAnimation: React.FC<AnimationProps> = ({ size = 320, templateInputs }) => {
  const { i18n } = useTranslation();
  const lang = i18n.language?.startsWith('ka') ? 'ka' : 'en';
  const isGeorgian = lang === 'ka';
  const aspectRatio = 0.85;

  // Get dimensions from templateInputs or use defaults
  const length = templateInputs?.length || 9;
  const width = templateInputs?.width || 10;
  const unitSuffix = isGeorgian ? 'მ' : 'm';

  // Dynamic translations with actual dimensions
  const t = {
    ...sitePreparationTranslations[lang],
    dim9m: `${length}${unitSuffix}`,
    dim10m: `${width}${unitSuffix}`,
  };

  return (
    <div style={{
      width: '100%',
      maxWidth: size,
      aspectRatio: `1 / ${aspectRatio}`,
      position: 'relative',
      overflow: 'hidden',
      margin: '0 auto'
    }}>
      {/* CSS Keyframes */}
      <style>{`
        @keyframes phase1-lines {
          0%, 5% { stroke-dashoffset: 200; opacity: 0; }
          10%, 25% { stroke-dashoffset: 0; opacity: 1; }
          30%, 100% { opacity: 0; }
        }
        @keyframes phase1-dims {
          0%, 8% { opacity: 0; }
          15%, 25% { opacity: 1; }
          30%, 100% { opacity: 0; }
        }
        @keyframes phase1-container {
          0%, 25% { opacity: 1; }
          30%, 100% { opacity: 0; }
        }
        @keyframes phase2-container {
          0%, 25% { opacity: 0; }
          30%, 55% { opacity: 1; }
          60%, 100% { opacity: 0; }
        }
        @keyframes phase2-dig {
          0%, 30% { transform: translateY(0); }
          35%, 55% { transform: translateY(-40px); }
        }
        @keyframes phase2-shovel {
          0%, 30% { transform: rotate(0deg) translateY(0); }
          35% { transform: rotate(-30deg) translateY(-5px); }
          40% { transform: rotate(15deg) translateY(10px); }
          45% { transform: rotate(-20deg) translateY(-3px); }
          50%, 55% { transform: rotate(0deg) translateY(0); }
        }
        @keyframes phase3-container {
          0%, 55% { opacity: 0; }
          60%, 80% { opacity: 1; }
          85%, 100% { opacity: 0; }
        }
        @keyframes phase3-rake {
          0%, 60% { transform: translateX(0); }
          65% { transform: translateX(30px); }
          70% { transform: translateX(-20px); }
          75% { transform: translateX(20px); }
          80% { transform: translateX(0); }
        }
        @keyframes phase3-surface {
          0%, 60% { d: path('M40 130 Q80 125 120 135 Q160 128 200 132 Q240 126 280 130'); }
          75%, 100% { d: path('M40 130 L280 130'); }
        }
        @keyframes phase4-container {
          0%, 80% { opacity: 0; }
          85%, 100% { opacity: 1; }
        }
        @keyframes phase4-compactor {
          0%, 85% { transform: translateY(0); }
          87% { transform: translateY(3px); }
          89% { transform: translateY(0); }
          91% { transform: translateY(3px); }
          93% { transform: translateY(0); }
          95% { transform: translateY(3px); }
          97% { transform: translateY(0); }
          99% { transform: translateY(2px); }
          100% { transform: translateY(0); }
        }
        @keyframes phase4-arrows {
          0%, 85% { opacity: 0; transform: translateY(-5px); }
          88%, 100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes phase-label {
          0%, 5% { opacity: 0; }
          10%, 90% { opacity: 1; }
          95%, 100% { opacity: 0; }
        }
      `}</style>

      {/* PHASE 1: Top View - Mark Area */}
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 320 270"
        preserveAspectRatio="xMidYMid meet"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          animation: 'phase1-container 12s infinite'
        }}
      >
        {/* Title */}
        <rect x="0" y="0" width="320" height="32" fill="#E3F2FD" />
        <text x="160" y="22" textAnchor="middle" fill="#1565C0" fontSize="14" fontWeight="600">
          {t.step1Title}
        </text>

        {/* Green grass background */}
        <rect x="20" y="50" width="280" height="180" fill="#7CB342" rx="4" />

        {/* Grass texture */}
        {[40, 70, 100, 130, 160, 190, 220, 250, 280].map((x, i) => (
          [60, 90, 120, 150, 180, 210].map((y, j) => (
            <g key={`grass-${i}-${j}`} opacity="0.6">
              <line x1={x} y1={y} x2={x-3} y2={y-8} stroke="#5D8A2D" strokeWidth="1" />
              <line x1={x} y1={y} x2={x+2} y2={y-7} stroke="#5D8A2D" strokeWidth="1" />
            </g>
          ))
        ))}

        {/* Marking lines - animated drawing */}
        <rect
          x="60" y="80" width="200" height="120"
          fill="none"
          stroke="#E53935"
          strokeWidth="3"
          strokeDasharray="200"
          style={{ animation: 'phase1-lines 12s infinite' }}
        />

        {/* Corner stakes */}
        {[[60, 80], [260, 80], [60, 200], [260, 200]].map(([x, y], i) => (
          <g key={`stake-${i}`} style={{ animation: 'phase1-dims 12s infinite' }}>
            <circle cx={x} cy={y} r="6" fill="#8B4513" stroke="#5D2E0C" strokeWidth="2" />
            <circle cx={x} cy={y} r="2" fill="#E53935" />
          </g>
        ))}

        {/* Width dimension */}
        <g style={{ animation: 'phase1-dims 12s infinite' }}>
          <line x1="60" y1="65" x2="260" y2="65" stroke="#1565C0" strokeWidth="2" />
          <line x1="60" y1="58" x2="60" y2="72" stroke="#1565C0" strokeWidth="2" />
          <line x1="260" y1="58" x2="260" y2="72" stroke="#1565C0" strokeWidth="2" />
          <rect x="130" y="52" width="60" height="20" fill="#E3F2FD" stroke="#1565C0" strokeWidth="1" rx="3" />
          <text x="160" y="67" textAnchor="middle" fill="#1565C0" fontSize="13" fontWeight="700">{t.dim9m}</text>
        </g>

        {/* Height dimension */}
        <g style={{ animation: 'phase1-dims 12s infinite' }}>
          <line x1="275" y1="80" x2="275" y2="200" stroke="#1565C0" strokeWidth="2" />
          <line x1="268" y1="80" x2="282" y2="80" stroke="#1565C0" strokeWidth="2" />
          <line x1="268" y1="200" x2="282" y2="200" stroke="#1565C0" strokeWidth="2" />
          <rect x="282" y="125" width="30" height="20" fill="#E3F2FD" stroke="#1565C0" strokeWidth="1" rx="3" />
          <text x="297" y="140" textAnchor="middle" fill="#1565C0" fontSize="13" fontWeight="700">{t.dim10m}</text>
        </g>

        {/* Phase label */}
        <g style={{ animation: 'phase-label 12s infinite' }}>
          <rect x="20" y="240" width="280" height="24" fill="#FFF3E0" stroke="#FF9800" strokeWidth="1" rx="4" />
          <text x="160" y="257" textAnchor="middle" fill="#E65100" fontSize="11" fontWeight="600">
            {t.phase1Label}
          </text>
        </g>
      </svg>

      {/* PHASE 2: Side View - Dig and Remove */}
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 320 270"
        preserveAspectRatio="xMidYMid meet"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          animation: 'phase2-container 12s infinite'
        }}
      >
        {/* Title */}
        <rect x="0" y="0" width="320" height="32" fill="#E3F2FD" />
        <text x="160" y="22" textAnchor="middle" fill="#1565C0" fontSize="14" fontWeight="600">
          {t.step2Title}
        </text>

        {/* Ground cross-section */}
        {/* Sky/air */}
        <rect x="20" y="50" width="280" height="60" fill="#E3F2FD" />

        {/* Grass layer being removed */}
        <g style={{ animation: 'phase2-dig 12s infinite' }}>
          <rect x="20" y="110" width="280" height="12" fill="#7CB342" />
          {[40, 70, 100, 130, 160, 190, 220, 250, 280].map((x, i) => (
            <path key={`blade-${i}`} d={`M${x} 110 Q${x-3} 100 ${x} 95 M${x} 110 Q${x+3} 102 ${x+2} 97`} stroke="#5D8A2D" strokeWidth="1.5" fill="none" />
          ))}
        </g>

        {/* Topsoil layer being removed */}
        <g style={{ animation: 'phase2-dig 12s infinite' }}>
          <rect x="20" y="122" width="280" height="35" fill="#5D4E37" />
          {/* Roots in topsoil */}
          {[50, 120, 200, 260].map((x, i) => (
            <path key={`root-${i}`} d={`M${x} 125 Q${x+10} 140 ${x-5} 150`} stroke="#3E2723" strokeWidth="2" fill="none" opacity="0.5" />
          ))}
          <text x="160" y="145" textAnchor="middle" fill="#FFF" fontSize="10" fontWeight="500">{t.topsoilRoots}</text>
        </g>

        {/* Subsoil (stays) */}
        <rect x="20" y="157" width="280" height="50" fill="#8B7355" />
        <text x="160" y="185" textAnchor="middle" fill="#FFF" fontSize="10" opacity="0.7">{t.subsoil}</text>

        {/* Depth dimension */}
        <g>
          <line x1="290" y1="110" x2="290" y2="157" stroke="#1565C0" strokeWidth="2" />
          <line x1="283" y1="110" x2="297" y2="110" stroke="#1565C0" strokeWidth="2" />
          <line x1="283" y1="157" x2="297" y2="157" stroke="#1565C0" strokeWidth="2" />
        </g>
        <rect x="248" y="120" width="58" height="24" fill="#E3F2FD" stroke="#1565C0" strokeWidth="1" rx="3" />
        <text x="277" y="137" textAnchor="middle" fill="#1565C0" fontSize="11" fontWeight="700">{t.depth}</text>

        {/* Shovel animation */}
        <g style={{ transformOrigin: '70px 100px', animation: 'phase2-shovel 12s infinite' }}>
          {/* Shovel handle */}
          <rect x="65" y="55" width="8" height="55" fill="#8B4513" rx="2" />
          {/* Shovel blade */}
          <path d="M60 110 L78 110 L74 130 Q69 135 64 130 Z" fill="#607D8B" stroke="#455A64" strokeWidth="1" />
        </g>

        {/* Removed material indicator */}
        <g>
          <path d="M160 90 L180 70 L200 70" stroke="#E53935" strokeWidth="2" fill="none" markerEnd="url(#arrowhead)" />
          <text x="205" y="75" fill="#E53935" fontSize="10" fontWeight="600">{t.remove}</text>
        </g>
        <defs>
          <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="#E53935" />
          </marker>
        </defs>

        {/* Phase label */}
        <rect x="20" y="215" width="280" height="45" fill="#FFEBEE" stroke="#E53935" strokeWidth="1" rx="4" />
        <text x="160" y="233" textAnchor="middle" fill="#C62828" fontSize="11" fontWeight="600">
          {t.phase2Label1}
        </text>
        <text x="160" y="250" textAnchor="middle" fill="#C62828" fontSize="10">
          {t.phase2Label2}
        </text>
      </svg>

      {/* PHASE 3: Level Surface */}
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 320 270"
        preserveAspectRatio="xMidYMid meet"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          animation: 'phase3-container 12s infinite'
        }}
      >
        {/* Title */}
        <rect x="0" y="0" width="320" height="32" fill="#E3F2FD" />
        <text x="160" y="22" textAnchor="middle" fill="#1565C0" fontSize="14" fontWeight="600">
          {t.step3Title}
        </text>

        {/* Sky/excavated area */}
        <rect x="20" y="50" width="280" height="80" fill="#F5F5F5" />

        {/* Uneven surface being leveled */}
        <path
          d="M20 130 Q60 125 100 135 Q140 128 180 132 Q220 126 260 130 L300 130 L300 207 L20 207 Z"
          fill="#8B7355"
        />

        {/* Level line indicator */}
        <line x1="20" y1="130" x2="300" y2="130" stroke="#1565C0" strokeWidth="2" strokeDasharray="8,4" />
        <text x="160" y="145" textAnchor="middle" fill="#1565C0" fontSize="10" fontWeight="600">{t.levelLine}</text>

        {/* Rake tool */}
        <g style={{ transformOrigin: '160px 100px', animation: 'phase3-rake 12s infinite' }}>
          {/* Handle */}
          <rect x="155" y="50" width="6" height="70" fill="#8B4513" rx="2" />
          {/* Rake head */}
          <rect x="130" y="118" width="50" height="8" fill="#607D8B" rx="2" />
          {/* Rake tines */}
          {[135, 145, 155, 165, 175].map((x, i) => (
            <rect key={`tine-${i}`} x={x} y="126" width="3" height="10" fill="#455A64" />
          ))}
        </g>

        {/* Depth reference */}
        <g>
          <line x1="290" y1="50" x2="290" y2="130" stroke="#1565C0" strokeWidth="2" />
          <line x1="283" y1="50" x2="297" y2="50" stroke="#1565C0" strokeWidth="2" />
          <line x1="283" y1="130" x2="297" y2="130" stroke="#1565C0" strokeWidth="2" />
        </g>
        <rect x="248" y="76" width="58" height="24" fill="#E3F2FD" stroke="#1565C0" strokeWidth="1" rx="3" />
        <text x="277" y="93" textAnchor="middle" fill="#1565C0" fontSize="11" fontWeight="700">{t.depth}</text>

        {/* Phase label */}
        <rect x="20" y="215" width="280" height="45" fill="#E8F5E9" stroke="#4CAF50" strokeWidth="1" rx="4" />
        <text x="160" y="233" textAnchor="middle" fill="#2E7D32" fontSize="11" fontWeight="600">
          {t.phase3Label1}
        </text>
        <text x="160" y="250" textAnchor="middle" fill="#2E7D32" fontSize="10">
          {t.phase3Label2}
        </text>
      </svg>

      {/* PHASE 4: Compact Soil */}
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 320 270"
        preserveAspectRatio="xMidYMid meet"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          animation: 'phase4-container 12s infinite'
        }}
      >
        {/* Title */}
        <rect x="0" y="0" width="320" height="32" fill="#E3F2FD" />
        <text x="160" y="22" textAnchor="middle" fill="#1565C0" fontSize="14" fontWeight="600">
          {t.step4Title}
        </text>

        {/* Excavated area */}
        <rect x="20" y="50" width="280" height="80" fill="#F5F5F5" />

        {/* Compacted soil - flat and level */}
        <rect x="20" y="130" width="280" height="77" fill="#8B7355" />

        {/* Compaction marks */}
        <line x1="20" y1="130" x2="300" y2="130" stroke="#5D4E37" strokeWidth="3" />

        {/* Plate compactor */}
        <g style={{ animation: 'phase4-compactor 12s infinite' }}>
          {/* Handle */}
          <rect x="145" y="55" width="10" height="40" fill="#424242" rx="2" />
          <rect x="140" y="50" width="20" height="10" fill="#616161" rx="3" />
          {/* Engine housing */}
          <rect x="125" y="95" width="50" height="25" fill="#FF5722" rx="4" />
          <rect x="135" y="100" width="30" height="8" fill="#BF360C" rx="2" />
          {/* Base plate */}
          <rect x="115" y="120" width="70" height="12" fill="#607D8B" rx="2" />
        </g>

        {/* Vibration lines */}
        <g style={{ animation: 'phase4-arrows 12s infinite' }}>
          {[130, 150, 170].map((x, i) => (
            <g key={`vib-${i}`}>
              <line x1={x} y1="135" x2={x} y2="145" stroke="#FF5722" strokeWidth="2" />
              <polygon points={`${x-4} 145, ${x+4} 145, ${x} 152`} fill="#FF5722" />
            </g>
          ))}
        </g>

        {/* Compression arrows */}
        <g style={{ animation: 'phase4-arrows 12s infinite' }}>
          <path d="M60 145 L60 160" stroke="#1565C0" strokeWidth="2" />
          <polygon points="56 160, 64 160, 60 170" fill="#1565C0" />
          <path d="M240 145 L240 160" stroke="#1565C0" strokeWidth="2" />
          <polygon points="236 160, 244 160, 240 170" fill="#1565C0" />
        </g>

        {/* Final depth reference */}
        <g>
          <line x1="290" y1="50" x2="290" y2="130" stroke="#1565C0" strokeWidth="2" />
          <line x1="283" y1="50" x2="297" y2="50" stroke="#1565C0" strokeWidth="2" />
          <line x1="283" y1="130" x2="297" y2="130" stroke="#1565C0" strokeWidth="2" />
        </g>
        <rect x="248" y="76" width="58" height="24" fill="#E3F2FD" stroke="#1565C0" strokeWidth="1" rx="3" />
        <text x="277" y="93" textAnchor="middle" fill="#1565C0" fontSize="11" fontWeight="700">{t.depth}</text>

        {/* Phase label */}
        <rect x="20" y="215" width="280" height="45" fill="#E3F2FD" stroke="#1565C0" strokeWidth="1" rx="4" />
        <text x="160" y="233" textAnchor="middle" fill="#0D47A1" fontSize="11" fontWeight="600">
          {t.phase4Label1}
        </text>
        <text x="160" y="250" textAnchor="middle" fill="#0D47A1" fontSize="10">
          {t.phase4Label2}
        </text>
      </svg>
    </div>
  );
};

// ============================================================================
// GRAVEL BASE - Simple layered view
// ============================================================================
export const GravelBaseAnimation: React.FC<AnimationProps> = ({ size = 280 }) => (
  <svg width={size} height={size * 0.75} viewBox="0 0 280 210">
    {/* Title */}
    <rect x="0" y="0" width="280" height="28" fill={palette.dimensionBg} />
    <text x="140" y="18" textAnchor="middle" fill={palette.dimension} fontSize="12" fontWeight="600">GRAVEL BASE LAYER</text>

    {/* Formwork sides */}
    <rect x="30" y="70" width="18" height="90" fill={palette.wood} stroke={palette.woodDark} strokeWidth="2" />
    <rect x="232" y="70" width="18" height="90" fill={palette.wood} stroke={palette.woodDark} strokeWidth="2" />

    {/* Soil base */}
    <rect x="48" y="130" width="184" height="30" fill={palette.soil} />
    <text x="140" y="150" textAnchor="middle" fill={palette.white} fontSize="10" fontWeight="500">SOIL</text>

    {/* Gravel layer */}
    <rect x="48" y="95" width="184" height="35" fill={palette.gravel} stroke={palette.gravelDark} strokeWidth="1" />
    {/* Gravel dots pattern */}
    {[70, 100, 130, 160, 190].map((x, i) => (
      <g key={i}>
        <circle cx={x} cy={108} r="4" fill={palette.gravelDark} />
        <circle cx={x + 15} cy={118} r="3" fill={palette.gravelDark} />
      </g>
    ))}
    <text x="140" y="115" textAnchor="middle" fill={palette.white} fontSize="11" fontWeight="600">GRAVEL</text>

    {/* Compact arrows */}
    {[90, 140, 190].map((x, i) => (
      <g key={i} transform={`translate(${x}, 45)`}>
        <line x1="0" y1="0" x2="0" y2="35" stroke={palette.dimension} strokeWidth="2" />
        <polygon points="-6,30 6,30 0,42" fill={palette.dimension} />
      </g>
    ))}
    <text x="140" y="38" textAnchor="middle" fill={palette.dimension} fontSize="11" fontWeight="600">COMPACT</text>

    {/* Depth dimension */}
    <g transform="translate(255, 95)">
      <line x1="10" y1="0" x2="10" y2="35" stroke={palette.dimension} strokeWidth="2" />
      <line x1="3" y1="0" x2="17" y2="0" stroke={palette.dimension} strokeWidth="2" />
      <line x1="3" y1="35" x2="17" y2="35" stroke={palette.dimension} strokeWidth="2" />
    </g>
    <text x="277" y="118" textAnchor="middle" fill={palette.dimension} fontSize="11" fontWeight="700">15cm</text>

    {/* Labels for formwork */}
    <text x="39" y="185" textAnchor="middle" fill={palette.gray} fontSize="9">FORM</text>
    <text x="241" y="185" textAnchor="middle" fill={palette.gray} fontSize="9">FORM</text>
  </svg>
);

// ============================================================================
// FORMWORK - Clear side view with proper sizing
// ============================================================================
export const FormworkAnimation: React.FC<AnimationProps> = ({ size = 280 }) => (
  <svg width={size} height={size * 0.75} viewBox="0 0 280 210">
    {/* Title */}
    <rect x="0" y="0" width="280" height="28" fill={palette.dimensionBg} />
    <text x="140" y="18" textAnchor="middle" fill={palette.dimension} fontSize="12" fontWeight="600">FORMWORK SETUP</text>

    {/* Gravel base */}
    <rect x="0" y="145" width="280" height="25" fill={palette.gravel} />
    <text x="140" y="162" textAnchor="middle" fill={palette.white} fontSize="10" fontWeight="500">GRAVEL BASE</text>

    {/* Left formwork assembly */}
    <g transform="translate(45, 85)">
      {/* Board */}
      <rect x="0" y="0" width="20" height="60" fill={palette.wood} stroke={palette.woodDark} strokeWidth="2" />
      <text x="10" y="75" textAnchor="middle" fill={palette.gray} fontSize="8">BOARD</text>
      {/* Stake */}
      <rect x="-18" y="15" width="12" height="65" fill={palette.woodDark} stroke={palette.black} strokeWidth="1" />
      <polygon points="-18,80 -6,80 -12,95" fill={palette.woodDark} stroke={palette.black} strokeWidth="1" />
      <text x="-12" y="105" textAnchor="middle" fill={palette.gray} fontSize="8">STAKE</text>
    </g>

    {/* Right formwork assembly */}
    <g transform="translate(215, 85)">
      {/* Board */}
      <rect x="0" y="0" width="20" height="60" fill={palette.wood} stroke={palette.woodDark} strokeWidth="2" />
      {/* Stake */}
      <rect x="26" y="15" width="12" height="65" fill={palette.woodDark} stroke={palette.black} strokeWidth="1" />
      <polygon points="26,80 38,80 32,95" fill={palette.woodDark} stroke={palette.black} strokeWidth="1" />
    </g>

    {/* String line */}
    <line x1="65" y1="90" x2="215" y2="90" stroke={palette.arrow} strokeWidth="2" strokeDasharray="8,4" />
    <text x="140" y="82" textAnchor="middle" fill={palette.arrow} fontSize="10" fontWeight="500">STRING LINE</text>

    {/* Height dimension - LEFT with large label */}
    <g transform="translate(10, 85)">
      <line x1="0" y1="0" x2="0" y2="60" stroke={palette.dimension} strokeWidth="2" />
      <line x1="-8" y1="0" x2="8" y2="0" stroke={palette.dimension} strokeWidth="2" />
      <line x1="-8" y1="60" x2="8" y2="60" stroke={palette.dimension} strokeWidth="2" />
      <rect x="-40" y="20" width="38" height="22" fill={palette.dimensionBg} stroke={palette.dimension} strokeWidth="1" rx="3" />
      <text x="-21" y="36" textAnchor="middle" fill={palette.dimension} fontSize="13" fontWeight="700">15cm</text>
    </g>

    {/* Level indicator */}
    <g transform="translate(115, 55)">
      <rect x="0" y="0" width="50" height="18" fill="#FFD54F" stroke="#F9A825" strokeWidth="1.5" rx="3" />
      <rect x="17" y="4" width="16" height="10" fill="#81D4FA" stroke="#0288D1" strokeWidth="1" rx="2" />
      <circle cx="25" cy="9" r="3" fill="#4CAF50" />
      <text x="25" y="32" textAnchor="middle" fill={palette.gray} fontSize="9" fontWeight="500">LEVEL</text>
    </g>

    {/* Width dimension */}
    <g transform="translate(65, 180)">
      <line x1="0" y1="0" x2="150" y2="0" stroke={palette.dimension} strokeWidth="2" />
      <line x1="0" y1="-8" x2="0" y2="8" stroke={palette.dimension} strokeWidth="2" />
      <line x1="150" y1="-8" x2="150" y2="8" stroke={palette.dimension} strokeWidth="2" />
      <rect x="50" y="5" width="50" height="18" fill={palette.dimensionBg} stroke={palette.dimension} strokeWidth="1" rx="3" />
      <text x="75" y="18" textAnchor="middle" fill={palette.dimension} fontSize="10" fontWeight="600">SLAB WIDTH</text>
    </g>
  </svg>
);

// ============================================================================
// REBAR GRID - Clean top view
// ============================================================================
export const RebarAnimation: React.FC<AnimationProps> = ({ size = 280 }) => (
  <svg width={size} height={size * 0.75} viewBox="0 0 280 210">
    {/* Title */}
    <rect x="0" y="0" width="280" height="28" fill={palette.dimensionBg} />
    <text x="140" y="18" textAnchor="middle" fill={palette.dimension} fontSize="12" fontWeight="600">REBAR GRID - TOP VIEW</text>

    {/* Formwork outline */}
    <rect x="40" y="40" width="200" height="130" fill={palette.lightGray} stroke={palette.woodDark} strokeWidth="8" />

    {/* Horizontal rebars */}
    {[60, 95, 130].map((y, i) => (
      <rect key={`h${i}`} x="50" y={y} width="180" height="6" fill={palette.rebar} rx="3" />
    ))}

    {/* Vertical rebars */}
    {[70, 110, 150, 190].map((x, i) => (
      <rect key={`v${i}`} x={x} y="50" width="6" height="110" fill={palette.rebar} rx="3" />
    ))}

    {/* Wire ties at intersections - simplified */}
    {[60, 95, 130].flatMap((y) =>
      [70, 110, 150, 190].map((x) => (
        <circle key={`t${x}${y}`} cx={x + 3} cy={y + 3} r="5" fill="none" stroke={palette.metalDark} strokeWidth="2" />
      ))
    )}

    {/* Spacing dimension - horizontal */}
    <g transform="translate(70, 175)">
      <line x1="0" y1="0" x2="40" y2="0" stroke={palette.dimension} strokeWidth="2" />
      <line x1="0" y1="-6" x2="0" y2="6" stroke={palette.dimension} strokeWidth="2" />
      <line x1="40" y1="-6" x2="40" y2="6" stroke={palette.dimension} strokeWidth="2" />
      <text x="20" y="15" textAnchor="middle" fill={palette.dimension} fontSize="10" fontWeight="600">15cm</text>
    </g>

    {/* Spacing dimension - vertical */}
    <g transform="translate(248, 60)">
      <line x1="0" y1="0" x2="0" y2="35" stroke={palette.dimension} strokeWidth="2" />
      <line x1="-6" y1="0" x2="6" y2="0" stroke={palette.dimension} strokeWidth="2" />
      <line x1="-6" y1="35" x2="6" y2="35" stroke={palette.dimension} strokeWidth="2" />
      <text x="15" y="22" fill={palette.dimension} fontSize="10" fontWeight="600">15cm</text>
    </g>

    {/* Legend */}
    <g transform="translate(130, 178)">
      <circle cx="0" cy="0" r="5" fill="none" stroke={palette.metalDark} strokeWidth="2" />
      <text x="10" y="4" fill={palette.gray} fontSize="9">= Wire tie</text>
    </g>
  </svg>
);

// ============================================================================
// CONCRETE POUR - Simple side view
// ============================================================================
export const ConcretePourAnimation: React.FC<AnimationProps> = ({ size = 280 }) => (
  <svg width={size} height={size * 0.75} viewBox="0 0 280 210">
    {/* Title */}
    <rect x="0" y="0" width="280" height="28" fill={palette.dimensionBg} />
    <text x="140" y="18" textAnchor="middle" fill={palette.dimension} fontSize="12" fontWeight="600">CONCRETE POUR</text>

    {/* Ground */}
    <rect x="0" y="165" width="280" height="45" fill={palette.soil} />

    {/* Formwork */}
    <rect x="50" y="115" width="18" height="55" fill={palette.wood} stroke={palette.woodDark} strokeWidth="2" />
    <rect x="212" y="115" width="18" height="55" fill={palette.wood} stroke={palette.woodDark} strokeWidth="2" />

    {/* Gravel */}
    <rect x="68" y="150" width="144" height="15" fill={palette.gravel} />

    {/* Concrete already poured */}
    <rect x="68" y="125" width="80" height="25" fill={palette.concrete} />

    {/* Concrete being poured */}
    <path d="M165 50 Q170 70 168 90 L172 90 Q175 70 170 50 Z" fill={palette.concrete} />
    <ellipse cx="170" cy="115" rx="15" ry="8" fill={palette.concrete} />

    {/* Chute */}
    <rect x="130" y="35" width="70" height="12" fill={palette.metalDark} rx="2" transform="rotate(15, 165, 41)" />

    {/* Pour direction */}
    <g transform="translate(185, 65)">
      <path d="M0 0 L0 30" stroke={palette.arrow} strokeWidth="3" />
      <polygon points="-6,25 6,25 0,38" fill={palette.arrow} />
    </g>
    <text x="205" y="75" fill={palette.arrow} fontSize="10" fontWeight="500">POUR</text>

    {/* Rebar circles */}
    {[85, 115, 145, 175].map((x, i) => (
      <circle key={i} cx={x} cy={138} r="4" fill={palette.rebar} />
    ))}

    {/* Thickness dimension */}
    <g transform="translate(235, 125)">
      <line x1="10" y1="0" x2="10" y2="25" stroke={palette.dimension} strokeWidth="2" />
      <line x1="3" y1="0" x2="17" y2="0" stroke={palette.dimension} strokeWidth="2" />
      <line x1="3" y1="25" x2="17" y2="25" stroke={palette.dimension} strokeWidth="2" />
      <text x="25" y="17" fill={palette.dimension} fontSize="11" fontWeight="700">15cm</text>
    </g>

    {/* Labels */}
    <text x="100" y="142" textAnchor="middle" fill={palette.white} fontSize="10" fontWeight="500">CONCRETE</text>
    <text x="140" y="162" textAnchor="middle" fill={palette.white} fontSize="9">GRAVEL</text>
  </svg>
);

// ============================================================================
// SMOOTHING - Clear float technique
// ============================================================================
export const SmoothingAnimation: React.FC<AnimationProps> = ({ size = 280 }) => (
  <svg width={size} height={size * 0.75} viewBox="0 0 280 210">
    {/* Title */}
    <rect x="0" y="0" width="280" height="28" fill={palette.dimensionBg} />
    <text x="140" y="18" textAnchor="middle" fill={palette.dimension} fontSize="12" fontWeight="600">SURFACE FINISHING</text>

    {/* Formwork */}
    <rect x="25" y="100" width="15" height="50" fill={palette.wood} stroke={palette.woodDark} strokeWidth="1" />
    <rect x="240" y="100" width="15" height="50" fill={palette.wood} stroke={palette.woodDark} strokeWidth="1" />

    {/* Concrete surface */}
    <rect x="40" y="110" width="200" height="40" fill={palette.concrete} />

    {/* Rough texture (left) */}
    {[55, 75, 95].map((x, i) => (
      <ellipse key={i} cx={x} cy={113} rx="8" ry="3" fill={palette.concreteDark} />
    ))}

    {/* Smooth surface (right) */}
    <rect x="130" y="110" width="110" height="5" fill={palette.concreteLight} />

    {/* Float tool */}
    <g transform="translate(100, 75)">
      <rect x="0" y="25" width="60" height="10" fill={palette.wood} stroke={palette.woodDark} strokeWidth="1.5" rx="2" />
      <rect x="25" y="5" width="10" height="22" fill={palette.wood} stroke={palette.woodDark} strokeWidth="1" />
      <text x="30" y="-5" textAnchor="middle" fill={palette.gray} fontSize="10" fontWeight="500">FLOAT</text>
    </g>

    {/* Direction arrow */}
    <g transform="translate(170, 88)">
      <line x1="0" y1="0" x2="40" y2="0" stroke={palette.arrow} strokeWidth="3" />
      <polygon points="35,-6 35,6 48,0" fill={palette.arrow} />
    </g>

    {/* Labels */}
    <text x="70" y="135" textAnchor="middle" fill={palette.gray} fontSize="10">ROUGH</text>
    <text x="185" y="135" textAnchor="middle" fill={palette.gray} fontSize="10">SMOOTH</text>

    {/* Technique box */}
    <g transform="translate(30, 160)">
      <rect x="0" y="0" width="220" height="35" fill={palette.dimensionBg} stroke={palette.dimension} strokeWidth="1" rx="4" />
      <text x="110" y="15" textAnchor="middle" fill={palette.dimension} fontSize="10" fontWeight="600">TECHNIQUE</text>
      <text x="110" y="28" textAnchor="middle" fill={palette.gray} fontSize="9">Sweep float in arcs, keep blade flat</text>
    </g>
  </svg>
);

// ============================================================================
// MEASURING - Simple layout view
// ============================================================================
export const MeasuringAnimation: React.FC<AnimationProps> = ({ size = 280 }) => (
  <svg width={size} height={size * 0.75} viewBox="0 0 280 210">
    {/* Title */}
    <rect x="0" y="0" width="280" height="28" fill={palette.dimensionBg} />
    <text x="140" y="18" textAnchor="middle" fill={palette.dimension} fontSize="12" fontWeight="600">SITE LAYOUT - TOP VIEW</text>

    {/* Ground area */}
    <rect x="40" y="45" width="200" height="110" fill={palette.lightGray} stroke={palette.grass} strokeWidth="2" />

    {/* Corner stakes */}
    {[[50, 55, 'A'], [230, 55, 'B'], [50, 145, 'C'], [230, 145, 'D']].map(([x, y, label]) => (
      <g key={String(label)} transform={`translate(${x}, ${y})`}>
        <rect x="-6" y="-6" width="12" height="12" fill={palette.woodDark} stroke={palette.black} strokeWidth="1" />
        <text x="0" y={Number(y) < 100 ? -12 : 20} textAnchor="middle" fill={palette.gray} fontSize="11" fontWeight="600">{String(label)}</text>
      </g>
    ))}

    {/* String lines */}
    <line x1="50" y1="55" x2="230" y2="55" stroke={palette.arrow} strokeWidth="2" />
    <line x1="50" y1="145" x2="230" y2="145" stroke={palette.arrow} strokeWidth="2" />
    <line x1="50" y1="55" x2="50" y2="145" stroke={palette.arrow} strokeWidth="2" />
    <line x1="230" y1="55" x2="230" y2="145" stroke={palette.arrow} strokeWidth="2" />

    {/* Diagonals */}
    <line x1="50" y1="55" x2="230" y2="145" stroke={palette.dimension} strokeWidth="1.5" strokeDasharray="6,4" />
    <line x1="230" y1="55" x2="50" y2="145" stroke={palette.dimension} strokeWidth="1.5" strokeDasharray="6,4" />

    {/* Center text */}
    <text x="140" y="95" textAnchor="middle" fill={palette.dimension} fontSize="10" fontWeight="500">DIAGONALS</text>
    <text x="140" y="108" textAnchor="middle" fill={palette.dimension} fontSize="10" fontWeight="500">MUST MATCH</text>

    {/* Width dimension */}
    <g transform="translate(50, 170)">
      <line x1="0" y1="0" x2="180" y2="0" stroke={palette.dimension} strokeWidth="2" />
      <line x1="0" y1="-6" x2="0" y2="6" stroke={palette.dimension} strokeWidth="2" />
      <line x1="180" y1="-6" x2="180" y2="6" stroke={palette.dimension} strokeWidth="2" />
      <rect x="70" y="5" width="40" height="18" fill={palette.dimensionBg} stroke={palette.dimension} strokeWidth="1" rx="3" />
      <text x="90" y="18" textAnchor="middle" fill={palette.dimension} fontSize="11" fontWeight="700">5.0m</text>
    </g>

    {/* Height dimension */}
    <g transform="translate(255, 55)">
      <line x1="0" y1="0" x2="0" y2="90" stroke={palette.dimension} strokeWidth="2" />
      <line x1="-6" y1="0" x2="6" y2="0" stroke={palette.dimension} strokeWidth="2" />
      <line x1="-6" y1="90" x2="6" y2="90" stroke={palette.dimension} strokeWidth="2" />
      <rect x="8" y="35" width="32" height="18" fill={palette.dimensionBg} stroke={palette.dimension} strokeWidth="1" rx="3" />
      <text x="24" y="48" textAnchor="middle" fill={palette.dimension} fontSize="11" fontWeight="700">3.0m</text>
    </g>
  </svg>
);

// ============================================================================
// DIGGING - Clean post hole cross-section
// ============================================================================
export const DiggingAnimation: React.FC<AnimationProps> = ({ size = 280 }) => (
  <svg width={size} height={size * 0.75} viewBox="0 0 280 210">
    {/* Title */}
    <rect x="0" y="0" width="280" height="28" fill={palette.dimensionBg} />
    <text x="140" y="18" textAnchor="middle" fill={palette.dimension} fontSize="12" fontWeight="600">POST HOLE - CROSS-SECTION</text>

    {/* Ground surface */}
    <rect x="0" y="60" width="280" height="8" fill={palette.grass} />

    {/* Soil */}
    <rect x="0" y="68" width="280" height="110" fill={palette.soil} />

    {/* Post hole */}
    <rect x="100" y="68" width="80" height="90" fill={palette.lightGray} stroke={palette.soilDark} strokeWidth="2" />

    {/* Width dimension */}
    <g transform="translate(100, 42)">
      <line x1="0" y1="0" x2="80" y2="0" stroke={palette.dimension} strokeWidth="2" />
      <line x1="0" y1="-6" x2="0" y2="6" stroke={palette.dimension} strokeWidth="2" />
      <line x1="80" y1="-6" x2="80" y2="6" stroke={palette.dimension} strokeWidth="2" />
      <rect x="25" y="-20" width="32" height="18" fill={palette.dimensionBg} stroke={palette.dimension} strokeWidth="1" rx="3" />
      <text x="41" y="-6" textAnchor="middle" fill={palette.dimension} fontSize="12" fontWeight="700">30cm</text>
    </g>

    {/* Depth dimension */}
    <g transform="translate(195, 68)">
      <line x1="10" y1="0" x2="10" y2="90" stroke={palette.dimension} strokeWidth="2" />
      <line x1="3" y1="0" x2="17" y2="0" stroke={palette.dimension} strokeWidth="2" />
      <line x1="3" y1="90" x2="17" y2="90" stroke={palette.dimension} strokeWidth="2" />
      <rect x="22" y="35" width="35" height="22" fill={palette.dimensionBg} stroke={palette.dimension} strokeWidth="1" rx="3" />
      <text x="40" y="51" textAnchor="middle" fill={palette.dimension} fontSize="13" fontWeight="700">60cm</text>
    </g>

    {/* Simple tool illustration */}
    <g transform="translate(45, 80)">
      <rect x="0" y="0" width="8" height="70" fill={palette.wood} stroke={palette.woodDark} strokeWidth="1" />
      <rect x="20" y="0" width="8" height="70" fill={palette.wood} stroke={palette.woodDark} strokeWidth="1" />
      <path d="M0 70 Q-5 85 8 90 Q15 85 8 70" fill={palette.metalDark} />
      <path d="M20 70 Q33 85 20 90 Q13 85 20 70" fill={palette.metalDark} />
    </g>
    <text x="55" y="105" textAnchor="middle" fill={palette.gray} fontSize="8">DIGGER</text>

    {/* Note */}
    <g transform="translate(20, 180)">
      <rect x="0" y="0" width="240" height="22" fill={palette.dimensionBg} stroke={palette.dimension} strokeWidth="1" rx="3" />
      <text x="120" y="15" textAnchor="middle" fill={palette.gray} fontSize="9">Depth = 1/3 of total post length</text>
    </g>
  </svg>
);

// ============================================================================
// POST INSTALL - Clear front view
// ============================================================================
export const PostInstallAnimation: React.FC<AnimationProps> = ({ size = 280 }) => (
  <svg width={size} height={size * 0.75} viewBox="0 0 280 210">
    {/* Title */}
    <rect x="0" y="0" width="280" height="28" fill={palette.dimensionBg} />
    <text x="140" y="18" textAnchor="middle" fill={palette.dimension} fontSize="12" fontWeight="600">POST INSTALLATION</text>

    {/* Ground */}
    <rect x="0" y="130" width="280" height="10" fill={palette.grass} />
    <rect x="0" y="140" width="280" height="50" fill={palette.soil} />

    {/* Post hole */}
    <rect x="100" y="140" width="80" height="50" fill={palette.lightGray} />

    {/* Concrete */}
    <rect x="105" y="155" width="70" height="35" fill={palette.concrete} stroke={palette.concreteDark} strokeWidth="1" />
    <text x="140" y="178" textAnchor="middle" fill={palette.white} fontSize="9" fontWeight="500">CONCRETE</text>

    {/* Metal post */}
    <rect x="125" y="40" width="30" height="150" fill={palette.metal} stroke={palette.metalDark} strokeWidth="2" />
    <rect x="122" y="35" width="36" height="10" fill={palette.metalDark} rx="2" />

    {/* Level on post */}
    <g transform="translate(160, 70)">
      <rect x="0" y="0" width="55" height="18" fill="#FFD54F" stroke="#F9A825" strokeWidth="1.5" rx="3" />
      <rect x="18" y="4" width="18" height="10" fill="#81D4FA" stroke="#0288D1" strokeWidth="1" rx="2" />
      <circle cx="27" cy="9" r="3" fill="#4CAF50" />
      <text x="27" y="32" textAnchor="middle" fill={palette.gray} fontSize="9" fontWeight="500">LEVEL</text>
    </g>

    {/* Plumb line */}
    <line x1="140" y1="30" x2="140" y2="195" stroke={palette.dimension} strokeWidth="1.5" strokeDasharray="5,3" />
    <text x="140" y="25" textAnchor="middle" fill={palette.dimension} fontSize="9" fontWeight="500">PLUMB</text>

    {/* Check arrows */}
    <g transform="translate(95, 80)">
      <line x1="0" y1="0" x2="0" y2="40" stroke={palette.arrow} strokeWidth="2" />
      <polygon points="-5,5 5,5 0,-3" fill={palette.arrow} />
      <polygon points="-5,35 5,35 0,43" fill={palette.arrow} />
    </g>

    {/* Note */}
    <text x="140" y="202" textAnchor="middle" fill={palette.gray} fontSize="9">Check plumb on 2 faces • Brace until set</text>
  </svg>
);

// ============================================================================
// CONCRETE MIXING - Simple ratio diagram
// ============================================================================
export const ConcreteMixingAnimation: React.FC<AnimationProps> = ({ size = 280 }) => (
  <svg width={size} height={size * 0.75} viewBox="0 0 280 210">
    {/* Title */}
    <rect x="0" y="0" width="280" height="28" fill={palette.dimensionBg} />
    <text x="140" y="18" textAnchor="middle" fill={palette.dimension} fontSize="12" fontWeight="600">CONCRETE MIX RATIO</text>

    {/* Mix ratio boxes */}
    <g transform="translate(30, 45)">
      {/* Cement */}
      <rect x="0" y="0" width="50" height="50" fill={palette.concrete} stroke={palette.concreteDark} strokeWidth="2" rx="4" />
      <text x="25" y="30" textAnchor="middle" fill={palette.white} fontSize="16" fontWeight="700">1</text>
      <text x="25" y="70" textAnchor="middle" fill={palette.gray} fontSize="10" fontWeight="500">CEMENT</text>
    </g>

    <g transform="translate(95, 45)">
      {/* Sand */}
      <rect x="0" y="0" width="50" height="50" fill="#E8D5B7" stroke="#C4A574" strokeWidth="2" rx="4" />
      <rect x="55" y="0" width="50" height="50" fill="#E8D5B7" stroke="#C4A574" strokeWidth="2" rx="4" />
      <text x="52" y="30" textAnchor="middle" fill={palette.woodDark} fontSize="16" fontWeight="700">2</text>
      <text x="52" y="70" textAnchor="middle" fill={palette.gray} fontSize="10" fontWeight="500">SAND</text>
    </g>

    <g transform="translate(165, 45)">
      {/* Gravel */}
      <rect x="0" y="0" width="50" height="50" fill={palette.gravel} stroke={palette.gravelDark} strokeWidth="2" rx="4" />
      <rect x="55" y="0" width="50" height="50" fill={palette.gravel} stroke={palette.gravelDark} strokeWidth="2" rx="4" />
      <rect x="0" y="55" width="50" height="50" fill={palette.gravel} stroke={palette.gravelDark} strokeWidth="2" rx="4" />
      <text x="52" y="80" textAnchor="middle" fill={palette.white} fontSize="16" fontWeight="700">3</text>
      <text x="52" y="125" textAnchor="middle" fill={palette.gray} fontSize="10" fontWeight="500">GRAVEL</text>
    </g>

    {/* Plus signs */}
    <text x="85" y="78" textAnchor="middle" fill={palette.gray} fontSize="20" fontWeight="700">+</text>
    <text x="160" y="78" textAnchor="middle" fill={palette.gray} fontSize="20" fontWeight="700">+</text>

    {/* Water note */}
    <g transform="translate(30, 145)">
      <rect x="0" y="0" width="220" height="50" fill={palette.dimensionBg} stroke={palette.dimension} strokeWidth="1" rx="4" />
      <rect x="10" y="10" width="30" height="30" fill="#B3E5FC" stroke="#0288D1" strokeWidth="1" rx="4" />
      <text x="25" y="30" textAnchor="middle" fill="#0288D1" fontSize="14" fontWeight="700">½</text>
      <text x="50" y="22" fill={palette.gray} fontSize="10" fontWeight="500">WATER (by volume)</text>
      <text x="50" y="36" fill={palette.gray} fontSize="9">Add gradually until workable</text>
    </g>
  </svg>
);

// ============================================================================
// PANEL ATTACH - Clean fence panel view
// ============================================================================
export const PanelAttachAnimation: React.FC<AnimationProps> = ({ size = 280 }) => (
  <svg width={size} height={size * 0.75} viewBox="0 0 280 210">
    {/* Title */}
    <rect x="0" y="0" width="280" height="28" fill={palette.dimensionBg} />
    <text x="140" y="18" textAnchor="middle" fill={palette.dimension} fontSize="12" fontWeight="600">PANEL ATTACHMENT</text>

    {/* Ground */}
    <rect x="0" y="165" width="280" height="45" fill={palette.grass} />

    {/* Posts */}
    <rect x="35" y="45" width="20" height="125" fill={palette.metal} stroke={palette.metalDark} strokeWidth="2" />
    <rect x="225" y="45" width="20" height="125" fill={palette.metal} stroke={palette.metalDark} strokeWidth="2" />

    {/* Rails */}
    <rect x="55" y="60" width="170" height="10" fill={palette.wood} stroke={palette.woodDark} strokeWidth="1" />
    <rect x="55" y="105" width="170" height="10" fill={palette.wood} stroke={palette.woodDark} strokeWidth="1" />
    <rect x="55" y="150" width="170" height="10" fill={palette.wood} stroke={palette.woodDark} strokeWidth="1" />

    {/* Vertical boards */}
    {[65, 95, 125, 155, 185, 215].map((x, i) => (
      <rect key={i} x={x} y="55" width="10" height="110" fill={palette.wood} stroke={palette.woodDark} strokeWidth="0.5" />
    ))}

    {/* Screws with callout */}
    <g transform="translate(55, 65)">
      <circle cx="0" cy="0" r="4" fill={palette.metalDark} />
      <line x1="5" y1="-5" x2="25" y2="-20" stroke={palette.gray} strokeWidth="1" />
      <text x="30" y="-18" fill={palette.gray} fontSize="9">SCREWS</text>
    </g>

    {/* Panel width dimension */}
    <g transform="translate(55, 182)">
      <line x1="0" y1="0" x2="170" y2="0" stroke={palette.dimension} strokeWidth="2" />
      <line x1="0" y1="-6" x2="0" y2="6" stroke={palette.dimension} strokeWidth="2" />
      <line x1="170" y1="-6" x2="170" y2="6" stroke={palette.dimension} strokeWidth="2" />
      <rect x="60" y="5" width="50" height="16" fill={palette.dimensionBg} stroke={palette.dimension} strokeWidth="1" rx="3" />
      <text x="85" y="16" textAnchor="middle" fill={palette.dimension} fontSize="9" fontWeight="600">PANEL WIDTH</text>
    </g>

    {/* Height dimension */}
    <g transform="translate(255, 55)">
      <line x1="5" y1="0" x2="5" y2="110" stroke={palette.dimension} strokeWidth="2" />
      <line x1="-2" y1="0" x2="12" y2="0" stroke={palette.dimension} strokeWidth="2" />
      <line x1="-2" y1="110" x2="12" y2="110" stroke={palette.dimension} strokeWidth="2" />
      <text x="18" y="60" fill={palette.dimension} fontSize="10" fontWeight="600" transform="rotate(90, 18, 60)">HEIGHT</text>
    </g>
  </svg>
);

// ============================================================================
// GATE INSTALL - Clear gate detail
// ============================================================================
export const GateInstallAnimation: React.FC<AnimationProps> = ({ size = 280 }) => (
  <svg width={size} height={size * 0.75} viewBox="0 0 280 210">
    {/* Title */}
    <rect x="0" y="0" width="280" height="28" fill={palette.dimensionBg} />
    <text x="140" y="18" textAnchor="middle" fill={palette.dimension} fontSize="12" fontWeight="600">GATE INSTALLATION</text>

    {/* Ground */}
    <rect x="0" y="170" width="280" height="40" fill={palette.grass} />

    {/* Hinge post */}
    <rect x="45" y="45" width="22" height="130" fill={palette.metal} stroke={palette.metalDark} strokeWidth="2" />

    {/* Latch post */}
    <rect x="213" y="45" width="22" height="130" fill={palette.metal} stroke={palette.metalDark} strokeWidth="2" />

    {/* Gate frame */}
    <rect x="75" y="60" width="110" height="100" fill="none" stroke={palette.metalDark} strokeWidth="6" rx="3" />

    {/* Gate rails */}
    <rect x="75" y="85" width="110" height="5" fill={palette.metal} />
    <rect x="75" y="115" width="110" height="5" fill={palette.metal} />
    <rect x="75" y="145" width="110" height="5" fill={palette.metal} />

    {/* Diagonal brace */}
    <line x1="78" y1="157" x2="182" y2="63" stroke={palette.metal} strokeWidth="5" />

    {/* Hinges */}
    <g transform="translate(60, 75)">
      <rect x="0" y="0" width="20" height="16" fill={palette.metalDark} rx="3" />
      <circle cx="10" cy="8" r="5" fill={palette.metal} />
      <text x="35" y="11" fill={palette.gray} fontSize="9">HINGE</text>
    </g>
    <g transform="translate(60, 140)">
      <rect x="0" y="0" width="20" height="16" fill={palette.metalDark} rx="3" />
      <circle cx="10" cy="8" r="5" fill={palette.metal} />
    </g>

    {/* Latch */}
    <g transform="translate(185, 105)">
      <rect x="0" y="0" width="30" height="18" fill={palette.metalDark} rx="3" />
      <circle cx="20" cy="9" r="6" fill="#FFD54F" stroke="#F9A825" strokeWidth="1" />
      <text x="15" y="30" textAnchor="middle" fill={palette.gray} fontSize="9">LATCH</text>
    </g>

    {/* Ground clearance */}
    <g transform="translate(130, 160)">
      <line x1="0" y1="0" x2="0" y2="12" stroke={palette.dimension} strokeWidth="2" />
      <line x1="-10" y1="0" x2="10" y2="0" stroke={palette.dimension} strokeWidth="2" />
      <line x1="-10" y1="12" x2="10" y2="12" stroke={palette.dimension} strokeWidth="2" />
      <text x="20" y="9" fill={palette.dimension} fontSize="10" fontWeight="600">5cm</text>
    </g>

    {/* Gate width */}
    <g transform="translate(75, 188)">
      <line x1="0" y1="0" x2="110" y2="0" stroke={palette.dimension} strokeWidth="2" />
      <line x1="0" y1="-6" x2="0" y2="6" stroke={palette.dimension} strokeWidth="2" />
      <line x1="110" y1="-6" x2="110" y2="6" stroke={palette.dimension} strokeWidth="2" />
      <text x="55" y="15" textAnchor="middle" fill={palette.dimension} fontSize="10" fontWeight="600">GATE WIDTH</text>
    </g>
  </svg>
);

// ============================================================================
// LEVELING - Clear level usage diagram
// ============================================================================
export const LevelingAnimation: React.FC<AnimationProps> = ({ size = 280 }) => (
  <svg width={size} height={size * 0.75} viewBox="0 0 280 210">
    {/* Title */}
    <rect x="0" y="0" width="280" height="28" fill={palette.dimensionBg} />
    <text x="140" y="18" textAnchor="middle" fill={palette.dimension} fontSize="12" fontWeight="600">USING A LEVEL</text>

    {/* Surface */}
    <rect x="30" y="110" width="220" height="15" fill={palette.metal} stroke={palette.metalDark} strokeWidth="1" rx="2" />

    {/* Level tool */}
    <g transform="translate(50, 65)">
      <rect x="0" y="0" width="180" height="38" fill="#FFD54F" stroke="#F9A825" strokeWidth="2" rx="5" />
      <rect x="70" y="8" width="40" height="22" fill="#B3E5FC" stroke="#0288D1" strokeWidth="1.5" rx="4" />
      <line x1="88" y1="8" x2="88" y2="30" stroke="#0288D1" strokeWidth="1.5" />
      <line x1="92" y1="8" x2="92" y2="30" stroke="#0288D1" strokeWidth="1.5" />
      <circle cx="90" cy="19" r="6" fill="#4CAF50" />
    </g>

    {/* Three bubble position examples */}
    <g transform="translate(25, 140)">
      <rect x="0" y="0" width="70" height="60" fill={palette.dimensionBg} stroke={palette.dimension} strokeWidth="1" rx="4" />
      <text x="35" y="18" textAnchor="middle" fill={palette.dimension} fontSize="10" fontWeight="600">LEVEL</text>
      <rect x="18" y="25" width="34" height="18" fill="#B3E5FC" stroke="#0288D1" strokeWidth="1" rx="3" />
      <line x1="33" y1="25" x2="33" y2="43" stroke="#0288D1" strokeWidth="1" />
      <line x1="37" y1="25" x2="37" y2="43" stroke="#0288D1" strokeWidth="1" />
      <circle cx="35" cy="34" r="5" fill="#4CAF50" />
      <text x="35" y="55" textAnchor="middle" fill="#4CAF50" fontSize="9" fontWeight="600">✓ CORRECT</text>
    </g>

    <g transform="translate(105, 140)">
      <rect x="0" y="0" width="70" height="60" fill={palette.dimensionBg} stroke={palette.dimension} strokeWidth="1" rx="4" />
      <text x="35" y="18" textAnchor="middle" fill={palette.dimension} fontSize="10" fontWeight="600">HIGH LEFT</text>
      <rect x="18" y="25" width="34" height="18" fill="#B3E5FC" stroke="#0288D1" strokeWidth="1" rx="3" />
      <line x1="33" y1="25" x2="33" y2="43" stroke="#0288D1" strokeWidth="1" />
      <line x1="37" y1="25" x2="37" y2="43" stroke="#0288D1" strokeWidth="1" />
      <circle cx="27" cy="34" r="5" fill={palette.arrow} />
      <text x="35" y="55" textAnchor="middle" fill={palette.arrow} fontSize="9" fontWeight="600">✗ ADJUST</text>
    </g>

    <g transform="translate(185, 140)">
      <rect x="0" y="0" width="70" height="60" fill={palette.dimensionBg} stroke={palette.dimension} strokeWidth="1" rx="4" />
      <text x="35" y="18" textAnchor="middle" fill={palette.dimension} fontSize="10" fontWeight="600">HIGH RIGHT</text>
      <rect x="18" y="25" width="34" height="18" fill="#B3E5FC" stroke="#0288D1" strokeWidth="1" rx="3" />
      <line x1="33" y1="25" x2="33" y2="43" stroke="#0288D1" strokeWidth="1" />
      <line x1="37" y1="25" x2="37" y2="43" stroke="#0288D1" strokeWidth="1" />
      <circle cx="43" cy="34" r="5" fill={palette.arrow} />
      <text x="35" y="55" textAnchor="middle" fill={palette.arrow} fontSize="9" fontWeight="600">✗ ADJUST</text>
    </g>
  </svg>
);

// ============================================================================
// CURING - Simple curing timeline
// ============================================================================
export const CuringAnimation: React.FC<AnimationProps> = ({ size = 280 }) => (
  <svg width={size} height={size * 0.75} viewBox="0 0 280 210">
    {/* Title */}
    <rect x="0" y="0" width="280" height="28" fill={palette.dimensionBg} />
    <text x="140" y="18" textAnchor="middle" fill={palette.dimension} fontSize="12" fontWeight="600">CONCRETE CURING</text>

    {/* Concrete slab */}
    <rect x="40" y="85" width="200" height="40" fill={palette.concrete} stroke={palette.concreteDark} strokeWidth="2" rx="3" />

    {/* Plastic cover */}
    <path d="M35 80 Q100 70 140 80 Q180 70 245 80 L245 90 Q180 82 140 90 Q100 82 35 90 Z" fill="#B3E5FC" opacity="0.6" stroke="#0288D1" strokeWidth="1.5" />
    <text x="140" y="60" textAnchor="middle" fill="#0288D1" fontSize="10" fontWeight="500">COVER WITH PLASTIC</text>

    {/* Water drops */}
    {[80, 140, 200].map((x, i) => (
      <path key={i} d={`M${x} 42 Q${x - 4} 50 ${x} 55 Q${x + 4} 50 ${x} 42`} fill="#81D4FA" />
    ))}
    <text x="140" y="38" textAnchor="middle" fill="#0288D1" fontSize="10" fontWeight="500">KEEP MOIST</text>

    {/* Timeline */}
    <g transform="translate(30, 140)">
      <rect x="0" y="0" width="220" height="55" fill={palette.dimensionBg} stroke={palette.dimension} strokeWidth="1" rx="4" />
      <text x="110" y="16" textAnchor="middle" fill={palette.dimension} fontSize="11" fontWeight="600">CURING TIMELINE</text>

      {/* Progress bar */}
      <rect x="15" y="28" width="190" height="12" fill="#E0E0E0" rx="2" />
      <rect x="15" y="28" width="50" height="12" fill="#FFCC80" rx="2" />
      <rect x="65" y="28" width="50" height="12" fill="#FFB74D" rx="2" />
      <rect x="115" y="28" width="90" height="12" fill="#4CAF50" rx="2" />

      {/* Day markers */}
      <text x="15" y="50" fill={palette.gray} fontSize="8">Day 1</text>
      <text x="65" y="50" fill={palette.gray} fontSize="8">Day 3</text>
      <text x="115" y="50" fill={palette.gray} fontSize="8">Day 7</text>
      <text x="180" y="50" fill="#4CAF50" fontSize="9" fontWeight="600">Day 28 ✓</text>
    </g>
  </svg>
);

// ============================================================================
// COMPLETION - Simple success state
// ============================================================================
export const CompletionAnimation: React.FC<AnimationProps> = ({ size = 280 }) => (
  <svg width={size} height={size * 0.75} viewBox="0 0 280 210">
    {/* Title */}
    <rect x="0" y="0" width="280" height="28" fill="#E8F5E9" />
    <text x="140" y="18" textAnchor="middle" fill="#2E7D32" fontSize="12" fontWeight="600">PROJECT COMPLETE</text>

    {/* Success checkmark */}
    <g transform="translate(140, 80)">
      <circle cx="0" cy="0" r="45" fill="#E8F5E9" stroke="#4CAF50" strokeWidth="4" />
      <path d="M-20 0 L-8 12 L20 -15" fill="none" stroke="#4CAF50" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
    </g>

    {/* Checklist */}
    <g transform="translate(50, 140)">
      <rect x="0" y="0" width="180" height="55" fill={palette.dimensionBg} stroke={palette.dimension} strokeWidth="1" rx="4" />
      <text x="90" y="16" textAnchor="middle" fill={palette.dimension} fontSize="10" fontWeight="600">FINAL CHECKLIST</text>

      {/* Items */}
      <g transform="translate(15, 28)">
        <rect x="0" y="0" width="12" height="12" fill="#4CAF50" rx="2" />
        <text x="18" y="10" fill={palette.gray} fontSize="9">Dimensions verified</text>
      </g>
      <g transform="translate(15, 42)">
        <rect x="0" y="0" width="12" height="12" fill="#4CAF50" rx="2" />
        <text x="18" y="10" fill={palette.gray} fontSize="9">Level & plumb OK</text>
      </g>
      <g transform="translate(100, 28)">
        <rect x="0" y="0" width="12" height="12" fill="#4CAF50" rx="2" />
        <text x="18" y="10" fill={palette.gray} fontSize="9">Site cleaned</text>
      </g>
      <g transform="translate(100, 42)">
        <rect x="0" y="0" width="12" height="12" fill="#4CAF50" rx="2" />
        <text x="18" y="10" fill={palette.gray} fontSize="9">Photos taken</text>
      </g>
    </g>
  </svg>
);

// ============================================================================
// GRAVEL BASE - Animated 4-phase sequence
// Phase 1: Pour/dump gravel into excavated area
// Phase 2: Spread gravel evenly with rake
// Phase 3: Level the gravel surface
// Phase 4: Compact with plate compactor
// ============================================================================

// Translations for Gravel Base Animation
const gravelBaseTranslations = {
  en: {
    step1Title: 'STEP 1: POUR GRAVEL',
    step2Title: 'STEP 2: SPREAD EVENLY',
    step3Title: 'STEP 3: LEVEL SURFACE',
    step4Title: 'STEP 4: COMPACT LAYER',
    soil: 'COMPACTED SOIL',
    gravel: 'GRAVEL',
    depth: '10-15 cm',
    phase1Label: 'Pour gravel into excavated area',
    phase2Label1: 'Use rake to spread gravel evenly',
    phase2Label2: 'Cover entire area uniformly',
    phase3Label1: 'Check level across the surface',
    phase3Label2: 'Add or remove gravel as needed',
    phase4Label1: 'Compact with plate compactor or tamper',
    phase4Label2: 'Multiple passes for best results',
  },
  ka: {
    step1Title: 'ნაბიჯი 1: ჩაყარეთ ხრეში',
    step2Title: 'ნაბიჯი 2: გადაანაწილეთ თანაბრად',
    step3Title: 'ნაბიჯი 3: გაასწორეთ ზედაპირი',
    step4Title: 'ნაბიჯი 4: დატკეპნეთ ფენა',
    soil: 'დატკეპნილი ნიადაგი',
    gravel: 'ხრეში',
    depth: '10-15 სმ',
    phase1Label: 'ჩაყარეთ ხრეში მომზადებულ არეში',
    phase2Label1: 'გამოიყენეთ ფოცხი თანაბრად გასანაწილებლად',
    phase2Label2: 'დაფარეთ მთელი ფართობი თანაბრად',
    phase3Label1: 'შეამოწმეთ დონე მთელ ზედაპირზე',
    phase3Label2: 'დაამატეთ ან მოაშორეთ ხრეში საჭიროებისამებრ',
    phase4Label1: 'დატკეპნეთ ვიბროტამპით ან ხელით',
    phase4Label2: 'რამდენიმე გავლა საუკეთესო შედეგისთვის',
  },
};

export const GravelBaseAnimation: React.FC<AnimationProps> = ({ size = 320, templateInputs }) => {
  const { i18n } = useTranslation();
  const lang = i18n.language?.startsWith('ka') ? 'ka' : 'en';
  const isGeorgian = lang === 'ka';
  const aspectRatio = 0.85;

  // Get gravel depth from templateInputs or use default
  const gravelDepth = templateInputs?.gravelDepth || 15;
  const depthUnit = isGeorgian ? 'სმ' : 'cm';

  const t = {
    ...gravelBaseTranslations[lang],
    depth: `${gravelDepth} ${depthUnit}`,
  };

  return (
    <div style={{
      width: '100%',
      maxWidth: size,
      aspectRatio: `1 / ${aspectRatio}`,
      position: 'relative',
      overflow: 'hidden',
      margin: '0 auto'
    }}>
      {/* CSS Keyframes */}
      <style>{`
        @keyframes gravel-phase1-container {
          0%, 25% { opacity: 1; }
          30%, 100% { opacity: 0; }
        }
        @keyframes gravel-phase2-container {
          0%, 25% { opacity: 0; }
          30%, 55% { opacity: 1; }
          60%, 100% { opacity: 0; }
        }
        @keyframes gravel-phase3-container {
          0%, 55% { opacity: 0; }
          60%, 80% { opacity: 1; }
          85%, 100% { opacity: 0; }
        }
        @keyframes gravel-phase4-container {
          0%, 80% { opacity: 0; }
          85%, 100% { opacity: 1; }
        }
        @keyframes gravel-pour {
          0%, 5% { transform: translateY(-30px); opacity: 0; }
          15% { transform: translateY(0); opacity: 1; }
          25% { transform: translateY(0); opacity: 1; }
        }
        @keyframes gravel-pile-grow {
          0%, 5% { transform: scaleY(0); }
          15%, 25% { transform: scaleY(1); }
        }
        @keyframes gravel-rake {
          0%, 30% { transform: translateX(0) rotate(0deg); }
          35% { transform: translateX(40px) rotate(5deg); }
          40% { transform: translateX(-30px) rotate(-5deg); }
          45% { transform: translateX(30px) rotate(3deg); }
          50% { transform: translateX(-20px) rotate(-3deg); }
          55% { transform: translateX(0) rotate(0deg); }
        }
        @keyframes gravel-spread {
          0%, 30% { d: path('M60 140 Q100 100 160 120 Q220 90 260 140'); }
          50%, 100% { d: path('M60 130 L260 130'); }
        }
        @keyframes gravel-level-tool {
          0%, 60% { transform: translateX(0); }
          65% { transform: translateX(60px); }
          70% { transform: translateX(-40px); }
          75% { transform: translateX(40px); }
          80% { transform: translateX(0); }
        }
        @keyframes gravel-compactor {
          0%, 85% { transform: translateY(0); }
          87% { transform: translateY(4px); }
          89% { transform: translateY(0); }
          91% { transform: translateY(4px); }
          93% { transform: translateY(0); }
          95% { transform: translateY(4px); }
          97% { transform: translateY(0); }
          99% { transform: translateY(3px); }
          100% { transform: translateY(0); }
        }
        @keyframes gravel-vibration {
          0%, 85% { opacity: 0; }
          87%, 100% { opacity: 1; }
        }
        @keyframes gravel-phase-label {
          0%, 5% { opacity: 0; }
          10%, 90% { opacity: 1; }
          95%, 100% { opacity: 0; }
        }
      `}</style>

      {/* PHASE 1: Pour Gravel */}
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 320 270"
        preserveAspectRatio="xMidYMid meet"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          animation: 'gravel-phase1-container 12s infinite'
        }}
      >
        {/* Title */}
        <rect x="0" y="0" width="320" height="32" fill="#E3F2FD" />
        <text x="160" y="22" textAnchor="middle" fill="#1565C0" fontSize="14" fontWeight="600">
          {t.step1Title}
        </text>

        {/* Formwork sides */}
        <rect x="30" y="90" width="18" height="80" fill="#D4A574" stroke="#8B6914" strokeWidth="2" />
        <rect x="272" y="90" width="18" height="80" fill="#D4A574" stroke="#8B6914" strokeWidth="2" />

        {/* Compacted soil base */}
        <rect x="48" y="140" width="224" height="30" fill="#8B7355" />
        <text x="160" y="160" textAnchor="middle" fill="#FFF" fontSize="10" fontWeight="500">{t.soil}</text>

        {/* Wheelbarrow dumping gravel */}
        <g style={{ animation: 'gravel-pour 12s infinite', transformOrigin: '160px 60px' }}>
          {/* Wheelbarrow body */}
          <path d="M120 50 L200 50 L190 75 L130 75 Z" fill="#607D8B" stroke="#455A64" strokeWidth="2" />
          {/* Wheel */}
          <circle cx="160" cy="80" r="10" fill="#333" stroke="#222" strokeWidth="2" />
          {/* Gravel in wheelbarrow */}
          <path d="M125 50 Q160 35 195 50" fill="#A09080" />
        </g>

        {/* Falling gravel stream */}
        <g style={{ animation: 'gravel-pour 12s infinite' }}>
          <ellipse cx="160" cy="95" rx="15" ry="8" fill="#A09080" />
          <ellipse cx="160" cy="105" rx="12" ry="6" fill="#A09080" opacity="0.8" />
          <ellipse cx="160" cy="115" rx="10" ry="5" fill="#A09080" opacity="0.6" />
        </g>

        {/* Gravel pile growing */}
        <g style={{ animation: 'gravel-pile-grow 12s infinite', transformOrigin: '160px 140px' }}>
          <path d="M100 140 Q130 100 160 110 Q190 100 220 140 Z" fill="#A09080" />
          {/* Gravel texture dots */}
          {[110, 130, 150, 170, 190, 210].map((x, i) => (
            <circle key={`dot-${i}`} cx={x} cy={130 - (i % 3) * 5} r="3" fill="#706050" />
          ))}
        </g>

        {/* Phase label */}
        <g style={{ animation: 'gravel-phase-label 12s infinite' }}>
          <rect x="20" y="240" width="280" height="24" fill="#FFF3E0" stroke="#FF9800" strokeWidth="1" rx="4" />
          <text x="160" y="257" textAnchor="middle" fill="#E65100" fontSize="11" fontWeight="600">
            {t.phase1Label}
          </text>
        </g>
      </svg>

      {/* PHASE 2: Spread Evenly */}
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 320 270"
        preserveAspectRatio="xMidYMid meet"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          animation: 'gravel-phase2-container 12s infinite'
        }}
      >
        {/* Title */}
        <rect x="0" y="0" width="320" height="32" fill="#E3F2FD" />
        <text x="160" y="22" textAnchor="middle" fill="#1565C0" fontSize="14" fontWeight="600">
          {t.step2Title}
        </text>

        {/* Formwork sides */}
        <rect x="30" y="90" width="18" height="80" fill="#D4A574" stroke="#8B6914" strokeWidth="2" />
        <rect x="272" y="90" width="18" height="80" fill="#D4A574" stroke="#8B6914" strokeWidth="2" />

        {/* Compacted soil base */}
        <rect x="48" y="140" width="224" height="30" fill="#8B7355" />

        {/* Uneven gravel being spread */}
        <path d="M48 140 Q80 110 120 125 Q160 105 200 120 Q240 110 272 140 L272 140 L48 140 Z" fill="#A09080" />

        {/* Gravel texture */}
        {[60, 90, 120, 150, 180, 210, 240].map((x, i) => (
          <circle key={`tex-${i}`} cx={x} cy={125 + (i % 3) * 5} r="4" fill="#706050" />
        ))}

        {/* Rake tool */}
        <g style={{ transformOrigin: '160px 80px', animation: 'gravel-rake 12s infinite' }}>
          {/* Handle */}
          <rect x="155" y="45" width="8" height="60" fill="#8B4513" rx="2" />
          {/* Rake head */}
          <rect x="130" y="103" width="60" height="8" fill="#607D8B" rx="2" />
          {/* Rake tines */}
          {[135, 147, 159, 171, 183].map((x, i) => (
            <rect key={`tine-${i}`} x={x} y="111" width="4" height="12" fill="#455A64" />
          ))}
        </g>

        {/* Phase label */}
        <rect x="20" y="215" width="280" height="45" fill="#E8F5E9" stroke="#4CAF50" strokeWidth="1" rx="4" />
        <text x="160" y="233" textAnchor="middle" fill="#2E7D32" fontSize="11" fontWeight="600">
          {t.phase2Label1}
        </text>
        <text x="160" y="250" textAnchor="middle" fill="#2E7D32" fontSize="10">
          {t.phase2Label2}
        </text>
      </svg>

      {/* PHASE 3: Level Surface */}
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 320 270"
        preserveAspectRatio="xMidYMid meet"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          animation: 'gravel-phase3-container 12s infinite'
        }}
      >
        {/* Title */}
        <rect x="0" y="0" width="320" height="32" fill="#E3F2FD" />
        <text x="160" y="22" textAnchor="middle" fill="#1565C0" fontSize="14" fontWeight="600">
          {t.step3Title}
        </text>

        {/* Formwork sides */}
        <rect x="30" y="90" width="18" height="80" fill="#D4A574" stroke="#8B6914" strokeWidth="2" />
        <rect x="272" y="90" width="18" height="80" fill="#D4A574" stroke="#8B6914" strokeWidth="2" />

        {/* Compacted soil base */}
        <rect x="48" y="145" width="224" height="25" fill="#8B7355" />

        {/* Level gravel layer */}
        <rect x="48" y="115" width="224" height="30" fill="#A09080" />
        <text x="160" y="135" textAnchor="middle" fill="#FFF" fontSize="11" fontWeight="600">{t.gravel}</text>

        {/* Gravel texture */}
        {[60, 85, 110, 135, 160, 185, 210, 235, 260].map((x, i) => (
          <circle key={`tex-${i}`} cx={x} cy={125 + (i % 2) * 8} r="3" fill="#706050" />
        ))}

        {/* Level line */}
        <line x1="48" y1="115" x2="272" y2="115" stroke="#1565C0" strokeWidth="2" strokeDasharray="8,4" />

        {/* Spirit level tool */}
        <g style={{ animation: 'gravel-level-tool 12s infinite' }}>
          <rect x="100" y="70" width="120" height="25" fill="#FFD54F" stroke="#F9A825" strokeWidth="2" rx="4" />
          <rect x="145" y="76" width="30" height="13" fill="#81D4FA" stroke="#0288D1" strokeWidth="1" rx="2" />
          <circle cx="160" cy="82" r="4" fill="#4CAF50" />
        </g>

        {/* Depth dimension */}
        <g>
          <line x1="290" y1="115" x2="290" y2="145" stroke="#1565C0" strokeWidth="2" />
          <line x1="283" y1="115" x2="297" y2="115" stroke="#1565C0" strokeWidth="2" />
          <line x1="283" y1="145" x2="297" y2="145" stroke="#1565C0" strokeWidth="2" />
        </g>
        <rect x="248" y="118" width="50" height="20" fill="#E3F2FD" stroke="#1565C0" strokeWidth="1" rx="3" />
        <text x="273" y="133" textAnchor="middle" fill="#1565C0" fontSize="11" fontWeight="700">{t.depth}</text>

        {/* Phase label */}
        <rect x="20" y="215" width="280" height="45" fill="#E8F5E9" stroke="#4CAF50" strokeWidth="1" rx="4" />
        <text x="160" y="233" textAnchor="middle" fill="#2E7D32" fontSize="11" fontWeight="600">
          {t.phase3Label1}
        </text>
        <text x="160" y="250" textAnchor="middle" fill="#2E7D32" fontSize="10">
          {t.phase3Label2}
        </text>
      </svg>

      {/* PHASE 4: Compact Layer */}
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 320 270"
        preserveAspectRatio="xMidYMid meet"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          animation: 'gravel-phase4-container 12s infinite'
        }}
      >
        {/* Title */}
        <rect x="0" y="0" width="320" height="32" fill="#E3F2FD" />
        <text x="160" y="22" textAnchor="middle" fill="#1565C0" fontSize="14" fontWeight="600">
          {t.step4Title}
        </text>

        {/* Formwork sides */}
        <rect x="30" y="90" width="18" height="80" fill="#D4A574" stroke="#8B6914" strokeWidth="2" />
        <rect x="272" y="90" width="18" height="80" fill="#D4A574" stroke="#8B6914" strokeWidth="2" />

        {/* Compacted soil base */}
        <rect x="48" y="145" width="224" height="25" fill="#8B7355" />

        {/* Compacted gravel layer */}
        <rect x="48" y="120" width="224" height="25" fill="#A09080" />
        <line x1="48" y1="120" x2="272" y2="120" stroke="#706050" strokeWidth="3" />

        {/* Gravel texture - more compressed */}
        {[55, 75, 95, 115, 135, 155, 175, 195, 215, 235, 255].map((x, i) => (
          <circle key={`tex-${i}`} cx={x} cy={132} r="2.5" fill="#706050" />
        ))}

        {/* Plate compactor */}
        <g style={{ animation: 'gravel-compactor 12s infinite' }}>
          {/* Handle */}
          <rect x="150" y="45" width="10" height="35" fill="#424242" rx="2" />
          <rect x="145" y="40" width="20" height="10" fill="#616161" rx="3" />
          {/* Engine housing */}
          <rect x="130" y="80" width="50" height="22" fill="#FF5722" rx="4" />
          <rect x="140" y="85" width="30" height="7" fill="#BF360C" rx="2" />
          {/* Base plate */}
          <rect x="120" y="102" width="70" height="12" fill="#607D8B" rx="2" />
        </g>

        {/* Vibration lines */}
        <g style={{ animation: 'gravel-vibration 12s infinite' }}>
          {[135, 155, 175].map((x, i) => (
            <g key={`vib-${i}`}>
              <line x1={x} y1="117" x2={x} y2="125" stroke="#FF5722" strokeWidth="2" />
              <polygon points={`${x-4} 125, ${x+4} 125, ${x} 132`} fill="#FF5722" />
            </g>
          ))}
        </g>

        {/* Compression arrows on sides */}
        <g style={{ animation: 'gravel-vibration 12s infinite' }}>
          <path d="M70 100 L70 115" stroke="#1565C0" strokeWidth="2" />
          <polygon points="66 115, 74 115, 70 125" fill="#1565C0" />
          <path d="M250 100 L250 115" stroke="#1565C0" strokeWidth="2" />
          <polygon points="246 115, 254 115, 250 125" fill="#1565C0" />
        </g>

        {/* Depth dimension */}
        <g>
          <line x1="290" y1="120" x2="290" y2="145" stroke="#1565C0" strokeWidth="2" />
          <line x1="283" y1="120" x2="297" y2="120" stroke="#1565C0" strokeWidth="2" />
          <line x1="283" y1="145" x2="297" y2="145" stroke="#1565C0" strokeWidth="2" />
        </g>
        <rect x="248" y="122" width="50" height="20" fill="#E3F2FD" stroke="#1565C0" strokeWidth="1" rx="3" />
        <text x="273" y="137" textAnchor="middle" fill="#1565C0" fontSize="11" fontWeight="700">{t.depth}</text>

        {/* Phase label */}
        <rect x="20" y="215" width="280" height="45" fill="#E3F2FD" stroke="#1565C0" strokeWidth="1" rx="4" />
        <text x="160" y="233" textAnchor="middle" fill="#0D47A1" fontSize="11" fontWeight="600">
          {t.phase4Label1}
        </text>
        <text x="160" y="250" textAnchor="middle" fill="#0D47A1" fontSize="10">
          {t.phase4Label2}
        </text>
      </svg>
    </div>
  );
};

// ============================================================================
// Map of illustration keys to components
// ============================================================================
export const IllustrationMap: Record<string, React.FC<AnimationProps>> = {
  'site_preparation': SitePreparationAnimation,
  'gravel_base': GravelBaseAnimation,
};

// ============================================================================
// Helper component to render the right illustration
// ============================================================================
interface InstructionIllustrationProps {
  type: string;
  size?: number;
  templateInputs?: Record<string, any>;
}

export const InstructionIllustration: React.FC<InstructionIllustrationProps> = ({ type, size = 280, templateInputs }) => {
  const IllustrationComponent = IllustrationMap[type];

  // Return nothing if no illustration available for this type
  if (!IllustrationComponent) {
    return null;
  }

  return <IllustrationComponent size={size} templateInputs={templateInputs} />;
};
