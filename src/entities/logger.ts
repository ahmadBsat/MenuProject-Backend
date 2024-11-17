import { configDotenv } from "dotenv";

configDotenv();

enum LogLevel {
  NONE = "NONE", // No logs will be output.
  ERROR = "ERROR", // For logging error messages that indicate a failure in a specific operation.
  WARN = "WARN", // For logging potentially harmful situations that are not necessarily errors.
  INFO = "INFO", // For logging informational messages that highlight the progress of the application.
  DEBUG = "DEBUG", // For logging detailed information on the flow through the system, primarily used for debugging.
  TRACE = "TRACE", // For logging more detailed information than the DEBUG level.
  SUCCESS = "SUCCESS",
}

export class Logger {
  static colors: Record<LogLevel, string | undefined> = {
    [LogLevel.ERROR]: "\x1b[31m%s\x1b[0m", // Red
    [LogLevel.WARN]: "\x1b[33m%s\x1b[0m", // Yellow
    [LogLevel.INFO]: "\x1b[34m%s\x1b[0m", // Blue
    [LogLevel.DEBUG]: "\x1b[36m%s\x1b[0m", // Cyan
    [LogLevel.TRACE]: "\x1b[35m%s\x1b[0m", // Magenta
    [LogLevel.SUCCESS]: "\x1b[32m%s\x1b[0m", // Green
    [LogLevel.NONE]: undefined, // No color for NONE
  };

  static getCallerInfo(): string {
    const error = new Error();
    const stackLines = error.stack?.split("\n") || [];

    // Adjust the index here to ensure it points to the frame outside `Logger` class
    const callerLine = stackLines[4] || ""; // Using index 4 should point outside Logger class in most environments
    const match = callerLine.match(/\((.*):(\d+):(\d+)\)/);

    if (match) {
      const filePath = match[1];
      const lineNumber = match[2];
      return `${filePath}:${lineNumber}`;
    }
    return "unknown location";
  }

  static log(message: string, level: LogLevel) {
    const logLevel: LogLevel =
      LogLevel[process.env.LOGGING_LEVEL as keyof typeof LogLevel] ||
      LogLevel.NONE;

    const levels = [
      LogLevel.NONE,
      LogLevel.ERROR,
      LogLevel.WARN,
      LogLevel.INFO,
      LogLevel.DEBUG,
      LogLevel.TRACE,
    ];

    const currentLevelIndex = levels.indexOf(logLevel);
    const messageLevelIndex = levels.indexOf(level);

    if (currentLevelIndex >= messageLevelIndex) {
      const color = Logger.colors[level] as string;
      const caller_info = Logger.getCallerInfo();
      let msg = `[${new Date().toISOString()}] ${level} - ${message} `;

      if (level === LogLevel.ERROR || level === LogLevel.DEBUG) {
        msg += `(${caller_info})`;
      }

      // Ensure level is a valid method on console, falling back to `log`
      const logMethod = (console[level.toLowerCase() as keyof Console] ||
        console.log) as (message?: any, ...optionalParams: any[]) => void;

      logMethod(color, msg);

      // const useDbAuthentication = process.env.USE_DB_AUTHENTICATION === 'true';
      // if (useDbAuthentication) {
      // save to supabase? another place?
      // supabase.from('logs').insert({ level: level, message: message, timestamp: new Date().toISOString(), success: boolean });
      // }
    }
  }

  static error(message: string | any) {
    Logger.log(message, LogLevel.ERROR);
  }

  static warn(message: string) {
    Logger.log(message, LogLevel.WARN);
  }

  static info(message: string) {
    Logger.log(message, LogLevel.INFO);
  }

  static success(message: string) {
    Logger.log(message, LogLevel.SUCCESS);
  }

  static debug(message: string) {
    Logger.log(message, LogLevel.DEBUG);
  }

  static trace(message: string) {
    Logger.log(message, LogLevel.TRACE);
  }
}
