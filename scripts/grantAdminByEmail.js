// CHECK_BUS/scripts/grantAdminByEmail.js
import admin from "../backend/src/config/firebase-admin.js";

// 👇 E-mail do usuário que será admin
const ADMIN_EMAIL = "staff@adm.com";

async function main() {
  try {
    const app = admin.app();
    console.log("Usando projeto Firebase:", app.options.projectId || "(ver credenciais)");

    // Busca o usuário pelo e-mail
    const user = await admin.auth().getUserByEmail(ADMIN_EMAIL);
    console.log("Usuário encontrado:");
    console.log(`📧 Email: ${user.email}`);
    console.log(`🆔 UID: ${user.uid}`);

    // Define a claim de administrador
    await admin.auth().setCustomUserClaims(user.uid, { admin: true });

    console.log(`✅ Claim { admin: true } aplicada com sucesso ao usuário ${user.email}`);
    console.log("ℹ️ Faça logout e login novamente no app para ativar as permissões.");
  } catch (err) {
    console.error("❌ Erro ao aplicar claim:", err);
  } finally {
    process.exit(0);
  }
}

main();
