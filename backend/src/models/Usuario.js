import { getFirestore } from "firebase-admin/firestore";

const db = getFirestore();
const usuariosRef = db.collection("usuarios");

/* Lista todos os motoristas */
export async function listarMotoristas() {
  const snapshot = await usuariosRef.where("tipoUsuario", "==", "motorista").get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

/* Exclui um motorista pelo ID do documento no Firestore */
export async function excluirMotorista(id) {
  await usuariosRef.doc(id).delete();
}

/* Lista todos os alunos */
export async function listarAlunos() {
  const snapshot = await usuariosRef.where("tipoUsuario", "==", "passageiro").get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

/* Exclui um aluno */
export async function excluirAluno(id) {
  await usuariosRef.doc(id).delete();
}
