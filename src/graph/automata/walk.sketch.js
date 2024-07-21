// Press "render", then click to spark joy
// and double-click to start/stop the simulation.
// Drag to rotate, left-click to pan and wheel to zoom.

const DEBUG = false;
const CANVAS_SIZE = 512;
const SPACE_SIZE = 32;
const CELL_SIZE = CANVAS_SIZE / SPACE_SIZE;
const CELL_TRAIL = 10;
const FRAME_RATE = 60;
const SIMULATION_RATE = 60;
const FRAMES_PER_TICK = FRAME_RATE / SIMULATION_RATE;

const mappedArray = (s, f) => Array.from(Array(s), f);
const filledArray = (s, v) => Array(s).fill(v);
const clone = o => JSON.parse(JSON.stringify(o));
const bounded = (l, v, u) => l <= v && v < u;

let running = true;
let space = mappedArray(6, () => mappedArray(SPACE_SIZE, () => filledArray(SPACE_SIZE, 0)));

const id = (i, j) => [(i + SPACE_SIZE) % SPACE_SIZE, (j + SPACE_SIZE) % SPACE_SIZE];
const rcw = (i, j) => [(SPACE_SIZE - 1 - (j + SPACE_SIZE) % SPACE_SIZE) % SPACE_SIZE, (i + SPACE_SIZE) % SPACE_SIZE];
const inv = (i, j) => [(SPACE_SIZE - 1 - (i + SPACE_SIZE) % SPACE_SIZE) % SPACE_SIZE, (SPACE_SIZE - 1 - (j + SPACE_SIZE) % SPACE_SIZE) % SPACE_SIZE];
const rccw = (i, j) => [(j + SPACE_SIZE) % SPACE_SIZE, (SPACE_SIZE - 1 - (i + SPACE_SIZE) % SPACE_SIZE) % SPACE_SIZE];

const adjacency = [
  [[4, rcw], [1, id], [5, rccw], [3, id]],
  [[4, id], [2, id], [5, id], [0, id]],
  [[4, rccw], [3, id], [5, rcw], [1, id]],
  [[4, inv], [0, id], [5, inv], [2, id]],
  [[3, inv], [2, rcw], [1, id], [0, rccw]],
  [[1, id], [2, rccw], [3, inv], [0, rcw]]
];

const palette = ["#01BEFE", "#FFDD00", "#FF7D00", "#FF006D", "#ADFF02", "#8F00FF"];

const geometry = {
  verts: [
    [-100, 100, 100],
    [100, 100, 100],
    [100, -100, 100],
    [-100, -100, 100],
    [100, 100, -100],
    [-100, 100, -100],
    [100, -100, -100],
    [-100, -100, -100]
  ],
  quads: [
    [5, 0, 3, 7],
    [0, 1, 2, 3],
    [1, 4, 6, 2],
    [4, 5, 7, 6],
    [5, 4, 1, 0],
    [3, 2, 6, 7]
  ]
};

let snapshotAccess = (space) => {
  space = clone(space);

  const safe = (f, i, j) => {
    if (bounded(0, i, SPACE_SIZE) && bounded(0, j, SPACE_SIZE)) return space[f][i][j];
    else if (bounded(0, i, SPACE_SIZE) || bounded(0, j, SPACE_SIZE)) {
      let direction;

      if (j < 0) {
        direction = 0;
      } else if (i >= SPACE_SIZE) {
        direction = 1;
      } else if (j >= SPACE_SIZE) {
        direction = 2;
      } else if (i < 0) {
        direction = 3;
      }

      let [nf, transform] = adjacency[f][direction];
      let [ni, nj] = transform(i, j);

      return space[nf][ni][nj];
    }

    // We have four literal corner cases where both i and j are out of bounds.
    // For the time being, consider those as 0
    return 0;
  }

  const count = (f, i, j) => safe(f, i, j) === CELL_TRAIL ? 1 : 0;

  const neighbors = (f, i, j) => count(f, i - 1, j - 1) + count(f, i - 1, j) + count(f, i - 1, j + 1) + count(f, i, j - 1) + count(f, i, j + 1) + count(f, i + 1, j - 1) + count(f, i + 1, j) + count(f, i + 1, j + 1);

  return { safe, neighbors };
}

const spawn = () => {
  let f = Math.floor(p.random(0, 6));
  let i = Math.floor(p.random(0, SPACE_SIZE));
  let j = Math.floor(p.random(0, SPACE_SIZE));

  space[f][i][j] = CELL_TRAIL;
}

let renderer;
let graphics = [];
let colors = {
  hotpink: p.color("hotpink"),
  white: p.color("white"),
  palette: []
};
let samples = [];

