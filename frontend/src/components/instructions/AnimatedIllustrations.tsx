/**
 * Professional Construction Instruction Diagrams
 * Technical, clear illustrations showing proper construction techniques
 * Designed for professional use - no cartoon elements
 */

import React from 'react';
import { colors } from '../../theme/tokens';

interface AnimationProps {
  size?: number;
}

// Professional muted color palette
const palette = {
  // Earth tones
  soil: '#6B5B4F',
  soilDark: '#4A3F35',
  soilLight: '#8B7B6B',

  // Materials
  wood: '#C4A574',
  woodDark: '#8B6914',
  woodGrain: '#9E8050',

  concrete: '#858585',
  concreteDark: '#5A5A5A',
  concreteLight: '#A5A5A5',
  concreteWet: '#707575',

  gravel: '#9B8B7B',
  gravelDark: '#6B5B4B',

  metal: '#6B7B8B',
  metalDark: '#4B5B6B',
  metalLight: '#8B9BA5',

  rebar: '#4A3A30',
  rebarLight: '#6A5A50',

  // Utility colors
  grass: '#5B7B4B',

  // Annotation colors
  dimension: '#1565C0',
  dimensionBg: '#E3F2FD',
  arrow: '#D32F2F',
  highlight: colors.primary[600],

  // Neutral
  white: '#FFFFFF',
  black: '#2B2B2B',
  gray: '#757575',
};

// ============================================================================
// SITE PREPARATION - Cross-section showing excavation depth
// ============================================================================
export const SitePreparationAnimation: React.FC<AnimationProps> = ({ size = 280 }) => (
  <svg width={size} height={size * 0.75} viewBox="0 0 280 210">
    <defs>
      <pattern id="soilHatch" patternUnits="userSpaceOnUse" width="8" height="8">
        <path d="M0 8 L8 0" stroke={palette.soilDark} strokeWidth="0.5" fill="none" />
      </pattern>
      <pattern id="grassHatch" patternUnits="userSpaceOnUse" width="6" height="12">
        <path d="M3 12 L3 6 M3 12 Q2 8 1 5 M3 12 Q4 8 5 5" stroke={palette.grass} strokeWidth="0.8" fill="none" />
      </pattern>
      <marker id="arrowDown" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
        <path d="M0 0 L8 4 L0 8 Z" fill={palette.arrow} />
      </marker>
    </defs>

    {/* Title bar */}
    <rect x="0" y="0" width="280" height="24" fill={palette.dimensionBg} />
    <text x="140" y="16" textAnchor="middle" fill={palette.dimension} fontSize="11" fontWeight="600">CROSS-SECTION VIEW</text>

    {/* Original ground level with grass */}
    <rect x="0" y="70" width="280" height="8" fill={palette.grass} />
    <rect x="0" y="70" width="280" height="8" fill="url(#grassHatch)" />

    {/* Topsoil layer label */}
    <text x="250" y="65" fill={palette.gray} fontSize="8">TOPSOIL</text>

    {/* Excavated area */}
    <path d="M40 78 L40 140 L240 140 L240 78" fill={palette.soilLight} stroke={palette.soilDark} strokeWidth="1" />
    <rect x="40" y="78" width="200" height="62" fill="url(#soilHatch)" opacity="0.3" />

    {/* Undisturbed soil on sides */}
    <rect x="0" y="78" width="40" height="80" fill={palette.soil} />
    <rect x="0" y="78" width="40" height="80" fill="url(#soilHatch)" opacity="0.5" />
    <rect x="240" y="78" width="40" height="80" fill={palette.soil} />
    <rect x="240" y="78" width="40" height="80" fill="url(#soilHatch)" opacity="0.5" />

    {/* Cut line indicators */}
    <line x1="40" y1="70" x2="40" y2="145" stroke={palette.arrow} strokeWidth="2" strokeDasharray="4,2" />
    <line x1="240" y1="70" x2="240" y2="145" stroke={palette.arrow} strokeWidth="2" strokeDasharray="4,2" />

    {/* Depth dimension - right side */}
    <g transform="translate(255, 78)">
      <line x1="0" y1="0" x2="0" y2="62" stroke={palette.dimension} strokeWidth="1.5" />
      <line x1="-6" y1="0" x2="6" y2="0" stroke={palette.dimension} strokeWidth="1.5" />
      <line x1="-6" y1="62" x2="6" y2="62" stroke={palette.dimension} strokeWidth="1.5" />
      <rect x="8" y="22" width="45" height="18" fill={palette.dimensionBg} stroke={palette.dimension} strokeWidth="1" rx="2" />
      <text x="30" y="35" textAnchor="middle" fill={palette.dimension} fontSize="10" fontWeight="600">15-20cm</text>
    </g>

    {/* Width dimension - bottom */}
    <g transform="translate(40, 155)">
      <line x1="0" y1="0" x2="200" y2="0" stroke={palette.dimension} strokeWidth="1.5" />
      <line x1="0" y1="-6" x2="0" y2="6" stroke={palette.dimension} strokeWidth="1.5" />
      <line x1="200" y1="-6" x2="200" y2="6" stroke={palette.dimension} strokeWidth="1.5" />
      <rect x="75" y="5" width="50" height="16" fill={palette.dimensionBg} stroke={palette.dimension} strokeWidth="1" rx="2" />
      <text x="100" y="17" textAnchor="middle" fill={palette.dimension} fontSize="9" fontWeight="600">EXCAVATE</text>
    </g>

    {/* Removed material indication */}
    <g transform="translate(140, 100)">
      <path d="M0 -15 L0 15" stroke={palette.arrow} strokeWidth="2" markerEnd="url(#arrowDown)" />
      <text x="0" y="-22" textAnchor="middle" fill={palette.arrow} fontSize="9" fontWeight="600">REMOVE</text>
    </g>

    {/* Legend */}
    <g transform="translate(10, 180)">
      <rect x="0" y="0" width="12" height="12" fill={palette.grass} />
      <text x="18" y="10" fill={palette.gray} fontSize="8">Grass/topsoil to remove</text>
      <rect x="100" y="0" width="12" height="12" fill={palette.soilLight} stroke={palette.soilDark} strokeWidth="0.5" />
      <text x="118" y="10" fill={palette.gray} fontSize="8">Excavation area</text>
    </g>
  </svg>
);

