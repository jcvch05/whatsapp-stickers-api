import React, { useMemo } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, Share, Platform,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList, CalculationResult } from '../types';
import { formatCurrency, getAgreementName } from '../utils/calculator';
import { InfoCard } from '../components/InfoCard';
import { SPACING, RADIUS } from '../styles/theme';
import { useAppTheme } from '../context/ThemeContext';

type RouteP = RouteProp<RootStackParamList, 'Result'>;

export function ResultScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteP>();
  const { colors, scale } = useAppTheme();
  const { result, enrichment } = route.params as { result: CalculationResult; enrichment?: { kbUsed: boolean; kbSource: string } };
  const { input, taxes } = result;
  const { product, country, cifCurrency, cifLocation } = input;
  const styles = useMemo(() => makeStyles(colors), [colors]);

  function handleShare() {
    const text = buildShareText(result);
    Share.share({ message: text, title: 'Cálculo Aduanero Bolivia - AFORITO Calc' });
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        {enrichment?.kbUsed && (
          <View style={styles.kbBadge}>
            <Text style={[styles.kbBadgeText, { fontSize: scale(11) }]}>🔄 Datos actualizados desde KB · {enrichment.kbSource}</Text>
          </View>
        )}
        <View style={[styles.totalCard, taxes.taxExempt && styles.totalCardGreen]}>
          <Text style={[styles.totalLabel, { fontSize: scale(12) }]}>TOTAL A PAGAR</Text>
          <Text style={[styles.totalUSD, { fontSize: scale(36) }]}>{formatCurrency(taxes.totalToPayUSD, 'USD')}</Text>
          <Text style={[styles.totalBOB, { fontSize: scale(20) }]}>{formatCurrency(taxes.totalToPayBOB, 'BOB')}</Text>
          {taxes.taxExempt && (
            <View style={styles.exemptBadge}>
              <Text style={[styles.exemptText, { fontSize: scale(13) }]}>🎉 EXENTO DE IMPUESTOS</Text>
            </View>
          )}
        </View>
        <InfoCard icon="📦" title={product.name}>
          <Row label="Partida arancelaria" value={product.partida} highlight />
          <Row label="Categoría" value={product.category} />
          <Row label="Descripción NANDINA" value={product.description} />
          <Row label="País de origen" value={`${country.flag} ${country.name}`} />
          <Row label="Valor CIF" value={`${formatCurrency(parseFloat(String(input.cifValue)), input.cifCurrency)} — ${cifLocation === 'ARICA' ? 'Puerto Arica' : 'La Paz'}`} />
        </InfoCard>
        <InfoCard icon="📊" title="Desglose de Impuestos" variant="info">
          <Row label={`GA — Gravamen Arancelario (${taxes.gaRate}%)`} value={formatCurrency(taxes.gaAmountUSD, 'USD')} sub={formatCurrency(taxes.gaAmountBOB, 'BOB')} />
          {taxes.gaOriginalRate !== taxes.gaRate && (
            <Text style={[styles.discountNote, { fontSize: scale(12) }]}>
              ✅ Tasa original {taxes.gaOriginalRate}% → reducida a {taxes.gaRate}% por acuerdo {taxes.agreementApplied ? getAgreementName(taxes.agreementApplied) : ''}
            </Text>
          )}
          {taxes.iceRate > 0 && (
            <Row label={`ICE — Imp. al Consumo Específico (${taxes.iceRate}%)`} value={formatCurrency(taxes.iceAmountUSD, 'USD')} sub={formatCurrency(taxes.iceAmountBOB, 'BOB')} />
          )}
          <Row label={`IVA Importación (${taxes.ivaRate}%)`} value={formatCurrency(taxes.ivaAmountUSD, 'USD')} sub={formatCurrency(taxes.ivaAmountBOB, 'BOB')} />
          <View style={styles.divider} />
          <Row label="TOTAL IMPUESTOS" value={formatCurrency(taxes.totalTaxesUSD, 'USD')} sub={formatCurrency(taxes.totalTaxesBOB, 'BOB')} bold />
          <Row label="Valor CIF (base)" value={formatCurrency(taxes.cifUSD, 'USD')} sub={formatCurrency(taxes.cifBOB, 'BOB')} />
          <View style={styles.divider} />
          <Row label="TOTAL A PAGAR" value={formatCurrency(taxes.totalToPayUSD, 'USD')} sub={formatCurrency(taxes.totalToPayBOB, 'BOB')} bold highlight />
          <Text style={[styles.effectiveRate, { fontSize: scale(12) }]}>Carga impositiva efectiva: {taxes.effectiveTaxPct}% del valor CIF</Text>
          <Text style={[styles.hint, { fontSize: scale(11) }]}>Tipo de cambio BCB: 1 USD = {taxes.exchangeRate} BOB</Text>
        </InfoCard>
        {taxes.agreementApplied && (
          <InfoCard icon="🤝" title="Acuerdo Comercial Aplicado" variant="success">
            <Text style={[styles.bodyText, { fontSize: scale(13) }]}>{getAgreementName(taxes.agreementApplied)}</Text>
            {taxes.gaRate === 0 && taxes.gaOriginalRate > 0 && (
              <Text style={[styles.bodyText, { fontSize: scale(13) }]}>El producto goza de 0% de Gravamen Arancelario por el acuerdo de integración entre Bolivia y {country.name}.</Text>
            )}
          </InfoCard>
        )}
        {product.permits.length > 0 && (
          <InfoCard icon="📋" title="Permisos y Certificaciones Requeridas" variant="warning">
            {product.permits.map((permit, i) => (
              <View key={i} style={styles.permitRow}>
                <Text style={styles.bulletPoint}>•</Text>
                <Text style={[styles.permitText, { fontSize: scale(13) }]}>{permit}</Text>
              </View>
            ))}
          </InfoCard>
        )}
        {product.observations ? (
          <InfoCard icon="ℹ️" title="Observaciones Importantes" variant="info">
            <Text style={[styles.bodyText, { fontSize: scale(13) }]}>{product.observations}</Text>
          </InfoCard>
        ) : null}
        {product.normativa.length > 0 && (
          <InfoCard icon="⚖️" title="Normativa Aplicable">
            {product.normativa.map((n, i) => (
              <View key={i} style={styles.permitRow}>
                <Text style={styles.bulletPoint}>•</Text>
                <Text style={[styles.bodyText, { fontSize: scale(13) }]}>{n}</Text>
              </View>
            ))}
          </InfoCard>
        )}
        <InfoCard icon="🧮" title="Fórmula de Cálculo (Aduana Nacional Bolivia)">
          <Text style={[styles.formula, { fontSize: scale(13) }]}>Base imponible = Valor CIF (La Paz)</Text>
          <Text style={[styles.formula, { fontSize: scale(13) }]}>GA = CIF × {taxes.gaRate}%</Text>
          {taxes.iceRate > 0 && <Text style={[styles.formula, { fontSize: scale(13) }]}>ICE = (CIF + GA) × {taxes.iceRate}%</Text>}
          <Text style={[styles.formula, { fontSize: scale(13) }]}>IVA = (CIF + GA{taxes.iceRate > 0 ? ' + ICE' : ''}) × {taxes.ivaRate}%</Text>
          <Text style={[styles.formula, { fontSize: scale(13) }]}>Total = CIF + GA + {taxes.iceRate > 0 ? 'ICE + ' : ''}IVA</Text>
          <Text style={[styles.hint, { fontSize: scale(11) }]}>Fuente: Ley 843 (Reforma Tributaria) — Arancel NANDINA vigente</Text>
        </InfoCard>
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
            <Text style={[styles.shareBtnText, { fontSize: scale(15) }]}>📤  Compartir Resultado</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={[styles.backBtnText, { fontSize: scale(15) }]}>← Nueva Consulta</Text>
          </TouchableOpacity>
        </View>
        <Text style={[styles.disclaimer, { fontSize: scale(11) }]}>
          Este cálculo es referencial. Los valores exactos pueden variar según la clasificación arancelaria definitiva, resoluciones aduaneras específicas y la normativa vigente al momento de la importación.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

interface RowProps { label: string; value: string; sub?: string; bold?: boolean; highlight?: boolean; }

function Row({ label, value, sub, bold, highlight }: RowProps) {
  const { colors, scale } = useAppTheme();
  return (
    <View style={rowS.row}>
      <Text style={[rowS.label, bold && rowS.bold, { color: colors.textSecondary, fontSize: scale(13) }]}>{label}</Text>
      <View style={rowS.valueCol}>
        <Text style={[rowS.value, bold && rowS.bold, { color: highlight ? colors.primary : colors.textPrimary, fontSize: bold ? scale(14) : scale(13) }]}>{value}</Text>
        {sub && <Text style={[rowS.sub, { color: colors.textSecondary, fontSize: scale(11) }]}>{sub}</Text>}
      </View>
    </View>
  );
}

const rowS = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingVertical: 5 },
  label: { flex: 1, paddingRight: 8 },
  valueCol: { alignItems: 'flex-end', flex: 1 },
  value: { fontWeight: '600', textAlign: 'right' },
  sub: {},
  bold: { fontWeight: '800' },
});

