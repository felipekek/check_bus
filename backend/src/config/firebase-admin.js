// backend/src/config/firebase-admin.js
import admin from "firebase-admin";
import dotenv from "dotenv";
dotenv.config();

// O serviço vem do .env como string → então precisamos transformar em JSON
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

// Correção necessária: o private_key precisa dos \n reais
serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, "\n");

// Inicialização do Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export const db = admin.firestore();
export const authAdmin = admin.auth();
export default admin;
