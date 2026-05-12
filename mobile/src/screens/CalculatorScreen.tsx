import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
  FlatList,
  SafeAreaView,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, Currency, CIFLocation, Product, Country } from '../types';
import { PRODUCTS, searchProducts } from '../data/products';
import { COUNTRIES } from '../data/countries';
import { BCB_EXCHANGE_RATE } from '../utils/calculator';
import { calculateTaxesWithKB } from '../utils/calculatorWithKB';
import { COLORS, SPACING, RADIUS } from '../styles/theme';

type NavProp = NativeStackNavigationProp<RootStackParamList, 'MainTabs'>;

export function CalculatorScreen() {
  const navigation = useNavigation<NavProp>();

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

  const filteredProducts = useMemo(
    () => searchProducts(productSearch),
    [productSearch],
  );

  const filteredCountries = useMemo(() => {
    const q = countrySearch.toLowerCase();
    return COUNTRIES.filter(
      c =>
        c.name.toLowerCase().includes(q) ||
        c.region.toLowerCase().includes(q),
    );
  }, [countrySearch]);

  const canCalculate =
    selectedProduct !== null &&
    selectedCountry !== null &&
    cifValue.trim() !== '' &&
    !isNaN(parseFloat(cifValue)) &&
    parseFloat(cifValue) > 0;

  async function handleCalculate() {
    if (!canCalculate || !selectedProduct || !selectedCountry) return;
    setLoading(true);
    try {
      const flete = fleteValue ? parseFloat(fleteValue) : undefined;
      const { result, enrichment } = await calculateTaxesWithKB({
        product: selectedProduct,
        country: selectedCountry,
        cifValue: parseFloat(cifValue),
        cifCurrency,
        cifLocation,
        fleteAricaLaPaz: flete,
      });
      navigation.navigate('Result', { result, enrichment });
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Calculadora Aduanera</Text>
            <Text style={styles.headerSubtitle}>Bolivia · NANDINA · Aduana Nacional</Text>
          </View>

          {/* Producto */}
          <View style={styles.section}>
            <Text style={styles.label}>📦 Producto a importar</Text>
            <TouchableOpacity
              style={[styles.selector, selectedProduct && styles.selectorSelected]}
              onPress={() => { setProductSearch(''); setProductModal(true); }}
            >
              {selectedProduct ? (
                <View>
                  <Text style={styles.selectorValue}>{selectedProduct.name}</Text>
                  <Text style={styles.selectorSub}>
                    Partida {selectedProduct.partida} · {selectedProduct.category}
                  </Text>
                </View>
              ) : (
                <Text style={styles.selectorPlaceholder}>Seleccionar producto…</Text>
              )}
              <Text style={styles.selectorArrow}>▼</Text>
            </TouchableOpacity>
          </View>

          {/* País de origen */}
          <View style={styles.section}>
            <Text style={styles.label}>🌍 País de origen</Text>
            <TouchableOpacity
              style={[styles.selector, selectedCountry && styles.selectorSelected]}
              onPress={() => { setCountrySearch(''); setCountryModal(true); }}
            >
              {selectedCountry ? (
                <Text style={styles.selectorValue}>
                  {selectedCountry.flag}  {selectedCountry.name}
                  {selectedCountry.agreements.length > 0
                    ? `  ✅`
                    : ''}
                </Text>
              ) : (
                <Text style={styles.selectorPlaceholder}>Seleccionar país…</Text>
              )}
              <Text style={styles.selectorArrow}>▼</Text>
            </TouchableOpacity>
            {selectedCountry && selectedCountry.agreements.length > 0 && (
              <Text style={styles.agreementHint}>
                ✅ Tiene acuerdo comercial con Bolivia — posible reducción de GA
              </Text>
            )}
          </View>

          {/* Valor CIF */}
          <View style={styles.section}>
            <Text style={styles.label}>💰 Valor CIF</Text>

            {/* Ubicación CIF */}
            <View style={styles.toggleRow}>
              <TouchableOpacity
                style={[styles.toggleBtn, cifLocation === 'LA_PAZ' && styles.toggleBtnActive]}
                onPress={() => setCifLocation('LA_PAZ')}
              >
                <Text style={[styles.toggleText, cifLocation === 'LA_PAZ' && styles.toggleTextActive]}>
                  CIF La Paz
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.toggleBtn, cifLocation === 'ARICA' && styles.toggleBtnActive]}
                onPress={() => setCifLocation('ARICA')}
              >
                <Text style={[styles.toggleText, cifLocation === 'ARICA' && styles.toggleTextActive]}>
                  CIF Arica
                </Text>
              </TouchableOpacity>
            </View>

            {/* Moneda */}
            <View style={[styles.toggleRow, { marginTop: 8 }]}>
              <TouchableOpacity
                style={[styles.toggleBtn, cifCurrency === 'USD' && styles.toggleBtnActive]}
                onPress={() => setCifCurrency('USD')}
              >
                <Text style={[styles.toggleText, cifCurrency === 'USD' && styles.toggleTextActive]}>
                  USD ($)
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.toggleBtn, cifCurrency === 'BOB' && styles.toggleBtnActive]}
                onPress={() => setCifCurrency('BOB')}
              >
                <Text style={[styles.toggleText, cifCurrency === 'BOB' && styles.toggleTextActive]}>
                  BOB (Bs)
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.inputRow}>
              <Text style={styles.currencyPrefix}>
                {cifCurrency === 'USD' ? '$' : 'Bs'}
              </Text>
              <TextInput
                style={styles.input}
                placeholder="0.00"
                keyboardType="decimal-pad"
                value={cifValue}
                onChangeText={setCifValue}
              />
            </View>

            {cifLocation === 'ARICA' && (
              <View>
                <Text style={styles.labelSmall}>+ Flete Arica → La Paz (USD, opcional)</Text>
                <View style={styles.inputRow}>
                  <Text style={styles.currencyPrefix}>$</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="150.00 (aproximado)"
                    keyboardType="decimal-pad"
                    value={fleteValue}
                    onChangeText={setFleteValue}
                  />
                </View>
                <Text style={styles.hint}>
                  El flete promedio Arica–La Paz es de $100–$300 USD dependiendo del peso/volumen.
                </Text>
              </View>
            )}

            <Text style={styles.hint}>
              Tipo de cambio oficial BCB: 1 USD = {BCB_EXCHANGE_RATE} BOB
            </Text>
          </View>

          {/* Botón calcular */}
          <TouchableOpacity
            style={[styles.calcBtn, (!canCalculate || loading) && styles.calcBtnDisabled]}
            onPress={handleCalculate}
            disabled={!canCalculate || loading}
          >
            <Text style={styles.calcBtnText}>
              {loading ? '🔄  Consultando KB…' : '⚖️  Calcular Impuestos'}
            </Text>
          </TouchableOpacity>

          <Text style={styles.footer}>
            Datos basados en el Arancel Aduanero Nacional (NANDINA) y normativa vigente.{'\n'}
            Consultas especializadas: aforito.com
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Modal Productos */}
      <Modal visible={productModal} animationType="slide" onRequestClose={() => setProductModal(false)}>
        <SafeAreaView style={styles.modal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Seleccionar Producto</Text>
            <TouchableOpacity onPress={() => setProductModal(false)}>
              <Text style={styles.modalClose}>✕</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.searchBox}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar producto, categoría o partida…"
              value={productSearch}
              onChangeText={setProductSearch}
              autoFocus
            />
          </View>
          <FlatList
            data={filteredProducts}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.listItem}
                onPress={() => {
                  setSelectedProduct(item);
                  setProductModal(false);
                }}
              >
                <View style={styles.listItemContent}>
                  <Text style={styles.listItemTitle}>{item.name}</Text>
                  <Text style={styles.listItemSub}>
                    {item.category}  ·  Partida {item.partida}
                  </Text>
                  <View style={styles.badgeRow}>
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>GA {item.ga_rate}%</Text>
                    </View>
                    {item.ice_rate > 0 && (
                      <View style={[styles.badge, styles.badgeOrange]}>
                        <Text style={styles.badgeText}>ICE {item.ice_rate}%</Text>
                      </View>
                    )}
                    {item.ga_rate === 0 && (
                      <View style={[styles.badge, styles.badgeGreen]}>
                        <Text style={styles.badgeText}>Exento GA</Text>
                      </View>
                    )}
                  </View>
                </View>
                <Text style={styles.listItemArrow}>›</Text>
              </TouchableOpacity>
            )}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        </SafeAreaView>
      </Modal>

      {/* Modal Países */}
      <Modal visible={countryModal} animationType="slide" onRequestClose={() => setCountryModal(false)}>
        <SafeAreaView style={styles.modal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>País de Origen</Text>
            <TouchableOpacity onPress={() => setCountryModal(false)}>
              <Text style={styles.modalClose}>✕</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.searchBox}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar país o región…"
              value={countrySearch}
              onChangeText={setCountrySearch}
              autoFocus
            />
          </View>
          <FlatList
            data={filteredCountries}
            keyExtractor={item => item.code}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.listItem}
                onPress={() => {
                  setSelectedCountry(item);
                  setCountryModal(false);
                }}
              >
                <Text style={styles.countryFlag}>{item.flag}</Text>
                <View style={styles.listItemContent}>
                  <Text style={styles.listItemTitle}>{item.name}</Text>
                  <Text style={styles.listItemSub}>{item.region}</Text>
                  {item.agreements.length > 0 && (
                    <Text style={styles.agreementTag}>
                      ✅ Acuerdo comercial con Bolivia
                    </Text>
                  )}
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

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  container: { padding: SPACING.md, paddingBottom: 32 },

  header: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },

  section: { marginBottom: SPACING.md },
  label: { fontSize: 15, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 8 },
  labelSmall: { fontSize: 13, color: COLORS.textSecondary, marginBottom: 6, marginTop: 10 },

  selector: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectorSelected: { borderColor: COLORS.primary },
  selectorValue: { fontSize: 15, fontWeight: '600', color: COLORS.textPrimary, flex: 1 },
  selectorSub: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  selectorPlaceholder: { fontSize: 15, color: COLORS.textMuted, flex: 1 },
  selectorArrow: { fontSize: 12, color: COLORS.textMuted, marginLeft: 8 },

  agreementHint: {
    fontSize: 12,
    color: COLORS.success,
    marginTop: 6,
    fontWeight: '600',
  },

  toggleRow: { flexDirection: 'row', gap: 8 },
  toggleBtn: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.sm,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    paddingVertical: 10,
    alignItems: 'center',
  },
  toggleBtnActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  toggleText: { fontSize: 13, fontWeight: '600', color: COLORS.textSecondary },
  toggleTextActive: { color: COLORS.white },

  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    marginTop: 8,
    paddingHorizontal: 14,
  },
  currencyPrefix: { fontSize: 16, fontWeight: '700', color: COLORS.textSecondary, marginRight: 8 },
  input: { flex: 1, fontSize: 18, fontWeight: '700', color: COLORS.textPrimary, paddingVertical: 12 },

  hint: { fontSize: 11, color: COLORS.textMuted, marginTop: 6 },

  calcBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.lg,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    elevation: 3,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  calcBtnDisabled: { backgroundColor: '#CCCCCC', shadowOpacity: 0, elevation: 0 },
  calcBtnText: { fontSize: 17, fontWeight: '800', color: COLORS.white, letterSpacing: 0.5 },

  footer: {
    fontSize: 11,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 20,
    lineHeight: 16,
  },

  // Modals
  modal: { flex: 1, backgroundColor: COLORS.white },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.primary,
  },
  modalTitle: { fontSize: 18, fontWeight: '800', color: COLORS.white },
  modalClose: { fontSize: 20, color: COLORS.white, paddingHorizontal: 8 },

  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: SPACING.md,
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 12,
  },
  searchIcon: { fontSize: 16, marginRight: 8 },
  searchInput: { flex: 1, fontSize: 15, paddingVertical: 12, color: COLORS.textPrimary },

  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
  },
  listItemContent: { flex: 1 },
  listItemTitle: { fontSize: 14, fontWeight: '600', color: COLORS.textPrimary },
  listItemSub: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  listItemArrow: { fontSize: 20, color: COLORS.textMuted, marginLeft: 8 },
  separator: { height: 1, backgroundColor: COLORS.borderLight, marginLeft: SPACING.md },

  badgeRow: { flexDirection: 'row', gap: 6, marginTop: 4 },
  badge: {
    backgroundColor: '#EEF2FF',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badgeOrange: { backgroundColor: '#FFF7ED' },
  badgeGreen: { backgroundColor: '#F0FDF4' },
  badgeText: { fontSize: 11, fontWeight: '700', color: COLORS.textSecondary },

  countryFlag: { fontSize: 28, marginRight: 12 },
  agreementTag: { fontSize: 11, color: COLORS.success, fontWeight: '600', marginTop: 3 },
});
