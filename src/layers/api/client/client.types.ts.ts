export interface AuthOptions {
  bearerToken?: string;
  apiKey?: string;
  apiKeyHeader?: string;
  basicAuth?: {
    username: string;
    password: string;
  };
  customHeaders?: Record<string, string>;
  cookies?: Record<string, string>;
}

export interface HttpClientConfig {
  baseURL?: string;
  timeout?: number;
  ignoreHTTPSErrors?: boolean;
  defaultHeaders?: Record<string, string>;
}

export interface RequestOptions {
  headers?: Record<string, string>;
  authOptions?: AuthOptions;
}
