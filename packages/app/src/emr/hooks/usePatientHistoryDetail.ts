// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { useState, useEffect } from 'react';
import { useForm } from '@mantine/form';
import { useMedplum } from '@medplum/react-hooks';
import { notifications } from '@mantine/notifications';
import type { Patient, Encounter } from '@medplum/fhirtypes';
import { getEncounterById, updateEncounter } from '../services/patientHistoryService';
import { upsertCoverage, fetchCoveragesForEncounter } from '../services/insuranceService';
import { getExtensionValue } from '../services/fhirHelpers';
import type { InsuranceCoverageValues } from '../types/patient-history';

export interface PatientHistoryDetailFormValues {
  // Registration (6 fields)
  visitDate: Date | null;
  admissionType: string;
  status: string;
  comment: string;
  department: string;
  hospitalType: string;

  // Insurance toggle
  insuranceEnabled: boolean;
  insurerCount: number;

  // Insurance I (7 fields)
  insuranceCompany: string;
  insuranceType: string;
  policyNumber: string;
  referralNumber: string;
  issueDate: Date | null;
  expirationDate: Date | null;
  copayPercent: number | undefined;

  // Insurance II (7 fields)
  insuranceCompany2: string;
  insuranceType2: string;
  policyNumber2: string;
  referralNumber2: string;
  issueDate2: Date | null;
  expirationDate2: Date | null;
  copayPercent2: number | undefined;

  // Insurance III (7 fields)
  insuranceCompany3: string;
  insuranceType3: string;
  policyNumber3: string;
  referralNumber3: string;
  issueDate3: Date | null;
  expirationDate3: Date | null;
  copayPercent3: number | undefined;

  // Guarantee (1 field)
  guaranteeText: string;

  // Demographics (7 READ-ONLY fields)
  region: string;
  district: string;
  city: string;
  actualAddress: string;
  education: string;
  familyStatus: string;
  employment: string;
}

export interface PatientHistoryDetailData {
  patient: Patient | null;
  encounter: Encounter | null;
  visitCount: number;
  totalVisits: number;
  visitType: 'ambulatory' | 'stationary' | 'emergency';
}

/**
 * Hook for managing patient history detail modal state and operations
 * @param encounterId
 * @param onSuccess
 * @param onCancel
 */
