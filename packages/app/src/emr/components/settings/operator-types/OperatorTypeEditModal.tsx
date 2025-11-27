// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import React, { useState } from 'react';
import { Modal, Button, Group, Select, Grid, Switch, Stack } from '@mantine/core';
import { useTranslation } from '../../../hooks/useTranslation';
import { EMRTextInput } from '../../shared/EMRFormFields';
import type { OperatorTypeFormValues } from '../../../types/settings';

interface OperatorTypeEditModalProps {
  /** Modal open state */
  opened: boolean;
  /** Callback to close modal */
  onClose: () => void;
  /** Operator type data to edit */
  operatorType: OperatorTypeFormValues | null;
  /** Callback when form is submitted */
  onSubmit: (code: string, values: OperatorTypeFormValues) => Promise<void>;
  /** Loading state */
  loading?: boolean;
}

/**
 * OperatorTypeEditModal Component
 * Modal dialog for editing operator types
 */
export function OperatorTypeEditModal({
  opened,
  onClose,
  operatorType,
  onSubmit,
  loading,
}: OperatorTypeEditModalProps): JSX.Element {
  const { t } = useTranslation();
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [code, setCode] = useState(operatorType?.code || '');
  const [displayKa, setDisplayKa] = useState(operatorType?.displayKa || '');
  const [type, setType] = useState<'medical' | 'administrative' | 'support'>(operatorType?.type || 'medical');
  const [specialty, setSpecialty] = useState(operatorType?.specialty || '');
  const [canRegister, setCanRegister] = useState(operatorType?.canRegister || false);
  const [canPrescribe, setCanPrescribe] = useState(operatorType?.canPrescribe || false);
  const [canPerformSurgery, setCanPerformSurgery] = useState(operatorType?.canPerformSurgery || false);
  const [active, setActive] = useState(operatorType?.active ?? true);

  // Update form when operatorType changes
  React.useEffect(() => {
    if (operatorType) {
      setCode(operatorType.code);
      setDisplayKa(operatorType.displayKa);
      setType(operatorType.type);
      setSpecialty(operatorType.specialty || '');
      setCanRegister(operatorType.canRegister || false);
      setCanPrescribe(operatorType.canPrescribe || false);
      setCanPerformSurgery(operatorType.canPerformSurgery || false);
      setActive(operatorType.active ?? true);
    }
  }, [operatorType]);

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!code.trim() || !displayKa.trim() || !operatorType) {
      return;
    }

    const values: OperatorTypeFormValues = {
      code: code.trim(),
      displayKa: displayKa.trim(),
      type,
      specialty: specialty.trim() || undefined,
      canRegister,
      canPrescribe,
      canPerformSurgery,
      active,
    };

    setSubmitting(true);
    try {
      await onSubmit(operatorType.code, values);
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={t('settings.operatorTypes.modal.editTitle')}
      size="xl"
    >
      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          <Grid gutter="sm">
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <EMRTextInput
                label={t('settings.operatorTypes.field.code')}
                value={code}
                onChange={setCode}
                required
                disabled
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <EMRTextInput
                label={t('settings.operatorTypes.field.displayKa')}
                placeholder="ოპერატორი"
                value={displayKa}
                onChange={setDisplayKa}
                required
              />
            </Grid.Col>
          </Grid>

          <Grid gutter="sm">
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <Select
                label={t('settings.operatorTypes.field.type')}
                value={type}
                onChange={(value) => setType(value as typeof type)}
                data={[
                  { value: 'medical', label: t('settings.operatorTypes.type.medical') },
                  { value: 'administrative', label: t('settings.operatorTypes.type.administrative') },
                  { value: 'support', label: t('settings.operatorTypes.type.support') },
                ]}
                required
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <EMRTextInput
                label={t('settings.operatorTypes.field.specialty')}
                placeholder={t('settings.operatorTypes.field.specialtyPlaceholder')}
                value={specialty}
                onChange={setSpecialty}
              />
            </Grid.Col>
          </Grid>

          <Group gap="lg">
            <Switch
              label={t('settings.operatorTypes.field.canRegister')}
              checked={canRegister}
              onChange={(e) => setCanRegister(e.currentTarget.checked)}
            />
            <Switch
              label={t('settings.operatorTypes.field.canPrescribe')}
              checked={canPrescribe}
              onChange={(e) => setCanPrescribe(e.currentTarget.checked)}
            />
            <Switch
              label={t('settings.operatorTypes.field.canPerformSurgery')}
              checked={canPerformSurgery}
              onChange={(e) => setCanPerformSurgery(e.currentTarget.checked)}
            />
          </Group>

          <Switch
            label={t('settings.operatorTypes.field.active')}
            checked={active}
            onChange={(e) => setActive(e.currentTarget.checked)}
          />

          <Group justify="flex-end" mt="md">
            <Button variant="subtle" onClick={onClose}>
              {t('common.cancel')}
            </Button>
            <Button
              type="submit"
              loading={submitting || loading}
              disabled={!code.trim() || !displayKa.trim()}
              style={{
                background: 'var(--emr-gradient-submenu)',
                border: 'none',
              }}
            >
              {t('common.save')}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
