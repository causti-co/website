const DEBUG = false;
const CANVAS_SIZE = 512;
const ORIGIN_2D = 0;
const ORIGIN_3D = -CANVAS_SIZE/2;
const SPACE_SIZE = 64;
const CELL_SIZE = CANVAS_SIZE / SPACE_SIZE;
const FRAME_RATE = 60;
const SIMULATION_RATE = 10;
const FRAMES_PER_TICK = FRAME_RATE / SIMULATION_RATE;

const mappedArray = (s, f) => Array.from(Array(s), f);
const filledArray = (s, v) => Array(s).fill(v);
const clone = o => JSON.parse(JSON.stringify(o));
const bounded = (l, v, u) => l <= v && v < u;

let running = true;
let space = mappedArray(SPACE_SIZE, () => filledArray(SPACE_SIZE, 0));

let snapshotAccess = (space) => {
  let copy = clone(space);

  const safe = (i, j) => {
    i = (i + SPACE_SIZE) % SPACE_SIZE;
    j = (j + SPACE_SIZE) % SPACE_SIZE;
    return copy[i][j];
  }

  const neighbors = (i, j) => safe(i - 1, j - 1) + safe(i - 1, j) + safe(i - 1, j + 1) + safe(i, j - 1) + safe(i, j + 1) + safe(i + 1, j - 1) + safe(i + 1, j) + safe(i + 1, j + 1);

  return { safe, neighbors, copy };
}

let spawn = (times = 1) => {
  for (let n = 0; n < times * SPACE_SIZE * SPACE_SIZE / 16; n++) {
    let i = Math.floor(p.random(0, SPACE_SIZE));
    let j = Math.floor(p.random(0, SPACE_SIZE));

    space[i][j] = 1;
  }
}

let canvas;
let buffer3d;
let buffer2d;
let buffer2dDensity;
let palette = [
  p.color('#FFF4FC'),
  p.color('#FFA2EC'),
  p.color('#FFA2EC'),
  p.color('#FF69B4'),
  p.color('#48001C'),
  p.color('#48001C'),
  p.color('#48001C'),
  p.color('#48001C')
];

p.setup = () => {
  canvas = p.createCanvas(CANVAS_SIZE, CANVAS_SIZE);
  buffer2d = p.createGraphics(CANVAS_SIZE, CANVAS_SIZE);
  buffer2dDensity = buffer2d.pixelDensity();
  buffer2d.clear();
  buffer3d = p.createGraphics(CANVAS_SIZE, CANVAS_SIZE, p.WEBGL);

  p.frameRate(60);
  spawn(10);
}

p.mousePressed = () => {
  spawn(10);
}

let lastTick = 0;
let ncount = {};

p.draw = () => {
  if (running && p.frameCount - lastTick >= FRAMES_PER_TICK) {
    lastTick = p.frameCount;

    const {safe, neighbors, copy} = snapshotAccess(space);

    for (let i = 0; i < SPACE_SIZE; i++) {
      for (let j = 0; j < SPACE_SIZE; j++) {
        let count = neighbors(i, j);
        
        if (space[i][j] === 1 && count !== 2 && count !== 3) {
          space[i][j] = 0;
        } else if (space[i][j] === 0 && count === 3) {
          space[i][j] = 1;
        }
      }
    }

    buffer3d.clear();
    buffer3d.push();
    buffer3d.translate(ORIGIN_3D, 0, -20);
    buffer3d.rotateX(150 / 180 * p.PI);
    for (let i = 0; i < SPACE_SIZE; i++) {
      buffer3d.push();
      for (let j = 0; j < SPACE_SIZE; j++) {
        let count = neighbors(i, j);

        if (space[i][j] === 1) {
          buffer3d.fill(palette[count]);
          buffer3d.stroke("black");
        } else {
          buffer3d.noFill();
          buffer3d.stroke("black");
        }
        if (space[i][j] === 1 || DEBUG)
          buffer3d.box(CELL_SIZE);
      
        buffer3d.translate(CELL_SIZE, 0, 0);
      }
      buffer3d.pop();
      buffer3d.translate(0, 0, CELL_SIZE);
    }
    buffer3d.pop();

    buffer2d.loadPixels();
    for (let p = 0; p < CANVAS_SIZE * CANVAS_SIZE * buffer2dDensity * buffer2dDensity * 4; p += 4) {
      buffer2d.pixels[p + 3] = buffer2d.pixels[p + 3] * 0.4;
    }
    buffer2d.updatePixels();
    buffer2d.copy(buffer2d, ORIGIN_2D, ORIGIN_2D - CELL_SIZE * 1.5, CANVAS_SIZE, CANVAS_SIZE, 0, 0, CANVAS_SIZE, CANVAS_SIZE);
    buffer2d.copy(buffer3d, ORIGIN_3D, ORIGIN_3D, CANVAS_SIZE, CANVAS_SIZE, ORIGIN_2D, ORIGIN_2D, CANVAS_SIZE, CANVAS_SIZE);

    p.background(0);
    p.image(buffer2d, 0, 0);

    if (p.random() > 0.8) spawn(2);
  }
}