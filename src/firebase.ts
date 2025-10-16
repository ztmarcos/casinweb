import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAbpUOH4D4Q_GyJBV-fgDEo3khkbIMNvZs",
  authDomain: "casinbbdd.firebaseapp.com",
  projectId: "casinbbdd",
  storageBucket: "casinbbdd.firebasestorage.app",
  messagingSenderId: "812853971334",
  appId: "1:812853971334:web:3e16417cca4ef093ce8407"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
