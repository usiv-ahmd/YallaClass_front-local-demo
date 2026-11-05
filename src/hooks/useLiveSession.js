// hooks/useLiveSession.js
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { liveOps } from "../store/sessionStore";

const LIVE_STATES = {
  lobby:     { label: "مستنيين البداية",  cls: "status-ready",    canGoTo: ["countdown"] },
  countdown: { label: "العدّ التمهيدي",   cls: "status-live",     canGoTo: ["question", "lobby"] },
  question:  { label: "السؤال شغّال",     cls: "status-live",     canGoTo: ["paused", "reveal", "finished"] },
  paused:    { label: "الحصة متوقفة",     cls: "status-paused",   canGoTo: ["question", "reveal", "finished"] },
  reveal:    { label: "مراجعة الإجابات",  cls: "status-reveal",   canGoTo: ["question", "finished"] },
  finished:  { label: "الجولة خلصت",      cls: "status-finished", canGoTo: ["reopened"] },
  reopened:  { label: "مفتوح للمتأخرين",  cls: "status-reveal",   canGoTo: ["finished"] },
};

export function useLiveSession(session, setSession) {
  const [isLive, setIsLive]                     = useState(session?.live?.isLive ?? false);
  const [liveState, setLiveState]               = useState(session?.live?.state ?? "lobby");
  const [currentQuestionIndex, setCurrentQIdx]  = useState(session?.live?.currentQuestionIndex ?? 0);
  const [isEndConfirmOpen, setIsEndConfirmOpen] = useState(false);
  const [reopenOpen, setReopenOpen]             = useState(false);
  const [now, setNow]                           = useState(() => Date.now());

  const sessionId = session?.id;

  // ── Derived questions ──────────────────────────
  const rawQuestions = session?.questions;
  const questions = Array.isArray(rawQuestions)
    ? rawQuestions
    : rawQuestions ? Object.values(rawQuestions) : [];
  const totalQuestions          = questions.length;
  const currentQuestion         = questions[currentQuestionIndex] ?? null;
  const currentQuestionDuration = Number(currentQuestion?.duration) || 30;
  const isLastQuestion          = currentQuestionIndex >= totalQuestions - 1;
  const statusView              = LIVE_STATES[liveState] ?? LIVE_STATES.lobby;
  const allowAnswerEdit         = session?.reopenedFor?.allowEdit ?? false;

  const students       = session?.students ?? [];
  const studentAnswers = session?.answers ?? {};

  // ── Tick while a question is live ──
  useEffect(() => {
    if (liveState !== "question") return;
    setNow(Date.now());
    const i = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(i);
  }, [liveState]);

  // ── timeLeft: derived from startedAt (backend-authoritative) ──
  const timeLeft = useMemo(() => {
    const live = session?.live;
    if (!live) return 0;
    if (live.state !== "question") return live.timeLeft ?? 0;
    if (!live.startedAt) return live.timeLeft ?? 0;
    const elapsed = Math.floor((now - live.startedAt) / 1000);
    return Math.max(0, currentQuestionDuration - elapsed);
  }, [session?.live, now, currentQuestionDuration]);

  // ── Sync local state من الـ session ──
  useEffect(() => {
    if (!session?.live) return;
    setIsLive(session.live.isLive ?? false);
    setLiveState(session.live.state ?? "lobby");
    setCurrentQIdx(session.live.currentQuestionIndex ?? 0);
  }, [session?.live?.isLive, session?.live?.state, session?.live?.currentQuestionIndex]);

  // ── Modals ──
  const reopenModal = useMemo(() => ({
    isOpen: reopenOpen,
    open:   () => setReopenOpen(true),
    close:  () => setReopenOpen(false),
  }), [reopenOpen]);

  // ── Student answered helpers ──
  const answeredCountFor = useCallback((studentId) => {
    const map = studentAnswers[studentId] ?? {};
    return questions.reduce((n, q) => n + (map[q.id] != null ? 1 : 0), 0);
  }, [studentAnswers, questions]);

  const isStudentFinished = useCallback((student) => {
    if (!student) return false;
    if (student.finishedAt) return true;
    if (totalQuestions === 0) return false;
    return answeredCountFor(student.id) >= totalQuestions;
  }, [answeredCountFor, totalQuestions]);

  const pendingStudents       = useMemo(() => students.filter((s) => !isStudentFinished(s)), [students, isStudentFinished]);
  const finishedStudentsCount = students.length - pendingStudents.length;

  // ── Guards ──
  const canTransitionTo = useCallback((target) =>
    (LIVE_STATES[liveState]?.canGoTo ?? []).includes(target), [liveState]);
  const canPause  = liveState === "question";
  const canResume = liveState === "paused";
  const canReveal = liveState === "question" || liveState === "paused";
  const canNext   = liveState === "reveal";
  const canFinish = liveState === "paused" || liveState === "reveal" ||
                   (liveState === "question" && isLastQuestion);

  // ── Sync helper ──
  const apply = (updated) => {
    if (!updated) return false;
    setSession(updated);
    if (updated.live) {
      setIsLive(updated.live.isLive ?? false);
      setLiveState(updated.live.state ?? "lobby");
      setCurrentQIdx(updated.live.currentQuestionIndex ?? 0);
    }
    return true;
  };

  // ── Transitions (كلها async) ──────────────────
  const startLiveSession = async () => {
    if (!session)             { alert("اعمل الحصة الأول."); return false; }
    if (totalQuestions === 0) { alert("ضيف سؤال واحد على الأقل."); return false; }
    return apply(await liveOps.start(sessionId));
  };

  const startCountdown  = async () => apply(await liveOps.startCountdown(sessionId));
  const cancelCountdown = async () => apply(await liveOps.cancelCountdown(sessionId));

  const startQuestion = async () => {
    if (!canTransitionTo("question")) return false;
    return apply(await liveOps.startQuestion(sessionId));
  };

  const pauseQuestion  = async () => apply(await liveOps.pauseQuestion(sessionId));
  const resumeQuestion = async () => apply(await liveOps.resumeQuestion(sessionId));
  const revealAnswer   = async () => apply(await liveOps.revealAnswer(sessionId));

  const nextQuestion = async () => {
    if (liveState !== "reveal") return false;
    if (isLastQuestion) return finishSession();
    return apply(await liveOps.nextQuestion(sessionId));
  };

  const finishSession = async () => apply(await liveOps.finishRound(sessionId));

  // ── Reopen / close-reopened ──
  const confirmReopen = async (allowEdit = false) => {
    if (liveState !== "finished" || pendingStudents.length === 0) return false;
    const ok = apply(await liveOps.reopen(sessionId, allowEdit));
    if (ok) setReopenOpen(false);
    return ok;
  };

  const closeReopenedRound = async () => {
    if (liveState !== "reopened") return false;
    return apply(await liveOps.closeReopened(sessionId));
  };

  const setAllowAnswerEdit = async (value) => apply(await liveOps.setAllowEdit(sessionId, value));

  // ── Auto-reveal لما الوقت يخلص (once per question) ──
  const revealedRef = useRef(-1);
  useEffect(() => {
    if (liveState !== "question") return;
    if (totalQuestions === 0) return;
    if (timeLeft > 0) return;
    if (revealedRef.current === currentQuestionIndex) return;
    revealedRef.current = currentQuestionIndex;
    revealAnswer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [liveState, timeLeft, totalQuestions, currentQuestionIndex]);

  // reset guard عند تغيير السؤال
  useEffect(() => {
    revealedRef.current = -1;
  }, [currentQuestionIndex]);

  // ── End live ──
  const requestEndLive = () => setIsEndConfirmOpen(true);
  const cancelEndLive  = () => setIsEndConfirmOpen(false);
  const confirmEndLive = async () => {
    apply(await liveOps.end(sessionId));
    setIsEndConfirmOpen(false);
    setReopenOpen(false);
  };

  const restartRound = () => {
    setCurrentQIdx(0);
    setLiveState("lobby");
  };

  // ── goToState: dispatcher (backward compat) ──
  const goToState = async (target) => {
    if (!canTransitionTo(target)) {
      console.warn(`[useLiveSession] Invalid transition: ${liveState} → ${target}`);
      return false;
    }
    switch (target) {
      case "countdown": return startCountdown();
      case "lobby":     return liveState === "countdown" ? cancelCountdown() : false;
      case "question":  return liveState === "paused" ? resumeQuestion() : startQuestion();
      case "paused":    return pauseQuestion();
      case "reveal":    return revealAnswer();
      case "finished":  return finishSession();
      default:          return false;
    }
  };

  return {
    isLive, liveSession: session, liveState, statusView,
    currentQuestion, currentQuestionIndex, totalQuestions, isLastQuestion,
    isEndConfirmOpen, timeLeft, currentQuestionDuration,

    students, pendingStudents, finishedStudentsCount,
    answeredCountFor, isStudentFinished,

    allowAnswerEdit, setAllowAnswerEdit,
    reopenModal, confirmReopen, closeReopenedRound,

    canTransitionTo, canPause, canResume, canReveal, canNext, canFinish,

    startLiveSession, startCountdown, cancelCountdown,
    startQuestion, pauseQuestion, resumeQuestion,
    revealAnswer, nextQuestion, finishSession,
    goToState, restartRound,

    requestEndLive, cancelEndLive, confirmEndLive,
  };
}