import { CryptoManager } from "../manager/cryptoManager";
import ErrorHandler from "../../utils/errorHandling/errorHandler";

export class CryptoService {
  /**
   * Main encrypt method using helpers
   */
  public static async encrypt(value: string, secretKeyVariable: string): Promise<string> {
    try {
      // Step 1: Validate prerequisites
      const secretKey = await CryptoManager.validateEncryptionPrerequisites(
        value,
        secretKeyVariable,
      );

      // Step 2: Generate encryption components
      const { salt, webCryptoIv, encryptionKey, hmacKey } =
        await CryptoManager.generateEncryptionComponents(secretKey);

      // Step 3: Create encrypted payload
      return await CryptoManager.createEncryptedPayload(
        value,
        salt,
        webCryptoIv,
        encryptionKey,
        hmacKey,
      );
    } catch (error) {
      ErrorHandler.captureError(error, "encrypt", "Failed to encrypt with AES-GCM.");
      throw error;
    }
  }

  public static async encryptMultiple(
    values: string[],
    secretKeyVariable: string,
  ): Promise<string[]> {
    return Promise.all(values.map((value) => this.encrypt(value, secretKeyVariable)));
  }

  public static async decrypt(encryptedData: string, secretKeyVariable: string): Promise<string> {
    const resolvedSecretKey = await CryptoManager.getSecretKeyFromEnvironment(secretKeyVariable);
    CryptoManager.validateSecretKey(resolvedSecretKey);
    CryptoManager.validateInputs(encryptedData, resolvedSecretKey, "decrypt");

    try {
      const { salt, iv, cipherText, receivedHmac } =
        CryptoManager.parseEncryptedData(encryptedData);

      const { encryptionKey, hmacKey } = await CryptoManager.deriveKeysWithArgon2(
        resolvedSecretKey,
        salt,
      );

      await CryptoManager.verifyHMAC(salt, iv, cipherText, receivedHmac, hmacKey);

      const decryptedBuffer = await CryptoManager.performDecryption(iv, encryptionKey, cipherText);

      return new TextDecoder().decode(new Uint8Array(decryptedBuffer));
    } catch (error) {
      ErrorHandler.captureError(error, "decrypt", "Failed to decrypt with AES-GCM.");
      throw error;
    }
  }

  public static async decryptMultiple(
    encryptedValues: string[],
    secretKeyVariable: string,
  ): Promise<string[]> {
    if (!Array.isArray(encryptedValues)) {
      ErrorHandler.logAndThrow("decryptMultiple", "encryptedValues must be an array");
    }

    if (encryptedValues.length === 0) {
      return [];
    }

    try {
      return await Promise.all(
        encryptedValues.map((data) => this.decrypt(data, secretKeyVariable)),
      );
    } catch (error) {
      ErrorHandler.captureError(
        error,
        "decryptMultiple",
        "Failed to decrypt multiple values with AES-GCM.",
      );
      throw error;
    }
  }
}
