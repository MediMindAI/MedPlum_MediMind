// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { useState } from 'react';
import { useForm } from '@mantine/form';
import type { ActivityDefinition } from '@medplum/fhirtypes';
import type { ServiceFormValues } from '../types/nomenclature';
import { NOMENCLATURE_EXTENSION_URLS, NOMENCLATURE_IDENTIFIER_SYSTEMS } from '../types/nomenclature';

/**
 * Hook for managing service form state (add/edit mode)
 *
 * Provides form state management for creating and editing medical services
 * using Mantine's useForm hook with validation rules.
 *
 * Usage:
 * ```typescript
 * const {
 *   form,
 *   isEditMode,
 *   setEditMode,
 *   loadServiceData,
 *   clearForm
 * } = useServiceForm();
 * ```
 *
 * @returns Form state and control methods
 */
export function useServiceForm() {
  const [isEditMode, setIsEditMode] = useState(false);

  /**
   * Initial form values matching ServiceFormValues interface
   */
  const initialValues: ServiceFormValues = {
    code: '',
    name: '',
    group: '',
    subgroup: '',
    type: '',
    serviceCategory: '',
    price: undefined,
    totalAmount: undefined,
    calHed: undefined,
    printable: false,
    itemGetPrice: undefined,
    departments: [],
    status: 'active',
  };

  /**
   * Form validation rules
   */
  const validate = {
    code: (value: string) => {
      if (!value || value.trim() === '') {
        return 'Service code is required';
      }
      return null;
    },
    name: (value: string) => {
      if (!value || value.trim() === '') {
        return 'Service name is required';
      }
      return null;
    },
    group: (value: string) => {
      if (!value || value.trim() === '') {
        return 'Service group must be selected';
      }
      return null;
    },
    type: (value: string) => {
      if (!value || value.trim() === '') {
        return 'Service type must be selected';
      }
      return null;
    },
    serviceCategory: (value: string) => {
      if (!value || value.trim() === '') {
        return 'Service category must be selected';
      }
      return null;
    },
    price: (value: number | undefined) => {
      if (value !== undefined && value < 0) {
        return 'Price must be a positive number';
      }
      return null;
    },
    totalAmount: (value: number | undefined) => {
      if (value !== undefined && value < 0) {
        return 'Total amount must be a positive number';
      }
      return null;
    },
    calHed: (value: number | undefined) => {
      if (value !== undefined && value < 0) {
        return 'Calculator header must be a positive number';
      }
      return null;
    },
    itemGetPrice: (value: number | undefined) => {
      if (value !== undefined && value < 0) {
        return 'Item get price must be a positive number';
      }
      return null;
    },
  };

  /**
   * Mantine form instance
   */
  const form = useForm<ServiceFormValues>({
    initialValues,
    validate,
  });

  /**
   * Set form mode (add or edit)
   *
   * @param mode - true for edit mode, false for add mode
   */
  const setEditModeHandler = (mode: boolean): void => {
    setIsEditMode(mode);
    if (!mode) {
      // When switching to add mode, clear the form
      form.reset();
    }
  };

  /**
   * Load ActivityDefinition data into form for editing
   *
   * Extracts FHIR ActivityDefinition fields and maps them to form values.
   * Helper function to safely get extension values.
   * @param activity
   * @param url
   */
  const getExtensionValue = (
    activity: ActivityDefinition | undefined,
    url: string
  ): string | number | boolean | undefined => {
    if (!activity?.extension) {return undefined;}
    const ext = activity.extension.find((e) => e.url === url);
    if (!ext) {return undefined;}

    // Handle different value types
    if (ext.valueString !== undefined) {return ext.valueString;}
    if (ext.valueInteger !== undefined) {return ext.valueInteger;}
    if (ext.valueDecimal !== undefined) {return ext.valueDecimal;}
    if (ext.valueBoolean !== undefined) {return ext.valueBoolean;}

    return undefined;
  };

  /**
   * Helper function to get identifier value
   * @param activity
   * @param system
   */
  const getIdentifierValue = (activity: ActivityDefinition | undefined, system: string): string | undefined => {
    if (!activity?.identifier) {return undefined;}
    const identifier = activity.identifier.find((id) => id.system === system);
    return identifier?.value;
  };

  /**
   * Helper function to get array extension values (departments)
   * @param activity
   * @param url
   */
  const getArrayExtensionValue = (activity: ActivityDefinition | undefined, url: string): string[] => {
    if (!activity?.extension) {return [];}
    const ext = activity.extension.find((e) => e.url === url);
    if (!ext?.valueString) {return [];}

    try {
      const parsed = JSON.parse(ext.valueString);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  /**
   * Load service data from ActivityDefinition resource
   *
   * @param activity - FHIR ActivityDefinition resource
   */
  const loadServiceData = (activity: ActivityDefinition): void => {
    // Extract service code from identifier
    const code = getIdentifierValue(activity, NOMENCLATURE_IDENTIFIER_SYSTEMS.SERVICE_CODE) || '';

    // Extract name and description
    const name = activity.title || activity.name || '';

    // Extract group from topic
    const group = activity.topic?.[0]?.coding?.[0]?.code || '';

    // Extract subgroup from extension
    const subgroup = (getExtensionValue(activity, NOMENCLATURE_EXTENSION_URLS.SUBGROUP) as string) || '';

    // Extract type from extension
    const type = (getExtensionValue(activity, NOMENCLATURE_EXTENSION_URLS.SERVICE_TYPE) as string) || '';

    // Extract service category from extension
    const serviceCategory = (getExtensionValue(activity, NOMENCLATURE_EXTENSION_URLS.SERVICE_CATEGORY) as string) || '';

    // Extract price from extension
    const price = getExtensionValue(activity, NOMENCLATURE_EXTENSION_URLS.BASE_PRICE) as number | undefined;

    // Extract total amount from extension
    const totalAmount = getExtensionValue(activity, NOMENCLATURE_EXTENSION_URLS.TOTAL_AMOUNT) as number | undefined;

    // Extract calHed from extension
    const calHed = getExtensionValue(activity, NOMENCLATURE_EXTENSION_URLS.CAL_HED) as number | undefined;

    // Extract printable from extension
    const printable = (getExtensionValue(activity, NOMENCLATURE_EXTENSION_URLS.PRINTABLE) as boolean) || false;

    // Extract itemGetPrice from extension
    const itemGetPrice = getExtensionValue(activity, NOMENCLATURE_EXTENSION_URLS.ITEM_GET_PRICE) as
      | number
      | undefined;

    // Extract departments from extension
    const departments = getArrayExtensionValue(activity, NOMENCLATURE_EXTENSION_URLS.ASSIGNED_DEPARTMENTS);

    // Extract status
    const status = (activity.status as 'active' | 'retired' | 'draft') || 'active';

    // Populate form
    form.setValues({
      code,
      name,
      group,
      subgroup,
      type,
      serviceCategory,
      price,
      totalAmount,
      calHed,
      printable,
      itemGetPrice,
      departments,
      status,
    });

    // Set edit mode
    setIsEditMode(true);
  };

  /**
   * Clear form and reset to initial values
   */
  const clearForm = (): void => {
    form.reset();
    setIsEditMode(false);
  };

  return {
    form,
    initialValues,
    validate,
    isEditMode,
    setEditMode: setEditModeHandler,
    loadServiceData,
    clearForm,
  };
}
