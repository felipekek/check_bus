// backend/src/config/firebase-config.js
// Exporta a configuração e inicialização do Firebase para uso no backend (Node.js)

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Configuração do Firebase (mesma que você já tem no front)
const firebaseConfig = {
  apiKey: "AIzaSyDAG_nfsNFNk6ZnhTnC9Cci-N6L3Bui4PY",
  authDomain: "trancaeletronica-90835.firebaseapp.com",
  projectId: "trancaeletronica-90835",
  storageBucket: "trancaeletronica-90835.appspot.com",
  messagingSenderId: "566150115221",
  appId: "1:566150115221:web:1c6eaf30767894dbfd909c"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);

// Exporta autenticação e banco
export const auth = getAuth(app);
export const db = getFirestore(app);
