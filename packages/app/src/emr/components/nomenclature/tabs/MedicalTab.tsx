// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { Paper, Text, Stack, Group, Select, Checkbox, Button, Table, Textarea } from '@mantine/core';
import { IconPlus, IconPencil, IconTrash } from '@tabler/icons-react';
import type { ActivityDefinition } from '@medplum/fhirtypes';
import type { JSX } from 'react';
import { useState } from 'react';
import { useTranslation } from '../../../hooks/useTranslation';

interface MedicalTabProps {
  service: ActivityDefinition;
  onSave: (service: ActivityDefinition) => Promise<void>;
}

/**
 * Medical Tab - Laboratory and medical configurations
 *
 * Features:
 * - Configure laboratory sample containers/syringes
 * - Define research components (lab test parameters)
 * - LIS (Laboratory Information System) integration
 * - Display and visibility settings
 */
export function MedicalTab({ service, onSave }: MedicalTabProps): JSX.Element {
  const { t } = useTranslation();
  const [saving, setSaving] = useState(false);
  const [lisIntegrationEnabled, setLisIntegrationEnabled] = useState(false);

  // TODO: Implement sample management logic
  // TODO: Implement component management logic
  // TODO: Implement LIS integration logic

  return (
    <Stack gap="md">
      {/* Header Section */}
      <Paper p="md" style={{ backgroundColor: '#f8f9fa' }}>
        <Text fw={600} mb="sm">
          {t('registeredServices.medical.title')}
        </Text>
        <Text size="sm" c="dimmed">
          {t('registeredServices.medical.description')}
        </Text>
      </Paper>

      {/* Section 1: Samples (სინჯარები) */}
      <Paper p="md" withBorder>
        <Text fw={600} mb="md">
          {t('registeredServices.medical.samples.title')}
        </Text>

        {/* Sample Filter Fields */}
        <Group grow mb="md">
          <Select
            placeholder={t('registeredServices.medical.samples.filter1')}
            data={[
              // TODO: Load sample criteria options
            ]}
          />
          <Select
            placeholder={t('registeredServices.medical.samples.filter2')}
            data={[
              // TODO: Load sample criteria options
            ]}
          />
          <Select
            placeholder={t('registeredServices.medical.samples.filter3')}
            data={[
              // TODO: Load sample criteria options
            ]}
          />
          <Select
            placeholder={t('registeredServices.medical.samples.filter4')}
            data={[
              // TODO: Load sample criteria options
            ]}
          />
          <Button leftSection={<IconPlus size={16} />} style={{ background: 'var(--emr-gradient-submenu)' }}>
            +
          </Button>
        </Group>

        {/* Samples Table */}
        <Table
          style={{
            borderCollapse: 'separate',
            borderSpacing: 0,
          }}
        >
          <Table.Thead style={{ background: 'var(--emr-gradient-submenu)' }}>
            <Table.Tr>
              <Table.Th style={{ color: 'white', padding: '12px 16px' }}>
                {t('registeredServices.medical.samples.table.code')}
              </Table.Th>
              <Table.Th style={{ color: 'white', padding: '12px 16px' }}>
                {t('registeredServices.medical.samples.table.name')}
              </Table.Th>
              <Table.Th style={{ color: 'white', padding: '12px 16px' }}>
                {t('registeredServices.medical.samples.table.manipulation')}
              </Table.Th>
              <Table.Th style={{ color: 'white', padding: '12px 16px' }}>
                {t('registeredServices.medical.samples.table.biomaterial')}
              </Table.Th>
              <Table.Th style={{ color: 'white', padding: '12px 16px' }}>
                {t('registeredServices.medical.samples.table.quantity')}
              </Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            <Table.Tr>
              <Table.Td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                {t('registeredServices.medical.samples.table.empty')}
              </Table.Td>
            </Table.Tr>
            {/* TODO: Map sample data rows here with color column */}
          </Table.Tbody>
        </Table>
      </Paper>

      {/* Section 2: Components (კომპონენტები) */}
      <Paper p="md" withBorder>
        <Text fw={600} mb="md">
          {t('registeredServices.medical.components.title')}
        </Text>

        {/* Component Selection */}
        <Group grow mb="md">
          <Select
            placeholder={t('registeredServices.medical.components.select')}
            data={[
              // TODO: Load research components (ObservationDefinition)
            ]}
          />
          <Button
            leftSection={<IconPlus size={16} />}
            style={{ background: 'var(--emr-gradient-submenu)', maxWidth: '100px' }}
          >
            +
          </Button>
        </Group>

        {/* Components Table */}
        <Table
          style={{
            borderCollapse: 'separate',
            borderSpacing: 0,
          }}
        >
          <Table.Thead style={{ background: 'var(--emr-gradient-submenu)' }}>
            <Table.Tr>
              <Table.Th style={{ color: 'white', padding: '12px 16px' }}>
                {t('registeredServices.medical.components.table.container')}
              </Table.Th>
              <Table.Th style={{ color: 'white', padding: '12px 16px' }}>
                {t('registeredServices.medical.components.table.code')}
              </Table.Th>
              <Table.Th style={{ color: 'white', padding: '12px 16px' }}>
                {t('registeredServices.medical.components.table.name')}
              </Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            <Table.Tr>
              <Table.Td colSpan={3} style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                {t('registeredServices.medical.components.table.empty')}
              </Table.Td>
            </Table.Tr>
            {/* TODO: Map component data rows here */}
          </Table.Tbody>
        </Table>
      </Paper>

      {/* Section 3: Other Parameters (სხვა პარამეტრები) */}
      <Paper p="md" withBorder>
        <Text fw={600} mb="md">
          {t('registeredServices.medical.otherParameters.title')}
        </Text>

        <Stack gap="md">
          {/* Checkbox 1: Order Copying */}
          <Checkbox
            label={t('registeredServices.medical.otherParameters.orderCopying')}
            defaultChecked
            styles={{
              label: { cursor: 'pointer' },
            }}
          />

          {/* Checkbox 2: Hide in Research */}
          <Group grow>
            <Checkbox
              label={t('registeredServices.medical.otherParameters.hideInResearch')}
              styles={{
                label: { cursor: 'pointer' },
              }}
            />

            {/* Checkbox 3: LIS Integration with conditional dropdown */}
            <Group>
              <Checkbox
                label={t('registeredServices.medical.otherParameters.lisIntegration')}
                checked={lisIntegrationEnabled}
                onChange={(event) => setLisIntegrationEnabled(event.currentTarget.checked)}
                styles={{
                  label: { cursor: 'pointer' },
                }}
              />
              {lisIntegrationEnabled && (
                <Select
                  placeholder={t('registeredServices.medical.otherParameters.lisProvider')}
                  data={[
                    { value: 'limbach', label: 'ლიმბახი (Limbach)' },
                    // TODO: Load LIS provider options
                  ]}
                  style={{ flex: 1 }}
                />
              )}
            </Group>
          </Group>

          {/* Laboratory Form Description */}
          <Textarea
            label={t('registeredServices.medical.otherParameters.labFormDescription')}
            placeholder={t('registeredServices.medical.otherParameters.labFormPlaceholder')}
            minRows={4}
            autosize
          />
          {/* TODO: Implement save logic */}
        </Stack>
      </Paper>
    </Stack>
  );
}
