// Logging service
type LogLevel = "debug" | "info" | "warn" | "error";

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

class Logger {
  private minLevel: LogLevel = import.meta.env.PROD ? "warn" : "debug";

  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVELS[level] >= LOG_LEVELS[this.minLevel];
  }

  debug(message: string, ...args: unknown[]) {
    if (this.shouldLog("debug")) console.debug(`[DEBUG] ${message}`, ...args);
  }

  info(message: string, ...args: unknown[]) {
    if (this.shouldLog("info")) console.info(`[INFO] ${message}`, ...args);
  }

  warn(message: string, ...args: unknown[]) {
    if (this.shouldLog("warn")) console.warn(`[WARN] ${message}`, ...args);
  }

  error(message: string, error?: Error, ...args: unknown[]) {
    if (this.shouldLog("error")) {
      console.error(`[ERROR] ${message}`, error, ...args);
      // Send to Sentry in production
    }
  }

  setLevel(level: LogLevel) {
    this.minLevel = level;
  }
}

export const logger = new Logger();
