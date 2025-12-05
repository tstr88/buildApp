/**
 * Animated Illustrations for Instructions
 * Professional, realistic CSS-based animations for construction steps
 * Designed to be clear, instructional, and visually accurate
 * No text labels - step names are shown above the illustrations
 */

import React from 'react';
import { colors } from '../../theme/tokens';

interface AnimationProps {
  size?: number;
}

// Color palette for consistent, professional look
const palette = {
  ground: '#8B7355',
  groundDark: '#6B5344',
  grass: '#7CB342',
  grassDark: '#558B2F',
  soil: '#5D4E37',
  soilLight: '#8D7355',
  wood: '#DEB887',
  woodDark: '#8B4513',
  metal: '#78909C',
  metalDark: '#546E7A',
  metalLight: '#90A4AE',
  concrete: '#9E9E9E',
  concreteDark: '#757575',
  concreteLight: '#BDBDBD',
  concreteWet: '#7E8B8E',
  gravel: '#A1887F',
  gravelDark: '#795548',
  gravelLight: '#BCAAA4',
  water: '#4FC3F7',
  waterDark: '#0288D1',
  rebar: '#5D4037',
  rebarDark: '#3E2723',
  highlight: colors.primary[500],
  highlightLight: colors.primary[100],
  warning: '#FFA726',
  success: '#66BB6A',
  white: '#FFFFFF',
  black: '#212121',
  orange: '#FF7043',
  orangeDark: '#E64A19',
  blue: '#2196F3',
  blueLight: '#BBDEFB',
  yellow: '#FDD835',
  yellowDark: '#F9A825',
};

// ============================================================================
// SITE PREPARATION Animation
// Shows clearing grass, roots, and vegetation - not just digging
// ============================================================================
export const SitePreparationAnimation: React.FC<AnimationProps> = ({ size = 280 }) => (
  <svg width={size} height={size * 0.75} viewBox="0 0 280 210">
    <defs>
      <linearGradient id="soilGradSite" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor={palette.soilLight} />
        <stop offset="100%" stopColor={palette.soil} />
      </linearGradient>
      <pattern id="grassPattern" patternUnits="userSpaceOnUse" width="20" height="20">
        <rect width="20" height="20" fill={palette.grass}/>
        <path d="M5 20 Q5 10 3 5 M5 20 Q5 12 7 8" stroke={palette.grassDark} strokeWidth="1.5" fill="none"/>
        <path d="M15 20 Q15 12 13 7 M15 20 Q15 14 17 10" stroke={palette.grassDark} strokeWidth="1.5" fill="none"/>
      </pattern>
    </defs>
    <style>{`
      @keyframes shovelLift {
        0%, 100% { transform: translate(0, 0) rotate(0deg); }
        25% { transform: translate(-5px, -15px) rotate(-20deg); }
        50% { transform: translate(30px, -25px) rotate(-15deg); }
        75% { transform: translate(50px, 10px) rotate(5deg); }
      }
      @keyframes grassFly {
        0%, 10% { opacity: 1; transform: translate(0, 0) rotate(0deg); }
        100% { opacity: 0; transform: translate(60px, -30px) rotate(180deg); }
      }
      @keyframes grassFly2 {
        0%, 20% { opacity: 1; transform: translate(0, 0) rotate(0deg); }
        100% { opacity: 0; transform: translate(70px, -20px) rotate(-90deg); }
      }
      @keyframes rootFly {
        0%, 15% { opacity: 1; transform: translate(0, 0); }
        100% { opacity: 0; transform: translate(45px, -35px); }
      }
      @keyframes clearProgress {
        0% { width: 0; }
        100% { width: 120px; }
      }
      .shovel-action { animation: shovelLift 2s ease-in-out infinite; transform-origin: 100px 150px; }
      .grass-chunk1 { animation: grassFly 2s ease-out infinite; }
      .grass-chunk2 { animation: grassFly2 2s ease-out infinite 0.3s; }
      .root-piece { animation: rootFly 2s ease-out infinite 0.5s; }
      .clear-area { animation: clearProgress 2s ease-out infinite; }
    `}</style>

    {/* Background soil layer */}
    <rect x="0" y="100" width="280" height="110" fill="url(#soilGradSite)" />

    {/* Grass surface - right side (uncleared) */}
    <rect x="140" y="90" width="140" height="20" fill="url(#grassPattern)" />

    {/* Grass blades on right */}
    {[160, 180, 200, 220, 240, 260].map((x, i) => (
      <g key={i}>
        <path d={`M${x} 90 Q${x-3} 75 ${x-5} 60`} stroke={palette.grassDark} strokeWidth="2" fill="none" />
        <path d={`M${x+5} 90 Q${x+7} 70 ${x+3} 55`} stroke={palette.grass} strokeWidth="2" fill="none" />
      </g>
    ))}

    {/* Cleared area - left side (brown soil) */}
    <rect x="20" y="95" width="120" height="15" fill={palette.soilLight} />
    <rect className="clear-area" x="20" y="95" height="15" fill={palette.soilLight} />

    {/* Exposed roots in transition area */}
    <path d="M130 100 Q145 105 160 95 Q170 90 175 95" stroke="#6D4C41" strokeWidth="3" fill="none" />
    <path d="M125 110 Q140 108 150 115" stroke="#5D4037" strokeWidth="2" fill="none" />

    {/* Flying grass chunks */}
    <g className="grass-chunk1" transform="translate(120, 80)">
      <ellipse cx="0" cy="0" rx="12" ry="8" fill={palette.grass} />
      <path d="M-5 -8 Q-3 -15 0 -18 M5 -8 Q7 -14 4 -17" stroke={palette.grassDark} strokeWidth="1.5" fill="none" />
    </g>
    <g className="grass-chunk2" transform="translate(115, 90)">
      <ellipse cx="0" cy="0" rx="10" ry="6" fill={palette.grass} />
      <path d="M0 -6 Q2 -12 -1 -15" stroke={palette.grassDark} strokeWidth="1.5" fill="none" />
    </g>

    {/* Flying root piece */}
    <g className="root-piece" transform="translate(125, 100)">
      <path d="M0 0 Q8 -3 15 2 Q20 5 25 3" stroke="#6D4C41" strokeWidth="3" fill="none" strokeLinecap="round" />
    </g>

    {/* Shovel with grass/soil */}
    <g className="shovel-action">
      {/* Shovel handle */}
      <rect x="85" y="50" width="10" height="100" fill={palette.woodDark} rx="3" />
      <ellipse cx="90" cy="45" rx="15" ry="7" fill={palette.woodDark} />

      {/* Shovel blade */}
      <path d="M75 145 L105 145 L95 185 L85 185 Z" fill={palette.metalDark} />
      <path d="M78 145 L102 145 L93 180 L87 180 Z" fill={palette.metal} />

      {/* Dirt and grass on shovel */}
      <ellipse cx="90" cy="150" rx="12" ry="6" fill={palette.soil} />
      <ellipse cx="90" cy="148" rx="8" ry="4" fill={palette.grass} />
    </g>

    {/* Depth marker showing 15-20cm */}
    <g transform="translate(40, 95)">
      <line x1="0" y1="0" x2="0" y2="40" stroke={palette.highlight} strokeWidth="2" />
      <line x1="-8" y1="0" x2="8" y2="0" stroke={palette.highlight} strokeWidth="2" />
      <line x1="-8" y1="40" x2="8" y2="40" stroke={palette.highlight} strokeWidth="2" />
      <rect x="-22" y="12" width="44" height="18" fill={palette.highlight} rx="3" />
      <text x="0" y="25" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">15-20cm</text>
    </g>

    {/* Pile of removed material on the side */}
    <ellipse cx="230" cy="150" rx="35" ry="20" fill={palette.soil} />
    <ellipse cx="225" cy="145" rx="25" ry="12" fill={palette.grass} />
    <path d="M215 135 Q212 120 218 110" stroke={palette.grassDark} strokeWidth="2" fill="none" />
    <path d="M235 138 Q240 125 235 115" stroke={palette.grassDark} strokeWidth="2" fill="none" />
  </svg>
);

