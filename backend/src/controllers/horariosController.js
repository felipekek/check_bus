// backend/src/controllers/horariosController.js
import { db } from "../config/firebase-admin.js";
import { FieldValue } from "firebase-admin/firestore";

/* ===== Helpers ===== */
const YM_RE   = /^\d{4}-(0[1-9]|1[0-2])$/;                       // "2025-11"
const DATE_RE = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/; // "2025-11-03"

function nowTS() {
  return FieldValue.serverTimestamp ? FieldValue.serverTimestamp() : new Date();
}

async function mirrorMonthToLegacy(uid, mergedDays) {
  const resumoRef = db.collection("horarios").doc(uid).collection("listaHorarios");

  const antigos = await resumoRef.get();
  const deletions = antigos.docs.map((d) => d.ref.delete());
  if (deletions.length) await Promise.all(deletions);

  const novos = [];
  for (const [date, val] of Object.entries(mergedDays || {})) {
    if (val?.state === "going" && val?.schedule?.saida && val?.schedule?.chegada) {
      const titulo  = `${val.schedule.turno || "Turno"} (${date})`;
      const horario = `${val.schedule.saida}-${val.schedule.chegada}`;
      novos.push(resumoRef.add({ titulo, horario }));
    }
  }
  if (novos.length) await Promise.all(novos);
}

/* ===== V1 legado ===== */
export const salvarHorario = async (req, res) => {
  try {
    const { userId, titulo, horario, horarioId } = req.body;
    if (!userId || !titulo || !horario) {
      return res.status(400).json({ erro: "Dados incompletos." });
    }
    const listaRef = db.collection("horarios").doc(userId).collection("listaHorarios");

    if (horarioId) {
      await listaRef.doc(horarioId).set({ titulo, horario }, { merge: true });
      return res.json({ mensagem: "Horário editado com sucesso!" });
    } else {
      await listaRef.add({ titulo, horario });
      return res.json({ mensagem: "Horário salvo com sucesso!" });
    }
  } catch (err) {
    console.error("Erro salvarHorario:", err);
    return res.status(500).json({ erro: "Erro ao salvar horário." });
  }
};

export const listarHorarios = async (req, res) => {
  try {
    const { userId } = req.params;
    const snapshot = await db
      .collection("horarios").doc(userId)
      .collection("listaHorarios")
      .get();

    const horarios = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    res.json(horarios);
  } catch (err) {
    console.error("Erro listarHorarios:", err);
    res.status(500).json({ erro: "Erro ao listar horários." });
  }
};

export const excluirHorario = async (req, res) => {
  try {
    const { userId, horarioId } = req.body;
    if (!userId || !horarioId) {
      return res.status(400).json({ erro: "Parâmetros ausentes." });
    }

    await db
      .collection("horarios").doc(userId)
      .collection("listaHorarios").doc(horarioId)
      .delete();

    res.json({ mensagem: "Horário excluído com sucesso!" });
  } catch (err) {
    console.error("Erro excluirHorario:", err);
    res.status(500).json({ erro: "Erro ao excluir horário." });
  }
};

/* ===== V2 – Calendário por mês ===== */

export async function adminGetMonth(req, res) {
  try {
    const { ym } = req.params;
    if (!YM_RE.test(ym)) return res.status(400).json({ erro: "ym inválido." });

    const snap = await db.collection("calendars_admin").doc(ym).get();
    const data = snap.exists ? snap.data() : { days: {}, turnos: [] };

    res.json({
      ym,
      days: data.days || {},
      turnos: Array.isArray(data.turnos) ? data.turnos : []
    });
  } catch (err) {
    console.error("adminGetMonth:", err);
    res.status(500).json({ erro: "Falha ao buscar mês admin." });
  }
}

export async function adminSetMonth(req, res) {
  try {
    const { ym } = req.params;
    const { days, turnos } = req.body || {};

    if (!YM_RE.test(ym)) return res.status(400).json({ erro: "ym inválido." });
    if (!days || typeof days !== "object") {
      return res.status(400).json({ erro: "days ausente." });
    }

    const payload = {
      days,
      updatedAt: nowTS()
    };

    if (Array.isArray(turnos)) {
      payload.turnos = turnos;
    }

    const docRef = db.collection("calendars_admin").doc(ym);

    // 🔥 sem merge aqui também
    await docRef.set(payload);

    res.json({ mensagem: "Calendário admin atualizado.", ym });
  } catch (err) {
    console.error("adminSetMonth:", err);
    res.status(500).json({ erro: "Falha ao atualizar mês admin." });
  }
}

export async function userGetMonth(req, res) {
  try {
    const { uid, ym } = req.params;
    if (!uid) return res.status(400).json({ erro: "uid ausente." });
    if (!YM_RE.test(ym)) return res.status(400).json({ erro: "ym inválido." });

    const snap = await db
      .collection("calendars_user").doc(uid)
      .collection("months").doc(ym)
      .get();

    const data = snap.exists ? snap.data() : { days: {} };
    res.json({ uid, ym, days: data.days || {} });
  } catch (err) {
    console.error("userGetMonth:", err);
    res.status(500).json({ erro: "Falha ao buscar mês do usuário." });
  }
}

