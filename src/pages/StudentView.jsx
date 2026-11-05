import { useState, useEffect } from "react";
import {
  KeyRound, ArrowLeft, AlertCircle, Check, Clock3, Zap, Flame,
  X, Sparkles, Trophy, Users, ListChecks, Timer,
  TrendingUp,
} from "lucide-react";
import {
  findSessionByCode,
  addStudentToSession,
  subscribeSessions,
  readSessions,
  upsertSession,
} from "../store/sessionStore";
import useCountdown from "../hooks/useCountdown";
import { Reaction } from "../Components/Reactions.jsx";
import { pickReaction, pickStateReaction } from "../utils/pickReaction";
import "../styles/student-page.css";
import "../styles/reactions.css";

const ANSWER_LABELS = ["أ", "ب", "ج", "د", "هـ", "و"];
const ANSWER_COLORS = ["turquoise", "yellow", "blue", "red"];

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

function computeStats(student, answersMap, questions) {
  let score = 0, correct = 0, wrong = 0, streak = 0, highest = 0, answered = 0;
  for (const q of questions) {
    const ans = answersMap[q.id];
    if (!ans) continue;
    answered++;
    if (ans.isCorrect) {
      score += ans.points || 0;
      correct++;
      streak++;
      if (streak > highest) highest = streak;
    } else {
      wrong++;
      streak = 0;
    }
  }
  return {
    ...student,
    score,
    correctAnswers: correct,
    wrongAnswers: wrong,
    highestStreak: highest,
    currentStreak: streak,
    interacted: answered > 0,
    finishedAt:
      questions.length > 0 && answered >= questions.length
        ? student.finishedAt || Date.now()
        : student.finishedAt || null,
  };
}

