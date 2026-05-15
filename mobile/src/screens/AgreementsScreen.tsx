import React, { useState, useMemo } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, SafeAreaView, Modal, ScrollView,
  Platform,
  StatusBar,
} from 'react-native';
import { AGREEMENTS, COUNTRIES, getCountryAgreements } from '../data/countries';
import { Agreement, Country } from '../types';
import { SPACING, RADIUS } from '../styles/theme';
import { useAppTheme } from '../context/ThemeContext';

export function AgreementsScreen() {
  const { colors, scale } = useAppTheme();
  const [tab, setTab] = useState<'acuerdos' | 'paises'>('acuerdos');
  const [detailAgreement, setDetailAgreement] = useState<Agreement | null>(null);
  const [detailCountry, setDetailCountry] = useState<Country | null>(null);
  const styles = useMemo(() => makeStyles(colors), [colors]);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.topBar}>
        <Text style={[styles.topTitle, { fontSize: scale(20) }]}>Acuerdos Comerciales</Text>
        <Text style={[styles.topSub, { fontSize: scale(12) }]}>Bolivia y sus preferencias arancelarias internacionales</Text>
      </View>
      <View style={styles.tabs}>
        <TouchableOpacity style={[styles.tab, tab === 'acuerdos' && styles.tabActive]} onPress={() => setTab('acuerdos')}>
          <Text style={[styles.tabText, tab === 'acuerdos' && styles.tabTextActive, { fontSize: scale(14) }]}>🤝 Acuerdos</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, tab === 'paises' && styles.tabActive]} onPress={() => setTab('paises')}>
          <Text style={[styles.tabText, tab === 'paises' && styles.tabTextActive, { fontSize: scale(14) }]}>🌍 Países</Text>
        </TouchableOpacity>
      </View>
      {tab === 'acuerdos' ? (
        <FlatList
          data={AGREEMENTS} keyExtractor={item => item.code}
          contentContainerStyle={{ padding: SPACING.md, paddingBottom: 32 }}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.agreementCard} onPress={() => setDetailAgreement(item)}>
              <View style={styles.agreementTop}>
                <Text style={[styles.agreementCode, { fontSize: scale(13) }]}>{item.code}</Text>
                <GaChip reduction={item.ga_reduction} />
              </View>
              <Text style={[styles.agreementName, { fontSize: scale(15) }]}>{item.name}</Text>
              <Text style={[styles.agreementDesc, { fontSize: scale(12) }]} numberOfLines={2}>{item.description}</Text>
              <View style={styles.countriesRow}>
                {item.member_countries.map(code => {
                  const country = COUNTRIES.find(c => c.code === code);
                  return country ? (
                    <View key={code} style={styles.countryTag}>
                      <Text style={[styles.countryTagText, { fontSize: scale(12) }]}>{country.flag} {country.name}</Text>
                    </View>
                  ) : null;
                })}
              </View>
            </TouchableOpacity>
          )}
        />
      ) : (
        <FlatList
          data={COUNTRIES} keyExtractor={item => item.code}
          contentContainerStyle={{ padding: SPACING.md, paddingBottom: 32 }}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.countryCard} onPress={() => setDetailCountry(item)}>
              <Text style={styles.countryFlagBig}>{item.flag}</Text>
              <View style={styles.countryInfo}>
                <Text style={[styles.countryName, { fontSize: scale(16) }]}>{item.name}</Text>
                <Text style={[styles.countryRegion, { fontSize: scale(12) }]}>{item.region}</Text>
                {item.agreements.length > 0
                  ? <Text style={[styles.hasAgreement, { fontSize: scale(12) }]}>✅ Acuerdo comercial con Bolivia</Text>
                  : <Text style={[styles.noAgreement, { fontSize: scale(12) }]}>Sin acuerdo preferencial</Text>}
              </View>
              <Text style={styles.arrow}>›</Text>
            </TouchableOpacity>
          )}
        />
      )}
      <Modal visible={detailAgreement !== null} animationType="slide" onRequestClose={() => setDetailAgreement(null)}>
        {detailAgreement && (
          <SafeAreaView style={{ flex: 1, backgroundColor: colors.white }}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { fontSize: scale(18) }]}>{detailAgreement.code}</Text>
              <TouchableOpacity onPress={() => setDetailAgreement(null)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={{ padding: SPACING.md, paddingBottom: 40 }}>
              <Text style={[styles.detailName, { fontSize: scale(18) }]}>{detailAgreement.name}</Text>
              <Text style={[styles.detailDesc, { fontSize: scale(14) }]}>{detailAgreement.description}</Text>
              <View style={styles.infoBox}>
                <Text style={[styles.infoBoxLabel, { fontSize: scale(12) }]}>Reducción de GA</Text>
                <Text style={[styles.infoBoxValue, { fontSize: scale(14) }]}>
                  {detailAgreement.ga_reduction === 'full'
                    ? '0% (Libre de GA para la mayoría de productos)'
                    : detailAgreement.ga_reduction === 0
                    ? 'Sin reducción general'
                    : `Reducción de ${detailAgreement.ga_reduction} puntos porcentuales`}
                </Text>
              </View>
              <View style={styles.infoBox}>
                <Text style={[styles.infoBoxLabel, { fontSize: scale(12) }]}>Base legal</Text>
                <Text style={[styles.infoBoxValue, { fontSize: scale(14) }]}>{detailAgreement.legal_basis}</Text>
              </View>
              <View style={styles.infoBox}>
                <Text style={[styles.infoBoxLabel, { fontSize: scale(12) }]}>Países miembros</Text>
                {detailAgreement.member_countries.map(code => {
                  const c = COUNTRIES.find(x => x.code === code);
                  return c ? <Text key={code} style={[styles.memberCountry, { fontSize: scale(16) }]}>{c.flag}  {c.name}</Text> : null;
                })}
              </View>
            </ScrollView>
          </SafeAreaView>
        )}
      </Modal>
      <Modal visible={detailCountry !== null} animationType="slide" onRequestClose={() => setDetailCountry(null)}>
        {detailCountry && (
          <SafeAreaView style={{ flex: 1, backgroundColor: colors.white }}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { fontSize: scale(18) }]}>{detailCountry.flag}  {detailCountry.name}</Text>
              <TouchableOpacity onPress={() => setDetailCountry(null)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={{ padding: SPACING.md, paddingBottom: 40 }}>
              <View style={styles.infoBox}>
                <Text style={[styles.infoBoxLabel, { fontSize: scale(12) }]}>Región</Text>
                <Text style={[styles.infoBoxValue, { fontSize: scale(14) }]}>{detailCountry.region}</Text>
              </View>
              <View style={styles.infoBox}>
                <Text style={[styles.infoBoxLabel, { fontSize: scale(12) }]}>Acuerdos comerciales con Bolivia</Text>
                {detailCountry.agreements.length === 0 ? (
                  <Text style={[styles.infoBoxValue, { fontSize: scale(14) }]}>No tiene acuerdo preferencial vigente. Se aplican las tasas del Arancel Externo Común.</Text>
                ) : (
                  getCountryAgreements(detailCountry).map(ag => (
                    <View key={ag.code} style={styles.agSummary}>
                      <Text style={[styles.agSummaryTitle, { fontSize: scale(14) }]}>{ag.name}</Text>
                      <Text style={[styles.agSummaryDesc, { fontSize: scale(13) }]}>{ag.description}</Text>
                      <Text style={[styles.agSummaryBasis, { fontSize: scale(11) }]}>Base legal: {ag.legal_basis}</Text>
                    </View>
                  ))
                )}
              </View>
              <View style={styles.infoBox}>
                <Text style={[styles.infoBoxLabel, { fontSize: scale(12) }]}>Impacto en el GA</Text>
                {detailCountry.agreements.length === 0 ? (
                  <Text style={[styles.infoBoxValue, { fontSize: scale(14) }]}>Se aplica la tasa de GA completa según el producto importado (0%, 5%, 10%, 15%, 20% o 30%).</Text>
                ) : (
                  getCountryAgreements(detailCountry).map(ag => (
                    <Text key={ag.code} style={[styles.infoBoxValue, { fontSize: scale(14) }]}>
                      {ag.ga_reduction === 'full'
                        ? '✅ GA reducido a 0% para la mayoría de productos'
                        : ag.ga_reduction === 0
                        ? 'Sin reducción general del GA'
                        : `✅ GA reducido en ${ag.ga_reduction} puntos porcentuales`}
                    </Text>
                  ))
                )}
              </View>
            </ScrollView>
          </SafeAreaView>
        )}
      </Modal>
    </SafeAreaView>
  );
}

