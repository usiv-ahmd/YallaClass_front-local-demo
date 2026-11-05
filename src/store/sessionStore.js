// src/store/sessionStore.js
const KEY   = "live-quiz:sessions";
const EVENT = "live-quiz:sessions-updated";

export function readSessions() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "{}");
  } catch {
    return {};
  }
}

function writeSessions(sessions) {
  localStorage.setItem(KEY, JSON.stringify(sessions));
  // event مخصص للـ same-tab subscribers
  window.dispatchEvent(new CustomEvent(EVENT, { detail: sessions }));
}

export function upsertSession(session) {
  if (!session?.id) return;
  const all = readSessions();
  if (JSON.stringify(all[session.id]) === JSON.stringify(session)) return;
  all[session.id] = session;
  writeSessions(all);
}

export function findSessionByCode(code) {
  const target = String(code ?? "").trim().toLowerCase();
  if (!target) return null;
  const all = readSessions();
  return Object.values(all).find(
    (s) => String(s.code ?? "").toLowerCase() === target
  ) ?? null;
}

export function addStudentToSession(sessionId, student) {
  const all = readSessions();
  const session = all[sessionId];
  if (!session) return null;

  const students = Array.isArray(session.students) ? session.students : [];
  const already  = students.find(
    (s) => s.id === student.id ||
    s.name.trim().toLowerCase() === student.name.trim().toLowerCase()
  );
  if (already) return session;   // دخل قبل كده — مفيش تكرار

  const updated = {
    ...session,
    students: [...students, student],
    studentnumber: students.length + 1,
  };
  all[sessionId] = updated;
  writeSessions(all);
  return updated;
}

export function subscribeSessions(callback) {
  const handler = () => callback(readSessions());
  window.addEventListener("storage", handler);   // cross-tab
  window.addEventListener(EVENT,    handler);   // same-tab
  return () => {
    window.removeEventListener("storage", handler);
    window.removeEventListener(EVENT,    handler);
  };
}