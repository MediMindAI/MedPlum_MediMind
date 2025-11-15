// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { Group, Select, TextInput } from '@mantine/core';
import { ReactNode, useState } from 'react';

interface InternationalPhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  error?: ReactNode;
  required?: boolean;
}

const countries = [
  { value: '+995', label: '🇬🇪 +995 (Georgia)', flag: '🇬🇪' },
  { value: '+1', label: '🇺🇸 +1 (USA)', flag: '🇺🇸' },
  { value: '+44', label: '🇬🇧 +44 (UK)', flag: '🇬🇧' },
  { value: '+7', label: '🇷🇺 +7 (Russia)', flag: '🇷🇺' },
  { value: '+49', label: '🇩🇪 +49 (Germany)', flag: '🇩🇪' },
  { value: '+33', label: '🇫🇷 +33 (France)', flag: '🇫🇷' },
];

/**
 * International phone input with country code selector
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
    if (!value) return '+995';
    const match = countries.find((c) => value.startsWith(c.value));
    return match?.value || '+995';
  };

  const getPhoneNumber = () => {
    const countryCode = getInitialCountryCode();
    return value.replace(countryCode, '');
  };

  const [countryCode, setCountryCode] = useState(getInitialCountryCode());
  const [phoneNumber, setPhoneNumber] = useState(getPhoneNumber());

  const handleCountryChange = (newCode: string) => {
    setCountryCode(newCode);
    onChange(`${newCode}${phoneNumber}`);
  };

  const handlePhoneChange = (newPhone: string) => {
    // Remove non-digit characters
    const cleaned = newPhone.replace(/\D/g, '');
    setPhoneNumber(cleaned);
    onChange(`${countryCode}${cleaned}`);
  };

  return (
    <div>
      <Group align="flex-end" gap="xs">
        <Select
          label={label}
          data={countries}
          value={countryCode}
          onChange={(val) => handleCountryChange(val || '+995')}
          style={{ width: '180px' }}
          searchable
          required={required}
        />
        <TextInput
          placeholder="500050610"
          value={phoneNumber}
          onChange={(e) => handlePhoneChange(e.target.value)}
          error={error}
          style={{ flex: 1 }}
        />
      </Group>
    </div>
  );
}
