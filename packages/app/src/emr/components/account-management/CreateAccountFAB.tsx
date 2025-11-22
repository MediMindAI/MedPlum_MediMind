// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { ActionIcon, Tooltip } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import { useMediaQuery } from '@mantine/hooks';
import { useTranslation } from '../../hooks/useTranslation';

interface CreateAccountFABProps {
  onClick: () => void;
}

/**
 * Floating action button for creating new accounts
 *
 * Features:
 * - Fixed position bottom-right (32px from edges)
 * - Gradient background matching theme
 * - Elevated shadow with hover effect
 * - Hidden on mobile (max-width: 768px)
 * - Tooltip on hover
 * - 60×60px touch-friendly size
 *
 * @param onClick - Callback when FAB is clicked
 * @param onClick.onClick
 */
export function CreateAccountFAB({ onClick }: CreateAccountFABProps): JSX.Element | null {
  const { t } = useTranslation();
  const isMobile = useMediaQuery('(max-width: 768px)');

  // Hide FAB on mobile (use header button instead)
  if (isMobile) {
    return null;
  }

  return (
    <Tooltip label={t('accountManagement.create.title')} position="left" withArrow>
      <ActionIcon
        size={60}
        radius={60}
        variant="filled"
        onClick={onClick}
        style={{
          position: 'fixed',
          bottom: '32px',
          right: '32px',
          background: 'var(--emr-gradient-primary)',
          boxShadow: 'var(--emr-shadow-xl)',
          zIndex: 1000,
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.1)';
          e.currentTarget.style.boxShadow = '0 20px 30px -5px rgba(0, 0, 0, 0.2), 0 10px 15px -5px rgba(0, 0, 0, 0.1)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = 'var(--emr-shadow-xl)';
        }}
        aria-label={t('accountManagement.create.title')}
      >
        <IconPlus size={30} stroke={2.5} color="white" />
      </ActionIcon>
    </Tooltip>
  );
}
