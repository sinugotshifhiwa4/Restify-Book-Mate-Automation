export default class EnvironmentVariables {
  // URLS
  public static readonly PORTAL_BASE_URL = process.env.PORTAL_BASE_URL!;

  // Users
  public static readonly PORTAL_USERNAME = process.env.PORTAL_USERNAME!;
  public static readonly PORTAL_PASSWORD = process.env.PORTAL_PASSWORD!;

  // Api
  public static readonly API_BASE_URL = process.env.API_BASE_URL!;
  public static readonly AUTH_USERNAME = process.env.AUTH_USERNAME!;
  public static readonly AUTH_PASSWORD = process.env.AUTH_PASSWORD!;

  // Database
  public static readonly DATABASE_SERVER_NAME = process.env.DATABASE_SERVER_NAME!;
  public static readonly DATABASE_INSTANCE_NAME = process.env.DATABASE_INSTANCE_NAME!;
  public static readonly DATABASE_NAME = process.env.DATABASE_NAME!;
  public static readonly DATABASE_USERNAME = process.env.DATABASE_USERNAME!;
  public static readonly DATABASE_PASSWORD = process.env.DATABASE_PASSWORD!;
}
