import { test as baseTest } from "@playwright/test";
import { FetchCIEnvironmentVariables } from "../src/configuration/environment/resolver/internal/fetch/fetchCIEnvironmentVariables";
import { FetchLocalEnvironmentVariables } from "../src/configuration/environment/resolver/internal/fetch/fetchLocalEnvironmentVariables";
import { EnvironmentResolver } from "../src/configuration/environment/resolver/environmentResolver";
import { ApiService } from "../src/layers/api/client/apiService";

type RestifyBookMateFixtures = {
  fetchCIEnvironmentVariables: FetchCIEnvironmentVariables;
  fetchLocalEnvironmentVariables: FetchLocalEnvironmentVariables;
  environmentResolver: EnvironmentResolver;
  apiService: ApiService;
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

  apiService: async ({ environmentResolver }, use) => {
    const service = await ApiService.create(environmentResolver);
    await use(service);
    await service.dispose();
  },
});

export const test = restifyBookMateTests;
export const expect = baseTest.expect;
