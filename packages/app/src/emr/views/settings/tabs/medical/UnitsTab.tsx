// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { Box, Button, Card, Grid, Paper, Stack, Text, Title } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useState } from 'react';
import { useMedplum } from '@medplum/react-hooks';
import { notifications } from '@mantine/notifications';
import { IconPlus } from '@tabler/icons-react';
import type { CodeSystemConcept } from '@medplum/fhirtypes';
import { useTranslation } from '../../../../hooks/useTranslation';
import { useUnits } from '../../../../hooks/useUnits';
import { createUnit, deleteUnit } from '../../../../services/unitService';
import { UnitTable } from '../../../../components/settings/units/UnitTable';
import { UnitEditModal } from '../../../../components/settings/units/UnitEditModal';
import { EMRTextInput, EMRSelect, EMRSwitch } from '../../../../components/shared/EMRFormFields';
import type { UnitFormValues } from '../../../../types/settings';

/**
 * Units Tab - Main view for managing measurement units
 *
 * Features:
 * - Inline add form at top
 * - Table of existing units below
 * - Edit modal for modifying units
 * - Delete confirmation and soft delete
 */
export function UnitsTab() {
  const medplum = useMedplum();
  const { t } = useTranslation();
  const { units, loading, refresh } = useUnits({ active: true });
  const [submitting, setSubmitting] = useState(false);
  const [editingUnit, setEditingUnit] = useState<CodeSystemConcept | null>(null);

  const form = useForm<UnitFormValues>({
    initialValues: {
      code: '',
      displayKa: '',
      symbol: '',
      category: undefined,
      active: true,
    },
    validate: {
      code: (value) => (!value ? t('settings.units.validation.codeRequired') || 'Code is required' : null),
      displayKa: (value) =>
        !value ? t('settings.units.validation.displayKaRequired') || 'Georgian name is required' : null,
    },
  });

  const handleCreate = async (values: UnitFormValues) => {
    try {
      setSubmitting(true);

      await createUnit(medplum, values);

      notifications.show({
        title: t('settings.units.success.createTitle') || 'Success',
        message: t('settings.units.success.createMessage') || 'Unit created successfully',
        color: 'green',
      });

      form.reset();
      await refresh();
    } catch (error) {
      notifications.show({
        title: t('settings.units.error.createTitle') || 'Error',
        message: t('settings.units.error.createMessage') || 'Failed to create unit',
        color: 'red',
      });
      console.error('Error creating unit:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (unit: CodeSystemConcept) => {
    setEditingUnit(unit);
  };

  const handleDelete = async (unit: CodeSystemConcept) => {
    if (!window.confirm(t('settings.units.delete.confirm') || 'Are you sure you want to delete this unit?')) {
      return;
    }

    try {
      await deleteUnit(medplum, unit.code!);

      notifications.show({
        title: t('settings.units.success.deleteTitle') || 'Success',
        message: t('settings.units.success.deleteMessage') || 'Unit deleted successfully',
        color: 'green',
      });

      await refresh();
    } catch (error) {
      notifications.show({
        title: t('settings.units.error.deleteTitle') || 'Error',
        message: t('settings.units.error.deleteMessage') || 'Failed to delete unit',
        color: 'red',
      });
      console.error('Error deleting unit:', error);
    }
  };

  const handleEditSuccess = async () => {
    setEditingUnit(null);
    await refresh();
  };

  const categoryOptions = [
    { value: 'count', label: t('settings.units.category.count') || 'Count' },
    { value: 'volume', label: t('settings.units.category.volume') || 'Volume' },
    { value: 'mass', label: t('settings.units.category.mass') || 'Mass' },
    { value: 'concentration', label: t('settings.units.category.concentration') || 'Concentration' },
    { value: 'other', label: t('settings.units.category.other') || 'Other' },
  ];

  return (
    <Stack gap="lg">
      {/* Add Unit Form */}
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Stack gap="md">
          <Title order={3} size="h4">
            {t('settings.units.add.title') || 'Add New Unit'}
          </Title>

          <form onSubmit={form.onSubmit(handleCreate)}>
            <Stack gap="md">
              <Grid>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <EMRTextInput
                    label={t('settings.units.field.code') || 'Code'}
                    placeholder={t('settings.units.field.codePlaceholder') || 'UNIT-001'}
                    required
                    {...form.getInputProps('code')}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <EMRTextInput
                    label={t('settings.units.field.symbol') || 'Symbol'}
                    placeholder={t('settings.units.field.symbolPlaceholder') || 'мл, k/μl'}
                    {...form.getInputProps('symbol')}
                  />
                </Grid.Col>
              </Grid>

              <Grid>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <EMRTextInput
                    label={t('settings.units.field.displayKa') || 'Name'}
                    placeholder={t('settings.units.field.displayKaPlaceholder') || 'ერთეული'}
                    required
                    {...form.getInputProps('displayKa')}
                  />
                </Grid.Col>
              </Grid>

              <Grid>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <EMRSelect
                    label={t('settings.units.field.category') || 'Category'}
                    placeholder={t('settings.units.field.categoryPlaceholder') || 'Select category (optional)'}
                    data={categoryOptions}
                    clearable
                    {...form.getInputProps('category')}
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
                    {t('settings.units.add.button') || 'Add Unit'}
                  </Button>
                </Grid.Col>
              </Grid>
            </Stack>
          </form>
        </Stack>
      </Card>

      {/* Units Table */}
      <Paper shadow="xs" p="md" withBorder>
        <Title order={3} size="h4" mb="md">
          {t('settings.units.table.title') || 'Measurement Units'}
        </Title>

        <UnitTable units={units} onEdit={handleEdit} onDelete={handleDelete} loading={loading} />
      </Paper>

      {/* Edit Modal */}
      {editingUnit && (
        <UnitEditModal
          opened={!!editingUnit}
          onClose={() => setEditingUnit(null)}
          unit={editingUnit}
          onSuccess={handleEditSuccess}
        />
      )}
    </Stack>
  );
}
