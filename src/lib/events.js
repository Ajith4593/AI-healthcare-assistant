// Lightweight EventSource wrapper for app-wide SSE subscriptions
const subscribers = {};
let es = null;
let reconnectTimer = null;

function buildUrl() {
  const token = localStorage.getItem("authToken");
  const base = "/api/v1/events/stream";
  if (!token) return base;
  try {
    return base + "?token=" + encodeURIComponent(token);
  } catch {
    return base;
  }
}

function init() {
  if (es) return;
  const url = buildUrl();
  try {
    es = new EventSource(url);
  } catch (err) {
    console.warn("SSE init failed:", err);
    scheduleReconnect();
    return;
  }

  es.onmessage = (e) => {
    try {
      const msg = JSON.parse(e.data);
      const type = msg.type || msg.event || "message";
      const payload = msg.payload ?? msg.data ?? null;
      // specific subscribers
      (subscribers[type] || []).forEach((cb) => cb(payload, msg));
      // wildcard subscribers
      (subscribers["*"] || []).forEach((cb) => cb(payload, msg));
    } catch (err) {
      // not JSON or unexpected format
      (subscribers["message"] || []).forEach((cb) => cb(e.data, e));
    }
  };

  es.onerror = () => {
    // close and attempt reconnect with backoff
    try { es.close(); } catch {}
    es = null;
    scheduleReconnect();
  };
}

function scheduleReconnect() {
  if (reconnectTimer) return;
  reconnectTimer = setTimeout(() => {
    reconnectTimer = null;
    init();
  }, 3000);
}

export function subscribe(eventType, cb) {
  if (!subscribers[eventType]) subscribers[eventType] = [];
  subscribers[eventType].push(cb);
  init();
  return () => unsubscribe(eventType, cb);
}

export function unsubscribe(eventType, cb) {
  if (!subscribers[eventType]) return;
  subscribers[eventType] = subscribers[eventType].filter((f) => f !== cb);
}

export function closeEvents() {
  try {
    if (es) es.close();
  } catch {}
  es = null;
  Object.keys(subscribers).forEach((k) => (subscribers[k] = []));
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
}

export default { subscribe, unsubscribe, closeEvents };
