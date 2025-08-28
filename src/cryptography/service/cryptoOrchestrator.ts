import { EncryptionManager } from "../manager/encryptionManager";
import EnvironmentConfigManager from "../../configuration/environment/dotenv/manager/environmentConfigManager";
import BaseFileManager from "../../configuration/environment/dotenv/manager/baseFileManager";
import SecureKeyGenerator from "../key/secureKeyGenerator";
import ErrorHandler from "../../utils/errorHandling/errorHandler";

export class CryptoOrchestrator {
  private encryptionManager: EncryptionManager;

  constructor(encryptionManager: EncryptionManager) {
    this.encryptionManager = encryptionManager;
  }

  public async generateSecretKey(): Promise<void> {
    try {
      const currentEnvKey = EnvironmentConfigManager.getCurrentEnvSecretKey();

      BaseFileManager.storeEnvironmentKey(
        currentEnvKey,
        SecureKeyGenerator.generateBase64SecretKey(),
        { skipIfExists: true },
      );

      BaseFileManager.ensureSecretKeyExists(currentEnvKey);
    } catch (error) {
      ErrorHandler.captureError(
        error,
        "generateSecretKey",
        `Failed to generate secret key "${EnvironmentConfigManager.getCurrentEnvSecretKey()}"`,
      );
      throw error;
    }
  }

  public async encryptEnvironmentVariables(envVariables?: string[]): Promise<void> {
    await this.encryptionManager.encryptEnvironmentVariables(envVariables);
  }
}
