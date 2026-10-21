import { useMemo, useState } from "react";
import { CalendarDays, ChevronLeft, Clock3, Plus, Sparkles, UsersRound } from "lucide-react";
import SessionsDetailes from "./Components/SessionsDetailes.jsx";
import CreateSession from "./Components/CreateSession.jsx";
import useCreateSession from "./hook/useCreateSession.js";
import useEditSession from './hook/useEditSession.js';
import DeleteSession from "./Components/DeleteSession.jsx";
import useDeleteSession from './hook/useDeleteSession.js';
import { initialMockData } from "./mock/mockData.js";
import "./App.css";

const formatSessionDate = (date) =>
  date ? new Intl.DateTimeFormat("ar-EG", { day: "numeric", month: "short" }).format(new Date(date)) : "—";

const formatSessionTime = (time) => time ?? "—";

function App() {
  const today = new Intl.DateTimeFormat("ar-EG", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date());

  const [sessionsList, setSessionsList] = useState(initialMockData.sessions);
  const [selectedId, setSelectedId] = useState(initialMockData.sessions[0]?.id ?? null);

  const selectedSession = sessionsList.find((s) => s.id === selectedId) ?? null;
  
  const [search, setSearch] = useState("");
  const [filterTab, setFilterTab] = useState("all");
  const [isUploading, setIsUploading] = useState(false);

  const filtered = useMemo(() => {
    return sessionsList.filter((session) => {
      const matchesSearch = session.title.toLowerCase().includes(search.toLowerCase());
      const matchesTab =
        filterTab === "all" ||
        (filterTab === "upcoming" && session.status === "scheduled") ||
        (filterTab === "completed" && session.status === "completed") ||
        (filterTab === "draft" && session.status === "draft");
      return matchesSearch && matchesTab;
    });
  }, [sessionsList, search, filterTab]);

  const scheduledSession = sessionsList.filter((s) => s.status === "scheduled").length;
  const endedSession = sessionsList.filter((s) => s.status === "completed").length;
  const draftedSession = sessionsList.filter((s) => s.status === "draft").length;

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !selectedSession) return;

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("sessionId", selectedSession.id);

      await new Promise((resolve) => setTimeout(resolve, 1500));

      const result = {
        fileUrl: `https://mock-storage.com/files/${file.name}`,
        fileName: file.name,
        aiQuestion: {
          id: `ai-${Date.now()}`,
          question: `سؤال ذكي مستخرج من ملف (${file.name}): ما الفكرة الأساسية؟`,
          options: ["الخيار الصحيح", "خيار 1", "خيار 2", "خيار 3"],
          correctAnswer: "الخيار الصحيح",
          type: "ai",
        }
      };

      setSessionsList((prev) =>
        prev.map((s) => {
          if (s.id === selectedSession.id) {
            return {
              ...s,
              files: [...(s.files || []), { name: result.fileName, url: result.fileUrl }],
              questions: [...s.questions, result.aiQuestion],
            };
          }
          return s;
        })
      );
      
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("حصل خطأ أثناء رفع الملف");
    } finally {
      setIsUploading(false);
    }
  };

  const handleQuestionsChange = (newQuestions) => {
    setSessionsList((prev) =>
      prev.map((s) => (s.id === selectedId ? { ...s, questions: newQuestions } : s))
    );
  };

  const createSession = useCreateSession();
  const editSession = useEditSession();
  const deleteSession = useDeleteSession();
  const handleCreateSession = (data) => {
    const newSession = {
      id: `s-${Date.now()}`,
      ...data,
      code: `S-${Date.now().toString().slice(-4)}`,
      studentnumber: "0",
      students: [],
      questions: [],
    };
    setSessionsList((prev) => [...prev, newSession]);
    setSelectedId(newSession.id);
    createSession.close();
  };
  const handleUpdateSession = (data) => {
    setSessionsList((prev) =>
      prev.map((s) => {
        if (s.id === selectedId) {
          return { ...s, ...data }; 
        }
        return s;
      })
    );
    editSession.close();
  };
  const handleConfirmDelete = () => {
    setSessionsList((prev) => {
      const next = prev.filter((s) => s.id !== deleteSession.sessionId);
      if (deleteSession.sessionId === selectedId) {
        setSelectedId(next[0]?.id ?? null);
      }
      return next;
    });
    deleteSession.close();
  };
  const handleScheduleSession = () => {
    setSessionsList((prev) =>
      prev.map((s) => 
        s.id === selectedId ? { ...s, status: "scheduled" } : s
      )
    );
  };

  return (
    <>
      <div className="instructor-page">
        <section className="rounded-div page-heading instructor-page-heading">
          <div>
            <span className="page-eyebrow">
              <span className="eyebrow-star"><Sparkles size={13} /></span> مساحة المحاضر
            </span>
            <h1>إدارة الحصص <em>والأسئلة</em></h1>
            <p>اختر حصة لتحديث محتواها، رفع الماتريال، ومتابعة أداء الطلاب.</p>
          </div>
          <div className="heading-meta">
            <button
              className="button-primary Heading-create-button"
              type="button"
              onClick={createSession.open}
            >
              <Plus size={17} /> حصة جديدة
            </button>
            <div className="today-card"><CalendarDays size={16} /><span>{today}</span></div>
          </div>
        </section>

        <div className="instructor-dashboard">
          <section className="overview-strip" aria-label="ملخص الحصص">
            <article className="rounded-div overview-card overview-lime">
              <span className="overview-icon"><CalendarDays size={19} /></span>
              <span className="overview-text">
                <small>حصص مجدولة</small>
                <strong>{scheduledSession}</strong>
              </span>
              <span className="overview-caption">تحتاج تحضير</span>
            </article>
            <article className="rounded-div overview-card overview-yellow">
              <span className="overview-icon"><CalendarDays size={19} /></span>
              <span className="overview-text">
                <small>حصص مسودة</small>
                <strong>{draftedSession}</strong>
              </span>
              <span className="overview-caption">لم تجدول بعد</span>
            </article>
            <article className="rounded-div overview-card overview-blue">
              <span className="overview-icon"><CalendarDays size={19} /></span>
              <span className="overview-text">
                <small>حصص انتهت</small>
                <strong>{endedSession}</strong>
              </span>
              <span className="overview-caption">تمت</span>
            </article>
          </section>

          <div className="instructor-layout">
            <aside className="instructor-sidebar sessions-sidebar-modern">
              <section className="rounded-div control-card session-card">
                <div className="sessions-sidebar-header">
                  <div className="sidebar-title-row">
                    <span className="sidebar-eyebrow">مساحة العمل</span>
                    <h2>حصصك</h2>
                  </div>
                  <button
                    type="button"
                    className="sidebar-add-top-btn"
                    onClick={createSession.open}
                    title="إنشاء حصة جديدة"
                  >
                    <Plus size={18} />
                  </button>
                </div>

                <div className="sessions-search-box">
                  <input
                    type="text"
                    placeholder="ابحث عن حصة..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>

                <div className="sessions-filter-tabs">
                  <button
                    type="button"
                    className={`filter-button ${filterTab === "all" ? "active" : ""}`}
                    onClick={() => setFilterTab("all")}
                  >
                    الكل
                  </button>
                  <button
                    type="button"
                    className={`filter-button ${filterTab === "upcoming" ? "active" : ""}`}
                    onClick={() => setFilterTab("upcoming")}
                  >
                    قادمة
                  </button>
                  <button
                    type="button"
                    className={`filter-button ${filterTab === "draft" ? "active" : ""}`}
                    onClick={() => setFilterTab("draft")}
                  >
                    مسودات
                  </button>
                  <button
                    type="button"
                    className={`filter-button ${filterTab === "completed" ? "active" : ""}`}
                    onClick={() => setFilterTab("completed")}
                  >
                    مكتمل
                  </button>
                </div>

                <div className="sessions-cards-container">
                  {filtered.map((session, index) => {
                    const isSelected = session.id === selectedId;
                    return (
                      <button
                        key={session.id}
                        type="button"
                        className={`session-tile ${isSelected ? "is-selected" : ""}`}
                        onClick={() => setSelectedId(session.id)}
                        aria-pressed={isSelected}
                      >
                        <span className="session-tile-index">
                          {`${index + 1}`.padStart(2, "0")}
                        </span>
                        <span className="session-tile-body">
                          <span className="session-tile-topline">
                            <span className={`session-tile-status is-${session.status ?? "scheduled"}`}>
                              <i />
                              {session.status === "draft"
                                ? "مسودة"
                                : session.status === "completed"
                                ? "مكتملة"
                                : "مجدولة"}
                            </span>
                            <span className="session-tile-arrow"><ChevronLeft size={15} /></span>
                          </span>
                          <strong>{session.title}</strong>
                          <span className="session-tile-subject">{session.subject}</span>
                          <span className="session-tile-meta">
                            <span><CalendarDays size={13} />{formatSessionDate(session.date)}</span>
                            <span><Clock3 size={13} />{formatSessionTime(session.time)}</span>
                          </span>
                          <span className="session-tile-footer">
                            {session.status !== "draft" && (
                              <span>
                                <UsersRound size={13} />
                                {session.status === "scheduled"
                                  ? `${session.studentnumber ?? 0} طلاب هيحضرو`
                                  : `${session.students?.length ?? 0} طلاب حضرو`}
                              </span>
                            )}
                            <span>{session.questions?.length ?? 0} أسئلة</span>
                          </span>
                        </span>
                      </button>
                    );
                  })}
                  {filtered.length === 0 && (
                    <div className="session-tile-empty">
                      <CalendarDays size={22} />
                      <strong>لا توجد جلسات هنا</strong>
                      <span>جرّب بحثًا آخر أو أنشئ جلسة جديدة.</span>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  className="create-session-bottom-btn"
                  onClick={createSession.open}
                >
                  <Plus size={16} /> إنشاء حصة جديدة
                </button>
              </section>
            </aside>

            <SessionsDetailes
              session={selectedSession}
              students={selectedSession?.students || []}
              onQuestionsChange={handleQuestionsChange}
              requestDelete={deleteSession.requestDelete}
              onEdit={editSession.open}
              onSchedule={handleScheduleSession}
              handleFileUpload={handleFileUpload}
              isUploading={isUploading}
              createSession={createSession}
            />
          </div>
        </div>
      </div>

      {createSession.isOpen && (
        <CreateSession
          onClose={createSession.close}
          onSubmit={handleCreateSession}
        />
      )}

      {editSession.isOpen && (
        <CreateSession
          initialData={selectedSession}
          onClose={editSession.close}
          onSubmit={handleUpdateSession}
        />
      )}
      
      {deleteSession.isOpen && (
        <DeleteSession
          onClose={deleteSession.close}
          onConfirm={handleConfirmDelete}
          sessionTitle={sessionsList.find((s) => s.id === deleteSession.sessionId)?.title}
        />
      )}
    </>
  );
}

export default App;