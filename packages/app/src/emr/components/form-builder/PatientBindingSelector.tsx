// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { Select, Text } from '@mantine/core';
import { BINDING_CONFIGS, type BindingKey } from '../../types/patient-binding';

/**
 * Props for PatientBindingSelector component
 */
export interface PatientBindingSelectorProps {
  value: BindingKey | null;
  onChange: (key: BindingKey | null) => void;
}

/**
 * Dropdown selector for patient data binding options
 *
 * Features:
 * - 14 patient data binding options from BINDING_CONFIGS
 * - Displays binding key, label, and description
 * - Shows FHIRPath expression as help text
 * - Allows "None" option to remove binding
 */
export function PatientBindingSelector({ value, onChange }: PatientBindingSelectorProps): JSX.Element {
  // Convert BINDING_CONFIGS to select options
  const bindingOptions = Object.entries(BINDING_CONFIGS).map(([key, config]) => ({
    value: key,
    label: config.label,
    description: config.description,
  }));

  // Get the selected binding config for help text
  const selectedBinding = value ? BINDING_CONFIGS[value] : null;

  return (
    <>
      <Select
        label="Patient Data Binding"
        placeholder="Select patient data field"
        description="Auto-populate this field with patient or encounter data"
        data={bindingOptions}
        value={value}
        onChange={(val) => onChange(val as BindingKey | null)}
        clearable
        searchable
      />

      {selectedBinding && (
        <Text size="xs" c="dimmed" mt="xs">
          FHIRPath: {selectedBinding.fhirPath || 'Calculated field'}
        </Text>
      )}

      {selectedBinding?.isCalculated && (
        <Text size="xs" c="blue" mt="xs">
          Calculated: {selectedBinding.calculationFunction}
        </Text>
      )}
    </>
  );
}
