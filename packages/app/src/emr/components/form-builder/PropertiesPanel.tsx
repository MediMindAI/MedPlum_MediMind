// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import React, { memo, useCallback, useMemo } from 'react';
import { Stack, Box, Text, Group, Badge } from '@mantine/core';
import { IconSettings, IconClick } from '@tabler/icons-react';
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
 * - Modern glass-card design matching FieldPalette
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
      <Stack
        gap="lg"
        style={{
          padding: 'var(--emr-panel-padding)',
          height: '100%',
          background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
          borderLeft: '1px solid rgba(0, 0, 0, 0.08)',
          boxShadow: '-2px 0 12px rgba(0, 0, 0, 0.04)',
        }}
        role="region"
        aria-label={t('formUI.builder.properties') || 'Properties Panel'}
      >
        {/* Enhanced Panel Header */}
        <Box
          style={{
            padding: '16px 20px',
            margin: '-20px -20px 0 -20px',
            background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
            borderBottom: '1px solid var(--emr-gray-200)',
          }}
        >
          <Group gap="sm" align="center">
            <Box
              style={{
                width: 32,
                height: 32,
                borderRadius: '8px',
                background: 'linear-gradient(135deg, rgba(99, 179, 237, 0.15) 0%, rgba(43, 108, 176, 0.1) 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <IconSettings size={18} style={{ color: 'var(--emr-secondary)' }} />
            </Box>
            <Text size="sm" fw={600} tt="uppercase" style={{ letterSpacing: '0.05em', color: 'var(--emr-gray-700)' }}>
              {t('formUI.builder.properties')}
            </Text>
          </Group>
        </Box>

        {/* Empty State */}
        <Stack align="center" justify="center" style={{ flex: 1, minHeight: '300px' }}>
          <Box
            style={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(107, 114, 128, 0.1) 0%, rgba(107, 114, 128, 0.05) 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 16,
            }}
          >
            <IconClick size={36} style={{ color: 'var(--emr-gray-400)', opacity: 0.7 }} />
          </Box>
          <Text size="sm" c="dimmed" ta="center" fw={500} style={{ lineHeight: 1.5 }}>
            {t('formUI.messages.selectField') || 'Select a field to configure'}
          </Text>
          <Text size="xs" c="dimmed" ta="center" style={{ lineHeight: 1.5, maxWidth: 200 }}>
            {t('formUI.messages.clickToEdit') || 'Click on a field in the canvas to edit its properties'}
          </Text>
        </Stack>
      </Stack>
    );
  }

  return (
    <Stack
      gap="lg"
      style={{
        padding: 'var(--emr-panel-padding)',
        height: '100%',
        maxHeight: '100%',
        overflow: 'hidden',
        background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
        borderLeft: '1px solid rgba(0, 0, 0, 0.08)',
        boxShadow: '-2px 0 12px rgba(0, 0, 0, 0.04)',
      }}
      role="region"
      aria-label={t('formUI.builder.properties') || 'Properties Panel'}
    >
      {/* Enhanced Panel Header */}
      <Box
        style={{
          padding: '16px 20px',
          margin: '-20px -20px 0 -20px',
          background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
          borderBottom: '1px solid var(--emr-gray-200)',
        }}
      >
        <Group gap="sm" align="center">
          <Box
            style={{
              width: 32,
              height: 32,
              borderRadius: '8px',
              background: 'linear-gradient(135deg, rgba(99, 179, 237, 0.15) 0%, rgba(43, 108, 176, 0.1) 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <IconSettings size={18} style={{ color: 'var(--emr-secondary)' }} />
          </Box>
          <Text size="sm" fw={600} tt="uppercase" style={{ letterSpacing: '0.05em', color: 'var(--emr-gray-700)' }} id="properties-heading">
            {t('formUI.builder.properties')}
          </Text>
        </Group>
        <Text size="xs" c="dimmed" mt={8} style={{ lineHeight: 1.5 }}>
          {t('formUI.messages.configureField') || 'Configure field settings'}
        </Text>
      </Box>

      {/* Field Info Card */}
      <Box
        style={{
          padding: '14px 16px',
          background: 'linear-gradient(135deg, #ffffff 0%, #fafbfc 100%)',
          border: '1.5px solid var(--emr-gray-200)',
          borderRadius: '12px',
          boxShadow: 'var(--emr-shadow-panel-item)',
        }}
      >
        <Group justify="space-between" mb={8}>
          <Text size="xs" c="dimmed" tt="uppercase" fw={500} style={{ letterSpacing: '0.03em' }}>
            {t('formUI.labels.fieldType') || 'Field Type'}
          </Text>
          <Badge
            size="sm"
            variant="light"
            radius="xl"
            style={{
              background: 'linear-gradient(135deg, rgba(99, 179, 237, 0.15) 0%, rgba(43, 108, 176, 0.1) 100%)',
              color: 'var(--emr-secondary)',
              border: 'none',
            }}
          >
            {t(`fieldTypes.${unfrozenField.type}`)}
          </Badge>
        </Group>
        <Text size="xs" c="dimmed" tt="uppercase" fw={500} mb={4} style={{ letterSpacing: '0.03em' }}>
          {t('formUI.labels.fieldId') || 'Field ID'}
        </Text>
        <Text
          size="xs"
          style={{
            fontFamily: 'monospace',
            wordBreak: 'break-all',
            color: 'var(--emr-gray-600)',
            background: 'var(--emr-gray-100)',
            padding: '6px 10px',
            borderRadius: '6px',
            fontSize: '11px',
          }}
        >
          {unfrozenField.id}
        </Text>
      </Box>

      {/* Field Configuration Editor - Scrollable */}
      <Box
        style={{
          flex: 1,
          overflowY: 'auto',
          minHeight: 0,
          paddingRight: 6,
        }}
        className="emr-scrollbar"
      >
        <FieldConfigEditor field={unfrozenField} onChange={handleFieldChange} />
      </Box>
    </Stack>
  );
});