function makeStyles(colors: any) {
  return StyleSheet.create({
    safe: { flex: 1, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0, backgroundColor: colors.background },
    container: { padding: SPACING.md, paddingBottom: 40 },
    totalCard: {
      backgroundColor: colors.primary, borderRadius: RADIUS.xl, padding: SPACING.lg,
      alignItems: 'center', marginBottom: SPACING.md, elevation: 4,
      shadowColor: colors.primary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 10,
    },
    totalCardGreen: { backgroundColor: colors.accent },
    totalLabel: { fontWeight: '700', color: 'rgba(255,255,255,0.7)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4 },
    totalUSD: { fontWeight: '900', color: colors.textWhite },
    totalBOB: { fontWeight: '700', color: 'rgba(255,255,255,0.85)', marginTop: 4 },
    exemptBadge: { backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 6, marginTop: 10 },
    exemptText: { fontWeight: '800', color: colors.textWhite },
    divider: { height: 1, backgroundColor: colors.borderLight, marginVertical: 8 },
    discountNote: { color: colors.success, fontWeight: '600', marginBottom: 4 },
    effectiveRate: { color: colors.info, fontWeight: '600', marginTop: 8 },
    hint: { color: colors.textMuted, marginTop: 4 },
    bodyText: { color: colors.textSecondary, lineHeight: 20, marginBottom: 4 },
    permitRow: { flexDirection: 'row', marginBottom: 6 },
    bulletPoint: { fontSize: 16, color: colors.warning, marginRight: 8, lineHeight: 20 },
    permitText: { color: colors.textSecondary, flex: 1, lineHeight: 20 },
    formula: { fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace', color: colors.textPrimary, marginBottom: 3 },
    buttonRow: { gap: 10, marginTop: 8 },
    shareBtn: { backgroundColor: colors.primary, borderRadius: RADIUS.md, padding: 14, alignItems: 'center' },
    shareBtnText: { fontWeight: '700', color: colors.textWhite },
    backBtn: { backgroundColor: colors.white, borderRadius: RADIUS.md, padding: 14, alignItems: 'center', borderWidth: 1.5, borderColor: colors.border },
    backBtnText: { fontWeight: '600', color: colors.textPrimary },
    kbBadge: { backgroundColor: '#F0FDF4', borderRadius: RADIUS.md, padding: 10, marginBottom: 10, borderLeftWidth: 3, borderLeftColor: colors.success },
    kbBadgeText: { color: colors.success, fontWeight: '600' },
    disclaimer: { color: colors.textMuted, textAlign: 'center', marginTop: 20, lineHeight: 16 },
  });
}

function buildShareText(result: CalculationResult): string {
  const { input, taxes } = result;
  const { product, country } = input;
  return `
🇧🇴 CÁLCULO ADUANERO BOLIVIA - AFORITO Calc
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
Calculado con AFORITO Calc
  `.trim();
}
