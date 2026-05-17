// Central error handler.
// Controllers should forward errors via `next(err)`.
export function errorHandler(err, _req, res, _next) {
  const status = err?.statusCode ?? err?.status ?? 500;
  const message = err?.message ?? "Internal Server Error";

  // eslint-disable-next-line no-console
  console.error(err);

  res.status(status).json({
    message,
    ...(envSafeDetails(err) ? { details: envSafeDetails(err) } : {}),
  });
}

function envSafeDetails(err) {
  if (!err) return null;
  if (process.env.NODE_ENV === "production") return null;
  return err.details ?? null;
}

