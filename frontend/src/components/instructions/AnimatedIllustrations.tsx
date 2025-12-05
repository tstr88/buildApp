/**
 * Animated Illustrations for Instructions
 * Professional, detailed CSS-based animations for construction steps
 * Designed to be clear, instructional, and visually engaging
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
  soil: '#5D4E37',
  wood: '#DEB887',
  woodDark: '#8B4513',
  metal: '#78909C',
  metalDark: '#546E7A',
  concrete: '#9E9E9E',
  concreteDark: '#757575',
  water: '#4FC3F7',
  waterDark: '#0288D1',
  highlight: colors.primary[500],
  highlightLight: colors.primary[100],
  warning: '#FFA726',
  success: '#66BB6A',
  white: '#FFFFFF',
  black: '#212121',
};

// ============================================================================
// MEASURING / PLANNING Animation
// Shows tape measure, stakes, string line, and measurement markers
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
      @keyframes stringWobble {
        0%, 100% { d: path('M50 120 Q140 115 230 120'); }
        50% { d: path('M50 120 Q140 125 230 120'); }
      }
      @keyframes stakeDrive {
        0%, 20% { transform: translateY(-15px); }
        40%, 100% { transform: translateY(0); }
      }
      .tape-body { animation: tapeExtend 3s ease-out infinite; }
      .measure-mark { animation: measurePulse 3s ease-in-out infinite; }
      .measure-mark-2 { animation: measurePulse 3s ease-in-out infinite 0.5s; }
      .measure-mark-3 { animation: measurePulse 3s ease-in-out infinite 1s; }
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
    <g className="measure-mark" transform="translate(85, 55)">
      <rect x="-20" y="-12" width="40" height="24" fill={palette.highlight} rx="4" />
      <text x="0" y="5" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">2.5მ</text>
    </g>
    <g className="measure-mark-2" transform="translate(140, 55)">
      <rect x="-20" y="-12" width="40" height="24" fill={palette.highlight} rx="4" />
      <text x="0" y="5" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">5.0მ</text>
    </g>
    <g className="measure-mark-3" transform="translate(195, 55)">
      <rect x="-20" y="-12" width="40" height="24" fill={palette.highlight} rx="4" />
      <text x="0" y="5" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">7.5მ</text>
    </g>

    {/* Ground markers */}
    <circle cx="85" cy="145" r="4" fill="#E53935" />
    <circle cx="140" cy="145" r="4" fill="#E53935" />
    <circle cx="195" cy="145" r="4" fill="#E53935" />
  </svg>
);

// ============================================================================
// DIGGING Animation
// Shows shovel digging hole with dirt flying, depth marker
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
      @keyframes dirtFly3 {
        0%, 40% { opacity: 0; transform: translate(0, 0); }
        60% { opacity: 1; transform: translate(10px, -35px); }
        100% { opacity: 0; transform: translate(20px, 25px); }
      }
      @keyframes depthPulse {
        0%, 100% { opacity: 0.7; }
        50% { opacity: 1; }
      }
      .shovel { animation: shovelDig 2s ease-in-out infinite; transform-origin: 180px 180px; }
      .dirt-1 { animation: dirtFly1 2s ease-out infinite; }
      .dirt-2 { animation: dirtFly2 2s ease-out infinite; }
      .dirt-3 { animation: dirtFly3 2s ease-out infinite; }
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
      <rect x="155" y="150" width="45" height="22" fill={palette.highlight} rx="3" />
      <text x="177" y="165" textAnchor="middle" fill="white" fontSize="11" fontWeight="bold">60სმ</text>
    </g>

    {/* Dirt pile */}
    <ellipse cx="200" cy="155" rx="35" ry="20" fill={palette.ground} />
    <ellipse cx="200" cy="145" rx="28" ry="15" fill="#9E8B7A" />

    {/* Flying dirt particles */}
    <g transform="translate(100, 120)">
      <circle className="dirt-1" cx="0" cy="0" r="8" fill={palette.ground} />
      <circle className="dirt-2" cx="10" cy="5" r="6" fill="#9E8B7A" />
      <circle className="dirt-3" cx="-5" cy="10" r="7" fill={palette.ground} />
    </g>

    {/* Shovel */}
    <g className="shovel">
      <rect x="165" y="40" width="12" height="120" fill={palette.woodDark} rx="3" />
      <ellipse cx="171" cy="35" rx="18" ry="8" fill={palette.woodDark} />
      <path d="M155 155 L187 155 L175 195 L167 195 Z" fill={palette.metalDark} />
      <path d="M158 155 L184 155 L175 190 L167 190 Z" fill={palette.metal} />
    </g>

    {/* Guide text */}
    <rect x="10" y="10" width="90" height="28" fill={palette.highlightLight} rx="4" />
    <text x="55" y="28" textAnchor="middle" fill={palette.highlight} fontSize="11" fontWeight="bold">გათხარეთ ორმო</text>
  </svg>
);

