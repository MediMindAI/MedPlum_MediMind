// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import type { MantineColorScheme } from '@mantine/core';
import {
  Avatar,
  Box,
  Group,
  Stack,
  Text,
  UnstyledButton,
  useMantineColorScheme,
} from '@mantine/core';
import type { ProfileResource } from '@medplum/core';
import { getReferenceString, locationUtils } from '@medplum/core';
import type { HumanName } from '@medplum/fhirtypes';
import { useMedplumContext } from '@medplum/react-hooks';
import {
  IconLogout,
  IconSettings,
  IconUserPlus,
  IconLayoutDashboard,
  IconSun,
  IconMoon,
  IconDeviceDesktop,
} from '@tabler/icons-react';
import type { JSX } from 'react';
import { useState } from 'react';
import { HumanNameDisplay } from '../HumanNameDisplay/HumanNameDisplay';
import { ResourceAvatar } from '../ResourceAvatar/ResourceAvatar';
import { getAppName } from '../utils/app';

// EMR Theme Colors
const C = {
  primary: '#1a365d',
  secondary: '#2b6cb0',
  accent: '#63b3ed',
  lightAccent: '#bee3f8',
  gray50: '#f9fafb',
  gray100: '#f3f4f6',
  gray200: '#e5e7eb',
  gray500: '#6b7280',
  textPrimary: '#1f2937',
  white: '#ffffff',
  error: '#dc2626',
  errorLight: '#fee2e2',
};

export interface HeaderDropdownProps {
  readonly version?: string;
}

export function HeaderDropdown(props: HeaderDropdownProps): JSX.Element {
  const context = useMedplumContext();
  const { medplum, profile, navigate } = context;
  const logins = medplum.getLogins();
  const { colorScheme, setColorScheme } = useMantineColorScheme();
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <>
      {/* Profile Header */}
      <Box
        p="md"
        style={{
          background: `linear-gradient(135deg, ${C.primary} 0%, ${C.secondary} 100%)`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Box
          mb="sm"
          style={{
            padding: 3,
            borderRadius: '50%',
            background: C.accent,
          }}
        >
          <ResourceAvatar
            size={52}
            radius={100}
            value={context.profile}
            style={{ border: `2px solid ${C.white}` }}
          />
        </Box>
        <Text fw={600} c="white" ta="center" size="sm">
          <HumanNameDisplay value={context.profile?.name?.[0] as HumanName} />
        </Text>
        <Text size="xs" ta="center" c={C.lightAccent} mt={4}>
          {medplum.getActiveLogin()?.project.display}
        </Text>
      </Box>

      {/* Switch Account */}
      {logins.length > 1 && (
        <Box style={{ borderBottom: `1px solid ${C.gray200}` }}>
          <Text px="md" pt="sm" pb="xs" size="xs" fw={700} c={C.gray500} tt="uppercase" style={{ letterSpacing: '0.05em' }}>
            Switch Account
          </Text>
          {logins.map(
            (login) =>
              login.profile.reference !== getReferenceString(context.profile as ProfileResource) && (
                <UnstyledButton
                  key={login.profile.reference}
                  w="100%"
                  p="sm"
                  onClick={() => medplum.setActiveLogin(login).then(() => locationUtils.reload()).catch(console.log)}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, background: hovered === login.profile.reference ? C.gray50 : 'transparent' }}
                  onMouseEnter={() => setHovered(login.profile.reference || null)}
                  onMouseLeave={() => setHovered(null)}
                >
                  <Avatar radius="xl" size={32} color="blue" />
                  <Box style={{ flex: 1 }}>
                    <Text size="xs" fw={600} c={C.textPrimary}>{login.profile.display}</Text>
                    <Text size="xs" c={C.gray500}>{login.project.display}</Text>
                  </Box>
                </UnstyledButton>
              )
          )}
        </Box>
      )}

      {/* Appearance */}
      <Box p="md" style={{ borderBottom: `1px solid ${C.gray200}` }}>
        <Text size="xs" fw={700} c={C.gray500} mb="sm" tt="uppercase" style={{ letterSpacing: '0.05em' }}>
          Appearance
        </Text>
        <Group gap="xs">
          {[
            { v: 'light', i: IconSun, l: 'Light' },
            { v: 'dark', i: IconMoon, l: 'Dark' },
            { v: 'auto', i: IconDeviceDesktop, l: 'Auto' },
          ].map((o) => {
            const active = colorScheme === o.v;
            return (
              <UnstyledButton
                key={o.v}
                onClick={() => setColorScheme(o.v as MantineColorScheme)}
                style={{
                  flex: 1,
                  padding: '8px 6px',
                  borderRadius: 8,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 4,
                  background: active ? C.secondary : C.gray100,
                  color: active ? C.white : C.gray500,
                  border: `1px solid ${active ? C.secondary : C.gray200}`,
                }}
              >
                <o.i size={16} />
                <Text size="xs" fw={600}>{o.l}</Text>
              </UnstyledButton>
            );
          })}
        </Group>
      </Box>

      {/* Menu Items */}
      <Box py="xs">
        {[
          { id: 'dashboard', Icon: IconLayoutDashboard, label: 'Dashboard', path: '/emr/account-management' },
          { id: 'add', Icon: IconUserPlus, label: 'Add Account', path: '/signin' },
          { id: 'settings', Icon: IconSettings, label: 'Settings', path: `/${getReferenceString(profile as ProfileResource)}` },
        ].map((item) => (
          <UnstyledButton
            key={item.id}
            w="100%"
            px="md"
            py="xs"
            onClick={() => navigate(item.path)}
            onMouseEnter={() => setHovered(item.id)}
            onMouseLeave={() => setHovered(null)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              background: hovered === item.id ? C.gray50 : 'transparent',
            }}
          >
            <Box
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: hovered === item.id ? C.secondary : C.lightAccent,
                color: hovered === item.id ? C.white : C.secondary,
              }}
            >
              <item.Icon size={16} />
            </Box>
            <Text size="sm" fw={500} c={hovered === item.id ? C.secondary : C.textPrimary}>
              {item.label}
            </Text>
          </UnstyledButton>
        ))}
      </Box>

      {/* Sign Out */}
      <Box p="sm" style={{ borderTop: `1px solid ${C.gray200}` }}>
        <UnstyledButton
          w="100%"
          p="sm"
          onClick={async () => { await medplum.signOut(); navigate('/signin'); }}
          onMouseEnter={() => setHovered('signout')}
          onMouseLeave={() => setHovered(null)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            borderRadius: 8,
            background: hovered === 'signout' ? C.errorLight : 'transparent',
            border: `1px solid ${hovered === 'signout' ? C.error : C.gray200}`,
          }}
        >
          <Box
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: hovered === 'signout' ? C.error : C.errorLight,
              color: hovered === 'signout' ? C.white : C.error,
            }}
          >
            <IconLogout size={16} />
          </Box>
          <Text size="sm" fw={500} c={C.error}>Sign Out</Text>
        </UnstyledButton>
      </Box>

      {/* Footer */}
      <Box p="sm" style={{ background: C.gray50, borderTop: `1px solid ${C.gray200}` }}>
        <Text size="xs" c={C.gray500} ta="center">{getAppName()} {props.version}</Text>
      </Box>
    </>
  );
}
