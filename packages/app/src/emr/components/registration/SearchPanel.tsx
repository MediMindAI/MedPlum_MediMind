// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { Box, Stack, TextInput, Button, ActionIcon, Group, Text } from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconX, IconSearch, IconEraser } from '@tabler/icons-react';
import { useTranslation } from '../../hooks/useTranslation';

interface SearchFilters {
  personalId?: string;
  firstName?: string;
  lastName?: string;
  registrationNumber?: string;
}

interface SearchPanelProps {
  opened: boolean;
  onClose: () => void;
  onSearch: (filters: SearchFilters) => void;
}

/**
 * Professional slide-out search panel
 */
export function SearchPanel({ opened, onClose, onSearch }: SearchPanelProps) {
  const { t } = useTranslation();

  const form = useForm({
    initialValues: {
      personalId: '',
      firstName: '',
      lastName: '',
      registrationNumber: '',
    },
  });

  const handleSearch = (values: typeof form.values) => {
    const filters: SearchFilters = {};
    if (values.personalId.trim()) filters.personalId = values.personalId.trim();
    if (values.firstName.trim()) filters.firstName = values.firstName.trim();
    if (values.lastName.trim()) filters.lastName = values.lastName.trim();
    if (values.registrationNumber.trim()) filters.registrationNumber = values.registrationNumber.trim();

    onSearch(filters);
  };

  const handleClear = () => {
    form.reset();
    onSearch({});
  };

  return (
    <>
      {/* Backdrop Overlay */}
      {opened && (
        <Box
          onClick={onClose}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.4)',
            zIndex: 998,
            transition: 'opacity 0.3s ease',
            opacity: opened ? 1 : 0,
          }}
        />
      )}

      {/* Slide-out Panel */}
      <Box
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          width: '360px',
          background: 'white',
          boxShadow: '4px 0 24px rgba(0, 0, 0, 0.15)',
          zIndex: 999,
          transform: opened ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          overflowY: 'auto',
        }}
      >
        {/* Panel Header */}
        <Box
          style={{
            background: 'linear-gradient(135deg, #2b6cb0 0%, #3182ce 100%)',
            padding: '20px 24px',
            position: 'sticky',
            top: 0,
            zIndex: 1,
          }}
        >
          <Group justify="space-between" align="center">
            <Group gap="sm">
              <IconSearch size={24} color="white" stroke={2} />
              <Text size="lg" fw={700} c="white">
                {t('registration.search.title') || 'პაციენტის ძიება'}
              </Text>
            </Group>
            <ActionIcon
              variant="transparent"
              onClick={onClose}
              size="lg"
              style={{ color: 'white' }}
            >
              <IconX size={24} stroke={2.5} />
            </ActionIcon>
          </Group>
        </Box>

        {/* Panel Content */}
        <Box p="xl">
          <form onSubmit={form.onSubmit(handleSearch)}>
            <Stack gap="md">
              <TextInput
                label={t('registration.search.personalId') || 'პირადი ნომერი'}
                placeholder="01234567891"
                {...form.getInputProps('personalId')}
                styles={{
                  input: {
                    borderRadius: '8px',
                    fontSize: '14px',
                    '&:focus': {
                      borderColor: 'var(--emr-secondary)',
                      boxShadow: '0 0 0 2px rgba(43, 108, 176, 0.1)',
                    },
                  },
                  label: {
                    fontWeight: 600,
                    marginBottom: '6px',
                    color: 'var(--emr-text-primary)',
                  },
                }}
              />

              <TextInput
                label={t('registration.search.firstName') || 'სახელი'}
                placeholder="სახელი"
                {...form.getInputProps('firstName')}
                styles={{
                  input: {
                    borderRadius: '8px',
                    fontSize: '14px',
                    '&:focus': {
                      borderColor: 'var(--emr-secondary)',
                      boxShadow: '0 0 0 2px rgba(43, 108, 176, 0.1)',
                    },
                  },
                  label: {
                    fontWeight: 600,
                    marginBottom: '6px',
                    color: 'var(--emr-text-primary)',
                  },
                }}
              />

              <TextInput
                label={t('registration.search.lastName') || 'გვარი'}
                placeholder="გვარი"
                {...form.getInputProps('lastName')}
                styles={{
                  input: {
                    borderRadius: '8px',
                    fontSize: '14px',
                    '&:focus': {
                      borderColor: 'var(--emr-secondary)',
                      boxShadow: '0 0 0 2px rgba(43, 108, 176, 0.1)',
                    },
                  },
                  label: {
                    fontWeight: 600,
                    marginBottom: '6px',
                    color: 'var(--emr-text-primary)',
                  },
                }}
              />

              <TextInput
                label={t('registration.search.registrationNumber') || 'რეგისტრაციის ნომერი'}
                placeholder="10357-2025"
                {...form.getInputProps('registrationNumber')}
                styles={{
                  input: {
                    borderRadius: '8px',
                    fontSize: '14px',
                    '&:focus': {
                      borderColor: 'var(--emr-secondary)',
                      boxShadow: '0 0 0 2px rgba(43, 108, 176, 0.1)',
                    },
                  },
                  label: {
                    fontWeight: 600,
                    marginBottom: '6px',
                    color: 'var(--emr-text-primary)',
                  },
                }}
              />

              <Group grow mt="md">
                <Button
                  type="button"
                  variant="outline"
                  leftSection={<IconEraser size={18} />}
                  onClick={handleClear}
                  styles={{
                    root: {
                      borderRadius: '8px',
                      borderColor: 'var(--emr-gray-400)',
                      color: 'var(--emr-text-primary)',
                      '&:hover': {
                        background: 'var(--emr-gray-100)',
                      },
                    },
                  }}
                >
                  {t('registration.action.clear') || 'გასუფთავება'}
                </Button>

                <Button
                  type="submit"
                  leftSection={<IconSearch size={18} />}
                  style={{
                    background: 'linear-gradient(135deg, #2b6cb0 0%, #3182ce 100%)',
                    borderRadius: '8px',
                  }}
                >
                  {t('registration.action.search') || 'ძიება'}
                </Button>
              </Group>
            </Stack>
          </form>
        </Box>
      </Box>
    </>
  );
}
