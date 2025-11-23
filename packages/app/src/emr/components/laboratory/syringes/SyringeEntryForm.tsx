// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import React, { useState } from 'react';
import { Box, Button, Group, ColorInput } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import { useTranslation } from '../../../hooks/useTranslation';
import type { SyringeFormValues } from '../../../types/laboratory';
import { EMRTextInput, EMRNumberInput } from '../../shared/EMRFormFields';

interface SyringeEntryFormProps {
  /** Callback when form is submitted */
  onSubmit: (values: SyringeFormValues) => Promise<void>;
  /** Loading state */
  loading?: boolean;
}

/**
 * SyringeEntryForm Component
 * @param root0
 * @param root0.onSubmit
 * @param root0.loading
 */
export function SyringeEntryForm({ onSubmit, loading }: SyringeEntryFormProps): JSX.Element {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [color, setColor] = useState('#8A2BE2'); // Default purple (EDTA tube)
  const [volume, setVolume] = useState<number | string>('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!name.trim() || !color) {return;}

    setSubmitting(true);
    try {
      await onSubmit({
        name,
        color,
        volume: volume ? Number(volume) : undefined,
        status: 'active',
      });
      // Clear form after successful submission
      setName('');
      setColor('#8A2BE2');
      setVolume('');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      p="md"
      style={{
        borderBottom: '1px solid #dee2e6',
        backgroundColor: '#f8f9fa',
      }}
    >
      <Group align="flex-end" gap="sm">
        <EMRTextInput
          label={t('laboratory.syringes.field.name')}
          placeholder={t('laboratory.syringes.field.name')}
          value={name}
          onChange={setName}
          required
          style={{ flex: 2 }}
        />
        <ColorInput
          label={t('laboratory.syringes.field.color')}
          placeholder={t('laboratory.syringes.field.color')}
          value={color}
          onChange={setColor}
          required
          style={{ flex: 1 }}
          size="md"
          format="hex"
        />
        <EMRNumberInput
          label={t('laboratory.syringes.field.volume')}
          placeholder={t('laboratory.syringes.field.volume')}
          value={volume}
          onChange={setVolume}
          min={0}
          max={1000}
          decimalScale={2}
          style={{ flex: 1 }}
        />
        <Button
          type="submit"
          leftSection={<IconPlus size={16} />}
          loading={submitting || loading}
          disabled={!name.trim() || !color}
          style={{
            background: 'var(--emr-gradient-submenu)',
            border: 'none',
          }}
          size="md"
        >
          {t('laboratory.syringes.action.add')}
        </Button>
      </Group>
    </Box>
  );
}
