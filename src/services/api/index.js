// src/services/api/index.js
import { API } from "./config";
import { sessionsApi } from "./sessionsApi";
import { studentsApi } from "./studentsApi";
import { liveApi } from "./liveApi";
import { subscribeSession } from "./realtime";
import { mockSessionsApi, mockStudentsApi, mockLiveApi } from "./mockBackend";

export const api = API.useMock
  ? {
      sessions: mockSessionsApi,
      students: mockStudentsApi,
      live:     mockLiveApi,
      realtime: { subscribeSession },
    }
  : {
      sessions: sessionsApi,
      students: studentsApi,
      live:     liveApi,
      realtime: { subscribeSession },
    };

export * from "./config";
export { setAuthTokenGetter, ApiError } from "./client";