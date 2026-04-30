# Aforito — Calculadora de Impuestos Aduaneros Bolivia

App móvil (Android + iOS) y API backend para calcular impuestos de importación/nacionalización de mercaderías en Bolivia, basada en el Arancel Aduanero Nacional (NANDINA) y la normativa vigente.

---

## Funcionalidades

- **Cálculo de impuestos**: GA, IVA e ICE en USD y BOB
- **Partidas arancelarias NANDINA**: 40+ productos con código HS oficial
- **Acuerdos comerciales**: CAN (Perú, Colombia, Ecuador), MERCOSUR, Chile, y más
- **Permisos y certificaciones**: SENASAG, AGEMED, ATT, SENAVEX, DGAC
- **CIF Arica o La Paz**: con flete estimado Arica → La Paz
- **Compartir resultado**: texto formateado para WhatsApp / email

---

## Estructura del proyecto

```
├── main.py               # API FastAPI (backend)
├── requirements.txt
├── data/
│   └── arancel_data.py   # Base de datos arancelaria completa
└── mobile/               # App React Native / Expo
    ├── App.tsx
    ├── src/
    │   ├── screens/
    │   │   ├── CalculatorScreen.tsx   # Calculadora principal
    │   │   ├── ResultScreen.tsx       # Desglose de impuestos
    │   │   ├── ProductsScreen.tsx     # Consulta de partidas
    │   │   ├── AgreementsScreen.tsx   # Acuerdos y países
    │   │   └── AboutScreen.tsx        # Info y fórmulas
    │   ├── data/
    │   │   ├── products.ts            # 40+ productos NANDINA
    │   │   └── countries.ts           # 25 países + acuerdos
    │   ├── utils/
    │   │   └── calculator.ts          # Motor de cálculo
    │   ├── navigation/
    │   │   └── AppNavigator.tsx
    │   ├── types/
    │   │   └── index.ts
    │   └── styles/
    │       └── theme.ts               # Colores Bolivia
    └── package.json
```

---

## Fórmula de cálculo (Aduana Nacional Bolivia)

```
Base imponible = Valor CIF (La Paz)
GA  = CIF × %GA
ICE = (CIF + GA) × %ICE   [si aplica]
IVA = (CIF + GA + ICE) × 13%

Total Impuestos = GA + ICE + IVA
Total a Pagar   = CIF + Total Impuestos
```

**Tipo de cambio BCB**: 1 USD = 6.96 BOB (oficial)

---

## Impuestos y tasas

| Impuesto | Tasa | Base |
|----------|------|------|
| GA (Gravamen Arancelario) | 0%, 5%, 10%, 15%, 20%, 30% | CIF La Paz |
| IVA Importación | 13% | CIF + GA + ICE |
| ICE (Consumo Específico) | 10%–50% | CIF + GA (sólo algunos productos) |

---

## Acuerdos comerciales

| Países | Acuerdo | Beneficio GA |
|--------|---------|--------------|
| Perú, Colombia, Ecuador | CAN (Comunidad Andina) | **0%** |
| Argentina, Brasil | ACE-36 MERCOSUR | Reducción parcial |
| Chile | ACE-22 | Reducción parcial |
| Cuba | ALBA | Reducción parcial |

---

## Instalación y uso

### Backend API

```bash
pip install -r requirements.txt
uvicorn main:app --reload
# API disponible en http://localhost:8000
# Docs en http://localhost:8000/docs
```

### App móvil

```bash
cd mobile
npm install
npx expo start
# Escanear QR con Expo Go (Android/iOS)
```

### Build para producción

```bash
cd mobile
npm install -g eas-cli
eas build --platform android   # APK/AAB
eas build --platform ios        # IPA
```

---

## Fuentes normativas

- **Aduana Nacional de Bolivia** — https://www.aduana.gob.bo
- **NANDINA** — Nomenclatura Arancelaria Andina (CAN)
- **Ley 843** — Reforma Tributaria (IVA, ICE)
- **DS 3854** — Importación de vehículos
- **Ley 2061** — SENASAG

---

## Asesoría especializada

**aforito.com** — Consultora aduanera especializada en Bolivia.
Tramitación de importaciones, clasificación arancelaria y gestión de permisos.
