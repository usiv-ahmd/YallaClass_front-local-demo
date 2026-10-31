import { ClipboardList } from 'lucide-react';

export default function Attendanceboard({ students = [], expectedCount }) {
  const attendedCount = students.filter((s) => s.attended).length;

  return (
    <div className="card attendance-container">
      <div className="attendance-header">
        <div className="title-section">
          <div className="panel-icon attendance-icon"><ClipboardList size={19} /></div>
          <h2 className="attendance-title">الحضور والتفاعل</h2>
        </div>
        <span className="attendance-count">
          {attendedCount} / {expectedCount}
        </span>
      </div>

      <div className="attendance-table">
        <div className="attendance-row attendance-row--head">
          <span className="col-name">الاسم</span>
          <span className="col-correct">✔ صح</span>
          <span className="col-wrong">✘ غلط</span>
          <span className="col-attended">حضور</span>
          <span className="col-interacted">تفاعل</span>
        </div>

        {students.map((student) => (
          <div key={student.id} className="attendance-row">
            <span className="col-name">{student.name}</span>
            <span className="col-correct">{student.correctAnswers}</span>
            <span className="col-wrong">{student.wrongAnswers}</span>
            <span className="col-attended">
              <span className={`check ${student.attended ? 'check--yes' : 'check--no'}`}>
                {student.attended ? '✓' : '✕'}
              </span>
            </span>
            <span className="col-interacted">
              <span className={`check ${student.interacted ? 'check--yes' : 'check--no'}`}>
                {student.interacted ? '✓' : '✕'}
              </span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}