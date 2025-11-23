// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import React, { useState } from 'react';
import { Button, Box, Grid } from '@mantine/core';
import { EMRTextInput, EMRSelect } from '../../shared/EMRFormFields';
import { IconPlus } from '@tabler/icons-react';
import { useTranslation } from '../../../hooks/useTranslation';
import type { ResearchComponentFormValues } from '../../../types/laboratory';
import { SERVICE_TYPES } from '../../../translations/service-types.js';
import { MEASUREMENT_UNITS } from '../../../translations/measurement-units.js';

interface ComponentEntryFormProps {
  /** Callback when form is submitted */
  onSubmit: (values: ResearchComponentFormValues) => Promise<void>;
  /** Loading state during submission */
  loading?: boolean;
}

/**
 * Inline form for adding new research components
 * @param root0
 * @param root0.onSubmit
 * @param root0.loading
 */
export function ComponentEntryForm({ onSubmit, loading = false }: ComponentEntryFormProps): JSX.Element {
  const { t, lang } = useTranslation();

  // Form state
  const [code, setCode] = useState('');
  const [gisCode, setGisCode] = useState('');
  const [name, setName] = useState('');
  const [type, setType] = useState<string>('internal'); // Default: შიდა (Internal)
  const [unit, setUnit] = useState<string>('');
  const [department, setDepartment] = useState('');

  // Service type options (7 types)
  const serviceTypeOptions = SERVICE_TYPES.map((type) => ({
    value: type.code,
    label: type.name[lang] || type.name.ka,
  }));

  // Measurement unit options (56 units)
  const unitOptions = MEASUREMENT_UNITS.map((unit) => ({
    value: unit.value,
    label: unit.value, // Units are universal
  }));

  const handleSubmit = async (): Promise<void> => {
    if (!name.trim()) {
      return; // Name is required
    }

    const values: ResearchComponentFormValues = {
      code: code.trim() || undefined,
      gisCode: gisCode.trim() || undefined,
      name: name.trim(),
      type,
      unit: unit || undefined,
      department: department.trim() || undefined,
      status: 'active',
    };

    await onSubmit(values);

    // Reset form
    setCode('');
    setGisCode('');
    setName('');
    setType('internal');
    setUnit('');
    setDepartment('');
  };

  return (
    <Box
      p="md"
      style={{
        borderBottom: '1px solid #dee2e6',
        backgroundColor: '#ffffff',
      }}
    >
      <Grid gutter="sm" align="flex-end">
        <Grid.Col span={{ base: 12, sm: 6, md: 1.5 }}>
          <EMRTextInput
            placeholder={t('laboratory.components.fields.code')}
            value={code}
            onChange={setCode}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          />
        </Grid.Col>

        <Grid.Col span={{ base: 12, sm: 6, md: 1.5 }}>
          <EMRTextInput
            placeholder={t('laboratory.components.fields.gisCode')}
            value={gisCode}
            onChange={setGisCode}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          />
        </Grid.Col>

        <Grid.Col span={{ base: 12, sm: 12, md: 2.5 }}>
          <EMRTextInput
            placeholder={t('laboratory.components.fields.name')}
            value={name}
            onChange={setName}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            required
          />
        </Grid.Col>

        <Grid.Col span={{ base: 12, sm: 6, md: 2 }}>
          <EMRSelect
            data={serviceTypeOptions}
            value={type}
            onChange={(value) => setType(value || 'internal')}
          />
        </Grid.Col>

        <Grid.Col span={{ base: 12, sm: 6, md: 2 }}>
          <EMRSelect
            data={unitOptions}
            value={unit}
            onChange={(value) => setUnit(value || '')}
            placeholder={t('laboratory.components.fields.unit')}
            searchable
            clearable
          />
        </Grid.Col>

        <Grid.Col span={{ base: 12, sm: 9, md: 1.5 }}>
          <EMRTextInput
            placeholder={t('laboratory.components.fields.department')}
            value={department}
            onChange={setDepartment}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          />
        </Grid.Col>

        <Grid.Col span={{ base: 12, sm: 3, md: 1 }}>
          <Button
            fullWidth
            variant="gradient"
            gradient={{ from: 'cyan', to: 'teal', deg: 90 }}
            onClick={handleSubmit}
            loading={loading}
            disabled={!name.trim()}
            leftSection={<IconPlus size={18} />}
          >
            {t('laboratory.components.actions.add')}
          </Button>
        </Grid.Col>
      </Grid>
    </Box>
  );
}