// ============================================================================
// GRAVEL BASE Animation
// Shows spreading and compacting gravel layer
// ============================================================================
export const GravelBaseAnimation: React.FC<AnimationProps> = ({ size = 280 }) => (
  <svg width={size} height={size * 0.75} viewBox="0 0 280 210">
    <defs>
      <pattern id="gravelPattern" patternUnits="userSpaceOnUse" width="15" height="15">
        <rect width="15" height="15" fill={palette.gravel}/>
        <circle cx="3" cy="3" r="2.5" fill={palette.gravelDark}/>
        <circle cx="10" cy="5" r="3" fill={palette.gravelLight}/>
        <circle cx="6" cy="11" r="2" fill={palette.gravelDark}/>
        <circle cx="12" cy="12" r="2.5" fill={palette.gravel}/>
      </pattern>
    </defs>
    <style>{`
      @keyframes gravelSpread {
        0%, 100% { transform: translateX(0); }
        50% { transform: translateX(60px); }
      }
      @keyframes gravelFall {
        0% { transform: translateY(-30px); opacity: 0; }
        30% { opacity: 1; }
        100% { transform: translateY(0); opacity: 1; }
      }
      @keyframes tamperPress {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(8px); }
      }
      @keyframes compactPulse {
        0%, 100% { transform: scale(1); opacity: 0.5; }
        50% { transform: scale(1.05); opacity: 0.8; }
      }
      .rake-motion { animation: gravelSpread 3s ease-in-out infinite; }
      .gravel-piece1 { animation: gravelFall 1s ease-out infinite; }
      .gravel-piece2 { animation: gravelFall 1s ease-out infinite 0.2s; }
      .gravel-piece3 { animation: gravelFall 1s ease-out infinite 0.4s; }
      .tamper { animation: tamperPress 0.8s ease-in-out infinite; }
      .compact-wave { animation: compactPulse 0.8s ease-in-out infinite; }
    `}</style>

    {/* Soil base */}
    <rect x="0" y="150" width="280" height="60" fill={palette.soil} />

    {/* Formwork sides */}
    <rect x="15" y="120" width="12" height="45" fill={palette.woodDark} />
    <rect x="253" y="120" width="12" height="45" fill={palette.woodDark} />

    {/* Gravel layer being spread */}
    <rect x="27" y="135" width="226" height="25" fill="url(#gravelPattern)" />

    {/* Individual gravel stones for detail */}
    {[40, 70, 100, 130, 160, 190, 220].map((x, i) => (
      <g key={i}>
        <ellipse cx={x} cy={145} rx={5 + (i % 3)} ry={3 + (i % 2)} fill={i % 2 ? palette.gravelDark : palette.gravelLight} />
        <ellipse cx={x + 12} cy={150} rx={4} ry={3} fill={palette.gravelDark} />
      </g>
    ))}

    {/* Rake spreading gravel */}
    <g className="rake-motion" transform="translate(50, 80)">
      {/* Rake handle */}
      <rect x="0" y="0" width="8" height="70" fill={palette.wood} rx="2" transform="rotate(25)" />
      {/* Rake head */}
      <rect x="50" y="55" width="50" height="8" fill={palette.metalDark} rx="2" />
      {/* Rake teeth */}
      {[55, 65, 75, 85, 95].map((x, i) => (
        <rect key={i} x={x} y="63" width="4" height="15" fill={palette.metal} rx="1" />
      ))}
    </g>

    {/* Falling gravel pieces from wheelbarrow */}
    <g transform="translate(200, 100)">
      <ellipse className="gravel-piece1" cx="0" cy="30" rx="6" ry="4" fill={palette.gravelDark} />
      <ellipse className="gravel-piece2" cx="15" cy="25" rx="5" ry="3" fill={palette.gravelLight} />
      <ellipse className="gravel-piece3" cx="8" cy="35" rx="4" ry="3" fill={palette.gravel} />
    </g>

    {/* Plate compactor / tamper */}
    <g className="tamper" transform="translate(160, 85)">
      {/* Handle */}
      <rect x="20" y="0" width="10" height="40" fill={palette.metalDark} rx="2" />
      <ellipse cx="25" cy="0" rx="12" ry="6" fill={palette.black} />
      {/* Plate body */}
      <rect x="0" y="38" width="50" height="25" fill={palette.orange} rx="3" />
      <rect x="5" y="43" width="40" height="15" fill={palette.orangeDark} rx="2" />
      {/* Base plate */}
      <rect x="-5" y="63" width="60" height="10" fill={palette.metalDark} rx="2" />
    </g>

    {/* Compaction wave effect */}
    <ellipse className="compact-wave" cx="185" cy="145" rx="40" ry="8" fill={palette.gravelDark} opacity="0.3" />

    {/* Depth indicator */}
    <g transform="translate(250, 130)">
      <line x1="0" y1="5" x2="0" y2="30" stroke={palette.highlight} strokeWidth="2" />
      <line x1="-6" y1="5" x2="6" y2="5" stroke={palette.highlight} strokeWidth="2" />
      <line x1="-6" y1="30" x2="6" y2="30" stroke={palette.highlight} strokeWidth="2" />
      <text x="15" y="22" fill={palette.highlight} fontSize="10" fontWeight="bold">15cm</text>
    </g>

    {/* Wheelbarrow hint */}
    <g transform="translate(195, 40)">
      <path d="M0 40 L30 40 L40 60 L-10 60 Z" fill={palette.metalDark} />
      <ellipse cx="15" cy="40" rx="20" ry="12" fill={palette.metal} />
      <ellipse cx="15" cy="35" rx="15" ry="8" fill={palette.gravel} />
      <circle cx="15" cy="65" r="10" fill={palette.black} />
      <circle cx="15" cy="65" r="5" fill={palette.metal} />
    </g>
  </svg>
);

