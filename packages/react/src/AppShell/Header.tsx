// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { Box, Group, AppShell as MantineAppShell, Menu, Text, UnstyledButton } from '@mantine/core';
import { formatHumanName } from '@medplum/core';
import type { HumanName } from '@medplum/fhirtypes';
import { useMedplumProfile } from '@medplum/react-hooks';
import { IconChevronDown } from '@tabler/icons-react';
import cx from 'clsx';
import type { JSX, ReactNode } from 'react';
import { useState } from 'react';
import { ResourceAvatar } from '../ResourceAvatar/ResourceAvatar';
import classes from './Header.module.css';
import { HeaderDropdown } from './HeaderDropdown';
import { HeaderSearchInput } from './HeaderSearchInput';

export interface HeaderProps {
  readonly pathname?: string;
  readonly searchParams?: URLSearchParams;
  readonly headerSearchDisabled?: boolean;
  readonly logo: ReactNode;
  readonly version?: string;
  readonly navbarToggle: () => void;
  readonly notifications?: ReactNode;
  readonly headerActions?: ReactNode;
}

export function Header(props: HeaderProps): JSX.Element {
  const profile = useMedplumProfile();
  const [userMenuOpened, setUserMenuOpened] = useState(false);

  return (
    <MantineAppShell.Header className={classes.header}>
      <Group justify="space-between" h="100%">
        {/* Left side - Logo and Search */}
        <Group gap={12} h="100%">
          <UnstyledButton className={classes.logoButton} onClick={props.navbarToggle}>
            {props.logo}
          </UnstyledButton>
          {!props.headerSearchDisabled && (
            <HeaderSearchInput pathname={props.pathname} searchParams={props.searchParams} />
          )}
        </Group>

        {/* Right side - Actions, Notifications, User */}
        <Group gap={12} h="100%">
          {props.headerActions}
          {props.notifications}

          {/* Divider */}
          <Box className={classes.divider} />

          {/* User Menu */}
          <Menu
            width={280}
            shadow="xl"
            position="bottom-end"
            offset={8}
            transitionProps={{ transition: 'pop-top-right', duration: 150 }}
            opened={userMenuOpened}
            onClose={() => setUserMenuOpened(false)}
            withArrow={false}
            zIndex={1100}
            styles={{
              dropdown: {
                padding: 0,
                borderRadius: '12px',
                border: '1px solid #e5e7eb',
                boxShadow: '0 10px 40px rgba(26, 54, 93, 0.15), 0 4px 12px rgba(0, 0, 0, 0.05)',
                overflow: 'hidden',
              },
            }}
          >
            <Menu.Target>
              <UnstyledButton
                className={cx(classes.userButton, { [classes.userActive]: userMenuOpened })}
                onClick={() => setUserMenuOpened((o) => !o)}
              >
                <Box className={classes.userAvatar}>
                  <ResourceAvatar value={profile} radius="xl" size={24} />
                </Box>
                <Text size="sm" className={classes.userName}>
                  {formatHumanName(profile?.name?.[0] as HumanName)}
                </Text>
                <IconChevronDown size={14} stroke={1.5} className={classes.chevron} />
              </UnstyledButton>
            </Menu.Target>
            <Menu.Dropdown>
              <HeaderDropdown version={props.version} />
            </Menu.Dropdown>
          </Menu>
        </Group>
      </Group>
    </MantineAppShell.Header>
  );
}
