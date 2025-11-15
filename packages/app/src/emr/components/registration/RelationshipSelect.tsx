// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { Select } from '@mantine/core';
import { useTranslation } from '../../hooks/useTranslation';

interface RelationshipSelectProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
}

/**
 * Relationship type selector for representatives/guardians
 * Based on FHIR v3-RoleCode system
 */
export function RelationshipSelect({ value, onChange, error, required }: RelationshipSelectProps) {
  const { t } = useTranslation();

  const relationships = [
    { value: 'MTH', label: t('registration.relationship.mother') || 'Mother' },
    { value: 'FTH', label: t('registration.relationship.father') || 'Father' },
    { value: 'SIB', label: t('registration.relationship.sibling') || 'Sibling' },
    { value: 'GRPRN', label: t('registration.relationship.grandparent') || 'Grandparent' },
    { value: 'SPS', label: t('registration.relationship.spouse') || 'Spouse' },
    { value: 'CHILD', label: t('registration.relationship.child') || 'Child' },
    { value: 'EXT', label: t('registration.relationship.relative') || 'Other Relative' },
    { value: 'FRND', label: t('registration.relationship.friend') || 'Friend' },
    { value: 'GUARD', label: t('registration.relationship.guardian') || 'Guardian' },
    { value: 'O', label: t('registration.relationship.other') || 'Other' },
  ];

  return (
    <Select
      label={t('registration.representative.relationship')}
      placeholder={t('registration.representative.selectRelationship') || 'Select relationship'}
      data={relationships}
      value={value}
      onChange={(val) => onChange(val || '')}
      error={error}
      required={required}
      searchable
      clearable
    />
  );
}
