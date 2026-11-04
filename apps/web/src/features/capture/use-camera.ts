import { useEffect, useState } from "react";

export function useCamera() {
  const [error, setError] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const enableCamera = async () => {
    try {
      setIsLoading(true);
      const videoStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: "environment" },
        },
        audio: false,
      });
      setStream(videoStream);
    } catch {
      setError("Ошибка доступа к камере");
    } finally {
      setIsLoading(false);
    }
  };

  const takePhoto = async (video: HTMLVideoElement): Promise<Blob> => {
    const { videoHeight, videoWidth } = video;
    if (!videoHeight || !videoHeight) {
      setError("Видео не готово");
    }

    const canvas = document.createElement("canvas");
    canvas.width = videoWidth;
    canvas.height = videoHeight;

    const context = canvas.getContext("2d");

    if (!context) {
      setError("Не удалось сделать фото");
    }

    context?.drawImage(video, 0, 0);

    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          }
          const message = "Не удалось сделать фото";

          reject(new Error(message));
        },
        "image/jpeg",
        0.9,
      );
    });
  };

  useEffect(() => {
    return stream?.getTracks().forEach((track) => track.stop());
  }, []);

  return { error, isLoading, enableCamera, stream, takePhoto, setError };
}
