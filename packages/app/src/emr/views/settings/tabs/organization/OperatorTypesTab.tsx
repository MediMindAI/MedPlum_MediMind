// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import React, { useState } from 'react';
import { Stack, Text } from '@mantine/core';
import { useMedplum } from '@medplum/react-hooks';
import { showNotification } from '@mantine/notifications';
import { useTranslation } from '../../../../hooks/useTranslation';
import { useOperatorTypes } from '../../../../hooks/useOperatorTypes';
import { OperatorTypeForm } from '../../../../components/settings/operator-types/OperatorTypeForm';
import { OperatorTypeTable } from '../../../../components/settings/operator-types/OperatorTypeTable';
import { OperatorTypeEditModal } from '../../../../components/settings/operator-types/OperatorTypeEditModal';
import {
  createOperatorType,
  updateOperatorType,
  deleteOperatorType,
} from '../../../../services/operatorTypeService';
import type { OperatorTypeFormValues } from '../../../../types/settings';

/**
 * OperatorTypesTab Component
 * Manages operator types for the EMR system
 */
export function OperatorTypesTab(): JSX.Element {
  const { t } = useTranslation();
  const medplum = useMedplum();
  const { operatorTypes, loading, refresh } = useOperatorTypes({ autoFetch: true });

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedOperatorType, setSelectedOperatorType] = useState<OperatorTypeFormValues | null>(null);

  /**
   * Handle creating a new operator type
   */
  const handleCreate = async (values: OperatorTypeFormValues): Promise<void> => {
    try {
      await createOperatorType(medplum, values);
      showNotification({
        title: t('settings.operatorTypes.notification.createSuccess'),
        message: t('settings.operatorTypes.notification.createSuccessMessage', { name: values.displayKa }),
        color: 'green',
      });
      await refresh();
    } catch (error) {
      console.error('Failed to create operator type:', error);
      showNotification({
        title: t('settings.operatorTypes.notification.createError'),
        message: error instanceof Error ? error.message : t('common.unknownError'),
        color: 'red',
      });
    }
  };

  /**
   * Handle updating an existing operator type
   */
  const handleUpdate = async (code: string, values: OperatorTypeFormValues): Promise<void> => {
    try {
      await updateOperatorType(medplum, code, values);
      showNotification({
        title: t('settings.operatorTypes.notification.updateSuccess'),
        message: t('settings.operatorTypes.notification.updateSuccessMessage', { name: values.displayKa }),
        color: 'green',
      });
      await refresh();
    } catch (error) {
      console.error('Failed to update operator type:', error);
      showNotification({
        title: t('settings.operatorTypes.notification.updateError'),
        message: error instanceof Error ? error.message : t('common.unknownError'),
        color: 'red',
      });
    }
  };

  /**
   * Handle deleting an operator type (soft delete)
   */
  const handleDelete = async (code: string): Promise<void> => {
    try {
      await deleteOperatorType(medplum, code);
      showNotification({
        title: t('settings.operatorTypes.notification.deleteSuccess'),
        message: t('settings.operatorTypes.notification.deleteSuccessMessage'),
        color: 'green',
      });
      await refresh();
    } catch (error) {
      console.error('Failed to delete operator type:', error);
      showNotification({
        title: t('settings.operatorTypes.notification.deleteError'),
        message: error instanceof Error ? error.message : t('common.unknownError'),
        color: 'red',
      });
    }
  };

  /**
   * Open edit modal for a specific operator type
   */
  const handleEdit = async (code: string, values: OperatorTypeFormValues): Promise<void> => {
    setSelectedOperatorType(values);
    setEditModalOpen(true);
  };

  /**
   * Close edit modal
   */
  const handleCloseEditModal = (): void => {
    setEditModalOpen(false);
    setSelectedOperatorType(null);
  };

  return (
    <Stack gap="md">
      <Text size="lg" fw={600}>
        {t('settings.operatorTypes.title')}
      </Text>

      <Text size="sm" c="dimmed">
        {t('settings.operatorTypes.description')}
      </Text>

      {/* Add new operator type form */}
      <OperatorTypeForm onSubmit={handleCreate} loading={loading} />

      {/* Operator types table */}
      <OperatorTypeTable operatorTypes={operatorTypes} onEdit={handleEdit} onDelete={handleDelete} loading={loading} />

      {/* Edit modal */}
      <OperatorTypeEditModal
        opened={editModalOpen}
        onClose={handleCloseEditModal}
        operatorType={selectedOperatorType}
        onSubmit={handleUpdate}
      />
    </Stack>
  );
}
