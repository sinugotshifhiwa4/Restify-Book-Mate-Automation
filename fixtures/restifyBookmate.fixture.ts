import { test as baseTest } from "@playwright/test";
import { EnvironmentResolver } from "../src/configuration/environment/resolver/environmentResolver";
import { ApiClient } from "../src/layers/api/client/apiClient";

type RestifyBookMateFixtures = {
  environmentResolver: EnvironmentResolver;
  apiClient: ApiClient;
};

export const restifyBookMateTests = baseTest.extend<RestifyBookMateFixtures>({
  environmentResolver: async ({}, use) => {
    const resolver = new EnvironmentResolver();
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
