const calculateBrightness = (imageData: ImageData) => {
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

const calculateSharpness = (imageData: ImageData) => {
  const { data, width, height } = imageData;
  let differenceSum = 0;
  let comparisonCount = 0;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width - 1; x++) {
      const index = (y * width + x) * 4;
      const rightIndex = index + 4;

      const brightness = (data[index] + data[index + 1] + data[index + 2]) / 3;
      const rightBrightness =
        (data[rightIndex] + data[rightIndex + 1] + data[rightIndex + 2]) / 3;

      differenceSum += Math.abs(brightness - rightBrightness);
      comparisonCount++;
    }
  }

  return comparisonCount === 0 ? 0 : differenceSum / comparisonCount;
};

self.onmessage = (event: MessageEvent<ImageData>) => {
  const imageData = event.data;

  const averageBrightness = calculateBrightness(imageData);
  const sharpness = calculateSharpness(imageData);

  self.postMessage({ averageBrightness, sharpness });
};
