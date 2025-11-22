// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import React, { memo, useCallback, useMemo } from 'react';
import { Stack, Box, Text, Divider, ScrollArea } from '@mantine/core';
import { useTranslation } from '../../hooks/useTranslation';
import type { FieldConfig } from '../../types/form-builder';
import { FieldConfigEditor } from './FieldConfigEditor';

interface PropertiesPanelProps {
  selectedField: FieldConfig | null;
  onFieldUpdate: (field: FieldConfig | null) => void;
}

/**
 * PropertiesPanel Component
 *
 * Right panel for configuring selected field properties
 * - Shows when a field is selected
 * - Uses FieldConfigEditor for comprehensive field configuration
 * - Supports styling, validation rules, and basic properties
 * - Touch-friendly with 44px minimum height inputs for tablet compatibility
 * - Memoized for performance
 * - Keyboard navigation support
 */
export const PropertiesPanel = memo(function PropertiesPanel({ selectedField, onFieldUpdate }: PropertiesPanelProps): React.ReactElement {
  const { t } = useTranslation();

  // Create a deep copy of the selected field to avoid Immer frozen object errors
  // Immer freezes state objects, which breaks Mantine's useForm
  const unfrozenField = useMemo(() => {
    if (!selectedField) return null;
    return JSON.parse(JSON.stringify(selectedField)) as FieldConfig;
  }, [selectedField]);

  const handleFieldChange = useCallback((updatedField: FieldConfig): void => {
    onFieldUpdate(updatedField);
  }, [onFieldUpdate]);

  if (!unfrozenField) {
    return (
      <Box
        style={{ padding: 'var(--mantine-spacing-md)', height: '100%' }}
        role="region"
        aria-label={t('formUI.builder.properties') || 'Properties Panel'}
      >
        <Stack align="center" justify="center" style={{ height: '100%', minHeight: '300px' }}>
          <Text size="sm" c="dimmed" ta="center">
            Select a field to configure
          </Text>
          <Text size="xs" c="dimmed" ta="center">
            Click on a field in the canvas to edit its properties
          </Text>
        </Stack>
      </Box>
    );
  }

  return (
    <ScrollArea
      style={{ height: '100%' }}
      role="region"
      aria-label={t('formUI.builder.properties') || 'Properties Panel'}
    >
      <Stack gap="md" style={{ padding: 'var(--mantine-spacing-md)' }}>
        {/* Header */}
        <Box>
          <Text size="lg" fw={600} style={{ marginBottom: 'var(--mantine-spacing-xs)' }} id="properties-heading">
            {t('formUI.builder.properties')}
          </Text>
          <Text size="xs" c="dimmed">
            Configure field settings
          </Text>
        </Box>

        <Divider />

        {/* Field Type Info */}
        <Box>
          <Text size="xs" c="dimmed" mb={4} id="field-type-label">
            Field Type
          </Text>
          <Text size="sm" fw={500} aria-labelledby="field-type-label">
            {t(`fieldTypes.${unfrozenField.type}`)}
          </Text>
        </Box>

        {/* Field ID Info */}
        <Box>
          <Text size="xs" c="dimmed" mb={4} id="field-id-label">
            Field ID
          </Text>
          <Text size="xs" style={{ fontFamily: 'monospace', wordBreak: 'break-all' }} aria-labelledby="field-id-label">
            {unfrozenField.id}
          </Text>
        </Box>

        <Divider />

        {/* Field Configuration Editor */}
        <FieldConfigEditor field={unfrozenField} onChange={handleFieldChange} />
      </Stack>
    </ScrollArea>
  );
});
