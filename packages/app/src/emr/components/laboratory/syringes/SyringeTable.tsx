// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import { Table, ActionIcon, Box, Text } from '@mantine/core';
import { IconPencil, IconTrash } from '@tabler/icons-react';
import type { DeviceDefinition } from '@medplum/fhirtypes';
import { useTranslation } from '../../../hooks/useTranslation';
import { ColorBarDisplay } from './ColorBarDisplay';
import { extractSyringeFormValues } from '../../../services/syringeService';

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

/**
 * SyringeTable Component
 * @param root0
 * @param root0.syringes
 * @param root0.onEdit
 * @param root0.onDelete
 * @param root0.loading
 */
export function SyringeTable({ syringes, onEdit, onDelete, loading }: SyringeTableProps): JSX.Element {
  const { t } = useTranslation();

  if (loading) {
    return (
      <Box p="md">
        <Text c="dimmed">{t('laboratory.syringes.table.noData')}</Text>
      </Box>
    );
  }

  if (syringes.length === 0) {
    return (
      <Box p="md" style={{ textAlign: 'center' }}>
        <Text c="dimmed">{t('laboratory.syringes.table.noData')}</Text>
      </Box>
    );
  }

  return (
    <Table
      striped
      highlightOnHover
      style={{
        tableLayout: 'fixed',
      }}
    >
      <thead
        style={{
          background: 'var(--emr-gradient-submenu)',
          color: '#ffffff',
        }}
      >
        <tr>
          <th style={{ width: '40%', padding: '12px' }}>{t('laboratory.syringes.field.name')}</th>
          <th style={{ width: '30%', padding: '12px' }}>{t('laboratory.syringes.field.color')}</th>
          <th style={{ width: '15%', padding: '12px' }}>{t('laboratory.syringes.field.volume')}</th>
          <th style={{ width: '15%', padding: '12px', textAlign: 'center' }}>
            {t('laboratory.action.edit')} / {t('laboratory.action.delete')}
          </th>
        </tr>
      </thead>
      <tbody>
        {syringes.map((syringe) => {
          const values = extractSyringeFormValues(syringe);

          return (
            <tr key={syringe.id}>
              <td style={{ padding: '8px' }}>
                <Text size="sm">{values.name}</Text>
              </td>
              <td style={{ padding: '8px' }}>
                <ColorBarDisplay color={values.color} height={24} />
              </td>
              <td style={{ padding: '8px' }}>
                <Text size="sm">{values.volume || '-'}</Text>
              </td>
              <td style={{ padding: '8px', textAlign: 'center' }}>
                <Box style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                  <ActionIcon
                    color="blue"
                    onClick={() => syringe.id && onEdit(syringe.id)}
                    title={t('laboratory.action.edit')}
                    size="sm"
                  >
                    <IconPencil size={16} />
                  </ActionIcon>
                  <ActionIcon
                    color="red"
                    onClick={() => syringe.id && onDelete(syringe.id)}
                    title={t('laboratory.action.delete')}
                    size="sm"
                  >
                    <IconTrash size={16} />
                  </ActionIcon>
                </Box>
              </td>
            </tr>
          );
        })}
      </tbody>
    </Table>
  );
}
