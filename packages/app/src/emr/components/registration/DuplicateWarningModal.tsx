// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { Modal, Text, Group, Button, Stack, Paper, Divider } from '@mantine/core';
import { IconAlertTriangle } from '@tabler/icons-react';
import type { Patient } from '@medplum/fhirtypes';
import { useTranslation } from '../../hooks/useTranslation';
import { getIdentifierValue, getNameParts, getTelecomValue } from '../../services/fhirHelpers';

interface DuplicateWarningModalProps {
  opened: boolean;
  onClose: () => void;
  existingPatient: Patient;
  onOpenExisting: () => void;
  onRegisterAnyway: () => void;
}

/**
 * DuplicateWarningModal - Modal component for duplicate patient warning
 *
 * Displays a warning when a patient with the same personal ID already exists.
 * Shows existing patient information and provides three action options:
 * 1. Open existing patient
 * 2. Register anyway (create duplicate)
 * 3. Cancel
 *
 * @param opened - Whether the modal is open
 * @param opened.opened
 * @param onClose - Callback when modal is closed
 * @param opened.onClose
 * @param existingPatient - The existing FHIR Patient resource
 * @param opened.existingPatient
 * @param onOpenExisting - Callback to open the existing patient
 * @param opened.onOpenExisting
 * @param onRegisterAnyway - Callback to register a new patient anyway
 * @param opened.onRegisterAnyway
 */
export function DuplicateWarningModal({
  opened,
  onClose,
  existingPatient,
  onOpenExisting,
  onRegisterAnyway,
}: DuplicateWarningModalProps): JSX.Element {
  const { t } = useTranslation();

  // Extract patient information from FHIR resource
  const personalId = getIdentifierValue(
    existingPatient,
    'http://medimind.ge/identifiers/personal-id'
  );
  const { firstName, lastName } = getNameParts(existingPatient?.name);
  const fullName = `${firstName} ${lastName}`.trim() || t('registration.state.unknown');
  const birthDate = existingPatient?.birthDate || '-';
  const phone = getTelecomValue(existingPatient, 'phone') || '-';

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group gap="xs">
          <IconAlertTriangle size={24} color="orange" />
          <Text fw={600} size="lg">
            {t('registration.duplicate.title')}
          </Text>
        </Group>
      }
      size="md"
      centered
    >
      <Stack gap="md">
        {/* Warning message */}
        <Text size="sm" c="dimmed">
          {t('registration.duplicate.message')}
        </Text>

        <Divider />

        {/* Existing patient information */}
        <Paper p="md" withBorder style={{ backgroundColor: '#fff9e6' }}>
          <Stack gap="sm">
            <Text fw={600} size="sm" c="orange.8">
              {t('registration.duplicate.existingInfo')}
            </Text>

            <Stack gap="xs">
              <Group gap="xs">
                <Text size="sm" fw={500} style={{ minWidth: '120px' }}>
                  {t('registration.field.personalId')}:
                </Text>
                <Text size="sm">{personalId}</Text>
              </Group>

              <Group gap="xs">
                <Text size="sm" fw={500} style={{ minWidth: '120px' }}>
                  {t('registration.field.firstName')} {t('registration.field.lastName')}:
                </Text>
                <Text size="sm">{fullName}</Text>
              </Group>

              <Group gap="xs">
                <Text size="sm" fw={500} style={{ minWidth: '120px' }}>
                  {t('registration.field.birthDate')}:
                </Text>
                <Text size="sm">{birthDate}</Text>
              </Group>

              <Group gap="xs">
                <Text size="sm" fw={500} style={{ minWidth: '120px' }}>
                  {t('registration.field.phoneNumber')}:
                </Text>
                <Text size="sm">{phone}</Text>
              </Group>
            </Stack>
          </Stack>
        </Paper>

        <Divider />

        {/* Action buttons */}
        <Group justify="space-between" gap="sm">
          <Button
            variant="outline"
            color="gray"
            onClick={onClose}
            style={{ flex: 1 }}
          >
            {t('registration.action.cancel')}
          </Button>

          <Button
            variant="outline"
            color="orange"
            onClick={onRegisterAnyway}
            style={{ flex: 1 }}
          >
            {t('registration.action.registerAnyway')}
          </Button>

          <Button
            variant="gradient"
            gradient={{ from: '#1a365d', to: '#3182ce', deg: 135 }}
            onClick={onOpenExisting}
            style={{ flex: 1 }}
          >
            {t('registration.action.openExisting')}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
