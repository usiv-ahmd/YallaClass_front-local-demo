export type Question = {
  id: string;
  text: string;
  options: string[];
  correctOptionIndex: number;
  source: "manual";
};

export type StudentProgress = {
  id: string;
  name: string;
  correctAnswers: number;
  score: number;
  color: "lime" | "blue" | "coral" | "violet";
};

export type SessionStatus = "scheduled" | "draft" | "completed";

export type ClassSession = {
  id: string;
  title: string;
  subject: string;
  date: string;
  time: string;
  duration: number;
  code: string;
  status: SessionStatus;
  questions: Question[];
  students: StudentProgress[];
};
