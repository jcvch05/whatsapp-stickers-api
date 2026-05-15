import React, { useState, useMemo } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, Modal, FlatList, SafeAreaView, Platform, KeyboardAvoidingView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, Currency, CIFLocation, Product, Country } from '../types';
import { PRODUCTS, searchProducts } from '../data/products';
import { COUNTRIES } from '../data/countries';
import { BCB_EXCHANGE_RATE } from '../utils/calculator';
import { calculateTaxesWithKB } from '../utils/calculatorWithKB';
import { SPACING, RADIUS } from '../styles/theme';
import { useAppTheme } from '../context/ThemeContext';

type NavProp = NativeStackNavigationProp<RootStackParamList, 'MainTabs'>;

export function CalculatorScreen() {
  const navigation = useNavigation<NavProp>();
  const { colors, scale, exchangeRate } = useAppTheme();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [cifValue, setCifValue] = useState('');
  const [cifCurrency, setCifCurrency] = useState<Currency>('USD');
  const [cifLocation, setCifLocation] = useState<CIFLocation>('LA_PAZ');
  const [fleteValue, setFleteValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [productModal, setProductModal] = useState(false);
  const [countryModal, setCountryModal] = useState(false);
  const [productSearch, setProductSearch] = useState('');
  const [countrySearch, setCountrySearch] = useState('');

  const filteredProducts = useMemo(() => searchProducts(productSearch), [productSearch]);

  const filteredCountries = useMemo(() => {
    const q = countrySearch.toLowerCase();
    return COUNTRIES.filter(c => c.name.toLowerCase().includes(q) || c.region.toLowerCase().includes(q));
  }, [countrySearch]);

  const styles = useMemo(() => makeStyles(colors), [colors]);

  function sanitizeDecimal(value: string, max = 9_999_999): string {
    const clean = value.replace(/[^\d.]/g, '').replace(/^(\d*\.?\d{0,2}).*/, '$1');
    const num = parseFloat(clean);
    if (!isNaN(num) && num > max) return String(max);
    return clean;
  }

  const canCalculate =
    selectedProduct !== null && selectedCountry !== null &&
    cifValue.trim() !== '' && !isNaN(parseFloat(cifValue)) && parseFloat(cifValue) > 0;

  async function handleCalculate() {
    if (!canCalculate || !selectedProduct || !selectedCountry) return;
    setLoading(true);
    try {
      const flete = fleteValue ? parseFloat(fleteValue) : undefined;
      const { result, enrichment } = await calculateTaxesWithKB({
        product: selectedProduct, country: selectedCountry,
        cifValue: parseFloat(cifValue), cifCurrency, cifLocation, fleteAricaLaPaz: flete,
      });
      navigation.navigate('Result', { result, enrichment });
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Text style={[styles.headerTitle, { fontSize: scale(26) }]}>AFORITO Calc</Text>
            <Text style={[styles.headerSubtitle, { fontSize: scale(13) }]}>Calculadora Aduanera Bolivia</Text>
          </View>

          <View style={styles.section}>
            <Text style={[styles.label, { fontSize: scale(15) }]}>📦 Producto a importar</Text>
            <TouchableOpacity
              style={[styles.selector, selectedProduct && styles.selectorSelected]}
              onPress={() => { setProductSearch(''); setProductModal(true); }}
            >
              {selectedProduct ? (
                <View>
                  <Text style={[styles.selectorValue, { fontSize: scale(15) }]}>{selectedProduct.name}</Text>
                  <Text style={[styles.selectorSub, { fontSize: scale(12) }]}>Partida {selectedProduct.partida} · {selectedProduct.category}</Text>
                </View>
              ) : (
                <Text style={[styles.selectorPlaceholder, { fontSize: scale(15) }]}>Seleccionar producto…</Text>
              )}
              <Text style={styles.selectorArrow}>▼</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <Text style={[styles.label, { fontSize: scale(15) }]}>🌍 País de origen</Text>
            <TouchableOpacity
              style={[styles.selector, selectedCountry && styles.selectorSelected]}
              onPress={() => { setCountrySearch(''); setCountryModal(true); }}
            >
              {selectedCountry ? (
                <Text style={[styles.selectorValue, { fontSize: scale(15) }]}>
                  {selectedCountry.flag}  {selectedCountry.name}{selectedCountry.agreements.length > 0 ? '  ✅' : ''}
                </Text>
              ) : (
                <Text style={[styles.selectorPlaceholder, { fontSize: scale(15) }]}>Seleccionar país…</Text>
              )}
              <Text style={styles.selectorArrow}>▼</Text>
            </TouchableOpacity>
            {selectedCountry && selectedCountry.agreements.length > 0 && (
              <Text style={[styles.agreementHint, { fontSize: scale(12) }]}>✅ Tiene acuerdo comercial con Bolivia — posible reducción de GA</Text>
            )}
          </View>

          <View style={styles.section}>
            <Text style={[styles.label, { fontSize: scale(15) }]}>💰 Valor CIF</Text>
            <View style={styles.toggleRow}>
              <TouchableOpacity style={[styles.toggleBtn, cifLocation === 'LA_PAZ' && styles.toggleBtnActive]} onPress={() => setCifLocation('LA_PAZ')}>
                <Text style={[styles.toggleText, cifLocation === 'LA_PAZ' && styles.toggleTextActive, { fontSize: scale(13) }]}>CIF La Paz</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.toggleBtn, cifLocation === 'ARICA' && styles.toggleBtnActive]} onPress={() => setCifLocation('ARICA')}>
                <Text style={[styles.toggleText, cifLocation === 'ARICA' && styles.toggleTextActive, { fontSize: scale(13) }]}>CIF Arica</Text>
              </TouchableOpacity>
            </View>
            <View style={[styles.toggleRow, { marginTop: 8 }]}>
              <TouchableOpacity style={[styles.toggleBtn, cifCurrency === 'USD' && styles.toggleBtnActive]} onPress={() => setCifCurrency('USD')}>
                <Text style={[styles.toggleText, cifCurrency === 'USD' && styles.toggleTextActive, { fontSize: scale(13) }]}>USD ($)</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.toggleBtn, cifCurrency === 'BOB' && styles.toggleBtnActive]} onPress={() => setCifCurrency('BOB')}>
                <Text style={[styles.toggleText, cifCurrency === 'BOB' && styles.toggleTextActive, { fontSize: scale(13) }]}>BOB (Bs)</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.inputRow}>
              <Text style={[styles.currencyPrefix, { fontSize: scale(16) }]}>{cifCurrency === 'USD' ? '$' : 'Bs'}</Text>
              <TextInput
                style={[styles.input, { fontSize: scale(18) }]}
                placeholder="0.00" placeholderTextColor={colors.textMuted}
                keyboardType="decimal-pad" value={cifValue}
                onChangeText={v => setCifValue(sanitizeDecimal(v))} maxLength={12}
              />
            </View>
            {cifLocation === 'ARICA' && (
              <View>
                <Text style={[styles.labelSmall, { fontSize: scale(13) }]}>+ Flete Arica → La Paz (USD, opcional)</Text>
                <View style={styles.inputRow}>
                  <Text style={[styles.currencyPrefix, { fontSize: scale(16) }]}>$</Text>
                  <TextInput
                    style={[styles.input, { fontSize: scale(18) }]}
                    placeholder="150.00 (aproximado)" placeholderTextColor={colors.textMuted}
                    keyboardType="decimal-pad" value={fleteValue}
                    onChangeText={v => setFleteValue(sanitizeDecimal(v, 9999))} maxLength={8}
                  />
                </View>
                <Text style={[styles.hint, { fontSize: scale(11) }]}>El flete promedio Arica–La Paz es de $100–$300 USD dependiendo del peso/volumen.</Text>
              </View>
            )}
            <Text style={[styles.hint, { fontSize: scale(11) }]}>Tipo de cambio oficial BCB: 1 USD = {exchangeRate} BOB</Text>
          </View>

          <TouchableOpacity
            style={[styles.calcBtn, (!canCalculate || loading) && styles.calcBtnDisabled]}
            onPress={handleCalculate} disabled={!canCalculate || loading}
          >
            <Text style={[styles.calcBtnText, { fontSize: scale(17) }]}>
              {loading ? '🔄  Consultando KB…' : 'Calcular Impuestos'}
            </Text>
          </TouchableOpacity>
          <Text style={[styles.footer, { fontSize: scale(11) }]}>Datos basados en el Arancel Aduanero Nacional (NANDINA) y normativa vigente.</Text>
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal visible={productModal} animationType="slide" onRequestClose={() => setProductModal(false)}>
        <SafeAreaView style={styles.modal}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { fontSize: scale(18) }]}>Seleccionar Producto</Text>
            <TouchableOpacity onPress={() => setProductModal(false)}><Text style={styles.modalClose}>✕</Text></TouchableOpacity>
          </View>
          <View style={styles.searchBox}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={[styles.searchInput, { fontSize: scale(15) }]}
              placeholder="Buscar producto, categoría o partida…" placeholderTextColor={colors.textMuted}
              value={productSearch} onChangeText={setProductSearch} autoFocus
            />
          </View>
          <FlatList
            data={filteredProducts} keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.listItem} onPress={() => { setSelectedProduct(item); setProductModal(false); }}>
                <View style={styles.listItemContent}>
                  <Text style={[styles.listItemTitle, { fontSize: scale(14) }]}>{item.name}</Text>
                  <Text style={[styles.listItemSub, { fontSize: scale(12) }]}>{item.category}  ·  Partida {item.partida}</Text>
                  <View style={styles.badgeRow}>
                    <View style={styles.badge}><Text style={[styles.badgeText, { fontSize: scale(11) }]}>GA {item.ga_rate}%</Text></View>
                    {item.ice_rate > 0 && <View style={[styles.badge, styles.badgeOrange]}><Text style={[styles.badgeText, { fontSize: scale(11) }]}>ICE {item.ice_rate}%</Text></View>}
                    {item.ga_rate === 0 && <View style={[styles.badge, styles.badgeGreen]}><Text style={[styles.badgeText, { fontSize: scale(11) }]}>Exento GA</Text></View>}
                  </View>
                </View>
                <Text style={styles.listItemArrow}>›</Text>
              </TouchableOpacity>
            )}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        </SafeAreaView>
      </Modal>

      <Modal visible={countryModal} animationType="slide" onRequestClose={() => setCountryModal(false)}>
        <SafeAreaView style={styles.modal}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { fontSize: scale(18) }]}>País de Origen</Text>
            <TouchableOpacity onPress={() => setCountryModal(false)}><Text style={styles.modalClose}>✕</Text></TouchableOpacity>
          </View>
          <View style={styles.searchBox}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={[styles.searchInput, { fontSize: scale(15) }]}
              placeholder="Buscar país o región…" placeholderTextColor={colors.textMuted}
              value={countrySearch} onChangeText={setCountrySearch} autoFocus
            />
          </View>
          <FlatList
            data={filteredCountries} keyExtractor={item => item.code}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.listItem} onPress={() => { setSelectedCountry(item); setCountryModal(false); }}>
                <Text style={styles.countryFlag}>{item.flag}</Text>
                <View style={styles.listItemContent}>
                  <Text style={[styles.listItemTitle, { fontSize: scale(14) }]}>{item.name}</Text>
                  <Text style={[styles.listItemSub, { fontSize: scale(12) }]}>{item.region}</Text>
                  {item.agreements.length > 0 && <Text style={[styles.agreementTag, { fontSize: scale(11) }]}>✅ Acuerdo comercial con Bolivia</Text>}
                </View>
                <Text style={styles.listItemArrow}>›</Text>
              </TouchableOpacity>
            )}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

