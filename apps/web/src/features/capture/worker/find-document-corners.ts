import type cvModule from "@techstark/opencv-js";

const CANNY_LOW_THRESHOLD = 20;
const CANNY_HIGH_THRESHOLD = 60;

export type DocumentCorner = { x: number; y: number };

export function findDocumentCorners(
  cv: typeof cvModule,
  imageData: ImageData,
): DocumentCorner[] | null {
  const source = cv.matFromImageData(imageData);
  const gray = new cv.Mat();
  const edges = new cv.Mat();
  const contours = new cv.MatVector();
  const hierarchy = new cv.Mat();
  const polygon = new cv.Mat();

  let bestArea = imageData.width * imageData.height * 0.15;
  let bestCorners: DocumentCorner[] | null = null;

  try {
    cv.cvtColor(source, gray, cv.COLOR_RGBA2GRAY);
    cv.Canny(gray, edges, CANNY_LOW_THRESHOLD, CANNY_HIGH_THRESHOLD);
    for (const pass of ["edges", "brightness", "hue"] as const) {
      // A soft edge can disappear in Canny while the silhouette is still visible.
      if (pass === "brightness") {
        cv.threshold(gray, edges, 0, 255, cv.THRESH_BINARY | cv.THRESH_OTSU);
      }
      if (pass === "hue") {
        // Colored cards can blend into the background after conversion to grayscale.
        cv.cvtColor(source, source, cv.COLOR_RGBA2RGB);
        cv.cvtColor(source, source, cv.COLOR_RGB2HSV);
        const channels = new cv.MatVector();
        try {
          cv.split(source, channels);
          const hue = channels.get(0);
          try {
            cv.adaptiveThreshold(
              hue, edges, 255, cv.ADAPTIVE_THRESH_GAUSSIAN_C, cv.THRESH_BINARY, 25, 2,
            );
          } finally {
            hue.delete();
          }
        } finally {
          channels.delete();
        }
      }

      cv.findContours(
        edges,
        contours,
        hierarchy,
        cv.RETR_LIST,
        cv.CHAIN_APPROX_SIMPLE,
      );

      for (let i = 0; i < contours.size(); i++) {
        const contour = contours.get(i);
        try {
          const perimeter = cv.arcLength(contour, true);
          cv.approxPolyDP(contour, polygon, perimeter * 0.02, true);

          if (polygon.rows !== 4 || !cv.isContourConvex(polygon)) continue;

          const area = cv.contourArea(polygon);
          if (area <= bestArea) continue;

          const { x, y, width, height } = cv.boundingRect(polygon);
          if (
            x <= 0 ||
            y <= 0 ||
            x + width >= imageData.width ||
            y + height >= imageData.height
          ) continue;

          const points = polygon.data32S;
          bestCorners = Array.from({ length: 4 }, (_, index) => ({
            x: points[index * 2] / imageData.width,
            y: points[index * 2 + 1] / imageData.height,
          }));
          bestArea = area;
        } finally {
          contour.delete();
        }
      }

      if (bestCorners) return bestCorners;
    }

    return null;
  } finally {
    polygon.delete();
    hierarchy.delete();
    contours.delete();
    edges.delete();
    gray.delete();
    source.delete();
  }
}
