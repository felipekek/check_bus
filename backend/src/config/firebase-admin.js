import admin from "firebase-admin";
import dotenv from "dotenv";

dotenv.config();

if (!admin.apps.length) {
  let serviceAccount;

  try {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

    if (serviceAccount.private_key) {
      serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, "\n");
    }
  } catch (err) {
    console.error("Erro ao carregar FIREBASE_SERVICE_ACCOUNT:", err);
  }

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

export const dbAdmin = admin.firestore();
export const authAdmin = admin.auth();
export default admin;
