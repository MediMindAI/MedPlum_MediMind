// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { useState, useEffect } from 'react';
import { useForm } from '@mantine/form';
import { useMedplum } from '@medplum/react-hooks';
import { notifications } from '@mantine/notifications';
import type { VisitFormValues, InsuranceCoverageValues } from '../types/patient-history';
import { getEncounterById, updateEncounter } from '../services/patientHistoryService';
import { upsertCoverage, fetchCoveragesForEncounter } from '../services/insuranceService';
import { getIdentifierValue, getExtensionValue } from '../services/fhirHelpers';

/**
 * Hook for managing visit edit modal form state and submission
 *
 * Usage:
 * ```typescript
 * const { form, loading, error, handleSave, handleCancel } = useVisitEdit(
 *   visitId,
 *   onSuccess,
 *   onCancel
 * );
 * ```
 * @param visitId
 * @param onSuccess
 * @param onCancel
 */
export function useVisitEdit(
  visitId: string | null,
  onSuccess: () => void,
  onCancel: () => void
) {
  const medplum = useMedplum();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mantine form with 134 fields
  const form = useForm<VisitFormValues>({
    initialValues: {
      // Registration (14 fields)
      visitDate: '',
      registrationType: '',
      stationaryNumber: '',
      ambulatoryNumber: '',
      statusType: '',
      referrer: '',
      visitPurpose: '',
      admissionType: '',
      dischargeType: '',
      dischargeDate: '',
      attendingDoctor: '',
      department: '',
      room: '',
      bed: '',

      // Demographics (8 READ-ONLY fields)
      region: '',
      district: '',
      city: '',
      address: '',
      education: '',
      familyStatus: '',
      employment: '',
      workplace: '',

      // Insurance I (7 fields)
      insuranceCompany: '',
      insuranceType: '',
      policyNumber: '',
      referralNumber: '',
      issueDate: '',
      expirationDate: '',
      copayPercent: undefined,

      // Insurance II (7 fields)
      insuranceCompany2: '',
      insuranceType2: '',
      policyNumber2: '',
      referralNumber2: '',
      issueDate2: '',
      expirationDate2: '',
      copayPercent2: undefined,

      // Insurance III (7 fields)
      insuranceCompany3: '',
      insuranceType3: '',
      policyNumber3: '',
      referralNumber3: '',
      issueDate3: '',
      expirationDate3: '',
      copayPercent3: undefined,
    },

    validate: {
      visitDate: (value) => {
        if (!value) {return 'Visit date is required';}
        const date = new Date(value);
        if (date > new Date()) {return 'Visit date cannot be in future';}
        return null;
      },
      registrationType: (value) => !value ? 'Registration type is required' : null,
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
   * Load visit data on mount if visitId provided
   */
  useEffect(() => {
    if (!visitId) {
      setInitialLoading(false);
      return;
    }

    const loadVisitData = async () => {
      try {
        // Load Encounter
        const encounter = await getEncounterById(medplum, visitId);

        // Load Coverage resources (up to 3)
        const coverages = await fetchCoveragesForEncounter(medplum, visitId);

        // Map Encounter fields
        const stationaryNumber = getIdentifierValue(encounter, 'http://medimind.ge/identifiers/visit-registration');
        const ambulatoryNumber = getIdentifierValue(encounter, 'http://medimind.ge/identifiers/ambulatory-registration');

        // Extract demographics from extensions
        const region = getExtensionValue(encounter, 'http://medimind.ge/fhir/StructureDefinition/region');
        const district = getExtensionValue(encounter, 'http://medimind.ge/fhir/StructureDefinition/district');
        const city = getExtensionValue(encounter, 'http://medimind.ge/fhir/StructureDefinition/city');
        const address = getExtensionValue(encounter, 'http://medimind.ge/fhir/StructureDefinition/address');
        const education = getExtensionValue(encounter, 'http://medimind.ge/fhir/StructureDefinition/education');
        const familyStatus = getExtensionValue(encounter, 'http://medimind.ge/fhir/StructureDefinition/family-status');
        const employment = getExtensionValue(encounter, 'http://medimind.ge/fhir/StructureDefinition/employment');
        const workplace = getExtensionValue(encounter, 'http://medimind.ge/fhir/StructureDefinition/workplace');

        // Extract registration fields
        const statusType = getExtensionValue(encounter, 'http://medimind.ge/fhir/StructureDefinition/status-type');
        const referrer = getExtensionValue(encounter, 'http://medimind.ge/fhir/StructureDefinition/referrer');
        const visitPurpose = getExtensionValue(encounter, 'http://medimind.ge/fhir/StructureDefinition/visit-purpose');
        const admissionType = getExtensionValue(encounter, 'http://medimind.ge/fhir/StructureDefinition/admission-type');
        const dischargeType = getExtensionValue(encounter, 'http://medimind.ge/fhir/StructureDefinition/discharge-type');
        const attendingDoctor = getExtensionValue(encounter, 'http://medimind.ge/fhir/StructureDefinition/attending-doctor');
        const department = getExtensionValue(encounter, 'http://medimind.ge/fhir/StructureDefinition/department');
        const room = getExtensionValue(encounter, 'http://medimind.ge/fhir/StructureDefinition/room');
        const bed = getExtensionValue(encounter, 'http://medimind.ge/fhir/StructureDefinition/bed');

        // Map to form values
        form.setValues({
          visitDate: encounter.period?.start || '',
          registrationType: encounter.type?.[0]?.coding?.[0]?.code || '',
          stationaryNumber: stationaryNumber || '',
          ambulatoryNumber: ambulatoryNumber || '',
          statusType: statusType || '',
          referrer: referrer || '',
          visitPurpose: visitPurpose || '',
          admissionType: admissionType || '',
          dischargeType: dischargeType || '',
          dischargeDate: encounter.period?.end || '',
          attendingDoctor: attendingDoctor || '',
          department: department || '',
          room: room || '',
          bed: bed || '',

          // Demographics (READ-ONLY)
          region: region || '',
          district: district || '',
          city: city || '',
          address: address || '',
          education: education || '',
          familyStatus: familyStatus || '',
          employment: employment || '',
          workplace: workplace || '',

          // Insurance I (order=1)
          insuranceCompany: coverages[0]?.payor?.[0]?.reference || '',
          insuranceType: coverages[0]?.type?.coding?.[0]?.code || '',
          policyNumber: coverages[0]?.subscriberId || '',
          referralNumber: getExtensionValue(coverages[0], 'http://medimind.ge/fhir/StructureDefinition/referral-number') || '',
          issueDate: coverages[0]?.period?.start || '',
          expirationDate: coverages[0]?.period?.end || '',
          copayPercent: coverages[0]?.costToBeneficiary?.[0]?.valueQuantity?.value,

          // Insurance II (order=2)
          insuranceCompany2: coverages[1]?.payor?.[0]?.reference || '',
          insuranceType2: coverages[1]?.type?.coding?.[0]?.code || '',
          policyNumber2: coverages[1]?.subscriberId || '',
          referralNumber2: getExtensionValue(coverages[1], 'http://medimind.ge/fhir/StructureDefinition/referral-number') || '',
          issueDate2: coverages[1]?.period?.start || '',
          expirationDate2: coverages[1]?.period?.end || '',
          copayPercent2: coverages[1]?.costToBeneficiary?.[0]?.valueQuantity?.value,

          // Insurance III (order=3)
          insuranceCompany3: coverages[2]?.payor?.[0]?.reference || '',
          insuranceType3: coverages[2]?.type?.coding?.[0]?.code || '',
          policyNumber3: coverages[2]?.subscriberId || '',
          referralNumber3: getExtensionValue(coverages[2], 'http://medimind.ge/fhir/StructureDefinition/referral-number') || '',
          issueDate3: coverages[2]?.period?.start || '',
          expirationDate3: coverages[2]?.period?.end || '',
          copayPercent3: coverages[2]?.costToBeneficiary?.[0]?.valueQuantity?.value,
        });
      } catch (err) {
        console.error('Error loading visit data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load visit data');
      } finally {
        setInitialLoading(false);
      }
    };

    loadVisitData();
  }, [visitId, medplum]);

  /**
   * Handle form submission
   * @param values
   */
  const handleSave = async (values: VisitFormValues) => {
    if (!visitId) {return;}

    setLoading(true);
    setError(null);

    try {
      // Load original Encounter
      const encounter = await getEncounterById(medplum, visitId);

      // Update Encounter fields
      encounter.period = {
        start: values.visitDate,
        end: values.dischargeDate || undefined,
      };
      encounter.type = [{
        coding: [{ code: values.registrationType }]
      }];

      // Update identifiers
      if (values.stationaryNumber) {
        if (!encounter.identifier) {encounter.identifier = [];}
        const stationaryIdx = encounter.identifier.findIndex(
          id => id.system === 'http://medimind.ge/identifiers/visit-registration'
        );
        if (stationaryIdx >= 0) {
          encounter.identifier[stationaryIdx].value = values.stationaryNumber;
        } else {
          encounter.identifier.push({
            system: 'http://medimind.ge/identifiers/visit-registration',
            value: values.stationaryNumber,
          });
        }
      }

      if (values.ambulatoryNumber) {
        if (!encounter.identifier) {encounter.identifier = [];}
        const ambulatoryIdx = encounter.identifier.findIndex(
          id => id.system === 'http://medimind.ge/identifiers/ambulatory-registration'
        );
        if (ambulatoryIdx >= 0) {
          encounter.identifier[ambulatoryIdx].value = values.ambulatoryNumber;
        } else {
          encounter.identifier.push({
            system: 'http://medimind.ge/identifiers/ambulatory-registration',
            value: values.ambulatoryNumber,
          });
        }
      }

      // Update extensions
      if (!encounter.extension) {encounter.extension = [];}

      const extensionMap: Record<string, string | undefined> = {
        'http://medimind.ge/fhir/StructureDefinition/status-type': values.statusType,
        'http://medimind.ge/fhir/StructureDefinition/referrer': values.referrer,
        'http://medimind.ge/fhir/StructureDefinition/visit-purpose': values.visitPurpose,
        'http://medimind.ge/fhir/StructureDefinition/admission-type': values.admissionType,
        'http://medimind.ge/fhir/StructureDefinition/discharge-type': values.dischargeType,
        'http://medimind.ge/fhir/StructureDefinition/attending-doctor': values.attendingDoctor,
        'http://medimind.ge/fhir/StructureDefinition/department': values.department,
        'http://medimind.ge/fhir/StructureDefinition/room': values.room,
        'http://medimind.ge/fhir/StructureDefinition/bed': values.bed,
      };

      Object.entries(extensionMap).forEach(([url, value]) => {
        if (value) {
          const existingIdx = encounter.extension!.findIndex(ext => ext.url === url);
          if (existingIdx >= 0) {
            encounter.extension![existingIdx].valueString = value;
          } else {
            encounter.extension!.push({ url, valueString: value });
          }
        }
      });

      // Save Encounter
      await updateEncounter(medplum, encounter);

      // Upsert Insurance I
      if (values.insuranceCompany) {
        const insurance1: InsuranceCoverageValues = {
          insuranceCompany: values.insuranceCompany,
          insuranceType: values.insuranceType,
          policyNumber: values.policyNumber,
          referralNumber: values.referralNumber,
          issueDate: values.issueDate,
          expirationDate: values.expirationDate,
          copayPercent: values.copayPercent,
        };
        await upsertCoverage(medplum, encounter, insurance1, 1);
      }

      // Upsert Insurance II
      if (values.insuranceCompany2) {
        const insurance2: InsuranceCoverageValues = {
          insuranceCompany: values.insuranceCompany2,
          insuranceType: values.insuranceType2,
          policyNumber: values.policyNumber2,
          referralNumber: values.referralNumber2,
          issueDate: values.issueDate2,
          expirationDate: values.expirationDate2,
          copayPercent: values.copayPercent2,
        };
        await upsertCoverage(medplum, encounter, insurance2, 2);
      }

      // Upsert Insurance III
      if (values.insuranceCompany3) {
        const insurance3: InsuranceCoverageValues = {
          insuranceCompany: values.insuranceCompany3,
          insuranceType: values.insuranceType3,
          policyNumber: values.policyNumber3,
          referralNumber: values.referralNumber3,
          issueDate: values.issueDate3,
          expirationDate: values.expirationDate3,
          copayPercent: values.copayPercent3,
        };
        await upsertCoverage(medplum, encounter, insurance3, 3);
      }

      notifications.show({
        title: 'Success',
        message: 'Visit updated successfully',
        color: 'green',
      });

      onSuccess();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update visit';
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
    handleSave,
    handleCancel: onCancel,
  };
}
