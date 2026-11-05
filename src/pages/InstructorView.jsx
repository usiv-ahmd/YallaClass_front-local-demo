import { CalendarDays, ChevronLeft, Clock3, Plus, Sparkles, UsersRound, Users, ListChecks, Play, Pause, SkipForward,
  Eye, LogOut, Check, CheckCheck, X, RotateCcw, Lock, Trash2, UploadCloud, FileText, BookOpen, Settings2,
  BookOpenCheck, Minus, Clock, Timer, ClipboardList, Trophy, Pencil } from "lucide-react";
import { useState } from "react";


import CreateSessionWindow from "../modals/CreateSessionWindow.jsx";
import DeleteSessionAlert from "../modals/DeleteSessionAlert.jsx";
import EndLiveSessionAlert from "../modals/EndLiveSessionAlert.jsx";
import ReopenSessionAlert from "../modals/ReopenSessionAlert.jsx";
import QuestionFormWindow from "../modals/QuestionFormWindow.jsx";

import useCreateSession from "../hooks/useCreateSession.js";
import useDeleteSession from "../hooks/useDeleteSession.js";
import useReopenSession from "../hooks/useReopenSession.js";
import useQuestionsForm, { getCorrectIndex, QUESTION_DURATIONS } from "../hooks/useQuestionsForm.js";
import useCountdown from "../hooks/useCountdown.js";
import { useSessions } from "../hooks/useSessions.js";
import { useLiveSession } from "../hooks/useLiveSession.js";

import { initialMockData } from "../mock/mockData.js";

import "../styles/Instructor-page.css";