// ============================================================================
// FORMWORK Animation
// Shows setting wooden boards at specific height
// ============================================================================
export const FormworkAnimation: React.FC<AnimationProps> = ({ size = 280 }) => (
  <svg width={size} height={size * 0.75} viewBox="0 0 280 210">
    <style>{`
      @keyframes boardPlace {
        0%, 20% { transform: translateY(-30px) rotate(-5deg); opacity: 0.7; }
        50%, 100% { transform: translateY(0) rotate(0deg); opacity: 1; }
      }
      @keyframes stakeHammer {
        0%, 60% { transform: translateY(0); }
        70% { transform: translateY(-20px); }
        85% { transform: translateY(5px); }
        100% { transform: translateY(0); }
      }
      @keyframes measureShow {
        0%, 50% { opacity: 0; }
        70%, 100% { opacity: 1; }
      }
      .board-placing { animation: boardPlace 3s ease-out infinite; }
      .hammer { animation: stakeHammer 1.5s ease-out infinite; }
      .height-measure { animation: measureShow 3s ease-out infinite; }
    `}</style>

    {/* Ground/gravel base */}
    <rect x="0" y="150" width="280" height="60" fill={palette.gravel} />
    <rect x="0" y="145" width="280" height="10" fill={palette.gravelDark} />

    {/* Left formwork - already set */}
    <g>
      {/* Board */}
      <rect x="20" y="115" width="15" height="45" fill={palette.wood} />
      <rect x="20" y="115" width="15" height="3" fill={palette.woodDark} opacity="0.5" />
      {/* Stakes */}
      <rect x="8" y="130" width="10" height="50" fill={palette.woodDark} />
      <polygon points="8,180 18,180 13,195" fill={palette.woodDark} />
    </g>

    {/* Right formwork - being placed */}
    <g className="board-placing">
      {/* Board */}
      <rect x="245" y="115" width="15" height="45" fill={palette.wood} />
      <rect x="245" y="115" width="15" height="3" fill={palette.woodDark} opacity="0.5" />
    </g>

    {/* Stake being hammered */}
    <g transform="translate(262, 130)">
      <rect x="0" y="0" width="10" height="50" fill={palette.woodDark} />
      <polygon points="0,50 10,50 5,65" fill={palette.woodDark} />
    </g>

    {/* Hammer */}
    <g className="hammer" transform="translate(255, 70)">
      <rect x="0" y="0" width="8" height="50" fill={palette.wood} rx="2" />
      <rect x="-8" y="45" width="24" height="20" fill={palette.metalDark} rx="2" />
      <rect x="-6" y="47" width="20" height="8" fill={palette.metal} />
    </g>

    {/* String line between boards */}
    <line x1="35" y1="120" x2="245" y2="120" stroke="#E53935" strokeWidth="1.5" strokeDasharray="6,3" />

    {/* Height measurement on left side */}
    <g className="height-measure" transform="translate(45, 115)">
      <line x1="0" y1="0" x2="0" y2="45" stroke={palette.highlight} strokeWidth="2" />
      <line x1="-8" y1="0" x2="8" y2="0" stroke={palette.highlight} strokeWidth="2" />
      <line x1="-8" y1="45" x2="8" y2="45" stroke={palette.highlight} strokeWidth="2" />
      {/* Arrow pointing to height */}
      <path d="M12 22 L25 22 M20 17 L25 22 L20 27" stroke={palette.highlight} strokeWidth="2" fill="none" />
      <rect x="28" y="12" width="40" height="22" fill={palette.highlight} rx="3" />
      <text x="48" y="27" textAnchor="middle" fill="white" fontSize="11" fontWeight="bold">15cm</text>
    </g>

    {/* Level tool checking height */}
    <g transform="translate(100, 100)">
      <rect x="0" y="0" width="80" height="18" fill={palette.yellow} stroke={palette.yellowDark} strokeWidth="2" rx="3" />
      {/* Level vial */}
      <rect x="28" y="4" width="24" height="10" fill="#B3E5FC" stroke="#0288D1" strokeWidth="1" rx="2" />
      <line x1="38" y1="4" x2="38" y2="14" stroke="#0288D1" strokeWidth="1" />
      <line x1="42" y1="4" x2="42" y2="14" stroke="#0288D1" strokeWidth="1" />
      <circle cx="40" cy="9" r="3" fill="#4CAF50" />
    </g>

    {/* Corner square tool */}
    <g transform="translate(20, 100)">
      <rect x="0" y="15" width="40" height="5" fill={palette.metal} />
      <rect x="0" y="0" width="5" height="45" fill={palette.metal} />
    </g>
  </svg>
);

// ============================================================================
// REBAR GRID Animation - Top-down view
// Shows clear grid pattern being created
// ============================================================================
export const RebarAnimation: React.FC<AnimationProps> = ({ size = 280 }) => (
  <svg width={size} height={size * 0.75} viewBox="0 0 280 210">
    <style>{`
      @keyframes rebarHPlace {
        0%, 10% { opacity: 0; transform: translateX(-20px); }
        40%, 100% { opacity: 1; transform: translateX(0); }
      }
      @keyframes rebarVPlace {
        0%, 30% { opacity: 0; transform: translateY(-20px); }
        60%, 100% { opacity: 1; transform: translateY(0); }
      }
      @keyframes tieTwist {
        0%, 70% { transform: rotate(0deg) scale(0); opacity: 0; }
        85% { transform: rotate(180deg) scale(1.2); opacity: 1; }
        100% { transform: rotate(360deg) scale(1); opacity: 1; }
      }
      @keyframes gridPulse {
        0%, 100% { opacity: 0.1; }
        50% { opacity: 0.3; }
      }
      .rebar-h1 { animation: rebarHPlace 3s ease-out infinite; }
      .rebar-h2 { animation: rebarHPlace 3s ease-out infinite 0.15s; }
      .rebar-h3 { animation: rebarHPlace 3s ease-out infinite 0.3s; }
      .rebar-h4 { animation: rebarHPlace 3s ease-out infinite 0.45s; }
      .rebar-v1 { animation: rebarVPlace 3s ease-out infinite 0.5s; }
      .rebar-v2 { animation: rebarVPlace 3s ease-out infinite 0.65s; }
      .rebar-v3 { animation: rebarVPlace 3s ease-out infinite 0.8s; }
      .rebar-v4 { animation: rebarVPlace 3s ease-out infinite 0.95s; }
      .tie { animation: tieTwist 3s ease-out infinite 1.2s; transform-origin: center; }
      .grid-bg { animation: gridPulse 2s ease-in-out infinite; }
    `}</style>

    {/* Formwork frame - top view */}
    <rect x="30" y="25" width="220" height="160" fill="none" stroke={palette.woodDark} strokeWidth="10" />
    <rect x="40" y="35" width="200" height="140" fill={palette.soil} />

    {/* Grid pattern background hint */}
    <g className="grid-bg">
      {[0, 1, 2, 3].map((i) => (
        <line key={`gh${i}`} x1="40" y1={55 + i * 35} x2="240" y2={55 + i * 35} stroke={palette.highlight} strokeWidth="1" strokeDasharray="4,4" />
      ))}
      {[0, 1, 2, 3, 4].map((i) => (
        <line key={`gv${i}`} x1={60 + i * 45} y1="35" x2={60 + i * 45} y2="175" stroke={palette.highlight} strokeWidth="1" strokeDasharray="4,4" />
      ))}
    </g>

    {/* Horizontal rebars */}
    <rect className="rebar-h1" x="40" y="52" width="200" height="6" fill={palette.rebar} rx="3" />
    <rect className="rebar-h2" x="40" y="87" width="200" height="6" fill={palette.rebar} rx="3" />
    <rect className="rebar-h3" x="40" y="122" width="200" height="6" fill={palette.rebar} rx="3" />
    <rect className="rebar-h4" x="40" y="157" width="200" height="6" fill={palette.rebar} rx="3" />

    {/* Vertical rebars - crossing over horizontal */}
    <rect className="rebar-v1" x="57" y="35" width="6" height="140" fill={palette.rebarDark} rx="3" />
    <rect className="rebar-v2" x="102" y="35" width="6" height="140" fill={palette.rebarDark} rx="3" />
    <rect className="rebar-v3" x="147" y="35" width="6" height="140" fill={palette.rebarDark} rx="3" />
    <rect className="rebar-v4" x="192" y="35" width="6" height="140" fill={palette.rebarDark} rx="3" />

    {/* Wire ties at intersections */}
    {[[60, 55], [105, 55], [150, 55], [195, 55],
      [60, 90], [105, 90], [150, 90], [195, 90],
      [60, 125], [105, 125], [150, 125], [195, 125]].map(([x, y], i) => (
      <circle key={i} className="tie" cx={x} cy={y} r="5" fill="none" stroke={palette.metal} strokeWidth="2" />
    ))}

    {/* Dimension arrows */}
    <g transform="translate(60, 195)">
      <line x1="0" y1="0" x2="45" y2="0" stroke={palette.highlight} strokeWidth="1.5" />
      <line x1="0" y1="-5" x2="0" y2="5" stroke={palette.highlight} strokeWidth="2" />
      <line x1="45" y1="-5" x2="45" y2="5" stroke={palette.highlight} strokeWidth="2" />
      <rect x="12" y="-10" width="22" height="14" fill={palette.highlight} rx="2" />
      <text x="23" y="1" textAnchor="middle" fill="white" fontSize="9" fontWeight="bold">15cm</text>
    </g>

    {/* Second dimension */}
    <g transform="translate(105, 195)">
      <line x1="0" y1="0" x2="45" y2="0" stroke={palette.highlight} strokeWidth="1.5" />
      <line x1="0" y1="-5" x2="0" y2="5" stroke={palette.highlight} strokeWidth="2" />
      <line x1="45" y1="-5" x2="45" y2="5" stroke={palette.highlight} strokeWidth="2" />
      <rect x="12" y="-10" width="22" height="14" fill={palette.highlight} rx="2" />
      <text x="23" y="1" textAnchor="middle" fill="white" fontSize="9" fontWeight="bold">15cm</text>
    </g>

    {/* Wire spool in corner */}
    <g transform="translate(250, 10)">
      <ellipse cx="15" cy="15" rx="12" ry="10" fill={palette.metalDark} />
      <ellipse cx="15" cy="15" rx="7" ry="5" fill={palette.metal} />
    </g>
  </svg>
);

