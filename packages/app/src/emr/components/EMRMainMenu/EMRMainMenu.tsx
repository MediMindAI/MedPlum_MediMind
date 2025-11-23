// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { Box, UnstyledButton } from '@mantine/core';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  IconUserPlus,
  IconHistory,
  IconList,
  IconSettings,
  IconSend,
  IconChartBar,
} from '@tabler/icons-react';
import { useTranslation } from '../../hooks/useTranslation';
import styles from './EMRMainMenu.module.css';

interface MenuItem {
  key: string;
  translationKey: string;
  path: string;
  icon: React.ReactNode;
}

const menuItems: MenuItem[] = [
  { key: 'registration', translationKey: 'menu.registration', path: '/emr/registration', icon: <IconUserPlus size={15} /> },
  { key: 'patientHistory', translationKey: 'menu.patientHistory', path: '/emr/patient-history', icon: <IconHistory size={15} /> },
  { key: 'nomenclature', translationKey: 'menu.nomenclature', path: '/emr/nomenclature', icon: <IconList size={15} /> },
  { key: 'administration', translationKey: 'menu.administration', path: '/emr/administration', icon: <IconSettings size={15} /> },
  { key: 'forward', translationKey: 'menu.forward', path: '/emr/forward', icon: <IconSend size={15} /> },
  { key: 'reports', translationKey: 'menu.reports', path: '/emr/reports', icon: <IconChartBar size={15} /> },
];

/**
 * EMRMainMenu - Premium horizontal navigation with refined aesthetics
 *
 * Features:
 * - 6 main menu items with icons
 * - Elegant active states with gradient
 * - Smooth hover transitions
 * - Multilingual support
 */
export function EMRMainMenu() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname.startsWith(path);
  };

  return (
    <Box className={styles.menuContainer}>
      {menuItems.map((item) => {
        const active = isActive(item.path);
        return (
          <UnstyledButton
            key={item.key}
            onClick={() => navigate(item.path)}
            className={`${styles.menuItem} ${active ? styles.active : ''}`}
            data-testid={`menu-${item.key}`}
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
