import { showToast } from "@/components/ui/Common/ShowToast";
import { apiClient } from "@/lib/axios-client";

export const useShareStatusManager = () => {
  const handleToggleShareStatus = async (
    documentId: string | undefined,
    isPublic: boolean,
    setIsPublic: (value: boolean) => void,
    setIsUpdatingShareStatus: (value: boolean) => void
  ) => {
    if (!documentId) {
      showToast("error", "Document ID not available");
      return;
    }

    setIsUpdatingShareStatus(true);
    try {
      const newStatus = !isPublic;
      await apiClient.protected.updateDocumentShareStatus(
        documentId,
        newStatus
      );
      setIsPublic(newStatus);
      showToast(
        newStatus ? "success" : "info",
        newStatus
          ? "Document is now public and can be viewed by anyone with the link"
          : "Document is now private and only you can access it"
      );
    } catch (error) {
      console.error("Error updating share status:", error);
      showToast("error", "Failed to update sharing status. Please try again.");
    } finally {
      setIsUpdatingShareStatus(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      const currentUrl = window.location.href;
      await navigator.clipboard.writeText(currentUrl);
      showToast("success", "Link copied to clipboard!");
    } catch (error) {
      console.error("Failed to copy link:", error);
      // Fallback for older browsers
      try {
        const textArea = document.createElement("textarea");
        textArea.value = window.location.href;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
        showToast("success", "Link copied to clipboard!");
      } catch {
        showToast("error", "Failed to copy link. Please copy it manually.");
      }
    }
  };

  return {
    handleToggleShareStatus,
    handleCopyLink,
  };
};
