// src/store/sessionStore.js
import { api, API } from "../services/api";
import { subscribeBroadcast } from "../services/api/mockStore";

const CACHE_KEY = "live-quiz:sessions-cache";
const EVENT     = "live-quiz:sessions-updated";

let cache = (() => {
  try { return JSON.parse(localStorage.getItem(CACHE_KEY) || "{}"); } catch { return {}; }
})();

function persist() { localStorage.setItem(CACHE_KEY, JSON.stringify(cache)); }
function emit()    { persist(); window.dispatchEvent(new CustomEvent(EVENT, { detail: cache })); }

function put(session) {
  if (!session?.id) return session;
  if (JSON.stringify(cache[session.id]) === JSON.stringify(session)) return session;
  cache[session.id] = session;
  emit();
  return session;
}

function drop(id) {
  if (!cache[id]) return;
  delete cache[id];
  emit();
}

export function readSessions() { return cache; }

// ── Subscription: CustomEvent (same-tab) + storage + BroadcastChannel (cross-tab) ──
export function subscribeSessions(cb) {
  const handler = (e) => {
    if (e?.detail && typeof e.detail === "object") {
      cache = e.detail;                        // CustomEvent / fresh payload
    } else {
      try {
        const fresh = JSON.parse(localStorage.getItem(CACHE_KEY) || "{}");
        if (fresh && typeof fresh === "object") cache = fresh;
      } catch {}
    }
    cb(cache);
  };

  const bcHandler = (data) => {
    if (data && typeof data === "object") {
      cache = data;
      cb(cache);
    }
  };

  window.addEventListener("storage", handler);
  window.addEventListener(EVENT,    handler);
  const unsubBc = subscribeBroadcast(bcHandler);

  return () => {
    window.removeEventListener("storage", handler);
    window.removeEventListener(EVENT,    handler);
    unsubBc();
  };
}

// ── Boot: ⚠️ ما نـ clobber ش data الـ cache وقتها ──
export async function hydrate() {
  try {
    if (API.useMock) {
      const { bootstrapMock } = await import("../services/api/mockBackend");
      await bootstrapMock();
    }
    const list = await api.sessions.list();
    // merge: نضيف الجديد بس، ما نلمسش اللي موجود (اللي جاله updates من events)
    const merged = { ...cache };
    for (const s of list) {
      if (!merged[s.id]) merged[s.id] = s;
    }
    cache = merged;
    emit();
  } catch (e) {
    console.error("[sessionStore] hydrate failed:", e);
  }
}

// ── Session lifecycle ─────────────────────────
export async function findSessionByCode(code) {
  const local = Object.values(cache).find(
    (s) => String(s.code ?? "").toLowerCase() === String(code ?? "").trim().toLowerCase()
  );
  if (local) return local;
  const s = await api.sessions.findByCode(code);
  return s ? put(s) : null;
}

export async function createSession(payload) {
  const s = await api.sessions.create(payload);
  return put(s);
}

export async function updateSession(sessionId, patch) {
  const s = await api.sessions.update(sessionId, patch);
  return put(s);
}

export async function deleteSession(sessionId) {
  await api.sessions.remove(sessionId);
  drop(sessionId);
}

export async function replaceQuestions(sessionId, questions) {
  const s = await api.sessions.replaceQuestions(sessionId, questions);
  return put(s);
}

export async function uploadSessionFile(sessionId, file) {
  const res = await api.sessions.uploadFile(sessionId, file);
  if (res?.session) put(res.session);
  return res;
}

export async function removeSessionFile(sessionId, fileId) {
  const s = await api.sessions.removeFile(sessionId, fileId);
  return put(s);
}

// ── Students ─────────────────────────────────
export async function addStudentToSession(sessionId, student) {
  const s = await api.students.join(sessionId, student);
  return put(s);
}

export async function updateStudent(sessionId, studentId, patch) {
  const s = await api.students.update(sessionId, studentId, patch);
  return put(s);
}

export async function removeStudentFromSession(sessionId, studentId) {
  const s = await api.students.remove(sessionId, studentId);
  return put(s);
}

export async function warnStudentForNameChange(sessionId, studentId) {
  const s = await api.students.warn(sessionId, studentId);
  return put(s);
}

export async function submitAnswer({ sessionId, studentId, questionId, selectedOption, timeLeft }) {
  const res = await api.students.submitAnswer(sessionId, {
    studentId, questionId, selectedOption, timeLeft,
  });
  if (res?.session) put(res.session);
  return res;
}

// ── Live transitions ─────────────────────────
const liveOp = (fn) => async (sessionId, ...args) => put(await fn(sessionId, ...args));

export const liveOps = {
  start:           liveOp(api.live.start),
  startCountdown:  liveOp(api.live.startCountdown),
  cancelCountdown: liveOp(api.live.cancelCountdown),
  startQuestion:   liveOp(api.live.startQuestion),
  pauseQuestion:   liveOp(api.live.pauseQuestion),
  resumeQuestion:  liveOp(api.live.resumeQuestion),
  revealAnswer:    liveOp(api.live.revealAnswer),
  nextQuestion:    liveOp(api.live.nextQuestion),
  finishRound:     liveOp(api.live.finishRound),
  reopen:          liveOp(api.live.reopenForPending),
  closeReopened:   liveOp(api.live.closeReopened),
  end:             liveOp(api.live.end),
  setAllowEdit:    liveOp(api.live.setAllowEdit),
};