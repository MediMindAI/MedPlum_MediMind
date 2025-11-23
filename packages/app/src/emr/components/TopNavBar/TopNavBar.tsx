// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { Box, Menu, Text, UnstyledButton, Button } from '@mantine/core';
import { IconUser, IconChevronDown, IconDashboard } from '@tabler/icons-react';
import { useMedplum } from '@medplum/react-hooks';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';
import { useEMRPermissions } from '../../hooks/useEMRPermissions';
import { LanguageSelector } from '../LanguageSelector/LanguageSelector';

/**
 * TopNavBar - Row 1 of EMR layout (gray navigation bar, 40px height)
 *
 * Features:
 * - 5 navigation items (currently placeholders)
 * - User menu dropdown on the right
 * - Gray background (#e9ecef)
 */
export function TopNavBar() {
  const medplum = useMedplum();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { isAdmin } = useEMRPermissions();
  const profile = medplum.getProfile();
  const userName = profile?.name?.[0]?.text || 'User';

  return (
    <Box
      style={{
        height: '20px',
        backgroundColor: '#e9ecef',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 0.5rem',
        borderBottom: '1px solid #dee2e6',
      }}
    >
      {/* Left side - Dashboard button and Language selector */}
      <Box style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <Button
          leftSection={<IconDashboard size={10} />}
          size="compact-xs"
          variant="light"
          onClick={() => navigate('/')}
          style={{
            background: 'var(--emr-gradient-primary)',
            color: 'white',
            height: '16px',
            fontSize: '9px',
            padding: '0 6px',
          }}
        >
          {t('topnav.dashboard')}
        </Button>
        <LanguageSelector compact />
      </Box>

      {/* Right side - User menu */}
      <Menu shadow="md" width={200}>
        <Menu.Target>
          <UnstyledButton
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              padding: '0.1rem 0.25rem',
              borderRadius: '2px',
              cursor: 'pointer',
            }}
          >
            <IconUser size={10} />
            <Text size="xs" style={{ fontSize: '9px' }}>{userName}</Text>
            <IconChevronDown size={8} />
          </UnstyledButton>
        </Menu.Target>

        <Menu.Dropdown>
          <Menu.Item disabled>
            <Text size="sm" fw={600}>
              {userName}
            </Text>
          </Menu.Item>
          <Menu.Divider />

          {/* Admin-only menu items */}
          {isAdmin() && (
            <>
              <Menu.Item onClick={() => navigate('/emr/account-management')}>
                {t('topnav.accountManagement')}
              </Menu.Item>
              <Menu.Divider />
            </>
          )}

          <Menu.Item onClick={() => medplum.signOut()}>
            {t('topnav.logout')}
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>
    </Box>
  );
}
