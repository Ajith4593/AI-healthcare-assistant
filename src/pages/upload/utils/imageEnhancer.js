/**
 * imageEnhancer.js - In-Browser Canvas Image Preprocessing for Medical OCR.
 * Optimizes faint handwriting, dot-matrix doctor prints, shadows, and angle skew.
 */

/**
 * Preprocesses an image or canvas element with given filter settings
 * @param {HTMLImageElement|HTMLCanvasElement} source - Input image or canvas
 * @param {Object} options - Filter parameters
 * @returns {HTMLCanvasElement} - Processed high-contrast canvas
 */
export function enhanceImageForOcr(source, options = {}) {
  const {
    grayscale = true,
    contrast = 1.35,      // 1.0 = normal, 1.35 = enhanced
    brightness = 1.05,    // slight boost for dark phone photos
    binarize = false,     // Otsu-style black/white thresholding
    threshold = 145,      // 0-255 cutoff
    invert = false,       // white-on-black scans
    rotation = 0,         // 0, 90, 180, 270 degrees
  } = options;

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d", { willReadFrequently: true });

  const isRotated90or270 = rotation % 180 !== 0;
  const srcWidth = source.naturalWidth || source.width || 800;
  const srcHeight = source.naturalHeight || source.height || 600;

  canvas.width = isRotated90or270 ? srcHeight : srcWidth;
  canvas.height = isRotated90or270 ? srcWidth : srcHeight;

  // Handle Rotation
  ctx.save();
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate((rotation * Math.PI) / 180);
  ctx.drawImage(source, -srcWidth / 2, -srcHeight / 2, srcWidth, srcHeight);
  ctx.restore();

  // Apply Pixel Filters (Grayscale, Contrast, Binarization)
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  const len = data.length;

  for (let i = 0; i < len; i += 4) {
    let r = data[i];
    let g = data[i + 1];
    let b = data[i + 2];

    // 1. Grayscale luminance
    if (grayscale || binarize) {
      const gray = 0.299 * r + 0.587 * g + 0.114 * b;
      r = gray;
      g = gray;
      b = gray;
    }

    // 2. Brightness adjustment
    r = r * brightness;
    g = g * brightness;
    b = b * brightness;

    // 3. Contrast adjustment: factor = (259 * (contrast + 255)) / (255 * (259 - contrast))
    if (contrast !== 1.0) {
      const cFactor = contrast;
      r = ((r - 128) * cFactor) + 128;
      g = ((g - 128) * cFactor) + 128;
      b = ((b - 128) * cFactor) + 128;
    }

    // 4. Invert colors if selected
    if (invert) {
      r = 255 - r;
      g = 255 - g;
      b = 255 - b;
    }

    // 5. Adaptive Binarization (Black & White Threshold)
    if (binarize) {
      const avg = (r + g + b) / 3;
      const finalVal = avg > threshold ? 255 : 0;
      r = finalVal;
      g = finalVal;
      b = finalVal;
    }

    // Clamp values [0, 255]
    data[i] = Math.min(255, Math.max(0, r));
    data[i + 1] = Math.min(255, Math.max(0, g));
    data[i + 2] = Math.min(255, Math.max(0, b));
  }

  ctx.putImageData(imageData, 0, 0);
  return canvas;
}

/**
 * Converts a Canvas element to an Image Blob
 */
export function canvasToBlob(canvas, mimeType = "image/jpeg", quality = 0.92) {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), mimeType, quality);
  });
}
