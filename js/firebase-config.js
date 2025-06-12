// firebase-config.js
// Exporta a configuração e inicialização do Firebase para uso nos outros arquivos.

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDAG_nfsNFNk6ZnhTnC9Cci-N6L3Bui4PY",
  authDomain: "trancaeletronica-90835.firebaseapp.com",
  projectId: "trancaeletronica-90835",
  storageBucket: "trancaeletronica-90835.appspot.com",
  messagingSenderId: "566150115221",
  appId: "1:566150115221:web:1c6eaf30767894dbfd909c"
};

// Inicializa Firebase e exporta para uso global
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
