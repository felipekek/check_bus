// CHECK_BUS/scripts/grantAdmin.js
import admin from "../backend/src/config/firebase-admin.js";

// 🔑 Substitua pelo UID do usuário que será admin
// (pegue o UID no Firebase Console → Authentication → Users)
const UID_ADMIN = "COLOQUE_AQUI_SEU_UID";

async function main() {
  try {
    await admin.auth().setCustomUserClaims(UID_ADMIN, { admin: true });
    console.log(`✅ Claim { admin: true } aplicada ao usuário UID: ${UID_ADMIN}`);
  } catch (err) {
    console.error("❌ Erro ao aplicar claim:", err);
  } finally {
    process.exit(0);
  }
}

main();
