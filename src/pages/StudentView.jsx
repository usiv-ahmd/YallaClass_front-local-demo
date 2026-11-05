// src/pages/StudentView.jsx
import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  KeyRound, ArrowLeft, AlertCircle, Check, Clock3, Zap, Flame,
  X, Sparkles, Trophy, Users, ListChecks, Timer,
  TrendingUp,
  CheckCircle,
} from "lucide-react";
import {
  findSessionByCode,
  addStudentToSession,
  subscribeSessions,
  updateStudent,
  submitAnswer,
} from "../store/sessionStore";
import { useCountdown } from "../hooks/useCountdown.js";
import { Reaction } from "../Components/Reactions.jsx";
import { pickReaction, pickStateReaction } from "../utils/pickReaction";
import "../styles/student-page.css";
import "../styles/reactions.css";

const ANSWER_LABELS = ["أ", "ب", "ج", "د", "هـ", "و"];
const ANSWER_COLORS = ["turquoise", "yellow", "blue", "red"];

// كل 20 ثانية نبعت "أنا موجود" — المدرس بيعتبر الطالب online لو آخر seen أقل من 45 ثانية
const HEARTBEAT_INTERVAL_MS = 20_000;

const formatNumber = (n) => Number(n || 0).toLocaleString("en-US");

function getQuestions(session) {
  const raw = session?.questions;
  if (!raw) return [];
  return Array.isArray(raw) ? raw : Object.values(raw);
}

function getCorrectIndex(question) {
  if (Number.isInteger(question?.correctOptionIndex)) return question.correctOptionIndex;
  if (Array.isArray(question?.options) && typeof question?.correctAnswer === "string") {
    return question.options.indexOf(question.correctAnswer);
  }
  return -1;
}

