import { useMemo, useState } from "react";

export function useSessions(initialSessions = []) {
  const [sessionsList, setSessionsList] = useState(initialSessions);
  const [selectedId, setSelectedId]     = useState(null);
  const [search, setSearch]             = useState("");
  const [filterTab, setFilterTab]       = useState("all");
  const [isUploading, setIsUploading]   = useState(false);

  const selectedSession = sessionsList.find((session) => session.id === selectedId) ?? null;

  const filtered = useMemo(() => {
    return sessionsList.filter((session) => {
      const matchesSearch = session.title.toLowerCase().includes(search.toLowerCase());
      const matchesTab =
        filterTab === "all" ||
        (filterTab === "upcoming"  && session.status === "scheduled") ||
        (filterTab === "completed" && session.status === "completed") ||
        (filterTab === "draft"     && session.status === "draft");
      return matchesSearch && matchesTab;
    });
  }, [sessionsList, search, filterTab]);


  const stats = useMemo(() => ({
    scheduled: sessionsList.filter((session) => session.status === "scheduled").length,
    ended:     sessionsList.filter((session) => session.status === "completed").length,
    drafted:   sessionsList.filter((session) => session.status === "draft").length,
    all: sessionsList.filter((session) => session.status === "scheduled").length + sessionsList.filter((session) => session.status === "completed").length + sessionsList.filter((session) => session.status === "draft").length
  }), [sessionsList]);

  const createSession = (data) => {
    const newSession = {
      id: `session-${Date.now()}`,
      ...data,
      code: `session-${Date.now().toString().slice(-4)}`,
      studentnumber: "0",
      students: [],
      questions: [],
    };
    setSessionsList((prev) => [...prev, newSession]);
    setSelectedId(newSession.id);
    return newSession;
  };

  const updateSession = (id, data) => {
    setSessionsList((prev) =>
      prev.map((session) => (session.id === id ? { ...session, ...data } : session))
    );
  };

  const deleteSession = (id) => {
    setSessionsList((prev) => {
      const next = prev.filter((session) => session.id !== id);
      if (id === selectedId) setSelectedId(next[0]?.id ?? null);
      return next;
    });
  };

  const scheduleSession = (id) => {
    setSessionsList((prev) =>
      prev.map((session) => (session.id === id ? { ...session, status: "scheduled" } : session))
    );
  };

  // ── Questions ────────────────────────────────────
  const updateQuestions = (id, newQuestions) => {
    setSessionsList((prev) =>
      prev.map((session) => (session.id === id ? { ...session, questions: newQuestions } : session))
    );
  };

  // ── Files ────────────────────────────────────────
  const uploadFile = async (file, sessionId) => {
    if (!file || !sessionId) return;
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

      setSessionsList((prev) =>
        prev.map((session) => {
          if (session.id !== sessionId) return session;
          return {
            ...session,
            files: [...(session.files || []), { id: fileId, name: file.name, url: `https://mock-storage.com/files/${file.name}` }],
            questions: [...(session.questions || []), aiQuestion],
          };
        })
      );
    } catch (err) {
      console.error("Error uploading file:", err);
      alert("حصل خطأ أثناء رفع الملف");
    } finally {
      setIsUploading(false);
    }
  };

  const removeFile = (sessionId, idx) => {
    setSessionsList((prev) =>
      prev.map((session) => {
        if (session.id !== sessionId) return session;
        const fileToRemove = (session.files || [])[idx];
        if (!fileToRemove) return session;
        return {
          ...session,
          files: (session.files || []).filter((_, i) => i !== idx),
          questions: fileToRemove.id
            ? (session.questions || []).filter((q) => q.sourceFileId !== fileToRemove.id)
            : session.questions,
        };
      })
    );
  };

  return {
    sessionsList, setSessionsList,
    selectedId, setSelectedId,
    selectedSession,
    search, setSearch,
    filterTab, setFilterTab,
    isUploading,
    filtered, stats,
    createSession, updateSession, deleteSession, scheduleSession,
    updateQuestions, uploadFile, removeFile,
  };
}