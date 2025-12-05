/**
 * Animated Illustrations for Instructions
 * CSS-based animations for construction steps - no images needed!
 */

import React from 'react';
import { colors } from '../../theme/tokens';

interface AnimationProps {
  size?: number;
  color?: string;
}

// Digging/Ground Preparation Animation
export const DiggingAnimation: React.FC<AnimationProps> = ({ size = 200, color = colors.primary[600] }) => (
  <svg width={size} height={size} viewBox="0 0 200 200">
    <style>{`
      @keyframes dig {
        0%, 100% { transform: rotate(0deg) translateY(0); }
        25% { transform: rotate(-20deg) translateY(-10px); }
        50% { transform: rotate(0deg) translateY(0); }
        75% { transform: rotate(15deg) translateY(5px); }
      }
      @keyframes dirt {
        0%, 100% { opacity: 0; transform: translateY(0) scale(1); }
        50% { opacity: 1; transform: translateY(-20px) scale(1.2); }
      }
      .shovel { animation: dig 2s ease-in-out infinite; transform-origin: 100px 150px; }
      .dirt1 { animation: dirt 2s ease-out infinite; }
      .dirt2 { animation: dirt 2s ease-out infinite 0.2s; }
      .dirt3 { animation: dirt 2s ease-out infinite 0.4s; }
    `}</style>
    {/* Ground */}
    <rect x="20" y="140" width="160" height="40" fill="#8B7355" rx="4" />
    <rect x="20" y="135" width="160" height="10" fill="#6B8E23" rx="2" />
    {/* Hole */}
    <ellipse cx="80" cy="145" rx="25" ry="8" fill="#5D4E37" />
    {/* Dirt particles */}
    <circle className="dirt1" cx="60" cy="130" r="6" fill="#8B7355" />
    <circle className="dirt2" cx="75" cy="125" r="4" fill="#A0826D" />
    <circle className="dirt3" cx="90" cy="128" r="5" fill="#8B7355" />
    {/* Shovel */}
    <g className="shovel">
      <rect x="95" y="60" width="8" height="80" fill="#8B4513" rx="2" />
      <path d="M85 140 L115 140 L105 160 L95 160 Z" fill="#708090" />
      <ellipse cx="99" cy="60" rx="12" ry="6" fill="#8B4513" />
    </g>
  </svg>
);

// Post Installation Animation
export const PostInstallAnimation: React.FC<AnimationProps> = ({ size = 200, color = colors.primary[600] }) => (
  <svg width={size} height={size} viewBox="0 0 200 200">
    <style>{`
      @keyframes postDrop {
        0% { transform: translateY(-30px); opacity: 0; }
        30% { transform: translateY(0); opacity: 1; }
        100% { transform: translateY(0); opacity: 1; }
      }
      @keyframes levelBubble {
        0%, 100% { cx: 100; }
        50% { cx: 102; }
      }
      @keyframes checkAppear {
        0%, 70% { opacity: 0; transform: scale(0); }
        100% { opacity: 1; transform: scale(1); }
      }
      .post { animation: postDrop 3s ease-out infinite; }
      .bubble { animation: levelBubble 1s ease-in-out infinite; }
      .check { animation: checkAppear 3s ease-out infinite; transform-origin: center; }
    `}</style>
    {/* Ground */}
    <rect x="20" y="150" width="160" height="30" fill="#8B7355" rx="4" />
    <rect x="20" y="145" width="160" height="8" fill="#6B8E23" rx="2" />
    {/* Hole */}
    <ellipse cx="100" cy="152" rx="20" ry="6" fill="#5D4E37" />
    {/* Post */}
    <g className="post">
      <rect x="90" y="50" width="20" height="110" fill="#DEB887" stroke="#8B4513" strokeWidth="2" rx="2" />
      <rect x="88" y="45" width="24" height="10" fill="#8B4513" rx="2" />
    </g>
    {/* Level tool */}
    <g transform="translate(130, 80)">
      <rect x="0" y="0" width="50" height="12" fill="#FFD700" stroke="#DAA520" strokeWidth="1" rx="2" />
      <rect x="18" y="2" width="14" height="8" fill="#87CEEB" rx="1" />
      <circle className="bubble" cx="25" cy="6" r="3" fill="#32CD32" />
    </g>
    {/* Checkmark */}
    <g className="check" transform="translate(140, 40)">
      <circle cx="20" cy="20" r="18" fill="#22C55E" />
      <path d="M12 20 L18 26 L28 14" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  </svg>
);

