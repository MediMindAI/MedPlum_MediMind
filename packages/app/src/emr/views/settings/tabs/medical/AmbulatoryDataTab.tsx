// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { useState, useEffect } from 'react';
import { Box, Button, Card, Grid, Modal, Paper, Stack, Text, TextInput, Title } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useMedplum } from '@medplum/react-hooks';
import { notifications } from '@mantine/notifications';
import { IconPlus } from '@tabler/icons-react';
import { useTranslation } from '../../../../hooks/useTranslation';
import {
  searchMedicalData,
  createMedicalData,
  updateMedicalData,
  deleteMedicalData,
  observationDefinitionToRow,
} from '../../../../services/medicalDataService';
import { MedicalDataTable } from '../../../../components/settings/medical-data/MedicalDataTable';
import type { MedicalDataFormValues, MedicalDataRow } from '../../../../types/settings';

/**
 * Ambulatory Data Tab - Manage ambulatory data types
 *
 * Features:
 * - Inline add form at top
 * - Table of existing ambulatory data entries below
 * - Edit modal for modifying entries
 * - Soft delete with confirmation
 *
 * Ambulatory data types include:
 * - სიმაღლე (Height)
 * - წონა (Weight)
 * - სისტოლური წნევა (Systolic Pressure)
 * - დიასტოლური წნევა (Diastolic Pressure)
 * - პულსი (Pulse)
 * - სუნთქვის სიხშირე (Respiratory Rate)
 * - ტემპერატურა (Temperature)
 * - სატურაცია (Saturation)
 * - BMI
 * - etc.
 */
