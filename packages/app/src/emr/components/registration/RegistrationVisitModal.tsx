// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import {
  Modal,
  Text,
  Group,
  Button,
  TextInput,
  Select,
  Paper,
  Stack,
  LoadingOverlay,
  Checkbox,
  Badge,
  Grid,
  Divider,
  Box,
  ActionIcon,
} from '@mantine/core';
import { TimeInput } from '@mantine/dates';
import { IconPlus, IconNotes, IconSearch } from '@tabler/icons-react';
import type { JSX } from 'react';
import { useState, useEffect } from 'react';
import { useMedplum } from '@medplum/react-hooks';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import type { Patient, Encounter } from '@medplum/fhirtypes';
import { useTranslation } from '../../hooks/useTranslation';
import { getExtensionValue } from '../../services/fhirHelpers';
import { EMRDatePicker } from '../common/EMRDatePicker';

interface RegistrationVisitModalProps {
  opened: boolean;
  onClose: () => void;
  patientId: string | null;
  onSuccess: () => void;
}

interface RegistrationVisitFormValues {
  // Registration Section
  mo_regdate: Date | null;
  mo_regtime: string;
  mo_regtype: string;
  mo_stat: string;
  mo_incomgrp: string;
  mo_ddyastac: string;

  // Insurance Section
  mo_sbool: boolean;
  insurerCount: number;

  // Primary Insurance
  mo_comp: string;
  mo_instp: string;
  mo_polnmb: string;
  mo_vano: string;
  mo_deldat: Date | null;
  mo_valdat: Date | null;
  mo_insprsnt: string;

  // Secondary Insurance
  mo_comp1: string;
  mo_instp1: string;
  mo_polnmb1: string;
  mo_vano1: string;
  mo_deldat1: Date | null;
  mo_valdat1: Date | null;
  mo_insprsnt1: string;

  // Tertiary Insurance
  mo_comp2: string;
  mo_instp2: string;
  mo_polnmb2: string;
  mo_vano2: string;
  mo_deldat2: Date | null;
  mo_valdat2: Date | null;
  mo_insprsnt2: string;

  // Guarantee Section
  mo_timwh: string;
  mo_timamo: string;
  mo_timltdat: Date | null;
  mo_timdrdat: Date | null;
  mo_letterno: string;

  // Demographics Section (EDITABLE)
  mo_regions: string;
  mo_raions_hid: string;
  mo_city: string;
  mo_otheraddress: string;
  mo_ganatleba: string;
  mo_ojaxi: string;
  mo_dasaqmeba: string;
}

// Dropdown data from actual EMR extraction
const ADMISSION_TYPES = [
  { value: '3', label: 'ამბულატორიული' },
  { value: '1', label: 'გეგმიური სტაციონარული' },
  { value: '2', label: 'გადაუდებელი სტაციონარული' },
];

const STATUS_OPTIONS = [
  { value: '1', label: '-' },
  { value: '2', label: 'უფასო' },
  { value: '3', label: 'კვლევის პაციენტები' },
  { value: '5', label: 'პროტოკოლი: R3767-ONC-2266' },
];

// Departments - Ambulatory only (shown when mo_regtype = '3')
const DEPARTMENTS_AMBULATORY = [
  { value: '', label: '-' },
  { value: '736', label: 'ამბულატორია' },
  { value: '51442', label: 'ამბულატორიული ონკოლოგია' },
];

// Departments - All (shown when mo_regtype = '1' or '2')
const DEPARTMENTS_ALL = [
  { value: '', label: '-' },
  { value: '18', label: 'კარდიოქირურგია' },
  { value: '620', label: 'სისხლძარღვთა ქირურგია' },
  { value: '735', label: 'კარდიოლოგია' },
  { value: '981', label: 'არითმოლოგია' },
  { value: '3937', label: 'კარდიოქირურგიული განყოფილება' },
  { value: '17828', label: 'გადაუდებელი განყოფილება (ER)' },
  { value: '25119', label: 'ზოგადი ქირურგიის დეპარტამენტი' },
  { value: '33965', label: 'ჰოსტოპი ორი' },
  { value: '50549', label: 'კლინიკური ონკოლოგია' },
  { value: '55320', label: 'შინაგან სნეულებათა დეპარტამენტი' },
  { value: '55321', label: 'კოვიდ განყოფილება' },
  { value: '55322', label: 'ზოგადი რეანიმაცია' },
  { value: '55323', label: 'ტრავმა ორთოპედია' },
  { value: '55324', label: 'ნეიროქირურგია' },
  { value: '55325', label: 'საოპერაციო' },
  { value: '55326', label: 'ონკოლოგია' },
  { value: '55327', label: 'ნევროლოგია' },
  { value: '55328', label: 'ნევროლოგიური კვლევები' },
  { value: '55329', label: 'მაკროქირურგია' },
  { value: '55330', label: 'პლასტიკური ქირურგია' },
  { value: '55331', label: 'უროლოგია' },
  { value: '55332', label: 'ჩარჩოვანი ქირურგია' },
];

// მომართვის ტიპი (Referral Type) options based on შემოსვლის ტიპი (Admission Type)
// When ამბულატორიული (value='3')
const REFERRAL_TYPE_AMBULATORY = [
  { value: '3', label: 'გეგმიური ამბულატორია' },
  { value: '2', label: 'დღის სტაციონარი' },
];

// When გეგმიური სტაციონარული (value='1')
const REFERRAL_TYPE_PLANNED_INPATIENT = [
  { value: '1', label: 'სტაციონარი' },
  { value: '2', label: 'დღის სტაციონარი' },
];

// When გადაუდებელი სტაციონარული (value='2')
const REFERRAL_TYPE_EMERGENCY = [
  { value: '4', label: 'თვითდინება' },
  { value: '5', label: 'სასწრაფო' },
  { value: '6', label: 'გადმოყვანილი კატასტროფით' },
];

