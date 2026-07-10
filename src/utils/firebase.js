import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyASsK_xxoB6uLL8tvw5thiAtdaDPCq15IA",
  authDomain: "konnet-a02ee.firebaseapp.com",
  projectId: "konnet-a02ee",
  storageBucket: "konnet-a02ee.firebasestorage.app",
  messagingSenderId: "417003343473",
  appId: "1:417003343473:web:72c6a5b4fc99b6e7be95d0",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
