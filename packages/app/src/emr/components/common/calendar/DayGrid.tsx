// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { Box, Grid, Text } from '@mantine/core';
import type { DateCell } from './calendar.types';
import { getWeekdayNames } from './calendar.utils';

interface DayGridProps {
  days: DateCell[];
  onDayClick: (date: Date) => void;
}

/**
 * Grid of days with beautiful styling and animations
 * @param root0
 * @param root0.days
 * @param root0.onDayClick
 */
export function DayGrid({ days, onDayClick }: DayGridProps) {
  const weekdayNames = getWeekdayNames(true);

  const getDayStyles = (cell: DateCell) => {
    const baseStyles: React.CSSProperties = {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '32px',
      borderRadius: '8px',
      fontSize: '13px',
      fontWeight: cell.isToday || cell.isSelected ? 700 : 500,
      cursor: cell.isDisabled ? 'not-allowed' : 'pointer',
      transition: 'all 0.15s ease',
      position: 'relative',
      userSelect: 'none',
      opacity: cell.isOtherMonth ? 0.3 : 1,
    };

    // Disabled state
    if (cell.isDisabled) {
      return {
        ...baseStyles,
        color: 'var(--emr-gray-400)',
        cursor: 'not-allowed',
      };
    }

    // Selected state (highest priority)
    if (cell.isSelected || cell.isRangeStart || cell.isRangeEnd) {
      return {
        ...baseStyles,
        background: 'linear-gradient(135deg, #2b6cb0 0%, #3182ce 100%)',
        color: 'white',
        boxShadow: '0 2px 8px rgba(43, 108, 176, 0.35)',
      };
    }

    // In range (not start/end)
    if (cell.isInRange) {
      return {
        ...baseStyles,
        background: 'linear-gradient(90deg, rgba(43, 108, 176, 0.15) 0%, rgba(49, 130, 206, 0.15) 100%)',
        color: 'var(--emr-primary)',
      };
    }

    // Today (if not selected)
    if (cell.isToday) {
      return {
        ...baseStyles,
        border: '2px solid var(--emr-secondary)',
        background: 'rgba(43, 108, 176, 0.05)',
        color: 'var(--emr-primary)',
      };
    }

    // Weekend
    if (cell.isWeekend) {
      return {
        ...baseStyles,
        color: 'var(--emr-secondary)',
      };
    }

    // Regular day
    return {
      ...baseStyles,
      color: 'var(--emr-text-primary)',
    };
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>, cell: DateCell) => {
    if (cell.isDisabled) {return;}
    const target = e.currentTarget;
    if (!cell.isSelected && !cell.isRangeStart && !cell.isRangeEnd) {
      target.style.background = 'rgba(43, 108, 176, 0.12)';
      target.style.transform = 'scale(1.08)';
      target.style.boxShadow = '0 2px 6px rgba(0, 0, 0, 0.1)';
    }
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>, cell: DateCell) => {
    if (cell.isDisabled) {return;}
    const target = e.currentTarget;
    if (!cell.isSelected && !cell.isRangeStart && !cell.isRangeEnd) {
      if (cell.isInRange) {
        target.style.background =
          'linear-gradient(90deg, rgba(43, 108, 176, 0.15) 0%, rgba(49, 130, 206, 0.15) 100%)';
      } else if (cell.isToday) {
        target.style.background = 'rgba(43, 108, 176, 0.05)';
      } else {
        target.style.background = 'transparent';
      }
      target.style.transform = 'scale(1)';
      target.style.boxShadow = 'none';
    }
  };

  return (
    <Box>
      {/* Weekday Headers */}
      <Grid gutter={4} mb="xs">
        {weekdayNames.map((name) => (
          <Grid.Col key={name} span={12 / 7} style={{ maxWidth: '14.28%' }}>
            <Text
              ta="center"
              size="xs"
              fw={600}
              style={{
                color: 'var(--emr-gray-600)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                fontSize: '11px',
              }}
            >
              {name}
            </Text>
          </Grid.Col>
        ))}
      </Grid>

      {/* Days Grid */}
      <Grid gutter={4}>
        {days.map((cell, index) => (
          <Grid.Col key={index} span={12 / 7} style={{ maxWidth: '14.28%' }}>
            <Box
              onClick={() => !cell.isDisabled && onDayClick(cell.date)}
              style={getDayStyles(cell)}
              onMouseEnter={(e) => handleMouseEnter(e, cell)}
              onMouseLeave={(e) => handleMouseLeave(e, cell)}
            >
              {cell.date.getDate()}
            </Box>
          </Grid.Col>
        ))}
      </Grid>
    </Box>
  );
}