// ============================================================================
// CONCRETE POUR Animation - More realistic
// Shows mixer truck pouring concrete into formwork
// ============================================================================
export const ConcretePourAnimation: React.FC<AnimationProps> = ({ size = 280 }) => (
  <svg width={size} height={size * 0.75} viewBox="0 0 280 210">
    <defs>
      <linearGradient id="drumGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#BDBDBD" />
        <stop offset="50%" stopColor="#9E9E9E" />
        <stop offset="100%" stopColor="#757575" />
      </linearGradient>
      <linearGradient id="concreteFlowGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor={palette.concreteLight} />
        <stop offset="100%" stopColor={palette.concreteDark} />
      </linearGradient>
    </defs>
    <style>{`
      @keyframes drumSpin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      @keyframes concreteFlow {
        0%, 100% {
          d: path('M175 75 Q185 100 180 130 Q178 145 182 155');
          stroke-width: 22;
        }
        50% {
          d: path('M175 75 Q190 95 185 130 Q180 148 185 155');
          stroke-width: 26;
        }
      }
      @keyframes fillRise {
        0% { y: 165; height: 0; }
        100% { y: 140; height: 25; }
      }
      @keyframes splashDrop {
        0%, 20% { opacity: 0; transform: translate(0, 0); }
        40% { opacity: 1; transform: translate(5px, -10px); }
        100% { opacity: 0; transform: translate(10px, 15px); }
      }
      .drum-stripes { animation: drumSpin 2s linear infinite; transform-origin: 95px 55px; }
      .flow-path { animation: concreteFlow 1.5s ease-in-out infinite; }
      .concrete-fill { animation: fillRise 4s ease-out infinite; }
      .splash1 { animation: splashDrop 1s ease-out infinite; }
      .splash2 { animation: splashDrop 1s ease-out infinite 0.3s; }
    `}</style>

    {/* Ground */}
    <rect x="0" y="180" width="280" height="30" fill={palette.ground} />

    {/* Formwork */}
    <g transform="translate(140, 140)">
      <rect x="0" y="0" width="130" height="45" fill="none" stroke={palette.woodDark} strokeWidth="6" />
      <rect x="5" y="5" width="120" height="35" fill={palette.soil} />
      {/* Concrete filling up */}
      <rect className="concrete-fill" x="5" width="120" fill={palette.concrete} />
      {/* Stakes */}
      <rect x="-8" y="-5" width="8" height="55" fill={palette.wood} />
      <rect x="130" y="-5" width="8" height="55" fill={palette.wood} />
    </g>

    {/* Concrete mixer truck */}
    <g transform="translate(5, 25)">
      {/* Cab */}
      <rect x="0" y="75" width="50" height="45" fill={palette.blue} rx="5" />
      <rect x="8" y="82" width="30" height="22" fill={palette.blueLight} rx="3" />
      <rect x="0" y="110" width="50" height="12" fill={palette.metalDark} />

      {/* Drum */}
      <ellipse cx="95" cy="45" rx="50" ry="35" fill="url(#drumGrad)" />
      <ellipse cx="95" cy="95" rx="45" ry="28" fill={palette.metalDark} />
      <rect x="50" y="45" width="90" height="50" fill={palette.metal} />

      {/* Drum spiral stripes */}
      <g className="drum-stripes">
        <path d="M55 55 Q75 35 95 55 Q115 75 135 55" stroke={palette.metalDark} strokeWidth="6" fill="none" />
        <path d="M55 75 Q75 55 95 75 Q115 95 135 75" stroke={palette.metalDark} strokeWidth="6" fill="none" />
      </g>

      {/* Chute */}
      <rect x="130" y="50" width="50" height="15" fill={palette.metal} rx="2" transform="rotate(30, 130, 57)" />
      <rect x="165" y="65" width="30" height="12" fill={palette.metalDark} rx="2" transform="rotate(45, 165, 71)" />
    </g>

    {/* Concrete flow stream */}
    <path className="flow-path" d="M175 75 Q185 100 180 130 Q178 145 182 155"
          stroke="url(#concreteFlowGrad)" strokeWidth="24" fill="none" strokeLinecap="round" />

    {/* Splash drops */}
    <ellipse className="splash1" cx="185" cy="160" rx="8" ry="4" fill={palette.concrete} />
    <ellipse className="splash2" cx="195" cy="158" rx="6" ry="3" fill={palette.concreteDark} />

    {/* Truck wheels */}
    <circle cx="25" cy="135" r="14" fill={palette.black} />
    <circle cx="25" cy="135" r="7" fill={palette.metal} />
    <circle cx="80" cy="135" r="14" fill={palette.black} />
    <circle cx="80" cy="135" r="7" fill={palette.metal} />
    <circle cx="115" cy="135" r="14" fill={palette.black} />
    <circle cx="115" cy="135" r="7" fill={palette.metal} />

    {/* Worker with vibrator hint */}
    <g transform="translate(230, 130)">
      <ellipse cx="15" cy="5" rx="8" ry="10" fill="#FFCCBC" />
      <rect x="8" y="15" width="14" height="25" fill={palette.orange} rx="2" />
      <rect x="5" y="35" width="8" height="20" fill="#455A64" rx="1" />
      <rect x="17" y="35" width="8" height="20" fill="#455A64" rx="1" />
      {/* Hard hat */}
      <ellipse cx="15" cy="2" rx="10" ry="6" fill={palette.yellow} />
    </g>
  </svg>
);

