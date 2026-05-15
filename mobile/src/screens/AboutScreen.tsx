import React from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView } from 'react-native';
import { SPACING, RADIUS } from '../styles/theme';
import { IVA_RATE } from '../utils/calculator';
import { useAppTheme } from '../context/ThemeContext';
export function AboutScreen() {
  const { colors, scale, exchangeRate } = useAppTheme();
  const taxRates = [
    { label:'Gravamen Arancelario (GA)', rates:'0%, 5%, 10%, 15%, 20%, 30%', note:'Varía por producto y origen' },
    { label:'IVA Importación', rates:`${IVA_RATE}%`, note:'Aplica a (CIF + GA + ICE)' },
    { label:'ICE — Imp. Consumo Específico', rates:'10% — 50%', note:'Sólo vehículos, alcohol, tabaco y otros' },
  ];
  const institutions = [
    { name:'Aduana Nacional de Bolivia', abbr:'ANB', desc:'Organismo rector de las importaciones. Aplica el arancel NANDINA.' },
    { name:'SENASAG', abbr:'SENASAG', desc:'Sanidad agropecuaria e inocuidad alimentaria. Regula alimentos y productos agropecuarios.' },
    { name:'AGEMED', abbr:'AGEMED', desc:'Agencia Estatal de Medicamentos y Tecnologías en Salud. Registra medicamentos y cosméticos.' },
    { name:'ATT', abbr:'ATT', desc:'Autoridad de Telecomunicaciones. Homologa equipos electrónicos y de comunicación.' },
    { name:'SENAVEX', abbr:'SENAVEX', desc:'Servicio Nacional de Verificación de Exportaciones e Importaciones. Permisos de importación especiales.' },
    { name:'DGAC', abbr:'DGAC', desc:'Dirección General de Aeronáutica Civil. Regula drones y aeronaves no tripuladas.' },
  ];
  return (
    <SafeAreaView style={[s.safe,{backgroundColor:colors.background}]}>
      <ScrollView contentContainerStyle={s.container}>
        <View style={[s.header,{backgroundColor:colors.primary}]}>
          <Text style={[s.appName,{fontSize:scale(28),color:colors.textWhite}]}>AFORITO Calc</Text>
          <Text style={[s.appTagline,{fontSize:scale(14),color:'rgba(255,255,255,0.85)'}]}>Calculadora Aduanera Bolivia</Text>
        </View>
        <View style={[s.rateCard,{backgroundColor:colors.secondary}]}>
          <Text style={[s.rateLabel,{fontSize:scale(11)}]}>TIPO DE CAMBIO OFICIAL BCB</Text>
          <Text style={[s.rateValue,{fontSize:scale(24)}]}>1 USD = {exchangeRate} BOB</Text>
          <Text style={[s.rateNote,{fontSize:scale(11)}]}>Banco Central de Bolivia · Tasa oficial de importación</Text>
        </View>
        <SectionTitle title="Estructura de Impuestos Aduaneros"/>
        {taxRates.map((t,i)=>(
          <View key={i} style={[s.taxCard,{backgroundColor:colors.white,borderLeftColor:colors.primary}]}>
            <Text style={[s.taxLabel,{color:colors.textPrimary,fontSize:scale(13)}]}>{t.label}</Text>
            <Text style={[s.taxRate,{color:colors.primary,fontSize:scale(16)}]}>{t.rates}</Text>
            <Text style={[s.taxNote,{color:colors.textMuted,fontSize:scale(11)}]}>{t.note}</Text>
          </View>
        ))}
        <SectionTitle title="Fórmula General de Cálculo"/>
        <View style={[s.formulaCard,{backgroundColor:colors.formulaBg}]}>
          <FL text="Base Imponible = Valor CIF (La Paz)" c={colors.formulaText} sc={scale}/>
          <FL text="GA = CIF × %GA" c={colors.formulaText} sc={scale}/>
          <FL text="ICE = (CIF + GA) × %ICE   [si aplica]" c={colors.formulaText} sc={scale}/>
          <FL text={`IVA = (CIF + GA + ICE) × ${IVA_RATE}%`} c={colors.formulaText} sc={scale}/>
          <View style={[s.formulaDivider,{backgroundColor:colors.border}]}/>
          <FL text="Total Impuestos = GA + ICE + IVA" c={colors.primary} sc={scale} bold/>
          <FL text="Total a Pagar = CIF + Total Impuestos" c={colors.primary} sc={scale} bold/>
        </View>
        <Text style={[s.formulaSource,{color:colors.textMuted,fontSize:scale(11)}]}>
          Fuente: Ley 843 (Reforma Tributaria), Arancel Aduanero NANDINA y normativa vigente.
        </Text>
        <SectionTitle title="Acuerdos Comerciales Vigentes"/>
        <View style={[s.infoBox,{backgroundColor:colors.white}]}>
          <AR flag="🇵🇪🇨🇴🇪🇨" name="Perú, Colombia, Ecuador" benefit="GA 0% (CAN)" colors={colors} scale={scale}/>
          <AR flag="🇦🇷🇧🇷" name="Argentina, Brasil" benefit="GA reducido (ACE-36)" colors={colors} scale={scale}/>
          <AR flag="🇨🇱" name="Chile" benefit="GA reducido (ACE-22)" colors={colors} scale={scale}/>
          <AR flag="🇨🇺" name="Cuba" benefit="Preferencias ALBA" colors={colors} scale={scale}/>
          <Text style={[s.infoNote,{color:colors.textMuted,fontSize:scale(11)}]}>Para los demás países se aplica la tasa general del Arancel Externo Común.</Text>
        </View>
        <SectionTitle title="Instituciones Reguladoras"/>
        {institutions.map((inst,i)=>(
          <View key={i} style={[s.institutionCard,{backgroundColor:colors.white}]}>
            <Text style={[s.institutionAbbr,{color:colors.primary,fontSize:scale(11)}]}>{inst.abbr}</Text>
            <Text style={[s.institutionName,{color:colors.textPrimary,fontSize:scale(14)}]}>{inst.name}</Text>
            <Text style={[s.institutionDesc,{color:colors.textSecondary,fontSize:scale(12)}]}>{inst.desc}</Text>
          </View>
        ))}
        <Text style={[s.disclaimer,{color:colors.textMuted,fontSize:scale(11)}]}>
          Esta aplicación es de carácter informativo y referencial. Los cálculos se basan en el Arancel Aduanero Nacional (NANDINA) y la normativa vigente. Para trámites oficiales consulte siempre con un agente de aduana habilitado o con la Aduana Nacional de Bolivia.
        </Text>
        <Text style={[s.copyright,{color:colors.textMuted,fontSize:scale(11)}]}>v1.0.0 · © 2026 @jcvch</Text>
      </ScrollView>
    </SafeAreaView>
  );
}
function SectionTitle({title}:{title:string}) {
  const {colors,scale}=useAppTheme();
  return <Text style={[{fontWeight:'800',marginTop:20,marginBottom:10,textTransform:'uppercase',letterSpacing:0.5,color:colors.textPrimary,fontSize:scale(13)}]}>{title}</Text>;
}
function FL({text,bold,c,sc}:{text:string;bold?:boolean;c:string;sc:(n:number)=>number}) {
  return <Text style={{fontFamily:'monospace',fontSize:sc(14),color:c,marginBottom:4,fontWeight:bold?'800':'400'}}>{text}</Text>;
}
function AR({flag,name,benefit,colors,scale}:{flag:string;name:string;benefit:string;colors:any;scale:(n:number)=>number}) {
  return (
    <View style={[{flexDirection:'row',alignItems:'center',paddingVertical:6,borderBottomWidth:1,borderBottomColor:colors.borderLight}]}>
      <Text style={{fontSize:16,width:50}}>{flag}</Text>
      <Text style={{flex:1,fontSize:scale(13),color:colors.textSecondary,fontWeight:'500'}}>{name}</Text>
      <Text style={{fontSize:scale(12),fontWeight:'700',color:colors.success}}>{benefit}</Text>
    </View>
  );
}
const s = StyleSheet.create({
  safe:{flex:1}, container:{padding:SPACING.md,paddingBottom:40},
  header:{borderRadius:RADIUS.xl,padding:SPACING.lg,alignItems:'center',marginBottom:SPACING.md},
  appName:{fontWeight:'900',letterSpacing:3}, appTagline:{marginTop:4}, appVersion:{marginTop:6},
  rateCard:{borderRadius:RADIUS.md,padding:14,alignItems:'center',marginBottom:SPACING.md},
  rateLabel:{fontWeight:'700',color:'#7A6000',textTransform:'uppercase',letterSpacing:1},
  rateValue:{fontWeight:'900',color:'#3D3000',marginTop:4}, rateNote:{color:'#7A6000',marginTop:4},
  taxCard:{borderRadius:RADIUS.md,padding:12,marginBottom:8,borderLeftWidth:3},
  taxLabel:{fontWeight:'700'}, taxRate:{fontWeight:'900',marginTop:2}, taxNote:{marginTop:2},
  formulaCard:{borderRadius:RADIUS.md,padding:16,marginBottom:8},
  formulaDivider:{height:1,marginVertical:8}, formulaSource:{marginBottom:4},
  infoBox:{borderRadius:RADIUS.md,padding:14,marginBottom:8}, infoNote:{marginTop:8},
  institutionCard:{borderRadius:RADIUS.md,padding:12,marginBottom:8},
  institutionAbbr:{fontWeight:'800',textTransform:'uppercase',letterSpacing:1,marginBottom:2},
  institutionName:{fontWeight:'700'}, institutionDesc:{marginTop:3,lineHeight:18},
  disclaimer:{textAlign:'center',marginTop:24,lineHeight:16},
  copyright:{textAlign:'center',marginTop:8,fontWeight:'600'},
});
