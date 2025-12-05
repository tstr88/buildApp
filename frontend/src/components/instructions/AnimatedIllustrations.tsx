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
// FORMWORK - Animated 4-phase sequence
// Phase 1: Top view - mark perimeter with dimensions
// Phase 2: Side view - place boards at edges
// Phase 3: Side view - secure with stakes
// Phase 4: Side view - check level and alignment
// ============================================================================

// Translations for Formwork Animation
const formworkTranslations = {
  en: {
    step1Title: 'STEP 1: MARK PERIMETER',
    step2Title: 'STEP 2: PLACE BOARDS',
    step3Title: 'STEP 3: SECURE WITH STAKES',
    step4Title: 'STEP 4: CHECK LEVEL',
    gravel: 'GRAVEL BASE',
    board: 'BOARD',
    stake: 'STAKE',
    thickness: '15 cm',
    phase1Label: 'Mark formwork positions along slab edges',
    phase2Label1: 'Place boards along marked lines',
    phase2Label2: 'Board height = slab thickness',
    phase3Label1: 'Drive stakes behind boards',
    phase3Label2: 'Nail stakes to boards securely',
    phase4Label1: 'Check level across all boards',
    phase4Label2: 'Adjust height with shims if needed',
  },
  ka: {
    step1Title: 'ნაბიჯი 1: მონიშნეთ პერიმეტრი',
    step2Title: 'ნაბიჯი 2: მოათავსეთ ფიცრები',
    step3Title: 'ნაბიჯი 3: დაამაგრეთ პალებით',
    step4Title: 'ნაბიჯი 4: შეამოწმეთ დონე',
    gravel: 'ხრეშის ფენა',
    board: 'ფიცარი',
    stake: 'პალი',
    thickness: '15 სმ',
    phase1Label: 'მონიშნეთ ყალიბის პოზიციები ფილის კიდეებზე',
    phase2Label1: 'მოათავსეთ ფიცრები მონიშნულ ხაზებზე',
    phase2Label2: 'ფიცრის სიმაღლე = ფილის სისქე',
    phase3Label1: 'ჩაარჭვეთ პალები ფიცრების უკან',
    phase3Label2: 'მიამაგრეთ პალები ფიცრებს ლურსმნებით',
    phase4Label1: 'შეამოწმეთ დონე ყველა ფიცარზე',
    phase4Label2: 'საჭიროების შემთხვევაში შეასწორეთ სიმაღლე',
  },
};