// ============================================================================
// SMOOTHING Animation - Float ON concrete surface
// Shows hand float leveling concrete properly
// ============================================================================
export const SmoothingAnimation: React.FC<AnimationProps> = ({ size = 280 }) => (
  <svg width={size} height={size * 0.75} viewBox="0 0 280 210">
    <style>{`
      @keyframes floatSlide {
        0%, 100% { transform: translateX(0); }
        50% { transform: translateX(100px); }
      }
      @keyframes surfaceSmooth {
        0% { opacity: 0; }
        100% { opacity: 1; }
      }
      @keyframes armMove {
        0%, 100% { transform: rotate(0deg); }
        25% { transform: rotate(-5deg); }
        75% { transform: rotate(5deg); }
      }
      @keyframes rippleEffect {
        0% { r: 5; opacity: 0.8; }
        100% { r: 25; opacity: 0; }
      }
      .float-tool { animation: floatSlide 3s ease-in-out infinite; }
      .smooth-surface { animation: surfaceSmooth 3s ease-out forwards; }
      .worker-arm { animation: armMove 3s ease-in-out infinite; transform-origin: 230px 70px; }
      .ripple { animation: rippleEffect 1s ease-out infinite; }
    `}</style>

    {/* Formwork frame */}
    <rect x="15" y="120" width="12" height="55" fill={palette.woodDark} />
    <rect x="253" y="120" width="12" height="55" fill={palette.woodDark} />
    <rect x="15" y="170" width="250" height="8" fill={palette.woodDark} />

    {/* Wet concrete - rough surface on left */}
    <rect x="27" y="125" width="226" height="45" fill={palette.concreteWet} />

    {/* Rough texture on unsmoothed part */}
    <g>
      {[35, 50, 65, 80].map((x, i) => (
        <ellipse key={i} cx={x} cy={130 + (i % 2) * 5} rx="8" ry="3" fill={palette.concreteDark} opacity="0.5" />
      ))}
    </g>

    {/* Smooth surface appearing after float passes */}
    <rect className="smooth-surface" x="100" y="125" width="153" height="45" fill={palette.concrete} />

    {/* Ripple effect under float */}
    <circle className="ripple" cx="90" cy="145" fill="none" stroke={palette.concreteDark} strokeWidth="2" />

    {/* Float tool - directly on surface */}
    <g className="float-tool" transform="translate(40, 110)">
      {/* Float pad - sitting flat on concrete */}
      <rect x="0" y="15" width="60" height="8" fill={palette.wood} rx="2" />
      <rect x="0" y="21" width="60" height="4" fill={palette.metal} rx="1" />

      {/* Handle connection */}
      <rect x="25" y="5" width="10" height="12" fill={palette.wood} rx="1" />

      {/* Handle going up to worker */}
      <rect x="27" y="-40" width="6" height="48" fill={palette.wood} rx="2" />
    </g>

    {/* Worker */}
    <g transform="translate(200, 30)">
      {/* Head */}
      <ellipse cx="30" cy="20" rx="15" ry="18" fill="#FFCCBC" />
      {/* Hard hat */}
      <ellipse cx="30" cy="12" rx="18" ry="10" fill={palette.yellow} />
      <rect x="12" y="10" width="36" height="8" fill={palette.yellowDark} rx="2" />

      {/* Body */}
      <rect x="15" y="38" width="30" height="40" fill={palette.orange} rx="3" />

      {/* Arms */}
      <g className="worker-arm">
        <rect x="-15" y="40" width="35" height="10" fill={palette.orange} rx="3" transform="rotate(-30, 15, 45)" />
        <ellipse cx="-20" cy="55" rx="6" ry="7" fill="#FFCCBC" />
      </g>
      <rect x="40" y="42" width="25" height="10" fill={palette.orange} rx="3" transform="rotate(20, 45, 47)" />

      {/* Legs */}
      <rect x="18" y="78" width="12" height="30" fill="#455A64" rx="2" />
      <rect x="34" y="78" width="12" height="30" fill="#455A64" rx="2" />
    </g>

    {/* Direction indicator */}
    <g transform="translate(130, 95)">
      <path d="M0 0 L40 0 M30 -8 L40 0 L30 8" stroke={palette.highlight} strokeWidth="3" fill="none" strokeLinecap="round" />
    </g>
  </svg>
);

// ============================================================================
// MEASURING Animation
// Shows tape measure, stakes, string line
// ============================================================================
export const MeasuringAnimation: React.FC<AnimationProps> = ({ size = 280 }) => (
  <svg width={size} height={size * 0.75} viewBox="0 0 280 210">
    <defs>
      <linearGradient id="groundGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor={palette.grass} />
        <stop offset="30%" stopColor={palette.ground} />
        <stop offset="100%" stopColor={palette.groundDark} />
      </linearGradient>
      <linearGradient id="tapeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#FFE082" />
        <stop offset="100%" stopColor="#FFD54F" />
      </linearGradient>
    </defs>
    <style>{`
      @keyframes tapeExtend {
        0%, 10% { width: 30px; }
        40%, 100% { width: 180px; }
      }
      @keyframes measurePulse {
        0%, 100% { opacity: 0; transform: scale(0.8); }
        50% { opacity: 1; transform: scale(1); }
      }
      @keyframes stakeDrive {
        0%, 20% { transform: translateY(-15px); }
        40%, 100% { transform: translateY(0); }
      }
      .tape-body { animation: tapeExtend 3s ease-out infinite; }
      .measure-mark { animation: measurePulse 3s ease-in-out infinite; }
      .measure-mark-2 { animation: measurePulse 3s ease-in-out infinite 0.5s; }
      .stake-1 { animation: stakeDrive 3s ease-out infinite; }
      .stake-2 { animation: stakeDrive 3s ease-out infinite 0.3s; }
    `}</style>

    {/* Ground */}
    <rect x="0" y="140" width="280" height="70" fill="url(#groundGrad)" />

    {/* Stakes */}
    <g className="stake-1">
      <rect x="45" y="100" width="10" height="60" fill={palette.woodDark} rx="2" />
      <polygon points="45,160 55,160 50,175" fill={palette.woodDark} />
    </g>
    <g className="stake-2">
      <rect x="225" y="100" width="10" height="60" fill={palette.woodDark} rx="2" />
      <polygon points="225,160 235,160 230,175" fill={palette.woodDark} />
    </g>

    {/* String line between stakes */}
    <path d="M50 120 Q140 118 230 120" stroke="#E53935" strokeWidth="2" fill="none" strokeDasharray="8,4" />

    {/* Tape measure body */}
    <g transform="translate(30, 95)">
      <rect x="0" y="0" width="45" height="40" fill="#FFC107" stroke="#F57F17" strokeWidth="2" rx="6" />
      <circle cx="22" cy="20" r="12" fill="#F57F17" />
      <circle cx="22" cy="20" r="8" fill="#FFE082" />
      {/* Tape extending */}
      <rect className="tape-body" x="45" y="15" height="10" fill="url(#tapeGrad)" rx="1" />
      {/* Tick marks on tape */}
      <g>
        <line x1="60" y1="15" x2="60" y2="25" stroke={palette.black} strokeWidth="1" />
        <line x1="90" y1="15" x2="90" y2="25" stroke={palette.black} strokeWidth="1" />
        <line x1="120" y1="15" x2="120" y2="25" stroke={palette.black} strokeWidth="1" />
        <line x1="150" y1="15" x2="150" y2="25" stroke={palette.black} strokeWidth="1" />
        <line x1="180" y1="15" x2="180" y2="25" stroke={palette.black} strokeWidth="1" />
      </g>
    </g>

    {/* Measurement markers floating above */}
    <g className="measure-mark" transform="translate(100, 60)">
      <rect x="-18" y="-10" width="36" height="20" fill={palette.highlight} rx="4" />
      <text x="0" y="4" textAnchor="middle" fill="white" fontSize="11" fontWeight="bold">2.5m</text>
    </g>
    <g className="measure-mark-2" transform="translate(180, 60)">
      <rect x="-18" y="-10" width="36" height="20" fill={palette.highlight} rx="4" />
      <text x="0" y="4" textAnchor="middle" fill="white" fontSize="11" fontWeight="bold">5.0m</text>
    </g>

    {/* Ground markers */}
    <circle cx="100" cy="145" r="4" fill="#E53935" />
    <circle cx="180" cy="145" r="4" fill="#E53935" />
  </svg>
);

