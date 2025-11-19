/**
 * Service Types for Laboratory Nomenclature
 *
 * 7 service type options matching original EMR design.
 * Used for categorizing medical services (internal, external labs, consultants, etc.)
 */

export interface ServiceType {
  code: string;
  name: {
    ka: string;
    en: string;
    ru: string;
  };
}

export const SERVICE_TYPES: ServiceType[] = [
  {
    code: 'internal',
    name: {
      ka: 'შიდა',
      en: 'Internal',
      ru: 'Внутренний',
    },
  },
  {
    code: 'other-clinics',
    name: {
      ka: 'სხვა კლინიკები',
      en: 'Other Clinics',
      ru: 'Другие клиники',
    },
  },
  {
    code: 'limbach',
    name: {
      ka: 'ლიმბახი',
      en: 'Limbach',
      ru: 'Лимбах',
    },
  },
  {
    code: 'consultant',
    name: {
      ka: 'მრჩეველი',
      en: 'Consultant',
      ru: 'Консультант',
    },
  },
  {
    code: 'khomasuridze',
    name: {
      ka: 'ხომასურიძე',
      en: 'Khomasuridze',
      ru: 'Хомасуридзе',
    },
  },
  {
    code: 'todua',
    name: {
      ka: 'თოდუა',
      en: 'Todua',
      ru: 'Тодуа',
    },
  },
  {
    code: 'hepa',
    name: {
      ka: 'ჰეპა',
      en: 'Hepa',
      ru: 'Хепа',
    },
  },
];
