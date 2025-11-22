// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

/**
 * EMR Menu Structure Configuration
 *
 * Defines the hierarchical menu structure for the EMR system
 * including main menu items and their sub-menu items.
 */

export interface MenuItem {
  key: string;
  translationKey: string;
  path: string;
  subMenu?: MenuItem[];
}

/**
 * Main menu items (6 items - Row 2)
 */
export const mainMenuItems: MenuItem[] = [
  {
    key: 'registration',
    translationKey: 'menu.registration',
    path: '/emr/registration',
    subMenu: [
      { key: 'registration', translationKey: 'submenu.registration.registration', path: '/emr/registration/registration' },
      { key: 'contracts', translationKey: 'submenu.registration.contracts', path: '/emr/registration/contracts' },
      { key: 'inpatient', translationKey: 'submenu.registration.inpatient', path: '/emr/registration/inpatient' },
      { key: 'debts', translationKey: 'submenu.registration.debts', path: '/emr/registration/debts' },
      { key: 'advances', translationKey: 'submenu.registration.advances', path: '/emr/registration/advances' },
      { key: 'archive', translationKey: 'submenu.registration.archive', path: '/emr/registration/archive' },
      { key: 'referrals', translationKey: 'submenu.registration.referrals', path: '/emr/registration/referrals' },
      { key: 'currency', translationKey: 'submenu.registration.currency', path: '/emr/registration/currency' },
    ],
  },
  {
    key: 'patientHistory',
    translationKey: 'menu.patientHistory',
    path: '/emr/patient-history',
    subMenu: [
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
    ],
  },
  {
    key: 'nomenclature',
    translationKey: 'menu.nomenclature',
    path: '/emr/nomenclature',
    subMenu: [
      { key: 'medical1', translationKey: 'submenu.nomenclature.medical1', path: '/emr/nomenclature/medical-1' },
      { key: 'medical2', translationKey: 'submenu.nomenclature.medical2', path: '/emr/nomenclature/medical-2' },
      { key: 'goods', translationKey: 'submenu.nomenclature.goods', path: '/emr/nomenclature/goods' },
      { key: 'laboratory', translationKey: 'submenu.nomenclature.laboratory', path: '/emr/nomenclature/laboratory' },
      { key: 'prices', translationKey: 'submenu.nomenclature.prices', path: '/emr/nomenclature/prices' },
      { key: 'priceList', translationKey: 'submenu.nomenclature.priceList', path: '/emr/nomenclature/price-list' },
      { key: 'icd10', translationKey: 'submenu.nomenclature.icd10', path: '/emr/nomenclature/icd10-ncsp-icpc2' },
      { key: 'labAliases', translationKey: 'submenu.nomenclature.labAliases', path: '/emr/nomenclature/lab-aliases' },
      { key: 'groups', translationKey: 'submenu.nomenclature.groups', path: '/emr/nomenclature/groups' },
      { key: 'physical', translationKey: 'submenu.nomenclature.physical', path: '/emr/nomenclature/physical' },
      { key: 'forms', translationKey: 'submenu.nomenclature.forms', path: '/emr/nomenclature/forms' },
      { key: 'settings', translationKey: 'submenu.nomenclature.settings', path: '/emr/nomenclature/settings' },
      { key: 'tests', translationKey: 'submenu.nomenclature.tests', path: '/emr/nomenclature/tests' },
    ],
  },
  {
    key: 'administration',
    translationKey: 'menu.administration',
    path: '/emr/administration',
  },
  {
    key: 'forward',
    translationKey: 'menu.forward',
    path: '/emr/forward',
  },
  {
    key: 'forms',
    translationKey: 'menu.forms',
    path: '/emr/forms',
    subMenu: [
      { key: 'builder', translationKey: 'submenu.forms.builder', path: '/emr/forms/builder' },
      { key: 'fill', translationKey: 'submenu.forms.fill', path: '/emr/forms/fill' },
      { key: 'search', translationKey: 'submenu.forms.search', path: '/emr/forms/search' },
      { key: 'manage', translationKey: 'submenu.forms.manage', path: '/emr/forms' },
    ],
  },
  {
    key: 'reports',
    translationKey: 'menu.reports',
    path: '/emr/reports',
  },
];

/**
 * Top navigation items (Row 1)
 */
export const topNavItems: MenuItem[] = [
  { key: 'main', translationKey: 'topnav.main', path: '/emr' },
  { key: 'hr', translationKey: 'topnav.hr', path: '/emr/hr' },
  { key: 'requisites', translationKey: 'topnav.requisites', path: '/emr/requisites' },
  { key: 'department', translationKey: 'topnav.department', path: '/emr/department' },
  { key: 'delivery', translationKey: 'topnav.delivery', path: '/emr/delivery' },
];

/**
 * Get sub-menu items for a specific section
 * @param section
 */
export function getSubMenuItems(section: 'registration' | 'patient-history' | 'nomenclature' | 'forms'): MenuItem[] {
  const mainItem = mainMenuItems.find((item) => {
    if (section === 'registration') {return item.key === 'registration';}
    if (section === 'patient-history') {return item.key === 'patientHistory';}
    if (section === 'nomenclature') {return item.key === 'nomenclature';}
    if (section === 'forms') {return item.key === 'forms';}
    return false;
  });

  return mainItem?.subMenu || [];
}
