// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { Box, UnstyledButton, ScrollArea } from '@mantine/core';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';
import styles from './DashboardSubMenu.module.css';

interface SubMenuItem {
  key: string;
  translationKey: string;
  path: string;
}

const usersSubMenu: SubMenuItem[] = [
  { key: 'accounts', translationKey: 'dashboard.users.accounts', path: '/emr/dashboard/users/accounts' },
  { key: 'roles', translationKey: 'dashboard.users.roles', path: '/emr/dashboard/users/roles' },
  { key: 'permissions', translationKey: 'dashboard.users.permissions', path: '/emr/dashboard/users/permissions' },
  { key: 'audit', translationKey: 'dashboard.users.audit', path: '/emr/dashboard/users/audit' },
];

const organizationSubMenu: SubMenuItem[] = [
  { key: 'departments', translationKey: 'dashboard.organization.departments', path: '/emr/dashboard/organization/departments' },
  { key: 'operator-types', translationKey: 'dashboard.organization.operatorTypes', path: '/emr/dashboard/organization/operator-types' },
  { key: 'cash-registers', translationKey: 'dashboard.organization.cashRegisters', path: '/emr/dashboard/organization/cash-registers' },
];

const medicalSubMenu: SubMenuItem[] = [
  { key: 'physical-data', translationKey: 'dashboard.medical.physicalData', path: '/emr/dashboard/medical/physical-data' },
  { key: 'postop-data', translationKey: 'dashboard.medical.postopData', path: '/emr/dashboard/medical/postop-data' },
  { key: 'units', translationKey: 'dashboard.medical.units', path: '/emr/dashboard/medical/units' },
  { key: 'routes', translationKey: 'dashboard.medical.routes', path: '/emr/dashboard/medical/routes' },
  { key: 'ambulatory', translationKey: 'dashboard.medical.ambulatory', path: '/emr/dashboard/medical/ambulatory' },
];

const systemSubMenu: SubMenuItem[] = [
  { key: 'general', translationKey: 'dashboard.system.general', path: '/emr/dashboard/system/general' },
  { key: 'language', translationKey: 'dashboard.system.language', path: '/emr/dashboard/system/language' },
  { key: 'parameters', translationKey: 'dashboard.system.parameters', path: '/emr/dashboard/system/parameters' },
];

export type DashboardCategory = 'users' | 'organization' | 'medical' | 'system';

interface DashboardSubMenuProps {
  category: DashboardCategory;
}

/**
 * DashboardSubMenu - Sub-navigation tabs for Dashboard categories
 *
 * Features:
 * - Turquoise gradient background (matching HorizontalSubMenu)
 * - White active indicator bar
 * - Horizontal scroll support
 * - Multilingual support
 */
export function DashboardSubMenu({ category }: DashboardSubMenuProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const subMenuItems =
    category === 'users'
      ? usersSubMenu
      : category === 'organization'
      ? organizationSubMenu
      : category === 'medical'
      ? medicalSubMenu
      : systemSubMenu;

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <Box className={styles.container} data-testid="dashboard-submenu">
      <ScrollArea
        type="scroll"
        scrollbarSize={0}
        className={styles.scrollArea}
      >
        <Box className={styles.tabContainer}>
          {subMenuItems.map((item) => {
            const active = isActive(item.path);
            return (
              <UnstyledButton
                key={item.key}
                onClick={() => navigate(item.path)}
                className={`${styles.tab} ${active ? styles.active : ''}`}
                data-testid={`dashboard-submenu-${item.key}`}
              >
                <span className={styles.tabLabel}>{t(item.translationKey)}</span>
                {active && <span className={styles.activeBar} />}
              </UnstyledButton>
            );
          })}
        </Box>
      </ScrollArea>
    </Box>
  );
}
