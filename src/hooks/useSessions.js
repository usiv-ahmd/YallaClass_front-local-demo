// hooks/useSessions.js
import { useState, useEffect } from "react";
import {
  readSessions, subscribeSessions, hydrate,
  createSession, updateSession, deleteSession,
  replaceQuestions, uploadSessionFile, removeSessionFile,
  removeStudentFromSession, warnStudentForNameChange,
} from "../store/sessionStore";

export function useSessions() {
  const [session, setSession] = useState(() => Object.values(readSessions())[0] ?? null);
  const [isUploading, setIsUploading] = useState(false);

  // hydrate from backend once
  useEffect(() => { hydrate(); }, []);

  // sync from cache (server push / mock emit / other tabs)
  useEffect(() => subscribeSessions((all) => {
    const list = Object.values(all);
    if (list.length === 0) { setSession(null); return; }
    setSession((prev) => {
      if (!prev) return list[0];
      const fresh = list.find((s) => s.id === prev.id) ?? list[0];
      return JSON.stringify(prev) === JSON.stringify(fresh) ? prev : fresh;
    });
  }), []);

  const saveSession = async (data) => {
    try {
      const updated = session?.id
        ? await updateSession(session.id, data)
        : await createSession(data);
      if (updated?.id) setSession(updated);
      return updated;
    } catch (e) {
      console.error("[saveSession]", e);
      return null;
    }
  };

  const resetSession = async () => {
    try {
      if (session?.id) await deleteSession(session.id);
    } catch (e) { console.error("[resetSession]", e); }
    setSession(null);
  };

  const updateQuestions = async (nextQuestions) => {
    if (!session?.id) return null;
    try {
      const updated = await replaceQuestions(session.id, nextQuestions);
      if (updated?.id) setSession(updated);
      return updated;
    } catch (e) {
      console.error("[updateQuestions]", e);
      return null;
    }
  };

  const uploadFile = async (file) => {
    if (!file || !session?.id) return;
    setIsUploading(true);
    try {
      const res = await uploadSessionFile(session.id, file);
      if (res?.session?.id) setSession(res.session);
    } catch (e) {
      console.error("[uploadFile]", e);
      alert("حصل خطأ أثناء رفع الملف");
    } finally {
      setIsUploading(false);
    }
  };

  const removeFile = async (idx) => {
    const file = session?.files?.[idx];
    if (!file?.id || !session?.id) return;
    try {
      const updated = await removeSessionFile(session.id, file.id);
      if (updated?.id) setSession(updated);
    } catch (e) { console.error("[removeFile]", e); }
  };

  const removeStudent = async (studentId) => {
    if (!session?.id) return;
    try {
      const updated = await removeStudentFromSession(session.id, studentId);
      if (updated?.id) setSession(updated);
    } catch (e) { console.error("[removeStudent]", e); }
  };

  const warnStudentForNameChangeLocal = async (studentId) => {
    if (!session?.id) return;
    try {
      const updated = await warnStudentForNameChange(session.id, studentId);
      if (updated?.id) setSession(updated);
    } catch (e) { console.error("[warnStudentForNameChange]", e); }
  };

  return {
    session, setSession, isUploading,
    saveSession, resetSession,
    updateQuestions, uploadFile, removeFile,
    removeStudent,
    warnStudentForNameChange: warnStudentForNameChangeLocal,
  };
}