// ─────────────────────────────────────────────
//  Name Change Warning Modal
// ─────────────────────────────────────────────
function NameChangeWarning({ currentName, onSave, onLeave }) {
  const [newName, setNewName] = useState("");
  const [error, setError]     = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = newName.trim();
    if (trimmed.length < 2) {
      return setError("اكتب اسم جديد (حرفين على الأقل)");
    }
    if (trimmed.toLowerCase() === currentName.trim().toLowerCase()) {
      return setError("الاسم الجديد لازم يكون مختلف عن القديم");
    }
    onSave(trimmed);
  };

  return (
    <div className="opened-window-backdrop" role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <section className="card modal-window" role="dialog" aria-modal="true" aria-labelledby="name-warning-title">
        <div className="card-heading">
          <div className="card-heading-title">
            <div className="card-icon red"><AlertCircle size={22} /></div>
            <div>
              <h2 className="modal-title">اسمك مخالف</h2>
            </div>
          </div>
          <button className="modal-close-button" type="button" onClick={onLeave} aria-label="إغلاق">
            <X size={17} />
          </button>
        </div>

        <form className="modal-content" onSubmit={handleSubmit}>
          <p>
            المدرس بعتلك تحذير إن اسمك الحالي <b>«{currentName}»</b> مخالف.
            لازم تغيّره عشان تكمل في الحصة.
          </p>

          <form onSubmit={handleSubmit} className="name-warning-form" noValidate>
            <label htmlFor="session-code">اسمك الجديد</label>
            <div className="input-wrap">
              <input type="text" autoFocus required maxLength={24} value={newName} onChange={(e) => { setNewName(e.target.value); setError(""); }} placeholder="اكتب اسمك الجديد" />
            </div>
            {error && (
              <p className="error-alert">
                <AlertCircle size={14} /> {error}
              </p>
            )}
          </form>


          <div className="modal-actions">
            <button className="button modal-button white" type="button" onClick={onLeave}>
              خروج من الحصة
            </button>
            
            <button className="button modal-button turquoise" type="submit">
              <CheckCircle size={16} />
              احفظ الاسم الجديد
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

// ─────────────────────────────────────────────
//  Question Panel
// ─────────────────────────────────────────────
function QuestionPanel({
  question,
  index,
  total,
  answer,
  timeLeft,
  duration,
  onChoose,
  readOnly = false,
  heat = 0,
}) {
  const progress = duration > 0 ? Math.max(0, Math.min(1, timeLeft / duration)) : 0;
  const timerMood = progress <= 0.25 ? "is-danger" : progress <= 0.5 ? "is-warning" : "";

  return (
    <div className="student-question" data-heat={Math.min(4, heat)}>
      <div className="question-meta-row">
        <span className="mini-label">سؤال {formatNumber(index + 1)} من {formatNumber(total)}</span>
        <div className="question-stats">
          <span className="stat-chip">
            <Clock3 size={16} /> {formatNumber(Math.ceil(timeLeft))} <small>ث</small>
          </span>
        </div>
      </div>

      <div className="question-progress">
        {Array.from({ length: total }, (_, i) => (
          <span
            key={i}
            className={
              "question-progress__step" +
              (i < index ? " is-done" : "") +
              (i === index ? " is-current" : "")
            }
          />
        ))}
      </div>

      <div className="question-main-row">
        <div className="question-copy">
          <h2>{question.text ?? question.question}</h2>
        </div>
        <div
          className={`timer-ring ${timerMood}`}
          style={{ "--timer-angle": `${progress * 360}deg` }}
          role="timer"
        >
          <div className="timer-ring__inner">
            <Clock3 size={15} />
            <strong>{formatNumber(Math.ceil(timeLeft))}</strong>
            <small>ث</small>
          </div>
        </div>
      </div>

      <div className="answer-prompt">
        <Sparkles size={18} /> <span>اختار إجابتك</span>
      </div>

      <div className="answer-grid">
        {(question.options || []).map((option, optIndex) => {
          const isCorrectOption = optIndex === getCorrectIndex(question);
          const isSelected = answer?.selectedOption === optIndex;
          let stateClass = "";

          if (answer) {
            if (isCorrectOption) stateClass = " answer-option--correct";
            if (isSelected && !answer.isCorrect) stateClass = " answer-option--wrong";
            if (!isCorrectOption && !isSelected) stateClass = " answer-option--muted";
          } else if (readOnly) {
            if (isCorrectOption) stateClass = " answer-option--correct";
            else stateClass = " answer-option--muted";
          }

          return (
            <button
              key={optIndex}
              type="button"
              disabled={Boolean(answer) || readOnly}
              className={`answer-option answer-option--${
                ANSWER_COLORS[optIndex % ANSWER_COLORS.length]
              }${stateClass}`}
              onClick={() => onChoose(optIndex)}
            >
              <span className="answer-option__key">
                {answer && isCorrectOption ? <Check size={19} strokeWidth={3} /> : null}
                {answer && isSelected && !answer.isCorrect ? <X size={19} strokeWidth={3} /> : null}
                {!answer || (!isCorrectOption && !isSelected) ? ANSWER_LABELS[optIndex] : null}
              </span>
              <span className="answer-option__text">{option}</span>
            </button>
          );
        })}
      </div>

      {answer && (
        <div
          className={`answer-result ${
            answer.isCorrect ? "answer-result--good" : "answer-result--retry"
          }`}
          role="status"
        >
          <span className="answer-result__icon">
            {answer.isCorrect ? <Check size={20} /> : <Sparkles size={19} />}
          </span>
          <span>
            <strong>
              {answer.isCorrect
                ? `إجابة صحيحة! +${formatNumber(answer.points)} نقطة`
                : "إجابة غلط"}
            </strong>
            {answer.isCorrect && answer.speedBonus > 0 && (
              <small>+{formatNumber(answer.speedBonus)} مكافأة سرعة</small>
            )}
            {!answer.isCorrect && (
              <small>
                الإجابة الصحيحة: {question.options?.[getCorrectIndex(question)]}
              </small>
            )}
          </span>
        </div>
      )}

      {readOnly && !answer && (
        <p className="muted" style={{ textAlign: "center", marginTop: 12 }}>
          الوقت خلص. الإجابة الصحيحة: {question.options?.[getCorrectIndex(question)]}
        </p>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
//  Reopened view — سؤال واحد في المرة + timer شغال
// ─────────────────────────────────────────────
function ReopenedView({ session, student, questions, studentAnswers, liveState }) {
  const allowed = session.reopenedFor?.studentIds?.includes(student.id) || false;
  const unanswered = questions.filter((q) => !studentAnswers[q.id]);

  const [currentQuestionId, setCurrentQuestionId] = useState(null);
  const [started, setStarted]     = useState(false);
  const [startedAt, setStartedAt] = useState(null);
  const [now, setNow]             = useState(() => Date.now());
  const [submitting, setSubmitting] = useState(false);
  const timedOutRef = useRef(null);

  const currentQuestion = (() => {
    if (currentQuestionId) {
      const q = unanswered.find((x) => x.id === currentQuestionId);
      if (q) return q;
    }
    return unanswered[0] || null;
  })();
  const duration = Number(currentQuestion?.duration) || 30;

  useEffect(() => {
    if (!currentQuestionId && unanswered.length > 0) {
      setCurrentQuestionId(unanswered[0].id);
    }
  }, [unanswered, currentQuestionId]);

  useEffect(() => {
    if (!started || !currentQuestion) return;
    const i = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(i);
  }, [started, currentQuestion?.id]);

  const timeLeft = (() => {
    if (!started || !startedAt) return duration;
    const elapsed = Math.floor((now - startedAt) / 1000);
    return Math.max(0, duration - elapsed);
  })();

  const startQuestion = () => {
    setStarted(true);
    setStartedAt(Date.now());
    setNow(Date.now());
    timedOutRef.current = null;
  };

  const handleSubmitAnswer = async (optionIndex) => {
    if (!currentQuestion || submitting) return;
    setSubmitting(true);
    const submittedId = currentQuestion.id;
    try {
      if (optionIndex !== null) {
        await submitAnswer({
          sessionId: session.id,
          studentId: student.id,
          questionId: submittedId,
          selectedOption: optionIndex,
          timeLeft: Math.max(0, timeLeft),
        });
      }
      const remaining = unanswered.filter((q) => q.id !== submittedId);
      setCurrentQuestionId(remaining[0]?.id || null);
      setStarted(false);
      setStartedAt(null);
    } catch (err) {
      console.error("[ReopenedView.submit]", err);
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (!started || !currentQuestion) return;
    if (timeLeft > 0) return;
    if (timedOutRef.current === currentQuestion.id) return;
    timedOutRef.current = currentQuestion.id;
    handleSubmitAnswer(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, started, currentQuestion?.id]);

  if (liveState && liveState !== "reopened") return null;

  if (!allowed) {
    return (
      <div className="live-lobby">
        <div className="live-lobby-icon"><Timer size={36} /></div>
        <h2>الحصة مفتوحة للمتأخرين</h2>
        <p>مش مسموحلك تجاوب دلوقتي. تواصل مع المدرس.</p>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="live-finished">
        <Trophy size={44} />
        <h2>خلصت كل الأسئلة! 🎉</h2>
        <p>استنى المدرس يقفل الجولة.</p>
      </div>
    );
  }

  if (!started) {
    const remainingCount = unanswered.length;
    const doneCount = questions.length - remainingCount;
    return (
      <div className="live-lobby">
        <div className="live-lobby-icon"><Timer size={36} /></div>
        <h2>مفتوح للمتأخرين</h2>
        <p>
          باقي {formatNumber(remainingCount)} سؤال.
          {doneCount > 0 && ` (جاوبت ${formatNumber(doneCount)} من ${formatNumber(questions.length)})`}
        </p>
        <p className="muted" style={{ marginTop: 6 }}>
          الوقت هيبدأ لما تضغط الزرار. السؤال الحالي مدته {formatNumber(duration)} ثانية.
        </p>
        <button
          type="button"
          className="button button-primary turquoise"
          onClick={startQuestion}
          style={{ marginTop: 12 }}
        >
          ابدأ السؤال
        </button>
      </div>
    );
  }

  const questionNumber = questions.indexOf(currentQuestion) + 1;
  return (
    <div>
      <div className="session-status status-reveal" style={{ marginBottom: 14 }}>
        <i /> مفتوح للمتأخرين — سؤال {formatNumber(questionNumber)} من {formatNumber(questions.length)}
        {" — "}باقي {formatNumber(unanswered.length)}
      </div>
      <QuestionPanel
        question={currentQuestion}
        index={questionNumber - 1}
        total={questions.length}
        answer={null}
        timeLeft={timeLeft}
        duration={duration}
        onChoose={handleSubmitAnswer}
      />
    </div>
  );
}

// ─────────────────────────────────────────────
//  Leaderboard pieces
// ─────────────────────────────────────────────
function StudentAvatar({ player, size = 40 }) {
  const initial = (player?.name || "؟").trim().charAt(0) || "؟";
  return (
    <span
      className="student-avatar"
      style={{ width: size, height: size, fontSize: size * 0.42 }}
      aria-hidden="true"
    >
      {initial}
    </span>
  );
}

function PodiumCard({ player, rank, formatNumber, isCurrentStudent }) {
  if (!player) {
    return (
      <div className={`podium-card podium-card--${rank} is-empty`} aria-hidden="true">
        <span className="podium-card__name">—</span>
        <strong className="podium-card__score">0</strong>
        <span className="podium-card__rank">{formatNumber(rank)}</span>
      </div>
    );
  }
  return (
    <div className={`podium-card podium-card--${rank}${isCurrentStudent ? " podium-card--you" : ""}`}>
      <div className="podium-card__avatar">
        <StudentAvatar player={player} size={44} />
        {rank === 1 && <span className="podium-card__crown" aria-hidden="true">👑</span>}
      </div>
      <span className="podium-card__name">{player.name}</span>
      <strong className="podium-card__score">{formatNumber(player.score || 0)}</strong>
      <span className="podium-card__rank">{formatNumber(rank)}</span>
    </div>
  );
}

// ─────────────────────────────────────────────
//  Main Component
// ─────────────────────────────────────────────
function StudentView() {
  const [name, setName]         = useState("");
  const [code, setCode]         = useState("");
  const [error, setError]       = useState("");
  const [joined, setJoined]     = useState(null);
  const [reaction, setReaction] = useState(null);
  const [now, setNow]           = useState(() => Date.now());

  const isCountdown = joined?.session?.live?.state === "countdown";
  const { remaining: countdownRemaining } = useCountdown({
    active: isCountdown,
    seconds: 3,
  });

  // ── Timer tick: يشتغل بس وقت السؤال ──
  useEffect(() => {
    if (joined?.session?.live?.state !== "question") return;
    setNow(Date.now());
    const i = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(i);
  }, [joined?.session?.live?.state]);

  // ── Heartbeat: نبلّغ المدرس إننا لسه موجودين كل 20 ثانية ──
  useEffect(() => {
    if (!joined?.session?.id || !joined?.student?.id) return;
    const sessionId = joined.session.id;
    const studentId = joined.student.id;

    const tick = () => {
      updateStudent(sessionId, studentId, {
        lastSeenAt: Date.now(),
        leftAt: null,
      }).catch((err) => console.warn("[heartbeat]", err));
    };

    tick();                              // فوراً
    const i = setInterval(tick, HEARTBEAT_INTERVAL_MS);
    return () => clearInterval(i);
  }, [joined?.session?.id, joined?.student?.id]);

  // ── إعلان الخروج عند قفل التاب / الخروج من الصفحة ──
  useEffect(() => {
    if (!joined?.session?.id || !joined?.student?.id) return;
    const sessionId = joined.session.id;
    const studentId = joined.student.id;

    const markLeft = () => {
      updateStudent(sessionId, studentId, { leftAt: Date.now() }).catch(() => {});
    };

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        // رجع للصفحة: نبعت نبضة فوراً + نلغي leftAt (لو كان اتسجل)
        updateStudent(sessionId, studentId, {
          lastSeenAt: Date.now(),
          leftAt: null,
        }).catch(() => {});
      }
    };

    window.addEventListener("beforeunload", markLeft);
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      window.removeEventListener("beforeunload", markLeft);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [joined?.session?.id, joined?.student?.id]);

  const triggerReaction = (key) => {
    if (!key) return;
    setReaction({ key, id: Date.now() });
  };

  // ── Subscription: تحديث الحصة + طرد الطالب لو اتحذف ──
  useEffect(() => {
    if (!joined?.session?.id) return;

    const sessionId = joined.session.id;
    const studentId = joined.student.id;

    return subscribeSessions((all) => {
      const fresh = all[sessionId];

      if (!fresh) {
        setError("تم إنهاء الحصة من قِبل المدرس");
        setJoined(null);
        return;
      }

      const stillInSession = (fresh.students || []).some((s) => s.id === studentId);
      if (!stillInSession) {
        setError("تم إخراجك من الحصة من قِبل المدرس");
        setJoined(null);
        return;
      }

      setJoined((prev) =>
        !prev || JSON.stringify(prev.session) === JSON.stringify(fresh)
          ? prev
          : { ...prev, session: fresh }
      );
    });
  }, [joined?.session?.id]);

  // ── State-change reactions ──
  const liveStateForReaction = joined?.session?.live?.isLive
    ? joined.session.live.state
    : "not-started";
  useEffect(() => {
    if (!joined) return;
    const key = pickStateReaction(liveStateForReaction);
    if (key) triggerReaction(key);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [liveStateForReaction, joined?.session?.id]);

  // ── Join (async) ───────────────────────────────
  const handleJoin = async (e) => {
    e.preventDefault();
    setError("");
    const trimmedName = name.trim();
    const trimmedCode = code.trim();
    if (trimmedName.length < 2) return setError("اكتب اسمك (حرفين على الأقل)");
    if (!trimmedCode)            return setError("اكتب كود الحصة");

    try {
      const session = await findSessionByCode(trimmedCode);
      if (!session) return setError("الكود غلط أو الحصة مش موجودة");

      const existing = (session.students || []).find(
        (s) => s.name.trim().toLowerCase() === trimmedName.toLowerCase()
      );

      // 👈 لو رجع تاني: نحدّث آخر ظهور ونلغي leftAt
      if (existing) {
        const updated = await updateStudent(session.id, existing.id, {
          lastSeenAt: Date.now(),
          leftAt: null,
        });
        const freshStudent =
          updated?.students?.find((s) => s.id === existing.id) || existing;
        return setJoined({ session: updated || session, student: freshStudent });
      }

      const student = {
        id: `student-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`,
        name: trimmedName,
        attended: true,
        interacted: false,
        correctAnswers: 0,
        wrongAnswers: 0,
        score: 0,
        highestStreak: 0,
        currentStreak: 0,
        finishedAt: null,
        joinedAt: Date.now(),
        lastSeenAt: Date.now(),   // 👈 جديد
        leftAt: null,             // 👈 جديد
      };
      const updated = await addStudentToSession(session.id, student);
      if (!updated) return setError("مقدرناش ننضمّك، حاول تاني");
      setJoined({ session: updated, student });
    } catch (err) {
      console.error(err);
      setError("حصل خطأ في الاتصال، حاول تاني");
    }
  };

  const handleLeave = async () => {
    // 👈 نعلن الخروج قبل ما نصفّر الحالة
    if (joined?.session?.id && joined?.student?.id) {
      try {
        await updateStudent(joined.session.id, joined.student.id, {
          leftAt: Date.now(),
        });
      } catch (e) {
        console.warn("[handleLeave]", e);
      }
    }
    setJoined(null);
    setName("");
    setCode("");
    setError("");
    setReaction(null);
  };

  // ── Handle name change (async) ─────────────────
  const handleChangeName = async (newName) => {
    if (!joined) return;
    try {
      const updated = await updateStudent(joined.session.id, joined.student.id, {
        name: newName,
        warnedForNameChangeAt: null,
      });
      if (!updated) return;
      const newStudent =
        updated.students.find((s) => s.id === joined.student.id) || joined.student;
      setJoined((prev) =>
        prev ? { ...prev, session: updated, student: newStudent } : prev
      );
    } catch (err) {
      console.error(err);
    }
  };

  // ── Choose answer (async) ──────────────────────
  const handleChoose = async (optionIndex) => {
    if (!joined) return;
    const { session, student } = joined;
    const live = session.live || {};
    const questions = getQuestions(session);
    const currentQuestion = questions[live.currentQuestionIndex ?? 0];
    if (!currentQuestion) return;

    const alreadyAnswered = Boolean(session.answers?.[student.id]?.[currentQuestion.id]);

    if (live.state === "question") {
      if (alreadyAnswered) return;
    } else if (live.state === "reopened") {
      const allowed = session.reopenedFor?.studentIds?.includes(student.id);
      const allowEdit = session.reopenedFor?.allowEdit;
      if (!allowed || (alreadyAnswered && !allowEdit)) return;
    } else {
      return;
    }

    const dur = Number(currentQuestion.duration) || 30;
    const localTimeLeft = (() => {
      if (live.state === "question" && live.startedAt) {
        const elapsed = Math.floor((Date.now() - live.startedAt) / 1000);
        return Math.max(0, dur - elapsed);
      }
      return live.timeLeft ?? 0;
    })();

    const correctIndex = getCorrectIndex(currentQuestion);
    const isCorrect    = optionIndex === correctIndex;
    const speedBonus   = isCorrect ? Math.max(0, Math.round(localTimeLeft * 5)) : 0;
    const currentStreakOfStudent =
      (session.students?.find((s) => s.id === student.id)?.currentStreak) || 0;
    const nextStreak = isCorrect ? currentStreakOfStudent + 1 : 0;

    triggerReaction(
      pickReaction({
        isCorrect,
        streak:     nextStreak,
        speedBonus,
        timeLeft:   localTimeLeft,
        duration:   dur,
      })
    );

    try {
      await submitAnswer({
        sessionId: session.id,
        studentId: student.id,
        questionId: currentQuestion.id,
        selectedOption: optionIndex,
        timeLeft: localTimeLeft,
      });
    } catch (err) {
      console.error(err);
    }
  };

  // ── Join form ─────────────────────────────────
  if (!joined) {
    return (
      <div className="page">
        <main className="dashboard">
          <div className="layout">
            <div className="card stack-card auth-container">
              <div className="card-heading">
                <div className="card-heading-title">
                  <span className="card-icon yellow"><KeyRound size={26} /></span>
                  <div>
                    <span className="card-eyebrow">هتدخل على طول</span>
                    <h2>اسمك وكود الحصة</h2>
                  </div>
                </div>
              </div>

              <form className="join-form" onSubmit={handleJoin} noValidate>
                <label htmlFor="student-name">اسمك</label>
                <div className="input-wrap">
                  <input
                    id="student-name"
                    type="text"
                    autoComplete="off"
                    maxLength={24}
                    placeholder="اسمك"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <label htmlFor="session-code">كود الحصة</label>
                <div className="input-wrap">
                  <KeyRound size={17} aria-hidden="true" />
                  <input
                    id="session-code"
                    type="text"
                    autoComplete="off"
                    maxLength={24}
                    placeholder="مثال: ABC123"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                  />
                </div>

                {error && (
                  <p className="error-alert">
                    <AlertCircle size={14} /> {error}
                  </p>
                )}

                <button className="button button-center button-primary join-submit" type="submit">
                  ادخل الحصة <ArrowLeft size={18} />
                </button>
                
                <span className="auth-back">
                  <Link to="/"><ArrowLeft size={14} /> رجوع للصفحة الرئيسية</Link>
                </span>
              </form>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // ── Joined: live view ─────────────────────────
  const { session } = joined;
  const live = session.live || {};
  const liveState = live.isLive ? live.state : "not-started";
  const questions = getQuestions(session);

  const questionIndex = live.currentQuestionIndex ?? 0;
  const currentQuestion = questions[questionIndex] || null;
  const duration = Number(currentQuestion?.duration) || 30;

  const timeLeft = (() => {
    if (live.state === "question" && live.startedAt) {
      const elapsed = Math.floor((now - live.startedAt) / 1000);
      return Math.max(0, duration - elapsed);
    }
    return live.timeLeft ?? 0;
  })();

  const studentAnswers = session.answers?.[joined.student.id] || {};
  const currentAnswer = currentQuestion ? studentAnswers[currentQuestion.id] : null;

  const freshStudent =
    session.students?.find((s) => s.id === joined.student.id) || joined.student;

  const isWarned = Boolean(freshStudent.warnedForNameChangeAt);

  const totalStudents = session.students?.length || 0;
  const answeredCount = questions.reduce(
    (n, q) => n + (studentAnswers[q.id] ? 1 : 0),
    0
  );

  const sortedStudents = [...(session.students || [])].sort(
    (a, b) => (b.score || 0) - (a.score || 0)
  );
  const totalStudentsCount = sortedStudents.length;
  const myRankIndex = sortedStudents.findIndex((s) => s.id === joined.student.id);
  const currentRank = myRankIndex >= 0 ? myRankIndex + 1 : totalStudentsCount;
  const currentStudent =
    myRankIndex >= 0 ? sortedStudents[myRankIndex] : { name: "أنت", score: 0 };

  const podium = [sortedStudents[0], sortedStudents[1], sortedStudents[2]];
  const others = sortedStudents.slice(3);

  const rankGain = 0;
  const rankGainLabel =
    rankGain > 0
      ? `طلعت ${formatNumber(rankGain)} ${rankGain === 1 ? "مركز" : "مراكز"} لفوق!`
      : rankGain < 0
      ? "لسه قدامك فرصة ترجع"
      : "كل نقطة هتقربك للصدارة";

  return (
    <div className="page">
      {isWarned && (
        <NameChangeWarning
          currentName={freshStudent.name}
          onSave={handleChangeName}
          onLeave={handleLeave}
        />
      )}

      <main className="dashboard">
        <div className="layout">
          <div className="card stack-card screen">
            <Reaction
              reactionKey={reaction?.key}
              triggerId={reaction?.id}
              onDone={() => setReaction(null)}
            />

            <div className="card-heading">
              <div className="card-heading-title">
                <span className="card-icon turquoise"><Check size={26} /></span>
                <div>
                  <span className="card-eyebrow">أهلاً يا {freshStudent.name}</span>
                  <h2>{session.title ?? "جلسة"}</h2>
                </div>
              </div>
              <div className="question-stats">
                <span className="stat-chip">
                  <Zap size={16} /> {formatNumber(freshStudent.score)} <small>نقطة</small>
                </span>
                <span className="stat-chip stat-chip--streak">
                  <Flame size={16} /> {formatNumber(freshStudent.highestStreak)} <small>streak</small>
                </span>
              </div>
            </div>

            <div className="student-live-stats">
              <span><Check size={14} /> {formatNumber(freshStudent.correctAnswers)} صح</span>
              <span><X size={14} /> {formatNumber(freshStudent.wrongAnswers)} غلط</span>
              <span><ListChecks size={14} /> {formatNumber(answeredCount)}/{formatNumber(questions.length)} سؤال</span>
              <span><Users size={14} /> {formatNumber(totalStudents)} طالب</span>
            </div>

            {liveState === "not-started" && (
              <div className="live-lobby">
                <div className="live-lobby-icon"><Users size={36} /></div>
                <h2>مستنيين المدرس يبدأ</h2>
                <p>لسه الحصة ما بدأتش. هيفتحلك الأسئلة قريب.</p>
                <div className="live-lobby-pulse" />
              </div>
            )}

            {liveState === "lobby" && (
              <div className="live-lobby">
                <div className="live-lobby-icon"><Users size={36} /></div>
                <h2>إحنا في اللوبي</h2>
                <p>المدرس جاهز يبدأ. استنى لحظة!</p>
                <div className="live-lobby-pulse" />
              </div>
            )}

            {liveState === "countdown" && (
              <div className="live-countdown">
                <div className="live-countdown-badge">
                  <Timer size={14} /> العد التمهيدي
                </div>
                <div className="live-countdown-number" key={countdownRemaining}>
                  {countdownRemaining > 0 ? countdownRemaining : "يلا!"}
                </div>
                <p>استعد...</p>
              </div>
            )}

            {liveState === "question" && currentQuestion && (
              <QuestionPanel
                question={currentQuestion}
                index={questionIndex}
                total={questions.length}
                answer={currentAnswer}
                timeLeft={timeLeft}
                duration={duration}
                onChoose={handleChoose}
                heat={freshStudent.currentStreak || 0}
              />
            )}

            {liveState === "paused" && currentQuestion && (
              <div>
                <div className="session-status status-paused" style={{ marginBottom: 12 }}>
                  <i /> المدرس وقّف الحصة مؤقتاً
                </div>
                <QuestionPanel
                  question={currentQuestion}
                  index={questionIndex}
                  total={questions.length}
                  answer={currentAnswer}
                  timeLeft={timeLeft}
                  duration={duration}
                  onChoose={() => {}}
                  readOnly
                  heat={freshStudent.currentStreak || 0}
                />
              </div>
            )}

            {liveState === "reveal" && currentQuestion && (
              <QuestionPanel
                question={currentQuestion}
                index={questionIndex}
                total={questions.length}
                answer={currentAnswer}
                timeLeft={0}
                duration={duration}
                onChoose={() => {}}
                readOnly
                heat={freshStudent.currentStreak || 0}
              />
            )}

            {liveState === "finished" && (
              <div className="live-finished">
                <Trophy size={52} />
                <h2>خلصت الحصة!</h2>
                <p>نتيجتك: <b>{formatNumber(freshStudent.score)}</b> نقطة</p>
                <p>
                  صح: <b>{formatNumber(freshStudent.correctAnswers)}</b> —{" "}
                  غلط: <b>{formatNumber(freshStudent.wrongAnswers)}</b>
                </p>
                {freshStudent.highestStreak > 1 && (
                  <p>أطول سلسلة صح: <b>{formatNumber(freshStudent.highestStreak)}</b> 🔥</p>
                )}
              </div>
            )}

            {liveState === "reopened" && (
              <ReopenedView
                session={session}
                student={joined.student}
                questions={questions}
                studentAnswers={studentAnswers}
                liveState={liveState}
              />
            )}

            <button
              type="button"
              className="button button-center button-primary red"
              onClick={handleLeave}
              style={{ marginTop: 8 }}
            >
              خروج من الحصة
            </button>
          </div>

          <aside className="instructor-sidebar">
            <div className="card stack-card">
              <div className="card-heading">
                <div className="card-heading-title">
                  <span className="card-icon color1"><Trophy size={26} /></span>
                  <div>
                    <span className="card-eyebrow">أهلاً الترتيب المباشر</span>
                    <h2>المتصدرين</h2>
                  </div>
                </div>
                <span className="live-chip"><span /> LIVE</span>
              </div>

              <div>
                <div className="your-rank-card">
                  <StudentAvatar player={currentStudent} size={44} />
                  <div className="your-rank-card__copy">
                    <span>ترتيبك الحالي</span>
                    <strong>{rankGainLabel}</strong>
                  </div>
                  <span className="your-rank-card__position">
                    {formatNumber(currentRank)}
                    <small>مركز</small>
                  </span>
                </div>

                <div className="podium" aria-label="المنصة">
                  <PodiumCard player={podium[1]} rank={2} formatNumber={formatNumber} isCurrentStudent={podium[1]?.id === joined.student.id} />
                  <PodiumCard player={podium[0]} rank={1} formatNumber={formatNumber} isCurrentStudent={podium[0]?.id === joined.student.id} />
                  <PodiumCard player={podium[2]} rank={3} formatNumber={formatNumber} isCurrentStudent={podium[2]?.id === joined.student.id} />
                </div>

                <div className="ranking-list-heading">
                  <span>باقي الترتيب</span>
                  <span>{formatNumber(totalStudentsCount)} طالب</span>
                </div>

                <ol className="ranking-list" start={4} aria-label="باقي ترتيب الطلاب">
                  {others.map((player, index) => {
                    const rank = index + 4;
                    const isCurrent = player.id === joined.student.id;
                    return (
                      <li
                        className={`ranking-row${isCurrent ? " ranking-row--you" : ""}`}
                        key={player.id}
                        value={rank}
                      >
                        <span className="ranking-row__rank">{formatNumber(rank)}</span>
                        <StudentAvatar player={player} size={32} />
                        <span className="ranking-row__name">{isCurrent ? "إنت" : player.name}</span>
                        <strong className="ranking-row__score">{formatNumber(player.score || 0)}</strong>
                      </li>
                    );
                  })}
                </ol>

                <div className="leaderboard-footer">
                  <TrendingUp size={16} aria-hidden="true" />
                  <span>الترتيب بيتحدث تلقائي مع كل إجابة</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

export default StudentView;