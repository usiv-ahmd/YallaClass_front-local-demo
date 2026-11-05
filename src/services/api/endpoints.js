// src/services/api/endpoints.js
export const EP = {
  // ── My sessions (teacher-scoped) ─────
  meSessions:         ()            => `/me/sessions`,

  // ── Sessions ─────────────────────────
  sessions:           ()            => `/sessions`,
  sessionById:        (id)          => `/sessions/${id}`,
  sessionByCode:      (code)        => `/sessions/by-code/${encodeURIComponent(code)}`,
  sessionQuestions:   (id)          => `/sessions/${id}/questions`,
  sessionQuestion:    (id, qid)     => `/sessions/${id}/questions/${qid}`,
  sessionFiles:       (id)          => `/sessions/${id}/files`,
  sessionFile:        (id, fid)     => `/sessions/${id}/files/${fid}`,

  // ── Students ─────────────────────────
  sessionStudents:    (id)          => `/sessions/${id}/students`,
  sessionStudent:     (id, sid)     => `/sessions/${id}/students/${sid}`,
  sessionWarn:        (id, sid)     => `/sessions/${id}/students/${sid}/warn`,
  sessionAnswers:     (id)          => `/sessions/${id}/answers`,

  // ── Live ─────────────────────────────
  liveStart:          (id)          => `/sessions/${id}/live/start`,
  liveCountdown:      (id)          => `/sessions/${id}/live/countdown`,
  liveCountdownCancel:(id)          => `/sessions/${id}/live/countdown/cancel`,
  liveQuestionStart:  (id)          => `/sessions/${id}/live/question/start`,
  liveQuestionPause:  (id)          => `/sessions/${id}/live/question/pause`,
  liveQuestionResume: (id)          => `/sessions/${id}/live/question/resume`,
  liveQuestionReveal: (id)          => `/sessions/${id}/live/question/reveal`,
  liveQuestionNext:   (id)          => `/sessions/${id}/live/question/next`,
  liveFinish:         (id)          => `/sessions/${id}/live/finish`,
  liveReopen:         (id)          => `/sessions/${id}/live/reopen`,
  liveCloseReopened:  (id)          => `/sessions/${id}/live/close-reopened`,
  liveEnd:            (id)          => `/sessions/${id}/live/end`,
  liveAllowEdit:      (id)          => `/sessions/${id}/live/allow-edit`,

  // ── Realtime ─────────────────────────
  wsSession:          (id)          => `/ws/sessions/${id}`,
};