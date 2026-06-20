/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

/**
 * BrandLogo component rendering a high-fidelity 3D vector isometric
 * hexagonal representation of the "DLL" (Digital Life Lessons) logo with up-arrow.
 */
export default function BrandLogo({ className = 'w-16 h-16', showText = false, textClass = 'text-white' }) {
  return (
    <div className="flex flex-col items-center justify-center text-center">
      <svg 
        viewBox="0 0 120 120" 
        className={className} 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Gradients defined using the exact palette requested by the user */}
          <linearGradient id="leftFaceGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#5C7C89" />
            <stop offset="100%" stopColor="#1F4959" />
          </linearGradient>
          <linearGradient id="rightFaceGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1F4959" />
            <stop offset="100%" stopColor="#011425" />
          </linearGradient>
          <linearGradient id="topFaceGrad" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#5C7C89" />
            <stop offset="100%" stopColor="#1F4959" />
          </linearGradient>
          <linearGradient id="arrowGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#5C7C89" />
          </linearGradient>
          <radialGradient id="glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#5C7C89" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#011425" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Ambient background glow */}
        <circle cx="60" cy="60" r="50" fill="url(#glow)" />

        {/* 3D Isometric Hexagon Group */}
        <g transform="translate(0, 0)">
          
          {/* The Outer Hexagonal Frame / Left Segment (Letter 'D') */}
          <path 
            d="M 60 15 L 20 38 L 20 82 L 40 93 L 40 50 Z" 
            fill="url(#leftFaceGrad)" 
            opacity="0.95"
            stroke="#011425"
            strokeWidth="0.75"
          />
          {/* Sliced inner part to fashion the outer "D" loop */}
          <path 
            d="M 28 43 L 34 39.5 L 34 80 L 28 76.5 Z" 
            fill="#011425" 
            opacity="0.8"
          />

          {/* Upward Pointing Arrow in the central dividing spine */}
          <path 
            d="M 60 15 L 60 45 L 53 45 L 60 30 L 67 45 L 60 45" 
            stroke="url(#arrowGrad)" 
            strokeWidth="3.5" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
          />

          {/* Right Segment (Letters 'L' + 'L' style steps) */}
          <path 
            d="M 60 15 L 100 38 L 100 82 L 80 93 L 80 50 Z" 
            fill="url(#rightFaceGrad)" 
            opacity="0.9"
            stroke="#011425"
            strokeWidth="0.75"
          />

          {/* Isometric "L" Step Cuts (Lower right faces) */}
          <path 
            d="M 60 65 L 80 53 L 80 65 L 60 77 Z" 
            fill="url(#leftFaceGrad)" 
            opacity="0.6"
          />
          <path 
            d="M 80 65 L 100 53 L 100 65 L 80 77 Z" 
            fill="url(#leftFaceGrad)" 
            opacity="0.85"
          />

          {/* Bottom Isometric Platform (Closing Hexagon base) */}
          <path 
            d="M 20 82 L 60 105 L 100 82 L 80 70 L 60 82 L 40 70 Z" 
            fill="url(#topFaceGrad)" 
            opacity="0.8"
            stroke="#011425"
            strokeWidth="0.75"
          />

          {/* Top of Left Column Accent Block */}
          <polygon 
            points="20,38 40,50 60,38 40,26" 
            fill="url(#topFaceGrad)" 
            opacity="0.9" 
            stroke="#011425"
            strokeWidth="0.5"
          />

          {/* Top of Right Column Accent Block */}
          <polygon 
            points="60,38 80,50 100,38 80,26" 
            fill="url(#topFaceGrad)" 
            opacity="0.6" 
            stroke="#011425"
            strokeWidth="0.5"
          />
        </g>
      </svg>
      {showText && (
        <div className="mt-4">
          <h1 className={`text-xl sm:text-2xl font-extrabold tracking-wider uppercase font-sans ${textClass}`}>
            Digital Life Lessons
          </h1>
          <p className="text-[10px] sm:text-xs font-mono font-medium tracking-widest text-[#5C7C89] uppercase mt-1">
            Wisdom • Stories • Growth • Insights
          </p>
        </div>
      )}
    </div>
  );
}
