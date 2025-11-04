// backend/src/config/firebase-admin.js
import admin from "firebase-admin";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

dotenv.config();

/**
 * Cria as credenciais do Firebase a partir do .env ou arquivo local.
 */
function makeCredentials() {
  // 1️⃣ Se existir a variável FIREBASE_SERVICE_ACCOUNT no .env, usa ela
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    try {
      // Converte a string JSON do .env em objeto
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

      // Corrige o formato da chave privada (remove escapes \n)
      if (serviceAccount.private_key) {
        serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, "\n");
      }

      return admin.credential.cert(serviceAccount);
    } catch (err) {
      console.error("❌ Erro ao interpretar FIREBASE_SERVICE_ACCOUNT do .env:", err);
    }
  }

  // 2️⃣ Caso contrário, tenta achar o arquivo local (para ambiente de desenvolvimento)
  try {
    const serviceAccountPath = path.resolve(process.cwd(), "serviceAccountKey.json");
    if (fs.existsSync(serviceAccountPath)) {
      const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));
      return admin.credential.cert(serviceAccount);
    } else {
      console.warn("⚠️ serviceAccountKey.json não encontrado no projeto.");
    }
  } catch (e) {
    console.warn("⚠️ Falha ao ler serviceAccountKey.json:", e);
  }

  // 3️⃣ Fallback: Application Default Credentials (para GCP, etc.)
  return admin.credential.applicationDefault();
}

// Inicializa o Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: makeCredentials(),
  });
}

const db = admin.firestore();
export { admin, db };
export default admin;
