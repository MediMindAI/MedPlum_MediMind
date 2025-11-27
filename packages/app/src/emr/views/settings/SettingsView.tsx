// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { Container, Title, Text, Stack, Tabs, Box } from '@mantine/core';
import { IconUsers, IconBuilding, IconStethoscope, IconSettings } from '@tabler/icons-react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';
import '../../styles/theme.css';

/**
 * Settings Hub - Main settings view with nested two-level tabs
 *
 * Features:
 * - Category tabs (Users, Organization, Medical Data, System)
 * - Sub-tabs contextual to selected category
 * - URL-based tab state
 * - Mobile responsive
 *
 * URL Structure:
 * - /emr/settings → redirects to /users/accounts
 * - /emr/settings/users/* → User management tabs
 * - /emr/settings/organization/* → Organization tabs
 * - /emr/settings/medical/* → Medical data tabs
 * - /emr/settings/system/* → System tabs
 */
export function SettingsView(): JSX.Element {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  // Determine active category from URL path
  const pathSegments = location.pathname.split('/').filter(Boolean);
  const categorySegment = pathSegments[2] || 'users'; // /emr/settings/[category]/[sub]
  const subSegment = pathSegments[3] || '';

  // Category tab value
  const categoryValue = categorySegment;

  // Handle category tab change
  const handleCategoryChange = (value: string | null) => {
    if (!value) return;

    // Navigate to default sub-tab for each category
    const defaultSubTabs: Record<string, string> = {
      users: 'accounts',
      organization: 'departments',
      medical: 'physical-data',
      system: 'general',
    };

    const defaultSub = defaultSubTabs[value] || '';
    navigate(`/emr/settings/${value}/${defaultSub}`);
  };

  // Handle sub-tab change
  const handleSubTabChange = (value: string | null) => {
    if (!value) return;
    navigate(`/emr/settings/${categoryValue}/${value}`);
  };

  // Sub-tabs for each category
  const getUserSubTabs = () => (
    <Tabs.List>
      <Tabs.Tab value="accounts">{t('settings.users.accounts')}</Tabs.Tab>
      <Tabs.Tab value="roles">{t('settings.users.roles')}</Tabs.Tab>
      <Tabs.Tab value="permissions">{t('settings.users.permissions')}</Tabs.Tab>
      <Tabs.Tab value="audit">{t('settings.users.audit')}</Tabs.Tab>
    </Tabs.List>
  );

  const getOrganizationSubTabs = () => (
    <Tabs.List>
      <Tabs.Tab value="departments">{t('settings.organization.departments')}</Tabs.Tab>
      <Tabs.Tab value="operator-types">{t('settings.organization.operatorTypes')}</Tabs.Tab>
      <Tabs.Tab value="cash-registers">{t('settings.organization.cashRegisters')}</Tabs.Tab>
    </Tabs.List>
  );

  const getMedicalSubTabs = () => (
    <Tabs.List>
      <Tabs.Tab value="physical-data">{t('settings.medical.physicalData')}</Tabs.Tab>
      <Tabs.Tab value="postop-data">{t('settings.medical.postopData')}</Tabs.Tab>
      <Tabs.Tab value="units">{t('settings.medical.units')}</Tabs.Tab>
      <Tabs.Tab value="routes">{t('settings.medical.routes')}</Tabs.Tab>
      <Tabs.Tab value="ambulatory">{t('settings.medical.ambulatory')}</Tabs.Tab>
    </Tabs.List>
  );

  const getSystemSubTabs = () => (
    <Tabs.List>
      <Tabs.Tab value="general">{t('settings.system.general')}</Tabs.Tab>
      <Tabs.Tab value="language">{t('settings.system.language')}</Tabs.Tab>
      <Tabs.Tab value="parameters">{t('settings.system.parameters')}</Tabs.Tab>
    </Tabs.List>
  );

  return (
    <Container size="100%" px={{ base: 16, sm: 24, md: 32, lg: 40 }} py={{ base: 20, md: 28 }} style={{ maxWidth: '1600px' }}>
      <Stack gap="lg">
        {/* Page Header */}
        <Stack gap={4}>
          <Title order={1} style={{ fontSize: 'var(--emr-font-2xl)', fontWeight: 700, color: 'var(--emr-text-primary)' }}>
            {t('settings.title')}
          </Title>
          <Text style={{ fontSize: 'var(--emr-font-base)', color: 'var(--emr-text-secondary)' }}>
            {t('settings.subtitle')}
          </Text>
        </Stack>

        {/* Category Tabs (Level 1) */}
        <Tabs
          value={categoryValue}
          onChange={handleCategoryChange}
          variant="pills"
          styles={{
            root: {
              background: 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              borderRadius: '16px',
              padding: '16px 20px',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04), 0 4px 12px rgba(26, 54, 93, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
              border: '1px solid rgba(255, 255, 255, 0.6)',
            },
            list: {
              gap: '10px',
              flexWrap: 'wrap',
            },
            tab: {
              fontSize: '13px',
              fontWeight: 600,
              padding: '10px 18px',
              borderRadius: '10px',
              transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
              '&[data-active]': {
                background: 'var(--emr-gradient-primary)',
                color: 'white',
                boxShadow: '0 4px 12px rgba(26, 54, 93, 0.25)',
              },
              '&:not([data-active]):hover': {
                background: 'rgba(43, 108, 176, 0.08)',
                color: 'var(--emr-primary)',
              },
            },
          }}
        >
          <Tabs.List>
            <Tabs.Tab value="users" leftSection={<IconUsers size={17} stroke={1.8} />}>
              {t('settings.category.users')}
            </Tabs.Tab>
            <Tabs.Tab value="organization" leftSection={<IconBuilding size={17} stroke={1.8} />}>
              {t('settings.category.organization')}
            </Tabs.Tab>
            <Tabs.Tab value="medical" leftSection={<IconStethoscope size={17} stroke={1.8} />}>
              {t('settings.category.medical')}
            </Tabs.Tab>
            <Tabs.Tab value="system" leftSection={<IconSettings size={17} stroke={1.8} />}>
              {t('settings.category.system')}
            </Tabs.Tab>
          </Tabs.List>
        </Tabs>

        {/* Sub-Tabs (Level 2) */}
        <Tabs
          value={subSegment}
          onChange={handleSubTabChange}
          variant="pills"
          styles={{
            root: {
              background: 'rgba(255, 255, 255, 0.6)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              borderRadius: '12px',
              padding: '12px 16px',
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.03), 0 2px 8px rgba(26, 54, 93, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.5)',
            },
            list: {
              gap: '8px',
              flexWrap: 'wrap',
            },
            tab: {
              fontSize: '12px',
              fontWeight: 600,
              padding: '8px 14px',
              borderRadius: '8px',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              '&[data-active]': {
                background: 'var(--emr-gradient-secondary)',
                color: 'white',
                boxShadow: '0 2px 8px rgba(43, 108, 176, 0.2)',
              },
              '&:not([data-active]):hover': {
                background: 'rgba(99, 179, 237, 0.1)',
                color: 'var(--emr-secondary)',
              },
            },
          }}
        >
          {categoryValue === 'users' && getUserSubTabs()}
          {categoryValue === 'organization' && getOrganizationSubTabs()}
          {categoryValue === 'medical' && getMedicalSubTabs()}
          {categoryValue === 'system' && getSystemSubTabs()}
        </Tabs>

        {/* Content Area - Rendered by child routes */}
        <Box>
          <Outlet />
        </Box>
      </Stack>
    </Container>
  );
}
