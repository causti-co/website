// Press "render", then click to spark joy
// and double-click to start/stop the simulation.
// Drag to rotate, left-click to pan and wheel to zoom.

const DEBUG = false;
const CANVAS_SIZE = 512;
const SPACE_SIZE = 32;
const CELL_SIZE = CANVAS_SIZE / SPACE_SIZE;
const FRAME_RATE = 30;
const SIMULATION_RATE = 10;
const FRAMES_PER_TICK = FRAME_RATE / SIMULATION_RATE;
const MAX_HISTORY = 20;

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

let renderer;

p.setup = () => {
  renderer = p.createCanvas(CANVAS_SIZE, CANVAS_SIZE, p.WEBGL);
  p.frameRate(FRAME_RATE);
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
let history = [];

p.draw = () => {
  if (running && p.frameCount - lastTick >= FRAMES_PER_TICK) {
    lastTick = p.frameCount;

    const {safe, neighbors, copy} = snapshotAccess(space);
    history.unshift(copy);
    if (history.length === MAX_HISTORY) {
      history.pop(copy);
    }

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
  }

  p.clear();
  p.camera(0, -500, 1000, 0, 0, 0);
  p.scale(1);
  p.translate(-CANVAS_SIZE / 2, 0, -CANVAS_SIZE / 2);

  p.push();
  for (let i = 0; i < SPACE_SIZE; i++) {
    p.push();
    for (let j = 0; j < SPACE_SIZE; j++) {
      if (space[i][j] === 1) {
        p.fill("hotpink");
        p.noStroke();
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

  for (let i = 0; i < history.length; i++) {
    let space = history[i];
    let offset = i * CELL_SIZE;
    let color = p.lerpColor(p.color("hotpink"), p.color("black"), i / MAX_HISTORY);
    
    color.setAlpha(255 * (history.length - i) / MAX_HISTORY);

    p.push();
    p.translate(0, -offset, 0);
    for (let i = 0; i < SPACE_SIZE; i++) {
      p.push();
      for (let j = 0; j < SPACE_SIZE; j++) {
        if (space[i][j] === 1) {
          p.fill(color);
          p.noStroke();
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
  }
}