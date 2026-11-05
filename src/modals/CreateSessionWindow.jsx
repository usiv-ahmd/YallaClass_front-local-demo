import { useState } from 'react';
import { CalendarDays, Clock3, X } from 'lucide-react';

export default function CreateSessionWindow({ onClose, onSubmit, initialData }) {
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
    <div className="opened-window-backdrop" role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <section className="card modal-window" role="dialog" aria-modal="true" aria-labelledby="create-session-title">
        <div className="card-heading">
          <div className="card-heading-title">
            <div className="card-icon turquoise"><CalendarDays size={22} /></div>
            <div>
              <span className="card-kicker">{isEditing ? 'تعديل الجلسة' : 'جلسة جديدة / ٠١'}</span>
              <h2 className="modal-title">{isEditing ? 'عدّل تفاصيل جلستك' : 'حدّد تفاصيل جلستك'}</h2>
            </div>
          </div>
          <button className="modal-close-button" type="button" onClick={onClose} aria-label="إغلاق">
            <X size={17} />
          </button>
        </div>

        <form className="modal-content" onSubmit={handleSubmit}>
          <label className="create-session-field">
            اسم الجلسة
            <input autoFocus required maxLength={80} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="مثال: مراجعة قوانين الحركة" />
          </label>

          <label className="create-session-field">
            المادة / الصف
            <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="مثال: الفيزياء · الصف الثاني الثانوي" />
          </label>

          <div className="modal-actions">
            <button className="button modal-button white" type="button" onClick={onClose}>
              إلغاء
            </button>
            
            <button className="button modal-button turquoise" type="submit" value="scheduled">
              <CalendarDays size={16} />
              {isEditing ? 'حفظ التعديلات' : 'حفظ الحصة'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}