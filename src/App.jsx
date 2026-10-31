import { CalendarDays, ChevronLeft, Clock3, Plus, Sparkles, UsersRound, Users, ListChecks, Play, Pause, SkipForward,
  Eye, LogOut, Check, CheckCheck, X, RotateCcw, Lock, Trash2, UploadCloud, FileText, BookOpen, Settings2,
  BookOpenCheck, Minus, Clock, Timer, ClipboardList, Trophy } from "lucide-react";

import CreateSessionWindow from "./modals/CreateSessionWindow.jsx";
import DeleteSessionAlert from "./modals/DeleteSessionAlert.jsx";
import EndLiveSessionAlert from "./modals/EndLiveSessionAlert.jsx";
import ReopenSessionAlert from "./modals/ReopenSessionAlert.jsx";

import useCreateSession from "./hooks/useCreateSession.js";
import useEditSession from "./hooks/useEditSession.js";
import useDeleteSession from "./hooks/useDeleteSession.js";
import useReopenSession from "./hooks/useReopenSession.js";
import useQuestionsForm, { getCorrectIndex, QUESTION_DURATIONS } from "./hooks/useQuestionsForm.js";
import useCountdown from "./hooks/useCountdown.js";
import { useSessions } from "./hooks/useSessions.js";
import { useLiveSession } from "./hooks/useLiveSession.js";

import { initialMockData } from "./mock/mockData.js";

import "./styles/Instructor-page.css";

const formatSessionDate = (date) => date ? new Intl.DateTimeFormat("ar-EG", { day: "numeric", month: "short" }).format(new Date(date)) : "—";
const formatSessionTime = (time) => time ?? "—";

