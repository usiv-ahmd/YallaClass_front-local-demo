import { API } from "./config";

let getToken = () => null;
export function setAuthTokenGetter(fn) { getToken = fn; }

export class ApiError extends Error {
  constructor(message, status, payload) {
    super(message); this.name = "ApiError";
    this.status = status; this.payload = payload;
  }
}

async function request(method, path, body, opts = {}) {
  const { isFormData = false, signal } = opts;
  const headers = { Accept: "application/json" };
  if (!isFormData && body !== undefined) headers["Content-Type"] = "application/json";
  const t = getToken();
  if (t) headers.Authorization = `Bearer ${t}`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), API.timeoutMs);

  try {
    const res = await fetch(`${API.baseUrl}${path}`, {
      method, headers,
      body: body === undefined ? undefined : isFormData ? body : JSON.stringify(body),
      signal: signal ?? controller.signal,
    });
    const raw = await res.text();
    const data = raw ? safeJson(raw) : null;
    if (!res.ok) throw new ApiError(data?.message || `HTTP ${res.status}`, res.status, data);
    return data;
  } finally {
    clearTimeout(timer);
  }
}

const safeJson = (txt) => { try { return JSON.parse(txt); } catch { return txt; } };

export const http = {
  get:    (p, o)     => request("GET",    p, undefined, o),
  post:   (p, b, o)  => request("POST",   p, b, o),
  patch:  (p, b, o)  => request("PATCH",  p, b, o),
  put:    (p, b, o)  => request("PUT",    p, b, o),
  del:    (p, o)     => request("DELETE", p, undefined, o),
  upload: (p, fd, o) => request("POST",   p, fd, { ...o, isFormData: true }),
};