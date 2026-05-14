import React, { useState, useMemo } from 'react';
import {
  View, Text, TextInput, FlatList, TouchableOpacity,
  StyleSheet, SafeAreaView, Modal, ScrollView,
} from 'react-native';
import { PRODUCTS, PRODUCT_CATEGORIES, searchProducts } from '../data/products';
import { Product } from '../types';
import { SPACING, RADIUS } from '../styles/theme';
import { useAppTheme } from '../context/ThemeContext';

export function ProductsScreen() {
  const { colors, scale } = useAppTheme();
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);

  const filtered = useMemo(() => {
    let list = searchProducts(query);
    if (selectedCategory) list = list.filter(p => p.category === selectedCategory);
    return list;
  }, [query, selectedCategory]);

  const styles = useMemo(() => makeStyles(colors), [colors]);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.topBar}>
        <Text style={[styles.topTitle, { fontSize: scale(20) }]}>Partidas Arancelarias</Text>
        <Text style={[styles.topSub, { fontSize: scale(12) }]}>Consulta el arancel NANDINA boliviano</Text>
      </View>
      <View style={styles.searchBox}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={[styles.searchInput, { fontSize: scale(14) }]}
          placeholder="Buscar producto, categoría, partida…"
          placeholderTextColor={colors.textMuted}
          value={query}
          onChangeText={setQuery}
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery('')}>
            <Text style={[styles.clearBtn, { fontSize: scale(16) }]}>✕</Text>
          </TouchableOpacity>
        )}
      </View>
      <FlatList
        horizontal showsHorizontalScrollIndicator={false}
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
              <Text style={[styles.catChipText, isActive && styles.catChipTextActive, { fontSize: scale(12) }]}>{item}</Text>
            </TouchableOpacity>
          );
        }}
      />
      <Text style={[styles.count, { fontSize: scale(12) }]}>{filtered.length} productos encontrados</Text>
      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingHorizontal: SPACING.md, paddingBottom: 32 }}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => setDetailProduct(item)}>
            <View style={styles.cardTop}>
              <View style={styles.cardMain}>
                <Text style={[styles.cardName, { fontSize: scale(14) }]}>{item.name}</Text>
                <Text style={[styles.cardPartida, { fontSize: scale(12) }]}>📌 {item.partida}</Text>
              </View>
              <View style={styles.cardRates}>
                <RateBadge label="GA" rate={item.ga_rate} />
                {item.ice_rate > 0 && <RateBadge label="ICE" rate={item.ice_rate} color="orange" />}
              </View>
            </View>
            <Text style={[styles.cardCategory, { fontSize: scale(12) }]}>{item.category}</Text>
            {item.permits.length > 0 && (
              <Text style={[styles.cardPermits, { fontSize: scale(11) }]}>⚠️ Requiere permisos especiales</Text>
            )}
          </TouchableOpacity>
        )}
      />
      <Modal visible={detailProduct !== null} animationType="slide" onRequestClose={() => setDetailProduct(null)}>
        {detailProduct && (
          <SafeAreaView style={styles.modal}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { fontSize: scale(16) }]} numberOfLines={2}>{detailProduct.name}</Text>
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
                <DetailRow label="Imp. al Consumo Específico (ICE)" value={`${detailProduct.ice_rate}%`} />
              )}
              <DetailRow label="IVA Importación" value="14.94%" />
              {detailProduct.permits.length > 0 && (
                <View style={styles.detailSection}>
                  <Text style={[styles.detailSectionTitle, { fontSize: scale(13) }]}>📋 Permisos Requeridos</Text>
                  {detailProduct.permits.map((p, i) => (
                    <Text key={i} style={[styles.detailBullet, { fontSize: scale(13) }]}>• {p}</Text>
                  ))}
                </View>
              )}
              {detailProduct.observations ? (
                <View style={styles.detailSection}>
                  <Text style={[styles.detailSectionTitle, { fontSize: scale(13) }]}>ℹ️ Observaciones</Text>
                  <Text style={[styles.detailBody, { fontSize: scale(13) }]}>{detailProduct.observations}</Text>
                </View>
              ) : null}
              {detailProduct.normativa.length > 0 && (
                <View style={styles.detailSection}>
                  <Text style={[styles.detailSectionTitle, { fontSize: scale(13) }]}>⚖️ Normativa</Text>
                  {detailProduct.normativa.map((n, i) => (
                    <Text key={i} style={[styles.detailBullet, { fontSize: scale(13) }]}>• {n}</Text>
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
  const { colors, scale } = useAppTheme();
  const bg = color === 'orange' ? '#FFF7ED' : rate === 0 ? '#F0FDF4' : '#EEF2FF';
  const textColor = color === 'orange' ? colors.warning : rate === 0 ? colors.success : colors.info;
  return (
    <View style={[badgeS.badge, { backgroundColor: bg }]}>
      <Text style={[badgeS.label, { color: colors.textMuted, fontSize: scale(10) }]}>{label}</Text>
      <Text style={[badgeS.rate, { color: textColor, fontSize: scale(14) }]}>{rate}%</Text>
    </View>
  );
}

const badgeS = StyleSheet.create({
  badge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4, alignItems: 'center', minWidth: 50 },
  label: { fontWeight: '600' },
  rate: { fontWeight: '800' },
});

function DetailRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  const { colors, scale } = useAppTheme();
  return (
    <View style={[drS.row, { borderBottomColor: colors.borderLight }]}>
      <Text style={[drS.label, { color: colors.textSecondary, fontSize: scale(13) }]}>{label}</Text>
      <Text style={[drS.value, { color: highlight ? colors.primary : colors.textPrimary, fontWeight: highlight ? '800' : '600', fontSize: highlight ? scale(15) : scale(13) }]}>{value}</Text>
    </View>
  );
}

const drS = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1 },
  label: { flex: 1 },
  value: { flex: 1, textAlign: 'right' },
});

