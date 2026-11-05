// src/services/api/mockBackend.js
import { readMock, writeMock, mockEmit } from "./mockStore";
import { getCurrentTeacherId } from "./auth";

const delay = (v) => new Promise((res) => setTimeout(() => res(v), 120));
const uid = (p) => `${p}-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`;

const getQ = (s) =>
  Array.isArray(s?.questions)
    ? s.questions
    : s?.questions
      ? Object.values(s.questions)
      : [];

const correctIdx = (q) =>
  Number.isInteger(q?.correctOptionIndex)
    ? q.correctOptionIndex
    : Array.isArray(q?.options) && typeof q?.correctAnswer === "string"
      ? q.options.indexOf(q.correctAnswer)
      : -1;

function recomputeStudent(student, answers, questions) {
  let score = 0, correct = 0, wrong = 0, streak = 0, highest = 0, answered = 0;
  for (const q of questions) {
    const a = answers[q.id];
    if (!a) continue;
    answered++;
    if (a.isCorrect) {
      score += a.points || 0;
      correct++;
      streak++;
      highest = Math.max(highest, streak);
    } else {
      wrong++;
      streak = 0;
    }
  }
  return {
    ...student,
    score,
    correctAnswers: correct,
    wrongAnswers: wrong,
    highestStreak: highest,
    currentStreak: streak,
    interacted: answered > 0,
    finishedAt:
      questions.length && answered >= questions.length
        ? (student.finishedAt ?? Date.now())
        : (student.finishedAt ?? null),
  };
}

const save = (session) => {
  const all = readMock();
  all[session.id] = session;
  writeMock(all);
  mockEmit(all);
  return session;
};

// ── Sessions ─────────────────────────────────
export const mockSessionsApi = {
  // ترجع جلسات المدرس الحالي بس — مع migration للجلسات القديمة اللي مفيهاش teacherId
  list: async () => {
    const me = getCurrentTeacherId();
    const all = readMock();
    let changed = false;
    for (const id of Object.keys(all)) {
      if (!all[id].teacherId) {
        all[id].teacherId = me;
        changed = true;
      }
    }
    if (changed) {
      writeMock(all);
      mockEmit(all);
    }
    return delay(Object.values(all).filter((s) => s.teacherId === me));
  },

  get: async (id) => delay(readMock()[id] ?? null),

  // البحث بالكود بيبقى global عشان الطالب ينضم لأي جلسة
  findByCode: async (code) => {
    const t = String(code ?? "").trim().toLowerCase();
    return delay(
      Object.values(readMock()).find(
        (s) => String(s.code ?? "").toLowerCase() === t
      ) ?? null
    );
  },

  create: async (payload) => {
    const me = getCurrentTeacherId();
    return delay(
      save({
        ...payload,
        id: payload.id ?? uid("session"),
        teacherId: payload.teacherId ?? me,
      })
    );
  },

  update: async (id, patch) => {
    const all = readMock();
    const s = all[id];
    if (!s) return delay(null);
    return delay(save({ ...s, ...patch }));
  },

  remove: async (id) => {
    const all = readMock();
    delete all[id];
    writeMock(all);
    mockEmit(all);
    return delay({ ok: true });
  },

  replaceQuestions: async (id, questions) => {
    const all = readMock();
    const s = all[id];
    if (!s) return delay(null);
    return delay(save({ ...s, questions }));
  },
  addQuestion: async (id, q) => {
    const all = readMock();
    const s = all[id];
    if (!s) return delay(null);
    return delay(save({ ...s, questions: [...getQ(s), q] }));
  },
  updateQuestion: async (id, qid, patch) => {
    const all = readMock();
    const s = all[id];
    if (!s) return delay(null);
    return delay(
      save({
        ...s,
        questions: getQ(s).map((q) => (q.id === qid ? { ...q, ...patch } : q)),
      })
    );
  },
  removeQuestion: async (id, qid) => {
    const all = readMock();
    const s = all[id];
    if (!s) return delay(null);
    return delay(save({ ...s, questions: getQ(s).filter((q) => q.id !== qid) }));
  },

  uploadFile: async (id, file) => {
    const all = readMock();
    const s = all[id];
    if (!s) return delay(null);
    const fileId = uid("file");
    const aiQ = {
      id: uid("ai"),
      question: `سؤال من ${file.name}: ما الفكرة الأساسية؟`,
      options: ["الخيار الصحيح", "خيار 1", "خيار 2", "خيار 3"],
      correctAnswer: "الخيار الصحيح",
      correctOptionIndex: 0,
      source: "ai",
      sourceFileId: fileId,
      sourceFileName: file.name,
      type: "mcq",
      duration: 30,
    };
    const updated = save({
      ...s,
      files: [...(s.files || []), { id: fileId, name: file.name, url: `mock://${file.name}` }],
      questions: [...getQ(s), aiQ],
    });
    return delay({ file: updated.files.at(-1), session: updated });
  },
  removeFile: async (id, fid) => {
    const all = readMock();
    const s = all[id];
    if (!s) return delay(null);
    return delay(
      save({
        ...s,
        files: (s.files || []).filter((f) => f.id !== fid),
        questions: getQ(s).filter((q) => q.sourceFileId !== fid),
      })
    );
  },
};

