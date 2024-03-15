import MersenneTwister from "./mersenne-twister.js";
import { getContentBoundingRect } from "./path-width.js";

// window.addEventListener("load", () => {
let shouldAnimate = true;
let overlayMovesWithText = true;
let coloredNoise = false;
let tick = 0;

const text = "It's vision is based on movement";
const fontSize = 350;
const fontFamily = "sans-serif";
const font = `${fontSize}px ${fontFamily}`;

const canvasScale = 1;

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// this gets the width and height "from the css" where we have set both to 100%
const { height, width } = canvas.getBoundingClientRect();

const canvasHeight = Math.floor(height * canvasScale);
const canvasWidth = Math.floor(width * canvasScale);

// this then applies that size to the image data as well so we get 1px per px
canvas.width = canvasWidth;
canvas.height = canvasHeight;

// console.log({ canvasWidth, canvasHeight });

const measuringCanvas = new OffscreenCanvas(fontSize * text.length, fontSize);
const measuringCtx = measuringCanvas.getContext("2d");

measuringCtx.font = font;
measuringCtx.textBaseline = "top";
measuringCtx.fillText(text, 0, 0);

ctx.font = font;
ctx.textBaseline = "top";

const {
  height: contentHeight,
  width: contentWidth,
  x: contentX,
  y: contentY,
} = getContentBoundingRect(measuringCanvas);

console.log({ contentHeight, contentWidth, contentX, contentY });

const backgroundCanvas = new OffscreenCanvas(canvasWidth, canvasHeight);
const backgroundCtx = backgroundCanvas.getContext("2d", { alpha: false });

// Couldn't get the static noise to line up perfectly with the text,
// so this is a bit of a cheat padding it with 1px
const overlayCanvas = new OffscreenCanvas(
  Math.ceil(contentWidth) + 1,
  Math.ceil(contentHeight) + 1
);
const overlayCtx = overlayCanvas.getContext("2d", {
  alpha: false,
});

noise(backgroundCtx, 1337);
noise(overlayCtx, 4711);

// ctx.drawImage(backgroundCanvas, -100, -100);

// DEBUGGING TEXT STUFF
// ctx.globalCompositeOperation = "source-over";

// const off = 0;

// // ctx.fillStyle = "red";
// // ctx.fillRect(
// //   contentX + off,
// //   canvasHeight / 2 + contentY,
// //   contentWidth,
// //   contentHeight
// // );

// ctx.drawImage(
//   overlayCanvas,
//   contentX,
//   Math.ceil(canvasHeight / 2 - contentHeight / 2 + contentY)
// );

// ctx.fillStyle = "green";

// // ctx.globalCompositeOperation = "destination-atop";
// ctx.fillText(text, off, contentY);
// ctx.fillText(text, off, Math.ceil(canvasHeight / 2 - contentHeight / 2));

// ctx.strokeRect(contentX, contentHeight / 2 - contentY, contentWidth, 0);

// console.log({ contentWidth, contentHeight, contentX, contentY });

function draw() {
  window.requestAnimationFrame(draw);
  if (!shouldAnimate) {
    return;
  }

  const animationWidth = contentWidth + canvasWidth;
  tick = (tick - 1 + animationWidth) % animationWidth;
  const contentOffset = tick - contentWidth;

  ctx.clearRect(0, 0, canvasWidth, canvasHeight); // clear canvas

  ctx.globalCompositeOperation = "source-over";

  if (overlayMovesWithText) {
    let overlayOffset = contentOffset + contentX;
    ctx.drawImage(
      overlayCanvas,
      overlayOffset,
      Math.ceil(canvasHeight / 2 - contentHeight / 2 + contentY)
    );
  } else {
    ctx.save();
    // reuse the background noise, but flip it so it doesn't line up
    ctx.scale(-1, -1);
    ctx.translate(-canvasWidth, -canvasHeight);
    ctx.drawImage(backgroundCanvas, 0, 0);
    ctx.restore();
  }

  // draw static noise on text

  ctx.globalCompositeOperation = "destination-atop";
  ctx.fillStyle = "rgb(255 0 0)";
  ctx.fillText(
    text,
    contentOffset,
    Math.ceil(canvasHeight / 2 - contentHeight / 2)
  );
  ctx.drawImage(backgroundCanvas, 0, 0); // draw static noise background
  // ctx.fillStyle = "black";
  // ctx.fillRect(0, 0, canvasWidth, canvasHeight);
}

function drawBackgroundOnly() {
  ctx.clearRect(0, 0, canvasWidth, canvasHeight); // clear canvas
  ctx.drawImage(backgroundCanvas, 0, 0); // draw static noise background
}

function init() {
  drawBackgroundOnly();
  window.requestAnimationFrame(draw);
}

init();

document.addEventListener("keyup", (e) => {
  e.preventDefault();
  if (e.key === " ") {
    shouldAnimate = !shouldAnimate;
  }

  if (e.key === "s") {
    overlayMovesWithText = !overlayMovesWithText;
  }

  if (e.key === "c") {
    coloredNoise = !coloredNoise;
    noise(backgroundCtx, 1337);
    noise(overlayCtx, 4711);
    drawBackgroundOnly();
  }
});

function noise(ctx, seed = 1337) {
  const generator = new MersenneTwister(seed);
  const { height, width } = ctx.canvas;
  const idata = ctx.createImageData(width, height);
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      const index = (x + y * width) * 4;

      if (coloredNoise) {
        idata.data[index] = generator.random() * 255;
        idata.data[index + 1] = generator.random() * 255;
        idata.data[index + 2] = generator.random() * 255;
      } else {
        const value = generator.random() < 0.5 ? 0 : 255;

        idata.data[index] = value;
        idata.data[index + 1] = value;
        idata.data[index + 2] = value;
      }
      idata.data[index + 3] = 255; // alpha channel is always set to full opacity
    }
  }
  ctx.putImageData(idata, 0, 0);
}
// });
