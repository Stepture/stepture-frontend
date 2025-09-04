// components/PasswordAuthModal.tsx
"use client";

import React, { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
} from "./ui/alert-dialog";
import { Eye, EyeOff, Lock, Key, AlertCircle, CheckCircle } from "lucide-react";

interface PasswordAuthModalProps {
  isOpen: boolean;
  onAuthenticate: (password: string, apiKey?: string) => Promise<boolean>;
  onClose: () => void;
  purpose: "setup" | "unlock" | "change";
  title?: string;
  description?: string;
}

export const PasswordAuthModal: React.FC<PasswordAuthModalProps> = ({
  isOpen,
  onAuthenticate,
  onClose,
  purpose,
  title,
  description,
}) => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setPassword("");
      setConfirmPassword("");
      setApiKey("");
      setError("");
      setSuccess("");
      setIsLoading(false);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!password.trim()) {
      setError("Password is required");
      return;
    }

    if (purpose === "setup" || purpose === "change") {
      if (!apiKey.trim()) {
        setError("Gemini API key is required");
        return;
      }
      if (password.length < 8) {
        setError("Password must be at least 8 characters long");
        return;
      }
      if (password !== confirmPassword) {
        setError("Passwords do not match");
        return;
      }
    }

    setIsLoading(true);
    try {
      const success = await onAuthenticate(
        password,
        purpose === "setup" || purpose === "change" ? apiKey : undefined
      );
      if (success) {
        setSuccess(
          purpose === "setup"
            ? "API key stored successfully!"
            : purpose === "change"
            ? "API key updated successfully!"
            : "Authentication successful!"
        );
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        setError("Authentication failed");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrength = (
    pwd: string
  ): { score: number; label: string; color: string } => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[a-z]/.test(pwd)) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;

    const strengths = [
      { score: 0, label: "Very Weak", color: "bg-red-500" },
      { score: 1, label: "Weak", color: "bg-red-400" },
      { score: 2, label: "Fair", color: "bg-yellow-500" },
      { score: 3, label: "Good", color: "bg-blue-custom" },
      { score: 4, label: "Strong", color: "bg-blue-custom" },
      { score: 5, label: "Very Strong", color: "bg-blue-custom" },
    ];

    return strengths[score] || strengths[0];
  };

  const defaultTitle =
    purpose === "setup"
      ? "Set up API Key Security"
      : purpose === "change"
      ? "Change API Key"
      : "Unlock API Key";
  const defaultDescription =
    purpose === "setup"
      ? "Create a strong password to encrypt your Gemini API key. This password will be required to access your key for refining steps."
      : purpose === "change"
      ? "Enter your new Gemini API key and choose a password to encrypt it. This will replace your existing API key."
      : "Enter your password to unlock your stored Gemini API key for step refinement.";

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="sm:max-w-md ">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            {purpose === "setup" ? (
              <Key className="h-5 w-5 text-blue-custom" />
            ) : (
              <Lock className="h-5 w-5 text-blue-custom" />
            )}
            {title || defaultTitle}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {description || defaultDescription}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {(purpose === "setup" || purpose === "change") && (
            <div className="space-y-2">
              <label htmlFor="apiKey" className="text-sm font-medium">
                {purpose === "change" ? "New Gemini API Key" : "Gemini API Key"}
              </label>
              <div className="relative">
                <Input
                  id="apiKey"
                  type={showApiKey ? "text" : "password"}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder={
                    purpose === "change"
                      ? "Enter your new Gemini API key"
                      : "Enter your Gemini API key"
                  }
                  disabled={isLoading}
                  className="pr-10 focus:ring-2 focus:ring-blue-custom/20 focus:border-blue-custom"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-blue-custom transition-colors"
                  disabled={isLoading}
                >
                  {showApiKey ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-500">
                Get your API key from{" "}
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-custom hover:underline font-medium"
                >
                  Google AI Studio
                </a>
              </p>
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                disabled={isLoading}
                className="pr-10 focus:ring-2 focus:ring-blue-custom/20 focus:border-blue-custom"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-blue-custom transition-colors"
                disabled={isLoading}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>

            {(purpose === "setup" || purpose === "change") && password && (
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span>Password strength:</span>
                  <span
                    className={`font-medium ${getPasswordStrength(password)
                      .color.replace("bg-", "text-")
                      .replace("-500", "-600")
                      .replace("green", "blue-custom")
                      .replace("blue-500", "blue-custom")
                      .replace("blue-400", "blue-custom")}`}
                  >
                    {getPasswordStrength(password).label}
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5">
                  <div
                    className={`h-2.5 rounded-full transition-all duration-300 ${
                      getPasswordStrength(password).color
                    }`}
                    style={{
                      width: `${
                        (getPasswordStrength(password).score / 5) * 100
                      }%`,
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {(purpose === "setup" || purpose === "change") && (
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium">
                Confirm Password
              </label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                disabled={isLoading}
                className="focus:ring-2 focus:ring-blue-custom/20 focus:border-blue-custom"
              />
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-xl border border-red-200">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 text-sm text-blue-custom bg-blue-50 p-3 rounded-xl border border-blue-200">
              <CheckCircle className="h-4 w-4" />
              {success}
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                isLoading ||
                !password.trim() ||
                ((purpose === "setup" || purpose === "change") &&
                  (!confirmPassword.trim() || !apiKey.trim()))
              }
              className="flex-1 bg-blue-custom hover:bg-blue-custom/90 text-white cursor-pointer"
            >
              {isLoading
                ? "Processing..."
                : purpose === "setup"
                ? "Set up"
                : purpose === "change"
                ? "Update API Key"
                : "Unlock"}
            </Button>
          </div>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
};
