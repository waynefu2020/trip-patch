export interface SubjectPosition {
  horizontal: string;
  vertical: string;
}

const HORIZONTAL_OFFSET: Record<string, number> = {
  "far-left": -0.5,
  left: -0.3,
  "center-left": -0.15,
  center: 0,
  "center-right": 0.15,
  right: 0.3,
  "far-right": 0.5,
};

const VERTICAL_OFFSET: Record<string, number> = {
  top: -0.4,
  upper: -0.2,
  center: 0,
  lower: 0.2,
  bottom: 0.4,
};

const TARGET_RATIO = 4 / 5; // 0.8, matching the poster aspect ratio

/**
 * Smart crop an image to 4:5 aspect ratio, shifting the crop box
 * so the subject moves toward the center of the frame.
 */
export async function smartCrop(
  file: File,
  subjectPosition: SubjectPosition
): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      const origW = img.naturalWidth;
      const origH = img.naturalHeight;
      const origRatio = origW / origH;

      let cropW: number;
      let cropH: number;

      if (origRatio > TARGET_RATIO) {
        // Image is wider than target, crop width
        cropH = origH;
        cropW = origH * TARGET_RATIO;
      } else {
        // Image is taller or equal, crop height
        cropW = origW;
        cropH = origW / TARGET_RATIO;
      }

      // Center crop as baseline
      let startX = (origW - cropW) / 2;
      let startY = (origH - cropH) / 2;

      // Apply subject position offset
      const hOffset = HORIZONTAL_OFFSET[subjectPosition.horizontal] ?? 0;
      const vOffset = VERTICAL_OFFSET[subjectPosition.vertical] ?? 0;

      const maxOffsetX = origW - cropW;
      const maxOffsetY = origH - cropH;

      startX += hOffset * maxOffsetX;
      startY += vOffset * maxOffsetY;

      // Clamp to image bounds
      startX = Math.max(0, Math.min(startX, maxOffsetX));
      startY = Math.max(0, Math.min(startY, maxOffsetY));

      const canvas = document.createElement("canvas");
      canvas.width = Math.round(cropW);
      canvas.height = Math.round(cropH);
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Canvas context not available"));
        return;
      }

      ctx.drawImage(img, startX, startY, cropW, cropH, 0, 0, cropW, cropH);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("Canvas toBlob failed"));
            return;
          }
          const croppedFile = new File([blob], file.name, {
            type: "image/jpeg",
            lastModified: Date.now(),
          });
          resolve(croppedFile);
        },
        "image/jpeg",
        0.92
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Image load failed"));
    };

    img.src = url;
  });
}
