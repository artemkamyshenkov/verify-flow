import { Container, Stack, Button, Text } from "@mantine/core";
import { useCamera } from "../features/capture/use-camera";
import { useEffect, useRef, useState } from "react";
import { uploadPhoto } from "../features/capture/api";
import { useNavigate, useParams } from "react-router";
import { useVideoFrame } from "../features/capture/use-video-frame";
import { useFrameAnalysis } from "../features/capture/worker/use-frame-analysis";

const LOW_BRIGHTNESS_THRESHOLD = 50;
const MIN_SHARPNESS = 4;

export function CapturePage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { error, isLoading, enableCamera, stream, takePhoto, setError } =
    useCamera();

  const { analyzeFrame, frameData } = useFrameAnalysis();
  const isFrameReady =
    frameData !== null &&
    frameData.averageBrightness >= LOW_BRIGHTNESS_THRESHOLD &&
    frameData.sharpness >= MIN_SHARPNESS;
  const frameStatus = isFrameReady ? "ready" : "not-ready";

  const { getVideoFrame, getFrameImageData } = useVideoFrame();
  console.log(frameData);
  const [imageSrc, setImageSrc] = useState<string>();
  const [blob, setBlob] = useState<Blob>();

  const [uploadStatus, setUploadStatus] = useState<
    "idle" | "uploading" | "success" | "error"
  >("idle");
  const isUploading = uploadStatus === "uploading";
  const videoRef = useRef<HTMLVideoElement>(null);
  const debugFrameRef = useRef<HTMLCanvasElement>(null);
  const showDebugFrame = new URLSearchParams(window.location.search).has(
    "debugContours",
  );

  const handleTakePhoto = async () => {
    try {
      if (!videoRef.current) return;
      const blob = await takePhoto(videoRef.current);
      const src = URL.createObjectURL(blob);

      setBlob(blob);
      setImageSrc(src);
      setUploadStatus("idle");
    } catch (error) {
      setError((error as Error).message);
    }
  };

  const handleRetakePhoto = () => {
    setError(undefined);
    setImageSrc(undefined);
    setBlob(undefined);
    setUploadStatus("idle");
  };

  const handleSendPhoto = async () => {
    if (!blob || !sessionId || isUploading || uploadStatus === "success")
      return;

    setError(undefined);
    setUploadStatus("uploading");

    const result = await uploadPhoto(blob, sessionId);

    if (result.ok) {
      setUploadStatus("success");
      navigate(`/sessions/${sessionId}/complete`, { replace: true });
    } else {
      setUploadStatus("error");
      setError(result.error);
    }
  };

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  useEffect(() => {
    return () => {
      if (imageSrc) {
        URL.revokeObjectURL(imageSrc);
      }
    };
  }, [imageSrc]);

  useEffect(() => {
    if (!stream || imageSrc) {
      return;
    }

    const intervalId = setInterval(() => {
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
  }, [stream, imageSrc]);

  return (
    <Container size="sm" py="xl">
      <Stack align="center" gap="sm" mt="sm">
        {!stream && (
          <Button
            size="md"
            radius="md"
            loading={isLoading}
            onClick={enableCamera}
          >
            Подключить камеру
          </Button>
        )}
        <div className="camera" hidden={!stream || Boolean(imageSrc)}>
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
          {!imageSrc && frameData?.corners && (
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
        {showDebugFrame && stream && !imageSrc && (
          <figure style={{ margin: 0, maxWidth: "100%" }}>
            <figcaption>Кадр, который получает Worker</figcaption>
            <canvas className="capture-media" ref={debugFrameRef} />
          </figure>
        )}
        {stream &&
          !imageSrc &&
          frameData !== null &&
          frameData.averageBrightness < LOW_BRIGHTNESS_THRESHOLD && (
            <Text c="orange" size="sm" ta="center" role="status">
              Слишком темно. Добавьте света.
            </Text>
          )}
        {!!stream && !imageSrc && (
          <Button size="md" radius="md" onClick={handleTakePhoto}>
            Сделать фото
          </Button>
        )}

        {imageSrc && (
          <img
            className="capture-media"
            src={imageSrc}
            alt="Предпросмотр снимка документа"
          />
        )}
        {imageSrc && (
          <Button
            size="md"
            radius="md"
            onClick={handleRetakePhoto}
            disabled={isUploading}
          >
            Переснять
          </Button>
        )}
        {imageSrc && blob && uploadStatus !== "success" && (
          <Button
            size="md"
            radius="md"
            onClick={handleSendPhoto}
            loading={isUploading}
          >
            Отправить фото
          </Button>
        )}
        {error && (
          <Text role="alert" size="sm" c="red" ta="center">
            {error}
          </Text>
        )}
      </Stack>
    </Container>
  );
}
