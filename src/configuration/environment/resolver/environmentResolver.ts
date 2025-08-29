import { FetchCIEnvironmentVariables } from "./internal/fetch/fetchCIEnvironmentVariables";
import { FetchLocalEnvironmentVariables } from "./internal/fetch/fetchLocalEnvironmentVariables";
import EnvironmentConfigManager from "../dotenv/manager/environmentConfigManager";
import { Credentials } from "../../../utils/auth/credentials.types";

export class EnvironmentResolver {
  private fetchCIEnvironmentVariables: FetchCIEnvironmentVariables;
  private FetchLocalEnvironmentVariables: FetchLocalEnvironmentVariables;

  constructor(
    fetchCIEnvironmentVariables: FetchCIEnvironmentVariables,
    fetchLocalEnvironmentVariables: FetchLocalEnvironmentVariables,
  ) {
    this.fetchCIEnvironmentVariables = fetchCIEnvironmentVariables;
    this.FetchLocalEnvironmentVariables = fetchLocalEnvironmentVariables;
  }

  public async getPortalBaseUrl(): Promise<string> {
    return EnvironmentConfigManager.getEnvironmentValue(
      () => this.fetchCIEnvironmentVariables.getPortalBaseUrl(),
      () => this.FetchLocalEnvironmentVariables.getPortalBaseUrl(),
      "getPortalBaseUrl",
      "Failed to get portal base URL",
    );
  }

  public async getApiBaseUrl(): Promise<string> {
    return EnvironmentConfigManager.getEnvironmentValue(
      () => this.fetchCIEnvironmentVariables.getApiBaseUrl(),
      () => this.FetchLocalEnvironmentVariables.getApiBaseUrl(),
      "getApiBaseUrl",
      "Failed to get API base URL",
    );
  }

  public async getPortalCredentials(): Promise<Credentials> {
    return EnvironmentConfigManager.getEnvironmentValue(
      () => this.fetchCIEnvironmentVariables.getPortalCredentials(),
      () => this.FetchLocalEnvironmentVariables.getPortalCredentials(),
      "getPortalCredentials",
      "Failed to get portal credentials",
    );
  }

  public async getApiCredentials(): Promise<Credentials> {
    return EnvironmentConfigManager.getEnvironmentValue(
      () => this.fetchCIEnvironmentVariables.getApiCredentials(),
      () => this.FetchLocalEnvironmentVariables.getApiCredentials(),
      "getApiCredentials",
      "Failed to get API credentials",
    );
  }

  public async getDatabaseCredentials(): Promise<Credentials> {
    return EnvironmentConfigManager.getEnvironmentValue(
      () => this.fetchCIEnvironmentVariables.getDatabaseCredentials(),
      () => this.FetchLocalEnvironmentVariables.getDatabaseCredentials(),
      "getDatabaseCredentials",
      "Failed to get database credentials",
    );
  }

  public async getDatabaseServerName(): Promise<string> {
    return EnvironmentConfigManager.getEnvironmentValue(
      () => this.fetchCIEnvironmentVariables.getDatabaseServerName(),
      () => this.FetchLocalEnvironmentVariables.getDatabaseServerName(),
      "getDatabaseServerName",
      "Failed to get database server name",
    );
  }

  public async getDatabaseName(): Promise<string> {
    return EnvironmentConfigManager.getEnvironmentValue(
      () => this.fetchCIEnvironmentVariables.getDatabaseName(),
      () => this.FetchLocalEnvironmentVariables.getDatabaseName(),
      "getDatabaseName",
      "Failed to get database name",
    );
  }

  public async getDatabaseInstanceName(): Promise<string> {
    return EnvironmentConfigManager.getEnvironmentValue(
      () => this.fetchCIEnvironmentVariables.getDatabaseInstanceName(),
      () => this.FetchLocalEnvironmentVariables.getDatabaseInstanceName(),
      "getDatabaseInstanceName",
      "Failed to get database instance name",
    );
  }
}
