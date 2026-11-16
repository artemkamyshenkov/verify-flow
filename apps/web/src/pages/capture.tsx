import { Container, Stack, Button, Text } from "@mantine/core";
import { useCamera } from "../features/capture/use-camera";
import { useEffect, useRef, useState } from "react";
import { uploadPhoto } from "../features/capture/api";
import { useNavigate, useParams } from "react-router";
import { useVideoFrame } from "../features/capture/use-video-frame";
import { useFrameAnalysis } from "../features/capture/worker/use-frame-analysis";

const LOW_BRIGHTNESS_THRESHOLD = 50;

export function CapturePage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { error, isLoading, enableCamera, stream, takePhoto, setError } =
    useCamera();

  const { analyzeFrame, frameData } = useFrameAnalysis();

  const { getVideoFrame, getFrameImageData } = useVideoFrame();

  const [imageSrc, setImageSrc] = useState<string>();
  const [blob, setBlob] = useState<Blob>();

  const [uploadStatus, setUploadStatus] = useState<
    "idle" | "uploading" | "success" | "error"
  >("idle");
  const isUploading = uploadStatus === "uploading";
  const videoRef = useRef<HTMLVideoElement>(null);

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
  console.log(frameData);
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
      analyzeFrame(imageData);
    }, 1000);

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
          <div className="camera-frame" aria-hidden="true" />
        </div>
        {stream &&
          !imageSrc &&
          frameData?.averageBrightness &&
          frameData.averageBrightness !== null &&
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
