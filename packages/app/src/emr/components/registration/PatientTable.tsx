// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { Table, ActionIcon, Text, Paper } from '@mantine/core';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import { useMedplum } from '@medplum/react-hooks';
import type { Patient } from '@medplum/fhirtypes';
import { useEffect, useState } from 'react';
import { notifications } from '@mantine/notifications';
import { useTranslation } from '../../hooks/useTranslation';
import { PatientEditModal } from './PatientEditModal';
import { PatientDeletionConfirmationModal } from './PatientDeletionConfirmationModal';

interface SearchFilters {
  personalId?: string;
  firstName?: string;
  lastName?: string;
  registrationNumber?: string;
}

interface PatientTableProps {
  searchFilters?: SearchFilters;
  onPatientClick?: (patientId: string) => void;
}

/**
 * Patient table displaying registered patients with edit/delete actions
 * @param root0
 * @param root0.searchFilters
 * @param root0.onPatientClick
 */
export function PatientTable({ searchFilters, onPatientClick }: PatientTableProps) {
  const { t } = useTranslation();
  const medplum = useMedplum();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [editModalOpened, setEditModalOpened] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [deleteModalOpened, setDeleteModalOpened] = useState(false);
  const [patientToDelete, setPatientToDelete] = useState<Patient | null>(null);

  useEffect(() => {
    loadPatients();
  }, [searchFilters]);

  const loadPatients = async () => {
    try {
      const searchParams: any = {
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
      setPatients(results);
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

  if (loading) {
    return <Text c="dimmed">{t('ui.loading') || 'Loading...'}</Text>;
  }

  if (patients.length === 0) {
    return (
      <Paper p="md" withBorder>
        <Text c="dimmed" ta="center">
          {t('registration.table.noPatients') || 'No patients found'}
        </Text>
      </Paper>
    );
  }

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

  return (
    <>
      {/* Results count with professional styling */}
      <Text size="sm" fw={600} c="dimmed" mb="lg">
        {t('registration.table.totalPatients') || 'რეგისტრირებული პაციენტები'}: {patients.length}
      </Text>

      {/* Professional Patient Table */}
      <Table
        highlightOnHover
        verticalSpacing="sm"
        horizontalSpacing="md"
        style={{
          borderCollapse: 'separate',
          borderSpacing: 0,
        }}
      >
        <Table.Thead
          style={{
            background: 'var(--emr-gray-100)',
            borderBottom: '2px solid var(--emr-gray-300)',
            position: 'sticky',
            top: 0,
            zIndex: 1,
          }}
        >
          <Table.Tr>
            <Table.Th style={{ color: 'var(--emr-primary)', fontWeight: 700, width: '60px', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {t('registration.table.rowNumber') || '#'}
            </Table.Th>
            <Table.Th style={{ color: 'var(--emr-primary)', fontWeight: 700, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {t('registration.table.personalId') || 'პ/ნ'}
            </Table.Th>
            <Table.Th style={{ color: 'var(--emr-primary)', fontWeight: 700, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {t('registration.table.firstName') || 'სახელი'}
            </Table.Th>
            <Table.Th style={{ color: 'var(--emr-primary)', fontWeight: 700, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {t('registration.table.lastName') || 'გვარი'}
            </Table.Th>
            <Table.Th style={{ color: 'var(--emr-primary)', fontWeight: 700, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {t('registration.table.birthDate') || 'დაბ. თარიღი'}
            </Table.Th>
            <Table.Th style={{ color: 'var(--emr-primary)', fontWeight: 700, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {t('registration.table.gender') || 'სქესი'}
            </Table.Th>
            <Table.Th style={{ color: 'var(--emr-primary)', fontWeight: 700, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {t('registration.table.phone') || 'ტელეფონი'}
            </Table.Th>
            <Table.Th style={{ color: 'var(--emr-primary)', fontWeight: 700, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {t('registration.table.address') || 'მისამართი'}
            </Table.Th>
            <Table.Th style={{ color: 'var(--emr-primary)', fontWeight: 700, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'right' }}>
              {t('registration.table.actions') || 'მოქმედებები'}
            </Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {patients.map((patient, index) => (
            <Table.Tr
              key={patient.id}
              style={{
                height: '56px',
                backgroundColor: index % 2 === 0 ? 'white' : '#fafbfc',
                transition: 'all 0.15s ease',
                borderBottom: '1px solid var(--emr-gray-200)',
                cursor: 'pointer',
              }}
              onClick={() => onPatientClick?.(patient.id || '')}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f0f7ff';
                e.currentTarget.style.transform = 'translateX(2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = index % 2 === 0 ? 'white' : '#fafbfc';
                e.currentTarget.style.transform = 'translateX(0)';
              }}
            >
              <Table.Td style={{ fontSize: '14px', textAlign: 'center', fontWeight: 600 }}>
                {index + 1}
              </Table.Td>
              <Table.Td style={{ fontSize: '14px' }}>
                {getIdentifierValue(patient, 'http://medimind.ge/identifiers/personal-id')}
              </Table.Td>
              <Table.Td style={{ fontSize: '14px', fontWeight: 500 }}>
                {patient.name?.[0]?.given?.join(' ') || '-'}
              </Table.Td>
              <Table.Td style={{ fontSize: '14px', fontWeight: 500 }}>
                {patient.name?.[0]?.family || '-'}
              </Table.Td>
              <Table.Td style={{ fontSize: '14px' }}>{patient.birthDate || '-'}</Table.Td>
              <Table.Td style={{ fontSize: '14px' }}>{patient.gender || '-'}</Table.Td>
              <Table.Td style={{ fontSize: '14px' }}>
                {patient.telecom?.find((t) => t.system === 'phone')?.value || '-'}
              </Table.Td>
              <Table.Td style={{ fontSize: '14px', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {patient.address?.[0]?.text || patient.address?.[0]?.line?.join(', ') || '-'}
              </Table.Td>
              <Table.Td style={{ textAlign: 'right' }}>
                <ActionIcon.Group>
                  <ActionIcon
                    variant="subtle"
                    size="md"
                    title={t('registration.action.edit') || 'რედაქტირება'}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(patient.id || '');
                    }}
                    style={{
                      color: 'var(--emr-secondary)',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(43, 108, 176, 0.1)';
                      e.currentTarget.style.transform = 'scale(1.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                  >
                    <IconEdit size={18} stroke={2} />
                  </ActionIcon>
                  <ActionIcon
                    variant="subtle"
                    size="md"
                    title={t('registration.action.delete') || 'წაშლა'}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(patient);
                    }}
                    style={{
                      color: '#ef4444',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                      e.currentTarget.style.transform = 'scale(1.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                  >
                    <IconTrash size={18} stroke={2} />
                  </ActionIcon>
                </ActionIcon.Group>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>

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
