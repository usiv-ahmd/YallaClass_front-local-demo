import { useState } from "react";
import { Sparkles, CalendarDays, Check, CheckCheck, Clock3, UsersRound, Play, Trash2, UploadCloud, FileText, BookOpen, Settings2, Plus, AlertTriangle } from "lucide-react";
import Questions from "./Questions.jsx";
import Leaderboard from './LeaderBoard.jsx';
import Attendanceboard from './AttendanceBoard.jsx';

export default function SessionsDetailes({
  session: selectedSession, 
  onEdit,
  onSchedule,
  students,
  handleFileUpload,
  requestDelete,
  isUploading,
  createSession,
  onQuestionsChange 
}) {

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  if (!selectedSession) {
    return (
      <div className="no-session-state panel">
        <div className="no-session-state panel"><div className="no-session-icon"><CalendarDays size={26} /></div><h2>أنشئ حصة جديدة او اختار حصة من حصصك</h2><p>حدّد ميعاد الحصة وبعدها أضف أسئلتك اليدوية. مساحة المادة جاهزة للربط لاحقًا.</p><button className="button-primary" type="button" onClick={createSession.open}><Plus size={17} /> إنشاء حصة جديدة</button></div>
      </div>
    );
  }

  return (
    <section className="session-workspace">
      <div className="rounded-div selected-session-header">
        <div className="selected-session-top">
          <div className="selected-session-main">
            <div className="session-detail-icon"><BookOpen size={23} /></div>
            <div className="session-title-block"><div className="detail-overline"><span className={`status-dot ${selectedSession.status}`} />{selectedSession.status === "draft" ? "مسودة" : selectedSession.status === "completed" ? "مكتملة" : "حصة مجدولة"}<span className="detail-overline-separator">/</span><p>{selectedSession.subject}</p><span className="detail-overline-separator">/</span><span>{selectedSession.code}</span></div><h2>{selectedSession.title}</h2></div>
          </div>
          {selectedSession.status === "draft" ? (
            <span className="overview-status overview-status-check">
              <Check size={16} />
              لم يتم تنبيه الطلاب بعد!
            </span>
          ) : selectedSession.status === "completed" ? (
            <span className="overview-status overview-status-completed">
              <CheckCheck size={16} />
              انتهت الحصة
            </span>
          ) : (
            <span className="overview-status overview-status-doublecheck">
              <CheckCheck size={16} />
              كل شيء جاهز للحصة
            </span>
          )}
          {selectedSession.status !== "completed" && (
            <>
              <button
                className="icon-button delete-session-button"
                type="button"
                onClick={() => requestDelete(selectedSession.id)}
                aria-label="حذف الحصة"
                title="حذف الحصة"
              >
                <Trash2 size={17} />
              </button>
              
              {selectedSession.status === "draft" ? (
                <button 
                  className="button-primary schedule-session-button" 
                  type="button" 
                  onClick={onSchedule}
                >
                  <CalendarDays size={16} /> جدول الحصة
                </button>
              ) : (
                <button 
                  className="button-primary launch-session-button" 
                  type="button" 
                  onClick={null}
                >
                  <Play size={16} fill="currentColor" /> ابدأ الحصة
                </button>
              )}
            </>
          )}
        </div>
        <div className="session-meta-row">
          <div className="session-meta-item"><span className="meta-icon"><CalendarDays size={16} /></span><span><small>التاريخ</small><strong>{selectedSession.date}</strong></span></div>
          <div className="session-meta-item"><span className="meta-icon"><Clock3 size={16} /></span><span><small>الموعد</small><strong>{selectedSession.time}</strong></span></div>
          <div className="session-meta-item"><span className="meta-icon"><UsersRound size={16} /></span><span><small>الطلاب</small><strong>{selectedSession.studentnumber} مشارك</strong></span></div>
          {selectedSession.status !== "completed" && (
            <button className="session-meta-settings" type="button" onClick={onEdit}>
              <Settings2 size={15} /> تفاصيل الحصة
            </button>
          )}
        </div>
      </div>
        
      <div className={selectedSession.status === "completed" ? "questions-flex" : "questions"}>
        <Questions 
          session={selectedSession} 
          onChange={onQuestionsChange} 
          isCompleted={selectedSession.status === "completed"} 
        />

        {selectedSession.status !== "completed" && (
          <div className="rounded-div screen material-upload-card">
            <div className="card-heading-row">
              <div className="control-icon control-icon-purple"><Sparkles size={19} /></div>
              <div><span className="section-eyebrow">الذكاء الاصطناعي</span><h2>ارفع ملف الشرح وهنعمل لك الاسئله</h2></div>
            </div>

            <div className="upload-box-container">
              <input 
                type="file" 
                id="material-upload-input" 
                accept=".pdf,.docx,.txt" 
                onChange={handleFileUpload}
                hidden 
              />
              <label htmlFor="material-upload-input" className="upload-dropzone">
                <UploadCloud size={26} />
                <span>{isUploading ? 'جاري تحليل المستند وتوليد الأسئلة...' : 'إسقاط ملف PDF جديد هنا أو اضغط للرفع'}</span>
                <small>سيتم استخراج أسئلة تلقائية بالذكاء الاصطناعي للجلسة الحالية</small>
              </label>

              {selectedSession.files && selectedSession.files.length > 0 && (
                <div className="attached-files-list">
                  {selectedSession.files.map((f, idx) => (
                    <div key={idx} className="attached-file-badge">
                      <FileText size={14} /> الملف المرفق: <b>{f.name}</b>
                      <a href={f.url} target="_blank" rel="noreferrer" style={{color: 'var(--C-yalla-turquoise)', marginRight: '8px'}}>
                        (عرض)
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {selectedSession.status === "completed" && (
        <div className="boards">
          <Attendanceboard students={students} expectedCount={selectedSession.studentnumber} />
          <Leaderboard students={students} />
        </div>
      )}
    </section>
  );
}