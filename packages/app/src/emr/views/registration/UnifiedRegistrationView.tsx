// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { Stack, Box, Text, Badge } from '@mantine/core';
import { useState, useEffect } from 'react';
import { IconUserPlus, IconUsers, IconSearch } from '@tabler/icons-react';
import { useTranslation } from '../../hooks/useTranslation';
import { PatientForm } from '../../components/registration/PatientForm';
import { PatientTable } from '../../components/registration/PatientTable';
import { SearchPanel } from '../../components/registration/SearchPanel';
import { RegistrationVisitModal } from '../../components/registration/RegistrationVisitModal';

// Import premium styles
import '../../styles/registration-premium.css';

interface SearchFilters {
  personalId?: string;
  firstName?: string;
  lastName?: string;
  registrationNumber?: string;
}

/**
 * Premium Unified Registration View
 * Aesthetic: "Clinical Elegance with Georgian Soul"
 * Features:
 * - Refined card-based layout with elegant shadows
 * - Staggered fade-in animations
 * - Premium header with decorative accent
 * - Floating quick stats panel (desktop)
 * - Smooth micro-interactions throughout
 */
export function UnifiedRegistrationView() {
  const { t } = useTranslation();
  const [refreshKey, setRefreshKey] = useState(0);
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({});
  const [searchPanelOpen, setSearchPanelOpen] = useState(false);
  const [visitModalOpen, setVisitModalOpen] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [patientCount, setPatientCount] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  // Trigger entrance animation
  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const handlePatientChange = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const handleSearch = (filters: SearchFilters) => {
    setSearchFilters(filters);
    setRefreshKey((prev) => prev + 1);
    setSearchPanelOpen(false);
  };

  const handlePatientClick = (patientId: string) => {
    setSelectedPatientId(patientId);
    setVisitModalOpen(true);
  };

  const handleVisitModalSuccess = () => {
    setVisitModalOpen(false);
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <Box className="registration-page">
      {/* Search Panel - Slide-out Overlay */}
      <SearchPanel opened={searchPanelOpen} onClose={() => setSearchPanelOpen(false)} onSearch={handleSearch} />

<Stack
        gap="xl"
        style={{
          width: '100%',
          margin: '0 auto',
          opacity: isLoaded ? 1 : 0,
          transform: isLoaded ? 'translateY(0)' : 'translateY(20px)',
          transition: 'all 400ms cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {/* Registration Form Card - Premium Design */}
        <Box className="registration-card">
          {/* Premium Header with Decorative Accent */}
          <Box className="registration-header">
            <Box className="registration-header-icon">
              <IconUserPlus size={24} stroke={2} />
            </Box>
            <Box>
              <Text className="registration-header-title">
                {t('registration.sections.addPatient') || 'პაციენტის დამატება'}
              </Text>
              <Text className="registration-header-subtitle">
                {t('registration.headerSubtitle') || 'შეავსეთ პაციენტის მონაცემები რეგისტრაციისთვის'}
              </Text>
            </Box>

            {/* Search Badge Button */}
            <Badge
              size="lg"
              radius="md"
              variant="light"
              leftSection={<IconSearch size={14} />}
              onClick={() => setSearchPanelOpen(true)}
              style={{
                marginLeft: 'auto',
                cursor: 'pointer',
                background: 'rgba(255, 255, 255, 0.15)',
                color: 'white',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                backdropFilter: 'blur(8px)',
                padding: '8px 16px',
                height: 'auto',
                transition: 'all 200ms ease',
                zIndex: 1,
              }}
              styles={{
                root: {
                  '&:hover': {
                    background: 'rgba(255, 255, 255, 0.25)',
                    transform: 'translateY(-1px)',
                  },
                },
              }}
            >
              {t('registration.sections.patientSearch') || 'ძიება'}
            </Badge>
          </Box>

          {/* Form Content Area */}
          <Box className="registration-form-content">
            <PatientForm onSuccess={handlePatientChange} />
          </Box>
        </Box>

        {/* Patient Table Card - Premium Design */}
        <Box
          className="registration-card"
          style={{
            animationDelay: '150ms',
          }}
        >
          {/* Table Header */}
          <Box className="patient-table-header">
            <Box className="patient-table-title">
              <IconUsers size={18} stroke={2} color="var(--emr-secondary)" />
              <span>{t('registration.registeredPatients') || 'რეგისტრირებული პაციენტები'}</span>
            </Box>
            <Box className="patient-count-badge">{patientCount}</Box>
          </Box>

          {/* Table Content */}
          <Box p="md">
            <PatientTable
              key={refreshKey}
              searchFilters={searchFilters}
              onPatientClick={handlePatientClick}
              onCountChange={setPatientCount}
            />
          </Box>
        </Box>
      </Stack>

      {/* Registration Visit Modal */}
      <RegistrationVisitModal
        opened={visitModalOpen}
        onClose={() => setVisitModalOpen(false)}
        patientId={selectedPatientId}
        onSuccess={handleVisitModalSuccess}
      />
    </Box>
  );
}
