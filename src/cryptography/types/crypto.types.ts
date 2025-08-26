/**
 * Output format options for cryptographic value generation
 */
export const OUTPUT_FORMAT = {
  BASE64: "base64" as const,
  HEX: "hex" as const,
  BUFFER: "buffer" as const,
} as const;

/**
 * Types of cryptographic values that can be generated
 */
export const CRYPTO_TYPE = {
  SALT: "salt" as const,
  SECRET_KEY: "secretKey" as const,
  IV: "iv" as const,
  RANDOM: "random" as const,
} as const;

/**
 * Type definitions derived from the constants
 */
export type OutputFormat = (typeof OUTPUT_FORMAT)[keyof typeof OUTPUT_FORMAT];
export type CryptoType = (typeof CRYPTO_TYPE)[keyof typeof CRYPTO_TYPE];

/**
 * Options interface for unified cryptographic value generation
 */
export interface CryptoGenerationOptions {
  type: CryptoType;
  outputFormat: OutputFormat;
  length?: number;
}

export type CryptoGenerationResult = string | Buffer;

export interface CryptoConfig {
  BYTE_LENGTHS: CryptoByteLengths;
  ARGON2_PARAMETERS: Argon2Config;
  VALIDATION_LIMITS: ValidationLimits;
}

/**
 * Represents the result of an encryption operation.
 */
export interface EncryptionResult {
  salt: string;
  iv: string;
  cipherText: string;
}

export interface CryptoByteLengths {
  IV: number;
  WEB_CRYPTO_IV: number;
  SALT: number;
  SECRET_KEY: number;
  HMAC_KEY_LENGTH: number;
}

export interface Argon2Config {
  MEMORY_COST: number;
  TIME_COST: number;
  PARALLELISM: number;
}

export interface ValidationLimits {
  MAX_REASONABLE_LENGTH: number;
  MIN_SECURE_LENGTH: number;
}