// Concrete Mixing Animation
export const ConcreteMixingAnimation: React.FC<AnimationProps> = ({ size = 200, color = colors.primary[600] }) => (
  <svg width={size} height={size} viewBox="0 0 200 200">
    <style>{`
      @keyframes mixerRotate {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      @keyframes pourConcrete {
        0%, 100% { opacity: 0; }
        20%, 80% { opacity: 1; }
      }
      @keyframes splash {
        0%, 100% { transform: scale(1); opacity: 0.7; }
        50% { transform: scale(1.3); opacity: 1; }
      }
      .mixer-blade { animation: mixerRotate 1s linear infinite; transform-origin: 70px 100px; }
      .pour { animation: pourConcrete 3s ease-in-out infinite; }
      .splash1 { animation: splash 0.5s ease-out infinite; }
      .splash2 { animation: splash 0.5s ease-out infinite 0.1s; }
    `}</style>
    {/* Mixer bucket */}
    <ellipse cx="70" cy="70" rx="45" ry="20" fill="#708090" />
    <path d="M25 70 L25 130 Q25 150 70 150 Q115 150 115 130 L115 70" fill="#708090" />
    <ellipse cx="70" cy="130" rx="45" ry="20" fill="#A9A9A9" />
    {/* Concrete inside */}
    <ellipse cx="70" cy="100" rx="35" ry="15" fill="#808080" />
    {/* Mixer blade */}
    <g className="mixer-blade">
      <rect x="67" y="75" width="6" height="50" fill="#2F4F4F" rx="2" />
      <rect x="50" y="97" width="40" height="6" fill="#2F4F4F" rx="2" />
    </g>
    {/* Pour stream */}
    <path className="pour" d="M130 80 Q140 100 135 130 Q130 160 145 170" stroke="#808080" strokeWidth="12" fill="none" strokeLinecap="round" />
    {/* Target area */}
    <rect x="120" y="160" width="60" height="25" fill="#5D4E37" rx="3" />
    <ellipse className="splash1" cx="150" cy="165" rx="20" ry="5" fill="#808080" opacity="0.7" />
    <ellipse className="splash2" cx="150" cy="168" rx="15" ry="3" fill="#A0A0A0" opacity="0.5" />
  </svg>
);

// Fence Panel Attachment Animation
export const PanelAttachAnimation: React.FC<AnimationProps> = ({ size = 200, color = colors.primary[600] }) => (
  <svg width={size} height={size} viewBox="0 0 200 200">
    <style>{`
      @keyframes panelSlide {
        0% { transform: translateX(30px); opacity: 0; }
        50%, 100% { transform: translateX(0); opacity: 1; }
      }
      @keyframes screwIn {
        0%, 50% { transform: rotate(0deg) scale(0); }
        100% { transform: rotate(720deg) scale(1); }
      }
      @keyframes drillVibrate {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-2px); }
        75% { transform: translateX(2px); }
      }
      .panel { animation: panelSlide 3s ease-out infinite; }
      .screw1 { animation: screwIn 3s ease-out infinite; transform-origin: center; }
      .screw2 { animation: screwIn 3s ease-out infinite 0.3s; transform-origin: center; }
      .drill { animation: drillVibrate 0.1s linear infinite; }
    `}</style>
    {/* Posts */}
    <rect x="30" y="40" width="15" height="130" fill="#DEB887" stroke="#8B4513" strokeWidth="2" rx="2" />
    <rect x="155" y="40" width="15" height="130" fill="#DEB887" stroke="#8B4513" strokeWidth="2" rx="2" />
    {/* Panel */}
    <g className="panel">
      <rect x="45" y="60" width="110" height="8" fill="#CD853F" rx="1" />
      <rect x="45" y="90" width="110" height="8" fill="#CD853F" rx="1" />
      <rect x="45" y="120" width="110" height="8" fill="#CD853F" rx="1" />
    </g>
    {/* Screws */}
    <g className="screw1" transform="translate(42, 64)">
      <circle cx="0" cy="0" r="4" fill="#708090" />
      <line x1="-2" y1="0" x2="2" y2="0" stroke="#2F4F4F" strokeWidth="1.5" />
    </g>
    <g className="screw2" transform="translate(42, 94)">
      <circle cx="0" cy="0" r="4" fill="#708090" />
      <line x1="-2" y1="0" x2="2" y2="0" stroke="#2F4F4F" strokeWidth="1.5" />
    </g>
    {/* Drill */}
    <g className="drill" transform="translate(55, 120)">
      <rect x="0" y="-8" width="35" height="16" fill="#FF6B35" rx="3" />
      <rect x="-15" y="-3" width="18" height="6" fill="#708090" rx="1" />
      <circle cx="30" cy="0" r="5" fill="#2F4F4F" />
    </g>
  </svg>
);

