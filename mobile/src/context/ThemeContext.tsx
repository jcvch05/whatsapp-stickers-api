import React, { createContext, useContext, useState } from 'react';
export type ThemeName = 'light' | 'dark' | 'sepia' | 'blue_pastel';
export type FontSizeName = 'small' | 'medium' | 'large';
export interface ThemeColors { primary:string;secondary:string;accent:string;background:string;white:string;cardBg:string;border:string;borderLight:string;textPrimary:string;textSecondary:string;textMuted:string;textWhite:string;success:string;warning:string;danger:string;info:string;tabActive:string;tabInactive:string;formulaBg:string;formulaText:string; }
const BASE = { primary:'#C8102E',secondary:'#F4C300',accent:'#007A3D',success:'#16A34A',warning:'#D97706',danger:'#DC2626',info:'#2563EB',tabActive:'#C8102E',textWhite:'#FFFFFF' };
export const THEMES: Record<ThemeName,ThemeColors> = {
  light:{...BASE,background:'#F5F5F5',white:'#FFFFFF',cardBg:'#FFFFFF',border:'#E0E0E0',borderLight:'#F0F0F0',textPrimary:'#1A1A1A',textSecondary:'#555555',textMuted:'#888888',tabInactive:'#9CA3AF',formulaBg:'#1A1A1A',formulaText:'#FFFFFF'},
  dark:{...BASE,primary:'#E53E5E',tabActive:'#E53E5E',background:'#121212',white:'#1E1E1E',cardBg:'#1E1E1E',border:'#333333',borderLight:'#2A2A2A',textPrimary:'#F0F0F0',textSecondary:'#AAAAAA',textMuted:'#666666',tabInactive:'#555555',formulaBg:'#2A2A2A',formulaText:'#E0E0E0'},
  sepia:{...BASE,background:'#F4ECD8',white:'#FDF6E3',cardBg:'#FDF6E3',border:'#D4B896',borderLight:'#EAD9BE',textPrimary:'#3B2A1A',textSecondary:'#6B4E35',textMuted:'#9B7A5A',tabInactive:'#9B7A5A',formulaBg:'#3B2A1A',formulaText:'#F4ECD8'},
  blue_pastel:{...BASE,background:'#EBF4FB',white:'#FFFFFF',cardBg:'#FFFFFF',border:'#B8D9F0',borderLight:'#D6EBF8',textPrimary:'#1A2E3D',textSecondary:'#3A5F7A',textMuted:'#6A8FA8',tabInactive:'#7AAEC8',formulaBg:'#1A2E3D',formulaText:'#EBF4FB'},
};
export const DEFAULT_EXCHANGE_RATE = 6.96;
export const FONT_SCALES: Record<FontSizeName,number> = { small:0.85, medium:1.0, large:1.2 };
interface ThemeContextValue { theme:ThemeName;fontSize:FontSizeName;colors:ThemeColors;scale:(n:number)=>number;exchangeRate:number;setTheme:(t:ThemeName)=>void;setFontSize:(f:FontSizeName)=>void;setExchangeRate:(r:number)=>void; }
const ThemeContext = createContext<ThemeContextValue>({ theme:'light',fontSize:'medium',colors:THEMES.light,scale:(n)=>n,exchangeRate:DEFAULT_EXCHANGE_RATE,setTheme:()=>{},setFontSize:()=>{},setExchangeRate:()=>{} });
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<ThemeName>('light');
  const [fontSize, setFontSize] = useState<FontSizeName>('medium');
  const [exchangeRate, setExchangeRate] = useState<number>(DEFAULT_EXCHANGE_RATE);
  const colors = THEMES[theme];
  const scale = (n: number) => Math.round(n * FONT_SCALES[fontSize]);
  return <ThemeContext.Provider value={{ theme, fontSize, colors, scale, exchangeRate, setTheme, setFontSize, setExchangeRate }}>{children}</ThemeContext.Provider>;
}
export function useAppTheme() { return useContext(ThemeContext); }