export const FormworkAnimation: React.FC<AnimationProps> = ({ size = 320, templateInputs }) => {
  const { i18n } = useTranslation();
  const lang = i18n.language?.startsWith('ka') ? 'ka' : 'en';
  const isGeorgian = lang === 'ka';
  const aspectRatio = 0.85;

  // Get dimensions from templateInputs
  const length = templateInputs?.length || 9;
  const width = templateInputs?.width || 10;
  const thickness = templateInputs?.thickness || 15;
  const unitM = isGeorgian ? 'მ' : 'm';
  const unitCm = isGeorgian ? 'სმ' : 'cm';

  const t = {
    ...formworkTranslations[lang],
    thickness: `${thickness} ${unitCm}`,
    dimLength: `${length}${unitM}`,
    dimWidth: `${width}${unitM}`,
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
        @keyframes formwork-phase1-container {
          0%, 25% { opacity: 1; }
          30%, 100% { opacity: 0; }
        }
        @keyframes formwork-phase2-container {
          0%, 25% { opacity: 0; }
          30%, 55% { opacity: 1; }
          60%, 100% { opacity: 0; }
        }
        @keyframes formwork-phase3-container {
          0%, 55% { opacity: 0; }
          60%, 80% { opacity: 1; }
          85%, 100% { opacity: 0; }
        }
        @keyframes formwork-phase4-container {
          0%, 80% { opacity: 0; }
          85%, 100% { opacity: 1; }
        }
        @keyframes formwork-mark-draw {
          0%, 5% { stroke-dashoffset: 400; opacity: 0; }
          10%, 25% { stroke-dashoffset: 0; opacity: 1; }
        }
        @keyframes formwork-dims-appear {
          0%, 8% { opacity: 0; }
          15%, 25% { opacity: 1; }
        }
        @keyframes formwork-board-place {
          0%, 30% { transform: translateY(-30px); opacity: 0; }
          40%, 55% { transform: translateY(0); opacity: 1; }
        }
        @keyframes formwork-stake-drive {
          0%, 60% { transform: translateY(-40px); opacity: 0; }
          70%, 80% { transform: translateY(0); opacity: 1; }
        }
        @keyframes formwork-hammer {
          0%, 60% { transform: rotate(0deg); }
          63% { transform: rotate(-40deg); }
          66% { transform: rotate(0deg); }
          69% { transform: rotate(-40deg); }
          72% { transform: rotate(0deg); }
          75% { transform: rotate(-35deg); }
          78%, 80% { transform: rotate(0deg); }
        }
        @keyframes formwork-level-check {
          0%, 85% { transform: translateX(-50px); opacity: 0; }
          90%, 100% { transform: translateX(0); opacity: 1; }
        }
        @keyframes formwork-phase-label {
          0%, 5% { opacity: 0; }
          10%, 90% { opacity: 1; }
          95%, 100% { opacity: 0; }
        }
      `}</style>

      {/* PHASE 1: Top View - Mark Perimeter */}
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 320 270"
        preserveAspectRatio="xMidYMid meet"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          animation: 'formwork-phase1-container 12s infinite'
        }}
      >
        {/* Title */}
        <rect x="0" y="0" width="320" height="32" fill="#E3F2FD" />
        <text x="160" y="22" textAnchor="middle" fill="#1565C0" fontSize="14" fontWeight="600">
          {t.step1Title}
        </text>

        {/* Gravel base - top view */}
        <rect x="40" y="55" width="240" height="150" fill="#A09080" rx="4" />

        {/* Gravel texture */}
        {[60, 100, 140, 180, 220, 260].map((x, i) => (
          [75, 105, 135, 165, 185].map((y, j) => (
            <circle key={`grav-${i}-${j}`} cx={x} cy={y} r="3" fill="#706050" opacity="0.5" />
          ))
        ))}

        {/* Formwork marking lines - animated drawing */}
        <rect
          x="50" y="65" width="220" height="130"
          fill="none"
          stroke="#E53935"
          strokeWidth="4"
          strokeDasharray="400"
          style={{ animation: 'formwork-mark-draw 12s infinite' }}
        />

        {/* Corner markers */}
        {[[50, 65], [270, 65], [50, 195], [270, 195]].map(([x, y], i) => (
          <g key={`corner-${i}`} style={{ animation: 'formwork-dims-appear 12s infinite' }}>
            <circle cx={x} cy={y} r="8" fill="#E53935" />
            <circle cx={x} cy={y} r="4" fill="#FFF" />
          </g>
        ))}

        {/* Length dimension */}
        <g style={{ animation: 'formwork-dims-appear 12s infinite' }}>
          <line x1="50" y1="50" x2="270" y2="50" stroke="#1565C0" strokeWidth="2" />
          <line x1="50" y1="42" x2="50" y2="58" stroke="#1565C0" strokeWidth="2" />
          <line x1="270" y1="42" x2="270" y2="58" stroke="#1565C0" strokeWidth="2" />
          <rect x="130" y="35" width="60" height="22" fill="#E3F2FD" stroke="#1565C0" strokeWidth="1" rx="3" />
          <text x="160" y="51" textAnchor="middle" fill="#1565C0" fontSize="13" fontWeight="700">{t.dimLength}</text>
        </g>

        {/* Width dimension */}
        <g style={{ animation: 'formwork-dims-appear 12s infinite' }}>
          <line x1="285" y1="65" x2="285" y2="195" stroke="#1565C0" strokeWidth="2" />
          <line x1="277" y1="65" x2="293" y2="65" stroke="#1565C0" strokeWidth="2" />
          <line x1="277" y1="195" x2="293" y2="195" stroke="#1565C0" strokeWidth="2" />
          <rect x="290" y="115" width="28" height="22" fill="#E3F2FD" stroke="#1565C0" strokeWidth="1" rx="3" />
          <text x="304" y="131" textAnchor="middle" fill="#1565C0" fontSize="13" fontWeight="700">{t.dimWidth}</text>
        </g>

        {/* Phase label */}
        <g style={{ animation: 'formwork-phase-label 12s infinite' }}>
          <rect x="20" y="240" width="280" height="24" fill="#FFF3E0" stroke="#FF9800" strokeWidth="1" rx="4" />
          <text x="160" y="257" textAnchor="middle" fill="#E65100" fontSize="11" fontWeight="600">
            {t.phase1Label}
          </text>
        </g>
      </svg>

      {/* PHASE 2: Top View - Place Boards on all 4 sides */}
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 320 270"
        preserveAspectRatio="xMidYMid meet"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          animation: 'formwork-phase2-container 12s infinite'
        }}
      >
        {/* Title */}
        <rect x="0" y="0" width="320" height="32" fill="#E3F2FD" />
        <text x="160" y="22" textAnchor="middle" fill="#1565C0" fontSize="14" fontWeight="600">
          {t.step2Title}
        </text>

        {/* Gravel base - top view */}
        <rect x="40" y="55" width="240" height="150" fill="#A09080" rx="2" />

        {/* Gravel texture */}
        {[70, 120, 170, 220, 250].map((x, i) => (
          [80, 110, 140, 170].map((y, j) => (
            <circle key={`grav2-${i}-${j}`} cx={x} cy={y} r="3" fill="#706050" opacity="0.4" />
          ))
        ))}

        {/* Top board - animated */}
        <g style={{ animation: 'formwork-board-place 12s infinite' }}>
          <rect x="40" y="45" width="240" height="15" fill="#D4A574" stroke="#8B6914" strokeWidth="2" />
        </g>

        {/* Bottom board - animated */}
        <g style={{ animation: 'formwork-board-place 12s infinite', animationDelay: '0.15s' }}>
          <rect x="40" y="200" width="240" height="15" fill="#D4A574" stroke="#8B6914" strokeWidth="2" />
        </g>

        {/* Left board - animated */}
        <g style={{ animation: 'formwork-board-place 12s infinite', animationDelay: '0.3s' }}>
          <rect x="30" y="55" width="15" height="150" fill="#D4A574" stroke="#8B6914" strokeWidth="2" />
        </g>

        {/* Right board - animated */}
        <g style={{ animation: 'formwork-board-place 12s infinite', animationDelay: '0.45s' }}>
          <rect x="275" y="55" width="15" height="150" fill="#D4A574" stroke="#8B6914" strokeWidth="2" />
        </g>

        {/* Corner joints highlighted */}
        {[[40, 55], [265, 55], [40, 190], [265, 190]].map(([x, y], i) => (
          <rect key={`joint-${i}`} x={x} y={y} width="15" height="15" fill="#8B6914" opacity="0.6" />
        ))}

        {/* Center label */}
        <text x="160" y="125" textAnchor="middle" fill="#FFF" fontSize="11" fontWeight="600">
          {isGeorgian ? 'ფილის არე' : 'SLAB AREA'}
        </text>
        <text x="160" y="140" textAnchor="middle" fill="#FFF" fontSize="10">
          {t.gravel}
        </text>

        {/* Board label with arrow */}
        <g>
          <line x1="160" y1="35" x2="160" y2="45" stroke="#5D4E37" strokeWidth="1.5" />
          <text x="160" y="30" textAnchor="middle" fill="#5D4E37" fontSize="10" fontWeight="600">{t.board}</text>
        </g>

        {/* 4 sides indicator */}
        <g>
          <circle cx="300" cy="130" r="16" fill="#E3F2FD" stroke="#1565C0" strokeWidth="2" />
          <text x="300" y="135" textAnchor="middle" fill="#1565C0" fontSize="14" fontWeight="700">4</text>
        </g>

        {/* Phase label */}
        <rect x="20" y="220" width="280" height="40" fill="#FFF3E0" stroke="#FF9800" strokeWidth="1" rx="4" />
        <text x="160" y="237" textAnchor="middle" fill="#E65100" fontSize="11" fontWeight="600">
          {t.phase2Label1}
        </text>
        <text x="160" y="252" textAnchor="middle" fill="#E65100" fontSize="10">
          {t.phase2Label2}
        </text>
      </svg>

      {/* PHASE 3: Side View - Secure with Stakes */}
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 320 270"
        preserveAspectRatio="xMidYMid meet"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          animation: 'formwork-phase3-container 12s infinite'
        }}
      >
        {/* Title */}
        <rect x="0" y="0" width="320" height="32" fill="#E3F2FD" />
        <text x="160" y="22" textAnchor="middle" fill="#1565C0" fontSize="14" fontWeight="600">
          {t.step3Title}
        </text>

        {/* Gravel base */}
        <rect x="20" y="160" width="280" height="25" fill="#A09080" />

        {/* Ground (soil under gravel for stakes) */}
        <rect x="20" y="185" width="280" height="20" fill="#8B7355" />

        {/* Left board */}
        <rect x="35" y="110" width="20" height="50" fill="#D4A574" stroke="#8B6914" strokeWidth="2" />

        {/* Left stake - animated driving */}
        <g style={{ animation: 'formwork-stake-drive 12s infinite' }}>
          <rect x="15" y="120" width="12" height="70" fill="#8B6914" stroke="#5D4E37" strokeWidth="1" />
          <polygon points="15,190 27,190 21,205" fill="#8B6914" stroke="#5D4E37" strokeWidth="1" />
        </g>

        {/* Right board */}
        <rect x="265" y="110" width="20" height="50" fill="#D4A574" stroke="#8B6914" strokeWidth="2" />

        {/* Right stake - animated driving */}
        <g style={{ animation: 'formwork-stake-drive 12s infinite', animationDelay: '0.2s' }}>
          <rect x="293" y="120" width="12" height="70" fill="#8B6914" stroke="#5D4E37" strokeWidth="1" />
          <polygon points="293,190 305,190 299,205" fill="#8B6914" stroke="#5D4E37" strokeWidth="1" />
        </g>

        {/* Hammer - animated */}
        <g style={{ transformOrigin: '80px 90px', animation: 'formwork-hammer 12s infinite' }}>
          {/* Handle */}
          <rect x="60" y="55" width="8" height="45" fill="#8B4513" rx="2" />
          {/* Head */}
          <rect x="50" y="95" width="28" height="18" fill="#607D8B" rx="3" />
        </g>

        {/* Nail indicators */}
        <circle cx="32" cy="125" r="3" fill="#607D8B" />
        <circle cx="32" cy="145" r="3" fill="#607D8B" />
        <circle cx="288" cy="125" r="3" fill="#607D8B" />
        <circle cx="288" cy="145" r="3" fill="#607D8B" />

        {/* Labels */}
        <text x="21" y="215" textAnchor="middle" fill="#5D4E37" fontSize="9" fontWeight="500">{t.stake}</text>
        <text x="45" y="215" textAnchor="middle" fill="#5D4E37" fontSize="9" fontWeight="500">{t.board}</text>

        {/* Phase label */}
        <rect x="20" y="215" width="280" height="45" fill="#E8F5E9" stroke="#4CAF50" strokeWidth="1" rx="4" />
        <text x="160" y="233" textAnchor="middle" fill="#2E7D32" fontSize="11" fontWeight="600">
          {t.phase3Label1}
        </text>
        <text x="160" y="250" textAnchor="middle" fill="#2E7D32" fontSize="10">
          {t.phase3Label2}
        </text>
      </svg>

      {/* PHASE 4: Side View - Check Level */}
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 320 270"
        preserveAspectRatio="xMidYMid meet"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          animation: 'formwork-phase4-container 12s infinite'
        }}
      >
        {/* Title */}
        <rect x="0" y="0" width="320" height="32" fill="#E3F2FD" />
        <text x="160" y="22" textAnchor="middle" fill="#1565C0" fontSize="14" fontWeight="600">
          {t.step4Title}
        </text>

        {/* Gravel base */}
        <rect x="20" y="160" width="280" height="25" fill="#A09080" />

        {/* Ground */}
        <rect x="20" y="185" width="280" height="20" fill="#8B7355" />

        {/* Left formwork assembly */}
        <rect x="35" y="110" width="20" height="50" fill="#D4A574" stroke="#8B6914" strokeWidth="2" />
        <rect x="15" y="120" width="12" height="70" fill="#8B6914" stroke="#5D4E37" strokeWidth="1" />
        <polygon points="15,190 27,190 21,205" fill="#8B6914" stroke="#5D4E37" strokeWidth="1" />

        {/* Right formwork assembly */}
        <rect x="265" y="110" width="20" height="50" fill="#D4A574" stroke="#8B6914" strokeWidth="2" />
        <rect x="293" y="120" width="12" height="70" fill="#8B6914" stroke="#5D4E37" strokeWidth="1" />
        <polygon points="293,190 305,190 299,205" fill="#8B6914" stroke="#5D4E37" strokeWidth="1" />

        {/* String line across top */}
        <line x1="35" y1="110" x2="285" y2="110" stroke="#E53935" strokeWidth="2" strokeDasharray="8,4" />

        {/* Spirit level tool - animated appearance */}
        <g style={{ animation: 'formwork-level-check 12s infinite' }}>
          {/* Level body */}
          <rect x="90" y="75" width="140" height="28" fill="#FFD54F" stroke="#F9A825" strokeWidth="2" rx="4" />
          {/* Bubble vial */}
          <rect x="145" y="81" width="30" height="16" fill="#81D4FA" stroke="#0288D1" strokeWidth="1" rx="3" />
          {/* Center lines */}
          <line x1="158" y1="81" x2="158" y2="97" stroke="#0288D1" strokeWidth="1" />
          <line x1="162" y1="81" x2="162" y2="97" stroke="#0288D1" strokeWidth="1" />
          {/* Bubble - centered (level!) */}
          <circle cx="160" cy="89" r="5" fill="#4CAF50" />
        </g>

        {/* Checkmark indicator */}
        <g style={{ animation: 'formwork-level-check 12s infinite' }}>
          <circle cx="245" cy="89" r="14" fill="#E8F5E9" stroke="#4CAF50" strokeWidth="2" />
          <path d="M238 89 L243 94 L252 84" stroke="#4CAF50" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </g>

        {/* Height dimension */}
        <g>
          <line x1="310" y1="110" x2="310" y2="160" stroke="#1565C0" strokeWidth="2" />
          <line x1="303" y1="110" x2="317" y2="110" stroke="#1565C0" strokeWidth="2" />
          <line x1="303" y1="160" x2="317" y2="160" stroke="#1565C0" strokeWidth="2" />
        </g>
        <rect x="275" y="122" width="50" height="18" fill="#E3F2FD" stroke="#1565C0" strokeWidth="1" rx="3" />
        <text x="300" y="135" textAnchor="middle" fill="#1565C0" fontSize="10" fontWeight="700">{t.thickness}</text>

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
// REBAR GRID - Animated 5-phase sequence
// Phase 1: Top view - cutting rebars to size
// Phase 2: Top view - laying first horizontal layer
// Phase 3: Top view - laying second vertical layer
// Phase 4: Top view - tying intersections (zoomed)
// Phase 5: Side view - lifting grid on spacers
// ============================================================================

// Translations for Rebar Animation
const rebarTranslations = {
  en: {
    step1Title: 'STEP 1: CUT REBARS',
    step2Title: 'STEP 2: LAY HORIZONTAL BARS',
    step3Title: 'STEP 3: LAY VERTICAL BARS',
    step4Title: 'STEP 4: TIE INTERSECTIONS',
    step5Title: 'STEP 5: LIFT ON SPACERS',
    rebar: 'REBAR',
    spacing: '15-20 cm',
    phase1Label: 'Cut rebars to required lengths',
    phase2Label1: 'Place horizontal rebars evenly spaced',
    phase2Label2: 'Keep 5cm from formwork edges',
    phase3Label1: 'Place vertical rebars on top',
    phase3Label2: 'Maintain consistent spacing',
    phase4Label1: 'Tie every intersection with wire',
    phase4Label2: 'Use diagonal wire ties',
    phase5Label1: 'Place spacers under grid',
    phase5Label2: 'Lift 5cm from gravel base',
    wireTie: 'WIRE TIE',
    spacer: 'SPACER',
    liftHeight: '5 cm',
  },
  ka: {
    step1Title: 'ნაბიჯი 1: დაჭერით არმატურა',
    step2Title: 'ნაბიჯი 2: დააწყვეთ ჰორიზონტალური',
    step3Title: 'ნაბიჯი 3: დააწყვეთ ვერტიკალური',
    step4Title: 'ნაბიჯი 4: შეკარით კვანძები',
    step5Title: 'ნაბიჯი 5: აწიეთ სპეისერებზე',
    rebar: 'არმატურა',
    spacing: '15-20 სმ',
    phase1Label: 'დაჭერით არმატურა საჭირო სიგრძეზე',
    phase2Label1: 'დააწყვეთ ჰორიზონტალური ღეროები',
    phase2Label2: 'დატოვეთ 5სმ ყალიბიდან',
    phase3Label1: 'დააწყვეთ ვერტიკალური ღეროები ზემოდან',
    phase3Label2: 'შეინარჩუნეთ თანაბარი მანძილი',
    phase4Label1: 'შეკარით ყველა კვანძი მავთულით',
    phase4Label2: 'გამოიყენეთ დიაგონალური შეკვრა',
    phase5Label1: 'განათავსეთ სპეისერები ბადის ქვეშ',
    phase5Label2: 'აწიეთ 5სმ ხრეშის ფენიდან',
    wireTie: 'მავთული',
    spacer: 'სპეისერი',
    liftHeight: '5 სმ',
  },
};

export const RebarAnimation: React.FC<AnimationProps> = ({ size = 320, templateInputs }) => {
  const { i18n } = useTranslation();
  const lang = i18n.language?.startsWith('ka') ? 'ka' : 'en';
  const isGeorgian = lang === 'ka';
  const aspectRatio = 0.85;

  const t = rebarTranslations[lang];

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
        @keyframes rebar-phase1-container {
          0%, 20% { opacity: 1; }
          24%, 100% { opacity: 0; }
        }
        @keyframes rebar-phase2-container {
          0%, 20% { opacity: 0; }
          24%, 40% { opacity: 1; }
          44%, 100% { opacity: 0; }
        }
        @keyframes rebar-phase3-container {
          0%, 40% { opacity: 0; }
          44%, 60% { opacity: 1; }
          64%, 100% { opacity: 0; }
        }
        @keyframes rebar-phase4-container {
          0%, 60% { opacity: 0; }
          64%, 80% { opacity: 1; }
          84%, 100% { opacity: 0; }
        }
        @keyframes rebar-phase5-container {
          0%, 80% { opacity: 0; }
          84%, 100% { opacity: 1; }
        }
        @keyframes rebar-cut {
          0%, 5% { stroke-dashoffset: 200; }
          15%, 20% { stroke-dashoffset: 0; }
        }
        @keyframes rebar-place-h {
          0%, 24% { transform: translateX(-50px); opacity: 0; }
          30%, 40% { transform: translateX(0); opacity: 1; }
        }
        @keyframes rebar-place-v {
          0%, 44% { transform: translateY(-50px); opacity: 0; }
          50%, 60% { transform: translateY(0); opacity: 1; }
        }
        @keyframes rebar-tie-appear {
          0%, 64% { transform: scale(0); opacity: 0; }
          70%, 80% { transform: scale(1); opacity: 1; }
        }
        @keyframes rebar-lift {
          0%, 84% { transform: translateY(0); }
          90%, 100% { transform: translateY(-15px); }
        }
        @keyframes rebar-spacer-appear {
          0%, 84% { opacity: 0; }
          88%, 100% { opacity: 1; }
        }
        @keyframes rebar-phase-label {
          0%, 5% { opacity: 0; }
          10%, 90% { opacity: 1; }
          95%, 100% { opacity: 0; }
        }
        @keyframes rebar-saw {
          0%, 5% { transform: translateX(0) rotate(0deg); }
          8% { transform: translateX(5px) rotate(5deg); }
          11% { transform: translateX(-5px) rotate(-5deg); }
          14% { transform: translateX(5px) rotate(5deg); }
          17%, 20% { transform: translateX(0) rotate(0deg); }
        }
      `}</style>

      {/* PHASE 1: Top View - Cutting Rebars */}
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 320 270"
        preserveAspectRatio="xMidYMid meet"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          animation: 'rebar-phase1-container 15s infinite'
        }}
      >
        {/* Title */}
        <rect x="0" y="0" width="320" height="32" fill="#E3F2FD" />
        <text x="160" y="22" textAnchor="middle" fill="#1565C0" fontSize="14" fontWeight="600">
          {t.step1Title}
        </text>

        {/* Long rebar being cut */}
        <rect x="20" y="80" width="280" height="10" fill="#5D4037" rx="5" />

        {/* Cut mark */}
        <line x1="200" y1="70" x2="200" y2="100" stroke="#E53935" strokeWidth="3" strokeDasharray="5,3" />

        {/* Angle grinder / cutter */}
        <g style={{ transformOrigin: '200px 85px', animation: 'rebar-saw 15s infinite' }}>
          <circle cx="200" cy="60" r="18" fill="#607D8B" stroke="#455A64" strokeWidth="2" />
          <circle cx="200" cy="60" r="8" fill="#455A64" />
          <rect x="215" y="50" width="35" height="20" fill="#424242" rx="3" />
          {/* Sparks */}
          <g>
            <line x1="195" y1="78" x2="190" y2="90" stroke="#FFD54F" strokeWidth="2" />
            <line x1="200" y1="78" x2="200" y2="92" stroke="#FFD54F" strokeWidth="2" />
            <line x1="205" y1="78" x2="210" y2="90" stroke="#FFD54F" strokeWidth="2" />
          </g>
        </g>

        {/* Cut pieces below */}
        <rect x="30" y="130" width="150" height="8" fill="#5D4037" rx="4" />
        <rect x="30" y="150" width="150" height="8" fill="#5D4037" rx="4" />
        <rect x="30" y="170" width="150" height="8" fill="#5D4037" rx="4" />
        <rect x="200" y="130" width="90" height="8" fill="#5D4037" rx="4" />
        <rect x="200" y="150" width="90" height="8" fill="#5D4037" rx="4" />

        {/* Length dimension */}
        <g>
          <line x1="30" y1="195" x2="180" y2="195" stroke="#1565C0" strokeWidth="2" />
          <line x1="30" y1="188" x2="30" y2="202" stroke="#1565C0" strokeWidth="2" />
          <line x1="180" y1="188" x2="180" y2="202" stroke="#1565C0" strokeWidth="2" />
        </g>
        <rect x="80" y="198" width="50" height="18" fill="#E3F2FD" stroke="#1565C0" strokeWidth="1" rx="3" />
        <text x="105" y="211" textAnchor="middle" fill="#1565C0" fontSize="10" fontWeight="600">
          {isGeorgian ? 'სიგრძე' : 'LENGTH'}
        </text>

        {/* Phase label */}
        <g style={{ animation: 'rebar-phase-label 15s infinite' }}>
          <rect x="20" y="240" width="280" height="24" fill="#FFF3E0" stroke="#FF9800" strokeWidth="1" rx="4" />
          <text x="160" y="257" textAnchor="middle" fill="#E65100" fontSize="11" fontWeight="600">
            {t.phase1Label}
          </text>
        </g>
      </svg>

      {/* PHASE 2: Top View - Lay Horizontal Bars */}
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 320 270"
        preserveAspectRatio="xMidYMid meet"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          animation: 'rebar-phase2-container 15s infinite'
        }}
      >
        {/* Title */}
        <rect x="0" y="0" width="320" height="32" fill="#E3F2FD" />
        <text x="160" y="22" textAnchor="middle" fill="#1565C0" fontSize="14" fontWeight="600">
          {t.step2Title}
        </text>

        {/* Formwork outline - top view */}
        <rect x="40" y="50" width="240" height="155" fill="#F5F5F5" stroke="#8B6914" strokeWidth="8" />

        {/* Horizontal rebars - animated placement */}
        {[75, 105, 135, 165].map((y, i) => (
          <g key={`h-${i}`} style={{ animation: 'rebar-place-h 15s infinite', animationDelay: `${i * 0.15}s` }}>
            <rect x="55" y={y} width="210" height="8" fill="#5D4037" rx="4" />
          </g>
        ))}

        {/* Spacing dimension */}
        <g>
          <line x1="280" y1="75" x2="280" y2="105" stroke="#1565C0" strokeWidth="2" />
          <line x1="273" y1="75" x2="287" y2="75" stroke="#1565C0" strokeWidth="2" />
          <line x1="273" y1="105" x2="287" y2="105" stroke="#1565C0" strokeWidth="2" />
        </g>
        <rect x="285" y="80" width="32" height="18" fill="#E3F2FD" stroke="#1565C0" strokeWidth="1" rx="3" />
        <text x="301" y="93" textAnchor="middle" fill="#1565C0" fontSize="9" fontWeight="600">{t.spacing}</text>

        {/* Edge distance indicator */}
        <g>
          <line x1="48" y1="55" x2="48" y2="75" stroke="#4CAF50" strokeWidth="1.5" strokeDasharray="3,2" />
          <text x="48" y="45" textAnchor="middle" fill="#4CAF50" fontSize="8">5cm</text>
        </g>

        {/* Phase label */}
        <rect x="20" y="215" width="280" height="45" fill="#FFF3E0" stroke="#FF9800" strokeWidth="1" rx="4" />
        <text x="160" y="233" textAnchor="middle" fill="#E65100" fontSize="11" fontWeight="600">
          {t.phase2Label1}
        </text>
        <text x="160" y="250" textAnchor="middle" fill="#E65100" fontSize="10">
          {t.phase2Label2}
        </text>
      </svg>

      {/* PHASE 3: Top View - Lay Vertical Bars */}
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 320 270"
        preserveAspectRatio="xMidYMid meet"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          animation: 'rebar-phase3-container 15s infinite'
        }}
      >
        {/* Title */}
        <rect x="0" y="0" width="320" height="32" fill="#E3F2FD" />
        <text x="160" y="22" textAnchor="middle" fill="#1565C0" fontSize="14" fontWeight="600">
          {t.step3Title}
        </text>

        {/* Formwork outline */}
        <rect x="40" y="50" width="240" height="155" fill="#F5F5F5" stroke="#8B6914" strokeWidth="8" />

        {/* Horizontal rebars (already placed) */}
        {[75, 105, 135, 165].map((y, i) => (
          <rect key={`h2-${i}`} x="55" y={y} width="210" height="8" fill="#5D4037" rx="4" />
        ))}

        {/* Vertical rebars - animated placement */}
        {[75, 115, 155, 195, 235].map((x, i) => (
          <g key={`v-${i}`} style={{ animation: 'rebar-place-v 15s infinite', animationDelay: `${i * 0.12}s` }}>
            <rect x={x} y="60" width="8" height="135" fill="#5D4037" rx="4" />
          </g>
        ))}

        {/* Grid pattern indicator */}
        <text x="160" y="215" textAnchor="middle" fill="#5D4037" fontSize="10" fontWeight="600">
          {isGeorgian ? 'ბადის სტრუქტურა' : 'GRID PATTERN'}
        </text>

        {/* Phase label */}
        <rect x="20" y="220" width="280" height="40" fill="#E8F5E9" stroke="#4CAF50" strokeWidth="1" rx="4" />
        <text x="160" y="237" textAnchor="middle" fill="#2E7D32" fontSize="11" fontWeight="600">
          {t.phase3Label1}
        </text>
        <text x="160" y="252" textAnchor="middle" fill="#2E7D32" fontSize="10">
          {t.phase3Label2}
        </text>
      </svg>

      {/* PHASE 4: Top View - Tie Intersections (zoomed) */}
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 320 270"
        preserveAspectRatio="xMidYMid meet"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          animation: 'rebar-phase4-container 15s infinite'
        }}
      >
        {/* Title */}
        <rect x="0" y="0" width="320" height="32" fill="#E3F2FD" />
        <text x="160" y="22" textAnchor="middle" fill="#1565C0" fontSize="14" fontWeight="600">
          {t.step4Title}
        </text>

        {/* Zoomed view indicator */}
        <rect x="30" y="45" width="260" height="160" fill="#F5F5F5" stroke="#BDBDBD" strokeWidth="2" rx="8" />

        {/* Zoomed horizontal rebars */}
        <rect x="40" y="85" width="240" height="16" fill="#5D4037" rx="8" />
        <rect x="40" y="145" width="240" height="16" fill="#5D4037" rx="8" />

        {/* Zoomed vertical rebars */}
        <rect x="95" y="55" width="16" height="140" fill="#5D4037" rx="8" />
        <rect x="175" y="55" width="16" height="140" fill="#5D4037" rx="8" />

        {/* Wire ties at intersections - animated */}
        {[[103, 93], [183, 93], [103, 153], [183, 153]].map(([x, y], i) => (
          <g key={`tie-${i}`} style={{ animation: 'rebar-tie-appear 15s infinite', animationDelay: `${i * 0.2}s` }}>
            {/* Diagonal wire pattern */}
            <line x1={x-12} y1={y-12} x2={x+12} y2={y+12} stroke="#78909C" strokeWidth="3" />
            <line x1={x+12} y1={y-12} x2={x-12} y2={y+12} stroke="#78909C" strokeWidth="3" />
            {/* Center knot */}
            <circle cx={x} cy={y} r="6" fill="#607D8B" stroke="#455A64" strokeWidth="2" />
          </g>
        ))}

        {/* Wire tie label */}
        <g>
          <line x1="183" y1="93" x2="240" y2="60" stroke="#607D8B" strokeWidth="1.5" />
          <text x="245" y="58" fill="#455A64" fontSize="10" fontWeight="600">{t.wireTie}</text>
        </g>

        {/* Magnifying glass indicator */}
        <g transform="translate(280, 180)">
          <circle cx="0" cy="0" r="15" fill="none" stroke="#1565C0" strokeWidth="2" />
          <line x1="10" y1="10" x2="20" y2="20" stroke="#1565C0" strokeWidth="3" />
          <text x="0" y="5" textAnchor="middle" fill="#1565C0" fontSize="12" fontWeight="700">+</text>
        </g>

        {/* Phase label */}
        <rect x="20" y="215" width="280" height="45" fill="#E8F5E9" stroke="#4CAF50" strokeWidth="1" rx="4" />
        <text x="160" y="233" textAnchor="middle" fill="#2E7D32" fontSize="11" fontWeight="600">
          {t.phase4Label1}
        </text>
        <text x="160" y="250" textAnchor="middle" fill="#2E7D32" fontSize="10">
          {t.phase4Label2}
        </text>
      </svg>

      {/* PHASE 5: Side View - Lift on Spacers */}
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 320 270"
        preserveAspectRatio="xMidYMid meet"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          animation: 'rebar-phase5-container 15s infinite'
        }}
      >
        {/* Title */}
        <rect x="0" y="0" width="320" height="32" fill="#E3F2FD" />
        <text x="160" y="22" textAnchor="middle" fill="#1565C0" fontSize="14" fontWeight="600">
          {t.step5Title}
        </text>

        {/* Formwork sides */}
        <rect x="30" y="100" width="18" height="70" fill="#D4A574" stroke="#8B6914" strokeWidth="2" />
        <rect x="272" y="100" width="18" height="70" fill="#D4A574" stroke="#8B6914" strokeWidth="2" />

        {/* Gravel base */}
        <rect x="48" y="155" width="224" height="15" fill="#A09080" />
        <text x="160" y="167" textAnchor="middle" fill="#FFF" fontSize="9">{isGeorgian ? 'ხრეში' : 'GRAVEL'}</text>

        {/* Spacers - animated appearance */}
        {[80, 160, 240].map((x, i) => (
          <g key={`spacer-${i}`} style={{ animation: 'rebar-spacer-appear 15s infinite' }}>
            <rect x={x-8} y="140" width="16" height="15" fill="#9E9E9E" stroke="#757575" strokeWidth="1" rx="2" />
          </g>
        ))}

        {/* Rebar grid - animated lifting */}
        <g style={{ animation: 'rebar-lift 15s infinite' }}>
          {/* Horizontal bars (cross-section circles) */}
          {[70, 110, 150, 190, 230].map((x, i) => (
            <circle key={`rebar-c-${i}`} cx={x} cy="135" r="6" fill="#5D4037" stroke="#3E2723" strokeWidth="1" />
          ))}
          {/* Connecting line to show grid */}
          <line x1="70" y1="135" x2="230" y2="135" stroke="#5D4037" strokeWidth="3" />
        </g>

        {/* Lift height dimension */}
        <g>
          <line x1="255" y1="140" x2="255" y2="155" stroke="#1565C0" strokeWidth="2" />
          <line x1="248" y1="140" x2="262" y2="140" stroke="#1565C0" strokeWidth="2" />
          <line x1="248" y1="155" x2="262" y2="155" stroke="#1565C0" strokeWidth="2" />
        </g>
        <rect x="262" y="140" width="35" height="16" fill="#E3F2FD" stroke="#1565C0" strokeWidth="1" rx="3" />
        <text x="280" y="152" textAnchor="middle" fill="#1565C0" fontSize="10" fontWeight="700">{t.liftHeight}</text>

        {/* Spacer label */}
        <g>
          <line x1="160" y1="155" x2="160" y2="180" stroke="#757575" strokeWidth="1" />
          <text x="160" y="192" textAnchor="middle" fill="#616161" fontSize="10" fontWeight="500">{t.spacer}</text>
        </g>

        {/* Checkmark */}
        <g transform="translate(285, 110)">
          <circle cx="0" cy="0" r="14" fill="#E8F5E9" stroke="#4CAF50" strokeWidth="2" />
          <path d="M-6 0 L-2 4 L6 -4" stroke="#4CAF50" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </g>

        {/* Phase label */}
        <rect x="20" y="215" width="280" height="45" fill="#E3F2FD" stroke="#1565C0" strokeWidth="1" rx="4" />
        <text x="160" y="233" textAnchor="middle" fill="#0D47A1" fontSize="11" fontWeight="600">
          {t.phase5Label1}
        </text>
        <text x="160" y="250" textAnchor="middle" fill="#0D47A1" fontSize="10">
          {t.phase5Label2}
        </text>
      </svg>
    </div>
  );
};