// Measuring Animation
export const MeasuringAnimation: React.FC<AnimationProps> = ({ size = 200, color = colors.primary[600] }) => (
  <svg width={size} height={size} viewBox="0 0 200 200">
    <style>{`
      @keyframes tapeExtend {
        0%, 100% { width: 20; }
        50% { width: 120; }
      }
      @keyframes markerDraw {
        0% { stroke-dashoffset: 100; }
        50%, 100% { stroke-dashoffset: 0; }
      }
      @keyframes numberPop {
        0%, 30% { opacity: 0; transform: scale(0); }
        50%, 100% { opacity: 1; transform: scale(1); }
      }
      .tape { animation: tapeExtend 3s ease-in-out infinite; }
      .marker { stroke-dasharray: 100; animation: markerDraw 3s ease-out infinite; }
      .number { animation: numberPop 3s ease-out infinite; transform-origin: center; }
    `}</style>
    {/* Ground line */}
    <line x1="20" y1="150" x2="180" y2="150" stroke="#8B7355" strokeWidth="4" />
    {/* Stakes */}
    <rect x="35" y="130" width="6" height="30" fill="#8B4513" />
    <rect x="159" y="130" width="6" height="30" fill="#8B4513" />
    {/* Tape measure body */}
    <rect x="25" y="95" width="30" height="35" fill="#FFD700" stroke="#DAA520" strokeWidth="2" rx="4" />
    <circle cx="40" cy="112" r="8" fill="#DAA520" />
    {/* Tape */}
    <rect className="tape" x="55" y="108" height="8" fill="#FFD700" stroke="#FFA500" strokeWidth="1" />
    {/* Measurement marks */}
    <line className="marker" x1="40" y1="140" x2="160" y2="140" stroke="#FF0000" strokeWidth="2" strokeDasharray="5,5" />
    {/* Distance number */}
    <g className="number" transform="translate(100, 85)">
      <rect x="-25" y="-15" width="50" height="25" fill="white" stroke={color} strokeWidth="2" rx="4" />
      <text x="0" y="5" textAnchor="middle" fill={color} fontSize="14" fontWeight="bold">10მ</text>
    </g>
  </svg>
);

// Gate Installation Animation
export const GateInstallAnimation: React.FC<AnimationProps> = ({ size = 200, color = colors.primary[600] }) => (
  <svg width={size} height={size} viewBox="0 0 200 200">
    <style>{`
      @keyframes gateSwing {
        0%, 100% { transform: rotate(0deg); }
        50% { transform: rotate(-30deg); }
      }
      @keyframes hingeGlow {
        0%, 100% { fill: #708090; }
        50% { fill: #FFD700; }
      }
      .gate { animation: gateSwing 3s ease-in-out infinite; transform-origin: 45px 100px; }
      .hinge1, .hinge2 { animation: hingeGlow 1.5s ease-in-out infinite; }
      .hinge2 { animation-delay: 0.3s; }
    `}</style>
    {/* Posts */}
    <rect x="30" y="40" width="15" height="130" fill="#DEB887" stroke="#8B4513" strokeWidth="2" rx="2" />
    <rect x="155" y="40" width="15" height="130" fill="#DEB887" stroke="#8B4513" strokeWidth="2" rx="2" />
    {/* Gate */}
    <g className="gate">
      <rect x="45" y="50" width="60" height="100" fill="none" stroke="#2F4F4F" strokeWidth="4" rx="2" />
      <line x1="45" y1="100" x2="105" y2="100" stroke="#2F4F4F" strokeWidth="3" />
      <line x1="75" y1="50" x2="75" y2="150" stroke="#2F4F4F" strokeWidth="3" />
      {/* Handle */}
      <circle cx="95" cy="100" r="5" fill="#FFD700" stroke="#DAA520" strokeWidth="2" />
    </g>
    {/* Hinges */}
    <rect className="hinge1" x="40" y="65" width="10" height="15" rx="2" />
    <rect className="hinge2" x="40" y="120" width="10" height="15" rx="2" />
    {/* Latch on other post */}
    <rect x="155" y="95" width="8" height="12" fill="#708090" rx="1" />
  </svg>
);

