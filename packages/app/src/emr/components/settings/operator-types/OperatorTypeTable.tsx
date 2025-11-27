// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import React, { useState } from 'react';
import { Text, Badge } from '@mantine/core';
import { IconEdit, IconTrash, IconBriefcase, IconCheck, IconX } from '@tabler/icons-react';
import type { OperatorTypeFormValues } from '../../../types/settings';
import { useTranslation } from '../../../hooks/useTranslation';
import { EMRTextInput } from '../../shared/EMRFormFields';
import { EMRTable } from '../../shared/EMRTable/EMRTable';
import type { EMRTableColumn } from '../../shared/EMRTable/EMRTableTypes';

interface OperatorTypeTableProps {
  /** Array of operator types to display */
  operatorTypes: OperatorTypeFormValues[];
  /** Callback when edit is requested */
  onEdit: (code: string, values: OperatorTypeFormValues) => Promise<void>;
  /** Callback when delete is requested */
  onDelete: (code: string) => void;
  /** Loading state */
  loading?: boolean;
}

// Extended type for table data with required id for EMRTable
interface OperatorTypeRow extends OperatorTypeFormValues {
  id: string; // Maps to code for EMRTable
}

/**
 * OperatorTypeTable Component
 * Displays operator types with inline editing capability
 */
export function OperatorTypeTable({
  operatorTypes,
  onEdit,
  onDelete,
  loading,
}: OperatorTypeTableProps): React.JSX.Element {
  const { t } = useTranslation();
  const [editingCode, setEditingCode] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const handleEditStart = (operatorType: OperatorTypeFormValues): void => {
    setEditingCode(operatorType.code);
    setEditValue(operatorType.displayKa);
  };

  const handleEditSave = async (code: string): Promise<void> => {
    if (!editValue.trim()) return;

    const operatorType = operatorTypes.find((ot) => ot.code === code);
    if (!operatorType) return;

    await onEdit(code, {
      ...operatorType,
      displayKa: editValue,
    });
    setEditingCode(null);
    setEditValue('');
  };

  const handleEditCancel = (): void => {
    setEditingCode(null);
    setEditValue('');
  };

  // Define columns matching original EMR layout
  const columns: EMRTableColumn<OperatorTypeRow>[] = [
    {
      key: 'code',
      title: t('settings.operatorTypes.table.code'),
      minWidth: 120,
      render: (row) => (
        <Text fw={500} size="sm">
          {row.code}
        </Text>
      ),
    },
    {
      key: 'displayKa',
      title: t('settings.operatorTypes.table.name'),
      minWidth: 200,
      render: (row) => {
        const isEditing = editingCode === row.code;

        if (isEditing) {
          return (
            <EMRTextInput
              value={editValue}
              onChange={(value) => setEditValue(value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleEditSave(row.code);
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
            {row.displayKa}
          </Text>
        );
      },
    },
    {
      key: 'type',
      title: t('settings.operatorTypes.table.type'),
      minWidth: 150,
      hideOnMobile: true,
      render: (row) => {
        const typeColors = {
          medical: 'blue',
          administrative: 'grape',
          support: 'teal',
        } as const;

        return (
          <Badge color={typeColors[row.type]} variant="light" size="sm">
            {t(`settings.operatorTypes.type.${row.type}`)}
          </Badge>
        );
      },
    },
    {
      key: 'specialty',
      title: t('settings.operatorTypes.table.specialty'),
      minWidth: 150,
      hideOnMobile: true,
      hideOnTablet: true,
      render: (row) => (
        <Text size="sm" c="dimmed">
          {row.specialty || '-'}
        </Text>
      ),
    },
    {
      key: 'active',
      title: t('settings.operatorTypes.table.active'),
      minWidth: 100,
      hideOnMobile: true,
      render: (row) => (
        <Badge color={row.active ? 'green' : 'gray'} variant="light" size="sm">
          {row.active ? t('common.yes') : t('common.no')}
        </Badge>
      ),
    },
  ];

  // Custom actions based on editing state
  const getActions = (row: OperatorTypeRow) => {
    const isEditing = editingCode === row.code;

    if (isEditing) {
      return {
        primary: {
          icon: IconCheck,
          label: t('common.save'),
          color: 'green' as const,
          onClick: () => handleEditSave(row.code),
        },
        secondary: [
          {
            icon: IconX,
            label: t('common.cancel'),
            color: 'red' as const,
            onClick: handleEditCancel,
          },
        ],
      };
    }

    return {
      primary: {
        icon: IconEdit,
        label: t('common.edit'),
        onClick: () => handleEditStart(row),
      },
      secondary: [
        {
          icon: IconTrash,
          label: t('common.delete'),
          color: 'red' as const,
          onClick: () => onDelete(row.code),
        },
      ],
    };
  };

  // Map data to include id field for EMRTable
  const tableData: OperatorTypeRow[] = operatorTypes.map((op) => ({
    ...op,
    id: op.code,
  }));

  return (
    <EMRTable<OperatorTypeRow>
      columns={columns}
      data={tableData}
      loading={loading}
      loadingConfig={{ rows: 5 }}
      getRowId={(row) => row.id}
      striped
      emptyState={{
        icon: IconBriefcase,
        title: t('settings.operatorTypes.table.noData'),
      }}
      actions={getActions}
      ariaLabel="Operator types table"
    />
  );
}