// ============================================================================
// CONCRETE POUR - Animated 4-phase sequence (includes smoothing)
// Phase 1: Side view - pour concrete from one side
// Phase 2: Side view - spread concrete evenly
// Phase 3: Side view - level with screed board
// Phase 4: Side view - smooth surface with float
// ============================================================================

// Translations for Concrete Pour Animation
const concretePourTranslations = {
  en: {
    step1Title: 'STEP 1: POUR CONCRETE',
    step2Title: 'STEP 2: SPREAD EVENLY',
    step3Title: 'STEP 3: LEVEL SURFACE',
    step4Title: 'STEP 4: SMOOTH FINISH',
    concrete: 'CONCRETE',
    gravel: 'GRAVEL',
    rebar: 'REBAR',
    thickness: '15 cm',
    phase1Label: 'Pour concrete starting from one corner',
    phase2Label1: 'Spread concrete with shovel or rake',
    phase2Label2: 'Work quickly before concrete sets',
    phase3Label1: 'Level with screed board',
    phase3Label2: 'Pull screed in sawing motion',
    phase4Label1: 'Smooth surface with float or trowel',
    phase4Label2: 'Wait for bleed water to disappear first',
  },
  ka: {
    step1Title: 'ნაბიჯი 1: ჩაასხით ბეტონი',
    step2Title: 'ნაბიჯი 2: გადაანაწილეთ თანაბრად',
    step3Title: 'ნაბიჯი 3: გაასწორეთ ზედაპირი',
    step4Title: 'ნაბიჯი 4: დააგლუვეთ ზედაპირი',
    concrete: 'ბეტონი',
    gravel: 'ხრეში',
    rebar: 'არმატურა',
    thickness: '15 სმ',
    phase1Label: 'ჩაასხით ბეტონი ერთი კუთხიდან',
    phase2Label1: 'გადაანაწილეთ ბეტონი ნიჩბით ან ფოცხით',
    phase2Label2: 'იმუშავეთ სწრაფად, სანამ ბეტონი გამაგრდება',
    phase3Label1: 'გაასწორეთ რეიკით',
    phase3Label2: 'გადაწიეთ რეიკა ხერხის მოძრაობით',
    phase4Label1: 'დააგლუვეთ ზედაპირი მალით ან მისტრით',
    phase4Label2: 'დაელოდეთ ზედაპირული წყლის გაშრობას',
  },
};

