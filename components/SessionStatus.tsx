// components/SessionStatus.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useAPIKeyManager } from "../hooks/useAPIKeyManager";
import { Button } from "./ui/button";
import {
  Lock,
  Unlock,
  AlertCircle,
  Settings,
  RotateCcw,
  Clock,
} from "lucide-react";

interface SessionStatusProps {
  onUnlockClick?: () => void;
  onChangeApiKey?: () => void;
  compact?: boolean;
}

export const SessionStatus: React.FC<SessionStatusProps> = ({
  onUnlockClick,
  onChangeApiKey,
  compact = false,
}) => {
  const keyManager = useAPIKeyManager();
  const [timeLeft, setTimeLeft] = useState(0);
  const [hasStoredKey, setHasStoredKey] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const checkStoredKey = async () => {
      const hasKey = await keyManager.hasStoredKey();
      setHasStoredKey(hasKey);
    };
    checkStoredKey();
  }, [keyManager]);

  useEffect(() => {
    const updateTimeLeft = () => {
      setTimeLeft(keyManager.getSessionTimeLeft());
    };

    updateTimeLeft(); // Initial update
    const interval = setInterval(updateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [keyManager]);

  const formatTime = (ms: number): string => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const handleChangeApiKey = () => {
    setShowDropdown(false);
    onChangeApiKey?.();
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        {keyManager.isSessionValid() ? (
          <div className="flex items-center gap-1 text-green-600">
            <Unlock className="h-4 w-4" />
            <span className="text-sm">Active</span>
            {hasStoredKey && onChangeApiKey && (
              <div className="relative ml-1">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
                  title="API Key Options"
                >
                  <Settings className="w-3 h-3" />
                </button>

                {showDropdown && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowDropdown(false)}
                    />
                    <div className="absolute right-0 top-full mt-1 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                      <button
                        onClick={handleChangeApiKey}
                        className="flex items-center gap-2 w-full px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 transition-colors rounded-lg"
                      >
                        <RotateCcw className="w-3 h-3" />
                        Change API Key
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-1 text-red-600">
            <Lock className="h-4 w-4" />
            <span className="text-sm">Locked</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
      {keyManager.isSessionValid() ? (
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 text-green-700">
            <Unlock className="h-4 w-4" />
            <span className="text-sm font-medium">🔓 Session active</span>
          </div>
          {timeLeft > 0 && (
            <div className="flex items-center gap-1 text-green-600">
              <Clock className="w-4 h-4" />
              <span className="text-sm">{formatTime(timeLeft)}</span>
            </div>
          )}
        </div>
      ) : (
        <div className="flex items-center gap-2 text-red-700">
          <Lock className="h-4 w-4" />
          <span className="text-sm font-medium">
            🔒 Session expired - Click to unlock
          </span>
        </div>
      )}

      <div className="flex items-center gap-2">
        {!keyManager.isSessionValid() && onUnlockClick && (
          <Button size="sm" onClick={onUnlockClick}>
            Unlock
          </Button>
        )}

        {hasStoredKey && onChangeApiKey && (
          <div className="relative">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowDropdown(!showDropdown)}
              className="p-2"
            >
              <Settings className="w-4 h-4" />
            </Button>

            {showDropdown && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowDropdown(false)}
                />
                <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                  <button
                    onClick={handleChangeApiKey}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors first:rounded-t-lg last:rounded-b-lg"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Change API Key
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
