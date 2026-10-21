// src/mocks/mockData.js

export const initialMockData = {
  sessions: [
    {
      id: "s1",
      title: "مراجعة قوانين الحركة",
      subject: "الفيزياء · الصف الثاني الثانوي",
      code: "PHY-101",
      status: "scheduled",
      date: "2026-02-05",
      time: "10:00",
      studentnumber: "5",
      files: [],
      students: [
        {
          id: 1,
          name: 'أحمد',
          correctAnswers: 8,
          wrongAnswers: 2,
          attended: true,
           interacted: true,
          score: 850,
          highestStreak: 12
        },
        {
          id: 2,
          name: 'سارة',
          correctAnswers: 6,
          wrongAnswers: 4,
          attended: true,
           interacted: false,
          score: 780,
          highestStreak: 9
        },
        {
          id: 3,
          name: 'محمد',
          correctAnswers: 0,
          wrongAnswers: 0,
          attended: false,
          interacted: false,
          score: 0,
          highestStreak: 0
        },
      ],
      questions: [
        {
          id: "q1",
          question: "ما هي عاصمة مصر؟",
          options: ["القاهرة", "الإسكندرية", "أسوان", "الجيزة"],
          correctAnswer: "القاهرة",
          source: "manual",
          type: "mcq",
      
        },
      ],
  
    },
    {
      id: "s2",
      title: "اسئله ماث",
      subject: "ماث",
      code: "Mth-101",
      status: "completed",
      date: "2026-10-05",
      time: "10:00",
      studentnumber: "10",
      files: [],
      students: [
        {
          id: 11,
          name: 'يوسف',
          correctAnswers: 9,
          wrongAnswers: 2,
          attended: true,
           interacted: true,
          score: 850,
          highestStreak: 12
        },
        {
          id: 12,
          name: 'مجدي',
          correctAnswers: 7,
          wrongAnswers: 4,
          attended: true,
           interacted: false,
          score: 780,
          highestStreak: 9
        },
        {
          id: 13,
          name: 'رامي',
          correctAnswers: 0,
          wrongAnswers: 0,
          attended: false,
          interacted: false,
          score: 0,
          highestStreak: 0
        },
      ],
      questions: [
        {
          id: "q1",
          question: "1 + 2",
          options: ["3", "1", "5", "4"],
          correctAnswer: "3",
          source: "ai",
          type: "mcq",
      
        },
        {
          id: "q1",
          question: "1 + 2",
          options: ["3", "1", "5", "4"],
          correctAnswer: "3",
          source: "manual",
          type: "mcq",
      
        },
        {
          id: "q1",
          question: "1 + 2",
          options: ["3", "1", "5", "4"],
          correctAnswer: "3",
          source: "manual",
          type: "mcq",
      
        },
        {
          id: "q1",
          question: "1 + 2",
          options: ["3", "1", "5", "4"],
          correctAnswer: "3",
          source: "manual",
          type: "mcq",
      
        },
      ],
  
    },
    {
      id: "s3",
      title: "فزياء كهربية",
      subject: "فزياء",
      code: "Pys-101",
      status: "draft",
      date: "2026-10-05",
      time: "10:00",
      studentnumber: "10",
      files: [],
      students: [
        {
          id: 11,
          name: 'جمال',
          correctAnswers: 9,
          wrongAnswers: 2,
          attended: true,
           interacted: true,
          score: 850,
          highestStreak: 12
        },
        {
          id: 12,
          name: 'جواد',
          correctAnswers: 7,
          wrongAnswers: 4,
          attended: true,
           interacted: false,
          score: 780,
          highestStreak: 9
        },
        {
          id: 13,
          name: 'علي',
          correctAnswers: 0,
          wrongAnswers: 0,
          attended: false,
          interacted: false,
          score: 0,
          highestStreak: 0
        },
      ],
      questions: [
        {
          id: "q1",
          question: "I * R",
          options: ["V", "Q*Q", "S", "P"],
          correctAnswer: "V",
          source: "manual",
          type: "mcq",
      
        },
      ],
  
    },
  ],
};