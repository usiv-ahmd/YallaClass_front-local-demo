import { useState } from 'react';
import { CalendarDays, Clock3, X } from 'lucide-react';

export default function CreateSession({ onClose, onSubmit }) {
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [duration, setDuration] = useState('30');

  const handleSubmit = (event) => {
  event.preventDefault();
  
  const submitter = event.nativeEvent.submitter;
  const status = submitter?.value === 'draft' ? 'draft' : 'scheduled';
  
  onSubmit?.({ title, subject, date, time, duration, status });
};

  return (
    <div
      className="create-session-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className="create-session"
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-session-title"
      >
        <div className="create-session-heading">
          <div className="create-session-stamp">
            <CalendarDays size={22} />
          </div>

          <div>
            <span className="create-session-kicker">جلسة جديدة / ٠١</span>
            <h2 id="create-session-title">حدّد تفاصيل جلستك</h2>
          </div>

          <button
            className="create-session-close"
            type="button"
            onClick={onClose}
            aria-label="إغلاق"
          >
            <X size={19} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="create-session-form">
          <label className="create-session-field">
            اسم الجلسة
            <input
              autoFocus
              required
              maxLength={80}
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="مثال: مراجعة قوانين الحركة"
            />
          </label>

          <label className="create-session-field">
            المادة / الصف
            <input
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
              placeholder="مثال: الفيزياء · الصف الثاني الثانوي"
            />
          </label>

          <div className="create-session-fields-row">
            <label className="create-session-field">
              التاريخ
              <span className="create-session-field-control">
                <CalendarDays size={15} />
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(event) => setDate(event.target.value)}
                />
              </span>
            </label>

            <label className="create-session-field">
              الوقت
              <span className="create-session-field-control">
                <Clock3 size={15} />
                <input
                  type="time"
                  required
                  value={time}
                  onChange={(event) => setTime(event.target.value)}
                />
              </span>
            </label>
          </div>

          <label className="create-session-field">
            مدة الجلسة
            <select
              value={duration}
              onChange={(event) => setDuration(event.target.value)}
            >
              <option value="30">٣٠ دقيقة</option>
              <option value="45">٤٥ دقيقة</option>
              <option value="60">ساعة</option>
              <option value="90">ساعة ونصف</option>
            </select>
          </label>

          <div className="create-session-actions">
            <button
              className="create-session-btn create-session-btn--secondary"
              type="button"
              onClick={onClose}
            >
              إلغاء
            </button>
            <button
              className="create-session-btn saved-create-session-btn--primary"
              type="submit"
              value="draft"
            >
              حفظ لوقت لاحق
            </button>
            <button
              className="create-session-btn create-session-btn--primary"
              type="submit"
              value="scheduled"
            >
              <CalendarDays size={16} />
              حفظ الموعد
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}