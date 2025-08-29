import { test, expect } from "../../../fixtures/restifyBookmate.fixture";
import { Credentials } from "../../../src/utils/auth/credentials.types";
import ResponseValidator from "../../../src/layers/api/validator/responseValidator";
import logger from "../../../src/utils/logger/loggerManager";

interface AuthTokenResponse {
  token: string;
}

interface ErrorResponse {
  reason: string;
}

test.describe("Authentication Token Test Suite", () => {
  test("Verify authentication token is generated @sanity", async ({ apiService, environmentResolver }) => {
    const { username, password } = await environmentResolver.getApiCredentials();

    const payload: Credentials = { username, password };

    const response = await apiService.post("/auth", payload);

    const responseBody = await ResponseValidator.validateResponse<AuthTokenResponse>(response, 200);
    expect(responseBody).toHaveProperty("token");
    expect(responseBody.token).not.toBeNull();

    logger.info(`Response: ${JSON.stringify(responseBody)}`);
  });

  test("Verify authentication token generation fails with incorrect credentials @sanity", async ({
    apiService,
    environmentResolver,
  }) => {
    const { username } = await environmentResolver.getApiCredentials();

    const payload: Credentials = { username, password: "incorrectPassword" };

    const response = await apiService.post("/auth", payload);

    const responseBody = await ResponseValidator.validateErrorResponse<ErrorResponse>(response, 200);
    expect(responseBody).toHaveProperty("reason");
    expect(responseBody.reason).toContain("Bad credentials");

    logger.info(`Response: ${JSON.stringify(responseBody)}`);
  });
});
