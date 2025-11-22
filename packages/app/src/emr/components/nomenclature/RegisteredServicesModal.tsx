// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { Modal, Tabs, LoadingOverlay, Button, Group } from '@mantine/core';
import { IconCoin, IconUsers, IconFlask, IconPalette } from '@tabler/icons-react';
import type { JSX } from 'react';
import { useState, useEffect } from 'react';
import { useMedplum } from '@medplum/react-hooks';
import type { ActivityDefinition } from '@medplum/fhirtypes';
import { useTranslation } from '../../hooks/useTranslation';
import { FinancialTab } from './tabs/FinancialTab';
import { SalaryTab } from './tabs/SalaryTab';
import { MedicalTab } from './tabs/MedicalTab';
import { AttributesTab } from './tabs/AttributesTab';

interface RegisteredServicesModalProps {
  opened: boolean;
  onClose: () => void;
  serviceId: string | null;
  onSuccess: () => void;
}

/**
 * Registered Services Modal - Comprehensive 4-tab service configuration
 *
 * Tabs:
 * 1. Financial (ფინანსური) - Insurance-based pricing configuration
 * 2. Salary (სახელფასო) - Performer compensation and salary distribution
 * 3. Medical (სამედიცინო) - Samples, components, LIS integration
 * 4. Attributes (ატრიბუტები) - Color coding, online booking, equipment
 *
 * Following pattern from VisitEditModal for consistency
 * @param root0
 * @param root0.opened
 * @param root0.onClose
 * @param root0.serviceId
 * @param root0.onSuccess
 */
export function RegisteredServicesModal({
  opened,
  onClose,
  serviceId,
  onSuccess,
}: RegisteredServicesModalProps): JSX.Element {
  const { t } = useTranslation();
  const medplum = useMedplum();
  const [loading, setLoading] = useState(false);
  const [service, setService] = useState<ActivityDefinition | null>(null);
  const [activeTab, setActiveTab] = useState<string>('financial');

  /**
   * Fetch service data when modal opens
   */
  useEffect(() => {
    if (opened && serviceId) {
      setLoading(true);
      medplum
        .readResource('ActivityDefinition', serviceId)
        .then((data) => {
          setService(data);
        })
        .catch((error) => {
          console.error('Failed to load service:', error);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [opened, serviceId, medplum]);

  /**
   * Handle modal close - reset state
   */
  const handleClose = () => {
    setService(null);
    setActiveTab('financial');
    onClose();
  };

  /**
   * Handle save - called by individual tabs
   * @param updatedService
   */
  const handleSave = async (updatedService: ActivityDefinition) => {
    try {
      setLoading(true);
      await medplum.updateResource(updatedService);
      onSuccess();
      handleClose();
    } catch (error) {
      console.error('Failed to save service:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      size="90%"
      centered
      title={t('registeredServices.modal.title')}
      styles={{
        root: {
          zIndex: 9999,
        },
        inner: {
          paddingTop: '10px',
          paddingBottom: '10px',
          paddingLeft: '20px',
          paddingRight: '20px',
        },
        content: {
          maxHeight: 'calc(100vh - 20px)',
          height: 'calc(100vh - 20px)',
        },
        header: {
          borderBottom: '2px solid #e9ecef',
          paddingBottom: '16px',
          position: 'sticky',
          top: 0,
          backgroundColor: 'white',
          zIndex: 10000,
        },
        body: {
          height: 'calc(100vh - 160px)',
          overflowY: 'auto',
          padding: '24px',
        },
      }}
    >
      <LoadingOverlay visible={loading} />

      <Tabs value={activeTab} onChange={(value) => setActiveTab(value || 'financial')}>
        <Tabs.List>
          <Tabs.Tab value="financial" leftSection={<IconCoin size={16} />}>
            {t('registeredServices.tabs.financial')}
          </Tabs.Tab>
          <Tabs.Tab value="salary" leftSection={<IconUsers size={16} />}>
            {t('registeredServices.tabs.salary')}
          </Tabs.Tab>
          <Tabs.Tab value="medical" leftSection={<IconFlask size={16} />}>
            {t('registeredServices.tabs.medical')}
          </Tabs.Tab>
          <Tabs.Tab value="attributes" leftSection={<IconPalette size={16} />}>
            {t('registeredServices.tabs.attributes')}
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="financial" pt="md">
          {service && <FinancialTab service={service} onSave={handleSave} />}
        </Tabs.Panel>

        <Tabs.Panel value="salary" pt="md">
          {service && <SalaryTab service={service} onSave={handleSave} />}
        </Tabs.Panel>

        <Tabs.Panel value="medical" pt="md">
          {service && <MedicalTab service={service} onSave={handleSave} />}
        </Tabs.Panel>

        <Tabs.Panel value="attributes" pt="md">
          {service && <AttributesTab service={service} onSave={handleSave} />}
        </Tabs.Panel>
      </Tabs>

      {/* Modal Footer */}
      <Group justify="flex-end" mt="xl" pt="md" style={{ borderTop: '1px solid #e9ecef' }}>
        <Button variant="subtle" onClick={handleClose}>
          {t('registeredServices.modal.close')}
        </Button>
      </Group>
    </Modal>
  );
}
