export function useVideoFrame() {
  const getVideoFrame = (video: HTMLVideoElement) => {
    const { videoHeight, videoWidth } = video;
    if (
      !videoHeight ||
      !videoWidth ||
      video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA
    ) {
      throw new Error("Видео не готово");
    }

    const canvas = document.createElement("canvas");

    canvas.width = 320;
    canvas.height = Math.round(320 * (videoHeight / videoWidth));

    const context = canvas.getContext("2d");

    if (!context) {
      throw new Error("Не удалось сделать фото");
    }

    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    return canvas;
  };

  const analyzeFrame = (canvas: HTMLCanvasElement) => {
    const context = canvas.getContext("2d");

    if (!context) {
      throw new Error("Не удалось получить контекст canvas");
    }

    const x = canvas.width * 0.1;
    const y = canvas.height * 0.2;

    const width = canvas.width * 0.8; // 100% − 10% − 10%
    const height = canvas.height * 0.6; // 100% − 20% − 20%

    const imageData = context.getImageData(x, y, width, height);

    let brightnessSum = 0;
    for (let i = 0; i < imageData.data.length; i += 4) {
      const data = imageData.data;
      const red = data[i];
      const green = data[i + 1];
      const blue = data[i + 2];

      const brightness = (red + green + blue) / 3;
      brightnessSum += brightness;
    }

    const pixelsCount = imageData.data.length / 4;
    const averageBrightness = Math.round(brightnessSum / pixelsCount);

    return averageBrightness;
  };

  return { getVideoFrame, analyzeFrame };
}
