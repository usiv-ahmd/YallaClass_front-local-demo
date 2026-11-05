// hooks/useQuestionsForm.js
import { useState } from "react";

export function makeId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function getCorrectIndex(question) {
  if (Number.isInteger(question?.correctOptionIndex)) return question.correctOptionIndex;
  if (Array.isArray(question?.options) && typeof question?.correctAnswer === "string") {
    return question.options.indexOf(question.correctAnswer);
  }
  return -1;
}

export const QUESTION_DURATIONS = [15, 30, 45, 60, 90, 120];

export default function useQuestionsForm({ session, updateQuestions }) {
  const [formOpen, setFormOpen]         = useState(false);
  const [text, setText]                 = useState("");
  const [options, setOptions]           = useState(["", "", "", ""]);
  const [correctIndex, setCorrectIndex] = useState(0);
  const [duration, setDuration]         = useState(30);
  const [editingId, setEditingId]       = useState(null);

  // helper: تصفير الفورم بالكامل
  function resetForm() {
    setFormOpen(false);
    setEditingId(null);
    setText("");
    setOptions(["", "", "", ""]);
    setCorrectIndex(0);
    setDuration(30);
  }

  // ── قراءة الأسئلة من الجلسة الواحدة ────────────────
  const rawQuestions = session?.questions;
  const questions = rawQuestions
    ? Array.isArray(rawQuestions)
      ? rawQuestions
      : Object.values(rawQuestions)
    : [];

  // ── حفظ التعديلات على الجلسة ──────────────────────
  const commit = (nextQuestions) => {
    if (typeof updateQuestions === "function") updateQuestions(nextQuestions);
  };

  // ── فتح الفورم لإضافة سؤال جديد ────────────────────
  function startAdd() {
    resetForm();
    setFormOpen(true);
  }

  // ── فتح الفورم لتعديل سؤال موجود ────────────────────
  function startEdit(question) {
    if (!question) return;
    setEditingId(question.id);
    setText(question.question ?? question.text ?? "");
    const opts =
      Array.isArray(question.options) && question.options.length >= 2
        ? [...question.options]
        : ["", ""];
    setOptions(opts);
    setCorrectIndex(Math.max(0, getCorrectIndex(question)));
    setDuration(Number(question.duration) || 30);
    setFormOpen(true);
  }

  // ── Submit: إضافة أو تعديل حسب editingId ──────────────
  function addQuestion(event) {
    event.preventDefault();

    const trimmedOptions = options.map((option) => option.trim());

    if (!text.trim()) {
      alert("اكتب نص السؤال الأول");
      return;
    }
    if (trimmedOptions.some((opt) => !opt)) {
      alert("كل الخيارات لازم تكون مكتوبة");
      return;
    }
    if (trimmedOptions.length < 2) {
      alert("لازم يكون فيه على الأقل خيارين");
      return;
    }

    const safeDuration = Math.min(120, Math.max(5, Number(duration) || 30));

    if (editingId) {
      // 🔄 وضع التعديل
      commit(
        questions.map((q) =>
          q.id === editingId
            ? {
                ...q,
                question: text.trim(),
                text: text.trim(),
                options: trimmedOptions,
                correctOptionIndex: correctIndex,
                correctAnswer: trimmedOptions[correctIndex],
                duration: safeDuration,
              }
            : q
        )
      );
    } else {
      // ➕ وضع الإضافة
      const newQuestion = {
        id: makeId("question"),
        question: text.trim(),
        text: text.trim(),
        options: trimmedOptions,
        correctOptionIndex: correctIndex,
        correctAnswer: trimmedOptions[correctIndex],
        duration: safeDuration,
        source: "manual",
        type: "mcq",
      };
      commit([...questions, newQuestion]);
    }

    resetForm();
  }

  // ── Options ────────────────────────────────────────
  function updateOption(index, value) {
    setOptions((current) =>
      current.map((option, optionIndex) => (optionIndex === index ? value : option))
    );
  }

  function removeOption(index) {
    setOptions((current) => current.filter((_, optionIndex) => optionIndex !== index));
    setCorrectIndex((current) =>
      current === index ? Math.max(0, index - 1) : current > index ? current - 1 : current
    );
  }

  // ── Delete ─────────────────────────────────────────
  function deleteQuestion(questionId) {
    commit(questions.filter((item) => item.id !== questionId));
    if (editingId === questionId) resetForm();
  }

  return {
    questions,
    formOpen, setFormOpen,
    text, setText,
    options, setOptions,
    correctIndex, setCorrectIndex,
    duration, setDuration,

    addQuestion,
    updateOption,
    removeOption,
    deleteQuestion,

    editingId,
    startAdd,
    startEdit,
    cancelForm: resetForm,
  };
}