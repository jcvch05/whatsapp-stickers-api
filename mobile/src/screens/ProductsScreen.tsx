import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Modal,
  ScrollView,
} from 'react-native';
import { PRODUCTS, PRODUCT_CATEGORIES, searchProducts } from '../data/products';
import { Product } from '../types';
import { COLORS, SPACING, RADIUS } from '../styles/theme';

export function ProductsScreen() {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);

  const filtered = useMemo(() => {
    let list = searchProducts(query);
    if (selectedCategory) list = list.filter(p => p.category === selectedCategory);
    return list;
  }, [query, selectedCategory]);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.topBar}>
        <Text style={styles.topTitle}>Partidas Arancelarias</Text>
        <Text style={styles.topSub}>Consulta el arancel NANDINA boliviano</Text>
      </View>

      <View style={styles.searchBox}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar producto, categoría, partida…"
          value={query}
          onChangeText={setQuery}
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery('')}>
            <Text style={styles.clearBtn}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Filtros de categoría */}
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={['Todos', ...PRODUCT_CATEGORIES]}
        keyExtractor={item => item}
        style={styles.categoriesBar}
        contentContainerStyle={{ paddingHorizontal: SPACING.md, gap: 8 }}
        renderItem={({ item }) => {
          const isActive = (item === 'Todos' && !selectedCategory) || item === selectedCategory;
          return (
            <TouchableOpacity
              style={[styles.catChip, isActive && styles.catChipActive]}
              onPress={() => setSelectedCategory(item === 'Todos' ? null : item)}
            >
              <Text style={[styles.catChipText, isActive && styles.catChipTextActive]}>{item}</Text>
            </TouchableOpacity>
          );
        }}
      />

      <Text style={styles.count}>{filtered.length} productos encontrados</Text>

      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingHorizontal: SPACING.md, paddingBottom: 32 }}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => setDetailProduct(item)}>
            <View style={styles.cardTop}>
              <View style={styles.cardMain}>
                <Text style={styles.cardName}>{item.name}</Text>
                <Text style={styles.cardPartida}>📌 {item.partida}</Text>
              </View>
              <View style={styles.cardRates}>
                <RateBadge label="GA" rate={item.ga_rate} />
                {item.ice_rate > 0 && <RateBadge label="ICE" rate={item.ice_rate} color="orange" />}
              </View>
            </View>
            <Text style={styles.cardCategory}>{item.category}</Text>
            {item.permits.length > 0 && (
              <Text style={styles.cardPermits}>⚠️ Requiere permisos especiales</Text>
            )}
          </TouchableOpacity>
        )}
      />

      {/* Modal detalle producto */}
      <Modal
        visible={detailProduct !== null}
        animationType="slide"
        onRequestClose={() => setDetailProduct(null)}
      >
        {detailProduct && (
          <SafeAreaView style={styles.modal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle} numberOfLines={2}>{detailProduct.name}</Text>
              <TouchableOpacity onPress={() => setDetailProduct(null)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={{ padding: SPACING.md, paddingBottom: 40 }}>
              <DetailRow label="Partida Arancelaria" value={detailProduct.partida} highlight />
              <DetailRow label="Categoría" value={detailProduct.category} />
              <DetailRow label="Descripción" value={detailProduct.description} />
              <DetailRow label="Gravamen Arancelario (GA)" value={`${detailProduct.ga_rate}%`} />
              {detailProduct.ice_rate > 0 && (
                <DetailRow
                  label="Imp. al Consumo Específico (ICE)"
                  value={`${detailProduct.ice_rate}%`}
                />
              )}
              <DetailRow label="IVA Importación" value="13%" />

              {detailProduct.permits.length > 0 && (
                <View style={styles.detailSection}>
                  <Text style={styles.detailSectionTitle}>📋 Permisos Requeridos</Text>
                  {detailProduct.permits.map((p, i) => (
                    <Text key={i} style={styles.detailBullet}>• {p}</Text>
                  ))}
                </View>
              )}

              {detailProduct.observations ? (
                <View style={styles.detailSection}>
                  <Text style={styles.detailSectionTitle}>ℹ️ Observaciones</Text>
                  <Text style={styles.detailBody}>{detailProduct.observations}</Text>
                </View>
              ) : null}

              {detailProduct.normativa.length > 0 && (
                <View style={styles.detailSection}>
                  <Text style={styles.detailSectionTitle}>⚖️ Normativa</Text>
                  {detailProduct.normativa.map((n, i) => (
                    <Text key={i} style={styles.detailBullet}>• {n}</Text>
                  ))}
                </View>
              )}
            </ScrollView>
          </SafeAreaView>
        )}
      </Modal>
    </SafeAreaView>
  );
}

