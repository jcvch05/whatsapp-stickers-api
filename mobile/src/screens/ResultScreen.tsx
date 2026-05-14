import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Share,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList, CalculationResult } from '../types';
import { formatCurrency, getAgreementName } from '../utils/calculator';
import { InfoCard } from '../components/InfoCard';
import { COLORS, SPACING, RADIUS } from '../styles/theme';

type RouteP = RouteProp<RootStackParamList, 'Result'>;

export function ResultScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteP>();
  const { result, enrichment } = route.params as { result: CalculationResult; enrichment?: { kbUsed: boolean; kbSource: string } };
  const { input, taxes } = result;
  const { product, country, cifCurrency, cifLocation } = input;

  function handleShare() {
    const text = buildShareText(result);
    Share.share({ message: text, title: 'Cálculo Aduanero Bolivia - Aforito' });
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Badge KB */}
        {enrichment?.kbUsed && (
          <View style={styles.kbBadge}>
            <Text style={styles.kbBadgeText}>🔄 Datos actualizados desde KB · {enrichment.kbSource}</Text>
          </View>
        )}

        {/* Header resultado */}
        <View style={[styles.totalCard, taxes.taxExempt && styles.totalCardGreen]}>
          <Text style={styles.totalLabel}>TOTAL A PAGAR</Text>
          <Text style={styles.totalUSD}>{formatCurrency(taxes.totalToPayUSD, 'USD')}</Text>
          <Text style={styles.totalBOB}>{formatCurrency(taxes.totalToPayBOB, 'BOB')}</Text>
          {taxes.taxExempt && (
            <View style={styles.exemptBadge}>
              <Text style={styles.exemptText}>🎉 EXENTO DE IMPUESTOS</Text>
            </View>
          )}
        </View>

        {/* Resumen del producto */}
        <InfoCard icon="📦" title={product.name}>
          <Row label="Partida arancelaria" value={product.partida} highlight />
          <Row label="Categoría" value={product.category} />
          <Row label="Descripción NANDINA" value={product.description} />
          <Row label="País de origen" value={`${country.flag} ${country.name}`} />
          <Row
            label="Valor CIF"
            value={`${formatCurrency(parseFloat(String(input.cifValue)), input.cifCurrency)} — ${
              cifLocation === 'ARICA' ? 'Puerto Arica' : 'La Paz'
            }`}
          />
        </InfoCard>

        {/* Desglose de impuestos */}
        <InfoCard icon="📊" title="Desglose de Impuestos" variant="info">
          <Row
            label={`GA — Gravamen Arancelario (${taxes.gaRate}%)`}
            value={formatCurrency(taxes.gaAmountUSD, 'USD')}
            sub={formatCurrency(taxes.gaAmountBOB, 'BOB')}
          />
          {taxes.gaOriginalRate !== taxes.gaRate && (
            <Text style={styles.discountNote}>
              ✅ Tasa original {taxes.gaOriginalRate}% → reducida a {taxes.gaRate}% por acuerdo {
                taxes.agreementApplied ? getAgreementName(taxes.agreementApplied) : ''
              }
            </Text>
          )}
          {taxes.iceRate > 0 && (
            <Row
              label={`ICE — Imp. al Consumo Específico (${taxes.iceRate}%)`}
              value={formatCurrency(taxes.iceAmountUSD, 'USD')}
              sub={formatCurrency(taxes.iceAmountBOB, 'BOB')}
            />
          )}
          <Row
            label={`IVA Importación (${taxes.ivaRate}%)`}
            value={formatCurrency(taxes.ivaAmountUSD, 'USD')}
            sub={formatCurrency(taxes.ivaAmountBOB, 'BOB')}
          />
          <View style={styles.divider} />
          <Row
            label="TOTAL IMPUESTOS"
            value={formatCurrency(taxes.totalTaxesUSD, 'USD')}
            sub={formatCurrency(taxes.totalTaxesBOB, 'BOB')}
            bold
          />
          <Row
            label="Valor CIF (base)"
            value={formatCurrency(taxes.cifUSD, 'USD')}
            sub={formatCurrency(taxes.cifBOB, 'BOB')}
          />
          <View style={styles.divider} />
          <Row
            label="TOTAL A PAGAR"
            value={formatCurrency(taxes.totalToPayUSD, 'USD')}
            sub={formatCurrency(taxes.totalToPayBOB, 'BOB')}
            bold
            highlight
          />
          <Text style={styles.effectiveRate}>
            Carga impositiva efectiva: {taxes.effectiveTaxPct}% del valor CIF
          </Text>
          <Text style={styles.hint}>
            Tipo de cambio BCB: 1 USD = {taxes.exchangeRate} BOB
          </Text>
        </InfoCard>

        {/* Acuerdo comercial */}
        {taxes.agreementApplied && (
          <InfoCard icon="🤝" title="Acuerdo Comercial Aplicado" variant="success">
            <Text style={styles.bodyText}>
              {getAgreementName(taxes.agreementApplied)}
            </Text>
            {taxes.gaRate === 0 && taxes.gaOriginalRate > 0 && (
              <Text style={styles.bodyText}>
                El producto goza de 0% de Gravamen Arancelario por el acuerdo de integración entre Bolivia y {country.name}.
              </Text>
            )}
          </InfoCard>
        )}

        {/* Permisos requeridos */}
        {product.permits.length > 0 && (
          <InfoCard icon="📋" title="Permisos y Certificaciones Requeridas" variant="warning">
            {product.permits.map((permit, i) => (
              <View key={i} style={styles.permitRow}>
                <Text style={styles.bulletPoint}>•</Text>
                <Text style={styles.permitText}>{permit}</Text>
              </View>
            ))}
          </InfoCard>
        )}

        {/* Observaciones */}
        {product.observations ? (
          <InfoCard icon="ℹ️" title="Observaciones Importantes" variant="info">
            <Text style={styles.bodyText}>{product.observations}</Text>
          </InfoCard>
        ) : null}

        {/* Normativa */}
        {product.normativa.length > 0 && (
          <InfoCard icon="⚖️" title="Normativa Aplicable">
            {product.normativa.map((n, i) => (
              <View key={i} style={styles.permitRow}>
                <Text style={styles.bulletPoint}>•</Text>
                <Text style={styles.bodyText}>{n}</Text>
              </View>
            ))}
          </InfoCard>
        )}

        {/* Fórmula de cálculo */}
        <InfoCard icon="🧮" title="Fórmula de Cálculo (Aduana Nacional Bolivia)">
          <Text style={styles.formula}>Base imponible = Valor CIF (La Paz)</Text>
          <Text style={styles.formula}>GA = CIF × {taxes.gaRate}%</Text>
          {taxes.iceRate > 0 && (
            <Text style={styles.formula}>ICE = (CIF + GA) × {taxes.iceRate}%</Text>
          )}
          <Text style={styles.formula}>
            IVA = (CIF + GA{taxes.iceRate > 0 ? ' + ICE' : ''}) × {taxes.ivaRate}%
          </Text>
          <Text style={styles.formula}>Total = CIF + GA + {taxes.iceRate > 0 ? 'ICE + ' : ''}IVA</Text>
          <Text style={styles.hint}>
            Fuente: Ley 843 (Reforma Tributaria) — Arancel NANDINA vigente
          </Text>
        </InfoCard>

        {/* Botones */}
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
            <Text style={styles.shareBtnText}>📤  Compartir Resultado</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backBtnText}>← Nueva Consulta</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.disclaimer}>
          Este cálculo es referencial. Los valores exactos pueden variar según la clasificación
          arancelaria definitiva, resoluciones aduaneras específicas y la normativa vigente al
          momento de la importación.{'\n\n'}
          Para asesoría especializada contacta a aforito.com
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

