import { useState } from "react";
import { RotateCcw, X, Check } from "lucide-react";

export default function ReopenSessionAlert({
  pendingCount,
  totalStudents,
  defaultAllowEdit = false,
  onClose,
  onConfirm,
}) {
  const [allowEdit, setAllowEdit] = useState(defaultAllowEdit);

  const handleConfirm = () => {
    onConfirm(allowEdit);
    onClose();
  };

  return (
    <div className="opened-window-backdrop" onClick={onClose}>
      <div className="card reopen" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className="reopen-heading">
          <div className="reopen-stamp">
            <RotateCcw size={22} />
          </div>

          <div>
            <span className="reopen-kicker">تأكيد الإنهاء / خطوة أخيرة</span>
            <h2 id="reopen-title">إعادة فتح الجولة</h2>
          </div>

          <button className="close-button windowed-close-button" type="button" onClick={onClose} aria-label="إغلاق">
            <X size={17} />
          </button>
        </div>

        <div className="end-live-content">
          <p>
            هيتفتح لـ <b>{pendingCount}</b> من <b>{totalStudents}</b> طالب لسه
            مكملوش. اللي خلص خلاص مقفول عليه.
          </p>

          <label className="reopen-toggle">
            <input type="checkbox" checked={allowEdit} onChange={(e) => setAllowEdit(e.target.checked)}/>
            <span>السماح للطالب بتعديل إجابته</span>
          </label>
          <p className="muted">
            {allowEdit
              ? "الطالب يقدر يغيّر إجابته القديمة ويكمّل الفاضي."
              : "إجاباته القديمة زي ما هي، هيكمّل الأسئلة الفاضية بس."}
          </p>

          <div className="end-live-actions">
            <button className="button ReopenSession-button white-background" type="button" onClick={onClose}>
              إلغاء
            </button>
            <button className="button ReopenSession-button button-primary" type="button" onClick={handleConfirm}>
              <Check size={16} /> افتح الجولة
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}