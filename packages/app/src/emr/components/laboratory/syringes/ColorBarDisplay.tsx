/**
 * Color Bar Display Component
 *
 * Displays a colored bar/stripe for visual representation of tube/container colors.
 * Matches the original EMR design with filled color rectangles.
 */

import React from 'react';
import { Box } from '@mantine/core';

interface ColorBarDisplayProps {
  /** Hex color code (e.g., "#8A2BE2") */
  color: string;
  /** Width of the color bar */
  width?: string | number;
  /** Height of the color bar */
  height?: string | number;
}

/**
 * ColorBarDisplay Component
 */
export function ColorBarDisplay({ color, width = '100%', height = 24 }: ColorBarDisplayProps): JSX.Element {
  return (
    <Box
      style={{
        width,
        height,
        backgroundColor: color,
        border: '1px solid #dee2e6',
        borderRadius: '4px',
        display: 'inline-block',
      }}
    />
  );
}
