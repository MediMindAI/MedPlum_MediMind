// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import React, { useEffect, useState } from 'react';
import { Modal, TextInput, Button, Group, NumberInput, ColorInput, Stack } from '@mantine/core';
import type { DeviceDefinition } from '@medplum/fhirtypes';
import { useTranslation } from '../../../hooks/useTranslation';
import { extractSyringeFormValues } from '../../../services/syringeService';
import type { SyringeFormValues } from '../../../types/laboratory';

interface SyringeEditModalProps {
  /** Syringe to edit */
  syringe: DeviceDefinition | null;
  /** Modal open state */
  opened: boolean;
  /** Callback to close modal */
  onClose: () => void;
  /** Callback when save is clicked */
  onSave: (id: string, values: SyringeFormValues) => Promise<void>;
  /** Loading state during save */
  loading?: boolean;
}

/**
 * SyringeEditModal Component
 * @param root0
 * @param root0.syringe
 * @param root0.opened
 * @param root0.onClose
 * @param root0.onSave
 * @param root0.loading
 */
export function SyringeEditModal({
  syringe,
  opened,
  onClose,
  onSave,
  loading,
}: SyringeEditModalProps): JSX.Element {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [color, setColor] = useState('#8A2BE2');
  const [volume, setVolume] = useState<number | string>('');

  useEffect(() => {
    if (syringe) {
      const values = extractSyringeFormValues(syringe);
      setName(values.name);
      setColor(values.color);
      setVolume(values.volume || '');
    }
  }, [syringe]);

  const handleSave = async (): Promise<void> => {
    if (!syringe?.id || !name.trim() || !color) {return;}

    await onSave(syringe.id, {
      name,
      color,
      volume: volume ? Number(volume) : undefined,
      status: 'active',
    });

    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={t('laboratory.action.edit')}
      centered
      size="lg"
    >
      <Stack gap="md">
        <TextInput
          label={t('laboratory.syringes.field.name')}
          placeholder={t('laboratory.syringes.field.name')}
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          size="md"
        />
        <ColorInput
          label={t('laboratory.syringes.field.color')}
          placeholder={t('laboratory.syringes.field.color')}
          value={color}
          onChange={setColor}
          required
          size="md"
          format="hex"
        />
        <NumberInput
          label={t('laboratory.syringes.field.volume')}
          placeholder={t('laboratory.syringes.field.volume')}
          value={volume}
          onChange={setVolume}
          min={0}
          max={1000}
          decimalScale={2}
          size="md"
        />
        <Group justify="flex-end" gap="sm" mt="md">
          <Button variant="default" onClick={onClose} disabled={loading}>
            {t('laboratory.action.cancel')}
          </Button>
          <Button
            onClick={handleSave}
            loading={loading}
            disabled={!name.trim() || !color}
            style={{
              background: 'var(--emr-gradient-submenu)',
              border: 'none',
            }}
          >
            {t('laboratory.action.save')}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
