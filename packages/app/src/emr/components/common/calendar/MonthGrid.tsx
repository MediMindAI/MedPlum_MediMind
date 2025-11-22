// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { Box, Grid } from '@mantine/core';
import type { MonthCell } from './calendar.types';

interface MonthGridProps {
  months: MonthCell[];
  onMonthClick: (month: number) => void;
}

/**
 * Grid of months with card-style tiles
 * @param root0
 * @param root0.months
 * @param root0.onMonthClick
 */
export function MonthGrid({ months, onMonthClick }: MonthGridProps) {
  const getMonthStyles = (cell: MonthCell): React.CSSProperties => {
    const baseStyles: React.CSSProperties = {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px',
      borderRadius: '12px',
      fontSize: '14px',
      fontWeight: cell.isSelected || cell.isCurrent ? 700 : 600,
      cursor: cell.isDisabled ? 'not-allowed' : 'pointer',
      transition: 'all 0.2s ease',
      userSelect: 'none',
      border: '1px solid var(--emr-gray-200)',
    };

    if (cell.isDisabled) {
      return {
        ...baseStyles,
        color: 'var(--emr-gray-400)',
        opacity: 0.5,
        cursor: 'not-allowed',
      };
    }

    if (cell.isSelected) {
      return {
        ...baseStyles,
        background: 'linear-gradient(135deg, #2b6cb0 0%, #3182ce 100%)',
        color: 'white',
        boxShadow: '0 4px 12px rgba(43, 108, 176, 0.4)',
        border: 'none',
      };
    }

    if (cell.isCurrent) {
      return {
        ...baseStyles,
        border: '2px solid var(--emr-secondary)',
        background: 'rgba(43, 108, 176, 0.05)',
        color: 'var(--emr-primary)',
      };
    }

    return {
      ...baseStyles,
      background: 'white',
      color: 'var(--emr-text-primary)',
    };
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>, cell: MonthCell) => {
    if (cell.isDisabled) {return;}
    const target = e.currentTarget;
    if (!cell.isSelected) {
      target.style.background =
        'linear-gradient(135deg, rgba(43, 108, 176, 0.15) 0%, rgba(49, 130, 206, 0.15) 100%)';
      target.style.transform = 'translateY(-3px)';
      target.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.12)';
    }
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>, cell: MonthCell) => {
    if (cell.isDisabled) {return;}
    const target = e.currentTarget;
    if (!cell.isSelected) {
      if (cell.isCurrent) {
        target.style.background = 'rgba(43, 108, 176, 0.05)';
      } else {
        target.style.background = 'white';
      }
      target.style.transform = 'translateY(0)';
      target.style.boxShadow = 'none';
    }
  };

  return (
    <Grid gutter="md">
      {months.map((cell) => (
        <Grid.Col key={cell.month} span={3}>
          <Box
            onClick={() => !cell.isDisabled && onMonthClick(cell.month)}
            style={getMonthStyles(cell)}
            onMouseEnter={(e) => handleMouseEnter(e, cell)}
            onMouseLeave={(e) => handleMouseLeave(e, cell)}
          >
            {cell.name.slice(0, 3)}
          </Box>
        </Grid.Col>
      ))}
    </Grid>
  );
}