function makeStyles(colors: any) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background },
    topBar: { backgroundColor: colors.primary, padding: SPACING.md, paddingBottom: 14 },
    topTitle: { fontWeight: '800', color: colors.textWhite },
    topSub: { color: 'rgba(255,255,255,0.75)', marginTop: 2 },
    searchBox: {
      flexDirection: 'row', alignItems: 'center', margin: SPACING.md, marginBottom: 8,
      backgroundColor: colors.white, borderRadius: RADIUS.md, borderWidth: 1,
      borderColor: colors.border, paddingHorizontal: 12,
    },
    searchIcon: { fontSize: 16, marginRight: 8 },
    searchInput: { flex: 1, paddingVertical: 10, color: colors.textPrimary },
    clearBtn: { color: colors.textMuted, padding: 4 },
    categoriesBar: { maxHeight: 50, marginBottom: 4 },
    catChip: {
      borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6,
      backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, height: 34, justifyContent: 'center',
    },
    catChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
    catChipText: { fontWeight: '600', color: colors.textSecondary },
    catChipTextActive: { color: colors.textWhite },
    count: { color: colors.textMuted, paddingHorizontal: SPACING.md, marginBottom: 8 },
    card: { backgroundColor: colors.white, borderRadius: RADIUS.md, padding: 14, marginVertical: 4 },
    cardTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
    cardMain: { flex: 1 },
    cardName: { fontWeight: '700', color: colors.textPrimary },
    cardPartida: { color: colors.primary, fontWeight: '600', marginTop: 2 },
    cardRates: { flexDirection: 'row', gap: 6 },
    cardCategory: { color: colors.textMuted, marginTop: 6 },
    cardPermits: { color: colors.warning, fontWeight: '600', marginTop: 4 },
    separator: { height: 1, backgroundColor: colors.borderLight },
    modal: { flex: 1, backgroundColor: colors.white },
    modalHeader: { flexDirection: 'row', alignItems: 'center', padding: SPACING.md, backgroundColor: colors.primary, gap: 12 },
    modalTitle: { flex: 1, fontWeight: '800', color: colors.textWhite },
    modalClose: { fontSize: 22, color: colors.textWhite },
    detailSection: { marginTop: 16, backgroundColor: colors.background, borderRadius: RADIUS.md, padding: 12 },
    detailSectionTitle: { fontWeight: '800', color: colors.textPrimary, marginBottom: 8 },
    detailBullet: { color: colors.textSecondary, marginBottom: 5, lineHeight: 20 },
    detailBody: { color: colors.textSecondary, lineHeight: 20 },
  });
}