// ============================================================================
// GRAVEL BASE - Cross-section showing compacted gravel layer
// ============================================================================
export const GravelBaseAnimation: React.FC<AnimationProps> = ({ size = 280 }) => (
  <svg width={size} height={size * 0.75} viewBox="0 0 280 210">
    <defs>
      <pattern id="gravelDots" patternUnits="userSpaceOnUse" width="12" height="12">
        <circle cx="3" cy="3" r="2" fill={palette.gravelDark} />
        <circle cx="9" cy="7" r="2.5" fill={palette.gravel} />
        <circle cx="5" cy="10" r="1.5" fill={palette.gravelDark} />
      </pattern>
      <marker id="arrowCompact" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
        <path d="M0 0 L6 3 L0 6 Z" fill={palette.dimension} />
      </marker>
    </defs>

    {/* Title bar */}
    <rect x="0" y="0" width="280" height="24" fill={palette.dimensionBg} />
    <text x="140" y="16" textAnchor="middle" fill={palette.dimension} fontSize="11" fontWeight="600">GRAVEL BASE LAYER</text>

    {/* Formwork sides */}
    <rect x="25" y="80" width="15" height="70" fill={palette.wood} stroke={palette.woodDark} strokeWidth="1" />
    <rect x="240" y="80" width="15" height="70" fill={palette.wood} stroke={palette.woodDark} strokeWidth="1" />

    {/* Soil base */}
    <rect x="40" y="130" width="200" height="30" fill={palette.soil} />

    {/* Gravel layer */}
    <rect x="40" y="100" width="200" height="30" fill={palette.gravel} />
    <rect x="40" y="100" width="200" height="30" fill="url(#gravelDots)" />

    {/* Compaction arrows */}
    {[70, 110, 150, 190].map((x, i) => (
      <g key={i} transform={`translate(${x}, 50)`}>
        <line x1="0" y1="0" x2="0" y2="40" stroke={palette.dimension} strokeWidth="2" />
        <polygon points="-5,35 5,35 0,48" fill={palette.dimension} />
      </g>
    ))}
    <text x="140" y="42" textAnchor="middle" fill={palette.dimension} fontSize="9" fontWeight="600">COMPACT</text>

    {/* Depth dimension */}
    <g transform="translate(260, 100)">
      <line x1="5" y1="0" x2="5" y2="30" stroke={palette.dimension} strokeWidth="1.5" />
      <line x1="0" y1="0" x2="10" y2="0" stroke={palette.dimension} strokeWidth="1.5" />
      <line x1="0" y1="30" x2="10" y2="30" stroke={palette.dimension} strokeWidth="1.5" />
      <rect x="12" y="8" width="30" height="14" fill={palette.dimensionBg} stroke={palette.dimension} strokeWidth="1" rx="2" />
      <text x="27" y="19" textAnchor="middle" fill={palette.dimension} fontSize="9" fontWeight="600">15cm</text>
    </g>

    {/* Layer labels */}
    <g transform="translate(10, 115)">
      <text fill={palette.white} fontSize="9" fontWeight="500">GRAVEL</text>
    </g>
    <g transform="translate(10, 145)">
      <text fill={palette.soilLight} fontSize="9" fontWeight="500">SUBSOIL</text>
    </g>

    {/* Plate compactor illustration */}
    <g transform="translate(100, 60)">
      <rect x="0" y="0" width="60" height="8" fill={palette.metalDark} rx="2" />
      <rect x="25" y="-25" width="10" height="25" fill={palette.metal} rx="1" />
      <ellipse cx="30" cy="-28" rx="12" ry="5" fill={palette.black} />
      <text x="30" y="20" textAnchor="middle" fill={palette.gray} fontSize="7">PLATE COMPACTOR</text>
    </g>

    {/* Legend */}
    <g transform="translate(10, 175)">
      <rect x="0" y="0" width="12" height="12" fill={palette.gravel} stroke={palette.gravelDark} strokeWidth="0.5" />
      <text x="18" y="10" fill={palette.gray} fontSize="8">Compacted gravel 15cm</text>
      <rect x="130" y="0" width="12" height="12" fill={palette.wood} stroke={palette.woodDark} strokeWidth="0.5" />
      <text x="148" y="10" fill={palette.gray} fontSize="8">Formwork</text>
    </g>
  </svg>
);

// ============================================================================
// FORMWORK - Side view showing board height and stakes
// ============================================================================
export const FormworkAnimation: React.FC<AnimationProps> = ({ size = 280 }) => (
  <svg width={size} height={size * 0.75} viewBox="0 0 280 210">
    <defs>
      <pattern id="woodGrain" patternUnits="userSpaceOnUse" width="4" height="20">
        <path d="M2 0 Q1 10 2 20" stroke={palette.woodGrain} strokeWidth="0.5" fill="none" />
      </pattern>
    </defs>

    {/* Title bar */}
    <rect x="0" y="0" width="280" height="24" fill={palette.dimensionBg} />
    <text x="140" y="16" textAnchor="middle" fill={palette.dimension} fontSize="11" fontWeight="600">FORMWORK SETUP - SIDE VIEW</text>

    {/* Ground/gravel base */}
    <rect x="0" y="145" width="280" height="25" fill={palette.gravel} />
    <text x="140" y="160" textAnchor="middle" fill={palette.white} fontSize="8">GRAVEL BASE</text>

    {/* Left formwork board */}
    <g transform="translate(40, 100)">
      <rect x="0" y="0" width="18" height="45" fill={palette.wood} stroke={palette.woodDark} strokeWidth="1" />
      <rect x="0" y="0" width="18" height="45" fill="url(#woodGrain)" opacity="0.5" />
      {/* Stake behind board */}
      <rect x="-10" y="10" width="10" height="55" fill={palette.woodDark} stroke={palette.black} strokeWidth="0.5" />
      <polygon points="-10,65 0,65 -5,80" fill={palette.woodDark} stroke={palette.black} strokeWidth="0.5" />
    </g>

    {/* Right formwork board */}
    <g transform="translate(222, 100)">
      <rect x="0" y="0" width="18" height="45" fill={palette.wood} stroke={palette.woodDark} strokeWidth="1" />
      <rect x="0" y="0" width="18" height="45" fill="url(#woodGrain)" opacity="0.5" />
      {/* Stake behind board */}
      <rect x="18" y="10" width="10" height="55" fill={palette.woodDark} stroke={palette.black} strokeWidth="0.5" />
      <polygon points="18,65 28,65 23,80" fill={palette.woodDark} stroke={palette.black} strokeWidth="0.5" />
    </g>

    {/* String line between boards */}
    <line x1="58" y1="105" x2="222" y2="105" stroke={palette.arrow} strokeWidth="1.5" />
    <text x="140" y="98" textAnchor="middle" fill={palette.arrow} fontSize="8">STRING LINE</text>

    {/* Height dimension - left side */}
    <g transform="translate(15, 100)">
      <line x1="0" y1="0" x2="0" y2="45" stroke={palette.dimension} strokeWidth="1.5" />
      <line x1="-5" y1="0" x2="5" y2="0" stroke={palette.dimension} strokeWidth="1.5" />
      <line x1="-5" y1="45" x2="5" y2="45" stroke={palette.dimension} strokeWidth="1.5" />
      <rect x="-35" y="15" width="30" height="16" fill={palette.dimensionBg} stroke={palette.dimension} strokeWidth="1" rx="2" />
      <text x="-20" y="27" textAnchor="middle" fill={palette.dimension} fontSize="10" fontWeight="700">15cm</text>
    </g>

    {/* Level indicator */}
    <g transform="translate(120, 75)">
      <rect x="0" y="0" width="60" height="16" fill="#FFD54F" stroke="#F9A825" strokeWidth="1" rx="2" />
      <rect x="20" y="4" width="20" height="8" fill="#81D4FA" stroke="#0288D1" strokeWidth="0.5" rx="1" />
      <circle cx="30" cy="8" r="2.5" fill="#4CAF50" />
      <text x="30" y="28" textAnchor="middle" fill={palette.gray} fontSize="7">LEVEL</text>
    </g>

    {/* Width dimension - bottom */}
    <g transform="translate(58, 175)">
      <line x1="0" y1="0" x2="164" y2="0" stroke={palette.dimension} strokeWidth="1.5" />
      <line x1="0" y1="-5" x2="0" y2="5" stroke={palette.dimension} strokeWidth="1.5" />
      <line x1="164" y1="-5" x2="164" y2="5" stroke={palette.dimension} strokeWidth="1.5" />
      <rect x="60" y="5" width="45" height="14" fill={palette.dimensionBg} stroke={palette.dimension} strokeWidth="1" rx="2" />
      <text x="82" y="15" textAnchor="middle" fill={palette.dimension} fontSize="8" fontWeight="600">SLAB WIDTH</text>
    </g>

    {/* Annotations */}
    <g transform="translate(30, 55)">
      <line x1="30" y1="0" x2="30" y2="35" stroke={palette.gray} strokeWidth="0.5" strokeDasharray="2,2" />
      <text x="30" y="-5" textAnchor="middle" fill={palette.gray} fontSize="7">BOARD</text>
    </g>
    <g transform="translate(20, 55)">
      <line x1="0" y1="0" x2="0" y2="60" stroke={palette.gray} strokeWidth="0.5" strokeDasharray="2,2" />
      <text x="0" y="-5" textAnchor="middle" fill={palette.gray} fontSize="7">STAKE</text>
    </g>
  </svg>
);

