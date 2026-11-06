import { Container, Stack, Button, Text } from "@mantine/core";
import { useCamera } from "../features/capture/use-camera";
import { useEffect, useRef, useState } from "react";
import { uploadPhoto } from "../features/capture/api";
import { useParams } from "react-router";

export function CapturePage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const { error, isLoading, enableCamera, stream, takePhoto, setError } =
    useCamera();

  const [imageSrc, setImageSrc] = useState<string>();
  const [blob, setBlob] = useState<Blob>();
  const [isUploading, setIsUploading] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleTakePhoto = async () => {
    try {
      if (!videoRef.current) return;
      const blob = await takePhoto(videoRef.current);
      const src = URL.createObjectURL(blob);

      setBlob(blob);
      setImageSrc(src);
    } catch (error) {
      setError((error as Error).message);
    }
  };

  const handleRetakePhoto = () => {
    setError(undefined);
    setImageSrc(undefined);
  };

  const handleSendPhoto = async () => {
    if (!blob || !sessionId || isUploading) return;

    setError(undefined);
    setIsUploading(true);

    try {
      const result = await uploadPhoto(blob, sessionId);

      if (result.ok) {
        console.log("UPLOADED");
      } else {
        setError("Upload photo error");
      }
    } finally {
      setIsUploading(false);
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
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          hidden={Boolean(imageSrc)}
        />
        {!!stream && !imageSrc && (
          <Button size="md" radius="md" onClick={handleTakePhoto}>
            Сделать фото
          </Button>
        )}

        {imageSrc && <img src={imageSrc} />}
        {imageSrc && (
          <Button size="md" radius="md" onClick={handleRetakePhoto} disabled={isUploading}>
            Переснять
          </Button>
        )}
        {imageSrc && blob && (
          <Button size="md" radius="md" onClick={handleSendPhoto} loading={isUploading}>
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
