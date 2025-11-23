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
    <Box style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
      {menuItems.map((item) => {
        const active = isActive(item.path);
        return (
          <UnstyledButton
            key={item.key}
            onClick={() => navigate(item.path)}
            style={{
              padding: '6px 14px',
              borderRadius: '6px',
              fontSize: 'var(--emr-font-base)',
              fontWeight: 'var(--emr-font-semibold)',
              cursor: 'pointer',
              color: active ? 'white' : '#374151',
              background: active
                ? 'linear-gradient(135deg, #1a365d 0%, #2b6cb0 50%, #3182ce 100%)'
                : 'transparent',
              transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
              border: 'none',
              boxShadow: active ? '0 3px 8px rgba(26, 54, 93, 0.3)' : 'none',
              transform: active ? 'translateY(-0.5px)' : 'none',
              letterSpacing: '-0.1px',
            }}
            onMouseEnter={(e) => {
              if (!active) {
                e.currentTarget.style.backgroundColor = '#f3f4f6';
                e.currentTarget.style.color = '#1a365d';
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.08)';
              }
            }}
            onMouseLeave={(e) => {
              if (!active) {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#374151';
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = 'none';
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
