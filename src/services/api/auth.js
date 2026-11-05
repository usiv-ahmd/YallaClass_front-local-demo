// src/services/api/auth.js
const TEACHER_ID_KEY = "live-quiz:teacher-id";
const TEACHER_NAME_KEY = "live-quiz:teacher-name";

function genId() {
  return `teacher-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
}

// For demo: ياخد teacher موجود أو يعمل واحد جديد
export function getCurrentTeacherId() {
  let id = localStorage.getItem(TEACHER_ID_KEY);
  if (!id) {
    id = genId();
    localStorage.setItem(TEACHER_ID_KEY, id);
  }
  return id;
}

export function getCurrentTeacherName() {
  return localStorage.getItem(TEACHER_NAME_KEY) || "المدرس";
}

export function setCurrentTeacherName(name) {
  localStorage.setItem(TEACHER_NAME_KEY, name);
}

// placeholder — الـ auth الحقيقي هيتضاف لاحقاً
export function isAuthenticated() {
  return Boolean(localStorage.getItem(TEACHER_ID_KEY));
}