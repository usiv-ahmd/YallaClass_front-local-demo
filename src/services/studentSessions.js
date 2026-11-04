// src/services/studentSessions.js
import { initialMockData } from "../mock/mockData";

export function getStudentSessions(studentId, sessions = initialMockData.sessions) {
  return sessions
    .filter((s) => s.students.some((st) => st.id === studentId))
    .map((s) => ({
      ...s,
      myStats: s.students.find((st) => st.id === studentId),
    }));
}