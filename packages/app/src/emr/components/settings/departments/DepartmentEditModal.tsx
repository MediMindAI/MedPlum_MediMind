// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { Modal, Button, Grid, Stack, Text } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useState } from 'react';
import { useMedplum } from '@medplum/react-hooks';
import { notifications } from '@mantine/notifications';
import { useTranslation } from '../../../hooks/useTranslation';
import { EMRTextInput, EMRSelect } from '../../shared/EMRFormFields';
import { updateDepartment } from '../../../services/departmentService';
import type { DepartmentFormValues, DepartmentRow } from '../../../types/settings';

interface DepartmentEditModalProps {
  opened: boolean;
  onClose: () => void;
  department: DepartmentRow;
  departments: DepartmentRow[]; // All departments for parent select
  onSuccess?: () => void;
}

/**
 * Modal for editing existing department
 *
 * Features:
 * - Pre-populated form with existing department data
 * - Validation for required fields
 * - Success/error notifications
 * - Auto-refresh parent list after save
 */
export function DepartmentEditModal({
  opened,
  onClose,
  department,
  departments,
  onSuccess,
}: DepartmentEditModalProps) {
  const medplum = useMedplum();
  const { t } = useTranslation();
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<DepartmentFormValues>({
    initialValues: {
      id: department.id,
      code: department.code,
      nameKa: department.nameKa,
      parentId: undefined, // Will be set from department.partOf if needed
      active: department.active,
    },
    validate: {
      code: (value) => (!value ? t('settings.departments.validation.codeRequired') || 'Code is required' : null),
      nameKa: (value) =>
        !value ? t('settings.departments.validation.nameKaRequired') || 'Georgian name is required' : null,
    },
  });

  const handleSubmit = async (values: DepartmentFormValues) => {
    try {
      setSubmitting(true);

      await updateDepartment(medplum, department.id, values);

      notifications.show({
        title: t('settings.departments.success.updateTitle') || 'Success',
        message: t('settings.departments.success.updateMessage') || 'Department updated successfully',
        color: 'green',
      });

      onSuccess?.();
      onClose();
    } catch (error) {
      notifications.show({
        title: t('settings.departments.error.updateTitle') || 'Error',
        message: t('settings.departments.error.updateMessage') || 'Failed to update department',
        color: 'red',
      });
      console.error('Error updating department:', error);
    } finally {
      setSubmitting(false);
    }
  };

  // Parent department options (exclude current department)
  const parentOptions = departments
    .filter((dept) => dept.active && dept.id !== department.id)
    .map((dept) => ({
      value: dept.id,
      label: dept.nameKa,
    }));

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      size="lg"
      centered
      title={
        <Text fw={700} size="xl" c="dark">
          {t('settings.departments.edit.title') || 'Edit Department'}
        </Text>
      }
      styles={{
        header: {
          borderBottom: '2px solid #e9ecef',
          paddingBottom: 12,
        },
        body: {
          padding: '20px 24px',
        },
      }}
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <Grid>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <EMRTextInput
                label={t('settings.departments.field.code') || 'Department Code'}
                placeholder={t('settings.departments.field.codePlaceholder') || 'Enter code'}
                required
                {...form.getInputProps('code')}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <EMRTextInput
                label={t('settings.departments.field.nameKa') || 'Name'}
                placeholder={t('settings.departments.field.nameKaPlaceholder') || 'დეპარტამენტის სახელი'}
                required
                {...form.getInputProps('nameKa')}
              />
            </Grid.Col>
          </Grid>

          <Grid>
            <Grid.Col span={12}>
              <EMRSelect
                label={t('settings.departments.field.parent') || 'Parent Department'}
                placeholder={t('settings.departments.field.parentPlaceholder') || 'Select parent (optional)'}
                data={parentOptions}
                clearable
                {...form.getInputProps('parentId')}
              />
            </Grid.Col>
          </Grid>

          {/* Action Buttons */}
          <Grid mt="xl">
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <Button variant="outline" fullWidth onClick={onClose} disabled={submitting} size="md">
                {t('settings.departments.edit.cancel') || 'Cancel'}
              </Button>
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <Button
                type="submit"
                fullWidth
                loading={submitting}
                size="md"
                style={{
                  background: 'linear-gradient(135deg, #1a365d 0%, #2b6cb0 50%, #3182ce 100%)',
                }}
              >
                {t('settings.departments.edit.save') || 'Save'}
              </Button>
            </Grid.Col>
          </Grid>
        </Stack>
      </form>
    </Modal>
  );
}
