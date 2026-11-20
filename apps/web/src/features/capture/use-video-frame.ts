import { useRef } from "react";

export function useVideoFrame() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const getVideoFrame = (video: HTMLVideoElement) => {
    const { videoHeight, videoWidth } = video;
    if (
      !videoHeight ||
      !videoWidth ||
      video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA
    ) {
      throw new Error("Видео не готово");
    }

    if (canvasRef.current === null) {
      canvasRef.current = document.createElement("canvas");
    }

    const canvas = canvasRef.current;
    const width = 320;
    const height = Math.round(width * (videoHeight / videoWidth));

    if (canvas.width !== width) canvas.width = width;
    if (canvas.height !== height) canvas.height = height;

    const context = canvas.getContext("2d");

    if (!context) {
      throw new Error("Не удалось сделать фото");
    }

    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    return canvas;
  };

  const getFrameImageData = (canvas: HTMLCanvasElement) => {
    const context = canvas.getContext("2d");

    if (!context) {
      throw new Error("Не удалось получить контекст canvas");
    }

    const x = canvas.width * 0.1;
    const y = canvas.height * 0.2;

    const width = canvas.width * 0.8; // 100% − 10% − 10%
    const height = canvas.height * 0.6; // 100% − 20% − 20%

    const imageData = context.getImageData(x, y, width, height);

    return imageData;
  };

  return { getVideoFrame, getFrameImageData };
}
