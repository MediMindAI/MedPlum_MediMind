// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { useEffect, useState } from 'react';
import { Text } from '@mantine/core';
import { IconEdit, IconTrash, IconUsers } from '@tabler/icons-react';
import { useMedplum } from '@medplum/react-hooks';
import type { Patient } from '@medplum/fhirtypes';
import { notifications } from '@mantine/notifications';
import { useTranslation } from '../../hooks/useTranslation';
import { useActionPermission } from '../../hooks/useActionPermission';
import { PatientEditModal } from './PatientEditModal';
import { PatientDeletionConfirmationModal } from './PatientDeletionConfirmationModal';
import { EMRTable } from '../shared/EMRTable';
import type { EMRTableColumn } from '../shared/EMRTable';

interface SearchFilters {
  personalId?: string;
  firstName?: string;
  lastName?: string;
  registrationNumber?: string;
}

interface PatientTableProps {
  searchFilters?: SearchFilters;
  onPatientClick?: (patientId: string) => void;
  onCountChange?: (count: number) => void;
}

// Extended Patient type with required id for EMRTable
interface PatientRow extends Patient {
  id: string;
  rowIndex?: number;
}

/**
 * Patient table displaying registered patients with edit/delete actions
 * Now using EMRTable component for consistent Apple-inspired styling
 */
export function PatientTable({ searchFilters, onPatientClick, onCountChange }: PatientTableProps) {
  const { t } = useTranslation();
  const medplum = useMedplum();
  const { canEdit, canDelete } = useActionPermission('patient');
  const [patients, setPatients] = useState<PatientRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editModalOpened, setEditModalOpened] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [deleteModalOpened, setDeleteModalOpened] = useState(false);
  const [patientToDelete, setPatientToDelete] = useState<Patient | null>(null);

  useEffect(() => {
    loadPatients();
  }, [searchFilters]);

  const loadPatients = async () => {
    setLoading(true);
    try {
      const searchParams: Record<string, string> = {
        _count: '100',
        _sort: '-_lastUpdated',
      };

      // Add search filters if provided
      if (searchFilters?.personalId) {
        searchParams['identifier'] = `http://medimind.ge/identifiers/personal-id|${searchFilters.personalId}`;
      }
      if (searchFilters?.firstName) {
        searchParams['given'] = searchFilters.firstName;
      }
      if (searchFilters?.lastName) {
        searchParams['family'] = searchFilters.lastName;
      }
      if (searchFilters?.registrationNumber) {
        searchParams['identifier'] = `http://medimind.ge/identifiers/registration-number|${searchFilters.registrationNumber}`;
      }

      const results = await medplum.searchResources('Patient', searchParams);
      // Filter and add rowIndex
      const validPatients = results
        .filter((p): p is PatientRow => !!p.id)
        .map((p, index) => ({ ...p, rowIndex: index + 1 }));
      setPatients(validPatients);
      onCountChange?.(validPatients.length);
    } catch (error) {
      notifications.show({
        title: t('registration.error.title') || 'Error',
        message: t('registration.error.loadFailed') || 'Failed to load patients',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const getIdentifierValue = (patient: Patient, system: string) => {
    return patient.identifier?.find((id) => id.system === system)?.value || '-';
  };

  const handleEdit = (patientId: string) => {
    setSelectedPatientId(patientId);
    setEditModalOpened(true);
  };

  const handleEditSuccess = () => {
    setEditModalOpened(false);
    loadPatients(); // Refresh table
  };

  const handleDelete = (patient: Patient) => {
    setPatientToDelete(patient);
    setDeleteModalOpened(true);
  };

  const handleDeleteSuccess = () => {
    setDeleteModalOpened(false);
    setPatientToDelete(null);
    loadPatients(); // Refresh table
  };

  // Define columns
  const columns: EMRTableColumn<PatientRow>[] = [
    {
      key: 'rowIndex',
      title: t('registration.table.rowNumber') || '#',
      width: 60,
      align: 'center',
      render: (patient, index) => (
        <Text fw={600} size="sm">
          {index + 1}
        </Text>
      ),
    },
    {
      key: 'personalId',
      title: t('registration.table.personalId') || 'პ/ნ',
      width: 120,
      render: (patient) => getIdentifierValue(patient, 'http://medimind.ge/identifiers/personal-id'),
    },
    {
      key: 'firstName',
      title: t('registration.table.firstName') || 'სახელი',
      render: (patient) => (
        <Text fw={500}>{patient.name?.[0]?.given?.join(' ') || '-'}</Text>
      ),
    },
    {
      key: 'lastName',
      title: t('registration.table.lastName') || 'გვარი',
      render: (patient) => (
        <Text fw={500}>{patient.name?.[0]?.family || '-'}</Text>
      ),
    },
    {
      key: 'birthDate',
      title: t('registration.table.birthDate') || 'დაბ. თარიღი',
      width: 110,
    },
    {
      key: 'gender',
      title: t('registration.table.gender') || 'სქესი',
      width: 80,
    },
    {
      key: 'phone',
      title: t('registration.table.phone') || 'ტელეფონი',
      width: 130,
      render: (patient) => patient.telecom?.find((t) => t.system === 'phone')?.value || '-',
    },
    {
      key: 'address',
      title: t('registration.table.address') || 'მისამართი',
      maxWidth: 200,
      hideOnMobile: true,
      render: (patient) => (
        <Text size="sm" lineClamp={1}>
          {patient.address?.[0]?.text || patient.address?.[0]?.line?.join(', ') || '-'}
        </Text>
      ),
    },
  ];

  return (
    <>
      {/* Results count */}
      <Text size="sm" fw={600} c="dimmed" mb="md">
        {t('registration.table.totalPatients') || 'რეგისტრირებული პაციენტები'}: {patients.length}
      </Text>

      {/* EMRTable with modern styling */}
      <EMRTable
        columns={columns}
        data={patients}
        loading={loading}
        loadingConfig={{ rows: 5 }}
        getRowId={(patient) => patient.id}
        onRowClick={onPatientClick ? (patient) => onPatientClick(patient.id) : undefined}
        stickyHeader
        striped
        minWidth={800}
        emptyState={{
          icon: IconUsers,
          title: t('registration.table.noPatients') || 'No patients found',
          description: t('registration.table.noPatientsDescription'),
        }}
        actions={(patient) => ({
          primary: {
            icon: IconEdit,
            label: canEdit
              ? t('registration.action.edit') || 'რედაქტირება'
              : t('common.noPermission') || 'No permission to edit',
            onClick: () => handleEdit(patient.id),
            disabled: !canEdit,
          },
          secondary: [
            {
              icon: IconTrash,
              label: canDelete
                ? t('registration.action.delete') || 'წაშლა'
                : t('common.noPermission') || 'No permission to delete',
              color: 'red',
              onClick: () => handleDelete(patient),
              disabled: !canDelete,
            },
          ],
        })}
        ariaLabel={t('registration.table.ariaLabel') || 'Patient registration table'}
      />

      <PatientEditModal
        opened={editModalOpened}
        onClose={() => setEditModalOpened(false)}
        patientId={selectedPatientId}
        onSuccess={handleEditSuccess}
      />

      <PatientDeletionConfirmationModal
        opened={deleteModalOpened}
        onClose={() => {
          setDeleteModalOpened(false);
          setPatientToDelete(null);
        }}
        patient={patientToDelete}
        onSuccess={handleDeleteSuccess}
      />
    </>
  );
}
