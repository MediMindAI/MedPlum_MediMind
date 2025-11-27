// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import { Table, Text, Badge, ActionIcon, Tooltip, Box } from '@mantine/core';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import type { CodeSystemConcept } from '@medplum/fhirtypes';
import { useTranslation } from '../../../hooks/useTranslation';

interface AdminRouteTableProps {
  routes: CodeSystemConcept[];
  onEdit: (route: CodeSystemConcept) => void;
  onDelete: (route: CodeSystemConcept) => void;
  loading?: boolean;
}

/**
 * Table component for displaying administration routes
 *
 * Features:
 * - 5 columns: Code, Name (Georgian), Abbreviation, Status, Actions
 * - Turquoise gradient header matching EMR theme
 * - Edit and delete action buttons
 * - Empty state when no routes
 * - Mobile responsive
 */
export const AdminRouteTable = React.memo(function AdminRouteTable({
  routes,
  onEdit,
  onDelete,
  loading,
}: AdminRouteTableProps) {
  const { t, lang } = useTranslation();

  const getDisplayName = (concept: CodeSystemConcept): string => {
    if (lang === 'ka') {
      return concept.designation?.find((d) => d.language === 'ka')?.value || concept.display || '';
    } else if (lang === 'en') {
      return concept.designation?.find((d) => d.language === 'en')?.value || concept.display || '';
    } else if (lang === 'ru') {
      return concept.designation?.find((d) => d.language === 'ru')?.value || concept.display || '';
    }
    return concept.display || '';
  };

  const getAbbreviation = (concept: CodeSystemConcept): string => {
    return concept.property?.find((p) => p.code === 'abbreviation')?.valueString || '-';
  };

  const isActive = (concept: CodeSystemConcept): boolean => {
    return concept.property?.find((p) => p.code === 'active')?.valueBoolean ?? true;
  };

  if (loading) {
    return (
      <Box p="xl" style={{ textAlign: 'center' }}>
        <Text c="dimmed">{t('settings.adminRoutes.loading') || 'Loading routes...'}</Text>
      </Box>
    );
  }

  if (routes.length === 0) {
    return (
      <Box p="xl" style={{ textAlign: 'center' }}>
        <Text c="dimmed" size="lg">
          {t('settings.adminRoutes.empty') || 'No routes found'}
        </Text>
        <Text c="dimmed" size="sm" mt="xs">
          {t('settings.adminRoutes.emptyDescription') || 'Create your first route using the form above'}
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
              {t('settings.adminRoutes.table.code') || 'Code'}
            </Table.Th>
            <Table.Th style={{ color: 'white', fontWeight: 600 }}>
              {t('settings.adminRoutes.table.name') || 'Name'}
            </Table.Th>
            <Table.Th style={{ color: 'white', fontWeight: 600 }}>
              {t('settings.adminRoutes.table.abbreviation') || 'Abbreviation'}
            </Table.Th>
            <Table.Th style={{ color: 'white', fontWeight: 600, textAlign: 'center' }}>
              {t('settings.adminRoutes.table.status') || 'Status'}
            </Table.Th>
            <Table.Th style={{ color: 'white', fontWeight: 600, textAlign: 'center' }}>
              {t('settings.adminRoutes.table.actions') || 'Actions'}
            </Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {routes.map((route) => (
            <Table.Tr key={route.code}>
              <Table.Td>
                <Text size="sm" fw={500}>
                  {route.code}
                </Text>
              </Table.Td>
              <Table.Td>
                <Text size="sm">{getDisplayName(route)}</Text>
              </Table.Td>
              <Table.Td>
                <Text size="sm" fw={500}>
                  {getAbbreviation(route)}
                </Text>
              </Table.Td>
              <Table.Td style={{ textAlign: 'center' }}>
                <Badge color={isActive(route) ? 'green' : 'gray'} variant="light" size="sm">
                  {isActive(route)
                    ? t('settings.adminRoutes.status.active') || 'Active'
                    : t('settings.adminRoutes.status.inactive') || 'Inactive'}
                </Badge>
              </Table.Td>
              <Table.Td style={{ textAlign: 'center' }}>
                <Tooltip label={t('settings.adminRoutes.actions.edit') || 'Edit'}>
                  <ActionIcon variant="subtle" color="blue" onClick={() => onEdit(route)} style={{ marginRight: 4 }}>
                    <IconEdit size={18} />
                  </ActionIcon>
                </Tooltip>
                <Tooltip label={t('settings.adminRoutes.actions.delete') || 'Delete'}>
                  <ActionIcon variant="subtle" color="red" onClick={() => onDelete(route)}>
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
