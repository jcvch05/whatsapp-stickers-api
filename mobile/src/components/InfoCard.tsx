import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAppTheme } from '../context/ThemeContext';

interface InfoCardProps {
  icon?: string;
  title: string;
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
}

export function InfoCard({ icon, title, children, variant = 'default' }: InfoCardProps) {
  const { colors, scale } = useAppTheme();
  const borderColor = { default: colors.border, success: colors.success, warning: colors.warning, danger: colors.danger, info: colors.primary }[variant];
  const bgColor = { default: colors.white, success: '#F0FDF4', warning: '#FFFBEB', danger: '#FEF2F2', info: '#EFF6FF' }[variant];
  return (
    <View style={[styles.card, { borderLeftColor: borderColor, backgroundColor: bgColor }]}>
      <View style={styles.header}>
        {icon ? <Text style={[styles.icon, { fontSize: scale(18) }]}>{icon}</Text> : null}
        <Text style={[styles.title, { color: borderColor, fontSize: scale(14) }]}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 12, borderLeftWidth: 4, padding: 14, marginBottom: 12, elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 3 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 6 },
  icon: {},
  title: { fontWeight: '700', flex: 1 },
});
