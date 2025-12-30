import winston from "winston";

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.json()
);

export const appLogger = winston.createLogger({
  level: "info",
  format: logFormat,
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({
      filename: "logs/app.log"
    })
  ]
});

export const errorLogger = winston.createLogger({
  level: "error",
  format: logFormat,
  transports: [
    new winston.transports.File({
      filename: "logs/error.log"
    })
  ]
});

export const auditLogger = winston.createLogger({
  level: "info",
  format: logFormat,
  transports: [
    new winston.transports.File({
      filename: "logs/audit.log"
    })
  ]
});
