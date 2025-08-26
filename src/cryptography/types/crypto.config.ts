import { CryptoConfig } from "./crypto.types";

export const OUTPUT_FORMAT = {
  BASE64: "base64" as const,
  HEX: "hex" as const,
  BUFFER: "buffer" as const,
};

export const CRYPTO_TYPE = {
  SALT: "salt" as const,
  SECRET_KEY: "secretKey" as const,
  IV: "iv" as const,
  RANDOM: "random" as const,
};

export const CRYPTO_CONFIG: CryptoConfig = {
  BYTE_LENGTHS: {
    IV: 16,
    WEB_CRYPTO_IV: 12,
    SALT: 32,
    SECRET_KEY: 32,
    HMAC_KEY_LENGTH: 32,
  },
  ARGON2_PARAMETERS: {
    MEMORY_COST: 262144, // 256 MB
    TIME_COST: 4,
    PARALLELISM: 3,
  },
  VALIDATION_LIMITS: {
    MAX_REASONABLE_LENGTH: 4096,
    MIN_SECURE_LENGTH: 8,
  },
};

export const CRYPTO_CONSTANTS = {
  FORMAT: {
    PREFIX: "ENC2:",
    SEPARATOR: ":",
    EXPECTED_PARTS: 4,
    PREFIX_LENGTH: 4,
  },
  ALGORITHM: {
    CIPHER: "AES-GCM",
    KEY_USAGE: ["encrypt", "decrypt"] as KeyUsage[],
  },
  VALIDATION: {
    ENV_VAR_KEY_PATTERN: /^[A-Z_][A-Z0-9_]*$/i,
  },
} as const;

export type EncryptionFormat = typeof CRYPTO_CONSTANTS.FORMAT;
export type CryptoAlgorithm = typeof CRYPTO_CONSTANTS.ALGORITHM;
export type CryptoValidation = typeof CRYPTO_CONSTANTS.VALIDATION;
