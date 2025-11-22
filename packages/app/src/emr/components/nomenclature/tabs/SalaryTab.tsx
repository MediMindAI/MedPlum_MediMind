// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import {
  Paper,
  Text,
  Stack,
  Group,
  Grid,
  Select,
  NumberInput,
  Checkbox,
  Button,
  ActionIcon,
  Table,
  TextInput,
  Textarea,
} from '@mantine/core';
import { IconPlus, IconPencil, IconTrash } from '@tabler/icons-react';
import type { ActivityDefinition } from '@medplum/fhirtypes';
import type { JSX } from 'react';
import { useState } from 'react';
import { useTranslation } from '../../../hooks/useTranslation';
import { usePractitioners } from '../../../hooks/usePractitioners';
import salaryPositionsData from '../../../translations/salary-positions.json';
import salaryCalculationTypesData from '../../../translations/salary-calculation-types.json';

interface SalaryTabProps {
  service: ActivityDefinition;
  onSave: (service: ActivityDefinition) => Promise<void>;
}

/**
 * Performer entry interface
 */
interface PerformerEntry {
  position: string;
  practitionerId: string;
  practitionerName: string;
  calculationType: string;
  salary: number | '';
  isDefault: boolean;
}

/**
 * Salary Tab - Compensation distribution for medical services
 *
 * Features:
 * - Configure primary performers and their compensation percentages
 * - Secondary/assistant personnel dropdowns
 * - Other salary components
 * - Service salary description
 * @param root0
 * @param root0.service
 * @param root0.onSave
 */