// ============================================================================
// REBAR GRID - Top view showing grid pattern and spacing
// ============================================================================
export const RebarAnimation: React.FC<AnimationProps> = ({ size = 280 }) => (
  <svg width={size} height={size * 0.75} viewBox="0 0 280 210">
    {/* Title bar */}
    <rect x="0" y="0" width="280" height="24" fill={palette.dimensionBg} />
    <text x="140" y="16" textAnchor="middle" fill={palette.dimension} fontSize="11" fontWeight="600">REBAR GRID - TOP VIEW</text>

    {/* Formwork outline */}
    <rect x="35" y="35" width="210" height="140" fill={palette.concreteLight} stroke={palette.woodDark} strokeWidth="8" />

    {/* Horizontal rebars */}
    {[55, 90, 125, 160].map((y, i) => (
      <g key={`h${i}`}>
        <rect x="45" y={y} width="190" height="5" fill={palette.rebar} rx="2" />
        <rect x="45" y={y} width="190" height="2" fill={palette.rebarLight} rx="1" />
      </g>
    ))}

    {/* Vertical rebars */}
    {[60, 95, 130, 165, 200].map((x, i) => (
      <g key={`v${i}`}>
        <rect x={x} y="45" width="5" height="120" fill={palette.rebar} rx="2" />
        <rect x={x} y="45" width="2" height="120" fill={palette.rebarLight} rx="1" />
      </g>
    ))}

    {/* Wire tie indicators at intersections */}
    {[55, 90, 125, 160].flatMap((y) =>
      [60, 95, 130, 165, 200].map((x) => (
        <circle key={`t${x}${y}`} cx={x + 2.5} cy={y + 2.5} r="4" fill="none" stroke={palette.metalDark} strokeWidth="1.5" />
      ))
    )}

    {/* Grid spacing dimension - horizontal */}
    <g transform="translate(60, 182)">
      <line x1="0" y1="0" x2="35" y2="0" stroke={palette.dimension} strokeWidth="1.5" />
      <line x1="0" y1="-4" x2="0" y2="4" stroke={palette.dimension} strokeWidth="1.5" />
      <line x1="35" y1="-4" x2="35" y2="4" stroke={palette.dimension} strokeWidth="1.5" />
      <rect x="8" y="3" width="20" height="12" fill={palette.dimensionBg} stroke={palette.dimension} strokeWidth="1" rx="1" />
      <text x="18" y="12" textAnchor="middle" fill={palette.dimension} fontSize="8" fontWeight="600">15cm</text>
    </g>

    {/* Grid spacing dimension - second */}
    <g transform="translate(95, 182)">
      <line x1="0" y1="0" x2="35" y2="0" stroke={palette.dimension} strokeWidth="1.5" />
      <line x1="0" y1="-4" x2="0" y2="4" stroke={palette.dimension} strokeWidth="1.5" />
      <line x1="35" y1="-4" x2="35" y2="4" stroke={palette.dimension} strokeWidth="1.5" />
      <rect x="8" y="3" width="20" height="12" fill={palette.dimensionBg} stroke={palette.dimension} strokeWidth="1" rx="1" />
      <text x="18" y="12" textAnchor="middle" fill={palette.dimension} fontSize="8" fontWeight="600">15cm</text>
    </g>

    {/* Vertical spacing */}
    <g transform="translate(255, 55)">
      <line x1="0" y1="0" x2="0" y2="35" stroke={palette.dimension} strokeWidth="1.5" />
      <line x1="-4" y1="0" x2="4" y2="0" stroke={palette.dimension} strokeWidth="1.5" />
      <line x1="-4" y1="35" x2="4" y2="35" stroke={palette.dimension} strokeWidth="1.5" />
      <text x="12" y="20" fill={palette.dimension} fontSize="8" fontWeight="600">15cm</text>
    </g>

    {/* Legend */}
    <g transform="translate(140, 200)">
      <circle cx="0" cy="0" r="4" fill="none" stroke={palette.metalDark} strokeWidth="1.5" />
      <text x="10" y="3" fill={palette.gray} fontSize="8">= Wire tie at intersection</text>
    </g>
  </svg>
);

// ============================================================================
// CONCRETE POUR - Side view showing pour process
// ============================================================================
export const ConcretePourAnimation: React.FC<AnimationProps> = ({ size = 280 }) => (
  <svg width={size} height={size * 0.75} viewBox="0 0 280 210">
    <defs>
      <linearGradient id="concreteGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor={palette.concreteLight} />
        <stop offset="100%" stopColor={palette.concreteDark} />
      </linearGradient>
    </defs>

    {/* Title bar */}
    <rect x="0" y="0" width="280" height="24" fill={palette.dimensionBg} />
    <text x="140" y="16" textAnchor="middle" fill={palette.dimension} fontSize="11" fontWeight="600">CONCRETE POUR - SIDE VIEW</text>

    {/* Ground */}
    <rect x="0" y="170" width="280" height="40" fill={palette.soil} />

    {/* Formwork */}
    <rect x="80" y="130" width="15" height="45" fill={palette.wood} stroke={palette.woodDark} strokeWidth="1" />
    <rect x="220" y="130" width="15" height="45" fill={palette.wood} stroke={palette.woodDark} strokeWidth="1" />

    {/* Gravel base */}
    <rect x="95" y="155" width="125" height="15" fill={palette.gravel} />

    {/* Concrete already poured */}
    <rect x="95" y="140" width="70" height="15" fill="url(#concreteGrad)" />

    {/* Concrete being poured */}
    <path d="M170 50 Q175 80 172 100 Q170 115 173 135" stroke={palette.concrete} strokeWidth="20" fill="none" strokeLinecap="round" />

    {/* Mixer chute */}
    <g transform="translate(120, 30)">
      <rect x="0" y="0" width="80" height="15" fill={palette.metal} stroke={palette.metalDark} strokeWidth="1" rx="2" transform="rotate(20)" />
      <text x="30" y="-5" fill={palette.gray} fontSize="8">CHUTE</text>
    </g>

    {/* Pour direction arrow */}
    <g transform="translate(160, 75)">
      <path d="M0 0 L0 30" stroke={palette.arrow} strokeWidth="2" />
      <polygon points="-5,25 5,25 0,35" fill={palette.arrow} />
    </g>

    {/* Rebar visible in section */}
    {[105, 130, 155, 180, 205].map((x, i) => (
      <circle key={i} cx={x} cy={148} r="3" fill={palette.rebar} stroke={palette.rebarLight} strokeWidth="0.5" />
    ))}

    {/* Thickness dimension */}
    <g transform="translate(240, 140)">
      <line x1="5" y1="0" x2="5" y2="15" stroke={palette.dimension} strokeWidth="1.5" />
      <line x1="0" y1="0" x2="10" y2="0" stroke={palette.dimension} strokeWidth="1.5" />
      <line x1="0" y1="15" x2="10" y2="15" stroke={palette.dimension} strokeWidth="1.5" />
      <rect x="12" y="2" width="28" height="12" fill={palette.dimensionBg} stroke={palette.dimension} strokeWidth="1" rx="1" />
      <text x="26" y="11" textAnchor="middle" fill={palette.dimension} fontSize="8" fontWeight="600">15cm</text>
    </g>

    {/* Labels */}
    <g transform="translate(100, 148)">
      <text fill={palette.white} fontSize="8" fontWeight="500">CONCRETE</text>
    </g>
    <g transform="translate(100, 168)">
      <text fill={palette.white} fontSize="7">GRAVEL</text>
    </g>

    {/* Instructions */}
    <g transform="translate(10, 195)">
      <text fill={palette.gray} fontSize="8">• Pour evenly across formwork</text>
    </g>
    <g transform="translate(150, 195)">
      <text fill={palette.gray} fontSize="8">• Use vibrator to remove air</text>
    </g>
  </svg>
);

