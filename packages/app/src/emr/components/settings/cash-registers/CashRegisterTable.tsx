// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { ActionIcon, Badge, Box, Table, Text } from '@mantine/core';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import { useTranslation } from '../../../hooks/useTranslation';
import type { CashRegisterRow } from '../../../types/settings';

interface CashRegisterTableProps {
  cashRegisters: CashRegisterRow[];
  onEdit: (cashRegister: CashRegisterRow) => void;
  onDelete: (cashRegister: CashRegisterRow) => void;
  loading?: boolean;
}

/**
 * Cash Register Table Component
 *
 * Displays cash registers in a 5-column table:
 * - Code (კოდი)
 * - Bank Code (ქარხნული კოდი)
 * - Name (სახელი)
 * - Type (ტიპი)
 * - Status (სტატუსი)
 * - Actions (Edit/Delete)
 */
export function CashRegisterTable({ cashRegisters, onEdit, onDelete, loading }: CashRegisterTableProps) {
  const { t, lang } = useTranslation();

  // Get name (now simplified to Georgian only)
  const getLocalizedName = (cashRegister: CashRegisterRow): string => {
    return cashRegister.nameKa;
  };

  // Get localized type label
  const getTypeLabel = (type: string): string => {
    const typeKey = `settings.cashRegisters.types.${type}`;
    return t(typeKey) || type;
  };

  if (loading) {
    return (
      <Text c="dimmed" ta="center" py="xl">
        {t('common.loading') || 'Loading...'}
      </Text>
    );
  }

  if (cashRegisters.length === 0) {
    return (
      <Text c="dimmed" ta="center" py="xl">
        {t('settings.cashRegisters.table.empty') || 'No cash registers found'}
      </Text>
    );
  }

  return (
    <Box style={{ overflowX: 'auto' }}>
      <Table striped highlightOnHover withTableBorder withColumnBorders>
        <Table.Thead
          style={{
            background: 'linear-gradient(90deg, #138496 0%, #17a2b8 50%, #20c4dd 100%)',
          }}
        >
          <Table.Tr>
            <Table.Th style={{ color: 'white', textAlign: 'center' }}>
              {t('settings.cashRegisters.field.code') || 'კოდი'}
            </Table.Th>
            <Table.Th style={{ color: 'white', textAlign: 'center' }}>
              {t('settings.cashRegisters.field.bankCode') || 'ქარხნული კოდი'}
            </Table.Th>
            <Table.Th style={{ color: 'white', textAlign: 'center' }}>
              {t('settings.cashRegisters.field.name') || 'სახელი'}
            </Table.Th>
            <Table.Th style={{ color: 'white', textAlign: 'center' }}>
              {t('settings.cashRegisters.field.type') || 'ტიპი'}
            </Table.Th>
            <Table.Th style={{ color: 'white', textAlign: 'center' }}>
              {t('settings.cashRegisters.field.status') || 'სტატუსი'}
            </Table.Th>
            <Table.Th style={{ color: 'white', textAlign: 'center', width: 120 }}>
              {t('common.actions') || 'მოქმედებები'}
            </Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {cashRegisters.map((cashRegister) => (
            <Table.Tr key={cashRegister.id}>
              <Table.Td style={{ textAlign: 'center' }}>{cashRegister.code}</Table.Td>
              <Table.Td style={{ textAlign: 'center' }}>
                {cashRegister.bankCode || (
                  <Text c="dimmed" size="sm">
                    -
                  </Text>
                )}
              </Table.Td>
              <Table.Td>{getLocalizedName(cashRegister)}</Table.Td>
              <Table.Td style={{ textAlign: 'center' }}>{getTypeLabel(cashRegister.type)}</Table.Td>
              <Table.Td style={{ textAlign: 'center' }}>
                <Badge color={cashRegister.active ? 'green' : 'gray'} variant="light">
                  {cashRegister.active
                    ? t('settings.cashRegisters.status.active') || 'აქტიური'
                    : t('settings.cashRegisters.status.inactive') || 'არააქტიური'}
                </Badge>
              </Table.Td>
              <Table.Td>
                <Box style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                  <ActionIcon
                    variant="subtle"
                    color="blue"
                    onClick={() => onEdit(cashRegister)}
                    title={t('common.edit') || 'რედაქტირება'}
                  >
                    <IconEdit size={18} />
                  </ActionIcon>
                  <ActionIcon
                    variant="subtle"
                    color="red"
                    onClick={() => onDelete(cashRegister)}
                    title={t('common.delete') || 'წაშლა'}
                  >
                    <IconTrash size={18} />
                  </ActionIcon>
                </Box>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </Box>
  );
}
