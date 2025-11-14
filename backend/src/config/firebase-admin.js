// backend/src/config/firebase-admin.js
import admin from "firebase-admin";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

dotenv.config();

/*
  ============================================================
  CARREGAMENTO SEGURO DAS CREDENCIAIS DO FIREBASE
  ============================================================
*/

function makeCredentials() {
  // 1) Variável de ambiente (Vercel)
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    try {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

      if (serviceAccount.private_key) {
        serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, "\n");
      }

      return admin.credential.cert(serviceAccount);
    } catch (e) {
      console.error("Erro ao carregar FIREBASE_SERVICE_ACCOUNT:", e);
    }
  }

  // 2) Carregar serviceAccountKey.json local
  try {
    const p = path.resolve(process.cwd(), "serviceAccountKey.json");

    if (fs.existsSync(p)) {
      const jsonData = JSON.parse(fs.readFileSync(p, "utf8"));
      return admin.credential.cert(jsonData);
    }
  } catch (e) {
    console.warn("Falha ao ler serviceAccountKey.json:", e);
  }

  // 3) Último fallback
  return admin.credential.applicationDefault();
}

/*
  ============================================================
  INICIALIZAÇÃO DO FIREBASE ADMIN
  ============================================================
*/

if (!admin.apps.length) {
  admin.initializeApp({
    credential: makeCredentials(),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || undefined
  });
}

/*
  ============================================================
  EXPORTAÇÕES
  ============================================================
*/

const dbAdmin = admin.firestore();
const storageAdmin = admin.storage();

/* 🔥 Compatibilidade com controllers antigos */
const db = dbAdmin;

export { admin, dbAdmin, db, storageAdmin };
export default admin;
