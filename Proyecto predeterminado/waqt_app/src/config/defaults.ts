import type { Madhab } from '../domain/types';

export const MADHABS: readonly Madhab[] = ['maliki', 'shafii', 'hanafi', 'hanbali', 'jafari'];

export interface CalculationMethodOption {
  id: number;
  name: string;
}

/** Curated global list from the Spec. Prayer maths is handled by the Salah module. */
export const CALCULATION_METHODS: readonly CalculationMethodOption[] = [
  { id: 3, name: 'Muslim World League' },
  { id: 2, name: 'Islamic Society of North America' },
  { id: 5, name: 'Egyptian General Authority' },
  { id: 4, name: 'Umm Al-Qura' },
  { id: 1, name: 'University of Islamic Sciences, Karachi' },
  { id: 0, name: "Ja'fari (Shia Ithna-Ashari)" },
  { id: 7, name: 'Institute of Geophysics, Tehran' },
  { id: 13, name: 'Diyanet İşleri Başkanlığı' },
];
