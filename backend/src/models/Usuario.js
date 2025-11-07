// models/Usuario.js
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";

const db = getFirestore();
const usuariosRef = db.collection("usuarios");

/* Lista usuários por tipo */
export async function listarPorTipo(tipo) {
  const snap = await usuariosRef.where("tipoUsuario", "==", tipo).get();
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

/* Excluir usuário (Auth + Firestore + subcoleções) */
export async function excluirUsuario(id) {
  // 1. Deletar usuário do Auth
  try {
    await getAuth().deleteUser(id);
  } catch (e) {
    console.warn(`Usuário ${id} não encontrado no Auth.`);
  }

  // 2. Subcoleções conhecidas
  const subcolecoes = ["horarios", "rotas"];
  for (const sub of subcolecoes) {
    const snap = await usuariosRef.doc(id).collection(sub).get();
    const batch = db.batch();
    snap.docs.forEach((d) => batch.delete(d.ref));
    await batch.commit();
  }

  // 3. Documento final
  await usuariosRef.doc(id).delete();
}