// ============================================================================
// SMOOTHING - Shows float technique on concrete surface
// ============================================================================
export const SmoothingAnimation: React.FC<AnimationProps> = ({ size = 280 }) => (
  <svg width={size} height={size * 0.75} viewBox="0 0 280 210">
    {/* Title bar */}
    <rect x="0" y="0" width="280" height="24" fill={palette.dimensionBg} />
    <text x="140" y="16" textAnchor="middle" fill={palette.dimension} fontSize="11" fontWeight="600">SURFACE FINISHING - SIDE VIEW</text>

    {/* Formwork sides */}
    <rect x="20" y="100" width="12" height="60" fill={palette.wood} stroke={palette.woodDark} strokeWidth="1" />
    <rect x="248" y="100" width="12" height="60" fill={palette.wood} stroke={palette.woodDark} strokeWidth="1" />

    {/* Concrete surface - rough on left, smooth on right */}
    <rect x="32" y="115" width="216" height="45" fill={palette.concrete} />

    {/* Rough surface texture (left side) */}
    <g>
      {[40, 55, 70, 85, 100].map((x, i) => (
        <ellipse key={i} cx={x} cy={118 + (i % 2) * 3} rx="6" ry="2" fill={palette.concreteDark} opacity="0.5" />
      ))}
    </g>

    {/* Smooth surface (right side) */}
    <rect x="130" y="115" width="118" height="3" fill={palette.concreteLight} />

    {/* Float tool on surface */}
    <g transform="translate(110, 95)">
      {/* Float blade - flat on surface */}
      <rect x="0" y="17" width="50" height="6" fill={palette.wood} stroke={palette.woodDark} strokeWidth="1" rx="1" />

      {/* Handle */}
      <rect x="20" y="5" width="10" height="14" fill={palette.wood} stroke={palette.woodDark} strokeWidth="0.5" rx="1" />
      <rect x="22" y="-25" width="6" height="32" fill={palette.wood} stroke={palette.woodDark} strokeWidth="0.5" rx="1" />

      {/* Direction of movement */}
      <path d="M60 20 L80 20" stroke={palette.arrow} strokeWidth="2" />
      <polygon points="75,15 85,20 75,25" fill={palette.arrow} />
    </g>

    {/* Labels */}
    <g transform="translate(50, 138)">
      <text fill={palette.gray} fontSize="8">ROUGH</text>
    </g>
    <g transform="translate(180, 138)">
      <text fill={palette.gray} fontSize="8">SMOOTH</text>
    </g>

    {/* Float label */}
    <text x="135" y="85" textAnchor="middle" fill={palette.gray} fontSize="8">HAND FLOAT</text>

    {/* Technique instructions */}
    <g transform="translate(20, 175)">
      <rect x="0" y="0" width="240" height="30" fill={palette.dimensionBg} rx="3" />
      <text x="10" y="12" fill={palette.dimension} fontSize="8" fontWeight="500">TECHNIQUE:</text>
      <text x="10" y="24" fill={palette.gray} fontSize="8">Move float in sweeping arcs, keeping blade flat on surface</text>
    </g>
  </svg>
);

// ============================================================================
// MEASURING - Shows proper layout technique
// ============================================================================
export const MeasuringAnimation: React.FC<AnimationProps> = ({ size = 280 }) => (
  <svg width={size} height={size * 0.75} viewBox="0 0 280 210">
    {/* Title bar */}
    <rect x="0" y="0" width="280" height="24" fill={palette.dimensionBg} />
    <text x="140" y="16" textAnchor="middle" fill={palette.dimension} fontSize="11" fontWeight="600">SITE LAYOUT - TOP VIEW</text>

    {/* Ground area */}
    <rect x="20" y="40" width="240" height="130" fill={palette.grass} opacity="0.3" stroke={palette.grass} strokeWidth="1" />

    {/* Corner stakes */}
    <g transform="translate(40, 60)">
      <rect x="-5" y="-5" width="10" height="10" fill={palette.woodDark} stroke={palette.black} strokeWidth="1" />
      <text x="0" y="-12" textAnchor="middle" fill={palette.gray} fontSize="8">A</text>
    </g>
    <g transform="translate(240, 60)">
      <rect x="-5" y="-5" width="10" height="10" fill={palette.woodDark} stroke={palette.black} strokeWidth="1" />
      <text x="0" y="-12" textAnchor="middle" fill={palette.gray} fontSize="8">B</text>
    </g>
    <g transform="translate(40, 150)">
      <rect x="-5" y="-5" width="10" height="10" fill={palette.woodDark} stroke={palette.black} strokeWidth="1" />
      <text x="0" y="20" textAnchor="middle" fill={palette.gray} fontSize="8">C</text>
    </g>
    <g transform="translate(240, 150)">
      <rect x="-5" y="-5" width="10" height="10" fill={palette.woodDark} stroke={palette.black} strokeWidth="1" />
      <text x="0" y="20" textAnchor="middle" fill={palette.gray} fontSize="8">D</text>
    </g>

    {/* String lines */}
    <line x1="40" y1="60" x2="240" y2="60" stroke={palette.arrow} strokeWidth="1.5" />
    <line x1="40" y1="150" x2="240" y2="150" stroke={palette.arrow} strokeWidth="1.5" />
    <line x1="40" y1="60" x2="40" y2="150" stroke={palette.arrow} strokeWidth="1.5" />
    <line x1="240" y1="60" x2="240" y2="150" stroke={palette.arrow} strokeWidth="1.5" />

    {/* Diagonal for square check */}
    <line x1="40" y1="60" x2="240" y2="150" stroke={palette.dimension} strokeWidth="1" strokeDasharray="5,5" />
    <line x1="240" y1="60" x2="40" y2="150" stroke={palette.dimension} strokeWidth="1" strokeDasharray="5,5" />

    {/* Dimensions */}
    <g transform="translate(40, 175)">
      <line x1="0" y1="0" x2="200" y2="0" stroke={palette.dimension} strokeWidth="1.5" />
      <line x1="0" y1="-5" x2="0" y2="5" stroke={palette.dimension} strokeWidth="1.5" />
      <line x1="200" y1="-5" x2="200" y2="5" stroke={palette.dimension} strokeWidth="1.5" />
      <rect x="85" y="3" width="30" height="14" fill={palette.dimensionBg} stroke={palette.dimension} strokeWidth="1" rx="2" />
      <text x="100" y="13" textAnchor="middle" fill={palette.dimension} fontSize="9" fontWeight="600">5.0m</text>
    </g>

    <g transform="translate(255, 60)">
      <line x1="0" y1="0" x2="0" y2="90" stroke={palette.dimension} strokeWidth="1.5" />
      <line x1="-5" y1="0" x2="5" y2="0" stroke={palette.dimension} strokeWidth="1.5" />
      <line x1="-5" y1="90" x2="5" y2="90" stroke={palette.dimension} strokeWidth="1.5" />
      <rect x="7" y="38" width="25" height="14" fill={palette.dimensionBg} stroke={palette.dimension} strokeWidth="1" rx="2" />
      <text x="19" y="48" textAnchor="middle" fill={palette.dimension} fontSize="9" fontWeight="600">3.0m</text>
    </g>

    {/* Square check note */}
    <g transform="translate(130, 105)">
      <text fill={palette.dimension} fontSize="8" fontWeight="500" textAnchor="middle">DIAGONALS</text>
      <text fill={palette.dimension} fontSize="8" fontWeight="500" textAnchor="middle" y="12">MUST BE EQUAL</text>
    </g>

    {/* Legend */}
    <g transform="translate(20, 195)">
      <rect x="0" y="0" width="8" height="8" fill={palette.woodDark} />
      <text x="12" y="7" fill={palette.gray} fontSize="7">Corner stake</text>
      <line x1="70" y1="4" x2="90" y2="4" stroke={palette.arrow} strokeWidth="1.5" />
      <text x="95" y="7" fill={palette.gray} fontSize="7">String line</text>
      <line x1="150" y1="4" x2="170" y2="4" stroke={palette.dimension} strokeWidth="1" strokeDasharray="3,3" />
      <text x="175" y="7" fill={palette.gray} fontSize="7">Square check</text>
    </g>
  </svg>
);

