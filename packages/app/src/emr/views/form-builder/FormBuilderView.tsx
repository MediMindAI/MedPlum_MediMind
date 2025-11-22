// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { Box, Container, Group, Button, TextInput, Textarea, Stack, Badge, Text } from '@mantine/core';
import { IconArrowLeft, IconDeviceFloppy, IconRotate, IconRotateClockwise } from '@tabler/icons-react';
import { useMedplum } from '@medplum/react-hooks';
import { notifications } from '@mantine/notifications';
import { useNavigate } from 'react-router-dom';
import { useFormBuilder } from '../../hooks/useFormBuilder';
import { FormBuilderLayout } from '../../components/form-builder/FormBuilderLayout';
import { useTranslation } from '../../hooks/useTranslation';

/**
 * FormBuilderView Component
 *
 * Main form builder page at /emr/forms/builder
 *
 * Features:
 * - Form title and description input
 * - Save button with success/error notifications
 * - Back button to return to forms list
 * - Undo/Redo functionality with keyboard shortcuts
 * - Integration with useFormBuilder hook
 * - Uses FormBuilderLayout for three-panel layout
 *
 * Keyboard shortcuts:
 * - Ctrl/Cmd + Z: Undo
 * - Ctrl/Cmd + Shift + Z: Redo
 * - Ctrl/Cmd + S: Save (prevent browser default)
 *
 * Note: Current implementation uses FormBuilderLayout which manages its own state.
 * In future tasks (T027-T028), we'll refactor FormBuilderLayout to accept props
 * from useFormBuilder hook for proper integration.
 */
export function FormBuilderView(): JSX.Element {
  const medplum = useMedplum();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { state, actions, canUndo, canRedo, undo, redo, save } = useFormBuilder();

  // Handle save action
  const handleSave = async (): Promise<void> => {
    console.log('handleSave called, state.title:', state.title, 'fields:', state.fields.length);

    // Validate title before save
    if (!state.title?.trim()) {
      notifications.show({
        title: t('formUI.messages.error'),
        message: t('formUI.validation.titleRequired') || 'Please enter a form title',
        color: 'red',
      });
      return;
    }

    try {
      await save(medplum);
      notifications.show({
        title: t('formUI.messages.success'),
        message: t('formUI.messages.formSaved'),
        color: 'green',
      });
    } catch (error) {
      console.error('Error saving form:', error);
      notifications.show({
        title: t('formUI.messages.error'),
        message: error instanceof Error ? error.message : 'Failed to save form',
        color: 'red',
      });
    }
  };

  // Handle back navigation
  const handleBack = (): void => {
    // Check if there are unsaved changes
    if (state.fields.length > 0 || state.title || state.description) {
      const confirmed = window.confirm(t('formUI.messages.unsavedChanges'));
      if (!confirmed) {
        return;
      }
    }
    navigate('/emr/forms');
  };

  // Keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent): void => {
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      handleSave();
    } else if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'z') {
      e.preventDefault();
      if (canRedo) {
        redo();
      }
    } else if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
      e.preventDefault();
      if (canUndo) {
        undo();
      }
    }
  };

  return (
    <Box
      style={{ height: 'calc(100vh - var(--emr-topnav-height) - var(--emr-mainmenu-height))' }}
      onKeyDown={handleKeyDown}
    >
      {/* Header */}
      <Box
        style={{
          padding: 'var(--mantine-spacing-md)',
          borderBottom: '1px solid var(--emr-gray-200)',
          backgroundColor: 'var(--emr-gray-50)',
        }}
      >
        <Container size="xl">
          <Stack gap="md">
            {/* Top row: Back button, Undo/Redo, Save */}
            <Group justify="space-between" align="center">
              <Button variant="subtle" leftSection={<IconArrowLeft size={18} />} onClick={handleBack}>
                {t('formUI.buttons.cancel')}
              </Button>

              <Group gap="sm">
                {/* Undo/Redo buttons */}
                <Group gap="xs">
                  <Button
                    variant="default"
                    size="sm"
                    leftSection={<IconRotate size={16} />}
                    onClick={undo}
                    disabled={!canUndo}
                    title="Undo (Ctrl+Z)"
                  >
                    Undo
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    leftSection={<IconRotateClockwise size={16} />}
                    onClick={redo}
                    disabled={!canRedo}
                    title="Redo (Ctrl+Shift+Z)"
                  >
                    Redo
                  </Button>
                </Group>

                {/* Status badge */}
                <Badge color={state.status === 'active' ? 'green' : state.status === 'draft' ? 'blue' : 'gray'}>
                  {state.status.charAt(0).toUpperCase() + state.status.slice(1)}
                </Badge>

                {/* Save button */}
                <Button
                  variant="gradient"
                  gradient={{ from: 'var(--emr-primary)', to: 'var(--emr-secondary)' }}
                  leftSection={<IconDeviceFloppy size={18} />}
                  onClick={handleSave}
                  title="Save (Ctrl+S)"
                >
                  {t('formUI.buttons.save')}
                </Button>
              </Group>
            </Group>

            {/* Form metadata */}
            <Group grow align="flex-start">
              <TextInput
                label="Form Title"
                placeholder="Enter form title..."
                value={state.title}
                onChange={(e) => actions.setTitle(e.currentTarget.value)}
                required
                size="md"
                styles={{
                  input: {
                    fontSize: '1.125rem',
                    fontWeight: 600,
                  },
                }}
              />
              <Textarea
                label="Description"
                placeholder="Enter form description (optional)..."
                value={state.description}
                onChange={(e) => actions.setDescription(e.currentTarget.value)}
                minRows={1}
                maxRows={3}
                size="md"
              />
            </Group>

            {/* Debug info (temporary - shows useFormBuilder state) */}
            <Text size="xs" c="dimmed">
              Fields: {state.fields.length} | Selected: {state.selectedFieldId || 'None'} | Can Undo: {canUndo ? 'Yes' : 'No'} | Can Redo: {canRedo ? 'Yes' : 'No'}
            </Text>
          </Stack>
        </Container>
      </Box>

      {/* Form Builder Layout - Integrated with useFormBuilder state */}
      <Box style={{ height: 'calc(100% - 220px)' }}>
        <FormBuilderLayout
          fields={state.fields}
          formTitle={state.title}
          selectedFieldId={state.selectedFieldId}
          onFieldsChange={(newFields) => {
            // Handle field additions and updates
            newFields.forEach((field, index) => {
              const existingField = state.fields.find(f => f.id === field.id);
              if (!existingField) {
                // New field - add it
                actions.addField({ ...field, order: index });
              } else if (JSON.stringify(existingField) !== JSON.stringify(field)) {
                // Existing field changed - update it
                actions.updateField({ ...field, order: index });
              }
            });
            // Handle field deletions
            state.fields.forEach(existingField => {
              if (!newFields.find(f => f.id === existingField.id)) {
                actions.deleteField(existingField.id);
              }
            });
          }}
          onFieldSelect={actions.selectField}
          onFieldAdd={actions.addField}
          onFieldUpdate={actions.updateField}
          onFieldDelete={actions.deleteField}
          onFieldsReorder={actions.reorderFields}
        />
      </Box>
    </Box>
  );
}