interface RowProps {
  label: string;
  value: string;
  sub?: string;
  bold?: boolean;
  highlight?: boolean;
}

function Row({ label, value, sub, bold, highlight }: RowProps) {
  return (
    <View style={rowStyles.row}>
      <Text style={[rowStyles.label, bold && rowStyles.bold]}>{label}</Text>
      <View style={rowStyles.valueCol}>
        <Text style={[rowStyles.value, bold && rowStyles.bold, highlight && rowStyles.highlight]}>
          {value}
        </Text>
        {sub && <Text style={rowStyles.sub}>{sub}</Text>}
      </View>
    </View>
  );
}

const rowStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 5,
  },
  label: { fontSize: 13, color: COLORS.textSecondary, flex: 1, paddingRight: 8 },
  valueCol: { alignItems: 'flex-end', flex: 1 },
  value: { fontSize: 13, fontWeight: '600', color: COLORS.textPrimary, textAlign: 'right' },
  sub: { fontSize: 11, color: COLORS.textSecondary },
  bold: { fontWeight: '800', fontSize: 14 },
  highlight: { color: COLORS.primary },
});

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  container: { padding: SPACING.md, paddingBottom: 40 },

  totalCard: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    alignItems: 'center',
    marginBottom: SPACING.md,
    elevation: 4,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  totalCardGreen: { backgroundColor: COLORS.accent },
  totalLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  totalUSD: { fontSize: 36, fontWeight: '900', color: COLORS.white },
  totalBOB: { fontSize: 20, fontWeight: '700', color: 'rgba(255,255,255,0.85)', marginTop: 4 },
  exemptBadge: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 6,
    marginTop: 10,
  },
  exemptText: { fontSize: 13, fontWeight: '800', color: COLORS.white },

  divider: { height: 1, backgroundColor: COLORS.borderLight, marginVertical: 8 },

  discountNote: { fontSize: 12, color: COLORS.success, fontWeight: '600', marginBottom: 4 },
  effectiveRate: { fontSize: 12, color: COLORS.info, fontWeight: '600', marginTop: 8 },
  hint: { fontSize: 11, color: COLORS.textMuted, marginTop: 4 },

  bodyText: { fontSize: 13, color: COLORS.textSecondary, lineHeight: 20, marginBottom: 4 },

  permitRow: { flexDirection: 'row', marginBottom: 6 },
  bulletPoint: { fontSize: 16, color: COLORS.warning, marginRight: 8, lineHeight: 20 },
  permitText: { fontSize: 13, color: COLORS.textSecondary, flex: 1, lineHeight: 20 },

  formula: {
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    fontSize: 13,
    color: COLORS.textPrimary,
    marginBottom: 3,
  },

  buttonRow: { gap: 10, marginTop: 8 },
  shareBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
    padding: 14,
    alignItems: 'center',
  },
  shareBtnText: { fontSize: 15, fontWeight: '700', color: COLORS.white },
  backBtn: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  backBtnText: { fontSize: 15, fontWeight: '600', color: COLORS.textPrimary },

  kbBadge: {
    backgroundColor: '#F0FDF4',
    borderRadius: RADIUS.md,
    padding: 10,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.success,
  },
  kbBadgeText: { fontSize: 11, color: COLORS.success, fontWeight: '600' },

  disclaimer: {
    fontSize: 11,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 20,
    lineHeight: 16,
  },
});

