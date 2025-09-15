// services/keyStorage.ts
import { CryptoUtils, EncryptedKeyData } from "../lib/crypto";
import { apiClient } from "../lib/axios-client";

export class KeyStorageService {
  async encryptKey(
    apiKey: string,
    password: string
  ): Promise<EncryptedKeyData> {
    return CryptoUtils.encryptKey(apiKey, password);
  }

  async decryptKey(
    encryptedData: EncryptedKeyData,
    password: string
  ): Promise<string> {
    return CryptoUtils.decryptKey(encryptedData, password);
  }

  async storeEncryptedKey(encryptedData: EncryptedKeyData): Promise<void> {
    try {
      // Convert Uint8Arrays to base64 for API transmission
      const payload = {
        encryptedKey: this.uint8ArrayToBase64(encryptedData.encryptedKey),
        salt: this.uint8ArrayToBase64(encryptedData.salt),
        iv: this.uint8ArrayToBase64(encryptedData.iv),
        hash: encryptedData.hash,
      };

      // Use the protected API client for authenticated requests
      await apiClient.protected.storeApiKey(payload);
    } catch (error) {
      console.error("Failed to store encrypted key:", error);
      throw new Error("Failed to store API key securely");
    }
  }

  async getEncryptedKey(): Promise<EncryptedKeyData | null> {
    try {
      const data = await apiClient.protected.getApiKey();

      // Convert base64 back to Uint8Arrays
      return {
        encryptedKey: this.base64ToUint8Array(data.encryptedKey),
        salt: this.base64ToUint8Array(data.salt),
        iv: this.base64ToUint8Array(data.iv),
        hash: data.hash,
      };
    } catch (error: any) {
      console.error("❌ API call failed:", error);
      // Handle 404 specifically (user doesn't have a stored key)
      if (error?.response?.status === 404) {
        console.log("📭 No stored key found (404)");
        return null;
      }
      console.error("Failed to retrieve encrypted key:", error);
      return null;
    }
  }

  async deleteEncryptedKey(): Promise<void> {
    try {
      await apiClient.protected.deleteApiKey();
    } catch (error) {
      console.error("Failed to delete encrypted key:", error);
      throw new Error("Failed to delete stored API key");
    }
  }

  async hasStoredKey(): Promise<boolean> {
    try {
      const data = await apiClient.protected.getApiKeyStatus();

      return data.hasCustomApiKey;
    } catch (error) {
      console.error("❌ Failed to check API key status:", error);
      return false;
    }
  }

  private uint8ArrayToBase64(array: Uint8Array): string {
    const binary = Array.from(array, (byte) => String.fromCharCode(byte)).join(
      ""
    );
    return btoa(binary);
  }

  private base64ToUint8Array(base64: string): Uint8Array {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  }
}
