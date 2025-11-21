import admin from "firebase-admin";
import { readFileSync } from "fs";
import path from "path";

const servicePath = path.resolve("backend/src/config/serviceAccountKey.json");
const serviceAccount = JSON.parse(readFileSync(servicePath, "utf8"));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

export const db = admin.firestore();
export const authAdmin = admin.auth();
export default admin;
