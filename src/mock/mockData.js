// mock/mockData.js
export const initialMockData = {
  session: {
    id: "session-001",
    code: "ABC123",
    title: "حصة تجريبية - رياضيات",
    subject: "رياضيات",
    studentnumber: 4,

    questions: [
      {
        id: "q-1",
        question: "٢ + ٢ = ؟",
        text: "٢ + ٢ = ؟",
        options: ["٢", "٣", "٤", "٥"],
        correctOptionIndex: 2,
        correctAnswer: "٤",
        duration: 30,
        source: "manual",
        type: "mcq",
      },
      {
        id: "q-2",
        question: "٥ × ٣ = ؟",
        text: "٥ × ٣ = ؟",
        options: ["١٥", "١٠", "٢٠", "٢٥"],
        correctOptionIndex: 0,
        correctAnswer: "١٥",
        duration: 30,
        source: "manual",
        type: "mcq",
      },
    ],

    // ✅ لازم طلاب هنا عشان الزرار يتفتح
    students: [
      { id: "u-1", name: "أحمد محمود",   attended: true, interacted: true,  correctAnswers: 0, wrongAnswers: 0, score: 0, highestStreak: 0, finishedAt: null },
      { id: "u-2", name: "سارة علي",     attended: true, interacted: true,  correctAnswers: 0, wrongAnswers: 0, score: 0, highestStreak: 0, finishedAt: null },
      { id: "u-3", name: "محمد حسن",     attended: true, interacted: false, correctAnswers: 0, wrongAnswers: 0, score: 0, highestStreak: 0, finishedAt: null },
      { id: "u-4", name: "نور إبراهيم",  attended: true, interacted: true,  correctAnswers: 0, wrongAnswers: 0, score: 0, highestStreak: 0, finishedAt: null },
    ],

    answers: {},

    files: [],
  },
};