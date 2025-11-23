// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { Box, Textarea, Text, Group, Button, Paper, Badge, Stack } from '@mantine/core';
import { IconRefresh } from '@tabler/icons-react';
import { useMemo } from 'react';
import { useTranslation } from '../../hooks/useTranslation';

/**
 * Sample values for preview substitution
 */
const SAMPLE_VALUES = {
  firstName: 'John',
  lastName: 'Doe',
  role: 'Physician',
  adminName: 'Admin',
};

interface WelcomeMessageEditorProps {
  /** Current value of the welcome message template */
  value: string;
  /** Callback when the value changes */
  onChange: (value: string) => void;
  /** Whether the editor is disabled */
  disabled?: boolean;
}

/**
 * WelcomeMessageEditor - Editor for customizing welcome message in invitation emails
 *
 * Features:
 * - Textarea for custom welcome message
 * - Shows available placeholders: {firstName}, {lastName}, {role}, {adminName}
 * - Preview section showing message with sample values substituted
 * - Reset to default button
 * - Character count indicator
 *
 * @param props - Component props
 * @param props.value - Current value of the welcome message
 * @param props.onChange - Callback when value changes
 * @param props.disabled - Whether the editor is disabled
 * @returns WelcomeMessageEditor component
 */
export function WelcomeMessageEditor({
  value,
  onChange,
  disabled = false,
}: WelcomeMessageEditorProps): JSX.Element {
  const { t } = useTranslation();

  // Get the placeholder text from translations
  const placeholderText = t('accountManagement.welcome.placeholder');
  const variablesText = t('accountManagement.welcome.variables');

  // Calculate preview with substituted sample values
  const preview = useMemo(() => {
    const templateToPreview = value || placeholderText;
    return substituteWelcomePlaceholders(templateToPreview, SAMPLE_VALUES);
  }, [value, placeholderText]);

  // Handle reset to default (empty string to use default template)
  const handleReset = (): void => {
    onChange('');
  };

  // Character count
  const charCount = value.length;

  return (
    <Box
      style={{
        background: 'var(--emr-section-header-bg)',
        padding: '16px',
        borderRadius: 'var(--emr-border-radius-lg)',
      }}
    >
      <Stack gap="md">
        {/* Title */}
        <Group justify="space-between">
          <Text size="sm" fw={600} c="var(--emr-primary)">
            {t('accountManagement.welcome.title')}
          </Text>
          <Button
            leftSection={<IconRefresh size={14} />}
            variant="subtle"
            size="xs"
            onClick={handleReset}
            disabled={disabled}
            aria-label="Reset to default"
          >
            {t('accountManagement.welcome.reset')}
          </Button>
        </Group>

        {/* Available placeholders */}
        <Group gap="xs">
          <Text size="xs" c="dimmed">
            {variablesText.split(':')[0]}:
          </Text>
          <Badge size="sm" variant="outline" color="blue">
            {'{firstName}'}
          </Badge>
          <Badge size="sm" variant="outline" color="blue">
            {'{lastName}'}
          </Badge>
          <Badge size="sm" variant="outline" color="blue">
            {'{role}'}
          </Badge>
          <Badge size="sm" variant="outline" color="blue">
            {'{adminName}'}
          </Badge>
        </Group>

        {/* Message textarea */}
        <Textarea
          value={value}
          onChange={(e) => onChange(e.currentTarget.value)}
          placeholder={placeholderText}
          minRows={3}
          maxRows={6}
          disabled={disabled}
          styles={{
            input: {
              minHeight: '80px',
            },
          }}
        />

        {/* Character count */}
        <Text size="xs" c="dimmed" ta="right">
          {charCount} {t('accountManagement.welcome.characters')}
        </Text>

        {/* Preview section */}
        <Box>
          <Text size="xs" fw={500} mb="xs">
            {t('accountManagement.welcome.preview')}:
          </Text>
          <Paper
            p="sm"
            withBorder
            style={{
              backgroundColor: 'var(--mantine-color-gray-0)',
              borderColor: 'var(--mantine-color-gray-3)',
            }}
          >
            <Text size="sm" style={{ whiteSpace: 'pre-wrap' }}>
              {preview}
            </Text>
          </Paper>
        </Box>
      </Stack>
    </Box>
  );
}

/**
 * Substitutes placeholders in a welcome message template with actual values
 *
 * @param template - The message template with placeholders
 * @param values - Object containing values for substitution
 * @returns The message with placeholders replaced
 */
export function substituteWelcomePlaceholders(
  template: string,
  values: {
    firstName?: string;
    lastName?: string;
    role?: string;
    adminName?: string;
  }
): string {
  let result = template;

  // Replace placeholders with values, handling undefined gracefully
  if (values.firstName !== undefined) {
    result = result.replace(/{firstName}/g, values.firstName);
  }
  if (values.lastName !== undefined) {
    result = result.replace(/{lastName}/g, values.lastName);
  }
  if (values.role !== undefined) {
    result = result.replace(/{role}/g, values.role);
  }
  if (values.adminName !== undefined) {
    result = result.replace(/{adminName}/g, values.adminName);
  }

  return result;
}
