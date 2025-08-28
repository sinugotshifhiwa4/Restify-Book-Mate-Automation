import * as os from "os";
import EnvironmentDetector from "./environmentDetector";
import type { AllocatorType } from "./workerAllocator.type";
import ErrorHandler from "../../../utils/errorHandling/errorHandler";
import logger from "../../../utils/logger/loggerManager";

export default class WorkerAllocator {
  private static readonly totalCores = os.cpus().length;
  private static readonly MIN_WORKERS = 1;

  /**
   * Calculates worker allocation for CI environments based on sharding
   * @returns Number of workers allocated for CI environment
   */
  public static setupCIAllocator(): number {
    const shardTotal = this.getShardTotal();
    const workersPerShard = Math.floor(this.totalCores / shardTotal);
    return Math.max(this.MIN_WORKERS, workersPerShard);
  }

  /**
   * Gets the number of workers based on allocation strategy
   * @param strategy - The allocation strategy to use
   * @returns Number of workers for the given strategy
   * @throws Error if strategy is unknown
   */
  static setLocalWorkerCount(strategy: AllocatorType): number {
    switch (strategy) {
      case "full":
        return this.totalCores;
      case "half":
        return this.getCoresByFraction(2);
      case "quarter":
        return this.getCoresByFraction(4);
      case "fixed-4":
        return this.getFixedWorkers(4);
      case "fixed-3":
        return this.getFixedWorkers(3);
      case "fixed-2":
        return this.getFixedWorkers(2);
      default:
        return ErrorHandler.logAndThrow(
          "WorkerAllocator",
          `Unknown allocation strategy: ${strategy}`,
        );
    }
  }

  /**
   * Logs comprehensive allocation information for all strategies
   */
  public static getAllocationInfo(): void {
    const strategies = [
      { name: "Full cores", value: this.setLocalWorkerCount("full") },
      { name: "Half cores", value: this.setLocalWorkerCount("half") },
      { name: "Quarter cores", value: this.setLocalWorkerCount("quarter") },
      { name: "Fixed 4", value: this.setLocalWorkerCount("fixed-4") },
      { name: "Fixed 3", value: this.setLocalWorkerCount("fixed-3") },
      { name: "Fixed 2", value: this.setLocalWorkerCount("fixed-2") },
    ];

    this.logHeader();
    this.logEnvironmentInfo();
    this.logStrategies(strategies);
    this.logFooter();
  }

  /**
   * Gets worker count as a fraction of total cores (minimum 1)
   */
  private static getCoresByFraction(divisor: number): number {
    return Math.max(this.MIN_WORKERS, Math.floor(this.totalCores / divisor));
  }

  /**
   * Gets a fixed number of workers, capped by available cores
   */
  private static getFixedWorkers(count: number): number {
    return Math.min(count, this.totalCores);
  }

  /**
   * Gets the shard total from environment variables
   */
  private static getShardTotal(): number {
    const shardTotal = process.env.SHARD_TOTAL;
    return shardTotal ? parseInt(shardTotal, 10) : 1;
  }

  /**
   * Logs the header for allocation information
   */
  private static logHeader(): void {
    logger.info("=== Worker Allocation Options ===");
  }

  /**
   * Logs environment information
   */
  private static logEnvironmentInfo(): void {
    const environment = EnvironmentDetector.isCI() ? "CI" : "Local";
    const shardTotal = process.env.SHARD_TOTAL || "not set";

    logger.info(`Environment: ${environment}`);
    logger.info(`Total CPU cores: ${this.totalCores}`);
    logger.info(`SHARD_TOTAL env: ${shardTotal}`);

    if (EnvironmentDetector.isCI()) {
      logger.info(`CI workers allocated: ${this.setupCIAllocator()}`);
    }

    logger.info("-----------------------------------");
  }

  /**
   * Logs all allocation strategies
   */
  private static logStrategies(strategies: Array<{ name: string; value: number }>): void {
    strategies.forEach((strategy) => {
      logger.info(`${strategy.name}: ${strategy.value} workers`);
    });
  }

  /**
   * Logs the footer for allocation information
   */
  private static logFooter(): void {
    logger.info("===================================");
  }
}
