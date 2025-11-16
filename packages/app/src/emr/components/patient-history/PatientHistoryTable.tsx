// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { Table, ActionIcon, Text, Skeleton } from '@mantine/core';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import type { JSX } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';
import type { VisitTableRow } from '../../types/patient-history';

const DEBT_HIGHLIGHT_COLOR = 'rgba(0, 255, 0, 0.2)'; // Green background for debt > 0

interface PatientHistoryTableProps {
  visits: VisitTableRow[];
  loading: boolean;
  onEdit: (visitId: string) => void;
  onDelete: (visitId: string) => void;
  onSort: (field: string) => void;
  sortField: string | null;
  sortDirection: 'asc' | 'desc';
  onRowClick?: (visitId: string) => void;
}

/**
 * Patient visit history table with 10 columns
 * Features: clickable rows, financial highlighting, sortable date column, edit/delete actions
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
}: PatientHistoryTableProps): JSX.Element {
  const { t } = useTranslation();
  const navigate = useNavigate();

  /**
   * Format currency value to 2 decimal places
   */
  const formatCurrency = (value: number): string => {
    return value.toFixed(2);
  };

  /**
   * Format date/time for display
   */
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

  /**
   * Format registration number (preserve "a-" prefix for ambulatory)
   */
  const formatRegistrationNumber = (regNum: string): string => {
    return regNum; // Already formatted in FHIR mapper
  };

  /**
   * Handle row click for navigation or custom handler
   */
  const handleRowClick = (visitId: string) => {
    if (onRowClick) {
      onRowClick(visitId);
    } else {
      navigate(`/emr/patient-history/${visitId}`);
    }
  };

  /**
   * Loading skeleton
   */
  if (loading) {
    return (
      <Table>
        <Table.Thead style={{ background: 'var(--emr-gradient-submenu)' }}>
          <Table.Tr>
            <Table.Th>{t('patientHistory.table.column.personalId')}</Table.Th>
            <Table.Th>{t('patientHistory.table.column.firstName')}</Table.Th>
            <Table.Th>{t('patientHistory.table.column.lastName')}</Table.Th>
            <Table.Th>{t('patientHistory.table.column.date')}</Table.Th>
            <Table.Th>{t('patientHistory.table.column.registrationNumber')}</Table.Th>
            <Table.Th>{t('patientHistory.table.column.total')}</Table.Th>
            <Table.Th>{t('patientHistory.table.column.discount')}</Table.Th>
            <Table.Th>{t('patientHistory.table.column.debt')}</Table.Th>
            <Table.Th>{t('patientHistory.table.column.payment')}</Table.Th>
            <Table.Th>{t('patientHistory.table.column.actions')}</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {[...Array(5)].map((_, i) => (
            <Table.Tr key={i}>
              {[...Array(10)].map((_, j) => (
                <Table.Td key={j}>
                  <Skeleton height={20} />
                </Table.Td>
              ))}
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    );
  }

  /**
   * Empty state
   */
  if (visits.length === 0) {
    return (
      <Text ta="center" c="dimmed" py="xl">
        {t('patientHistory.table.noVisits')}
      </Text>
    );
  }

  /**
   * Main table
   */
  return (
    <Table highlightOnHover>
      <Table.Thead style={{ background: 'var(--emr-gradient-submenu)' }}>
        <Table.Tr>
          <Table.Th>{t('patientHistory.table.column.personalId')}</Table.Th>
          <Table.Th>{t('patientHistory.table.column.firstName')}</Table.Th>
          <Table.Th>{t('patientHistory.table.column.lastName')}</Table.Th>
          <Table.Th
            onClick={() => onSort('date')}
            style={{ cursor: 'pointer', userSelect: 'none' }}
          >
            {t('patientHistory.table.column.date')} {sortField === 'date' && (sortDirection === 'asc' ? '↑' : '↓')}
          </Table.Th>
          <Table.Th>{t('patientHistory.table.column.registrationNumber')}</Table.Th>
          <Table.Th style={{ textAlign: 'right' }}>{t('patientHistory.table.column.total')}</Table.Th>
          <Table.Th style={{ textAlign: 'center' }}>{t('patientHistory.table.column.discount')}</Table.Th>
          <Table.Th style={{ textAlign: 'right' }}>{t('patientHistory.table.column.debt')}</Table.Th>
          <Table.Th style={{ textAlign: 'right' }}>{t('patientHistory.table.column.payment')}</Table.Th>
          <Table.Th>{t('patientHistory.table.column.actions')}</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {visits.map((visit) => {
          const hasDebt = visit.debt > 0;

          return (
            <Table.Tr
              key={visit.id}
              onClick={() => handleRowClick(visit.id)}
              style={{ cursor: 'pointer' }}
            >
              <Table.Td>{visit.personalId}</Table.Td>
              <Table.Td>{visit.firstName}</Table.Td>
              <Table.Td>{visit.lastName}</Table.Td>
              <Table.Td style={{ whiteSpace: 'pre-line' }}>
                {formatDateTime(visit.date)}
                {visit.endDate && `\n${formatDateTime(visit.endDate)}`}
              </Table.Td>
              <Table.Td>{formatRegistrationNumber(visit.registrationNumber)}</Table.Td>
              <Table.Td style={{ textAlign: 'right' }}>{formatCurrency(visit.total)}</Table.Td>
              <Table.Td style={{ textAlign: 'center' }}>{visit.discountPercent}%</Table.Td>
              <Table.Td
                style={{
                  textAlign: 'right',
                  backgroundColor: hasDebt ? DEBT_HIGHLIGHT_COLOR : 'transparent',
                  fontWeight: hasDebt ? 600 : 400,
                }}
              >
                {formatCurrency(visit.debt)}
              </Table.Td>
              <Table.Td style={{ textAlign: 'right' }}>{formatCurrency(visit.payment)}</Table.Td>
              <Table.Td onClick={(e) => e.stopPropagation()}>
                <ActionIcon
                  onClick={() => onEdit(visit.id)}
                  variant="subtle"
                  color="blue"
                >
                  <IconEdit size={16} />
                </ActionIcon>
                <ActionIcon
                  onClick={() => onDelete(visit.id)}
                  variant="subtle"
                  color="red"
                  ml="xs"
                >
                  <IconTrash size={16} />
                </ActionIcon>
              </Table.Td>
            </Table.Tr>
          );
        })}
      </Table.Tbody>
    </Table>
  );
}
