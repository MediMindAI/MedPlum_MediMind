// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { Grid, Button, Stack, Box, Text, ActionIcon, Badge, Alert } from '@mantine/core';
import { IconPlus, IconTrash, IconAlertTriangle, IconUser, IconPhone, IconBriefcase, IconShieldCheck, IconMail } from '@tabler/icons-react';
import { useMemo } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { useAccountForm } from '../../hooks/useAccountForm';
import { usePermissionsMatrix } from '../../hooks/usePermissions';
import type { AccountFormValues, RoleAssignment } from '../../types/account-management';
import { SpecialtySelect } from './SpecialtySelect';
import { RoleAssignmentPanel } from '../role-management/RoleAssignmentPanel';
import { PermissionPreview } from './PermissionPreview';
import { RoleConflictAlert } from './RoleConflictAlert';
import { WelcomeMessageEditor } from './WelcomeMessageEditor';
import accountRolesData from '../../translations/account-roles.json';
import { EMRTextInput, EMRSelect, EMRDatePicker } from '../shared/EMRFormFields';
import styles from './CreateAccountModal.module.css';

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

  // Extract role codes for conflict detection
  const roleCodes = useMemo(() => {
    const codes: string[] = [];
    // From legacy roles
    if (form.values.roles) {
      codes.push(...form.values.roles.map((r) => r.code).filter(Boolean));
    }
    // From RBAC roles
    if (form.values.rbacRoles) {
      codes.push(...form.values.rbacRoles.map((r) => r.roleCode).filter(Boolean));
    }
    return codes;
  }, [form.values.roles, form.values.rbacRoles]);

  // Extract role IDs for permission preview
  const roleIds = useMemo(() => {
    if (form.values.rbacRoles) {
      return form.values.rbacRoles.map((r) => r.roleId).filter(Boolean);
    }
    return [];
  }, [form.values.rbacRoles]);

  // Use permissions matrix for conflict detection and preview
  const { permissions, conflicts, loading: permissionsLoading } = usePermissionsMatrix({
    roleIds,
    roleCodes,
  });

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
      <Stack gap="lg">
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
                borderRadius: '14px',
              },
            }}
          >
            {t('accountManagement.form.inactiveWarning.message')}
          </Alert>
        )}

        {/* === SECTION 1: Personal Information === */}
        <Box className={`${styles.formSection} ${styles.sectionPersonal}`}>
          <Box className={styles.sectionHeader}>
            <Box className={`${styles.sectionIconWrapper} ${styles.iconPersonal}`}>
              <IconUser size={24} stroke={1.8} />
            </Box>
            <Box className={styles.sectionTitleGroup}>
              <Text className={styles.sectionTitle}>
                {t('accountManagement.form.sectionPersonal') || 'Personal Information'}
              </Text>
              <Text className={styles.sectionDescription}>
                {t('accountManagement.form.sectionPersonalDesc') || 'Basic details about the user'}
              </Text>
            </Box>
          </Box>

          <Grid gutter="xl">
            <Grid.Col span={{ base: 12, sm: 6, lg: 4 }}>
              <EMRTextInput
                label={t('accountManagement.form.firstName')}
                placeholder={t('accountManagement.form.firstNamePlaceholder')}
                required
                {...form.getInputProps('firstName')}
              />
            </Grid.Col>

            <Grid.Col span={{ base: 12, sm: 6, lg: 4 }}>
              <EMRTextInput
                label={t('accountManagement.form.lastName')}
                placeholder={t('accountManagement.form.lastNamePlaceholder')}
                required
                {...form.getInputProps('lastName')}
              />
            </Grid.Col>

            <Grid.Col span={{ base: 12, sm: 6, lg: 4 }}>
              <EMRTextInput
                label={t('accountManagement.form.fatherName')}
                placeholder={t('accountManagement.form.fatherNamePlaceholder')}
                {...form.getInputProps('fatherName')}
              />
            </Grid.Col>

            <Grid.Col span={{ base: 12, sm: 6, lg: 4 }}>
              <EMRSelect
                label={t('accountManagement.form.gender')}
                placeholder={t('accountManagement.form.genderPlaceholder')}
                data={genderOptions}
                {...form.getInputProps('gender')}
              />
            </Grid.Col>

            <Grid.Col span={{ base: 12, sm: 6, lg: 4 }}>
              <EMRDatePicker
                label={t('accountManagement.form.birthDate')}
                placeholder={t('accountManagement.form.birthDatePlaceholder')}
                {...form.getInputProps('birthDate')}
              />
            </Grid.Col>
          </Grid>
        </Box>

        {/* === SECTION 2: Contact Information === */}
        <Box className={`${styles.formSection} ${styles.sectionContact}`}>
          <Box className={styles.sectionHeader}>
            <Box className={`${styles.sectionIconWrapper} ${styles.iconContact}`}>
              <IconPhone size={24} stroke={1.8} />
            </Box>
            <Box className={styles.sectionTitleGroup}>
              <Text className={styles.sectionTitle}>
                {t('accountManagement.form.sectionContact') || 'Contact Information'}
              </Text>
              <Text className={styles.sectionDescription}>
                {t('accountManagement.form.sectionContactDesc') || 'Email and phone for communication'}
              </Text>
            </Box>
          </Box>

          <Grid gutter="xl">
            <Grid.Col span={{ base: 12, lg: 6 }}>
              <EMRTextInput
                label={t('accountManagement.form.email')}
                placeholder={t('accountManagement.form.emailPlaceholder')}
                type="email"
                required
                leftSection={<IconMail size={18} stroke={1.5} style={{ color: '#3182ce' }} />}
                {...form.getInputProps('email')}
              />
            </Grid.Col>

            <Grid.Col span={{ base: 12, lg: 6 }}>
              <EMRTextInput
                label={t('accountManagement.form.phoneNumber')}
                placeholder={t('accountManagement.form.phoneNumberPlaceholder')}
                leftSection={<IconPhone size={18} stroke={1.5} style={{ color: '#3182ce' }} />}
                {...form.getInputProps('phoneNumber')}
              />
            </Grid.Col>
          </Grid>
        </Box>

        {/* === SECTION 3: Employment Details === */}
        <Box className={`${styles.formSection} ${styles.sectionEmployment}`}>
          <Box className={styles.sectionHeader}>
            <Box className={`${styles.sectionIconWrapper} ${styles.iconEmployment}`}>
              <IconBriefcase size={24} stroke={1.8} />
            </Box>
            <Box className={styles.sectionTitleGroup}>
              <Text className={styles.sectionTitle}>
                {t('accountManagement.form.sectionEmployment') || 'Employment Details'}
              </Text>
              <Text className={styles.sectionDescription}>
                {t('accountManagement.form.sectionEmploymentDesc') || 'Staff ID and employment dates'}
              </Text>
            </Box>
          </Box>

          <Grid gutter="xl">
            <Grid.Col span={{ base: 12, lg: 6 }}>
              <EMRTextInput
                label={t('accountManagement.form.staffId')}
                placeholder={t('accountManagement.form.staffIdPlaceholder')}
                {...form.getInputProps('staffId')}
              />
            </Grid.Col>

            <Grid.Col span={{ base: 12, lg: 6 }}>
              <EMRDatePicker
                label={t('accountManagement.form.hireDate')}
                placeholder={t('accountManagement.form.hireDatePlaceholder')}
                {...form.getInputProps('hireDate')}
              />
            </Grid.Col>
          </Grid>
        </Box>

        {/* === SECTION 4: Role Assignment === */}
        <Box className={`${styles.formSection} ${styles.sectionRoles}`}>
          <Box className={styles.sectionHeader}>
            <Box className={`${styles.sectionIconWrapper} ${styles.iconRoles}`}>
              <IconShieldCheck size={24} stroke={1.8} />
            </Box>
            <Box className={styles.sectionTitleGroup} style={{ flex: 1 }}>
              <Text className={styles.sectionTitle}>
                {t('accountManagement.form.roleAssignment')}
              </Text>
              <Text className={styles.sectionDescription}>
                {t('accountManagement.form.sectionRolesDesc') || 'Assign roles and specialties to this user'}
              </Text>
            </Box>
            <Button
              leftSection={<IconPlus size={18} />}
              onClick={handleAddRole}
              size="sm"
              variant="light"
              className={styles.addRoleButton}
              style={{ width: 'auto', padding: '10px 20px', border: 'none' }}
            >
              {t('accountManagement.form.addRole')}
            </Button>
          </Box>

          {/* Role List */}
          {form.values.roles && form.values.roles.length > 0 ? (
            <Stack gap="lg">
              {form.values.roles.map((roleAssignment, index) => (
                <Box key={index} className={styles.roleCard}>
                  <Box className={styles.roleCardHeader}>
                    <Badge className={styles.roleBadge}>
                      {t('accountManagement.form.role')} {index + 1}
                    </Badge>
                    <ActionIcon
                      className={styles.roleRemoveButton}
                      onClick={() => handleRemoveRole(index)}
                      aria-label={t('accountManagement.form.removeRole')}
                    >
                      <IconTrash size={16} />
                    </ActionIcon>
                  </Box>

                  <Grid gutter="xl">
                    <Grid.Col span={{ base: 12, lg: 6 }}>
                      <EMRSelect
                        label={t('accountManagement.form.role')}
                        placeholder={t('accountManagement.form.selectRole')}
                        data={roleOptions}
                        searchable
                        value={roleAssignment.code}
                        onChange={(value) => handleRoleChange(index, 'code', value)}
                        required
                      />
                    </Grid.Col>

                    <Grid.Col span={{ base: 12, lg: 6 }}>
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
            <Box className={styles.emptyRolesState}>
              <Box className={styles.emptyRolesIcon}>
                <IconShieldCheck size={32} stroke={1.5} />
              </Box>
              <Text className={styles.emptyRolesText}>
                {t('accountManagement.form.noRoles')}
              </Text>
            </Box>
          )}
        </Box>

        {/* RBAC Role Assignment (AccessPolicy-based) */}
        <Box className={`${styles.formSection} ${styles.sectionRoles}`} style={{ marginTop: '-8px' }}>
          <RoleAssignmentPanel
            practitionerId={initialValues?.id}
            value={
              form.values.rbacRoles ||
              ([] as { roleId: string; roleName: string; roleCode: string }[])
            }
            onChange={(roles) => form.setFieldValue('rbacRoles', roles)}
          />
        </Box>

        {/* Role Conflict Alert */}
        {conflicts.length > 0 && (
          <RoleConflictAlert conflicts={conflicts} />
        )}

        {/* Permission Preview Accordion */}
        {roleIds.length > 0 && (
          <PermissionPreview
            permissions={permissions}
            loading={permissionsLoading}
            title={t('accountManagement.permissions.title')}
            defaultExpanded={false}
          />
        )}

        {/* Welcome Message Section (Optional, for new accounts) */}
        {!initialValues?.id && (
          <WelcomeMessageEditor
            value={form.values.welcomeMessage || ''}
            onChange={(value) => form.setFieldValue('welcomeMessage', value)}
            disabled={loading}
          />
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          size="xl"
          loading={loading}
          fullWidth
          className={styles.submitButton}
          style={{
            background: 'var(--emr-gradient-primary)',
            height: '64px',
            borderRadius: '16px',
            fontSize: '17px',
            fontWeight: 600,
            letterSpacing: '0.3px',
            boxShadow: '0 8px 24px rgba(26, 54, 93, 0.3), 0 4px 8px rgba(0, 0, 0, 0.12)',
            marginTop: '24px',
          }}
        >
          {t('accountManagement.form.save')}
        </Button>
      </Stack>
    </form>
  );
}