// Leveling/Alignment Animation
export const LevelingAnimation: React.FC<AnimationProps> = ({ size = 200, color = colors.primary[600] }) => (
  <svg width={size} height={size} viewBox="0 0 200 200">
    <style>{`
      @keyframes bubbleMove {
        0%, 100% { cx: 100; }
        25% { cx: 95; }
        75% { cx: 105; }
      }
      @keyframes stringVibrate {
        0%, 100% { d: path('M30 100 Q100 98 170 100'); }
        50% { d: path('M30 100 Q100 102 170 100'); }
      }
      @keyframes postAdjust {
        0%, 100% { transform: rotate(0deg); }
        25% { transform: rotate(-2deg); }
        75% { transform: rotate(2deg); }
      }
      .bubble { animation: bubbleMove 2s ease-in-out infinite; }
      .post-adjust { animation: postAdjust 3s ease-in-out infinite; transform-origin: bottom center; }
    `}</style>
    {/* String line */}
    <path d="M30 100 Q100 100 170 100" stroke="#FF0000" strokeWidth="2" fill="none" />
    {/* Posts */}
    <rect x="25" y="60" width="12" height="110" fill="#DEB887" stroke="#8B4513" strokeWidth="2" rx="2" />
    <g className="post-adjust">
      <rect x="94" y="55" width="12" height="115" fill="#DEB887" stroke="#8B4513" strokeWidth="2" rx="2" />
    </g>
    <rect x="163" y="60" width="12" height="110" fill="#DEB887" stroke="#8B4513" strokeWidth="2" rx="2" />
    {/* Level tool */}
    <g transform="translate(60, 130)">
      <rect x="0" y="0" width="80" height="18" fill="#FFD700" stroke="#DAA520" strokeWidth="2" rx="3" />
      <rect x="30" y="4" width="20" height="10" fill="#87CEEB" stroke="#4682B4" strokeWidth="1" rx="2" />
      <circle className="bubble" cx="40" cy="9" r="4" fill="#32CD32" />
    </g>
    {/* Arrows showing adjustment */}
    <path d="M100 45 L100 35 M95 40 L100 35 L105 40" stroke={color} strokeWidth="2" fill="none" />
    <path d="M100 180 L100 190 M95 185 L100 190 L105 185" stroke={color} strokeWidth="2" fill="none" />
  </svg>
);

