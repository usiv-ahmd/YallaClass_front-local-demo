import { useState, useRef, useEffect } from "react";

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

export default function useQuestionsForm(session) {
  const [formOpen, setFormOpen]         = useState(false);
  const [text, setText]                 = useState("");
  const [options, setOptions]           = useState(["", "", "", ""]);
  const [correctIndex, setCorrectIndex] = useState(0);
  const [duration, setDuration]         = useState(30);

  const selectedIdRef = useRef(session?.selectedId);

  useEffect(() => {
    if (selectedIdRef.current !== session?.selectedId) {
      selectedIdRef.current = session?.selectedId;
      setFormOpen(false);
      setText("");
      setOptions(["", "", "", ""]);
      setCorrectIndex(0);
      setDuration(30);
    }
  }, [session?.selectedId]);

  const rawQuestions = session?.selectedSession?.questions;
  const questions = rawQuestions
    ? Array.isArray(rawQuestions)
      ? rawQuestions
      : Object.values(rawQuestions)
    : [];

  const commit = (nextQuestions) =>
    session.updateQuestions(session.selectedId, nextQuestions);

  // ── Add ────────────────────────────────────────
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

    setText("");
    setOptions(["", "", "", ""]);
    setCorrectIndex(0);
    setDuration(30);
    setFormOpen(false);
  }

  // ── Options ────────────────────────────────────
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

  // ── Delete a saved question ────────────────────
  function deleteQuestion(questionId) {
    commit(questions.filter((item) => item.id !== questionId));
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
  };
}