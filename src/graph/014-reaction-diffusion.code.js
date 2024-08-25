class Utils {
  static randomInt (...args) {
    let min = 0, max;
    if (args.length === 1) {
      [max] = args;
    } else {
      [min, max] = args;
    }
    return Math.floor(Math.random() * (max - min)) + min;
  }

  static randomNoise(...args) {
    let min = 0, max = 1, scale = 0.005;
    if (args.length === 1) {
      [max] = args;
    } else if (args.length === 2) {
      [min, max] = args;
    } else {
      [min, max, scale] = args;
    }

    let origin = p.createVector(p.random(-100000, 100000), p.random(-100000, 100000), p.random(-100000, 100000));

    return (...coords) => {
      let safeCoords = [...coords];
      safeCoords[safeCoords.length - 1] *= scale;
      let noiseCoords = p.createVector(...safeCoords).add(origin);
      return p.map(p.noise(noiseCoords.x, noiseCoords.y, noiseCoords.z), 0, 1, min, max);
    }
  }

  static cloneColor(source) {
    return p.color(p.red(source), p.green(source), p.blue(source), p.alpha(source));
  }

  static mappedArray(size, mapFn) {
    return Array.from(Array(size), mapFn);
  }

  static filledArray(size, value) {
    return Utils.mappedArray(size, () => Utils.clone(value));
  }

  static clone(object) {
    return JSON.parse(JSON.stringify(object));
  }

  static isBounded(value, min, max) {
    return min <= value && value < max;
  }

  static makeMatrix(...args) {
    let [size, ...rest] = args;

    if (rest.length === 1) {
      let [value] = rest;
      return Utils.filledArray(size, value);
    } else {
      return Utils.mappedArray(size, () => Utils.makeMatrix(...rest));
    }
  }

  static makeGradient(...steps) {
    return function gradient(value) {
      let stepTo, colorTo, stepFrom, colorFrom;

      for (let [step, color] of steps)  {
        if (value < step) {
          stepTo = step;
          colorTo = color;
          break;
        } else if (value > step) {
          stepFrom = step;
          colorFrom = color;
        } else {
          return color;
        }
      }
      return p.lerpColor(colorFrom, colorTo, p.map(value, stepTo, stepFrom, 0, 1));
    }
  }
}

const CELL_SIZE = 5;
const B_RATE = 0.08;
const B_RADIUS_SQ = 200;
const CONV_COEFFS = {
  D: 0.05,
  A: 0.2,
  C: -1.0
};
const PARAMS = {
  D_A: 0.86,
  D_B: 0.35,
  F: 0.0418,
  K: 0.0596
};
const DELTA_T = 1.0;
const [INIT_RANDOM, INIT_CENTER] = [0, 1];
const [DRAW_SINGLE, DRAW_BOTH, DRAW_GRADIENT] = [0, 1, 2];
const [NEXT_NORMAL, NEXT_FEED_KILL_GRADIENT, NEXT_DIFUSSION_GRADIENT] = [0, 1, 2];

let C_WHITE, C_BLACK, C_A, C_B;
let GRADIENT;
let DRAW_MODE;

let D_A, D_B, F, K;

class ReactionDifussion {
  constructor(gridWidth, gridHeight, params) {
    this.gridWidth = gridWidth;
    this.gridHeight = gridHeight;
    this.params = Utils.clone(params);
    this.activeGrid = 0;
    this.grids = [];
    this.grids.push(Utils.makeMatrix(gridWidth, gridHeight, {}));
    this.grids.push(Utils.makeMatrix(gridWidth, gridHeight, {}));
    this.gridCount = this.grids.length;
  }

  getActiveGrid() {
    return this.grids[this.activeGrid];
  }

  init(mode) {
    let grid = this.getActiveGrid();

    let cx = Math.floor(this.gridWidth / 2);
    let cy = Math.floor(this.gridHeight / 2);

    for (let x = 0; x < this.gridWidth; x++) {
      for (let y = 0; y < this.gridHeight; y++) {
        if (mode === INIT_RANDOM) {
          grid[x][y].a = 1.0;
          grid[x][y].b = Math.random() < B_RATE ? 1.0 : 0.0;
        } else if (mode === INIT_CENTER) {
          let d_sq = (x - cx) * (x - cx) + (y - cy) * (y - cy);

          grid[x][y].a = 1.0;
          grid[x][y].b = d_sq < B_RADIUS_SQ ? 1.0 : 0.0;
        }
      }
    }
  }

  initFrom(src) {
    let grid = this.getActiveGrid();
    let srcGrid = src.getActiveGrid();

    if (this.gridWidth > src.gridWidth || this.gridHeight > src.gridHeight) throw new Error('Cannot initialize from a smaller source.');

    for (let x = 0; x < this.gridWidth; x++) {
      for (let y = 0; y < this.gridHeight; y++) {
        grid[x][y].a = srcGrid[x][y].a;
        grid[x][y].b = srcGrid[x][y].b;
      }
    }
  }