// ============================================================================
// POST INSTALL Animation
// Shows post being placed in hole with level tool checking vertical
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
      @keyframes arrowBounce {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-5px); }
      }
      .post { animation: postDrop 3s ease-out infinite; }
      .level-tool { animation: levelCheck 3s ease-out infinite; transform-origin: 230px 90px; }
      .bubble { animation: bubbleMove 3s ease-out infinite; }
      .check { animation: checkAppear 3s ease-out infinite; transform-origin: center; }
      .arrow { animation: arrowBounce 1s ease-in-out infinite; }
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
      {/* Post details */}
      <line x1="92" y1="30" x2="92" y2="190" stroke={palette.metalDark} strokeWidth="1" opacity="0.5" />
      <line x1="108" y1="30" x2="108" y2="190" stroke="white" strokeWidth="1" opacity="0.3" />
    </g>

    {/* Level tool */}
    <g className="level-tool">
      <rect x="180" y="60" width="100" height="25" fill="#FDD835" stroke="#F9A825" strokeWidth="2" rx="4" />
      {/* Level vial */}
      <rect x="210" y="67" width="40" height="11" fill="#81D4FA" stroke="#0288D1" strokeWidth="1" rx="3" />
      {/* Center marks */}
      <line x1="228" y1="67" x2="228" y2="78" stroke="#0288D1" strokeWidth="1" />
      <line x1="232" y1="67" x2="232" y2="78" stroke="#0288D1" strokeWidth="1" />
      {/* Bubble */}
      <circle className="bubble" cy="72.5" r="4" fill="#4CAF50" />
    </g>

    {/* Alignment arrows */}
    <g className="arrow" transform="translate(100, 5)">
      <path d="M0 15 L0 5 M-5 10 L0 5 L5 10" stroke={palette.highlight} strokeWidth="2" fill="none" />
    </g>

    {/* Success check */}
    <g className="check" transform="translate(55, 60)">
      <circle cx="0" cy="0" r="20" fill={palette.success} />
      <path d="M-8 0 L-3 5 L8 -6" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </g>

    {/* Instruction label */}
    <rect x="150" y="10" width="120" height="28" fill={palette.highlightLight} rx="4" />
    <text x="210" y="28" textAnchor="middle" fill={palette.highlight} fontSize="11" fontWeight="bold">დონით შეამოწმეთ</text>
  </svg>
);

