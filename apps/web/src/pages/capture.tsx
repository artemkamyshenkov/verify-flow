import { Container, Stack, Button, Text } from "@mantine/core";
import { useCamera } from "../features/capture/use-camera";
import { useEffect, useRef, useState } from "react";
import { uploadPhoto } from "../features/capture/api";
import { useNavigate, useParams } from "react-router";
import { CameraPreview } from "../features/capture/camera-preview";

export function CapturePage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { error, isLoading, enableCamera, stream, takePhoto, setError } =
    useCamera();

  const [imageSrc, setImageSrc] = useState<string>();
  const [blob, setBlob] = useState<Blob>();

  const [uploadStatus, setUploadStatus] = useState<
    "idle" | "uploading" | "success" | "error"
  >("idle");
  const isUploading = uploadStatus === "uploading";
  const videoRef = useRef<HTMLVideoElement>(null);
  const isTakingPhoto = useRef(false);

  const handleTakePhoto = async () => {
    const video = videoRef.current;
    if (!video || imageSrc || isTakingPhoto.current) return;

    isTakingPhoto.current = true;
    try {
      const blob = await takePhoto(video);
      const src = URL.createObjectURL(blob);

      setBlob(blob);
      setImageSrc(src);
      setUploadStatus("idle");
    } catch (error) {
      setError((error as Error).message);
    } finally {
      isTakingPhoto.current = false;
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
    return () => {
      if (imageSrc) {
        URL.revokeObjectURL(imageSrc);
      }
    };
  }, [imageSrc]);

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
        <CameraPreview
          stream={stream}
          videoRef={videoRef}
          hidden={Boolean(imageSrc)}
          onAutoCapture={handleTakePhoto}
        />
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
