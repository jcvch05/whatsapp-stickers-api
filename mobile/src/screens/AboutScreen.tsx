import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Linking,
} from 'react-native';
import { COLORS, SPACING, RADIUS } from '../styles/theme';
import { BCB_EXCHANGE_RATE } from '../utils/calculator';

export function AboutScreen() {
  const taxRates = [
    { label: 'Gravamen Arancelario (GA)', rates: '0%, 5%, 10%, 15%, 20%, 30%', note: 'Varía por producto y origen' },
    { label: 'IVA Importación', rates: '13%', note: 'Ley 843 — aplica a (CIF + GA + ICE)' },
    { label: 'ICE — Imp. Consumo Específico', rates: '10% — 50%', note: 'Sólo vehículos, alcohol, tabaco y otros' },
  ];

  const institutions = [
    { name: 'Aduana Nacional de Bolivia', abbr: 'ANB', desc: 'Organismo rector de las importaciones. Aplica el arancel NANDINA.', url: 'https://www.aduana.gob.bo' },
    { name: 'SENASAG', abbr: 'SENASAG', desc: 'Sanidad agropecuaria e inocuidad alimentaria. Regula alimentos y productos agropecuarios.', url: null },
    { name: 'AGEMED', abbr: 'AGEMED', desc: 'Agencia Estatal de Medicamentos y Tecnologías en Salud. Registra medicamentos y cosméticos.', url: null },
    { name: 'ATT', abbr: 'ATT', desc: 'Autoridad de Telecomunicaciones. Homologa equipos electrónicos y de comunicación.', url: null },
    { name: 'SENAVEX', abbr: 'SENAVEX', desc: 'Servicio Nacional de Verificación de Exportaciones e Importaciones. Permisos de importación especiales.', url: null },
    { name: 'DGAC', abbr: 'DGAC', desc: 'Dirección General de Aeronáutica Civil. Regula drones y aeronaves no tripuladas.', url: null },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.appName}>AFORITO</Text>
          <Text style={styles.appTagline}>Calculadora Aduanera Bolivia</Text>
          <Text style={styles.appVersion}>v1.0 · NANDINA 2024</Text>
        </View>

        {/* Info tipo de cambio */}
        <View style={styles.rateCard}>
          <Text style={styles.rateLabel}>Tipo de Cambio Oficial BCB</Text>
          <Text style={styles.rateValue}>1 USD = {BCB_EXCHANGE_RATE} BOB</Text>
          <Text style={styles.rateNote}>Banco Central de Bolivia · Tasa oficial de importación</Text>
        </View>

        {/* Tasas de impuestos */}
        <SectionTitle title="Estructura de Impuestos Aduaneros" />
        {taxRates.map((t, i) => (
          <View key={i} style={styles.taxCard}>
            <Text style={styles.taxLabel}>{t.label}</Text>
            <Text style={styles.taxRate}>{t.rates}</Text>
            <Text style={styles.taxNote}>{t.note}</Text>
          </View>
        ))}

        {/* Fórmula general */}
        <SectionTitle title="Fórmula General de Cálculo" />
        <View style={styles.formulaCard}>
          <FormulaLine text="Base Imponible = Valor CIF (La Paz)" />
          <FormulaLine text="GA = CIF × %GA" />
          <FormulaLine text="ICE = (CIF + GA) × %ICE   [si aplica]" />
          <FormulaLine text="IVA = (CIF + GA + ICE) × 13%" />
          <View style={styles.formulaDivider} />
          <FormulaLine text="Total Impuestos = GA + ICE + IVA" bold />
          <FormulaLine text="Total a Pagar = CIF + Total Impuestos" bold />
        </View>
        <Text style={styles.formulaSource}>
          Fuente: Ley 843 (Reforma Tributaria), Arancel Aduanero NANDINA y normativa vigente.
        </Text>

        {/* Régimen de importación */}
        <SectionTitle title="Acuerdos Comerciales Vigentes" />
        <View style={styles.infoBox}>
          <AgRow flag="🇵🇪🇨🇴🇪🇨" name="Perú, Colombia, Ecuador" benefit="GA 0% (CAN)" />
          <AgRow flag="🇦🇷🇧🇷" name="Argentina, Brasil" benefit="GA reducido (ACE-36)" />
          <AgRow flag="🇨🇱" name="Chile" benefit="GA reducido (ACE-22)" />
          <AgRow flag="🇨🇺" name="Cuba" benefit="Preferencias ALBA" />
          <Text style={styles.infoNote}>
            Para los demás países se aplica la tasa general del Arancel Externo Común.
          </Text>
        </View>

        {/* Instituciones */}
        <SectionTitle title="Instituciones Reguladoras" />
        {institutions.map((inst, i) => (
          <View key={i} style={styles.institutionCard}>
            <View style={styles.institutionTop}>
              <Text style={styles.institutionAbbr}>{inst.abbr}</Text>
            </View>
            <Text style={styles.institutionName}>{inst.name}</Text>
            <Text style={styles.institutionDesc}>{inst.desc}</Text>
          </View>
        ))}

        {/* Aforito */}
        <SectionTitle title="Asesoría Aduanera Especializada" />
        <View style={[styles.infoBox, styles.aforitoBox]}>
          <Text style={styles.aforitoTitle}>aforito.com</Text>
          <Text style={styles.aforitoDesc}>
            Consultora aduanera especializada en Bolivia. Tramitación de importaciones, clasificación
            arancelaria, gestión de permisos y asesoría en comercio exterior.
          </Text>
          <TouchableOpacity
            style={styles.aforitoBtn}
            onPress={() => Linking.openURL('https://aforito.com')}
          >
            <Text style={styles.aforitmoBtnText}>🌐 Visitar aforito.com</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.disclaimer}>
          Esta aplicación es de carácter informativo y referencial. Los cálculos se basan en el
          Arancel Aduanero Nacional (NANDINA) y la normativa vigente al momento del desarrollo.
          Para trámites oficiales consulte siempre con un agente de aduana habilitado o con la
          Aduana Nacional de Bolivia.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function SectionTitle({ title }: { title: string }) {
  return <Text style={sectionS.title}>{title}</Text>;
}

