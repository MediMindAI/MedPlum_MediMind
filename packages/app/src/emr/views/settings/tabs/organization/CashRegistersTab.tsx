// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { Button, Card, Grid, Paper, Stack, Title } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useState } from 'react';
import { useMedplum } from '@medplum/react-hooks';
import { notifications } from '@mantine/notifications';
import { IconPlus } from '@tabler/icons-react';
import { useTranslation } from '../../../../hooks/useTranslation';
import { useCashRegisters } from '../../../../hooks/useCashRegisters';
import { createCashRegister, deleteCashRegister } from '../../../../services/cashRegisterService';
import { CashRegisterTable } from '../../../../components/settings/cash-registers/CashRegisterTable';
import { CashRegisterEditModal } from '../../../../components/settings/cash-registers/CashRegisterEditModal';
import { CashRegisterForm } from '../../../../components/settings/cash-registers/CashRegisterForm';
import type { CashRegisterFormValues, CashRegisterRow } from '../../../../types/settings';

/**
 * Cash Registers Tab - Main view for managing cash registers
 *
 * Features:
 * - Inline add form at top
 * - Table of existing cash registers below
 * - Edit modal for modifying cash registers
 * - Delete confirmation and soft delete
 */
export function CashRegistersTab() {
  const medplum = useMedplum();
  const { t } = useTranslation();
  const { cashRegisters, loading, refresh } = useCashRegisters({ active: true });
  const [submitting, setSubmitting] = useState(false);
  const [editingCashRegister, setEditingCashRegister] = useState<CashRegisterRow | null>(null);

  const form = useForm<CashRegisterFormValues>({
    initialValues: {
      code: '',
      bankCode: '',
      nameKa: '',
      type: 'cash',
      active: true,
    },
    validate: {
      code: (value) =>
        !value ? t('settings.cashRegisters.validation.codeRequired') || 'Code is required' : null,
      nameKa: (value) =>
        !value ? t('settings.cashRegisters.validation.nameKaRequired') || 'Georgian name is required' : null,
      type: (value) =>
        !value ? t('settings.cashRegisters.validation.typeRequired') || 'Type is required' : null,
    },
  });

  const handleCreate = async (values: CashRegisterFormValues) => {
    try {
      setSubmitting(true);

      await createCashRegister(medplum, values);

      notifications.show({
        title: t('settings.cashRegisters.success.createTitle') || 'Success',
        message: t('settings.cashRegisters.success.createMessage') || 'Cash register created successfully',
        color: 'green',
      });

      form.reset();
      await refresh();
    } catch (error) {
      notifications.show({
        title: t('settings.cashRegisters.error.createTitle') || 'Error',
        message: t('settings.cashRegisters.error.createMessage') || 'Failed to create cash register',
        color: 'red',
      });
      console.error('Error creating cash register:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (cashRegister: CashRegisterRow) => {
    setEditingCashRegister(cashRegister);
  };

  const handleDelete = async (cashRegister: CashRegisterRow) => {
    if (
      !window.confirm(
        t('settings.cashRegisters.delete.confirm') || 'Are you sure you want to delete this cash register?'
      )
    ) {
      return;
    }

    try {
      await deleteCashRegister(medplum, cashRegister.id);

      notifications.show({
        title: t('settings.cashRegisters.success.deleteTitle') || 'Success',
        message: t('settings.cashRegisters.success.deleteMessage') || 'Cash register deleted successfully',
        color: 'green',
      });

      await refresh();
    } catch (error) {
      notifications.show({
        title: t('settings.cashRegisters.error.deleteTitle') || 'Error',
        message: t('settings.cashRegisters.error.deleteMessage') || 'Failed to delete cash register',
        color: 'red',
      });
      console.error('Error deleting cash register:', error);
    }
  };

  const handleEditSuccess = async () => {
    setEditingCashRegister(null);
    await refresh();
  };

  return (
    <Stack gap="lg">
      {/* Add Cash Register Form */}
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Stack gap="md">
          <Title order={3} size="h4">
            {t('settings.cashRegisters.add.title') || 'ახალი სალაროს დამატება'}
          </Title>

          <form onSubmit={form.onSubmit(handleCreate)}>
            <Stack gap="md">
              <CashRegisterForm form={form} />

              <Grid>
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
                    {t('settings.cashRegisters.add.button') || 'დამატება'}
                  </Button>
                </Grid.Col>
              </Grid>
            </Stack>
          </form>
        </Stack>
      </Card>

      {/* Cash Registers Table */}
      <Paper shadow="xs" p="md" withBorder>
        <Title order={3} size="h4" mb="md">
          {t('settings.cashRegisters.table.title') || 'სალაროები'}
        </Title>

        <CashRegisterTable
          cashRegisters={cashRegisters}
          onEdit={handleEdit}
          onDelete={handleDelete}
          loading={loading}
        />
      </Paper>

      {/* Edit Modal */}
      {editingCashRegister && (
        <CashRegisterEditModal
          opened={!!editingCashRegister}
          onClose={() => setEditingCashRegister(null)}
          cashRegister={editingCashRegister}
          onSuccess={handleEditSuccess}
        />
      )}
    </Stack>
  );
}