// ============================================================================
// DIGGING - Cross-section for post holes
// ============================================================================
export const DiggingAnimation: React.FC<AnimationProps> = ({ size = 280 }) => (
  <svg width={size} height={size * 0.75} viewBox="0 0 280 210">
    <defs>
      <pattern id="soilHatch2" patternUnits="userSpaceOnUse" width="8" height="8">
        <path d="M0 8 L8 0" stroke={palette.soilDark} strokeWidth="0.5" fill="none" />
      </pattern>
    </defs>

    {/* Title bar */}
    <rect x="0" y="0" width="280" height="24" fill={palette.dimensionBg} />
    <text x="140" y="16" textAnchor="middle" fill={palette.dimension} fontSize="11" fontWeight="600">POST HOLE - CROSS-SECTION</text>

    {/* Ground surface */}
    <rect x="0" y="60" width="280" height="10" fill={palette.grass} />
    <line x1="0" y1="70" x2="280" y2="70" stroke={palette.soilDark} strokeWidth="1" />

    {/* Soil */}
    <rect x="0" y="70" width="280" height="110" fill={palette.soil} />
    <rect x="0" y="70" width="280" height="110" fill="url(#soilHatch2)" opacity="0.3" />

    {/* Post hole */}
    <path d="M100 70 L100 155 Q100 165 115 165 L165 165 Q180 165 180 155 L180 70" fill={palette.soilLight} stroke={palette.soilDark} strokeWidth="2" />

    {/* Hole width dimension */}
    <g transform="translate(100, 45)">
      <line x1="0" y1="0" x2="80" y2="0" stroke={palette.dimension} strokeWidth="1.5" />
      <line x1="0" y1="-5" x2="0" y2="5" stroke={palette.dimension} strokeWidth="1.5" />
      <line x1="80" y1="-5" x2="80" y2="5" stroke={palette.dimension} strokeWidth="1.5" />
      <rect x="25" y="-15" width="30" height="14" fill={palette.dimensionBg} stroke={palette.dimension} strokeWidth="1" rx="2" />
      <text x="40" y="-5" textAnchor="middle" fill={palette.dimension} fontSize="9" fontWeight="600">30cm</text>
    </g>

    {/* Depth dimension */}
    <g transform="translate(195, 70)">
      <line x1="0" y1="0" x2="0" y2="95" stroke={palette.dimension} strokeWidth="1.5" />
      <line x1="-5" y1="0" x2="5" y2="0" stroke={palette.dimension} strokeWidth="1.5" />
      <line x1="-5" y1="95" x2="5" y2="95" stroke={palette.dimension} strokeWidth="1.5" />
      <rect x="8" y="38" width="30" height="18" fill={palette.dimensionBg} stroke={palette.dimension} strokeWidth="1" rx="2" />
      <text x="23" y="51" textAnchor="middle" fill={palette.dimension} fontSize="10" fontWeight="700">60cm</text>
    </g>

    {/* Post-hole digger tool illustration */}
    <g transform="translate(50, 80)">
      <rect x="15" y="-50" width="8" height="100" fill={palette.wood} stroke={palette.woodDark} strokeWidth="1" rx="2" />
      <rect x="30" y="-50" width="8" height="100" fill={palette.wood} stroke={palette.woodDark} strokeWidth="1" rx="2" />
      {/* Blades */}
      <path d="M10 50 Q5 60 15 70 Q25 75 25 60 Q20 50 10 50" fill={palette.metal} stroke={palette.metalDark} strokeWidth="1" />
      <path d="M43 50 Q48 60 38 70 Q28 75 28 60 Q33 50 43 50" fill={palette.metal} stroke={palette.metalDark} strokeWidth="1" />
      <text x="26" y="-55" textAnchor="middle" fill={palette.gray} fontSize="7">POST-HOLE</text>
      <text x="26" y="-45" textAnchor="middle" fill={palette.gray} fontSize="7">DIGGER</text>
    </g>

    {/* Excavated soil pile */}
    <g transform="translate(220, 140)">
      <ellipse cx="0" cy="0" rx="30" ry="15" fill={palette.soil} stroke={palette.soilDark} strokeWidth="1" />
      <text x="0" y="25" textAnchor="middle" fill={palette.gray} fontSize="7">EXCAVATED SOIL</text>
    </g>

    {/* Note */}
    <g transform="translate(10, 190)">
      <text fill={palette.gray} fontSize="8">• Hole depth = 1/3 of total post length • Keep sides vertical</text>
    </g>
  </svg>
);

// ============================================================================
// POST INSTALL - Shows post placement and leveling
// ============================================================================
export const PostInstallAnimation: React.FC<AnimationProps> = ({ size = 280 }) => (
  <svg width={size} height={size * 0.75} viewBox="0 0 280 210">
    {/* Title bar */}
    <rect x="0" y="0" width="280" height="24" fill={palette.dimensionBg} />
    <text x="140" y="16" textAnchor="middle" fill={palette.dimension} fontSize="11" fontWeight="600">POST INSTALLATION - FRONT VIEW</text>

    {/* Ground surface */}
    <rect x="0" y="130" width="280" height="10" fill={palette.grass} />
    <rect x="0" y="140" width="280" height="50" fill={palette.soil} />

    {/* Post hole */}
    <rect x="105" y="140" width="70" height="50" fill={palette.soilLight} />

    {/* Concrete footing */}
    <rect x="110" y="155" width="60" height="35" fill={palette.concrete} stroke={palette.concreteDark} strokeWidth="1" />

    {/* Metal post */}
    <rect x="130" y="40" width="20" height="150" fill={palette.metal} stroke={palette.metalDark} strokeWidth="1" />
    <rect x="127" y="35" width="26" height="10" fill={palette.metalDark} stroke={palette.black} strokeWidth="0.5" rx="1" />

    {/* Level on post */}
    <g transform="translate(155, 70)">
      <rect x="0" y="0" width="60" height="15" fill="#FFD54F" stroke="#F9A825" strokeWidth="1" rx="2" />
      <rect x="20" y="3" width="20" height="9" fill="#81D4FA" stroke="#0288D1" strokeWidth="0.5" rx="1" />
      <circle cx="30" cy="7.5" r="2" fill="#4CAF50" />
    </g>
    <text x="185" y="100" textAnchor="middle" fill={palette.gray} fontSize="7">LEVEL</text>

    {/* Plumb line indicator */}
    <line x1="140" y1="30" x2="140" y2="195" stroke={palette.dimension} strokeWidth="1" strokeDasharray="4,4" />
    <text x="145" y="28" fill={palette.dimension} fontSize="7">PLUMB</text>

    {/* Vertical check arrows */}
    <g transform="translate(90, 85)">
      <line x1="0" y1="0" x2="0" y2="50" stroke={palette.arrow} strokeWidth="1.5" />
      <polygon points="-4,5 4,5 0,0" fill={palette.arrow} />
      <polygon points="-4,45 4,45 0,50" fill={palette.arrow} />
      <text x="-8" y="28" textAnchor="end" fill={palette.gray} fontSize="7" transform="rotate(-90, -8, 28)">VERTICAL</text>
    </g>

    {/* Concrete label */}
    <text x="140" y="175" textAnchor="middle" fill={palette.white} fontSize="8">CONCRETE</text>

    {/* Instructions */}
    <g transform="translate(10, 195)">
      <text fill={palette.gray} fontSize="8">• Check plumb on 2 adjacent faces • Brace until concrete sets</text>
    </g>
  </svg>
);

