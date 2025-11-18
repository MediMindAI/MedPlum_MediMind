// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { Grid, TextInput, Button, Box } from '@mantine/core';
import { useMedplum } from '@medplum/react-hooks';
import { ActivityDefinition } from '@medplum/fhirtypes';
import { notifications } from '@mantine/notifications';
import { IconCheck, IconPlus } from '@tabler/icons-react';
import { useTranslation } from '../../hooks/useTranslation';
import { useServiceForm } from '../../hooks/useServiceForm';
import ServiceGroupSelect from './ServiceGroupSelect';
import { ServiceSubgroupSelect } from './ServiceSubgroupSelect';
import ServiceTypeSelect from './ServiceTypeSelect';
import ServiceCategorySelect from './ServiceCategorySelect';
import { NOMENCLATURE_EXTENSION_URLS, NOMENCLATURE_IDENTIFIER_SYSTEMS } from '../../types/nomenclature';

interface ServiceEntryFormProps {
  /** Callback when service is successfully created/updated */
  onSuccess?: (service: ActivityDefinition) => void;

  /** Service to edit (optional) */
  serviceToEdit?: ActivityDefinition;

  /** Edit mode flag */
  isEditMode?: boolean;
}

/**
 * Inline service entry form for quick add/edit of medical services
 *
 * Displays a single row with all required fields for service entry:
 * - Code (15%)
 * - Name (30%)
 * - Group (15%)
 * - Subgroup (15%)
 * - Type (10%)
 * - Service Category (10%)
 * - Add/Save button (5%)
 *
 * Uses mobile-first responsive design with Grid/Grid.Col layout.
 */