export async function userSetMonth(req, res) {
  try {
    const { uid, ym } = req.params;
    const { days } = req.body || {};

    if (!uid) return res.status(400).json({ erro: "uid ausente." });
    if (!YM_RE.test(ym)) return res.status(400).json({ erro: "ym inválido." });
    if (!days || typeof days !== "object") return res.status(400).json({ erro: "days ausente." });

    const docRef = db.collection("calendars_user").doc(uid).collection("months").doc(ym);

    // 🔥 sem merge
    await docRef.set({ days, updatedAt: nowTS() });

    await mirrorMonthToLegacy(uid, days);

    res.json({ mensagem: "Calendário do usuário salvo.", uid, ym });
  } catch (err) {
    console.error("userSetMonth:", err);
    res.status(500).json({ erro: "Falha ao salvar mês do usuário." });
  }
}

export async function userToggleDay(req, res) {
  try {
    const { uid, ym, date } = req.params;
    const { state, schedule } = req.body || {};

    if (!uid) return res.status(400).json({ erro: "uid ausente." });
    if (!YM_RE.test(ym)) return res.status(400).json({ erro: "ym inválido." });
    if (!DATE_RE.test(date)) return res.status(400).json({ erro: "date inválido." });

    const docRef = db.collection("calendars_user").doc(uid).collection("months").doc(ym);
    const snap = await docRef.get();
    const prev = snap.exists ? snap.data().days || {} : {};
    const next = { ...prev };

    if (state === "available") {
      delete next[date];
    } else {
      next[date] = { state, schedule };
    }

    // 🔥 sem merge
    await docRef.set({ days: next, updatedAt: nowTS() });

    await mirrorMonthToLegacy(uid, next);

    res.json({ mensagem: "Dia atualizado.", uid, ym, date });
  } catch (err) {
    console.error("userToggleDay:", err);
    res.status(500).json({ erro: "Falha ao atualizar dia." });
  }
}

export async function userCopyMonth(req, res) {
  try {
    const { uid, fromYm, toYm } = req.body || {};
    if (!uid) return res.status(400).json({ erro: "uid ausente." });
    if (!YM_RE.test(fromYm) || !YM_RE.test(toYm)) {
      return res.status(400).json({ erro: "fromYm/toYm inválidos." });
    }

    const fromSnap = await db
      .collection("calendars_user").doc(uid)
      .collection("months").doc(fromYm)
      .get();
    const fromDays = fromSnap.exists ? fromSnap.data().days || {} : {};

    const adminSnap = await db.collection("calendars_admin").doc(toYm).get();
    const adminDays = adminSnap.exists ? adminSnap.data().days || {} : {};

    const toRef = db.collection("calendars_user").doc(uid).collection("months").doc(toYm);
    const toSnap = await toRef.get();
    const prevTo = toSnap.exists ? toSnap.data().days || {} : {};
    const nextTo = { ...prevTo };

    for (const [date, val] of Object.entries(fromDays)) {
      if (val?.state === "going") {
        const curDate = date.replace(fromYm, toYm);
        const offer = adminDays[curDate] || "available";
        if (offer === "available") nextTo[curDate] = { ...val };
      }
    }

    // 🔥 sem merge
    await toRef.set({ days: nextTo, updatedAt: nowTS() });

    await mirrorMonthToLegacy(uid, nextTo);

    res.json({ mensagem: "Cópia realizada.", uid, fromYm, toYm });
  } catch (err) {
    console.error("userCopyMonth:", err);
    res.status(500).json({ erro: "Falha ao copiar mês." });
  }
}

export async function userClearMonth(req, res) {
  try {
    const { uid, ym } = req.params;
    if (!uid) return res.status(400).json({ erro: "uid ausente." });
    if (!YM_RE.test(ym)) return res.status(400).json({ erro: "ym inválido." });

    const docRef = db.collection("calendars_user").doc(uid).collection("months").doc(ym);

    await docRef.delete();
    await mirrorMonthToLegacy(uid, {});

    return res.json({ mensagem: "Mês do usuário apagado.", uid, ym });
  } catch (err) {
    console.error("userClearMonth:", err);
    return res.status(500).json({ erro: "Falha ao apagar mês do usuário." });
  }
}

export async function userDeleteDate(req, res) {
  try {
    const { uid, ym, date } = req.params;

    if (!uid) return res.status(400).json({ erro: "uid ausente." });
    if (!YM_RE.test(ym)) return res.status(400).json({ erro: "ym inválido." });
    if (!DATE_RE.test(date)) return res.status(400).json({ erro: "date inválido." });

    const docRef = db.collection("calendars_user").doc(uid).collection("months").doc(ym);
    const snap = await docRef.get();
    const prev = snap.exists ? snap.data().days || {} : {};

    if (!prev[date]) {
      return res.json({ mensagem: "Dia já estava ausente.", uid, ym, date });
    }

    const next = { ...prev };
    delete next[date];

    // 🔥 sem merge
    await docRef.set({ days: next, updatedAt: nowTS() });

    await mirrorMonthToLegacy(uid, next);

    res.json({ mensagem: "Dia excluído.", uid, ym, date });
  } catch (err) {
    console.error("userDeleteDate:", err);
    res.status(500).json({ erro: "Falha ao excluir dia." });
  }
}
