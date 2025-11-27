// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import { Table, Text, Badge, ActionIcon, Tooltip, Box } from '@mantine/core';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import { useTranslation } from '../../../hooks/useTranslation';
import type { MedicalDataRow } from '../../../types/settings';

interface MedicalDataTableProps {
  items: MedicalDataRow[];
  onEdit: (item: MedicalDataRow) => void;
  onDelete: (item: MedicalDataRow) => void;
  loading?: boolean;
}

/**
 * Table component for displaying medical data (physical or post-operative)
 *
 * Features:
 * - 5 columns: Sort, Name (Georgian), Unit, Type, Actions
 * - Turquoise gradient header matching EMR theme
 * - Edit and delete action buttons
 * - Empty state when no items
 * - Mobile responsive
 */
export const MedicalDataTable = React.memo(function MedicalDataTable({
  items,
  onEdit,
  onDelete,
  loading,
}: MedicalDataTableProps) {
  const { t } = useTranslation();

  if (loading) {
    return (
      <Box p="xl" style={{ textAlign: 'center' }}>
        <Text c="dimmed">{t('settings.medicalData.loading') || 'Loading...'}</Text>
      </Box>
    );
  }

  if (items.length === 0) {
    return (
      <Box p="xl" style={{ textAlign: 'center' }}>
        <Text c="dimmed" size="lg">
          {t('settings.medicalData.table.noData') || 'No medical data found'}
        </Text>
        <Text c="dimmed" size="sm" mt="xs">
          {t('settings.medicalData.table.noDataDescription') || 'Create your first entry using the form above'}
        </Text>
      </Box>
    );
  }

  return (
    <Box style={{ overflowX: 'auto' }}>
      <Table striped highlightOnHover withTableBorder withColumnBorders style={{ minWidth: '600px' }}>
        <Table.Thead
          style={{
            background: 'linear-gradient(90deg, #138496 0%, #17a2b8 50%, #20c4dd 100%)',
          }}
        >
          <Table.Tr>
            <Table.Th style={{ color: 'white', fontWeight: 600, width: '80px' }}>
              {t('settings.medicalData.table.sortOrder') || 'Sort'}
            </Table.Th>
            <Table.Th style={{ color: 'white', fontWeight: 600 }}>
              {t('settings.medicalData.table.name') || 'Name'}
            </Table.Th>
            <Table.Th style={{ color: 'white', fontWeight: 600 }}>
              {t('settings.medicalData.table.unit') || 'Unit'}
            </Table.Th>
            <Table.Th style={{ color: 'white', fontWeight: 600, textAlign: 'center' }}>
              {t('settings.medicalData.table.active') || 'Active'}
            </Table.Th>
            <Table.Th style={{ color: 'white', fontWeight: 600, textAlign: 'center' }}>
              {t('settings.medicalData.table.actions') || 'Actions'}
            </Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {items.map((item) => (
            <Table.Tr key={item.id}>
              <Table.Td>
                <Text size="sm" fw={500}>
                  {item.sortOrder !== undefined ? item.sortOrder : '-'}
                </Text>
              </Table.Td>
              <Table.Td>
                <Text size="sm" fw={500}>
                  {item.nameKa}
                </Text>
              </Table.Td>
              <Table.Td>
                <Text size="sm" c={item.unit ? undefined : 'dimmed'}>
                  {item.unit || '-'}
                </Text>
              </Table.Td>
              <Table.Td style={{ textAlign: 'center' }}>
                <Badge color={item.active ? 'green' : 'gray'} variant="light" size="sm">
                  {item.active
                    ? t('settings.medicalData.status.active') || 'Active'
                    : t('settings.medicalData.status.inactive') || 'Inactive'}
                </Badge>
              </Table.Td>
              <Table.Td style={{ textAlign: 'center' }}>
                <Tooltip label={t('settings.medicalData.actions.edit') || 'Edit'}>
                  <ActionIcon
                    variant="subtle"
                    color="blue"
                    onClick={() => onEdit(item)}
                    style={{ marginRight: 4 }}
                  >
                    <IconEdit size={18} />
                  </ActionIcon>
                </Tooltip>
                <Tooltip label={t('settings.medicalData.actions.delete') || 'Delete'}>
                  <ActionIcon variant="subtle" color="red" onClick={() => onDelete(item)}>
                    <IconTrash size={18} />
                  </ActionIcon>
                </Tooltip>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </Box>
  );
});
