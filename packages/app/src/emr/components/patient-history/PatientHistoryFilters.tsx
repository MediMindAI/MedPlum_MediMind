// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import {
  Stack,
  Group,
  TextInput,
  Paper,
  Select,
  Checkbox,
  Box,
  Text,
  Collapse,
  Button,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconSearch, IconX, IconFilter, IconChevronDown, IconChevronUp } from '@tabler/icons-react';
import type { JSX } from 'react';
import { useState } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { InsuranceSelect } from './InsuranceSelect';
import { EMRDatePicker } from '../common/EMRDatePicker';
import type { PatientHistorySearchParams } from '../../types/patient-history';
import departmentsData from '../../translations/departments.json';

interface PatientHistoryFiltersProps {
  searchParams: PatientHistorySearchParams;
  onSearchParamsChange: (params: PatientHistorySearchParams) => void;
  onSearch: () => void;
}

/**
 * Beautiful production-ready filter component for patient history
 * Features: Section cards, gradient header, search button, theme colors
 * @param root0
 * @param root0.searchParams
 * @param root0.onSearchParamsChange
 * @param root0.onSearch
 */
export function PatientHistoryFilters({
  searchParams,
  onSearchParamsChange,
  onSearch,
}: PatientHistoryFiltersProps): JSX.Element {
  const { t, lang } = useTranslation();

  // Local state for form inputs
  const [localPersonalId, setLocalPersonalId] = useState(searchParams.personalId || '');
  const [localFirstName, setLocalFirstName] = useState(searchParams.firstName || '');
  const [localLastName, setLocalLastName] = useState(searchParams.lastName || '');
  const [localRegistrationNumber, setLocalRegistrationNumber] = useState(searchParams.registrationNumber || '');
  const [localDateFrom, setLocalDateFrom] = useState<Date | null>(
    searchParams.dateFrom ? new Date(searchParams.dateFrom) : null
  );
  const [localDateTo, setLocalDateTo] = useState<Date | null>(
    searchParams.dateTo ? new Date(searchParams.dateTo) : null
  );
  const [localInsurance, setLocalInsurance] = useState(searchParams.insuranceCompanyId || '0');
  const [localDepartment, setLocalDepartment] = useState(searchParams.departmentId || '');

  // Visit type checkboxes state
  const [emergencyStationary, setEmergencyStationary] = useState(false);
  const [selfAdmission, setSelfAdmission] = useState(false);
  const [ambulanceAdmission, setAmbulanceAdmission] = useState(false);
  const [unspecified, setUnspecified] = useState(false);
  const [emergencyDischarged, setEmergencyDischarged] = useState(false);
  const [emergencyNotDischarged, setEmergencyNotDischarged] = useState(false);
  const [plannedStationary, setPlannedStationary] = useState(false);
  const [plannedDischarged, setPlannedDischarged] = useState(false);
  const [plannedNotDischarged, setPlannedNotDischarged] = useState(false);
  const [ambulatory, setAmbulatory] = useState(false);

  // Collapsible section for main filters (collapsed by default)
  const [filtersOpened, { toggle: toggleFilters }] = useDisclosure(false);
  // Collapsible section for advanced filters
  const [advancedOpened, { toggle: toggleAdvanced }] = useDisclosure(false);

  // Department options from translations
  const departmentOptions = departmentsData.departments.map((dept) => ({
    value: dept.value,
    label: dept.value
      ? `${dept[lang as 'ka' | 'en' | 'ru'] || dept.ka}`
      : t('patientHistory.filter.allDepartments'),
  }));

  // Handle emergency stationary master checkbox
  const handleEmergencyStationaryChange = (checked: boolean): void => {
    setEmergencyStationary(checked);
    if (checked) {
      setSelfAdmission(true);
      setAmbulanceAdmission(true);
      setUnspecified(true);
      setEmergencyDischarged(true);
      setEmergencyNotDischarged(true);
    } else {
      setSelfAdmission(false);
      setAmbulanceAdmission(false);
      setUnspecified(false);
      setEmergencyDischarged(false);
      setEmergencyNotDischarged(false);
    }
  };

  // Handle planned stationary master checkbox
  const handlePlannedStationaryChange = (checked: boolean): void => {
    setPlannedStationary(checked);
    if (checked) {
      setPlannedDischarged(true);
      setPlannedNotDischarged(true);
    } else {
      setPlannedDischarged(false);
      setPlannedNotDischarged(false);
    }
  };

  // Handle search button click
  const handleSearch = (): void => {
    onSearchParamsChange({
      ...searchParams,
      personalId: localPersonalId || undefined,
      firstName: localFirstName || undefined,
      lastName: localLastName || undefined,
      registrationNumber: localRegistrationNumber || undefined,
      dateFrom: localDateFrom ? localDateFrom.toISOString() : undefined,
      dateTo: localDateTo ? localDateTo.toISOString() : undefined,
      insuranceCompanyId: localInsurance || '0',
      departmentId: localDepartment || undefined,
    });
    onSearch();
  };

  // Handle clear all filters
  const handleClearAll = (): void => {
    setLocalPersonalId('');
    setLocalFirstName('');
    setLocalLastName('');
    setLocalRegistrationNumber('');
    setLocalDateFrom(null);
    setLocalDateTo(null);
    setLocalInsurance('0');
    setLocalDepartment('');
    setEmergencyStationary(false);
    setSelfAdmission(false);
    setAmbulanceAdmission(false);
    setUnspecified(false);
    setEmergencyDischarged(false);
    setEmergencyNotDischarged(false);
    setPlannedStationary(false);
    setPlannedDischarged(false);
    setPlannedNotDischarged(false);
    setAmbulatory(false);

    onSearchParamsChange({
      insuranceCompanyId: '0',
    });
  };

  // Section card style
  const sectionCardStyle = {
    backgroundColor: 'var(--emr-gray-50, #f9fafb)',
    borderLeft: '3px solid var(--emr-secondary, #2b6cb0)',
    borderRadius: 'var(--emr-border-radius, 6px)',
    padding: '12px 16px',
  };

  return (
    <Paper
      shadow="sm"
      radius="md"
      style={{
        overflow: 'hidden',
        border: '1px solid var(--emr-border-color, #e5e7eb)',
      }}
    >
      {/* Gradient Header - Clickable to expand/collapse */}
      <Box
        p="md"
        onClick={toggleFilters}
        style={{
          background: 'var(--emr-gradient-primary, linear-gradient(135deg, #1a365d 0%, #2b6cb0 50%, #3182ce 100%))',
          cursor: 'pointer',
        }}
      >
        <Group justify="space-between" align="center">
          <Group gap="sm">
            <IconFilter size={20} color="white" />
            <Text size="lg" fw={600} c="white">
              {t('patientHistory.filter.title')}
            </Text>
            {filtersOpened ? (
              <IconChevronUp size={20} color="white" />
            ) : (
              <IconChevronDown size={20} color="white" />
            )}
          </Group>
          <Group gap="sm" onClick={(e) => e.stopPropagation()}>
            <Button
              variant="subtle"
              color="white"
              size="sm"
              leftSection={<IconX size={16} />}
              onClick={handleClearAll}
              styles={{
                root: {
                  color: 'white',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  },
                },
              }}
            >
              {t('patientHistory.filter.clearAll')}
            </Button>
            <Button
              variant="white"
              size="sm"
              leftSection={<IconSearch size={16} />}
              onClick={handleSearch}
              styles={{
                root: {
                  color: 'var(--emr-primary, #1a365d)',
                  fontWeight: 600,
                },
              }}
            >
              {t('patientHistory.filter.searchButton')}
            </Button>
          </Group>
        </Group>
      </Box>

      {/* Filter Content - Collapsible */}
      <Collapse in={filtersOpened} transitionDuration={300} transitionTimingFunction="ease">
        <Stack gap="md" p="md">
        {/* Insurance & Department Section */}
        <Box style={sectionCardStyle}>
          <Text size="xs" fw={600} c="var(--emr-text-secondary, #6b7280)" mb="xs" tt="uppercase">
            {t('patientHistory.filter.sectionInsurance')}
          </Text>
          <Group wrap="wrap" grow>
            <InsuranceSelect value={localInsurance} onChange={(value) => setLocalInsurance(value || '0')} />
            <Select
              label={t('patientHistory.filter.department')}
              placeholder={t('patientHistory.filter.selectDepartment')}
              data={departmentOptions}
              value={localDepartment}
              onChange={(value) => setLocalDepartment(value || '')}
              searchable
              clearable
              styles={{
                input: {
                  '&:focus': {
                    borderColor: 'var(--emr-accent, #63b3ed)',
                    boxShadow: '0 0 0 3px rgba(99, 179, 237, 0.3)',
                  },
                },
              }}
            />
          </Group>
        </Box>

        {/* Patient Search Section */}
        <Box style={sectionCardStyle}>
          <Text size="xs" fw={600} c="var(--emr-text-secondary, #6b7280)" mb="xs" tt="uppercase">
            {t('patientHistory.filter.sectionPatient')}
          </Text>
          <Group wrap="wrap" grow>
            <TextInput
              label={t('patientHistory.filter.searchPersonalId')}
              placeholder={t('patientHistory.filter.searchPersonalIdPlaceholder')}
              value={localPersonalId}
              onChange={(e) => setLocalPersonalId(e.currentTarget.value)}
              maxLength={11}
              styles={{
                input: {
                  '&:focus': {
                    borderColor: 'var(--emr-accent, #63b3ed)',
                    boxShadow: '0 0 0 3px rgba(99, 179, 237, 0.3)',
                  },
                },
              }}
            />
            <TextInput
              label={t('patientHistory.filter.searchFirstName')}
              placeholder={t('patientHistory.filter.searchFirstNamePlaceholder')}
              value={localFirstName}
              onChange={(e) => setLocalFirstName(e.currentTarget.value)}
              styles={{
                input: {
                  '&:focus': {
                    borderColor: 'var(--emr-accent, #63b3ed)',
                    boxShadow: '0 0 0 3px rgba(99, 179, 237, 0.3)',
                  },
                },
              }}
            />
            <TextInput
              label={t('patientHistory.filter.searchLastName')}
              placeholder={t('patientHistory.filter.searchLastNamePlaceholder')}
              value={localLastName}
              onChange={(e) => setLocalLastName(e.currentTarget.value)}
              styles={{
                input: {
                  '&:focus': {
                    borderColor: 'var(--emr-accent, #63b3ed)',
                    boxShadow: '0 0 0 3px rgba(99, 179, 237, 0.3)',
                  },
                },
              }}
            />
          </Group>
        </Box>

        {/* Date & Registration Section */}
        <Box style={sectionCardStyle}>
          <Text size="xs" fw={600} c="var(--emr-text-secondary, #6b7280)" mb="xs" tt="uppercase">
            {t('patientHistory.filter.sectionDateRegistration')}
          </Text>
          <Group wrap="wrap" grow>
            <EMRDatePicker
              label={t('patientHistory.filter.dateFrom')}
              placeholder={t('patientHistory.filter.dateFromPlaceholder')}
              value={localDateFrom}
              onChange={(date) => setLocalDateFrom(date)}
              maxDate={new Date()}
            />
            <EMRDatePicker
              label={t('patientHistory.filter.dateTo')}
              placeholder={t('patientHistory.filter.dateToPlaceholder')}
              value={localDateTo}
              onChange={(date) => setLocalDateTo(date)}
              maxDate={new Date()}
            />
            <TextInput
              label={t('patientHistory.filter.searchRegistrationNumber')}
              placeholder={t('patientHistory.filter.searchRegistrationNumberPlaceholder')}
              value={localRegistrationNumber}
              onChange={(e) => setLocalRegistrationNumber(e.currentTarget.value)}
              styles={{
                input: {
                  '&:focus': {
                    borderColor: 'var(--emr-accent, #63b3ed)',
                    boxShadow: '0 0 0 3px rgba(99, 179, 237, 0.3)',
                  },
                },
              }}
            />
          </Group>
        </Box>

        {/* Advanced Filters Toggle - Beautiful collapsible button */}
        <Box
          onClick={toggleAdvanced}
          style={{
            cursor: 'pointer',
            border: '2px solid var(--emr-accent, #63b3ed)',
            borderRadius: '8px',
            backgroundColor: 'white',
            padding: '12px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: 'all 0.2s ease',
            boxShadow: advancedOpened ? '0 2px 8px rgba(99, 179, 237, 0.3)' : 'none',
          }}
        >
          <Text
            size="md"
            fw={500}
            c="var(--emr-secondary, #2b6cb0)"
            style={{ letterSpacing: '0.5px' }}
          >
            {t('patientHistory.filter.showAdvanced')}
          </Text>
          {advancedOpened ? (
            <IconChevronUp size={20} color="var(--emr-secondary, #2b6cb0)" />
          ) : (
            <IconChevronDown size={20} color="var(--emr-secondary, #2b6cb0)" />
          )}
        </Box>

        {/* Visit Type Checkboxes - Beautiful expandable section */}
        <Collapse in={advancedOpened} transitionDuration={300} transitionTimingFunction="ease">
          <Paper
            p="lg"
            radius="md"
            style={{
              backgroundColor: 'white',
              border: '1px solid var(--emr-border-color, #e5e7eb)',
              marginTop: '8px',
            }}
          >
            <Text size="sm" fw={600} c="var(--emr-text-secondary, #6b7280)" mb="md">
              {t('patientHistory.filter.sectionVisitType')}
            </Text>
            <Stack gap="lg">
              {/* Emergency Stationary Section */}
              <Box
                p="md"
                style={{
                  backgroundColor: emergencyStationary ? 'rgba(99, 179, 237, 0.05)' : 'var(--emr-gray-50, #f9fafb)',
                  borderRadius: '8px',
                  border: emergencyStationary ? '1px solid var(--emr-accent, #63b3ed)' : '1px solid transparent',
                  transition: 'all 0.2s ease',
                }}
              >
                <Checkbox
                  label={t('patientHistory.filter.emergencyStationary')}
                  checked={emergencyStationary}
                  onChange={(e) => handleEmergencyStationaryChange(e.currentTarget.checked)}
                  styles={{
                    label: {
                      fontWeight: 600,
                      fontSize: '14px',
                      color: 'var(--emr-text-primary, #1f2937)',
                    },
                    input: {
                      cursor: 'pointer',
                      '&:checked': {
                        backgroundColor: 'var(--emr-secondary, #2b6cb0)',
                        borderColor: 'var(--emr-secondary, #2b6cb0)',
                      },
                    },
                  }}
                />
                <Group ml="lg" mt="sm" gap="lg" wrap="wrap">
                  <Checkbox
                    label={t('patientHistory.filter.selfAdmission')}
                    checked={selfAdmission}
                    onChange={(e) => setSelfAdmission(e.currentTarget.checked)}
                    disabled={!emergencyStationary}
                    size="sm"
                    styles={{
                      label: {
                        color: emergencyStationary ? 'var(--emr-text-secondary, #6b7280)' : 'var(--emr-gray-400, #9ca3af)',
                        fontSize: '13px',
                      },
                      input: {
                        cursor: emergencyStationary ? 'pointer' : 'not-allowed',
                        opacity: emergencyStationary ? 1 : 0.5,
                      },
                    }}
                  />
                  <Checkbox
                    label={t('patientHistory.filter.ambulanceAdmission')}
                    checked={ambulanceAdmission}
                    onChange={(e) => setAmbulanceAdmission(e.currentTarget.checked)}
                    disabled={!emergencyStationary}
                    size="sm"
                    styles={{
                      label: {
                        color: emergencyStationary ? 'var(--emr-text-secondary, #6b7280)' : 'var(--emr-gray-400, #9ca3af)',
                        fontSize: '13px',
                      },
                      input: {
                        cursor: emergencyStationary ? 'pointer' : 'not-allowed',
                        opacity: emergencyStationary ? 1 : 0.5,
                      },
                    }}
                  />
                  <Checkbox
                    label={t('patientHistory.filter.unspecified')}
                    checked={unspecified}
                    onChange={(e) => setUnspecified(e.currentTarget.checked)}
                    disabled={!emergencyStationary}
                    size="sm"
                    styles={{
                      label: {
                        color: emergencyStationary ? 'var(--emr-text-secondary, #6b7280)' : 'var(--emr-gray-400, #9ca3af)',
                        fontSize: '13px',
                      },
                      input: {
                        cursor: emergencyStationary ? 'pointer' : 'not-allowed',
                        opacity: emergencyStationary ? 1 : 0.5,
                      },
                    }}
                  />
                  <Checkbox
                    label={t('patientHistory.filter.discharged')}
                    checked={emergencyDischarged}
                    onChange={(e) => setEmergencyDischarged(e.currentTarget.checked)}
                    disabled={!emergencyStationary}
                    size="sm"
                    styles={{
                      label: {
                        color: emergencyStationary ? 'var(--emr-text-secondary, #6b7280)' : 'var(--emr-gray-400, #9ca3af)',
                        fontSize: '13px',
                      },
                      input: {
                        cursor: emergencyStationary ? 'pointer' : 'not-allowed',
                        opacity: emergencyStationary ? 1 : 0.5,
                      },
                    }}
                  />
                  <Checkbox
                    label={t('patientHistory.filter.notDischarged')}
                    checked={emergencyNotDischarged}
                    onChange={(e) => setEmergencyNotDischarged(e.currentTarget.checked)}
                    disabled={!emergencyStationary}
                    size="sm"
                    styles={{
                      label: {
                        color: emergencyStationary ? 'var(--emr-text-secondary, #6b7280)' : 'var(--emr-gray-400, #9ca3af)',
                        fontSize: '13px',
                      },
                      input: {
                        cursor: emergencyStationary ? 'pointer' : 'not-allowed',
                        opacity: emergencyStationary ? 1 : 0.5,
                      },
                    }}
                  />
                </Group>
              </Box>

              {/* Planned Stationary Section */}
              <Box
                p="md"
                style={{
                  backgroundColor: plannedStationary ? 'rgba(99, 179, 237, 0.05)' : 'var(--emr-gray-50, #f9fafb)',
                  borderRadius: '8px',
                  border: plannedStationary ? '1px solid var(--emr-accent, #63b3ed)' : '1px solid transparent',
                  transition: 'all 0.2s ease',
                }}
              >
                <Checkbox
                  label={t('patientHistory.filter.plannedStationary')}
                  checked={plannedStationary}
                  onChange={(e) => handlePlannedStationaryChange(e.currentTarget.checked)}
                  styles={{
                    label: {
                      fontWeight: 600,
                      fontSize: '14px',
                      color: 'var(--emr-text-primary, #1f2937)',
                    },
                    input: {
                      cursor: 'pointer',
                      '&:checked': {
                        backgroundColor: 'var(--emr-secondary, #2b6cb0)',
                        borderColor: 'var(--emr-secondary, #2b6cb0)',
                      },
                    },
                  }}
                />
                <Group ml="lg" mt="sm" gap="lg" wrap="wrap">
                  <Checkbox
                    label={t('patientHistory.filter.discharged')}
                    checked={plannedDischarged}
                    onChange={(e) => setPlannedDischarged(e.currentTarget.checked)}
                    disabled={!plannedStationary}
                    size="sm"
                    styles={{
                      label: {
                        color: plannedStationary ? 'var(--emr-text-secondary, #6b7280)' : 'var(--emr-gray-400, #9ca3af)',
                        fontSize: '13px',
                      },
                      input: {
                        cursor: plannedStationary ? 'pointer' : 'not-allowed',
                        opacity: plannedStationary ? 1 : 0.5,
                      },
                    }}
                  />
                  <Checkbox
                    label={t('patientHistory.filter.notDischarged')}
                    checked={plannedNotDischarged}
                    onChange={(e) => setPlannedNotDischarged(e.currentTarget.checked)}
                    disabled={!plannedStationary}
                    size="sm"
                    styles={{
                      label: {
                        color: plannedStationary ? 'var(--emr-text-secondary, #6b7280)' : 'var(--emr-gray-400, #9ca3af)',
                        fontSize: '13px',
                      },
                      input: {
                        cursor: plannedStationary ? 'pointer' : 'not-allowed',
                        opacity: plannedStationary ? 1 : 0.5,
                      },
                    }}
                  />
                </Group>
              </Box>

              {/* Ambulatory Section */}
              <Box
                p="md"
                style={{
                  backgroundColor: ambulatory ? 'rgba(99, 179, 237, 0.05)' : 'var(--emr-gray-50, #f9fafb)',
                  borderRadius: '8px',
                  border: ambulatory ? '1px solid var(--emr-accent, #63b3ed)' : '1px solid transparent',
                  transition: 'all 0.2s ease',
                }}
              >
                <Checkbox
                  label={t('patientHistory.filter.ambulatory')}
                  checked={ambulatory}
                  onChange={(e) => setAmbulatory(e.currentTarget.checked)}
                  styles={{
                    label: {
                      fontWeight: 600,
                      fontSize: '14px',
                      color: 'var(--emr-text-primary, #1f2937)',
                    },
                    input: {
                      cursor: 'pointer',
                      '&:checked': {
                        backgroundColor: 'var(--emr-secondary, #2b6cb0)',
                        borderColor: 'var(--emr-secondary, #2b6cb0)',
                      },
                    },
                  }}
                />
              </Box>
            </Stack>
          </Paper>
        </Collapse>
        </Stack>
      </Collapse>
    </Paper>
  );
}
