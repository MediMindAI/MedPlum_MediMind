// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

export interface MeasurementUnit {
  value: string;
  ka: string;
  en: string;
  ru: string;
  ucumCode: string;
  category: string;
}

export const MEASUREMENT_UNITS: MeasurementUnit[] = [
  { value: 'IU/l', ka: 'IU/l', en: 'IU/l', ru: 'МЕ/л', ucumCode: '[IU]/L', category: 'enzyme' },
  { value: 'μmol/l', ka: 'μmol/l', en: 'μmol/l', ru: 'мкмоль/л', ucumCode: 'umol/L', category: 'concentration' },
  { value: 'mmol/l', ka: 'mmol/l', en: 'mmol/l', ru: 'ммоль/л', ucumCode: 'mmol/L', category: 'concentration' },
  { value: 'mg/dl', ka: 'mg/dl', en: 'mg/dl', ru: 'мг/дл', ucumCode: 'mg/dL', category: 'concentration' },
  { value: 'g/dl', ka: 'g/dl', en: 'g/dl', ru: 'г/дл', ucumCode: 'g/dL', category: 'concentration' },
  { value: 'g/l', ka: 'g/l', en: 'g/l', ru: 'г/л', ucumCode: 'g/L', category: 'concentration' },
  { value: '%', ka: '%', en: '%', ru: '%', ucumCode: '%', category: 'ratio' },
  { value: 'k/μl', ka: 'k/μl', en: 'k/μl', ru: 'тыс/мкл', ucumCode: '10*3/uL', category: 'hematology' },
  { value: 'm/μl', ka: 'm/μl', en: 'm/μl', ru: 'млн/мкл', ucumCode: '10*6/uL', category: 'hematology' },
  { value: 'fl', ka: 'fl', en: 'fl', ru: 'фл', ucumCode: 'fL', category: 'volume' },
  { value: 'pg', ka: 'pg', en: 'pg', ru: 'пг', ucumCode: 'pg', category: 'mass' },
  { value: 'μIU/ml', ka: 'μIU/ml', en: 'μIU/ml', ru: 'мкМЕ/мл', ucumCode: 'u[IU]/mL', category: 'hormone' },
  { value: 'ng/ml', ka: 'ng/ml', en: 'ng/ml', ru: 'нг/мл', ucumCode: 'ng/mL', category: 'concentration' },
  { value: 'μg/dl', ka: 'μg/dl', en: 'μg/dl', ru: 'мкг/дл', ucumCode: 'ug/dL', category: 'concentration' },
  { value: 'U/l', ka: 'U/l', en: 'U/l', ru: 'Ед/л', ucumCode: 'U/L', category: 'enzyme' },
  { value: 'მმ/სთ', ka: 'მმ/სთ', en: 'mm/hour', ru: 'мм/час', ucumCode: 'mm/h', category: 'hematology' },
  { value: '-', ka: '-', en: '-', ru: '-', ucumCode: '', category: 'ratio' },
  { value: 'ცალი', ka: 'ცალი', en: 'Piece', ru: 'Штука', ucumCode: '{count}', category: 'count' },
  { value: 'დღე', ka: 'დღე', en: 'Day', ru: 'День', ucumCode: 'd', category: 'time' },
  { value: '10³ / μL', ka: '10³ / μL', en: '10³ / μL', ru: '10³ / мкл', ucumCode: '10*3/uL', category: 'hematology' },
  { value: '10⁶ / μL', ka: '10⁶ / μL', en: '10⁶ / μL', ru: '10⁶ / мкл', ucumCode: '10*6/uL', category: 'hematology' },
  { value: 'nmol/l', ka: 'nmol/l', en: 'nmol/l', ru: 'нмоль/л', ucumCode: 'nmol/L', category: 'concentration' },
  { value: 'pmol/l', ka: 'pmol/l', en: 'pmol/l', ru: 'пмоль/л', ucumCode: 'pmol/L', category: 'concentration' },
  { value: 'mg/l', ka: 'mg/l', en: 'mg/l', ru: 'мг/л', ucumCode: 'mg/L', category: 'concentration' },
  { value: 'IU/ml', ka: 'IU/ml', en: 'IU/ml', ru: 'МЕ/мл', ucumCode: '[IU]/mL', category: 'concentration' },
];