// ============================================================================
// DIGGING Animation (for fence posts)
// Shows hole digging with depth marker
// ============================================================================
export const DiggingAnimation: React.FC<AnimationProps> = ({ size = 280 }) => (
  <svg width={size} height={size * 0.75} viewBox="0 0 280 210">
    <defs>
      <linearGradient id="dirtGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor={palette.ground} />
        <stop offset="100%" stopColor={palette.soil} />
      </linearGradient>
    </defs>
    <style>{`
      @keyframes shovelDig {
        0%, 100% { transform: rotate(0deg) translate(0, 0); }
        20% { transform: rotate(-25deg) translate(-10px, -20px); }
        40% { transform: rotate(0deg) translate(0, 5px); }
        60% { transform: rotate(10deg) translate(5px, -5px); }
      }
      @keyframes dirtFly1 {
        0%, 30% { opacity: 0; transform: translate(0, 0); }
        50% { opacity: 1; transform: translate(-30px, -40px); }
        100% { opacity: 0; transform: translate(-50px, 20px); }
      }
      @keyframes dirtFly2 {
        0%, 35% { opacity: 0; transform: translate(0, 0); }
        55% { opacity: 1; transform: translate(-15px, -50px); }
        100% { opacity: 0; transform: translate(-25px, 30px); }
      }
      @keyframes depthPulse {
        0%, 100% { opacity: 0.7; }
        50% { opacity: 1; }
      }
      .shovel { animation: shovelDig 2s ease-in-out infinite; transform-origin: 180px 180px; }
      .dirt-1 { animation: dirtFly1 2s ease-out infinite; }
      .dirt-2 { animation: dirtFly2 2s ease-out infinite; }
      .depth-marker { animation: depthPulse 2s ease-in-out infinite; }
    `}</style>

    {/* Ground surface */}
    <rect x="0" y="120" width="280" height="90" fill={palette.ground} />
    <rect x="0" y="115" width="280" height="10" fill={palette.grass} />

    {/* Hole in ground */}
    <ellipse cx="100" cy="130" rx="45" ry="15" fill={palette.soil} />
    <rect x="55" y="130" width="90" height="60" fill={palette.soil} />
    <ellipse cx="100" cy="190" rx="45" ry="12" fill={palette.groundDark} />

    {/* Depth measurement */}
    <g className="depth-marker">
      <line x1="150" y1="130" x2="150" y2="190" stroke={palette.highlight} strokeWidth="2" strokeDasharray="4,4" />
      <line x1="145" y1="130" x2="155" y2="130" stroke={palette.highlight} strokeWidth="2" />
      <line x1="145" y1="190" x2="155" y2="190" stroke={palette.highlight} strokeWidth="2" />
      <rect x="155" y="150" width="40" height="20" fill={palette.highlight} rx="3" />
      <text x="175" y="164" textAnchor="middle" fill="white" fontSize="11" fontWeight="bold">60cm</text>
    </g>

    {/* Dirt pile */}
    <ellipse cx="200" cy="155" rx="35" ry="20" fill={palette.ground} />
    <ellipse cx="200" cy="145" rx="28" ry="15" fill="#9E8B7A" />

    {/* Flying dirt particles */}
    <g transform="translate(100, 120)">
      <circle className="dirt-1" cx="0" cy="0" r="8" fill={palette.ground} />
      <circle className="dirt-2" cx="10" cy="5" r="6" fill="#9E8B7A" />
    </g>

    {/* Shovel */}
    <g className="shovel">
      <rect x="165" y="40" width="12" height="120" fill={palette.woodDark} rx="3" />
      <ellipse cx="171" cy="35" rx="18" ry="8" fill={palette.woodDark} />
      <path d="M155 155 L187 155 L175 195 L167 195 Z" fill={palette.metalDark} />
      <path d="M158 155 L184 155 L175 190 L167 190 Z" fill={palette.metal} />
    </g>
  </svg>
);

// ============================================================================
// POST INSTALL Animation
// Shows post being set with level check
// ============================================================================
export const PostInstallAnimation: React.FC<AnimationProps> = ({ size = 280 }) => (
  <svg width={size} height={size * 0.75} viewBox="0 0 280 210">
    <defs>
      <linearGradient id="postGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor={palette.metal} />
        <stop offset="50%" stopColor="#90A4AE" />
        <stop offset="100%" stopColor={palette.metal} />
      </linearGradient>
    </defs>
    <style>{`
      @keyframes postDrop {
        0%, 10% { transform: translateY(-40px); opacity: 0.5; }
        50%, 100% { transform: translateY(0); opacity: 1; }
      }
      @keyframes levelCheck {
        0%, 40% { transform: rotate(-8deg); }
        60%, 100% { transform: rotate(0deg); }
      }
      @keyframes bubbleMove {
        0%, 40% { cx: 220; }
        60%, 100% { cx: 230; }
      }
      @keyframes checkAppear {
        0%, 70% { opacity: 0; transform: scale(0); }
        100% { opacity: 1; transform: scale(1); }
      }
      .post { animation: postDrop 3s ease-out infinite; }
      .level-tool { animation: levelCheck 3s ease-out infinite; transform-origin: 230px 90px; }
      .bubble { animation: bubbleMove 3s ease-out infinite; }
      .check { animation: checkAppear 3s ease-out infinite; transform-origin: center; }
    `}</style>

    {/* Ground */}
    <rect x="0" y="150" width="280" height="60" fill={palette.ground} />
    <rect x="0" y="145" width="280" height="10" fill={palette.grass} />

    {/* Hole */}
    <ellipse cx="100" cy="155" rx="30" ry="10" fill={palette.soil} />
    <rect x="70" y="155" width="60" height="45" fill={palette.soil} />

    {/* Post */}
    <g className="post">
      <rect x="88" y="20" width="24" height="180" fill="url(#postGrad)" rx="2" />
      <rect x="85" y="15" width="30" height="12" fill={palette.metalDark} rx="2" />
      <line x1="92" y1="30" x2="92" y2="190" stroke={palette.metalDark} strokeWidth="1" opacity="0.5" />
      <line x1="108" y1="30" x2="108" y2="190" stroke="white" strokeWidth="1" opacity="0.3" />
    </g>

    {/* Level tool */}
    <g className="level-tool">
      <rect x="180" y="60" width="100" height="25" fill={palette.yellow} stroke={palette.yellowDark} strokeWidth="2" rx="4" />
      <rect x="210" y="67" width="40" height="11" fill="#81D4FA" stroke="#0288D1" strokeWidth="1" rx="3" />
      <line x1="228" y1="67" x2="228" y2="78" stroke="#0288D1" strokeWidth="1" />
      <line x1="232" y1="67" x2="232" y2="78" stroke="#0288D1" strokeWidth="1" />
      <circle className="bubble" cy="72.5" r="4" fill="#4CAF50" />
    </g>

    {/* Success check */}
    <g className="check" transform="translate(55, 60)">
      <circle cx="0" cy="0" r="20" fill={palette.success} />
      <path d="M-8 0 L-3 5 L8 -6" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  </svg>
);

// ============================================================================
// CONCRETE MIXING Animation
// Shows mixer preparing concrete
// ============================================================================
export const ConcreteMixingAnimation: React.FC<AnimationProps> = ({ size = 280 }) => (
  <svg width={size} height={size * 0.75} viewBox="0 0 280 210">
    <defs>
      <linearGradient id="mixerGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor={palette.orange} />
        <stop offset="100%" stopColor={palette.orangeDark} />
      </linearGradient>
    </defs>
    <style>{`
      @keyframes drumRotate {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      @keyframes mixSplash {
        0%, 100% { transform: translateY(0) scale(1); opacity: 0.8; }
        50% { transform: translateY(-10px) scale(1.1); opacity: 1; }
      }
      @keyframes pourFlow {
        0% { stroke-dashoffset: 50; }
        100% { stroke-dashoffset: 0; }
      }
      .drum-blade { animation: drumRotate 1.5s linear infinite; transform-origin: 90px 95px; }
      .mix-content { animation: mixSplash 0.8s ease-in-out infinite; }
      .pour-stream { stroke-dasharray: 50; animation: pourFlow 1s linear infinite; }
    `}</style>

    {/* Ground */}
    <rect x="0" y="180" width="280" height="30" fill={palette.ground} />

    {/* Mixer drum */}
    <g transform="translate(30, 40)">
      <ellipse cx="60" cy="30" rx="55" ry="25" fill="#FF8A65" />
      <ellipse cx="60" cy="110" rx="55" ry="25" fill={palette.orangeDark} />
      <rect x="5" y="30" width="110" height="80" fill="url(#mixerGrad)" />
      <ellipse className="mix-content" cx="60" cy="70" rx="45" ry="20" fill={palette.concrete} />
      <g className="drum-blade">
        <rect x="55" y="40" width="10" height="60" fill={palette.metalDark} rx="2" />
        <rect x="35" y="63" width="50" height="8" fill={palette.metalDark} rx="2" />
      </g>
      <ellipse cx="60" cy="30" rx="35" ry="15" fill={palette.concreteDark} />
    </g>

    {/* Pour spout and stream */}
    <g transform="translate(140, 80)">
      <rect x="0" y="0" width="60" height="15" fill={palette.metal} rx="3" transform="rotate(25)" />
      <path className="pour-stream" d="M50 25 Q70 60 65 100" stroke={palette.concrete} strokeWidth="20" fill="none" strokeLinecap="round" />
    </g>

    {/* Target container */}
    <g transform="translate(180, 140)">
      <rect x="0" y="0" width="80" height="40" fill={palette.metalDark} rx="3" />
      <rect x="5" y="5" width="70" height="30" fill={palette.concrete} rx="2" />
    </g>

    {/* Mixer wheels */}
    <circle cx="50" cy="175" r="15" fill={palette.black} />
    <circle cx="50" cy="175" r="8" fill={palette.metal} />
    <circle cx="130" cy="175" r="15" fill={palette.black} />
    <circle cx="130" cy="175" r="8" fill={palette.metal} />
  </svg>
);

