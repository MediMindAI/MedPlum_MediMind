// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { Grid, TextInput, Select, Button, Stack, Box, Group, Text, ActionIcon, Badge, Alert } from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { IconPlus, IconTrash, IconAlertTriangle } from '@tabler/icons-react';
import { useTranslation } from '../../hooks/useTranslation';
import { useAccountForm } from '../../hooks/useAccountForm';
import type { AccountFormValues, RoleAssignment } from '../../types/account-management';
import { SpecialtySelect } from './SpecialtySelect';
import { RoleAssignmentPanel } from '../role-management/RoleAssignmentPanel';
import accountRolesData from '../../translations/account-roles.json';

interface AccountFormProps {
  onSubmit: (values: AccountFormValues) => void | Promise<void>;
  initialValues?: AccountFormValues;
  loading?: boolean;
}

/**
 * Form component for creating/editing accounts
 *
 * Features:
 * - Mobile-first responsive Grid (base: 12, md: 6)
 * - size="md" inputs (44px touch targets)
 * - Mantine form validation
 * - Multi-role support with SpecialtySelect
 * - Backward compatible with single role
 * - Multilingual support (ka/en/ru)
 *
 * @param props - Component props
 * @param props.onSubmit - Callback for form submission
 * @param props.initialValues - Optional initial values for editing
 * @param props.loading - Show loading state during submission
 * @returns Account form component
 */
