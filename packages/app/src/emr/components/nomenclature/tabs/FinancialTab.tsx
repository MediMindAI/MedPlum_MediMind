// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { Paper, Text, Stack, Group, Select, NumberInput, Button, ActionIcon, Table, Grid, Title } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { IconPlus, IconEdit, IconTrash } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import type { ActivityDefinition } from '@medplum/fhirtypes';
import type { JSX } from 'react';
import { useState, useMemo, useEffect } from 'react';
import { useTranslation } from '../../../hooks/useTranslation';
import priceTypesData from '../../../translations/price-types.json';
import expenseCategoriesData from '../../../translations/expense-categories.json';
import roundingTypesData from '../../../translations/rounding-types.json';
import serviceUnitsData from '../../../translations/service-units.json';
import insuranceBenefitTypesData from '../../../translations/insurance-benefit-types.json';
import consultationTypesData from '../../../translations/consultation-types.json';
import primaryHealthcareServicesData from '../../../translations/primary-healthcare-services.json';
import financialServiceGroupsData from '../../../translations/financial-service-groups.json';
import careLevelsData from '../../../translations/care-levels.json';
import activePassiveTypesData from '../../../translations/active-passive-types.json';
import calculationTypesData from '../../../translations/calculation-types.json';
import paymentVisibilityTypesData from '../../../translations/payment-visibility-types.json';
import calculationCountingTypesData from '../../../translations/calculation-counting-types.json';
import paymentTypesData from '../../../translations/payment-types.json';
import labExecutionTypesData from '../../../translations/lab-execution-types.json';
import bloodComponentsData from '../../../translations/blood-components.json';
import waitForAnswerTypesData from '../../../translations/wait-for-answer-types.json';

interface FinancialTabProps {
  service: ActivityDefinition;
  onSave: (service: ActivityDefinition) => Promise<void>;
}

/**
 * Price entry interface matching FHIR extension structure
 */
interface PriceEntry {
  priceTypeId: string;
  effectiveDate: string; // ISO date string
  amount: {
    value: number;
    currency: 'GEL';
  };
}

/**
 * Calculation parameters interface
 */
interface CalculationParameters {
  rounding: string;
  unit: string;
  insuranceBenefitType: string;
  consultationType: string;
  careLevel: string;
  hideShowInHistory: string;
  calculationType: string;
  paymentVisibility: string;
  calculationCounting: string;
  paymentType: string;
}

/**
 * Supply/Material item interface
 */
interface SupplyItem {
  code: string;
  name: string;
  quantity: number;
}

/**
 * Medication/Item interface
 */
interface MedicationItem {
  code: string;
  name: string;
  quantity: number;
}

/**
 * Lab configuration interface
 */
interface LabConfiguration {
  labExecution: string;
  bloodComponent: string;
  waitForAnswer: string;
}

/**
 * Service date range interface
 */
interface ServiceDateRange {
  startDate: Date | null;
  endDate: Date | null;
}

/**
 * Insurance configuration interface
 */
interface InsuranceConfiguration {
  consultationType: string;
  primaryHealthcareService: string;
  serviceGroup: string;
  priceType: string;
}

/**
 * Medical settings interface
 */
interface MedicalSettings {
  careLevel: string;
  activePassiveType: string;
  labExecution: string;
  bloodComponent: string;
  waitForAnswer: string;
  standardValue: number | '';
  points: number | '';
  days: number | '';
}

/**
 * Admin settings interface
 */
interface AdminSettings {
  minQuantity: number | '';
  maxQuantity: number | '';
  percentage: number | '';
  limit: number | '';
  priority: number | '';
}

/**
 * Financial Tab - Insurance-based pricing configuration
 *
 * Features:
 * - Add/edit/delete price entries for different insurance companies
 * - Date-effective pricing
 * - Currency selection (GEL)
 * - Price history table
 * - Calculation parameters configuration
 * @param root0
 * @param root0.service
 * @param root0.onSave
 */
