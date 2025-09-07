import React, { useRef, useState, useCallback, useEffect } from "react";
import { Check, X } from "lucide-react";
import { Screenshot } from "../document.types";

interface BlurAnnotatorProps {
  stepId: string;
  imageUrl: string;
  onSave: (
    stepId: string,
    dataUrl: string,
    info: Screenshot | null
  ) => Promise<void>;
  onCancel: () => void;
  isOpen: boolean;
  info: Screenshot | null;
}

interface BlurRegion {
  x: number;
  y: number;
  width: number;
  height: number;
}

const BlurAnnotator: React.FC<BlurAnnotatorProps> = ({
  stepId,
  imageUrl,
  onSave,
  onCancel,
  isOpen,
  info,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [blurRegions, setBlurRegions] = useState<BlurRegion[]>([]);
  const [currentRegion, setCurrentRegion] = useState<BlurRegion | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [originalImageData, setOriginalImageData] = useState<ImageData | null>(
    null
  );
  const [imageUploadLoading, setImageUploadLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setBlurRegions([]);
      setCurrentRegion(null);
      setIsDrawing(false);
      setImageLoaded(false);
      setOriginalImageData(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !imageUrl) return;

    const canvas = canvasRef.current;
    const overlayCanvas = overlayCanvasRef.current;
    if (!canvas || !overlayCanvas) return;

    const ctx = canvas.getContext("2d");
    const overlayCtx = overlayCanvas.getContext("2d");
    if (!ctx || !overlayCtx) return;

    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      const { naturalWidth, naturalHeight } = img;

      canvas.width = naturalWidth;
      canvas.height = naturalHeight;
      overlayCanvas.width = naturalWidth;
      overlayCanvas.height = naturalHeight;

      ctx.drawImage(img, 0, 0, naturalWidth, naturalHeight);

      setOriginalImageData(ctx.getImageData(0, 0, naturalWidth, naturalHeight));
      setImageLoaded(true);
    };

    img.src = imageUrl;
  }, [isOpen, imageUrl]);

  const applyBlur = useCallback(
    (imageData: ImageData, region: BlurRegion, blurRadius: number = 8) => {
      const { data, width, height } = imageData;
      const { x, y, width: regionWidth, height: regionHeight } = region;

      const startX = Math.max(0, Math.floor(x));
      const startY = Math.max(0, Math.floor(y));
      const endX = Math.min(width, Math.ceil(x + regionWidth));
      const endY = Math.min(height, Math.ceil(y + regionHeight));

      const regionData = new Uint8ClampedArray(data);

      for (let py = startY; py < endY; py++) {
        for (let px = startX; px < endX; px++) {
          let r = 0,
            g = 0,
            b = 0,
            count = 0;

          for (let dy = -blurRadius; dy <= blurRadius; dy++) {
            for (let dx = -blurRadius; dx <= blurRadius; dx++) {
              const sampleX = px + dx;
              const sampleY = py + dy;

              if (
                sampleX >= 0 &&
                sampleX < width &&
                sampleY >= 0 &&
                sampleY < height
              ) {
                const sampleIndex = (sampleY * width + sampleX) * 4;
                r += regionData[sampleIndex];
                g += regionData[sampleIndex + 1];
                b += regionData[sampleIndex + 2];
                count++;
              }
            }
          }

          const pixelIndex = (py * width + px) * 4;
          data[pixelIndex] = r / count;
          data[pixelIndex + 1] = g / count;
          data[pixelIndex + 2] = b / count;
        }
      }
      return imageData;
    },
    []
  );

  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const overlayCanvas = overlayCanvasRef.current;
    if (!canvas || !overlayCanvas || !originalImageData) return;

    const ctx = canvas.getContext("2d");
    const overlayCtx = overlayCanvas.getContext("2d");
    if (!ctx || !overlayCtx) return;

    // Clear overlay
    overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);

    // Clone original image data
    const workingImageData = new ImageData(
      new Uint8ClampedArray(originalImageData.data),
      originalImageData.width,
      originalImageData.height
    );

    // Apply blur to all regions
    blurRegions.forEach((region) => {
      applyBlur(workingImageData, region);
    });

    // Apply blur to current region if drawing
    if (currentRegion && isDrawing) {
      // Normalize current region for preview
      const normalizedRegion = {
        x: Math.min(currentRegion.x, currentRegion.x + currentRegion.width),
        y: Math.min(currentRegion.y, currentRegion.y + currentRegion.height),
        width: Math.abs(currentRegion.width),
        height: Math.abs(currentRegion.height),
      };
      applyBlur(workingImageData, normalizedRegion);
    }

    ctx.putImageData(workingImageData, 0, 0);

    // Draw overlay rectangles for visual feedback
    overlayCtx.strokeStyle = "#8EACFE";
    overlayCtx.lineWidth = 2;
    overlayCtx.setLineDash([5, 5]);

    // Draw completed regions
    blurRegions.forEach((region) => {
      overlayCtx.strokeRect(region.x, region.y, region.width, region.height);
    });

    // Draw current region being drawn
    if (currentRegion && isDrawing) {
      overlayCtx.strokeRect(
        currentRegion.x,
        currentRegion.y,
        currentRegion.width,
        currentRegion.height
      );
    }
  }, [blurRegions, currentRegion, originalImageData, applyBlur, isDrawing]);

  // Update canvas when regions change
  useEffect(() => {
    if (imageLoaded) {
      renderCanvas();
    }
  }, [imageLoaded, renderCanvas]);

  // Mouse event handlers
  const getMousePos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = overlayCanvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();

    // Calculate the scale factors
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    // Get mouse position relative to canvas and scale to actual canvas coordinates
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    return { x, y };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getMousePos(e);
    setIsDrawing(true);
    setCurrentRegion({
      x: pos.x,
      y: pos.y,
      width: 0,
      height: 0,
    });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !currentRegion) return;

    const pos = getMousePos(e);
    setCurrentRegion({
      ...currentRegion,
      width: pos.x - currentRegion.x,
      height: pos.y - currentRegion.y,
    });
  };

  const handleMouseUp = () => {
    if (!currentRegion || !isDrawing) return;

    // Normalize the region (handle negative width/height)
    const normalizedRegion = {
      x:
        currentRegion.width < 0
          ? currentRegion.x + currentRegion.width
          : currentRegion.x,
      y:
        currentRegion.height < 0
          ? currentRegion.y + currentRegion.height
          : currentRegion.y,
      width: Math.abs(currentRegion.width),
      height: Math.abs(currentRegion.height),
    };

    // Only add region if it has meaningful size
    if (normalizedRegion.width > 10 && normalizedRegion.height > 10) {
      setBlurRegions((prev) => [...prev, normalizedRegion]);
    }

    setCurrentRegion(null);
    setIsDrawing(false);
  };

  const handleSaveAsDataURL = async () => {
    setImageUploadLoading(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataURL = canvas.toDataURL("image/png");

    try {
      await onSave?.(stepId, dataURL, info);
      setImageUploadLoading(false);
      onCancel();
    } catch (error) {
      console.error("Error saving blurred image:", error);
    }
  };

  const handleUndo = () => {
    setBlurRegions((prev) => prev.slice(0, -1));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-4xl max-h-[90vh] overflow-auto">
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">
            Blur Sensitive Information
          </h3>
          <p className="text-sm text-gray-600">
            Click and drag to select areas you want to blur. The changes will be
            permanent once saved.
          </p>
        </div>

        <div className="relative mb-4 inline-block">
          <canvas
            ref={canvasRef}
            className="border border-gray-300 rounded block"
            style={{
              maxWidth: "100%",
              height: "auto",
              display: "block",
            }}
          />
          <canvas
            ref={overlayCanvasRef}
            className="absolute top-0 left-0 cursor-crosshair border border-gray-300 rounded"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={() => {
              if (isDrawing) {
                handleMouseUp();
              }
            }}
            style={{
              maxWidth: "100%",
              height: "auto",
              display: "block",
            }}
          />
        </div>

        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            <button
              onClick={handleUndo}
              disabled={blurRegions.length === 0}
              className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Undo Last
            </button>
            <span className="text-sm text-gray-500 self-center">
              {blurRegions.length} region(s) selected
            </span>
          </div>

          <div className="flex gap-2">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <X className="w-4 h-4 inline mr-1" />
              Cancel
            </button>
            <button
              onClick={handleSaveAsDataURL}
              disabled={blurRegions.length === 0}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Check className="w-4 h-4 inline mr-1" />
              {imageUploadLoading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlurAnnotator;
