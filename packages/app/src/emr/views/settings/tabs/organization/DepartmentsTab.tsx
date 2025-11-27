// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { Box, Button, Card, Grid, Paper, Stack, Text, Title } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useState } from 'react';
import { useMedplum } from '@medplum/react-hooks';
import { notifications } from '@mantine/notifications';
import { IconPlus } from '@tabler/icons-react';
import { useTranslation } from '../../../../hooks/useTranslation';
import { useDepartments } from '../../../../hooks/useDepartments';
import { createDepartment, deleteDepartment } from '../../../../services/departmentService';
import { DepartmentTable } from '../../../../components/settings/departments/DepartmentTable';
import { DepartmentEditModal } from '../../../../components/settings/departments/DepartmentEditModal';
import { EMRTextInput, EMRSelect } from '../../../../components/shared/EMRFormFields';
import type { DepartmentFormValues, DepartmentRow } from '../../../../types/settings';

/**
 * Departments Tab - Main view for managing departments
 *
 * Features:
 * - Inline add form at top
 * - Table of existing departments below
 * - Edit modal for modifying departments
 * - Delete confirmation and soft delete
 */
export function DepartmentsTab() {
  const medplum = useMedplum();
  const { t } = useTranslation();
  const { departments, loading, refresh } = useDepartments({ active: true });
  const [submitting, setSubmitting] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<DepartmentRow | null>(null);

  const form = useForm<DepartmentFormValues>({
    initialValues: {
      code: '',
      nameKa: '',
      parentId: undefined,
      active: true,
    },
    validate: {
      code: (value) => (!value ? t('settings.departments.validation.codeRequired') || 'Code is required' : null),
      nameKa: (value) =>
        !value ? t('settings.departments.validation.nameKaRequired') || 'Georgian name is required' : null,
    },
  });

  const handleCreate = async (values: DepartmentFormValues) => {
    try {
      setSubmitting(true);

      await createDepartment(medplum, values);

      notifications.show({
        title: t('settings.departments.success.createTitle') || 'Success',
        message: t('settings.departments.success.createMessage') || 'Department created successfully',
        color: 'green',
      });

      form.reset();
      await refresh();
    } catch (error) {
      notifications.show({
        title: t('settings.departments.error.createTitle') || 'Error',
        message: t('settings.departments.error.createMessage') || 'Failed to create department',
        color: 'red',
      });
      console.error('Error creating department:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (department: DepartmentRow) => {
    setEditingDepartment(department);
  };

  const handleDelete = async (department: DepartmentRow) => {
    if (!window.confirm(t('settings.departments.delete.confirm') || 'Are you sure you want to delete this department?')) {
      return;
    }

    try {
      await deleteDepartment(medplum, department.id);

      notifications.show({
        title: t('settings.departments.success.deleteTitle') || 'Success',
        message: t('settings.departments.success.deleteMessage') || 'Department deleted successfully',
        color: 'green',
      });

      await refresh();
    } catch (error) {
      notifications.show({
        title: t('settings.departments.error.deleteTitle') || 'Error',
        message: t('settings.departments.error.deleteMessage') || 'Failed to delete department',
        color: 'red',
      });
      console.error('Error deleting department:', error);
    }
  };

  const handleEditSuccess = async () => {
    setEditingDepartment(null);
    await refresh();
  };

  // Parent department options for the add form
  const parentOptions = departments
    .filter((dept) => dept.active)
    .map((dept) => ({
      value: dept.id,
      label: dept.nameKa,
    }));

  return (
    <Stack gap="lg">
      {/* Add Department Form */}
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Stack gap="md">
          <Title order={3} size="h4">
            {t('settings.departments.add.title') || 'Add New Department'}
          </Title>

          <form onSubmit={form.onSubmit(handleCreate)}>
            <Stack gap="md">
              <Grid>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <EMRTextInput
                    label={t('settings.departments.field.code') || 'Department Code'}
                    placeholder={t('settings.departments.field.codePlaceholder') || 'DEPT-001'}
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
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <EMRSelect
                    label={t('settings.departments.field.parent') || 'Parent Department'}
                    placeholder={t('settings.departments.field.parentPlaceholder') || 'Select parent (optional)'}
                    data={parentOptions}
                    clearable
                    {...form.getInputProps('parentId')}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6 }} style={{ display: 'flex', alignItems: 'flex-end' }}>
                  <Button
                    type="submit"
                    leftSection={<IconPlus size={18} />}
                    loading={submitting}
                    fullWidth
                    style={{
                      background: 'linear-gradient(135deg, #1a365d 0%, #2b6cb0 50%, #3182ce 100%)',
                    }}
                  >
                    {t('settings.departments.add.button') || 'Add Department'}
                  </Button>
                </Grid.Col>
              </Grid>
            </Stack>
          </form>
        </Stack>
      </Card>

      {/* Departments Table */}
      <Paper shadow="xs" p="md" withBorder>
        <Title order={3} size="h4" mb="md">
          {t('settings.departments.table.title') || 'Departments'}
        </Title>

        <DepartmentTable
          departments={departments}
          onEdit={handleEdit}
          onDelete={handleDelete}
          loading={loading}
        />
      </Paper>

      {/* Edit Modal */}
      {editingDepartment && (
        <DepartmentEditModal
          opened={!!editingDepartment}
          onClose={() => setEditingDepartment(null)}
          department={editingDepartment}
          departments={departments}
          onSuccess={handleEditSuccess}
        />
      )}
    </Stack>
  );
}
