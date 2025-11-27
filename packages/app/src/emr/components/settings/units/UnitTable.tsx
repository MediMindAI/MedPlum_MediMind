// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import { Table, Text, Badge, ActionIcon, Tooltip, Box } from '@mantine/core';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import type { CodeSystemConcept } from '@medplum/fhirtypes';
import { useTranslation } from '../../../hooks/useTranslation';

interface UnitTableProps {
  units: CodeSystemConcept[];
  onEdit: (unit: CodeSystemConcept) => void;
  onDelete: (unit: CodeSystemConcept) => void;
  loading?: boolean;
}

/**
 * Table component for displaying measurement units
 *
 * Features:
 * - 6 columns: Code, Name (Georgian), Symbol, Category, Status, Actions
 * - Turquoise gradient header matching EMR theme
 * - Edit and delete action buttons
 * - Empty state when no units
 * - Mobile responsive
 */
export const UnitTable = React.memo(function UnitTable({ units, onEdit, onDelete, loading }: UnitTableProps) {
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

  const getSymbol = (concept: CodeSystemConcept): string => {
    return concept.property?.find((p) => p.code === 'symbol')?.valueString || '-';
  };

  const getCategory = (concept: CodeSystemConcept): string => {
    const category = concept.property?.find((p) => p.code === 'category')?.valueString;
    if (!category) return '-';

    const categoryLabels: Record<string, string> = {
      count: t('settings.units.category.count') || 'Count',
      volume: t('settings.units.category.volume') || 'Volume',
      mass: t('settings.units.category.mass') || 'Mass',
      concentration: t('settings.units.category.concentration') || 'Concentration',
      other: t('settings.units.category.other') || 'Other',
    };

    return categoryLabels[category] || category;
  };

  const isActive = (concept: CodeSystemConcept): boolean => {
    return concept.property?.find((p) => p.code === 'active')?.valueBoolean ?? true;
  };

  if (loading) {
    return (
      <Box p="xl" style={{ textAlign: 'center' }}>
        <Text c="dimmed">{t('settings.units.loading') || 'Loading units...'}</Text>
      </Box>
    );
  }

  if (units.length === 0) {
    return (
      <Box p="xl" style={{ textAlign: 'center' }}>
        <Text c="dimmed" size="lg">
          {t('settings.units.empty') || 'No units found'}
        </Text>
        <Text c="dimmed" size="sm" mt="xs">
          {t('settings.units.emptyDescription') || 'Create your first unit using the form above'}
        </Text>
      </Box>
    );
  }

  return (
    <Box style={{ overflowX: 'auto' }}>
      <Table striped highlightOnHover withTableBorder withColumnBorders style={{ minWidth: '700px' }}>
        <Table.Thead
          style={{
            background: 'linear-gradient(90deg, #138496 0%, #17a2b8 50%, #20c4dd 100%)',
          }}
        >
          <Table.Tr>
            <Table.Th style={{ color: 'white', fontWeight: 600 }}>
              {t('settings.units.table.code') || 'Code'}
            </Table.Th>
            <Table.Th style={{ color: 'white', fontWeight: 600 }}>
              {t('settings.units.table.name') || 'Name'}
            </Table.Th>
            <Table.Th style={{ color: 'white', fontWeight: 600 }}>
              {t('settings.units.table.symbol') || 'Symbol'}
            </Table.Th>
            <Table.Th style={{ color: 'white', fontWeight: 600 }}>
              {t('settings.units.table.category') || 'Category'}
            </Table.Th>
            <Table.Th style={{ color: 'white', fontWeight: 600, textAlign: 'center' }}>
              {t('settings.units.table.status') || 'Status'}
            </Table.Th>
            <Table.Th style={{ color: 'white', fontWeight: 600, textAlign: 'center' }}>
              {t('settings.units.table.actions') || 'Actions'}
            </Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {units.map((unit) => (
            <Table.Tr key={unit.code}>
              <Table.Td>
                <Text size="sm" fw={500}>
                  {unit.code}
                </Text>
              </Table.Td>
              <Table.Td>
                <Text size="sm">{getDisplayName(unit)}</Text>
              </Table.Td>
              <Table.Td>
                <Text size="sm" fw={500}>
                  {getSymbol(unit)}
                </Text>
              </Table.Td>
              <Table.Td>
                <Text size="sm">{getCategory(unit)}</Text>
              </Table.Td>
              <Table.Td style={{ textAlign: 'center' }}>
                <Badge color={isActive(unit) ? 'green' : 'gray'} variant="light" size="sm">
                  {isActive(unit)
                    ? t('settings.units.status.active') || 'Active'
                    : t('settings.units.status.inactive') || 'Inactive'}
                </Badge>
              </Table.Td>
              <Table.Td style={{ textAlign: 'center' }}>
                <Tooltip label={t('settings.units.actions.edit') || 'Edit'}>
                  <ActionIcon variant="subtle" color="blue" onClick={() => onEdit(unit)} style={{ marginRight: 4 }}>
                    <IconEdit size={18} />
                  </ActionIcon>
                </Tooltip>
                <Tooltip label={t('settings.units.actions.delete') || 'Delete'}>
                  <ActionIcon variant="subtle" color="red" onClick={() => onDelete(unit)}>
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
