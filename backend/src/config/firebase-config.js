import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDAG_nfsNFNk6ZnhTnC9Cci-N6L3Bui4PY",
  authDomain: "trancaeletronica-90835.firebaseapp.com",
  projectId: "trancaeletronica-90835",
  storageBucket: "trancaeletronica-90835.appspot.com",
  messagingSenderId: "566150115221",
  appId: "1:566150115221:web:1c6eaf30767894dbfd909c",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
