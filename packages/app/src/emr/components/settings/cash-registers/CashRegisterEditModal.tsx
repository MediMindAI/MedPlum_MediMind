// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { Button, Modal, Stack } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useState } from 'react';
import { useMedplum } from '@medplum/react-hooks';
import { notifications } from '@mantine/notifications';
import { useTranslation } from '../../../hooks/useTranslation';
import { updateCashRegister, locationToFormValues } from '../../../services/cashRegisterService';
import { CashRegisterForm } from './CashRegisterForm';
import type { CashRegisterFormValues, CashRegisterRow } from '../../../types/settings';

interface CashRegisterEditModalProps {
  opened: boolean;
  onClose: () => void;
  cashRegister: CashRegisterRow;
  onSuccess: () => void;
}

/**
 * Cash Register Edit Modal
 *
 * Modal dialog for editing an existing cash register.
 * Fetches the current values and allows updating all fields.
 */
export function CashRegisterEditModal({ opened, onClose, cashRegister, onSuccess }: CashRegisterEditModalProps) {
  const medplum = useMedplum();
  const { t } = useTranslation();
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<CashRegisterFormValues>({
    initialValues: {
      id: cashRegister.id,
      code: cashRegister.code,
      bankCode: cashRegister.bankCode || '',
      nameKa: cashRegister.nameKa,
      type: cashRegister.type,
      active: cashRegister.active,
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

  const handleSubmit = async (values: CashRegisterFormValues) => {
    try {
      setSubmitting(true);

      await updateCashRegister(medplum, cashRegister.id, values);

      notifications.show({
        title: t('settings.cashRegisters.success.updateTitle') || 'Success',
        message: t('settings.cashRegisters.success.updateMessage') || 'Cash register updated successfully',
        color: 'green',
      });

      onSuccess();
      onClose();
    } catch (error) {
      notifications.show({
        title: t('settings.cashRegisters.error.updateTitle') || 'Error',
        message: t('settings.cashRegisters.error.updateMessage') || 'Failed to update cash register',
        color: 'red',
      });
      console.error('Error updating cash register:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={t('settings.cashRegisters.edit.title') || 'რედაქტირება სალაროს'}
      size="lg"
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <CashRegisterForm form={form} />

          <Button
            type="submit"
            loading={submitting}
            fullWidth
            style={{
              background: 'linear-gradient(135deg, #1a365d 0%, #2b6cb0 50%, #3182ce 100%)',
            }}
          >
            {t('common.save') || 'შენახვა'}
          </Button>
        </Stack>
      </form>
    </Modal>
  );
}