// ============================================================================
// CONCRETE MIXING - Shows proper mixing setup
// ============================================================================
export const ConcreteMixingAnimation: React.FC<AnimationProps> = ({ size = 280 }) => (
  <svg width={size} height={size * 0.75} viewBox="0 0 280 210">
    {/* Title bar */}
    <rect x="0" y="0" width="280" height="24" fill={palette.dimensionBg} />
    <text x="140" y="16" textAnchor="middle" fill={palette.dimension} fontSize="11" fontWeight="600">CONCRETE MIXING</text>

    {/* Ground */}
    <rect x="0" y="170" width="280" height="40" fill={palette.soil} />

    {/* Mixer drum */}
    <g transform="translate(80, 50)">
      <ellipse cx="50" cy="20" rx="45" ry="20" fill={palette.metalLight} stroke={palette.metalDark} strokeWidth="2" />
      <rect x="5" y="20" width="90" height="70" fill={palette.metal} stroke={palette.metalDark} strokeWidth="2" />
      <ellipse cx="50" cy="90" rx="45" ry="20" fill={palette.metalDark} stroke={palette.black} strokeWidth="1" />

      {/* Opening */}
      <ellipse cx="50" cy="20" rx="30" ry="12" fill={palette.concreteDark} />

      {/* Drum stripes */}
      <path d="M15 40 Q35 25 50 40 Q65 55 85 40" stroke={palette.metalDark} strokeWidth="3" fill="none" />
      <path d="M15 60 Q35 45 50 60 Q65 75 85 60" stroke={palette.metalDark} strokeWidth="3" fill="none" />
    </g>

    {/* Chute */}
    <g transform="translate(170, 80)">
      <rect x="0" y="0" width="60" height="12" fill={palette.metal} stroke={palette.metalDark} strokeWidth="1" rx="2" transform="rotate(30)" />
    </g>

    {/* Wheelbarrow */}
    <g transform="translate(195, 120)">
      <path d="M0 30 L50 30 L55 50 L-5 50 Z" fill={palette.metal} stroke={palette.metalDark} strokeWidth="1" />
      <ellipse cx="25" cy="25" rx="22" ry="12" fill={palette.metalLight} />
      <ellipse cx="25" cy="22" rx="18" ry="8" fill={palette.concrete} />
      <circle cx="25" cy="58" r="10" fill={palette.black} />
      <circle cx="25" cy="58" r="5" fill={palette.metal} />
      <text x="25" y="80" textAnchor="middle" fill={palette.gray} fontSize="7">WHEELBARROW</text>
    </g>

    {/* Mixer wheels */}
    <circle cx="100" cy="165" r="12" fill={palette.black} />
    <circle cx="100" cy="165" r="6" fill={palette.metal} />
    <circle cx="160" cy="165" r="12" fill={palette.black} />
    <circle cx="160" cy="165" r="6" fill={palette.metal} />

    {/* Mix ratio diagram */}
    <g transform="translate(15, 50)">
      <rect x="0" y="0" width="50" height="100" fill={palette.dimensionBg} stroke={palette.dimension} strokeWidth="1" rx="3" />
      <text x="25" y="15" textAnchor="middle" fill={palette.dimension} fontSize="8" fontWeight="600">MIX RATIO</text>
      <line x1="5" y1="20" x2="45" y2="20" stroke={palette.dimension} strokeWidth="0.5" />

      <rect x="10" y="28" width="12" height="12" fill={palette.concrete} />
      <text x="28" y="38" fill={palette.gray} fontSize="7">1 Cement</text>

      <rect x="10" y="45" width="12" height="12" fill="#F5DEB3" />
      <text x="28" y="55" fill={palette.gray} fontSize="7">2 Sand</text>

      <rect x="10" y="62" width="12" height="12" fill={palette.gravel} />
      <text x="28" y="72" fill={palette.gray} fontSize="7">3 Gravel</text>

      <rect x="10" y="79" width="12" height="12" fill="#B3E5FC" />
      <text x="28" y="89" fill={palette.gray} fontSize="7">½ Water</text>
    </g>

    {/* Instructions */}
    <g transform="translate(10, 190)">
      <text fill={palette.gray} fontSize="8">• Mix dry ingredients first • Add water gradually • Mix until uniform color</text>
    </g>
  </svg>
);

// ============================================================================
// PANEL ATTACH - Shows fence panel installation
// ============================================================================
export const PanelAttachAnimation: React.FC<AnimationProps> = ({ size = 280 }) => (
  <svg width={size} height={size * 0.75} viewBox="0 0 280 210">
    {/* Title bar */}
    <rect x="0" y="0" width="280" height="24" fill={palette.dimensionBg} />
    <text x="140" y="16" textAnchor="middle" fill={palette.dimension} fontSize="11" fontWeight="600">PANEL ATTACHMENT - FRONT VIEW</text>

    {/* Ground */}
    <rect x="0" y="165" width="280" height="45" fill={palette.grass} />

    {/* Left post */}
    <rect x="30" y="40" width="18" height="130" fill={palette.metal} stroke={palette.metalDark} strokeWidth="1" />
    <rect x="27" y="35" width="24" height="10" fill={palette.metalDark} rx="1" />

    {/* Right post */}
    <rect x="232" y="40" width="18" height="130" fill={palette.metal} stroke={palette.metalDark} strokeWidth="1" />
    <rect x="229" y="35" width="24" height="10" fill={palette.metalDark} rx="1" />

    {/* Horizontal rails */}
    <rect x="48" y="55" width="184" height="10" fill={palette.wood} stroke={palette.woodDark} strokeWidth="1" />
    <rect x="48" y="100" width="184" height="10" fill={palette.wood} stroke={palette.woodDark} strokeWidth="1" />
    <rect x="48" y="145" width="184" height="10" fill={palette.wood} stroke={palette.woodDark} strokeWidth="1" />

    {/* Vertical slats */}
    {[60, 85, 110, 135, 160, 185, 210].map((x, i) => (
      <rect key={i} x={x} y="50" width="8" height="110" fill={palette.wood} stroke={palette.woodDark} strokeWidth="0.5" />
    ))}

    {/* Bracket/screw detail */}
    <g transform="translate(48, 58)">
      <circle cx="0" cy="0" r="4" fill={palette.metalDark} stroke={palette.black} strokeWidth="0.5" />
      <line x1="-2" y1="0" x2="2" y2="0" stroke={palette.metalLight} strokeWidth="1" />
    </g>
    <g transform="translate(48, 103)">
      <circle cx="0" cy="0" r="4" fill={palette.metalDark} stroke={palette.black} strokeWidth="0.5" />
      <line x1="-2" y1="0" x2="2" y2="0" stroke={palette.metalLight} strokeWidth="1" />
    </g>
    <g transform="translate(48, 148)">
      <circle cx="0" cy="0" r="4" fill={palette.metalDark} stroke={palette.black} strokeWidth="0.5" />
      <line x1="-2" y1="0" x2="2" y2="0" stroke={palette.metalLight} strokeWidth="1" />
    </g>

    {/* Screw callout */}
    <g transform="translate(55, 58)">
      <line x1="0" y1="0" x2="25" y2="-15" stroke={palette.gray} strokeWidth="0.5" />
      <text x="28" y="-12" fill={palette.gray} fontSize="7">SCREWS</text>
    </g>

    {/* Post spacing dimension */}
    <g transform="translate(48, 180)">
      <line x1="0" y1="0" x2="184" y2="0" stroke={palette.dimension} strokeWidth="1.5" />
      <line x1="0" y1="-5" x2="0" y2="5" stroke={palette.dimension} strokeWidth="1.5" />
      <line x1="184" y1="-5" x2="184" y2="5" stroke={palette.dimension} strokeWidth="1.5" />
      <rect x="70" y="3" width="45" height="14" fill={palette.dimensionBg} stroke={palette.dimension} strokeWidth="1" rx="2" />
      <text x="92" y="13" textAnchor="middle" fill={palette.dimension} fontSize="8" fontWeight="600">PANEL WIDTH</text>
    </g>

    {/* Height dimension */}
    <g transform="translate(260, 55)">
      <line x1="0" y1="0" x2="0" y2="100" stroke={palette.dimension} strokeWidth="1.5" />
      <line x1="-5" y1="0" x2="5" y2="0" stroke={palette.dimension} strokeWidth="1.5" />
      <line x1="-5" y1="100" x2="5" y2="100" stroke={palette.dimension} strokeWidth="1.5" />
      <text x="10" y="55" fill={palette.dimension} fontSize="8" fontWeight="600" transform="rotate(90, 10, 55)">HEIGHT</text>
    </g>
  </svg>
);

