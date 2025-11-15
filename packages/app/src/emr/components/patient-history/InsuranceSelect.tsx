// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { Select } from '@mantine/core';
import type { JSX } from 'react';
import { useState, useEffect } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import type { InsuranceOption } from '../../types/patient-history';

// Insurance companies from Georgian healthcare system (58 total)
const INSURANCE_COMPANIES = [
  // Internal/Private Pay (Default)
  { id: '0', code: 'INTERNAL', name: { ka: 'შიდა', en: 'Internal', ru: 'Внутренний' }, type: 'private' },

  // Government Insurance Agencies
  {
    id: '628',
    code: 'NATIONAL_HEALTH',
    name: {
      ka: 'სსიპ ჯანმრთელობის ეროვნული სააგენტო',
      en: 'National Health Agency',
      ru: 'Национальное агентство здравоохранения',
    },
    type: 'government',
  },
  {
    id: '629',
    code: 'MINISTRY_DEFENSE',
    name: { ka: 'თავდაცვის სამინისტრო', en: 'Ministry of Defense', ru: 'Министерство обороны' },
    type: 'government',
  },
  {
    id: '630',
    code: 'MINISTRY_INTERNAL',
    name: {
      ka: 'შინაგან საქმეთა სამინისტრო',
      en: 'Ministry of Internal Affairs',
      ru: 'Министерство внутренних дел',
    },
    type: 'government',
  },
  {
    id: '631',
    code: 'MINISTRY_JUSTICE',
    name: { ka: 'იუსტიციის სამინისტრო', en: 'Ministry of Justice', ru: 'Министерство юстиции' },
    type: 'government',
  },
  {
    id: '632',
    code: 'STATE_SECURITY',
    name: {
      ka: 'სახელმწიფო უსაფრთხოების სამსახური',
      en: 'State Security Service',
      ru: 'Служба государственной безопасности',
    },
    type: 'government',
  },

  // Private Insurance Companies
  { id: '1', code: 'ALDAGI', name: { ka: 'ალდაგი', en: 'Aldagi Insurance', ru: 'Алдаги' }, type: 'private' },
  {
    id: '2',
    code: 'GPI',
    name: { ka: 'ჯი-ფი-აი დაზღვევა', en: 'GPI Insurance', ru: 'ДжиПиАй страхование' },
    type: 'private',
  },
  {
    id: '3',
    code: 'IMEDI_L',
    name: { ka: 'იმედი-ლ', en: 'Imedi-L Insurance', ru: 'Имеди-Л' },
    type: 'private',
  },
  { id: '4', code: 'IRAO', name: { ka: 'ირაო', en: 'Irao Insurance', ru: 'Ирао' }, type: 'private' },
  {
    id: '5',
    code: 'GPIH',
    name: { ka: 'ჯი-ფი-აი-ჰ', en: 'GPI Health Insurance', ru: 'ДжиПиАй здоровье' },
    type: 'private',
  },
  {
    id: '6',
    code: 'GEOCLINIC',
    name: { ka: 'გეოქლინიკი', en: 'Geoclinic Insurance', ru: 'Геоклиника' },
    type: 'private',
  },
  {
    id: '7',
    code: 'AVERSI',
    name: { ka: 'აფთიაქი ავერსი', en: 'Aversi Pharmacy', ru: 'Аптека Аверси' },
    type: 'private',
  },
  {
    id: '8',
    code: 'MEDICAL_CLINIC',
    name: { ka: 'მედიკალური კლინიკა', en: 'Medical Clinic', ru: 'Медицинская клиника' },
    type: 'private',
  },
  {
    id: '9',
    code: 'UNIVERSAL',
    name: { ka: 'უნივერსალი', en: 'Universal Insurance', ru: 'Универсал' },
    type: 'private',
  },
  {
    id: '10',
    code: 'BCI',
    name: { ka: 'ბი-სი-აი', en: 'BCI Insurance', ru: 'БиСиАй' },
    type: 'private',
  },
  {
    id: '11',
    code: 'BOKERIA',
    name: { ka: 'ბოკერია', en: 'Bokeria Medical Center', ru: 'Бокериа' },
    type: 'private',
  },
  {
    id: '12',
    code: 'CAUCASUS_MEDICAL',
    name: { ka: 'კავკასიის მედიცინა', en: 'Caucasus Medical', ru: 'Кавказская медицина' },
    type: 'private',
  },
  {
    id: '13',
    code: 'EVEX',
    name: { ka: 'ევექსი', en: 'Evex Hospitals', ru: 'Эвекс' },
    type: 'private',
  },
  {
    id: '14',
    code: 'GLOBAL_HEALTH',
    name: { ka: 'გლობალური ჯანმრთელობა', en: 'Global Health', ru: 'Глобальное здоровье' },
    type: 'private',
  },
  {
    id: '15',
    code: 'NATIONAL_CENTER',
    name: {
      ka: 'ეროვნული ჯანდაცვის ცენტრი',
      en: 'National Healthcare Center',
      ru: 'Национальный центр здравоохранения',
    },
    type: 'private',
  },
  {
    id: '16',
    code: 'MEGA_CLINIC',
    name: { ka: 'მეგა კლინიკა', en: 'Mega Clinic', ru: 'Мега клиника' },
    type: 'private',
  },
  {
    id: '17',
    code: 'GHUDUSHAURI',
    name: { ka: 'ღუდუშაური', en: 'Ghudushauri Hospital', ru: 'Гудушаури' },
    type: 'private',
  },
  {
    id: '18',
    code: 'MEGI',
    name: { ka: 'მეგი', en: 'Megi Medical Center', ru: 'Меги' },
    type: 'private',
  },
  {
    id: '19',
    code: 'TODUA',
    name: { ka: 'თოდუა', en: 'Todua Clinic', ru: 'Тодуа' },
    type: 'private',
  },
  {
    id: '20',
    code: 'VIVA_MED',
    name: { ka: 'ვივა მედი', en: 'Viva Med', ru: 'Вива мед' },
    type: 'private',
  },

  // Hospital-Based Insurance
  {
    id: '21',
    code: 'INNOMED',
    name: { ka: 'ინომედი', en: 'Innomed Hospital', ru: 'Инномед' },
    type: 'hospital',
  },
  {
    id: '22',
    code: 'MEDISON',
    name: { ka: 'მედისონი', en: 'Medison Hospital', ru: 'Медисон' },
    type: 'hospital',
  },
  {
    id: '23',
    code: 'VITA',
    name: { ka: 'ვიტა', en: 'Vita Medical Center', ru: 'Вита' },
    type: 'hospital',
  },
  {
    id: '24',
    code: 'MEDI_CLUB',
    name: { ka: 'მედი კლუბი', en: 'Medi Club', ru: 'Меди клуб' },
    type: 'hospital',
  },
  {
    id: '25',
    code: 'MRCHEVELI',
    name: { ka: 'მრჩეველი', en: 'Mrcheveli Hospital', ru: 'Мрчевели' },
    type: 'hospital',
  },
  {
    id: '26',
    code: 'HIGH_TECH',
    name: { ka: 'ჰაიტექ', en: 'High Tech Hospital', ru: 'Хайтек' },
    type: 'hospital',
  },
  {
    id: '27',
    code: 'CARDIOLOGY',
    name: { ka: 'კარდიოლოგია', en: 'Cardiology Hospital', ru: 'Кардиология' },
    type: 'hospital',
  },
  {
    id: '28',
    code: 'NEONATOLOGY',
    name: { ka: 'ნეონატოლოგია', en: 'Neonatology Center', ru: 'Неонатология' },
    type: 'hospital',
  },
  {
    id: '29',
    code: 'PEDIATRIC',
    name: {
      ka: 'პედიატრიული კლინიკა',
      en: 'Pediatric Clinic',
      ru: 'Педиатрическая клиника',
    },
    type: 'hospital',
  },
  {
    id: '30',
    code: 'MATERNITY',
    name: { ka: 'სამშობიარო', en: 'Maternity Hospital', ru: 'Родильный дом' },
    type: 'hospital',
  },

  // Regional Insurance Providers
  {
    id: '31',
    code: 'BATUMI_MEDICAL',
    name: { ka: 'ბათუმის მედიკალი', en: 'Batumi Medical', ru: 'Батумская медицинская' },
    type: 'private',
  },
  {
    id: '32',
    code: 'KUTAISI_MEDICAL',
    name: { ka: 'ქუთაისის მედიკალი', en: 'Kutaisi Medical', ru: 'Кутаисская медицинская' },
    type: 'private',
  },
  {
    id: '33',
    code: 'RUSTAVI_MEDICAL',
    name: { ka: 'რუსთავის მედიკალი', en: 'Rustavi Medical', ru: 'Рустависская медицинская' },
    type: 'private',
  },
  {
    id: '34',
    code: 'GORI_MEDICAL',
    name: { ka: 'გორის მედიკალი', en: 'Gori Medical', ru: 'Горийская медицинская' },
    type: 'private',
  },
  {
    id: '35',
    code: 'ZUGDIDI_MEDICAL',
    name: { ka: 'ზუგდიდის მედიკალი', en: 'Zugdidi Medical', ru: 'Зугдидская медицинская' },
    type: 'private',
  },

  // Specialized Insurance
  {
    id: '36',
    code: 'DENTAL_INSURANCE',
    name: { ka: 'სტომატოლოგიური დაზღვევა', en: 'Dental Insurance', ru: 'Стоматологическое страхование' },
    type: 'private',
  },
  {
    id: '37',
    code: 'VISION_CARE',
    name: { ka: 'მხედველობის დაზღვევა', en: 'Vision Care Insurance', ru: 'Страхование зрения' },
    type: 'private',
  },
  {
    id: '38',
    code: 'MENTAL_HEALTH',
    name: {
      ka: 'ფსიქიკური ჯანმრთელობის დაზღვევა',
      en: 'Mental Health Insurance',
      ru: 'Страхование психического здоровья',
    },
    type: 'private',
  },
  {
    id: '39',
    code: 'REHABILITATION',
    name: { ka: 'რეაბილიტაცია', en: 'Rehabilitation Insurance', ru: 'Реабилитационное страхование' },
    type: 'private',
  },
  {
    id: '40',
    code: 'ONCOLOGY',
    name: { ka: 'ონკოლოგია', en: 'Oncology Insurance', ru: 'Онкологическое страхование' },
    type: 'private',
  },

  // International Insurance
  {
    id: '41',
    code: 'ALLIANZ',
    name: { ka: 'ალიანცი', en: 'Allianz Insurance', ru: 'Альянс' },
    type: 'private',
  },
  {
    id: '42',
    code: 'AXA',
    name: { ka: 'აქსა', en: 'AXA Insurance', ru: 'Акса' },
    type: 'private',
  },
  {
    id: '43',
    code: 'BUPA',
    name: { ka: 'ბუპა', en: 'BUPA International', ru: 'Бупа' },
    type: 'private',
  },
  {
    id: '44',
    code: 'CIGNA',
    name: { ka: 'სიგნა', en: 'Cigna Global', ru: 'Сигна' },
    type: 'private',
  },
  {
    id: '45',
    code: 'METLIFE',
    name: { ka: 'მეტლაიფი', en: 'MetLife Insurance', ru: 'МетЛайф' },
    type: 'private',
  },

  // Additional Private Providers
  {
    id: '46',
    code: 'FAMILY_DOCTOR',
    name: { ka: 'ოჯახის ექიმი', en: 'Family Doctor', ru: 'Семейный врач' },
    type: 'private',
  },
  {
    id: '47',
    code: 'HEALTH_PLUS',
    name: { ka: 'ჰელთ პლუსი', en: 'Health Plus', ru: 'Хелс плюс' },
    type: 'private',
  },
  {
    id: '48',
    code: 'MEDICOR',
    name: { ka: 'მედიკორი', en: 'Medicor Insurance', ru: 'Медикор' },
    type: 'private',
  },
  {
    id: '49',
    code: 'PRIME_HEALTH',
    name: { ka: 'პრაიმ ჰელთი', en: 'Prime Health', ru: 'Прайм хелс' },
    type: 'private',
  },
  {
    id: '50',
    code: 'QUALITY_CARE',
    name: { ka: 'ქუალითი კეარი', en: 'Quality Care', ru: 'Куалити кэр' },
    type: 'private',
  },
  {
    id: '51',
    code: 'SAFE_HEALTH',
    name: { ka: 'სეიფ ჰელთი', en: 'Safe Health', ru: 'Сейф хелс' },
    type: 'private',
  },
  {
    id: '52',
    code: 'TOTAL_CARE',
    name: { ka: 'თოთალ კეარი', en: 'Total Care', ru: 'Тотал кэр' },
    type: 'private',
  },
  {
    id: '53',
    code: 'WELL_CARE',
    name: { ka: 'უელ კეარი', en: 'Well Care', ru: 'Уэл кэр' },
    type: 'private',
  },
  {
    id: '54',
    code: 'YOUR_HEALTH',
    name: { ka: 'შენი ჯანმრთელობა', en: 'Your Health', ru: 'Ваше здоровье' },
    type: 'private',
  },
  {
    id: '55',
    code: 'LIFE_CARE',
    name: { ka: 'ლაიფ კეარი', en: 'Life Care', ru: 'Лайф кэр' },
    type: 'private',
  },
  {
    id: '56',
    code: 'BEST_HEALTH',
    name: { ka: 'ბესთ ჰელთი', en: 'Best Health', ru: 'Бест хелс' },
    type: 'private',
  },
  {
    id: '57',
    code: 'CARE_FIRST',
    name: { ka: 'კეარ ფერსთი', en: 'Care First', ru: 'Кэр фёрст' },
    type: 'private',
  },
];

