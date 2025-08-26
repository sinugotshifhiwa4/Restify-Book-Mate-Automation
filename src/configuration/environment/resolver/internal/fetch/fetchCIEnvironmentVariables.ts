import EnvironmentConfigManager from "../../../dotenv/manager/environmentConfigManager";
import { CIEnvironmentConfig } from "../types/ciEnvironmentConfig";
import { Credentials } from "../../../../../utils/auth/credentials.types";

export class FetchCIEnvironmentVariables {
  /**
   * Stores all CI-specific environment variables used by the test framework.
   *
   * This configuration is loaded once when the class is instantiated and includes:
   * - App metadata like version, platform, and test type.
   * - Service URLs for API and portal endpoints.
   * - User credentials for both admin and portal users.
   * - Database connection details including Azure-specific configurations.
   */
  private readonly ciEnvironmentVariables: CIEnvironmentConfig = {
    urls: {
      portalBaseUrl: process.env.CI_PORTAL_BASE_URL!,
    },
    users: {
      portal: {
        username: process.env.CI_PORTAL_USERNAME!,
        password: process.env.CI_PORTAL_PASSWORD!,
      },
      database: {
        username: process.env.CI_DATABASE_USERNAME!,
        password: process.env.CI_DATABASE_PASSWORD!,
      },
    },
    database: {
      serverName: process.env.CI_DATABASE_SERVER_NAME!,
      databaseName: process.env.CI_DATABASE_NAME!,
      instanceName: process.env.CI_DATABASE_INSTANCE_NAME!,
    },
  };

  public async getPortalBaseUrl(): Promise<string> {
    return EnvironmentConfigManager.getEnvironmentVariable(
      () => this.ciEnvironmentVariables.urls.portalBaseUrl,
      "ciPortalBaseUrl",
      "getPortalBaseUrl",
      "Failed to get CI portal base URL",
    );
  }

  public async getPortalCredentials(): Promise<Credentials> {
    const username = await EnvironmentConfigManager.getEnvironmentVariable(
      () => this.ciEnvironmentVariables.users.portal.username,
      "ciPortalUsername",
      "getPortalCredentials",
      "Failed to get CI portal username",
    );

    const password = await EnvironmentConfigManager.getEnvironmentVariable(
      () => this.ciEnvironmentVariables.users.portal.password,
      "ciPortalPassword",
      "getPortalCredentials",
      "Failed to get CI portal password",
    );

    const credentials = { username, password };
    EnvironmentConfigManager.verifyCredentials(credentials);

    return credentials;
  }

  public async getDatabaseCredentials(): Promise<Credentials> {
    const username = await EnvironmentConfigManager.getEnvironmentVariable(
      () => this.ciEnvironmentVariables.users.database.username,
      "ciDatabaseUsername",
      "getDatabaseCredentials",
      "Failed to get CI database username",
    );

    const password = await EnvironmentConfigManager.getEnvironmentVariable(
      () => this.ciEnvironmentVariables.users.database.password,
      "ciDatabasePassword",
      "getDatabaseCredentials",
      "Failed to get CI database password",
    );

    const credentials = { username, password };
    EnvironmentConfigManager.verifyCredentials(credentials);

    return credentials;
  }

  public async getDatabaseServerName(): Promise<string> {
    return EnvironmentConfigManager.getEnvironmentVariable(
      () => this.ciEnvironmentVariables.database.serverName,
      "ciDatabaseServerName",
      "getDatabaseServerName",
      "Failed to get CI database server name",
    );
  }

  public async getDatabaseName(): Promise<string> {
    return EnvironmentConfigManager.getEnvironmentVariable(
      () => this.ciEnvironmentVariables.database.databaseName,
      "ciDatabaseName",
      "getDatabaseName",
      "Failed to get CI database name",
    );
  }

  public async getDatabaseInstanceName(): Promise<string> {
    return EnvironmentConfigManager.getEnvironmentVariable(
      () => this.ciEnvironmentVariables.database.instanceName,
      "ciDatabaseInstanceName",
      "getDatabaseInstanceName",
      "Failed to get CI database instance name",
    );
  }
}
