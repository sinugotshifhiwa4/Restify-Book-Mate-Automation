import BaseFileManager from "../../../../utils/fileManager/internal/baseFileManager";
import { SyncFileManager } from "../../../../utils/fileManager/syncFileManager";
import { ENVIRONMENT_CONSTANTS, ENVIRONMENT_STAGES } from "../environment.config";
import type { EnvironmentStage } from "../environment.config";
import ErrorHandler from "../../../../utils/errorHandling/errorHandler";

export class EnvironmentFileManager {
  private static rootDir: string | null = null;

  public static getBaseFilePath(): string {
    return this.execute("getBaseFilePath", "Failed to get base file path", () =>
      BaseFileManager.join(this.getRootDir(), ENVIRONMENT_CONSTANTS.BASE_FILE),
    );
  }

  public static getStages() {
    return this.execute("getStages", "Failed to get stages", () =>
      this.createImmutableMapping(ENVIRONMENT_STAGES, (key) => this.getStageFilePath(key)),
    );
  }

  public static getSecretVariables() {
    return this.execute("getSecretVariables", "Failed to get secret variables", () =>
      this.createImmutableMapping(ENVIRONMENT_STAGES, (key) => this.getSecretKeyVariable(key)),
    );
  }

  public static isValidStage(value: unknown): value is EnvironmentStage {
    try {
      return typeof value === "string" && ENVIRONMENT_STAGES.includes(value as EnvironmentStage);
    } catch (error) {
      ErrorHandler.captureError(error, "isValidStage", "Failed to validate stage");
      return false;
    }
  }

  private static execute<T>(methodName: string, errorMessage: string, operation: () => T): T {
    try {
      return operation();
    } catch (error) {
      ErrorHandler.captureError(error, methodName, errorMessage);
      throw error;
    }
  }

  private static createImmutableMapping<K extends string, V>(
    keys: readonly K[],
    valueMapper: (key: K) => V,
  ): Readonly<Record<K, V>> {
    return this.execute("createImmutableMapping", "Failed to create immutable mapping", () => {
      const entries = keys.map((key) => {
        try {
          return [key, valueMapper(key)] as const;
        } catch (error) {
          throw new Error(
            `Failed to map key '${key}': ${error instanceof Error ? error.message : "Unknown error"}`,
          );
        }
      });
      return Object.freeze(Object.fromEntries(entries) as Record<K, V>);
    });
  }

  private static getStageFilePath(stage: EnvironmentStage): string {
    return BaseFileManager.join(this.getRootDir(), this.resolveStageFilePath(stage));
  }

  private static getSecretKeyVariable(stage: EnvironmentStage): string {
    return this.resolveSecretKeyVariableName(stage);
  }

  private static resolveStageFilePath(stage: EnvironmentStage): string {
    this.validateStage(stage, "resolveStageFilePath");
    return this.buildStageFileName(stage);
  }

  private static resolveSecretKeyVariableName(stage: EnvironmentStage): string {
    this.validateStage(stage, "resolveSecretKeyVariableName");
    return this.buildSecretKeyVariable(stage);
  }

  private static buildStageFileName(stage: EnvironmentStage): string {
    return `${ENVIRONMENT_CONSTANTS.BASE_FILE}.${stage}`;
  }

  private static buildSecretKeyVariable(stage: EnvironmentStage): string {
    return `${stage.toUpperCase()}_${ENVIRONMENT_CONSTANTS.SECRET_KEY_VAR_PREFIX}`;
  }

  private static validateStage(stage: EnvironmentStage, methodName: string): void {
    if (!stage || typeof stage !== "string") {
      ErrorHandler.logAndThrow(methodName, "Invalid stage provided");
    }
  }

  private static getRootDir(): string {
    return this.execute("getRootDir", "Failed to get root directory", () => {
      if (!this.rootDir) {
        this.rootDir = BaseFileManager.resolve(ENVIRONMENT_CONSTANTS.ROOT);
        SyncFileManager.ensureDirectoryExists(this.rootDir);
      }
      return this.rootDir;
    });
  }
}
