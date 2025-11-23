// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import { Text } from '@mantine/core';
import { IconEdit, IconTrash, IconFolder } from '@tabler/icons-react';
import type { DeviceDefinition } from '@medplum/fhirtypes';
import { useTranslation } from '../../../hooks/useTranslation';
import { ColorBarDisplay } from './ColorBarDisplay';
import { extractSyringeFormValues } from '../../../services/syringeService';
import { EMRTable } from '../../shared/EMRTable';
import type { EMRTableColumn } from '../../shared/EMRTable';

interface SyringeTableProps {
  /** Array of syringes to display */
  syringes: DeviceDefinition[];
  /** Callback when edit is requested */
  onEdit: (id: string) => void;
  /** Callback when delete is requested */
  onDelete: (id: string) => void;
  /** Loading state */
  loading?: boolean;
}

// Extended type for table data
interface SyringeRow extends DeviceDefinition {
  id: string;
}

/**
 * SyringeTable Component
 * Now using EMRTable component for consistent Apple-inspired styling
 */
export function SyringeTable({ syringes, onEdit, onDelete, loading }: SyringeTableProps): React.JSX.Element {
  const { t } = useTranslation();

  // Filter to ensure all syringes have IDs
  const validSyringes = syringes.filter((s): s is SyringeRow => !!s.id);

  // Define columns
  const columns: EMRTableColumn<SyringeRow>[] = [
    {
      key: 'name',
      title: t('laboratory.syringes.field.name'),
      minWidth: 200,
      render: (syringe) => {
        const values = extractSyringeFormValues(syringe);
        return (
          <Text fw={500} size="sm">
            {values.name}
          </Text>
        );
      },
    },
    {
      key: 'color',
      title: t('laboratory.syringes.field.color'),
      width: 150,
      render: (syringe) => {
        const values = extractSyringeFormValues(syringe);
        return <ColorBarDisplay color={values.color} height={24} />;
      },
    },
    {
      key: 'volume',
      title: t('laboratory.syringes.field.volume'),
      width: 100,
      render: (syringe) => {
        const values = extractSyringeFormValues(syringe);
        return (
          <Text size="sm" c="dimmed">
            {values.volume || '-'}
          </Text>
        );
      },
    },
  ];

  return (
    <EMRTable
      columns={columns}
      data={validSyringes}
      loading={loading}
      loadingConfig={{ rows: 5 }}
      getRowId={(syringe) => syringe.id}
      striped
      emptyState={{
        icon: IconFolder,
        title: t('laboratory.syringes.table.noData'),
      }}
      actions={(syringe) => ({
        primary: { icon: IconEdit, label: t('laboratory.action.edit'), onClick: () => onEdit(syringe.id) },
        secondary: [
          { icon: IconTrash, label: t('laboratory.action.delete'), color: 'red' as const, onClick: () => onDelete(syringe.id) },
        ],
      })}
      ariaLabel="Syringes table"
    />
  );
}
