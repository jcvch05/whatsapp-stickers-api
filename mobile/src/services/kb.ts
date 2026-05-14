import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db } from './firebase';

export interface KBDecreto {
  id: string;
  numero: string;
  titulo: string;
  contenido: string;
  fecha: string;
  productos_afectados: string[];
  partidas_afectadas: string[];
  ga_rates: Record<string, number>;
  vigente: boolean;
}

export interface KBNormativa {
  id: string;
  codigo: string;
  titulo: string;
  contenido: string;
  tipo: 'decreto' | 'ley' | 'resolucion' | 'reglamento';
}

export interface KBProducto {
  id: string;
  nombre: string;
  partida: string;
  ga_rate: number;
  ice_rate: number;
  decretos_aplicables: string[];
  permisos: string[];
  observaciones: string;
  normativa: string[];
  ultima_actualizacion: string;
}

// Busca decretos vigentes que afecten a una partida arancelaria
export async function getDecretosParaPartida(partida: string): Promise<KBDecreto[]> {
  try {
    const q = query(
      collection(db, 'kb_decretos'),
      where('vigente', '==', true),
      where('partidas_afectadas', 'array-contains', partida)
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as KBDecreto));
  } catch (err) {
    console.warn('[KB] getDecretosParaPartida error:', err);
    return [];
  }
}

// Obtiene un producto de la KB con sus tasas actualizadas
export async function getProductoKB(partida: string): Promise<KBProducto | null> {
  try {
    const q = query(
      collection(db, 'kb_productos'),
      where('partida', '==', partida),
      limit(1)
    );
    const snap = await getDocs(q);
    if (snap.empty) return null;
    const d = snap.docs[0];
    return { id: d.id, ...d.data() } as KBProducto;
  } catch (err) {
    console.warn('[KB] getProductoKB error:', err);
    return null;
  }
}

// Obtiene todos los decretos vigentes (para mostrar en la app)
export async function getDecretosVigentes(): Promise<KBDecreto[]> {
  try {
    const q = query(
      collection(db, 'kb_decretos'),
      where('vigente', '==', true),
      orderBy('fecha', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as KBDecreto));
  } catch (err) {
    console.warn('[KB] getDecretosVigentes error:', err);
    return [];
  }
}

// Obtiene todos los acuerdos comerciales de la KB
export async function getAcuerdosKB() {
  try {
    const snap = await getDocs(collection(db, 'kb_acuerdos'));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.warn('[KB] getAcuerdosKB error:', err);
    return [];
  }
}
