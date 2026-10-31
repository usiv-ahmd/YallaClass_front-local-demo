// hooks/liveStates.js
export const LIVE_STATES = {
  lobby: {
    label: "مستنيين البداية",
    cls: "status-ready",
    canGoTo: ["countdown"],
  },
  countdown: {
    label: "العدّ التمهيدي",
    cls: "status-live",
    canGoTo: ["question", "lobby"],
  },
  question: {
    label: "السؤال شغّال",
    cls: "status-live",
    canGoTo: ["paused", "reveal"],
  },
  paused: {
    label: "الحصة متوقفة",
    cls: "status-paused",
    canGoTo: ["question", "reveal", "finished"],
  },
  reveal: {
    label: "مراجعة الإجابات",
    cls: "status-reveal",
    canGoTo: ["question", "finished"],
  },
  finished: {
    label: "الجولة خلصت",
    cls: "status-finished",
        canGoTo: ["reopened"],
  },
  reopened: {
    label: "مفتوح للمتأخرين",
    cls: "status-reveal",
    canGoTo: ["finished"],
  },
};