// Complete Insurance Companies list (42 companies)
const INSURANCE_COMPANIES = [
  { value: '0', label: '-' },
  { value: '628', label: 'სსიპ ჯანმრთელობის ეროვნული სააგენტო' },
  { value: '6379', label: 'ს.ს. სადაზღვევო კომპანია "ჯიპიაი ჰოლდინგი"' },
  { value: '6380', label: 'ალდაგი' },
  { value: '6381', label: 'სს "დაზღვევის კომპანია ქართუ"' },
  { value: '6382', label: 'სტანდარტ დაზღვევა' },
  { value: '6383', label: 'სს "პსპ დაზღვევა"' },
  { value: '6384', label: 'სს „სადაზღვევო კომპანია ევროინს ჯორჯია"' },
  { value: '6385', label: 'შპს სადაზღვევო კომპანია "არდი ჯგუფი"' },
  { value: '7603', label: 'აჭარის ავტონომიური რესპუბლიკის ჯანმრთელობისა და სოციალური დაცვის სამინისტრო' },
  { value: '8175', label: 'იმედი L' },
  { value: '9155', label: 'ქ. თბილისის მუნიციპალიტეტის მერია' },
  { value: '10483', label: 'სამხრეთ ოსეთის ადმინისტრაცია' },
  { value: '10520', label: 'ირაო' },
  { value: '11209', label: 'ვია-ვიტა' },
  { value: '11213', label: 'რეფერალური დახმარების ცენტრი' },
  { value: '12078', label: '"კახეთი-იონი"' },
  { value: '12461', label: 'საქართველოს სასჯელაღსრულებისა და პრობაციის სამინისტროს სამედიცინო დეპარტამენტი' },
  { value: '14134', label: 'ბინადრობის უფლება' },
  { value: '14137', label: 'დაზღვევის არ მქონე' },
  { value: '16476', label: 'უნისონი' },
  { value: '16803', label: 'ალფა' },
  { value: '22108', label: 'IGG' },
  { value: '41288', label: 'სს "ნიუ ვიჟენ დაზღვევა"' },
  { value: '46299', label: 'სადაზღვევო კომპანია გლობალ ბენეფიტს ჯორჯია' },
  { value: '49974', label: 'ინგოროყვას კლინიკა' },
  { value: '51870', label: 'ონის მუნიციპალიტეტის მერია' },
  { value: '52103', label: 'რეფერალი ონკოლოგია' },
  { value: '54184', label: 'შპს" თბილისის ცენტრალური საავადმყოფო" 203826645' },
  { value: '61677', label: 'ა(ა)იპ საქართველოს სოლიდარობის ფონდი. რეფერალური მომსახურების დეპარტამენტი' },
  { value: '61768', label: 'ახალი მზერა' },
  { value: '63054', label: 'სს კურაციო' },
  { value: '67209', label: 'გერმანული ჰოსპიტალი' },
  { value: '67469', label: 'რეგიონალური ჯანდაცვის ცენტრი' },
  { value: '70867', label: 'სსიპ დევნილთა, ეკომიგრანტთა და საარსებო წყაროებით უზრუნველყოფის სააგენტო' },
  { value: '79541', label: 'შპს გაგრა' },
  { value: '81614', label: 'შპს თბილისის გულის ცენტრი' },
  { value: '86705', label: 'კონსილიუმ მედულა' },
  { value: '88950', label: 'ქართულ-ამერიკული რეპროდუქციული კლინიკა რეპროარტი' },
  { value: '89213', label: 'შპს ელიავას საერთაშორისო ფაგო თერაპიული ცენტრი' },
  { value: '89718', label: 'შპს ჯეო ჰოსპიტალს' },
  { value: '91685', label: 'სს "საქართველოს კლინიკები" - ხაშურის ჰოსპიტალი' },
];

// Complete Insurance Types list (49 types)
const INSURANCE_TYPES = [
  { value: '0', label: '-' },
  { value: '10', label: 'საპენსიო' },
  { value: '13', label: 'პედაგოგი' },
  { value: '14', label: 'უმწეო' },
  { value: '15', label: 'შშმპ' },
  { value: '17', label: '36-2-გადაუდებალი ამბულატორია (მინიმალური)' },
  { value: '18', label: '36-3-გადაუდებალი სტაციონარი' },
  { value: '19', label: '36-3-გადაუდებელი სტაციონარი (მინიმალური)' },
  { value: '20', label: '36-4-გეგმიური ქირურგიული მომსახურება' },
  { value: '21', label: '36-5-კარდიოქირურგია' },
  { value: '22', label: '165-2-გადაუდებელი ამბულატორია' },
  { value: '23', label: '165-3-გადაუდებალი სტაციონარი' },
  { value: '24', label: '165-4-გეგმიური ქირურგიული მომსახურება' },
  { value: '25', label: '165-5-კარდიოქირურგია' },
  { value: '26', label: '218-2-გადაუდებალი ამბულატორია' },
  { value: '27', label: '218-3-გადაუდებალი სტაციონარი' },
  { value: '28', label: '218-4-გეგმიური ქირურგიული მომსახურება' },
  { value: '29', label: '218-5-კარდიოქირურგია' },
  { value: '30', label: 'კორპორატიული' },
  { value: '32', label: 'რეფერალური მომსახურების სახელმწიფო პროგრამა' },
  { value: '33', label: 'ვეტერანი' },
  { value: '36', label: 'ქ. თბილისი მერიის სამედიცინო სერვისი' },
  { value: '37', label: 'სისხლძარღვოვანი მიდგომით უზრუნველყოფა' },
  { value: '38', label: '-' },
  { value: '39', label: 'საბაზისო < 1000' },
  { value: '40', label: 'საბაზისო >= 1000' },
  { value: '41', label: '36-2-გადაუდებელი ამბულატორია (ახალი)' },
  { value: '42', label: '36-2-გადაუდებალი ამბულატორია (მინიმალური) (ახალი)' },
  { value: '43', label: '36-3-გადაუდებალი სტაციონარი (ახალი)' },
  { value: '44', label: '36-3-გადაუდებელი სტაციონარი (მინიმალური) (ახალი)' },
  { value: '45', label: '36-4-გეგმიური ქირურგიული მომსახურება (ახალი)' },
  { value: '46', label: '36-5-კარდიოქირურგია (ახალი)' },
  { value: '47', label: 'საბაზისო > 40000' },
  { value: '48', label: 'მინიმალური პაკეტი' },
  { value: '49', label: '70000-დან 100000 ქულამდე' },
  { value: '50', label: 'მინიმალური < 1000' },
  { value: '51', label: 'მინიმალური >= 1000' },
  { value: '52', label: 'საბაზისო, 2017 წლის 1 იანვრის მდგომარეობით დაზღვეული' },
  { value: '53', label: 'საბაზისო, 2017 წლის 1 იანვრის შემდგომ დაზღვეული' },
  { value: '54', label: 'გადაუდებელი ამბულატორია 2' },
  { value: '55', label: 'კარდიოქირურგია 5' },
  { value: '56', label: 'საბაზისო 6-დან 18 წლამდე' },
  { value: '57', label: '165-სტუდენტი' },
  { value: '58', label: 'DRG გეგმიური ქირურგია' },
  { value: '59', label: 'DRG გადაუდებელი სტაციონარი' },
  { value: '60', label: 'პროგრამა რეფერალური მომსახურება, კომპონენტი ონკოლოგია-თანაგადახდა' },
  { value: '61', label: 'ქიმიოთერაპია და ჰორმონოთერაპია' },
  { value: '62', label: 'გულის ქირურგიის დამატებითი სამედიცინო მომსახურების ქვეპროგრამა' },
  { value: '63', label: 'სსიპ დევნილთა,ეკომიგრანტთა და საარსებო წყაროებით უზრუნველყოფის სააგენტო' },
];

