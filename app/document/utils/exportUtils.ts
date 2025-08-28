import { CaptureResponse } from "../document.types";
import { showToast } from "@/components/ui/Common/ShowToast";

export const useImagePreloader = () => {
  const preloadAllImages = (captures?: CaptureResponse): Promise<void[]> => {
    if (!captures?.steps) return Promise.resolve([]);

    const imageUrls = captures.steps
      .map((step) => step.screenshot?.url)
      .filter(Boolean) as string[];

    const preloadPromises = imageUrls.map((url) => {
      return new Promise<void>((resolve) => {
        const img = new window.Image();
        img.onload = () => resolve();
        img.onerror = () => {
          console.warn(`Failed to preload image: ${url}`);
          resolve(); // Don't reject, just warn and continue
        };
        img.src = url;
      });
    });

    return Promise.all(preloadPromises);
  };

  const forceLoadNextImages = async (): Promise<void> => {
    const element = document.querySelector(
      '[data-print-target="screenshot-viewer"]'
    );
    if (!element) return;

    const images = element.querySelectorAll("img");
    const loadPromises: Promise<void>[] = [];

    images.forEach((img) => {
      if (img.loading === "lazy") {
        img.loading = "eager";

        if (!img.complete) {
          loadPromises.push(
            new Promise<void>((resolve) => {
              img.onload = () => resolve();
              img.onerror = () => resolve();
              img.scrollIntoView({ behavior: "instant", block: "nearest" });
            })
          );
        }
      }
    });

    await Promise.all(loadPromises);
  };

  return {
    preloadAllImages,
    forceLoadNextImages,
  };
};

export const usePDFExporter = () => {
  const { preloadAllImages, forceLoadNextImages } = useImagePreloader();

  const handlePDFExport = async (
    captures: CaptureResponse | undefined,
    documentTitle: string,
    setIsLoadingPDF: (loading: boolean) => void
  ) => {
    setIsLoadingPDF(true);

    try {
      showToast("info", "Preparing document for print...");

      await preloadAllImages(captures);
      await forceLoadNextImages();
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const printWindow = window.open("", "_blank");
      if (!printWindow) {
        showToast("error", "Please allow popups to use the print feature");
        return;
      }

      const element = document.querySelector(
        '[data-print-target="screenshot-viewer"]'
      );
      if (!element) {
        showToast(
          "error",
          "Content not found for printing. Make sure the document is loaded."
        );
        return;
      }

      const content = element.innerHTML;
      const styles = Array.from(document.styleSheets)
        .map((styleSheet) => {
          try {
            return Array.from(styleSheet.cssRules)
              .map((rule) => rule.cssText)
              .join("");
          } catch (e) {
            console.log("Cannot access stylesheet", e);
            return "";
          }
        })
        .join("");

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Print ${documentTitle}</title>
            <style>
              ${styles}
              @media print {
                body { margin: 0; padding: 20px; }
                .edit-only, .sticky { display: none !important; }
                img { 
                  max-width: 100% !important; 
                  height: auto !important; 
                  page-break-inside: avoid; 
                  display: block !important;
                  opacity: 1 !important;
                  visibility: visible !important;
                }
                .screenshot-item { page-break-inside: avoid; margin-bottom: 20px; }
                [loading="lazy"] { loading: eager !important; }
              }
              img[data-nimg] {
                position: static !important;
                visibility: visible !important;
                opacity: 1 !important;
              }
            </style>
          </head>
          <body>
            ${content}
          </body>
        </html>
      `);

      printWindow.document.close();

      setTimeout(() => {
        const printImages = printWindow.document.querySelectorAll("img");
        let loadedCount = 0;
        const totalImages = printImages.length;

        if (totalImages === 0) {
          printWindow.print();
          printWindow.close();
          showToast("success", "Document sent to printer!");
          return;
        }

        const checkAllLoaded = () => {
          if (loadedCount >= totalImages) {
            printWindow.print();
            printWindow.close();
            showToast("success", "Document sent to printer!");
          }
        };

        printImages.forEach((img) => {
          if (img.complete) {
            loadedCount++;
          } else {
            img.onload = () => {
              loadedCount++;
              checkAllLoaded();
            };
            img.onerror = () => {
              loadedCount++;
              checkAllLoaded();
            };
          }
        });

        checkAllLoaded();

        setTimeout(() => {
          if (loadedCount < totalImages) {
            console.warn(
              `Only ${loadedCount}/${totalImages} images loaded, proceeding anyway`
            );
            printWindow.print();
            printWindow.close();
            showToast("warning", "Some images may not have loaded completely");
          }
        }, 10000);
      }, 2000);
    } catch (error) {
      console.error("Error preparing PDF:", error);
      showToast("error", "Failed to prepare document for printing");
    } finally {
      setIsLoadingPDF(false);
    }
  };

  return { handlePDFExport };
};