function submitAnswer({ sessionId, studentId, question, optionIndex, timeLeft }) {
  const all = readSessions();
  const session = all[sessionId];
  if (!session) return;

  const questions = getQuestions(session);
  const correctIndex = getCorrectIndex(question);
  const isCorrect = optionIndex === correctIndex;
  const speedBonus = isCorrect ? Math.max(0, Math.round(timeLeft * 5)) : 0;
  const points = isCorrect ? 100 + speedBonus : 0;

  const answer = {
    questionId: question.id,
    selectedOption: optionIndex,
    isCorrect,
    points,
    speedBonus,
    kind: isCorrect ? "correct" : "wrong",
    answeredAt: Date.now(),
  };

  const prevAnswers = session.answers?.[studentId] || {};
  const nextAnswers = { ...prevAnswers, [question.id]: answer };
  const nextStudents = (session.students || []).map((s) =>
    s.id === studentId ? computeStats(s, nextAnswers, questions) : s
  );

  upsertSession({
    ...session,
    answers: { ...(session.answers || {}), [studentId]: nextAnswers },
    students: nextStudents,
  });
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
        <div className="question-session">
          <span className="mini-label">سؤال {formatNumber(index + 1)} من {formatNumber(total)}</span>
        </div>
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
//  Reopened view
// ─────────────────────────────────────────────
function ReopenedView({ session, student, questions, studentAnswers }) {
  const allowed = session.reopenedFor?.studentIds?.includes(student.id) || false;
  const unanswered = questions.filter((q) => !studentAnswers[q.id]);

  if (!allowed) {
    return (
      <div className="live-lobby">
        <div className="live-lobby-icon"><Timer size={36} /></div>
        <h2>الجلسة مفتوحة للمتأخرين</h2>
        <p>مش مسموحلك تجاوب دلوقتي. تواصل مع المدرس.</p>
      </div>
    );
  }

  if (unanswered.length === 0) {
    return (
      <div className="live-finished">
        <Trophy size={44} />
        <h2>خلصت كل الأسئلة! 🎉</h2>
        <p>استنى المدرس يقفل الجولة.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="session-status status-reveal" style={{ marginBottom: 14 }}>
        <i /> مفتوح للمتأخرين — باقي {formatNumber(unanswered.length)} سؤال
      </div>
      {unanswered.map((q) => (
        <div key={q.id} style={{ marginBottom: 16 }}>
          <QuestionPanel
            question={q}
            index={questions.indexOf(q)}
            total={questions.length}
            answer={null}
            timeLeft={Number(q.duration) || 30}
            duration={Number(q.duration) || 30}
            onChoose={(optIdx) =>
              submitAnswer({
                sessionId: session.id,
                studentId: student.id,
                question: q,
                optionIndex: optIdx,
                timeLeft: 0,
              })
            }
          />
        </div>
      ))}
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

  const isCountdown = joined?.session?.live?.state === "countdown";
  const { remaining: countdownRemaining } = useCountdown({
    active: isCountdown,
    seconds: 3,
  });

  const triggerReaction = (key) => {
    if (!key) return;
    setReaction({ key, id: Date.now() });
  };

  useEffect(() => {
    if (!joined?.session?.id) return;
    return subscribeSessions((all) => {
      const fresh = all[joined.session.id];
      if (!fresh) return;
      setJoined((prev) =>
        !prev || JSON.stringify(prev.session) === JSON.stringify(fresh)
          ? prev
          : { ...prev, session: fresh }
      );
    });
  }, [joined?.session?.id]);

  // ── State-change reactions (lobby / paused / finished / reopened) ──
  const liveStateForReaction = joined?.session?.live?.isLive
    ? joined.session.live.state
    : "not-started";
  useEffect(() => {
    if (!joined) return;
    const key = pickStateReaction(liveStateForReaction);
    if (key) triggerReaction(key);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [liveStateForReaction, joined?.session?.id]);

  const handleJoin = (e) => {
    e.preventDefault();
    setError("");
    const trimmedName = name.trim();
    const trimmedCode = code.trim();
    if (trimmedName.length < 2) return setError("اكتب اسمك (حرفين على الأقل)");
    if (!trimmedCode)            return setError("اكتب كود الجلسة");

    const session = findSessionByCode(trimmedCode);
    if (!session) return setError("الكود غلط أو الجلسة مش موجودة");

    const existing = (session.students || []).find(
      (s) => s.name.trim().toLowerCase() === trimmedName.toLowerCase()
    );
    if (existing) return setJoined({ session, student: existing });

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
    };
    const updated = addStudentToSession(session.id, student);
    if (!updated) return setError("مقدرناش ننضمّك، حاول تاني");
    setJoined({ session: updated, student });
  };

  const handleLeave = () => {
    setJoined(null);
    setName("");
    setCode("");
    setError("");
    setReaction(null);
  };

  const handleChoose = (optionIndex) => {
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

    // ── Trigger reaction قبل ما نبعت الإجابة ──
    const correctIndex = getCorrectIndex(currentQuestion);
    const isCorrect    = optionIndex === correctIndex;
    const speedBonus   = isCorrect ? Math.max(0, Math.round((live.timeLeft ?? 0) * 5)) : 0;
    const currentStreakOfStudent =
      (session.students?.find((s) => s.id === student.id)?.currentStreak) || 0;
    const nextStreak = isCorrect ? currentStreakOfStudent + 1 : 0;

    triggerReaction(
      pickReaction({
        isCorrect,
        streak:     nextStreak,
        speedBonus,
        timeLeft:   live.timeLeft ?? 0,
        duration:   Number(currentQuestion.duration) || 30,
      })
    );

    submitAnswer({
      sessionId: session.id,
      studentId: student.id,
      question: currentQuestion,
      optionIndex,
      timeLeft: live.timeLeft ?? 0,
    });
  };

  // ── Join form ─────────────────────────────
  if (!joined) {
    return (
      <div className="page">
        <main className="dashboard">
          <div className="layout">
            <div className="card stack-card join-card">
              <div className="card-heading">
                <div className="card-heading-title">
                  <span className="card-icon yellow"><KeyRound size={26} /></span>
                  <div>
                    <span className="card-eyebrow">هتدخل على طول</span>
                    <h2>كود الجلسة</h2>
                  </div>
                </div>
              </div>

              <p className="card-description">اكتب اسمك وكود الحصة.</p>

              <form className="join-form" onSubmit={handleJoin} noValidate>
                <label htmlFor="student-name">اسمك</label>
                <div className="join-input-wrap">
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

                <label htmlFor="session-code">كود الجلسة</label>
                <div className="join-input-wrap">
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
                  <p style={{ color: "#c53030", fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>
                    <AlertCircle size={14} /> {error}
                  </p>
                )}

                <button className="button button-primary join-submit" type="submit">
                  ادخل الجلسة <ArrowLeft size={18} />
                </button>
              </form>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // ── Joined: live view ─────────────────────
  const { session } = joined;
  const live = session.live || {};
  const liveState = live.isLive ? live.state : "not-started";
  const questions = getQuestions(session);

  // Question data
  const questionIndex = live.currentQuestionIndex ?? 0;
  const currentQuestion = questions[questionIndex] || null;
  const duration = Number(currentQuestion?.duration) || 30;
  const timeLeft = live.timeLeft ?? 0;

  const studentAnswers = session.answers?.[joined.student.id] || {};
  const currentAnswer = currentQuestion ? studentAnswers[currentQuestion.id] : null;

  const freshStudent =
    session.students?.find((s) => s.id === joined.student.id) || joined.student;

  const totalStudents = session.students?.length || 0;
  const answeredCount = questions.reduce(
    (n, q) => n + (studentAnswers[q.id] ? 1 : 0),
    0
  );

  // Leaderboard data
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
      ? `طلعت ${formatNumber(rankGain)} ${rankGain === 1 ? "مركز" : "مراكز"}`
      : rankGain < 0
      ? `نزلت ${formatNumber(-rankGain)} ${rankGain === -1 ? "مركز" : "مراكز"}`
      : "في نفس المركز";

  return (
    <div className="page">
      <main className="dashboard">
        <div className="layout">
          <div className="card stack-card screen">
            {/* ── Reaction (overlay) ── */}
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
              <span><Trophy size={14} /> {formatNumber(freshStudent.correctAnswers)} صح</span>
              <span><X size={14} /> {formatNumber(freshStudent.wrongAnswers)} غلط</span>
              <span><ListChecks size={14} /> {formatNumber(answeredCount)}/{formatNumber(questions.length)} سؤال</span>
              <span><Users size={14} /> {formatNumber(totalStudents)} طالب</span>
            </div>

            {liveState === "not-started" && (
              <div className="live-lobby">
                <div className="live-lobby-icon"><Users size={36} /></div>
                <h2>مستنيين المدرس يبدأ</h2>
                <p>لسه الجلسة ما بدأتش. هيفتحلك الأسئلة قريب.</p>
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
                  <i /> المدرس وقّف الجلسة مؤقتاً
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
                <h2>خلصت الجلسة!</h2>
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
              />
            )}

            <button
              type="button"
              className="button ghost"
              onClick={handleLeave}
              style={{ marginTop: 8 }}
            >
              خروج من الجلسة
            </button>
          </div>

          <aside className="instructor-sidebar">
            <div className="card stack-card">
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

              <div>
                <div className="leaderboard-header">
                  <div>
                    <span className="mini-label">الترتيب المباشر</span>
                    <h2><Trophy size={22} fill="currentColor" />المتصدرين</h2>
                  </div>
                  <span className="live-chip"><span /> LIVE</span>
                </div>

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