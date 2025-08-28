import { ErrorDetails } from "./internals/error-handler.types";
import ErrorAnalyzer from "./internals/errorAnalyzer";
import { ErrorCacheManager } from "./internals/errorCacheManager";
import logger from "../logger/loggerManager";

export default class ErrorHandler {
  public static captureError(error: unknown, source: string, context = ""): void {
    if (!error || !ErrorCacheManager.shouldLogError(error)) return;

    try {
      const details = ErrorAnalyzer.createErrorDetails(error, source, context);
      this.logStructuredError(details);
      this.logAdditionalDetails(error, source);
    } catch (loggingError) {
      this.handleLoggingFailure(loggingError, source);
    }
  }

  public static logAndThrow(source: string, message: string): never {
    const error = new Error(message);
    this.captureError(error, source);
    throw error;
  }

  public static clearErrorCache(): void {
    ErrorCacheManager.clearAll();
  }

  private static logStructuredError(details: ErrorDetails): void {
    try {
      logger.error(details);
    } catch {
      console.error("Error:", details);
    }
  }

  private static readonly circularReplacer = (() => {
    const seen = new WeakSet<object>();
    return (key: string, value: unknown) => {
      if (typeof value === "object" && value !== null) {
        if (seen.has(value)) return "[Circular]";
        seen.add(value);
      }
      return value;
    };
  })();

  private static logAdditionalDetails(error: unknown, source: string): void {
    const extraDetails = ErrorAnalyzer.extractAdditionalErrorDetails(error);
    if (Object.keys(extraDetails).length === 0) return;

    const sanitized = this.deepSanitizeObject(extraDetails);
    const logPayload = {
      source,
      type: "Additional Details",
      details: sanitized,
    };

    try {
      logger.error(JSON.stringify(logPayload, this.circularReplacer, 2));
    } catch {
      logger.error("Fallback log:", logPayload);
    }
  }

  private static deepSanitizeObject(obj: unknown): unknown {
    if (typeof obj === "string") {
      return ErrorCacheManager.getSanitizedMessage(obj);
    }

    if (obj == null || typeof obj !== "object") return obj;

    if (Array.isArray(obj)) {
      return obj.map((item) => this.deepSanitizeObject(item));
    }

    const result: Record<string, unknown> = {};
    let hasChanges = false;

    for (const [key, value] of Object.entries(obj)) {
      const sanitizedValue = this.deepSanitizeObject(value);
      result[key] = sanitizedValue;
      if (sanitizedValue !== value) hasChanges = true;
    }

    return hasChanges ? result : obj;
  }

  private static handleLoggingFailure(loggingError: unknown, source: string): void {
    const fallbackError = {
      source,
      context: "Error Handler Failure",
      message: ErrorAnalyzer.getErrorMessage(loggingError),
      timestamp: new Date().toISOString(),
    };

    try {
      logger.error(fallbackError);
    } catch {
      console.error("ErrorHandler failure:", fallbackError);
    }
  }
}
