import { initializeApp, getApps } from 'firebase/app';
import type { FirebaseApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import type { Firestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';
import type { Analytics } from 'firebase/analytics';

// Firebase config para CASIN y Terapia (solo proyecto sitios-9b5ac)
const firebaseConfigSitios = {
  apiKey: "AIzaSyDI228CoLlNccvsiIAAcvO_38QRSPBlkHM",
  authDomain: "sitios-9b5ac.firebaseapp.com",
  projectId: "sitios-9b5ac",
  storageBucket: "sitios-9b5ac.firebasestorage.app",
  messagingSenderId: "653183465235",
  appId: "1:653183465235:web:4b31a9b855f731b6240ce6",
  measurementId: "G-66FX9Q6FD9"
};

// Firebase config for MQWFJ (separate project)
const firebaseConfigMQWFJ = {
  apiKey: "AIzaSyCV89mX7Tj34nSzxhbaHnplis9cmPakP9U",
  authDomain: "mqwfj-568a8.firebaseapp.com",
  projectId: "mqwfj-568a8",
  storageBucket: "mqwfj-568a8.firebasestorage.app",
  messagingSenderId: "876538345056",
  appId: "1:876538345056:web:ac4ffcd8418381ad0a3505",
  measurementId: "G-65T821ZKCW"
};

// Detect which Firebase project to use based on hostname
const getFirebaseConfig = () => {
  if (typeof window === 'undefined') {
    return firebaseConfigSitios; // Default for SSR
  }
  
  const hostname = window.location.hostname;
  console.log('[Firebase] Detecting hostname:', hostname);
  
  if (hostname.includes('mqwfj')) {
    console.log('[Firebase] Using MQWFJ project: mqwfj-568a8');
    return firebaseConfigMQWFJ;
  }
  
  // CASIN y Terapia → proyecto sitios-9b5ac
  console.log('[Firebase] Using Sitios project: sitios-9b5ac');
  return firebaseConfigSitios;
};

// Initialize Firebase app (avoid multiple initializations)
let app: FirebaseApp;
const config = getFirebaseConfig();
const appName = config.projectId === 'mqwfj-568a8' ? 'mqwfj' : 'sitios';

console.log('[Firebase] Initializing app:', appName, 'for project:', config.projectId);

// Check if app already exists
const existingApp = getApps().find(a => a.name === appName);
if (existingApp) {
  app = existingApp;
  console.log('[Firebase] Using existing app:', appName);
} else {
  app = initializeApp(config, appName);
  console.log('[Firebase] Created new app:', appName);
}

export const db: Firestore = getFirestore(app);
console.log('[Firebase] Firestore instance created for project:', config.projectId);

// Analytics (sitios-9b5ac): activar cuando el dominio esté en Authorized domains
export const analytics: Analytics | null = typeof window !== 'undefined' && config.projectId === 'sitios-9b5ac' ? (() => {
  try {
    return getAnalytics(app);
  } catch (error) {
    console.warn('Firebase Analytics initialization failed:', error);
    return null;
  }
})() : null;
