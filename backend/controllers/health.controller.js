export function healthController(_req, res) {
  res.json({ ok: true, service: "lms-backend", ts: Date.now() });
}