// ── Students ─────────────────────────────────
export const mockStudentsApi = {
  join: async (sessionId, student) => {
    const all = readMock();
    const s = all[sessionId];
    if (!s) return delay(null);
    const existing = (s.students || []).find(
      (x) =>
        x.id === student.id ||
        x.name.trim().toLowerCase() === student.name.trim().toLowerCase()
    );
    if (existing) return delay(s);
    return delay(
      save({
        ...s,
        students: [...(s.students || []), student],
        studentnumber: (s.students?.length ?? 0) + 1,
      })
    );
  },
  update: async (sessionId, studentId, patch) => {
    const all = readMock();
    const s = all[sessionId];
    if (!s) return delay(null);
    return delay(
      save({
        ...s,
        students: (s.students || []).map((x) =>
          x.id === studentId ? { ...x, ...patch } : x
        ),
      })
    );
  },
  remove: async (sessionId, studentId) => {
    const all = readMock();
    const s = all[sessionId];
    if (!s) return delay(null);
    const answers = { ...(s.answers || {}) };
    delete answers[studentId];
    return delay(
      save({
        ...s,
        students: (s.students || []).filter((x) => x.id !== studentId),
        answers,
      })
    );
  },
  warn: async (sessionId, studentId) => {
    const all = readMock();
    const s = all[sessionId];
    if (!s) return delay(null);
    return delay(
      save({
        ...s,
        students: (s.students || []).map((x) =>
          x.id === studentId ? { ...x, warnedForNameChangeAt: Date.now() } : x
        ),
      })
    );
  },

  submitAnswer: async (sessionId, { studentId, questionId, selectedOption, timeLeft }) => {
    const all = readMock();
    const s = all[sessionId];
    if (!s) return delay(null);
    const q = getQ(s).find((x) => x.id === questionId);
    if (!q) return delay(null);

    const live = s.live || {};
    const alreadyAnswered = Boolean(s.answers?.[studentId]?.[questionId]);
    if (live.state === "question" && alreadyAnswered) return delay(null);
    if (live.state === "reopened") {
      const allowed = s.reopenedFor?.studentIds?.includes(studentId);
      const allowEdit = s.reopenedFor?.allowEdit;
      if (!allowed || (alreadyAnswered && !allowEdit)) return delay(null);
    } else if (live.state !== "question") {
      return delay(null);
    }

    const ci = correctIdx(q);
    const isCorrect = selectedOption === ci;
    const speedBonus = isCorrect ? Math.max(0, Math.round((timeLeft || 0) * 5)) : 0;
    const points = isCorrect ? 100 + speedBonus : 0;

    const answer = {
      questionId,
      selectedOption,
      isCorrect,
      points,
      speedBonus,
      kind: isCorrect ? "correct" : "wrong",
      answeredAt: Date.now(),
    };

    const prev = s.answers?.[studentId] || {};
    const next = { ...prev, [questionId]: answer };
    const students = (s.students || []).map((x) =>
      x.id === studentId ? recomputeStudent(x, next, getQ(s)) : x
    );
    const updated = save({
      ...s,
      answers: { ...(s.answers || {}), [studentId]: next },
      students,
    });
    return delay({ session: updated, answer });
  },
};

// ── Live transitions ────────────────────────
const live = (next) => async (sessionId) => {
  const all = readMock();
  const s = all[sessionId];
  if (!s) return delay(null);
  return delay(save({ ...s, live: { ...(s.live || {}), ...next(s) } }));
};

