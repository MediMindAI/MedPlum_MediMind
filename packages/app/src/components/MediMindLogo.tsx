// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import type { JSX } from 'react';

interface MediMindLogoProps {
  size?: number;
}

export function MediMindLogo({ size = 24 }: MediMindLogoProps): JSX.Element {
  const scale = size / 24;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: `${10 * scale}px`,
        userSelect: 'none',
      }}
    >
      {/* Medical Cross Icon */}
      <div
        style={{
          width: `${32 * scale}px`,
          height: `${32 * scale}px`,
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.1) 100%)',
          borderRadius: `${8 * scale}px`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        }}
      >
        <svg
          width={20 * scale}
          height={20 * scale}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Outer rounded square */}
          <rect
            x="3"
            y="3"
            width="18"
            height="18"
            rx="3"
            stroke="white"
            strokeWidth="2"
            fill="none"
          />
          {/* Medical cross */}
          <path
            d="M12 7V17M7 12H17"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* Brand Text */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          lineHeight: 1,
        }}
      >
        <span
          style={{
            fontSize: `${24 * scale}px`,
            fontWeight: 800,
            color: 'white',
            letterSpacing: '-0.5px',
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
          }}
        >
          Medi
          <span
            style={{
              background: 'linear-gradient(90deg, #63b3ed 0%, #bee3f8 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Mind
          </span>
        </span>
        <span
          style={{
            fontSize: `${10 * scale}px`,
            fontWeight: 600,
            color: 'rgba(255, 255, 255, 0.85)',
            letterSpacing: `${1.5 * scale}px`,
            textTransform: 'uppercase',
            marginTop: `${3 * scale}px`,
          }}
        >
          EMR SYSTEM
        </span>
      </div>
    </div>
  );
}
