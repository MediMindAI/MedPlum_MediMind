// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { Box } from '@mantine/core';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { EMRSelect, EMRTextInput, EMRFormRow } from '../shared/EMRFormFields';

interface InternationalPhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  error?: ReactNode;
  required?: boolean;
}

const countries = [
  { value: '+995', label: '🇬🇪 +995 (Georgia)' },
  { value: '+1', label: '🇺🇸 +1 (USA)' },
  { value: '+44', label: '🇬🇧 +44 (UK)' },
  { value: '+7', label: '🇷🇺 +7 (Russia)' },
  { value: '+49', label: '🇩🇪 +49 (Germany)' },
  { value: '+33', label: '🇫🇷 +33 (France)' },
  { value: '+34', label: '🇪🇸 +34 (Spain)' },
  { value: '+39', label: '🇮🇹 +39 (Italy)' },
  { value: '+90', label: '🇹🇷 +90 (Turkey)' },
  { value: '+380', label: '🇺🇦 +380 (Ukraine)' },
  { value: '+374', label: '🇦🇲 +374 (Armenia)' },
  { value: '+994', label: '🇦🇿 +994 (Azerbaijan)' },
];

/**
 * International phone input with country code selector
 * Uses EMRFormFields for consistent styling
 * Defaults to Georgia (+995)
 */
export function InternationalPhoneInput({
  value,
  onChange,
  label = 'Phone Number',
  error,
  required,
}: InternationalPhoneInputProps) {
  // Parse existing value or default to +995
  const getInitialCountryCode = () => {
    if (!value) {return '+995';}
    const match = countries.find((c) => value.startsWith(c.value));
    return match?.value || '+995';
  };

  const getPhoneNumber = () => {
    const countryCode = getInitialCountryCode();
    return value.replace(countryCode, '');
  };

  const [countryCode, setCountryCode] = useState(getInitialCountryCode());
  const [phoneNumber, setPhoneNumber] = useState(getPhoneNumber());

  const handleCountryChange = (newCode: string | null) => {
    const code = newCode || '+995';
    setCountryCode(code);
    onChange(`${code}${phoneNumber}`);
  };

  const handlePhoneChange = (newPhone: string) => {
    // Remove non-digit characters
    const cleaned = newPhone.replace(/\D/g, '');
    setPhoneNumber(cleaned);
    onChange(`${countryCode}${cleaned}`);
  };

  return (
    <Box style={{ width: '100%' }}>
      <EMRFormRow gap="sm" align="end">
        <Box style={{ width: '180px', flexShrink: 0 }}>
          <EMRSelect
            label={label}
            data={countries}
            value={countryCode}
            onChange={handleCountryChange}
            searchable
            required={required}
          />
        </Box>
        <Box style={{ flex: 1 }}>
          <EMRTextInput
            label=" "
            placeholder="500050610"
            value={phoneNumber}
            onChange={handlePhoneChange}
            error={error as string}
          />
        </Box>
      </EMRFormRow>
    </Box>
  );
}
