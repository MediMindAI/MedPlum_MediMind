/**
 * Manipulation Inline Form Component
 *
 * Inline form for adding new manipulation/procedure types.
 * Simple single-field form matching the original EMR design.
 */

import React, { useState } from 'react';
import { Box, TextInput, Button, Group } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import { useTranslation } from '../../../hooks/useTranslation';

interface ManipulationInlineFormProps {
  /** Callback when form is submitted */
  onSubmit: (name: string) => Promise<void>;
  /** Loading state */
  loading?: boolean;
}

/**
 * ManipulationInlineForm Component
 */
export function ManipulationInlineForm({ onSubmit, loading }: ManipulationInlineFormProps): JSX.Element {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!name.trim()) return;

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
          label={t('laboratory.manipulations.field.name')}
          placeholder={t('laboratory.manipulations.field.name')}
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
          {t('laboratory.manipulations.action.add')}
        </Button>
      </Group>
    </Box>
  );
}
