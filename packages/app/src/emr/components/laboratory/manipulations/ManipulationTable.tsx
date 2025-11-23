// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import React, { useState } from 'react';
import { Text } from '@mantine/core';
import { EMRTextInput } from '../../shared/EMRFormFields';
import { IconEdit, IconTrash, IconFolder, IconCheck, IconX } from '@tabler/icons-react';
import type { ActivityDefinition } from '@medplum/fhirtypes';
import { useTranslation } from '../../../hooks/useTranslation';
import { EMRTable } from '../../shared/EMRTable';
import type { EMRTableColumn } from '../../shared/EMRTable';

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

// Extended type for table data
interface ManipulationRow extends ActivityDefinition {
  id: string;
}

/**
 * ManipulationTable Component
 * Supports inline editing with EMRTable for consistent styling
 */
export function ManipulationTable({ manipulations, onEdit, onDelete, loading }: ManipulationTableProps): React.JSX.Element {
  const { t } = useTranslation();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const handleEditStart = (manipulation: ActivityDefinition): void => {
    if (!manipulation.id) return;
    setEditingId(manipulation.id);
    setEditValue(manipulation.title || manipulation.code?.text || '');
  };

  const handleEditSave = async (id: string): Promise<void> => {
    if (!editValue.trim()) return;
    await onEdit(id, editValue);
    setEditingId(null);
    setEditValue('');
  };

  const handleEditCancel = (): void => {
    setEditingId(null);
    setEditValue('');
  };

  // Filter to ensure all manipulations have IDs
  const validManipulations = manipulations.filter((m): m is ManipulationRow => !!m.id);

  // Define columns with inline editing support
  const columns: EMRTableColumn<ManipulationRow>[] = [
    {
      key: 'name',
      title: t('laboratory.manipulations.field.name'),
      minWidth: 300,
      render: (manipulation) => {
        const isEditing = editingId === manipulation.id;

        if (isEditing) {
          return (
            <EMRTextInput
              value={editValue}
              onChange={(value) => setEditValue(value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && manipulation.id) {
                  handleEditSave(manipulation.id);
                } else if (e.key === 'Escape') {
                  handleEditCancel();
                }
              }}
              autoFocus
            />
          );
        }

        return (
          <Text fw={500} size="sm">
            {manipulation.title || manipulation.code?.text}
          </Text>
        );
      },
    },
  ];

  // Custom actions based on editing state
  const getActions = (manipulation: ManipulationRow) => {
    const isEditing = editingId === manipulation.id;

    if (isEditing) {
      return {
        primary: {
          icon: IconCheck,
          label: t('laboratory.action.save'),
          color: 'green' as const,
          onClick: () => handleEditSave(manipulation.id),
        },
        secondary: [
          {
            icon: IconX,
            label: t('laboratory.action.cancel'),
            color: 'red' as const,
            onClick: handleEditCancel,
          },
        ],
      };
    }

    return {
      primary: { icon: IconEdit, label: t('laboratory.action.edit'), onClick: () => handleEditStart(manipulation) },
      secondary: [
        { icon: IconTrash, label: t('laboratory.action.delete'), color: 'red' as const, onClick: () => onDelete(manipulation.id) },
      ],
    };
  };

  return (
    <EMRTable
      columns={columns}
      data={validManipulations}
      loading={loading}
      loadingConfig={{ rows: 5 }}
      getRowId={(manipulation) => manipulation.id}
      striped
      emptyState={{
        icon: IconFolder,
        title: t('laboratory.manipulations.table.noData'),
      }}
      actions={getActions}
      ariaLabel="Manipulations table"
    />
  );
}
