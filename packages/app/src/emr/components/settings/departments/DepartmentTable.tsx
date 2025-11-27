// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import React, { useMemo } from 'react';
import { Table, Text, Badge, ActionIcon, Tooltip, Box } from '@mantine/core';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import { useTranslation } from '../../../hooks/useTranslation';
import type { DepartmentRow } from '../../../types/settings';

interface DepartmentTableProps {
  departments: DepartmentRow[];
  onEdit: (department: DepartmentRow) => void;
  onDelete: (department: DepartmentRow) => void;
  loading?: boolean;
}

/**
 * Table component for displaying departments
 *
 * Features:
 * - 5 columns: Code, Name (Georgian), Name (English), Status, Actions
 * - Turquoise gradient header matching EMR theme
 * - Edit and delete action buttons
 * - Empty state when no departments
 * - Mobile responsive
 */
export const DepartmentTable = React.memo(function DepartmentTable({
  departments,
  onEdit,
  onDelete,
  loading,
}: DepartmentTableProps) {
  const { t } = useTranslation();

  if (loading) {
    return (
      <Box p="xl" style={{ textAlign: 'center' }}>
        <Text c="dimmed">{t('settings.departments.loading') || 'Loading departments...'}</Text>
      </Box>
    );
  }

  if (departments.length === 0) {
    return (
      <Box p="xl" style={{ textAlign: 'center' }}>
        <Text c="dimmed" size="lg">
          {t('settings.departments.empty') || 'No departments found'}
        </Text>
        <Text c="dimmed" size="sm" mt="xs">
          {t('settings.departments.emptyDescription') || 'Create your first department using the form above'}
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
            <Table.Th style={{ color: 'white', fontWeight: 600 }}>
              {t('settings.departments.table.code') || 'Code'}
            </Table.Th>
            <Table.Th style={{ color: 'white', fontWeight: 600 }}>
              {t('settings.departments.table.name') || 'Name'}
            </Table.Th>
            <Table.Th style={{ color: 'white', fontWeight: 600, textAlign: 'center' }}>
              {t('settings.departments.table.status') || 'Status'}
            </Table.Th>
            <Table.Th style={{ color: 'white', fontWeight: 600, textAlign: 'center' }}>
              {t('settings.departments.table.actions') || 'Actions'}
            </Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {departments.map((dept) => (
            <Table.Tr key={dept.id}>
              <Table.Td>
                <Text size="sm" fw={500}>
                  {dept.code}
                </Text>
              </Table.Td>
              <Table.Td>
                <Text size="sm">{dept.nameKa}</Text>
                {dept.parentName && (
                  <Text size="xs" c="dimmed">
                    {t('settings.departments.table.parent') || 'Parent'}: {dept.parentName}
                  </Text>
                )}
              </Table.Td>
              <Table.Td style={{ textAlign: 'center' }}>
                <Badge color={dept.active ? 'green' : 'gray'} variant="light" size="sm">
                  {dept.active
                    ? t('settings.departments.status.active') || 'Active'
                    : t('settings.departments.status.inactive') || 'Inactive'}
                </Badge>
              </Table.Td>
              <Table.Td style={{ textAlign: 'center' }}>
                <Tooltip label={t('settings.departments.actions.edit') || 'Edit'}>
                  <ActionIcon
                    variant="subtle"
                    color="blue"
                    onClick={() => onEdit(dept)}
                    style={{ marginRight: 4 }}
                  >
                    <IconEdit size={18} />
                  </ActionIcon>
                </Tooltip>
                <Tooltip label={t('settings.departments.actions.delete') || 'Delete'}>
                  <ActionIcon variant="subtle" color="red" onClick={() => onDelete(dept)}>
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
