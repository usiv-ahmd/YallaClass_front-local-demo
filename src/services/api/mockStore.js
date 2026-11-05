// src/services/api/mockStore.js
const KEY     = "live-quiz:sessions-cache";     // "backend database"
const EVENT   = "live-quiz:sessions-updated";   // same-tab
const CHANNEL = "live-quiz:sessions-broadcast"; // cross-tab

let _channel = null;
function getChannel() {
  if (_channel !== null) return _channel;
  try { _channel = new BroadcastChannel(CHANNEL); } catch { _channel = false; }
  return _channel || null;
}

export function readMock() {
  try { return JSON.parse(localStorage.getItem(KEY) || "{}"); } catch { return {}; }
}

export function writeMock(all) {
  localStorage.setItem(KEY, JSON.stringify(all));
}

// same-tab: CustomEvent; cross-tab: BroadcastChannel (فوري) + storage (fallback)
export function mockEmit(all) {
  window.dispatchEvent(new CustomEvent(EVENT, { detail: all }));
  try { getChannel()?.postMessage({ type: "update", data: all }); } catch {}
}

// اللي sessionStore هيستخدمه للاشتراك في الـ BroadcastChannel
export function subscribeBroadcast(cb) {
  const ch = getChannel();
  if (!ch) return () => {};
  const handler = (e) => {
    if (e?.data?.type === "update" && e.data.data) cb(e.data.data);
  };
  ch.addEventListener("message", handler);
  return () => ch.removeEventListener("message", handler);
}