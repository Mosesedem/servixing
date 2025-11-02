/**
 * Logger utility for application-wide logging
 * Can be extended with external services like Sentry, LogRocket, etc.
 */

type LogLevel = "debug" | "info" | "warn" | "error";

interface LogContext {
  [key: string]: any;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === "development";

  private log(level: LogLevel, message: string, context?: LogContext) {
    const timestamp = new Date().toISOString();
    const logData = {
      timestamp,
      level,
      message,
      ...(context && { context }),
    };

    // In production, you'd send to external logging service
    // For now, use console with colors in development
    if (this.isDevelopment) {
      this.logToConsole(level, message, context);
    } else {
      // Production: structured JSON logging
      console.log(JSON.stringify(logData));
    }
  }

  private logToConsole(level: LogLevel, message: string, context?: LogContext) {
    const colors = {
      debug: "\x1b[36m", // Cyan
      info: "\x1b[32m", // Green
      warn: "\x1b[33m", // Yellow
      error: "\x1b[31m", // Red
    };
    const reset = "\x1b[0m";
    const timestamp = new Date().toISOString();

    console.log(
      `${
        colors[level]
      }[${level.toUpperCase()}]${reset} ${timestamp} - ${message}`
    );

    if (context) {
      console.log(context);
    }
  }

  debug(message: string, context?: LogContext) {
    this.log("debug", message, context);
  }

  info(message: string, context?: LogContext) {
    this.log("info", message, context);
  }

  warn(message: string, context?: LogContext) {
    this.log("warn", message, context);
  }

  error(message: string, context?: LogContext | Error) {
    if (context instanceof Error) {
      this.log("error", message, {
        error: context.message,
        stack: context.stack,
      });
    } else {
      this.log("error", message, context);
    }
  }
}

export const logger = new Logger();
