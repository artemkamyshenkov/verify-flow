import { useEffect, useRef, useState } from "react";

type FrameData = {
  averageBrightness: number;
  sharpness: number;
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
      const { averageBrightness, sharpness } = event.data;
      setFrameData({
        averageBrightness,
        sharpness,
      });
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
