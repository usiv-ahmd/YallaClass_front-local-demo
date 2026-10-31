import { useState, useEffect, useRef } from "react";
import { Users, Timer, Pause, Check, Sparkles, RotateCcw } from "lucide-react";

export function LobbyView({ session }) {
  return (
    <div className="live-lobby">
      <div className="live-lobby-icon"><Users size={42} /></div>
      <h2>مستنيين الطلاب ينضموا...</h2>
      <p>
        لما تجهز، اضغط <b>ابدأ الجلسة</b>. كود الفصل:{" "}
        <b>{session?.code ?? "—"}</b>
      </p>
      <div className="live-lobby-pulse" />
    </div>
  );
}

export function CountdownView({ onEnd, seconds = 3 }) {
  const [remaining, setRemaining] = useState(seconds);
  const onEndRef = useRef(onEnd);

  useEffect(() => {
    onEndRef.current = onEnd;
  }, [onEnd]);

  useEffect(() => {
    if (remaining <= 0) {
      onEndRef.current?.();
      return;
    }
    const t = setTimeout(() => setRemaining((r) => r - 1), 1000);
    return () => clearTimeout(t);
  }, [remaining]);

  return (
    <div className="live-countdown">
      <span className="live-countdown-badge">
        <Timer size={14} /> العدّ التمهيدي
      </span>
      <div className="live-countdown-number">{remaining}</div>
      <p>استعدّوا... السؤال جاي</p>
    </div>
  );
}

export function QuestionView({ question, paused, timeLeft = 0 }) {
  const total = Number(question?.duration) || 30;
  const pct   = total > 0
    ? Math.max(0, Math.min(100, (timeLeft / total) * 100))
    : 0;
  const isLow = timeLeft <= 5 && timeLeft > 0;

  return (
    <div className={`live-question ${paused ? "is-paused" : ""}`}>
      <div className="live-question-head">
        <span className="badge">
          {question.type === "mcq" ? "اختيار من متعدد" : question.type}
        </span>
        {question.source === "ai" && <span className="badge badge-ai">AI</span>}

        <span className={`badge badge-timer ${isLow ? "is-warning" : ""}`}>
          <Timer size={12} /> {timeLeft} ث
        </span>

        {paused && (
          <span className="badge badge-warn">
            <Pause size={12} /> موقوف مؤقتًا
          </span>
        )}
      </div>

      <div className="live-question-timer">
        <div
          className={`live-question-timer-fill ${isLow ? "is-warning" : ""}`}
          style={{ width: `${pct}%` }}
        />
      </div>

      <h2 className="live-question-text">{question.question}</h2>

      <ul className="live-options">
        {(question.options ?? []).map((opt, idx) => (
          <li key={idx} className="live-option">
            <span className="option-letter">
              {String.fromCharCode(65 + idx)}
            </span>
            <span>{opt}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function RevealView({ question }) {
  const correct =
    question.correctOptionIndex ??
    (question.options ?? []).indexOf(question.correctAnswer);

  return (
    <div className="live-question is-reveal">
      <div className="live-question-head">
        <span className="badge badge-success">
          <Check size={12} /> مراجعة الإجابة
        </span>
      </div>
      <h2 className="live-question-text">{question.question}</h2>
      <ul className="live-options">
        {(question.options ?? []).map((opt, idx) => {
          const isCorrect = idx === correct;
          return (
            <li
              key={idx}
              className={`live-option ${isCorrect ? "is-correct" : "is-wrong"}`}
            >
              <span className="option-letter">
                {String.fromCharCode(65 + idx)}
              </span>
              <span>{opt}</span>
              {isCorrect && <Check size={16} className="option-check" />}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function FinishedView({ pendingCount = 0, totalStudents = 0, onReopen }) {
  return (
    <div className="live-finished">
      <Sparkles size={48} />
      <h2>خلصت الجولة!</h2>
      <p>
        {pendingCount > 0
          ? `لسه ${pendingCount} من ${totalStudents} طالب مكملوش.`
          : "كل الطلاب خلصوا — تقدر تقفل الجلسة."}
      </p>
      {pendingCount > 0 && (
        <button type="button" className="button button-primary" onClick={onReopen}>
          <RotateCcw size={16} /> افتح للمتأخرين ({pendingCount})
        </button>
      )}
    </div>
  );
}

export function ReopenedView({ pendingCount, totalStudents, allowAnswerEdit }) {
  return (
    <div className="live-reopened">
      <div className="live-lobby-icon"><RotateCcw size={42} /></div>
      <h2>الجولة مفتوحة للمتأخرين</h2>
      <p>
        مفتوحة لـ <b>{pendingCount}</b> من <b>{totalStudents}</b> طالب لسه مكملوش.
      </p>
      <span className={`badge ${allowAnswerEdit ? "badge-warn" : "badge-success"}`}>
        {allowAnswerEdit
          ? "مسموح بتعديل الإجابات القديمة"
          : "الإجابات القديمة مقفولة"}
      </span>
    </div>
  );
}