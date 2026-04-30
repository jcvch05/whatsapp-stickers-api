import { CalculationInput, CalculationResult, TaxBreakdown } from '../types';
import { AGREEMENTS, getAgreementByCode } from '../data/countries';

// Tipo de cambio oficial BCB (Banco Central de Bolivia)
export const BCB_EXCHANGE_RATE = 6.96; // BOB por USD

// IVA importación = 13% (Ley 843)
const IVA_RATE = 13;

export function calculateTaxes(input: CalculationInput): CalculationResult {
  const { product, country, cifValue, cifCurrency, cifLocation, fleteAricaLaPaz } = input;

  // 1. Normalizar CIF a USD en La Paz
  let cifUSD = cifCurrency === 'BOB' ? cifValue / BCB_EXCHANGE_RATE : cifValue;

  // Si el valor CIF es en Arica, sumar el flete Arica → La Paz
  if (cifLocation === 'ARICA') {
    cifUSD += fleteAricaLaPaz ?? 0;
  }

  // 2. Determinar la tasa de GA efectiva según acuerdos comerciales
  let effectiveGaRate = product.ga_rate;
  let agreementApplied: string | null = null;

  for (const agCode of country.agreements) {
    const ag = getAgreementByCode(agCode);
    if (!ag) continue;

    // Verificar que la partida no esté excluida del acuerdo
    const isExcluded = ag.excluded_partidas.some(ep => product.partida.startsWith(ep));
    if (isExcluded) continue;

    if (ag.ga_reduction === 'full') {
      effectiveGaRate = 0;
      agreementApplied = agCode;
      break;
    } else if (typeof ag.ga_reduction === 'number' && ag.ga_reduction > 0) {
      effectiveGaRate = Math.max(0, product.ga_rate - ag.ga_reduction);
      agreementApplied = agCode;
      break;
    }
  }

  // 3. Cálculo de impuestos
  // GA = CIF × %GA
  const gaAmount = cifUSD * (effectiveGaRate / 100);

  // ICE = (CIF + GA) × %ICE
  const iceBase = cifUSD + gaAmount;
  const iceAmount = iceBase * (product.ice_rate / 100);

  // IVA = (CIF + GA + ICE) × 13%
  const ivaBase = cifUSD + gaAmount + iceAmount;
  const ivaAmount = ivaBase * (IVA_RATE / 100);

  // Totales
  const totalTaxesUSD = gaAmount + iceAmount + ivaAmount;
  const totalToPayUSD = cifUSD + totalTaxesUSD;

  const rate = BCB_EXCHANGE_RATE;

  const taxes: TaxBreakdown = {
    cifUSD: round2(cifUSD),
    cifBOB: round2(cifUSD * rate),
    gaRate: effectiveGaRate,
    gaOriginalRate: product.ga_rate,
    gaAmountUSD: round2(gaAmount),
    gaAmountBOB: round2(gaAmount * rate),
    iceRate: product.ice_rate,
    iceAmountUSD: round2(iceAmount),
    iceAmountBOB: round2(iceAmount * rate),
    ivaRate: IVA_RATE,
    ivaAmountUSD: round2(ivaAmount),
    ivaAmountBOB: round2(ivaAmount * rate),
    totalTaxesUSD: round2(totalTaxesUSD),
    totalTaxesBOB: round2(totalTaxesUSD * rate),
    totalToPayUSD: round2(totalToPayUSD),
    totalToPayBOB: round2(totalToPayUSD * rate),
    exchangeRate: rate,
    agreementApplied,
    taxExempt: totalTaxesUSD === 0,
    effectiveTaxPct: round2(cifUSD > 0 ? (totalTaxesUSD / cifUSD) * 100 : 0),
  };

  return { input, taxes };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function formatCurrency(amount: number, currency: 'USD' | 'BOB'): string {
  if (currency === 'USD') {
    return `$${amount.toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  return `Bs ${amount.toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function getAgreementName(code: string): string {
  const map: Record<string, string> = {
    CAN: 'CAN (Comunidad Andina)',
    ACE36_ARG: 'ACE-36 MERCOSUR (Argentina)',
    ACE36_BR: 'ACE-36 MERCOSUR (Brasil)',
    ACE22: 'ACE-22 (Chile)',
    ACE31: 'ACE-31 (México)',
    CUBA: 'Acuerdo ALBA (Cuba)',
  };
  return map[code] ?? code;
}
