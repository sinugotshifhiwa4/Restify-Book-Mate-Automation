import { test } from "../../fixtures/cryptography.fixture";
import EnvironmentVariables from "../../src/configuration/environment/variables/environmentVariables";
import logger from "../../src/utils/logger/loggerManager";

test.describe.serial("Encryption Flow @full-encryption", () => {
  test("Generate secret key", async ({ cryptoOrchestrator }) => {
    await cryptoOrchestrator.generateSecretKey();
    logger.info("Verified: Secret key generated successfully");
  });

  test("Encrypt environment variables", async ({ cryptoOrchestrator }) => {
    await cryptoOrchestrator.encryptEnvironmentVariables([
      EnvironmentVariables.AUTH_USERNAME,
      EnvironmentVariables.AUTH_PASSWORD,
    ]);
    logger.info("Verified: Environment variables encrypted successfully");
  });
});
