import { useState } from 'react';
import { CalendarDays, Clock3, X } from 'lucide-react';

export default function CreateSession({ onClose, onSubmit, initialData }) {
  const isEditing = !!initialData;

  const [title, setTitle] = useState(initialData?.title || '');
  const [subject, setSubject] = useState(initialData?.subject || '');
  const [date, setDate] = useState(initialData?.date || '');
  const [time, setTime] = useState(initialData?.time || '');
  const [duration, setDuration] = useState(initialData?.duration?.toString() || '30');

  const cannotBeDraft = initialData?.status === "scheduled";

  const handleSubmit = (event) => {
    event.preventDefault();
  
  const submitter = event.nativeEvent.submitter;
  const newStatus = submitter?.value === 'draft' ? 'draft' : 'scheduled';
  
  onSubmit?.({ 
    title, 
    subject, 
    date, 
    time, 
    duration, 
    status: newStatus 
  });
};

  return (
    <div className="create-session-backdrop" role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <section className="create-session" role="dialog" aria-modal="true" aria-labelledby="create-session-title">
        <div className="create-session-heading">
          <div className="create-session-stamp">
            <CalendarDays size={22} />
          </div>
          <div>
            <span className="create-session-kicker">{isEditing ? 'تعديل الجلسة' : 'جلسة جديدة / ٠١'}</span>
            <h2 id="create-session-title">{isEditing ? 'عدّل تفاصيل جلستك' : 'حدّد تفاصيل جلستك'}</h2>
          </div>
          <button className="create-session-close" type="button" onClick={onClose} aria-label="إغلاق">
            <X size={19} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="create-session-form">
          <label className="create-session-field">
            اسم الجلسة
            <input autoFocus required maxLength={80} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="مثال: مراجعة قوانين الحركة" />
          </label>

          <label className="create-session-field">
            المادة / الصف
            <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="مثال: الفيزياء · الصف الثاني الثانوي" />
          </label>

          <div className="create-session-fields-row">
            <label className="create-session-field">
              التاريخ
              <span className="create-session-field-control">
                <CalendarDays size={15} />
                <input type="date" required value={date} onChange={(e) => setDate(e.target.value)} />
              </span>
            </label>

            <label className="create-session-field">
              الوقت
              <span className="create-session-field-control">
                <Clock3 size={15} />
                <input type="time" required value={time} onChange={(e) => setTime(e.target.value)} />
              </span>
            </label>
          </div>

          <label className="create-session-field">
            مدة الجلسة
            <select value={duration} onChange={(e) => setDuration(e.target.value)}>
              <option value="30">٣٠ دقيقة</option>
              <option value="45">٤٥ دقيقة</option>
              <option value="60">ساعة</option>
              <option value="90">ساعة ونصف</option>
            </select>
          </label>

          <div className="create-session-actions">
            <button className="create-session-btn create-session-btn--secondary" type="button" onClick={onClose}>
              إلغاء
            </button>
            
            {!cannotBeDraft && (
              <button className="create-session-btn create-session-btn--secondary" type="submit" value="draft">
                حفظ لوقت لاحق
              </button>
            )}
            
            <button className="create-session-btn create-session-btn--primary" type="submit" value="scheduled">
              <CalendarDays size={16} />
              {isEditing ? 'حفظ التعديلات' : 'حفظ الموعد'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}