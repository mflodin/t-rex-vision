export function getContentBoundingRect(canvas) {
  const ctx = canvas.getContext("2d");

  // Get the image data from the entire canvas
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  // Variables to hold the min and max coordinates
  let minX = canvas.width;
  let maxX = 0;
  let minY = canvas.height;
  let maxY = 0;

  // let t0 = Date.now();
  // Iterate over every pixel to find the min and max coordinates
  for (let x = 0; x < canvas.width; x++) {
    for (let y = 0; y < canvas.height; y++) {
      const alpha = data[(y * canvas.width + x) * 4 + 3]; // Get the alpha value to check if the pixel is drawn
      if (alpha > 0) {
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
      }
    }
  }

  // console.log(Date.now() - t0);

  // Calculate the width based on the min and max x-coordinates
  return {
    height: maxY - minY,
    width: maxX - minX,
    x: minX,
    y: minY,
  };
}
