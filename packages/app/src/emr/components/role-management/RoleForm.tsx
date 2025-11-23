// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { Stack, Text, Box, Group, Paper, SimpleGrid } from '@mantine/core';
import type { UseFormReturnType } from '@mantine/form';
import type { RoleFormValues } from '../../types/role-management';
import { useTranslation } from '../../hooks/useTranslation';
import { PermissionTree } from './PermissionTree';
import { EMRTextInput, EMRTextarea, EMRSelect } from '../shared/EMRFormFields';
import { IconUser, IconFileText, IconKey } from '@tabler/icons-react';

interface RoleFormProps {
  form: UseFormReturnType<RoleFormValues>;
  hidePermissions?: boolean; // For US1, we hide permissions section
  loading?: boolean; // Loading state for async operations
}

interface FormSectionProps {
  icon: typeof IconUser;
  title: string;
  accentColor: string;
  children: React.ReactNode;
}

/**
 * Styled form section with icon and left accent
 */
function FormSection({ icon: Icon, title, accentColor, children }: FormSectionProps): JSX.Element {
  return (
    <Paper
      p={0}
      withBorder
      style={{
        borderRadius: 'var(--emr-border-radius-lg)',
        borderColor: 'var(--emr-gray-200)',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #ffffff 0%, #fafbfc 100%)',
      }}
    >
      {/* Section Header */}
      <Box
        style={{
          background: 'linear-gradient(90deg, rgba(248, 249, 250, 1) 0%, rgba(255, 255, 255, 1) 100%)',
          borderBottom: '1px solid var(--emr-gray-200)',
          padding: '12px 16px',
          position: 'relative',
        }}
      >
        {/* Left accent bar */}
        <Box
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: 4,
            background: accentColor,
          }}
        />

        <Group gap="sm" pl={8}>
          <Box
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: `${accentColor}15`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon size={18} style={{ color: accentColor }} />
          </Box>
          <Text
            fw={600}
            size="sm"
            style={{
              color: 'var(--emr-text-primary)',
              letterSpacing: '0.01em',
            }}
          >
            {title}
          </Text>
        </Group>
      </Box>

      {/* Section Content */}
      <Box p="lg">
        {children}
      </Box>
    </Paper>
  );
}

/**
 * Role creation/editing form with beautiful sectioned layout
 *
 * Phase 1 (US1): Basic fields only (name, code, description, status)
 * Phase 2 (US2): Add permissions section
 * @param props - Component props
 * @param props.form - Mantine form instance
 * @param props.hidePermissions - Whether to hide permissions section
 * @param props.loading - Loading state
 * @returns Role form component
 */
export function RoleForm({ form, hidePermissions = false, loading = false }: RoleFormProps): JSX.Element {
  const { t, lang } = useTranslation();

  const sectionTitles = {
    basicInfo: {
      ka: 'ძირითადი ინფორმაცია',
      en: 'Basic Information',
      ru: 'Основная информация',
    },
    description: {
      ka: 'როლის აღწერა',
      en: 'Role Description',
      ru: 'Описание роли',
    },
    permissions: {
      ka: 'აირჩიეთ უფლებები',
      en: 'Select Permissions',
      ru: 'Выберите разрешения',
    },
  };

  return (
    <Stack gap="lg">
      {/* Section 1: Basic Information */}
      <FormSection
        icon={IconUser}
        title={sectionTitles.basicInfo[lang] || sectionTitles.basicInfo.en}
        accentColor="var(--emr-secondary)"
      >
        <Stack gap="md">
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
            {/* Role Name */}
            <EMRTextInput
              label={t('roleManagement.roleName')}
              placeholder={lang === 'ka' ? 'მაგ., ექიმი, ექთანი' : 'e.g., Physician, Nurse'}
              required
              {...form.getInputProps('name')}
            />

            {/* Role Code - Required unique identifier */}
            <EMRTextInput
              label={t('roleManagement.roleCode')}
              placeholder={lang === 'ka' ? 'მაგ., physician, nurse-admin' : 'e.g., physician, nurse-admin'}
              description={lang === 'ka' ? 'მხოლოდ პატარა ასოები, რიცხვები და ტირეები' : 'Only lowercase letters, numbers, and hyphens'}
              required
              {...form.getInputProps('code')}
            />
          </SimpleGrid>

          {/* Status - Full width on second row */}
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
            <EMRSelect
              label={t('roleManagement.roleStatus')}
              data={[
                { value: 'active', label: t('roleManagement.active') },
                { value: 'inactive', label: t('roleManagement.inactive') },
              ]}
              required
              {...form.getInputProps('status')}
            />
          </SimpleGrid>
        </Stack>
      </FormSection>

      {/* Section 2: Description */}
      <FormSection
        icon={IconFileText}
        title={sectionTitles.description[lang] || sectionTitles.description.en}
        accentColor="var(--emr-accent)"
      >
        <EMRTextarea
          label={t('roleManagement.roleDescription')}
          placeholder={
            lang === 'ka'
              ? 'აღწერეთ ამ როლის პასუხისმგებლობები და უფლებამოსილებები...'
              : 'Describe this role\'s responsibilities and authorities...'
          }
          minRows={3}
          maxRows={6}
          {...form.getInputProps('description')}
        />
      </FormSection>

      {/* Section 3: Permissions */}
      {!hidePermissions && (
        <FormSection
          icon={IconKey}
          title={sectionTitles.permissions[lang] || sectionTitles.permissions.en}
          accentColor="#10b981"
        >
          <PermissionTree
            selectedPermissions={form.values.permissions}
            onChange={(permissions) => form.setFieldValue('permissions', permissions)}
          />
        </FormSection>
      )}
    </Stack>
  );
}
