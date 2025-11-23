// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { useState } from 'react';
import { Modal, TextInput, Button, Group, Text, Stack, CopyButton, ActionIcon, Tooltip } from '@mantine/core';
import { IconCopy, IconCheck } from '@tabler/icons-react';
import { useTranslation } from '../../hooks/useTranslation';

interface ActivationLinkModalProps {
  opened: boolean;
  onClose: () => void;
  activationUrl: string;
  expiresAt: string;
}

/**
 * Modal component for displaying and copying activation links
 *
 * Features:
 * - Displays readonly activation URL
 * - Copy button with success feedback
 * - Shows expiry date information
 * - Multilingual support (ka/en/ru)
 *
 * @param opened - Whether the modal is open
 * @param onClose - Callback when modal is closed
 * @param activationUrl - The activation URL to display
 * @param expiresAt - ISO 8601 timestamp for expiry
 *
 * @example
 * <ActivationLinkModal
 *   opened={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   activationUrl="https://example.com/setpassword/user-123"
 *   expiresAt="2025-11-30T00:00:00Z"
 * />
 */
export function ActivationLinkModal({
  opened,
  onClose,
  activationUrl,
  expiresAt,
}: ActivationLinkModalProps): JSX.Element {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  // Calculate days until expiry
  const expiryDate = new Date(expiresAt);
  const now = new Date();
  const daysUntilExpiry = Math.max(1, Math.ceil((expiryDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)));

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(activationUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={t('accountManagement.activationUrlTitle')}
      size="lg"
      centered
    >
      <Stack gap="md">
        <Text size="sm" c="dimmed">
          {t('accountManagement.activationUrlMessage')}
        </Text>

        <Group gap="xs" align="flex-end">
          <TextInput
            style={{ flex: 1 }}
            value={activationUrl}
            readOnly
            onClick={(e) => (e.target as HTMLInputElement).select()}
          />
          <Tooltip label={copied ? t('accountManagement.urlCopied') : t('accountManagement.clickToCopy')}>
            <ActionIcon
              variant="filled"
              color={copied ? 'green' : 'blue'}
              size="lg"
              onClick={handleCopy}
              aria-label={t('accountManagement.invitation.copyLink')}
            >
              {copied ? <IconCheck size={18} /> : <IconCopy size={18} />}
            </ActionIcon>
          </Tooltip>
        </Group>

        {copied && (
          <Text size="sm" c="green">
            {t('accountManagement.invitation.linkCopied')}
          </Text>
        )}

        <Text size="sm" c="dimmed">
          {t('accountManagement.invitation.expiresIn').replace('{days}', String(daysUntilExpiry))}
        </Text>

        <Group justify="flex-end" mt="md">
          <Button variant="default" onClick={onClose}>
            {t('common.close')}
          </Button>
          <CopyButton value={activationUrl}>
            {({ copied: copyBtnCopied, copy }) => (
              <Button
                color={copyBtnCopied ? 'green' : 'blue'}
                onClick={copy}
                leftSection={copyBtnCopied ? <IconCheck size={16} /> : <IconCopy size={16} />}
              >
                {copyBtnCopied ? t('accountManagement.urlCopied') : t('accountManagement.invitation.copyLink')}
              </Button>
            )}
          </CopyButton>
        </Group>
      </Stack>
    </Modal>
  );
}
