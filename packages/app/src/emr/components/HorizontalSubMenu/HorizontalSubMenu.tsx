// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { Box, UnstyledButton, ScrollArea } from '@mantine/core';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';
import styles from './HorizontalSubMenu.module.css';

interface SubMenuItem {
  key: string;
  translationKey: string;
  path: string;
}

const registrationSubMenu: SubMenuItem[] = [
  { key: 'registration', translationKey: 'submenu.registration.registration', path: '/emr/registration/registration' },
  { key: 'contracts', translationKey: 'submenu.registration.contracts', path: '/emr/registration/contracts' },
  { key: 'inpatient', translationKey: 'submenu.registration.inpatient', path: '/emr/registration/inpatient' },
  { key: 'debts', translationKey: 'submenu.registration.debts', path: '/emr/registration/debts' },
  { key: 'advances', translationKey: 'submenu.registration.advances', path: '/emr/registration/advances' },
  { key: 'archive', translationKey: 'submenu.registration.archive', path: '/emr/registration/archive' },
  { key: 'referrals', translationKey: 'submenu.registration.referrals', path: '/emr/registration/referrals' },
  { key: 'currency', translationKey: 'submenu.registration.currency', path: '/emr/registration/currency' },
];

const patientHistorySubMenu: SubMenuItem[] = [
  { key: 'history', translationKey: 'submenu.patientHistory.history', path: '/emr/patient-history/history' },
  { key: 'myPatients', translationKey: 'submenu.patientHistory.myPatients', path: '/emr/patient-history/my-patients' },
  { key: 'surrogacy', translationKey: 'submenu.patientHistory.surrogacy', path: '/emr/patient-history/surrogacy' },
  { key: 'invoices', translationKey: 'submenu.patientHistory.invoices', path: '/emr/patient-history/invoices' },
  { key: 'form100', translationKey: 'submenu.patientHistory.form100', path: '/emr/patient-history/form-100' },
  { key: 'prescriptions', translationKey: 'submenu.patientHistory.prescriptions', path: '/emr/patient-history/prescriptions' },
  { key: 'execution', translationKey: 'submenu.patientHistory.execution', path: '/emr/patient-history/execution' },
  { key: 'laboratory', translationKey: 'submenu.patientHistory.laboratory', path: '/emr/patient-history/laboratory' },
  { key: 'duty', translationKey: 'submenu.patientHistory.duty', path: '/emr/patient-history/duty' },
  { key: 'appointments', translationKey: 'submenu.patientHistory.appointments', path: '/emr/patient-history/appointments' },
  { key: 'hospital', translationKey: 'submenu.patientHistory.hospital', path: '/emr/patient-history/hospital' },
  { key: 'nutrition', translationKey: 'submenu.patientHistory.nutrition', path: '/emr/patient-history/nutrition' },
  { key: 'moh', translationKey: 'submenu.patientHistory.moh', path: '/emr/patient-history/moh' },
];

const nomenclatureSubMenu: SubMenuItem[] = [
  { key: 'medical1', translationKey: 'submenu.nomenclature.medical1', path: '/emr/nomenclature/medical-1' },
  { key: 'medical2', translationKey: 'submenu.nomenclature.medical2', path: '/emr/nomenclature/medical-2' },
  { key: 'additional', translationKey: 'submenu.nomenclature.additional', path: '/emr/nomenclature/additional' },
  { key: 'pharmacy', translationKey: 'submenu.nomenclature.pharmacy', path: '/emr/nomenclature/pharmacy' },
  { key: 'laboratory', translationKey: 'submenu.nomenclature.laboratory', path: '/emr/nomenclature/laboratory' },
  { key: 'materials', translationKey: 'submenu.nomenclature.materials', path: '/emr/nomenclature/materials' },
  { key: 'forms', translationKey: 'submenu.nomenclature.forms', path: '/emr/nomenclature/forms' },
];

interface HorizontalSubMenuProps {
  section: 'registration' | 'patient-history' | 'nomenclature';
}

/**
 * HorizontalSubMenu - Premium sub-navigation with refined tab design
 *
 * Features:
 * - Clean gradient background
 * - Elegant active tab indicator
 * - Smooth transitions
 * - Horizontal scroll for many items
 */
export function HorizontalSubMenu({ section }: HorizontalSubMenuProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const subMenuItems =
    section === 'registration'
      ? registrationSubMenu
      : section === 'patient-history'
      ? patientHistorySubMenu
      : nomenclatureSubMenu;

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <Box className={styles.container} data-testid="submenu">
      <ScrollArea
        type="scroll"
        scrollbarSize={0}
        className={styles.scrollArea}
      >
        <Box className={styles.tabContainer}>
          {subMenuItems.map((item) => {
            const active = isActive(item.path);
            return (
              <UnstyledButton
                key={item.key}
                onClick={() => navigate(item.path)}
                className={`${styles.tab} ${active ? styles.active : ''}`}
                data-testid={`submenu-${item.key}`}
              >
                <span className={styles.tabLabel}>{t(item.translationKey)}</span>
                {active && <span className={styles.activeBar} />}
              </UnstyledButton>
            );
          })}
        </Box>
      </ScrollArea>
    </Box>
  );
}
