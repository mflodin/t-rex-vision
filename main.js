import MersenneTwister from "./mersenne-twister.js";

let shouldAnimate = true;
let shouldResetScaleOnly = true;
let coloredNoise = false;
let tick = 0;

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// this gets the width and height "from the css" where we have set both to 100%
const { height, width } = canvas.getBoundingClientRect();

const canvasHeight = Math.floor(height);
const canvasWidth = Math.floor(width);

// this then applies that size to the image data as well so we get 1px per px
canvas.width = canvasWidth;
canvas.height = canvasHeight;

const svtLogoScale = Math.floor(canvasWidth / 40);
console.log({ canvasWidth, canvasHeight });

const offscreenCanvas = new OffscreenCanvas(canvasWidth, canvasHeight);
const offscreenCtx = offscreenCanvas.getContext("2d", { alpha: false });

const offscreenOverlayCanvas = new OffscreenCanvas(canvasWidth, canvasHeight);
const offscreenOverlayCtx = offscreenOverlayCanvas.getContext("2d", {
  alpha: false,
});

const idata = offscreenCtx.createImageData(
  offscreenCanvas.width,
  offscreenCanvas.height
);

const svtLogo = new Path2D(
  "m12.395 2.415-2.17 5.82-2.171-5.82H6.156l3.12 8.364h1.897l3.12-8.364zM1.543 8.304.157 9.309c.538.798 1.62 1.637 3.07 1.637 1.63 0 2.906-1 2.906-2.555 0-1.017-.592-1.791-1.81-2.35-.168-.077-.86-.384-.992-.44-.64-.27-.952-.574-.952-.939s.294-.743.897-.743c.422 0 .808.199 1.179.606l1.317-.956C5.246 2.762 4.27 2.26 3.222 2.26c-1.386 0-2.604.893-2.604 2.395 0 1.044.593 1.852 1.807 2.371l.884.377c.4.171 1.048.44 1.048 1.013s-.566.868-1.178.868c-.552 0-1.135-.349-1.637-.98zm16.283.946c-.405 0-.745-.245-.925-.592-.137-.263-.142-.682-.142-1.038V4.147h1.934l.646-1.733h-2.58V.025h-1.772v7.866c.002.364.022.698.16 1.135a2.83 2.83 0 0 0 2.68 1.92 2.94 2.94 0 0 0 1.985-.78L18.703 8.9c-.234.204-.558.35-.877.35z"
);

function noise(ctx, seed = 1337) {
  const generator = new MersenneTwister(seed);
  for (let x = 0; x < canvasWidth; x++) {
    for (let y = 0; y < canvasHeight; y++) {
      const index = (x + y * canvasWidth) * 4;

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

noise(offscreenCtx, 1337);
noise(offscreenOverlayCtx, 4711);

function draw() {
  window.requestAnimationFrame(draw);
  if (!shouldAnimate) {
    return;
  }

  //   ctx.globalCompositeOperation = "destination-over";
  ctx.clearRect(0, 0, canvasWidth, canvasHeight); // clear canvas
  ctx.save();
  ctx.drawImage(offscreenCanvas, 0, 0); // draw static noise (pun intended)
  ctx.restore();
  ctx.fillStyle = "rgb(0 0 0)";

  tick = (tick + 1) % canvasWidth;
  const offset = tick;

  ctx.save();
  ctx.translate(offset, 200);
  ctx.scale(svtLogoScale, svtLogoScale);
  ctx.clip(svtLogo);
  if (shouldResetScaleOnly) {
    ctx.scale(1 / svtLogoScale, 1 / svtLogoScale); // restore all transforms, but keep the clip path
  } else {
    ctx.resetTransform(); // restore all transforms, but keep the clip path
  }
  ctx.drawImage(offscreenOverlayCanvas, 0, 0); // offset the overlay a bit to avoid some weird artifacts at the top of the t
  ctx.restore();

  ctx.save();
  ctx.translate(offset - canvasWidth, 200);
  ctx.scale(svtLogoScale, svtLogoScale);
  ctx.clip(svtLogo);
  if (shouldResetScaleOnly) {
    ctx.scale(1 / svtLogoScale, 1 / svtLogoScale); // restore all transforms, but keep the clip path
  } else {
    ctx.resetTransform(); // restore all transforms, but keep the clip path
  }
  ctx.drawImage(offscreenOverlayCanvas, 0, 0); // offset the overlay a bit to avoid some weird artifacts at the top of the t
  ctx.restore();
}

function drawBackgroundOnly() {
  ctx.clearRect(0, 0, canvasWidth, canvasHeight); // clear canvas
  ctx.save();
  ctx.drawImage(offscreenCanvas, 0, 0); // draw static noise (pun intended)
  ctx.restore();
}

function init() {
  window.requestAnimationFrame(draw);
}

init();

document.addEventListener("keyup", (e) => {
  e.preventDefault();
  if (e.key === " ") {
    shouldAnimate = !shouldAnimate;
  }

  if (e.key === "s") {
    shouldResetScaleOnly = !shouldResetScaleOnly;
  }

  if (e.key === "c") {
    coloredNoise = !coloredNoise;
    noise(offscreenCtx, 1337);
    noise(offscreenOverlayCtx, 4711);
    drawBackgroundOnly();
  }
});
