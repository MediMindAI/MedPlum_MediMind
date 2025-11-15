// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { Stack, Group, TextInput, Paper } from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { useDebouncedValue } from '@mantine/hooks';
import type { JSX } from 'react';
import { useState, useEffect } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { InsuranceSelect } from './InsuranceSelect';
import type { PatientHistorySearchParams } from '../../types/patient-history';

interface PatientHistoryFiltersProps {
  searchParams: PatientHistorySearchParams;
  onSearchParamsChange: (params: PatientHistorySearchParams) => void;
}

/**
 * Filter row for patient history table
 * Includes: insurance dropdown, personal ID, name, date range, registration number
 * Uses debouncing (500ms) for text inputs to reduce API calls
 */
export function PatientHistoryFilters({
  searchParams,
  onSearchParamsChange,
}: PatientHistoryFiltersProps): JSX.Element {
  const { t } = useTranslation();

  // Local state for immediate UI feedback
  const [localPersonalId, setLocalPersonalId] = useState(searchParams.personalId || '');
  const [localFirstName, setLocalFirstName] = useState(searchParams.firstName || '');
  const [localLastName, setLocalLastName] = useState(searchParams.lastName || '');
  const [localRegistrationNumber, setLocalRegistrationNumber] = useState(searchParams.registrationNumber || '');

  // Debounced values (500ms delay to reduce API calls)
  const [debouncedPersonalId] = useDebouncedValue(localPersonalId, 500);
  const [debouncedFirstName] = useDebouncedValue(localFirstName, 500);
  const [debouncedLastName] = useDebouncedValue(localLastName, 500);
  const [debouncedRegistrationNumber] = useDebouncedValue(localRegistrationNumber, 500);

  // Update parent when debounced values change
  useEffect(() => {
    onSearchParamsChange({
      ...searchParams,
      personalId: debouncedPersonalId || undefined,
      firstName: debouncedFirstName || undefined,
      lastName: debouncedLastName || undefined,
      registrationNumber: debouncedRegistrationNumber || undefined,
    });
  }, [debouncedPersonalId, debouncedFirstName, debouncedLastName, debouncedRegistrationNumber]);

  return (
    <Paper p="md" mb="md" withBorder>
      <Stack gap="md">
        {/* Insurance Company Filter */}
        <InsuranceSelect
          value={searchParams.insuranceCompanyId}
          onChange={(value) => onSearchParamsChange({
            ...searchParams,
            insuranceCompanyId: value || '0'
          })}
        />

        {/* Search Inputs Row 1 */}
        <Group wrap="wrap" grow>
          <TextInput
            label={t('patientHistory.filter.searchPersonalId')}
            placeholder={t('patientHistory.filter.searchPersonalIdPlaceholder')}
            value={localPersonalId}
            onChange={(e) => setLocalPersonalId(e.currentTarget.value)}
            maxLength={11}
          />
          <TextInput
            label={t('patientHistory.filter.searchFirstName')}
            placeholder={t('patientHistory.filter.searchFirstNamePlaceholder')}
            value={localFirstName}
            onChange={(e) => setLocalFirstName(e.currentTarget.value)}
          />
          <TextInput
            label={t('patientHistory.filter.searchLastName')}
            placeholder={t('patientHistory.filter.searchLastNamePlaceholder')}
            value={localLastName}
            onChange={(e) => setLocalLastName(e.currentTarget.value)}
          />
        </Group>

        {/* Search Inputs Row 2 */}
        <Group wrap="wrap" grow>
          <DateInput
            label={t('patientHistory.filter.dateFrom')}
            placeholder={t('patientHistory.filter.dateFromPlaceholder')}
            value={searchParams.dateFrom ? new Date(searchParams.dateFrom) : null}
            onChange={(date) => onSearchParamsChange({
              ...searchParams,
              dateFrom: date ? new Date(date).toISOString() : undefined
            })}
            clearable
            maxDate={new Date()}
          />
          <DateInput
            label={t('patientHistory.filter.dateTo')}
            placeholder={t('patientHistory.filter.dateToPlaceholder')}
            value={searchParams.dateTo ? new Date(searchParams.dateTo) : null}
            onChange={(date) => onSearchParamsChange({
              ...searchParams,
              dateTo: date ? new Date(date).toISOString() : undefined
            })}
            clearable
            maxDate={new Date()}
          />
          <TextInput
            label={t('patientHistory.filter.searchRegistrationNumber')}
            placeholder={t('patientHistory.filter.searchRegistrationNumberPlaceholder')}
            value={localRegistrationNumber}
            onChange={(e) => setLocalRegistrationNumber(e.currentTarget.value)}
          />
        </Group>
      </Stack>
    </Paper>
  );
}
