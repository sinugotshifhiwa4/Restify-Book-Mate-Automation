import { test as baseTest } from "@playwright/test";
import { FetchCIEnvironmentVariables } from "../src/configuration/environment/resolver/internal/fetch/fetchCIEnvironmentVariables";
import { FetchLocalEnvironmentVariables } from "../src/configuration/environment/resolver/internal/fetch/fetchLocalEnvironmentVariables";
import { EnvironmentResolver } from "../src/configuration/environment/resolver/environmentResolver";
import { ApiClient } from "../src/layers/api/client/apiClient";

type RestifyBookMateFixtures = {
  fetchCIEnvironmentVariables: FetchCIEnvironmentVariables;
  fetchLocalEnvironmentVariables: FetchLocalEnvironmentVariables;
  environmentResolver: EnvironmentResolver;
  apiClient: ApiClient;
};

export const restifyBookMateTests = baseTest.extend<RestifyBookMateFixtures>({
  fetchCIEnvironmentVariables: async ({}, use) => {
    await use(new FetchCIEnvironmentVariables());
  },

  fetchLocalEnvironmentVariables: async ({}, use) => {
    await use(new FetchLocalEnvironmentVariables());
  },

  environmentResolver: async (
    { fetchCIEnvironmentVariables, fetchLocalEnvironmentVariables },
    use,
  ) => {
    const resolver = new EnvironmentResolver(
      fetchCIEnvironmentVariables,
      fetchLocalEnvironmentVariables,
    );
    await use(resolver);
  },

  apiClient: async ({ environmentResolver }, use) => {
    const client = await ApiClient.create(environmentResolver);
    await use(client);
    await client.dispose();
  },
});

export const test = restifyBookMateTests;
export const expect = baseTest.expect;
