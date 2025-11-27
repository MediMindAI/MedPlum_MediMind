// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { Box, UnstyledButton } from '@mantine/core';
import { useNavigate, useLocation } from 'react-router-dom';
import { IconArrowLeft, IconUsers, IconBuilding, IconStethoscope, IconSettings } from '@tabler/icons-react';
import { useTranslation } from '../../hooks/useTranslation';
import styles from './DashboardMenu.module.css';

interface DashboardMenuItem {
  key: string;
  translationKey: string;
  path: string;
  icon: React.ReactNode;
}

const menuItems: DashboardMenuItem[] = [
  { key: 'users', translationKey: 'dashboard.category.users', path: '/emr/dashboard/users', icon: <IconUsers size={15} /> },
  { key: 'organization', translationKey: 'dashboard.category.organization', path: '/emr/dashboard/organization', icon: <IconBuilding size={15} /> },
  { key: 'medical', translationKey: 'dashboard.category.medical', path: '/emr/dashboard/medical', icon: <IconStethoscope size={15} /> },
  { key: 'system', translationKey: 'dashboard.category.system', path: '/emr/dashboard/system', icon: <IconSettings size={15} /> },
];

/**
 * DashboardMenu - Category navigation for Dashboard mode
 *
 * Features:
 * - Back button to return to general EMR mode
 * - 4 category tabs (Users, Organization, Medical Data, System)
 * - Same styling as EMRMainMenu for consistency
 * - Multilingual support
 */
export function DashboardMenu() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname.startsWith(path);
  };

  const handleBack = () => {
    navigate('/emr/registration');
  };

  return (
    <Box className={styles.menuContainer}>
      {/* Back Button */}
      <UnstyledButton
        onClick={handleBack}
        className={styles.backButton}
        data-testid="dashboard-back"
      >
        <IconArrowLeft size={16} />
        <span className={styles.backLabel}>{t('dashboard.back')}</span>
      </UnstyledButton>

      {/* Separator */}
      <Box className={styles.separator} />

      {/* Category Items */}
      {menuItems.map((item) => {
        const active = isActive(item.path);
        return (
          <UnstyledButton
            key={item.key}
            onClick={() => navigate(item.path)}
            className={`${styles.menuItem} ${active ? styles.active : ''}`}
            data-testid={`dashboard-menu-${item.key}`}
          >
            <span className={styles.menuIcon}>{item.icon}</span>
            <span className={styles.menuLabel}>{t(item.translationKey)}</span>
            {active && <span className={styles.activeIndicator} />}
          </UnstyledButton>
        );
      })}
    </Box>
  );
}
