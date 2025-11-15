// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { TextInput, Popover } from '@mantine/core';
import { IconCalendar } from '@tabler/icons-react';
import { forwardRef, useState } from 'react';
import { EMRCalendar } from './calendar/EMRCalendar';
import { formatDate } from './calendar/calendar.utils';

export interface EMRDatePickerProps {
  /** Custom label */
  label?: string;
  /** Whether field is required */
  required?: boolean;
  /** Placeholder text */
  placeholder?: string;
  /** Error message */
  error?: string;
  /** Current value */
  value?: Date | null;
  /** Change handler */
  onChange?: (date: Date | null) => void;
  /** Minimum selectable date */
  minDate?: Date;
  /** Maximum selectable date */
  maxDate?: Date;
  /** Locale for date formatting */
  locale?: string;
}

/**
 * Production-Ready EMR Date Picker Component
 *
 * Features:
 * - Beautiful Apple-inspired custom calendar
 * - Multi-level navigation (Day → Month → Year)
 * - Support for dates from 1900 to current year + 10
 * - Smooth animations and transitions
 * - Georgian/English/Russian locale support
 * - Custom styling matching EMR theme
 *
 * @example
 * ```tsx
 * <EMRDatePicker
 *   label="დაბადების თარიღი"
 *   placeholder="აირჩიეთ თარიღი"
 *   required
 *   value={birthDate}
 *   onChange={setBirthDate}
 *   maxDate={new Date()}
 * />
 * ```
 */
export const EMRDatePicker = forwardRef<HTMLInputElement, EMRDatePickerProps>(
  (
    {
      label,
      required,
      placeholder = 'dd.mm.yyyy',
      error,
      value,
      onChange,
      minDate = new Date(1900, 0, 1),
      maxDate = new Date(new Date().getFullYear() + 10, 11, 31),
      locale = 'en',
    },
    ref
  ) => {
    const [opened, setOpened] = useState(false);
    const [inputValue, setInputValue] = useState(value ? formatDate(value) : '');

    const handleDateChange = (date: Date | null) => {
      if (date) {
        setInputValue(formatDate(date));
        onChange?.(date);
        setOpened(false);
      }
    };

    const handleClear = () => {
      setInputValue('');
      onChange?.(null);
    };

    return (
      <Popover
        opened={opened}
        onChange={setOpened}
        position="bottom-start"
        shadow="md"
        withinPortal
      >
        <Popover.Target>
          <TextInput
            ref={ref}
            label={label}
            placeholder={placeholder}
            required={required}
            error={error}
            value={inputValue}
            onClick={() => setOpened(true)}
            readOnly
            leftSection={<IconCalendar size={18} style={{ color: 'var(--emr-secondary)' }} />}
            rightSection={
              inputValue ? (
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClear();
                  }}
                  style={{
                    cursor: 'pointer',
                    color: 'var(--emr-gray-500)',
                    fontSize: '18px',
                    fontWeight: 700,
                    padding: '0 4px',
                  }}
                >
                  ×
                </span>
              ) : undefined
            }
            styles={{
              input: {
                borderRadius: 'var(--emr-border-radius)',
                borderColor: error ? 'var(--mantine-color-error)' : '#d0d7de',
                fontSize: '14px',
                height: '40px',
                fontWeight: 500,
                transition: 'all 0.2s ease',
                cursor: 'pointer',
                '&:hover': {
                  borderColor: 'var(--emr-secondary)',
                },
                '&:focus': {
                  borderColor: 'var(--emr-secondary)',
                  outline: 'none',
                  boxShadow: '0 0 0 3px rgba(43, 108, 176, 0.15)',
                },
              },
              label: {
                fontSize: '14px',
                fontWeight: 600,
                color: 'var(--emr-text-primary)',
                marginBottom: '8px',
              },
              error: {
                fontSize: '12px',
                marginTop: '4px',
                color: 'var(--emr-error-text)',
              },
              section: {
                color: 'var(--emr-secondary)',
              },
            }}
          />
        </Popover.Target>

        <Popover.Dropdown style={{ padding: 0, border: 'none' }}>
          <EMRCalendar
            value={value}
            onChange={handleDateChange}
            minDate={minDate}
            maxDate={maxDate}
            locale={locale}
          />
        </Popover.Dropdown>
      </Popover>
    );
  }
);

EMRDatePicker.displayName = 'EMRDatePicker';
