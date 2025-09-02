export interface User {
  id: string;
  name: string;
  email: string;
}
export interface Screenshot {
  id?: string;
  googleImageId: string;
  url: string;
  viewportX: number;
  viewportY: number;
  viewportHeight: number;
  viewportWidth: number;
  devicePixelRatio: number;
  createdAt?: string;
  stepId?: string;
}

export interface Step {
  id?: string;
  stepDescription: string;
  stepNumber: number;
  type: string;
  createdAt?: string;
  updatedAt?: string;
  documentId: string;
  screenshot: Screenshot | null;
}

export interface CaptureResponse {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  isDeleted: boolean;
  deletedAt: string | null;
  isPublic?: boolean;
  estimatedCompletionTime?: number;
  steps: Step[];
  user: User;
}

export interface EditCaptureRequest {
  title: string;
  description: string;
  steps: (Step | null)[];
  deleteStepIds?: string[];
}

export interface ShareExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  captures?: CaptureResponse;
  documentTitle?: string;
  documentId?: string;
  isOwner?: boolean;
}

export type TabType = "share" | "export";

export interface ShareTabProps {
  documentId?: string;
  isPublic: boolean;
  isUpdatingShareStatus: boolean;
  onToggleShareStatus: () => Promise<void>;
  onCopyLink: () => Promise<void>;
  isOwner: boolean;
}

export interface ExportTabProps {
  captures?: CaptureResponse;
  documentTitle: string;
  isLoadingPDF: boolean;
  onPDFExport: () => Promise<void>;
  onMarkdownExport: () => void;
}
