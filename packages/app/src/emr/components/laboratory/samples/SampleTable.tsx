// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import React, { useState } from 'react';
import { Text } from '@mantine/core';
import { EMRTextInput } from '../../shared/EMRFormFields';
import { IconEdit, IconTrash, IconFolder, IconCheck, IconX } from '@tabler/icons-react';
import type { SpecimenDefinition } from '@medplum/fhirtypes';
import { useTranslation } from '../../../hooks/useTranslation';
import { EMRTable } from '../../shared/EMRTable';
import type { EMRTableColumn } from '../../shared/EMRTable';

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

// Extended type for table data
interface SampleRow extends SpecimenDefinition {
  id: string;
}

/**
 * SampleTable Component
 * Supports inline editing with EMRTable for consistent styling
 */
export function SampleTable({ samples, onEdit, onDelete, loading }: SampleTableProps): React.JSX.Element {
  const { t } = useTranslation();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const handleEditStart = (sample: SpecimenDefinition): void => {
    if (!sample.id) return;
    setEditingId(sample.id);
    setEditValue(sample.typeCollected?.text || '');
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

  // Filter to ensure all samples have IDs
  const validSamples = samples.filter((s): s is SampleRow => !!s.id);

  // Define columns with inline editing support
  const columns: EMRTableColumn<SampleRow>[] = [
    {
      key: 'name',
      title: t('laboratory.samples.field.name'),
      minWidth: 300,
      render: (sample) => {
        const isEditing = editingId === sample.id;

        if (isEditing) {
          return (
            <EMRTextInput
              value={editValue}
              onChange={(value) => setEditValue(value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && sample.id) {
                  handleEditSave(sample.id);
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
            {sample.typeCollected?.text}
          </Text>
        );
      },
    },
  ];

  // Custom actions based on editing state
  const getActions = (sample: SampleRow) => {
    const isEditing = editingId === sample.id;

    if (isEditing) {
      return {
        primary: {
          icon: IconCheck,
          label: t('laboratory.action.save'),
          color: 'green' as const,
          onClick: () => handleEditSave(sample.id),
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
      primary: { icon: IconEdit, label: t('laboratory.action.edit'), onClick: () => handleEditStart(sample) },
      secondary: [
        { icon: IconTrash, label: t('laboratory.action.delete'), color: 'red' as const, onClick: () => onDelete(sample.id) },
      ],
    };
  };

  return (
    <EMRTable
      columns={columns}
      data={validSamples}
      loading={loading}
      loadingConfig={{ rows: 5 }}
      getRowId={(sample) => sample.id}
      striped
      emptyState={{
        icon: IconFolder,
        title: t('laboratory.samples.table.noData'),
      }}
      actions={getActions}
      ariaLabel="Samples table"
    />
  );
}
