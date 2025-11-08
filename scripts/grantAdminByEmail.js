/**
 * scripts/grantAdminByEmail.js
 * Define { admin: true } para um usuário existente via e-mail.
 */

import admin from "firebase-admin";
import { readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 🔹 Caminho absoluto para o serviceAccountKey.json (um nível acima da pasta scripts)
const serviceAccountPath = path.resolve(__dirname, "../backend/serviceAccountKey.json");

// 🔹 Lê e inicializa o Firebase Admin
const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, "utf8"));
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://trancaeletronica-90835-default-rtdb.firebaseio.com",
});

async function main() {
  try {
    const email = "staff@adm.com"; // ✅ altere se quiser outro e-mail admin
    console.log(`🔍 Buscando usuário: ${email}`);

    const user = await admin.auth().getUserByEmail(email);
    console.log(`✅ Usuário encontrado: ${user.email}`);
    console.log(`🆔 UID: ${user.uid}`);

    // Aplica a permissão de admin
    await admin.auth().setCustomUserClaims(user.uid, { admin: true });
    console.log("🚀 Claim { admin: true } aplicada com sucesso!");

    const updated = await admin.auth().getUser(user.uid);
    console.log("📦 Claims atuais:", updated.customClaims || {});
  } catch (err) {
    console.error("❌ Erro ao aplicar claim:", err.message);
  }
}

main();
