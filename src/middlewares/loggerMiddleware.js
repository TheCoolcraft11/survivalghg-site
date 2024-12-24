const logger = require("../utils/logger");

const requestLogger = (req, res, next) => {
  const start = Date.now();
  const { method, originalUrl, ip } = req;

  res.on("finish", () => {
    const duration = Date.now() - start;
    logger.info({
      message: "HTTP Request",
      method: method,
      url: originalUrl,
      status: res.statusCode,
      responseTime: `${duration}ms`,
      userAgent: req.headers["user-agent"],
      ip: ip,
    });
  });

  next();
};

const errorLogger = (err, req, res, next) => {
  const { method, originalUrl, ip } = req;

  logger.error({
    message: "Unhandled error occurred",
    method: method,
    url: originalUrl,
    status: err.status || 500,
    error: err.stack,
    ip: ip,
  });

  next(err);
};

module.exports = { requestLogger, errorLogger };
