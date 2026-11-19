import { useEffect, useRef, useState } from "react";
import type { DocumentCorner } from "./find-document-corners";

type FrameData = {
  averageBrightness: number;
  sharpness: number;
  corners: DocumentCorner[] | null;
};
export function useFrameAnalysis() {
  const [frameData, setFrameData] = useState<FrameData | null>(null);

  const worker = useRef<Worker | null>(null);

  useEffect(() => {
    if (worker.current) {
      return;
    }

    const newWorker = new Worker(
      new URL("./frame-analysis-worker.ts", import.meta.url),
      {
        type: "module",
      },
    );

    worker.current = newWorker;

    newWorker.onmessage = (event: MessageEvent<FrameData>) => {
      setFrameData(event.data);
    };

    return () => {
      newWorker.terminate();
      worker.current = null;
    };
  }, []);

  const analyzeFrame = (imageData: ImageData) => {
    worker.current?.postMessage(imageData);
  };

  return { analyzeFrame, frameData };
}
