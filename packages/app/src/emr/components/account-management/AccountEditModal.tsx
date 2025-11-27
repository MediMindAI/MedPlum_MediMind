// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { Modal, LoadingOverlay, Tabs, Box } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { useState, useEffect } from 'react';
import { useMedplum } from '@medplum/react-hooks';
import { IconUser, IconHistory, IconX, IconEdit } from '@tabler/icons-react';
import type { Practitioner, PractitionerRole } from '@medplum/fhirtypes';
import { AccountForm } from './AccountForm';
import { AccountAuditTimeline } from './AccountAuditTimeline';
import { useTranslation } from '../../hooks/useTranslation';
import { updatePractitioner, getPractitionerById } from '../../services/accountService';
import { practitionerToFormValues } from '../../services/accountHelpers';
import type { AccountFormValues, AccountRow } from '../../types/account-management';
import modalStyles from './CreateAccountModal.module.css';

interface AccountEditModalProps {
  account: AccountRow | null;
  opened: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

/**
 * Modal for editing practitioner accounts
 *
 * Features:
 * - Fetches full Practitioner + PractitionerRole resources on open
 * - Uses AccountForm component with multi-role support
 * - Shows success/error notifications
 * - Auto-refreshes table on success
 *
 * @param account - Account row to edit (or null)
 * @param account.account
 * @param opened - Modal open state
 * @param account.opened
 * @param onClose - Close callback
 * @param account.onClose
 * @param onSuccess - Success callback (triggers table refresh)
 * @param account.onSuccess
 */
export function AccountEditModal({
  account,
  opened,
  onClose,
  onSuccess,
}: AccountEditModalProps): JSX.Element {
  const medplum = useMedplum();
  const { t } = useTranslation();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [loading, setLoading] = useState(false);
  const [practitioner, setPractitioner] = useState<Practitioner | null>(null);
  const [roles, setRoles] = useState<PractitionerRole[]>([]);

  // Fetch full practitioner data and roles when modal opens
  useEffect(() => {
    if (!opened || !account) {
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        const fullPractitioner = await getPractitionerById(medplum, account.id);
        setPractitioner(fullPractitioner);

        // Fetch PractitionerRole resources for this practitioner
        const rolesBundle = await medplum.search('PractitionerRole', {
          practitioner: `Practitioner/${account.id}`,
        });
        const practitionerRoles = rolesBundle.entry?.map((e) => e.resource as PractitionerRole) || [];
        setRoles(practitionerRoles);
      } catch (error) {
        notifications.show({
          title: t('accountManagement.edit.error'),
          message: t('accountManagement.edit.loadError'),
          color: 'red',
        });
        onClose();
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [opened, account, medplum, t, onClose]);

  const handleSubmit = async (values: AccountFormValues) => {
    if (!practitioner) {return;}

    setLoading(true);
    try {
      await updatePractitioner(medplum, practitioner, values);

      notifications.show({
        title: t('accountManagement.edit.success'),
        message: t('accountManagement.edit.successMessage'),
        color: 'green',
      });

      onSuccess();
      onClose();
    } catch (error) {
      notifications.show({
        title: t('accountManagement.edit.error'),
        message: (error as Error).message || t('accountManagement.edit.errorMessage'),
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      size={isMobile ? '100%' : 1140}
      fullScreen={isMobile}
      centered
      padding={0}
      radius={isMobile ? 0 : 24}
      withCloseButton={false}
      zIndex={1100}
      transitionProps={{
        transition: 'fade',
        duration: 300,
        timingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
      }}
      overlayProps={{
        backgroundOpacity: 0.65,
        blur: 12,
      }}
      styles={{
        content: {
          background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1)',
        },
        body: { padding: 0 },
        inner: { padding: isMobile ? 0 : '20px' },
      }}
      // Ensure date picker and other popovers appear above modal
      portalProps={{
        target: typeof document !== 'undefined' ? document.body : undefined,
      }}
    >
      {/* Premium Header */}
      <Box className={modalStyles.modalHeader}>
        <div className={modalStyles.modalTitle}>
          <div className={modalStyles.modalTitleIcon}>
            <IconEdit size={28} stroke={2.5} />
          </div>
          <div>
            <div>{t('accountManagement.edit.title')}</div>
            <div className={modalStyles.modalSubtitle}>
              {t('accountManagement.edit.subtitle')}
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          className={modalStyles.modalCloseButton}
          aria-label="Close modal"
        >
          <IconX size={20} stroke={2.5} />
        </button>
      </Box>

      {/* Premium Body */}
      <Box className={modalStyles.modalBody}>
        <LoadingOverlay visible={loading && !practitioner} />
        {practitioner && (
          <Tabs defaultValue="details" variant="pills">
            <Tabs.List mb="lg">
              <Tabs.Tab value="details" leftSection={<IconUser size={16} />}>
                {t('accountManagement.edit.detailsTab')}
              </Tabs.Tab>
              <Tabs.Tab value="audit" leftSection={<IconHistory size={16} />}>
                {t('accountManagement.edit.auditTab')}
              </Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="details">
              <AccountForm
                onSubmit={handleSubmit}
                initialValues={practitionerToFormValues(practitioner, roles)}
                loading={loading}
              />
            </Tabs.Panel>

            <Tabs.Panel value="audit">
              <AccountAuditTimeline practitionerId={practitioner.id || ''} />
            </Tabs.Panel>
          </Tabs>
        )}
      </Box>
    </Modal>
  );
}
