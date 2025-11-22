// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { Modal, Button, LoadingOverlay } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useState, useEffect } from 'react';
import { useMedplum } from '@medplum/react-hooks';
import type { Practitioner, PractitionerRole } from '@medplum/fhirtypes';
import { AccountForm } from './AccountForm';
import { useTranslation } from '../../hooks/useTranslation';
import { updatePractitioner, getPractitionerById } from '../../services/accountService';
import { practitionerToFormValues } from '../../services/accountHelpers';
import type { AccountFormValues, AccountRow } from '../../types/account-management';

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
      title={t('accountManagement.edit.title')}
      size="xl"
      centered
      styles={{
        root: { zIndex: 10000 },
        inner: { zIndex: 10000 },
      }}
    >
      <LoadingOverlay visible={loading && !practitioner} />
      {practitioner && (
        <AccountForm
          onSubmit={handleSubmit}
          initialValues={practitionerToFormValues(practitioner, roles)}
          loading={loading}
        />
      )}
    </Modal>
  );
}
