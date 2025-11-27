// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { Stack, Paper, Text, Group, Grid, Box, Badge } from '@mantine/core';
import { IconInfoCircle, IconServer, IconBuildingHospital, IconCalendar } from '@tabler/icons-react';
import { useMedplum } from '@medplum/react-hooks';
import { useTranslation } from '../../../../hooks/useTranslation';
import '../../../../styles/theme.css';

/**
 * GeneralSettingsTab - Display system information and organization settings
 *
 * Features:
 * - Application information (name, version, environment)
 * - Server connection details
 * - Organization information
 * - Last sync date
 * - Read-only display (future: editable settings)
 */
export function GeneralSettingsTab(): JSX.Element {
  const { t } = useTranslation();
  const medplum = useMedplum();

  // Get system information
  const appName = 'MediMind EMR';
  const appVersion = '5.0.2'; // From package.json
  const environment = import.meta.env.MODE === 'production' ? 'Production' : 'Development';
  const serverUrl = medplum.getBaseUrl();
  const lastSync = new Date().toLocaleString('ka-GE'); // Current date as placeholder

  // Get organization info (from Medplum profile if available)
  const profile = medplum.getProfile();
  const organizationName = profile?.meta?.project || 'MediMind Healthcare';
  const organizationContact = 'info@medimind.ge';
  const organizationAddress = 'Tbilisi, Georgia';

  // Info row component - uses component="div" to avoid <p> containing <div> issues
  const InfoRow = ({ label, value, icon }: { label: string; value: React.ReactNode; icon?: React.ReactNode }) => (
    <Group gap="md" wrap="nowrap" align="flex-start">
      {icon && (
        <Box
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, rgba(43, 108, 176, 0.1) 0%, rgba(99, 179, 237, 0.1) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {icon}
        </Box>
      )}
      <Box style={{ flex: 1, minWidth: 0 }}>
        <Text
          size="xs"
          fw={500}
          c="var(--emr-text-secondary)"
          component="div"
          style={{ textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}
        >
          {label}
        </Text>
        <Text
          size="sm"
          fw={600}
          c="var(--emr-text-primary)"
          component="div"
          style={{
            wordBreak: 'break-word',
            fontFamily: typeof value === 'string' && value.includes('http') ? 'monospace' : 'inherit',
          }}
        >
          {value}
        </Text>
      </Box>
    </Group>
  );

  return (
    <Stack gap="lg">
      {/* System Information Section */}
      <Paper
        p="lg"
        style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.6)',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04), 0 4px 16px rgba(26, 54, 93, 0.06)',
        }}
      >
        <Group gap="md" align="center" mb="lg">
          <Box
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'var(--emr-gradient-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <IconInfoCircle size={20} stroke={2} color="white" />
          </Box>
          <Text fw={600} size="sm" c="var(--emr-text-primary)" style={{ letterSpacing: '-0.2px' }}>
            {t('settings.general.systemInfo')}
          </Text>
        </Group>

        <Stack gap="md">
          <InfoRow label={t('settings.general.appName')} value={appName} />
          <InfoRow
            label={t('settings.general.version')}
            value={
              <Group gap="xs">
                <span>{appVersion}</span>
                <Badge
                  size="sm"
                  variant="light"
                  color={environment === 'Production' ? 'green' : 'blue'}
                  style={{ fontWeight: 600 }}
                >
                  {t('settings.general.environment')}: {environment}
                </Badge>
              </Group>
            }
          />
          <InfoRow
            label={t('settings.general.serverUrl')}
            value={serverUrl}
            icon={<IconServer size={18} stroke={2} color="var(--emr-secondary)" />}
          />
          <InfoRow
            label={t('settings.general.lastSync')}
            value={lastSync}
            icon={<IconCalendar size={18} stroke={2} color="var(--emr-secondary)" />}
          />
        </Stack>
      </Paper>

      {/* Organization Information Section */}
      <Paper
        p="lg"
        style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.6)',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04), 0 4px 16px rgba(26, 54, 93, 0.06)',
        }}
      >
        <Group gap="md" align="center" mb="lg">
          <Box
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'var(--emr-gradient-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <IconBuildingHospital size={20} stroke={2} color="white" />
          </Box>
          <Text fw={600} size="sm" c="var(--emr-text-primary)" style={{ letterSpacing: '-0.2px' }}>
            {t('settings.general.organization')}
          </Text>
        </Group>

        <Grid gutter="md">
          <Grid.Col span={{ base: 12, md: 6 }}>
            <InfoRow label={t('common.name')} value={organizationName} />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <InfoRow label={t('common.email')} value={organizationContact} />
          </Grid.Col>
          <Grid.Col span={12}>
            <InfoRow label={t('common.address')} value={organizationAddress} />
          </Grid.Col>
        </Grid>
      </Paper>

      {/* Future Settings Notice */}
      <Paper
        p="md"
        style={{
          background: 'rgba(99, 179, 237, 0.05)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          borderRadius: '12px',
          border: '1px solid rgba(99, 179, 237, 0.2)',
        }}
      >
        <Text size="xs" c="var(--emr-text-secondary)" ta="center" style={{ fontStyle: 'italic' }}>
          {t('settings.general.futureEditable')}
        </Text>
      </Paper>
    </Stack>
  );
}
