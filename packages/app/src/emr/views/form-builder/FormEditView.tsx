// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { Box, Container, Group, Button, TextInput, Textarea, Stack, Badge, Text, Skeleton, Alert } from '@mantine/core';
import { IconArrowLeft, IconDeviceFloppy, IconRotate, IconRotateClockwise, IconAlertCircle } from '@tabler/icons-react';
import { useMedplum } from '@medplum/react-hooks';
import { notifications } from '@mantine/notifications';
import { useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import type { Questionnaire } from '@medplum/fhirtypes';
import { useFormBuilder } from '../../hooks/useFormBuilder';
import { FormBuilderLayout } from '../../components/form-builder/FormBuilderLayout';
import { useTranslation } from '../../hooks/useTranslation';
import { getQuestionnaire, updateWithVersioning, questionnaireToFormTemplate } from '../../services/formBuilderService';

/**
 * FormEditView Component
 *
 * Edit form page at /emr/forms/edit/:id
 *
 * Features:
 * - Load existing questionnaire by ID
 * - Edit form title and description
 * - Save with automatic version increment
 * - Undo/Redo functionality
 * - Uses FormBuilderLayout for three-panel layout
 * - Loading and error states
 */
export function FormEditView(): JSX.Element {
  const { id } = useParams<{ id: string }>();
  const medplum = useMedplum();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { state, actions, canUndo, canRedo, undo, redo, reset } = useFormBuilder();

  // Loading and error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [questionnaire, setQuestionnaire] = useState<Questionnaire | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load questionnaire on mount - only once
  useEffect(() => {
    // Prevent double loading
    if (isLoaded || !id) {
      if (!id) {
        setError('No questionnaire ID provided');
        setLoading(false);
      }
      return;
    }

    const loadQuestionnaire = async (): Promise<void> => {
      setLoading(true);
      setError(null);

      try {
        const q = await getQuestionnaire(medplum, id);
        setQuestionnaire(q);

        // Convert to form template and initialize form builder state
        const formTemplate = questionnaireToFormTemplate(q);

        // Use reset to set all state at once (avoids duplicate fields)
        reset({
          title: formTemplate.title,
          description: formTemplate.description || '',
          status: formTemplate.status,
          fields: formTemplate.fields,
          selectedFieldId: null,
        });

        setIsLoaded(true);
      } catch (err) {
        console.error('Error loading questionnaire:', err);
        setError(err instanceof Error ? err.message : 'Failed to load form');
      } finally {
        setLoading(false);
      }
    };

    loadQuestionnaire();
  }, [id, medplum, reset, isLoaded]);

  // Handle save action
  const handleSave = async (): Promise<void> => {
    if (!id || !questionnaire) return;

    // Validate title before save
    if (!state.title?.trim()) {
      notifications.show({
        title: t('formUI.messages.error'),
        message: t('formUI.validation.titleRequired') || 'Please enter a form title',
        color: 'red',
      });
      return;
    }

    setSaving(true);
    try {
      const formTemplate = {
        id,
        title: state.title.trim(),
        description: state.description,
        status: state.status,
        fields: state.fields,
        version: questionnaire.version,
      };

      const updated = await updateWithVersioning(medplum, id, formTemplate);
      setQuestionnaire(updated);

      notifications.show({
        title: t('formUI.messages.success'),
        message: t('formUI.messages.formSaved'),
        color: 'green',
      });
    } catch (err) {
      console.error('Error saving form:', err);
      notifications.show({
        title: t('formUI.messages.error'),
        message: err instanceof Error ? err.message : 'Failed to save form',
        color: 'red',
      });
    } finally {
      setSaving(false);
    }
  };

  // Handle back navigation
  const handleBack = (): void => {
    // Check if there are unsaved changes
    if (state.fields.length > 0 || state.title !== questionnaire?.title) {
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

  // Loading state
  if (loading) {
    return (
      <Box
        style={{ height: 'calc(100vh - var(--emr-topnav-height) - var(--emr-mainmenu-height))' }}
        data-testid="form-edit-view-loading"
      >
        <Box
          style={{
            padding: 'var(--mantine-spacing-md)',
            borderBottom: '1px solid var(--emr-gray-200)',
            backgroundColor: 'var(--emr-gray-50)',
          }}
        >
          <Container size="xl">
            <Stack gap="md">
              <Group justify="space-between" align="center">
                <Skeleton height={36} width={100} />
                <Group gap="sm">
                  <Skeleton height={36} width={80} />
                  <Skeleton height={36} width={80} />
                  <Skeleton height={36} width={100} />
                </Group>
              </Group>
              <Group grow>
                <Skeleton height={56} />
                <Skeleton height={56} />
              </Group>
            </Stack>
          </Container>
        </Box>
        <Box style={{ padding: 'var(--mantine-spacing-md)' }}>
          <Skeleton height={400} />
        </Box>
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Box
        style={{
          height: 'calc(100vh - var(--emr-topnav-height) - var(--emr-mainmenu-height))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 'var(--mantine-spacing-xl)',
        }}
        data-testid="form-edit-view-error"
      >
        <Alert
          icon={<IconAlertCircle size={16} />}
          title={t('formUI.messages.formNotFound')}
          color="red"
          variant="filled"
          style={{ maxWidth: 500 }}
        >
          <Stack gap="md">
            <Text>{error}</Text>
            <Button variant="white" onClick={handleBack}>
              {t('formUI.buttons.cancel')}
            </Button>
          </Stack>
        </Alert>
      </Box>
    );
  }

  return (
    <Box
      style={{ height: 'calc(100vh - var(--emr-topnav-height) - var(--emr-mainmenu-height))' }}
      onKeyDown={handleKeyDown}
      data-testid="form-edit-view"
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

                {/* Version badge */}
                {questionnaire?.version && (
                  <Badge variant="light" color="cyan">
                    v{questionnaire.version}
                  </Badge>
                )}

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
                  loading={saving}
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

            {/* Debug info */}
            <Text size="xs" c="dimmed">
              ID: {id} | Fields: {state.fields.length} | Selected: {state.selectedFieldId || 'None'} | Can Undo: {canUndo ? 'Yes' : 'No'} | Can Redo: {canRedo ? 'Yes' : 'No'}
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
