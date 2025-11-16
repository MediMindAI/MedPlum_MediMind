// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { Stack, Title, Box, Paper } from '@mantine/core';
import { useState } from 'react';
import { IconUserPlus } from '@tabler/icons-react';
import { useTranslation } from '../../hooks/useTranslation';
import { PatientForm } from '../../components/registration/PatientForm';
import { PatientTable } from '../../components/registration/PatientTable';
import { SearchToggleButton } from '../../components/registration/SearchToggleButton';
import { SearchPanel } from '../../components/registration/SearchPanel';
import { RegistrationVisitModal } from '../../components/registration/RegistrationVisitModal';

interface SearchFilters {
  personalId?: string;
  firstName?: string;
  lastName?: string;
  registrationNumber?: string;
}

/**
 * Professional Unified Registration View
 * Modern, production-ready layout:
 * - Blue gradient search button on left border
 * - Slide-out search panel from left (separate overlay with different styling)
 * - Full-width registration form (patient addition window)
 * - Patient table (always visible below)
 */
export function UnifiedRegistrationView() {
  const { t } = useTranslation();
  const [refreshKey, setRefreshKey] = useState(0);
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({});
  const [searchPanelOpen, setSearchPanelOpen] = useState(false);
  const [visitModalOpen, setVisitModalOpen] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);

  const handlePatientChange = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const handleSearch = (filters: SearchFilters) => {
    setSearchFilters(filters);
    setRefreshKey((prev) => prev + 1);
    setSearchPanelOpen(false); // Close panel after search
  };

  /**
   * Handle patient row click - opens registration visit modal
   */
  const handlePatientClick = (patientId: string) => {
    setSelectedPatientId(patientId);
    setVisitModalOpen(true);
  };

  const handleVisitModalSuccess = () => {
    setVisitModalOpen(false);
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <Stack gap="xl" p="xl" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      {/* Search Panel - Slide-out Overlay */}
      <SearchPanel opened={searchPanelOpen} onClose={() => setSearchPanelOpen(false)} onSearch={handleSearch} />

      {/* Registration Form Section - Full Width */}
      <Paper
        shadow="sm"
        p="xl"
        radius="md"
        style={{
          background: 'white',
          border: '1px solid var(--emr-gray-200)',
          position: 'relative',
        }}
      >
        {/* Search Toggle Button - On Left Border of Paper */}
        <SearchToggleButton
          onClick={() => setSearchPanelOpen(true)}
          label={t('registration.sections.patientSearch') || 'ძიება'}
        />
        {/* Section Header */}
        <Box mb="xl" pb="md" style={{ borderBottom: '2px solid var(--emr-gray-200)' }}>
          <Box style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <IconUserPlus size={28} color="var(--emr-primary)" stroke={2} />
            <Title
              order={2}
              style={{
                color: 'var(--emr-primary)',
                fontWeight: 700,
                fontSize: '22px',
                letterSpacing: '-0.3px',
              }}
            >
              {t('registration.sections.addPatient') || 'პაციენტის დამატება'}
            </Title>
          </Box>
        </Box>

        {/* Patient Form - Full Width */}
        <PatientForm onSuccess={handlePatientChange} />
      </Paper>

      {/* Patient Table Section */}
      <Paper
        shadow="sm"
        p="xl"
        radius="md"
        style={{
          background: 'white',
          border: '1px solid var(--emr-gray-200)',
        }}
      >
        <PatientTable key={refreshKey} searchFilters={searchFilters} onPatientClick={handlePatientClick} />
      </Paper>

      {/* Registration Visit Modal */}
      <RegistrationVisitModal
        opened={visitModalOpen}
        onClose={() => setVisitModalOpen(false)}
        patientId={selectedPatientId}
        onSuccess={handleVisitModalSuccess}
      />
    </Stack>
  );
}
