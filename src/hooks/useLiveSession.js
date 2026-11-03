// hooks/useLiveSession.js
import { useState, useEffect, useCallback, useMemo } from "react";

const LIVE_STATES = {
  lobby: {
    label: "مستنيين البداية",
    cls: "status-ready",
    canGoTo: ["countdown"],
  },
  countdown: {
    label: "العدّ التمهيدي",
    cls: "status-live",
    canGoTo: ["question", "lobby"],
  },
  question: {
    label: "السؤال شغّال",
    cls: "status-live",
    canGoTo: ["paused", "reveal"],
  },
  paused: {
    label: "الحصة متوقفة",
    cls: "status-paused",
    canGoTo: ["question", "reveal", "finished"],
  },
  reveal: {
    label: "مراجعة الإجابات",
    cls: "status-reveal",
    canGoTo: ["question", "finished"],
  },
  finished: {
    label: "الجولة خلصت",
    cls: "status-finished",
        canGoTo: ["reopened"],
  },
  reopened: {
    label: "مفتوح للمتأخرين",
    cls: "status-reveal",
    canGoTo: ["finished"],
  },
};

export function useLiveSession(sessionsList, setSessionsList) {
  const [isLive, setIsLive]                 = useState(false);
  const [liveSessionId, setLiveSessionId]   = useState(null);
  const [liveState, setLiveState]           = useState("lobby");
  const [currentQuestionIndex, setCurrentQIdx] = useState(0);
  const [isEndConfirmOpen, setIsEndConfirmOpen] = useState(false);
  const [timeLeft, setTimeLeft]                 = useState(0);

  // ── Derived ──────────────────────────────────────
  const liveSession = sessionsList.find((s) => s.id === liveSessionId) ?? null;
  const questions   = liveSession?.questions ?? [];
  const totalQuestions     = questions.length;
  const currentQuestion    = questions[currentQuestionIndex] ?? null;
  const currentQuestionDuration = Number(currentQuestion?.duration) || 30;
  const isLastQuestion     = currentQuestionIndex >= totalQuestions - 1;
  const statusView         = LIVE_STATES[liveState] ?? LIVE_STATES.lobby;

  const allowAnswerEdit = liveSession?.reopenedFor?.allowEdit ?? false;

  // ── Students / answers ───────────────────────────
  const students        = liveSession?.students ?? [];
  const studentAnswers  = liveSession?.answers ?? {};

  const answeredCountFor = useCallback(
    (studentId) => {
      const map = studentAnswers[studentId] ?? {};
      return questions.reduce((n, q) => n + (map[q.id] != null ? 1 : 0), 0);
    },
    [studentAnswers, questions]
  );

  const isStudentFinished = useCallback(
    (student) => {
      if (!student) return false;
      if (student.finishedAt) return true;
      if (totalQuestions === 0) return false;
      return answeredCountFor(student.id) >= totalQuestions;
    },
    [answeredCountFor, totalQuestions]
  );

  const pendingStudents = useMemo(
    () => students.filter((s) => !isStudentFinished(s)),
    [students, isStudentFinished]
  );
  const finishedStudentsCount = students.length - pendingStudents.length;

  // ── Guards ───────────────────────────────────────
  const canTransitionTo = useCallback(
    (target) => (LIVE_STATES[liveState]?.canGoTo ?? []).includes(target),
    [liveState]
  );

  const canPause   = liveState === "question";
  const canResume  = liveState === "paused";
  const canReveal  = liveState === "question" || liveState === "paused";
  const canNext    = liveState === "reveal";
  const canFinish  = liveState === "paused" || liveState === "reveal" ||
                    (liveState === "question" && isLastQuestion);

  // ── Core transition ──────────────────────────────
  const goToState = useCallback(
    (target) => {
      if (!canTransitionTo(target)) {
        console.warn(`[useLiveSession] Invalid transition: ${liveState} → ${target}`);
        return false;
      }
      setLiveState(target);
      return true;
    },
    [liveState, canTransitionTo]
  );

  // ── revealAnswer (قبل الـ effects) ─────────────
  const revealAnswer = useCallback(() => {
    if (!canReveal) return false;
    return goToState("reveal");
  }, [canReveal, goToState]);

  // ── Timer tick ──────────────────────────────────
  useEffect(() => {
    if (liveState !== "question") return;
    if (timeLeft <= 0) return;
    const t = setTimeout(() => setTimeLeft((v) => Math.max(0, v - 1)), 1000);
    return () => clearTimeout(t);
  }, [liveState, timeLeft]);

  // ── Auto-reveal لما الوقت يخلص ─────────────────
  useEffect(() => {
    if (liveState !== "question") return;
    if (timeLeft > 0) return;
    if (totalQuestions === 0) return;
    revealAnswer();
  }, [liveState, timeLeft, totalQuestions, revealAnswer]);

  // ── Lifecycle: بدء الجلسة ───────────────────────
  const startLiveSession = (sessionId) => {
    const target = sessionsList.find((s) => s.id === sessionId);
    if (!target)                       return false;
    if (target.status === "completed") { alert("الجلسة دي انتهت بالفعل."); return false; }
    if (target.status === "draft")     { alert("انشرها (Schedule) الأول."); return false; }
    if (!target.questions?.length)     { alert("ضيف سؤال واحد على الأقل."); return false; }

    setLiveSessionId(sessionId);
    setIsLive(true);
    setLiveState("lobby");
    setCurrentQIdx(0);
    setTimeLeft(0);
    return true;
  };

  // ── Transitions ─────────────────────────────────
  const startCountdown  = () => goToState("countdown");
  const cancelCountdown = () => goToState("lobby");

  const startQuestion = () => {
    if (!canTransitionTo("question")) return false;
    setTimeLeft(currentQuestionDuration);
    setLiveState("question");
    return true;
  };

  const pauseQuestion  = () => goToState("paused");
  const resumeQuestion = () => goToState("question");

  // ── السؤال التالي ─────────────────────────────────
  const nextQuestion = () => {
    if (liveState !== "reveal") return false;

    if (isLastQuestion) {
      finishSession();
      return true;
    }

    const nextIdx = currentQuestionIndex + 1;
    const nextQ   = questions[nextIdx];
    setCurrentQIdx(nextIdx);
    setTimeLeft(Number(nextQ?.duration) || 30);
    setLiveState("question");
    return true;
  };

  // ── إنهاء الجولة ─────────────────────────────────
  const finishSession = () => {
    if (liveState !== "finished") {
      if (!goToState("finished") && liveState !== "question") return false;
      setLiveState("finished");
    }
    if (liveSessionId) {
      setSessionsList((prev) =>
        prev.map((s) =>
          s.id === liveSessionId
            ? { ...s, status: "completed", endedAt: Date.now() }
            : s
        )
      );
    }
    return true;
  };

  // ── إعادة فتح الجولة للمتأخرين ──────────────────
  const confirmReopen = (allowEdit = false) => {
    if (liveState !== "finished") return false;
    if (pendingStudents.length === 0) return false;

    const studentIds = pendingStudents.map((s) => s.id);

    setSessionsList((prev) =>
      prev.map((s) =>
        s.id === liveSessionId
          ? { ...s, reopenedFor: { at: Date.now(), allowEdit, studentIds } }
          : s
      )
    );

    return goToState("reopened");
  };

  const closeReopenedRound = () => {
    if (liveState !== "reopened") return false;
    if (liveSessionId) {
      setSessionsList((prev) =>
        prev.map((s) =>
          s.id === liveSessionId ? { ...s, reopenedFor: null } : s
        )
      );
    }
    return goToState("finished");
  };

  const setAllowAnswerEdit = (value) => {
    if (!liveSessionId) return;
    setSessionsList((prev) =>
      prev.map((s) =>
        s.id === liveSessionId && s.reopenedFor
          ? { ...s, reopenedFor: { ...s.reopenedFor, allowEdit: value } }
          : s
      )
    );
  };

  // ── End confirmation ────────────────────────────
  const _endLiveSession = ({ markCompleted = false } = {}) => {
    if (liveSessionId) {
      setSessionsList((prev) =>
        prev.map((s) =>
          s.id === liveSessionId
            ? {
                ...s,
                ...(markCompleted ? { status: "completed", endedAt: Date.now() } : {}),
                reopenedFor: null,
              }
            : s
        )
      );
    }
    setLiveSessionId(null);
    setIsLive(false);
    setLiveState("lobby");
    setCurrentQIdx(0);
    setTimeLeft(0);
  };

  const requestEndLive = () => setIsEndConfirmOpen(true);
  const cancelEndLive  = () => setIsEndConfirmOpen(false);
  const confirmEndLive = (opts) => {
    _endLiveSession(opts);
    setIsEndConfirmOpen(false);
  };

  const restartRound = () => {
    setCurrentQIdx(0);
    setLiveState("lobby");
  };

  return {
    // state
    isLive,
    liveSession,
    liveSessionId,
    liveState,
    statusView,
    currentQuestion,
    currentQuestionIndex,
    totalQuestions,
    isLastQuestion,
    isEndConfirmOpen,

    // students / answers
    students,
    pendingStudents,
    finishedStudentsCount,
    answeredCountFor,
    isStudentFinished,

    // reopen
    allowAnswerEdit,
    setAllowAnswerEdit,
    confirmReopen,
    closeReopenedRound,

    // guards
    canTransitionTo,
    canPause,
    canResume,
    canReveal,
    canNext,
    canFinish,

    // transitions
    startLiveSession,
    startCountdown,
    cancelCountdown,
    startQuestion,
    pauseQuestion,
    resumeQuestion,
    revealAnswer,
    nextQuestion,
    finishSession,
    goToState,
    restartRound,

    // end
    requestEndLive,
    cancelEndLive,
    confirmEndLive,
    timeLeft,
    currentQuestionDuration,
  };
}