// ============================================================================
// GATE INSTALL - Shows gate hanging detail
// ============================================================================
export const GateInstallAnimation: React.FC<AnimationProps> = ({ size = 280 }) => (
  <svg width={size} height={size * 0.75} viewBox="0 0 280 210">
    {/* Title bar */}
    <rect x="0" y="0" width="280" height="24" fill={palette.dimensionBg} />
    <text x="140" y="16" textAnchor="middle" fill={palette.dimension} fontSize="11" fontWeight="600">GATE INSTALLATION - FRONT VIEW</text>

    {/* Ground */}
    <rect x="0" y="170" width="280" height="40" fill={palette.grass} />

    {/* Hinge post */}
    <rect x="40" y="40" width="22" height="135" fill={palette.metal} stroke={palette.metalDark} strokeWidth="1" />
    <rect x="37" y="35" width="28" height="10" fill={palette.metalDark} rx="1" />

    {/* Latch post */}
    <rect x="218" y="40" width="22" height="135" fill={palette.metal} stroke={palette.metalDark} strokeWidth="1" />
    <rect x="215" y="35" width="28" height="10" fill={palette.metalDark} rx="1" />

    {/* Gate frame */}
    <rect x="70" y="55" width="100" height="110" fill="none" stroke={palette.metalDark} strokeWidth="5" rx="2" />

    {/* Gate rails */}
    <rect x="70" y="80" width="100" height="4" fill={palette.metal} />
    <rect x="70" y="110" width="100" height="4" fill={palette.metal} />
    <rect x="70" y="140" width="100" height="4" fill={palette.metal} />

    {/* Diagonal brace */}
    <line x1="73" y1="162" x2="167" y2="58" stroke={palette.metal} strokeWidth="4" />

    {/* Hinges */}
    <g transform="translate(55, 70)">
      <rect x="0" y="0" width="20" height="15" fill={palette.metalDark} stroke={palette.black} strokeWidth="0.5" rx="2" />
      <circle cx="10" cy="7.5" r="4" fill={palette.metal} stroke={palette.black} strokeWidth="0.5" />
      <text x="30" y="10" fill={palette.gray} fontSize="7">HINGE</text>
    </g>
    <g transform="translate(55, 145)">
      <rect x="0" y="0" width="20" height="15" fill={palette.metalDark} stroke={palette.black} strokeWidth="0.5" rx="2" />
      <circle cx="10" cy="7.5" r="4" fill={palette.metal} stroke={palette.black} strokeWidth="0.5" />
    </g>

    {/* Latch */}
    <g transform="translate(170, 105)">
      <rect x="0" y="0" width="35" height="20" fill={palette.metalDark} stroke={palette.black} strokeWidth="0.5" rx="2" />
      <circle cx="25" cy="10" r="6" fill="#FFD54F" stroke="#F9A825" strokeWidth="1" />
      <text x="17" y="32" textAnchor="middle" fill={palette.gray} fontSize="7">LATCH</text>
    </g>

    {/* Ground clearance */}
    <g transform="translate(120, 165)">
      <line x1="0" y1="0" x2="0" y2="8" stroke={palette.dimension} strokeWidth="1.5" />
      <line x1="-8" y1="0" x2="8" y2="0" stroke={palette.dimension} strokeWidth="1.5" />
      <line x1="-8" y1="8" x2="8" y2="8" stroke={palette.dimension} strokeWidth="1.5" />
      <text x="15" y="6" fill={palette.dimension} fontSize="7">5cm GAP</text>
    </g>

    {/* Gate width */}
    <g transform="translate(70, 185)">
      <line x1="0" y1="0" x2="100" y2="0" stroke={palette.dimension} strokeWidth="1.5" />
      <line x1="0" y1="-5" x2="0" y2="5" stroke={palette.dimension} strokeWidth="1.5" />
      <line x1="100" y1="-5" x2="100" y2="5" stroke={palette.dimension} strokeWidth="1.5" />
      <rect x="35" y="3" width="30" height="14" fill={palette.dimensionBg} stroke={palette.dimension} strokeWidth="1" rx="2" />
      <text x="50" y="13" textAnchor="middle" fill={palette.dimension} fontSize="8" fontWeight="600">WIDTH</text>
    </g>
  </svg>
);

// ============================================================================
// LEVELING - Shows level usage
// ============================================================================
export const LevelingAnimation: React.FC<AnimationProps> = ({ size = 280 }) => (
  <svg width={size} height={size * 0.75} viewBox="0 0 280 210">
    {/* Title bar */}
    <rect x="0" y="0" width="280" height="24" fill={palette.dimensionBg} />
    <text x="140" y="16" textAnchor="middle" fill={palette.dimension} fontSize="11" fontWeight="600">USING A SPIRIT LEVEL</text>

    {/* Surface */}
    <rect x="30" y="120" width="220" height="12" fill={palette.metal} stroke={palette.metalDark} strokeWidth="1" rx="2" />

    {/* Level tool - large detail */}
    <g transform="translate(60, 75)">
      <rect x="0" y="0" width="160" height="35" fill="#FFD54F" stroke="#F9A825" strokeWidth="2" rx="4" />

      {/* Level vial - center */}
      <rect x="60" y="8" width="40" height="19" fill="#B3E5FC" stroke="#0288D1" strokeWidth="1" rx="3" />
      <line x1="78" y1="8" x2="78" y2="27" stroke="#0288D1" strokeWidth="1" />
      <line x1="82" y1="8" x2="82" y2="27" stroke="#0288D1" strokeWidth="1" />
      <circle cx="80" cy="17.5" r="5" fill="#4CAF50" />

      {/* End markings */}
      <line x1="10" y1="10" x2="10" y2="25" stroke="#F9A825" strokeWidth="1" />
      <line x1="150" y1="10" x2="150" y2="25" stroke="#F9A825" strokeWidth="1" />
    </g>

    {/* Bubble position diagrams */}
    <g transform="translate(30, 145)">
      <rect x="0" y="0" width="65" height="55" fill={palette.dimensionBg} stroke={palette.dimension} strokeWidth="1" rx="3" />
      <text x="32" y="15" textAnchor="middle" fill={palette.dimension} fontSize="8" fontWeight="600">LEVEL</text>
      <rect x="15" y="22" width="35" height="15" fill="#B3E5FC" stroke="#0288D1" strokeWidth="1" rx="2" />
      <line x1="31" y1="22" x2="31" y2="37" stroke="#0288D1" strokeWidth="1" />
      <line x1="34" y1="22" x2="34" y2="37" stroke="#0288D1" strokeWidth="1" />
      <circle cx="32.5" cy="29.5" r="4" fill="#4CAF50" />
      <text x="32" y="50" textAnchor="middle" fill="#4CAF50" fontSize="8" fontWeight="600">✓ CORRECT</text>
    </g>

    <g transform="translate(108, 145)">
      <rect x="0" y="0" width="65" height="55" fill={palette.dimensionBg} stroke={palette.dimension} strokeWidth="1" rx="3" />
      <text x="32" y="15" textAnchor="middle" fill={palette.dimension} fontSize="8" fontWeight="600">HIGH LEFT</text>
      <rect x="15" y="22" width="35" height="15" fill="#B3E5FC" stroke="#0288D1" strokeWidth="1" rx="2" />
      <line x1="31" y1="22" x2="31" y2="37" stroke="#0288D1" strokeWidth="1" />
      <line x1="34" y1="22" x2="34" y2="37" stroke="#0288D1" strokeWidth="1" />
      <circle cx="24" cy="29.5" r="4" fill={palette.arrow} />
      <text x="32" y="50" textAnchor="middle" fill={palette.arrow} fontSize="8" fontWeight="600">✗ ADJUST</text>
    </g>

    <g transform="translate(186, 145)">
      <rect x="0" y="0" width="65" height="55" fill={palette.dimensionBg} stroke={palette.dimension} strokeWidth="1" rx="3" />
      <text x="32" y="15" textAnchor="middle" fill={palette.dimension} fontSize="8" fontWeight="600">HIGH RIGHT</text>
      <rect x="15" y="22" width="35" height="15" fill="#B3E5FC" stroke="#0288D1" strokeWidth="1" rx="2" />
      <line x1="31" y1="22" x2="31" y2="37" stroke="#0288D1" strokeWidth="1" />
      <line x1="34" y1="22" x2="34" y2="37" stroke="#0288D1" strokeWidth="1" />
      <circle cx="41" cy="29.5" r="4" fill={palette.arrow} />
      <text x="32" y="50" textAnchor="middle" fill={palette.arrow} fontSize="8" fontWeight="600">✗ ADJUST</text>
    </g>
  </svg>
);

