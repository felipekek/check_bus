// =====================================
// CONTROLLER DE CONFIGURAÇÃO DE ROTAS
// =====================================
import { db } from "../config/firebase-admin.js";

export const ConfiguracoesRotasController = {
  
  // =====================================
  // Criar nova configuração de rota
  // =====================================
  async criar(req, res) {
    try {
      const {
        motoristaId,
        motoristaNome,
        onibusId,
        onibusNumero,
        turno,
        dias,
        rota
      } = req.body;

      // validações básicas
      if (!motoristaId || !onibusId || !turno || !dias || dias.length === 0 || !rota || rota.length === 0) {
        return res.status(400).json({ error: "Campos obrigatórios ausentes!" });
      }

      const doc = await db.collection("configuracoesRotas").add({
        motoristaId,
        motoristaNome,
        onibusId,
        onibusNumero,
        turno,
        dias,
        rota,
        ativo: true,
        criadoEm: new Date()
      });

      return res.status(201).json({
        message: "Configuração salva com sucesso!",
        id: doc.id
      });

    } catch (error) {
      console.error("Erro ao criar configuração:", error);
      return res.status(500).json({ error: "Erro ao salvar configuração." });
    }
  },

  // =====================================
  // Listar todas as configurações
  // =====================================
  async listar(req, res) {
    try {
      const snap = await db.collection("configuracoesRotas").get();
      const lista = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      return res.json(lista);
    } catch (error) {
      console.error("Erro ao listar configurações:", error);
      return res.status(500).json({ error: "Erro ao listar rotas." });
    }
  },

  // =====================================
  // Atualizar rota (editar)
  // =====================================
  async atualizar(req, res) {
    try {
      const { id } = req.params;
      const dados = req.body;

      await db.collection("configuracoesRotas").doc(id).update(dados);

      return res.json({ message: "Configuração atualizada!" });

    } catch (error) {
      console.error("Erro ao atualizar configuração:", error);
      return res.status(500).json({ error: "Erro ao atualizar rota." });
    }
  },

  // =====================================
  // Deletar configuração
  // =====================================
  async excluir(req, res) {
    try {
      const { id } = req.params;

      await db.collection("configuracoesRotas").doc(id).delete();

      return res.json({ message: "Configuração removida com sucesso!" });

    } catch (error) {
      console.error("Erro ao excluir configuração:", error);
      return res.status(500).json({ error: "Erro ao excluir rota." });
    }
  }
};
