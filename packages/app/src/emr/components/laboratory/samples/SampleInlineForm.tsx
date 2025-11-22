// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import React, { useState } from 'react';
import { Box, TextInput, Button, Group } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import { useTranslation } from '../../../hooks/useTranslation';

interface SampleInlineFormProps {
  /** Callback when form is submitted */
  onSubmit: (name: string) => Promise<void>;
  /** Loading state */
  loading?: boolean;
}

/**
 * SampleInlineForm Component
 * @param root0
 * @param root0.onSubmit
 * @param root0.loading
 */
export function SampleInlineForm({ onSubmit, loading }: SampleInlineFormProps): JSX.Element {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!name.trim()) {return;}

    setSubmitting(true);
    try {
      await onSubmit(name);
      setName(''); // Clear form after successful submission
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
        <TextInput
          label={t('laboratory.samples.field.name')}
          placeholder={t('laboratory.samples.field.name')}
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          style={{ flex: 1 }}
          size="md"
        />
        <Button
          type="submit"
          leftSection={<IconPlus size={16} />}
          loading={submitting || loading}
          disabled={!name.trim()}
          style={{
            background: 'var(--emr-gradient-submenu)',
            border: 'none',
          }}
          size="md"
        >
          {t('laboratory.samples.action.add')}
        </Button>
      </Group>
    </Box>
  );
}
