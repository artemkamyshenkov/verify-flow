import { useEffect, useRef, useState } from "react";

export function useCamera() {
  const [error, setError] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const isMountedRef = useRef(false);

  const enableCamera = async () => {
    setError(undefined);
    try {
      setIsLoading(true);
      const videoStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: "environment" },
        },
        audio: false,
      });

      if (!isMountedRef.current) {
        videoStream.getTracks().forEach((track) => track.stop());
        return;
      }

      setStream(videoStream);
    } catch {
      if (isMountedRef.current) {
        setError("Ошибка доступа к камере");
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  };

  const takePhoto = async (video: HTMLVideoElement): Promise<Blob> => {
    setError(undefined);
    const { videoHeight, videoWidth } = video;
    if (!videoHeight || !videoWidth) {
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
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
      stream?.getTracks().forEach((track) => track.stop());
    };
  }, [stream]);

  return { error, isLoading, enableCamera, stream, takePhoto, setError };
}
