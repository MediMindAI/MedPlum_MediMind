// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import React, { useState } from 'react';
import { Table, ActionIcon, TextInput, Box, Text } from '@mantine/core';
import { IconPencil, IconTrash, IconCheck, IconX } from '@tabler/icons-react';
import type { ActivityDefinition } from '@medplum/fhirtypes';
import { useTranslation } from '../../../hooks/useTranslation';

interface ManipulationTableProps {
  /** Array of manipulations to display */
  manipulations: ActivityDefinition[];
  /** Callback when edit is requested */
  onEdit: (id: string, name: string) => Promise<void>;
  /** Callback when delete is requested */
  onDelete: (id: string) => void;
  /** Loading state */
  loading?: boolean;
}

/**
 * ManipulationTable Component
 * @param root0
 * @param root0.manipulations
 * @param root0.onEdit
 * @param root0.onDelete
 * @param root0.loading
 */
export function ManipulationTable({ manipulations, onEdit, onDelete, loading }: ManipulationTableProps): JSX.Element {
  const { t } = useTranslation();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const handleEditStart = (manipulation: ActivityDefinition): void => {
    if (!manipulation.id) {return;}
    setEditingId(manipulation.id);
    setEditValue(manipulation.title || manipulation.code?.text || '');
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
        <Text c="dimmed">{t('laboratory.manipulations.table.noData')}</Text>
      </Box>
    );
  }

  if (manipulations.length === 0) {
    return (
      <Box p="md" style={{ textAlign: 'center' }}>
        <Text c="dimmed">{t('laboratory.manipulations.table.noData')}</Text>
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
          <th style={{ width: '85%', padding: '12px' }}>{t('laboratory.manipulations.field.name')}</th>
          <th style={{ width: '15%', padding: '12px', textAlign: 'center' }}>
            {t('laboratory.action.edit')} / {t('laboratory.action.delete')}
          </th>
        </tr>
      </thead>
      <tbody>
        {manipulations.map((manipulation) => {
          const isEditing = editingId === manipulation.id;

          return (
            <tr key={manipulation.id}>
              <td style={{ padding: '8px' }}>
                {isEditing ? (
                  <TextInput
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && manipulation.id) {
                        handleEditSave(manipulation.id);
                      } else if (e.key === 'Escape') {
                        handleEditCancel();
                      }
                    }}
                    autoFocus
                    size="sm"
                  />
                ) : (
                  <Text size="sm">{manipulation.title || manipulation.code?.text}</Text>
                )}
              </td>
              <td style={{ padding: '8px', textAlign: 'center' }}>
                {isEditing ? (
                  <Box style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                    <ActionIcon
                      color="green"
                      onClick={() => manipulation.id && handleEditSave(manipulation.id)}
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
                      onClick={() => handleEditStart(manipulation)}
                      title={t('laboratory.action.edit')}
                      size="sm"
                    >
                      <IconPencil size={16} />
                    </ActionIcon>
                    <ActionIcon
                      color="red"
                      onClick={() => manipulation.id && onDelete(manipulation.id)}
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