const sectionS = StyleSheet.create({
  title: { fontSize: 14, fontWeight: '800', color: COLORS.textPrimary, marginTop: 20, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 },
});

function FormulaLine({ text, bold }: { text: string; bold?: boolean }) {
  return (
    <Text style={[fS.line, bold && fS.bold]}>{text}</Text>
  );
}

const fS = StyleSheet.create({
  line: { fontFamily: 'monospace', fontSize: 13, color: COLORS.textPrimary, marginBottom: 3 },
  bold: { fontWeight: '800', color: COLORS.primary },
});

function AgRow({ flag, name, benefit }: { flag: string; name: string; benefit: string }) {
  return (
    <View style={agS.row}>
      <Text style={agS.flag}>{flag}</Text>
      <Text style={agS.name}>{name}</Text>
      <Text style={agS.benefit}>{benefit}</Text>
    </View>
  );
}

const agS = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: COLORS.borderLight },
  flag: { fontSize: 16, width: 50 },
  name: { flex: 1, fontSize: 13, color: COLORS.textSecondary },
  benefit: { fontSize: 12, fontWeight: '700', color: COLORS.success },
});

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  container: { padding: SPACING.md, paddingBottom: 40 },

  header: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  appName: { fontSize: 32, fontWeight: '900', color: COLORS.white, letterSpacing: 3 },
  appTagline: { fontSize: 14, color: 'rgba(255,255,255,0.85)', marginTop: 4 },
  appVersion: { fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 6 },

  rateCard: {
    backgroundColor: COLORS.secondary,
    borderRadius: RADIUS.md,
    padding: 14,
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  rateLabel: { fontSize: 11, fontWeight: '700', color: '#7A6000', textTransform: 'uppercase', letterSpacing: 1 },
  rateValue: { fontSize: 24, fontWeight: '900', color: '#3D3000', marginTop: 4 },
  rateNote: { fontSize: 11, color: '#7A6000', marginTop: 4 },

  taxCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  },
  taxLabel: { fontSize: 13, fontWeight: '700', color: COLORS.textPrimary },
  taxRate: { fontSize: 16, fontWeight: '900', color: COLORS.primary, marginTop: 2 },
  taxNote: { fontSize: 11, color: COLORS.textMuted, marginTop: 2 },

  formulaCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: RADIUS.md,
    padding: 16,
    marginBottom: 8,
  },
  formulaDivider: { height: 1, backgroundColor: '#444', marginVertical: 8 },
  formulaSource: { fontSize: 11, color: COLORS.textMuted, marginBottom: 4 },

  infoBox: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: 14,
    marginBottom: 8,
  },
  infoNote: { fontSize: 11, color: COLORS.textMuted, marginTop: 8 },

  institutionCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: 12,
    marginBottom: 8,
  },
  institutionTop: { marginBottom: 4 },
  institutionAbbr: { fontSize: 11, fontWeight: '800', color: COLORS.primary, textTransform: 'uppercase', letterSpacing: 1 },
  institutionName: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary },
  institutionDesc: { fontSize: 12, color: COLORS.textSecondary, marginTop: 3, lineHeight: 18 },

  aforitoBox: { borderWidth: 2, borderColor: COLORS.primary },
  aforitoTitle: { fontSize: 22, fontWeight: '900', color: COLORS.primary, marginBottom: 8 },
  aforitoDesc: { fontSize: 13, color: COLORS.textSecondary, lineHeight: 20, marginBottom: 12 },
  aforitoBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.sm,
    padding: 12,
    alignItems: 'center',
  },
  aforitmoBtnText: { fontSize: 14, fontWeight: '700', color: COLORS.white },

  disclaimer: {
    fontSize: 11,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 24,
    lineHeight: 16,
  },
});