// Concrete Pouring Animation (for slab)
export const ConcretePourAnimation: React.FC<AnimationProps> = ({ size = 200, color = colors.primary[600] }) => (
  <svg width={size} height={size} viewBox="0 0 200 200">
    <style>{`
      @keyframes truckPour {
        0%, 100% { transform: rotate(0deg); }
        30%, 70% { transform: rotate(-15deg); }
      }
      @keyframes concreteFlow {
        0% { opacity: 0; transform: translateY(-20px); }
        50% { opacity: 1; transform: translateY(0); }
        100% { opacity: 0.5; transform: translateY(10px); }
      }
      @keyframes slabFill {
        0% { width: 0; }
        100% { width: 140; }
      }
      .truck { animation: truckPour 4s ease-in-out infinite; transform-origin: 60px 120px; }
      .flow1 { animation: concreteFlow 0.8s ease-out infinite; }
      .flow2 { animation: concreteFlow 0.8s ease-out infinite 0.2s; }
      .flow3 { animation: concreteFlow 0.8s ease-out infinite 0.4s; }
      .slab-fill { animation: slabFill 4s ease-out infinite; }
    `}</style>
    {/* Form/mold */}
    <rect x="20" y="140" width="160" height="40" fill="none" stroke="#8B4513" strokeWidth="4" />
    {/* Concrete filling */}
    <rect className="slab-fill" x="22" y="142" height="36" fill="#808080" />
    {/* Concrete truck */}
    <g className="truck">
      <ellipse cx="60" cy="90" rx="35" ry="25" fill="#FFD700" stroke="#DAA520" strokeWidth="2" />
      <rect x="30" y="100" width="60" height="25" fill="#FF6B35" rx="3" />
      <circle cx="40" cy="130" r="10" fill="#2F4F4F" />
      <circle cx="80" cy="130" r="10" fill="#2F4F4F" />
      {/* Chute */}
      <rect x="85" y="85" width="40" height="10" fill="#708090" rx="2" transform="rotate(30, 85, 90)" />
    </g>
    {/* Concrete flow */}
    <circle className="flow1" cx="115" cy="110" r="8" fill="#808080" />
    <circle className="flow2" cx="120" cy="120" r="6" fill="#909090" />
    <circle className="flow3" cx="118" cy="130" r="7" fill="#808080" />
  </svg>
);

// Rebar/Reinforcement Animation
export const RebarAnimation: React.FC<AnimationProps> = ({ size = 200, color = colors.primary[600] }) => (
  <svg width={size} height={size} viewBox="0 0 200 200">
    <style>{`
      @keyframes rebarPlace {
        0% { opacity: 0; transform: translateY(-20px); }
        100% { opacity: 1; transform: translateY(0); }
      }
      @keyframes tieWrap {
        0%, 50% { opacity: 0; }
        100% { opacity: 1; }
      }
      .rebar1 { animation: rebarPlace 2s ease-out infinite; }
      .rebar2 { animation: rebarPlace 2s ease-out infinite 0.3s; }
      .rebar3 { animation: rebarPlace 2s ease-out infinite 0.6s; }
      .tie1 { animation: tieWrap 2s ease-out infinite 1s; }
      .tie2 { animation: tieWrap 2s ease-out infinite 1.2s; }
    `}</style>
    {/* Form outline */}
    <rect x="20" y="120" width="160" height="60" fill="#F5DEB3" stroke="#8B4513" strokeWidth="3" />
    {/* Spacers */}
    <rect x="40" y="155" width="10" height="20" fill="#808080" />
    <rect x="95" y="155" width="10" height="20" fill="#808080" />
    <rect x="150" y="155" width="10" height="20" fill="#808080" />
    {/* Rebars - horizontal */}
    <line className="rebar1" x1="30" y1="140" x2="170" y2="140" stroke="#4A4A4A" strokeWidth="6" />
    <line className="rebar2" x1="30" y1="155" x2="170" y2="155" stroke="#4A4A4A" strokeWidth="6" />
    {/* Rebars - vertical */}
    <line className="rebar3" x1="50" y1="130" x2="50" y2="170" stroke="#4A4A4A" strokeWidth="6" />
    <line className="rebar3" x1="100" y1="130" x2="100" y2="170" stroke="#4A4A4A" strokeWidth="6" />
    <line className="rebar3" x1="150" y1="130" x2="150" y2="170" stroke="#4A4A4A" strokeWidth="6" />
    {/* Wire ties */}
    <circle className="tie1" cx="50" cy="140" r="5" fill="none" stroke="#708090" strokeWidth="2" />
    <circle className="tie2" cx="100" cy="155" r="5" fill="none" stroke="#708090" strokeWidth="2" />
    {/* Label */}
    <text x="100" y="115" textAnchor="middle" fill={color} fontSize="12" fontWeight="bold">რკინის ბადე</text>
  </svg>
);

