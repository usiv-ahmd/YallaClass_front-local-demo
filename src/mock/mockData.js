// src/mocks/mockData.js

export const initialMockData = {
  sessions: [
    // =========================================================
    // s1 — Scheduled + ملف كامل + AI مرتبط + يدوي + طلاب
    // =========================================================
    {
      id: "s1",
      title: "مراجعة قوانين الحركة",
      subject: "الفيزياء · الصف الثاني الثانوي",
      code: "PHY-101",
      status: "scheduled",
      date: "2026-02-05",
      time: "10:00",
      duration: "60",
      studentnumber: "5",
      files: [
        {
          id: "file-s1-1",
          name: "قوانين-الحركة.pdf",
          url: "https://mock-storage.com/files/قوانين-الحركة.pdf",
        },
      ],
      students: [
        { id: 1,  name: "أحمد محمود",   correctAnswers: 8,  wrongAnswers: 2, attended: true,  interacted: true,  score: 850,  highestStreak: 12 },
        { id: 2,  name: "سارة عبد الله", correctAnswers: 6,  wrongAnswers: 4, attended: true,  interacted: false, score: 780,  highestStreak: 9  },
        { id: 3,  name: "محمد علي",      correctAnswers: 0,  wrongAnswers: 0, attended: false, interacted: false, score: 0,    highestStreak: 0  },
        { id: 4,  name: "ليلى حسن",     correctAnswers: 10, wrongAnswers: 0, attended: true,  interacted: true,  score: 1000, highestStreak: 15 },
        { id: 5,  name: "عمر إبراهيم",   correctAnswers: 5,  wrongAnswers: 5, attended: true,  interacted: true,  score: 650,  highestStreak: 6  },
      ],
      questions: [
        {
          id: "q-s1-1",
          question: "ما هي عاصمة مصر؟",
          options: ["القاهرة", "الإسكندرية", "أسوان", "الجيزة"],
          correctAnswer: "القاهرة",
          correctOptionIndex: 0,
          source: "manual",
          type: "mcq",
          duration: "15"
        },
        {
          id: "q-s1-2",
          question: "ما هي وحدة قياس القوة؟",
          options: ["نيوتن", "جول", "واط", "أمبير"],
          correctAnswer: "نيوتن",
          correctOptionIndex: 0,
          source: "ai",
          sourceFileId: "file-s1-1",
          sourceFileName: "قوانين-الحركة.pdf",
          type: "mcq",
          duration: "15"
        },
        {
          id: "q-s1-3",
          question: "قانون نيوتن الثاني ينص على أن القوة تساوي الكتلة مضروبة في...",
          options: ["السرعة", "التسارع", "الإزاحة", "الزمن"],
          correctAnswer: "التسارع",
          correctOptionIndex: 1,
          source: "ai",
          sourceFileId: "file-s1-1",
          sourceFileName: "قوانين-الحركة.pdf",
          type: "mcq",
          duration: "15"
        },
      ],
    },

    // =========================================================
    // s2 — Completed + ملفين + أسئلة مختلطة (بعضها يتيم) + 8 طلاب
    // =========================================================
    {
      id: "s2",
      title: "اسئلة ماث - الفصل الثالث",
      subject: "ماث · الصف الأول الثانوي",
      code: "MTH-101",
      status: "completed",
      date: "2025-12-15",
      time: "14:30",
      duration: "90",
      studentnumber: "8",
      files: [
        {
          id: "file-s2-1",
          name: "algebra-notes.pdf",
          url: "https://mock-storage.com/files/algebra-notes.pdf",
        },
        {
          id: "file-s2-2",
          name: "geometry-summary.docx",
          url: "https://mock-storage.com/files/geometry-summary.docx",
        },
      ],
      students: [
        {id: 1,  name: "أحمد محمود",     correctAnswers: 10, wrongAnswers: 0, attended: true,  interacted: true,  score: 950, highestStreak: 20 },
        { id: 14, name: "نور الدين",     correctAnswers: 10, wrongAnswers: 0, attended: true,  interacted: true,  score: 950, highestStreak: 20 },
        { id: 11, name: "يوسف محمد",     correctAnswers: 9,  wrongAnswers: 2, attended: true,  interacted: true,  score: 850, highestStreak: 12 },
        { id: 12, name: "مجدي سامي",     correctAnswers: 7,  wrongAnswers: 4, attended: true,  interacted: false, score: 780, highestStreak: 9  },
        { id: 15, name: "كريم فؤاد",     correctAnswers: 6,  wrongAnswers: 4, attended: true,  interacted: true,  score: 720, highestStreak: 7  },
        { id: 18, name: "هدى صلاح",      correctAnswers: 5,  wrongAnswers: 5, attended: true,  interacted: true,  score: 680, highestStreak: 8  },
        { id: 16, name: "زياد عادل",     correctAnswers: 3,  wrongAnswers: 7, attended: true,  interacted: false, score: 450, highestStreak: 3  },
        { id: 17, name: "مروان طارق",    correctAnswers: 0,  wrongAnswers: 0, attended: false, interacted: true,  score: 0,   highestStreak: 0  },
        { id: 13, name: "رامي خالد",     correctAnswers: 0,  wrongAnswers: 0, attended: false, interacted: false, score: 0,   highestStreak: 0  },
      ],
      questions: [
        {
          id: "q-s2-1",
          question: "ما هو حل المعادلة 2x + 5 = 15؟",
          options: ["5", "10", "7", "3"],
          correctAnswer: "5",
          correctOptionIndex: 0,
          source: "manual",
          type: "mcq",
          duration: "15"
        },
        {
          id: "q-s2-2",
          question: "ما هو مشتق x²؟",
          options: ["2x", "x", "x³", "2"],
          correctAnswer: "2x",
          correctOptionIndex: 0,
          source: "ai",
          sourceFileId: "file-s2-1",
          sourceFileName: "algebra-notes.pdf",
          type: "mcq",
          duration: "15"
        },
        {
          id: "q-s2-3",
          question: "ما مجموع زوايا المثلث؟",
          options: ["90°", "180°", "270°", "360°"],
          correctAnswer: "180°",
          correctOptionIndex: 1,
          source: "ai",
          sourceFileId: "file-s2-2",
          sourceFileName: "geometry-summary.docx",
          type: "mcq",
          duration: "15"
        },
        {
          id: "q-s2-4",
          question: "ما هو قانون مساحة المثلث؟",
          options: ["الطول × العرض", "القاعدة × الارتفاع", "½ × القاعدة × الارتفاع", "πr²"],
          correctAnswer: "½ × القاعدة × الارتفاع",
          correctOptionIndex: 2,
          source: "manual",
          type: "mcq",
          duration: "15"
        },
        {
          id: "q-s2-5",
          question: "سؤال ذكي من ملف قديم (الملف اتحذف قبل كده)",
          options: ["الإجابة الصحيحة", "خطأ 1", "خطأ 2", "خطأ 3"],
          correctAnswer: "الإجابة الصحيحة",
          correctOptionIndex: 0,
          source: "ai",
          sourceFileName: "deleted-file.pdf",
          type: "mcq",
          duration: "15"
        },
      ],
    },

    // =========================================================
    // s3 — Draft + سؤال يدوي واحد + لا ملفات ولا طلاب
    // =========================================================
    {
      id: "s3",
      title: "فيزياء كهربية - مقدمة",
      subject: "فيزياء",
      code: "PYS-101",
      status: "draft",
      date: "2026-03-20",
      time: "09:00",
      duration: "45",
      studentnumber: "0",
      files: [],
      students: [],
      questions: [
        {
          id: "q-s3-1",
          question: "القانون I * R يساوي؟",
          options: ["V", "Q", "S", "P"],
          correctAnswer: "V",
          correctOptionIndex: 0,
          source: "manual",
          type: "mcq",
          duration: "15"
        },
      ],
    },

    // =========================================================
    // s4 — Scheduled + فاضية تمامًا (حالة "أول ما تتcreate")
    // =========================================================
    {
      id: "s4",
      title: "جلسة جديدة بدون محتوى",
      subject: "",
      code: "NEW-001",
      status: "scheduled",
      date: "2026-04-10",
      time: "16:00",
      duration: "30",
      studentnumber: "0",
      files: [],
      students: [],
      questions: [],
    },

    // =========================================================
    // s5 — Completed + 12 طالب (لاختبار جداول كبيرة + tie)
    // =========================================================
    {
      id: "s5",
      title: "اختبار تحديد المستوى",
      subject: "لغة إنجليزية · المستوى المتقدم",
      code: "ENG-201",
      status: "completed",
      date: "2025-11-01",
      time: "11:00",
      duration: "120",
      studentnumber: "12",
      files: [
        {
          id: "file-s5-1",
          name: "placement-test.pdf",
          url: "https://mock-storage.com/files/placement-test.pdf",
        },
      ],
      students: [
        { id: 21, name: "أحمد الشريف",      correctAnswers: 15, wrongAnswers: 5,  attended: true,  interacted: true,  score: 1200, highestStreak: 18 },
        { id: 22, name: "بسمة كمال",        correctAnswers: 14, wrongAnswers: 6,  attended: true,  interacted: true,  score: 1150, highestStreak: 15 },
        { id: 23, name: "تامر حسن",         correctAnswers: 13, wrongAnswers: 7,  attended: true,  interacted: true,  score: 1100, highestStreak: 12 },
        { id: 24, name: "ثريا محمود",       correctAnswers: 12, wrongAnswers: 8,  attended: true,  interacted: false, score: 1050, highestStreak: 10 },
        { id: 25, name: "جمال عبد الناصر",  correctAnswers: 11, wrongAnswers: 9,  attended: true,  interacted: true,  score: 950,  highestStreak: 9  },
        { id: 26, name: "حنان سمير",        correctAnswers: 11, wrongAnswers: 9,  attended: true,  interacted: false, score: 950,  highestStreak: 8  },
        { id: 27, name: "خالد يوسف",        correctAnswers: 9,  wrongAnswers: 11, attended: true,  interacted: true,  score: 900,  highestStreak: 7  },
        { id: 28, name: "دعاء إبراهيم",     correctAnswers: 8,  wrongAnswers: 12, attended: true,  interacted: false, score: 850,  highestStreak: 6  },
        { id: 29, name: "رامي فتحي",        correctAnswers: 5,  wrongAnswers: 15, attended: true,  interacted: false, score: 600,  highestStreak: 4  },
        { id: 30, name: "سلمى أشرف",        correctAnswers: 0,  wrongAnswers: 0,  attended: false, interacted: false, score: 0,    highestStreak: 0  },
        { id: 31, name: "شريف منير",        correctAnswers: 0,  wrongAnswers: 0,  attended: false, interacted: false, score: 0,    highestStreak: 0  },
        { id: 32, name: "صفاء علي",         correctAnswers: 0,  wrongAnswers: 0,  attended: false, interacted: false, score: 0,    highestStreak: 0  },
      ],
      questions: [
        {
          id: "q-s5-1",
          question: "Choose the correct form: He ____ to school every day.",
          options: ["go", "goes", "going", "gone"],
          correctAnswer: "goes",
          correctOptionIndex: 1,
          source: "ai",
          sourceFileId: "file-s5-1",
          sourceFileName: "placement-test.pdf",
          type: "mcq",
          duration: "15"
        },
        {
          id: "q-s5-2",
          question: "What is the past tense of 'eat'?",
          options: ["ate", "eated", "eaten", "eating"],
          correctAnswer: "ate",
          correctOptionIndex: 0,
          source: "manual",
          type: "mcq",
          duration: "15"
        },
      ],
    },

    // =========================================================
    // s6 — Scheduled + عنوان/مادة طويلة (overflow في الـ tile/header)
    // =========================================================
    {
      id: "s6",
      title: "مراجعة شاملة ومكثفة جداً لكل قوانين الحركة والديناميكا والحرارة والدوائر الكهربية قبل الامتحان النهائي",
      subject: "الفيزياء · الصف الثالث الثانوي · القسم العلمي · شعبة رياضة",
      code: "PHY-FINAL-2026",
      status: "scheduled",
      date: "2026-06-01",
      time: "08:00",
      duration: "180",
      studentnumber: "25",
      files: [],
      students: [],
      questions: [],
    },

    // =========================================================
    // s7 — Draft + سؤال قديم (بدون correctOptionIndex)
    // =========================================================
    {
      id: "s7",
      title: "كيمياء عضوية - مراجعة",
      subject: "كيمياء",
      code: "CHM-301",
      status: "draft",
      date: "2026-05-15",
      time: "13:00",
      duration: "60",
      studentnumber: "0",
      files: [],
      students: [],
      questions: [
        {
          id: "q-s7-1",
          question: "ما هو الرمز الكيميائي للماء؟",
          options: ["H2O", "CO2", "O2", "NaCl"],
          correctAnswer: "H2O",
          source: "manual",
          type: "mcq",
          duration: "15"
        },
        {
          id: "q-s7-2",
          question: "سؤال AI قديم بدون ربط بملف",
          options: ["أ", "ب", "ج", "د"],
          correctAnswer: "ب",
          source: "ai",
          type: "mcq",
          duration: "15"
        },
      ],
    },
    {
      id: "s8",
      title: "أحياء - الجهاز الهضمي",
      subject: "أحياء · الصف الثاني الثانوي",
      code: "BIO-102",
      status: "scheduled",
      date: "2026-04-22",
      time: "17:00",
      duration: "45",
      studentnumber: "3",
      files: [
        {
          id: "file-s8-1",
          name: "digestive-system.pdf",
          url: "https://mock-storage.com/files/digestive-system.pdf",
        },
      ],
      students: [
        { id: 41, name: "علياء محمد",   correctAnswers: 0, wrongAnswers: 0, attended: false, interacted: false, score: 0, highestStreak: 0 },
        { id: 42, name: "فاطمة أحمد",   correctAnswers: 0, wrongAnswers: 0, attended: false, interacted: false, score: 0, highestStreak: 0 },
        { id: 43, name: "مصطفى كامل",  correctAnswers: 0, wrongAnswers: 0, attended: false, interacted: false, score: 0, highestStreak: 0 },
      ],
      questions: [],
    },
  ],
};