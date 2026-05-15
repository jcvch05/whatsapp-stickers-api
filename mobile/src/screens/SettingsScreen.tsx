import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView, StyleSheet, TextInput } from 'react-native';
import { useAppTheme, ThemeName, FontSizeName, DEFAULT_EXCHANGE_RATE } from '../context/ThemeContext';
import { SPACING, RADIUS } from '../styles/theme';
const THEME_OPTIONS = [
  { key:'light', label:'Claro', preview:'#F5F5F5' },
  { key:'dark', label:'Oscuro', preview:'#1E1E1E' },
  { key:'sepia', label:'Sepia', preview:'#FDF6E3' },
  { key:'blue_pastel', label:'Azul Pastel', preview:'#EBF4FB' },
];
const FONT_OPTIONS = [
  { key:'small', label:'Pequeño', size:13 },
  { key:'medium', label:'Mediano', size:16 },
  { key:'large', label:'Grande', size:20 },
];
export function SettingsScreen() {
  const { colors, scale, theme, fontSize, exchangeRate, setTheme, setFontSize, setExchangeRate } = useAppTheme();
  const [rateInput, setRateInput] = useState(String(exchangeRate));
  function handleRateChange(val) {
    const clean = val.replace(/[^\d.]/g, '').replace(/^(\d*\.?\d{0,2}).*/, '$1');
    setRateInput(clean);
    const num = parseFloat(clean);
    if (!isNaN(num) && num > 0) setExchangeRate(num);
  }
  function resetRate() {
    setRateInput(String(DEFAULT_EXCHANGE_RATE));
    setExchangeRate(DEFAULT_EXCHANGE_RATE);
  }
  return (
    <SafeAreaView style={[s.safe, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={s.container}>
        <Text style={[s.pageTitle, { color: colors.textPrimary, fontSize: scale(22) }]}>Configuración</Text>

        <Text style={[s.sectionTitle, { color: colors.textMuted, fontSize: scale(12) }]}>TIPO DE CAMBIO (BOB por 1 USD)</Text>
        <View style={[s.card, { backgroundColor: colors.white, borderColor: colors.border }]}>
          <View style={[s.rateRow, { borderBottomColor: colors.borderLight }]}>
            <Text style={[s.rateLabel, { color: colors.textSecondary, fontSize: scale(14) }]}>1 USD =</Text>
            <TextInput
              style={[s.rateInput, { color: colors.textPrimary, borderColor: colors.border, fontSize: scale(16) }]}
              value={rateInput}
              onChangeText={handleRateChange}
              keyboardType="decimal-pad"
              maxLength={7}
            />
            <Text style={[s.rateSuffix, { color: colors.textSecondary, fontSize: scale(14) }]}>BOB</Text>
          </View>
          <TouchableOpacity style={[s.resetBtn, { borderTopColor: colors.borderLight }]} onPress={resetRate}>
            <Text style={[s.resetBtnText, { color: colors.textMuted, fontSize: scale(12) }]}>Restablecer valor oficial BCB ({DEFAULT_EXCHANGE_RATE})</Text>
          </TouchableOpacity>
        </View>

        <Text style={[s.sectionTitle, { color: colors.textMuted, fontSize: scale(12) }]}>TEMA DE COLOR</Text>
        <View style={[s.card, { backgroundColor: colors.white, borderColor: colors.border }]}>
          {THEME_OPTIONS.map((opt) => (
            <TouchableOpacity key={opt.key} style={[s.optionRow, { borderBottomColor: colors.borderLight }]} onPress={() => setTheme(opt.key)}>
              <View style={[s.colorDot, { backgroundColor: opt.preview, borderColor: colors.border }]} />
              <Text style={[s.optionLabel, { color: colors.textPrimary, fontSize: scale(15) }]}>{opt.label}</Text>
              {theme === opt.key && <Text style={[s.check, { color: colors.primary }]}>✓</Text>}
            </TouchableOpacity>
          ))}
        </View>
        <Text style={[s.sectionTitle, { color: colors.textMuted, fontSize: scale(12) }]}>TAMAÑO DE LETRA</Text>
        <View style={[s.card, { backgroundColor: colors.white, borderColor: colors.border }]}>
          {FONT_OPTIONS.map((opt) => (
            <TouchableOpacity key={opt.key} style={[s.optionRow, { borderBottomColor: colors.borderLight }]} onPress={() => setFontSize(opt.key)}>
              <Text style={[s.fontPreview, { color: colors.textSecondary, fontSize: opt.size }]}>Aa</Text>
              <Text style={[s.optionLabel, { color: colors.textPrimary, fontSize: scale(15) }]}>{opt.label}</Text>
              {fontSize === opt.key && <Text style={[s.check, { color: colors.primary }]}>✓</Text>}
            </TouchableOpacity>
          ))}
        </View>
        <Text style={[s.sectionTitle, { color: colors.textMuted, fontSize: scale(12) }]}>ACERCA DE</Text>
        <View style={[s.card, { backgroundColor: colors.white, borderColor: colors.border }]}>
          <View style={s.infoRow}><Text style={[s.infoLabel,{color:colors.textSecondary,fontSize:scale(14)}]}>Versión</Text><Text style={[s.infoValue,{color:colors.textPrimary,fontSize:scale(14)}]}>1.0.0</Text></View>
          <View style={[s.infoRow,{borderBottomWidth:0}]}><Text style={[s.infoLabel,{color:colors.textSecondary,fontSize:scale(14)}]}>Copyright</Text><Text style={[s.infoValue,{color:colors.textPrimary,fontSize:scale(14)}]}>© 2026 @jcvch</Text></View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
const s = StyleSheet.create({
  safe:{flex:1}, container:{padding:SPACING.md,paddingBottom:40},
  pageTitle:{fontWeight:'800',marginBottom:SPACING.lg},
  sectionTitle:{fontWeight:'700',letterSpacing:1,marginBottom:8,marginTop:SPACING.md},
  card:{borderRadius:RADIUS.md,borderWidth:1,overflow:'hidden',marginBottom:8},
  optionRow:{flexDirection:'row',alignItems:'center',padding:14,borderBottomWidth:1},
  colorDot:{width:24,height:24,borderRadius:12,borderWidth:1,marginRight:12},
  fontPreview:{width:36,fontWeight:'700',marginRight:12},
  optionLabel:{flex:1,fontWeight:'500'}, check:{fontSize:18,fontWeight:'700'},
  infoRow:{flexDirection:'row',justifyContent:'space-between',padding:14,borderBottomWidth:1},
  infoLabel:{fontWeight:'500'}, infoValue:{fontWeight:'600'},
  rateRow:{flexDirection:'row',alignItems:'center',padding:14,borderBottomWidth:1,gap:8},
  rateLabel:{fontWeight:'500'},
  rateInput:{flex:1,borderWidth:1,borderRadius:8,paddingHorizontal:10,paddingVertical:6,fontWeight:'700',textAlign:'center'},
  rateSuffix:{fontWeight:'500'},
  resetBtn:{padding:12,alignItems:'center'},
  resetBtnText:{fontWeight:'500'},
});
