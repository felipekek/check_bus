import admin from "firebase-admin";
import fs from "fs";
import path from "path";
import url from "url";

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

function makeCredentials() {
  // 1) Se GOOGLE_APPLICATION_CREDENTIALS apontar para um arquivo, use-o
  const gacPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (gacPath && fs.existsSync(gacPath)) {
    return admin.credential.cert(JSON.parse(fs.readFileSync(gacPath, "utf8")));
  }

  // 2) Se existir serviceAccountKey.json ao lado deste arquivo, use-o
  const serviceAccountPath = path.resolve(__dirname, "../../serviceAccountKey.json");
  if (fs.existsSync(serviceAccountPath)) {
    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));
    return admin.credential.cert(serviceAccount);
  }

  // 3) Fallback: Application Default Credentials (ex.: quando roda no GCP)
  return admin.credential.applicationDefault();
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: makeCredentials(),
  });
}

const db = admin.firestore();
export { admin, db };
export default admin;
