import { APIRequestContext, request, APIResponse } from "@playwright/test";
import { RequestOptions, HttpClientConfig } from "./client.types.ts";

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
   * Execute HTTP request with specified method and options
   * Lazily initializes context on first request
   */
  public async executeRequest(
    httpMethod: "get" | "post" | "put" | "patch" | "delete",
    endpoint: string,
    requestOptions?: RequestOptions,
    requestData?: unknown,
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
      this.requestContext = await request.newContext({
        baseURL: this.config.baseURL,
        timeout: this.config.timeout || 30000,
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
      headers["Cookie"] = authConfig.cookies;
    }

    if (authConfig.customHeaders) {
      Object.assign(headers, authConfig.customHeaders);
    }
  }

  private formatBearerToken(token: string): string {
    return token.startsWith("Bearer ") ? token : `Bearer ${token}`;
  }

  private createBasicAuthHeader(credentials: { username: string; password: string }): string {
    const { username, password } = credentials;
    const encodedCredentials = Buffer.from(`${username}:${password}`).toString("base64");
    return `Basic ${encodedCredentials}`;
  }
}