export function FinancialTab({ service, onSave }: FinancialTabProps): JSX.Element {
  const { t, lang } = useTranslation();
  const [saving, setSaving] = useState(false);

  // Extract existing prices from ActivityDefinition extension
  const existingPrices = useMemo(() => {
    const pricesExtension = service.extension?.find(
      (ext) => ext.url === 'http://medimind.ge/extensions/service-prices'
    );
    if (pricesExtension?.valueString) {
      try {
        return JSON.parse(pricesExtension.valueString) as PriceEntry[];
      } catch {
        return [];
      }
    }
    return [];
  }, [service]);

  // Extract expense materials category from ActivityDefinition extension
  const existingExpenseCategory = useMemo(() => {
    const expenseExtension = service.extension?.find(
      (ext) => ext.url === 'http://medimind.ge/extensions/expense-materials'
    );
    return expenseExtension?.valueString || '';
  }, [service]);

  // Extract calculation parameters from ActivityDefinition extension
  const existingCalculationParams = useMemo(() => {
    const calcExtension = service.extension?.find(
      (ext) => ext.url === 'http://medimind.ge/extensions/calculation-parameters'
    );
    if (calcExtension?.valueString) {
      try {
        return JSON.parse(calcExtension.valueString) as CalculationParameters;
      } catch {
        return null;
      }
    }
    return null;
  }, [service]);

  // State for price entries and form
  const [priceEntries, setPriceEntries] = useState<PriceEntry[]>(existingPrices);
  const [priceTypeId, setPriceTypeId] = useState<string | null>(null);
  const [effectiveDate, setEffectiveDate] = useState<Date | null>(null);
  const [priceAmount, setPriceAmount] = useState<number | string>('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  // State for expense materials category
  const [expenseCategory, setExpenseCategory] = useState<string | null>(existingExpenseCategory);

  // State for calculation parameters (10 fields)
  const [calcParams, setCalcParams] = useState<CalculationParameters>({
    rounding: existingCalculationParams?.rounding || '',
    unit: existingCalculationParams?.unit || '',
    insuranceBenefitType: existingCalculationParams?.insuranceBenefitType || '',
    consultationType: existingCalculationParams?.consultationType || '',
    careLevel: existingCalculationParams?.careLevel || '',
    hideShowInHistory: existingCalculationParams?.hideShowInHistory || '',
    calculationType: existingCalculationParams?.calculationType || '',
    paymentVisibility: existingCalculationParams?.paymentVisibility || '',
    calculationCounting: existingCalculationParams?.calculationCounting || '',
    paymentType: existingCalculationParams?.paymentType || '',
  });

  // Update calculation parameters when service changes
  useEffect(() => {
    if (existingCalculationParams) {
      setCalcParams(existingCalculationParams);
    }
  }, [existingCalculationParams]);

  // State for supplies/materials (Section 4)
  const [supplies, setSupplies] = useState<SupplyItem[]>([]);
  const [selectedSupply, setSelectedSupply] = useState<string | null>(null);
  const [supplyQuantity, setSupplyQuantity] = useState<number | ''>('');

  // State for medications/items (Section 5)
  const [medications, setMedications] = useState<MedicationItem[]>([]);
  const [selectedMedication, setSelectedMedication] = useState<string | null>(null);
  const [medicationQuantity, setMedicationQuantity] = useState<number | ''>('');

  // State for insurance configuration (Section 6)
  const [insuranceConfig, setInsuranceConfig] = useState<InsuranceConfiguration>({
    consultationType: '',
    primaryHealthcareService: '',
    serviceGroup: '',
    priceType: '',
  });

  // State for date range (Section 7)
  const [dateRange, setDateRange] = useState<ServiceDateRange>({
    startDate: null,
    endDate: null,
  });

  // State for medical settings (Section 8)
  const [medicalSettings, setMedicalSettings] = useState<MedicalSettings>({
    careLevel: '',
    activePassiveType: '',
    labExecution: '',
    bloodComponent: '',
    waitForAnswer: '',
    standardValue: '',
    points: '',
    days: '',
  });

  // State for admin settings (Section 9)
  const [adminSettings, setAdminSettings] = useState<AdminSettings>({
    minQuantity: '',
    maxQuantity: '',
    percentage: '',
    limit: '',
    priority: '',
  });

  // Price types are Georgian-only (hospital-specific data)
  const priceTypeOptions = priceTypesData;

  // Get price type label by value
  const getPriceTypeLabel = (value: string): string => {
    const option = priceTypeOptions.find((opt) => opt.value === value);
    return option?.label || value;
  };

  // Form validation
  const validateForm = (): boolean => {
    if (!priceTypeId || priceTypeId === '') {
      notifications.show({
        title: 'შეცდომა',
        message: 'გთხოვთ აირჩიოთ ფასის ტიპი',
        color: 'red',
      });
      return false;
    }
    if (!effectiveDate) {
      notifications.show({
        title: 'შეცდომა',
        message: 'გთხოვთ აირჩიოთ თარიღი',
        color: 'red',
      });
      return false;
    }
    if (!priceAmount || priceAmount === '' || Number(priceAmount) <= 0) {
      notifications.show({
        title: 'შეცდომა',
        message: 'გთხოვთ შეიყვანოთ ფასი',
        color: 'red',
      });
      return false;
    }
    return true;
  };

  // Clear form
  const clearForm = (): void => {
    setPriceTypeId(null);
    setEffectiveDate(null);
    setPriceAmount('');
    setEditingIndex(null);
  };

  // Handle add price
  const handleAddPrice = async (): Promise<void> => {
    if (!validateForm()) {return;}

    // Ensure effectiveDate is a proper Date object
    let dateString: string;
    if (effectiveDate instanceof Date) {
      dateString = effectiveDate.toISOString().split('T')[0];
    } else if (typeof effectiveDate === 'string') {
      // If it's a string, try to parse it
      const parsedDate = new Date(effectiveDate);
      if (isNaN(parsedDate.getTime())) {
        notifications.show({
          title: 'შეცდომა',
          message: 'არასწორი თარიღის ფორმატი',
          color: 'red',
        });
        return;
      }
      dateString = parsedDate.toISOString().split('T')[0];
    } else {
      // This shouldn't happen if validation is working, but handle it anyway
      notifications.show({
        title: 'შეცდომა',
        message: 'გთხოვთ აირჩიოთ თარიღი',
        color: 'red',
      });
      return;
    }

    const newEntry: PriceEntry = {
      priceTypeId: priceTypeId!,
      effectiveDate: dateString,
      amount: {
        value: Number(priceAmount),
        currency: 'GEL',
      },
    };

    let updatedPrices: PriceEntry[];
    if (editingIndex !== null) {
      // Update existing entry
      updatedPrices = [...priceEntries];
      updatedPrices[editingIndex] = newEntry;
    } else {
      // Add new entry
      updatedPrices = [...priceEntries, newEntry];
    }

    setPriceEntries(updatedPrices);
    await savePricesToService(updatedPrices);
    clearForm();
  };

  // Handle edit price
  const handleEditPrice = (index: number): void => {
    const entry = priceEntries[index];
    setPriceTypeId(entry.priceTypeId);
    setEffectiveDate(new Date(entry.effectiveDate));
    setPriceAmount(entry.amount.value);
    setEditingIndex(index);
  };

  // Handle delete price
  const handleDeletePrice = async (index: number): Promise<void> => {
    const updatedPrices = priceEntries.filter((_, i) => i !== index);
    setPriceEntries(updatedPrices);
    await savePricesToService(updatedPrices);

    notifications.show({
      title: 'წარმატება',
      message: 'ფასი წაიშალა',
      color: 'green',
    });
  };

  // Save prices to ActivityDefinition
  const savePricesToService = async (prices: PriceEntry[]): Promise<void> => {
    try {
      setSaving(true);

      // Update or create extension
      const updatedExtensions = service.extension?.filter(
        (ext) => ext.url !== 'http://medimind.ge/extensions/service-prices' &&
                ext.url !== 'http://medimind.ge/extensions/expense-materials' &&
                ext.url !== 'http://medimind.ge/extensions/calculation-parameters'
      ) || [];

      updatedExtensions.push({
        url: 'http://medimind.ge/extensions/service-prices',
        valueString: JSON.stringify(prices),
      });

      // Add expense category extension if set
      if (expenseCategory) {
        updatedExtensions.push({
          url: 'http://medimind.ge/extensions/expense-materials',
          valueString: expenseCategory,
        });
      }

      // Add calculation parameters extension
      updatedExtensions.push({
        url: 'http://medimind.ge/extensions/calculation-parameters',
        valueString: JSON.stringify(calcParams),
      });

      const updatedService: ActivityDefinition = {
        ...service,
        extension: updatedExtensions,
      };

      await onSave(updatedService);

      notifications.show({
        title: 'წარმატება',
        message: editingIndex !== null ? 'ფასი განახლდა' : 'ფასი დაემატა',
        color: 'green',
      });
    } catch (error) {
      notifications.show({
        title: 'შეცდომა',
        message: 'ფასის შენახვა ვერ მოხერხდა',
        color: 'red',
      });
      console.error('Error saving prices:', error);
    } finally {
      setSaving(false);
    }
  };

  // Save expense category to ActivityDefinition
  const saveExpenseCategory = async (): Promise<void> => {
    try {
      setSaving(true);

      // Update or create extension
      const updatedExtensions = service.extension?.filter(
        (ext) => ext.url !== 'http://medimind.ge/extensions/expense-materials' &&
                ext.url !== 'http://medimind.ge/extensions/calculation-parameters'
      ) || [];

      if (expenseCategory) {
        updatedExtensions.push({
          url: 'http://medimind.ge/extensions/expense-materials',
          valueString: expenseCategory,
        });
      }

      // Add calculation parameters extension
      updatedExtensions.push({
        url: 'http://medimind.ge/extensions/calculation-parameters',
        valueString: JSON.stringify(calcParams),
      });

      const updatedService: ActivityDefinition = {
        ...service,
        extension: updatedExtensions,
      };

      await onSave(updatedService);

      notifications.show({
        title: 'წარმატება',
        message: 'სახარჯი მასალების კატეგორია შენახულია',
        color: 'green',
      });
    } catch (error) {
      notifications.show({
        title: 'შეცდომა',
        message: 'კატეგორიის შენახვა ვერ მოხერხდა',
        color: 'red',
      });
      console.error('Error saving expense category:', error);
    } finally {
      setSaving(false);
    }
  };

  // Save calculation parameters to ActivityDefinition
  const saveCalculationParameters = async (): Promise<void> => {
    try {
      setSaving(true);

      // Update or create extension
      const updatedExtensions = service.extension?.filter(
        (ext) => ext.url !== 'http://medimind.ge/extensions/calculation-parameters'
      ) || [];

      updatedExtensions.push({
        url: 'http://medimind.ge/extensions/calculation-parameters',
        valueString: JSON.stringify(calcParams),
      });

      const updatedService: ActivityDefinition = {
        ...service,
        extension: updatedExtensions,
      };

      await onSave(updatedService);

      notifications.show({
        title: 'წარმატება',
        message: 'კალკულაციის პარამეტრები შენახულია',
        color: 'green',
      });
    } catch (error) {
      notifications.show({
        title: 'შეცდომა',
        message: 'პარამეტრების შენახვა ვერ მოხერხდა',
        color: 'red',
      });
      console.error('Error saving calculation parameters:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Stack gap="md">
      {/* Header Section */}
      <Paper p="md" style={{ backgroundColor: '#f8f9fa' }}>
        <Text fw={600} mb="sm">
          {t('registeredServices.financial.title')}
        </Text>
        <Text size="sm" c="dimmed">
          {t('registeredServices.financial.description')}
        </Text>
      </Paper>

      {/* Section 1: Add Price Form */}
      <Paper p="md" withBorder>
        <Text fw={600} mb="md">
          {editingIndex !== null
            ? t('registeredServices.financial.editPrice')
            : t('registeredServices.financial.addPrice')}
        </Text>
        <Group grow>
          <Select
            label={t('registeredServices.financial.priceType')}
            placeholder={t('registeredServices.financial.selectInsurance')}
            data={priceTypeOptions}
            value={priceTypeId}
            onChange={setPriceTypeId}
            searchable
            clearable
            required
          />
          <Select
            label={t('registeredServices.financial.currency')}
            value="GEL"
            data={[{ value: 'GEL', label: 'GEL' }]}
            readOnly
          />
        </Group>
        <Group grow mt="md">
          <DatePickerInput
            label={t('registeredServices.financial.effectiveDate')}
            placeholder="აირჩიეთ თარიღი"
            valueFormat="DD/MM/YYYY"
            value={effectiveDate}
            onChange={setEffectiveDate}
            clearable
            required
          />
          <NumberInput
            label={t('registeredServices.financial.price')}
            placeholder="0.00"
            value={priceAmount}
            onChange={setPriceAmount}
            min={0}
            decimalScale={2}
            fixedDecimalScale
            required
          />
        </Group>
        <Group justify="flex-end" mt="md" gap="sm">
          {editingIndex !== null && (
            <Button variant="subtle" onClick={clearForm}>
              {t('registeredServices.financial.cancel')}
            </Button>
          )}
          <Button
            leftSection={editingIndex !== null ? <IconEdit size={16} /> : <IconPlus size={16} />}
            style={{ background: 'var(--emr-gradient-submenu)' }}
            onClick={handleAddPrice}
            loading={saving}
          >
            {editingIndex !== null
              ? t('registeredServices.financial.update')
              : t('registeredServices.financial.add')}
          </Button>
        </Group>
      </Paper>

      {/* Section 2: Price History Table */}
      <Paper p="md" withBorder>
        <Text fw={600} mb="md">
          {t('registeredServices.financial.priceHistory')}
        </Text>
        <Table
          style={{
            borderCollapse: 'separate',
            borderSpacing: 0,
          }}
        >
          <Table.Thead
            style={{
              background: 'var(--emr-gradient-submenu)',
            }}
          >
            <Table.Tr>
              <Table.Th style={{ color: 'white', padding: '12px 16px' }}>
                {t('registeredServices.financial.table.priceType')}
              </Table.Th>
              <Table.Th style={{ color: 'white', padding: '12px 16px' }}>
                {t('registeredServices.financial.table.date')}
              </Table.Th>
              <Table.Th style={{ color: 'white', padding: '12px 16px' }}>
                {t('registeredServices.financial.table.price')}
              </Table.Th>
              <Table.Th style={{ color: 'white', padding: '12px 16px' }}>
                {t('registeredServices.financial.table.currency')}
              </Table.Th>
              <Table.Th style={{ color: 'white', padding: '12px 16px', textAlign: 'center' }}>
                {t('registeredServices.financial.table.actions')}
              </Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {priceEntries.length === 0 ? (
              <Table.Tr>
                <Table.Td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                  {t('registeredServices.financial.table.empty')}
                </Table.Td>
              </Table.Tr>
            ) : (
              priceEntries.map((entry, index) => (
                <Table.Tr key={index}>
                  <Table.Td style={{ padding: '12px 16px' }}>{getPriceTypeLabel(entry.priceTypeId)}</Table.Td>
                  <Table.Td style={{ padding: '12px 16px' }}>
                    {new Date(entry.effectiveDate).toLocaleDateString('ka-GE', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                    })}
                  </Table.Td>
                  <Table.Td style={{ padding: '12px 16px' }}>{entry.amount.value.toFixed(2)}</Table.Td>
                  <Table.Td style={{ padding: '12px 16px' }}>{entry.amount.currency}</Table.Td>
                  <Table.Td style={{ padding: '12px 16px', textAlign: 'center' }}>
                    <Group gap="xs" justify="center">
                      <ActionIcon
                        variant="subtle"
                        color="blue"
                        onClick={() => handleEditPrice(index)}
                        title="რედაქტირება"
                      >
                        <IconEdit size={16} />
                      </ActionIcon>
                      <ActionIcon
                        variant="subtle"
                        color="red"
                        onClick={() => handleDeletePrice(index)}
                        title="წაშლა"
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

      {/* Section 2: Expense Materials */}
      <Paper p="md" withBorder>
        <Paper p="md" style={{ backgroundColor: '#f8f9fa' }} mb="md">
          <Text fw={600} mb="xs">
            სახარჯი მასალები
          </Text>
          <Text size="sm" c="dimmed">
            აირჩიეთ სერვისის სახარჯი მასალების კატეგორია ხარჯების დასათვლელად
          </Text>
        </Paper>

        <Group align="flex-end" gap="md">
          <Select
            label="კატეგორია"
            placeholder="აირჩიეთ კატეგორია"
            data={expenseCategoriesData}
            value={expenseCategory}
            onChange={setExpenseCategory}
            style={{ flex: 1 }}
            clearable
          />
          <Button
            leftSection={<IconPlus size={16} />}
            style={{ background: 'var(--emr-gradient-submenu)' }}
            onClick={saveExpenseCategory}
            loading={saving}
            disabled={!expenseCategory}
          >
            შენახვა
          </Button>
        </Group>

        {expenseCategory && (
          <Text size="sm" c="dimmed" mt="md">
            არჩეული კატეგორია: <Text span fw={600}>{expenseCategoriesData.find(c => c.value === expenseCategory)?.label}</Text>
          </Text>
        )}
      </Paper>

      {/* Section 3: Calculation Parameters */}
      <Paper p="md" withBorder>
        <Paper p="sm" mb="md" style={{ backgroundColor: '#f8f9fa' }}>
          <Text fw={600}>კალკულაციის პარამეტრები</Text>
        </Paper>

        <Grid gutter="md">
          {/* Row 1 */}
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Select
              label="დამრგვალება"
              placeholder="აირჩიეთ დამრგვალება"
              data={roundingTypesData}
              value={calcParams.rounding}
              onChange={(value) => setCalcParams({ ...calcParams, rounding: value || '' })}
              clearable
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Select
              label="ერთეული"
              placeholder="აირჩიეთ ერთეული"
              data={serviceUnitsData}
              value={calcParams.unit}
              onChange={(value) => setCalcParams({ ...calcParams, unit: value || '' })}
              searchable
              clearable
            />
          </Grid.Col>

          {/* Row 2 */}
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Select
              label="დაზღვევის ტიპი"
              placeholder="აირჩიეთ დაზღვევის ტიპი"
              data={insuranceBenefitTypesData}
              value={calcParams.insuranceBenefitType}
              onChange={(value) => setCalcParams({ ...calcParams, insuranceBenefitType: value || '' })}
              searchable
              clearable
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Select
              label="კონსულტაციის ტიპი"
              placeholder="აირჩიეთ კონსულტაციის ტიპი"
              data={consultationTypesData}
              value={calcParams.consultationType}
              onChange={(value) => setCalcParams({ ...calcParams, consultationType: value || '' })}
              searchable
              clearable
            />
          </Grid.Col>

          {/* Row 3 */}
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Select
              label="Care level"
              placeholder="აირჩიეთ care level"
              data={careLevelsData}
              value={calcParams.careLevel}
              onChange={(value) => setCalcParams({ ...calcParams, careLevel: value || '' })}
              clearable
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Select
              label="დამალვა/გამოჩენა პაციენტის ისტორიაში"
              placeholder="აირჩიეთ სტატუსი"
              data={activePassiveTypesData}
              value={calcParams.hideShowInHistory}
              onChange={(value) => setCalcParams({ ...calcParams, hideShowInHistory: value || '' })}
              clearable
            />
          </Grid.Col>

          {/* Row 4 */}
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Select
              label="კალკულაციის ტიპი"
              placeholder="აირჩიეთ კალკულაციის ტიპი"
              data={calculationTypesData}
              value={calcParams.calculationType}
              onChange={(value) => setCalcParams({ ...calcParams, calculationType: value || '' })}
              clearable
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Select
              label="გადახდაში/კალკულაციაში გამოჩნდეს"
              placeholder="აირჩიეთ ხილვადობა"
              data={paymentVisibilityTypesData}
              value={calcParams.paymentVisibility}
              onChange={(value) => setCalcParams({ ...calcParams, paymentVisibility: value || '' })}
              clearable
            />
          </Grid.Col>

          {/* Row 5 */}
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Select
              label="კალკულაციის დათვლა"
              placeholder="აირჩიეთ დათვლის ტიპი"
              data={calculationCountingTypesData}
              value={calcParams.calculationCounting}
              onChange={(value) => setCalcParams({ ...calcParams, calculationCounting: value || '' })}
              clearable
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Select
              label="გადახდის ტიპი"
              placeholder="აირჩიეთ გადახდის ტიპი"
              data={paymentTypesData}
              value={calcParams.paymentType}
              onChange={(value) => setCalcParams({ ...calcParams, paymentType: value || '' })}
              clearable
            />
          </Grid.Col>
        </Grid>

        <Group justify="flex-end" mt="md">
          <Button
            style={{ background: 'var(--emr-gradient-submenu)' }}
            onClick={saveCalculationParameters}
            loading={saving}
          >
            შენახვა
          </Button>
        </Group>
      </Paper>

      {/* Section 4: Supplies/Materials Addition */}
      <Paper shadow="sm" p="md" withBorder>
        <Title order={5} mb="md" style={{ color: 'var(--emr-secondary)' }}>
          მასალების დამატება
        </Title>

        <Grid>
          <Grid.Col span={{ base: 12, md: 8 }}>
            <Select
              label="მასალა"
              placeholder="აირჩიეთ მასალა"
              data={[]} // TODO: Load from nomenclature materials
              searchable
              clearable
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 2 }}>
            <NumberInput
              label="რაოდენობა"
              placeholder="0"
              min={0}
              step={1}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 2 }}>
            <Button
              fullWidth
              mt="xl"
              style={{ background: 'var(--emr-gradient-submenu)' }}
              leftSection={<IconPlus size={16} />}
            >
              დამატება
            </Button>
          </Grid.Col>
        </Grid>

        {/* Materials Table */}
        <Table striped highlightOnHover mt="md">
          <Table.Thead style={{ background: 'var(--emr-gradient-submenu)' }}>
            <Table.Tr>
              <Table.Th style={{ color: 'white' }}>მასალა</Table.Th>
              <Table.Th style={{ color: 'white' }}>რაოდენობა</Table.Th>
              <Table.Th style={{ color: 'white', textAlign: 'center' }}>მოქმედება</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            <Table.Tr>
              <Table.Td colSpan={3} style={{ textAlign: 'center', color: '#666' }}>
                მასალები არ არის დამატებული
              </Table.Td>
            </Table.Tr>
          </Table.Tbody>
        </Table>
      </Paper>

      {/* Section 5: Medications/Items Addition */}
      <Paper shadow="sm" p="md" withBorder>
        <Title order={5} mb="md" style={{ color: 'var(--emr-secondary)' }}>
          მედიკამენტების/საგნების დამატება
        </Title>

        <Grid>
          <Grid.Col span={{ base: 12, md: 8 }}>
            <Select
              label="მედიკამენტი/საგანი"
              placeholder="აირჩიეთ მედიკამენტი ან საგანი"
              data={[]} // TODO: Load from nomenclature medications/items
              searchable
              clearable
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 2 }}>
            <NumberInput
              label="რაოდენობა"
              placeholder="0"
              min={0}
              step={1}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 2 }}>
            <Button
              fullWidth
              mt="xl"
              style={{ background: 'var(--emr-gradient-submenu)' }}
              leftSection={<IconPlus size={16} />}
            >
              დამატება
            </Button>
          </Grid.Col>
        </Grid>

        {/* Medications/Items Table */}
        <Table striped highlightOnHover mt="md">
          <Table.Thead style={{ background: 'var(--emr-gradient-submenu)' }}>
            <Table.Tr>
              <Table.Th style={{ color: 'white' }}>მედიკამენტი/საგანი</Table.Th>
              <Table.Th style={{ color: 'white' }}>რაოდენობა</Table.Th>
              <Table.Th style={{ color: 'white', textAlign: 'center' }}>მოქმედება</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            <Table.Tr>
              <Table.Td colSpan={3} style={{ textAlign: 'center', color: '#666' }}>
                მედიკამენტები/საგნები არ არის დამატებული
              </Table.Td>
            </Table.Tr>
          </Table.Tbody>
        </Table>
      </Paper>

      {/* Section 6: Insurance Configuration */}
      <Paper shadow="sm" p="md" withBorder>
        <Title order={5} mb="md" style={{ color: 'var(--emr-secondary)' }}>
          დაზღვევის კონფიგურაცია
        </Title>

        <Grid>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Select
              label="კონსულტაციის ტიპი"
              placeholder="აირჩიეთ კონსულტაციის ტიპი"
              data={consultationTypesData}
              value={insuranceConfig.consultationType}
              onChange={(value) => setInsuranceConfig({ ...insuranceConfig, consultationType: value || '' })}
              searchable
              clearable
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Select
              label="პირველადი ჯანდაცვის სერვისი"
              placeholder="აირჩიეთ სერვისი"
              data={primaryHealthcareServicesData}
              value={insuranceConfig.primaryHealthcareService}
              onChange={(value) => setInsuranceConfig({ ...insuranceConfig, primaryHealthcareService: value || '' })}
              searchable
              clearable
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Select
              label="სერვისის ჯგუფი"
              placeholder="აირჩიეთ ჯგუფი"
              data={financialServiceGroupsData}
              value={insuranceConfig.serviceGroup}
              onChange={(value) => setInsuranceConfig({ ...insuranceConfig, serviceGroup: value || '' })}
              searchable
              clearable
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Select
              label="ფასის ტიპი"
              placeholder="აირჩიეთ ფასის ტიპი"
              data={priceTypesData}
              value={insuranceConfig.priceType}
              onChange={(value) => setInsuranceConfig({ ...insuranceConfig, priceType: value || '' })}
              searchable
              clearable
            />
          </Grid.Col>
        </Grid>

        <Group justify="flex-end" mt="md">
          <Button
            style={{ background: 'var(--emr-gradient-submenu)' }}
            loading={saving}
          >
            შენახვა
          </Button>
        </Group>
      </Paper>

      {/* Section 7: Service Date Range */}
      <Paper shadow="sm" p="md" withBorder>
        <Title order={5} mb="md" style={{ color: 'var(--emr-secondary)' }}>
          სერვისის თარიღების დიაპაზონი
        </Title>

        <Grid>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <DatePickerInput
              label="დაწყების თარიღი"
              placeholder="აირჩიეთ თარიღი"
              value={dateRange.startDate}
              onChange={(date) => setDateRange({ ...dateRange, startDate: date })}
              clearable
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <DatePickerInput
              label="დასრულების თარიღი"
              placeholder="აირჩიეთ თარიღი"
              value={dateRange.endDate}
              onChange={(date) => setDateRange({ ...dateRange, endDate: date })}
              clearable
            />
          </Grid.Col>
        </Grid>

        <Group justify="flex-end" mt="md">
          <Button
            style={{ background: 'var(--emr-gradient-submenu)' }}
            loading={saving}
          >
            შენახვა
          </Button>
        </Group>
      </Paper>

      {/* Section 8: Medical Settings */}
      <Paper shadow="sm" p="md" withBorder>
        <Title order={5} mb="md" style={{ color: 'var(--emr-secondary)' }}>
          სამედიცინო პარამეტრები
        </Title>

        <Grid>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Select
              label="მომსახურების დონე"
              placeholder="აირჩიეთ დონე"
              data={careLevelsData}
              value={medicalSettings.careLevel}
              onChange={(value) => setMedicalSettings({ ...medicalSettings, careLevel: value || '' })}
              searchable
              clearable
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Select
              label="აქტიური/პასიური"
              placeholder="აირჩიეთ ტიპი"
              data={activePassiveTypesData}
              value={medicalSettings.activePassiveType}
              onChange={(value) => setMedicalSettings({ ...medicalSettings, activePassiveType: value || '' })}
              searchable
              clearable
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Select
              label="ლაბორატორიული შესრულება"
              placeholder="აირჩიეთ შესრულების ტიპი"
              data={labExecutionTypesData}
              value={medicalSettings.labExecution}
              onChange={(value) => setMedicalSettings({ ...medicalSettings, labExecution: value || '' })}
              searchable
              clearable
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Select
              label="სისხლის კომპონენტი"
              placeholder="აირჩიეთ კომპონენტი"
              data={bloodComponentsData}
              value={medicalSettings.bloodComponent}
              onChange={(value) => setMedicalSettings({ ...medicalSettings, bloodComponent: value || '' })}
              searchable
              clearable
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Select
              label="პასუხის მოლოდინი"
              placeholder="აირჩიეთ მოლოდინის ტიპი"
              data={waitForAnswerTypesData}
              value={medicalSettings.waitForAnswer}
              onChange={(value) => setMedicalSettings({ ...medicalSettings, waitForAnswer: value || '' })}
              searchable
              clearable
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <NumberInput
              label="სტანდარტული მნიშვნელობა"
              placeholder="0"
              min={0}
              step={0.01}
              decimalScale={2}
              value={medicalSettings.standardValue}
              onChange={(value) => setMedicalSettings({ ...medicalSettings, standardValue: value || '' })}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <NumberInput
              label="ქულები"
              placeholder="0"
              min={0}
              step={1}
              value={medicalSettings.points}
              onChange={(value) => setMedicalSettings({ ...medicalSettings, points: value || '' })}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <NumberInput
              label="დღეები"
              placeholder="0"
              min={0}
              step={1}
              value={medicalSettings.days}
              onChange={(value) => setMedicalSettings({ ...medicalSettings, days: value || '' })}
            />
          </Grid.Col>
        </Grid>

        <Group justify="flex-end" mt="md">
          <Button
            style={{ background: 'var(--emr-gradient-submenu)' }}
            loading={saving}
          >
            შენახვა
          </Button>
        </Group>
      </Paper>

      {/* Section 9: Admin Settings */}
      <Paper shadow="sm" p="md" withBorder>
        <Title order={5} mb="md" style={{ color: 'var(--emr-secondary)' }}>
          ადმინისტრაციული პარამეტრები
        </Title>

        <Grid>
          <Grid.Col span={{ base: 12, md: 4 }}>
            <NumberInput
              label="მინიმალური რაოდენობა"
              placeholder="0"
              min={0}
              step={1}
              value={adminSettings.minQuantity}
              onChange={(value) => setAdminSettings({ ...adminSettings, minQuantity: value || '' })}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 4 }}>
            <NumberInput
              label="მაქსიმალური რაოდენობა"
              placeholder="0"
              min={0}
              step={1}
              value={adminSettings.maxQuantity}
              onChange={(value) => setAdminSettings({ ...adminSettings, maxQuantity: value || '' })}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 4 }}>
            <NumberInput
              label="პროცენტი"
              placeholder="0"
              min={0}
              max={100}
              step={0.01}
              decimalScale={2}
              suffix="%"
              value={adminSettings.percentage}
              onChange={(value) => setAdminSettings({ ...adminSettings, percentage: value || '' })}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <NumberInput
              label="ლიმიტი"
              placeholder="0"
              min={0}
              step={1}
              value={adminSettings.limit}
              onChange={(value) => setAdminSettings({ ...adminSettings, limit: value || '' })}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <NumberInput
              label="პრიორიტეტი"
              placeholder="0"
              min={0}
              step={1}
              value={adminSettings.priority}
              onChange={(value) => setAdminSettings({ ...adminSettings, priority: value || '' })}
            />
          </Grid.Col>
          <Grid.Col span={12}>
            <Text size="sm" c="dimmed" mt="md">
              დამატებითი ველები დაემატება მოთხოვნის შესაბამისად
            </Text>
          </Grid.Col>
        </Grid>

        <Group justify="flex-end" mt="md">
          <Button
            style={{ background: 'var(--emr-gradient-submenu)' }}
            loading={saving}
          >
            შენახვა
          </Button>
        </Group>
      </Paper>
    </Stack>
  );
}