export function ServiceEntryForm({ onSuccess, serviceToEdit, isEditMode = false }: ServiceEntryFormProps) {
  const { t } = useTranslation();
  const medplum = useMedplum();
  const { form, clearForm } = useServiceForm();

  /**
   * Handle form submission - create or update service
   */
  const handleSubmit = async (values: typeof form.values) => {
    try {
      // Build ActivityDefinition resource
      const activity: ActivityDefinition = {
        resourceType: 'ActivityDefinition',
        id: serviceToEdit?.id,
        status: values.status || 'active',
        title: values.name,
        name: values.name,
        identifier: [
          {
            system: NOMENCLATURE_IDENTIFIER_SYSTEMS.SERVICE_CODE,
            value: values.code,
          },
        ],
        topic: [
          {
            coding: [
              {
                code: values.group,
                display: values.group,
              },
            ],
          },
        ],
        extension: [
          // Subgroup extension
          values.subgroup && {
            url: NOMENCLATURE_EXTENSION_URLS.SUBGROUP,
            valueString: values.subgroup,
          },
          // Service type extension
          {
            url: NOMENCLATURE_EXTENSION_URLS.SERVICE_TYPE,
            valueString: values.type,
          },
          // Service category extension
          {
            url: NOMENCLATURE_EXTENSION_URLS.SERVICE_CATEGORY,
            valueString: values.serviceCategory,
          },
          // Price extension (optional)
          values.price !== undefined && {
            url: NOMENCLATURE_EXTENSION_URLS.BASE_PRICE,
            valueDecimal: values.price,
          },
          // Total amount extension (optional)
          values.totalAmount !== undefined && {
            url: NOMENCLATURE_EXTENSION_URLS.TOTAL_AMOUNT,
            valueDecimal: values.totalAmount,
          },
          // CalHed extension (optional)
          values.calHed !== undefined && {
            url: NOMENCLATURE_EXTENSION_URLS.CAL_HED,
            valueInteger: values.calHed,
          },
          // Printable extension
          {
            url: NOMENCLATURE_EXTENSION_URLS.PRINTABLE,
            valueBoolean: values.printable || false,
          },
          // ItemGetPrice extension (optional)
          values.itemGetPrice !== undefined && {
            url: NOMENCLATURE_EXTENSION_URLS.ITEM_GET_PRICE,
            valueDecimal: values.itemGetPrice,
          },
          // Departments extension (optional)
          values.departments && values.departments.length > 0 && {
            url: NOMENCLATURE_EXTENSION_URLS.ASSIGNED_DEPARTMENTS,
            valueString: JSON.stringify(values.departments),
          },
        ].filter(Boolean) as any,
      };

      // Create or update service
      let savedService: ActivityDefinition;
      if (isEditMode && serviceToEdit?.id) {
        savedService = await medplum.updateResource(activity);
        notifications.show({
          title: t('nomenclature.success.title') || 'Success',
          message: t('nomenclature.success.serviceUpdated') || 'Service updated successfully',
          color: 'green',
          icon: <IconCheck size={18} />,
        });
      } else {
        savedService = await medplum.createResource(activity);
        notifications.show({
          title: t('nomenclature.success.title') || 'Success',
          message: t('nomenclature.success.serviceCreated') || 'Service created successfully',
          color: 'green',
          icon: <IconCheck size={18} />,
        });
      }

      // Clear form after successful add (not edit)
      if (!isEditMode) {
        clearForm();
      }

      // Call success callback
      onSuccess?.(savedService);
    } catch (error) {
      console.error('Error saving service:', error);
      notifications.show({
        title: t('nomenclature.error.title') || 'Error',
        message:
          isEditMode
            ? t('nomenclature.error.updateFailed') || 'Failed to update service'
            : t('nomenclature.error.createFailed') || 'Failed to create service',
        color: 'red',
      });
    }
  };

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Box
        style={{
          padding: '12px 16px',
          backgroundColor: 'var(--emr-background-light, #f8f9fa)',
          borderRadius: '8px',
          border: '1px solid var(--emr-border-color, #e0e0e0)',
        }}
      >
        <Grid align="flex-end" gutter="md">
          {/* Code - 15% width on desktop, full width on mobile */}
          <Grid.Col span={{ base: 12, sm: 6, md: 2 }}>
            <TextInput
              label={t('nomenclature.field.code') || 'Code'}
              placeholder={t('nomenclature.field.codePlaceholder') || 'Service code'}
              required
              size="md"
              styles={{ input: { minHeight: '44px' } }}
              {...form.getInputProps('code')}
            />
          </Grid.Col>

          {/* Name - 30% width on desktop, full width on mobile */}
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <TextInput
              label={t('nomenclature.field.name') || 'Name'}
              placeholder={t('nomenclature.field.namePlaceholder') || 'Service name'}
              required
              size="md"
              styles={{ input: { minHeight: '44px' } }}
              {...form.getInputProps('name')}
            />
          </Grid.Col>

          {/* Group - 15% width on desktop, half width on tablet, full on mobile */}
          <Grid.Col span={{ base: 12, sm: 6, md: 2 }}>
            <ServiceGroupSelect
              value={form.values.group}
              onChange={(value: string | null) => form.setFieldValue('group', value || '')}
              error={form.errors.group as string | undefined}
              required
            />
          </Grid.Col>

          {/* Subgroup - 15% width on desktop, half width on tablet, full on mobile */}
          <Grid.Col span={{ base: 12, sm: 6, md: 2 }}>
            <ServiceSubgroupSelect
              value={form.values.subgroup || ''}
              onChange={(value: string | null) => form.setFieldValue('subgroup', value || undefined)}
              error={form.errors.subgroup as string | undefined}
            />
          </Grid.Col>

          {/* Type - 10% width on desktop, half width on tablet, full on mobile */}
          <Grid.Col span={{ base: 12, sm: 6, md: 1.5 }}>
            <ServiceTypeSelect
              value={form.values.type}
              onChange={(value: string | null) => form.setFieldValue('type', value || '')}
              error={form.errors.type as string | undefined}
              required
            />
          </Grid.Col>

          {/* Service Category - 10% width on desktop, half width on tablet, full on mobile */}
          <Grid.Col span={{ base: 12, sm: 6, md: 1.5 }}>
            <ServiceCategorySelect
              value={form.values.serviceCategory}
              onChange={(value: string | null) => form.setFieldValue('serviceCategory', value || '')}
              error={form.errors.serviceCategory as string | undefined}
              required
            />
          </Grid.Col>

          {/* Add/Save Button - Full width on mobile, auto width on desktop */}
          <Grid.Col span={{ base: 12, md: 'auto' }}>
            <Button
              type="submit"
              size="md"
              fullWidth
              leftSection={isEditMode ? <IconCheck size={18} /> : <IconPlus size={18} />}
              style={{
                minHeight: '44px',
                background: 'var(--emr-gradient-primary)',
                border: 'none',
              }}
              styles={{
                root: {
                  '&:hover': {
                    background: 'var(--emr-gradient-primary)',
                    opacity: 0.9,
                  },
                },
              }}
            >
              {isEditMode
                ? t('nomenclature.action.save') || 'Save'
                : t('nomenclature.action.add') || 'Add'}
            </Button>
          </Grid.Col>
        </Grid>
      </Box>
    </form>
  );
}
