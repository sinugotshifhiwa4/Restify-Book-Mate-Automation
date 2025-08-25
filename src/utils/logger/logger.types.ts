export interface LoggerConfig {
  logFileLimit: number;
  timeZone: string;
  dateFormat: string;
  logLevels: LogLevels;
  logFilePaths: LogFilePaths;
}

interface LogLevels {
  readonly debug: string;
  readonly info: string;
  readonly error: string;
  readonly warn: string;
}

interface LogFilePaths {
  readonly LOG_FILE_DEBUG: string;
  readonly LOG_FILE_INFO: string;
  readonly LOG_FILE_ERROR: string;
  readonly LOG_FILE_WARN: string;
}
