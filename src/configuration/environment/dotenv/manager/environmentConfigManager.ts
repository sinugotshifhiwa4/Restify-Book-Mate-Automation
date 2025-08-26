import EnvironmentDetector from "../../detector/environmentDetector";
import { CryptoService } from "../../../../cryptography/service/cryptoService";
import DataSanitizer from "../../../../utils/sanitization/dataSanitizer";
import { Credentials } from "../../../../utils/auth/credentials.types";
import { EnvironmentFileManager } from "./environmentFileManager";
import { EnvironmentStage } from "../environment.config";
import ErrorHandler from "../../../../utils/errorHandling/errorHandler";

export default class EnvironmentConfigManager {
  /**
   * Generic method to fetch environment variables based on environment
   * @param ciMethod - Method to call in CI environment
   * @param localMethod - Method to call in local environment
   * @param methodName - Name of the calling method for error tracking
   * @param errorMessage - Error message for failures
   */
  public static async getEnvironmentValue<T>(
    ciMethod: () => Promise<T>,
    localMethod: () => Promise<T>,
    methodName: string,
    errorMessage: string,
  ): Promise<T> {
    try {
      return await (EnvironmentDetector.isCI() ? ciMethod() : localMethod());
    } catch (error) {
      ErrorHandler.captureError(error, methodName, errorMessage);
      throw error;
    }
  }

  public static async getEnvironmentVariable<T>(
    getValue: () => T,
    variableName: string,
    methodName: string,
    errorMessage: string,
  ): Promise<T> {
    try {
      const value = getValue();
      this.validateEnvironmentVariable(String(value), variableName); // Validate string form

      const shouldSanitize = EnvironmentDetector.isCI();

      if (typeof value === "string") {
        return shouldSanitize ? (DataSanitizer.sanitizeString(value) as T) : value;
      }

      return value;
    } catch (error) {
      ErrorHandler.captureError(error, methodName, errorMessage);
      throw error;
    }
  }

  /**
   * Decrypts credentials using the provided secret key
   */
  public static async decryptCredentials(
    username: string,
    password: string,
    secretKey: string,
  ): Promise<Credentials> {
    try {
      const decryptedCredentials = await CryptoService.decryptMultiple(
        [username, password],
        secretKey,
      );

      return {
        username: decryptedCredentials[0],
        password: decryptedCredentials[1],
      };
    } catch (error) {
      ErrorHandler.captureError(error, "decryptCredentials", "Failed to decrypt credentials");
      throw error;
    }
  }

  /**
   * Verifies that the provided credentials contain both a username and password
   */
  public static verifyCredentials(credentials: Credentials): void {
    if (!credentials.username || !credentials.password) {
      ErrorHandler.logAndThrow(
        "FetchLocalEnvironmentVariables",
        "Invalid credentials: Missing username or password.",
      );
    }
  }

  /**
   * Validates that an environment variable is not empty
   */
  public static validateEnvironmentVariable(value: string, variableName: string): void {
    if (!value || value.trim() === "") {
      ErrorHandler.logAndThrow(
        "FetchLocalEnvironmentVariables",
        `Environment variable ${variableName} is not set or is empty`,
      );
    }
  }

  public static getCurrentEnvSecretKey(): string {
    const currentEnvironment = EnvironmentDetector.getCurrentEnvironmentStage();
    return this.getSecretKeyVariable(currentEnvironment);
  }

  public static getCurrentEnvFilePath(): string {
    const currentEnvironment = EnvironmentDetector.getCurrentEnvironmentStage();
    return this.getEnvironmentStageFilePath(currentEnvironment);
  }

  private static getSecretKeyVariable(environment: EnvironmentStage): string {
    return this.getEnvValue(
      EnvironmentFileManager.getSecretVariables(),
      environment,
      "getSecretKeyVariable",
      `Failed to select secret key. Invalid environment: ${environment}. Must be 'dev', 'qa', 'uat', 'preprod' or 'prod'`,
    );
  }

  private static getEnvironmentStageFilePath(environment: EnvironmentStage): string {
    return this.getEnvValue(
      EnvironmentFileManager.getStages(),
      environment,
      "getEnvironmentStageFilePath",
      `Failed to select environment file. Invalid environment: ${environment}. Must be 'dev', 'qa', 'uat', 'preprod' or 'prod'`,
    );
  }

  private static getEnvValue<T extends Record<string, string>>(
    source: T,
    environment: EnvironmentStage,
    methodName: string,
    errorMessage: string,
  ): string {
    if (source[environment]) {
      return source[environment];
    }

    ErrorHandler.logAndThrow(methodName, errorMessage);
  }
}