// Smoothing/Finishing Animation
export const SmoothingAnimation: React.FC<AnimationProps> = ({ size = 200, color = colors.primary[600] }) => (
  <svg width={size} height={size} viewBox="0 0 200 200">
    <style>{`
      @keyframes floatMove {
        0%, 100% { transform: translateX(0); }
        50% { transform: translateX(80px); }
      }
      @keyframes surfaceSmooth {
        0% { d: path('M20 130 Q60 125 100 132 Q140 128 180 130'); }
        100% { d: path('M20 130 Q60 130 100 130 Q140 130 180 130'); }
      }
      @keyframes sparkle {
        0%, 100% { opacity: 0; }
        50% { opacity: 1; }
      }
      .float-tool { animation: floatMove 3s ease-in-out infinite; }
      .sparkle1 { animation: sparkle 1s ease-in-out infinite; }
      .sparkle2 { animation: sparkle 1s ease-in-out infinite 0.3s; }
      .sparkle3 { animation: sparkle 1s ease-in-out infinite 0.6s; }
    `}</style>
    {/* Concrete slab base */}
    <rect x="20" y="130" width="160" height="50" fill="#808080" />
    {/* Surface being smoothed */}
    <rect x="20" y="125" width="160" height="10" fill="#909090" rx="2" />
    {/* Float tool */}
    <g className="float-tool">
      <rect x="30" y="100" width="60" height="8" fill="#DEB887" rx="2" />
      <rect x="50" y="70" width="8" height="35" fill="#8B4513" rx="2" />
      <rect x="45" y="65" width="18" height="10" fill="#8B4513" rx="3" />
    </g>
    {/* Sparkles showing smooth finish */}
    <g className="sparkle1" transform="translate(60, 120)">
      <line x1="0" y1="-5" x2="0" y2="5" stroke="white" strokeWidth="2" />
      <line x1="-5" y1="0" x2="5" y2="0" stroke="white" strokeWidth="2" />
    </g>
    <g className="sparkle2" transform="translate(100, 118)">
      <line x1="0" y1="-5" x2="0" y2="5" stroke="white" strokeWidth="2" />
      <line x1="-5" y1="0" x2="5" y2="0" stroke="white" strokeWidth="2" />
    </g>
    <g className="sparkle3" transform="translate(140, 122)">
      <line x1="0" y1="-5" x2="0" y2="5" stroke="white" strokeWidth="2" />
      <line x1="-5" y1="0" x2="5" y2="0" stroke="white" strokeWidth="2" />
    </g>
  </svg>
);

// Curing Animation (water spray)
export const CuringAnimation: React.FC<AnimationProps> = ({ size = 200, color = colors.primary[600] }) => (
  <svg width={size} height={size} viewBox="0 0 200 200">
    <style>{`
      @keyframes waterDrop {
        0% { transform: translateY(0); opacity: 1; }
        100% { transform: translateY(40px); opacity: 0; }
      }
      @keyframes coverSheet {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-3px); }
      }
      .drop1 { animation: waterDrop 1s ease-in infinite; }
      .drop2 { animation: waterDrop 1s ease-in infinite 0.2s; }
      .drop3 { animation: waterDrop 1s ease-in infinite 0.4s; }
      .drop4 { animation: waterDrop 1s ease-in infinite 0.6s; }
      .drop5 { animation: waterDrop 1s ease-in infinite 0.8s; }
      .cover { animation: coverSheet 2s ease-in-out infinite; }
    `}</style>
    {/* Concrete slab */}
    <rect x="20" y="140" width="160" height="40" fill="#808080" rx="3" />
    {/* Plastic cover */}
    <g className="cover">
      <path d="M15 135 Q100 125 185 135 L185 145 Q100 140 15 145 Z" fill="#87CEEB" opacity="0.5" />
      <path d="M15 135 Q100 125 185 135" stroke="#4682B4" strokeWidth="2" fill="none" />
    </g>
    {/* Water drops */}
    <ellipse className="drop1" cx="50" cy="100" rx="4" ry="6" fill="#4682B4" />
    <ellipse className="drop2" cx="80" cy="95" rx="4" ry="6" fill="#4682B4" />
    <ellipse className="drop3" cx="110" cy="100" rx="4" ry="6" fill="#4682B4" />
    <ellipse className="drop4" cx="140" cy="98" rx="4" ry="6" fill="#4682B4" />
    <ellipse className="drop5" cx="165" cy="102" rx="4" ry="6" fill="#4682B4" />
    {/* Water source/hose */}
    <path d="M100 60 Q100 50 90 50 L30 50" stroke="#2F4F4F" strokeWidth="8" fill="none" strokeLinecap="round" />
    <ellipse cx="100" cy="70" rx="15" ry="8" fill="#4682B4" opacity="0.3" />
    {/* Timer/clock */}
    <g transform="translate(160, 60)">
      <circle cx="0" cy="0" r="20" fill="white" stroke={color} strokeWidth="2" />
      <line x1="0" y1="0" x2="0" y2="-12" stroke={color} strokeWidth="2" />
      <line x1="0" y1="0" x2="8" y2="0" stroke={color} strokeWidth="2" />
      <text x="0" y="35" textAnchor="middle" fill={color} fontSize="10">48h</text>
    </g>
  </svg>
);

