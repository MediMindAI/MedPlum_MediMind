// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { Button, Card, Grid, Paper, Stack, Title } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useState } from 'react';
import { useMedplum } from '@medplum/react-hooks';
import { notifications } from '@mantine/notifications';
import { IconPlus } from '@tabler/icons-react';
import type { CodeSystemConcept } from '@medplum/fhirtypes';
import { useTranslation } from '../../../../hooks/useTranslation';
import { useAdminRoutes } from '../../../../hooks/useAdminRoutes';
import { createAdminRoute, deleteAdminRoute } from '../../../../services/adminRouteService';
import { AdminRouteTable } from '../../../../components/settings/admin-routes/AdminRouteTable';
import { AdminRouteEditModal } from '../../../../components/settings/admin-routes/AdminRouteEditModal';
import { EMRTextInput, EMRTextarea } from '../../../../components/shared/EMRFormFields';
import type { AdminRouteFormValues } from '../../../../types/settings';

/**
 * Administration Routes Tab - Main view for managing medication administration routes
 *
 * Features:
 * - Inline add form at top
 * - Table of existing routes below
 * - Edit modal for modifying routes
 * - Delete confirmation and soft delete
 */
export function AdminRoutesTab() {
  const medplum = useMedplum();
  const { t } = useTranslation();
  const { routes, loading, refresh } = useAdminRoutes({ active: true });
  const [submitting, setSubmitting] = useState(false);
  const [editingRoute, setEditingRoute] = useState<CodeSystemConcept | null>(null);

  const form = useForm<AdminRouteFormValues>({
    initialValues: {
      code: '',
      displayKa: '',
      abbreviation: '',
      description: '',
      active: true,
    },
    validate: {
      code: (value) => (!value ? t('settings.adminRoutes.validation.codeRequired') || 'Code is required' : null),
      displayKa: (value) =>
        !value ? t('settings.adminRoutes.validation.displayKaRequired') || 'Georgian name is required' : null,
      abbreviation: (value) =>
        !value ? t('settings.adminRoutes.validation.abbreviationRequired') || 'Abbreviation is required' : null,
    },
  });

  const handleCreate = async (values: AdminRouteFormValues) => {
    try {
      setSubmitting(true);

      await createAdminRoute(medplum, values);

      notifications.show({
        title: t('settings.adminRoutes.success.createTitle') || 'Success',
        message: t('settings.adminRoutes.success.createMessage') || 'Route created successfully',
        color: 'green',
      });

      form.reset();
      await refresh();
    } catch (error) {
      notifications.show({
        title: t('settings.adminRoutes.error.createTitle') || 'Error',
        message: t('settings.adminRoutes.error.createMessage') || 'Failed to create route',
        color: 'red',
      });
      console.error('Error creating admin route:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (route: CodeSystemConcept) => {
    setEditingRoute(route);
  };

  const handleDelete = async (route: CodeSystemConcept) => {
    if (!window.confirm(t('settings.adminRoutes.delete.confirm') || 'Are you sure you want to delete this route?')) {
      return;
    }

    try {
      await deleteAdminRoute(medplum, route.code!);

      notifications.show({
        title: t('settings.adminRoutes.success.deleteTitle') || 'Success',
        message: t('settings.adminRoutes.success.deleteMessage') || 'Route deleted successfully',
        color: 'green',
      });

      await refresh();
    } catch (error) {
      notifications.show({
        title: t('settings.adminRoutes.error.deleteTitle') || 'Error',
        message: t('settings.adminRoutes.error.deleteMessage') || 'Failed to delete route',
        color: 'red',
      });
      console.error('Error deleting admin route:', error);
    }
  };

  const handleEditSuccess = async () => {
    setEditingRoute(null);
    await refresh();
  };

  return (
    <Stack gap="lg">
      {/* Add Route Form */}
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Stack gap="md">
          <Title order={3} size="h4">
            {t('settings.adminRoutes.add.title') || 'Add New Route'}
          </Title>

          <form onSubmit={form.onSubmit(handleCreate)}>
            <Stack gap="md">
              <Grid>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <EMRTextInput
                    label={t('settings.adminRoutes.field.code') || 'Code'}
                    placeholder={t('settings.adminRoutes.field.codePlaceholder') || 'ROUTE-001'}
                    required
                    {...form.getInputProps('code')}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <EMRTextInput
                    label={t('settings.adminRoutes.field.abbreviation') || 'Abbreviation'}
                    placeholder={t('settings.adminRoutes.field.abbreviationPlaceholder') || 'p.o., i.v., s.c.'}
                    required
                    {...form.getInputProps('abbreviation')}
                  />
                </Grid.Col>
              </Grid>

              <Grid>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <EMRTextInput
                    label={t('settings.adminRoutes.field.displayKa') || 'Name'}
                    placeholder={t('settings.adminRoutes.field.displayKaPlaceholder') || 'მიღების ტიპი'}
                    required
                    {...form.getInputProps('displayKa')}
                  />
                </Grid.Col>
              </Grid>

              <EMRTextarea
                label={t('settings.adminRoutes.field.description') || 'Description'}
                placeholder={t('settings.adminRoutes.field.descriptionPlaceholder') || 'Additional notes...'}
                minRows={2}
                {...form.getInputProps('description')}
              />

              <Grid>
                <Grid.Col span={12}>
                  <Button
                    type="submit"
                    leftSection={<IconPlus size={18} />}
                    loading={submitting}
                    fullWidth
                    style={{
                      background: 'linear-gradient(135deg, #1a365d 0%, #2b6cb0 50%, #3182ce 100%)',
                    }}
                  >
                    {t('settings.adminRoutes.add.button') || 'Add Route'}
                  </Button>
                </Grid.Col>
              </Grid>
            </Stack>
          </form>
        </Stack>
      </Card>

      {/* Routes Table */}
      <Paper shadow="xs" p="md" withBorder>
        <Title order={3} size="h4" mb="md">
          {t('settings.adminRoutes.table.title') || 'Administration Routes'}
        </Title>

        <AdminRouteTable routes={routes} onEdit={handleEdit} onDelete={handleDelete} loading={loading} />
      </Paper>

      {/* Edit Modal */}
      {editingRoute && (
        <AdminRouteEditModal
          opened={!!editingRoute}
          onClose={() => setEditingRoute(null)}
          route={editingRoute}
          onSuccess={handleEditSuccess}
        />
      )}
    </Stack>
  );
}
