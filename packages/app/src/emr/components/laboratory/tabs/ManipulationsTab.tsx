// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import React, { useState } from 'react';
import { Box, Text } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useMedplum } from '@medplum/react-hooks';
import type { ActivityDefinition } from '@medplum/fhirtypes';
import { useTranslation } from '../../../hooks/useTranslation';
import { useManipulations } from '../../../hooks/useManipulations';
import { createManipulation, updateManipulation, deleteManipulation } from '../../../services/manipulationService';
import { ManipulationInlineForm } from '../manipulations/ManipulationInlineForm';
import { ManipulationTable } from '../manipulations/ManipulationTable';
import { ManipulationDeletionModal } from '../manipulations/ManipulationDeletionModal';

/**
 * ManipulationsTab Component
 */
export function ManipulationsTab(): JSX.Element {
  const { t } = useTranslation();
  const medplum = useMedplum();
  const { manipulations, loading, refresh, count } = useManipulations({ autoFetch: true });
  const [manipulationToDelete, setManipulationToDelete] = useState<ActivityDefinition | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleAdd = async (name: string): Promise<void> => {
    try {
      await createManipulation(medplum, {
        name,
        status: 'active',
      });

      notifications.show({
        title: t('laboratory.manipulations.success.created'),
        message: name,
        color: 'green',
      });

      await refresh();
    } catch (error) {
      console.error('Failed to create manipulation:', error);
      notifications.show({
        title: t('laboratory.manipulations.error.createFailed'),
        message: error instanceof Error ? error.message : 'Unknown error',
        color: 'red',
      });
    }
  };

  const handleEdit = async (id: string, name: string): Promise<void> => {
    try {
      await updateManipulation(medplum, id, {
        name,
        status: 'active',
      });

      notifications.show({
        title: t('laboratory.manipulations.success.updated'),
        message: name,
        color: 'green',
      });

      await refresh();
    } catch (error) {
      console.error('Failed to update manipulation:', error);
      notifications.show({
        title: t('laboratory.manipulations.error.updateFailed'),
        message: error instanceof Error ? error.message : 'Unknown error',
        color: 'red',
      });
    }
  };

  const handleDeleteRequest = (id: string): void => {
    const manipulation = manipulations.find((m) => m.id === id);
    if (manipulation) {
      setManipulationToDelete(manipulation);
    }
  };

  const handleDeleteConfirm = async (id: string): Promise<void> => {
    setDeleting(true);
    try {
      await deleteManipulation(medplum, id);

      notifications.show({
        title: t('laboratory.manipulations.success.deleted'),
        message: manipulationToDelete?.title || manipulationToDelete?.code?.text || '',
        color: 'green',
      });

      await refresh();
    } catch (error) {
      console.error('Failed to delete manipulation:', error);
      notifications.show({
        title: t('laboratory.manipulations.error.deleteFailed'),
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
          {t('laboratory.manipulations.title')}
        </Text>
        <Text size="sm" c="dimmed">
          {t('laboratory.recordCount', { count })}
        </Text>
      </Box>

      {/* Inline Add Form */}
      <ManipulationInlineForm onSubmit={handleAdd} loading={loading} />

      {/* Manipulations Table */}
      <Box style={{ flex: 1, overflow: 'auto' }}>
        <ManipulationTable
          manipulations={manipulations}
          onEdit={handleEdit}
          onDelete={handleDeleteRequest}
          loading={loading}
        />
      </Box>

      {/* Deletion Confirmation Modal */}
      <ManipulationDeletionModal
        manipulation={manipulationToDelete}
        opened={manipulationToDelete !== null}
        onClose={() => setManipulationToDelete(null)}
        onConfirm={handleDeleteConfirm}
        loading={deleting}
      />
    </Box>
  );
}
