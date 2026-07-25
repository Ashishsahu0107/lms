export function requestLogger(req, _res, next) {
  const startedAt = Date.now();

  // Minimal logger; replace with pino/winston in real prod.
  // eslint-disable-next-line no-console
  console.log(`[request] ${req.method} ${req.originalUrl}`);

  resLogger(req, _res, next, startedAt);
}

function resLogger(req, res, next, startedAt) {
  res.on("finish", () => {
    const ms = Date.now() - startedAt;
    // eslint-disable-next-line no-console
    console.log(
      `[response] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${ms}ms)`,
    );
  });

  next();
}