interface InsuranceSelectProps {
  value?: string;
  onChange?: (value: string | null) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  clearable?: boolean;
  searchable?: boolean;
  error?: string;
}

/**
 * Insurance company dropdown with multilingual support
 * Displays 58 insurance companies from Georgian healthcare system
 */
export function InsuranceSelect({
  value,
  onChange,
  label,
  placeholder,
  required = false,
  disabled = false,
  clearable = true,
  searchable = true,
  error,
}: InsuranceSelectProps): JSX.Element {
  const { t, lang } = useTranslation();
  const [options, setOptions] = useState<InsuranceOption[]>([]);

  useEffect(() => {
    // Map companies to Select options based on current language
    const mappedOptions = INSURANCE_COMPANIES.map((company) => ({
      value: company.id,
      label: `${company.id} - ${company.name[lang as 'ka' | 'en' | 'ru']}`,
    }));
    setOptions(mappedOptions);
  }, [lang]);

  return (
    <Select
      label={label || t('patientHistory.filter.insuranceCompany')}
      placeholder={placeholder || t('patientHistory.filter.selectInsurance')}
      value={value}
      onChange={onChange}
      data={options}
      required={required}
      disabled={disabled}
      clearable={clearable}
      searchable={searchable}
      error={error}
    />
  );
}
