import { Trash2, X } from 'lucide-react';

export default function DeleteSessionAlert({ onClose, onConfirm, sessionTitle }) {

  return (
    <div className="opened-window-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="card delete-session" role="dialog" aria-modal="true" aria-labelledby="delete-session-title">
        <div className="delete-session-heading">
          <div className="delete-session-stamp">
            <Trash2 size={22} />
          </div>

          <div>
            <span className="delete-session-kicker">تأكيد الحذف / خطوة أخيرة</span>
            <h2 className="delete-session-title">حذف الحصة</h2>
          </div>

          <button className="close-button windowed-close-button" type="button" onClick={onClose} aria-label="إغلاق">
            <X size={17} />
          </button>
        </div>

        <div className=".delete-session-content">
          <p>
            هل أنت متأكد من حذف الحصة <strong>"{sessionTitle}"</strong>؟
            <br />
            لا يمكن التراجع عن هذا الإجراء نهائياً.
          </p>

          <div className="delete-session-actions">
            <button className="button delete-session-button white-background" type="button" onClick={onClose}>
              إلغاء
            </button>
            <button className="button delete-session-button confirm-delete-button" type="button" onClick={onConfirm}>
              نعم، احذف الحصة
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}