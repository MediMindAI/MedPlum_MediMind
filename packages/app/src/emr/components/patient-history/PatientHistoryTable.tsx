// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { Text } from '@mantine/core';
import { IconEdit, IconTrash, IconHistory } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';
import { useActionPermission } from '../../hooks/useActionPermission';
import type { VisitTableRow } from '../../types/patient-history';
import { EMRTable } from '../shared/EMRTable';
import type { EMRTableColumn, SortDirection } from '../shared/EMRTable';

const DEBT_HIGHLIGHT_COLOR = 'rgba(16, 185, 129, 0.15)'; // Green background for debt > 0

interface PatientHistoryTableProps {
  visits: VisitTableRow[];
  loading: boolean;
  onEdit: (visitId: string) => void;
  onDelete: (visitId: string) => void;
  onSort: (field: string) => void;
  sortField: string | null;
  sortDirection: 'asc' | 'desc';
  onRowClick?: (visitId: string) => void;
  selectedPatientId?: string;
}

/**
 * Patient visit history table with 10 columns
 * Now using EMRTable component for consistent Apple-inspired styling
 */
export function PatientHistoryTable({
  visits,
  loading,
  onEdit,
  onDelete,
  onSort,
  sortField,
  sortDirection,
  onRowClick,
  selectedPatientId,
}: PatientHistoryTableProps): React.JSX.Element {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { canEdit, canDelete } = useActionPermission('encounter');

  // Format currency value to 2 decimal places
  const formatCurrency = (value: number): string => {
    return value.toFixed(2);
  };

  // Format date/time for display
  const formatDateTime = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ka-GE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Handle row click for navigation or custom handler
  const handleRowClick = (visit: VisitTableRow) => {
    if (onRowClick) {
      onRowClick(visit.id);
    } else {
      navigate(`/emr/patient-history/${visit.id}`);
    }
  };

  // Handle sort - convert EMRTable format to existing API
  const handleSort = (field: string, _direction: SortDirection) => {
    onSort(field);
  };

  // Define columns
  const columns: EMRTableColumn<VisitTableRow>[] = [
    {
      key: 'personalId',
      title: t('patientHistory.table.column.personalId'),
      width: 120,
    },
    {
      key: 'firstName',
      title: t('patientHistory.table.column.firstName'),
    },
    {
      key: 'lastName',
      title: t('patientHistory.table.column.lastName'),
    },
    {
      key: 'date',
      title: t('patientHistory.table.column.date'),
      sortable: true,
      width: 160,
      render: (visit) => (
        <div style={{ whiteSpace: 'pre-line', lineHeight: 1.4 }}>
          {formatDateTime(visit.date)}
          {visit.endDate && (
            <>
              {'\n'}
              <Text size="xs" c="dimmed">
                {formatDateTime(visit.endDate)}
              </Text>
            </>
          )}
        </div>
      ),
    },
    {
      key: 'registrationNumber',
      title: t('patientHistory.table.column.registrationNumber'),
      width: 100,
    },
    {
      key: 'total',
      title: t('patientHistory.table.column.total'),
      align: 'right',
      width: 100,
      render: (visit) => formatCurrency(visit.total),
    },
    {
      key: 'discountPercent',
      title: t('patientHistory.table.column.discount'),
      align: 'center',
      width: 60,
      render: (visit) => `${visit.discountPercent}%`,
    },
    {
      key: 'debt',
      title: t('patientHistory.table.column.debt'),
      align: 'right',
      width: 100,
      render: (visit) => (
        <span
          style={{
            fontWeight: visit.debt > 0 ? 600 : 400,
            color: visit.debt > 0 ? 'var(--emr-stat-success)' : undefined,
          }}
        >
          {formatCurrency(visit.debt)}
        </span>
      ),
    },
    {
      key: 'payment',
      title: t('patientHistory.table.column.payment'),
      align: 'right',
      width: 100,
      render: (visit) => formatCurrency(visit.payment),
    },
  ];

  return (
    <EMRTable
      columns={columns}
      data={visits}
      loading={loading}
      loadingConfig={{ rows: 5 }}
      getRowId={(visit) => visit.id}
      onRowClick={handleRowClick}
      sortField={sortField || undefined}
      sortDirection={sortDirection as SortDirection}
      onSort={handleSort}
      stickyHeader
      striped
      minWidth={900}
      highlightRow={(visit) =>
        selectedPatientId === visit.id
          ? 'var(--emr-table-row-selected)'
          : visit.debt > 0
          ? DEBT_HIGHLIGHT_COLOR
          : false
      }
      emptyState={{
        icon: IconHistory,
        title: t('patientHistory.table.noVisits'),
        description: t('patientHistory.table.noVisitsDescription'),
      }}
      actions={(visit) => ({
        primary: {
          icon: IconEdit,
          label: canEdit ? t('common.edit') : t('common.noPermission') || 'No permission to edit',
          onClick: () => onEdit(visit.id),
          disabled: !canEdit,
        },
        secondary: [
          {
            icon: IconTrash,
            label: canDelete ? t('common.delete') : t('common.noPermission') || 'No permission to delete',
            color: 'red',
            onClick: () => onDelete(visit.id),
            disabled: !canDelete,
          },
        ],
      })}
      ariaLabel={t('patientHistory.table.ariaLabel')}
    />
  );
}
