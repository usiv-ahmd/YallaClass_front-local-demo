import { Trash2, X } from 'lucide-react';

export default function DeleteSession({ onClose, onConfirm, sessionTitle }) {

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
        aria-labelledby="delete-session-title"
      >
        <div className="create-session-heading">
          <div className="create-session-stamp">
            <Trash2 size={22} />
          </div>

          <div>
            <span className="create-session-kicker">تأكيد الحذف / خطوة أخيرة</span>
            <h2 id="delete-session-title">حذف الجلسة</h2>
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

        <div className="create-session-form">
          <p style={{ fontSize: '15px', lineHeight: '1.6', color: 'var(--text-secondary)' }}>
            هل أنت متأكد من حذف الحصة <strong style={{ color: 'var(--text-primary)' }}>"{sessionTitle}"</strong>؟
            <br />
            لا يمكن التراجع عن هذا الإجراء نهائياً.
          </p>

          <div className="create-session-actions">
            <button
              className="create-session-btn create-session-btn--secondary"
              type="button"
              onClick={onClose}
            >
              إلغاء
            </button>
            <button
              className="create-session-btn create-session-btn--danger"
              type="button"
              onClick={onConfirm}
            >
              نعم، احذف الجلسة
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}