import React from "react";
import { Globe, Lock, Copy } from "lucide-react";
import { ShareTabProps } from "../../document.types";

const ShareTab: React.FC<ShareTabProps> = ({
  isPublic,
  isUpdatingShareStatus,
  onToggleShareStatus,
  onCopyLink,
}) => {
  return (
    <div className="space-y-6">
      {/* Current sharing status */}
      <div className="bg-gray-50 rounded-lg p-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-8 h-8 flex items-center justify-center rounded-lg ${
                isPublic ? "bg-green-100" : "bg-gray-100"
              }`}
            >
              {isPublic ? (
                <Globe className="w-4 h-4 text-green-600" />
              ) : (
                <Lock className="w-4 h-4 text-gray-600" />
              )}
            </div>
            <div>
              <p className="font-medium text-gray-900 text-sm">
                {isPublic ? "Public" : "Private"}
              </p>
              <p className="text-xs text-gray-500">
                {isPublic
                  ? "Anyone with the link can view this document"
                  : "Only you can access this document"}
              </p>
            </div>
          </div>
          <button
            onClick={onToggleShareStatus}
            disabled={isUpdatingShareStatus}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              isPublic
                ? "bg-green-100 text-green-700 hover:bg-green-200"
                : "bg-blue-100 text-blue-700 hover:bg-blue-200"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isUpdatingShareStatus
              ? "Updating..."
              : isPublic
              ? "Make Private"
              : "Make Public"}
          </button>
        </div>
      </div>

      {/* Current link display */}
      <div className="space-y-3">
        <p className="text-sm text-gray-600">
          {isPublic
            ? "Share this link with others:"
            : "Your private document link:"}
        </p>

        <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border">
          <input
            type="text"
            value={typeof window !== "undefined" ? window.location.href : ""}
            readOnly
            className="flex-1 bg-transparent text-sm text-gray-600 outline-none"
          />
          <button
            onClick={onCopyLink}
            className="p-1.5 hover:bg-gray-200 rounded transition-colors"
            title="Copy link"
          >
            <Copy className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareTab;
