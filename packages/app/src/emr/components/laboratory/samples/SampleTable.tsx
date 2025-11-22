// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import React, { useState } from 'react';
import { Table, ActionIcon, TextInput, Button, Box, Text } from '@mantine/core';
import { IconPencil, IconTrash, IconCheck, IconX } from '@tabler/icons-react';
import type { SpecimenDefinition } from '@medplum/fhirtypes';
import { useTranslation } from '../../../hooks/useTranslation';

interface SampleTableProps {
  /** Array of sample types to display */
  samples: SpecimenDefinition[];
  /** Callback when edit is requested */
  onEdit: (id: string, name: string) => Promise<void>;
  /** Callback when delete is requested */
  onDelete: (id: string) => void;
  /** Loading state */
  loading?: boolean;
}

/**
 * SampleTable Component
 * @param root0
 * @param root0.samples
 * @param root0.onEdit
 * @param root0.onDelete
 * @param root0.loading
 */
export function SampleTable({ samples, onEdit, onDelete, loading }: SampleTableProps): JSX.Element {
  const { t } = useTranslation();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const handleEditStart = (sample: SpecimenDefinition): void => {
    if (!sample.id) {return;}
    setEditingId(sample.id);
    setEditValue(sample.typeCollected?.text || '');
  };

  const handleEditSave = async (id: string): Promise<void> => {
    if (!editValue.trim()) {return;}
    await onEdit(id, editValue);
    setEditingId(null);
    setEditValue('');
  };

  const handleEditCancel = (): void => {
    setEditingId(null);
    setEditValue('');
  };

  if (loading) {
    return (
      <Box p="md">
        <Text c="dimmed">{t('laboratory.samples.table.noData')}</Text>
      </Box>
    );
  }

  if (samples.length === 0) {
    return (
      <Box p="md" style={{ textAlign: 'center' }}>
        <Text c="dimmed">{t('laboratory.samples.table.noData')}</Text>
      </Box>
    );
  }

  return (
    <Table
      striped
      highlightOnHover
      style={{
        tableLayout: 'fixed',
      }}
    >
      <thead
        style={{
          background: 'var(--emr-gradient-submenu)',
          color: '#ffffff',
        }}
      >
        <tr>
          <th style={{ width: '85%', padding: '12px' }}>{t('laboratory.samples.field.name')}</th>
          <th style={{ width: '15%', padding: '12px', textAlign: 'center' }}>
            {t('laboratory.action.edit')} / {t('laboratory.action.delete')}
          </th>
        </tr>
      </thead>
      <tbody>
        {samples.map((sample) => {
          const isEditing = editingId === sample.id;

          return (
            <tr key={sample.id}>
              <td style={{ padding: '8px' }}>
                {isEditing ? (
                  <TextInput
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && sample.id) {
                        handleEditSave(sample.id);
                      } else if (e.key === 'Escape') {
                        handleEditCancel();
                      }
                    }}
                    autoFocus
                    size="sm"
                  />
                ) : (
                  <Text size="sm">{sample.typeCollected?.text}</Text>
                )}
              </td>
              <td style={{ padding: '8px', textAlign: 'center' }}>
                {isEditing ? (
                  <Box style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                    <ActionIcon
                      color="green"
                      onClick={() => sample.id && handleEditSave(sample.id)}
                      title={t('laboratory.action.save')}
                      size="sm"
                    >
                      <IconCheck size={16} />
                    </ActionIcon>
                    <ActionIcon
                      color="red"
                      onClick={handleEditCancel}
                      title={t('laboratory.action.cancel')}
                      size="sm"
                    >
                      <IconX size={16} />
                    </ActionIcon>
                  </Box>
                ) : (
                  <Box style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                    <ActionIcon
                      color="blue"
                      onClick={() => handleEditStart(sample)}
                      title={t('laboratory.action.edit')}
                      size="sm"
                    >
                      <IconPencil size={16} />
                    </ActionIcon>
                    <ActionIcon
                      color="red"
                      onClick={() => sample.id && onDelete(sample.id)}
                      title={t('laboratory.action.delete')}
                      size="sm"
                    >
                      <IconTrash size={16} />
                    </ActionIcon>
                  </Box>
                )}
              </td>
            </tr>
          );
        })}
      </tbody>
    </Table>
  );
}
