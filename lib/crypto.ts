// lib/crypto.ts
export interface EncryptedKeyData {
  encryptedKey: Uint8Array;
  salt: Uint8Array;
  iv: Uint8Array;
  hash: string;
}

export class CryptoUtils {
  private static readonly ALGORITHM = "AES-GCM";
  private static readonly KEY_LENGTH = 256;
  private static readonly ITERATIONS = 100000;
  private static readonly SALT_LENGTH = 32;
  private static readonly IV_LENGTH = 12;

  static async deriveKey(
    password: string,
    salt: Uint8Array
  ): Promise<CryptoKey> {
    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      "raw",
      encoder.encode(password),
      "PBKDF2",
      false,
      ["deriveKey"]
    );

    // Create a new Uint8Array to ensure proper BufferSource compatibility
    const saltBuffer = new Uint8Array(salt);

    return crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt: saltBuffer,
        iterations: this.ITERATIONS,
        hash: "SHA-256",
      },
      keyMaterial,
      {
        name: this.ALGORITHM,
        length: this.KEY_LENGTH,
      },
      false,
      ["encrypt", "decrypt"]
    );
  }

  static async encrypt(
    plaintext: string,
    key: CryptoKey
  ): Promise<{ ciphertext: Uint8Array; iv: Uint8Array }> {
    const encoder = new TextEncoder();
    const iv = crypto.getRandomValues(new Uint8Array(this.IV_LENGTH));

    const ciphertext = await crypto.subtle.encrypt(
      {
        name: this.ALGORITHM,
        iv: iv,
      },
      key,
      encoder.encode(plaintext)
    );

    return {
      ciphertext: new Uint8Array(ciphertext),
      iv: iv,
    };
  }

  static async decrypt(
    ciphertext: Uint8Array,
    key: CryptoKey,
    iv: Uint8Array
  ): Promise<string> {
    // Create new Uint8Arrays to ensure proper BufferSource compatibility
    const ivBuffer = new Uint8Array(iv);
    const ciphertextBuffer = new Uint8Array(ciphertext);

    const decrypted = await crypto.subtle.decrypt(
      {
        name: this.ALGORITHM,
        iv: ivBuffer,
      },
      key,
      ciphertextBuffer
    );

    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
  }

  static async hash(input: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(input);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  }

  static generateSalt(): Uint8Array {
    return crypto.getRandomValues(new Uint8Array(this.SALT_LENGTH));
  }

  static async encryptKey(
    apiKey: string,
    password: string
  ): Promise<EncryptedKeyData> {
    const salt = this.generateSalt();
    const key = await this.deriveKey(password, salt);
    const { ciphertext, iv } = await this.encrypt(apiKey, key);
    const hash = await this.hash(apiKey);

    return {
      encryptedKey: ciphertext,
      salt: salt,
      iv: iv,
      hash: hash,
    };
  }

  static async decryptKey(
    encryptedData: EncryptedKeyData,
    password: string
  ): Promise<string> {
    const key = await this.deriveKey(password, encryptedData.salt);
    const decryptedKey = await this.decrypt(
      encryptedData.encryptedKey,
      key,
      encryptedData.iv
    );

    // Verify integrity
    const computedHash = await this.hash(decryptedKey);
    if (computedHash !== encryptedData.hash) {
      throw new Error("Data integrity check failed");
    }

    return decryptedKey;
  }
}
