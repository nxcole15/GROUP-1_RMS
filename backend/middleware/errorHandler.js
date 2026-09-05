/**
 * Global error handler — must be registered last in Express.
 */
function errorHandler(err, req, res, next) {
  console.error("[ERROR]", err.message || err);
  const status = err.status || 500;
  res.status(status).json({ error: err.message || "Internal server error." });
}

module.exports = errorHandler;
