import { CircleStop, X } from 'lucide-react';

export default function EndLiveSessionAlert({ onClose, onConfirm, sessionCode }) {

  return (
    <div className="opened-window-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="card End-live" role="dialog" aria-modal="true" aria-labelledby="end-session-title">
        <div className="End-live-heading">
          <div className="End-live-stamp">
            <CircleStop size={22} />
          </div>

          <div>
            <span className="End-live-kicker">تأكيد الإنهاء / خطوة أخيرة</span>
            <h2 className="end-session-title">إنهاء الحصة</h2>
          </div>

          <button className="close-button windowed-close-button" type="button" onClick={onClose} aria-label="إغلاق">
            <X size={17} />
          </button>
        </div>

        <div className="end-live-content">
          <p>
            إنهاء الحصة <strong style={{ color: 'var(--text-primary)' }}>"{sessionCode}"</strong> الحية والعودة للقائمة؟ 
          </p>

          <div className="end-live-actions">
            <button className="button end-live-button white-background" type="button" onClick={onClose}>
              إلغاء
            </button>
            <button className="button end-live-button confirm-end-live-button" type="button" onClick={onConfirm}>
              نعم، انهي الحصة
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}