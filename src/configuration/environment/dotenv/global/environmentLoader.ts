import dotenv from "dotenv";
import EnvironmentDetector from "../../detector/environmentDetector";
import path from "path";
import { AsyncFileManager } from "../../../../utils/fileManager/asyncFileManager";
import BaseFileManager from "../manager/baseFileManager";
import StageFileManager from "../manager/stageFileManager";
import { EnvironmentFileManager } from "../manager/environmentFileManager";
import ErrorHandler from "../../../../utils/errorHandling/errorHandler";
import logger from "../../../../utils/logger/loggerManager";

export class EnvironmentLoader {
  private initialized = false;
  private loadedFiles: string[] = [];

  public async initialize(): Promise<void> {
    if (this.isAlreadyInitialized()) {
      return;
    }

    if (this.shouldSkipInCI()) {
      return;
    }

    try {
      await this.performInitialization();
    } catch (error) {
      ErrorHandler.captureError(error, "initialize", "Failed to set up environment variables");
      throw error;
    }
  }

  public isInitialized(): boolean {
    return this.initialized;
  }

  public getLoadedFiles(): readonly string[] {
    return [...this.loadedFiles];
  }

  /**
   * Checks if environment is already initialized
   */
  private isAlreadyInitialized(): boolean {
    if (this.initialized) {
      logger.debug("environment already initialized");
      return true;
    }
    return false;
  }

  /**
   * Determines if initialization should be skipped in CI environments
   */
  private shouldSkipInCI(): boolean {
    return EnvironmentDetector.isCI();
  }

  /**
   * Performs the actual initialization process
   */
  private async performInitialization(): Promise<void> {
    await this.loadAllEnvironments();
    this.markAsInitialized();
    this.logInitializationResult();
  }

  /**
   * Loads all environment files in sequence
   */
  private async loadAllEnvironments(): Promise<void> {
    await this.loadBaseEnvironmentFile(EnvironmentFileManager.getBaseFilePath());
    await this.loadEnvironmentStages();
  }

  /**
   * Marks the loader as initialized
   */
  private markAsInitialized(): void {
    this.initialized = true;
  }

  /**
   * Logs the initialization result based on loaded files
   */
  private logInitializationResult(): void {
    if (this.hasLoadedFiles()) {
      logger.info(
        `Environment successfully initialized with ${this.loadedFiles.length} config files: ${this.loadedFiles.join(", ")}`,
      );
    } else {
      logger.warn("Environment initialized but no config files were loaded");
    }
  }

  /**
   * Checks if any files were loaded
   */
  private hasLoadedFiles(): boolean {
    return this.loadedFiles.length > 0;
  }

  /**
   * Loads the base environment file if it exists
   */
  private async loadBaseEnvironmentFile(filePath: string): Promise<void> {
    try {
      const baseEnvExists = await AsyncFileManager.doesFileExist(filePath);

      if (!baseEnvExists) {
        BaseFileManager.handleMissingEnvFile(filePath);
        return;
      }

      this.loadAndRegisterFile(filePath, "base");
    } catch (error) {
      ErrorHandler.captureError(
        error,
        "loadBaseEnvironmentFile",
        `Failed to load base environment file at ${filePath}`,
      );
      throw error;
    }
  }

  /**
   * Loads environment-specific stage configuration
   */
  private async loadEnvironmentStages(): Promise<void> {
    const env = EnvironmentDetector.getCurrentEnvironmentStage();
    const stageFilePath = this.getStageFilePath(env);
    await this.loadStageEnvironmentFile(stageFilePath, env);
  }

  /**
   * Gets the file path for a specific environment stage
   */
  private getStageFilePath(env: string): string {
    const stages = EnvironmentFileManager.getStages();

    if (!this.isValidEnvironmentStage(env)) {
      ErrorHandler.logAndThrow(
        "getStageFilePath",
        `Invalid environment stage: ${env}. Valid stages are: ${Object.keys(stages).join(", ")}`,
      );
    }

    return stages[env as keyof typeof stages];
  }

  /**
   * Validates if the environment stage is valid
   */
  private isValidEnvironmentStage(env: string): boolean {
    const stages = EnvironmentFileManager.getStages();
    return env in stages;
  }

  /**
   * Loads a stage-specific environment file
   */
  private async loadStageEnvironmentFile(
    filePath: string,
    environmentStage: string,
  ): Promise<boolean> {
    try {
      const fileExists = await StageFileManager.doesEnvironmentFileExist(filePath);

      if (!fileExists) {
        StageFileManager.logEnvironmentFileNotFound(filePath, environmentStage);
        return false;
      }

      this.loadAndRegisterFile(filePath, "stage");
      return true;
    } catch (error) {
      ErrorHandler.captureError(
        error,
        "loadStageEnvironmentFile",
        `Failed to load environment file '${filePath}' for ${environmentStage} environment`,
      );
      return false;
    }
  }

  /**
   * Loads an environment file and registers it as loaded
   */
  private loadAndRegisterFile(filePath: string, fileType: string): void {
    this.loadEnvironment(filePath);
    this.registerLoadedFile(filePath, fileType);
  }

  /**
   * Registers a successfully loaded file
   */
  private registerLoadedFile(filePath: string, fileType: string): void {
    const fileName = this.extractFileName(filePath);
    this.addToLoadedFiles(fileName);
    logger.info(`Successfully loaded ${fileType} environment file: ${fileName}`);
  }

  /**
   * Extracts filename from full path
   */
  private extractFileName(filePath: string): string {
    return path.basename(filePath);
  }

  /**
   * Adds filename to loaded files array
   */
  private addToLoadedFiles(fileName: string): void {
    this.loadedFiles.push(fileName);
  }

  /**
   * Loads environment variables from a file using dotenv
   */
  private loadEnvironment(filePath: string): void {
    try {
      const result = this.loadDotenvFile(filePath);
      this.validateDotenvResult(result, filePath);
    } catch (error) {
      ErrorHandler.captureError(
        error,
        "loadEnvironmentFile",
        `Failed to load environment variables from ${filePath}`,
      );
      throw error;
    }
  }

  /**
   * Loads dotenv file and returns result
   */
  private loadDotenvFile(filePath: string): dotenv.DotenvConfigOutput {
    return dotenv.config({ path: filePath, override: true });
  }

  /**
   * Validates dotenv loading result
   */
  private validateDotenvResult(result: dotenv.DotenvConfigOutput, filePath: string): void {
    if (result.error) {
      throw new Error(
        `Error loading environment variables from ${filePath}: ${result.error.message}`,
      );
    }
  }
}
