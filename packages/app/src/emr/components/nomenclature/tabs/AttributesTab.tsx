// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import {
  Paper,
  Text,
  Stack,
  Group,
  Select,
  TextInput,
  Button,
  ActionIcon,
  Table,
  NumberInput,
  ColorInput,
} from '@mantine/core';
import { TimeInput } from '@mantine/dates';
import { IconPlus, IconPencil, IconTrash, IconCalendar, IconX } from '@tabler/icons-react';
import type { ActivityDefinition } from '@medplum/fhirtypes';
import type { JSX } from 'react';
import { useState } from 'react';
import { useTranslation } from '../../../hooks/useTranslation';

interface AttributesTabProps {
  service: ActivityDefinition;
  onSave: (service: ActivityDefinition) => Promise<void>;
}

/**
 * Attributes Tab - Service attributes and configurations
 *
 * Features:
 * - Color picker with HEX code input for service color coding
 * - Online blocking hours (time ranges when service cannot be booked online)
 * - Equipment/consumables management
 */
export function AttributesTab({ service, onSave }: AttributesTabProps): JSX.Element {
  const { t } = useTranslation();
  const [saving, setSaving] = useState(false);
  const [hexColor, setHexColor] = useState('#EF1234');
  const [colorCategory, setColorCategory] = useState('ინსტრუმენტული კვლევები');

  // TODO: Implement color management logic
  // TODO: Implement time blocking logic
  // TODO: Implement equipment management logic

  return (
    <Stack gap="md">
      {/* Header Section */}
      <Paper p="md" style={{ backgroundColor: '#f8f9fa' }}>
        <Text fw={600} mb="sm">
          {t('registeredServices.attributes.title')}
        </Text>
        <Text size="sm" c="dimmed">
          {t('registeredServices.attributes.description')}
        </Text>
      </Paper>

      {/* Section 1: Color Picker (ფერი) */}
      <Paper p="md" withBorder>
        <Text fw={600} mb="md">
          {t('registeredServices.attributes.colorPicker.label')}
        </Text>

        {/* Color Dropdown */}
        <Select
          label={t('registeredServices.attributes.colorPicker.label')}
          placeholder={t('registeredServices.attributes.colorPicker.selectColor')}
          data={[
            // TODO: Load predefined color options
            { value: 'instrumental', label: 'ინსტრუმენტული კვლევები' },
          ]}
          mb="md"
        />

        {/* Color Category Display (Read-only) */}
        <TextInput
          label={t('registeredServices.attributes.colorPicker.category')}
          value={colorCategory}
          readOnly
          rightSection={
            <ActionIcon onClick={() => setColorCategory('')} variant="subtle">
              <IconX size={16} />
            </ActionIcon>
          }
          mb="md"
        />

        {/* HEX Color Code Input with Color Preview */}
        <ColorInput
          label={t('registeredServices.attributes.colorPicker.hexLabel')}
          placeholder="#000000"
          value={hexColor}
          onChange={setHexColor}
          format="hex"
          withEyeDropper
        />
        {/* TODO: Implement save logic */}
      </Paper>

      {/* Section 2: Online Blocking Hours (ონლაინ ბლოკირება) */}
      <Paper p="md" withBorder>
        <Text fw={600} mb="md">
          {t('registeredServices.attributes.onlineBlocking.title')}
        </Text>

        {/* Time Range Form */}
        <Group grow mb="md">
          <TimeInput
            label={t('registeredServices.attributes.onlineBlocking.startTime')}
            leftSection={<IconCalendar size={16} />}
            placeholder="00:00"
          />
          <TimeInput
            label={t('registeredServices.attributes.onlineBlocking.endTime')}
            leftSection={<IconCalendar size={16} />}
            placeholder="00:00"
          />
          <Button leftSection={<IconPlus size={16} />} style={{ marginTop: '28px', maxWidth: '80px' }}>
            +
          </Button>
        </Group>

        {/* Time Ranges Table */}
        <Table
          style={{
            borderCollapse: 'separate',
            borderSpacing: 0,
          }}
        >
          <Table.Thead style={{ background: 'var(--emr-gradient-submenu)' }}>
            <Table.Tr>
              <Table.Th style={{ color: 'white', padding: '12px 16px' }}>
                {t('registeredServices.attributes.onlineBlocking.startTime')}
              </Table.Th>
              <Table.Th style={{ color: 'white', padding: '12px 16px' }}>
                {t('registeredServices.attributes.onlineBlocking.endTime')}
              </Table.Th>
              <Table.Th style={{ color: 'white', padding: '12px 16px', textAlign: 'center' }}>
                {t('registeredServices.attributes.onlineBlocking.actions')}
              </Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            <Table.Tr>
              <Table.Td colSpan={3} style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                {t('registeredServices.attributes.onlineBlocking.empty')}
              </Table.Td>
            </Table.Tr>
            {/* TODO: Map time range data rows here */}
          </Table.Tbody>
        </Table>
      </Paper>

      {/* Section 3: Equipment/Consumables (აღჭურვილობა ხარჯვა) */}
      <Paper p="md" withBorder>
        <Text fw={600} mb="md">
          {t('registeredServices.attributes.equipment.title')}
        </Text>

        {/* Equipment Form */}
        <Group grow mb="md">
          <Select
            label={t('registeredServices.attributes.equipment.name')}
            placeholder={t('registeredServices.attributes.equipment.selectEquipment')}
            data={[
              // TODO: Load equipment/consumables from Device resources
            ]}
          />
          <NumberInput
            label={t('registeredServices.attributes.equipment.quantity')}
            placeholder="1"
            min={1}
          />
          <Button leftSection={<IconPlus size={16} />} style={{ marginTop: '28px', maxWidth: '80px' }}>
            +
          </Button>
        </Group>

        {/* Equipment Table */}
        <Table
          style={{
            borderCollapse: 'separate',
            borderSpacing: 0,
          }}
        >
          <Table.Thead style={{ background: 'var(--emr-gradient-submenu)' }}>
            <Table.Tr>
              <Table.Th style={{ color: 'white', padding: '12px 16px' }}>
                {t('registeredServices.attributes.equipment.name')}
              </Table.Th>
              <Table.Th style={{ color: 'white', padding: '12px 16px' }}>
                {t('registeredServices.attributes.equipment.quantity')}
              </Table.Th>
              <Table.Th style={{ color: 'white', padding: '12px 16px', textAlign: 'center' }}>
                {t('registeredServices.attributes.equipment.actions')}
              </Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            <Table.Tr>
              <Table.Td colSpan={3} style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                {t('registeredServices.attributes.equipment.empty')}
              </Table.Td>
            </Table.Tr>
            {/* TODO: Map equipment data rows here */}
          </Table.Tbody>
        </Table>
      </Paper>
    </Stack>
  );
}
