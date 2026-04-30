export interface Product {
  id: string;
  name: string;
  category: string;
  partida: string;
  description: string;
  ga_rate: number;
  ice_rate: number;
  permits: string[];
  observations: string;
  normativa: string[];
}

export interface Country {
  code: string;
  name: string;
  region: string;
  agreements: string[];
  flag: string;
}

export interface Agreement {
  code: string;
  name: string;
  description: string;
  member_countries: string[];
  ga_reduction: 'full' | number;
  excluded_partidas: string[];
  legal_basis: string;
}

export type CIFLocation = 'LA_PAZ' | 'ARICA';
export type Currency = 'USD' | 'BOB';

export interface CalculationInput {
  product: Product;
  country: Country;
  cifValue: number;
  cifCurrency: Currency;
  cifLocation: CIFLocation;
  fleteAricaLaPaz?: number; // USD, only when cifLocation = ARICA
}

export interface TaxBreakdown {
  cifUSD: number;
  cifBOB: number;
  gaRate: number;
  gaOriginalRate: number;
  gaAmountUSD: number;
  gaAmountBOB: number;
  iceRate: number;
  iceAmountUSD: number;
  iceAmountBOB: number;
  ivaRate: number;
  ivaAmountUSD: number;
  ivaAmountBOB: number;
  totalTaxesUSD: number;
  totalTaxesBOB: number;
  totalToPayUSD: number;
  totalToPayBOB: number;
  exchangeRate: number;
  agreementApplied: string | null;
  taxExempt: boolean;
  effectiveTaxPct: number;
}

export interface CalculationResult {
  input: CalculationInput;
  taxes: TaxBreakdown;
}

export type RootStackParamList = {
  MainTabs: undefined;
  Result: { result: CalculationResult };
};

export type MainTabsParamList = {
  Calculator: undefined;
  Products: undefined;
  Agreements: undefined;
  About: undefined;
};