// ============================================================================
// PANEL ATTACH Animation
// Shows fence panel being attached
// ============================================================================
export const PanelAttachAnimation: React.FC<AnimationProps> = ({ size = 280 }) => (
  <svg width={size} height={size * 0.75} viewBox="0 0 280 210">
    <style>{`
      @keyframes panelSlide {
        0%, 20% { transform: translateX(40px); opacity: 0.6; }
        50%, 100% { transform: translateX(0); opacity: 1; }
      }
      @keyframes drillVibrate {
        0%, 100% { transform: translate(0, 0); }
        25% { transform: translate(-1px, 1px); }
        50% { transform: translate(1px, -1px); }
        75% { transform: translate(-1px, -1px); }
      }
      @keyframes screwIn {
        0%, 40% { transform: translateX(20px); opacity: 0; }
        100% { transform: translateX(0); opacity: 1; }
      }
      .panel { animation: panelSlide 3s ease-out infinite; }
      .drill { animation: drillVibrate 0.1s linear infinite; }
      .screw-1 { animation: screwIn 3s ease-out infinite; }
      .screw-2 { animation: screwIn 3s ease-out infinite 0.3s; }
      .screw-3 { animation: screwIn 3s ease-out infinite 0.6s; }
    `}</style>

    {/* Ground */}
    <rect x="0" y="180" width="280" height="30" fill={palette.ground} />
    <rect x="0" y="175" width="280" height="8" fill={palette.grass} />

    {/* Posts */}
    <rect x="25" y="30" width="20" height="150" fill={palette.metal} rx="2" />
    <rect x="22" y="25" width="26" height="10" fill={palette.metalDark} rx="2" />
    <rect x="235" y="30" width="20" height="150" fill={palette.metal} rx="2" />
    <rect x="232" y="25" width="26" height="10" fill={palette.metalDark} rx="2" />

    {/* Fence panels */}
    <g className="panel">
      <rect x="45" y="50" width="190" height="12" fill={palette.wood} rx="2" />
      <rect x="45" y="95" width="190" height="12" fill={palette.wood} rx="2" />
      <rect x="45" y="140" width="190" height="12" fill={palette.wood} rx="2" />
      {[60, 90, 120, 150, 180, 210].map((x, i) => (
        <rect key={i} x={x} y="45" width="8" height="115" fill={palette.wood} rx="1" />
      ))}
    </g>

    {/* Screws */}
    <g className="screw-1" transform="translate(42, 54)">
      <circle cx="0" cy="0" r="5" fill={palette.metalDark} />
      <line x1="-3" y1="0" x2="3" y2="0" stroke={palette.metal} strokeWidth="2" />
    </g>
    <g className="screw-2" transform="translate(42, 99)">
      <circle cx="0" cy="0" r="5" fill={palette.metalDark} />
      <line x1="-3" y1="0" x2="3" y2="0" stroke={palette.metal} strokeWidth="2" />
    </g>
    <g className="screw-3" transform="translate(42, 144)">
      <circle cx="0" cy="0" r="5" fill={palette.metalDark} />
      <line x1="-3" y1="0" x2="3" y2="0" stroke={palette.metal} strokeWidth="2" />
    </g>

    {/* Drill */}
    <g className="drill" transform="translate(55, 90)">
      <rect x="0" y="-12" width="50" height="24" fill={palette.orange} rx="4" />
      <rect x="50" y="-8" width="15" height="16" fill="#BF360C" rx="2" />
      <rect x="-25" y="-5" width="28" height="10" fill={palette.metalDark} rx="2" />
    </g>
  </svg>
);

// ============================================================================
// GATE INSTALL Animation
// ============================================================================
export const GateInstallAnimation: React.FC<AnimationProps> = ({ size = 280 }) => (
  <svg width={size} height={size * 0.75} viewBox="0 0 280 210">
    <style>{`
      @keyframes gateSwing {
        0%, 100% { transform: rotate(0deg); }
        30% { transform: rotate(-35deg); }
        60% { transform: rotate(-20deg); }
      }
      @keyframes hingeGlow {
        0%, 100% { fill: ${palette.metal}; }
        50% { fill: ${palette.yellow}; }
      }
      .gate { animation: gateSwing 4s ease-in-out infinite; transform-origin: 50px 100px; }
      .hinge { animation: hingeGlow 2s ease-in-out infinite; }
    `}</style>

    {/* Ground */}
    <rect x="0" y="175" width="280" height="35" fill={palette.ground} />
    <rect x="0" y="170" width="280" height="8" fill={palette.grass} />

    {/* Posts */}
    <rect x="35" y="30" width="25" height="145" fill={palette.metal} rx="3" />
    <rect x="32" y="25" width="31" height="12" fill={palette.metalDark} rx="2" />
    <rect x="220" y="30" width="25" height="145" fill={palette.metal} rx="3" />
    <rect x="217" y="25" width="31" height="12" fill={palette.metalDark} rx="2" />

    {/* Gate */}
    <g className="gate">
      <rect x="60" y="45" width="95" height="125" fill="none" stroke={palette.metalDark} strokeWidth="6" rx="3" />
      <rect x="60" y="70" width="95" height="5" fill={palette.metal} />
      <rect x="60" y="100" width="95" height="5" fill={palette.metal} />
      <rect x="60" y="130" width="95" height="5" fill={palette.metal} />
      <line x1="63" y1="167" x2="152" y2="48" stroke={palette.metal} strokeWidth="4" />
      <circle cx="140" cy="115" r="10" fill={palette.yellow} stroke={palette.yellowDark} strokeWidth="2" />
    </g>

    {/* Hinges */}
    <rect className="hinge" x="45" y="55" width="20" height="18" rx="3" />
    <rect className="hinge" x="45" y="145" width="20" height="18" rx="3" />
  </svg>
);

