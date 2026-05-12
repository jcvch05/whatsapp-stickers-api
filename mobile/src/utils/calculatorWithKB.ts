import { CalculationInput, CalculationResult } from '../types';
import { calculateTaxes } from './calculator';
import { getDecretosParaPartida, getProductoKB, KBDecreto } from '../services/kb';

export interface KBEnrichment {
  decretos: KBDecreto[];
  gaRateFromKB: number | null;
  kbUsed: boolean;
  kbSource: string;
}

/**
 * Calcula impuestos consultando primero la KB en Firestore.
 * Si la KB tiene datos actualizados para la partida, los usa.
 * Si no, usa los datos hardcodeados locales como fallback.
 */
export async function calculateTaxesWithKB(
  input: CalculationInput
): Promise<{ result: CalculationResult; enrichment: KBEnrichment }> {
  const { product } = input;
  const enrichment: KBEnrichment = {
    decretos: [],
    gaRateFromKB: null,
    kbUsed: false,
    kbSource: 'datos locales',
  };

  try {
    // 1. Buscar decretos vigentes que afecten esta partida
    const decretos = await getDecretosParaPartida(product.partida);
    enrichment.decretos = decretos;

    // 2. Buscar el producto directamente en la KB
    const kbProducto = await getProductoKB(product.partida);

    if (kbProducto) {
      // La KB tiene datos específicos para este producto
      enrichment.gaRateFromKB = kbProducto.ga_rate;
      enrichment.kbUsed = true;
      enrichment.kbSource = `KB Firestore — actualizado ${kbProducto.ultima_actualizacion}`;

      const enrichedInput: CalculationInput = {
        ...input,
        product: {
          ...product,
          ga_rate: kbProducto.ga_rate,
          ice_rate: kbProducto.ice_rate,
          permits: kbProducto.permisos.length > 0 ? kbProducto.permisos : product.permits,
          observations: kbProducto.observaciones || product.observations,
          normativa: kbProducto.normativa.length > 0 ? kbProducto.normativa : product.normativa,
        },
      };
      return { result: calculateTaxes(enrichedInput), enrichment };
    }

    // 3. Si no hay producto en KB pero hay decretos, aplicar el decreto más reciente
    if (decretos.length > 0) {
      const decreto = decretos[0];
      const gaFromDecreto = decreto.ga_rates[product.partida];

      if (gaFromDecreto !== undefined) {
        enrichment.gaRateFromKB = gaFromDecreto;
        enrichment.kbUsed = true;
        enrichment.kbSource = `${decreto.numero} — ${decreto.titulo}`;

        const enrichedInput: CalculationInput = {
          ...input,
          product: {
            ...product,
            ga_rate: gaFromDecreto,
            normativa: [decreto.numero, ...product.normativa],
          },
        };
        return { result: calculateTaxes(enrichedInput), enrichment };
      }
    }
  } catch {
    // Sin conexión o error → usar datos locales silenciosamente
  }

  // Fallback: cálculo con datos locales
  return { result: calculateTaxes(input), enrichment };
}
