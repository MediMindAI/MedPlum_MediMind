/**
 * useDeactivation Hook
 *
 * Manages practitioner account deactivation/reactivation workflow
 * Handles modal state, API calls, and notifications
 */

import { useState } from 'react';
import { useMedplum } from '@medplum/react-hooks';
import { notifications } from '@mantine/notifications';
import { deactivatePractitioner, reactivatePractitioner } from '../services/accountService';
import { useTranslation } from './useTranslation';
import type { AccountRow } from '../types/account-management';

interface UseDeactivationReturn {
  isDeactivating: boolean;
  targetAccount: AccountRow | null;
  deactivationModalOpened: boolean;
  openDeactivationModal: (account: AccountRow) => void;
  closeDeactivationModal: () => void;
  handleDeactivate: (reason?: string) => Promise<void>;
  handleReactivate: (account: AccountRow) => Promise<void>;
}

/**
 * Hook for managing deactivation workflow
 *
 * Features:
 * - Modal state management
 * - Deactivation with audit trail
 * - Reactivation with audit trail
 * - Self-deactivation prevention
 * - Success/error notifications
 * - Callback support for table refresh
 *
 * @param onSuccess - Callback after successful deactivation/reactivation
 * @returns Deactivation state and handlers
 */
export function useDeactivation(onSuccess?: () => void): UseDeactivationReturn {
  const medplum = useMedplum();
  const { t } = useTranslation();

  const [isDeactivating, setIsDeactivating] = useState(false);
  const [targetAccount, setTargetAccount] = useState<AccountRow | null>(null);
  const [deactivationModalOpened, setDeactivationModalOpened] = useState(false);

  /**
   * Open deactivation confirmation modal
   */
  const openDeactivationModal = (account: AccountRow) => {
    setTargetAccount(account);
    setDeactivationModalOpened(true);
  };

  /**
   * Close deactivation modal
   */
  const closeDeactivationModal = () => {
    setTargetAccount(null);
    setDeactivationModalOpened(false);
  };

  /**
   * Deactivate account
   */
  const handleDeactivate = async (reason?: string) => {
    if (!targetAccount) return;

    setIsDeactivating(true);
    try {
      await deactivatePractitioner(medplum, targetAccount.id, reason);

      notifications.show({
        title: t('accountManagement.deactivate.success'),
        message: t('accountManagement.deactivateSuccess'),
        color: 'green',
      });

      closeDeactivationModal();
      onSuccess?.();
    } catch (error) {
      notifications.show({
        title: t('accountManagement.deactivate.error'),
        message: (error as Error).message || t('accountManagement.deactivateError'),
        color: 'red',
      });
    } finally {
      setIsDeactivating(false);
    }
  };

  /**
   * Reactivate account
   */
  const handleReactivate = async (account: AccountRow) => {
    setIsDeactivating(true);
    try {
      await reactivatePractitioner(medplum, account.id);

      notifications.show({
        title: t('accountManagement.reactivate.success'),
        message: t('accountManagement.reactivateSuccess'),
        color: 'green',
      });

      onSuccess?.();
    } catch (error) {
      notifications.show({
        title: t('accountManagement.reactivate.error'),
        message: (error as Error).message || t('accountManagement.reactivateError'),
        color: 'red',
      });
    } finally {
      setIsDeactivating(false);
    }
  };

  return {
    isDeactivating,
    targetAccount,
    deactivationModalOpened,
    openDeactivationModal,
    closeDeactivationModal,
    handleDeactivate,
    handleReactivate,
  };
}
