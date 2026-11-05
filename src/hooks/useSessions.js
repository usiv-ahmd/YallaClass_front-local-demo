// hooks/useSessions.js
import { useState, useEffect, useMemo, useCallback } from "react";
import {
  readSessions, readMySessions, subscribeSessions, hydrate,
  createSession, updateSession, deleteSession,
  replaceQuestions, uploadSessionFile, removeSessionFile,
  removeStudentFromSession, warnStudentForNameChange,
} from "../store/sessionStore";

export function useSessions() {
  const [sessions, setSessions] = useState(() => {
    try {
      return readMySessions() ?? [];
    } catch (e) {
      console.error("[useSessions.initial]", e);
      return [];
    }
  });
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => { 
    hydrate().catch(console.error); 
  }, []);

  useEffect(() => subscribeSessions(() => {
    try {
      setSessions(readMySessions() ?? []);
    } catch (e) {
      console.error("[useSessions.subscribe]", e);
    }
  }), []);

  const activeSession = useMemo(() => {
    if (!sessions?.length) return null;
    if (activeSessionId) {
      const found = sessions.find((s) => s.id === activeSessionId);
      if (found) return found;
    }
    return sessions[0] ?? null;
  }, [sessions, activeSessionId]);

  const setActiveSession = useCallback((idOrSession) => {
    const id = typeof idOrSession === "string" ? idOrSession : idOrSession?.id;
    setActiveSessionId(id ?? null);
  }, []);

  const setSession = useCallback((updatedOrFn) => {
    setSessions((prev) => {
      const safePrev = prev ?? [];
      const current = safePrev.find((s) => s.id === activeSessionId) ?? safePrev[0] ?? null;
      const updated = typeof updatedOrFn === "function" ? updatedOrFn(current) : updatedOrFn;
      if (!updated?.id) return safePrev;
      const idx = safePrev.findIndex((s) => s.id === updated.id);
      if (idx === -1) return [...safePrev, updated];
      const next = [...safePrev];
      next[idx] = updated;
      return next;
    });
  }, [activeSessionId]);

  const saveSession = async (data, opts = {}) => {
    try {
      const updated = (opts.isNew || !activeSession?.id)
        ? await createSession(data)
        : await updateSession(activeSession.id, data);
        
      if (updated?.id) {
        setSessions((prev) => {
          const safePrev = prev ?? [];
          const idx = safePrev.findIndex((s) => s.id === updated.id);
          if (idx === -1) return [...safePrev, updated];
          const next = [...safePrev];
          next[idx] = updated;
          return next;
        });
        setActiveSessionId(updated.id);
        return updated;
      }
      return null;
    } catch (e) {
      console.error("[useSessions.saveSession] Error:", e);
      return null;
    }
  };

  const resetSession = async () => {
    try {
      if (activeSession?.id) {
        await deleteSession(activeSession.id);
      }
      setSessions((prev) => (prev ?? []).filter((s) => s.id !== activeSession?.id));
      setActiveSessionId(null);
      return true;
    } catch (e) { 
      console.error("[useSessions.resetSession] Error:", e); 
      return false;
    }
  };

  const updateQuestions = async (nextQuestions) => {
    if (!activeSession?.id) return null;
    try {
      const updated = await replaceQuestions(activeSession.id, nextQuestions);
      if (updated?.id) setSession(updated);
      return updated;
    } catch (e) { 
      console.error("[useSessions.updateQuestions]", e); 
      return null; 
    }
  };

  const uploadFile = async (file) => {
    if (!file || !activeSession?.id) return;
    setIsUploading(true);
    try {
      const res = await uploadSessionFile(activeSession.id, file);
      if (res?.session?.id) setSession(res.session);
    } catch (e) { 
      console.error("[useSessions.uploadFile]", e); 
      alert("حصل خطأ أثناء رفع الملف"); 
    } finally { 
      setIsUploading(false); 
    }
  };

  const removeFile = async (idx) => {
    const file = activeSession?.files?.[idx];
    if (!file?.id || !activeSession?.id) return;
    try {
      const updated = await removeSessionFile(activeSession.id, file.id);
      if (updated?.id) setSession(updated);
    } catch (e) { console.error("[useSessions.removeFile]", e); }
  };

  const removeStudent = async (studentId) => {
    if (!activeSession?.id) return;
    try {
      const updated = await removeStudentFromSession(activeSession.id, studentId);
      if (updated?.id) setSession(updated);
    } catch (e) { console.error("[useSessions.removeStudent]", e); }
  };

  const warnStudentForNameChangeLocal = async (studentId) => {
    if (!activeSession?.id) return;
    try {
      const updated = await warnStudentForNameChange(activeSession.id, studentId);
      if (updated?.id) setSession(updated);
    } catch (e) { console.error("[useSessions.warnStudentForNameChange]", e); }
  };

  return {
    session: activeSession,
    sessions: sessions ?? [],
    setSession,
    setActiveSession,
    isUploading,

    saveSession,
    resetSession,
    updateQuestions,
    uploadFile,
    removeFile,
    removeStudent,
    warnStudentForNameChange: warnStudentForNameChangeLocal,
  };
}