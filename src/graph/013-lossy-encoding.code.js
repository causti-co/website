const PATTERN = [[
  0b000000000,
  0b000000000,
  0b001000000,
  0b001000000,
  0b001000000,
  0b001000000,
  0b000000000,
  0b000000000,
  0b000000000
],
[
  0b000000000,
  0b000000000,
  0b001000000,
  0b001000000,
  0b001000100,
  0b001000100,
  0b000000100,
  0b000000100,
  0b000000000
],
[
  0b000000000,
  0b000000000,
  0b001001000,
  0b001001000,
  0b001001000,
  0b001001000,
  0b000000000,
  0b000000000,
  0b000000000
],
[
  0b000000000,
  0b000000000,
  0b001000000,
  0b001000000,
  0b001000000,
  0b001000000,
  0b000001111,
  0b000000000,
  0b000000000
]];
const PATTERN_SIZE = PATTERN[0].length;
const DARKEN_SCALE = 0.9;

let src;
let dst;

function getPixel(src, i, j) {
  let r = 0, g = 0, b = 0;
  for (let si = 0; si < PATTERN_SIZE; si++) {
    for (let sj = 0; sj < PATTERN_SIZE; sj++) {
      let ei = i * PATTERN_SIZE + si;
      let ej = j * PATTERN_SIZE + sj;
      let offset = (ei * src.width + ej) * 4;
      r += src.pixels[offset + 0];
      g += src.pixels[offset + 1];
      b += src.pixels[offset + 2];
    }
  }
  r = Math.round(r / (PATTERN_SIZE * PATTERN_SIZE));
  g = Math.round(g / (PATTERN_SIZE * PATTERN_SIZE));
  b = Math.round(b / (PATTERN_SIZE * PATTERN_SIZE));

  return {r, g, b};
}

function applyPattern(src, dst, i, j) {
  let {r, g, b} = getPixel(src, i, j);
  let dr = Math.round(r * DARKEN_SCALE);
  let dg = Math.round(g * DARKEN_SCALE);
  let db = Math.round(b * DARKEN_SCALE);
  let pattern = PATTERN[2 * (i % 2) + (j % 2)];

  for (let di = 0; di < PATTERN_SIZE; di++) {
    for (let dj = 0; dj < PATTERN_SIZE; dj++) {
      let ei = i * PATTERN_SIZE + di;
      let ej = j * PATTERN_SIZE + dj;
      let offset = (ei * dst.width + ej) * 4;
      let dark = pattern[di] & (1 << (PATTERN_SIZE - dj - 1));
      dst.pixels[offset + 0] = dark ? dr : r;
      dst.pixels[offset + 1] = dark ? dg : g;
      dst.pixels[offset + 2] = dark ? db : b;
      dst.pixels[offset + 3] = 255;
    }
  }
}

p.preload = () => {
  src = p.loadImage('https://i.imgur.com/0Ic6r4X.jpeg'); // XXX: selfhost
}

p.setup = () => {
  p.createCanvas(clientWidth, clientHeight);
  p.pixelDensity(1);
  p.noLoop();

  src.pixelDensity(1);
  dst = p.createImage(src.width, src.height);
  dst.pixelDensity(1);
}

p.draw = () => {
  p.background(100);

  src.loadPixels();
  dst.loadPixels();
  for (let i = 0; i < Math.floor(dst.height / PATTERN_SIZE); i++) {
    for (let j = 0; j < Math.floor(dst.width / PATTERN_SIZE); j++) {
      applyPattern(src, dst, i, j);
    }
  }
  dst.updatePixels();
  p.image(dst, 0, 0, p.width, p.height, 0, 0, dst.width, dst.height, p.COVER);
}