// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import React, { useState } from 'react';
import { Box, Button, Group, Select, Grid, Switch, Stack } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import { useTranslation } from '../../../hooks/useTranslation';
import { EMRTextInput } from '../../shared/EMRFormFields';
import type { OperatorTypeFormValues } from '../../../types/settings';

interface OperatorTypeFormProps {
  /** Callback when form is submitted */
  onSubmit: (values: OperatorTypeFormValues) => Promise<void>;
  /** Loading state */
  loading?: boolean;
}

/**
 * OperatorTypeForm Component
 * Inline form for creating new operator types
 */
export function OperatorTypeForm({ onSubmit, loading }: OperatorTypeFormProps): JSX.Element {
  const { t } = useTranslation();
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [code, setCode] = useState('');
  const [displayKa, setDisplayKa] = useState('');
  const [type, setType] = useState<'medical' | 'administrative' | 'support'>('medical');
  const [specialty, setSpecialty] = useState('');
  const [canRegister, setCanRegister] = useState(false);
  const [canPrescribe, setCanPrescribe] = useState(false);
  const [canPerformSurgery, setCanPerformSurgery] = useState(false);

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!code.trim() || !displayKa.trim()) {
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
      active: true,
    };

    setSubmitting(true);
    try {
      await onSubmit(values);
      // Clear form after successful submission
      setCode('');
      setDisplayKa('');
      setType('medical');
      setSpecialty('');
      setCanRegister(false);
      setCanPrescribe(false);
      setCanPerformSurgery(false);
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
      <Stack gap="sm">
        <Grid gutter="sm">
          <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
            <EMRTextInput
              label={t('settings.operatorTypes.field.code')}
              placeholder="1000006"
              value={code}
              onChange={setCode}
              required
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
            <EMRTextInput
              label={t('settings.operatorTypes.field.displayKa')}
              placeholder="ოპერატორი"
              value={displayKa}
              onChange={setDisplayKa}
              required
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
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
        </Grid>

        <Grid gutter="sm">
          <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
            <EMRTextInput
              label={t('settings.operatorTypes.field.specialty')}
              placeholder={t('settings.operatorTypes.field.specialtyPlaceholder')}
              value={specialty}
              onChange={setSpecialty}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 8 }}>
            <Group gap="lg" mt="lg">
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
          </Grid.Col>
        </Grid>

        <Group justify="flex-end">
          <Button
            type="submit"
            leftSection={<IconPlus size={16} />}
            loading={submitting || loading}
            disabled={!code.trim() || !displayKa.trim()}
            style={{
              background: 'var(--emr-gradient-submenu)',
              border: 'none',
            }}
            size="md"
          >
            {t('settings.operatorTypes.action.add')}
          </Button>
        </Group>
      </Stack>
    </Box>
  );
}