function buildShareText(result: CalculationResult): string {
  const { input, taxes } = result;
  const { product, country } = input;
  return `
🇧🇴 CÁLCULO ADUANERO BOLIVIA - AFORITO
━━━━━━━━━━━━━━━━━━
📦 Producto: ${product.name}
📌 Partida: ${product.partida}
🌍 Origen: ${country.flag} ${country.name}
━━━━━━━━━━━━━━━━━━
💵 Valor CIF: ${formatCurrency(taxes.cifUSD, 'USD')} / ${formatCurrency(taxes.cifBOB, 'BOB')}
📊 GA (${taxes.gaRate}%): ${formatCurrency(taxes.gaAmountUSD, 'USD')}
${taxes.iceRate > 0 ? `📊 ICE (${taxes.iceRate}%): ${formatCurrency(taxes.iceAmountUSD, 'USD')}\n` : ''}📊 IVA (${taxes.ivaRate}%): ${formatCurrency(taxes.ivaAmountUSD, 'USD')}
━━━━━━━━━━━━━━━━━━
✅ TOTAL IMPUESTOS: ${formatCurrency(taxes.totalTaxesUSD, 'USD')} / ${formatCurrency(taxes.totalTaxesBOB, 'BOB')}
💰 TOTAL A PAGAR: ${formatCurrency(taxes.totalToPayUSD, 'USD')} / ${formatCurrency(taxes.totalToPayBOB, 'BOB')}
━━━━━━━━━━━━━━━━━━
Calculado con aforito.com
  `.trim();
}

// Needed for formula font
import { Platform } from 'react-native';
