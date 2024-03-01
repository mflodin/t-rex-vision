export function measurePathWidth(path, { width, height }) {
  // Create an offscreen canvas
  const canvas = new OffscreenCanvas(width, height);
  const ctx = canvas.getContext("2d");

  // Draw the path onto the canvas
  ctx.stroke(path);

  // Get the image data from the entire canvas
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  // Variables to hold the min and max x-coordinates
  let minX = canvas.width;
  let maxX = 0;

  // Iterate over every pixel to find the min and max x-coordinates
  for (let x = 0; x < canvas.width; x++) {
    for (let y = 0; y < canvas.height; y++) {
      const alpha = data[(y * canvas.width + x) * 4 + 3]; // Get the alpha value to check if the pixel is drawn
      if (alpha > 0) {
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
      }
    }
  }

  // Calculate the width based on the min and max x-coordinates
  return maxX - minX;
}