  nextActiveGrid() {
    return (this.activeGrid + 1) % this.gridCount;
  }

  next(mode) {
    let {D_A, D_B, F, K} = this.params;
    let grid = this.getActiveGrid();
    let next = this.grids[this.nextActiveGrid()];

    const safe = (x, y) => {
      return grid[(x + this.gridWidth) % this.gridWidth][(y + this.gridHeight) % this.gridHeight];
      // if (Utils.isBounded(x, 0, this.gridWidth) && Utils.isBounded(y, 0, this.gridHeight)) {
      //   return grid[x][y];
      // } else {
      //   return {a: 0.0, b: 0.0};
      // }
    };

    let conv = (x, y, prop) => {
      return (
        safe(x-1, y-1)[prop] * CONV_COEFFS.D + safe(x, y-1)[prop] * CONV_COEFFS.A + safe(x+1, y-1)[prop] * CONV_COEFFS.D +
        safe(x-1, y)[prop] * CONV_COEFFS.A + safe(x, y)[prop] * CONV_COEFFS.C + safe(x+1, y)[prop] * CONV_COEFFS.A +
        safe(x-1, y+1)[prop] * CONV_COEFFS.D + safe(x, y+1)[prop] * CONV_COEFFS.A + safe(x+1, y+1)[prop] * CONV_COEFFS.D
      );
    };

    for (let x = 0; x < this.gridWidth; x++) {
      for (let y = 0; y < this.gridHeight; y++) {
        let {a, b} =  grid[x][y];

        if (mode === NEXT_FEED_KILL_GRADIENT) {
          F = p.map(y, 0, this.gridHeight, 0.01, 0.1);
          K = p.map(x, 0, this.gridWidth, 0.045, 0.07);
        } else if (mode === NEXT_DIFUSSION_GRADIENT) {
          D_A = p.map(x, 0, this.gridWidth, 0.01, 1.0);
          D_B = p.map(y, 0, this.gridHeight, 0.01, 1.0);
        }

        next[x][y].a = p.constrain(a + (D_A * conv(x, y, 'a') - a * b * b + F * (1 - a)) * DELTA_T, 0, 1);
        next[x][y].b = p.constrain(b + (D_B * conv(x, y, 'b') + a * b * b - (K + F) * b) * DELTA_T, 0, 1);
      }
    }

    this.activeGrid = this.nextActiveGrid();
  }
}

let RD_L, RD_R, RD_F;
let fullscreen = false, showHelp = false;

p.setup = () => {
  p.createCanvas(clientWidth, clientHeight);
  p.setFrameRate(60);
  p.colorMode(p.HSB);

  C_A = p.color('darkorange');
  C_B = p.color('hotpink');
  C_WHITE = p.color('white');
  C_BLACK = p.color('black');
  GRADIENT = Utils.makeGradient(
    [0.0, p.color('#042cc9')],
    [0.24, p.color('black')],
    [0.26, p.color('white')],
    [0.5, p.color('#5b0dd1')],
    [1.0, p.color('#5b0dd1')]
  );

  initParams();

  let gridWidth = Math.ceil(0.5 * p.width / CELL_SIZE);
  let gridHeight = Math.ceil(p.height / CELL_SIZE);

  RD_L = new ReactionDifussion(gridWidth, gridHeight, {D_A, D_B, F, K});
  RD_R = new ReactionDifussion(gridWidth, gridHeight, {D_A, D_B, F, K});
  RD_F = new ReactionDifussion(gridWidth * 2, gridHeight, {});

  DRAW_MODE = DRAW_GRADIENT;
  RD_L.init(INIT_RANDOM);
  RD_R.init(INIT_RANDOM);
}

