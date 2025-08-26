import type { EnvironmentStage } from "../dotenv/environment.config";
import { EnvironmentFileManager } from "../dotenv/manager/environmentFileManager";

export default class EnvironmentDetector {
  /**
   * Checks if running in CI environment
   */
  public static isCI(): boolean {
    return !!(
      process.env.CI ||
      process.env.GITHUB_ACTIONS ||
      process.env.GITLAB_CI ||
      process.env.TRAVIS ||
      process.env.CIRCLECI ||
      process.env.JENKINS_URL ||
      process.env.BITBUCKET_BUILD_NUMBER
    );
  }

  public static getCurrentEnvironmentStage(): EnvironmentStage {
    const env = process.env.ENV || process.env.NODE_ENV || "dev";
    return EnvironmentFileManager.isValidStage(env) ? env : "dev";
  }

  public static isDevelopment(): boolean {
    return this.getCurrentEnvironmentStage() === "dev";
  }

  public static isQA(): boolean {
    return this.getCurrentEnvironmentStage() === "qa";
  }

  public static isUAT(): boolean {
    return this.getCurrentEnvironmentStage() === "uat";
  }

  public static isPreprod(): boolean {
    return this.getCurrentEnvironmentStage() === "preprod";
  }

  public static isProduction(): boolean {
    return this.getCurrentEnvironmentStage() === "prod";
  }

  /**
   * Checks if sharding is enabled for the current test run.
   * Sharding can be enabled either in CI or locally by setting SHARD_INDEX and SHARD_TOTAL.
   *
   * @returns {boolean} `true` if sharding is enabled, `false` otherwise
   */
  public static isShardingEnabled(): boolean {
    return !!(process.env.SHARD_INDEX && process.env.SHARD_TOTAL);
  }
}
