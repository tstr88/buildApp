/**
 * Professional Construction Instruction Diagrams
 * Clean, simple, and professional illustrations
 * Focus on clarity and essential details
 */

import React from 'react';

interface AnimationProps {
  size?: number;
}

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
// SITE PREPARATION - Simple cross-section
// ============================================================================
export const SitePreparationAnimation: React.FC<AnimationProps> = ({ size = 280 }) => (
  <svg width={size} height={size * 0.75} viewBox="0 0 280 210">
    {/* Title */}
    <rect x="0" y="0" width="280" height="28" fill={palette.dimensionBg} />
    <text x="140" y="18" textAnchor="middle" fill={palette.dimension} fontSize="12" fontWeight="600">CROSS-SECTION VIEW</text>

    {/* Ground level line */}
    <line x1="0" y1="80" x2="280" y2="80" stroke={palette.grass} strokeWidth="4" />

    {/* Original ground with grass */}
    <rect x="0" y="80" width="50" height="80" fill={palette.soil} />
    <rect x="230" y="80" width="50" height="80" fill={palette.soil} />

    {/* Excavated area - lighter */}
    <rect x="50" y="80" width="180" height="70" fill={palette.lightGray} stroke={palette.soilDark} strokeWidth="2" strokeDasharray="5,3" />

    {/* Remove arrows */}
    <g transform="translate(140, 100)">
      <path d="M0 0 L0 35" stroke={palette.arrow} strokeWidth="3" />
      <polygon points="-8,30 8,30 0,45" fill={palette.arrow} />
      <text x="0" y="-10" textAnchor="middle" fill={palette.arrow} fontSize="11" fontWeight="600">REMOVE</text>
    </g>

    {/* Depth dimension - right side */}
    <g transform="translate(240, 80)">
      <line x1="15" y1="0" x2="15" y2="70" stroke={palette.dimension} strokeWidth="2" />
      <line x1="8" y1="0" x2="22" y2="0" stroke={palette.dimension} strokeWidth="2" />
      <line x1="8" y1="70" x2="22" y2="70" stroke={palette.dimension} strokeWidth="2" />
      <rect x="25" y="25" width="50" height="22" fill={palette.dimensionBg} stroke={palette.dimension} strokeWidth="1" rx="3" />
      <text x="50" y="41" textAnchor="middle" fill={palette.dimension} fontSize="12" fontWeight="700">15-20cm</text>
    </g>

    {/* Width indicator */}
    <g transform="translate(50, 165)">
      <line x1="0" y1="0" x2="180" y2="0" stroke={palette.dimension} strokeWidth="2" />
      <line x1="0" y1="-8" x2="0" y2="8" stroke={palette.dimension} strokeWidth="2" />
      <line x1="180" y1="-8" x2="180" y2="8" stroke={palette.dimension} strokeWidth="2" />
      <rect x="60" y="5" width="60" height="20" fill={palette.dimensionBg} stroke={palette.dimension} strokeWidth="1" rx="3" />
      <text x="90" y="19" textAnchor="middle" fill={palette.dimension} fontSize="10" fontWeight="600">EXCAVATE</text>
    </g>

    {/* Labels */}
    <text x="25" y="125" textAnchor="middle" fill={palette.white} fontSize="9" fontWeight="500">SOIL</text>
    <text x="255" y="125" textAnchor="middle" fill={palette.white} fontSize="9" fontWeight="500">SOIL</text>
  </svg>
);

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
        <rect x="0" y="0" width="280" height="28" fill={palette.dimensionBg} />
        <text x="140" y="18" textAnchor="middle" fill={palette.dimension} fontSize="12" fontWeight="600">INSTRUCTION</text>
        <rect x="40" y="50" width="200" height="120" fill={palette.lightGray} stroke={palette.dimension} strokeWidth="1" rx="4" />
        <text x="140" y="115" textAnchor="middle" fill={palette.gray} fontSize="11">Diagram not available</text>
      </svg>
    );
  }

  return <IllustrationComponent size={size} />;
};
