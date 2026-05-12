import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyA0Mdt0HINiwqqgaD3kC-8oU2SY0rnrRnc',
  authDomain: 'consultora-aduanera.firebaseapp.com',
  projectId: 'consultora-aduanera',
  storageBucket: 'consultora-aduanera.firebasestorage.app',
  messagingSenderId: '42535260176',
  appId: '1:42535260176:web:ecef36d5f2b4c55770fa95',
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const db = getFirestore(app);
