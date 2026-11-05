// src/services/api/liveApi.js
import { http } from "./client";
import { EP } from "./endpoints";

const P = (fn) => (id, body) => http.post(fn(id), body ?? {});

export const liveApi = {
  start:           P(EP.liveStart),
  startCountdown:  P(EP.liveCountdown),
  cancelCountdown: P(EP.liveCountdownCancel),
  startQuestion:   P(EP.liveQuestionStart),
  pauseQuestion:   P(EP.liveQuestionPause),
  resumeQuestion:  P(EP.liveQuestionResume),
  revealAnswer:    P(EP.liveQuestionReveal),
  nextQuestion:    P(EP.liveQuestionNext),
  finishRound:     P(EP.liveFinish),
  reopenForPending:(id, allowEdit) => http.post(EP.liveReopen(id), { allowEdit }),
  closeReopened:   P(EP.liveCloseReopened),
  end:             P(EP.liveEnd),
  setAllowEdit:    (id, allowEdit) => http.patch(EP.liveAllowEdit(id), { allowEdit }),
  setAutoAdvance:  (id, autoAdvance) => http.patch(EP.liveAutoAdvance(id), { autoAdvance }),
};