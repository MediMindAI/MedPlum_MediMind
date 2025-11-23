// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { Box, Group, Button, Badge, Text, ThemeIcon, ActionIcon, Tooltip } from '@mantine/core';
import { EMRTextInput } from '../../components/shared/EMRFormFields';
import { IconArrowLeft, IconDeviceFloppy, IconArrowBackUp, IconArrowForwardUp, IconForms } from '@tabler/icons-react';
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
      style={{
        minHeight: 'calc(100vh - var(--emr-topnav-height) - var(--emr-mainmenu-height))',
        background: 'var(--emr-gradient-canvas)',
        display: 'flex',
        flexDirection: 'column',
      }}
      onKeyDown={handleKeyDown}
      data-testid="form-builder-view"
    >
      {/* Modern Hero Header */}
      <Box
        style={{
          background: 'var(--emr-gradient-header-modern)',
          padding: '16px 24px',
          boxShadow: 'var(--emr-shadow-soft-md)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Subtle background pattern */}
        <Box
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at 100% 0%, rgba(255,255,255,0.1) 0%, transparent 50%)',
            pointerEvents: 'none',
          }}
        />

        <Group justify="space-between" align="center" wrap="wrap" gap="md" style={{ position: 'relative', zIndex: 1 }}>
          {/* Left: Back button and title */}
          <Group gap="lg">
            <Tooltip label={t('formUI.buttons.cancel')} position="bottom">
              <ActionIcon
                variant="subtle"
                size={42}
                radius="xl"
                onClick={handleBack}
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  color: 'white',
                  backdropFilter: 'var(--emr-backdrop-blur)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  transition: 'var(--emr-transition-smooth)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.25)';
                  e.currentTarget.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                <IconArrowLeft size={20} />
              </ActionIcon>
            </Tooltip>

            <Group gap="sm">
              <ThemeIcon
                size={48}
                radius="xl"
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'var(--emr-backdrop-blur)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
                }}
              >
                <IconForms size={24} style={{ color: 'white' }} />
              </ThemeIcon>
              <Box>
                <Text size="lg" fw={600} style={{ color: 'white', letterSpacing: '-0.02em' }}>
                  {t('formUI.builder.newForm') || t('formManagement.createNew')}
                </Text>
                <Text size="xs" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  {state.fields.length} {state.fields.length === 1 ? 'field' : 'fields'}
                </Text>
              </Box>
            </Group>
          </Group>

          {/* Right: Actions */}
          <Group gap="xs">
            {/* Undo/Redo icon buttons */}
            <Group gap={4}>
              <Tooltip label="Undo (Ctrl+Z)" position="bottom">
                <ActionIcon
                  variant="subtle"
                  size={38}
                  radius="xl"
                  onClick={undo}
                  disabled={!canUndo}
                  style={{
                    backgroundColor: canUndo ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.08)',
                    color: canUndo ? 'white' : 'rgba(255, 255, 255, 0.4)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    transition: 'var(--emr-transition-smooth)',
                  }}
                >
                  <IconArrowBackUp size={18} />
                </ActionIcon>
              </Tooltip>
              <Tooltip label="Redo (Ctrl+Shift+Z)" position="bottom">
                <ActionIcon
                  variant="subtle"
                  size={38}
                  radius="xl"
                  onClick={redo}
                  disabled={!canRedo}
                  style={{
                    backgroundColor: canRedo ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.08)',
                    color: canRedo ? 'white' : 'rgba(255, 255, 255, 0.4)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    transition: 'var(--emr-transition-smooth)',
                  }}
                >
                  <IconArrowForwardUp size={18} />
                </ActionIcon>
              </Tooltip>
            </Group>

            {/* Status badge */}
            <Badge
              size="lg"
              radius="xl"
              style={{
                backgroundColor: state.status === 'active'
                  ? 'rgba(34, 197, 94, 0.9)'
                  : 'rgba(255, 255, 255, 0.95)',
                color: state.status === 'active' ? 'white' : 'var(--emr-secondary)',
                padding: '0 16px',
                height: '32px',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                fontSize: '11px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
              }}
            >
              {state.status}
            </Badge>

            {/* Save button */}
            <Button
              size="md"
              radius="xl"
              leftSection={<IconDeviceFloppy size={18} />}
              onClick={handleSave}
              style={{
                background: 'white',
                color: 'var(--emr-primary)',
                fontWeight: 600,
                padding: '0 24px',
                height: '42px',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.15)',
                border: 'none',
                transition: 'var(--emr-transition-smooth)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.15)';
              }}
            >
              {t('formUI.buttons.save')}
            </Button>
          </Group>
        </Group>
      </Box>

      {/* Compact Form Metadata Section */}
      <Box
        style={{
          padding: '12px 24px',
          background: 'white',
          borderBottom: '1px solid var(--emr-gray-200)',
        }}
      >
        <Group grow align="center" gap="lg">
          <EMRTextInput
            label={t('formUI.labels.title')}
            placeholder={t('formUI.builder.enterTitle')}
            value={state.title}
            onChange={(value) => actions.setTitle(value)}
            required
          />
          <EMRTextInput
            label={t('formUI.labels.description')}
            placeholder={t('formUI.builder.enterDescription')}
            value={state.description}
            onChange={(value) => actions.setDescription(value)}
          />
        </Group>
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
