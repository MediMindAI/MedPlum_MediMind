// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { Button, Menu, Group } from '@mantine/core';
import { IconChevronDown } from '@tabler/icons-react';
import { useTranslation } from '../../hooks/useTranslation';

/**
 * Props for the SubmitDropdownButton component
 */
export interface SubmitDropdownButtonProps {
  /** Handler for primary Save action */
  onSave: () => void;
  /** Handler for Save & Continue action */
  onSaveAndContinue: () => void;
  /** Handler for Save & New action */
  onSaveAndNew: () => void;
  /** Handler for Save & View action */
  onSaveAndView: () => void;
  /** Loading state for the button */
  loading?: boolean;
  /** Disabled state for the button */
  disabled?: boolean;
}

/**
 * SubmitDropdownButton - Split button with dropdown menu for patient registration actions
 *
 * Provides 4 submit actions:
 * 1. Save - Primary action (default button)
 * 2. Save & Continue - Save and go to next patient
 * 3. Save & New - Save and clear form for new patient
 * 4. Save & View - Save and view patient details
 *
 * Features:
 * - Blue gradient styling matching EMR theme
 * - Multilingual support (Georgian/English/Russian)
 * - Loading and disabled states
 * - Split button design with dropdown menu
 */
export function SubmitDropdownButton({
  onSave,
  onSaveAndContinue,
  onSaveAndNew,
  onSaveAndView,
  loading = false,
  disabled = false,
}: SubmitDropdownButtonProps): JSX.Element {
  const { t } = useTranslation();

  // Blue gradient matching the theme
  const gradientStyle = {
    background: 'linear-gradient(135deg, #1a365d 0%, #2b6cb0 50%, #3182ce 100%)',
    border: 'none',
    color: 'white',
  };

  const dropdownButtonStyle = {
    ...gradientStyle,
    borderLeft: '1px solid rgba(255, 255, 255, 0.3)',
    paddingLeft: '8px',
    paddingRight: '8px',
  };

  return (
    <Group gap={0}>
      {/* Primary Save Button */}
      <Button
        type="submit"
        onClick={onSave}
        loading={loading}
        disabled={disabled}
        style={{
          ...gradientStyle,
          borderTopRightRadius: 0,
          borderBottomRightRadius: 0,
        }}
      >
        {t('registration.submit.save')}
      </Button>

      {/* Dropdown Menu Button */}
      <Menu position="bottom-end" shadow="md" width={220}>
        <Menu.Target>
          <Button
            disabled={disabled || loading}
            style={{
              ...dropdownButtonStyle,
              borderTopLeftRadius: 0,
              borderBottomLeftRadius: 0,
            }}
          >
            <IconChevronDown size={16} />
          </Button>
        </Menu.Target>

        <Menu.Dropdown>
          <Menu.Item onClick={onSaveAndContinue} disabled={loading}>
            {t('registration.submit.saveContinue')}
          </Menu.Item>
          <Menu.Item onClick={onSaveAndNew} disabled={loading}>
            {t('registration.submit.saveNew')}
          </Menu.Item>
          <Menu.Item onClick={onSaveAndView} disabled={loading}>
            {t('registration.submit.saveView')}
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>
    </Group>
  );
}
