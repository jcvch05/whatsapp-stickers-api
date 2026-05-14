import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View, StyleSheet } from 'react-native';
import { RootStackParamList, MainTabsParamList } from '../types';
import { CalculatorScreen } from '../screens/CalculatorScreen';
import { ResultScreen } from '../screens/ResultScreen';
import { ProductsScreen } from '../screens/ProductsScreen';
import { AgreementsScreen } from '../screens/AgreementsScreen';
import { AboutScreen } from '../screens/AboutScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { useAppTheme } from '../context/ThemeContext';
const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabsParamList>();
function TabIcon({ icon, label, focused }: { icon: string; label: string; focused: boolean }) {
  const { colors, scale } = useAppTheme();
  return (
    <View style={s.container}>
      <Text style={[s.icon, focused && s.iconFocused]}>{icon}</Text>
      <Text style={[s.label, { color: focused ? colors.tabActive : colors.tabInactive, fontSize: scale(10) }]}>{label}</Text>
    </View>
  );
}
const s = StyleSheet.create({
  container:{alignItems:'center',paddingTop:4},
  icon:{fontSize:22}, iconFocused:{transform:[{scale:1.1}]},
  label:{marginTop:2,fontWeight:'500'},
});
function MainTabs() {
  const { colors } = useAppTheme();
  return (
    <Tab.Navigator screenOptions={{ headerShown:false, tabBarStyle:{ backgroundColor:colors.white, borderTopColor:colors.border, borderTopWidth:1, height:65, paddingBottom:8 }, tabBarShowLabel:false }}>
      <Tab.Screen name="Calculator" component={CalculatorScreen} options={{ tabBarIcon:({focused})=><TabIcon icon="🧮" label="Calcular" focused={focused}/> }}/>
      <Tab.Screen name="Products" component={ProductsScreen} options={{ tabBarIcon:({focused})=><TabIcon icon="📦" label="Partidas" focused={focused}/> }}/>
      <Tab.Screen name="Agreements" component={AgreementsScreen} options={{ tabBarIcon:({focused})=><TabIcon icon="🤝" label="Acuerdos" focused={focused}/> }}/>
      <Tab.Screen name="About" component={AboutScreen} options={{ tabBarIcon:({focused})=><TabIcon icon="ℹ️" label="Info" focused={focused}/> }}/>
      <Tab.Screen name="Settings" component={SettingsScreen} options={{ tabBarIcon:({focused})=><TabIcon icon="⚙️" label="Config" focused={focused}/> }}/>
    </Tab.Navigator>
  );
}
export function AppNavigator() {
  const { colors } = useAppTheme();
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="MainTabs" component={MainTabs} options={{ headerShown:false }}/>
        <Stack.Screen name="Result" component={ResultScreen} options={{ title:'Resultado del Cálculo', headerBackTitle:'Volver', headerStyle:{ backgroundColor:colors.primary }, headerTintColor:colors.textWhite, headerTitleStyle:{ fontWeight:'700' } }}/>
      </Stack.Navigator>
    </NavigationContainer>
  );
}
