// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { Button, Menu, Group, Box } from '@mantine/core';
import { IconChevronDown, IconDeviceFloppy, IconArrowRight, IconPlus, IconEye } from '@tabler/icons-react';
import { useState } from 'react';
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
 * Premium SubmitDropdownButton
 * Aesthetic: "Clinical Elegance"
 * Features:
 * - Refined gradient with subtle shine effect
 * - Smooth hover animations with lift effect
 * - Enhanced dropdown with icons
 * - Premium shadow on hover
 */
export function SubmitDropdownButton({
  onSave,
  onSaveAndContinue,
  onSaveAndNew,
  onSaveAndView,
  loading = false,
  disabled = false,
}: SubmitDropdownButtonProps) {
  const { t } = useTranslation();
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Box
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        position: 'relative',
        display: 'inline-flex',
        transition: 'all 280ms cubic-bezier(0.34, 1.56, 0.64, 1)',
        transform: isHovered && !disabled ? 'translateY(-2px)' : 'translateY(0)',
      }}
    >
      {/* Glow effect on hover */}
      <Box
        style={{
          position: 'absolute',
          inset: '-4px',
          background: 'linear-gradient(135deg, rgba(26, 54, 93, 0.3) 0%, rgba(43, 108, 176, 0.2) 100%)',
          borderRadius: '14px',
          filter: 'blur(12px)',
          opacity: isHovered && !disabled ? 1 : 0,
          transition: 'opacity 280ms ease',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      <Group gap={0} style={{ position: 'relative', zIndex: 1 }}>
        {/* Primary Save Button */}
        <Button
          type="submit"
          onClick={onSave}
          loading={loading}
          disabled={disabled}
          leftSection={!loading && <IconDeviceFloppy size={18} stroke={2} />}
          style={{
            background: 'linear-gradient(135deg, #1a365d 0%, #2b6cb0 50%, #3182ce 100%)',
            border: 'none',
            color: 'white',
            borderTopRightRadius: 0,
            borderBottomRightRadius: 0,
            borderTopLeftRadius: '10px',
            borderBottomLeftRadius: '10px',
            fontWeight: 600,
            fontSize: '14px',
            letterSpacing: '0.02em',
            padding: '12px 24px',
            height: 'auto',
            minHeight: '44px',
            boxShadow: isHovered && !disabled
              ? '0 8px 20px rgba(26, 54, 93, 0.3), 0 4px 8px rgba(26, 54, 93, 0.2)'
              : '0 4px 12px rgba(26, 54, 93, 0.25), 0 2px 4px rgba(26, 54, 93, 0.15)',
            transition: 'box-shadow 280ms ease',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Shine effect overlay */}
          <Box
            style={{
              position: 'absolute',
              top: 0,
              left: '-100%',
              width: '100%',
              height: '100%',
              background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.15), transparent)',
              transform: isHovered ? 'translateX(200%)' : 'translateX(0)',
              transition: 'transform 600ms ease',
              pointerEvents: 'none',
            }}
          />
          {t('registration.submit.save')}
        </Button>

        {/* Dropdown Menu Button */}
        <Menu
          position="bottom-end"
          shadow="lg"
          width={240}
          radius="md"
          transitionProps={{ transition: 'pop-top-right', duration: 200 }}
        >
          <Menu.Target>
            <Button
              disabled={disabled || loading}
              style={{
                background: 'linear-gradient(135deg, #1a365d 0%, #2b6cb0 50%, #3182ce 100%)',
                border: 'none',
                color: 'white',
                borderLeft: '1px solid rgba(255, 255, 255, 0.25)',
                paddingLeft: '12px',
                paddingRight: '12px',
                borderTopLeftRadius: 0,
                borderBottomLeftRadius: 0,
                borderTopRightRadius: '10px',
                borderBottomRightRadius: '10px',
                height: 'auto',
                minHeight: '44px',
                boxShadow: isHovered && !disabled
                  ? '0 8px 20px rgba(26, 54, 93, 0.3), 0 4px 8px rgba(26, 54, 93, 0.2)'
                  : '0 4px 12px rgba(26, 54, 93, 0.25), 0 2px 4px rgba(26, 54, 93, 0.15)',
                transition: 'box-shadow 280ms ease',
              }}
            >
              <IconChevronDown size={18} stroke={2.5} />
            </Button>
          </Menu.Target>

          <Menu.Dropdown
            style={{
              border: '1px solid rgba(26, 54, 93, 0.08)',
              boxShadow: '0 8px 32px rgba(26, 54, 93, 0.12), 0 4px 16px rgba(26, 54, 93, 0.08)',
            }}
          >
            <Menu.Label
              style={{
                fontSize: '10px',
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'var(--emr-gray-500)',
                padding: '8px 12px 4px',
              }}
            >
              {t('registration.submit.moreActions') || 'სხვა მოქმედებები'}
            </Menu.Label>

            <Menu.Item
              onClick={onSaveAndContinue}
              disabled={loading}
              leftSection={<IconArrowRight size={16} stroke={2} color="var(--emr-secondary)" />}
              style={{
                padding: '10px 12px',
                fontSize: '14px',
                fontWeight: 500,
              }}
            >
              {t('registration.submit.saveContinue')}
            </Menu.Item>

            <Menu.Item
              onClick={onSaveAndNew}
              disabled={loading}
              leftSection={<IconPlus size={16} stroke={2} color="var(--emr-secondary)" />}
              style={{
                padding: '10px 12px',
                fontSize: '14px',
                fontWeight: 500,
              }}
            >
              {t('registration.submit.saveNew')}
            </Menu.Item>

            <Menu.Divider />

            <Menu.Item
              onClick={onSaveAndView}
              disabled={loading}
              leftSection={<IconEye size={16} stroke={2} color="var(--emr-secondary)" />}
              style={{
                padding: '10px 12px',
                fontSize: '14px',
                fontWeight: 500,
              }}
            >
              {t('registration.submit.saveView')}
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Group>
    </Box>
  );
}