p.draw = () => {
  let mode = DRAW_MODE;

  const easing = t => 1-(-t+1)**3;
  const drawCell = (x, y, color, alpha) => {
    color.setAlpha(255 * easing(alpha));
    p.fill(color);
    p.rect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
  };

  p.background('black');
  if (fullscreen) {
    let gridF = RD_F.getActiveGrid();

    p.noStroke();
    for (let x = 0; x < RD_F.gridWidth; x++) {
      for (let y = 0; y < RD_F.gridHeight; y++) {
        let {a, b} =  gridF[x][y];

        if (mode === DRAW_SINGLE) {
          drawCell(x, y, C_B, b);
        } else if (mode === DRAW_BOTH) {
          drawCell(x, y, C_B, b);
          drawCell(x, y, C_A, a);
        } else if (mode === DRAW_GRADIENT) {
          let t = 0.5 - (b - a) * 0.5;
          let alpha = (a + b) / 2;

          drawCell(x, y, p.color((t * 360 + p.frameCount * 0.5) % 360, 100, 100), alpha);
        }
      }
    }

    p.fill('white');
    p.stroke('black');
    p.strokeWeight(2);
    p.textSize(16);
    p.text(`K: ${K.toFixed(4)}`, 8, 20);
    p.text(`F: ${F.toFixed(4)}`, 8, 20 + 16);
    p.text(`D_A: ${D_A.toFixed(4)}`, 8, 20 + 32);
    p.text(`D_B: ${D_B.toFixed(4)}`, 8, 20 + 48);

    if (showHelp) {
      p.text(`Press P to go back.`, 8, p.height - 8);
    } else {
      p.text(`Press ? to toggle instructions.`, 8, p.height - 8);
    }
  } else {
    let gridL = RD_L.getActiveGrid();
    let gridR = RD_R.getActiveGrid();
    p.noStroke();
    for (let x = 0; x < RD_L.gridWidth; x++) {
      for (let y = 0; y < RD_L.gridHeight; y++) {
        let {a: aL, b: bL} =  gridL[x][y];
        let {a: aR, b: bR} =  gridR[x][y];

        if (mode === DRAW_SINGLE) {
          drawCell(x, y, C_B, bL);
          drawCell(x + RD_L.gridWidth, y, C_B, bR);
        } else if (mode === DRAW_BOTH) {
          drawCell(x, y, C_B, bL);
          drawCell(x, y, C_A, aL);
          drawCell(x + RD_L.gridWidth, y, C_B, bR);
          drawCell(x + RD_L.gridWidth, y, C_A, aR);
        } else if (mode === DRAW_GRADIENT) {
          let tL = 0.5 - (bL - aL) * 0.5;
          let tR = 0.5 - (bR - aR) * 0.5;
          let alphaL = (aL + bL) / 2;
          let alphaR = (aR + bR) / 2;

          drawCell(x, y, p.color((tL * 360 + p.frameCount * 0.5) % 360, 100, 100), alphaL);
          drawCell(x + RD_L.gridWidth, y, p.color((tR * 360 + p.frameCount * 0.5) % 360, 100, 100), alphaR);
        }
      }
    }
    // maybe also highlight the selected cell

    p.fill('white');
    p.stroke('black');
    p.strokeWeight(2);
    p.textSize(16);
    p.text(`K: ${K.toFixed(4)}`, 8, 20);
    p.text(`F: ${F.toFixed(4)}`, 8, 20 + 16);
    p.text(`D_A: ${D_A.toFixed(4)}`, 8 + RD_L.gridWidth * CELL_SIZE, 20);
    p.text(`D_B: ${D_B.toFixed(4)}`, 8 + RD_L.gridWidth * CELL_SIZE, 20 + 16);

    if (showHelp) {
      p.text(`Click on the left to set Kill (K) and Feed (F) Rate.`, 8, p.height - 8 - 48);
      p.text(`Click on the right to set Difussion constants (D_A, D_B).`, 8, p.height - 8 - 32);
      p.text(`Press P to preview the current parameters in fullscreen mode.`, 8, p.height - 8 - 16);
      p.text(`Press R to reset all parameters.`, 8, p.height - 8);
    } else {
      p.text(`Press ? to toggle instructions.`, 8, p.height - 8);
    }
  }

  if (fullscreen) {
    RD_F.next(NEXT_NORMAL);
  } else {
    RD_L.next(NEXT_FEED_KILL_GRADIENT);
    RD_R.next(NEXT_DIFUSSION_GRADIENT);
  }
}

p.mouseClicked = () => {
  if (fullscreen) return;
  
  let gridX = Math.floor(p.mouseX / CELL_SIZE);
  let gridY = Math.floor(p.mouseY / CELL_SIZE);

  if (gridX < RD_L.gridWidth) {
    F = p.map(gridY, 0, RD_L.gridHeight, 0.01, 0.1);
    K = p.map(gridX, 0, RD_L.gridWidth, 0.045, 0.07);

    RD_R.params.F = F;
    RD_R.params.K = K;

    RD_R.init(INIT_RANDOM);
  } else {
    gridX -= RD_L.gridWidth;

    D_A = p.map(gridX, 0, RD_R.gridWidth, 0.01, 1.0);
    D_B = p.map(gridY, 0, RD_R.gridHeight, 0.01, 1.0);

    RD_L.params.D_A = D_A;
    RD_L.params.D_B = D_B;

    RD_L.init(INIT_RANDOM);
  }
}

p.keyPressed = () => {
  switch (p.key) {
    case '?':
      showHelp = !showHelp;
      break;
    case 'R':
    case 'r':
      initParams();

      RD_R.params.F = F;
      RD_R.params.K = K;
      RD_L.params.D_A = D_A;
      RD_L.params.D_B = D_B;

      RD_L.init(INIT_RANDOM);
      RD_R.init(INIT_RANDOM);
      break;
    case 'P':
    case 'p':
      if (!fullscreen) {
        RD_F.params.F = F;
        RD_F.params.K = K;
        RD_F.params.D_A = D_A;
        RD_F.params.D_B = D_B;

        RD_F.init(INIT_RANDOM);
      }
      fullscreen = !fullscreen;
      break;
  }
}

function initParams() {
  D_A = PARAMS.D_A;
  D_B = PARAMS.D_B;
  F = PARAMS.F;
  K = PARAMS.K;
}