export function usePatientHistoryDetail(
  encounterId: string | null,
  onSuccess: () => void,
  onCancel: () => void
) {
  const medplum = useMedplum();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [patientData, setPatientData] = useState<PatientHistoryDetailData>({
    patient: null,
    encounter: null,
    visitCount: 0,
    totalVisits: 0,
    visitType: 'ambulatory',
  });

  // Mantine form
  const form = useForm<PatientHistoryDetailFormValues>({
    initialValues: {
      // Registration
      visitDate: null,
      admissionType: '',
      status: '',
      comment: '',
      department: '',
      hospitalType: '',

      // Insurance toggle
      insuranceEnabled: false,
      insurerCount: 1,

      // Insurance I
      insuranceCompany: '',
      insuranceType: '',
      policyNumber: '',
      referralNumber: '',
      issueDate: null,
      expirationDate: null,
      copayPercent: undefined,

      // Insurance II
      insuranceCompany2: '',
      insuranceType2: '',
      policyNumber2: '',
      referralNumber2: '',
      issueDate2: null,
      expirationDate2: null,
      copayPercent2: undefined,

      // Insurance III
      insuranceCompany3: '',
      insuranceType3: '',
      policyNumber3: '',
      referralNumber3: '',
      issueDate3: null,
      expirationDate3: null,
      copayPercent3: undefined,

      // Guarantee
      guaranteeText: '',

      // Demographics
      region: '',
      district: '',
      city: '',
      actualAddress: '',
      education: '',
      familyStatus: '',
      employment: '',
    },

    validate: {
      visitDate: (value) => {
        if (!value) {return 'Visit date is required';}
        if (value > new Date()) {return 'Visit date cannot be in future';}
        return null;
      },
      admissionType: (value) => (!value ? 'Admission type is required' : null),
      department: (value) => (!value ? 'Department is required' : null),
      copayPercent: (value) => {
        if (value !== undefined && (value < 0 || value > 100)) {
          return 'Copay must be between 0 and 100';
        }
        return null;
      },
      copayPercent2: (value) => {
        if (value !== undefined && (value < 0 || value > 100)) {
          return 'Copay must be between 0 and 100';
        }
        return null;
      },
      copayPercent3: (value) => {
        if (value !== undefined && (value < 0 || value > 100)) {
          return 'Copay must be between 0 and 100';
        }
        return null;
      },
    },
  });

  /**
   * Load encounter and patient data on mount
   */
  useEffect(() => {
    if (!encounterId) {
      setInitialLoading(false);
      return;
    }

    const loadData = async () => {
      try {
        // Load Encounter
        const encounter = await getEncounterById(medplum, encounterId);

        // Load Patient
        const patientRef = encounter.subject?.reference;
        let patient: Patient | null = null;
        if (patientRef) {
          patient = await medplum.readReference({ reference: patientRef }) as Patient;
        }

        // Load Coverage resources
        const coverages = await fetchCoveragesForEncounter(medplum, encounterId);

        // Get visit count for this patient
        let visitCount = 1;
        let totalVisits = 1;
        if (patientRef) {
          const allEncounters = await medplum.searchResources('Encounter', {
            subject: patientRef,
            _count: '1000',
          });
          totalVisits = allEncounters.length;
          // Find current visit position (sorted by date)
          const sortedEncounters = allEncounters.sort((a, b) => {
            const dateA = new Date(a.period?.start || 0);
            const dateB = new Date(b.period?.start || 0);
            return dateA.getTime() - dateB.getTime();
          });
          visitCount = sortedEncounters.findIndex((e) => e.id === encounterId) + 1;
        }

        // Determine visit type
        const visitTypeCode = encounter.type?.[0]?.coding?.[0]?.code || 'AMB';
        const visitType =
          visitTypeCode === 'IMP' ? 'stationary' : visitTypeCode === 'EMER' ? 'emergency' : 'ambulatory';

        setPatientData({
          patient,
          encounter,
          visitCount,
          totalVisits,
          visitType,
        });

        // Extract demographics from Patient
        const region = patient?.address?.[0]?.state || '';
        const district = patient?.address?.[0]?.district || '';
        const city = patient?.address?.[0]?.city || '';
        const actualAddress = patient?.address?.[0]?.line?.join(', ') || '';
        const education = patient
          ? getExtensionValue(patient, 'http://medimind.ge/fhir/StructureDefinition/education') || ''
          : '';
        const familyStatus = patient
          ? getExtensionValue(patient, 'http://medimind.ge/fhir/StructureDefinition/family-status') || ''
          : '';
        const employment = patient
          ? getExtensionValue(patient, 'http://medimind.ge/fhir/StructureDefinition/employment') || ''
          : '';

        // Extract encounter fields
        const admissionType =
          getExtensionValue(encounter, 'http://medimind.ge/fhir/StructureDefinition/admission-type') || '';
        const status = encounter.status || '';
        const comment =
          getExtensionValue(encounter, 'http://medimind.ge/fhir/StructureDefinition/comment') || '';
        const department =
          getExtensionValue(encounter, 'http://medimind.ge/fhir/StructureDefinition/department') || '';
        const hospitalType =
          getExtensionValue(encounter, 'http://medimind.ge/fhir/StructureDefinition/hospital-type') || '';
        const guaranteeText =
          getExtensionValue(encounter, 'http://medimind.ge/fhir/StructureDefinition/guarantee') || '';

        // Determine insurer count
        let insurerCount = 1;
        if (coverages[2]) {insurerCount = 3;}
        else if (coverages[1]) {insurerCount = 2;}

        // Set form values
        form.setValues({
          visitDate: encounter.period?.start ? new Date(encounter.period.start) : null,
          admissionType,
          status,
          comment,
          department,
          hospitalType,

          insuranceEnabled: coverages.length > 0,
          insurerCount,

          // Insurance I
          insuranceCompany: coverages[0]?.payor?.[0]?.reference || '',
          insuranceType: coverages[0]?.type?.coding?.[0]?.code || '',
          policyNumber: coverages[0]?.subscriberId || '',
          referralNumber:
            getExtensionValue(coverages[0], 'http://medimind.ge/fhir/StructureDefinition/referral-number') || '',
          issueDate: coverages[0]?.period?.start ? new Date(coverages[0].period.start) : null,
          expirationDate: coverages[0]?.period?.end ? new Date(coverages[0].period.end) : null,
          copayPercent: coverages[0]?.costToBeneficiary?.[0]?.valueQuantity?.value,

          // Insurance II
          insuranceCompany2: coverages[1]?.payor?.[0]?.reference || '',
          insuranceType2: coverages[1]?.type?.coding?.[0]?.code || '',
          policyNumber2: coverages[1]?.subscriberId || '',
          referralNumber2:
            getExtensionValue(coverages[1], 'http://medimind.ge/fhir/StructureDefinition/referral-number') || '',
          issueDate2: coverages[1]?.period?.start ? new Date(coverages[1].period.start) : null,
          expirationDate2: coverages[1]?.period?.end ? new Date(coverages[1].period.end) : null,
          copayPercent2: coverages[1]?.costToBeneficiary?.[0]?.valueQuantity?.value,

          // Insurance III
          insuranceCompany3: coverages[2]?.payor?.[0]?.reference || '',
          insuranceType3: coverages[2]?.type?.coding?.[0]?.code || '',
          policyNumber3: coverages[2]?.subscriberId || '',
          referralNumber3:
            getExtensionValue(coverages[2], 'http://medimind.ge/fhir/StructureDefinition/referral-number') || '',
          issueDate3: coverages[2]?.period?.start ? new Date(coverages[2].period.start) : null,
          expirationDate3: coverages[2]?.period?.end ? new Date(coverages[2].period.end) : null,
          copayPercent3: coverages[2]?.costToBeneficiary?.[0]?.valueQuantity?.value,

          guaranteeText,

          region,
          district,
          city,
          actualAddress,
          education,
          familyStatus,
          employment,
        });
      } catch (err) {
        console.error('Error loading patient history detail:', err);
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setInitialLoading(false);
      }
    };

    loadData();
  }, [encounterId, medplum]);

  /**
   * Add another insurer (max 3)
   */
  const addInsurer = () => {
    const current = form.values.insurerCount;
    if (current < 3) {
      form.setFieldValue('insurerCount', current + 1);
    }
  };

  /**
   * Copy demographics from patient record (refresh)
   */
  const copyDemographicsFromPatient = async () => {
    if (!patientData.patient) {return;}

    const patient = patientData.patient;
    const region = patient.address?.[0]?.state || '';
    const district = patient.address?.[0]?.district || '';
    const city = patient.address?.[0]?.city || '';
    const actualAddress = patient.address?.[0]?.line?.join(', ') || '';
    const education = patient
      ? getExtensionValue(patient, 'http://medimind.ge/fhir/StructureDefinition/education') || ''
      : '';
    const familyStatus = patient
      ? getExtensionValue(patient, 'http://medimind.ge/fhir/StructureDefinition/family-status') || ''
      : '';
    const employment = patient
      ? getExtensionValue(patient, 'http://medimind.ge/fhir/StructureDefinition/employment') || ''
      : '';

    form.setFieldValue('region', region);
    form.setFieldValue('district', district);
    form.setFieldValue('city', city);
    form.setFieldValue('actualAddress', actualAddress);
    form.setFieldValue('education', education);
    form.setFieldValue('familyStatus', familyStatus);
    form.setFieldValue('employment', employment);

    notifications.show({
      title: 'Success',
      message: 'Demographics copied from patient record',
      color: 'green',
    });
  };

  /**
   * Handle form submission
   * @param values
   */
  const handleSave = async (values: PatientHistoryDetailFormValues) => {
    if (!encounterId || !patientData.encounter) {return;}

    setLoading(true);
    setError(null);

    try {
      // Update Encounter
      const encounter = { ...patientData.encounter };

      // Update period
      encounter.period = {
        start: values.visitDate ? values.visitDate.toISOString() : undefined,
      };

      // Update status
      encounter.status = (values.status as Encounter['status']) || encounter.status;

      // Update extensions
      if (!encounter.extension) {encounter.extension = [];}

      const extensionMap: Record<string, string | undefined> = {
        'http://medimind.ge/fhir/StructureDefinition/admission-type': values.admissionType,
        'http://medimind.ge/fhir/StructureDefinition/comment': values.comment,
        'http://medimind.ge/fhir/StructureDefinition/department': values.department,
        'http://medimind.ge/fhir/StructureDefinition/hospital-type': values.hospitalType,
        'http://medimind.ge/fhir/StructureDefinition/guarantee': values.guaranteeText,
      };

      Object.entries(extensionMap).forEach(([url, value]) => {
        if (value !== undefined) {
          const existingIdx = encounter.extension!.findIndex((ext) => ext.url === url);
          if (existingIdx >= 0) {
            encounter.extension![existingIdx].valueString = value;
          } else {
            encounter.extension!.push({ url, valueString: value });
          }
        }
      });

      await updateEncounter(medplum, encounter);

      // Save insurance if enabled
      if (values.insuranceEnabled) {
        // Upsert Insurance I
        if (values.insuranceCompany) {
          const insurance1: InsuranceCoverageValues = {
            insuranceCompany: values.insuranceCompany,
            insuranceType: values.insuranceType,
            policyNumber: values.policyNumber,
            referralNumber: values.referralNumber,
            issueDate: values.issueDate ? values.issueDate.toISOString() : undefined,
            expirationDate: values.expirationDate ? values.expirationDate.toISOString() : undefined,
            copayPercent: values.copayPercent,
          };
          await upsertCoverage(medplum, encounter, insurance1, 1);
        }

        // Upsert Insurance II
        if (values.insurerCount >= 2 && values.insuranceCompany2) {
          const insurance2: InsuranceCoverageValues = {
            insuranceCompany: values.insuranceCompany2,
            insuranceType: values.insuranceType2,
            policyNumber: values.policyNumber2,
            referralNumber: values.referralNumber2,
            issueDate: values.issueDate2 ? values.issueDate2.toISOString() : undefined,
            expirationDate: values.expirationDate2 ? values.expirationDate2.toISOString() : undefined,
            copayPercent: values.copayPercent2,
          };
          await upsertCoverage(medplum, encounter, insurance2, 2);
        }

        // Upsert Insurance III
        if (values.insurerCount >= 3 && values.insuranceCompany3) {
          const insurance3: InsuranceCoverageValues = {
            insuranceCompany: values.insuranceCompany3,
            insuranceType: values.insuranceType3,
            policyNumber: values.policyNumber3,
            referralNumber: values.referralNumber3,
            issueDate: values.issueDate3 ? values.issueDate3.toISOString() : undefined,
            expirationDate: values.expirationDate3 ? values.expirationDate3.toISOString() : undefined,
            copayPercent: values.copayPercent3,
          };
          await upsertCoverage(medplum, encounter, insurance3, 3);
        }
      }

      notifications.show({
        title: 'Success',
        message: 'Visit details saved successfully',
        color: 'green',
      });

      onSuccess();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save visit details';
      setError(message);
      notifications.show({
        title: 'Error',
        message,
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    form,
    loading,
    initialLoading,
    error,
    patientData,
    handleSave,
    handleCancel: onCancel,
    addInsurer,
    copyDemographicsFromPatient,
  };
}