// ============================================================================
// LEVELING Animation
// ============================================================================
export const LevelingAnimation: React.FC<AnimationProps> = ({ size = 280 }) => (
  <svg width={size} height={size * 0.75} viewBox="0 0 280 210">
    <style>{`
      @keyframes bubbleFloat {
        0%, 100% { cx: 140; }
        30% { cx: 135; }
        70% { cx: 145; }
      }
      @keyframes levelAdjust {
        0%, 20% { transform: rotate(-3deg); }
        50%, 100% { transform: rotate(0deg); }
      }
      .level { animation: levelAdjust 4s ease-out infinite; transform-origin: 140px 100px; }
      .bubble { animation: bubbleFloat 4s ease-in-out infinite; }
    `}</style>

    {/* Ground */}
    <rect x="0" y="160" width="280" height="50" fill={palette.ground} />

    {/* Surface being leveled */}
    <g className="level">
      <rect x="20" y="110" width="240" height="15" fill={palette.metal} rx="3" />

      {/* Level tool */}
      <g transform="translate(60, 70)">
        <rect x="0" y="0" width="160" height="35" fill={palette.yellow} stroke={palette.yellowDark} strokeWidth="2" rx="5" />
        <rect x="60" y="8" width="40" height="19" fill="#B3E5FC" stroke="#0288D1" strokeWidth="1" rx="4" />
        <line x1="78" y1="8" x2="78" y2="27" stroke="#0288D1" strokeWidth="1" />
        <line x1="82" y1="8" x2="82" y2="27" stroke="#0288D1" strokeWidth="1" />
        <circle className="bubble" cy="17.5" r="6" fill="#4CAF50" />
      </g>
    </g>

    {/* Support posts */}
    <rect x="35" y="125" width="15" height="40" fill={palette.metal} rx="2" />
    <rect x="230" y="125" width="15" height="40" fill={palette.metal} rx="2" />

    {/* Success indicator */}
    <g transform="translate(240, 40)">
      <circle cx="0" cy="0" r="20" fill={palette.success} />
      <path d="M-8 0 L-4 4 L8 -6" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round" />
    </g>
  </svg>
);

// ============================================================================
// CURING Animation
// ============================================================================
export const CuringAnimation: React.FC<AnimationProps> = ({ size = 280 }) => (
  <svg width={size} height={size * 0.75} viewBox="0 0 280 210">
    <style>{`
      @keyframes waterDrop {
        0% { transform: translateY(0); opacity: 1; }
        100% { transform: translateY(60px); opacity: 0; }
      }
      @keyframes clockTick {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      .drop-1 { animation: waterDrop 1.2s ease-in infinite; }
      .drop-2 { animation: waterDrop 1.2s ease-in infinite 0.2s; }
      .drop-3 { animation: waterDrop 1.2s ease-in infinite 0.4s; }
      .clock-hand { animation: clockTick 8s linear infinite; transform-origin: 230px 55px; }
    `}</style>

    {/* Concrete slab */}
    <rect x="20" y="130" width="240" height="50" fill={palette.concrete} rx="3" />

    {/* Plastic cover */}
    <path d="M15 125 Q70 115 140 125 Q210 115 265 125 L265 135 Q210 128 140 135 Q70 128 15 135 Z" fill={palette.water} opacity="0.4" />
    <path d="M15 125 Q70 115 140 125 Q210 115 265 125" stroke="#0288D1" strokeWidth="2" fill="none" />

    {/* Water spray */}
    <g transform="translate(50, 30)">
      <path d="M0 30 Q-20 20 -30 30 Q-50 50 -40 0" stroke="#388E3C" strokeWidth="10" fill="none" strokeLinecap="round" />
      <ellipse cx="0" cy="35" rx="12" ry="8" fill="#2E7D32" />
      <ellipse className="drop-1" cx="-5" cy="45" rx="4" ry="6" fill={palette.water} />
      <ellipse className="drop-2" cx="15" cy="48" rx="3" ry="5" fill={palette.water} />
      <ellipse className="drop-3" cx="35" cy="44" rx="4" ry="6" fill={palette.water} />
    </g>

    {/* Timer */}
    <g transform="translate(200, 25)">
      <circle cx="30" cy="30" r="28" fill="white" stroke={palette.highlight} strokeWidth="3" />
      <circle cx="30" cy="30" r="3" fill={palette.highlight} />
      <line x1="30" y1="8" x2="30" y2="14" stroke={palette.highlight} strokeWidth="2" />
      <line x1="30" y1="46" x2="30" y2="52" stroke={palette.highlight} strokeWidth="2" />
      <line x1="8" y1="30" x2="14" y2="30" stroke={palette.highlight} strokeWidth="2" />
      <line x1="46" y1="30" x2="52" y2="30" stroke={palette.highlight} strokeWidth="2" />
      <line x1="30" y1="30" x2="30" y2="16" stroke={palette.black} strokeWidth="2" strokeLinecap="round" />
      <line className="clock-hand" x1="30" y1="30" x2="30" y2="12" stroke={palette.highlight} strokeWidth="1.5" strokeLinecap="round" />
      <text x="30" y="80" textAnchor="middle" fill={palette.highlight} fontSize="12" fontWeight="bold">7 days</text>
    </g>
  </svg>
);

// ============================================================================
// COMPLETION Animation
// ============================================================================
export const CompletionAnimation: React.FC<AnimationProps> = ({ size = 280 }) => (
  <svg width={size} height={size * 0.75} viewBox="0 0 280 210">
    <style>{`
      @keyframes checkDraw {
        0% { stroke-dashoffset: 120; }
        100% { stroke-dashoffset: 0; }
      }
      @keyframes circleDraw {
        0% { stroke-dashoffset: 380; }
        100% { stroke-dashoffset: 0; }
      }
      @keyframes confetti1 {
        0% { transform: translate(0, 0) rotate(0deg); opacity: 1; }
        100% { transform: translate(-40px, 100px) rotate(360deg); opacity: 0; }
      }
      @keyframes confetti2 {
        0% { transform: translate(0, 0) rotate(0deg); opacity: 1; }
        100% { transform: translate(30px, 110px) rotate(-360deg); opacity: 0; }
      }
      @keyframes starPop {
        0%, 100% { transform: scale(0); opacity: 0; }
        50% { transform: scale(1); opacity: 1; }
      }
      @keyframes bounce {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-10px); }
      }
      .circle-path { stroke-dasharray: 380; animation: circleDraw 1.5s ease-out forwards; }
      .check-path { stroke-dasharray: 120; animation: checkDraw 1s ease-out 0.5s forwards; stroke-dashoffset: 120; }
      .confetti-1 { animation: confetti1 2s ease-out infinite; }
      .confetti-2 { animation: confetti2 2s ease-out infinite 0.3s; }
      .star-1 { animation: starPop 2s ease-out infinite; }
      .star-2 { animation: starPop 2s ease-out infinite 0.4s; }
      .badge { animation: bounce 2s ease-in-out infinite; }
    `}</style>

    {/* Confetti */}
    <rect className="confetti-1" x="140" y="40" width="12" height="12" fill={palette.orange} rx="2" />
    <rect className="confetti-2" x="140" y="40" width="10" height="10" fill={palette.blue} rx="2" />

    {/* Main success circle */}
    <g className="badge" transform="translate(140, 105)">
      <circle cx="0" cy="0" r="60" fill={palette.success} opacity="0.15" />
      <circle className="circle-path" cx="0" cy="0" r="55" fill="none" stroke={palette.success} strokeWidth="6" />
      <path className="check-path" d="M-25 5 L-8 22 L28 -18" fill="none" stroke={palette.success} strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
    </g>

    {/* Stars */}
    <g className="star-1" transform="translate(50, 40)">
      <polygon points="0,-15 4,-5 15,-5 6,2 10,13 0,6 -10,13 -6,2 -15,-5 -4,-5" fill={palette.yellow} />
    </g>
    <g className="star-2" transform="translate(230, 50)">
      <polygon points="0,-12 3,-4 12,-4 5,1.5 8,10 0,5 -8,10 -5,1.5 -12,-4 -3,-4" fill={palette.yellow} />
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
    // Default fallback
    return (
      <svg width={size} height={size * 0.75} viewBox="0 0 280 210">
        <style>{`
          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
          }
          .pulse { animation: pulse 2s ease-in-out infinite; transform-origin: center; }
        `}</style>
        <g className="pulse">
          <circle cx="140" cy="105" r="70" fill={colors.primary[100]} />
          <path d="M100 140 L140 60 L180 140 Z" fill={colors.primary[600]} />
          <circle cx="140" cy="100" r="12" fill={colors.primary[100]} />
        </g>
      </svg>
    );
  }

  return <IllustrationComponent size={size} />;
};