function Attendanceboard({ students = [], expectedCount }) {
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
function Leaderboard({ students = [] }) {
  return (
    <div className="card leaderboard-container">
      <div className="leaderboard-header">
        <div className="title-section">
          <div className="panel-icon leaderboard-icon"><Trophy size={19} /></div>
          <h2 className="leaderboard-title">لوحة المتصدرين</h2>
        </div>
      </div>

      <div className="leaderboard-table">
        <div className="leaderboard-row leaderboard-row--head">
          <span className="col-rank">#</span>
          <span className="col-name">الاسم</span>
          <span className="col-score">Score</span>
          <span className="col-streak">Streak</span>
        </div>

        {students.map((player, index) => (
          <div key={player.id} className="leaderboard-row">
            <span className="col-rank">{index + 1}</span>
            <span className="col-name">{player.name}</span>
            <span className="col-score">{player.score}</span>
            <span className="col-streak">🔥 {player.highestStreak}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function App() {
  const session = useSessions(initialMockData.sessions);
  const live = useLiveSession(session.sessionsList, session.setSessionsList);
  const createModal = useCreateSession();
  const editModal   = useEditSession();
  const deleteModal = useDeleteSession();
  const reopenModal = useReopenSession();

  const question = useQuestionsForm(session);

  const countdown = useCountdown({ active: live.isLive && live.liveState === "countdown", seconds: 3, onEnd: live.startQuestion, });

  const today = new Intl.DateTimeFormat("ar-EG", { weekday: "long", day: "numeric", month: "long", }).format(new Date());

  // ── Handlers ─────────────────────────────────────
  const handleCreateSession = (data) => { session.createSession(data); createModal.close(); };

  const handleUpdateSession = (data) => { session.updateSession(session.selectedId, data); editModal.close(); };

  const handleDeleteSession = () => { session.deleteSession(deleteModal.sessionId); deleteModal.close(); };

  const handleFileUpload = async (e) => { const file = e.target.files?.[0]; if (file && session.selectedSession) { await session.uploadFile(file, session.selectedSession.id); } e.target.value = ""; };

  const handleRemoveFile = (idx) => session.removeFile(session.selectedId, idx);
  const handleScheduleSession = () => session.scheduleSession(session.selectedId);
  const handleStartLiveSession = () => live.startLiveSession(session.selectedId);

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
        <div className="instructor-page">
          <section className="card page-heading instructor-page-heading-card">
            <div>
              <span className="page-eyebrow">
                <span className="eyebrow-star"><Sparkles size={13} /></span> مساحة المدرس (جلسة حية)
              </span>
              <h1>الفصل صاحي؟ <em>يلا نلعب!</em></h1>
              <p>{live.liveSession?.title ?? "جلسة حية"}</p>
            </div>

            <div className="heading-meta">
              <button className="button button-primary Heading-create-button" type="button" onClick={live.requestEndLive}>
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
          </section>

          <div className="instructor-dashboard">
            {live.totalQuestions > 0 && (
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
            <div className="instructor-layout">
              <aside className="instructor-sidebar sessions-sidebar-modern live-controls">
                <section className="card control-card session-card">
                  <h3>التحكم</h3>
                  <div className="live-controls-buttons">

                    {live.liveState === "lobby" && (
                      <button className="button button-primary" onClick={live.startCountdown}>
                        <Play size={16} /> ابدأ الجلسة
                      </button>
                    )}

                    {live.liveState === "countdown" && (
                      <>
                        <button className="button button-primary" onClick={live.startQuestion}>
                          <SkipForward size={16} /> ابدأ السؤال دلوقتي
                        </button>
                        <button className="button button-ghost" onClick={live.cancelCountdown}>
                          <X size={16} /> إلغاء
                        </button>
                      </>
                    )}

                    {live.liveState === "question" && (
                      <>
                        <button className="button button-ghost" onClick={live.pauseQuestion}>
                          <Pause size={16} /> إيقاف مؤقت
                        </button>
                        <button className="button button-primary" onClick={live.revealAnswer}>
                          <Eye size={16} /> اعرض الإجابة
                        </button>
                      </>
                    )}

                    {live.liveState === "paused" && (
                      <>
                        <button className="button button-primary" onClick={live.resumeQuestion}>
                          <Play size={16} /> استكمال
                        </button>
                        <button className="button button-ghost" onClick={live.revealAnswer}>
                          <Eye size={16} /> اعرض الإجابة
                        </button>
                        <button className="button Heading-create-button" onClick={live.finishSession}>
                          <LogOut size={16} /> أنهِ الجولة
                        </button>
                      </>
                    )}

                    {live.liveState === "reveal" && (
                      !live.isLastQuestion ? (
                        <button className="button button-primary" onClick={live.nextQuestion}>
                          <SkipForward size={16} /> السؤال التالي
                        </button>
                      ) : (
                        <button className="button button-primary" onClick={live.finishSession}>
                          <Check size={16} /> أنهِ الجولة
                        </button>
                      )
                    )}

                    {live.liveState === "finished" && (
                      <>
                        <button className="button button-primary" type="button" onClick={reopenModal.open} disabled={live.pendingStudents.length === 0} title={live.pendingStudents.length === 0 ? "كل الطلاب خلصوا" : "افتح الجولة للمتأخرين بس"}>
                          <RotateCcw size={16} /> افتح للمتأخرين ({live.pendingStudents.length})
                        </button>
                        <button className="button button-ghost" type="button" onClick={live.requestEndLive}>
                          <LogOut size={16} /> خروج وإغلاق الجلسة
                        </button>
                      </>
                    )}

                    {live.liveState === "reopened" && (
                      <>
                        <button className="button button-primary" type="button" onClick={live.closeReopenedRound}>
                          <Lock size={16} /> اقفل الجولة
                        </button>
                        <button className="button button-ghost" type="button" onClick={live.requestEndLive}>
                          <LogOut size={16} /> خروج
                        </button>
                      </>
                    )}

                  </div>
                </section>

                <section className="card control-card session-card">
                  <h3><ListChecks size={16} /> الأسئلة ({live.totalQuestions})</h3>
                  {liveQuestions.length === 0 ? (
                    <p className="muted">مفيش أسئلة في الجلسة دي.</p>
                  ) : (
                    <ol className="live-questions-list">
                      {liveQuestions.map((item, idx) => {
                        const isCurrent = idx === live.currentQuestionIndex;
                        const isDone    = idx < live.currentQuestionIndex;
                        return (
                          <li
                            key={item.id}
                            className={[isCurrent && "is-current", isDone && "is-done"].filter(Boolean).join(" ")}
                          >
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
                <section className="screen card live-question-card">
                  <div className="live-question-card-content">
                    {live.liveState === "lobby" && (
                      <div className="live-lobby">
                        <div className="live-lobby-icon"><Users size={42} /></div>
                        <h2>مستنيين الطلاب ينضموا...</h2>
                        <p>
                          لما تجهز، اضغط <b>ابدأ الجلسة</b>. كود الفصل:{" "}
                          <b>{live.liveSession?.code ?? "—"}</b>
                        </p>
                        <div className="live-lobby-pulse" />
                      </div>
                    )}
                    {live.liveState === "countdown" && (
                      <div className="live-countdown">
                        <span className="live-countdown-badge">
                          <Timer size={14} /> العدّ التمهيدي
                        </span>
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
                            <span className="badge">
                              {currentQuestion.type === "mcq" ? "اختيار من متعدد" : currentQuestion.type}
                            </span>
                            {currentQuestion.source === "ai" && <span className="badge badge-ai">AI</span>}

                            <span className={`badge badge-timer ${live.timeLeft <= 5 && live.timeLeft > 0 ? "is-warning" : ""}`}>
                              <Timer size={12} /> {live.timeLeft} ث
                            </span>

                            {live.liveState === "paused" && (
                              <span className="badge badge-warn">
                                <Pause size={12} /> موقوف مؤقتًا
                              </span>
                            )}
                          </div>

                          <div className="live-question-timer">
                            <div
                              className={`live-question-timer-fill ${live.timeLeft <= 5 && live.timeLeft > 0 ? "is-warning" : ""}`}
                              style={{ width: `${pct}%` }}
                            />
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
                          <span className="badge badge-success">
                            <Check size={12} /> مراجعة الإجابة
                          </span>
                        </div>
                        <h2 className="live-question-text">{currentQuestion.question}</h2>
                        <ul className="live-options">
                          {(currentQuestion.options ?? []).map((opt, idx) => {
                            const isCorrect = idx === getCorrectIndex(currentQuestion);
                            return (
                              <li
                                key={idx}
                                className={`live-option ${isCorrect ? "is-correct" : "is-wrong"}`}
                              >
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
                          <button type="button" className="button button-primary" onClick={reopenModal.open}>
                            <RotateCcw size={16} /> افتح للمتأخرين ({live.pendingStudents.length})
                          </button>
                        )}
                      </div>
                    )}
                    {live.liveState === "reopened" && (
                      <div className="live-reopened">
                        <div className="live-lobby-icon"><RotateCcw size={42} /></div>
                        <h2>الجولة مفتوحة للمتأخرين</h2>
                        <p>
                          مفتوحة لـ <b>{live.pendingStudents.length}</b> من <b>{students.length}</b> طالب لسه مكملوش.
                        </p>
                        <span className={`badge ${live.allowAnswerEdit ? "badge-warn" : "badge-success"}`}>
                          {live.allowAnswerEdit
                            ? "مسموح بتعديل الإجابات القديمة"
                            : "الإجابات القديمة مقفولة"}
                        </span>
                      </div>
                    )}
                  </div>
                </section>

                <Attendanceboard students={students} expectedCount={live.liveSession?.studentnumber} />
                <Leaderboard students={students} />
              </section>
            </div>
          </div>
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
            onConfirm={(allowEdit) => live.confirmReopen(allowEdit)}
          />
        )}
      </>
    );
  }

  // ── Dashboard ────────────────────────────────────
  const selectedSession = session.selectedSession;

  return (
    <>
      <div className="instructor-page">
        <section className="card page-heading instructor-page-heading-card">
          <div>
            <span className="page-eyebrow">
              <span className="eyebrow-star"><Sparkles size={13} /></span> مساحة المحاضر
            </span>
            <h1>إدارة الحصص <em>والأسئلة</em></h1>
            <p>اختر حصة لتحديث محتواها، رفع الماتريال، ومتابعة أداء الطلاب.</p>
          </div>
          <div className="heading-meta">
            <button className="button button-primary Heading-create-button" type="button" onClick={createModal.open}>
              <Plus size={17} /> حصة جديدة
            </button>
            <div className="chip today-card">
              <CalendarDays size={16} /><span>{today}</span>
            </div>
          </div>
        </section>

        <div className="instructor-dashboard">

          <div className="instructor-layout">
            <aside className="instructor-sidebar sessions-sidebar-modern">
              <section className="card control-card session-card">
                <div className="sessions-sidebar-header">
                  <div className="sidebar-title-row">
                    <span className="sidebar-eyebrow">مساحة العمل</span>
                    <h2>حصصك</h2>
                  </div>
                  <button className="button sidebar-add-top-button" type="button" onClick={createModal.open} title="إنشاء حصة جديدة">
                    <Plus size={18} />
                  </button>
                </div>

                <div className="sessions-search-box">
                  <input type="text" placeholder="ابحث عن حصة..." value={session.search} onChange={(e) => session.setSearch(e.target.value)}/>
                </div>

                <div className="sessions-filter-tabs">
                  {[
                    { key: "all",       label: "الكل", nums: session.stats.all },
                    { key: "upcoming",  label: "قادمة", nums: session.stats.scheduled },
                    { key: "draft",     label: "مسودات", nums: session.stats.drafted },
                    { key: "completed", label: "مكتمل", nums: session.stats.ended },
                  ].map((tab) => (
                    <button className={`button filter-button ${session.filterTab === tab.key ? "active" : ""}`} type="button" onClick={() => session.setFilterTab(tab.key)} key={tab.key}>
                      <p>{tab.label}</p>
                      <strong>{tab.nums}</strong>
                    </button>
                  ))}
                </div>

                <div className="sessions-cards-container">
                  {session.filtered.map((s, index) => {
                    const isSelected = s.id === session.selectedId;
                    return (
                      <button key={s.id} className={`button session-tile ${isSelected ? "is-selected" : ""}`} type="button" onClick={() => session.setSelectedId(s.id)}>
                        <span className="session-tile-index">
                          {`${index + 1}`.padStart(2, "0")}
                        </span>
                        <span className="session-tile-body">
                          <span className="session-tile-topline">
                            <span className={`session-tile-status is-${s.status ?? "scheduled"}`}>
                              <i />
                              {s.status === "draft"
                                ? "مسودة"
                                : s.status === "completed"
                                ? "مكتملة"
                                : "مجدولة"}
                            </span>
                            <span className="session-tile-arrow"><ChevronLeft size={15} /></span>
                          </span>
                          <strong>{s.title}</strong>
                          <span className="session-tile-subject">{s.subject}</span>
                          <span className="session-tile-meta">
                            <span><CalendarDays size={13} />{formatSessionDate(s.date)}</span>
                            <span><Clock3 size={13} />{formatSessionTime(s.time)}</span>
                          </span>
                          <span className="session-tile-footer">
                            <span>
                              {s.status !== "draft" && (
                                <>
                                  <UsersRound size={13} />
                                  {s.status === "scheduled"
                                    ? `${s.studentnumber ?? 0} طلاب هيحضرو`
                                    : `${s.students?.length ?? 0} طلاب حضرو`}
                                </>
                              )}
                            </span>
                            <span>{s.questions?.length ?? 0} أسئلة</span>
                          </span>
                        </span>
                      </button>
                    );
                  })}
                  {session.filtered.length === 0 && (
                    <div className="session-tile-empty">
                      <CalendarDays size={22} />
                      <strong>لا توجد جلسات هنا</strong>
                      <span>جرّب بحثًا آخر أو أنشئ جلسة جديدة.</span>
                    </div>
                  )}
                </div>

                <button className="button create-session-bottom-button" type="button" onClick={createModal.open}>
                  <Plus size={16} /> إنشاء حصة جديدة
                </button>
              </section>
            </aside>

            {!session.selectedSession ? (
              <div className="no-session-state panel">
                <div className="no-session-icon"><CalendarDays size={26} /></div>
                <h2>أنشئ حصة جديدة او اختار حصة من حصصك</h2>
                <p>حدّد ميعاد الحصة وبعدها أضف أسئلتك اليدوية. مساحة المادة جاهزة للربط لاحقًا.</p>
                <button className="button button-primary" type="button" onClick={createModal.open}>
                  <Plus size={17} /> إنشاء حصة جديدة
                </button>
              </div>
            ) : (
              <section className="session-workspace">
                <div className="card selected-session-header">
                  <div className="selected-session-top">
                    <div className="selected-session-main">
                      <div className="session-detail-icon"><BookOpen size={23} /></div>
                      <div className="session-title-block">
                        <div className="detail-overline">
                          <span className={`status-dot ${session.selectedSession.status}`} />
                          {session.selectedSession.status === "draft" ? "مسودة" : session.selectedSession.status === "completed" ? "مكتملة" : "حصة مجدولة"}
                          <span className="detail-overline-separator">/</span>
                          <p>{session.selectedSession.subject}</p>
                          <span className="detail-overline-separator">/</span>
                          <span>{session.selectedSession.code}</span>
                        </div>
                        <h2>{session.selectedSession.title}</h2>
                      </div>
                    </div>
                    {session.selectedSession.status === "draft" ? (
                      <span className="overview-status overview-status-check">
                        <Check size={16} />
                        لم يتم تنبيه الطلاب بعد!
                      </span>
                    ) : session.selectedSession.status === "completed" ? (
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
                    {session.selectedSession.status !== "completed" && (
                      <>
                        <button
                          className="button icon-button delete-session-button"
                          type="button"
                          onClick={() => deleteModal.requestDelete(session.selectedSession.id)}
                          aria-label="حذف الحصة"
                          title="حذف الحصة"
                        >
                          <Trash2 size={17} />
                        </button>

                        {session.selectedSession.status === "draft" ? (
                          <button className="button button-primary schedule-session-button" type="button" onClick={handleScheduleSession}>
                            <CalendarDays size={16} /> جدول الحصة
                          </button>
                        ) : (
                          <button className="button button-primary launch-session-button" type="button" onClick={handleStartLiveSession}>
                            <Play size={16} fill="currentColor" /> ابدأ الحصة
                          </button>
                        )}
                      </>
                    )}
                  </div>
                  <div className="session-meta-row">
                    <div className="chip session-meta-item">
                      <span className="meta-icon"><CalendarDays size={16} /></span>
                      <span><small>التاريخ</small><strong>{session.selectedSession.date}</strong></span>
                    </div>
                    <div className="chip session-meta-item">
                      <span className="meta-icon"><Clock3 size={16} /></span>
                      <span><small>الموعد</small><strong>{session.selectedSession.time}</strong></span>
                    </div>
                    <div className="chip session-meta-item">
                      <span className="meta-icon"><UsersRound size={16} /></span>
                      <span><small>الطلاب</small><strong>{session.selectedSession.studentnumber} مشارك</strong></span>
                    </div>
                    {session.selectedSession.status !== "completed" && (
                      <button className="button session-meta-settings" type="button" onClick={editModal.open}>
                        <Settings2 size={15} /> تفاصيل الحصة
                      </button>
                    )}
                  </div>
                </div>

                <div className={session.selectedSession.status === "completed" ? "questions-flex" : "questions"}>
                  <section className="card questions-panel" aria-labelledby="questions-title">
                    <div className="panel-heading">
                      <div className="panel-heading-title">
                        <div className="panel-icon manual-icon"><BookOpenCheck size={19} /></div>
                        <div><h2 id="questions-title">الأسئلة</h2></div>
                      </div>
                      <span className="count-pill">{question.questions.length} سؤال</span>
                    </div>

                    <p className="panel-description">
                      {session.selectedSession.status === "completed"
                        ? "دي الأسئلة اللي كانت معانا في الدرس."
                        : "اكتب الأسئلة اللي انت عايزها أو ارفع ملف وسيب الـ AI يعملهالك."}
                    </p>

                    {question.questions.length > 0 ? (
                      <div className="question-list">
                        {question.questions.map((item, index) => {
                          const correctIdx = getCorrectIndex(item);
                          const optionList = Array.isArray(item?.options) ? item.options : [];
                          const qDuration  = Number(item?.duration) || 0;

                          return (
                            <article className="question-card" key={item.id ?? index}>
                              <div className="question-card-topline">
                                <span className={`question-number ${item.source === "ai" ? "ai-source" : "manual-source"}`}>
                                  {`${index + 1}`.padStart(2, "0")}
                                </span>

                                <span className={`source-label ${item.source === "ai" ? "ai-source" : "manual-source"}`}>
                                  {item.source === "ai" ? <Sparkles size={10} /> : <i />}{" "}
                                  {item.source === "ai" ? "ذكاء اصطناعي" : "يدوي"}
                                </span>

                                {qDuration > 0 && (
                                  <span className="duration-badge" title={`مدة السؤال ${qDuration} ثانية`}>
                                    <Clock size={11} /> {qDuration} ث
                                  </span>
                                )}

                                {session.selectedSession.status !== "completed" && (
                                  <button
                                    className="delete-question-button"
                                    type="button"
                                    onClick={() => question.deleteQuestion(item.id)}  // ← الـ hook في السكوب دلوقتي
                                    aria-label={`حذف السؤال ${index + 1}`}
                                  >
                                    <Trash2 size={15} />
                                  </button>
                                )}
                              </div>

                              <h3>{item.question}</h3>

                              <div className="question-options-preview">
                                {optionList.map((option, optionIndex) => (
                                  <span
                                    className={optionIndex === correctIdx ? "is-correct" : ""}
                                    key={`${item.id ?? index}-${optionIndex}`}
                                  >
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

                    {session.selectedSession.status !== "completed" && (
                      <>
                        {question.formOpen ? (
                          <form className="question-form" onSubmit={question.addQuestion}>
                            <div className="form-heading">
                              <strong>سؤال جديد</strong>
                              <button className="close-button" type="button" onClick={() => question.setFormOpen(false)} aria-label="إغلاق">
                                <X size={17} />
                              </button>
                            </div>

                            <label className="field-label">
                              نص السؤال
                              <textarea
                                required maxLength={240} rows={2}
                                value={question.text}
                                onChange={(e) => question.setText(e.target.value)}
                                placeholder="اكتب السؤال بوضوح..."
                              />
                            </label>

                            <div className="answer-options-grid">
                              {question.options.map((option, index) => (
                                <label
                                  className={`answer-option-field ${question.correctIndex === index ? "is-correct" : ""}`}
                                  key={index}
                                >
                                  <input
                                    className="correct-radio" type="radio"
                                    name={`correct-answer-${session.selectedSession.id}`}
                                    checked={question.correctIndex === index}
                                    onChange={() => question.setCorrectIndex(index)}
                                  />
                                  <span className="option-letter">{String.fromCharCode(65 + index)}</span>
                                  <input
                                    className="option-input" required maxLength={120}
                                    value={option}
                                    onChange={(e) => question.updateOption(index, e.target.value)}
                                    placeholder={`الخيار ${index + 1}`}
                                  />
                                  {question.options.length > 2 && (
                                    <button className="remove-option" type="button" onClick={() => question.removeOption(index)}>
                                      <Minus size={14} />
                                    </button>
                                  )}
                                </label>
                              ))}
                            </div>

                            <button
                              className="add-option-button" type="button"
                              disabled={question.options.length >= 6}
                              onClick={() => question.setOptions((cur) => [...cur, ""])}
                            >
                              <Plus size={15} /> إضافة اختيار
                            </button>

                            <div className="field-label">
                              مدة السؤال (بالثواني)
                              <div className="duration-picker">
                                {QUESTION_DURATIONS.map((sec) => (
                                  <button
                                    type="button" key={sec}
                                    className={`duration-chip ${Number(question.duration) === sec ? "selected" : ""}`}
                                    onClick={() => question.setDuration(sec)}
                                  >
                                    <b>{sec}</b><small>ث</small>
                                  </button>
                                ))}
                              </div>
                            </div>

                            <button className="button button-primary submit-question-button" type="submit">
                              إضافة السؤال
                            </button>
                          </form>
                        ) : (
                          <button className="button open-question-form-button" type="button" onClick={() => question.setFormOpen(true)}>
                            <Plus size={17} /> أضف سؤالًا يدويًا
                          </button>
                        )}
                      </>
                    )}
                  </section>

                  {session.selectedSession.status !== "completed" && (
                    <div className="card screen material-upload-card">
                      <div className="card-heading-row">
                        <div className="control-icon control-icon-purple"><Sparkles size={19} /></div>
                        <div>
                          <span className="section-eyebrow">الذكاء الاصطناعي</span>
                          <h2>ارفع ملف الشرح وهنعمل لك الاسئله</h2>
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
                          <span>{session.isUploading ? 'جاري تحليل المستند وتوليد الأسئلة...' : 'إسقاط ملف PDF جديد هنا أو اضغط للرفع'}</span>
                          <small>سيتم استخراج أسئلة تلقائية بالذكاء الاصطناعي للجلسة الحالية</small>
                        </label>

                        {session.selectedSession.files && session.selectedSession.files.length > 0 && (
                          <div className="attached-files-list">
                            {session.selectedSession.files.map((f, idx) => (
                              <div key={idx} className="attached-file-badge">
                                <FileText size={14} /> الملف المرفق: <b>{f.name}</b>
                                <a href={f.url} target="_blank" rel="noreferrer" style={{ color: 'var(--C-yalla-turquoise)', marginRight: '8px' }}>
                                  (عرض)
                                </a>
                                <button type="button" className="attached-file-remove" onClick={() => handleRemoveFile(idx)} title="حذف الملف" aria-label={`حذف الملف ${f.name}`}>
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {session.selectedSession.status === "completed" && (
                  <div className="boards">
                    <Attendanceboard students={session.selectedSession?.students} expectedCount={session.selectedSession.studentnumber} />
                    <Leaderboard students={session.selectedSession?.students} />
                  </div>
                )}
              </section>
            )}
          </div>
        </div>
      </div>

      {createModal.isOpen && (
        <CreateSessionWindow
          onClose={createModal.close}
          onSubmit={handleCreateSession}
        />
      )}

      {editModal.isOpen && (
        <CreateSessionWindow
          initialData={session.selectedSession}
          onClose={editModal.close}
          onSubmit={handleUpdateSession}
        />
      )}

      {deleteModal.isOpen && (
        <DeleteSessionAlert
          onClose={deleteModal.close}
          onConfirm={handleDeleteSession}
          sessionTitle={
            session.sessionsList.find((s) => s.id === deleteModal.sessionId)?.title
          }
        />
      )}
    </>
  );
}

export default App;