// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import type { MantineColorScheme } from '@mantine/core';
import {
  Avatar,
  Box,
  Group,
  Menu,
  SegmentedControl,
  Stack,
  Text,
  useMantineColorScheme,
} from '@mantine/core';
import type { ProfileResource } from '@medplum/core';
import { getReferenceString, locationUtils } from '@medplum/core';
import type { HumanName } from '@medplum/fhirtypes';
import { useMedplumContext } from '@medplum/react-hooks';
import {
  IconLogout,
  IconSettings,
  IconSwitchHorizontal,
  IconDashboard,
  IconSun,
  IconMoon,
  IconDeviceDesktop,
} from '@tabler/icons-react';
import type { JSX } from 'react';
import { HumanNameDisplay } from '../HumanNameDisplay/HumanNameDisplay';
import { ResourceAvatar } from '../ResourceAvatar/ResourceAvatar';
import { getAppName } from '../utils/app';

// EMR Theme Colors (from THEME_COLORS.md)
const THEME = {
  primary: '#1a365d',
  secondary: '#2b6cb0',
  accent: '#63b3ed',
  lightAccent: '#bee3f8',
  gradientPrimary: 'linear-gradient(135deg, #1a365d 0%, #2b6cb0 50%, #3182ce 100%)',
  gradientSecondary: 'linear-gradient(135deg, #2b6cb0 0%, #3182ce 50%, #63b3ed 100%)',
  gray50: '#f9fafb',
  gray100: '#f3f4f6',
  gray200: '#e5e7eb',
  gray500: '#6b7280',
  gray800: '#1f2937',
  white: '#ffffff',
  danger: '#dc2626',
};

export interface HeaderDropdownProps {
  readonly version?: string;
}

export function HeaderDropdown(props: HeaderDropdownProps): JSX.Element {
  const context = useMedplumContext();
  const { medplum, profile, navigate } = context;
  const logins = medplum.getLogins();
  const { colorScheme, setColorScheme } = useMantineColorScheme();

  // Consistent menu item style using theme
  const menuItemStyle = {
    borderRadius: '6px',
    margin: '2px 6px',
    transition: 'all 0.15s ease',
  };

  // Icon container style using theme colors
  const iconStyle = (bgColor: string) => ({
    width: 32,
    height: 32,
    borderRadius: '6px',
    backgroundColor: bgColor,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  });

  return (
    <>
      {/* Profile Header with EMR gradient */}
      <Box
        style={{
          background: THEME.gradientPrimary,
          padding: '20px 24px',
        }}
      >
        <Stack align="center" gap={8}>
          <Box
            style={{
              padding: '2px',
              borderRadius: '50%',
              background: THEME.accent,
            }}
          >
            <ResourceAvatar
              size={60}
              radius={100}
              value={context.profile}
              style={{ border: `2px solid ${THEME.white}` }}
            />
          </Box>
          <Text size="md" fw={600} c="white" ta="center">
            <HumanNameDisplay value={context.profile?.name?.[0] as HumanName} />
          </Text>
          <Text size="xs" c={THEME.lightAccent}>
            {medplum.getActiveLogin()?.project.display}
          </Text>
        </Stack>
      </Box>

      {/* Multiple logins section */}
      {logins.length > 1 && (
        <>
          <Text size="xs" c={THEME.gray500} fw={600} px="md" py="xs" tt="uppercase">
            Switch Account
          </Text>
          {logins.map(
            (login) =>
              login.profile.reference !== getReferenceString(context.profile as ProfileResource) && (
                <Menu.Item
                  key={login.profile.reference}
                  style={menuItemStyle}
                  onClick={() => {
                    medplum
                      .setActiveLogin(login)
                      .then(() => locationUtils.reload())
                      .catch(console.log);
                  }}
                >
                  <Group gap="xs">
                    <Avatar radius="xl" size="sm" color="blue" />
                    <div style={{ flex: 1 }}>
                      <Text size="sm" fw={500}>{login.profile.display}</Text>
                      <Text size="xs" c={THEME.gray500}>{login.project.display}</Text>
                    </div>
                  </Group>
                </Menu.Item>
              )
          )}
          <Menu.Divider />
        </>
      )}

      {/* Theme Toggle */}
      <Box px="md" py="sm">
        <Text size="xs" c={THEME.gray500} fw={600} mb={8} tt="uppercase">
          Appearance
        </Text>
        <SegmentedControl
          fullWidth
          size="xs"
          radius="md"
          value={colorScheme}
          onChange={(newValue) => setColorScheme(newValue as MantineColorScheme)}
          data={[
            { label: <Group gap={3} justify="center" wrap="nowrap"><IconSun size={14} /><Text size="xs">Light</Text></Group>, value: 'light' },
            { label: <Group gap={3} justify="center" wrap="nowrap"><IconMoon size={14} /><Text size="xs">Dark</Text></Group>, value: 'dark' },
            { label: <Group gap={3} justify="center" wrap="nowrap"><IconDeviceDesktop size={14} /><Text size="xs">Auto</Text></Group>, value: 'auto' },
          ]}
          styles={{
            root: { backgroundColor: THEME.gray100, padding: '3px' },
            indicator: { boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
          }}
        />
      </Box>

      <Menu.Divider />

      {/* Menu Actions */}
      <Menu.Item
        leftSection={
          <Box style={iconStyle(THEME.lightAccent)}>
            <IconDashboard size={16} color={THEME.secondary} />
          </Box>
        }
        style={menuItemStyle}
        onClick={() => navigate('/emr/account-management')}
      >
        <Text size="sm" fw={500}>Dashboard</Text>
      </Menu.Item>

      <Menu.Item
        leftSection={
          <Box style={iconStyle(THEME.lightAccent)}>
            <IconSwitchHorizontal size={16} color={THEME.secondary} />
          </Box>
        }
        style={menuItemStyle}
        onClick={() => navigate('/signin')}
      >
        <Text size="sm" fw={500}>Add another account</Text>
      </Menu.Item>

      <Menu.Item
        leftSection={
          <Box style={iconStyle(THEME.lightAccent)}>
            <IconSettings size={16} color={THEME.secondary} />
          </Box>
        }
        style={menuItemStyle}
        onClick={() => navigate(`/${getReferenceString(profile as ProfileResource)}`)}
      >
        <Text size="sm" fw={500}>Account settings</Text>
      </Menu.Item>

      <Menu.Divider />

      <Menu.Item
        leftSection={
          <Box style={iconStyle('#fee2e2')}>
            <IconLogout size={16} color={THEME.danger} />
          </Box>
        }
        style={menuItemStyle}
        onClick={async () => {
          await medplum.signOut();
          navigate('/signin');
        }}
      >
        <Text size="sm" fw={500} c={THEME.danger}>Sign out</Text>
      </Menu.Item>

      {/* Footer */}
      <Box
        style={{
          borderTop: `1px solid ${THEME.gray200}`,
          backgroundColor: THEME.gray50,
          padding: '8px 16px',
          marginTop: '4px',
        }}
      >
        <Text size="xs" c={THEME.gray500} ta="center">
          {getAppName()} {props.version}
        </Text>
      </Box>
    </>
  );
}
