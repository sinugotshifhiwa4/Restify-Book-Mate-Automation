import { LoggerConfig } from "./logger.types";

export const winstonLoggerConfig: LoggerConfig = {
  logFileLimit: 10 * 1024 * 1024,
  timeZone: "Africa/Johannesburg",
  dateFormat: "YYYY-MM-DDTHH:mm:ssZ",
  logLevels: {
    debug: "debug",
    info: "info",
    error: "error",
    warn: "warn",
  },
  logFilePaths: {
    LOG_FILE_DEBUG: "debug.log",
    LOG_FILE_INFO: "info.log",
    LOG_FILE_ERROR: "error.log",
    LOG_FILE_WARN: "warn.log",
  },
};

export const LoggerDirectory = {
  DIRECTORY: "logs",
} as const;
