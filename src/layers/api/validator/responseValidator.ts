import { expect, APIResponse } from "@playwright/test";

export default class ResponseValidator {
  public static async validateResponse<T>(
    response: APIResponse,
    expectedStatusCode: number,
  ): Promise<T> {
    expect(response.status()).toBe(expectedStatusCode);
    return await this.getJsonResponse<T>(response);
  }

  public static async validateTextResponse(
    response: APIResponse,
    expectedStatusCode: number,
  ): Promise<string> {
    expect(response.status()).toBe(expectedStatusCode);
    return await response.text();
  }

  public static async validateResponseHeaders(
    response: APIResponse,
    expectedHeaders: Record<string, string>,
  ): Promise<void> {
    const headers = response.headers();

    for (const [key, expectedValue] of Object.entries(expectedHeaders)) {
      expect(headers[key]).toBe(expectedValue);
    }
  }

  public static async validateJsonResponse<T>(
    response: APIResponse,
    expectedStatusCode: number,
    validator?: (data: T) => void,
  ): Promise<T> {
    expect(response.status()).toBe(expectedStatusCode);

    const responseBody = await this.getJsonResponse<T>(response);

    if (validator) {
      validator(responseBody);
    }

    return responseBody;
  }

  public static async validateErrorResponse<T>(
    response: APIResponse,
    expectedStatusCode: number,
    expectedErrorMessage?: string,
  ): Promise<T> {
    expect(response.status()).toBe(expectedStatusCode);

    const errorBody = await this.getJsonResponse<T>(response);

    if (expectedErrorMessage) {
      const typedErrorBody = errorBody as { message?: string; error?: string };
      expect(typedErrorBody.message || typedErrorBody.error).toContain(expectedErrorMessage);
    }

    return errorBody;
  }

  private static async getJsonResponse<T>(response: APIResponse): Promise<T> {
    const responseBody: unknown = await response.json();
    return responseBody as T;
  }
}