// ============================================================================
// CONCRETE MIXING Animation
// Shows mixer with rotating drum, concrete being mixed
// ============================================================================
export const ConcreteMixingAnimation: React.FC<AnimationProps> = ({ size = 280 }) => (
  <svg width={size} height={size * 0.75} viewBox="0 0 280 210">
    <defs>
      <linearGradient id="mixerGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#FF7043" />
        <stop offset="100%" stopColor="#E64A19" />
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
      @keyframes ingredientFall {
        0% { transform: translateY(-30px); opacity: 1; }
        100% { transform: translateY(30px); opacity: 0; }
      }
      .drum-blade { animation: drumRotate 1.5s linear infinite; transform-origin: 90px 95px; }
      .mix-content { animation: mixSplash 0.8s ease-in-out infinite; }
      .pour-stream { stroke-dasharray: 50; animation: pourFlow 1s linear infinite; }
      .ingredient { animation: ingredientFall 1.5s ease-in infinite; }
      .ingredient-2 { animation: ingredientFall 1.5s ease-in infinite 0.3s; }
    `}</style>

    {/* Ground */}
    <rect x="0" y="180" width="280" height="30" fill={palette.ground} />

    {/* Mixer drum */}
    <g transform="translate(30, 40)">
      {/* Drum body */}
      <ellipse cx="60" cy="30" rx="55" ry="25" fill="#FF8A65" />
      <ellipse cx="60" cy="110" rx="55" ry="25" fill="#E64A19" />
      <rect x="5" y="30" width="110" height="80" fill="url(#mixerGrad)" />

      {/* Concrete inside */}
      <ellipse className="mix-content" cx="60" cy="70" rx="45" ry="20" fill={palette.concrete} />

      {/* Mixing blade */}
      <g className="drum-blade">
        <rect x="55" y="40" width="10" height="60" fill={palette.metalDark} rx="2" />
        <rect x="35" y="63" width="50" height="8" fill={palette.metalDark} rx="2" />
      </g>

      {/* Drum opening */}
      <ellipse cx="60" cy="30" rx="35" ry="15" fill={palette.concreteDark} />
    </g>

    {/* Ingredients being added */}
    <g transform="translate(70, 20)">
      <rect className="ingredient" x="0" y="0" width="12" height="12" fill="#BCAAA4" rx="2" />
      <rect className="ingredient-2" x="20" y="5" width="10" height="10" fill="#8D6E63" rx="2" />
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
      <ellipse cx="40" cy="8" rx="30" ry="5" fill={palette.concreteDark} />
    </g>

    {/* Mixer stand/wheels */}
    <circle cx="50" cy="175" r="15" fill={palette.metalDark} />
    <circle cx="50" cy="175" r="8" fill={palette.metal} />
    <circle cx="130" cy="175" r="15" fill={palette.metalDark} />
    <circle cx="130" cy="175" r="8" fill={palette.metal} />

    {/* Label */}
    <rect x="10" y="5" width="100" height="25" fill={palette.highlightLight} rx="4" />
    <text x="60" y="22" textAnchor="middle" fill={palette.highlight} fontSize="11" fontWeight="bold">ბეტონის მომზადება</text>
  </svg>
);

// ============================================================================
// PANEL ATTACH Animation
// Shows fence panel being screwed to posts with drill
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
      @keyframes screwSpin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
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

    {/* Left post */}
    <rect x="25" y="30" width="20" height="150" fill={palette.metal} rx="2" />
    <rect x="22" y="25" width="26" height="10" fill={palette.metalDark} rx="2" />

    {/* Right post */}
    <rect x="235" y="30" width="20" height="150" fill={palette.metal} rx="2" />
    <rect x="232" y="25" width="26" height="10" fill={palette.metalDark} rx="2" />

    {/* Fence panels sliding in */}
    <g className="panel">
      {/* Top rail */}
      <rect x="45" y="50" width="190" height="12" fill={palette.wood} rx="2" />
      <rect x="45" y="50" width="190" height="3" fill={palette.woodDark} opacity="0.3" rx="1" />

      {/* Middle rail */}
      <rect x="45" y="95" width="190" height="12" fill={palette.wood} rx="2" />
      <rect x="45" y="95" width="190" height="3" fill={palette.woodDark} opacity="0.3" rx="1" />

      {/* Bottom rail */}
      <rect x="45" y="140" width="190" height="12" fill={palette.wood} rx="2" />
      <rect x="45" y="140" width="190" height="3" fill={palette.woodDark} opacity="0.3" rx="1" />

      {/* Vertical slats */}
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
      <rect x="0" y="-12" width="50" height="24" fill="#FF5722" rx="4" />
      <rect x="50" y="-8" width="15" height="16" fill="#BF360C" rx="2" />
      <rect x="-25" y="-5" width="28" height="10" fill={palette.metalDark} rx="2" />
      <circle cx="45" cy="0" r="8" fill={palette.black} />
      <rect x="65" y="-3" width="20" height="6" fill={palette.black} rx="1" />
    </g>

    {/* Label */}
    <rect x="85" y="5" width="110" height="25" fill={palette.highlightLight} rx="4" />
    <text x="140" y="22" textAnchor="middle" fill={palette.highlight} fontSize="11" fontWeight="bold">პანელების მონტაჟი</text>
  </svg>
);

// ============================================================================
// GATE INSTALL Animation
// Shows gate on hinges, swinging motion
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
        50% { fill: #FDD835; }
      }
      @keyframes handleTurn {
        0%, 60% { transform: rotate(0deg); }
        80%, 100% { transform: rotate(-30deg); }
      }
      .gate { animation: gateSwing 4s ease-in-out infinite; transform-origin: 50px 100px; }
      .hinge { animation: hingeGlow 2s ease-in-out infinite; }
      .handle { animation: handleTurn 4s ease-in-out infinite; transform-origin: 140px 115px; }
    `}</style>

    {/* Ground */}
    <rect x="0" y="175" width="280" height="35" fill={palette.ground} />
    <rect x="0" y="170" width="280" height="8" fill={palette.grass} />

    {/* Left post (hinge post) */}
    <rect x="35" y="30" width="25" height="145" fill={palette.metal} rx="3" />
    <rect x="32" y="25" width="31" height="12" fill={palette.metalDark} rx="2" />

    {/* Right post (latch post) */}
    <rect x="220" y="30" width="25" height="145" fill={palette.metal} rx="3" />
    <rect x="217" y="25" width="31" height="12" fill={palette.metalDark} rx="2" />

    {/* Gate */}
    <g className="gate">
      {/* Gate frame */}
      <rect x="60" y="45" width="95" height="125" fill="none" stroke={palette.metalDark} strokeWidth="6" rx="3" />

      {/* Horizontal bars */}
      <rect x="60" y="70" width="95" height="5" fill={palette.metal} />
      <rect x="60" y="100" width="95" height="5" fill={palette.metal} />
      <rect x="60" y="130" width="95" height="5" fill={palette.metal} />

      {/* Diagonal brace */}
      <line x1="63" y1="167" x2="152" y2="48" stroke={palette.metal} strokeWidth="4" />

      {/* Handle */}
      <g className="handle">
        <circle cx="140" cy="115" r="10" fill="#FDD835" stroke="#F9A825" strokeWidth="2" />
        <rect x="145" y="110" width="15" height="10" fill="#F9A825" rx="2" />
      </g>
    </g>

    {/* Hinges */}
    <rect className="hinge" x="45" y="55" width="20" height="18" rx="3" />
    <rect className="hinge" x="45" y="145" width="20" height="18" rx="3" />

    {/* Latch plate on right post */}
    <rect x="215" y="105" width="15" height="25" fill={palette.metalDark} rx="2" />

    {/* Motion arrows */}
    <g opacity="0.6">
      <path d="M120 35 Q80 25 70 45" stroke={palette.highlight} strokeWidth="2" fill="none" markerEnd="url(#arrowhead)" />
      <path d="M130 35 Q170 25 180 45" stroke={palette.highlight} strokeWidth="2" fill="none" strokeDasharray="4,4" />
    </g>

    {/* Label */}
    <rect x="85" y="5" width="110" height="25" fill={palette.highlightLight} rx="4" />
    <text x="140" y="22" textAnchor="middle" fill={palette.highlight} fontSize="11" fontWeight="bold">კარიბჭის მონტაჟი</text>
  </svg>
);