export function SalaryTab({ service, onSave }: SalaryTabProps): JSX.Element {
  const { t } = useTranslation();
  const [saving, setSaving] = useState(false);
  const { practitionerOptions, loading: loadingPractitioners } = usePractitioners();

  // State for performers (შემსრულებლები) - Left form
  const [performers, setPerformers] = useState<PerformerEntry[]>([]);
  const [selectedPosition, setSelectedPosition] = useState<string | null>(null);
  const [selectedPractitioner, setSelectedPractitioner] = useState<string | null>(null);
  const [selectedCalculationType, setSelectedCalculationType] = useState<string | null>(null);
  const [salary, setSalary] = useState<number | ''>('');

  // State for expected personnel (სავარაუდო პერსონალი) - Right form
  const [selectedExpectedPersonnel, setSelectedExpectedPersonnel] = useState<string | null>(null);

  // State for personnel list (პერსონალი section)
  const [personnelList, setPersonnelList] = useState<{ name: string; isChecked: boolean }[]>([]);

  // State for other salaries (სხვა ხელფასები)
  const [otherSalaries, setOtherSalaries] = useState<string[]>([]);
  const [otherSalaryInput, setOtherSalaryInput] = useState('');

  // State for description (დასახელება)
  const [description, setDescription] = useState('');

  // Handle add performer (from left form)
  const handleAddPerformer = (): void => {
    if (!selectedPosition || !selectedPractitioner || !selectedCalculationType) {
      return;
    }

    // Get practitioner name from options
    const practitioner = practitionerOptions.find((p) => p.value === selectedPractitioner);
    if (!practitioner) {
      return;
    }

    const newPerformer: PerformerEntry = {
      position: selectedPosition,
      practitionerId: selectedPractitioner,
      practitionerName: practitioner.label,
      calculationType: selectedCalculationType,
      salary: salary || 0,
      isDefault: false, // Will be toggled in table
    };

    setPerformers([...performers, newPerformer]);

    // Clear form
    setSelectedPosition(null);
    setSelectedPractitioner(null);
    setSelectedCalculationType(null);
    setSalary('');
  };

  // Handle add expected personnel (from right form)
  const handleAddExpectedPersonnel = (): void => {
    if (!selectedExpectedPersonnel) {
      return;
    }

    // Get practitioner name from options
    const practitioner = practitionerOptions.find((p) => p.value === selectedExpectedPersonnel);
    if (!practitioner) {
      return;
    }

    // Add to personnelList
    setPersonnelList([...personnelList, { name: practitioner.label, isChecked: false }]);

    // Clear form
    setSelectedExpectedPersonnel(null);
  };

  // Handle delete performer
  const handleDeletePerformer = (index: number): void => {
    setPerformers(performers.filter((_, i) => i !== index));
  };

  // Handle toggle default checkbox in performers table
  const handleToggleDefault = (index: number): void => {
    setPerformers(
      performers.map((p, i) => ({
        ...p,
        isDefault: i === index ? !p.isDefault : p.isDefault,
      }))
    );
  };

  // Handle remove personnel
  const handleRemovePersonnel = (index: number): void => {
    setPersonnelList(personnelList.filter((_, i) => i !== index));
  };

  // Handle toggle personnel checkbox
  const handleTogglePersonnelCheckbox = (index: number): void => {
    setPersonnelList(
      personnelList.map((p, i) => ({
        ...p,
        isChecked: i === index ? !p.isChecked : p.isChecked,
      }))
    );
  };

  // Handle add other salary
  const handleAddOtherSalary = (): void => {
    if (!otherSalaryInput.trim()) {
      return;
    }
    setOtherSalaries([...otherSalaries, otherSalaryInput]);
    setOtherSalaryInput('');
  };

  // Handle remove other salary
  const handleRemoveOtherSalary = (index: number): void => {
    setOtherSalaries(otherSalaries.filter((_, i) => i !== index));
  };

  // Get position label by value
  const getPositionLabel = (value: string): string => {
    const option = salaryPositionsData.find((opt) => opt.value === value);
    return option?.label || value;
  };

  // Get calculation type label by value
  const getCalculationTypeLabel = (value: string): string => {
    const option = salaryCalculationTypesData.find((opt) => opt.value === value);
    return option?.label || value;
  };

  return (
    <Stack gap="md">
      {/* Header Section */}
      <Paper p="md" style={{ backgroundColor: '#f8f9fa' }}>
        <Text fw={600} mb="sm">
          {t('registeredServices.salary.title')}
        </Text>
        <Text size="sm" c="dimmed">
          {t('registeredServices.salary.description')}
        </Text>
      </Paper>

      {/* Section 1: Performers (შემსრულებლები) */}
      <Paper p="md" withBorder>
        <Text fw={600} mb="md" p="sm" style={{ backgroundColor: '#E8E8F5', borderRadius: '4px' }}>
          შემსრულებლები
        </Text>

        {/* Two-column form layout */}
        <Grid mb="md">
          {/* Left Column: Performer Form (50%) */}
          <Grid.Col span={6}>
            <Stack gap="sm">
              <Text size="sm" fw={500} mb="xs" c="var(--emr-primary)">
                შემსრულებლები
              </Text>
              <Select
                placeholder="აირჩიეთ პოზიცია"
                data={salaryPositionsData}
                value={selectedPosition}
                onChange={setSelectedPosition}
                searchable
                clearable
                styles={{
                  input: {
                    transition: 'border-color 200ms ease-in-out',
                    '&:focus': {
                      borderColor: 'var(--emr-accent)',
                    },
                  },
                }}
              />
              <Select
                placeholder="აირჩიეთ პრაქტიკოსი"
                data={practitionerOptions}
                value={selectedPractitioner}
                onChange={setSelectedPractitioner}
                searchable
                clearable
                disabled={!selectedPosition || loadingPractitioners}
                styles={{
                  input: {
                    transition: 'border-color 200ms ease-in-out',
                    '&:focus': {
                      borderColor: 'var(--emr-accent)',
                    },
                  },
                }}
              />
              <Group grow>
                <Select
                  placeholder="აირჩიეთ ტიპი"
                  data={salaryCalculationTypesData}
                  value={selectedCalculationType}
                  onChange={setSelectedCalculationType}
                  searchable
                  clearable
                  styles={{
                    input: {
                      transition: 'border-color 200ms ease-in-out',
                      '&:focus': {
                        borderColor: 'var(--emr-accent)',
                      },
                    },
                  }}
                />
                <NumberInput
                  placeholder="0"
                  min={0}
                  step={0.01}
                  decimalScale={2}
                  value={salary}
                  onChange={setSalary}
                  styles={{
                    input: {
                      transition: 'border-color 200ms ease-in-out',
                      '&:focus': {
                        borderColor: 'var(--emr-accent)',
                      },
                    },
                  }}
                />
              </Group>
              <Button
                leftSection={<IconPlus size={16} />}
                style={{
                  background: 'var(--emr-gradient-submenu)',
                  transition: 'all 200ms ease-in-out',
                }}
                onClick={handleAddPerformer}
                disabled={!selectedPosition || !selectedPractitioner || !selectedCalculationType}
                fullWidth
              >
                დამატება
              </Button>
            </Stack>
          </Grid.Col>

          {/* Right Column: Expected Personnel Form (50%) */}
          <Grid.Col span={6}>
            <Stack gap="sm">
              <Text size="sm" fw={500} mb="xs" c="var(--emr-primary)">
                სავარაუდო პერსონალი
              </Text>
              <Select
                placeholder="აირჩიეთ პრაქტიკოსი"
                data={practitionerOptions}
                value={selectedExpectedPersonnel}
                onChange={setSelectedExpectedPersonnel}
                searchable
                clearable
                disabled={loadingPractitioners}
                styles={{
                  input: {
                    transition: 'border-color 200ms ease-in-out',
                    '&:focus': {
                      borderColor: 'var(--emr-accent)',
                    },
                  },
                }}
              />
              <Button
                leftSection={<IconPlus size={16} />}
                style={{
                  background: 'var(--emr-gradient-submenu)',
                  transition: 'all 200ms ease-in-out',
                }}
                onClick={handleAddExpectedPersonnel}
                disabled={!selectedExpectedPersonnel}
                fullWidth
              >
                დამატება
              </Button>
            </Stack>
          </Grid.Col>
        </Grid>

        {/* Performers Table */}
        <Table
          highlightOnHover
          style={{
            borderCollapse: 'separate',
            borderSpacing: 0,
          }}
        >
          <Table.Thead style={{ background: '#E8E8F5' }}>
            <Table.Tr>
              <Table.Th style={{ padding: '12px 16px', fontWeight: 600 }}>სახელი</Table.Th>
              <Table.Th style={{ padding: '12px 16px', fontWeight: 600 }}>ტიპი</Table.Th>
              <Table.Th style={{ padding: '12px 16px', fontWeight: 600 }}>ხელფასი</Table.Th>
              <Table.Th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 600 }}>ნაგ</Table.Th>
              <Table.Th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 600 }}>
                მოქმედებები
              </Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {performers.length === 0 ? (
              <Table.Tr>
                <Table.Td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                  მონაცემები არ არის დამატებული
                </Table.Td>
              </Table.Tr>
            ) : (
              performers.map((performer, index) => (
                <Table.Tr
                  key={index}
                  style={{
                    transition: 'background-color 200ms ease-in-out',
                  }}
                >
                  <Table.Td style={{ padding: '12px 16px', fontWeight: 500 }}>
                    {performer.practitionerName}
                  </Table.Td>
                  <Table.Td style={{ padding: '12px 16px' }}>
                    {getCalculationTypeLabel(performer.calculationType)}
                  </Table.Td>
                  <Table.Td style={{ padding: '12px 16px', fontWeight: 500 }}>{performer.salary}</Table.Td>
                  <Table.Td style={{ textAlign: 'center', padding: '12px 16px' }}>
                    <Checkbox checked={performer.isDefault} onChange={() => handleToggleDefault(index)} />
                  </Table.Td>
                  <Table.Td style={{ textAlign: 'center', padding: '12px 16px' }}>
                    <Group gap="xs" justify="center">
                      <ActionIcon
                        variant="subtle"
                        color="blue"
                        size="sm"
                        style={{ transition: 'transform 200ms ease-in-out' }}
                        onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.1)')}
                        onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                      >
                        <IconPencil size={16} />
                      </ActionIcon>
                      <ActionIcon
                        variant="subtle"
                        color="red"
                        size="sm"
                        onClick={() => handleDeletePerformer(index)}
                        style={{ transition: 'transform 200ms ease-in-out' }}
                        onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.1)')}
                        onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                      >
                        <IconTrash size={16} />
                      </ActionIcon>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))
            )}
          </Table.Tbody>
        </Table>
      </Paper>

      {/* Section 2: Personnel (პერსონალი) */}
      <Paper p="md" withBorder>
        <Text fw={600} mb="md" p="sm" style={{ backgroundColor: '#E8E8F5', borderRadius: '4px' }}>
          პერსონალი
        </Text>

        {personnelList.length === 0 ? (
          <Text size="sm" c="dimmed" ta="center" py="md">
            პერსონალი არ არის დამატებული
          </Text>
        ) : (
          <Stack gap="xs">
            {personnelList.map((person, index) => (
              <Group key={index} justify="space-between" p="xs" style={{ backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
                <Group gap="sm">
                  <Checkbox
                    checked={person.isChecked}
                    onChange={() => handleTogglePersonnelCheckbox(index)}
                  />
                  <Text size="sm">{person.name}</Text>
                </Group>
                <ActionIcon
                  variant="subtle"
                  color="red"
                  size="sm"
                  onClick={() => handleRemovePersonnel(index)}
                >
                  <IconTrash size={16} />
                </ActionIcon>
              </Group>
            ))}
          </Stack>
        )}
      </Paper>

      {/* Section 3: Other Salaries (სხვა ხელფასები) */}
      <Paper p="md" withBorder>
        <Text fw={600} mb="md" p="sm" style={{ backgroundColor: '#E8E8F5', borderRadius: '4px' }}>
          სხვა ხელფასები
        </Text>

        <Group grow mb="md">
          <TextInput
            placeholder="დაამატეთ სხვა ხელფასი"
            value={otherSalaryInput}
            onChange={(event) => setOtherSalaryInput(event.currentTarget.value)}
          />
          <Button
            leftSection={<IconPlus size={16} />}
            style={{ maxWidth: '120px', background: 'var(--emr-gradient-submenu)' }}
            onClick={handleAddOtherSalary}
          >
            დამატება
          </Button>
        </Group>

        {otherSalaries.length === 0 ? (
          <Text size="sm" c="dimmed" ta="center" py="md">
            სხვა ხელფასები არ არის დამატებული
          </Text>
        ) : (
          <Stack gap="xs">
            {otherSalaries.map((salary, index) => (
              <Group key={index} justify="space-between" p="xs" style={{ backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
                <Text size="sm">{salary}</Text>
                <ActionIcon
                  variant="subtle"
                  color="red"
                  size="sm"
                  onClick={() => handleRemoveOtherSalary(index)}
                >
                  <IconTrash size={16} />
                </ActionIcon>
              </Group>
            ))}
          </Stack>
        )}
      </Paper>

      {/* Section 4: Description (დასახელება) */}
      <Paper p="md" withBorder>
        <Text fw={600} mb="md" p="sm" style={{ backgroundColor: '#E8E8F5', borderRadius: '4px' }}>
          დასახელება
        </Text>
        <Textarea
          placeholder="შეიყვანეთ აღწერა"
          minRows={4}
          autosize
          value={description}
          onChange={(event) => setDescription(event.currentTarget.value)}
        />
      </Paper>
    </Stack>
  );
}
