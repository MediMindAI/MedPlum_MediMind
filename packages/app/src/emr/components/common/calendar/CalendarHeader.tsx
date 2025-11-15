// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { Box, Group, ActionIcon, Text } from '@mantine/core';
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import { CalendarView } from './calendar.types';
import { getMonthName, getDecadeRange } from './calendar.utils';

interface CalendarHeaderProps {
  view: CalendarView;
  displayDate: Date;
  onPrevious: () => void;
  onNext: () => void;
  onHeaderClick: () => void;
}

/**
 * Calendar header with navigation and clickable title
 */
export function CalendarHeader({
  view,
  displayDate,
  onPrevious,
  onNext,
  onHeaderClick,
}: CalendarHeaderProps) {
  const getHeaderText = (): string => {
    switch (view) {
      case 'day':
        return `${getMonthName(displayDate.getMonth())} ${displayDate.getFullYear()}`;
      case 'month':
        return displayDate.getFullYear().toString();
      case 'year':
        return getDecadeRange(displayDate.getFullYear());
      default:
        return '';
    }
  };

  return (
    <Box
      style={{
        marginBottom: '16px',
        paddingBottom: '12px',
        borderBottom: '1px solid var(--emr-gray-200)',
      }}
    >
      <Group justify="space-between" align="center">
        {/* Previous Button */}
        <ActionIcon
          variant="subtle"
          size="lg"
          onClick={onPrevious}
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            transition: 'all 0.2s ease',
            color: 'var(--emr-primary)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--emr-secondary)';
            e.currentTarget.style.color = 'white';
            e.currentTarget.style.transform = 'scale(1.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = 'var(--emr-primary)';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          <IconChevronLeft size={20} stroke={2.5} />
        </ActionIcon>

        {/* Clickable Header Text */}
        <Box
          onClick={view !== 'year' ? onHeaderClick : undefined}
          style={{
            cursor: view !== 'year' ? 'pointer' : 'default',
            padding: '8px 20px',
            borderRadius: '10px',
            transition: 'all 0.2s ease',
            userSelect: 'none',
          }}
          onMouseEnter={(e) => {
            if (view !== 'year') {
              e.currentTarget.style.background =
                'linear-gradient(135deg, rgba(43, 108, 176, 0.1) 0%, rgba(49, 130, 206, 0.1) 100%)';
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <Text
            fw={700}
            size="lg"
            style={{
              color: 'var(--emr-primary)',
              fontSize: '17px',
              letterSpacing: '-0.2px',
            }}
          >
            {getHeaderText()}
          </Text>
        </Box>

        {/* Next Button */}
        <ActionIcon
          variant="subtle"
          size="lg"
          onClick={onNext}
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            transition: 'all 0.2s ease',
            color: 'var(--emr-primary)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--emr-secondary)';
            e.currentTarget.style.color = 'white';
            e.currentTarget.style.transform = 'scale(1.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = 'var(--emr-primary)';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          <IconChevronRight size={20} stroke={2.5} />
        </ActionIcon>
      </Group>
    </Box>
  );
}
