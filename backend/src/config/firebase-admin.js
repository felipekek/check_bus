// backend/src/config/firebase-admin.js
import admin from "firebase-admin";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

dotenv.config();

function makeCredentials() {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    try {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      if (serviceAccount.private_key) {
        serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, "\n");
      }
      return admin.credential.cert(serviceAccount);
    } catch (e) {
      console.error("Erro FIREBASE_SERVICE_ACCOUNT:", e);
    }
  }
  try {
    const p = path.resolve(process.cwd(), "serviceAccountKey.json");
    if (fs.existsSync(p)) {
      return admin.credential.cert(JSON.parse(fs.readFileSync(p, "utf8")));
    }
  } catch (e) {
    console.warn("Falha ao ler serviceAccountKey.json:", e);
  }
  return admin.credential.applicationDefault();
}

if (!admin.apps.length) {
  admin.initializeApp({ credential: makeCredentials() });
}
const db = admin.firestore();
export { admin, db };
export default admin;
