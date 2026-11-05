import { http } from "./client";
import { EP } from "./endpoints";

export const studentsApi = {
  join:         (sessionId, student)          => http.post(EP.sessionStudents(sessionId), student),
  update:       (sessionId, studentId, patch) => http.patch(EP.sessionStudent(sessionId, studentId), patch),
  remove:       (sessionId, studentId)        => http.del(EP.sessionStudent(sessionId, studentId)),
  warn:         (sessionId, studentId, data={}) => http.post(EP.sessionWarn(sessionId, studentId), data),

  submitAnswer: (sessionId, payload) =>
    http.post(EP.sessionAnswers(sessionId), payload),
  // payload: { studentId, questionId, selectedOption, timeLeft }
};