// Success/Completion Animation
export const CompletionAnimation: React.FC<AnimationProps> = ({ size = 200, color = '#22C55E' }) => (
  <svg width={size} height={size} viewBox="0 0 200 200">
    <style>{`
      @keyframes checkDraw {
        0% { stroke-dashoffset: 100; }
        100% { stroke-dashoffset: 0; }
      }
      @keyframes circleDraw {
        0% { stroke-dashoffset: 320; }
        100% { stroke-dashoffset: 0; }
      }
      @keyframes starBurst {
        0%, 100% { transform: scale(0); opacity: 0; }
        50% { transform: scale(1); opacity: 1; }
      }
      .check-path { stroke-dasharray: 100; animation: checkDraw 1s ease-out forwards; }
      .circle-path { stroke-dasharray: 320; animation: circleDraw 1s ease-out forwards; }
      .star1 { animation: starBurst 2s ease-out infinite; }
      .star2 { animation: starBurst 2s ease-out infinite 0.3s; }
      .star3 { animation: starBurst 2s ease-out infinite 0.6s; }
      .star4 { animation: starBurst 2s ease-out infinite 0.9s; }
    `}</style>
    {/* Main circle */}
    <circle className="circle-path" cx="100" cy="100" r="50" fill="none" stroke={color} strokeWidth="6" />
    {/* Checkmark */}
    <path className="check-path" d="M70 100 L90 120 L130 80" fill="none" stroke={color} strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
    {/* Celebration stars */}
    <g className="star1" transform="translate(40, 50)">
      <polygon points="0,-8 2,-2 8,-2 3,2 5,8 0,4 -5,8 -3,2 -8,-2 -2,-2" fill="#FFD700" />
    </g>
    <g className="star2" transform="translate(160, 60)">
      <polygon points="0,-6 1.5,-1.5 6,-1.5 2.25,1.5 3.75,6 0,3 -3.75,6 -2.25,1.5 -6,-1.5 -1.5,-1.5" fill="#FFD700" />
    </g>
    <g className="star3" transform="translate(150, 150)">
      <polygon points="0,-8 2,-2 8,-2 3,2 5,8 0,4 -5,8 -3,2 -8,-2 -2,-2" fill="#FFD700" />
    </g>
    <g className="star4" transform="translate(50, 140)">
      <polygon points="0,-6 1.5,-1.5 6,-1.5 2.25,1.5 3.75,6 0,3 -3.75,6 -2.25,1.5 -6,-1.5 -1.5,-1.5" fill="#FFD700" />
    </g>
  </svg>
);

// Map of illustration keys to components
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

// Helper component to render the right illustration
interface InstructionIllustrationProps {
  type: string;
  size?: number;
}

export const InstructionIllustration: React.FC<InstructionIllustrationProps> = ({ type, size = 180 }) => {
  const IllustrationComponent = IllustrationMap[type];

  if (!IllustrationComponent) {
    // Default fallback - generic construction icon
    return (
      <svg width={size} height={size} viewBox="0 0 200 200">
        <style>{`
          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
          }
          .pulse { animation: pulse 2s ease-in-out infinite; transform-origin: center; }
        `}</style>
        <g className="pulse">
          <circle cx="100" cy="100" r="60" fill={colors.primary[100]} />
          <path d="M70 130 L100 70 L130 130 Z" fill={colors.primary[600]} />
          <circle cx="100" cy="95" r="8" fill={colors.primary[100]} />
        </g>
      </svg>
    );
  }

  return <IllustrationComponent size={size} />;
};
