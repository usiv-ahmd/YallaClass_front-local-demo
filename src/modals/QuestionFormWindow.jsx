import { X, Plus, Minus, FilePen, FilePlus } from "lucide-react";
import { QUESTION_DURATIONS } from "../hooks/useQuestionsForm.js";

export default function QuestionFormWindow({ question, sessionId }) {
  const isEditing = Boolean(question.editingId);

  return (
    <div className="opened-window-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) question.cancelForm(); }}>
      <section className="card question-form-window" role="dialog" aria-modal="true" aria-labelledby="question-form-title">
        <div className="form-heading">
          <div className="question-field-stamp">
            {isEditing ? <FilePen size={22} /> : <FilePlus size={22} />}
          </div>

          <div>
            <span className="create-session-kicker">{isEditing ? 'سؤال جديد / إضافة يدوية' : 'تعديل السؤال / تحديث المحتوى'}</span>
            <h2 className="question-form-title">{isEditing ? "تعديل السؤال" : "سؤال جديد"}</h2>
          </div>

          <button className="close-button windowed-close-button" type="button" onClick={question.cancelForm} aria-label="إغلاق">
            <X size={17} />
          </button>
        </div>

        <form className="question-form" onSubmit={question.addQuestion}>
          <label className="field-label">
            نص السؤال
            <textarea
              required
              maxLength={240}
              rows={2}
              value={question.text}
              onChange={(e) => question.setText(e.target.value)}
              placeholder="اكتب السؤال بوضوح..."
            />
          </label>

          <div className="answer-options-grid">
            {question.options.map((option, index) => (
              <label
                className={`answer-option-field ${
                  question.correctIndex === index ? "is-correct" : ""
                }`}
                key={index}
              >
                <input
                  className="correct-radio"
                  type="radio"
                  name={`correct-answer-${sessionId}`}
                  checked={question.correctIndex === index}
                  onChange={() => question.setCorrectIndex(index)}
                />
                <span className="option-letter">
                  {String.fromCharCode(65 + index)}
                </span>
                <input
                  className="option-input"
                  required
                  maxLength={120}
                  value={option}
                  onChange={(e) => question.updateOption(index, e.target.value)}
                  placeholder={`الخيار ${index + 1}`}
                />
                {question.options.length > 2 && (
                  <button
                    className="remove-option"
                    type="button"
                    onClick={() => question.removeOption(index)}
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
            disabled={question.options.length >= 6}
            onClick={() => question.setOptions((cur) => [...cur, ""])}
          >
            <Plus size={15} /> إضافة اختيار
          </button>

          <div className="field-label">
            مدة السؤال (بالثواني)
            <div className="duration-picker">
              {QUESTION_DURATIONS.map((sec) => (
                <button
                  type="button"
                  key={sec}
                  className={`duration-chip ${
                    Number(question.duration) === sec ? "selected" : ""
                  }`}
                  onClick={() => question.setDuration(sec)}
                >
                  <b>{sec}</b>
                  <small>ث</small>
                </button>
              ))}
            </div>
          </div>

          <div className="question-form-actions">
            <button className="button question-form-button button-ghost" type="button" onClick={question.cancelForm}>
              إلغاء
            </button>
            <button className="button question-form-button button-primary" type="submit">
              {isEditing ? "حفظ التعديلات" : "إضافة السؤال"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}