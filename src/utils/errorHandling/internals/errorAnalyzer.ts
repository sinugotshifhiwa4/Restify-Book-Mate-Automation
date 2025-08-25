import DataSanitizer from "../../sanitization/dataSanitizer";
import { ErrorCacheManager } from "./errorCacheManager";
import { RegexPatterns } from "./regexPatterns";
import { ErrorDetails, MatcherResult, MatcherError } from "./error-handler.types";

export default class ErrorAnalyzer {
  private static readonly MESSAGE_PROPS = ["message"];
  private static readonly MEANINGLESS_PROPS = new Set([
    "name",
    "stack",
    "constructor",
    "toString",
    "valueOf",
  ]);

  public static createErrorDetails(error: unknown, source: string, context = ""): ErrorDetails {
    if (!error) {
      return this.createEmptyErrorDetails(source, context);
    }

    return {
      source,
      context,
      message: this.getErrorMessage(error),
      timestamp: new Date().toISOString(),
      environment: process.env.ENV || "dev",
    };
  }

  public static getErrorMessage(error: unknown): string {
    if (!error) return "";

    if (error instanceof Error) {
      return ErrorCacheManager.getSanitizedMessage(error.message);
    }

    if (typeof error === "string") {
      return ErrorCacheManager.getSanitizedMessage(error);
    }

    if (this.isErrorObject(error)) {
      return this.handleObjectError(error);
    }

    return String(error);
  }

  public static extractAdditionalErrorDetails(error: unknown): Record<string, unknown> {
    if (!this.isErrorObject(error)) return {};

    if (this.isMatcherError(error)) {
      return this.extractMatcherDetails(error.matcherResult);
    }

    const matcherDetails = this.extractJestMatcherDetails(error);
    if (Object.keys(matcherDetails).length > 0) {
      return matcherDetails;
    }

    const sanitizedDetails = DataSanitizer.sanitizeErrorObject(error);
    return this.filterMeaninglessProperties(sanitizedDetails);
  }

  private static extractJestMatcherDetails(
    error: Record<string, unknown>,
  ): Record<string, unknown> {
    const details: Record<string, unknown> = {};

    const { expected, actual, received, matcherName, pass, diff, operator } = error;

    if (expected !== undefined) details.expected = expected;
    if (actual !== undefined) details.received = actual;
    else if (received !== undefined) details.received = received;
    if (matcherName !== undefined) details.matcher = matcherName;
    if (typeof pass === "boolean") details.pass = pass;
    if (diff !== undefined) details.diff = diff;
    if (operator !== undefined) details.operator = operator;

    // Return only if we found meaningful details
    return expected !== undefined ||
      actual !== undefined ||
      received !== undefined ||
      operator !== undefined
      ? details
      : {};
  }

  private static extractMatcherDetails(matcher: MatcherResult): Record<string, unknown> {
    const details: Record<string, unknown> = { pass: matcher.pass };
    const parsedValues = this.parsePlaywrightMessage(matcher.message);

    if (parsedValues.expected !== undefined) details.expected = parsedValues.expected;
    if (parsedValues.received !== undefined) details.received = parsedValues.received;

    details.message = ErrorCacheManager.getSanitizedMessage(matcher.message);
    return details;
  }

  private static parsePlaywrightMessage(message: string): { expected?: string; received?: string } {
    const cleanMessage = message.replace(RegexPatterns.ANSI_ESCAPE, "");
    const result: { expected?: string; received?: string } = {};

    const expectedMatch = cleanMessage.match(RegexPatterns.EXPECTED_MATCH);
    if (expectedMatch) {
      result.expected = (expectedMatch[1] || expectedMatch[2] || expectedMatch[3])?.trim();
    }

    const receivedMatch = cleanMessage.match(RegexPatterns.RECEIVED_MATCH);
    if (receivedMatch) {
      result.received = (receivedMatch[1] || receivedMatch[2] || receivedMatch[3])?.trim();
    }

    return result;
  }

  private static isMatcherError(error: unknown): error is MatcherError {
    return (
      this.hasProperty(error, "matcherResult") && this.isValidMatcherResult(error.matcherResult)
    );
  }

  private static isValidMatcherResult(matcherResult: unknown): matcherResult is MatcherResult {
    return (
      typeof matcherResult === "object" &&
      matcherResult !== null &&
      this.hasProperty(matcherResult, "message") &&
      this.hasProperty(matcherResult, "pass") &&
      typeof matcherResult.message === "string" &&
      typeof matcherResult.pass === "boolean"
    );
  }

  private static hasProperty<T extends PropertyKey>(
    obj: unknown,
    prop: T,
  ): obj is Record<T, unknown> {
    return typeof obj === "object" && obj !== null && prop in obj;
  }

  private static createEmptyErrorDetails(source: string, context: string): ErrorDetails {
    return {
      source,
      context,
      message: "Unknown error",
      timestamp: new Date().toISOString(),
      environment: process.env.ENV || "dev",
    };
  }

  private static filterMeaninglessProperties(
    details: Record<string, unknown>,
  ): Record<string, unknown> {
    const filtered: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(details)) {
      if (
        this.MEANINGLESS_PROPS.has(key) ||
        (key === "name" && value === "Error") ||
        value == null
      ) {
        continue;
      }
      filtered[key] = value;
    }

    return filtered;
  }

  private static isErrorObject(error: unknown): error is Record<string, unknown> {
    return error !== null && typeof error === "object";
  }

  private static handleObjectError(error: Record<string, unknown>): string {
    // Try common message properties first
    for (const prop of this.MESSAGE_PROPS) {
      const value = error[prop];
      if (typeof value === "string" && value.trim()) {
        return ErrorCacheManager.getSanitizedMessage(value);
      }
    }

    return this.stringifyErrorObject(error);
  }

  private static stringifyErrorObject(errorObj: Record<string, unknown>): string {
    try {
      const stringified = JSON.stringify(errorObj);
      return stringified === "{}" ? "Empty object" : stringified;
    } catch {
      return "Object with circular references";
    }
  }
}
