import { test, expect } from "../../../fixtures/restifyBookmate.fixture";
import logger from "../../../src/utils/logger/loggerManager";

test.describe("Health Check Test Suite", () => {
  test("Verify health check @sanity", async ({ apiClient }) => {
    const response = await apiClient.request("get", "/ping");
    expect(response.status()).toBe(201);
    logger.info(`Verified: Health check successful with status ${response.status()}`);
  });
});
