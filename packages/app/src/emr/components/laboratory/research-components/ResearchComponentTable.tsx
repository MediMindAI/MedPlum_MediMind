// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import { Text } from '@mantine/core';
import { IconEdit, IconTrash, IconFolder } from '@tabler/icons-react';
import type { ObservationDefinition } from '@medplum/fhirtypes';
import { useTranslation } from '../../../hooks/useTranslation';
import { extractResearchComponentFormValues } from '../../../services/researchComponentService';
import { EMRTable } from '../../shared/EMRTable';
import type { EMRTableColumn } from '../../shared/EMRTable';

interface ResearchComponentTableProps {
  /** Array of components to display */
  components: ObservationDefinition[];
  /** Edit handler */
  onEdit?: (component: ObservationDefinition) => void;
  /** Delete handler */
  onDelete?: (component: ObservationDefinition) => void;
  /** Loading state */
  loading?: boolean;
}

// Extended type for table data
interface ResearchComponentRow extends ObservationDefinition {
  id: string;
}

/**
 * Table displaying research components with 7 columns
 * Now using EMRTable component for consistent Apple-inspired styling
 */
export function ResearchComponentTable({
  components,
  onEdit,
  onDelete,
  loading = false,
}: ResearchComponentTableProps): React.JSX.Element {
  const { t } = useTranslation();

  // Filter to ensure all components have IDs
  const validComponents = components.filter((c): c is ResearchComponentRow => !!c.id);

  // Define columns
  const columns: EMRTableColumn<ResearchComponentRow>[] = [
    {
      key: 'code',
      title: t('laboratory.components.fields.code'),
      width: 100,
      render: (component) => {
        const values = extractResearchComponentFormValues(component);
        return (
          <Text ff="monospace" fw={600} size="sm">
            {values.code || '-'}
          </Text>
        );
      },
    },
    {
      key: 'gisCode',
      title: t('laboratory.components.fields.gisCode'),
      width: 100,
      hideOnMobile: true,
      render: (component) => {
        const values = extractResearchComponentFormValues(component);
        return (
          <Text ff="monospace" size="sm" c="dimmed">
            {values.gisCode || '-'}
          </Text>
        );
      },
    },
    {
      key: 'name',
      title: t('laboratory.components.fields.name'),
      minWidth: 200,
      maxWidth: 400,
      render: (component) => {
        const values = extractResearchComponentFormValues(component);
        return (
          <Text fw={500} size="sm">
            {values.name}
          </Text>
        );
      },
    },
    {
      key: 'type',
      title: t('laboratory.components.fields.type'),
      width: 100,
      hideOnMobile: true,
      render: (component) => {
        const values = extractResearchComponentFormValues(component);
        return (
          <Text size="sm" c="dimmed">
            {values.type}
          </Text>
        );
      },
    },
    {
      key: 'unit',
      title: t('laboratory.components.fields.unit'),
      width: 80,
      render: (component) => {
        const values = extractResearchComponentFormValues(component);
        return (
          <Text size="sm" c="dimmed">
            {values.unit}
          </Text>
        );
      },
    },
    {
      key: 'department',
      title: t('laboratory.components.fields.department'),
      width: 120,
      hideOnMobile: true,
      render: (component) => {
        const values = extractResearchComponentFormValues(component);
        return (
          <Text size="sm" c="dimmed">
            {values.department || '-'}
          </Text>
        );
      },
    },
  ];

  return (
    <EMRTable
      columns={columns}
      data={validComponents}
      loading={loading}
      loadingConfig={{ rows: 5 }}
      getRowId={(component) => component.id}
      stickyHeader
      minWidth={1000}
      emptyState={{
        icon: IconFolder,
        title: t('laboratory.components.empty'),
        description: 'სცადეთ ფილტრების გასუფთავება ან დაამატეთ ახალი კომპონენტი',
      }}
      actions={(component) => ({
        primary: onEdit
          ? { icon: IconEdit, label: 'რედაქტირება', onClick: () => onEdit(component) }
          : undefined,
        secondary: onDelete
          ? [{ icon: IconTrash, label: 'წაშლა', color: 'red' as const, onClick: () => onDelete(component) }]
          : [],
      })}
      ariaLabel="Research components table"
    />
  );
}
