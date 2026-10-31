import { CalendarDays, ChevronLeft, Clock3, Plus, Sparkles, UsersRound, Users, ListChecks, Play, Pause, SkipForward,
  Eye, LogOut, Check, X, Timer, RotateCcw, Lock } from "lucide-react";
import SessionsDetailes from "./Components/SessionsDetailes.jsx";
import CreateSessionWindow from "./Components/CreateSessionWindow.jsx";
import DeleteSessionAlert from "./Components/DeleteSessionAlert.jsx";
import EndLiveSessionAlert from "./Components/EndLiveSessionAlert.jsx";
import ReopenSessionAlert from "./Components/ReopenSessionAlert.jsx";
import Attendanceboard from "./Components/AttendanceBoard.jsx";
import Leaderboard from "./Components/LeaderBoard.jsx";

import useCreateSession from "./hook/useCreateSession.js";
import useEditSession from "./hook/useEditSession.js";
import useDeleteSession from "./hook/useDeleteSession.js";
import useReopenSession from "./hook/useReopenSession.js";
import { useSessions } from "./hook/useSessions.js";
import { useLiveSession } from "./hook/useLiveSession.js";

import { initialMockData } from "./mock/mockData.js";
import {
  LobbyView, CountdownView, QuestionView, RevealView,
  FinishedView, ReopenedView,
} from "./Components/live/LobbyView.jsx";
import "./App.css";

const formatSessionDate = (date) =>
  date
    ? new Intl.DateTimeFormat("ar-EG", { day: "numeric", month: "short" }).format(new Date(date))
    : "—";

const formatSessionTime = (time) => time ?? "—";

function App() {
  // ── 3 مصادر منفصلة، كل واحد ليه مسؤولية ─────────
  const session = useSessions(initialMockData.sessions);
  const live    = useLiveSession(session.sessionsList, session.setSessionsList);
  const createModal = useCreateSession();
  const editModal   = useEditSession();
  const deleteModal = useDeleteSession();
  const reopenModal = useReopenSession();

  const today = new Intl.DateTimeFormat("ar-EG", {
    weekday: "long", day: "numeric", month: "long",
  }).format(new Date());

  // ── Handlers ─────────────────────────────────────
  const handleCreateSession = (data) => {
    session.createSession(data);
    createModal.close();
  };

  const handleUpdateSession = (data) => {
    session.updateSession(session.selectedId, data);
    editModal.close();
  };

  const handleDeleteSession = () => {
    session.deleteSession(deleteModal.sessionId);
    deleteModal.close();
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (file && session.selectedSession) {
      await session.uploadFile(file, session.selectedSession.id);
    }
    e.target.value = "";
  };

  const handleRemoveFile = (idx) => session.removeFile(session.selectedId, idx);

  const handleQuestionsChange = (newQuestions) => session.updateQuestions(session.selectedId, newQuestions);

  const handleScheduleSession = () => session.scheduleSession(session.selectedId);

  const handleStartLiveSession = () => live.startLiveSession(session.selectedId);

  // ── Live View (early return) ─────────────────────
  if (live.isLive) {
    const students = live.liveSession?.students ?? [];
    const questions = live.liveSession?.questions ?? [];
    const q        = live.currentQuestion;
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
                  {questions.length === 0 ? (
                    <p className="muted">مفيش أسئلة في الجلسة دي.</p>
                  ) : (
                    <ol className="live-questions-list">
                      {questions.map((item, idx) => {
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
                    {live.liveState === "lobby" && <LobbyView session={live.liveSession} />}
                    {live.liveState === "countdown" && (
                      <CountdownView onEnd={live.startQuestion} seconds={3} />
                    )}
                    {(live.liveState === "question" || live.liveState === "paused") && q && (
                      <QuestionView
                        question={q}
                        paused={live.liveState === "paused"}
                        timeLeft={live.timeLeft}
                      />
                    )}
                    {live.liveState === "reveal" && q && <RevealView question={q} />}
                    {live.liveState === "finished" && (
                      <FinishedView
                        pendingCount={live.pendingStudents.length}
                        totalStudents={students.length}
                        onReopen={reopenModal.open}
                      />
                    )}
                    {live.liveState === "reopened" && (
                      <ReopenedView
                        pendingCount={live.pendingStudents.length}
                        totalStudents={students.length}
                        allowAnswerEdit={live.allowAnswerEdit}
                      />
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
                  {/* ⚠️ اسم الباراميتر "s" مش "session" عشان نتجنب shadowing */}
                  {session.filtered.map((s, index) => {
                    const isSelected = s.id === session.selectedId;
                    return (
                      <button className={`button session-tile ${isSelected ? "is-selected" : ""}`} type="button" onClick={() => session.setSelectedId(s.id)}>
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

            <SessionsDetailes
              session={session.selectedSession}
              students={session.selectedSession?.students || []}
              onQuestionsChange={handleQuestionsChange}
              requestDelete={deleteModal.requestDelete}
              onEdit={editModal.open}
              onSchedule={handleScheduleSession}
              handleFileUpload={handleFileUpload}
              handleRemoveFile={handleRemoveFile}
              isUploading={session.isUploading}
              createSession={createModal}
              onStartLiveSession={handleStartLiveSession}
            />
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