const REGIONS = [
  { value: '', label: '-' },
  { value: '1', label: '01 - აფხაზეთი' },
  { value: '10', label: '02 - აჭარა' },
  { value: '17', label: '03 - გურია' },
  { value: '21', label: '04 - თბილისი' },
  { value: '39', label: '05 - იმერეთი' },
  { value: '52', label: '06 - კახეთი' },
  { value: '61', label: '07 - მცხეთა-მთიანეთი' },
  { value: '67', label: '08 - რაჭა-ლეჩხუმი და ქვემო სვანეთი' },
  { value: '72', label: '09 - საზღვარგარეთი' },
  { value: '74', label: '10 - სამეგრელო და ზემო სვანეთი' },
  { value: '84', label: '11 - სამცხე-ჯავახეთი' },
  { value: '91', label: '12 - ქვემო ქართლი' },
  { value: '99', label: '13 - შიდა ქართლი' },
];

const EDUCATION_OPTIONS = [
  { value: '', label: '-' },
  { value: '4', label: 'უმაღლესი განათლება' },
  { value: '5', label: 'სკოლამდელი განათლება' },
  { value: '6', label: 'საბაზისო განათლება (1-6 კლასი)' },
  { value: '7', label: 'მეორე საფეხურის განათლება (7-9 კლასი)' },
  { value: '8', label: 'მეორე საფეხურის განათლება (9-12 კლასი)' },
  { value: '9', label: 'პროფესიული განათლება' },
];

const FAMILY_STATUS_OPTIONS = [
  { value: '', label: '-' },
  { value: '1', label: 'დასაოჯახებელი' },
  { value: '2', label: 'დაოჯახებული' },
  { value: '3', label: 'განქორწინებული' },
  { value: '4', label: 'ქვრივი' },
  { value: '5', label: 'თანაცხოვრებაში მყოფი' },
];

const EMPLOYMENT_OPTIONS = [
  { value: '', label: '-' },
  { value: '1', label: 'დასაქმებული' },
  { value: '2', label: 'უმუშევარი' },
  { value: '3', label: 'პენსიონერი' },
  { value: '4', label: 'სტუდენტი' },
  { value: '5', label: 'მოსწავლე' },
  { value: '6', label: 'მომუშავე პენსიაზე გასვლის შემდგომ' },
  { value: '7', label: 'თვითდასაქმებული' },
  { value: '8', label: 'მომუშავე სტუდენტი' },
];

