// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { Modal, Table, Kbd, Group, Text, Box } from '@mantine/core';
import { IconKeyboard } from '@tabler/icons-react';
import { useTranslation } from '../../hooks/useTranslation';

interface KeyboardShortcutsHelpProps {
  /** Whether the modal is open */
  opened: boolean;
  /** Callback when modal is closed */
  onClose: () => void;
}

/**
 * Modal showing available keyboard shortcuts
 *
 * Features:
 * - List format with Shortcut | Description
 * - Uses Mantine Kbd component for key display
 * - Detects Mac vs Windows for modifier key display
 * - Multilingual support (ka/en/ru)
 *
 * Shortcuts:
 * - Cmd/Ctrl + K: Focus search
 * - Cmd/Ctrl + N: Create new account
 * - Cmd/Ctrl + /: Show this help
 * - Escape: Close modal/clear selection
 *
 * @param opened - Whether the modal is visible
 * @param onClose - Callback when modal should close
 */
export function KeyboardShortcutsHelp({ opened, onClose }: KeyboardShortcutsHelpProps): JSX.Element {
  const { t } = useTranslation();

  // Detect if Mac for modifier key display
  const isMac = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform);
  const modifierKey = isMac ? 'Cmd' : 'Ctrl';

  const shortcuts = [
    {
      keys: [modifierKey, 'K'],
      description: t('accountManagement.shortcuts.search'),
    },
    {
      keys: [modifierKey, 'N'],
      description: t('accountManagement.shortcuts.create'),
    },
    {
      keys: [modifierKey, '/'],
      description: t('accountManagement.shortcuts.help'),
    },
    {
      keys: ['Esc'],
      description: t('accountManagement.shortcuts.close'),
    },
  ];

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group gap="sm">
          <IconKeyboard size={24} color="var(--emr-primary)" />
          <Text fw={600} size="lg">
            {t('accountManagement.shortcuts.help')}
          </Text>
        </Group>
      }
      centered
      size="md"
      styles={{
        header: {
          borderBottom: '1px solid var(--emr-gray-200)',
          paddingBottom: '12px',
        },
        body: {
          padding: '20px',
        },
      }}
    >
      <Box>
        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Th style={{ width: '40%' }}>
                <Text size="sm" fw={600} c="dimmed">
                  Shortcut
                </Text>
              </Table.Th>
              <Table.Th>
                <Text size="sm" fw={600} c="dimmed">
                  Description
                </Text>
              </Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {shortcuts.map((shortcut, index) => (
              <Table.Tr key={index}>
                <Table.Td>
                  <Group gap={4}>
                    {shortcut.keys.map((key, keyIndex) => (
                      <span key={keyIndex}>
                        <Kbd size="sm">{key}</Kbd>
                        {keyIndex < shortcut.keys.length - 1 && (
                          <Text component="span" size="sm" c="dimmed" mx={4}>
                            +
                          </Text>
                        )}
                      </span>
                    ))}
                  </Group>
                </Table.Td>
                <Table.Td>
                  <Text size="sm">{shortcut.description}</Text>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>

        <Text size="xs" c="dimmed" mt="lg" ta="center">
          {isMac ? 'Use Cmd for Mac' : 'Use Ctrl for Windows/Linux'}
        </Text>
      </Box>
    </Modal>
  );
}
