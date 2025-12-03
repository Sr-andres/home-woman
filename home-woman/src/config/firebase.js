// Importar Firebase
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";


// TU CONFIGURACIÓN DE FIREBASE
const firebaseConfig = {
  apiKey: "AIzaSyCmVpxqaOjAtVvdsGH5yYTEtuhRKUHstyU",
  authDomain: "plata-8f7a9.firebaseapp.com",
  projectId: "plata-8f7a9",
  storageBucket: "plata-8f7a9.firebasestorage.app",
  messagingSenderId: "903145379096",
  appId: "1:903145379096:web:be37f5e51b61e539947a6d",
  measurementId: "G-NHW97SRX0Y"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Servicios disponibles para usar
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