function Attendanceboard({ students = [], expectedCount = students.length }) {
  const attendedCount = students.filter((s) => s.attended).length;
  return (
    <div className="card">
      <div className="card-heading">
        <div className="card-heading-title">
          <div className="card-icon small-card-icon blue">
            <ClipboardList size={19} />
          </div>
          <h2 className="attendance-title">الحضور والتفاعل</h2>
        </div>
        <span className="count-pill">{attendedCount} / {expectedCount}</span>
      </div>
      <table className="attendance-table">
        <thead>
          <tr>
            <th className="col-rank">#</th>
            <th className="col-name">الاسم</th>
            <th className="col-correct">✔ صح</th>
            <th className="col-wrong">✘ غلط</th>
            <th className="col-attended">حضور</th>
            <th className="col-interacted">تفاعل</th>
            <th className="col-score">Score</th>
            <th className="col-streak">Streak</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student, index) => (
            <tr key={student.id}>
              <td className="col-rank">{index + 1}</td>
              <td className="col-name">{student.name}</td>
              <td className="col-correct">{student.correctAnswers}</td>
              <td className="col-wrong">{student.wrongAnswers}</td>
              <td className="col-attended">
                <span className={`check ${student.attended ? "check-yes" : "check-no"}`}>
                  {student.attended ? "✓" : "✕"}
                </span>
              </td>
              <td className="col-interacted">
                <span className={`check ${student.interacted ? "check-yes" : "check-no"}`}>
                  {student.interacted ? "✓" : "✕"}
                </span>
              </td>
              <td className="col-score">{student.score}</td>
              <td className="col-streak">🔥 {student.highestStreak}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function InstructorView() {
  const data        = useSessions(initialMockData.session);
  const live        = useLiveSession(data.session, data.setSession);
  const formModal   = useCreateSession();
  const deleteModal = useDeleteSession();
  const reopenModal = useReopenSession();

  const question = useQuestionsForm({
    session: data.session,
    updateQuestions: data.updateQuestions,
  });

  const countdown = useCountdown({ active: live.isLive && live.liveState === "countdown", seconds: 3, onEnd: live.startQuestion });

  const today = new Intl.DateTimeFormat("ar-EG", { weekday: "long", day: "numeric", month: "long" }).format(new Date());

  // ── Handlers ─────────────────────────────────────
  const handleSaveSession = (formData) => {
    data.saveSession(formData);
    formModal.close();
  };

  const handleResetSession = () => {
    data.resetSession();
    deleteModal.close();
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (file && data.session) await data.uploadFile(file);
    e.target.value = "";
  };

  const handleRemoveFile = (idx) => data.removeFile(idx);
  const handleStartLiveSession = () => live.startLiveSession();

  // ── Live View ────────────────────────────────────
  if (live.isLive) {
    const students = live.liveSession?.students ?? [];
    const liveQuestions = live.liveSession?.questions ?? [];
    const currentQuestion = live.currentQuestion;
    const progress =
      live.totalQuestions === 0
        ? 0
        : ((live.currentQuestionIndex + (live.liveState === "reveal" || live.liveState === "finished" ? 1 : 0))
          / live.totalQuestions) * 100;

    return (
      <>
        <div className="page">
          <header className="card page-heading">
            <div>
              <span className="page-eyebrow">
                <span className="eyebrow-star"><Sparkles size={13} /></span> مساحة المدرس (جلسة حية)
              </span>
              <h1>الفصل صاحي؟ <em>يلا نلعب!</em></h1>
              <p>{live.liveSession?.title ?? "جلسة حية"}</p>
            </div>

            <div className="heading-meta">
              <button className="button button-primary red" type="button" onClick={live.requestEndLive}>
                إنهاء الجلسة والعودة
              </button>
              <div className="session-status">
                <span className={`chip session-status ${live.statusView.cls}`}>
                  <i /> {live.statusView.label}
                </span>
              </div>
              <div className="chip session-code">
                <small>كود الفصل</small>
                <b>{live.liveSession?.code ?? "—"}</b>
              </div>
            </div>
          </header>

          <main className="dashboard">
            {live.liveState !== "lobby" && live.liveState !== "countdown" && (
              <section className="card live-progress-card">
                <div className="live-progress-meta">
                  <span>
                    <ListChecks size={14} />
                    السؤال {Math.min(live.currentQuestionIndex + 1, live.totalQuestions)} من {live.totalQuestions}
                  </span>
                  <span>
                    <Users size={14} />
                    {students.length} طالب
                  </span>
                </div>
                <div className="live-progress-track">
                  <div className="live-progress-fill" style={{ width: `${progress}%` }} />
                </div>
              </section>
            )}
            <div className="layout">
              <aside className="instructor-sidebar">
                <section className="card sidebar-card">
                  <h3 className="live-controls-h3">التحكم</h3>
                  <div className="live-controls-buttons">
                    {live.liveState === "lobby" && (
                      <button className="button button-primary turquoise" onClick={live.startCountdown}>
                        <Play size={16} /> ابدأ الجلسة
                      </button>
                    )}
                    {live.liveState === "countdown" && (
                      <>
                        <button className="button button-primary turquoise" onClick={live.startQuestion}>
                          <SkipForward size={16} /> ابدأ السؤال دلوقتي
                        </button>
                        <button className="button ghost" onClick={live.cancelCountdown}>
                          <X size={16} /> إلغاء
                        </button>
                      </>
                    )}
                    {live.liveState === "question" && (
                      <>
                        <button className="button ghost" onClick={live.pauseQuestion}>
                          <Pause size={16} /> إيقاف مؤقت
                        </button>
                        <button className="button button-primary turquoise" onClick={live.revealAnswer}>
                          <Eye size={16} /> اعرض الإجابة
                        </button>
                      </>
                    )}
                    {live.liveState === "paused" && (
                      <>
                        <button className="button button-primary turquoise" onClick={live.resumeQuestion}>
                          <Play size={16} /> استكمال
                        </button>
                        <button className="button ghost" onClick={live.revealAnswer}>
                          <Eye size={16} /> اعرض الإجابة
                        </button>
                        <button className="button red" onClick={live.finishSession}>
                          <LogOut size={16} /> أنهِ الجولة
                        </button>
                      </>
                    )}
                    {live.liveState === "reveal" && (
                      !live.isLastQuestion ? (
                        <button className="button button-primary turquoise" onClick={live.nextQuestion}>
                          <SkipForward size={16} /> السؤال التالي
                        </button>
                      ) : (
                        <button className="button button-primary turquoise" onClick={live.finishSession}>
                          <Check size={16} /> أنهِ الجولة
                        </button>
                      )
                    )}
                    {live.liveState === "finished" && (
                      <>
                        <button className="button button-primary turquoise" type="button" onClick={reopenModal.open} disabled={live.pendingStudents.length === 0} title={live.pendingStudents.length === 0 ? "كل الطلاب خلصوا" : "افتح الجولة للمتأخرين بس"}>
                          <RotateCcw size={16} /> افتح للمتأخرين ({live.pendingStudents.length})
                        </button>
                        <button className="button ghost" type="button" onClick={live.requestEndLive}>
                          <LogOut size={16} /> خروج وإغلاق الجلسة
                        </button>
                      </>
                    )}
                    {live.liveState === "reopened" && (
                      <>
                        <button className="button button-primary turquoise" type="button" onClick={live.closeReopenedRound}>
                          <Lock size={16} /> اقفل الجولة
                        </button>
                        <button className="button ghost" type="button" onClick={live.requestEndLive}>
                          <LogOut size={16} /> خروج
                        </button>
                      </>
                    )}
                  </div>
                </section>

                <section className="card sidebar-card">
                  <h3><ListChecks size={16} /> الأسئلة ({live.totalQuestions})</h3>
                  {liveQuestions.length === 0 ? (
                    <p className="muted">مفيش أسئلة في الجلسة دي.</p>
                  ) : (
                    <ol className="live-questions-list">
                      {liveQuestions.map((item, idx) => {
                        const isCurrent = idx === live.currentQuestionIndex;
                        const isDone    = idx < live.currentQuestionIndex;
                        return (
                          <li key={item.id} className={[isCurrent && "is-current", isDone && "is-done"].filter(Boolean).join(" ")}>
                            <span className="q-index">{idx + 1}</span>
                            <span className="q-text">{item.question}</span>
                            {isDone && <Check size={14} className="q-done-icon" />}
                            {isCurrent && <span className="q-live-dot" />}
                          </li>
                        );
                      })}
                    </ol>
                  )}
                </section>
              </aside>

              <section className="live-workspace">
                <section className="screen card live-question-field">
                  <div className="live-question-field-content">
                    {live.liveState === "lobby" && (
                      <div className="live-lobby">
                        <div className="live-lobby-icon"><Users size={42} /></div>
                        <h2>مستنيين الطلاب ينضموا...</h2>
                        <p>لما تجهز، اضغط <b>ابدأ الجلسة</b>. كود الفصل: <b>{live.liveSession?.code ?? "—"}</b></p>
                        <div className="live-lobby-pulse" />
                      </div>
                    )}
                    {live.liveState === "countdown" && (
                      <div className="live-countdown">
                        <span className="live-countdown-badge"><Timer size={14} /> العدّ التمهيدي</span>
                        <div className="live-countdown-number">{countdown.remaining}</div>
                        <p>استعدّوا... السؤال جاي</p>
                      </div>
                    )}
                    {(live.liveState === "question" || live.liveState === "paused") && currentQuestion && (() => {
                      const total = Number(currentQuestion.duration) || 30;
                      const pct   = total > 0 ? Math.max(0, Math.min(100, (live.timeLeft / total) * 100)) : 0;
                      return (
                        <div className={`live-question ${live.liveState === "paused" ? "is-paused" : ""}`}>
                          <div className="live-question-head">
                            <span className="badge">{currentQuestion.type === "mcq" ? "اختيار من متعدد" : currentQuestion.type}</span>
                            {currentQuestion.source === "ai" && <span className="badge badge-ai">AI</span>}
                            <span className={`badge badge-timer ${live.timeLeft <= 5 && live.timeLeft > 0 ? "is-warning" : ""}`}>
                              <Timer size={12} /> {live.timeLeft} ث
                            </span>
                            {live.liveState === "paused" && (
                              <span className="badge badge-warn"><Pause size={12} /> موقوف مؤقتًا</span>
                            )}
                          </div>
                          <div className="live-question-timer">
                            <div className={`live-question-timer-fill ${live.timeLeft <= 5 && live.timeLeft > 0 ? "is-warning" : ""}`} style={{ width: `${pct}%` }} />
                          </div>
                          <h2 className="live-question-text">{currentQuestion.question}</h2>
                          <ul className="live-options">
                            {(currentQuestion.options ?? []).map((opt, idx) => (
                              <li key={idx} className="live-option">
                                <span className="option-letter">{String.fromCharCode(65 + idx)}</span>
                                <span>{opt}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      );
                    })()}
                    {live.liveState === "reveal" && currentQuestion && (
                      <div className="live-question is-reveal">
                        <div className="live-question-head">
                          <span className="badge badge-success"><Check size={12} /> مراجعة الإجابة</span>
                        </div>
                        <h2 className="live-question-text">{currentQuestion.question}</h2>
                        <ul className="live-options">
                          {(currentQuestion.options ?? []).map((opt, idx) => {
                            const isCorrect = idx === getCorrectIndex(currentQuestion);
                            return (
                              <li key={idx} className={`live-option ${isCorrect ? "is-correct" : "is-wrong"}`}>
                                <span className="option-letter">{String.fromCharCode(65 + idx)}</span>
                                <span>{opt}</span>
                                {isCorrect && <Check size={16} className="option-check" />}
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    )}
                    {live.liveState === "finished" && (
                      <div className="live-finished">
                        <Sparkles size={48} />
                        <h2>خلصت الجولة!</h2>
                        <p>
                          {live.pendingStudents.length > 0
                            ? `لسه ${live.pendingStudents.length} من ${students.length} طالب مكملوش.`
                            : "كل الطلاب خلصوا — تقدر تقفل الجلسة."}
                        </p>
                        {live.pendingStudents.length > 0 && (
                          <button type="button" className="button button-primary turquoise" onClick={reopenModal.open}>
                            <RotateCcw size={16} /> افتح للمتأخرين ({live.pendingStudents.length})
                          </button>
                        )}
                      </div>
                    )}
                    {live.liveState === "reopened" && (
                      <div className="live-reopened">
                        <div className="live-lobby-icon"><RotateCcw size={42} /></div>
                        <h2>الجولة مفتوحة للمتأخرين</h2>
                        <p>مفتوحة لـ <b>{live.pendingStudents.length}</b> من <b>{students.length}</b> طالب لسه مكملوش.</p>
                        <span className={`badge ${live.allowAnswerEdit ? "badge-warn" : "badge-success"}`}>
                          {live.allowAnswerEdit ? "مسموح بتعديل الإجابات القديمة" : "الإجابات القديمة مقفولة"}
                        </span>
                      </div>
                    )}
                  </div>
                </section>

                <Attendanceboard students={students} expectedCount={live.liveSession?.studentnumber} />
              </section>
            </div>
          </main>
        </div>

        {live.isEndConfirmOpen && (
          <EndLiveSessionAlert
            onClose={live.cancelEndLive}
            onConfirm={() => live.confirmEndLive()}
            sessionCode={live.liveSession?.code}
          />
        )}

        {reopenModal.isOpen && (
          <ReopenSessionAlert
            pendingCount={live.pendingStudents.length}
            totalStudents={students.length}
            defaultAllowEdit={false}
            onClose={reopenModal.close}
            onConfirm={(allowEdit) => {
              live.confirmReopen(allowEdit);
              reopenModal.close();
            }}
          />
        )}
      </>
    );
  }

  // ── Dashboard ────────────────────────────────────

  return (
    <>
      <div className="page">
        <header className="card page-heading">
          <div>
            <span className="page-eyebrow">
              <span className="eyebrow-star"><Sparkles size={13} /></span> مساحة المحاضر
            </span>
            <h1>إدارة الحصة <em>والأسئلة</em></h1>
            <p>رفع الماتريال، ومتابعة أداء الطلاب.</p>
          </div>
          <div className="heading-meta">
            {!data.session ? (
              <button className="button button-primary red" type="button" onClick={formModal.open}>
                <Plus size={17} /> حصة جديدة
              </button>
            ) : (
              <button className="button button-primary red" type="button" onClick={handleStartLiveSession} disabled={!data.session?.questions?.length}>
                <Play size={16} fill="currentColor" /> ابدأ الحصة
              </button>
            )}
          </div>
        </header>

        <main className="dashboard">
          <div className="layout">
            {!data.session ? (
              <div className="card">
                <div className="card-heading">
                  <div className="card-heading-title">
                    <div className="card-icon yellow"><CalendarDays size={26} /></div>
                    <div><h2>اختار حصة او انشئ حصة جديدة</h2></div>
                  </div>
                </div>
                <p>
                  حدّد ميعاد الحصة وبعدها أضف أسئلتك اليدوية. او ارفع الملف وسيب الذكاء الاصطناعي يولد لك اسئله.<br/>
                  ابعت للطلاب كود الحصه.
                </p>
                <button className="button button-primary turquoise" type="button" onClick={formModal.open}>
                  <Plus size={17} /> إنشاء حصة جديدة
                </button>
              </div>
            ) : (
              <section className="session-workspace">
                <div className="card">
                  <div className="card-heading">
                    <div className="card-heading">
                      <div className="card-heading-title">
                        <div className="card-icon turquoise"><BookOpen size={23} /></div>
                        <div>
                          <div className="card-eyebrow-div">
                            <span className="card-eyebrow">{data.session.subject}</span>
                            <span className="card-eyebrow-separator">/</span>
                            <span className="card-eyebrow">{data.session.code}</span>
                          </div>
                          <h2>{data.session.title}</h2>
                        </div>
                      </div>
                    </div>

                    <div className="card-actions">
                      {!data.session.questions?.length ? (
                        <span className="overview-status overview-status-check">
                          <Check size={16} />
                          ضيف سؤال عالاقل او ارفع الفايلات!
                        </span>
                      ) : (
                        <span className="overview-status overview-status-doublecheck">
                          <CheckCheck size={16} />
                          الحصة قابله للبدء
                        </span>
                      )}
                      <button className="button icon-button open-delete-modal-button" type="button" onClick={() => deleteModal.requestDelete()} aria-label="حذف الحصة" title="حذف الحصة">
                        <Trash2 size={17} />
                      </button>

                      <button className="button button-primary red" type="button" onClick={handleStartLiveSession} disabled={!data.session?.questions?.length}>
                        <Play size={16} fill="currentColor" /> ابدأ الحصة
                      </button>
                    </div>
                  </div>
                  <div className="session-meta-row">
                    <button className="button open-edit-modal-button turquoise" type="button" onClick={formModal.open}>
                      <Settings2 size={15} /> تفاصيل الحصة
                    </button>
                  </div>
                </div>

                <div className="questions">
                  <section className="card stack-card" aria-labelledby="questions-title">
                    <div className="card-heading">
                      <div className="card-heading-title">
                        <div className="card-icon small-card-icon yellow"><BookOpenCheck size={19} /></div>
                        <div><h2 id="questions-title">الأسئلة</h2></div>
                      </div>
                      <span className="count-pill">{question.questions.length} سؤال</span>
                    </div>

                    <p className="card-description">
                      اكتب الأسئلة اللي انت عايزها أو ارفع ملف وسيب الـ AI يعملهالك.
                    </p>

                    {question.questions.length > 0 ? (
                      <div className="question-list">
                        {question.questions.map((item, index) => {
                          const correctIdx = getCorrectIndex(item);
                          const optionList = Array.isArray(item?.options) ? item.options : [];
                          const qDuration  = Number(item?.duration) || 0;

                          return (
                            <article className="field question-field" key={item.id ?? index}>
                              <div className="question-field-topline">
                                <span className={`question-number ${item.source === "ai" ? "blue" : "yellow"}`}>
                                  {`${index + 1}`.padStart(2, "0")}
                                </span>

                                <span className={`source-label ${item.source === "ai" ? "blue" : "yellow"}`}>
                                  {item.source === "ai" ? <Sparkles size={10} /> : <i />}{" "}
                                  {item.source === "ai" ? "ذكاء اصطناعي" : "يدوي"}
                                </span>

                                {qDuration > 0 && (
                                  <span className="duration-badge" title={`مدة السؤال ${qDuration} ثانية`}>
                                    <Clock size={11} /> {qDuration} ث
                                  </span>
                                )}

                                <div className="question-actions">
                                  <button className="edit-question-modal-button" type="button" onClick={() => question.startEdit(item)} aria-label={`تعديل السؤال ${index + 1}`} title="تعديل السؤال" >
                                    <Pencil size={15} />
                                  </button>
                                  <button className="delete-question-modal-button" type="button" onClick={() => question.deleteQuestion(item.id)} aria-label={`حذف السؤال ${index + 1}`} title="حذف السؤال" >
                                    <Trash2 size={15} />
                                  </button>
                                </div>
                              </div>

                              <h3>{item.question}</h3>

                              <div className="question-options-preview">
                                {optionList.map((option, optionIndex) => (
                                  <span className={optionIndex === correctIdx ? "is-correct" : ""} key={`${item.id ?? index}-${optionIndex}`}>
                                    <i>{optionIndex === correctIdx ? <Check size={11} /> : String.fromCharCode(65 + optionIndex)}</i>
                                    {option}
                                  </span>
                                ))}
                              </div>
                            </article>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="empty-questions">
                        <BookOpenCheck size={24} />
                        <strong>لسه ما أضفتش أسئلة</strong>
                        <span>ابدأ بإضافة سؤال يدوي للجلسة.</span>
                      </div>
                    )}

                    <button className="button open-question-modal-button turquoise" type="button" onClick={question.startAdd} >
                      <Plus size={17} /> أضف سؤالًا يدويًا
                    </button>
                  </section>

                  <div className="card screen stack-card">
                    <div className="card-heading">
                      <div className="card-heading-title">
                        <div className="card-icon small-card-icon blue"><Sparkles size={19} /></div>
                        <div>
                          <span className="card-eyebrow">الذكاء الاصطناعي</span>
                          <h2>ارفع ملف الشرح وهنعمل لك الاسئله</h2>
                        </div>
                      </div>
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
                        <span>{data.isUploading ? 'جاري تحليل المستند وتوليد الأسئلة...' : 'إسقاط ملف PDF جديد هنا أو اضغط للرفع'}</span>
                        <small>سيتم استخراج أسئلة تلقائية بالذكاء الاصطناعي للجلسة الحالية</small>
                      </label>

                      {data.session.files && data.session.files.length > 0 && (
                        <div className="attached-files-list">
                          {data.session.files.map((f, idx) => (
                            <div key={idx} className="field attached-file-field">
                              <FileText size={14} /> الملف المرفق: <b>{f.name}</b>
                              <a href={f.url} target="_blank" rel="noreferrer">(عرض)</a>
                              <button type="button" className="attached-file-remove" onClick={() => handleRemoveFile(idx)} title="حذف الملف" aria-label={`حذف الملف ${f.name}`}>
                                <Trash2 size={14} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </section>
            )}
          </div>
        </main>
      </div>

      {formModal.isOpen && (
        <CreateSessionWindow initialData={data.session} onClose={formModal.close} onSubmit={handleSaveSession}/>
      )}

      {deleteModal.isOpen && (
        <DeleteSessionAlert onClose={deleteModal.close} onConfirm={handleResetSession} sessionTitle={data.session?.title}/>
      )}

      {question.formOpen && data.session && (
        <QuestionFormWindow question={question} sessionId={data.session.id}/>
      )}
    </>
  );
}

export default InstructorView;