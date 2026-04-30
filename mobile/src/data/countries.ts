import { Country, Agreement } from '../types';

export const AGREEMENTS: Agreement[] = [
  {
    code: 'CAN',
    name: 'Comunidad Andina de Naciones (CAN)',
    description:
      'Libre comercio entre Bolivia, Colombia, Ecuador y Perú. Gravamen Arancelario (GA) del 0% para la mayoría de productos. Vigente desde 1969.',
    member_countries: ['PE', 'CO', 'EC'],
    ga_reduction: 'full',
    excluded_partidas: [],
    legal_basis: 'Decisión 671 de la CAN / Acuerdo de Cartagena',
  },
  {
    code: 'ACE36_ARG',
    name: 'ACE-36 Bolivia – Argentina (MERCOSUR)',
    description:
      'Acuerdo de Complementación Económica Bolivia-MERCOSUR. Preferencias parciales con Argentina. Reducción de hasta 10 puntos porcentuales en el GA.',
    member_countries: ['AR'],
    ga_reduction: 10,
    excluded_partidas: [],
    legal_basis: 'ACE-36 ALADI',
  },
  {
    code: 'ACE36_BR',
    name: 'ACE-36 Bolivia – Brasil (MERCOSUR)',
    description:
      'Preferencias parciales con Brasil en el marco del ACE-36 con MERCOSUR.',
    member_countries: ['BR'],
    ga_reduction: 10,
    excluded_partidas: [],
    legal_basis: 'ACE-36 ALADI',
  },
  {
    code: 'ACE22',
    name: 'ACE-22 Bolivia – Chile',
    description:
      'Acuerdo de Complementación Económica con Chile. Preferencias parciales (reducción de 5 puntos porcentuales).',
    member_countries: ['CL'],
    ga_reduction: 5,
    excluded_partidas: [],
    legal_basis: 'ACE-22 ALADI',
  },
  {
    code: 'ACE31',
    name: 'ACE-31 Bolivia – México',
    description:
      'Acuerdo de Complementación Económica con México. Preferencias limitadas a determinados productos.',
    member_countries: ['MX'],
    ga_reduction: 0,
    excluded_partidas: [],
    legal_basis: 'ACE-31 ALADI',
  },
  {
    code: 'CUBA',
    name: 'Acuerdo Bolivia – Cuba (ALBA)',
    description: 'Acuerdo preferencial en el marco del ALBA. Preferencias parciales.',
    member_countries: ['CU'],
    ga_reduction: 5,
    excluded_partidas: [],
    legal_basis: 'AAP.A14TM No. 5 ALADI',
  },
];

export const COUNTRIES: Country[] = [
  { code: 'PE', name: 'Perú', region: 'Sudamérica', agreements: ['CAN'], flag: '🇵🇪' },
  { code: 'CO', name: 'Colombia', region: 'Sudamérica', agreements: ['CAN'], flag: '🇨🇴' },
  { code: 'EC', name: 'Ecuador', region: 'Sudamérica', agreements: ['CAN'], flag: '🇪🇨' },
  { code: 'AR', name: 'Argentina', region: 'Sudamérica', agreements: ['ACE36_ARG'], flag: '🇦🇷' },
  { code: 'BR', name: 'Brasil', region: 'Sudamérica', agreements: ['ACE36_BR'], flag: '🇧🇷' },
  { code: 'CL', name: 'Chile', region: 'Sudamérica', agreements: ['ACE22'], flag: '🇨🇱' },
  { code: 'MX', name: 'México', region: 'América del Norte', agreements: ['ACE31'], flag: '🇲🇽' },
  { code: 'US', name: 'Estados Unidos', region: 'América del Norte', agreements: [], flag: '🇺🇸' },
  { code: 'CN', name: 'China', region: 'Asia', agreements: [], flag: '🇨🇳' },
  { code: 'JP', name: 'Japón', region: 'Asia', agreements: [], flag: '🇯🇵' },
  { code: 'KR', name: 'Corea del Sur', region: 'Asia', agreements: [], flag: '🇰🇷' },
  { code: 'TW', name: 'Taiwán', region: 'Asia', agreements: [], flag: '🇹🇼' },
  { code: 'IN', name: 'India', region: 'Asia', agreements: [], flag: '🇮🇳' },
  { code: 'DE', name: 'Alemania', region: 'Europa', agreements: [], flag: '🇩🇪' },
  { code: 'ES', name: 'España', region: 'Europa', agreements: [], flag: '🇪🇸' },
  { code: 'IT', name: 'Italia', region: 'Europa', agreements: [], flag: '🇮🇹' },
  { code: 'FR', name: 'Francia', region: 'Europa', agreements: [], flag: '🇫🇷' },
  { code: 'GB', name: 'Reino Unido', region: 'Europa', agreements: [], flag: '🇬🇧' },
  { code: 'TR', name: 'Turquía', region: 'Europa / Asia', agreements: [], flag: '🇹🇷' },
  { code: 'AE', name: 'Emiratos Árabes Unidos', region: 'Medio Oriente', agreements: [], flag: '🇦🇪' },
  { code: 'UY', name: 'Uruguay', region: 'Sudamérica', agreements: [], flag: '🇺🇾' },
  { code: 'PY', name: 'Paraguay', region: 'Sudamérica', agreements: [], flag: '🇵🇾' },
  { code: 'VE', name: 'Venezuela', region: 'Sudamérica', agreements: [], flag: '🇻🇪' },
  { code: 'PA', name: 'Panamá', region: 'América Central', agreements: [], flag: '🇵🇦' },
  { code: 'CU', name: 'Cuba', region: 'Caribe', agreements: ['CUBA'], flag: '🇨🇺' },
];

export function getCountryByCode(code: string): Country | undefined {
  return COUNTRIES.find(c => c.code === code);
}

export function getAgreementByCode(code: string): Agreement | undefined {
  return AGREEMENTS.find(a => a.code === code);
}

export function getCountryAgreements(country: Country): Agreement[] {
  return country.agreements
    .map(code => AGREEMENTS.find(a => a.code === code))
    .filter((a): a is Agreement => a !== undefined);
}
