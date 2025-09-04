// hooks/useAPIKeyManager.ts
"use client";

import { useState, useCallback, useRef } from "react";
import { KeyStorageService } from "../services/keyStorage";
import { GeminiAPIService, RefinementType } from "../services/geminiAPI";
import { EncryptedKeyData } from "../lib/crypto";

interface APIKeyManager {
  hasStoredKey: () => Promise<boolean>;
  storeAPIKey: (apiKey: string, password: string) => Promise<void>;
  authenticateSession: (password: string) => Promise<boolean>;
  isSessionValid: () => boolean;
  clearSession: () => void;
  deleteApiKey: () => Promise<void>;
  refineSteps: (steps: string[], type: RefinementType) => Promise<string[]>;
  refineDocumentDescription: (
    description: string,
    documentSummary: string
  ) => Promise<string>;
  validateApiKey: (apiKey: string) => Promise<boolean>;
  summarizeDocument: (documentText: string) => Promise<string>;
  getSessionTimeLeft: () => number;
}

export const useAPIKeyManager = (): APIKeyManager => {
  const [sessionExpiry, setSessionExpiry] = useState<number | null>(null);
  const keyStorageService = useRef(new KeyStorageService());
  const geminiService = useRef(new GeminiAPIService());
  const decryptedKeyCache = useRef<string | null>(null);

  // Session duration: 30 minutes
  const SESSION_DURATION = 30 * 60 * 1000;

  const clearSession = useCallback(() => {
    setSessionExpiry(null);
    decryptedKeyCache.current = null;
  }, []);

  const isSessionValid = useCallback(() => {
    if (!sessionExpiry || !decryptedKeyCache.current) {
      return false;
    }
    return Date.now() < sessionExpiry;
  }, [sessionExpiry]);

  const extendSession = useCallback(() => {
    setSessionExpiry(Date.now() + SESSION_DURATION);
  }, []);

  const hasStoredKey = useCallback(async (): Promise<boolean> => {
    try {
      return await keyStorageService.current.hasStoredKey();
    } catch (error) {
      console.error("Failed to check stored key:", error);
      return false;
    }
  }, []);

  const storeAPIKey = useCallback(
    async (apiKey: string, password: string): Promise<void> => {
      try {
        // First validate the API key
        const isValid = await geminiService.current.validateApiKey(apiKey);
        if (!isValid) {
          throw new Error("Invalid API key");
        }

        // Encrypt and store the key
        const encryptedData = await keyStorageService.current.encryptKey(
          apiKey,
          password
        );
        await keyStorageService.current.storeEncryptedKey(encryptedData);

        // Cache the key and set session
        decryptedKeyCache.current = apiKey;
        extendSession();
      } catch (error) {
        console.error("Failed to store API key:", error);
        throw error;
      }
    },
    [extendSession]
  );

  const authenticateSession = useCallback(
    async (password: string): Promise<boolean> => {
      try {
        const encryptedData = await keyStorageService.current.getEncryptedKey();
        if (!encryptedData) {
          throw new Error("No stored API key found");
        }

        const decryptedKey = await keyStorageService.current.decryptKey(
          encryptedData,
          password
        );

        // Validate the decrypted key
        const isValid = await geminiService.current.validateApiKey(
          decryptedKey
        );
        if (!isValid) {
          throw new Error("Invalid or expired API key");
        }

        // Cache the key and set session
        decryptedKeyCache.current = decryptedKey;
        extendSession();

        return true;
      } catch (error) {
        console.error("Authentication failed:", error);
        clearSession();
        return false;
      }
    },
    [extendSession, clearSession]
  );

  const refineSteps = useCallback(
    async (
      steps: string[],
      type: RefinementType = "clarity"
    ): Promise<string[]> => {
      if (!isSessionValid() || !decryptedKeyCache.current) {
        throw new Error("Session expired or no API key available");
      }

      try {
        const refinedSteps = await geminiService.current.refineSteps(
          decryptedKeyCache.current,
          steps,
          type
        );

        // Extend session on successful use
        extendSession();

        return refinedSteps;
      } catch (error) {
        console.error("Failed to refine steps:", error);
        throw error;
      }
    },
    [isSessionValid, extendSession]
  );

  const validateApiKey = useCallback(
    async (apiKey: string): Promise<boolean> => {
      try {
        return await geminiService.current.validateApiKey(apiKey);
      } catch (error) {
        console.error("Failed to validate API key:", error);
        return false;
      }
    },
    []
  );

  const refineDocumentDescription = useCallback(
    async (description: string, documentText: string): Promise<string> => {
      if (!isSessionValid() || !decryptedKeyCache.current) {
        throw new Error("Session expired or no API key available");
      }

      try {
        const refinedDescription =
          await geminiService.current.refineDocumentDescription(
            decryptedKeyCache.current,
            description,
            documentText
          );

        // Extend session on successful use
        extendSession();

        return refinedDescription;
      } catch (error) {
        console.error("Failed to refine document description:", error);
        throw error;
      }
    },
    [isSessionValid, extendSession]
  );

  const summarizeDocument = useCallback(
    async (documentText: string): Promise<string> => {
      if (!isSessionValid() || !decryptedKeyCache.current) {
        throw new Error("Session expired or no API key available");
      }

      try {
        const summary = await geminiService.current.summarizeDocument(
          decryptedKeyCache.current,
          documentText
        );

        // Extend session on successful use
        extendSession();

        return summary;
      } catch (error) {
        console.error("Failed to summarize document:", error);
        throw error;
      }
    },
    [isSessionValid, extendSession]
  );

  const getSessionTimeLeft = useCallback((): number => {
    if (!sessionExpiry) return 0;
    const timeLeft = sessionExpiry - Date.now();
    return Math.max(0, timeLeft);
  }, [sessionExpiry]);

  const deleteApiKey = useCallback(async (): Promise<void> => {
    try {
      await keyStorageService.current.deleteEncryptedKey();
      // Clear the session and cached key after deletion
      clearSession();
    } catch (error) {
      console.error("Failed to delete API key:", error);
      throw error;
    }
  }, [clearSession]);

  return {
    hasStoredKey,
    storeAPIKey,
    authenticateSession,
    isSessionValid,
    clearSession,
    deleteApiKey,
    refineSteps,
    refineDocumentDescription,
    validateApiKey,
    summarizeDocument,
    getSessionTimeLeft,
  };
};
