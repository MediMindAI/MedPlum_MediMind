// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import React, { useState } from 'react';
import { Box, Text } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useMedplum } from '@medplum/react-hooks';
import type { DeviceDefinition } from '@medplum/fhirtypes';
import { useTranslation } from '../../../hooks/useTranslation';
import { useSyringes } from '../../../hooks/useSyringes';
import { createSyringe, updateSyringe, deleteSyringe } from '../../../services/syringeService';
import { SyringeEntryForm } from '../syringes/SyringeEntryForm';
import { SyringeTable } from '../syringes/SyringeTable';
import { SyringeEditModal } from '../syringes/SyringeEditModal';
import { SyringeDeletionModal } from '../syringes/SyringeDeletionModal';
import type { SyringeFormValues } from '../../../types/laboratory';

/**
 * SyringesTab Component
 */
export function SyringesTab(): JSX.Element {
  const { t } = useTranslation();
  const medplum = useMedplum();
  const { syringes, loading, refresh, count } = useSyringes({ autoFetch: true });
  const [syringeToEdit, setSyringeToEdit] = useState<DeviceDefinition | null>(null);
  const [syringeToDelete, setSyringeToDelete] = useState<DeviceDefinition | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleAdd = async (values: SyringeFormValues): Promise<void> => {
    try {
      await createSyringe(medplum, values);

      notifications.show({
        title: t('laboratory.syringes.success.created'),
        message: values.name,
        color: 'green',
      });

      await refresh();
    } catch (error) {
      console.error('Failed to create syringe:', error);
      notifications.show({
        title: t('laboratory.syringes.error.createFailed'),
        message: error instanceof Error ? error.message : 'Unknown error',
        color: 'red',
      });
    }
  };

  const handleEditRequest = (id: string): void => {
    const syringe = syringes.find((s) => s.id === id);
    if (syringe) {
      setSyringeToEdit(syringe);
    }
  };

  const handleEditSave = async (id: string, values: SyringeFormValues): Promise<void> => {
    setSaving(true);
    try {
      await updateSyringe(medplum, id, values);

      notifications.show({
        title: t('laboratory.syringes.success.updated'),
        message: values.name,
        color: 'green',
      });

      await refresh();
    } catch (error) {
      console.error('Failed to update syringe:', error);
      notifications.show({
        title: t('laboratory.syringes.error.updateFailed'),
        message: error instanceof Error ? error.message : 'Unknown error',
        color: 'red',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRequest = (id: string): void => {
    const syringe = syringes.find((s) => s.id === id);
    if (syringe) {
      setSyringeToDelete(syringe);
    }
  };

  const handleDeleteConfirm = async (id: string): Promise<void> => {
    setDeleting(true);
    try {
      await deleteSyringe(medplum, id);

      notifications.show({
        title: t('laboratory.syringes.success.deleted'),
        message: syringeToDelete?.deviceName?.[0]?.name || '',
        color: 'green',
      });

      await refresh();
    } catch (error) {
      console.error('Failed to delete syringe:', error);
      notifications.show({
        title: t('laboratory.syringes.error.deleteFailed'),
        message: error instanceof Error ? error.message : 'Unknown error',
        color: 'red',
      });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Box style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header with record count */}
      <Box
        p="md"
        style={{
          borderBottom: '1px solid #dee2e6',
          backgroundColor: '#f8f9fa',
        }}
      >
        <Text fw={600} size="lg">
          {t('laboratory.syringes.title')}
        </Text>
        <Text size="sm" c="dimmed">
          {t('laboratory.recordCount', { count })}
        </Text>
      </Box>

      {/* Entry Form */}
      <SyringeEntryForm onSubmit={handleAdd} loading={loading} />

      {/* Syringes Table */}
      <Box style={{ flex: 1, overflow: 'auto' }}>
        <SyringeTable
          syringes={syringes}
          onEdit={handleEditRequest}
          onDelete={handleDeleteRequest}
          loading={loading}
        />
      </Box>

      {/* Edit Modal */}
      <SyringeEditModal
        syringe={syringeToEdit}
        opened={syringeToEdit !== null}
        onClose={() => setSyringeToEdit(null)}
        onSave={handleEditSave}
        loading={saving}
      />

      {/* Deletion Confirmation Modal */}
      <SyringeDeletionModal
        syringe={syringeToDelete}
        opened={syringeToDelete !== null}
        onClose={() => setSyringeToDelete(null)}
        onConfirm={handleDeleteConfirm}
        loading={deleting}
      />
    </Box>
  );
}
