// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { Box, Button, Card, Grid, Paper, Stack, Text, Title, NumberInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useState } from 'react';
import { useMedplum } from '@medplum/react-hooks';
import { notifications } from '@mantine/notifications';
import { IconPlus } from '@tabler/icons-react';
import { useTranslation } from '../../../../hooks/useTranslation';
import { useMedicalData } from '../../../../hooks/useMedicalData';
import { createMedicalData, deleteMedicalData } from '../../../../services/medicalDataService';
import { MedicalDataTable } from '../../../../components/settings/medical-data/MedicalDataTable';
import { MedicalDataEditModal } from '../../../../components/settings/medical-data/MedicalDataEditModal';
import { EMRTextInput } from '../../../../components/shared/EMRFormFields';
import type { MedicalDataFormValues, MedicalDataRow } from '../../../../types/settings';

/**
 * Post-operative Data Tab - Manages post-operative observation parameters
 *
 * Examples: კოაგულოგრამა, შაქარი, ელექტროლიტები, T/A mmHg, Ps, t°C, სუნთქვა, დიურეზი, etc.
 *
 * Features:
 * - Inline add form at top
 * - Table of existing items below
 * - Edit modal for modifying items
 * - Delete confirmation and soft delete
 */
export function PostopDataTab() {
  const medplum = useMedplum();
  const { t } = useTranslation();
  const { items, loading, refresh } = useMedicalData({ category: 'postop', active: true });
  const [submitting, setSubmitting] = useState(false);
  const [editingItem, setEditingItem] = useState<MedicalDataRow | null>(null);

  const form = useForm<MedicalDataFormValues>({
    initialValues: {
      code: '',
      nameKa: '',
      unit: '',
      sortOrder: undefined,
      category: 'postop',
      active: true,
    },
    validate: {
      code: (value) => (!value ? t('settings.medicalData.validation.codeRequired') || 'Code is required' : null),
      nameKa: (value) =>
        !value ? t('settings.medicalData.validation.nameKaRequired') || 'Georgian name is required' : null,
    },
  });

  const handleCreate = async (values: MedicalDataFormValues) => {
    try {
      setSubmitting(true);

      await createMedicalData(medplum, values);

      notifications.show({
        title: t('settings.medicalData.success.createTitle') || 'Success',
        message: t('settings.medicalData.success.createMessage') || 'Post-operative data created successfully',
        color: 'green',
      });

      form.reset();
      await refresh();
    } catch (error) {
      notifications.show({
        title: t('settings.medicalData.error.createTitle') || 'Error',
        message: t('settings.medicalData.error.createMessage') || 'Failed to create post-operative data',
        color: 'red',
      });
      console.error('Error creating post-operative data:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (item: MedicalDataRow) => {
    setEditingItem(item);
  };

  const handleDelete = async (item: MedicalDataRow) => {
    if (
      !window.confirm(
        t('settings.medicalData.delete.confirm') || 'Are you sure you want to delete this item?'
      )
    ) {
      return;
    }

    try {
      await deleteMedicalData(medplum, item.id);

      notifications.show({
        title: t('settings.medicalData.success.deleteTitle') || 'Success',
        message: t('settings.medicalData.success.deleteMessage') || 'Post-operative data deleted successfully',
        color: 'green',
      });

      await refresh();
    } catch (error) {
      notifications.show({
        title: t('settings.medicalData.error.deleteTitle') || 'Error',
        message: t('settings.medicalData.error.deleteMessage') || 'Failed to delete post-operative data',
        color: 'red',
      });
      console.error('Error deleting post-operative data:', error);
    }
  };

  const handleEditSuccess = async () => {
    setEditingItem(null);
    await refresh();
  };

  return (
    <Stack gap="lg">
      {/* Add Post-operative Data Form */}
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Stack gap="md">
          <Title order={3} size="h4">
            {t('settings.medicalData.postop.addTitle') || 'Add Post-operative Data'}
          </Title>

          <form onSubmit={form.onSubmit(handleCreate)}>
            <Stack gap="md">
              <Grid>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <EMRTextInput
                    label={t('settings.medicalData.field.code') || 'Code'}
                    placeholder={t('settings.medicalData.field.codePlaceholder') || 'coagulogram'}
                    required
                    {...form.getInputProps('code')}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <EMRTextInput
                    label={t('settings.medicalData.field.nameKa') || 'Name'}
                    placeholder={t('settings.medicalData.field.nameKaPlaceholder') || 'კოაგულოგრამა'}
                    required
                    {...form.getInputProps('nameKa')}
                  />
                </Grid.Col>
              </Grid>

              <Grid>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <EMRTextInput
                    label={t('settings.medicalData.field.unit') || 'Unit'}
                    placeholder={t('settings.medicalData.field.unitPlaceholder') || 'sec'}
                    {...form.getInputProps('unit')}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <NumberInput
                    label={t('settings.medicalData.field.sortOrder') || 'Sort'}
                    placeholder="1"
                    min={0}
                    {...form.getInputProps('sortOrder')}
                  />
                </Grid.Col>
              </Grid>

              <Box>
                <Button
                  type="submit"
                  leftSection={<IconPlus size={18} />}
                  loading={submitting}
                  style={{
                    background: 'linear-gradient(135deg, #1a365d 0%, #2b6cb0 50%, #3182ce 100%)',
                  }}
                >
                  {t('settings.medicalData.actions.add') || 'Add Post-operative Data'}
                </Button>
              </Box>
            </Stack>
          </form>
        </Stack>
      </Card>

      {/* Post-operative Data Table */}
      <Paper shadow="xs" p="md" withBorder>
        <Title order={3} size="h4" mb="md">
          {t('settings.medicalData.postop.tableTitle') || 'Post-operative Data'}
        </Title>

        <MedicalDataTable items={items} onEdit={handleEdit} onDelete={handleDelete} loading={loading} />
      </Paper>

      {/* Edit Modal */}
      {editingItem && (
        <MedicalDataEditModal
          opened={!!editingItem}
          onClose={() => setEditingItem(null)}
          item={editingItem}
          onSuccess={handleEditSuccess}
        />
      )}
    </Stack>
  );
}
