// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { Box, Menu, Text, UnstyledButton } from '@mantine/core';
import { IconUser, IconChevronDown, IconLayoutDashboard, IconLogout } from '@tabler/icons-react';
import { useMedplum } from '@medplum/react-hooks';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';
import { useEMRPermissions } from '../../hooks/useEMRPermissions';
import { LanguageSelector } from '../LanguageSelector/LanguageSelector';
import styles from './TopNavBar.module.css';

/**
 * TopNavBar - Premium top navigation bar
 *
 * Features:
 * - Refined glass-like aesthetic with subtle depth
 * - MediMind branding with logo
 * - Language selector with pill design
 * - Premium user menu dropdown
 */
export function TopNavBar() {
  const medplum = useMedplum();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { isAdmin } = useEMRPermissions();
  const profile = medplum.getProfile();
  const userName = profile?.name?.[0]?.text || 'User';

  return (
    <Box className={styles.topNavBar} data-testid="topnav">
      {/* Left side - Brand and Dashboard */}
      <Box className={styles.leftSection}>
        {/* MediMind Logo/Brand */}
        <Box className={styles.brand} onClick={() => navigate('/')}>
          <Box className={styles.logoIcon}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Box>
          <Text className={styles.brandText}>
            <span className={styles.brandMedi}>Medi</span>
            <span className={styles.brandMind}>Mind</span>
          </Text>
        </Box>

        {/* Vertical Divider */}
        <Box className={styles.divider} />

        {/* Dashboard Button */}
        <UnstyledButton
          className={styles.dashboardBtn}
          onClick={() => navigate('/emr/dashboard')}
        >
          <IconLayoutDashboard size={14} />
          <span>{t('topnav.dashboard')}</span>
        </UnstyledButton>
      </Box>

      {/* Right side - Language and User */}
      <Box className={styles.rightSection}>
        <LanguageSelector />

        {/* Vertical Divider */}
        <Box className={styles.divider} />

        {/* User Menu */}
        <Menu shadow="lg" width={220} position="bottom-end" withArrow arrowPosition="center">
          <Menu.Target>
            <UnstyledButton className={styles.userButton}>
              <Box className={styles.userAvatar}>
                <IconUser size={14} />
              </Box>
              <Text className={styles.userName}>{userName}</Text>
              <IconChevronDown size={12} className={styles.chevron} />
            </UnstyledButton>
          </Menu.Target>

          <Menu.Dropdown className={styles.menuDropdown}>
            <Box className={styles.menuHeader}>
              <Box className={styles.menuHeaderAvatar}>
                <IconUser size={20} />
              </Box>
              <Box>
                <Text fw={600} size="sm">{userName}</Text>
                <Text size="xs" c="dimmed">EMR System</Text>
              </Box>
            </Box>

            <Menu.Divider />

            {/* Admin-only menu items */}
            {isAdmin() && (
              <>
                <Menu.Item
                  leftSection={<IconLayoutDashboard size={16} />}
                  onClick={() => navigate('/emr/dashboard')}
                >
                  {t('topnav.dashboard')}
                </Menu.Item>
                <Menu.Divider />
              </>
            )}

            <Menu.Item
              leftSection={<IconLogout size={16} />}
              onClick={() => medplum.signOut()}
              color="red"
            >
              {t('topnav.logout')}
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Box>
    </Box>
  );
}