// ============================================================================
// CURING - Shows concrete curing process
// ============================================================================
export const CuringAnimation: React.FC<AnimationProps> = ({ size = 280 }) => (
  <svg width={size} height={size * 0.75} viewBox="0 0 280 210">
    {/* Title bar */}
    <rect x="0" y="0" width="280" height="24" fill={palette.dimensionBg} />
    <text x="140" y="16" textAnchor="middle" fill={palette.dimension} fontSize="11" fontWeight="600">CONCRETE CURING</text>

    {/* Concrete slab */}
    <rect x="30" y="110" width="220" height="40" fill={palette.concrete} stroke={palette.concreteDark} strokeWidth="2" rx="2" />

    {/* Plastic sheeting cover */}
    <path d="M25 105 Q80 95 140 105 Q200 95 255 105 L255 115 Q200 108 140 115 Q80 108 25 115 Z" fill="#B3E5FC" opacity="0.5" stroke="#0288D1" strokeWidth="1" />
    <text x="140" y="90" textAnchor="middle" fill="#0288D1" fontSize="8">PLASTIC SHEETING</text>

    {/* Water droplets */}
    {[60, 100, 140, 180, 220].map((x, i) => (
      <g key={i} transform={`translate(${x}, 60)`}>
        <path d="M0 0 Q-5 10 0 15 Q5 10 0 0" fill="#81D4FA" />
      </g>
    ))}
    <text x="140" y="50" textAnchor="middle" fill="#0288D1" fontSize="8">KEEP MOIST</text>

    {/* Timeline */}
    <g transform="translate(30, 165)">
      <rect x="0" y="0" width="220" height="35" fill={palette.dimensionBg} stroke={palette.dimension} strokeWidth="1" rx="3" />
      <text x="110" y="12" textAnchor="middle" fill={palette.dimension} fontSize="8" fontWeight="600">CURING TIMELINE</text>

      <line x1="10" y1="25" x2="210" y2="25" stroke={palette.dimension} strokeWidth="2" />

      {/* Day markers */}
      <g transform="translate(10, 20)">
        <line x1="0" y1="0" x2="0" y2="10" stroke={palette.dimension} strokeWidth="2" />
        <text x="0" y="-3" textAnchor="middle" fill={palette.gray} fontSize="7">Day 1</text>
      </g>
      <g transform="translate(77, 20)">
        <line x1="0" y1="0" x2="0" y2="10" stroke={palette.dimension} strokeWidth="2" />
        <text x="0" y="-3" textAnchor="middle" fill={palette.gray} fontSize="7">Day 3</text>
      </g>
      <g transform="translate(143, 20)">
        <line x1="0" y1="0" x2="0" y2="10" stroke={palette.dimension} strokeWidth="2" />
        <text x="0" y="-3" textAnchor="middle" fill={palette.gray} fontSize="7">Day 7</text>
      </g>
      <g transform="translate(210, 20)">
        <line x1="0" y1="0" x2="0" y2="10" stroke="#4CAF50" strokeWidth="2" />
        <text x="0" y="-3" textAnchor="middle" fill="#4CAF50" fontSize="7" fontWeight="600">Day 28</text>
      </g>

      {/* Strength indicator */}
      <rect x="10" y="22" width="67" height="6" fill="#FFCC80" rx="1" />
      <rect x="77" y="22" width="66" height="6" fill="#FFB74D" rx="1" />
      <rect x="143" y="22" width="67" height="6" fill="#4CAF50" rx="1" />
    </g>
  </svg>
);

// ============================================================================
// COMPLETION - Project complete checklist
// ============================================================================
export const CompletionAnimation: React.FC<AnimationProps> = ({ size = 280 }) => (
  <svg width={size} height={size * 0.75} viewBox="0 0 280 210">
    {/* Title bar */}
    <rect x="0" y="0" width="280" height="24" fill="#E8F5E9" />
    <text x="140" y="16" textAnchor="middle" fill="#2E7D32" fontSize="11" fontWeight="600">PROJECT COMPLETE</text>

    {/* Success icon */}
    <g transform="translate(140, 75)">
      <circle cx="0" cy="0" r="40" fill="#E8F5E9" stroke="#4CAF50" strokeWidth="4" />
      <path d="M-18 0 L-6 12 L18 -12" fill="none" stroke="#4CAF50" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
    </g>

    {/* Checklist */}
    <g transform="translate(40, 130)">
      <rect x="0" y="0" width="200" height="70" fill={palette.dimensionBg} stroke={palette.dimension} strokeWidth="1" rx="3" />
      <text x="100" y="15" textAnchor="middle" fill={palette.dimension} fontSize="9" fontWeight="600">FINAL CHECKLIST</text>
      <line x1="10" y1="22" x2="190" y2="22" stroke={palette.dimension} strokeWidth="0.5" />

      {/* Checklist items */}
      <g transform="translate(15, 32)">
        <rect x="0" y="0" width="10" height="10" fill="#4CAF50" rx="2" />
        <path d="M2 5 L4 7 L8 3" stroke="white" strokeWidth="1.5" fill="none" />
        <text x="15" y="8" fill={palette.gray} fontSize="8">All dimensions verified</text>
      </g>
      <g transform="translate(15, 46)">
        <rect x="0" y="0" width="10" height="10" fill="#4CAF50" rx="2" />
        <path d="M2 5 L4 7 L8 3" stroke="white" strokeWidth="1.5" fill="none" />
        <text x="15" y="8" fill={palette.gray} fontSize="8">Level and plumb confirmed</text>
      </g>
      <g transform="translate(15, 60)">
        <rect x="0" y="0" width="10" height="10" fill="#4CAF50" rx="2" />
        <path d="M2 5 L4 7 L8 3" stroke="white" strokeWidth="1.5" fill="none" />
        <text x="15" y="8" fill={palette.gray} fontSize="8">Curing time completed</text>
      </g>

      <g transform="translate(115, 32)">
        <rect x="0" y="0" width="10" height="10" fill="#4CAF50" rx="2" />
        <path d="M2 5 L4 7 L8 3" stroke="white" strokeWidth="1.5" fill="none" />
        <text x="15" y="8" fill={palette.gray} fontSize="8">Tools cleaned</text>
      </g>
      <g transform="translate(115, 46)">
        <rect x="0" y="0" width="10" height="10" fill="#4CAF50" rx="2" />
        <path d="M2 5 L4 7 L8 3" stroke="white" strokeWidth="1.5" fill="none" />
        <text x="15" y="8" fill={palette.gray} fontSize="8">Site cleaned</text>
      </g>
      <g transform="translate(115, 60)">
        <rect x="0" y="0" width="10" height="10" fill="#4CAF50" rx="2" />
        <path d="M2 5 L4 7 L8 3" stroke="white" strokeWidth="1.5" fill="none" />
        <text x="15" y="8" fill={palette.gray} fontSize="8">Photos taken</text>
      </g>
    </g>
  </svg>
);

// ============================================================================
// Map of illustration keys to components
// ============================================================================
export const IllustrationMap: Record<string, React.FC<AnimationProps>> = {
  'site_preparation': SitePreparationAnimation,
  'gravel_base': GravelBaseAnimation,
  'formwork': FormworkAnimation,
  'digging': DiggingAnimation,
  'post_install': PostInstallAnimation,
  'concrete_mixing': ConcreteMixingAnimation,
  'panel_attach': PanelAttachAnimation,
  'measuring': MeasuringAnimation,
  'gate_install': GateInstallAnimation,
  'leveling': LevelingAnimation,
  'concrete_pour': ConcretePourAnimation,
  'rebar': RebarAnimation,
  'smoothing': SmoothingAnimation,
  'curing': CuringAnimation,
  'completion': CompletionAnimation,
};

// ============================================================================
// Helper component to render the right illustration
// ============================================================================
interface InstructionIllustrationProps {
  type: string;
  size?: number;
}

export const InstructionIllustration: React.FC<InstructionIllustrationProps> = ({ type, size = 280 }) => {
  const IllustrationComponent = IllustrationMap[type];

  if (!IllustrationComponent) {
    return (
      <svg width={size} height={size * 0.75} viewBox="0 0 280 210">
        <rect x="0" y="0" width="280" height="24" fill={palette.dimensionBg} />
        <text x="140" y="16" textAnchor="middle" fill={palette.dimension} fontSize="11" fontWeight="600">INSTRUCTION</text>
        <rect x="40" y="50" width="200" height="120" fill={palette.dimensionBg} stroke={palette.dimension} strokeWidth="1" rx="3" />
        <text x="140" y="115" textAnchor="middle" fill={palette.gray} fontSize="10">Diagram not available</text>
      </svg>
    );
  }

  return <IllustrationComponent size={size} />;
};