function GaChip({ reduction }: { reduction: 'full' | number }) {
  const { colors, scale } = useAppTheme();
  const label = reduction === 'full' ? 'GA 0%' : reduction === 0 ? 'GA normal' : `GA -${reduction}pp`;
  const bg = reduction === 'full' ? '#F0FDF4' : reduction === 0 ? '#FEF2F2' : '#EFF6FF';
  const color = reduction === 'full' ? colors.success : reduction === 0 ? colors.danger : colors.info;
  return (
    <View style={[chipS.chip, { backgroundColor: bg }]}>
      <Text style={[chipS.text, { color, fontSize: scale(12) }]}>{label}</Text>
    </View>
  );
}

const chipS = StyleSheet.create({
  chip: { borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
  text: { fontWeight: '700' },
});

function makeStyles(colors: any) {
  return StyleSheet.create({
    safe: { flex: 1, paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) : 0, backgroundColor: colors.background },
    topBar: { backgroundColor: colors.primary, padding: SPACING.md, paddingBottom: 14 },
    topTitle: { fontWeight: '800', color: colors.textWhite },
    topSub: { color: 'rgba(255,255,255,0.75)', marginTop: 2 },
    tabs: { flexDirection: 'row', backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.border },
    tab: { flex: 1, paddingVertical: 12, alignItems: 'center', borderBottomWidth: 3, borderBottomColor: 'transparent' },
    tabActive: { borderBottomColor: colors.primary },
    tabText: { fontWeight: '600', color: colors.textMuted },
    tabTextActive: { color: colors.primary },
    agreementCard: {
      backgroundColor: colors.white, borderRadius: RADIUS.md, padding: 14, marginBottom: 10,
      elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 3,
    },
    agreementTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
    agreementCode: { fontWeight: '800', color: colors.primary },
    agreementName: { fontWeight: '700', color: colors.textPrimary, marginBottom: 4 },
    agreementDesc: { color: colors.textSecondary, lineHeight: 18, marginBottom: 8 },
    countriesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
    countryTag: { backgroundColor: colors.background, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
    countryTagText: { color: colors.textSecondary },
    countryCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, borderRadius: RADIUS.md, padding: 14, marginBottom: 8 },
    countryFlagBig: { fontSize: 32, marginRight: 14 },
    countryInfo: { flex: 1 },
    countryName: { fontWeight: '700', color: colors.textPrimary },
    countryRegion: { color: colors.textMuted },
    hasAgreement: { color: colors.success, fontWeight: '600', marginTop: 3 },
    noAgreement: { color: colors.textMuted, marginTop: 3 },
    arrow: { fontSize: 22, color: colors.textMuted },
    modalHeader: { flexDirection: 'row', alignItems: 'center', padding: SPACING.md, backgroundColor: colors.primary, gap: 12 },
    modalTitle: { flex: 1, fontWeight: '800', color: colors.textWhite },
    modalClose: { fontSize: 22, color: colors.textWhite },
    detailName: { fontWeight: '800', color: colors.textPrimary, marginBottom: 8 },
    detailDesc: { color: colors.textSecondary, lineHeight: 22, marginBottom: 16 },
    infoBox: { backgroundColor: colors.background, borderRadius: RADIUS.md, padding: 12, marginBottom: 10 },
    infoBoxLabel: { fontWeight: '700', color: colors.textMuted, textTransform: 'uppercase', marginBottom: 6 },
    infoBoxValue: { color: colors.textPrimary, lineHeight: 20 },
    memberCountry: { marginBottom: 4, color: colors.textPrimary },
    agSummary: { marginBottom: 10 },
    agSummaryTitle: { fontWeight: '700', color: colors.textPrimary },
    agSummaryDesc: { color: colors.textSecondary, marginTop: 2, lineHeight: 18 },
    agSummaryBasis: { color: colors.textMuted, marginTop: 4, fontStyle: 'italic' },
  });
}
