import { errorLogger } from "../utils/logger.js";

const errorMiddleware = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  // Log error details
  errorLogger.error('Unhandled error', {
    statusCode: err.statusCode,
    message: err.message,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip
  });

  // Production-safe response
  res.status(err.statusCode || 500).json({
    status: err.status,
    message: err.message,
  });
};

export default errorMiddleware;
