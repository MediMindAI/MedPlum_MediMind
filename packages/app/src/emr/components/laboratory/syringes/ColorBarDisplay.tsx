// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

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
 * @param root0
 * @param root0.color
 * @param root0.width
 * @param root0.height
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
