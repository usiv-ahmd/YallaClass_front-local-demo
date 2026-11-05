// hooks/useLiveSession.js
import { useState, useEffect, useCallback, useMemo } from "react";

const LIVE_STATES = {
  lobby:     { label: "مستنيين البداية",   cls: "status-ready",    canGoTo: ["countdown"] },
  countdown: { label: "العدّ التمهيدي",    cls: "status-live",     canGoTo: ["question", "lobby"] },
  question:  { label: "السؤال شغّال",      cls: "status-live",     canGoTo: ["paused", "reveal", "finished"] },
  paused:    { label: "الحصة متوقفة",      cls: "status-paused",   canGoTo: ["question", "reveal", "finished"] },
  reveal:    { label: "مراجعة الإجابات",   cls: "status-reveal",   canGoTo: ["question", "finished"] },
  finished:  { label: "الجولة خلصت",       cls: "status-finished", canGoTo: ["reopened"] },
  reopened:  { label: "مفتوح للمتأخرين",   cls: "status-reveal",   canGoTo: ["finished"] },
};

export function useLiveSession(session, setSession) {
  const [isLive, setIsLive]                     = useState(false);
  const [liveState, setLiveState]               = useState("lobby");
  const [currentQuestionIndex, setCurrentQIdx]  = useState(0);
  const [isEndConfirmOpen, setIsEndConfirmOpen] = useState(false);
  const [timeLeft, setTimeLeft]                 = useState(0);

  // ── Derived ──────────────────────────────────────
  // ✅ FIX: وحّد شكل الأسئلة سواء array أو object
  const rawQuestions = session?.questions;
  const questions = Array.isArray(rawQuestions)
    ? rawQuestions
    : rawQuestions
      ? Object.values(rawQuestions)
      : [];

  const totalQuestions           = questions.length;
  const currentQuestion          = questions[currentQuestionIndex] ?? null;
  const currentQuestionDuration  = Number(currentQuestion?.duration) || 30;
  const isLastQuestion           = currentQuestionIndex >= totalQuestions - 1;
  const statusView               = LIVE_STATES[liveState] ?? LIVE_STATES.lobby;
  const allowAnswerEdit          = session?.reopenedFor?.allowEdit ?? false;

  const students       = session?.students ?? [];
  const studentAnswers = session?.answers ?? {};

  // ── Students / answers ───────────────────────────
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

  const canPause  = liveState === "question";
  const canResume = liveState === "paused";
  const canReveal = liveState === "question" || liveState === "paused";
  const canNext   = liveState === "reveal";
  const canFinish = liveState === "paused" || liveState === "reveal" ||
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

  // ── Lifecycle ────────────────────────────────────
  const startLiveSession = () => {
    if (!session)        { alert("اعمل الحصة الأول.");         return false; }
    if (totalQuestions === 0) { alert("ضيف سؤال واحد على الأقل."); return false; }
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

  const nextQuestion = () => {
    if (liveState !== "reveal") return false;
    if (isLastQuestion) { finishSession(); return true; }
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
      if (!goToState("finished")) return false;
    }
    return true;
  };

  // ── إعادة فتح الجولة للمتأخرين ──────────────────
  // ✅ FIX: بتقبل onSuccess callback عشان الـ caller يقفل المودال لما تنجح
  const confirmReopen = (allowEdit = false, onSuccess) => {
    if (liveState !== "finished" || pendingStudents.length === 0) return false;
    const studentIds = pendingStudents.map((s) => s.id);
    setSession((prev) =>
      prev ? { ...prev, reopenedFor: { at: Date.now(), allowEdit, studentIds } } : prev
    );
    const ok = goToState("reopened");
    if (ok && typeof onSuccess === "function") onSuccess();
    return ok;
  };

  const closeReopenedRound = () => {
    if (liveState !== "reopened") return false;
    setSession((prev) => (prev ? { ...prev, reopenedFor: null } : prev));
    return goToState("finished");
  };

  const setAllowAnswerEdit = (value) => {
    setSession((prev) =>
      prev?.reopenedFor
        ? { ...prev, reopenedFor: { ...prev.reopenedFor, allowEdit: value } }
        : prev
    );
  };

  // ── End confirmation ────────────────────────────
  const _endLiveSession = () => {
    setSession((prev) => (prev ? { ...prev, reopenedFor: null } : prev));
    setIsLive(false);
    setLiveState("lobby");
    setCurrentQIdx(0);
    setTimeLeft(0);
  };

  const requestEndLive = () => setIsEndConfirmOpen(true);
  const cancelEndLive  = () => setIsEndConfirmOpen(false);
  const confirmEndLive = () => {
    _endLiveSession();
    setIsEndConfirmOpen(false);
  };

  const restartRound = () => {
    setCurrentQIdx(0);
    setLiveState("lobby");
  };

  useEffect(() => {
    setSession((prev) => {
      if (!prev) return prev;
      const live = {
        isLive,
        state: liveState,
        currentQuestionIndex,
        timeLeft,
      };
      if (prev.live && JSON.stringify(prev.live) === JSON.stringify(live)) {
        return prev;
      }
      return { ...prev, live };
    });
  }, [isLive, liveState, currentQuestionIndex, timeLeft, setSession]);

  // ── Return ──────────────────────────────────────
  return {
    isLive,
    liveSession: session,
    liveState,
    statusView,
    currentQuestion,
    currentQuestionIndex,
    totalQuestions,
    isLastQuestion,
    isEndConfirmOpen,
    timeLeft,
    currentQuestionDuration,

    students,
    pendingStudents,
    finishedStudentsCount,
    answeredCountFor,
    isStudentFinished,

    allowAnswerEdit,
    setAllowAnswerEdit,
    confirmReopen,
    closeReopenedRound,

    canTransitionTo,
    canPause, canResume, canReveal, canNext, canFinish,

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

    requestEndLive,
    cancelEndLive,
    confirmEndLive,
  };
}