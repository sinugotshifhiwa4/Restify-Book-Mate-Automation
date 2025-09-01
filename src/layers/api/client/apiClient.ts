import { APIRequestContext, request, APIResponse } from "@playwright/test";
import { RequestOptions, HttpClientConfig } from "./client.types.ts";
import { EnvironmentResolver } from "../../../configuration/environment/resolver/environmentResolver";
import { API_TIMEOUT } from "../../../configuration/timeouts/timeout.config";
import { Credentials } from "../../../utils/auth/credentials.types.js";
import ErrorHandler from "../../../utils/errorHandling/errorHandler";

export class ApiClient {
  private readonly defaultHeaders: Record<string, string>;
  private requestContext?: APIRequestContext;
  private static readonly STANDARD_JSON_HEADERS: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  constructor(private readonly config: HttpClientConfig = {}) {
    this.defaultHeaders = {
      ...ApiClient.STANDARD_JSON_HEADERS,
      ...config.defaultHeaders,
    };
  }

  /**
   * Static factory method to create ApiClient with environment resolver
   */
  public static async create(environmentResolver: EnvironmentResolver): Promise<ApiClient> {
    const baseApiUrl = await environmentResolver.getApiBaseUrl();
    return new ApiClient({
      baseURL: baseApiUrl,
      timeout: API_TIMEOUT.connection,
      ignoreHTTPSErrors: false,
    });
  }

  /**
   * Execute HTTP request with specified method and options
   * Lazily initializes context on first request
   */
  public async request(
    httpMethod: "get" | "post" | "put" | "patch" | "delete",
    endpoint: string,
    requestData?: unknown,
    requestOptions?: RequestOptions,
  ): Promise<APIResponse> {
    await this.ensureContextInitialized();
    const requestHeaders = this.buildRequestHeaders(requestOptions);

    if (this.isReadOnlyMethod(httpMethod)) {
      return this.requestContext![httpMethod](endpoint, { headers: requestHeaders });
    } else {
      return this.requestContext![httpMethod](endpoint, {
        headers: requestHeaders,
        data: requestData ? JSON.stringify(requestData) : undefined,
      });
    }
  }

  /**
   * Clean up resources and dispose of the request context
   */
  public async dispose(): Promise<void> {
    if (this.requestContext) {
      await this.requestContext.dispose();
      this.requestContext = undefined;
    }
  }

  private async ensureContextInitialized(): Promise<void> {
    if (!this.requestContext) {
      if (!this.config.baseURL) {
        ErrorHandler.logAndThrow("ApiClient", "Base URL not configured");
      }

      this.requestContext = await request.newContext({
        baseURL: this.config.baseURL,
        timeout: this.config.timeout || 15000,
        ignoreHTTPSErrors: this.config.ignoreHTTPSErrors || false,
        extraHTTPHeaders: this.defaultHeaders,
      });
    }
  }

  private isReadOnlyMethod(method: string): boolean {
    return method === "get" || method === "delete";
  }

  private buildRequestHeaders(requestOptions?: RequestOptions): Record<string, string> {
    const compiledHeaders = { ...this.defaultHeaders };

    if (requestOptions?.authOptions) {
      this.applyAuthenticationHeaders(compiledHeaders, requestOptions.authOptions);
    }

    // Explicit headers take highest priority
    if (requestOptions?.headers) {
      Object.assign(compiledHeaders, requestOptions.headers);
    }

    return compiledHeaders;
  }

  private applyAuthenticationHeaders(
    headers: Record<string, string>,
    authConfig: RequestOptions["authOptions"],
  ): void {
    if (!authConfig) return;

    if (authConfig.bearerToken) {
      headers["Authorization"] = this.formatBearerToken(authConfig.bearerToken);
    }

    if (authConfig.apiKey) {
      const keyHeaderName = authConfig.apiKeyHeader || "X-API-Key";
      headers[keyHeaderName] = authConfig.apiKey;
    }

    if (authConfig.basicAuth) {
      headers["Authorization"] = this.createBasicAuthHeader(authConfig.basicAuth);
    }

    if (authConfig.cookies) {
      headers["Cookie"] = this.formatCookies(authConfig.cookies);
    }

    if (authConfig.customHeaders) {
      Object.assign(headers, authConfig.customHeaders);
    }
  }

  private formatCookies(cookies: Record<string, string>): string {
    return Object.entries(cookies)
      .map(([key, value]) => `${key}=${value}`)
      .join("; ");
  }

  private formatBearerToken(token: string): string {
    return token.startsWith("Bearer ") ? token : `Bearer ${token}`;
  }

  private createBasicAuthHeader(credentials: Credentials): string {
    const { username, password } = credentials;
    const encodedCredentials = Buffer.from(`${username}:${password}`).toString("base64");
    return `Basic ${encodedCredentials}`;
  }
}
