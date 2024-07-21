// Press "render", then click to spark joy
// and double-click to start/stop the simulation.
// Drag to rotate, left-click to pan and wheel to zoom.

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

let canvas;
let buffer3d;
let camera;

let noiseSeed;
let angle;
let hue;

p.setup = () => {
  canvas = p.createCanvas(CANVAS_SIZE, CANVAS_SIZE, p.WEBGL);
  canvas.background(200);

  buffer3d = p.createFramebuffer();
  buffer3d.begin();
  camera = buffer3d.createCamera();
  camera.setPosition(0, -500, 1000);
  camera.lookAt(0, 0, 0);
  buffer3d.end();

  p.frameRate(60);
}

p.mousePressed = () => {
  for (let n = 0; n < SPACE_SIZE * SPACE_SIZE / 16; n++) {
    let i = Math.floor(p.random(0, SPACE_SIZE));
    let j = Math.floor(p.random(0, SPACE_SIZE));

    space[i][j] = 1;
  }
}

p.doubleClicked = () => {
  running = !running;
}

let lastTick = 0;

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

    buffer3d.begin();
    p.setCamera(camera);
    p.resetMatrix();
    p.clear();
    p.translate(-CANVAS_SIZE / 2, -150, -CANVAS_SIZE / 2);
    p.push();
    for (let i = 0; i < SPACE_SIZE; i++) {
      p.push();
      for (let j = 0; j < SPACE_SIZE; j++) {
        if (space[i][j] === 1) {
          p.fill("white");
          p.stroke("black");
        } else {
          p.noFill();
          p.stroke("black");
        }
        if (space[i][j] === 1 || DEBUG)
          p.box(CELL_SIZE);
      
        p.translate(CELL_SIZE, 0, 0);
      }
      p.pop();
      p.translate(0, 0, CELL_SIZE);
    }
    p.pop();
    buffer3d.end();

    p.copy(canvas, ORIGIN_2D, ORIGIN_2D - CELL_SIZE * 1.1, CANVAS_SIZE, CANVAS_SIZE, ORIGIN_3D, ORIGIN_3D, CANVAS_SIZE, CANVAS_SIZE);
    p.image(buffer3d, ORIGIN_3D, ORIGIN_3D, CANVAS_SIZE, CANVAS_SIZE);
  }
}