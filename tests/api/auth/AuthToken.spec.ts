import { test, expect } from "../../../fixtures/restifyBookmate.fixture";
import ApiResponseHelper from "../../../src/layers/api/response/apiResponseHelper";
import { AuthSuccessResponse, AuthFailureResponse } from "../../../src/layers/api/response/types/authToken.type";
import logger from "../../../src/utils/logger/loggerManager";

test.describe("Authentication Token Test Suite", () => {
  test("Verify authentication token is generated @sanity", async ({ apiClient, environmentResolver }) => {
    const payload = await environmentResolver.getApiCredentials();

    const response = await apiClient.request("post", "/auth", payload);
    const responseBody = await ApiResponseHelper.parseJson<AuthSuccessResponse>(response);
    expect(responseBody.token).toBeTruthy();
    expect(responseBody).toHaveProperty("token");

    logger.info("Verified: Authentication token generated successfully");
  });

  test("Verify authentication token generation fails with incorrect credentials @sanity", async ({
    apiClient,
    environmentResolver,
  }) => {
    const { username } = await environmentResolver.getApiCredentials();

    const invalidCredentials = { username, password: "incorrectPassword" };

    const response = await apiClient.request("post", "/auth", invalidCredentials);

    const responseBody = await ApiResponseHelper.parseJson<AuthFailureResponse>(response);

    expect(responseBody.reason).toBeTruthy();

    logger.info("Verified: Authentication token generation fails with incorrect credentials");
  });
});
