import { APIResponse } from "@playwright/test";
import { ApiClient } from "./apiClient";
import { EnvironmentResolver } from "../../../configuration/environment/resolver/environmentResolver";
import { API_TIMEOUT } from "../../../configuration/timeouts/timeout.config";
import { RequestOptions } from "./client.types.ts";
import ErrorHandler from "../../../utils/errorHandling/errorHandler";

export class ApiService {
  private apiClient?: ApiClient;
  private readonly environmentResolver: EnvironmentResolver;

  constructor(environmentResolver: EnvironmentResolver) {
    this.environmentResolver = environmentResolver;
  }

  public static async create(environmentResolver: EnvironmentResolver): Promise<ApiService> {
    const service = new ApiService(environmentResolver);
    await service.initialize();
    return service;
  }

  private async initialize(): Promise<void> {
    if (this.apiClient) return;

    const baseApiUrl = await this.environmentResolver.getApiBaseUrl();

    this.apiClient = new ApiClient({
      baseURL: baseApiUrl,
      timeout: API_TIMEOUT.connection,
      ignoreHTTPSErrors: false,
    });
  }

  private async ensureInitialized(): Promise<void> {
    if (!this.apiClient) {
      await this.initialize();
    }
  }

  public async dispose(): Promise<void> {
    if (this.apiClient) {
      await this.apiClient.dispose();
      this.apiClient = undefined;
    }
  }

  public async get(endpoint: string, requestOptions?: RequestOptions): Promise<APIResponse> {
    await this.ensureInitialized();
    return this.getApiClient().executeRequest("get", endpoint, requestOptions);
  }

  public async post(
    endpoint: string,
    requestData?: unknown,
    requestOptions?: RequestOptions,
  ): Promise<APIResponse> {
    await this.ensureInitialized();
    return this.getApiClient().executeRequest("post", endpoint, requestOptions, requestData);
  }

  public async put(
    endpoint: string,
    requestData?: unknown,
    requestOptions?: RequestOptions,
  ): Promise<APIResponse> {
    await this.ensureInitialized();
    return this.getApiClient().executeRequest("put", endpoint, requestOptions, requestData);
  }

  public async patch(
    endpoint: string,
    requestData?: unknown,
    requestOptions?: RequestOptions,
  ): Promise<APIResponse> {
    await this.ensureInitialized();
    return this.getApiClient().executeRequest("patch", endpoint, requestOptions, requestData);
  }

  public async delete(endpoint: string, requestOptions?: RequestOptions): Promise<APIResponse> {
    await this.ensureInitialized();
    return this.getApiClient().executeRequest("delete", endpoint, requestOptions);
  }

  private getApiClient(): ApiClient {
    if (!this.apiClient) {
      ErrorHandler.logAndThrow("ApiService", "ApiClient not initialized");
    }
    return this.apiClient;
  }
}
