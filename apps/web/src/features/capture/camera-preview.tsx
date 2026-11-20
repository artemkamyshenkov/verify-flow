import { Text } from "@mantine/core";
import { type RefObject, useEffect, useEffectEvent, useRef } from "react";
import { useVideoFrame } from "./use-video-frame";
import { useFrameAnalysis } from "./worker/use-frame-analysis";

const LOW_BRIGHTNESS_THRESHOLD = 50;
const MIN_SHARPNESS = 4;
const REQUIRED_READY_FRAMES = 3;

type CameraPreviewProps = {
  stream: MediaStream | null;
  videoRef: RefObject<HTMLVideoElement | null>;
  hidden: boolean;
  onAutoCapture: () => void;
};

export function CameraPreview({
  stream,
  videoRef,
  hidden,
  onAutoCapture,
}: CameraPreviewProps) {
  const { analyzeFrame, frameData, isWorkerBusy } = useFrameAnalysis();
  const isFrameReady =
    frameData !== null &&
    frameData.corners?.length === 4 &&
    frameData.averageBrightness >= LOW_BRIGHTNESS_THRESHOLD &&
    frameData.sharpness >= MIN_SHARPNESS;
  const frameStatus = isFrameReady ? "ready" : "not-ready";
  const readyFrameCount = useRef(0);
  const lastAnalyzedFrame = useRef(frameData);
  const autoCapture = useEffectEvent(onAutoCapture);

  const { getVideoFrame, getFrameImageData } = useVideoFrame();
  const debugFrameRef = useRef<HTMLCanvasElement>(null);
  const showDebugFrame = new URLSearchParams(window.location.search).has(
    "debugContours",
  );

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream, videoRef]);

  useEffect(() => {
    const isNewFrame = lastAnalyzedFrame.current !== frameData;
    lastAnalyzedFrame.current = frameData;

    if (!stream || hidden || !isFrameReady) {
      readyFrameCount.current = 0;
      return;
    }

    if (!isNewFrame) return;

    readyFrameCount.current++;
    if (readyFrameCount.current === REQUIRED_READY_FRAMES) {
      autoCapture();
    }
  }, [stream, hidden, frameData, isFrameReady]);

  useEffect(() => {
    if (!stream || hidden) {
      return;
    }

    const intervalId = setInterval(() => {
      if (isWorkerBusy()) return;

      const video = videoRef.current;
      if (
        !video ||
        !video.videoWidth ||
        !video.videoHeight ||
        video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA
      )
        return;

      const frame = getVideoFrame(video);
      const imageData = getFrameImageData(frame);
      const debugFrame = debugFrameRef.current;
      if (debugFrame) {
        if (debugFrame.width !== imageData.width)
          debugFrame.width = imageData.width;
        if (debugFrame.height !== imageData.height)
          debugFrame.height = imageData.height;
        debugFrame.getContext("2d")?.putImageData(imageData, 0, 0);
      }
      analyzeFrame(imageData);
    }, 250);

    return () => {
      clearInterval(intervalId);
    };
  }, [stream, hidden, videoRef]);

  return (
    <>
      <div className="camera" hidden={!stream || hidden}>
        <video
          className="capture-media"
          ref={videoRef}
          autoPlay
          playsInline
          muted
        />
        <div
          className="camera-frame"
          data-status={frameData === null ? undefined : frameStatus}
          aria-hidden="true"
        />
        {!hidden && frameData?.corners && (
          <svg
            className="camera-detected-contour"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <polygon
              points={frameData.corners
                .map(({ x, y }) => `${x * 100},${y * 100}`)
                .join(" ")}
              vectorEffect="non-scaling-stroke"
            />
          </svg>
        )}
      </div>
      {showDebugFrame && stream && !hidden && (
        <figure style={{ margin: 0, maxWidth: "100%" }}>
          <figcaption>Кадр, который получает Worker</figcaption>
          <canvas className="capture-media" ref={debugFrameRef} />
        </figure>
      )}
      {stream &&
        !hidden &&
        frameData !== null &&
        frameData.averageBrightness < LOW_BRIGHTNESS_THRESHOLD && (
          <Text c="orange" size="sm" ta="center" role="status">
            Слишком темно. Добавьте света.
          </Text>
        )}
    </>
  );
}
