import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Modal,
  ScrollView,
} from 'react-native';
import { AGREEMENTS, COUNTRIES, getCountryAgreements } from '../data/countries';
import { Agreement, Country } from '../types';
import { COLORS, SPACING, RADIUS } from '../styles/theme';

export function AgreementsScreen() {
  const [tab, setTab] = useState<'acuerdos' | 'paises'>('acuerdos');
  const [detailAgreement, setDetailAgreement] = useState<Agreement | null>(null);
  const [detailCountry, setDetailCountry] = useState<Country | null>(null);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.topBar}>
        <Text style={styles.topTitle}>Acuerdos Comerciales</Text>
        <Text style={styles.topSub}>Bolivia y sus preferencias arancelarias internacionales</Text>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, tab === 'acuerdos' && styles.tabActive]}
          onPress={() => setTab('acuerdos')}
        >
          <Text style={[styles.tabText, tab === 'acuerdos' && styles.tabTextActive]}>
            🤝 Acuerdos
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, tab === 'paises' && styles.tabActive]}
          onPress={() => setTab('paises')}
        >
          <Text style={[styles.tabText, tab === 'paises' && styles.tabTextActive]}>
            🌍 Países
          </Text>
        </TouchableOpacity>
      </View>

      {tab === 'acuerdos' ? (
        <FlatList
          data={AGREEMENTS}
          keyExtractor={item => item.code}
          contentContainerStyle={{ padding: SPACING.md, paddingBottom: 32 }}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.agreementCard} onPress={() => setDetailAgreement(item)}>
              <View style={styles.agreementTop}>
                <Text style={styles.agreementCode}>{item.code}</Text>
                <GaChip reduction={item.ga_reduction} />
              </View>
              <Text style={styles.agreementName}>{item.name}</Text>
              <Text style={styles.agreementDesc} numberOfLines={2}>{item.description}</Text>
              <View style={styles.countriesRow}>
                {item.member_countries.map(code => {
                  const country = COUNTRIES.find(c => c.code === code);
                  return country ? (
                    <View key={code} style={styles.countryTag}>
                      <Text style={styles.countryTagText}>{country.flag} {country.name}</Text>
                    </View>
                  ) : null;
                })}
              </View>
            </TouchableOpacity>
          )}
        />
      ) : (
        <FlatList
          data={COUNTRIES}
          keyExtractor={item => item.code}
          contentContainerStyle={{ padding: SPACING.md, paddingBottom: 32 }}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.countryCard} onPress={() => setDetailCountry(item)}>
              <Text style={styles.countryFlagBig}>{item.flag}</Text>
              <View style={styles.countryInfo}>
                <Text style={styles.countryName}>{item.name}</Text>
                <Text style={styles.countryRegion}>{item.region}</Text>
                {item.agreements.length > 0 ? (
                  <Text style={styles.hasAgreement}>
                    ✅ Acuerdo comercial con Bolivia
                  </Text>
                ) : (
                  <Text style={styles.noAgreement}>
                    Sin acuerdo preferencial
                  </Text>
                )}
              </View>
              <Text style={styles.arrow}>›</Text>
            </TouchableOpacity>
          )}
        />
      )}

      {/* Modal detalle acuerdo */}
      <Modal
        visible={detailAgreement !== null}
        animationType="slide"
        onRequestClose={() => setDetailAgreement(null)}
      >
        {detailAgreement && (
          <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.white }}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{detailAgreement.code}</Text>
              <TouchableOpacity onPress={() => setDetailAgreement(null)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={{ padding: SPACING.md, paddingBottom: 40 }}>
              <Text style={styles.detailName}>{detailAgreement.name}</Text>
              <Text style={styles.detailDesc}>{detailAgreement.description}</Text>
              <View style={styles.infoBox}>
                <Text style={styles.infoBoxLabel}>Reducción de GA</Text>
                <Text style={styles.infoBoxValue}>
                  {detailAgreement.ga_reduction === 'full'
                    ? '0% (Libre de GA para la mayoría de productos)'
                    : detailAgreement.ga_reduction === 0
                    ? 'Sin reducción general'
                    : `Reducción de ${detailAgreement.ga_reduction} puntos porcentuales`}
                </Text>
              </View>
              <View style={styles.infoBox}>
                <Text style={styles.infoBoxLabel}>Base legal</Text>
                <Text style={styles.infoBoxValue}>{detailAgreement.legal_basis}</Text>
              </View>
              <View style={styles.infoBox}>
                <Text style={styles.infoBoxLabel}>Países miembros</Text>
                {detailAgreement.member_countries.map(code => {
                  const c = COUNTRIES.find(x => x.code === code);
                  return c ? (
                    <Text key={code} style={styles.memberCountry}>
                      {c.flag}  {c.name}
                    </Text>
                  ) : null;
                })}
              </View>
            </ScrollView>
          </SafeAreaView>
        )}
      </Modal>

      {/* Modal detalle país */}
      <Modal
        visible={detailCountry !== null}
        animationType="slide"
        onRequestClose={() => setDetailCountry(null)}
      >
        {detailCountry && (
          <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.white }}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {detailCountry.flag}  {detailCountry.name}
              </Text>
              <TouchableOpacity onPress={() => setDetailCountry(null)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={{ padding: SPACING.md, paddingBottom: 40 }}>
              <View style={styles.infoBox}>
                <Text style={styles.infoBoxLabel}>Región</Text>
                <Text style={styles.infoBoxValue}>{detailCountry.region}</Text>
              </View>
              <View style={styles.infoBox}>
                <Text style={styles.infoBoxLabel}>Acuerdos comerciales con Bolivia</Text>
                {detailCountry.agreements.length === 0 ? (
                  <Text style={styles.infoBoxValue}>
                    No tiene acuerdo preferencial vigente. Se aplican las tasas del Arancel Externo Común.
                  </Text>
                ) : (
                  getCountryAgreements(detailCountry).map(ag => (
                    <View key={ag.code} style={styles.agSummary}>
                      <Text style={styles.agSummaryTitle}>{ag.name}</Text>
                      <Text style={styles.agSummaryDesc}>{ag.description}</Text>
                      <Text style={styles.agSummaryBasis}>Base legal: {ag.legal_basis}</Text>
                    </View>
                  ))
                )}
              </View>
              <View style={styles.infoBox}>
                <Text style={styles.infoBoxLabel}>Impacto en el GA</Text>
                {detailCountry.agreements.length === 0 ? (
                  <Text style={styles.infoBoxValue}>
                    Se aplica la tasa de GA completa según el producto importado (0%, 5%, 10%, 15%, 20% o 30%).
                  </Text>
                ) : (
                  getCountryAgreements(detailCountry).map(ag => (
                    <Text key={ag.code} style={styles.infoBoxValue}>
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
  const label =
    reduction === 'full' ? 'GA 0%' : reduction === 0 ? 'GA normal' : `GA -${reduction}pp`;
  const bg = reduction === 'full' ? '#F0FDF4' : reduction === 0 ? '#FEF2F2' : '#EFF6FF';
  const color = reduction === 'full' ? COLORS.success : reduction === 0 ? COLORS.danger : COLORS.info;
  return (
    <View style={[chipS.chip, { backgroundColor: bg }]}>
      <Text style={[chipS.text, { color }]}>{label}</Text>
    </View>
  );
}

const chipS = StyleSheet.create({
  chip: { borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
  text: { fontSize: 12, fontWeight: '700' },
});

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  topBar: {
    backgroundColor: COLORS.primary,
    padding: SPACING.md,
    paddingBottom: 14,
  },
  topTitle: { fontSize: 20, fontWeight: '800', color: COLORS.white },
  topSub: { fontSize: 12, color: 'rgba(255,255,255,0.75)', marginTop: 2 },

  tabs: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center', borderBottomWidth: 3, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: COLORS.primary },
  tabText: { fontSize: 14, fontWeight: '600', color: COLORS.textMuted },
  tabTextActive: { color: COLORS.primary },

  agreementCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: 14,
    marginBottom: 10,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
  },
  agreementTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  agreementCode: { fontSize: 13, fontWeight: '800', color: COLORS.primary },
  agreementName: { fontSize: 15, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 4 },
  agreementDesc: { fontSize: 12, color: COLORS.textSecondary, lineHeight: 18, marginBottom: 8 },
  countriesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  countryTag: { backgroundColor: COLORS.background, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  countryTagText: { fontSize: 12, color: COLORS.textSecondary },

  countryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: 14,
    marginBottom: 8,
  },
  countryFlagBig: { fontSize: 32, marginRight: 14 },
  countryInfo: { flex: 1 },
  countryName: { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary },
  countryRegion: { fontSize: 12, color: COLORS.textMuted },
  hasAgreement: { fontSize: 12, color: COLORS.success, fontWeight: '600', marginTop: 3 },
  noAgreement: { fontSize: 12, color: COLORS.textMuted, marginTop: 3 },
  arrow: { fontSize: 22, color: COLORS.textMuted },

  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.primary,
    gap: 12,
  },
  modalTitle: { flex: 1, fontSize: 18, fontWeight: '800', color: COLORS.white },
  modalClose: { fontSize: 22, color: COLORS.white },

  detailName: { fontSize: 18, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 8 },
  detailDesc: { fontSize: 14, color: COLORS.textSecondary, lineHeight: 22, marginBottom: 16 },
  infoBox: { backgroundColor: COLORS.background, borderRadius: RADIUS.md, padding: 12, marginBottom: 10 },
  infoBoxLabel: { fontSize: 12, fontWeight: '700', color: COLORS.textMuted, textTransform: 'uppercase', marginBottom: 6 },
  infoBoxValue: { fontSize: 14, color: COLORS.textPrimary, lineHeight: 20 },
  memberCountry: { fontSize: 16, marginBottom: 4, color: COLORS.textPrimary },
  agSummary: { marginBottom: 10 },
  agSummaryTitle: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary },
  agSummaryDesc: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2, lineHeight: 18 },
  agSummaryBasis: { fontSize: 11, color: COLORS.textMuted, marginTop: 4, fontStyle: 'italic' },
});
