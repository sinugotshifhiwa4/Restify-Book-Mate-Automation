import { Credentials } from "../../../../../utils/auth/credentials.types";

export interface CIEnvironmentConfig {
  urls: Urls;
  users: UserCredentialsSet;
  database: DatabaseConnection;
}

export interface Urls {
  portalBaseUrl: string;
}

export interface UserCredentialsSet {
  portal: Credentials;
  database: Credentials;
}

export interface DatabaseConnection {
  serverName: string;
  databaseName: string;
  instanceName: string;
}
