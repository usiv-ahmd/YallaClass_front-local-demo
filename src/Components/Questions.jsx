import { useState } from "react";
import { BookOpenCheck, Check, Minus, Plus, Trash2, X, Sparkles, Clock } from "lucide-react";

export function makeId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function getCorrectIndex(question) {
  if (Number.isInteger(question?.correctOptionIndex)) return question.correctOptionIndex;
  if (Array.isArray(question?.options) && typeof question?.correctAnswer === "string") {
    return question.options.indexOf(question.correctAnswer);
  }
  return -1;
}

export default function Questions({ session, onChange, isCompleted }) {
  const [formOpen, setFormOpen] = useState(false);
  const [text, setText] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correctIndex, setCorrectIndex] = useState(0);

  const questions = Array.isArray(session?.questions)
    ? session.questions
    : Object.values(session?.questions ?? {});

  const [duration, setDuration] = useState(30);
  const DURATIONS = [15, 30, 45, 60, 90, 120];

  function addQuestion(event) {
    event.preventDefault();

    const trimmedOptions = options.map((option) => option.trim());

    if (!text.trim()) {
      alert("اكتب نص السؤال الأول");
      return;
    }
    if (trimmedOptions.some((opt) => !opt)) {
      alert("كل الخيارات لازم تكون مكتوبة");
      return;
    }
    if (trimmedOptions.length < 2) {
      alert("لازم يكون فيه على الأقل خيارين");
      return;
    }

    const safeDuration = Math.min(120, Math.max(5, Number(duration) || 30));

    const newQuestion = {
      id: makeId("question"),
      question: text.trim(),
      text: text.trim(),
      options: trimmedOptions,
      correctOptionIndex: correctIndex,
      correctAnswer: trimmedOptions[correctIndex],
      duration: safeDuration,
      source: "manual",
      type: "mcq",
    };

    onChange([...questions, newQuestion]);

    setText("");
    setOptions(["", "", "", ""]);
    setCorrectIndex(0);
    setDuration(30);
    setFormOpen(false);
  }

  function updateOption(index, value) {
    setOptions((current) =>
      current.map((option, optionIndex) => (optionIndex === index ? value : option))
    );
  }

  function removeOption(index) {
    setOptions((current) => current.filter((_, optionIndex) => optionIndex !== index));
    setCorrectIndex((current) =>
      current === index ? Math.max(0, index - 1) : current > index ? current - 1 : current
    );
  }

    return (
    <section className="card questions-panel" aria-labelledby="questions-title">
      <div className="panel-heading">
        <div className="panel-heading-title">
          <div className="panel-icon manual-icon"><BookOpenCheck size={19} /></div>
          <div>
            <h2 id="questions-title">الأسئلة</h2>
          </div>
        </div>
        <span className="count-pill">{questions.length} سؤال</span>
      </div>
      <p className="panel-description">
        {isCompleted 
        ? "دي الأسئلة اللي كانت معانا في الدرس." 
        : "اكتب الأسئلة اللي انت عايزها أو ارفع ملف وسيب الـ AI يعملهالك."}
      </p>

      {questions.length > 0 ? (
        <div className="question-list">
          {questions.map((question, index) => {
            const correctIdx = getCorrectIndex(question);
            const optionList = Array.isArray(question?.options) ? question.options : [];
            const duration = Number(question?.duration) || 0;

            return (
              <article className="question-card" key={question.id ?? index}>
                <div className="question-card-topline">
                  <span className={`question-number ${question.source === "ai" ? "ai-source" : "manual-source"}`}>
                    {`${index + 1}`.padStart(2, "0")}
                  </span>

                  <span className={`source-label ${question.source === "ai" ? "ai-source" : "manual-source"}`}>
                    {question.source === "ai" ? <Sparkles size={10} /> : <i />}{" "}
                    {question.source === "ai" ? "ذكاء اصطناعي" : "يدوي"}
                  </span>

                  {duration > 0 && (
                    <span className="duration-badge" title={`مدة السؤال ${duration} ثانية`}>
                      <Clock size={11} />
                      {duration} ث
                    </span>
                  )}

                  {!isCompleted && (
                    <button
                      className="delete-question-button"
                      type="button"
                      onClick={() => onChange(questions.filter((item) => item.id !== question.id))}
                      aria-label={`حذف السؤال ${index + 1}`}
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>

                <h3>{question.question}</h3>

                <div className="question-options-preview">
                  {optionList.map((option, optionIndex) => (
                    <span
                      className={optionIndex === correctIdx ? "is-correct" : ""}
                      key={`${question.id ?? index}-${optionIndex}`}
                    >
                      <i>
                        {optionIndex === correctIdx
                          ? <Check size={11} />
                          : String.fromCharCode(65 + optionIndex)}
                      </i>
                      {option}
                    </span>
                  ))}
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="empty-questions">
          <BookOpenCheck size={24} />
          <strong>لسه ما أضفتش أسئلة</strong>
          <span>ابدأ بإضافة سؤال يدوي للجلسة.</span>
        </div>
      )}

      {!isCompleted && (
        <>
          {formOpen ? (
            <form className="question-form" onSubmit={addQuestion}>
              <div className="form-heading">
                <strong>سؤال جديد</strong>
                <button className="close-button" type="button" onClick={() => setFormOpen(false)} aria-label="إغلاق">
                  <X size={17} />
                </button>
              </div>
              <label className="field-label">
                نص السؤال
                <textarea required maxLength={240} value={text} onChange={(event) => setText(event.target.value)} placeholder="اكتب السؤال بوضوح..." rows={2}/>
              </label>
              <div className="answer-options-grid">
                {options.map((option, index) => (
                  <label
                    className={`answer-option-field ${correctIndex === index ? "is-correct" : ""}`}
                    key={index}
                  >
                    <input className="correct-radio" type="radio" name={`correct-answer-${session.id}`} checked={correctIndex === index} onChange={() => setCorrectIndex(index)} aria-label={`اجعل الخيار ${index + 1} الإجابة الصحيحة`}/>
                    <span className="option-letter">{String.fromCharCode(65 + index)}</span>
                    <input className="option-input" required maxLength={120} value={option} onChange={(event) => updateOption(index, event.target.value)} placeholder={`الخيار ${index + 1}`}/>
                    {options.length > 2 && (
                      <button className="remove-option" type="button" onClick={() => removeOption(index)} aria-label={`حذف الخيار ${index + 1}`}>
                        <Minus size={14} />
                      </button>
                    )}
                  </label>
                ))}
              </div>
              <button className="add-option-button" type="button" disabled={options.length >= 6} onClick={() => setOptions((current) => [...current, ""])}>
                <Plus size={15} /> إضافة اختيار
              </button>
              <div className="field-label">
                مدة السؤال (بالثواني)
                <div className="duration-picker">
                  {DURATIONS.map((sec) => (
                    <button
                      type="button"
                      key={sec}
                      className={`duration-chip ${Number(duration) === sec ? "selected" : ""}`}
                      onClick={() => setDuration(sec)}
                    >
                      <b>{sec}</b>
                      <small>ث</small>
                    </button>
                  ))}
                </div>
              </div>
              <button className="button button-primary submit-question-button" type="submit">إضافة السؤال</button>
            </form>
          ) : (
            <button className="button open-question-form-button" type="button" onClick={() => setFormOpen(true)}>
              <Plus size={17} /> أضف سؤالًا يدويًا
            </button>
          )}
        </>
      )}
    </section>
  );
}