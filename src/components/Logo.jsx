import React from 'react';

export const AmenLogo = ({ className = "w-8 h-8" }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="shield-border" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#94a3b8" />
        <stop offset="50%" stopColor="#f8fafc" />
        <stop offset="100%" stopColor="#475569" />
      </linearGradient>
      <linearGradient id="arrow-grad" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#0369a1" />
        <stop offset="50%" stopColor="#0ea5e9" />
        <stop offset="100%" stopColor="#22d3ee" />
      </linearGradient>
      <linearGradient id="bg-grad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#0f172a" />
        <stop offset="100%" stopColor="#082f49" />
      </linearGradient>
    </defs>

    {/* Shield Base */}
    <path d="M50 5 L88 20 V45 C88 75 50 95 50 95 C50 95 12 75 12 45 V20 L50 5 Z" fill="url(#bg-grad)" stroke="url(#shield-border)" strokeWidth="5" strokeLinejoin="round" />
    
    {/* Inner Shield / Network Grid (Simplified) */}
    <path d="M25 40 L45 25 M30 60 L60 30 M45 75 L75 45 M65 25 L80 40 M20 50 L80 50 M50 20 L50 80" stroke="#38bdf8" strokeWidth="1" opacity="0.3" strokeDasharray="2 2" />
    
    {/* Nodes */}
    <circle cx="45" cy="25" r="2" fill="#38bdf8" opacity="0.6"/>
    <circle cx="60" cy="30" r="2" fill="#38bdf8" opacity="0.6"/>
    <circle cx="30" cy="60" r="2" fill="#38bdf8" opacity="0.6"/>
    <circle cx="50" cy="50" r="2" fill="#38bdf8" opacity="0.6"/>

    {/* Upward Arrow (representing the chart/growth in the original logo) */}
    {/* Shadow */}
    <path d="M25 75 L75 25 M75 25 L50 25 M75 25 L75 50" stroke="#000" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" opacity="0.3" transform="translate(1, 2)" />
    {/* Main Arrow */}
    <path d="M25 75 L75 25 M75 25 L50 25 M75 25 L75 50" stroke="url(#arrow-grad)" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
    
    {/* Padlock */}
    {/* Shackle */}
    <path d="M42 70 V62 A 8 8 0 0 1 58 62 V70" stroke="#cbd5e1" strokeWidth="3" fill="none" strokeLinecap="round" />
    {/* Body */}
    <rect x="38" y="70" width="24" height="18" rx="4" fill="#cbd5e1" stroke="#334155" strokeWidth="1" />
    <rect x="38" y="70" width="24" height="18" rx="4" fill="url(#shield-border)" opacity="0.5" />
    {/* Keyhole */}
    <circle cx="50" cy="77" r="2.5" fill="#0f172a" />
    <path d="M49 78 L48 83 h 4 L51 78 Z" fill="#0f172a" />
  </svg>
);
