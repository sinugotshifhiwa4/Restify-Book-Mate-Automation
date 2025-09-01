import { APIResponse } from "@playwright/test";
import ErrorHandler from "../../../utils/errorHandling/errorHandler";

export default class ApiResponseHelper {
  public static async parseJson<T>(response: APIResponse): Promise<T> {
    try {
      return (await response.json()) as T;
    } catch (error) {
      ErrorHandler.captureError(error, "parseJson", "Failed to parse JSON from response");
      throw error;
    }
  }
}
