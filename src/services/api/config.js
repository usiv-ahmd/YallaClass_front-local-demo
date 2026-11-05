export const API = {
  baseUrl: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000/api",
  wsUrl:   import.meta.env.VITE_WS_URL       ?? "ws://localhost:4000",
  useMock: (import.meta.env.VITE_USE_MOCK ?? "true") !== "false",
  timeoutMs: 15000,
};