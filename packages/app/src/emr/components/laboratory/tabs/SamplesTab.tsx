// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import React, { useState } from 'react';
import { Box, Text } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useMedplum } from '@medplum/react-hooks';
import type { SpecimenDefinition } from '@medplum/fhirtypes';
import { useTranslation } from '../../../hooks/useTranslation';
import { useSamples } from '../../../hooks/useSamples';
import { createSample, updateSample, deleteSample } from '../../../services/sampleService';
import { SampleInlineForm } from '../samples/SampleInlineForm';
import { SampleTable } from '../samples/SampleTable';
import { SampleDeletionModal } from '../samples/SampleDeletionModal';

/**
 * SamplesTab Component
 */
export function SamplesTab(): JSX.Element {
  const { t } = useTranslation();
  const medplum = useMedplum();
  const { samples, loading, refresh, count } = useSamples({ autoFetch: true });
  const [sampleToDelete, setSampleToDelete] = useState<SpecimenDefinition | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleAdd = async (name: string): Promise<void> => {
    try {
      await createSample(medplum, {
        name,
        status: 'active',
      });

      notifications.show({
        title: t('laboratory.samples.success.created'),
        message: name,
        color: 'green',
      });

      await refresh();
    } catch (error) {
      console.error('Failed to create sample:', error);
      notifications.show({
        title: t('laboratory.samples.error.createFailed'),
        message: error instanceof Error ? error.message : 'Unknown error',
        color: 'red',
      });
    }
  };

  const handleEdit = async (id: string, name: string): Promise<void> => {
    try {
      await updateSample(medplum, id, {
        name,
        status: 'active',
      });

      notifications.show({
        title: t('laboratory.samples.success.updated'),
        message: name,
        color: 'green',
      });

      await refresh();
    } catch (error) {
      console.error('Failed to update sample:', error);
      notifications.show({
        title: t('laboratory.samples.error.updateFailed'),
        message: error instanceof Error ? error.message : 'Unknown error',
        color: 'red',
      });
    }
  };

  const handleDeleteRequest = (id: string): void => {
    const sample = samples.find((s) => s.id === id);
    if (sample) {
      setSampleToDelete(sample);
    }
  };

  const handleDeleteConfirm = async (id: string): Promise<void> => {
    setDeleting(true);
    try {
      await deleteSample(medplum, id);

      notifications.show({
        title: t('laboratory.samples.success.deleted'),
        message: sampleToDelete?.typeCollected?.text || '',
        color: 'green',
      });

      await refresh();
    } catch (error) {
      console.error('Failed to delete sample:', error);
      notifications.show({
        title: t('laboratory.samples.error.deleteFailed'),
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
          {t('laboratory.samples.title')}
        </Text>
        <Text size="sm" c="dimmed">
          {t('laboratory.recordCount', { count })}
        </Text>
      </Box>

      {/* Inline Add Form */}
      <SampleInlineForm onSubmit={handleAdd} loading={loading} />

      {/* Samples Table */}
      <Box style={{ flex: 1, overflow: 'auto' }}>
        <SampleTable
          samples={samples}
          onEdit={handleEdit}
          onDelete={handleDeleteRequest}
          loading={loading}
        />
      </Box>

      {/* Deletion Confirmation Modal */}
      <SampleDeletionModal
        sample={sampleToDelete}
        opened={sampleToDelete !== null}
        onClose={() => setSampleToDelete(null)}
        onConfirm={handleDeleteConfirm}
        loading={deleting}
      />
    </Box>
  );
}
