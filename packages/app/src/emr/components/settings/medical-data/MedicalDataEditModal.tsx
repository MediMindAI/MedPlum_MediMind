// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { Modal, Button, Stack } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useState } from 'react';
import { useMedplum } from '@medplum/react-hooks';
import { notifications } from '@mantine/notifications';
import { useTranslation } from '../../../hooks/useTranslation';
import { updateMedicalData, observationDefinitionToFormValues } from '../../../services/medicalDataService';
import { MedicalDataForm } from './MedicalDataForm';
import type { MedicalDataRow, MedicalDataFormValues } from '../../../types/settings';

interface MedicalDataEditModalProps {
  opened: boolean;
  onClose: () => void;
  item: MedicalDataRow;
  onSuccess: () => void;
}

/**
 * Modal for editing medical data items
 */
export function MedicalDataEditModal({ opened, onClose, item, onSuccess }: MedicalDataEditModalProps) {
  const medplum = useMedplum();
  const { t } = useTranslation();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (values: MedicalDataFormValues) => {
    try {
      setSubmitting(true);

      await updateMedicalData(medplum, item.id, values);

      notifications.show({
        title: t('settings.medicalData.success.updateTitle') || 'Success',
        message: t('settings.medicalData.success.updateMessage') || 'Medical data updated successfully',
        color: 'green',
      });

      onSuccess();
      onClose();
    } catch (error) {
      notifications.show({
        title: t('settings.medicalData.error.updateTitle') || 'Error',
        message: t('settings.medicalData.error.updateMessage') || 'Failed to update medical data',
        color: 'red',
      });
      console.error('Error updating medical data:', error);
    } finally {
      setSubmitting(false);
    }
  };

  // Convert row to form values
  const initialValues: MedicalDataFormValues = {
    id: item.id,
    code: item.code,
    nameKa: item.nameKa,
    unit: item.unit,
    sortOrder: item.sortOrder,
    category: item.category,
    active: item.active,
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={t('settings.medicalData.edit.title') || 'Edit Medical Data'}
      size="lg"
    >
      <Stack gap="md">
        <MedicalDataForm
          initialValues={initialValues}
          onSubmit={handleSubmit}
          category={item.category}
          loading={submitting}
        />

        <Button
          type="submit"
          loading={submitting}
          fullWidth
          style={{
            background: 'linear-gradient(135deg, #1a365d 0%, #2b6cb0 50%, #3182ce 100%)',
          }}
          onClick={() => {
            const form = document.querySelector('form');
            if (form) {
              form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
            }
          }}
        >
          {t('settings.medicalData.actions.save') || 'Save Changes'}
        </Button>
      </Stack>
    </Modal>
  );
}
