import React from "react";
import Image from "next/image";
import { Download } from "lucide-react";
// Update the path below to the correct location of document.types
import { ExportTabProps } from "../../document.types";
import { pdf_icon, markdown_icon } from "@/public/constants/images";

const ExportTab: React.FC<ExportTabProps> = ({
  isLoadingPDF,
  onPDFExport,
  onMarkdownExport,
}) => {
  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-600 mb-4">
        You can export your stepture with following formats.
      </p>

      {/* PDF Export */}
      <button
        onClick={onPDFExport}
        disabled={isLoadingPDF}
        className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 group disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 flex items-center justify-center bg-red-50 rounded-lg">
            <Image src={pdf_icon} alt="PDF" width={16} height={16} />
          </div>
          <span className="font-medium text-gray-900 text-sm">
            {isLoadingPDF ? "Preparing PDF..." : "Export to PDF"}
          </span>
        </div>
        <Download className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
      </button>

      {/* Markdown Export */}
      <button
        onClick={onMarkdownExport}
        className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 group"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 flex items-center justify-center bg-blue-50 rounded-lg">
            <Image src={markdown_icon} alt="Markdown" width={16} height={16} />
          </div>
          <span className="font-medium text-gray-900 text-sm">
            Export to Markdown
          </span>
        </div>
        <Download className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
      </button>
    </div>
  );
};

export default ExportTab;
