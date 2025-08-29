# Restify BookMate Automation

## Overview

Restify BookMate Automation is an API test automation framework built with Playwright and TypeScript, designed to validate the functionality of the Restful Booker API.

---

## Configurations

### Environment Variables

Environment-specific configs are managed under the `envs/` directory. Environment files are excluded from version control—only a template is provided.

**Steps:**

1. Open `.env.template`
2. Create a copy: `.env.<env>` (e.g., `.env.dev`)
3. Populate with credentials for the target environment

Supported environments: `dev`, `uat`, `prod`

**Example:**

```env
AUTH_USERNAME=<username>
AUTH_PASSWORD=<password>
```

---

### Encryption

Sensitive credentials are encrypted using **AES-GCM** with **Argon2** key derivation.

To encrypt credentials:

```bash
npx cross-env PLAYWRIGHT_GREP=@full-encryption ENV=dev npm run test:encryption
```

- Use `ENV=uat` for uat
- A secret key will be generated and stored in your `.env` file

---

### Code Quality with Husky

The framework includes:

- Husky
- Lint-Staged
- ESLint
- Prettier

These tools ensure consistent linting and formatting **before commits**. Hooks are located in the `.husky/` directory. Only staged files are linted for performance.

---

### Custom Timeout Management

Timeouts are defined in `src/configuration/timeouts/timeout.config.ts`.

**Features:**

- CI-aware test delay scaling
- Timeout categories (`test`, `api`, `network`)
- Dynamic values based on environment

**Usage Example:**

```ts
timeout: TIMEOUTS.test,
expect: TIMEOUTS.expect
```

---

### ESLint & Prettier Setup

- TypeScript-aware ESLint rules
- Prettier integration
- Only `console.error` allowed
- VS Code is pre-configured for format-on-save

Configuration files:

- `.prettierrc`
- `.vscode/settings.json`
- `eslint.config.mjs`

---

## Running Tests

Use the following format:

```bash
npm run test:<type>
```

- `<type>` can be: `encryption`, `ui`, `api`, `db`, `all`, or `failed`
- `<env>` = `dev`, `qa`, `uat`, `prod`

### Available Commands

| Command                   | Description                       |
| ------------------------- | --------------------------------- |
| `npm run test:ui`         | Run UI tests                      |
| `npm run test:api`        | Run API tests                     |
| `npm run test:db`         | Run DB tests                      |
| `npm run test:all`        | Run all test suites               |
| `npm run test:failed`     | Re-run only the last failed tests |
| `npm run ui`              | Launch Playwright UI runner       |
| `npm run record`          | Open Playwright Codegen tool      |
| `npm run report`          | Open the last HTML test report    |


Example:

```bash
npx cross-env ENV=dev npm run test:ui
```

To launch the Playwright UI:

```bash
npm run ui
```

---

## Running Tests by Tag

```bash
npx cross-env PLAYWRIGHT_GREP=@sanity ENV=dev npm run test:<type>
```

Where:

- `<type>` = `encryption`, `ui`, `api`, `db`, `all`, `failed`
- `<env>` = `dev`, `qa`, `uat`, `prod`

| Tag           | Description                 |
| ------------- | --------------------------- |
| `@sanity`     | Sanity checks (UI, API, DB) |
| `@regression` | Full regression suite       |

---