function makeStyles(colors: any) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background },
    container: { padding: SPACING.md, paddingBottom: 32 },
    header: { backgroundColor: colors.primary, borderRadius: RADIUS.lg, padding: SPACING.lg, marginBottom: SPACING.md, alignItems: 'center' },
    headerTitle: { fontWeight: '800', color: colors.textWhite, letterSpacing: 0.5 },
    headerSubtitle: { color: 'rgba(255,255,255,0.8)', marginTop: 4 },
    section: { marginBottom: SPACING.md },
    label: { fontWeight: '700', color: colors.textPrimary, marginBottom: 8 },
    labelSmall: { color: colors.textSecondary, marginBottom: 6, marginTop: 10 },
    selector: { backgroundColor: colors.white, borderRadius: RADIUS.md, borderWidth: 1.5, borderColor: colors.border, padding: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    selectorSelected: { borderColor: colors.primary },
    selectorValue: { fontWeight: '600', color: colors.textPrimary, flex: 1 },
    selectorSub: { color: colors.textSecondary, marginTop: 2 },
    selectorPlaceholder: { color: colors.textMuted, flex: 1 },
    selectorArrow: { fontSize: 12, color: colors.textMuted, marginLeft: 8 },
    agreementHint: { color: colors.success, marginTop: 6, fontWeight: '600' },
    toggleRow: { flexDirection: 'row', gap: 8 },
    toggleBtn: { flex: 1, backgroundColor: colors.white, borderRadius: RADIUS.sm, borderWidth: 1.5, borderColor: colors.border, paddingVertical: 10, alignItems: 'center' },
    toggleBtnActive: { backgroundColor: colors.primary, borderColor: colors.primary },
    toggleText: { fontWeight: '600', color: colors.textSecondary },
    toggleTextActive: { color: colors.textWhite },
    inputRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, borderRadius: RADIUS.md, borderWidth: 1.5, borderColor: colors.border, marginTop: 8, paddingHorizontal: 14 },
    currencyPrefix: { fontWeight: '700', color: colors.textSecondary, marginRight: 8 },
    input: { flex: 1, fontWeight: '700', color: colors.textPrimary, paddingVertical: 12 },
    hint: { color: colors.textMuted, marginTop: 6 },
    calcBtn: { backgroundColor: colors.primary, borderRadius: RADIUS.lg, paddingVertical: 16, alignItems: 'center', marginTop: 8, elevation: 3, shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
    calcBtnDisabled: { backgroundColor: '#CCCCCC', shadowOpacity: 0, elevation: 0 },
    calcBtnText: { fontWeight: '800', color: colors.textWhite, letterSpacing: 0.5 },
    footer: { color: colors.textMuted, textAlign: 'center', marginTop: 20, lineHeight: 16 },
    modal: { flex: 1, backgroundColor: colors.white },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: SPACING.md, borderBottomWidth: 1, borderBottomColor: colors.border, backgroundColor: colors.primary },
    modalTitle: { fontWeight: '800', color: colors.textWhite },
    modalClose: { fontSize: 20, color: colors.textWhite, paddingHorizontal: 8 },
    searchBox: { flexDirection: 'row', alignItems: 'center', margin: SPACING.md, backgroundColor: colors.background, borderRadius: RADIUS.md, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 12 },
    searchIcon: { fontSize: 16, marginRight: 8 },
    searchInput: { flex: 1, paddingVertical: 12, color: colors.textPrimary },
    listItem: { flexDirection: 'row', alignItems: 'center', padding: SPACING.md },
    listItemContent: { flex: 1 },
    listItemTitle: { fontWeight: '600', color: colors.textPrimary },
    listItemSub: { color: colors.textSecondary, marginTop: 2 },
    listItemArrow: { fontSize: 20, color: colors.textMuted, marginLeft: 8 },
    separator: { height: 1, backgroundColor: colors.borderLight, marginLeft: SPACING.md },
    badgeRow: { flexDirection: 'row', gap: 6, marginTop: 4 },
    badge: { backgroundColor: '#EEF2FF', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 },
    badgeOrange: { backgroundColor: '#FFF7ED' },
    badgeGreen: { backgroundColor: '#F0FDF4' },
    badgeText: { fontWeight: '700', color: colors.textSecondary },
    countryFlag: { fontSize: 28, marginRight: 12 },
    agreementTag: { color: colors.success, fontWeight: '600', marginTop: 3 },
  });
}
