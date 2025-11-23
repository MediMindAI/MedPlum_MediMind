// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import {
  ActionIcon,
  Box,
  Button,
  Group,
  Paper,
  SimpleGrid,
  Stack,
  Table,
  Text,
  Tooltip,
} from '@mantine/core';
import { DateTimePicker } from '@mantine/dates';
import { EMRTextInput, EMRSelect, EMRNumberInput, EMRCheckbox } from '../shared/EMRFormFields';
import {
  IconChevronLeft,
  IconChevronRight,
  IconCurrencyLari,
  IconFileInvoice,
  IconLogout,
  IconPlus,
  IconTransfer,
  IconX,
} from '@tabler/icons-react';
import type { JSX } from 'react';
import { useState } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import type { VisitTableRow } from '../../types/patient-history';
import insuranceCompaniesData from '../../translations/insurance-companies.json';

interface PatientHistorySidebarProps {
  selectedPatient?: VisitTableRow;
  isOpen: boolean;
  onToggle: () => void;
}

interface ServiceItem {
  id: string;
  date: string;
  name: string;
  quantity: number;
}

export function PatientHistorySidebar({
  selectedPatient,
  isOpen,
  onToggle,
}: PatientHistorySidebarProps): JSX.Element {
  const { t, lang } = useTranslation();
  const [serviceDate, setServiceDate] = useState<Date | null>(new Date());
  const [serviceName, setServiceName] = useState('');
  const [serviceQuantity, setServiceQuantity] = useState<number | string>(1);
  const [selectedInsurance, setSelectedInsurance] = useState('0');
  const [policyCheck, setPolicyCheck] = useState(false);
  const [services, setServices] = useState<ServiceItem[]>([]);

  // Insurance company options from translations
  const insuranceOptions = insuranceCompaniesData.companies.map((company) => {
    const langKey = lang === 'ka' ? 'displayKa' : lang === 'en' ? 'displayEn' : 'displayRu';
    return {
      value: company.code,
      label: `${company.code} - ${company[langKey]}`,
    };
  });

  const handleAddService = (): void => {
    if (!selectedPatient || !serviceName.trim()) {
      return;
    }

    const newService: ServiceItem = {
      id: Date.now().toString(),
      date: serviceDate ? serviceDate.toLocaleString('ka-GE') : new Date().toLocaleString('ka-GE'),
      name: serviceName,
      quantity: typeof serviceQuantity === 'number' ? serviceQuantity : 1,
    };

    setServices([...services, newService]);
    setServiceName('');
    setServiceQuantity(1);
  };

  const handleRemoveService = (serviceId: string): void => {
    setServices(services.filter((s) => s.id !== serviceId));
  };

  // Action button handlers (placeholders for now)
  const handlePayment = (): void => {
    console.log('Payment clicked for patient:', selectedPatient?.id);
  };

  const handleCheckout = (): void => {
    console.log('Checkout clicked for patient:', selectedPatient?.id);
  };

  const handleTransfer = (): void => {
    console.log('Transfer clicked for patient:', selectedPatient?.id);
  };

  const handleInvoice = (): void => {
    console.log('Invoice clicked for patient:', selectedPatient?.id);
  };

  const handleCalculation = (): void => {
    console.log('Calculation clicked for patient:', selectedPatient?.id);
  };

  const handleAnalyses = (): void => {
    console.log('Analyses clicked for patient:', selectedPatient?.id);
  };

  const handleSalaries = (): void => {
    console.log('Salaries clicked for patient:', selectedPatient?.id);
  };

  if (!isOpen) {
    return (
      <Box
        style={{
          position: 'fixed',
          right: 0,
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 100,
        }}
      >
        <ActionIcon
          variant="filled"
          size="lg"
          onClick={onToggle}
          aria-label={t('sidebar.open')}
          style={{
            backgroundColor: 'var(--emr-secondary, #2b6cb0)',
            '&:hover': {
              backgroundColor: 'var(--emr-primary, #1a365d)',
            },
          }}
        >
          <IconChevronLeft size={20} />
        </ActionIcon>
      </Box>
    );
  }

  return (
    <Paper
      shadow="md"
      p="sm"
      style={{
        width: 320,
        height: '100%',
        position: 'relative',
        backgroundColor: 'var(--emr-gray-50, #f9fafb)',
        borderLeft: '2px solid var(--emr-secondary, #2b6cb0)',
        overflowY: 'auto',
      }}
    >
      {/* Toggle Button */}
      <ActionIcon
        variant="filled"
        size="sm"
        onClick={onToggle}
        style={{
          position: 'absolute',
          left: -12,
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 10,
          backgroundColor: 'var(--emr-secondary, #2b6cb0)',
        }}
        aria-label={t('sidebar.close')}
      >
        <IconChevronRight size={16} />
      </ActionIcon>

      <Stack gap="md">
        {/* Action Buttons Grid */}
        <SimpleGrid cols={2} spacing="xs">
          <Button
            leftSection={<IconCurrencyLari size={16} />}
            onClick={handlePayment}
            disabled={!selectedPatient}
            styles={{
              root: {
                background: 'var(--emr-gradient-primary, linear-gradient(135deg, #1a365d 0%, #2b6cb0 50%, #3182ce 100%))',
                '&:hover': {
                  background: 'var(--emr-gradient-secondary, linear-gradient(135deg, #2b6cb0 0%, #3182ce 50%, #63b3ed 100%))',
                },
                '&:disabled': {
                  background: 'var(--emr-gray-300, #d1d5db)',
                },
              },
            }}
          >
            {t('sidebar.payment')}
          </Button>
          <Button
            leftSection={<IconLogout size={16} />}
            onClick={handleCheckout}
            disabled={!selectedPatient}
            styles={{
              root: {
                background: 'var(--emr-gradient-primary, linear-gradient(135deg, #1a365d 0%, #2b6cb0 50%, #3182ce 100%))',
                '&:hover': {
                  background: 'var(--emr-gradient-secondary, linear-gradient(135deg, #2b6cb0 0%, #3182ce 50%, #63b3ed 100%))',
                },
                '&:disabled': {
                  background: 'var(--emr-gray-300, #d1d5db)',
                },
              },
            }}
          >
            {t('sidebar.checkout')}
          </Button>
          <Button
            leftSection={<IconTransfer size={16} />}
            onClick={handleTransfer}
            disabled={!selectedPatient}
            styles={{
              root: {
                background: 'var(--emr-gradient-primary, linear-gradient(135deg, #1a365d 0%, #2b6cb0 50%, #3182ce 100%))',
                '&:hover': {
                  background: 'var(--emr-gradient-secondary, linear-gradient(135deg, #2b6cb0 0%, #3182ce 50%, #63b3ed 100%))',
                },
                '&:disabled': {
                  background: 'var(--emr-gray-300, #d1d5db)',
                },
              },
            }}
          >
            {t('sidebar.transfer')}
          </Button>
          <Button
            leftSection={<IconFileInvoice size={16} />}
            onClick={handleInvoice}
            disabled={!selectedPatient}
            styles={{
              root: {
                background: 'var(--emr-gradient-primary, linear-gradient(135deg, #1a365d 0%, #2b6cb0 50%, #3182ce 100%))',
                '&:hover': {
                  background: 'var(--emr-gradient-secondary, linear-gradient(135deg, #2b6cb0 0%, #3182ce 50%, #63b3ed 100%))',
                },
                '&:disabled': {
                  background: 'var(--emr-gray-300, #d1d5db)',
                },
              },
            }}
          >
            {t('sidebar.invoice')}
          </Button>
        </SimpleGrid>

        <SimpleGrid cols={3} spacing="xs">
          <Button
            variant="outline"
            onClick={handleCalculation}
            disabled={!selectedPatient}
          >
            {t('sidebar.calculation')}
          </Button>
          <Button
            variant="outline"
            onClick={handleAnalyses}
            disabled={!selectedPatient}
          >
            {t('sidebar.analyses')}
          </Button>
          <Button
            variant="outline"
            onClick={handleSalaries}
            disabled={!selectedPatient}
          >
            {t('sidebar.salaries')}
          </Button>
        </SimpleGrid>

        {/* Patient Info */}
        <Box>
          <Text size="sm" fw={600} c="var(--emr-text-secondary, #6b7280)" mb={4}>
            {t('sidebar.selectedPatient')}
          </Text>
          {selectedPatient ? (
            <Text size="md" fw={700} c="var(--emr-secondary, #2b6cb0)">
              {selectedPatient.firstName} {selectedPatient.lastName}
            </Text>
          ) : (
            <Text size="sm" c="var(--emr-gray-400, #9ca3af)" fs="italic">
              {t('sidebar.noPatientSelected')}
            </Text>
          )}
        </Box>

        {/* Insurance Company Dropdown */}
        <EMRSelect
          label={t('sidebar.insuranceCompany')}
          placeholder={t('sidebar.selectInsurance')}
          data={insuranceOptions}
          value={selectedInsurance}
          onChange={(value) => setSelectedInsurance(value || '0')}
          searchable
          disabled={!selectedPatient}
        />

        {/* Service Entry Section */}
        <Box>
          <Text size="sm" fw={600} c="var(--emr-text-secondary, #6b7280)" mb={8}>
            {t('sidebar.addService')}
          </Text>

          <Stack gap="xs">
            <DateTimePicker
              label={t('sidebar.serviceDate')}
              value={serviceDate}
              onChange={(value) => setServiceDate(value as Date | null)}
              disabled={!selectedPatient}
              clearable={false}
            />

            <EMRTextInput
              label={t('sidebar.serviceName')}
              placeholder={t('sidebar.searchService')}
              value={serviceName}
              onChange={setServiceName}
              disabled={!selectedPatient}
            />

            <Group gap="xs" align="flex-end">
              <EMRNumberInput
                label={t('sidebar.quantity')}
                value={serviceQuantity}
                onChange={setServiceQuantity}
                min={1}
                max={999}
                disabled={!selectedPatient}
                style={{ flex: 1 }}
              />
              <Tooltip label={t('sidebar.addServiceButton')}>
                <ActionIcon
                  variant="filled"
                  size="lg"
                  onClick={handleAddService}
                  disabled={!selectedPatient || !serviceName.trim()}
                  style={{
                    backgroundColor: 'var(--emr-secondary, #2b6cb0)',
                  }}
                >
                  <IconPlus size={18} />
                </ActionIcon>
              </Tooltip>
            </Group>

            <EMRCheckbox
              label={t('sidebar.policyCheck')}
              checked={policyCheck}
              onChange={setPolicyCheck}
              disabled={!selectedPatient}
            />
          </Stack>
        </Box>

        {/* Services Table */}
        {services.length > 0 && (
          <Box>
            <Text size="sm" fw={600} c="dimmed" mb={4}>
              {t('sidebar.services')} ({services.length})
            </Text>
            <Table.ScrollContainer minWidth={200}>
              <Table striped highlightOnHover withTableBorder withColumnBorders>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>{t('sidebar.date')}</Table.Th>
                    <Table.Th>{t('sidebar.service')}</Table.Th>
                    <Table.Th>{t('sidebar.qty')}</Table.Th>
                    <Table.Th></Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {services.map((service) => (
                    <Table.Tr key={service.id}>
                      <Table.Td style={{ fontSize: '0.7rem' }}>{service.date}</Table.Td>
                      <Table.Td style={{ fontSize: '0.7rem' }}>{service.name}</Table.Td>
                      <Table.Td style={{ fontSize: '0.7rem' }}>{service.quantity}</Table.Td>
                      <Table.Td>
                        <ActionIcon
                          variant="subtle"
                          color="red"
                          onClick={() => handleRemoveService(service.id)}
                        >
                          <IconX size={12} />
                        </ActionIcon>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </Table.ScrollContainer>
          </Box>
        )}
      </Stack>
    </Paper>
  );
}
