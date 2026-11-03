import { CalendarDays, ChevronLeft, Clock3, Plus, Sparkles, UsersRound, Users, ListChecks, Play, Pause, SkipForward,
  Eye, LogOut, Check, CheckCheck, X, RotateCcw, Lock, Trash2, UploadCloud, FileText, BookOpen, Settings2,
  BookOpenCheck, Minus, Clock, Timer, ClipboardList, Trophy, KeyRound, ArrowLeft } from "lucide-react";

import { initialMockData } from "../mock/mockData.js";

import "../styles/student-page.css";

function StudentView() {
  return (
    <>
      <div className="page">
        <headers className="card page-heading">
          <div>
            <span className="page-eyebrow">
              <span className="eyebrow-star"><Sparkles size={13} /></span> مساحة المحاضر
            </span>
            <h1>إدارة الحصص <em>والأسئلة</em></h1>
            <p>اختر حصة لتحديث محتواها، رفع الماتريال، ومتابعة أداء الطلاب.</p>
          </div>

          <div className="heading-meta">
            <div className="chip today-chip">
              <CalendarDays size={16} /><span></span>
            </div>
          </div>
        </headers>

        <main className="dashboard">
          <div className="student-layout">
            {!null ? (
              <div className="card no-session-state panel">
                <div className="card-heading-row">
                  <div className="no-session-icon"><CalendarDays size={26} /></div>
                  <h2>مفيش اي حصص متجدوله معاك</h2>
                </div>
                <p>
                  اتواصل مع المدرس بتاعك عشان يضيفك للحصه.
                </p>
                <button className="button button-primary" type="button" onClick={null}>
                  <Plus size={17} /> ابعت للمدرس بتاعك
                </button>
              </div>
            ) : (
              <section className="session-workspace"></section>
            )}

            
            <aside className="instructor-sidebar sessions-sidebar-modern">
              <div className="card material-upload-card">
                <div className="card-heading-row">
                  <div className="no-session-icon"><KeyRound size={26} /></div>
                  <div>
                    <span className="section-eyebrow">هتدخل على طول</span>
                    <h2>معاك كود الجلسة؟</h2>
                  </div>
                </div>

                <p>اكتب الكود اللي قاله المحاضر. لو أنت متسجل في الحصة أصلًا، هنوجّهك لها من غير ما نحسبك مرتين.</p>
                <form className="join-form" onSubmit={null} noValidate>
                  <label htmlFor="session-code">كود الجلسة</label>
                    <div className="join-input-wrap">
                      <KeyRound size={17} aria-hidden="true" />
                      <input
                        id="session-code"
                        type="text"
                        autoComplete="off"
                        autoCapitalize="characters"
                        maxLength={24}
                        placeholder="مثال: PHY-101"
                        value={null}
                        onChange={null}
                      />
                    </div>
                    <button className="button button-primary join-submit" type="submit">ادخل الجلسة <ArrowLeft size={18} /></button>
                  </form> 
              </div>
            </aside>
          </div>
        </main>
      </div>
    </>
  );
}

export default StudentView;
