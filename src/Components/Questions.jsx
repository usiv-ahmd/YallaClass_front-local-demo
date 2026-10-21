import { useState } from "react";
import { BookOpenCheck, Check, Minus, Plus, Trash2, X } from "lucide-react";

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

  function addQuestion(event) {
    event.preventDefault();
    const question = {
      id: makeId("question"),
      question: text.trim(),
      text: text.trim(),
      options: options.map((option) => option.trim()),
      correctOptionIndex: correctIndex,
      source: "manual",
      correctAnswer: trimmedOptions[correctIndex],
      type: "mcq",
    };
    onChange([...session.questions, question]);
    setText("");
    setOptions(["", "", "", ""]);
    setCorrectIndex(0);
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
    <section className="rounded-div questions-panel" aria-labelledby="questions-title">
      <div className="panel-heading">
        <div className="panel-heading-title">
          <div className="panel-icon manual-icon"><BookOpenCheck size={19} /></div>
          <div>
            <h2 id="questions-title">الأسئلة</h2>
          </div>
        </div>
        <span className="count-pill">{questions.length.toLocaleString("ar-EG")} سؤال</span>
      </div>
      <p className="panel-description">أسئلتك التي كتبتها بنفسك — منفصلة عن مساحة أسئلة الذكاء الاصطناعي.</p>

      {questions.length > 0 ? (
        <div className="question-list">
          {questions.map((question, index) => {
            const correctIdx = getCorrectIndex(question);
            const optionList = Array.isArray(question?.options) ? question.options : [];

            return (
              <article className="question-card" key={question.id ?? index}>
                <div className="question-card-topline">
                  <span className="question-number">{`${index + 1}`.padStart(2, "0")}</span>
                  <span className="source-label manual-source"><i /> يدوي</span>
                  {!isCompleted && (
                    <button
                      className="delete-question-button"
                      type="button"
                      onClick={() =>
                        onChange(questions.filter((item) => item.id !== question.id))
                      }
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
                <button className="icon-button subtle-icon" type="button" onClick={() => setFormOpen(false)} aria-label="إغلاق">
                  <X size={17} />
                </button>
              </div>
              <label className="field-label">
                نص السؤال
                <textarea
                  required
                  maxLength={240}
                  value={text}
                  onChange={(event) => setText(event.target.value)}
                  placeholder="اكتب السؤال بوضوح..."
                  rows={2}
                />
              </label>
              <div className="answer-options-grid">
                {options.map((option, index) => (
                  <label
                    className={`answer-option-field ${correctIndex === index ? "is-correct" : ""}`}
                    key={index}
                  >
                    <input
                      className="correct-radio"
                      type="radio"
                      name={`correct-answer-${session.id}`}
                      checked={correctIndex === index}
                      onChange={() => setCorrectIndex(index)}
                      aria-label={`اجعل الخيار ${index + 1} الإجابة الصحيحة`}
                    />
                    <span className="option-letter">{String.fromCharCode(65 + index)}</span>
                    <input
                      className="option-input"
                      required
                      maxLength={120}
                      value={option}
                      onChange={(event) => updateOption(index, event.target.value)}
                      placeholder={`الخيار ${index + 1}`}
                    />
                    {options.length > 2 && (
                      <button
                        className="remove-option"
                        type="button"
                        onClick={() => removeOption(index)}
                        aria-label={`حذف الخيار ${index + 1}`}
                      >
                        <Minus size={14} />
                      </button>
                    )}
                  </label>
                ))}
              </div>
              <button
                className="add-option-button"
                type="button"
                disabled={options.length >= 6}
                onClick={() => setOptions((current) => [...current, ""])}
              >
                <Plus size={15} /> إضافة اختيار
              </button>
              <p className="form-hint">اختَر الدائرة بجوار الخيار الصحيح.</p>
              <button className="button-primary submit-question-button" type="submit">إضافة السؤال</button>
            </form>
          ) : (
            <button className="open-question-form-button" type="button" onClick={() => setFormOpen(true)}>
              <Plus size={17} /> أضف سؤالًا يدويًا
            </button>
          )}
        </>
      )}
    </section>
  );
}