export function AmbulatoryDataTab(): JSX.Element {
  const medplum = useMedplum();
  const { t } = useTranslation();
  const [items, setItems] = useState<MedicalDataRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingItem, setEditingItem] = useState<MedicalDataRow | null>(null);
  const [editModalOpened, setEditModalOpened] = useState(false);

  const form = useForm<MedicalDataFormValues>({
    initialValues: {
      code: '',
      nameKa: '',
      unit: '',
      category: 'ambulatory',
      active: true,
    },
    validate: {
      code: (value) => (!value ? t('settings.ambulatoryData.validation.codeRequired') || 'Code is required' : null),
      nameKa: (value) =>
        !value ? t('settings.ambulatoryData.validation.nameKaRequired') || 'Georgian name is required' : null,
    },
  });

  const editForm = useForm<MedicalDataFormValues>({
    initialValues: {
      code: '',
      nameKa: '',
      unit: '',
      category: 'ambulatory',
      active: true,
    },
    validate: {
      code: (value) => (!value ? t('settings.ambulatoryData.validation.codeRequired') || 'Code is required' : null),
      nameKa: (value) =>
        !value ? t('settings.ambulatoryData.validation.nameKaRequired') || 'Georgian name is required' : null,
    },
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const results = await searchMedicalData(medplum, { category: 'ambulatory', active: true });
      const rows = results.map(observationDefinitionToRow);
      setItems(rows);
    } catch (error) {
      console.error('Error fetching ambulatory data:', error);
      notifications.show({
        title: t('settings.ambulatoryData.error.fetchTitle') || 'Error',
        message: t('settings.ambulatoryData.error.fetchMessage') || 'Failed to load ambulatory data',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchData();
  }, []);

  const handleCreate = async (values: MedicalDataFormValues) => {
    try {
      setSubmitting(true);

      await createMedicalData(medplum, values);

      notifications.show({
        title: t('settings.ambulatoryData.success.createTitle') || 'Success',
        message: t('settings.ambulatoryData.success.createMessage') || 'Ambulatory data entry created successfully',
        color: 'green',
      });

      form.reset();
      await fetchData();
    } catch (error) {
      notifications.show({
        title: t('settings.ambulatoryData.error.createTitle') || 'Error',
        message: t('settings.ambulatoryData.error.createMessage') || 'Failed to create entry',
        color: 'red',
      });
      console.error('Error creating ambulatory data:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (item: MedicalDataRow) => {
    setEditingItem(item);
    editForm.setValues({
      code: item.code,
      nameKa: item.nameKa,
      unit: item.unit,
      category: item.category,
      active: item.active,
      sortOrder: item.sortOrder,
    });
    setEditModalOpened(true);
  };

  const handleUpdate = async (values: MedicalDataFormValues) => {
    if (!editingItem?.id) return;

    try {
      setSubmitting(true);

      await updateMedicalData(medplum, editingItem.id, values);

      notifications.show({
        title: t('settings.ambulatoryData.success.updateTitle') || 'Success',
        message: t('settings.ambulatoryData.success.updateMessage') || 'Entry updated successfully',
        color: 'green',
      });

      setEditModalOpened(false);
      setEditingItem(null);
      await fetchData();
    } catch (error) {
      notifications.show({
        title: t('settings.ambulatoryData.error.updateTitle') || 'Error',
        message: t('settings.ambulatoryData.error.updateMessage') || 'Failed to update entry',
        color: 'red',
      });
      console.error('Error updating ambulatory data:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (item: MedicalDataRow) => {
    if (
      !window.confirm(t('settings.ambulatoryData.delete.confirm') || 'Are you sure you want to delete this entry?')
    ) {
      return;
    }

    if (!item.id) return;

    try {
      await deleteMedicalData(medplum, item.id);

      notifications.show({
        title: t('settings.ambulatoryData.success.deleteTitle') || 'Success',
        message: t('settings.ambulatoryData.success.deleteMessage') || 'Entry deleted successfully',
        color: 'green',
      });

      await fetchData();
    } catch (error) {
      notifications.show({
        title: t('settings.ambulatoryData.error.deleteTitle') || 'Error',
        message: t('settings.ambulatoryData.error.deleteMessage') || 'Failed to delete entry',
        color: 'red',
      });
      console.error('Error deleting ambulatory data:', error);
    }
  };

  return (
    <Stack gap="lg">
      {/* Page Description */}
      <Box>
        <Text size="sm" c="dimmed">
          {t('settings.ambulatoryData.description') || 'Manage ambulatory examination parameters'}
        </Text>
      </Box>

      {/* Add Entry Form */}
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Stack gap="md">
          <Title order={3} size="h4">
            {t('settings.ambulatoryData.add.title') || 'Add New Entry'}
          </Title>

          <form onSubmit={form.onSubmit(handleCreate)}>
            <Stack gap="md">
              <Grid>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <TextInput
                    label={t('settings.ambulatoryData.field.code') || 'Code'}
                    placeholder={t('settings.ambulatoryData.field.codePlaceholder') || 'e.g., height, weight, pulse'}
                    required
                    {...form.getInputProps('code')}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <TextInput
                    label={t('settings.ambulatoryData.field.nameKa') || 'Name'}
                    placeholder={
                      t('settings.ambulatoryData.field.nameKaPlaceholder') || 'e.g., სიმაღლე, წონა, პულსი'
                    }
                    required
                    {...form.getInputProps('nameKa')}
                  />
                </Grid.Col>
              </Grid>

              <Grid>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <TextInput
                    label={t('settings.ambulatoryData.field.unit') || 'Unit of Measurement'}
                    placeholder={t('settings.ambulatoryData.field.unitPlaceholder') || 'e.g., cm, kg, bpm'}
                    {...form.getInputProps('unit')}
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
                    {t('settings.ambulatoryData.add.button') || 'Add Entry'}
                  </Button>
                </Grid.Col>
              </Grid>
            </Stack>
          </form>
        </Stack>
      </Card>

      {/* Data Table */}
      <Paper shadow="xs" p="md" withBorder>
        <Title order={3} size="h4" mb="md">
          {t('settings.ambulatoryData.table.title') || 'Ambulatory Data Parameters'}
        </Title>

        <MedicalDataTable items={items} onEdit={handleEdit} onDelete={handleDelete} loading={loading} />
      </Paper>

      {/* Edit Modal */}
      <Modal
        opened={editModalOpened}
        onClose={() => {
          setEditModalOpened(false);
          setEditingItem(null);
        }}
        title={t('settings.ambulatoryData.edit.title') || 'Edit Entry'}
        size="lg"
      >
        <form onSubmit={editForm.onSubmit(handleUpdate)}>
          <Stack gap="md">
            <TextInput
              label={t('settings.ambulatoryData.field.code') || 'Code'}
              placeholder={t('settings.ambulatoryData.field.codePlaceholder') || 'e.g., height, weight, pulse'}
              required
              {...editForm.getInputProps('code')}
            />
            <TextInput
              label={t('settings.ambulatoryData.field.nameKa') || 'Name'}
              placeholder={t('settings.ambulatoryData.field.nameKaPlaceholder') || 'e.g., სიმაღლე, წონა, პულსი'}
              required
              {...editForm.getInputProps('nameKa')}
            />
            <TextInput
              label={t('settings.ambulatoryData.field.unit') || 'Unit of Measurement'}
              placeholder={t('settings.ambulatoryData.field.unitPlaceholder') || 'e.g., cm, kg, bpm'}
              {...editForm.getInputProps('unit')}
            />
            <Button type="submit" loading={submitting} fullWidth>
              {t('settings.ambulatoryData.edit.button') || 'Save Changes'}
            </Button>
          </Stack>
        </form>
      </Modal>
    </Stack>
  );
}
