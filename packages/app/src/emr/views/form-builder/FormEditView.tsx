// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { Box, Group, Button, Stack, Badge, Text, Skeleton, Alert, ThemeIcon, Paper, Grid } from '@mantine/core';
import { EMRTextInput } from '../../components/shared/EMRFormFields';
import { IconArrowLeft, IconDeviceFloppy, IconRotate, IconRotateClockwise, IconAlertCircle, IconForms, IconEye } from '@tabler/icons-react';
import { useMedplum } from '@medplum/react-hooks';
import { notifications } from '@mantine/notifications';
import { useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import type { Questionnaire } from '@medplum/fhirtypes';
import { useFormBuilder } from '../../hooks/useFormBuilder';
import { FormBuilderLayout } from '../../components/form-builder/FormBuilderLayout';
import { useTranslation } from '../../hooks/useTranslation';
import { getQuestionnaire, updateWithVersioning, questionnaireToFormTemplate } from '../../services/formBuilderService';
import FormGroupSelect from '../../components/form-management/FormGroupSelect';
import FormTypeSelect from '../../components/form-management/FormTypeSelect';

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
          formGroup: formTemplate.formGroup,
          formType: formTemplate.formType,
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
        formGroup: state.formGroup,
        formType: state.formType,
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
            padding: 'var(--mantine-spacing-md) var(--mantine-spacing-xl)',
            background: 'var(--emr-gradient-secondary)',
          }}
        >
          <Group justify="space-between" align="center">
            <Skeleton height={36} width={100} />
            <Group gap="sm">
              <Skeleton height={36} width={80} />
              <Skeleton height={36} width={80} />
              <Skeleton height={36} width={100} />
            </Group>
          </Group>
        </Box>
        <Box
          style={{
            padding: 'var(--mantine-spacing-md) var(--mantine-spacing-xl)',
            backgroundColor: 'white',
            borderBottom: '1px solid var(--emr-gray-200)',
          }}
        >
          <Group grow>
            <Skeleton height={56} />
            <Skeleton height={56} />
          </Group>
        </Box>
        <Box style={{ padding: 'var(--mantine-spacing-xl)' }}>
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
      style={{
        minHeight: 'calc(100vh - var(--emr-topnav-height) - var(--emr-mainmenu-height))',
        backgroundColor: 'var(--emr-gray-50)',
        display: 'flex',
        flexDirection: 'column',
      }}
      onKeyDown={handleKeyDown}
      data-testid="form-edit-view"
    >
      {/* Hero Header with Gradient */}
      <Box
        style={{
          background: 'var(--emr-gradient-secondary)',
          padding: 'var(--mantine-spacing-md) var(--mantine-spacing-xl)',
        }}
      >
        <Group justify="space-between" align="center" wrap="wrap" gap="md">
          {/* Left: Back button and title */}
          <Group gap="md">
            <Button
              variant="white"
              leftSection={<IconArrowLeft size={18} />}
              onClick={handleBack}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                color: 'white',
                border: '1px solid rgba(255, 255, 255, 0.3)',
              }}
            >
              {t('formUI.buttons.cancel')}
            </Button>
            <Group gap="sm">
              <ThemeIcon
                size={44}
                radius="md"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  color: 'white',
                }}
              >
                <IconForms size={24} />
              </ThemeIcon>
              <Text size="lg" fw={600} style={{ color: 'white' }}>
                {t('formUI.builder.editForm')}
              </Text>
            </Group>
          </Group>

          {/* Right: Actions */}
          <Group gap="sm">
            {/* Undo/Redo buttons */}
            <Group gap={4}>
              <Button
                variant="white"
                size="sm"
                leftSection={<IconRotate size={16} />}
                onClick={undo}
                disabled={!canUndo}
                title="Undo (Ctrl+Z)"
                style={{
                  backgroundColor: canUndo ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.5)',
                  color: canUndo ? 'var(--emr-primary)' : 'var(--emr-gray-400)',
                }}
              >
                Undo
              </Button>
              <Button
                variant="white"
                size="sm"
                leftSection={<IconRotateClockwise size={16} />}
                onClick={redo}
                disabled={!canRedo}
                title="Redo (Ctrl+Shift+Z)"
                style={{
                  backgroundColor: canRedo ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.5)',
                  color: canRedo ? 'var(--emr-primary)' : 'var(--emr-gray-400)',
                }}
              >
                Redo
              </Button>
            </Group>

            {/* Version badge */}
            {questionnaire?.version && (
              <Badge
                variant="light"
                size="lg"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  color: 'var(--emr-primary)',
                }}
              >
                v{questionnaire.version}
              </Badge>
            )}

            {/* Status badge */}
            <Badge
              size="lg"
              style={{
                backgroundColor: state.status === 'active' ? 'rgba(34, 197, 94, 0.9)' : 'rgba(255, 255, 255, 0.9)',
                color: state.status === 'active' ? 'white' : 'var(--emr-secondary)',
              }}
            >
              {state.status.toUpperCase()}
            </Badge>

            {/* Preview button */}
            <Button
              variant="white"
              size="md"
              leftSection={<IconEye size={18} />}
              onClick={() => navigate(`/emr/forms/fill/${id}`)}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                color: 'var(--emr-primary)',
                fontWeight: 600,
              }}
            >
              {t('formUI.builder.preview')}
            </Button>

            {/* Save button */}
            <Button
              variant="white"
              size="md"
              leftSection={<IconDeviceFloppy size={18} />}
              onClick={handleSave}
              loading={saving}
              title="Save (Ctrl+S)"
              style={{
                backgroundColor: 'white',
                color: 'var(--emr-primary)',
                fontWeight: 600,
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
              }}
            >
              {t('formUI.buttons.save')}
            </Button>
          </Group>
        </Group>
      </Box>

      {/* Form Metadata Section */}
      <Box
        style={{
          padding: '4px 24px',
          backgroundColor: 'white',
          borderBottom: '1px solid var(--emr-gray-200)',
        }}
      >
        <Grid gutter="sm">
          <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
            <EMRTextInput
            label={
              <Text size="sm" fw={500} c="var(--emr-gray-600)">
                Form Title <span style={{ color: 'var(--emr-secondary)' }}>*</span>
              </Text>
            }
            placeholder={t('formUI.builder.enterTitle')}
            value={state.title}
            onChange={(value) => actions.setTitle(value)}
            required
            size="sm"
            styles={{
              input: {
                fontSize: '1rem',
                fontWeight: 600,
                border: '1px solid var(--emr-gray-200)',
                '&:focus': {
                  borderColor: 'var(--emr-secondary)',
                  boxShadow: '0 0 0 2px var(--emr-light-accent)',
                },
              },
            }}
          />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
          <EMRTextInput
            label={
              <Text size="sm" fw={500} c="var(--emr-gray-600)">
                Description
              </Text>
            }
            placeholder={t('formUI.builder.enterDescription')}
            value={state.description}
            onChange={(value) => actions.setDescription(value)}
            size="sm"
            styles={{
              input: {
                border: '1px solid var(--emr-gray-200)',
                '&:focus': {
                  borderColor: 'var(--emr-secondary)',
                  boxShadow: '0 0 0 2px var(--emr-light-accent)',
                },
              },
            }}
          />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
            <FormGroupSelect
              value={state.formGroup}
              onChange={(value) => actions.setFormGroup(value || undefined)}
              size="sm"
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
            <FormTypeSelect
              value={state.formType}
              onChange={(value) => actions.setFormType(value || undefined)}
              size="sm"
            />
          </Grid.Col>
        </Grid>
      </Box>

      {/* Form Builder Layout - Integrated with useFormBuilder state */}
      <Box style={{ flex: 1, minHeight: '500px' }}>
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
