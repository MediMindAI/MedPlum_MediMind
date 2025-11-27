// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { Stack, Paper, Text, Group, Box, Accordion, Badge } from '@mantine/core';
import {
  IconSettings,
  IconUserPlus,
  IconHistory,
  IconCash,
  IconFlask,
  IconFileAnalytics,
} from '@tabler/icons-react';
import { useTranslation } from '../../../../hooks/useTranslation';
import '../../../../styles/theme.css';

/**
 * SystemParametersTab - System configuration parameters (placeholder)
 *
 * Features:
 * - Placeholder for future system parameters
 * - Categories displayed as expandable accordion sections:
 *   - Registration parameters
 *   - Patient history parameters
 *   - Billing parameters
 *   - Laboratory parameters
 *   - Report parameters
 * - Each shows "Coming soon" or "Under development" message
 * - Clean UI with accordion layout
 */
export function SystemParametersTab(): JSX.Element {
  const { t } = useTranslation();

  // Parameter categories
  const categories = [
    {
      id: 'registration',
      title: t('settings.parameters.registration'),
      icon: IconUserPlus,
      color: 'var(--emr-primary)',
      description: t('settings.parameters.registrationDesc'),
    },
    {
      id: 'patientHistory',
      title: t('settings.parameters.patientHistory'),
      icon: IconHistory,
      color: 'var(--emr-secondary)',
      description: t('settings.parameters.patientHistoryDesc'),
    },
    {
      id: 'billing',
      title: t('settings.parameters.billing'),
      icon: IconCash,
      color: '#2f9e44',
      description: t('settings.parameters.billingDesc'),
    },
    {
      id: 'laboratory',
      title: t('settings.parameters.laboratory'),
      icon: IconFlask,
      color: '#f59f00',
      description: t('settings.parameters.laboratoryDesc'),
    },
    {
      id: 'reports',
      title: t('settings.parameters.reports'),
      icon: IconFileAnalytics,
      color: '#d6336c',
      description: t('settings.parameters.reportsDesc'),
    },
  ];

  return (
    <Stack gap="lg">
      {/* Header Section */}
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
        <Group gap="md" align="center">
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
            <IconSettings size={20} stroke={2} color="white" />
          </Box>
          <Box style={{ flex: 1 }}>
            <Text fw={600} size="sm" c="var(--emr-text-primary)" style={{ letterSpacing: '-0.2px' }}>
              {t('settings.parameters.title')}
            </Text>
            <Text size="xs" c="var(--emr-text-secondary)" mt={4}>
              {t('settings.parameters.subtitle')}
            </Text>
          </Box>
        </Group>
      </Paper>

      {/* Parameter Categories */}
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
        <Accordion
          variant="separated"
          styles={{
            item: {
              background: 'rgba(255, 255, 255, 0.5)',
              border: '1px solid var(--emr-gray-200)',
              borderRadius: '12px',
              overflow: 'hidden',
              marginBottom: '12px',
            },
            control: {
              padding: '16px 20px',
              '&:hover': {
                background: 'rgba(99, 179, 237, 0.05)',
              },
            },
            label: {
              fontSize: '14px',
              fontWeight: 600,
            },
            content: {
              padding: '16px 20px',
              borderTop: '1px solid var(--emr-gray-200)',
            },
          }}
        >
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <Accordion.Item key={category.id} value={category.id}>
                <Accordion.Control>
                  <Group gap="md" wrap="nowrap">
                    <Box
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '10px',
                        background: `linear-gradient(135deg, ${category.color}10 0%, ${category.color}20 100%)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <Icon size={20} stroke={2} color={category.color} />
                    </Box>
                    <Box style={{ flex: 1, minWidth: 0 }}>
                      <Text size="sm" fw={600} c="var(--emr-text-primary)">
                        {category.title}
                      </Text>
                      <Text size="xs" c="var(--emr-text-secondary)" mt={2}>
                        {category.description}
                      </Text>
                    </Box>
                    <Badge
                      size="sm"
                      variant="light"
                      color="blue"
                      style={{ fontWeight: 600, flexShrink: 0 }}
                    >
                      {t('settings.parameters.comingSoon')}
                    </Badge>
                  </Group>
                </Accordion.Control>
                <Accordion.Panel>
                  <Stack gap="md">
                    {/* Placeholder content */}
                    <Paper
                      p="md"
                      style={{
                        background: 'rgba(99, 179, 237, 0.03)',
                        borderRadius: '8px',
                        border: '1px dashed var(--emr-gray-300)',
                      }}
                    >
                      <Text size="sm" c="var(--emr-text-secondary)" ta="center" style={{ fontStyle: 'italic' }}>
                        {t('settings.parameters.underDevelopment')}
                      </Text>
                    </Paper>

                    {/* Future parameter examples (commented out) */}
                    {/*
                    <Group gap="sm" wrap="wrap">
                      <Badge size="sm" variant="outline">Auto-save interval</Badge>
                      <Badge size="sm" variant="outline">Default values</Badge>
                      <Badge size="sm" variant="outline">Validation rules</Badge>
                      <Badge size="sm" variant="outline">Print settings</Badge>
                    </Group>
                    */}
                  </Stack>
                </Accordion.Panel>
              </Accordion.Item>
            );
          })}
        </Accordion>
      </Paper>

      {/* Development Notice */}
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
          {t('settings.parameters.futureConfig')}
        </Text>
      </Paper>
    </Stack>
  );
}