function RateBadge({ label, rate, color = 'blue' }: { label: string; rate: number; color?: string }) {
  const bg = color === 'orange' ? '#FFF7ED' : rate === 0 ? '#F0FDF4' : '#EEF2FF';
  const textColor = color === 'orange' ? COLORS.warning : rate === 0 ? COLORS.success : COLORS.info;
  return (
    <View style={[badgeS.badge, { backgroundColor: bg }]}>
      <Text style={[badgeS.label, { color: COLORS.textMuted }]}>{label}</Text>
      <Text style={[badgeS.rate, { color: textColor }]}>{rate}%</Text>
    </View>
  );
}

const badgeS = StyleSheet.create({
  badge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4, alignItems: 'center', minWidth: 50 },
  label: { fontSize: 10, fontWeight: '600' },
  rate: { fontSize: 14, fontWeight: '800' },
});

function DetailRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <View style={drS.row}>
      <Text style={drS.label}>{label}</Text>
      <Text style={[drS.value, highlight && drS.highlight]}>{value}</Text>
    </View>
  );
}

const drS = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: COLORS.borderLight },
  label: { fontSize: 13, color: COLORS.textSecondary, flex: 1 },
  value: { fontSize: 13, fontWeight: '600', color: COLORS.textPrimary, flex: 1, textAlign: 'right' },
  highlight: { color: COLORS.primary, fontWeight: '800', fontSize: 15 },
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

  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: SPACING.md,
    marginBottom: 8,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 12,
  },
  searchIcon: { fontSize: 16, marginRight: 8 },
  searchInput: { flex: 1, fontSize: 14, paddingVertical: 10, color: COLORS.textPrimary },
  clearBtn: { fontSize: 16, color: COLORS.textMuted, padding: 4 },

  categoriesBar: { maxHeight: 50, marginBottom: 4 },
  catChip: {
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    height: 34,
    justifyContent: 'center',
  },
  catChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  catChipText: { fontSize: 12, fontWeight: '600', color: COLORS.textSecondary },
  catChipTextActive: { color: COLORS.white },

  count: { fontSize: 12, color: COLORS.textMuted, paddingHorizontal: SPACING.md, marginBottom: 8 },

  card: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: 14,
    marginVertical: 4,
  },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  cardMain: { flex: 1 },
  cardName: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary },
  cardPartida: { fontSize: 12, color: COLORS.primary, fontWeight: '600', marginTop: 2 },
  cardRates: { flexDirection: 'row', gap: 6 },
  cardCategory: { fontSize: 12, color: COLORS.textMuted, marginTop: 6 },
  cardPermits: { fontSize: 11, color: COLORS.warning, fontWeight: '600', marginTop: 4 },
  separator: { height: 1, backgroundColor: COLORS.borderLight },

  modal: { flex: 1, backgroundColor: COLORS.white },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.primary,
    gap: 12,
  },
  modalTitle: { flex: 1, fontSize: 16, fontWeight: '800', color: COLORS.white },
  modalClose: { fontSize: 22, color: COLORS.white },

  detailSection: {
    marginTop: 16,
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.md,
    padding: 12,
  },
  detailSectionTitle: { fontSize: 13, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 8 },
  detailBullet: { fontSize: 13, color: COLORS.textSecondary, marginBottom: 5, lineHeight: 20 },
  detailBody: { fontSize: 13, color: COLORS.textSecondary, lineHeight: 20 },
});
