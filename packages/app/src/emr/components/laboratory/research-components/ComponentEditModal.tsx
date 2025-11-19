/**
 * Component Edit Modal
 *
 * Modal dialog for editing research components with 7 fields.
 * Matches original EMR editing functionality.
 */

import React, { useState, useEffect } from 'react';
import { Modal, TextInput, Select, Button, Box, Stack } from '@mantine/core';
import { ObservationDefinition } from '@medplum/fhirtypes';
import { useTranslation } from '../../../hooks/useTranslation';
import { ResearchComponentFormValues } from '../../../types/laboratory';
import { extractResearchComponentFormValues } from '../../../services/researchComponentService';
import { SERVICE_TYPES } from '../../../translations/service-types.js';
import { MEASUREMENT_UNITS } from '../../../translations/measurement-units.js';

interface ComponentEditModalProps {
  /** Component to edit (null if modal closed) */
  component: ObservationDefinition | null;
  /** Callback when modal is closed */
  onClose: () => void;
  /** Callback when save button clicked */
  onSave: (id: string, values: ResearchComponentFormValues) => Promise<void>;
  /** Loading state during save */
  loading?: boolean;
}

/**
 * Modal for editing research component details
 */
export function ComponentEditModal({
  component,
  onClose,
  onSave,
  loading = false,
}: ComponentEditModalProps): JSX.Element {
  const { t, lang } = useTranslation();

  // Form state
  const [code, setCode] = useState('');
  const [gisCode, setGisCode] = useState('');
  const [name, setName] = useState('');
  const [type, setType] = useState<string>('internal');
  const [unit, setUnit] = useState<string>('');
  const [department, setDepartment] = useState('');
  const [status, setStatus] = useState<'active' | 'retired' | 'draft'>('active');

  // Service type options
  const serviceTypeOptions = SERVICE_TYPES.map((type) => ({
    value: type.code,
    label: type.name[lang] || type.name.ka,
  }));

  // Measurement unit options
  const unitOptions = MEASUREMENT_UNITS.map((unit) => ({
    value: unit.value,
    label: unit.value,
  }));

  // Status options
  const statusOptions = [
    { value: 'active', label: t('laboratory.components.filters.active') },
    { value: 'retired', label: t('laboratory.components.filters.deleted') },
    { value: 'draft', label: t('laboratory.components.filters.draft') },
  ];

  // Load component data when modal opens
  useEffect(() => {
    if (component) {
      const values = extractResearchComponentFormValues(component);
      setCode(values.code || '');
      setGisCode(values.gisCode || '');
      setName(values.name);
      setType(values.type || 'internal');
      setUnit(values.unit || '');
      setDepartment(values.department || '');
      setStatus(values.status || 'active');
    }
  }, [component]);

  const handleSave = async (): Promise<void> => {
    if (!component || !name.trim()) {
      return;
    }

    const values: ResearchComponentFormValues = {
      code: code.trim() || undefined,
      gisCode: gisCode.trim() || undefined,
      name: name.trim(),
      type,
      unit: unit || undefined,
      department: department.trim() || undefined,
      status,
    };

    await onSave(component.id!, values);
    onClose();
  };

  return (
    <Modal
      opened={!!component}
      onClose={onClose}
      title={t('laboratory.components.edit.title')}
      size="lg"
    >
      <Stack gap="md">
        <TextInput
          label={t('laboratory.components.fields.code')}
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />

        <TextInput
          label={t('laboratory.components.fields.gisCode')}
          value={gisCode}
          onChange={(e) => setGisCode(e.target.value)}
        />

        <TextInput
          label={t('laboratory.components.fields.name')}
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <Select
          label={t('laboratory.components.fields.type')}
          data={serviceTypeOptions}
          value={type}
          onChange={(value) => setType(value || 'internal')}
          allowDeselect={false}
        />

        <Select
          label={t('laboratory.components.fields.unit')}
          data={unitOptions}
          value={unit}
          onChange={(value) => setUnit(value || '')}
          searchable
          clearable
        />

        <TextInput
          label={t('laboratory.components.fields.department')}
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
        />

        <Select
          label={t('laboratory.components.fields.status')}
          data={statusOptions}
          value={status}
          onChange={(value) => setStatus((value as 'active' | 'retired' | 'draft') || 'active')}
          allowDeselect={false}
        />

        <Box style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <Button variant="subtle" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button
            variant="gradient"
            gradient={{ from: 'cyan', to: 'teal', deg: 90 }}
            onClick={handleSave}
            loading={loading}
            disabled={!name.trim()}
          >
            {t('common.save')}
          </Button>
        </Box>
      </Stack>
    </Modal>
  );
}
