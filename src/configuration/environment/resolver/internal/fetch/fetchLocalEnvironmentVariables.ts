import EnvironmentConfigManager from "../../../dotenv/manager/environmentConfigManager";
import ENV from "../../../variables/environmentVariables";
import { Credentials } from "../../../../../utils/auth/credentials.types";

export class FetchLocalEnvironmentVariables {
  public async getPortalBaseUrl(): Promise<string> {
    return EnvironmentConfigManager.getEnvironmentVariable<string>(
      () => ENV.PORTAL_BASE_URL,
      "localPortalBaseUrl",
      "getPortalBaseUrl",
      "Failed to get local portal base URL",
    );
  }

  public async getPortalCredentials(): Promise<Credentials> {
    EnvironmentConfigManager.verifyCredentials({
      username: ENV.PORTAL_USERNAME,
      password: ENV.PORTAL_PASSWORD,
    });

    return EnvironmentConfigManager.decryptCredentials(
      ENV.PORTAL_USERNAME,
      ENV.PORTAL_PASSWORD,
      EnvironmentConfigManager.getCurrentEnvSecretKey(),
    );
  }

  public async getDatabaseServerName(): Promise<string> {
    return EnvironmentConfigManager.getEnvironmentVariable<string>(
      () => ENV.DATABASE_SERVER_NAME,
      "localDatabaseServerName",
      "getDatabaseServerName",
      "Failed to get local database server name",
    );
  }

  public async getDatabaseName(): Promise<string> {
    return EnvironmentConfigManager.getEnvironmentVariable<string>(
      () => ENV.DATABASE_NAME,
      "localDatabaseName",
      "getDatabaseName",
      "Failed to get local database name",
    );
  }

  public async getDatabaseInstanceName(): Promise<string> {
    return EnvironmentConfigManager.getEnvironmentVariable<string>(
      () => ENV.DATABASE_INSTANCE_NAME,
      "localDatabaseInstanceName",
      "getDatabaseInstanceName",
      "Failed to get local database instance name",
    );
  }

  public async getDatabaseCredentials(): Promise<Credentials> {
    EnvironmentConfigManager.verifyCredentials({
      username: ENV.DATABASE_USERNAME,
      password: ENV.DATABASE_PASSWORD,
    });

    return EnvironmentConfigManager.decryptCredentials(
      ENV.DATABASE_USERNAME,
      ENV.DATABASE_PASSWORD,
      EnvironmentConfigManager.getCurrentEnvSecretKey(),
    );
  }
}