export function AccountForm({ onSubmit, initialValues, loading }: AccountFormProps): JSX.Element {
  const { t, lang } = useTranslation();
  const { form } = useAccountForm(initialValues);

  // Handler for adding a new role
  const handleAddRole = (): void => {
    const currentRoles = form.values.roles || [];
    form.setFieldValue('roles', [
      ...currentRoles,
      {
        code: '',
        specialty: undefined,
        department: undefined,
        location: undefined,
        active: true,
      } as RoleAssignment,
    ]);
  };

  // Handler for removing a role
  const handleRemoveRole = (index: number): void => {
    const currentRoles = form.values.roles || [];
    form.setFieldValue(
      'roles',
      currentRoles.filter((_, i) => i !== index)
    );
  };

  // Handler for updating a specific role field
  const handleRoleChange = (index: number, field: keyof RoleAssignment, value: any): void => {
    const currentRoles = form.values.roles || [];
    const updatedRoles = [...currentRoles];
    updatedRoles[index] = { ...updatedRoles[index], [field]: value };
    form.setFieldValue('roles', updatedRoles);
  };

  // Load role options from account-roles.json
  const roleOptions = accountRolesData.roles.map((role) => ({
    value: role.code,
    label: role.name[lang as 'ka' | 'en' | 'ru'] || role.name.en,
  }));

  // Gender options
  const genderOptions = [
    { value: 'male', label: t('accountManagement.form.gender.male') },
    { value: 'female', label: t('accountManagement.form.gender.female') },
    { value: 'other', label: t('accountManagement.form.gender.other') },
    { value: 'unknown', label: t('accountManagement.form.gender.unknown') },
  ];

  // Check if editing an inactive account
  const isInactive = initialValues?.active === false;

  return (
    <form onSubmit={form.onSubmit(onSubmit)}>
      <Stack gap="md">
        {/* Inactive Account Warning */}
        {isInactive && (
          <Alert
            icon={<IconAlertTriangle size={20} />}
            title={t('accountManagement.form.inactiveWarning.title')}
            color="orange"
            variant="filled"
            styles={{
              root: {
                background: 'linear-gradient(135deg, #f76707 0%, #fd7e14 100%)',
              },
            }}
          >
            {t('accountManagement.form.inactiveWarning.message')}
          </Alert>
        )}

        {/* Basic Information */}
        <Grid gutter="md">
          <Grid.Col span={{ base: 12, md: 6 }}>
            <TextInput
              label={t('accountManagement.form.firstName')}
              placeholder={t('accountManagement.form.firstNamePlaceholder')}
              size="md"
              styles={{ input: { minHeight: '44px' } }}
              required
              {...form.getInputProps('firstName')}
            />
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 6 }}>
            <TextInput
              label={t('accountManagement.form.lastName')}
              placeholder={t('accountManagement.form.lastNamePlaceholder')}
              size="md"
              styles={{ input: { minHeight: '44px' } }}
              required
              {...form.getInputProps('lastName')}
            />
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 6 }}>
            <TextInput
              label={t('accountManagement.form.fatherName')}
              placeholder={t('accountManagement.form.fatherNamePlaceholder')}
              size="md"
              styles={{ input: { minHeight: '44px' } }}
              {...form.getInputProps('fatherName')}
            />
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 6 }}>
            <Select
              label={t('accountManagement.form.gender')}
              placeholder={t('accountManagement.form.genderPlaceholder')}
              size="md"
              data={genderOptions}
              {...form.getInputProps('gender')}
            />
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 6 }}>
            <DateInput
              label={t('accountManagement.form.birthDate')}
              placeholder={t('accountManagement.form.birthDatePlaceholder')}
              size="md"
              valueFormat="YYYY-MM-DD"
              clearable
              {...form.getInputProps('birthDate')}
            />
          </Grid.Col>
        </Grid>

        {/* Contact Information */}
        <Grid gutter="md">
          <Grid.Col span={{ base: 12, md: 6 }}>
            <TextInput
              label={t('accountManagement.form.email')}
              placeholder={t('accountManagement.form.emailPlaceholder')}
              size="md"
              styles={{ input: { minHeight: '44px' } }}
              type="email"
              required
              {...form.getInputProps('email')}
            />
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 6 }}>
            <TextInput
              label={t('accountManagement.form.phoneNumber')}
              placeholder={t('accountManagement.form.phoneNumberPlaceholder')}
              size="md"
              styles={{ input: { minHeight: '44px' } }}
              {...form.getInputProps('phoneNumber')}
            />
          </Grid.Col>
        </Grid>

        {/* Employment Details */}
        <Grid gutter="md">
          <Grid.Col span={{ base: 12, md: 6 }}>
            <TextInput
              label={t('accountManagement.form.staffId')}
              placeholder={t('accountManagement.form.staffIdPlaceholder')}
              size="md"
              styles={{ input: { minHeight: '44px' } }}
              {...form.getInputProps('staffId')}
            />
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 6 }}>
            <DateInput
              label={t('accountManagement.form.hireDate')}
              placeholder={t('accountManagement.form.hireDatePlaceholder')}
              size="md"
              valueFormat="YYYY-MM-DD"
              clearable
              {...form.getInputProps('hireDate')}
            />
          </Grid.Col>
        </Grid>

        {/* Multi-Role Assignment Section */}
        <Box
          style={{
            background: 'var(--emr-section-header-bg)',
            padding: '16px',
            borderRadius: 'var(--emr-border-radius-lg)',
            marginTop: '8px',
          }}
        >
          <Group justify="space-between" mb="md">
            <Text size="sm" fw={600} c="var(--emr-primary)">
              {t('accountManagement.form.roleAssignment')}
            </Text>
            <Button
              leftSection={<IconPlus size={16} />}
              onClick={handleAddRole}
              size="xs"
              variant="light"
              style={{
                background: 'var(--emr-gradient-primary)',
                color: 'white',
              }}
            >
              {t('accountManagement.form.addRole')}
            </Button>
          </Group>

          {/* Role List */}
          {form.values.roles && form.values.roles.length > 0 ? (
            <Stack gap="md">
              {form.values.roles.map((roleAssignment, index) => (
                <Box
                  key={index}
                  style={{
                    background: 'var(--emr-text-inverse)',
                    padding: '16px',
                    borderRadius: 'var(--emr-border-radius-lg)',
                    border: '1px solid var(--emr-gray-200)',
                  }}
                >
                  <Group justify="space-between" mb="sm">
                    <Badge color="blue" variant="light">
                      {t('accountManagement.form.role')} {index + 1}
                    </Badge>
                    <ActionIcon
                      color="red"
                      variant="subtle"
                      onClick={() => handleRemoveRole(index)}
                      aria-label={t('accountManagement.form.removeRole')}
                    >
                      <IconTrash size={16} />
                    </ActionIcon>
                  </Group>

                  <Grid gutter="md">
                    <Grid.Col span={{ base: 12, md: 6 }}>
                      <Select
                        label={t('accountManagement.form.role')}
                        placeholder={t('accountManagement.form.selectRole')}
                        size="md"
                        data={roleOptions}
                        searchable
                        value={roleAssignment.code}
                        onChange={(value) => handleRoleChange(index, 'code', value)}
                        required
                      />
                    </Grid.Col>

                    <Grid.Col span={{ base: 12, md: 6 }}>
                      <SpecialtySelect
                        label={t('accountManagement.form.specialty')}
                        value={roleAssignment.specialty || null}
                        onChange={(value) => handleRoleChange(index, 'specialty', value)}
                        clearable
                      />
                    </Grid.Col>
                  </Grid>
                </Box>
              ))}
            </Stack>
          ) : (
            <Text size="sm" c="dimmed" ta="center" py="xl">
              {t('accountManagement.form.noRoles')}
            </Text>
          )}
        </Box>

        {/* RBAC Role Assignment (AccessPolicy-based) */}
        <Box
          style={{
            background: 'var(--emr-section-header-bg)',
            padding: '16px',
            borderRadius: 'var(--emr-border-radius-lg)',
            marginTop: '8px',
          }}
        >
          <RoleAssignmentPanel
            practitionerId={initialValues?.id}
            value={
              form.values.rbacRoles ||
              ([] as { roleId: string; roleName: string; roleCode: string }[])
            }
            onChange={(roles) => form.setFieldValue('rbacRoles', roles)}
          />
        </Box>

        {/* Submit Button */}
        <Button type="submit" size="md" loading={loading} fullWidth>
          {t('accountManagement.form.save')}
        </Button>
      </Stack>
    </form>
  );
}