export const ConcretePourAnimation: React.FC<AnimationProps> = ({ size = 320, templateInputs }) => {
  const { i18n } = useTranslation();
  const lang = i18n.language?.startsWith('ka') ? 'ka' : 'en';
  const isGeorgian = lang === 'ka';
  const aspectRatio = 0.85;

  const thickness = templateInputs?.thickness || 15;
  const unitCm = isGeorgian ? 'სმ' : 'cm';

  const t = {
    ...concretePourTranslations[lang],
    thickness: `${thickness} ${unitCm}`,
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
        @keyframes pour-phase1-container {
          0%, 25% { opacity: 1; }
          30%, 100% { opacity: 0; }
        }
        @keyframes pour-phase2-container {
          0%, 25% { opacity: 0; }
          30%, 50% { opacity: 1; }
          55%, 100% { opacity: 0; }
        }
        @keyframes pour-phase3-container {
          0%, 50% { opacity: 0; }
          55%, 75% { opacity: 1; }
          80%, 100% { opacity: 0; }
        }
        @keyframes pour-phase4-container {
          0%, 75% { opacity: 0; }
          80%, 100% { opacity: 1; }
        }
        @keyframes pour-stream {
          0%, 5% { opacity: 0; transform: scaleY(0); }
          10%, 25% { opacity: 1; transform: scaleY(1); }
        }
        @keyframes pour-fill {
          0%, 5% { width: 0; }
          25% { width: 180px; }
        }
        @keyframes pour-shovel {
          0%, 30% { transform: translateX(-20px) rotate(0deg); }
          35% { transform: translateX(0) rotate(-15deg); }
          40% { transform: translateX(20px) rotate(0deg); }
          45% { transform: translateX(0) rotate(15deg); }
          50% { transform: translateX(-10px) rotate(0deg); }
        }
        @keyframes pour-screed {
          0%, 55% { transform: translateX(-30px); }
          60% { transform: translateX(0); }
          65% { transform: translateX(-10px); }
          70% { transform: translateX(10px); }
          75% { transform: translateX(0); }
        }
        @keyframes pour-surface-level {
          0%, 55% { d: path('M48 115 Q100 105 160 120 Q200 108 272 115'); }
          75% { d: path('M48 115 L272 115'); }
        }
        @keyframes pour-float {
          0%, 80% { transform: translateX(-40px); opacity: 0; }
          85% { transform: translateX(0); opacity: 1; }
          90% { transform: translateX(20px); opacity: 1; }
          95% { transform: translateX(40px); opacity: 1; }
          100% { transform: translateX(60px); opacity: 1; }
        }
        @keyframes pour-phase-label {
          0%, 5% { opacity: 0; }
          10%, 90% { opacity: 1; }
          95%, 100% { opacity: 0; }
        }
      `}</style>

      {/* PHASE 1: Side View - Pour Concrete */}
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 320 270"
        preserveAspectRatio="xMidYMid meet"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          animation: 'pour-phase1-container 12s infinite'
        }}
      >
        {/* Title */}
        <rect x="0" y="0" width="320" height="32" fill="#E3F2FD" />
        <text x="160" y="22" textAnchor="middle" fill="#1565C0" fontSize="14" fontWeight="600">
          {t.step1Title}
        </text>

        {/* Formwork sides */}
        <rect x="30" y="100" width="18" height="70" fill="#D4A574" stroke="#8B6914" strokeWidth="2" />
        <rect x="272" y="100" width="18" height="70" fill="#D4A574" stroke="#8B6914" strokeWidth="2" />

        {/* Gravel base */}
        <rect x="48" y="155" width="224" height="15" fill="#A09080" />

        {/* Rebar in gravel */}
        {[80, 120, 160, 200, 240].map((x, i) => (
          <circle key={`rebar-${i}`} cx={x} cy="145" r="4" fill="#5D4037" />
        ))}

        {/* Concrete being poured - animated stream */}
        <g style={{ transformOrigin: '100px 50px', animation: 'pour-stream 12s infinite' }}>
          {/* Chute */}
          <rect x="60" y="40" width="80" height="14" fill="#607D8B" rx="3" transform="rotate(20, 100, 47)" />
          {/* Stream */}
          <path d="M115 55 Q118 80 116 100 L120 100 Q123 80 120 55 Z" fill="#9E9E9E" />
          {/* Splash */}
          <ellipse cx="118" cy="115" rx="20" ry="10" fill="#9E9E9E" opacity="0.8" />
        </g>

        {/* Concrete filling - animated */}
        <rect x="48" y="115" width="0" height="40" fill="#9E9E9E" style={{ animation: 'pour-fill 12s infinite' }} />

        {/* Pour direction arrow */}
        <g>
          <path d="M135 70 L135 95" stroke="#E53935" strokeWidth="3" />
          <polygon points="129 90, 141 90, 135 102" fill="#E53935" />
        </g>

        {/* Thickness dimension */}
        <g>
          <line x1="295" y1="115" x2="295" y2="155" stroke="#1565C0" strokeWidth="2" />
          <line x1="288" y1="115" x2="302" y2="115" stroke="#1565C0" strokeWidth="2" />
          <line x1="288" y1="155" x2="302" y2="155" stroke="#1565C0" strokeWidth="2" />
        </g>
        <rect x="255" y="125" width="50" height="18" fill="#E3F2FD" stroke="#1565C0" strokeWidth="1" rx="3" />
        <text x="280" y="138" textAnchor="middle" fill="#1565C0" fontSize="10" fontWeight="700">{t.thickness}</text>

        {/* Phase label */}
        <g style={{ animation: 'pour-phase-label 12s infinite' }}>
          <rect x="20" y="240" width="280" height="24" fill="#FFF3E0" stroke="#FF9800" strokeWidth="1" rx="4" />
          <text x="160" y="257" textAnchor="middle" fill="#E65100" fontSize="11" fontWeight="600">
            {t.phase1Label}
          </text>
        </g>
      </svg>

      {/* PHASE 2: Side View - Spread Evenly */}
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 320 270"
        preserveAspectRatio="xMidYMid meet"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          animation: 'pour-phase2-container 12s infinite'
        }}
      >
        {/* Title */}
        <rect x="0" y="0" width="320" height="32" fill="#E3F2FD" />
        <text x="160" y="22" textAnchor="middle" fill="#1565C0" fontSize="14" fontWeight="600">
          {t.step2Title}
        </text>

        {/* Formwork sides */}
        <rect x="30" y="100" width="18" height="70" fill="#D4A574" stroke="#8B6914" strokeWidth="2" />
        <rect x="272" y="100" width="18" height="70" fill="#D4A574" stroke="#8B6914" strokeWidth="2" />

        {/* Gravel base */}
        <rect x="48" y="155" width="224" height="15" fill="#A09080" />

        {/* Uneven concrete */}
        <path d="M48 155 L48 115 Q100 100 160 125 Q200 105 272 115 L272 155 Z" fill="#9E9E9E" />

        {/* Rebar showing through */}
        {[80, 120, 160, 200, 240].map((x, i) => (
          <circle key={`rebar2-${i}`} cx={x} cy="140" r="4" fill="#5D4037" />
        ))}

        {/* Shovel spreading - animated */}
        <g style={{ transformOrigin: '160px 90px', animation: 'pour-shovel 12s infinite' }}>
          {/* Handle */}
          <rect x="155" y="45" width="10" height="50" fill="#8B4513" rx="3" />
          {/* Blade */}
          <path d="M145 93 L175 93 L170 115 Q160 120 150 115 Z" fill="#607D8B" stroke="#455A64" strokeWidth="1" />
        </g>

        {/* Phase label */}
        <rect x="20" y="215" width="280" height="45" fill="#FFF3E0" stroke="#FF9800" strokeWidth="1" rx="4" />
        <text x="160" y="233" textAnchor="middle" fill="#E65100" fontSize="11" fontWeight="600">
          {t.phase2Label1}
        </text>
        <text x="160" y="250" textAnchor="middle" fill="#E65100" fontSize="10">
          {t.phase2Label2}
        </text>
      </svg>

      {/* PHASE 3: Side View - Level with Screed */}
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 320 270"
        preserveAspectRatio="xMidYMid meet"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          animation: 'pour-phase3-container 12s infinite'
        }}
      >
        {/* Title */}
        <rect x="0" y="0" width="320" height="32" fill="#E3F2FD" />
        <text x="160" y="22" textAnchor="middle" fill="#1565C0" fontSize="14" fontWeight="600">
          {t.step3Title}
        </text>

        {/* Formwork sides */}
        <rect x="30" y="100" width="18" height="70" fill="#D4A574" stroke="#8B6914" strokeWidth="2" />
        <rect x="272" y="100" width="18" height="70" fill="#D4A574" stroke="#8B6914" strokeWidth="2" />

        {/* Gravel base */}
        <rect x="48" y="155" width="224" height="15" fill="#A09080" />

        {/* Concrete being leveled - surface animates flat */}
        <path
          d="M48 155 L48 115 Q100 105 160 120 Q200 108 272 115 L272 155 Z"
          fill="#9E9E9E"
        />
        {/* Level surface overlay */}
        <rect x="48" y="115" width="224" height="40" fill="#9E9E9E" />

        {/* Rebar */}
        {[80, 120, 160, 200, 240].map((x, i) => (
          <circle key={`rebar3-${i}`} cx={x} cy="140" r="4" fill="#5D4037" />
        ))}

        {/* Screed board - animated */}
        <g style={{ animation: 'pour-screed 12s infinite' }}>
          {/* Board */}
          <rect x="100" y="95" width="120" height="22" fill="#D4A574" stroke="#8B6914" strokeWidth="2" rx="2" />
          {/* Handles */}
          <rect x="95" y="85" width="15" height="12" fill="#8B4513" rx="2" />
          <rect x="210" y="85" width="15" height="12" fill="#8B4513" rx="2" />
        </g>

        {/* Level line */}
        <line x1="48" y1="115" x2="272" y2="115" stroke="#1565C0" strokeWidth="2" strokeDasharray="8,4" />

        {/* Sawing motion arrows */}
        <g>
          <path d="M145 80 L125 80" stroke="#E53935" strokeWidth="2" />
          <polygon points="127 76, 127 84, 120 80" fill="#E53935" />
          <path d="M175 80 L195 80" stroke="#E53935" strokeWidth="2" />
          <polygon points="193 76, 193 84, 200 80" fill="#E53935" />
        </g>

        {/* Phase label */}
        <rect x="20" y="215" width="280" height="45" fill="#E8F5E9" stroke="#4CAF50" strokeWidth="1" rx="4" />
        <text x="160" y="233" textAnchor="middle" fill="#2E7D32" fontSize="11" fontWeight="600">
          {t.phase3Label1}
        </text>
        <text x="160" y="250" textAnchor="middle" fill="#2E7D32" fontSize="10">
          {t.phase3Label2}
        </text>
      </svg>

      {/* PHASE 4: Side View - Smooth with Float */}
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 320 270"
        preserveAspectRatio="xMidYMid meet"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          animation: 'pour-phase4-container 12s infinite'
        }}
      >
        {/* Title */}
        <rect x="0" y="0" width="320" height="32" fill="#E3F2FD" />
        <text x="160" y="22" textAnchor="middle" fill="#1565C0" fontSize="14" fontWeight="600">
          {t.step4Title}
        </text>

        {/* Formwork sides */}
        <rect x="30" y="100" width="18" height="70" fill="#D4A574" stroke="#8B6914" strokeWidth="2" />
        <rect x="272" y="100" width="18" height="70" fill="#D4A574" stroke="#8B6914" strokeWidth="2" />

        {/* Gravel base */}
        <rect x="48" y="155" width="224" height="15" fill="#A09080" />

        {/* Level concrete */}
        <rect x="48" y="115" width="224" height="40" fill="#9E9E9E" />

        {/* Smooth surface finish (lighter) */}
        <rect x="48" y="115" width="224" height="5" fill="#BDBDBD" />

        {/* Rebar */}
        {[80, 120, 160, 200, 240].map((x, i) => (
          <circle key={`rebar4-${i}`} cx={x} cy="140" r="4" fill="#5D4037" />
        ))}

        {/* Float tool - animated */}
        <g style={{ animation: 'pour-float 12s infinite' }}>
          {/* Float blade */}
          <rect x="100" y="100" width="70" height="12" fill="#D4A574" stroke="#8B6914" strokeWidth="1.5" rx="2" />
          {/* Handle */}
          <rect x="130" y="75" width="10" height="27" fill="#8B4513" rx="2" />
        </g>

        {/* Smooth arrow direction */}
        <g>
          <path d="M180 90 L220 90" stroke="#4CAF50" strokeWidth="2" />
          <polygon points="215 86, 215 94, 225 90" fill="#4CAF50" />
        </g>

        {/* Labels */}
        <text x="160" y="138" textAnchor="middle" fill="#FFF" fontSize="10" fontWeight="600">{t.concrete}</text>

        {/* Thickness dimension */}
        <g>
          <line x1="295" y1="115" x2="295" y2="155" stroke="#1565C0" strokeWidth="2" />
          <line x1="288" y1="115" x2="302" y2="115" stroke="#1565C0" strokeWidth="2" />
          <line x1="288" y1="155" x2="302" y2="155" stroke="#1565C0" strokeWidth="2" />
        </g>
        <rect x="255" y="125" width="50" height="18" fill="#E3F2FD" stroke="#1565C0" strokeWidth="1" rx="3" />
        <text x="280" y="138" textAnchor="middle" fill="#1565C0" fontSize="10" fontWeight="700">{t.thickness}</text>

        {/* Checkmark */}
        <g transform="translate(285, 85)">
          <circle cx="0" cy="0" r="14" fill="#E8F5E9" stroke="#4CAF50" strokeWidth="2" />
          <path d="M-6 0 L-2 4 L6 -4" stroke="#4CAF50" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </g>

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

// Keep SmoothingAnimation as alias for backwards compatibility (but concrete_pour now includes smoothing)
export const SmoothingAnimation = ConcretePourAnimation;

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
        @keyframes gravel-pile-appear {
          0%, 5% { opacity: 0; transform: scale(0.8); }
          15%, 25% { opacity: 1; transform: scale(1); }
        }
        @keyframes gravel-rake-move {
          0%, 30% { transform: translateX(-60px); }
          55% { transform: translateX(60px); }
        }
        @keyframes gravel-uneven-to-flat {
          0%, 30% { d: path('M48 155 Q90 115 130 135 Q170 105 210 130 Q250 110 272 155 L272 155 L48 155 Z'); }
          55% { d: path('M48 155 L48 130 L272 130 L272 155 Z'); }
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

      {/* PHASE 1: Add Gravel - Simple pile showing gravel added */}
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
        <rect x="30" y="100" width="18" height="70" fill="#D4A574" stroke="#8B6914" strokeWidth="2" />
        <rect x="272" y="100" width="18" height="70" fill="#D4A574" stroke="#8B6914" strokeWidth="2" />

        {/* Compacted soil base */}
        <rect x="48" y="155" width="224" height="15" fill="#8B7355" />
        <text x="160" y="167" textAnchor="middle" fill="#FFF" fontSize="9" fontWeight="500">{t.soil}</text>

        {/* Gravel pile - uneven mound */}
        <g style={{ animation: 'gravel-pile-appear 12s infinite' }}>
          <path d="M48 155 Q90 115 130 135 Q170 105 210 130 Q250 110 272 155 L272 155 L48 155 Z" fill="#A09080" />
          {/* Gravel texture dots */}
          {[70, 100, 130, 160, 190, 220, 250].map((x, i) => (
            <circle key={`dot-${i}`} cx={x} cy={140 - (i % 3) * 8} r="4" fill="#706050" />
          ))}
          {[85, 115, 145, 175, 205, 235].map((x, i) => (
            <circle key={`dot2-${i}`} cx={x} cy={148 - (i % 2) * 6} r="3" fill="#706050" />
          ))}
        </g>

        {/* Depth dimension */}
        <g>
          <line x1="290" y1="110" x2="290" y2="155" stroke="#1565C0" strokeWidth="2" />
          <line x1="283" y1="110" x2="297" y2="110" stroke="#1565C0" strokeWidth="2" />
          <line x1="283" y1="155" x2="297" y2="155" stroke="#1565C0" strokeWidth="2" />
        </g>
        <rect x="248" y="120" width="50" height="20" fill="#E3F2FD" stroke="#1565C0" strokeWidth="1" rx="3" />
        <text x="273" y="135" textAnchor="middle" fill="#1565C0" fontSize="10" fontWeight="700">{t.depth}</text>

        {/* Phase label */}
        <g style={{ animation: 'gravel-phase-label 12s infinite' }}>
          <rect x="20" y="240" width="280" height="24" fill="#FFF3E0" stroke="#FF9800" strokeWidth="1" rx="4" />
          <text x="160" y="257" textAnchor="middle" fill="#E65100" fontSize="11" fontWeight="600">
            {t.phase1Label}
          </text>
        </g>
      </svg>

      {/* PHASE 2: Spread Evenly - Rake spreading with gravel becoming flat */}
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
        <rect x="30" y="100" width="18" height="70" fill="#D4A574" stroke="#8B6914" strokeWidth="2" />
        <rect x="272" y="100" width="18" height="70" fill="#D4A574" stroke="#8B6914" strokeWidth="2" />

        {/* Compacted soil base */}
        <rect x="48" y="155" width="224" height="15" fill="#8B7355" />

        {/* Gravel being spread - animates from uneven to flat */}
        <path
          d="M48 155 Q90 115 130 135 Q170 105 210 130 Q250 110 272 155 L272 155 L48 155 Z"
          fill="#A09080"
          style={{ animation: 'gravel-uneven-to-flat 12s infinite' }}
        />

        {/* Gravel texture */}
        {[60, 90, 120, 150, 180, 210, 240].map((x, i) => (
          <circle key={`tex-${i}`} cx={x} cy={142} r="4" fill="#706050" />
        ))}

        {/* Rake tool - moves across */}
        <g style={{ animation: 'gravel-rake-move 12s infinite' }}>
          {/* Handle */}
          <rect x="156" y="50" width="8" height="55" fill="#8B4513" rx="2" />
          {/* Rake head */}
          <rect x="135" y="103" width="50" height="7" fill="#607D8B" rx="2" />
          {/* Rake tines */}
          {[140, 150, 160, 170, 180].map((x, i) => (
            <rect key={`tine-${i}`} x={x} y="110" width="3" height="10" fill="#455A64" />
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

      {/* PHASE 3: Level Surface - Static level showing bubble centered */}
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
        <rect x="30" y="100" width="18" height="70" fill="#D4A574" stroke="#8B6914" strokeWidth="2" />
        <rect x="272" y="100" width="18" height="70" fill="#D4A574" stroke="#8B6914" strokeWidth="2" />

        {/* Compacted soil base */}
        <rect x="48" y="155" width="224" height="15" fill="#8B7355" />

        {/* Level gravel layer */}
        <rect x="48" y="130" width="224" height="25" fill="#A09080" />
        <text x="160" y="147" textAnchor="middle" fill="#FFF" fontSize="10" fontWeight="600">{t.gravel}</text>

        {/* Gravel texture */}
        {[60, 85, 110, 135, 160, 185, 210, 235, 260].map((x, i) => (
          <circle key={`tex-${i}`} cx={x} cy={140} r="3" fill="#706050" />
        ))}

        {/* Level line */}
        <line x1="48" y1="130" x2="272" y2="130" stroke="#1565C0" strokeWidth="2" strokeDasharray="8,4" />

        {/* Spirit level tool - static, showing level */}
        <g>
          {/* Level body */}
          <rect x="90" y="80" width="140" height="28" fill="#FFD54F" stroke="#F9A825" strokeWidth="2" rx="4" />
          {/* Bubble vial */}
          <rect x="145" y="86" width="30" height="16" fill="#81D4FA" stroke="#0288D1" strokeWidth="1" rx="3" />
          {/* Center lines in vial */}
          <line x1="158" y1="86" x2="158" y2="102" stroke="#0288D1" strokeWidth="1" />
          <line x1="162" y1="86" x2="162" y2="102" stroke="#0288D1" strokeWidth="1" />
          {/* Bubble - centered (level!) */}
          <circle cx="160" cy="94" r="5" fill="#4CAF50" />
        </g>

        {/* Checkmark indicating level */}
        <g transform="translate(235, 85)">
          <circle cx="0" cy="0" r="12" fill="#E8F5E9" stroke="#4CAF50" strokeWidth="2" />
          <path d="M-5 0 L-2 3 L5 -4" stroke="#4CAF50" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </g>

        {/* Depth dimension */}
        <g>
          <line x1="290" y1="130" x2="290" y2="155" stroke="#1565C0" strokeWidth="2" />
          <line x1="283" y1="130" x2="297" y2="130" stroke="#1565C0" strokeWidth="2" />
          <line x1="283" y1="155" x2="297" y2="155" stroke="#1565C0" strokeWidth="2" />
        </g>
        <rect x="248" y="133" width="50" height="18" fill="#E3F2FD" stroke="#1565C0" strokeWidth="1" rx="3" />
        <text x="273" y="146" textAnchor="middle" fill="#1565C0" fontSize="10" fontWeight="700">{t.depth}</text>

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
        <rect x="30" y="100" width="18" height="70" fill="#D4A574" stroke="#8B6914" strokeWidth="2" />
        <rect x="272" y="100" width="18" height="70" fill="#D4A574" stroke="#8B6914" strokeWidth="2" />

        {/* Compacted soil base */}
        <rect x="48" y="155" width="224" height="15" fill="#8B7355" />

        {/* Compacted gravel layer */}
        <rect x="48" y="135" width="224" height="20" fill="#A09080" />
        <line x1="48" y1="135" x2="272" y2="135" stroke="#706050" strokeWidth="3" />

        {/* Gravel texture - more compressed */}
        {[55, 75, 95, 115, 135, 155, 175, 195, 215, 235, 255].map((x, i) => (
          <circle key={`tex-${i}`} cx={x} cy={145} r="2.5" fill="#706050" />
        ))}

        {/* Plate compactor */}
        <g style={{ animation: 'gravel-compactor 12s infinite' }}>
          {/* Handle */}
          <rect x="150" y="55" width="10" height="30" fill="#424242" rx="2" />
          <rect x="145" y="50" width="20" height="10" fill="#616161" rx="3" />
          {/* Engine housing */}
          <rect x="130" y="85" width="50" height="20" fill="#FF5722" rx="4" />
          <rect x="140" y="90" width="30" height="6" fill="#BF360C" rx="2" />
          {/* Base plate */}
          <rect x="120" y="105" width="70" height="10" fill="#607D8B" rx="2" />
        </g>

        {/* Vibration lines */}
        <g style={{ animation: 'gravel-vibration 12s infinite' }}>
          {[135, 155, 175].map((x, i) => (
            <g key={`vib-${i}`}>
              <line x1={x} y1="118" x2={x} y2="128" stroke="#FF5722" strokeWidth="2" />
              <polygon points={`${x-4} 128, ${x+4} 128, ${x} 135`} fill="#FF5722" />
            </g>
          ))}
        </g>

        {/* Compression arrows on sides */}
        <g style={{ animation: 'gravel-vibration 12s infinite' }}>
          <path d="M70 115 L70 130" stroke="#1565C0" strokeWidth="2" />
          <polygon points="66 130, 74 130, 70 138" fill="#1565C0" />
          <path d="M250 115 L250 130" stroke="#1565C0" strokeWidth="2" />
          <polygon points="246 130, 254 130, 250 138" fill="#1565C0" />
        </g>

        {/* Depth dimension */}
        <g>
          <line x1="290" y1="135" x2="290" y2="155" stroke="#1565C0" strokeWidth="2" />
          <line x1="283" y1="135" x2="297" y2="135" stroke="#1565C0" strokeWidth="2" />
          <line x1="283" y1="155" x2="297" y2="155" stroke="#1565C0" strokeWidth="2" />
        </g>
        <rect x="248" y="138" width="50" height="16" fill="#E3F2FD" stroke="#1565C0" strokeWidth="1" rx="3" />
        <text x="273" y="150" textAnchor="middle" fill="#1565C0" fontSize="10" fontWeight="700">{t.depth}</text>

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
// CURING & CARE ANIMATION - Step 6
// Phase 1: Wait for surface to set (2-4 hours)
// Phase 2: Cover with plastic sheeting
// Phase 3: Spray with water
// Phase 4: Keep moist for 7 days
// ============================================================================

const curingTranslations = {
  en: {
    step1Title: 'STEP 1: WAIT FOR SURFACE TO SET',
    step2Title: 'STEP 2: COVER WITH PLASTIC',
    step3Title: 'STEP 3: SPRAY WITH WATER',
    step4Title: 'STEP 4: KEEP MOIST FOR 7 DAYS',
    hours: 'hours',
    waitTime: '2-4',
    phase1Label: 'Wait until surface is firm but not fully hardened',
    phase2Label1: 'Cover entire slab with plastic sheeting',
    phase2Label2: 'Secure edges to prevent wind from lifting',
    phase3Label1: 'Spray water evenly over the plastic',
    phase3Label2: 'Keep the surface moist at all times',
    phase4Label1: 'Repeat watering daily for 7 days',
    phase4Label2: 'Proper curing = stronger concrete',
    day: 'DAY',
    days7: '7 DAYS',
  },
  ka: {
    step1Title: 'ნაბიჯი 1: დაელოდეთ გამაგრებას',
    step2Title: 'ნაბიჯი 2: დაფარეთ პლასტმასით',
    step3Title: 'ნაბიჯი 3: დაასველეთ წყლით',
    step4Title: 'ნაბიჯი 4: შეინახეთ ნესტიანად 7 დღე',
    hours: 'საათი',
    waitTime: '2-4',
    phase1Label: 'დაელოდეთ სანამ ზედაპირი გამაგრდება',
    phase2Label1: 'დაფარეთ მთელი ფილა პლასტმასით',
    phase2Label2: 'დაამაგრეთ კიდეები ქარისგან',
    phase3Label1: 'თანაბრად დაასხით წყალი პლასტმასზე',
    phase3Label2: 'შეინახეთ ზედაპირი მუდმივად ნესტიანი',
    phase4Label1: 'გაიმეორეთ მორწყვა ყოველდღე 7 დღის განმავლობაში',
    phase4Label2: 'სწორი გამაგრება = ძლიერი ბეტონი',
    day: 'დღე',
    days7: '7 დღე',
  },
};

export const CuringAnimation: React.FC<AnimationProps> = ({ size = 320, templateInputs }) => {
  const { i18n } = useTranslation();
  const lang = i18n.language?.startsWith('ka') ? 'ka' : 'en';
  const t = curingTranslations[lang];
  const aspectRatio = 0.85;

  return (
    <div style={{
      width: '100%',
      maxWidth: size,
      aspectRatio: `1 / ${aspectRatio}`,
      margin: '0 auto',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <style>{`
        @keyframes curing-phase1-container {
          0%, 25% { opacity: 1; }
          30%, 100% { opacity: 0; }
        }
        @keyframes curing-phase2-container {
          0%, 25% { opacity: 0; }
          30%, 50% { opacity: 1; }
          55%, 100% { opacity: 0; }
        }
        @keyframes curing-phase3-container {
          0%, 50% { opacity: 0; }
          55%, 75% { opacity: 1; }
          80%, 100% { opacity: 0; }
        }
        @keyframes curing-phase4-container {
          0%, 75% { opacity: 0; }
          80%, 100% { opacity: 1; }
        }
        @keyframes curing-clock-hand {
          0%, 25% { transform: rotate(0deg); }
          12.5% { transform: rotate(180deg); }
          25%, 100% { transform: rotate(360deg); }
        }
        @keyframes curing-plastic-unroll {
          0%, 30% { transform: translateX(-250px); }
          50%, 100% { transform: translateX(0); }
        }
        @keyframes curing-spray-water {
          0%, 55% { opacity: 0; }
          60%, 70% { opacity: 1; }
          75%, 100% { opacity: 0; }
        }
        @keyframes curing-spray-move {
          0%, 55% { transform: translateX(0); }
          65% { transform: translateX(60px); }
          75%, 100% { transform: translateX(120px); }
        }
        @keyframes curing-droplets {
          0% { transform: translateY(0); opacity: 1; }
          100% { transform: translateY(30px); opacity: 0; }
        }
        @keyframes curing-day-counter {
          0%, 80% { opacity: 0; }
          82% { opacity: 1; }
          84% { opacity: 0; }
          86% { opacity: 1; }
          88% { opacity: 0; }
          90% { opacity: 1; }
          92% { opacity: 0; }
          94%, 100% { opacity: 1; }
        }
      `}</style>

      {/* PHASE 1: Wait for surface to set */}
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 320 270"
        preserveAspectRatio="xMidYMid meet"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          animation: 'curing-phase1-container 12s infinite'
        }}
      >
        {/* Title */}
        <rect x="0" y="0" width="320" height="32" fill="#E3F2FD" />
        <text x="160" y="22" textAnchor="middle" fill="#1565C0" fontSize="14" fontWeight="600">
          {t.step1Title}
        </text>

        {/* Formwork sides */}
        <rect x="30" y="120" width="15" height="50" fill="#D4A574" stroke="#8B6914" strokeWidth="2" />
        <rect x="275" y="120" width="15" height="50" fill="#D4A574" stroke="#8B6914" strokeWidth="2" />

        {/* Fresh concrete slab */}
        <rect x="45" y="145" width="230" height="25" fill="#BDBDBD" />
        <rect x="45" y="140" width="230" height="8" fill="#9E9E9E" />

        {/* Wet surface indication - wavy lines */}
        <path d="M60 144 Q80 142, 100 144 T140 144 T180 144 T220 144 T260 144" stroke="#78909C" strokeWidth="1.5" fill="none" opacity="0.6" />

        {/* Clock/Timer */}
        <circle cx="160" cy="95" r="35" fill="white" stroke="#1565C0" strokeWidth="3" />
        <circle cx="160" cy="95" r="30" fill="#E3F2FD" />

        {/* Clock numbers */}
        <text x="160" y="70" textAnchor="middle" fill="#1565C0" fontSize="10" fontWeight="600">12</text>
        <text x="185" y="98" textAnchor="middle" fill="#1565C0" fontSize="10" fontWeight="600">3</text>
        <text x="160" y="125" textAnchor="middle" fill="#1565C0" fontSize="10" fontWeight="600">6</text>
        <text x="135" y="98" textAnchor="middle" fill="#1565C0" fontSize="10" fontWeight="600">9</text>

        {/* Clock center */}
        <circle cx="160" cy="95" r="4" fill="#1565C0" />

        {/* Clock hand - animated */}
        <g style={{ transformOrigin: '160px 95px', animation: 'curing-clock-hand 12s linear infinite' }}>
          <line x1="160" y1="95" x2="160" y2="70" stroke="#E53935" strokeWidth="3" strokeLinecap="round" />
        </g>

        {/* Time label */}
        <rect x="200" y="78" width="55" height="34" fill="#FFF3E0" stroke="#FF9800" strokeWidth="2" rx="4" />
        <text x="227" y="95" textAnchor="middle" fill="#E65100" fontSize="14" fontWeight="700">{t.waitTime}</text>
        <text x="227" y="108" textAnchor="middle" fill="#E65100" fontSize="10">{t.hours}</text>

        {/* Phase label */}
        <rect x="20" y="220" width="280" height="35" fill="#FFF3E0" stroke="#FF9800" strokeWidth="1" rx="4" />
        <text x="160" y="242" textAnchor="middle" fill="#E65100" fontSize="11" fontWeight="600">
          {t.phase1Label}
        </text>
      </svg>

      {/* PHASE 2: Cover with plastic */}
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 320 270"
        preserveAspectRatio="xMidYMid meet"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          animation: 'curing-phase2-container 12s infinite'
        }}
      >
        {/* Title */}
        <rect x="0" y="0" width="320" height="32" fill="#E3F2FD" />
        <text x="160" y="22" textAnchor="middle" fill="#1565C0" fontSize="14" fontWeight="600">
          {t.step2Title}
        </text>

        {/* Formwork sides */}
        <rect x="30" y="120" width="15" height="50" fill="#D4A574" stroke="#8B6914" strokeWidth="2" />
        <rect x="275" y="120" width="15" height="50" fill="#D4A574" stroke="#8B6914" strokeWidth="2" />

        {/* Concrete slab */}
        <rect x="45" y="145" width="230" height="25" fill="#BDBDBD" />
        <rect x="45" y="140" width="230" height="8" fill="#9E9E9E" />

        {/* Plastic sheeting being unrolled - animated */}
        <g style={{ animation: 'curing-plastic-unroll 12s ease-out infinite' }}>
          {/* Plastic sheet */}
          <rect x="45" y="130" width="230" height="18" fill="#81D4FA" opacity="0.6" />
          <rect x="45" y="130" width="230" height="2" fill="#29B6F6" />

          {/* Shine reflections on plastic */}
          <line x1="80" y1="132" x2="120" y2="132" stroke="white" strokeWidth="1" opacity="0.8" />
          <line x1="150" y1="135" x2="200" y2="135" stroke="white" strokeWidth="1" opacity="0.6" />
          <line x1="220" y1="133" x2="250" y2="133" stroke="white" strokeWidth="1" opacity="0.7" />

          {/* Roll at the end */}
          <ellipse cx="280" cy="139" rx="8" ry="12" fill="#29B6F6" />
          <ellipse cx="280" cy="139" rx="4" ry="8" fill="#81D4FA" />
        </g>

        {/* Weights/rocks holding plastic edges */}
        <ellipse cx="55" cy="172" rx="10" ry="6" fill="#757575" />
        <ellipse cx="265" cy="172" rx="10" ry="6" fill="#757575" />
        <ellipse cx="120" cy="172" rx="8" ry="5" fill="#616161" />
        <ellipse cx="200" cy="172" rx="8" ry="5" fill="#616161" />

        {/* Person placing plastic */}
        <g>
          {/* Body */}
          <circle cx="70" cy="75" r="12" fill="#FDD835" /> {/* Head with hard hat */}
          <ellipse cx="70" cy="73" rx="14" ry="8" fill="#FDD835" />
          <rect x="60" y="85" width="20" height="35" fill="#1976D2" rx="3" /> {/* Torso */}

          {/* Arms reaching toward plastic */}
          <line x1="65" y1="95" x2="45" y2="120" stroke="#1976D2" strokeWidth="6" strokeLinecap="round" />
          <circle cx="45" cy="120" r="5" fill="#FFCC80" />
        </g>

        {/* Phase label */}
        <rect x="20" y="210" width="280" height="50" fill="#E1F5FE" stroke="#03A9F4" strokeWidth="1" rx="4" />
        <text x="160" y="230" textAnchor="middle" fill="#0277BD" fontSize="11" fontWeight="600">
          {t.phase2Label1}
        </text>
        <text x="160" y="248" textAnchor="middle" fill="#0277BD" fontSize="10">
          {t.phase2Label2}
        </text>
      </svg>

      {/* PHASE 3: Spray with water */}
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 320 270"
        preserveAspectRatio="xMidYMid meet"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          animation: 'curing-phase3-container 12s infinite'
        }}
      >
        {/* Title */}
        <rect x="0" y="0" width="320" height="32" fill="#E3F2FD" />
        <text x="160" y="22" textAnchor="middle" fill="#1565C0" fontSize="14" fontWeight="600">
          {t.step3Title}
        </text>

        {/* Formwork sides */}
        <rect x="30" y="120" width="15" height="50" fill="#D4A574" stroke="#8B6914" strokeWidth="2" />
        <rect x="275" y="120" width="15" height="50" fill="#D4A574" stroke="#8B6914" strokeWidth="2" />

        {/* Concrete slab */}
        <rect x="45" y="145" width="230" height="25" fill="#BDBDBD" />
        <rect x="45" y="140" width="230" height="8" fill="#9E9E9E" />

        {/* Plastic covering */}
        <rect x="45" y="130" width="230" height="18" fill="#81D4FA" opacity="0.6" />
        <rect x="45" y="130" width="230" height="2" fill="#29B6F6" />

        {/* Hose and spray nozzle - animated movement */}
        <g style={{ animation: 'curing-spray-move 12s ease-in-out infinite' }}>
          {/* Hose */}
          <path d="M-20 60 Q40 60, 80 70 T130 80" stroke="#43A047" strokeWidth="8" fill="none" strokeLinecap="round" />

          {/* Spray nozzle */}
          <rect x="125" y="72" width="25" height="12" fill="#616161" rx="3" />
          <rect x="148" y="74" width="10" height="8" fill="#424242" rx="2" />

          {/* Water droplets - animated */}
          <g style={{ animation: 'curing-spray-water 12s infinite' }}>
            {[0, 15, 30, 45, 60].map((offset, i) => (
              <g key={`drop-${i}`} style={{ animation: `curing-droplets 0.5s ${i * 0.1}s infinite` }}>
                <circle cx={165 + offset * 0.5} cy={95 + offset * 0.3} r="3" fill="#29B6F6" opacity="0.8" />
              </g>
            ))}

            {/* Spray fan */}
            <path d="M158 78 L180 100 L200 110 L220 115 L200 120 L180 115 L158 85 Z" fill="#29B6F6" opacity="0.3" />
            <path d="M158 80 L175 105 L190 112 L175 118 L158 88 Z" fill="#29B6F6" opacity="0.4" />
          </g>
        </g>

        {/* Water puddles on plastic */}
        <ellipse cx="100" cy="138" rx="20" ry="3" fill="#29B6F6" opacity="0.5" />
        <ellipse cx="180" cy="137" rx="25" ry="4" fill="#29B6F6" opacity="0.5" />
        <ellipse cx="240" cy="138" rx="18" ry="3" fill="#29B6F6" opacity="0.5" />

        {/* Phase label */}
        <rect x="20" y="210" width="280" height="50" fill="#E1F5FE" stroke="#03A9F4" strokeWidth="1" rx="4" />
        <text x="160" y="230" textAnchor="middle" fill="#0277BD" fontSize="11" fontWeight="600">
          {t.phase3Label1}
        </text>
        <text x="160" y="248" textAnchor="middle" fill="#0277BD" fontSize="10">
          {t.phase3Label2}
        </text>
      </svg>

      {/* PHASE 4: Keep moist for 7 days */}
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 320 270"
        preserveAspectRatio="xMidYMid meet"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          animation: 'curing-phase4-container 12s infinite'
        }}
      >
        {/* Title */}
        <rect x="0" y="0" width="320" height="32" fill="#E3F2FD" />
        <text x="160" y="22" textAnchor="middle" fill="#1565C0" fontSize="14" fontWeight="600">
          {t.step4Title}
        </text>

        {/* Formwork sides */}
        <rect x="30" y="130" width="15" height="45" fill="#D4A574" stroke="#8B6914" strokeWidth="2" />
        <rect x="275" y="130" width="15" height="45" fill="#D4A574" stroke="#8B6914" strokeWidth="2" />

        {/* Cured concrete slab - slightly darker */}
        <rect x="45" y="150" width="230" height="25" fill="#9E9E9E" />
        <rect x="45" y="145" width="230" height="8" fill="#757575" />

        {/* Plastic covering with water */}
        <rect x="45" y="137" width="230" height="15" fill="#81D4FA" opacity="0.5" />
        <rect x="45" y="137" width="230" height="2" fill="#29B6F6" />

        {/* Calendar/Days display */}
        <rect x="85" y="50" width="150" height="75" fill="white" stroke="#1565C0" strokeWidth="2" rx="6" />
        <rect x="85" y="50" width="150" height="22" fill="#1565C0" rx="6" />
        <rect x="85" y="68" width="150" height="4" fill="#1565C0" />
        <text x="160" y="66" textAnchor="middle" fill="white" fontSize="12" fontWeight="600">{t.days7}</text>

        {/* Day boxes - 7 days */}
        {[0, 1, 2, 3, 4, 5, 6].map((day, i) => (
          <g key={`day-${i}`}>
            <rect
              x={95 + i * 19}
              y="80"
              width="16"
              height="16"
              fill={i < 7 ? '#4CAF50' : '#E0E0E0'}
              stroke="#388E3C"
              strokeWidth="1"
              rx="2"
              style={{ animation: `curing-day-counter 12s ${i * 0.3}s infinite` }}
            />
            <text
              x={103 + i * 19}
              y="92"
              textAnchor="middle"
              fill="white"
              fontSize="10"
              fontWeight="600"
            >
              {i + 1}
            </text>
          </g>
        ))}

        {/* Checkmark for completion */}
        <g style={{ animation: 'curing-day-counter 12s 2s infinite' }}>
          <circle cx="160" cy="115" r="8" fill="#4CAF50" />
          <path d="M155 115 L158 118 L166 110" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </g>

        {/* Water drops icon */}
        <g>
          <path d="M50 95 Q55 85, 60 95 Q55 105, 50 95" fill="#29B6F6" />
          <path d="M65 100 Q68 93, 73 100 Q68 107, 65 100" fill="#29B6F6" />
        </g>
        <g>
          <path d="M260 95 Q265 85, 270 95 Q265 105, 260 95" fill="#29B6F6" />
          <path d="M247 100 Q250 93, 255 100 Q250 107, 247 100" fill="#29B6F6" />
        </g>

        {/* Strength indicator */}
        <rect x="45" y="178" width="230" height="12" fill="#E0E0E0" rx="6" />
        <rect x="45" y="178" width="230" height="12" fill="#4CAF50" rx="6" style={{ animation: 'curing-day-counter 12s infinite' }} />
        <text x="160" y="187" textAnchor="middle" fill="white" fontSize="8" fontWeight="600">100%</text>

        {/* Phase label */}
        <rect x="20" y="210" width="280" height="50" fill="#E8F5E9" stroke="#4CAF50" strokeWidth="1" rx="4" />
        <text x="160" y="230" textAnchor="middle" fill="#2E7D32" fontSize="11" fontWeight="600">
          {t.phase4Label1}
        </text>
        <text x="160" y="248" textAnchor="middle" fill="#2E7D32" fontSize="10">
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
  'formwork': FormworkAnimation,
  'rebar': RebarAnimation,
  'concrete_pour': ConcretePourAnimation,
  'smoothing': ConcretePourAnimation,
  'curing': CuringAnimation,
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
