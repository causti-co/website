// Press "render", then click to toggle cells,
// and double-click to start/stop the simulation

const CANVAS_SIZE = 512;

const SPACE_SIZE = 64;
const CELL_SIZE = CANVAS_SIZE / SPACE_SIZE;

const mappedArray = (s, f) => Array.from(Array(s), f);
const filledArray = (s, v) => Array(s).fill(v);
const clone = o => JSON.parse(JSON.stringify(o));

let running = false;
let space = mappedArray(SPACE_SIZE, () => filledArray(SPACE_SIZE, 0));

let snapshotAccess = (space) => {
  space = clone(space);

  const safe = (i, j) => {
    i = (i + SPACE_SIZE) % SPACE_SIZE;
    j = (j + SPACE_SIZE) % SPACE_SIZE;
    return space[i][j];
  }

  return (i, j) => safe(i - 1, j - 1) + safe(i - 1, j) + safe(i - 1, j + 1) + safe(i, j - 1) + safe(i, j + 1) + safe(i + 1, j - 1) + safe(i + 1, j) + safe(i + 1, j + 1);
}

p.setup = () => {
  p.createCanvas(CANVAS_SIZE, CANVAS_SIZE);
  p.fill('hotpink');
  p.stroke('black');
  p.frameRate(10);
}

p.mousePressed = () => {
  if (0 <= p.mouseX && p.mouseX <= CANVAS_SIZE && 0 <= p.mouseY && p.mouseY <= CANVAS_SIZE) {
    let i = Math.floor(p.mouseX / CELL_SIZE);
    let j = Math.floor(p.mouseY / CELL_SIZE);

    space[i][j] = Math.abs(space[i][j] - 1);
  }
}

p.doubleClicked = () => {
  running = !running;
}

p.draw = () => {
  if (running) {
    const neighbors = snapshotAccess(space);

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
  for (let i = 0; i < SPACE_SIZE; i++) {
    for (let j = 0; j < SPACE_SIZE; j++) {
      if (space[i][j] === 1) {
        p.square(i * CELL_SIZE, j * CELL_SIZE, CELL_SIZE);
      }
    }
  }
}