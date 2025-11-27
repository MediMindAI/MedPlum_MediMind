// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { Select } from '@mantine/core';
import { useMedplum } from '@medplum/react-hooks';
import { useEffect, useState } from 'react';
import type { Organization } from '@medplum/fhirtypes';
import { useTranslation } from '../../hooks/useTranslation';

interface DepartmentSelectorProps {
  value?: string;
  onChange: (value: string | null) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  label?: string;
  required?: boolean;
}

/**
 * DepartmentSelector - Searchable dropdown for departments
 *
 * Fetches Organization resources with type='dept' from FHIR server.
 * Displays department name with ID fallback.
 */
export function DepartmentSelector({
  value,
  onChange,
  placeholder,
  disabled = false,
  error,
  label,
  required = false,
}: DepartmentSelectorProps): JSX.Element {
  const medplum = useMedplum();
  const { t } = useTranslation();
  const [departments, setDepartments] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchDepartments(): Promise<void> {
      setLoading(true);
      try {
        const bundle = await medplum.search('Organization', {
          type: 'dept',
          _count: '100',
        });
        const orgs = bundle.entry?.map((entry) => entry.resource as Organization) || [];
        setDepartments(orgs);
      } catch (error) {
        console.error('[DepartmentSelector] Failed to fetch departments:', error);
        setDepartments([]);
      } finally {
        setLoading(false);
      }
    }

    void fetchDepartments();
  }, [medplum]);

  const options = departments.map((dept) => ({
    value: dept.id || '',
    label: dept.name || dept.id || 'Unknown Department',
  }));

  return (
    <Select
      label={label || t('department.label')}
      placeholder={placeholder || t('department.selectPlaceholder')}
      value={value}
      onChange={onChange}
      data={options}
      disabled={disabled || loading}
      error={error}
      required={required}
      searchable
      clearable
      nothingFoundMessage={loading ? 'Loading...' : 'No departments found'}
    />
  );
}