p.setup = () => {
  renderer = p.createCanvas(CANVAS_SIZE, CANVAS_SIZE, p.WEBGL);
  renderer.drawingContext.disable(renderer.drawingContext.DEPTH_TEST);
  p.frameRate(FRAME_RATE);
  p.textureMode(p.NORMAL);
  if (DEBUG) p.stroke("hotpink")
  else p.noStroke();

  for (let f = 0; f < 6; f++) {
    let g = p.createGraphics(CANVAS_SIZE, CANVAS_SIZE, p.WEBGL);
    graphics.push(g);

    colors.palette.push(p.color(palette[f]));

    samples.push([Math.floor(p.random(0, SPACE_SIZE)), Math.floor(p.random(0, SPACE_SIZE))]);
  }
}

p.mousePressed = () => {
  for (let n = 0; n < SPACE_SIZE * SPACE_SIZE / 16; n++) {
    spawn();
  }
}

p.doubleClicked = () => {
  running = !running;
}

let lastTick = 0;
let rot = [0,0,0];

p.draw = () => {
  if (running && p.frameCount - lastTick >= FRAMES_PER_TICK) {
    lastTick = p.frameCount;

    const {safe, neighbors} = snapshotAccess(space);

    for (let f = 0; f < 6; f++) {
      for (let i = 0; i < SPACE_SIZE; i++) {
        for (let j = 0; j < SPACE_SIZE; j++) {
          if (safe(f, i, j) === CELL_TRAIL) {
            let walk = p.random([0,1,2,3]);
            let ni = i;
            let nj = j;

            if (walk === 0) nj--;
            else if (walk === 1) ni++;
            else if (walk === 2) nj++;
            else if (walk === 3) ni--;

            if (bounded(0, ni, SPACE_SIZE) && bounded(0, nj, SPACE_SIZE)) {
              space[f][ni][nj] = CELL_TRAIL;
              space[f][i][j] = CELL_TRAIL - 1;
            } else if (bounded(0, ni, SPACE_SIZE) || bounded(0, nj, SPACE_SIZE)) {
              let direction;
        
              if (nj < 0) {
                direction = 0;
              } else if (ni >= SPACE_SIZE) {
                direction = 1;
              } else if (nj >= SPACE_SIZE) {
                direction = 2;
              } else if (ni < 0) {
                direction = 3;
              }

              let [nf, transform] = adjacency[f][direction];
              let [nni, nnj] = transform(ni, nj);

              space[nf][nni][nnj] = CELL_TRAIL;
              space[f][i][j] = CELL_TRAIL - 1;
            }
          } else if (space[f][i][j] < CELL_TRAIL && space[f][i][j] > 0) {
            space[f][i][j] = space[f][i][j] - 1;
          }
        }
      }
    }
  }

  for (let f = 0; f < 6; f++) {
    let g = graphics[f];
    let color = DEBUG ? colors.palette[f] : colors.hotpink;

    g.clear();
    for (let i = 0; i < SPACE_SIZE; i++) {
      for (let j = 0; j < SPACE_SIZE; j++) {
        if (space[f][i][j] > 0) {
          color.setAlpha(space[f][i][j] / CELL_TRAIL * 255);
          g.fill(color);
          g.noStroke();
        } else {
          g.noFill();
          g.stroke(color);
        }
        if (space[f][i][j] > 0 || DEBUG)
          g.square(i * CELL_SIZE - CANVAS_SIZE / 2, j * CELL_SIZE - CANVAS_SIZE / 2, CELL_SIZE);
      }
    }
  }

  if (DEBUG) p.background(200);
  else p.clear();
  p.orbitControl();
  p.scale(1.5);
  rot[0] += p.noise(...samples[0], p.frameCount * 0.01) * 0.03;
  rot[1] += p.noise(...samples[1], p.frameCount * 0.01) * 0.03;
  rot[2] += p.noise(...samples[2], p.frameCount * 0.01) * 0.03;
  p.rotateZ(rot[0]);
  p.rotateX(rot[1]);
  p.rotateY(rot[2]);

  for (let f = 0; f < 6; f++) {
    let g = graphics[f];
    let corners = geometry.quads[f];
    
    p.texture(g);
    p.beginShape(p.QUADS);
    p.vertex(...geometry.verts[corners[0]], 0, 0);
    p.vertex(...geometry.verts[corners[1]], 1, 0);
    p.vertex(...geometry.verts[corners[2]], 1, 1);
    p.vertex(...geometry.verts[corners[3]], 0, 1);
    p.endShape(p.CLOSE);
  }

  for (let n = 0; n < 10; n++) spawn();
}