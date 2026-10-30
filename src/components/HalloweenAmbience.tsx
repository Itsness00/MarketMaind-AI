/**
 * @license
 * SPDX-License-Identifier: MIT
 * MarketMind AI — Halloween Ambience Component
 * Subtle ambient bats, purple/orange glow, and floating fog for the Midnight Market Edition.
 */

import React from 'react';

interface HalloweenAmbienceProps {
  isHalloween: boolean;
}

export const HalloweenAmbience: React.FC<HalloweenAmbienceProps> = ({ isHalloween }) => {
  if (!isHalloween) return null;

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none"
    >
      {/* Ambient Radial Lights */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-[#FF7518]/10 blur-[130px]" />
      <div className="absolute top-1/3 -right-32 w-[32rem] h-[32rem] rounded-full bg-[#9B5DE5]/12 blur-[150px]" />
      <div className="absolute -bottom-40 left-1/3 w-[36rem] h-[36rem] rounded-full bg-[#FF7518]/8 blur-[160px]" />

      {/* Subtle Mist Layer */}
      <div className="absolute inset-0 opacity-20 animate-fog bg-gradient-to-r from-transparent via-[#9B5DE5]/10 to-transparent pointer-events-none" />

      {/* Decorative Bats (Minimal, elegant silhouette SVGs floating calmly) */}
      <div
        className="absolute top-16 left-[12%] opacity-35 animate-bat"
        style={{ animationDelay: '0s', animationDuration: '6s' }}
      >
        <svg width="28" height="16" viewBox="0 0 32 18" fill="none">
          <path
            d="M16 8C13 2 7 1 2 6C6 8 8 13 16 16C24 13 26 8 30 6C25 1 19 2 16 8Z"
            fill="#FF7518"
            opacity="0.8"
          />
        </svg>
      </div>

      <div
        className="absolute top-28 right-[18%] opacity-25 animate-bat"
        style={{ animationDelay: '2.5s', animationDuration: '7.5s' }}
      >
        <svg width="22" height="12" viewBox="0 0 32 18" fill="none">
          <path
            d="M16 8C13 2 7 1 2 6C6 8 8 13 16 16C24 13 26 8 30 6C25 1 19 2 16 8Z"
            fill="#9B5DE5"
            opacity="0.9"
          />
        </svg>
      </div>

      <div
        className="absolute bottom-48 left-[24%] opacity-20 animate-bat"
        style={{ animationDelay: '1.2s', animationDuration: '8s' }}
      >
        <svg width="18" height="10" viewBox="0 0 32 18" fill="none">
          <path
            d="M16 8C13 2 7 1 2 6C6 8 8 13 16 16C24 13 26 8 30 6C25 1 19 2 16 8Z"
            fill="#F4F1EA"
            opacity="0.7"
          />
        </svg>
      </div>
    </div>
  );
};