// ============================================================================
// LEVELING Animation
// Shows level tool on surface, checking alignment
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
      @keyframes checkMark {
        0%, 60% { opacity: 0; stroke-dashoffset: 30; }
        100% { opacity: 1; stroke-dashoffset: 0; }
      }
      .level { animation: levelAdjust 4s ease-out infinite; transform-origin: 140px 100px; }
      .bubble { animation: bubbleFloat 4s ease-in-out infinite; }
      .check-path { stroke-dasharray: 30; animation: checkMark 4s ease-out infinite; }
    `}</style>

    {/* Ground */}
    <rect x="0" y="160" width="280" height="50" fill={palette.ground} />

    {/* Rails/Surface being leveled */}
    <g className="level">
      <rect x="20" y="110" width="240" height="15" fill={palette.metal} rx="3" />
      <rect x="20" y="110" width="240" height="4" fill={palette.metalDark} opacity="0.4" rx="1" />

      {/* Level tool on top */}
      <g transform="translate(60, 70)">
        <rect x="0" y="0" width="160" height="35" fill="#FDD835" stroke="#F9A825" strokeWidth="2" rx="5" />

        {/* Level vials */}
        <rect x="60" y="8" width="40" height="19" fill="#B3E5FC" stroke="#0288D1" strokeWidth="1" rx="4" />
        <line x1="78" y1="8" x2="78" y2="27" stroke="#0288D1" strokeWidth="1" />
        <line x1="82" y1="8" x2="82" y2="27" stroke="#0288D1" strokeWidth="1" />
        <circle className="bubble" cy="17.5" r="6" fill="#4CAF50" />

        {/* End vials */}
        <rect x="10" y="12" width="25" height="11" fill="#B3E5FC" stroke="#0288D1" strokeWidth="1" rx="3" />
        <rect x="125" y="12" width="25" height="11" fill="#B3E5FC" stroke="#0288D1" strokeWidth="1" rx="3" />

        {/* Measurement marks */}
        <line x1="5" y1="35" x2="5" y2="45" stroke="#F9A825" strokeWidth="2" />
        <line x1="155" y1="35" x2="155" y2="45" stroke="#F9A825" strokeWidth="2" />
      </g>
    </g>

    {/* Support posts */}
    <rect x="35" y="125" width="15" height="40" fill={palette.metal} rx="2" />
    <rect x="230" y="125" width="15" height="40" fill={palette.metal} rx="2" />

    {/* Success indicator */}
    <g transform="translate(230, 30)">
      <circle cx="0" cy="0" r="22" fill={palette.success} />
      <path className="check-path" d="M-10 0 L-4 6 L10 -8" stroke="white" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </g>

    {/* Label */}
    <rect x="10" y="10" width="120" height="25" fill={palette.highlightLight} rx="4" />
    <text x="70" y="27" textAnchor="middle" fill={palette.highlight} fontSize="11" fontWeight="bold">გასწორება დონით</text>
  </svg>
);

// ============================================================================
// CONCRETE POUR Animation (for slab)
// Shows concrete truck pouring into formwork
// ============================================================================
export const ConcretePourAnimation: React.FC<AnimationProps> = ({ size = 280 }) => (
  <svg width={size} height={size * 0.75} viewBox="0 0 280 210">
    <style>{`
      @keyframes truckPour {
        0%, 100% { transform: rotate(0deg); }
        20%, 80% { transform: rotate(-12deg); }
      }
      @keyframes concreteFlow {
        0% { stroke-dashoffset: 100; }
        100% { stroke-dashoffset: 0; }
      }
      @keyframes fillLevel {
        0% { height: 5px; }
        100% { height: 35px; }
      }
      @keyframes splash1 { 0%, 100% { transform: scale(1); opacity: 0.8; } 50% { transform: scale(1.3); opacity: 1; } }
      @keyframes splash2 { 0%, 100% { transform: scale(1); opacity: 0.6; } 50% { transform: scale(1.2); opacity: 0.9; } }
      .truck { animation: truckPour 5s ease-in-out infinite; transform-origin: 70px 120px; }
      .flow { stroke-dasharray: 100; animation: concreteFlow 1s linear infinite; }
      .fill { animation: fillLevel 5s ease-out infinite; }
      .splash-1 { animation: splash1 0.6s ease-out infinite; }
      .splash-2 { animation: splash2 0.6s ease-out infinite 0.2s; }
    `}</style>

    {/* Ground */}
    <rect x="0" y="185" width="280" height="25" fill={palette.ground} />

    {/* Formwork */}
    <g transform="translate(120, 140)">
      {/* Outer frame */}
      <rect x="0" y="0" width="150" height="50" fill="none" stroke={palette.woodDark} strokeWidth="6" />
      {/* Inner form */}
      <rect x="5" y="5" width="140" height="40" fill={palette.soil} />
      {/* Concrete filling */}
      <rect className="fill" x="5" y="10" width="140" fill={palette.concrete} />
      {/* Stakes */}
      <rect x="-8" y="-5" width="8" height="60" fill={palette.wood} />
      <rect x="150" y="-5" width="8" height="60" fill={palette.wood} />
    </g>

    {/* Concrete truck */}
    <g className="truck">
      {/* Cab */}
      <rect x="10" y="85" width="45" height="40" fill="#2196F3" rx="5" />
      <rect x="15" y="90" width="25" height="18" fill="#BBDEFB" rx="3" />

      {/* Drum */}
      <ellipse cx="90" cy="70" rx="45" ry="30" fill="#FFC107" />
      <ellipse cx="90" cy="105" rx="45" ry="25" fill="#FFA000" />
      <rect x="45" y="70" width="90" height="35" fill="#FFB300" />

      {/* Drum stripes */}
      <path d="M55 70 L55 105" stroke="#FF8F00" strokeWidth="3" />
      <path d="M75 65 L75 108" stroke="#FF8F00" strokeWidth="3" />
      <path d="M95 63 L95 110" stroke="#FF8F00" strokeWidth="3" />
      <path d="M115 65 L115 108" stroke="#FF8F00" strokeWidth="3" />

      {/* Chute */}
      <rect x="125" y="75" width="55" height="12" fill={palette.metal} rx="2" transform="rotate(20, 125, 81)" />
    </g>

    {/* Concrete flow */}
    <path className="flow" d="M165 95 Q180 120 175 145" stroke={palette.concrete} strokeWidth="18" fill="none" strokeLinecap="round" />

    {/* Splash effects */}
    <ellipse className="splash-1" cx="175" cy="150" rx="15" ry="5" fill={palette.concrete} />
    <ellipse className="splash-2" cx="185" cy="148" rx="10" ry="4" fill={palette.concreteDark} />

    {/* Wheels */}
    <circle cx="30" cy="135" r="12" fill={palette.black} />
    <circle cx="30" cy="135" r="6" fill={palette.metal} />
    <circle cx="75" cy="135" r="12" fill={palette.black} />
    <circle cx="75" cy="135" r="6" fill={palette.metal} />
    <circle cx="105" cy="135" r="12" fill={palette.black} />
    <circle cx="105" cy="135" r="6" fill={palette.metal} />

    {/* Label */}
    <rect x="10" y="10" width="100" height="25" fill={palette.highlightLight} rx="4" />
    <text x="60" y="27" textAnchor="middle" fill={palette.highlight} fontSize="11" fontWeight="bold">ბეტონის ჩასხმა</text>
  </svg>
);

// ============================================================================
// REBAR Animation
// Shows rebar grid being tied together
// ============================================================================
export const RebarAnimation: React.FC<AnimationProps> = ({ size = 280 }) => (
  <svg width={size} height={size * 0.75} viewBox="0 0 280 210">
    <style>{`
      @keyframes rebarPlace {
        0%, 20% { transform: translateY(-20px); opacity: 0; }
        50%, 100% { transform: translateY(0); opacity: 1; }
      }
      @keyframes tiePulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.3); }
      }
      @keyframes wireWrap {
        0%, 40% { stroke-dashoffset: 30; opacity: 0; }
        100% { stroke-dashoffset: 0; opacity: 1; }
      }
      .rebar-h1 { animation: rebarPlace 3s ease-out infinite; }
      .rebar-h2 { animation: rebarPlace 3s ease-out infinite 0.2s; }
      .rebar-h3 { animation: rebarPlace 3s ease-out infinite 0.4s; }
      .rebar-v1 { animation: rebarPlace 3s ease-out infinite 0.6s; }
      .rebar-v2 { animation: rebarPlace 3s ease-out infinite 0.8s; }
      .rebar-v3 { animation: rebarPlace 3s ease-out infinite 1s; }
      .tie { animation: tiePulse 1s ease-in-out infinite; }
      .wire { stroke-dasharray: 30; animation: wireWrap 3s ease-out infinite 1.5s; }
    `}</style>

    {/* Formwork base */}
    <rect x="20" y="130" width="240" height="60" fill={palette.soil} />
    <rect x="15" y="125" width="250" height="10" fill={palette.woodDark} rx="2" />
    <rect x="15" y="185" width="250" height="10" fill={palette.woodDark} rx="2" />
    <rect x="15" y="125" width="10" height="70" fill={palette.woodDark} rx="2" />
    <rect x="255" y="125" width="10" height="70" fill={palette.woodDark} rx="2" />

    {/* Spacers */}
    <rect x="50" y="165" width="15" height="20" fill={palette.concrete} rx="2" />
    <rect x="130" y="165" width="15" height="20" fill={palette.concrete} rx="2" />
    <rect x="210" y="165" width="15" height="20" fill={palette.concrete} rx="2" />

    {/* Horizontal rebars */}
    <rect className="rebar-h1" x="35" y="145" width="210" height="8" fill="#5D4037" rx="4" />
    <rect className="rebar-h2" x="35" y="158" width="210" height="8" fill="#5D4037" rx="4" />
    <rect className="rebar-h3" x="35" y="171" width="210" height="8" fill="#5D4037" rx="4" />

    {/* Vertical rebars */}
    <rect className="rebar-v1" x="55" y="140" width="8" height="45" fill="#6D4C41" rx="4" />
    <rect className="rebar-v2" x="135" y="140" width="8" height="45" fill="#6D4C41" rx="4" />
    <rect className="rebar-v3" x="215" y="140" width="8" height="45" fill="#6D4C41" rx="4" />

    {/* Wire ties */}
    <circle className="tie" cx="59" cy="149" r="6" fill="none" stroke={palette.metal} strokeWidth="2" />
    <circle className="tie" cx="139" cy="162" r="6" fill="none" stroke={palette.metal} strokeWidth="2" />
    <circle className="tie" cx="219" cy="149" r="6" fill="none" stroke={palette.metal} strokeWidth="2" />

    {/* Wire spool */}
    <g transform="translate(30, 40)">
      <ellipse cx="30" cy="20" rx="25" ry="18" fill={palette.metalDark} />
      <ellipse cx="30" cy="20" rx="15" ry="10" fill={palette.metal} />
      <path className="wire" d="M55 20 Q70 30 65 60 Q60 90 70 120" stroke={palette.metal} strokeWidth="2" fill="none" />
    </g>

    {/* Dimension indicator */}
    <g transform="translate(80, 105)">
      <line x1="0" y1="0" x2="120" y2="0" stroke={palette.highlight} strokeWidth="1" />
      <line x1="0" y1="-5" x2="0" y2="5" stroke={palette.highlight} strokeWidth="2" />
      <line x1="120" y1="-5" x2="120" y2="5" stroke={palette.highlight} strokeWidth="2" />
      <rect x="45" y="-12" width="35" height="18" fill={palette.highlight} rx="3" />
      <text x="62" y="2" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">15სმ</text>
    </g>

    {/* Label */}
    <rect x="140" y="10" width="130" height="25" fill={palette.highlightLight} rx="4" />
    <text x="205" y="27" textAnchor="middle" fill={palette.highlight} fontSize="11" fontWeight="bold">არმატურის მოწყობა</text>
  </svg>
);

// ============================================================================
// SMOOTHING Animation
// Shows float tool smoothing concrete surface
// ============================================================================
export const SmoothingAnimation: React.FC<AnimationProps> = ({ size = 280 }) => (
  <svg width={size} height={size * 0.75} viewBox="0 0 280 210">
    <style>{`
      @keyframes floatMove {
        0%, 100% { transform: translateX(0); }
        50% { transform: translateX(120px); }
      }
      @keyframes surfaceSmooth {
        0% { d: path('M30 120 Q80 115 140 125 Q200 118 250 120'); }
        50% { d: path('M30 120 Q80 120 140 120 Q200 120 250 120'); }
        100% { d: path('M30 120 Q80 120 140 120 Q200 120 250 120'); }
      }
      @keyframes sparkle {
        0%, 100% { opacity: 0; transform: scale(0.5); }
        50% { opacity: 1; transform: scale(1); }
      }
      @keyframes ripple {
        0% { r: 3; opacity: 1; }
        100% { r: 15; opacity: 0; }
      }
      .float-tool { animation: floatMove 4s ease-in-out infinite; }
      .sparkle-1 { animation: sparkle 2s ease-in-out infinite; }
      .sparkle-2 { animation: sparkle 2s ease-in-out infinite 0.5s; }
      .sparkle-3 { animation: sparkle 2s ease-in-out infinite 1s; }
      .ripple { animation: ripple 1.5s ease-out infinite; }
    `}</style>

    {/* Formwork sides */}
    <rect x="15" y="115" width="10" height="60" fill={palette.woodDark} rx="2" />
    <rect x="255" y="115" width="10" height="60" fill={palette.woodDark} rx="2" />

    {/* Concrete slab */}
    <rect x="25" y="120" width="230" height="55" fill={palette.concrete} />

    {/* Smooth surface layer */}
    <rect x="25" y="115" width="230" height="12" fill={palette.concreteDark} rx="1" />

    {/* Float tool */}
    <g className="float-tool" transform="translate(30, 60)">
      {/* Handle */}
      <rect x="30" y="0" width="12" height="50" fill={palette.wood} rx="3" />
      <ellipse cx="36" cy="0" rx="10" ry="6" fill={palette.woodDark} />

      {/* Float pad */}
      <rect x="0" y="48" width="80" height="12" fill={palette.wood} rx="2" />
      <rect x="0" y="58" width="80" height="4" fill={palette.metal} rx="1" />
    </g>

    {/* Ripple effect under float */}
    <circle className="ripple" cx="70" cy="120" fill="none" stroke={palette.concreteDark} strokeWidth="1" />

    {/* Sparkles showing smooth finish */}
    <g className="sparkle-1" transform="translate(100, 110)">
      <line x1="0" y1="-8" x2="0" y2="8" stroke="white" strokeWidth="2" />
      <line x1="-8" y1="0" x2="8" y2="0" stroke="white" strokeWidth="2" />
      <line x1="-5" y1="-5" x2="5" y2="5" stroke="white" strokeWidth="1.5" />
      <line x1="5" y1="-5" x2="-5" y2="5" stroke="white" strokeWidth="1.5" />
    </g>
    <g className="sparkle-2" transform="translate(170, 108)">
      <line x1="0" y1="-6" x2="0" y2="6" stroke="white" strokeWidth="2" />
      <line x1="-6" y1="0" x2="6" y2="0" stroke="white" strokeWidth="2" />
    </g>
    <g className="sparkle-3" transform="translate(230, 112)">
      <line x1="0" y1="-8" x2="0" y2="8" stroke="white" strokeWidth="2" />
      <line x1="-8" y1="0" x2="8" y2="0" stroke="white" strokeWidth="2" />
      <line x1="-5" y1="-5" x2="5" y2="5" stroke="white" strokeWidth="1.5" />
      <line x1="5" y1="-5" x2="-5" y2="5" stroke="white" strokeWidth="1.5" />
    </g>

    {/* Direction arrow */}
    <g transform="translate(140, 35)">
      <path d="M-30 0 L30 0 M20 -8 L30 0 L20 8" stroke={palette.highlight} strokeWidth="3" fill="none" strokeLinecap="round" />
    </g>

    {/* Label */}
    <rect x="10" y="5" width="130" height="25" fill={palette.highlightLight} rx="4" />
    <text x="75" y="22" textAnchor="middle" fill={palette.highlight} fontSize="11" fontWeight="bold">ზედაპირის გასწორება</text>
  </svg>
);

// ============================================================================
// CURING Animation
// Shows water being sprayed, plastic covering, timer
// ============================================================================
export const CuringAnimation: React.FC<AnimationProps> = ({ size = 280 }) => (
  <svg width={size} height={size * 0.75} viewBox="0 0 280 210">
    <style>{`
      @keyframes waterDrop {
        0% { transform: translateY(0); opacity: 1; }
        100% { transform: translateY(60px); opacity: 0; }
      }
      @keyframes coverWave {
        0%, 100% { d: path('M20 100 Q70 95 140 100 Q210 105 260 100'); }
        50% { d: path('M20 100 Q70 105 140 100 Q210 95 260 100'); }
      }
      @keyframes clockTick {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      @keyframes sprayPulse {
        0%, 100% { opacity: 0.5; }
        50% { opacity: 1; }
      }
      .drop-1 { animation: waterDrop 1.2s ease-in infinite; }
      .drop-2 { animation: waterDrop 1.2s ease-in infinite 0.15s; }
      .drop-3 { animation: waterDrop 1.2s ease-in infinite 0.3s; }
      .drop-4 { animation: waterDrop 1.2s ease-in infinite 0.45s; }
      .drop-5 { animation: waterDrop 1.2s ease-in infinite 0.6s; }
      .drop-6 { animation: waterDrop 1.2s ease-in infinite 0.75s; }
      .clock-hand { animation: clockTick 8s linear infinite; transform-origin: 230px 55px; }
      .spray { animation: sprayPulse 0.5s ease-in-out infinite; }
    `}</style>

    {/* Concrete slab */}
    <rect x="20" y="130" width="240" height="50" fill={palette.concrete} rx="3" />

    {/* Plastic cover */}
    <path d="M15 125 Q70 115 140 125 Q210 115 265 125 L265 135 Q210 128 140 135 Q70 128 15 135 Z" fill="#4FC3F7" opacity="0.4" />
    <path d="M15 125 Q70 115 140 125 Q210 115 265 125" stroke="#0288D1" strokeWidth="2" fill="none" />

    {/* Water spray from hose */}
    <g transform="translate(50, 30)">
      {/* Hose */}
      <path d="M0 30 Q-20 20 -30 30 Q-50 50 -40 0" stroke="#388E3C" strokeWidth="10" fill="none" strokeLinecap="round" />
      <ellipse cx="0" cy="35" rx="12" ry="8" fill="#2E7D32" />

      {/* Spray pattern */}
      <g className="spray">
        <ellipse cx="15" cy="50" rx="40" ry="15" fill={palette.water} opacity="0.3" />
      </g>

      {/* Water drops */}
      <ellipse className="drop-1" cx="-5" cy="45" rx="4" ry="6" fill={palette.water} />
      <ellipse className="drop-2" cx="10" cy="42" rx="3" ry="5" fill={palette.water} />
      <ellipse className="drop-3" cx="25" cy="48" rx="4" ry="6" fill={palette.water} />
      <ellipse className="drop-4" cx="40" cy="44" rx="3" ry="5" fill={palette.water} />
      <ellipse className="drop-5" cx="55" cy="50" rx="4" ry="6" fill={palette.water} />
      <ellipse className="drop-6" cx="70" cy="46" rx="3" ry="5" fill={palette.water} />
    </g>

    {/* Timer/Clock */}
    <g transform="translate(200, 25)">
      <circle cx="30" cy="30" r="28" fill="white" stroke={palette.highlight} strokeWidth="3" />
      <circle cx="30" cy="30" r="3" fill={palette.highlight} />
      {/* Hour marks */}
      <line x1="30" y1="8" x2="30" y2="14" stroke={palette.highlight} strokeWidth="2" />
      <line x1="30" y1="46" x2="30" y2="52" stroke={palette.highlight} strokeWidth="2" />
      <line x1="8" y1="30" x2="14" y2="30" stroke={palette.highlight} strokeWidth="2" />
      <line x1="46" y1="30" x2="52" y2="30" stroke={palette.highlight} strokeWidth="2" />
      {/* Hands */}
      <line x1="30" y1="30" x2="30" y2="16" stroke={palette.black} strokeWidth="2" strokeLinecap="round" />
      <line className="clock-hand" x1="30" y1="30" x2="30" y2="12" stroke={palette.highlight} strokeWidth="1.5" strokeLinecap="round" />
      {/* Label */}
      <text x="30" y="80" textAnchor="middle" fill={palette.highlight} fontSize="14" fontWeight="bold">7 დღე</text>
    </g>

    {/* Label */}
    <rect x="10" y="5" width="120" height="25" fill={palette.highlightLight} rx="4" />
    <text x="70" y="22" textAnchor="middle" fill={palette.highlight} fontSize="11" fontWeight="bold">გამაგრება / მოვლა</text>
  </svg>
);

// ============================================================================
// COMPLETION Animation
// Success celebration with checkmark and confetti
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
      @keyframes confetti3 {
        0% { transform: translate(0, 0) rotate(0deg); opacity: 1; }
        100% { transform: translate(-60px, 90px) rotate(180deg); opacity: 0; }
      }
      @keyframes confetti4 {
        0% { transform: translate(0, 0) rotate(0deg); opacity: 1; }
        100% { transform: translate(50px, 95px) rotate(-180deg); opacity: 0; }
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
      .confetti-3 { animation: confetti3 2s ease-out infinite 0.6s; }
      .confetti-4 { animation: confetti4 2s ease-out infinite 0.9s; }
      .star-1 { animation: starPop 2s ease-out infinite; }
      .star-2 { animation: starPop 2s ease-out infinite 0.4s; }
      .star-3 { animation: starPop 2s ease-out infinite 0.8s; }
      .star-4 { animation: starPop 2s ease-out infinite 1.2s; }
      .badge { animation: bounce 2s ease-in-out infinite; }
    `}</style>

    {/* Confetti pieces */}
    <rect className="confetti-1" x="140" y="40" width="12" height="12" fill="#FF5722" rx="2" />
    <rect className="confetti-2" x="140" y="40" width="10" height="10" fill="#2196F3" rx="2" />
    <rect className="confetti-3" x="140" y="40" width="14" height="8" fill="#4CAF50" rx="2" />
    <rect className="confetti-4" x="140" y="40" width="8" height="14" fill="#FFC107" rx="2" />

    {/* Main success circle */}
    <g className="badge" transform="translate(140, 105)">
      <circle cx="0" cy="0" r="60" fill={palette.success} opacity="0.15" />
      <circle className="circle-path" cx="0" cy="0" r="55" fill="none" stroke={palette.success} strokeWidth="6" />
      <path className="check-path" d="M-25 5 L-8 22 L28 -18" fill="none" stroke={palette.success} strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
    </g>

    {/* Stars */}
    <g className="star-1" transform="translate(50, 40)">
      <polygon points="0,-15 4,-5 15,-5 6,2 10,13 0,6 -10,13 -6,2 -15,-5 -4,-5" fill="#FFC107" />
    </g>
    <g className="star-2" transform="translate(230, 50)">
      <polygon points="0,-12 3,-4 12,-4 5,1.5 8,10 0,5 -8,10 -5,1.5 -12,-4 -3,-4" fill="#FFC107" />
    </g>
    <g className="star-3" transform="translate(60, 160)">
      <polygon points="0,-10 2.5,-3.5 10,-3.5 4,1 6.5,8 0,4 -6.5,8 -4,1 -10,-3.5 -2.5,-3.5" fill="#FFC107" />
    </g>
    <g className="star-4" transform="translate(220, 155)">
      <polygon points="0,-12 3,-4 12,-4 5,1.5 8,10 0,5 -8,10 -5,1.5 -12,-4 -3,-4" fill="#FFC107" />
    </g>

    {/* Success text */}
    <text x="140" y="195" textAnchor="middle" fill={palette.success} fontSize="16" fontWeight="bold">დასრულებულია!</text>
  </svg>
);

// ============================================================================
// Map of illustration keys to components
// ============================================================================
export const IllustrationMap: Record<string, React.FC<AnimationProps>> = {
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
    // Default fallback - generic construction icon
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
          <text x="140" y="170" textAnchor="middle" fill={colors.primary[600]} fontSize="12">ილუსტრაცია</text>
        </g>
      </svg>
    );
  }

  return <IllustrationComponent size={size} />;
};
