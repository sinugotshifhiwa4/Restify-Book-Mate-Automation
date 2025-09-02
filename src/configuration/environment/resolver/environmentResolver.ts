import EnvironmentDetector from "../detector/environmentDetector";
import EnvironmentConfigManager from "../dotenv/manager/environmentConfigManager";
import ENV from "../variables/environmentVariables";
import { Credentials } from "../../../utils/auth/credentials.types";

export class EnvironmentResolver {
  private readonly isCI = EnvironmentDetector.isCI();

  // CI config loaded once at instantiation
  private readonly ciConfig = this.isCI
    ? {
        portalBaseUrl: process.env.CI_PORTAL_BASE_URL!,
        apiBaseUrl: process.env.CI_API_BASE_URL!,
        portalUsername: process.env.CI_PORTAL_USERNAME!,
        portalPassword: process.env.CI_PORTAL_PASSWORD!,
        apiUsername: process.env.CI_AUTH_USERNAME!,
        apiPassword: process.env.CI_AUTH_PASSWORD!,
        databaseUsername: process.env.CI_DATABASE_USERNAME!,
        databasePassword: process.env.CI_DATABASE_PASSWORD!,
        databaseServerName: process.env.CI_DATABASE_SERVER_NAME!,
        databaseName: process.env.CI_DATABASE_NAME!,
        databaseInstanceName: process.env.CI_DATABASE_INSTANCE_NAME!,
      }
    : null;

  // URLs
  async getPortalBaseUrl(): Promise<string> {
    return this.isCI
      ? this.ciConfig!.portalBaseUrl
      : this.getLocalEnvVar(() => ENV.PORTAL_BASE_URL, "Portal Base URL");
  }

  async getApiBaseUrl(): Promise<string> {
    return this.isCI
      ? this.ciConfig!.apiBaseUrl
      : this.getLocalEnvVar(() => ENV.API_BASE_URL, "API Base URL");
  }

  // Credentials
  async getPortalCredentials(): Promise<Credentials> {
    if (this.isCI) {
      return this.validateAndReturn({
        username: this.ciConfig!.portalUsername,
        password: this.ciConfig!.portalPassword,
      });
    }

    return this.getDecryptedCredentials(ENV.PORTAL_USERNAME, ENV.PORTAL_PASSWORD);
  }

  async getApiCredentials(): Promise<Credentials> {
    if (this.isCI) {
      return this.validateAndReturn({
        username: this.ciConfig!.apiUsername,
        password: this.ciConfig!.apiPassword,
      });
    }

    return this.getDecryptedCredentials(ENV.AUTH_USERNAME, ENV.AUTH_PASSWORD);
  }

  async getDatabaseCredentials(): Promise<Credentials> {
    if (this.isCI) {
      return this.validateAndReturn({
        username: this.ciConfig!.databaseUsername,
        password: this.ciConfig!.databasePassword,
      });
    }

    return this.getDecryptedCredentials(ENV.DATABASE_USERNAME, ENV.DATABASE_PASSWORD);
  }

  // Database Config
  async getDatabaseServerName(): Promise<string> {
    return this.isCI
      ? this.ciConfig!.databaseServerName
      : this.getLocalEnvVar(() => ENV.DATABASE_SERVER_NAME, "Database Server Name");
  }

  async getDatabaseName(): Promise<string> {
    return this.isCI
      ? this.ciConfig!.databaseName
      : this.getLocalEnvVar(() => ENV.DATABASE_NAME, "Database Name");
  }

  async getDatabaseInstanceName(): Promise<string> {
    return this.isCI
      ? this.ciConfig!.databaseInstanceName
      : this.getLocalEnvVar(() => ENV.DATABASE_INSTANCE_NAME, "Database Instance Name");
  }

  // Helper methods
  private async getLocalEnvVar<T>(getValue: () => T, description: string): Promise<T> {
    return EnvironmentConfigManager.getEnvironmentVariable(
      getValue,
      description.toLowerCase().replace(/\s+/g, ""),
      `get${description.replace(/\s+/g, "")}`,
      `Failed to get ${description.toLowerCase()}`,
    );
  }

  private async getDecryptedCredentials(username: string, password: string): Promise<Credentials> {
    const credentials = { username, password };
    EnvironmentConfigManager.verifyCredentials(credentials);

    return EnvironmentConfigManager.decryptCredentials(
      username,
      password,
      EnvironmentConfigManager.getCurrentEnvSecretKey(),
    );
  }

  private validateAndReturn(credentials: Credentials): Credentials {
    EnvironmentConfigManager.verifyCredentials(credentials);
    return credentials;
  }

  // Optional: Get all config at once
  async getAllConfig() {
    return {
      urls: {
        portal: await this.getPortalBaseUrl(),
        api: await this.getApiBaseUrl(),
      },
      credentials: {
        portal: await this.getPortalCredentials(),
        api: await this.getApiCredentials(),
        database: await this.getDatabaseCredentials(),
      },
      database: {
        serverName: await this.getDatabaseServerName(),
        name: await this.getDatabaseName(),
        instanceName: await this.getDatabaseInstanceName(),
      },
    };
  }
}