export const mockLiveApi = {
  start: live(() => ({
    isLive: true,
    state: "lobby",
    currentQuestionIndex: 0,
    timeLeft: 0,
    startedAt: null,
    pausedAt: null,
    autoAdvance: true,
  })),
  startCountdown:  live(() => ({ state: "countdown" })),
  cancelCountdown: live(() => ({ state: "lobby" })),

  startQuestion: async (sessionId) => {
    const all = readMock();
    const s = all[sessionId];
    if (!s) return delay(null);
    const idx = s.live?.currentQuestionIndex ?? 0;
    const q = getQ(s)[idx];
    const duration = Number(q?.duration) || 30;
    return delay(
      save({
        ...s,
        live: {
          ...(s.live || {}),
          state: "question",
          currentQuestionIndex: idx,
          timeLeft: duration,
          startedAt: Date.now(),
          pausedAt: null,
        },
      })
    );
  },

  pauseQuestion: async (sessionId) => {
    const all = readMock();
    const s = all[sessionId];
    if (!s?.live) return delay(null);
    const idx = s.live.currentQuestionIndex ?? 0;
    const q = getQ(s)[idx];
    const duration = Number(q?.duration) || 30;
    const elapsed = s.live.startedAt
      ? Math.floor((Date.now() - s.live.startedAt) / 1000)
      : 0;
    const remaining = Math.max(0, duration - elapsed);
    return delay(
      save({
        ...s,
        live: { ...s.live, state: "paused", timeLeft: remaining, pausedAt: Date.now() },
      })
    );
  },

  resumeQuestion: async (sessionId) => {
    const all = readMock();
    const s = all[sessionId];
    if (!s?.live) return delay(null);
    const idx = s.live.currentQuestionIndex ?? 0;
    const q = getQ(s)[idx];
    const duration = Number(q?.duration) || 30;
    const remaining = s.live.timeLeft ?? duration;
    const newStartedAt = Date.now() - (duration - remaining) * 1000;
    return delay(
      save({
        ...s,
        live: { ...s.live, state: "question", startedAt: newStartedAt, pausedAt: null },
      })
    );
  },

  revealAnswer: live(() => ({ state: "reveal" })),

  nextQuestion: async (sessionId) => {
    const all = readMock();
    const s = all[sessionId];
    if (!s) return delay(null);
    const idx = (s.live?.currentQuestionIndex ?? 0) + 1;
    const q = getQ(s)[idx];
    const duration = Number(q?.duration) || 30;
    return delay(
      save({
        ...s,
        live: {
          ...(s.live || {}),
          state: "question",
          currentQuestionIndex: idx,
          timeLeft: duration,
          startedAt: Date.now(),
          pausedAt: null,
        },
      })
    );
  },

  finishRound: live(() => ({ state: "finished" })),

  reopenForPending: async (sessionId, allowEdit = false) => {
    const all = readMock();
    const s = all[sessionId];
    if (!s) return delay(null);
    return delay(
      save({
        ...s,
        live: { ...(s.live || {}), state: "reopened" },
        reopenedFor: {
          at: Date.now(),
          allowEdit,
          studentIds: (s.students || []).map((x) => x.id),
        },
      })
    );
  },

  closeReopened: async (sessionId) => {
    const all = readMock();
    const s = all[sessionId];
    if (!s) return delay(null);
    return delay(
      save({
        ...s,
        live: { ...(s.live || {}), state: "finished" },
        reopenedFor: null,
      })
    );
  },

  end: async (sessionId) => {
    const all = readMock();
    const s = all[sessionId];
    if (!s) return delay(null);
    return delay(
      save({
        ...s,
        live: {
          isLive: false,
          state: "lobby",
          currentQuestionIndex: 0,
          timeLeft: 0,
          startedAt: null,
          pausedAt: null,
        },
        reopenedFor: null,
      })
    );
  },

  setAllowEdit: async (sessionId, allowEdit) => {
    const all = readMock();
    const s = all[sessionId];
    if (!s) return delay(null);
    return delay(
      save({
        ...s,
        reopenedFor: s.reopenedFor ? { ...s.reopenedFor, allowEdit } : null,
      })
    );
  },

  setAutoAdvance: async (sessionId, autoAdvance) => {
    const all = readMock();
    const s = all[sessionId];
    if (!s) return delay(null);
    return delay(
      save({
        ...s,
        live: { ...(s.live || {}), autoAdvance: !!autoAdvance },
      })
    );
  },
  
};



// ── Seed أول مرة — نـ stamp المدرس الحالي ─────────
export async function bootstrapMock() {
  const all = readMock();
  if (Object.keys(all).length > 0) return;
  try {
    const { initialMockData } = await import("../../mock/mockData.js");
    const seed = initialMockData?.session;
    if (seed?.id) {
      const withTeacher = { ...seed, teacherId: getCurrentTeacherId() };
      writeMock({ [seed.id]: withTeacher });
      mockEmit({ [seed.id]: withTeacher });
    }
  } catch (e) {
    console.warn("[mockBackend] bootstrapMock skipped:", e?.message);
  }
}