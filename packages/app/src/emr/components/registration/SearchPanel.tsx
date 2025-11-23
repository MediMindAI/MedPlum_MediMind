// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { Box, Stack, Button, ActionIcon, Group, Text } from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconX, IconSearch, IconEraser } from '@tabler/icons-react';
import { useTranslation } from '../../hooks/useTranslation';
import { EMRTextInput } from '../shared/EMRFormFields';

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
 * Centered modal search panel with refined design
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
    if (values.personalId.trim()) {filters.personalId = values.personalId.trim();}
    if (values.firstName.trim()) {filters.firstName = values.firstName.trim();}
    if (values.lastName.trim()) {filters.lastName = values.lastName.trim();}
    if (values.registrationNumber.trim()) {filters.registrationNumber = values.registrationNumber.trim();}

    onSearch(filters);
  };

  const handleClear = () => {
    form.reset();
    onSearch({});
  };

  if (!opened) {return null;}

  return (
    <>
      {/* Backdrop Overlay */}
      <Box
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(26, 54, 93, 0.5)',
          backdropFilter: 'blur(4px)',
          zIndex: 998,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Centered Modal */}
        <Box
          onClick={(e) => e.stopPropagation()}
          style={{
            width: '420px',
            maxWidth: '90vw',
            background: 'white',
            borderRadius: '12px',
            boxShadow: '0 20px 60px rgba(26, 54, 93, 0.3)',
            zIndex: 999,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Modal Header */}
          <Box
            style={{
              background: 'linear-gradient(180deg, #1a365d 0%, #1e4175 100%)',
              padding: '16px 20px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <Group justify="space-between" align="center">
              <Group gap="sm">
                <Box
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, rgba(99, 179, 237, 0.3) 0%, rgba(99, 179, 237, 0.1) 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                  }}
                >
                  <IconSearch size={16} color="white" stroke={2} />
                </Box>
                <Box>
                  <Text size="sm" fw={600} c="white" style={{ lineHeight: 1.2 }}>
                    {t('registration.search.title')}
                  </Text>
                  <Text size="xs" c="rgba(255, 255, 255, 0.6)" mt={2}>
                    Patient Search
                  </Text>
                </Box>
              </Group>
              <ActionIcon
                variant="subtle"
                onClick={onClose}
                size="md"
                radius="xl"
                style={{
                  color: 'rgba(255, 255, 255, 0.7)',
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                <IconX size={16} stroke={2} />
              </ActionIcon>
            </Group>
          </Box>

          {/* Modal Content */}
          <Box p="lg">
            <form onSubmit={form.onSubmit(handleSearch)}>
              <Stack gap="md">
                <EMRTextInput
                  label={t('registration.search.personalId')}
                  placeholder="01234567891"
                  {...form.getInputProps('personalId')}
                />

                <EMRTextInput
                  label={t('registration.search.firstName')}
                  placeholder={t('registration.search.firstNamePlaceholder')}
                  {...form.getInputProps('firstName')}
                />

                <EMRTextInput
                  label={t('registration.search.lastName')}
                  placeholder={t('registration.search.lastNamePlaceholder')}
                  {...form.getInputProps('lastName')}
                />

                <EMRTextInput
                  label={t('registration.search.registrationNumber')}
                  placeholder="10357-2025"
                  {...form.getInputProps('registrationNumber')}
                />
              </Stack>
            </form>
          </Box>

          {/* Modal Footer */}
          <Box
            style={{
              padding: '16px 20px',
              borderTop: '1px solid #e5e7eb',
              background: 'linear-gradient(180deg, #fafbfc 0%, #f3f4f6 100%)',
            }}
          >
            <Group grow gap="md">
              <Button
                type="button"
                variant="outline"
                leftSection={<IconEraser size={14} />}
                onClick={handleClear}
                size="sm"
                styles={{
                  root: {
                    borderRadius: '8px',
                    borderColor: '#d1d5db',
                    color: '#4b5563',
                    fontWeight: 500,
                    height: '38px',
                    fontSize: 'var(--emr-font-sm)',
                    '&:hover': {
                      background: '#f3f4f6',
                      borderColor: '#9ca3af',
                    },
                  },
                }}
              >
                {t('common.clear')}
              </Button>

              <Button
                type="submit"
                leftSection={<IconSearch size={14} />}
                onClick={form.onSubmit(handleSearch)}
                size="sm"
                styles={{
                  root: {
                    background: 'linear-gradient(135deg, #1a365d 0%, #2b6cb0 100%)',
                    borderRadius: '8px',
                    fontWeight: 600,
                    height: '38px',
                    fontSize: 'var(--emr-font-sm)',
                    boxShadow: '0 4px 12px rgba(26, 54, 93, 0.25)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #1e4175 0%, #3182ce 100%)',
                      boxShadow: '0 6px 16px rgba(26, 54, 93, 0.3)',
                    },
                  },
                }}
              >
                {t('common.search')}
              </Button>
            </Group>
          </Box>
        </Box>
      </Box>
    </>
  );
}
