// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { Text } from '@mantine/core';
import { EMRCheckbox } from '../shared/EMRFormFields';
import { IconEdit, IconTrash, IconFolder } from '@tabler/icons-react';
import { useTranslation } from '../../hooks/useTranslation';
import type { ServiceTableRow } from '../../types/nomenclature';
import { EMRTable } from '../shared/EMRTable';
import type { EMRTableColumn, SortDirection } from '../shared/EMRTable';

interface ServiceTableProps {
  /** Array of services to display */
  services: ServiceTableRow[];
  /** Loading state */
  loading?: boolean;
  /** Edit handler */
  onEdit?: (service: ServiceTableRow) => void;
  /** Delete handler */
  onDelete?: (service: ServiceTableRow) => void;
  /** Registered services handler */
  onOpenRegisteredServices?: (service: ServiceTableRow) => void;
  /** Sort handler */
  onSort?: (field: string) => void;
  /** Current sort field */
  sortField?: string;
  /** Current sort order */
  sortOrder?: 'asc' | 'desc';
}

/**
 * Service table component for displaying medical services
 * Now using EMRTable component for consistent Apple-inspired styling
 */
export function ServiceTable({
  services,
  loading = false,
  onEdit,
  onDelete,
  onOpenRegisteredServices,
  onSort,
  sortField,
  sortOrder = 'asc',
}: ServiceTableProps): React.JSX.Element {
  const { t } = useTranslation();

  // Format currency value to 2 decimal places with GEL symbol
  const formatCurrency = (value: number | undefined): string => {
    if (value === undefined || value === null) {
      return '-';
    }
    return `${value.toFixed(2)} ₾`;
  };

  // Format number or display dash if undefined
  const formatNumber = (value: number | undefined): string => {
    if (value === undefined || value === null) {
      return '-';
    }
    return value.toString();
  };

  // Handle sort - convert EMRTable format to existing API
  const handleSort = (field: string, _direction: SortDirection) => {
    if (onSort) {
      onSort(field);
    }
  };

  // Define columns
  const columns: EMRTableColumn<ServiceTableRow>[] = [
    {
      key: 'code',
      title: t('nomenclature.medical1.table.code'),
      sortable: !!onSort,
      width: 100,
      render: (service) => (
        <Text ff="monospace" fw={600} size="sm">
          {service.code}
        </Text>
      ),
    },
    {
      key: 'name',
      title: t('nomenclature.medical1.table.name'),
      sortable: !!onSort,
      minWidth: 200,
      maxWidth: 400,
      render: (service) => (
        <Text fw={500} size="sm">
          {service.name}
        </Text>
      ),
    },
    {
      key: 'group',
      title: t('nomenclature.medical1.table.group'),
      width: 140,
      hideOnMobile: true,
      render: (service) => (
        <Text size="sm" c="dimmed">
          {service.group}
        </Text>
      ),
    },
    {
      key: 'type',
      title: t('nomenclature.medical1.table.type'),
      width: 100,
      hideOnMobile: true,
      render: (service) => (
        <Text size="sm" c="dimmed">
          {service.type}
        </Text>
      ),
    },
    {
      key: 'price',
      title: t('nomenclature.medical1.table.price'),
      align: 'right',
      width: 100,
      render: (service) => (
        <Text fw={600} size="sm">
          {formatCurrency(service.price)}
        </Text>
      ),
    },
    {
      key: 'totalAmount',
      title: t('nomenclature.medical1.table.total'),
      align: 'right',
      width: 100,
      render: (service) => (
        <Text fw={600} size="sm">
          {formatCurrency(service.totalAmount)}
        </Text>
      ),
    },
    {
      key: 'calHed',
      title: t('nomenclature.medical1.table.calhed'),
      align: 'center',
      width: 80,
      hideOnMobile: true,
      render: (service) => (
        <Text size="sm" c="dimmed">
          {formatNumber(service.calHed)}
        </Text>
      ),
    },
    {
      key: 'printable',
      title: t('nomenclature.medical1.table.prt'),
      align: 'center',
      width: 60,
      hideOnMobile: true,
      render: (service) => (
        <EMRCheckbox
          checked={service.printable ?? false}
          readOnly
        />
      ),
    },
    {
      key: 'itemGetPrice',
      title: t('nomenclature.medical1.table.itmGetPrc'),
      align: 'center',
      width: 80,
      hideOnMobile: true,
      render: (service) => (
        <Text size="sm" c="dimmed">
          {formatNumber(service.itemGetPrice)}
        </Text>
      ),
    },
  ];

  return (
    <EMRTable
      columns={columns}
      data={services}
      loading={loading}
      loadingConfig={{ rows: 5 }}
      getRowId={(service) => service.id}
      sortField={sortField}
      sortDirection={sortOrder as SortDirection}
      onSort={onSort ? handleSort : undefined}
      stickyHeader
      minWidth={1200}
      emptyState={{
        icon: IconFolder,
        title: t('nomenclature.medical1.empty.noServices'),
        description: t('nomenclature.medical1.empty.tryFilters'),
      }}
      actions={(service) => {
        const primaryAction = onOpenRegisteredServices
          ? {
              icon: IconFolder,
              label: t('nomenclature.medical1.actions.registeredServices'),
              color: 'blue' as const,
              onClick: () => onOpenRegisteredServices(service),
            }
          : onEdit
          ? {
              icon: IconEdit,
              label: t('nomenclature.medical1.actions.edit'),
              onClick: () => onEdit(service),
            }
          : undefined;

        const secondaryActions = [];

        // If primary is registered services, add edit to secondary
        if (onOpenRegisteredServices && onEdit) {
          secondaryActions.push({
            icon: IconEdit,
            label: t('nomenclature.medical1.actions.edit'),
            onClick: () => onEdit(service),
          });
        }

        if (onDelete) {
          secondaryActions.push({
            icon: IconTrash,
            label: t('nomenclature.medical1.actions.delete'),
            color: 'red' as const,
            onClick: () => onDelete(service),
          });
        }

        return {
          primary: primaryAction,
          secondary: secondaryActions,
        };
      }}
      ariaLabel={t('nomenclature.medical1.table.ariaLabel')}
    />
  );
}
