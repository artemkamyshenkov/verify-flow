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
  const busyRef = useRef(false);

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
      busyRef.current = false;
      setFrameData(event.data);
    };

    newWorker.onerror = () => {
      busyRef.current = false;
    };

    return () => {
      newWorker.terminate();
      worker.current = null;
      busyRef.current = false;
    };
  }, []);

  const analyzeFrame = (imageData: ImageData) => {
    const currentWorker = worker.current;

    if (!currentWorker || busyRef.current) return;

    busyRef.current = true;
    try {
      currentWorker.postMessage(imageData);
    } catch (error) {
      busyRef.current = false;
      throw error;
    }
  };

  const isWorkerBusy = () => busyRef.current;

  return { analyzeFrame, frameData, isWorkerBusy };
}
