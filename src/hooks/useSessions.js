// hooks/useSessions.js
import { useState, useEffect } from "react";
import { readSessions, upsertSession, subscribeSessions } from "../store/sessionStore";

export function useSessions(initialSession = null) {
  const [session, setSession] = useState(() => {
    // أولوية للـ localStorage (عشان لو الطالب ضاف نفسه في تاب تاني)
    const stored = Object.values(readSessions());
    if (stored.length > 0) return stored[0];

    if (!initialSession) return null;

    const normalized = {
      id:            initialSession.id            ?? `session-${Date.now()}`,
      code:          initialSession.code          ?? `S-${Date.now().toString().slice(-4)}`,
      questions:     initialSession.questions     ?? [],
      files:         initialSession.files         ?? [],
      students:      initialSession.students      ?? [],
      studentnumber: initialSession.studentnumber ?? 0,
      ...initialSession,
    };
    upsertSession(normalized);
    return normalized;
  });

  const [isUploading, setIsUploading] = useState(false);

  // كل تعديل في الـ session يتكتب في الـ store
  useEffect(() => {
    if (session) upsertSession(session);
  }, [session]);

  // اسمع لتغييرات من تاب تاني (طالب انضم)
  useEffect(() => {
    return subscribeSessions((all) => {
      const list = Object.values(all);
      if (list.length === 0) return;
      setSession((prev) => {
        if (!prev) return list[0];
        const fresh = list.find((s) => s.id === prev.id) ?? list[0];
        // مقارنة JSON بسيطة تمنع loops
        return JSON.stringify(prev) === JSON.stringify(fresh) ? prev : fresh;
      });
    });
  }, []);

  const saveSession = (data) => {
    setSession((prev) => ({
      id:            prev?.id            ?? `session-${Date.now()}`,
      code:          prev?.code          ?? `S-${Date.now().toString().slice(-4)}`,
      questions:     prev?.questions     ?? [],
      files:         prev?.files         ?? [],
      students:      prev?.students      ?? [],
      studentnumber: prev?.studentnumber ?? 0,
      ...prev,
      ...data,
    }));
  };

  const resetSession = () => setSession(null);

  const updateQuestions = (newQuestions) => {
    setSession((prev) => (prev ? { ...prev, questions: newQuestions } : prev));
  };

  const uploadFile = async (file) => {
    if (!file) return;
    setIsUploading(true);
    try {
      await new Promise((r) => setTimeout(r, 1500));
      const fileId = `file-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
      const aiQuestion = {
        id: `ai-${Date.now()}`,
        question: `سؤال ذكي مستخرج من ملف (${file.name}): ما الفكرة الأساسية؟`,
        options: ["الخيار الصحيح", "خيار 1", "خيار 2", "خيار 3"],
        correctAnswer: "الخيار الصحيح",
        correctOptionIndex: 0,
        source: "ai",
        sourceFileId: fileId,
        sourceFileName: file.name,
        type: "mcq",
      };
      setSession((prev) =>
        prev
          ? {
              ...prev,
              files: [...(prev.files || []), { id: fileId, name: file.name, url: `https://mock-storage.com/files/${file.name}` }],
              questions: [...(prev.questions || []), aiQuestion],
            }
          : prev
      );
    } catch (err) {
      console.error("Error uploading file:", err);
      alert("حصل خطأ أثناء رفع الملف");
    } finally {
      setIsUploading(false);
    }
  };

  const removeFile = (idx) => {
    setSession((prev) => {
      if (!prev) return prev;
      const fileToRemove = (prev.files || [])[idx];
      if (!fileToRemove) return prev;
      return {
        ...prev,
        files: (prev.files || []).filter((_, i) => i !== idx),
        questions: fileToRemove.id
          ? (prev.questions || []).filter((q) => q.sourceFileId !== fileToRemove.id)
          : prev.questions,
      };
    });
  };

  return {
    session, setSession, isUploading,
    saveSession, resetSession,
    updateQuestions, uploadFile, removeFile,
  };
}