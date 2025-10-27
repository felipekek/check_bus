import admin from "firebase-admin";
import fs from "fs";
import path from "path";

const serviceAccountPath = path.resolve("serviceAccountKey.json");
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

export { admin, db };
export default admin;
