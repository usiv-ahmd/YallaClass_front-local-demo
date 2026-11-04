import {
  CalendarDays, ChevronLeft, Clock3, Plus, Sparkles, UsersRound, Users, ListChecks, Play, Pause, SkipForward,
  Eye, LogOut, Check, CheckCheck, X, RotateCcw, Lock, Trash2, UploadCloud, FileText, BookOpen, Book, Settings2,
  BookOpenCheck, Minus, Clock, Timer, ClipboardList, Trophy, KeyRound, ArrowLeft,
  FolderOpen, LockKeyhole, EyeOff } from "lucide-react";
import { useMemo, useState } from "react";

import { currentUser } from "../mock/currentUser";
import { getStudentSessions } from "../services/studentSessions";

import "../styles/student-page.css";

function StudentView() {

  const mySessions = useMemo(
    () => getStudentSessions(currentUser.id),
    [currentUser.id]
  );

  const upcoming  = mySessions.filter((s) => s.status === "scheduled");
  const completed = mySessions.filter((s) => s.status === "completed");

  const [code, setCode] = useState("");

  const handleJoin = (e) => {
    e.preventDefault();
    const target = mySessions.find(
      (s) => s.code.toLowerCase() === code.trim().toLowerCase()
    );
    if (!target) {
      // رسالة "كود غير صحيح" — سيبهالك لاحقًا
      return;
    }
    // scroll + highlight لاحقًا لما تفعّل focusedSessionId
  };

  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [questionsSession, setQuestionsSession] = useState(null);

  const handleViewQuestions = (session) => {
    setQuestionsSession(session);
  };

  return (
    <>
      <div className="page">
        <header className="card page-heading">
          <div>
            <span className="page-eyebrow">
              <span className="eyebrow-star"><Sparkles size={13} /></span> مساحة الطالب
            </span>
            <h1>حصصك ومذاكرتك <em>مع يلا كلاس</em></h1>
            <p>ذاكر الدرس اللي رفعه المحاضر، أو ادخل على الجلسة بالكود.</p>
          </div>

          <div className="heading-meta">
            <div className="chip today-chip">
              <CalendarDays size={16} /><span></span>
            </div>
          </div>
        </header>

        <main className="dashboard">
          <div className="student-layout">
            {mySessions.length === 0 ? (
              <div className="card">
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
              <section className="session-workspace">
                <div className="card stack-card">
                  <div className="card-heading">
                    <div className="card-heading-title">
                      <span className="card-icon yellow"><Book size={26} /></span>
                      <div>
                        <span className="card-eyebrow">الشرح والملفات اللي المحاضر جهّزها ليك</span>
                        <h2>حصصي وملفات الحصة</h2>
                      </div>
                    </div>
                    
                    <span className="count-pill">{mySessions.length} {mySessions.length === 1 ? "حصة" : "حصص"}</span>
                  </div>

                  {mySessions.map((session) =>
                    session.status === "completed" ? (
                      /* ================= كارت المكتملة ================= */
                      <article className="field session-field" key={session.id} id={`session-${session.id}`}>
                        <div className="session-field-topline">
                          <span className="session-status"><span />خلصت</span>
                          <span className="session-code">{session.code}</span>
                        </div>

                        <div className="session-field-title-row">
                          <span className="session-field-subject-icon"><BookOpen size={22} /></span>
                          <div>
                            <h3>{session.title}</h3>
                            <p>{session.subject || "بدون مادة"}</p>
                          </div>
                        </div>

                        <div className="session-meta">
                          <span>
                            <CalendarDays size={16} />
                            <small>التاريخ</small>
                            {session.date}
                          </span>
                        </div>

                        {session.files?.length > 0 && (
                          <div className="materials-block">
                            <div className="materials-block-heading">
                              <span><FolderOpen size={18} />ماتيريال</span>
                            </div>
                            <div className="material-files">
                              {session.files.map((file) => (
                                <button
                                  type="button"
                                  className="material-file"
                                  key={file.id}
                                  onClick={() => setSelectedMaterial({ file, session })}
                                >
                                  <span className="material-file-icon"><FileText size={20} /></span>
                                  <span className="material-file-copy">
                                    <strong>{file.name}</strong>
                                    <small>ملف {file.name.split(".").pop()}</small>
                                  </span>
                                  <span className="material-file-open">
                                    شوف الماتيريال <ArrowLeft size={15} />
                                  </span>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {session.myStats?.attended ? (
                          <div className="session-stats">
                            <span>صح: {session.myStats.correctAnswers}</span>
                            <span>غلط: {session.myStats.wrongAnswers}</span>
                            <span>Score: {session.myStats.score}</span>
                          </div>
                        ) : (
                          <p className="no-materials">
                            <EyeOff size={16} />محضرتش الجلسة دي
                          </p>
                        )}

                        <div className="session-field-footer">
                          {session.myStats?.attended && session.questions?.length > 0 ? (
                            <button
                              type="button"
                              className="button button-primary"
                              onClick={() => handleViewQuestions(session)}
                            >
                              اعرض الأسئلة <ArrowLeft size={17} />
                            </button>
                          ) : (
                            <span className="session-not-ready">
                              <Clock3 size={15} />
                              {!session.myStats?.attended
                                ? "محضرتش، فمفيش نتايج"
                                : "مفيش أسئلة"}
                            </span>
                          )}
                        </div>
                      </article>
                    ) : (
                      /* ================= كارت المجدولة ================= */
                      <article
                        key={session.id}
                        id={`session-${session.id}`}
                        className="field session-field"
                      >
                        <div className="session-field-topline">
                          <span className="session-status"><span />مسجل</span>
                          <span className="session-code">{session.code}</span>
                        </div>

                        <div className="session-field-title-row">
                          <span className="session-field-subject-icon"><BookOpen size={22} /></span>
                          <div>
                            <h3>{session.title}</h3>
                            <p>{session.subject || "بدون مادة"}</p>
                          </div>
                        </div>

                        <div className="session-meta">
                          <span>
                            <CalendarDays size={16} />
                            <small>التاريخ</small>
                            {session.date}
                          </span>
                          <span>
                            <Clock3 size={16} />
                            <small>الوقت</small>
                            {session.time || "—"}
                          </span>
                        </div>

                        <div className="materials-block">
                          <div className="materials-block-heading">
                            <span><FolderOpen size={18} />ماتيريال</span>
                            <small>لطلاب الجلسة فقط</small>
                          </div>
                          {session.files?.length ? (
                            <div className="material-files">
                              {session.files.map((file) => (
                                <button
                                  type="button"
                                  className="material-file"
                                  key={file.id}
                                  onClick={() => setSelectedMaterial({ file, session })}
                                >
                                  <span className="material-file-icon"><FileText size={20} /></span>
                                  <span className="material-file-copy">
                                    <strong>{file.name}</strong>
                                    <small>ملف {file.name.split(".").pop()}</small>
                                  </span>
                                  <span className="material-file-open">
                                    شوف الماتيريال <ArrowLeft size={15} />
                                  </span>
                                </button>
                              ))}
                            </div>
                          ) : (
                            <p className="no-materials">
                              <LockKeyhole size={16} />مفيش ماتيريال
                            </p>
                          )}
                        </div>

                        {/* الأسئلة مقفولة — مفيش زرار */}
                        <div className="session-field-footer">
                          <span className="session-questions-hidden">
                            <LockKeyhole size={15} />الأسئلة هتفتح بعد الجلسة
                          </span>
                          <span className="session-not-ready">
                            <Clock3 size={15} />الجلسة لسه مبدأتش
                          </span>
                        </div>
                      </article>
                    )
                  )}
                </div>
              </section>
            )}

            
            <aside className="student-sidebar">
              <div className="card stack-card">
                <div className="card-heading">
                  <div className="card-heading-title">
                    <span className="card-icon yellow"><KeyRound size={26} /></span>
                    <div>
                      <span className="card-eyebrow">هتدخل على طول</span>
                      <h2>معاك كود الجلسة؟</h2>
                    </div>
                  </div>
                </div>

                <p className="card-description">اكتب الكود اللي قاله المحاضر. لو أنت متسجل في الحصة أصلًا، هنوجّهك لها من غير ما نحسبك مرتين.</p>

                <form className="join-form" onSubmit={handleJoin} noValidate>
                  <label htmlFor="session-code">كود الجلسة</label>
                  <div className="join-input-wrap">
                    <KeyRound size={17} aria-hidden="true" />
                    <input id="session-code" type="text" autoComplete="off" autoCapitalize="characters" maxLength={24} placeholder="مثال: PHY-101" value={code} onChange={(e) => setCode(e.target.value)}/>
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