// Region-District cascading mapping (94 districts across 13 regions)
const REGION_DISTRICT_MAPPING: Record<string, { regionName: string; districts: { code: string; label: string }[] }> = {
  '1': {
    regionName: '01 - აფხაზეთი',
    districts: [
      { code: '0101', label: 'გაგრა' },
      { code: '0102', label: 'გალი' },
      { code: '0103', label: 'გუდაუთა' },
      { code: '0104', label: 'გულრიფში' },
      { code: '0105', label: 'ზემო აფხაზეთი' },
      { code: '0106', label: 'ოჩამჩირე' },
      { code: '0107', label: 'სოხუმი' },
      { code: '0108', label: 'ტყვარჩელი' },
    ],
  },
  '10': {
    regionName: '02 - აჭარა',
    districts: [
      { code: '0201', label: 'ბათუმი' },
      { code: '0202', label: 'ქედა' },
      { code: '0203', label: 'ქობულეთი' },
      { code: '0204', label: 'შუახევი' },
      { code: '0205', label: 'ხელვაჩაური' },
      { code: '0206', label: 'ხულო' },
    ],
  },
  '17': {
    regionName: '03 - გურია',
    districts: [
      { code: '0301', label: 'ლანჩხუთი' },
      { code: '0302', label: 'ოზურგეთი' },
      { code: '0303', label: 'ჩოხატაური' },
    ],
  },
  '21': {
    regionName: '04 - თბილისი',
    districts: [
      { code: '0401', label: 'გლდანი' },
      { code: '0402', label: 'გლდანი-ნაძალადევი' },
      { code: '0403', label: 'დიდგორი' },
      { code: '0404', label: 'დიდუბე' },
      { code: '0405', label: 'დიდუბე-ჩუღურეთი' },
      { code: '0406', label: 'ვაკე' },
      { code: '0407', label: 'ვაკე-საბურთალო' },
      { code: '0408', label: 'თბილისი' },
      { code: '0409', label: 'ისანი' },
      { code: '0410', label: 'ისანი-სამგორი' },
      { code: '0411', label: 'კრწანისი' },
      { code: '0412', label: 'მთაწმინდა' },
      { code: '0413', label: 'ნაძალადევი' },
      { code: '0414', label: 'საბურთალო' },
      { code: '0415', label: 'სამგორი' },
      { code: '0416', label: 'ჩუღურეთი' },
      { code: '0417', label: 'ძველი თბილისი' },
    ],
  },
  '39': {
    regionName: '05 - იმერეთი',
    districts: [
      { code: '0501', label: 'ბაღდათი' },
      { code: '0502', label: 'ვანი' },
      { code: '0503', label: 'ზესტაფონი' },
      { code: '0504', label: 'თერჯოლა' },
      { code: '0505', label: 'სამტრედია' },
      { code: '0506', label: 'საჩხერე' },
      { code: '0507', label: 'ტყიბული' },
      { code: '0508', label: 'ქუთაისი' },
      { code: '0509', label: 'წყალტუბო' },
      { code: '0510', label: 'ჭიათურა' },
      { code: '0511', label: 'ხარაგაული' },
      { code: '0512', label: 'ხონი' },
    ],
  },
  '52': {
    regionName: '06 - კახეთი',
    districts: [
      { code: '0601', label: 'ახმეტა' },
      { code: '0602', label: 'გურჯაანი' },
      { code: '0603', label: 'დედოფლისწყარო' },
      { code: '0604', label: 'თელავი' },
      { code: '0605', label: 'ლაგოდეხი' },
      { code: '0606', label: 'საგარეჯო' },
      { code: '0607', label: 'სიღნაღი' },
      { code: '0608', label: 'ყვარელი' },
    ],
  },
  '61': {
    regionName: '07 - მცხეთა-მთიანეთი',
    districts: [
      { code: '0701', label: 'ახალგორი' },
      { code: '0702', label: 'დუშეთი' },
      { code: '0703', label: 'თიანეთი' },
      { code: '0704', label: 'მცხეთა' },
      { code: '0705', label: 'ყაზბეგი' },
    ],
  },
  '67': {
    regionName: '08 - რაჭა-ლეჩხუმი და ქვემო სვანეთი',
    districts: [
      { code: '0801', label: 'ამბროლაური' },
      { code: '0802', label: 'ლენტეხი' },
      { code: '0803', label: 'ონი' },
      { code: '0804', label: 'ცაგერი' },
    ],
  },
  '72': {
    regionName: '09 - საზღვარგარეთი',
    districts: [{ code: '0901', label: 'საზღვარგარეთი' }],
  },
  '74': {
    regionName: '10 - სამეგრელო და ზემო სვანეთი',
    districts: [
      { code: '1001', label: 'აბაშა' },
      { code: '1002', label: 'ზუგდიდი' },
      { code: '1003', label: 'მარტვილი' },
      { code: '1004', label: 'მესტია' },
      { code: '1005', label: 'სენაკი' },
      { code: '1006', label: 'ფოთი' },
      { code: '1007', label: 'ჩხოროწყუ' },
      { code: '1008', label: 'წალენჯიხა' },
      { code: '1009', label: 'ხობი' },
    ],
  },
  '84': {
    regionName: '11 - სამცხე-ჯავახეთი',
    districts: [
      { code: '1101', label: 'ადიგენი' },
      { code: '1102', label: 'ასპინძა' },
      { code: '1103', label: 'ახალქალაქი' },
      { code: '1104', label: 'ახალციხე' },
      { code: '1105', label: 'ბორჯომი' },
      { code: '1106', label: 'ნინოწმინდა' },
    ],
  },
  '91': {
    regionName: '12 - ქვემო ქართლი',
    districts: [
      { code: '1201', label: 'ბოლნისი' },
      { code: '1202', label: 'გარდაბანი' },
      { code: '1203', label: 'დმანისი' },
      { code: '1204', label: 'თეთრიწყარო' },
      { code: '1205', label: 'მარნეული' },
      { code: '1206', label: 'რუსთავი' },
      { code: '1207', label: 'წალკა' },
    ],
  },
  '99': {
    regionName: '13 - შიდა ქართლი',
    districts: [
      { code: '1301', label: 'გორი' },
      { code: '1302', label: 'კასპი' },
      { code: '1303', label: 'ქარელი' },
      { code: '1304', label: 'ქურთა' },
      { code: '1305', label: 'ყორნისი' },
      { code: '1306', label: 'ცხინვალი' },
      { code: '1307', label: 'ხაშური' },
      { code: '1308', label: 'ჯავა' },
    ],
  },
};

/**
 * Registration Visit Modal - Opens when clicking patient in Registration page
 * Wide modal with 4 sections matching actual EMR layout (mo_ field IDs)
 */
