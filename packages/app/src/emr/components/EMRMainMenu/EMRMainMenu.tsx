// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { Box, UnstyledButton } from '@mantine/core';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';

interface MenuItem {
  key: string;
  translationKey: string;
  path: string;
}

const menuItems: MenuItem[] = [
  { key: 'registration', translationKey: 'menu.registration', path: '/emr/registration' },
  { key: 'patientHistory', translationKey: 'menu.patientHistory', path: '/emr/patient-history' },
  { key: 'nomenclature', translationKey: 'menu.nomenclature', path: '/emr/nomenclature' },
  { key: 'administration', translationKey: 'menu.administration', path: '/emr/administration' },
  { key: 'forward', translationKey: 'menu.forward', path: '/emr/forward' },
  { key: 'reports', translationKey: 'menu.reports', path: '/emr/reports' },
];

/**
 * EMRMainMenu - Row 2 left side (horizontal main menu with 6 items)
 *
 * Features:
 * - 6 main menu items
 * - Blue gradient active states
 * - Navigation to main sections
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
    <Box style={{ display: 'flex', gap: '0.5rem' }}>
      {menuItems.map((item) => {
        const active = isActive(item.path);
        return (
          <UnstyledButton
            key={item.key}
            onClick={() => navigate(item.path)}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
              color: active ? 'white' : '#495057',
              background: active
                ? 'linear-gradient(135deg, #1a365d 0%, #2b6cb0 50%, #3182ce 100%)'
                : 'transparent',
              transition: 'all 0.2s ease',
              border: 'none',
            }}
            onMouseEnter={(e) => {
              if (!active) {
                e.currentTarget.style.backgroundColor = '#f1f3f5';
              }
            }}
            onMouseLeave={(e) => {
              if (!active) {
                e.currentTarget.style.backgroundColor = 'transparent';
              }
            }}
          >
            {t(item.translationKey)}
          </UnstyledButton>
        );
      })}
    </Box>
  );
}