export function RegistrationVisitModal({
  opened,
  onClose,
  patientId,
  onSuccess,
}: RegistrationVisitModalProps): JSX.Element {
  const { t } = useTranslation();
  const medplum = useMedplum();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [ambulatoryCount, setAmbulatoryCount] = useState(0);
  const [stationaryCount, setStationaryCount] = useState(0);

  // Dynamic dropdown options based on admission type
  const [departmentOptions, setDepartmentOptions] = useState(DEPARTMENTS_AMBULATORY);
  const [referralTypeOptions, setReferralTypeOptions] = useState(REFERRAL_TYPE_AMBULATORY);
  const [districtOptions, setDistrictOptions] = useState<{ value: string; label: string }[]>([{ value: '', label: '-' }]);

  const form = useForm<RegistrationVisitFormValues>({
    initialValues: {
      mo_regdate: new Date(),
      mo_regtime: new Date().toLocaleTimeString('ka-GE', { hour: '2-digit', minute: '2-digit', hour12: false }),
      mo_regtype: '3', // Default: Ambulatory
      mo_stat: '1',
      mo_incomgrp: '',
      mo_ddyastac: '3',

      mo_sbool: false,
      insurerCount: 1,

      mo_comp: '0',
      mo_instp: '0',
      mo_polnmb: '',
      mo_vano: '',
      mo_deldat: null,
      mo_valdat: null,
      mo_insprsnt: '',

      mo_comp1: '0',
      mo_instp1: '0',
      mo_polnmb1: '',
      mo_vano1: '',
      mo_deldat1: null,
      mo_valdat1: null,
      mo_insprsnt1: '',

      mo_comp2: '0',
      mo_instp2: '0',
      mo_polnmb2: '',
      mo_vano2: '',
      mo_deldat2: null,
      mo_valdat2: null,
      mo_insprsnt2: '',

      mo_timwh: '',
      mo_timamo: '',
      mo_timltdat: null,
      mo_timdrdat: null,
      mo_letterno: '',

      mo_regions: '',
      mo_raions_hid: '',
      mo_city: '',
      mo_otheraddress: '',
      mo_ganatleba: '',
      mo_ojaxi: '',
      mo_dasaqmeba: '',
    },
    validate: {
      mo_regdate: (value) => (!value ? 'Date is required' : null),
      mo_regtype: (value) => (!value ? 'Admission type is required' : null),
      mo_incomgrp: (value) => (!value ? 'Department is required' : null),
    },
  });

  // Dynamic filtering based on admission type
  useEffect(() => {
    const admissionType = form.values.mo_regtype;

    if (admissionType === '3') {
      // Ambulatory - show only ambulatory departments and referral types
      setDepartmentOptions(DEPARTMENTS_AMBULATORY);
      setReferralTypeOptions(REFERRAL_TYPE_AMBULATORY);

      // Reset department if current value is not in ambulatory list
      const currentDept = form.values.mo_incomgrp;
      const isValidDept = DEPARTMENTS_AMBULATORY.some((d) => d.value === currentDept);
      if (!isValidDept && currentDept !== '') {
        form.setFieldValue('mo_incomgrp', '');
      }

      // Reset referral type if current value is not in ambulatory list
      const currentRefType = form.values.mo_ddyastac;
      const isValidRefType = REFERRAL_TYPE_AMBULATORY.some((h) => h.value === currentRefType);
      if (!isValidRefType) {
        form.setFieldValue('mo_ddyastac', '3'); // Default to Planned Ambulatory
      }
    } else if (admissionType === '1') {
      // Planned Inpatient - show all departments, specific referral types
      setDepartmentOptions(DEPARTMENTS_ALL);
      setReferralTypeOptions(REFERRAL_TYPE_PLANNED_INPATIENT);

      // Reset department if current value is ambulatory-only
      const currentDept = form.values.mo_incomgrp;
      const isAmbOnly = DEPARTMENTS_AMBULATORY.some((d) => d.value === currentDept) && currentDept !== '';
      if (isAmbOnly) {
        form.setFieldValue('mo_incomgrp', '');
      }

      // Reset referral type
      const currentRefType = form.values.mo_ddyastac;
      const isValidRefType = REFERRAL_TYPE_PLANNED_INPATIENT.some((h) => h.value === currentRefType);
      if (!isValidRefType) {
        form.setFieldValue('mo_ddyastac', '1'); // Default to Inpatient
      }
    } else if (admissionType === '2') {
      // Emergency Inpatient - show all departments, emergency referral types
      setDepartmentOptions(DEPARTMENTS_ALL);
      setReferralTypeOptions(REFERRAL_TYPE_EMERGENCY);

      // Reset department if current value is ambulatory-only
      const currentDept = form.values.mo_incomgrp;
      const isAmbOnly = DEPARTMENTS_AMBULATORY.some((d) => d.value === currentDept) && currentDept !== '';
      if (isAmbOnly) {
        form.setFieldValue('mo_incomgrp', '');
      }

      // Reset referral type
      const currentRefType = form.values.mo_ddyastac;
      const isValidRefType = REFERRAL_TYPE_EMERGENCY.some((h) => h.value === currentRefType);
      if (!isValidRefType) {
        form.setFieldValue('mo_ddyastac', '4'); // Default to Self-referral
      }
    }
  }, [form.values.mo_regtype]);

  // Dynamic filtering of districts based on selected region
  useEffect(() => {
    const selectedRegion = form.values.mo_regions;

    if (selectedRegion && REGION_DISTRICT_MAPPING[selectedRegion]) {
      const regionData = REGION_DISTRICT_MAPPING[selectedRegion];
      const districts = regionData.districts.map((d) => ({
        value: d.code,
        label: d.label,
      }));
      setDistrictOptions([{ value: '', label: '-' }, ...districts]);

      // Reset district if current value is not in the new region's districts
      const currentDistrict = form.values.mo_raions_hid;
      const isValidDistrict = districts.some((d) => d.value === currentDistrict);
      if (!isValidDistrict && currentDistrict !== '') {
        form.setFieldValue('mo_raions_hid', '');
      }
    } else {
      // No region selected - show empty districts
      setDistrictOptions([{ value: '', label: '-' }]);
      if (form.values.mo_raions_hid !== '') {
        form.setFieldValue('mo_raions_hid', '');
      }
    }
  }, [form.values.mo_regions]);

  // Load patient data when modal opens
  useEffect(() => {
    if (!patientId || !opened) {
      setInitialLoading(false);
      return;
    }

    const loadPatientData = async () => {
      try {
        setInitialLoading(true);
        const patientResource = await medplum.readResource('Patient', patientId);
        setPatient(patientResource);

        // Count existing encounters by type
        const encounters = await medplum.searchResources('Encounter', {
          subject: `Patient/${patientId}`,
          _count: '1000',
        });

        let ambCount = 0;
        let statCount = 0;
        encounters.forEach((enc) => {
          if (enc.class?.code === 'AMB') {
            ambCount++;
          } else {
            statCount++;
          }
        });
        setAmbulatoryCount(ambCount);
        setStationaryCount(statCount);

        // Pre-fill demographics from patient
        const region = patientResource.address?.[0]?.state || '';
        const district = patientResource.address?.[0]?.district || '';
        const city = patientResource.address?.[0]?.city || '';
        const actualAddress = patientResource.address?.[0]?.line?.join(', ') || '';
        const education = patientResource
          ? getExtensionValue(patientResource, 'http://medimind.ge/fhir/StructureDefinition/education') || ''
          : '';
        const familyStatus = patientResource
          ? getExtensionValue(patientResource, 'http://medimind.ge/fhir/StructureDefinition/family-status') || ''
          : '';
        const employment = patientResource
          ? getExtensionValue(patientResource, 'http://medimind.ge/fhir/StructureDefinition/employment') || ''
          : '';

        form.setValues({
          ...form.values,
          mo_regions: region,
          mo_raions_hid: district,
          mo_city: city,
          mo_otheraddress: actualAddress,
          mo_ganatleba: education,
          mo_ojaxi: familyStatus,
          mo_dasaqmeba: employment,
        });
      } catch (error) {
        console.error('Failed to load patient:', error);
      } finally {
        setInitialLoading(false);
      }
    };

    loadPatientData();
  }, [patientId, opened, medplum]);

  const addInsurer = () => {
    if (form.values.insurerCount < 3) {
      form.setFieldValue('insurerCount', form.values.insurerCount + 1);
    }
  };

  const handleSave = async (values: RegistrationVisitFormValues) => {
    if (!patientId) return;

    setLoading(true);
    try {
      // Combine date and time
      const visitDateTime = new Date(values.mo_regdate || new Date());
      if (values.mo_regtime) {
        const [hours, minutes] = values.mo_regtime.split(':');
        visitDateTime.setHours(parseInt(hours, 10), parseInt(minutes, 10));
      }

      // Map admission type to FHIR codes
      const admissionTypeMap: Record<string, string> = {
        '3': 'AMB', // Ambulatory
        '1': 'IMP', // Planned Inpatient
        '2': 'EMER', // Emergency Inpatient
      };

      const newEncounter: Encounter = {
        resourceType: 'Encounter',
        status: 'planned',
        class: {
          system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode',
          code: admissionTypeMap[values.mo_regtype] || 'AMB',
          display: ADMISSION_TYPES.find((t) => t.value === values.mo_regtype)?.label || 'Ambulatory',
        },
        subject: {
          reference: `Patient/${patientId}`,
        },
        period: {
          start: visitDateTime.toISOString(),
        },
        serviceType: {
          coding: [
            {
              system: 'http://medimind.ge/CodeSystem/department',
              code: values.mo_incomgrp,
              display:
                DEPARTMENTS_ALL.find((d) => d.value === values.mo_incomgrp)?.label ||
                DEPARTMENTS_AMBULATORY.find((d) => d.value === values.mo_incomgrp)?.label ||
                '',
            },
          ],
        },
        extension: [
          {
            url: 'http://medimind.ge/StructureDefinition/status-code',
            valueCode: values.mo_stat,
          },
          {
            url: 'http://medimind.ge/StructureDefinition/hospital-type',
            valueCode: values.mo_ddyastac,
          },
        ],
      };

      // Add guarantee letter if provided
      if (values.mo_timwh || values.mo_timamo || values.mo_letterno) {
        newEncounter.extension?.push({
          url: 'http://medimind.ge/StructureDefinition/guarantee-letter',
          extension: [
            { url: 'donor', valueString: values.mo_timwh },
            { url: 'amount', valueString: values.mo_timamo },
            { url: 'letter-number', valueString: values.mo_letterno },
          ],
        });
      }

      await medplum.createResource(newEncounter);

      notifications.show({
        title: t('registration.success.title') || 'Success',
        message: t('registration.success.visitCreated') || 'Visit registered successfully',
        color: 'green',
      });

      onSuccess();
    } catch (error) {
      notifications.show({
        title: t('registration.error.title') || 'Error',
        message: t('registration.error.saveFailed') || 'Failed to save visit',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  // Patient display name
  const patientName = patient
    ? `${patient.name?.[0]?.given?.join(' ') || ''} ${patient.name?.[0]?.family || ''}`
    : '';

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      size="90%"
      title={
        <Group gap="lg">
          <Text fw={700} size="xl" c="dark">
            {patientName}
          </Text>
          <Badge
            size="lg"
            variant="filled"
            style={{
              background: 'linear-gradient(135deg, #17a2b8 0%, #20c4dd 100%)',
              fontSize: '14px',
              padding: '8px 16px',
            }}
          >
            ვიზიტები: {ambulatoryCount}/{stationaryCount} (ამბუ/სტაც)
          </Badge>
        </Group>
      }
      styles={{
        header: {
          borderBottom: '2px solid #e9ecef',
          paddingBottom: 12,
          marginBottom: 0,
        },
        body: {
          padding: '20px 24px',
          maxHeight: 'calc(100vh - 200px)',
          overflowY: 'auto',
        },
        content: {
          borderRadius: '12px',
        },
      }}
    >
      <LoadingOverlay visible={initialLoading} />

      <form onSubmit={form.onSubmit(handleSave)}>
        <Stack gap="lg">
          {/* Section 1: Registration */}
          <Paper p="lg" style={{ backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
            <Group justify="space-between" mb="md">
              <Text fw={700} size="lg" c="blue">
                1 რეგისტრაცია
              </Text>
              <IconNotes size={24} color="#6c757d" />
            </Group>

            <Grid gutter="md">
              <Grid.Col span={3}>
                <Box>
                  <Text size="sm" fw={500} mb={4}>
                    თარიღი *
                  </Text>
                  <Group gap="xs">
                    <EMRDatePicker
                      value={form.values.mo_regdate}
                      onChange={(date) => form.setFieldValue('mo_regdate', date)}
                      placeholder="აირჩიეთ თარიღი"
                      required
                      error={form.errors.mo_regdate}
                    />
                    <TimeInput style={{ width: '100px' }} {...form.getInputProps('mo_regtime')} />
                  </Group>
                </Box>
              </Grid.Col>
              <Grid.Col span={3}>
                <Select
                  label="შემოსვლის ტიპი *"
                  required
                  data={ADMISSION_TYPES}
                  {...form.getInputProps('mo_regtype')}
                />
              </Grid.Col>
              <Grid.Col span={3}>
                <Select label="სტატუსი" data={STATUS_OPTIONS} {...form.getInputProps('mo_stat')} />
              </Grid.Col>
              <Grid.Col span={3}>
                <Select
                  label="მომართვის ტიპი"
                  data={referralTypeOptions}
                  {...form.getInputProps('mo_ddyastac')}
                />
              </Grid.Col>
            </Grid>

            <Grid gutter="md" mt="sm">
              <Grid.Col span={12}>
                <Select
                  label="განყოფილება *"
                  required
                  data={departmentOptions}
                  searchable
                  {...form.getInputProps('mo_incomgrp')}
                />
              </Grid.Col>
            </Grid>
          </Paper>

          {/* Section 2: Insurance */}
          <Paper p="lg" style={{ backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
            <Group justify="space-between" mb="md">
              <Text fw={700} size="lg" c="blue">
                2 დაზღვევა
              </Text>
              <Checkbox
                label="დაზღვევის ჩართვა"
                {...form.getInputProps('mo_sbool', { type: 'checkbox' })}
              />
            </Group>

            {form.values.mo_sbool && (
              <Stack gap="md">
                {/* Primary Insurer */}
                <Box>
                  <Text fw={600} mb="sm" c="dimmed">
                    პირველი მზღვეველი
                  </Text>
                  <Grid gutter="sm">
                    <Grid.Col span={3}>
                      <Select
                        label="კომპანია"
                        data={INSURANCE_COMPANIES}
                        searchable
                        {...form.getInputProps('mo_comp')}
                      />
                    </Grid.Col>
                    <Grid.Col span={3}>
                      <Select
                        label="ტიპი"
                        data={INSURANCE_TYPES}
                        searchable
                        {...form.getInputProps('mo_instp')}
                      />
                    </Grid.Col>
                    <Grid.Col span={2}>
                      <TextInput label="პოლისის #" {...form.getInputProps('mo_polnmb')} />
                    </Grid.Col>
                    <Grid.Col span={2}>
                      <TextInput label="მიმართვის #" {...form.getInputProps('mo_vano')} />
                    </Grid.Col>
                    <Grid.Col span={2}>
                      <TextInput label="თანაგადახდის %" {...form.getInputProps('mo_insprsnt')} />
                    </Grid.Col>
                  </Grid>
                  <Grid gutter="sm" mt="xs">
                    <Grid.Col span={3}>
                      <EMRDatePicker
                        label="გაცემის თარიღი"
                        value={form.values.mo_deldat}
                        onChange={(date) => form.setFieldValue('mo_deldat', date)}
                      />
                    </Grid.Col>
                    <Grid.Col span={3}>
                      <EMRDatePicker
                        label="მოქმედების ვადა"
                        value={form.values.mo_valdat}
                        onChange={(date) => form.setFieldValue('mo_valdat', date)}
                      />
                    </Grid.Col>
                    <Grid.Col span={6} />
                  </Grid>
                </Box>

                {/* Secondary Insurer */}
                {form.values.insurerCount >= 2 && (
                  <Box>
                    <Divider my="sm" />
                    <Text fw={600} mb="sm" c="dimmed">
                      მეორე მზღვეველი
                    </Text>
                    <Grid gutter="sm">
                      <Grid.Col span={3}>
                        <Select
                          label="კომპანია"
                          data={INSURANCE_COMPANIES}
                          searchable
                          {...form.getInputProps('mo_comp1')}
                        />
                      </Grid.Col>
                      <Grid.Col span={3}>
                        <Select
                          label="ტიპი"
                          data={INSURANCE_TYPES}
                          searchable
                          {...form.getInputProps('mo_instp1')}
                        />
                      </Grid.Col>
                      <Grid.Col span={2}>
                        <TextInput label="პოლისის #" {...form.getInputProps('mo_polnmb1')} />
                      </Grid.Col>
                      <Grid.Col span={2}>
                        <TextInput label="მიმართვის #" {...form.getInputProps('mo_vano1')} />
                      </Grid.Col>
                      <Grid.Col span={2}>
                        <TextInput label="თანაგადახდის %" {...form.getInputProps('mo_insprsnt1')} />
                      </Grid.Col>
                    </Grid>
                    <Grid gutter="sm" mt="xs">
                      <Grid.Col span={3}>
                        <EMRDatePicker
                          label="გაცემის თარიღი"
                          value={form.values.mo_deldat1}
                          onChange={(date) => form.setFieldValue('mo_deldat1', date)}
                        />
                      </Grid.Col>
                      <Grid.Col span={3}>
                        <EMRDatePicker
                          label="მოქმედების ვადა"
                          value={form.values.mo_valdat1}
                          onChange={(date) => form.setFieldValue('mo_valdat1', date)}
                        />
                      </Grid.Col>
                      <Grid.Col span={6} />
                    </Grid>
                  </Box>
                )}

                {/* Tertiary Insurer */}
                {form.values.insurerCount >= 3 && (
                  <Box>
                    <Divider my="sm" />
                    <Text fw={600} mb="sm" c="dimmed">
                      მესამე მზღვეველი
                    </Text>
                    <Grid gutter="sm">
                      <Grid.Col span={3}>
                        <Select
                          label="კომპანია"
                          data={INSURANCE_COMPANIES}
                          searchable
                          {...form.getInputProps('mo_comp2')}
                        />
                      </Grid.Col>
                      <Grid.Col span={3}>
                        <Select
                          label="ტიპი"
                          data={INSURANCE_TYPES}
                          searchable
                          {...form.getInputProps('mo_instp2')}
                        />
                      </Grid.Col>
                      <Grid.Col span={2}>
                        <TextInput label="პოლისის #" {...form.getInputProps('mo_polnmb2')} />
                      </Grid.Col>
                      <Grid.Col span={2}>
                        <TextInput label="მიმართვის #" {...form.getInputProps('mo_vano2')} />
                      </Grid.Col>
                      <Grid.Col span={2}>
                        <TextInput label="თანაგადახდის %" {...form.getInputProps('mo_insprsnt2')} />
                      </Grid.Col>
                    </Grid>
                    <Grid gutter="sm" mt="xs">
                      <Grid.Col span={3}>
                        <EMRDatePicker
                          label="გაცემის თარიღი"
                          value={form.values.mo_deldat2}
                          onChange={(date) => form.setFieldValue('mo_deldat2', date)}
                        />
                      </Grid.Col>
                      <Grid.Col span={3}>
                        <EMRDatePicker
                          label="მოქმედების ვადა"
                          value={form.values.mo_valdat2}
                          onChange={(date) => form.setFieldValue('mo_valdat2', date)}
                        />
                      </Grid.Col>
                      <Grid.Col span={6} />
                    </Grid>
                  </Box>
                )}

                {/* Add More Button */}
                {form.values.insurerCount < 3 && (
                  <Button
                    variant="subtle"
                    leftSection={<IconPlus size={16} />}
                    onClick={addInsurer}
                    size="sm"
                    style={{ alignSelf: 'flex-start' }}
                  >
                    მეტი მზღვეველის დამატება
                  </Button>
                )}
              </Stack>
            )}
          </Paper>

          {/* Section 3: Guarantee - Letter Management System */}
          <Paper p="lg" style={{ backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
            <Group justify="space-between" mb="md">
              <Text fw={700} size="lg" c="blue">
                3 საგარანტიო
              </Text>
              <ActionIcon variant="subtle" size="sm">
                <IconPlus size={16} />
              </ActionIcon>
            </Group>

            <Grid gutter="sm">
              <Grid.Col span={3}>
                <Group gap="xs" align="flex-end">
                  <TextInput
                    label="დონორი"
                    style={{ flex: 1 }}
                    {...form.getInputProps('mo_timwh')}
                  />
                  <ActionIcon variant="light" size="lg">
                    <IconSearch size={16} />
                  </ActionIcon>
                </Group>
              </Grid.Col>
              <Grid.Col span={2}>
                <TextInput label="თანხა" {...form.getInputProps('mo_timamo')} />
              </Grid.Col>
              <Grid.Col span={2}>
                <EMRDatePicker
                  label="თარიღი"
                  value={form.values.mo_timltdat}
                  onChange={(date) => form.setFieldValue('mo_timltdat', date)}
                />
              </Grid.Col>
              <Grid.Col span={2}>
                <EMRDatePicker
                  label="დასრულების თარიღი"
                  value={form.values.mo_timdrdat}
                  onChange={(date) => form.setFieldValue('mo_timdrdat', date)}
                />
              </Grid.Col>
              <Grid.Col span={3}>
                <TextInput label="ნომერი" {...form.getInputProps('mo_letterno')} />
              </Grid.Col>
            </Grid>
          </Paper>

          {/* Section 4: Demographics - EDITABLE */}
          <Paper p="lg" style={{ backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
            <Group justify="space-between" mb="md">
              <Text fw={700} size="lg" c="blue">
                4 დემოგრაფია
              </Text>
              <Button variant="subtle" size="xs">
                კოპირება
              </Button>
            </Group>

            <Grid gutter="sm">
              <Grid.Col span={3}>
                <Select
                  label="რეგიონი"
                  data={REGIONS}
                  searchable
                  {...form.getInputProps('mo_regions')}
                />
              </Grid.Col>
              <Grid.Col span={3}>
                <Select
                  label="რაიონი"
                  data={districtOptions}
                  searchable
                  disabled={!form.values.mo_regions}
                  placeholder={form.values.mo_regions ? 'აირჩიეთ რაიონი' : 'ჯერ აირჩიეთ რეგიონი'}
                  {...form.getInputProps('mo_raions_hid')}
                />
              </Grid.Col>
              <Grid.Col span={3}>
                <TextInput label="ქალაქი" {...form.getInputProps('mo_city')} />
              </Grid.Col>
              <Grid.Col span={3}>
                <TextInput label="ფაქტიური მისამართი" {...form.getInputProps('mo_otheraddress')} />
              </Grid.Col>
            </Grid>
            <Grid gutter="sm" mt="xs">
              <Grid.Col span={3}>
                <Select
                  label="განათლება"
                  data={EDUCATION_OPTIONS}
                  {...form.getInputProps('mo_ganatleba')}
                />
              </Grid.Col>
              <Grid.Col span={3}>
                <Select
                  label="ოჯახური მდგომარეობა"
                  data={FAMILY_STATUS_OPTIONS}
                  {...form.getInputProps('mo_ojaxi')}
                />
              </Grid.Col>
              <Grid.Col span={3}>
                <Select
                  label="დასაქმება"
                  data={EMPLOYMENT_OPTIONS}
                  {...form.getInputProps('mo_dasaqmeba')}
                />
              </Grid.Col>
              <Grid.Col span={3} />
            </Grid>
          </Paper>

          <Divider />

          {/* Save Button */}
          <Group justify="flex-end">
            <Button variant="default" onClick={onClose} disabled={loading}>
              გაუქმება
            </Button>
            <Button
              type="submit"
              loading={loading}
              size="lg"
              style={{
                background: 'linear-gradient(135deg, #17a2b8 0%, #20c4dd 100%)',
                border: 'none',
                fontWeight: 600,
                padding: '12px 32px',
              }}
            >
              შენახვა
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
