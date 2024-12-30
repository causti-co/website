// This is the automata definition, in the shape of "From -> To : Condition". The condition receives the first and second neighbor counts.
// Try fucking with what I did so far.

const a0 = {
  'Woodland': {
    'Agriculture': (fn, sn) => ((fn.Woodland + sn.Woodland) >= 4 && (fn.Rock + sn.Rock) >= 5) || ((fn.Woodland + sn.Woodland) >= 4 && (fn.Grassland + sn.Grassland) >= 3),
    'Grassland': (fn, sn) => ((fn.Woodland + sn.Woodland) >= 10 && fn.Agriculture == 0) || fn.Grassland >= 5,
		'Urban': (fn, sn) => (fn.Urban >= 2 && ((fn.Urban + sn.Urban) >= 6))
  },
  'Agriculture': {
    'Urban': (fn, sn) => (fn.Urban >= 2 && ((fn.Urban + sn.Urban) >= 5)) || ((fn.Urban + sn.Urban) >= 4 && (fn.Agriculture + sn.Agriculture) >= 4) || ((fn.Urban + sn.Urban) >= 3 && (fn.Grassland + sn.Grassland) >= 6),
    'Woodland': (fn, sn) => (fn.Woodland >= 2 && (fn.Woodland + sn.Woodland) >= 4)
  },
  'Grassland': {
    'Agriculture': (fn, sn) => (fn.Woodland + sn.Woodland) >= 4 && (fn.Grassland + sn.Grassland) >= 4,
    'Woodland': (fn, sn) => (fn.Woodland >= 2 && (fn.Woodland + sn.Woodland) >= 4),
    'Urban': (fn, sn) => (fn.Urban >= 2 && ((fn.Urban + sn.Urban) >= 5)) || ((fn.Urban + sn.Urban) >= 3 && (fn.Agriculture + sn.Agriculture) >= 6) || ((fn.Urban + sn.Urban) >= 4 && (fn.Grassland + sn.Grassland) >= 4)
  },
  'Wetland': {},
  'Heathland': {},
  'Littoral': {},
  'Rock': {
    'Woodland': (fn, sn) => (fn.Rock >= 5) || ((fn.Rock + sn.Rock) >= 10),
    'Agriculture': (fn, sn) => (fn.Woodland + sn.Woodland) >= 4 && (fn.Rock + sn.Rock) >= 4
  },
  'Water': {},
  'Urban': {
    'Littoral': (fn, sn) => (fn.Urban + sn.Urban) >= 11 && fn.Empty == 0 && sn.Empty > 0,
    'Rock': (fn, sn) => (fn.Urban + sn.Urban) >= 11 || (fn.Rock + sn.Rock) >= 5,
    'Water': (fn, sn) => (fn.Urban + sn.Urban) >= 6 && fn.Empty > 0
  },
  'Empty': {}
}

// And now for the rest

let CATEGORIES = { // Colors of existing categories
  'Woodland': [34, 139, 34],
  'Agriculture': [132, 204, 6],
  'Grassland': [13, 255, 21],
  'Wetland': [135, 206, 234],
  'Heathland': [158, 205, 3],
  'Littoral': [238, 215, 174],
  'Rock': [205, 192, 176],
  'Water': [1, 0, 138],
  'Urban': [0, 0, 0],
  'Empty': [255, 255, 255],
  'Missing': [255, 0, 255]
};

const SIZE_X = 111; // Sampling dimensions
const SIZE_Y = 120;
const OFFSETS = { // Slight adjustments to fetch both detasets if needed
  2023: [4, 0],
  1990: [15, -4]
};

const HEX_FACTOR = 2/Math.sqrt(5); // Drawing stuff
let CELL_SIZE = 10;

const FRAME_RATE = 20; // Speed stuff
const SIMULATION_RATE = 10;
const FRAMES_PER_TICK = FRAME_RATE / SIMULATION_RATE;
let lastTick = 0;
let running = true;

let img; // Your image
let data = { // Your data
  2023: [],
  1990: []
};

let buff1, buff2; // Double-buffering
let active = 1;

let selected = undefined;

function distance([r1, g1, b1], [r2, g2, b2]) {
  return Math.sqrt(Math.abs(r1 - r2) ** 2 + Math.abs(g1 - g2) ** 2 + Math.abs(b1 - b2) ** 2);
}

function findCategory(pixel) {
  let min = +Infinity;
  let result = 'Missing';
  
  for (const [category, color] of Object.entries(CATEGORIES)) {
    let d = distance(color, pixel);
    if (d < min) {
      result = category;
      min = d;
    }
  }
  return result;
}

function makeBuffer() {
  return Array(SIZE_Y).fill().map(() => Array(SIZE_X).fill());
}

function copyBuffer(dst, src) {
  for (let j = 0; j < SIZE_Y; j++) {
    for (let i = 0; i < SIZE_X; i++) {
      dst[j][i] = src[j][i];
    }
  }
}

function firstNeighbors(buff, x, y) {
  let d1a = [[-1, -1], [0, -1], [+1, -1], [-1, 0], [0, +1], [+1, 0]];
  let d1b = [[-1, 0], [0, -1], [+1, 0], [-1, +1], [0, +1], [+1, +1]];

  return neighbors(x % 2 ? d1b : d1a, buff, x, y);
}

function secondNeighbors(buff, x, y) {
  let d2a = [[-1, -2], [+1, -2], [-2, 0], [+2, 0], [-1, +1], [+1, +1]];
  let d2b = [[-1, -1], [+1, -1], [-2, 0], [+2, 0], [-1, +2], [+1, +2]];

  return neighbors(x % 2 ? d2b : d2a, buff, x, y);
}

function neighbors(deltas, buff, x, y) {
  let zero = Object.keys(CATEGORIES).reduce((counts, category) => {
    counts[category] = 0;
    return counts;
  }, {});
  
  return deltas.reduce((counts, [dx, dy]) => {
    let nx = x + dx;
    let ny = y + dy;
    
    if (nx >= 0 && nx < SIZE_X && ny >= 0 && ny < SIZE_Y) {
      counts[buff[ny][nx]]++;
    } else {
      counts['Empty']++;
    }
    
    return counts;
  }, zero);
}

function nextFrame() {
  let curr = active == 1? buff1 : buff2;
  let next = active == 1? buff2 : buff1;

  for (let j = 0; j < SIZE_Y; j++) {
    for (let i = 0; i < SIZE_X; i++) {
      let self = curr[j][i];
      let fn = firstNeighbors(curr, i, j);
      let sn = secondNeighbors(curr, i, j);
      let rules = a0[self];
      let nextSelf = self;

      for (let [candidate, condition] of Object.entries(rules)) {
        if (condition(fn, sn)) {
          nextSelf = candidate;
          break;
        }
      }

      next[j][i] = nextSelf;
    }
  }

  active = active == 1 ? 2 : 1;
}

function readImage(i, j, year) {
  let [ox, oy] = OFFSETS[year];

  let x = Math.floor(ox + i * 23.90);
  let y = Math.floor(oy + j * 27.6 + 4 * (i % 2 ? -1 : 1));

  let px = 4 * (y * img.width + x);
  let r = 255, g = 255, b = 255;

  if (x >= 0 && y >= 0) {
    r = img.pixels[px + 0];
    g = img.pixels[px + 1];
    b = img.pixels[px + 2];
  }

  return findCategory([r, g, b]);
}

p.preload = () => {
  img = p.loadImage('https://i.imgur.com/61Zwvci.jpeg'); // Had to put it somewhere that I know won't give me CORS bullshit
}

p.setup = () => {
  p.createCanvas(clientWidth, clientHeight);
  p.frameRate(FRAME_RATE);
  CELL_SIZE = clientHeight / SIZE_Y;

  img.loadPixels();

  for (let j = 0; j < SIZE_Y; j++) {
    let row1990 = [];
    let row2023 = [];
    data[1990].push(row1990);
    data[2023].push(row2023);

    row1990.push('Empty');
    for (let i = 0; i < SIZE_X; i++) {
      row1990.push(readImage(i, j, 1990));
      row2023.push(readImage(i, j, 2023));
    }
    row1990.pop();
  }

  for (let i = 0; i < SIZE_X; i++) {
    if (i % 2) continue;
    for (let j = 0; j < SIZE_Y - 1; j++) {
      data[1990][j][i] = data[1990][j+1][i];
    }
    data[1990][SIZE_Y - 1][i] = 'Empty';
  }

  buff1 = makeBuffer();
  buff2 = makeBuffer();
  copyBuffer(buff1, data[2023]);
}

p.draw = () => {
  p.clear();
  p.translate((clientWidth - CELL_SIZE * SIZE_X) / 2, 0);
  let d = active == 1 ? buff1 : buff2;
  let d1a = [[-1, -1], [0, -1], [+1, -1], [-1, 0], [0, +1], [+1, 0]];
  let d2a = [[-1, -2], [+1, -2], [-2, 0], [+2, 0], [-1, +1], [+1, +1]];
  let d1b = [[-1, 0], [0, -1], [+1, 0], [-1, +1], [0, +1], [+1, +1]];
  let d2b = [[-1, -1], [+1, -1], [-2, 0], [+2, 0], [-1, +2], [+1, +2]];

  for (let j = 0; j < SIZE_Y; j++) {
    for (let i = 0; i < SIZE_X; i++) {
      let x = i * CELL_SIZE * HEX_FACTOR;
      let y = j * CELL_SIZE + CELL_SIZE / 4 * (i % 2 ? -1 : 1);
      let [r, g, b] = CATEGORIES[d[j][i]];

      p.fill(r, g, b);
      
      if (selected) {
        let d1 = i % 2 ? d1b : d1a;
        let d2 = i % 2 ? d2b : d2a;
        if (i == selected.x && j == selected.y) {
          p.fill('red');  
        }
        for (let [dx, dy] of d1) {
          if (i == selected.x + dx && j == selected.y + dy) {
            p.fill('yellow');  
          }
        }
        for (let [dx, dy] of d2) {
          if (i == selected.x + dx && j == selected.y + dy) {
            p.fill('magenta');  
          }
        }
      }

      //if (i % 2) p.fill('darkorange');

      p.push();
      p.translate(x, y);

      p.strokeWeight(0.5);
      p.stroke(100);
      let c = CELL_SIZE/2;
      let q = c / HEX_FACTOR;

      p.beginShape();
      p.vertex(q, 0);
      p.vertex(q/2, c);
      p.vertex(-q/2, c);
      p.vertex(-q, 0);
      p.vertex(-q/2, -c);
      p.vertex(q/2, -c);
      p.endShape(p.CLOSE);

      // noStroke();
      // circle(0, 0, CELL_SIZE);
      p.pop();
    }
  }
  
  if (running && p.frameCount - lastTick >= FRAMES_PER_TICK) {
    lastTick = p.frameCount;
    nextFrame();
  }
}

// p.mousePressed = () => {
//   let x = Math.ceil(p.mouseX / (CELL_SIZE * HEX_FACTOR));
//   let y = Math.ceil(p.mouseY / CELL_SIZE);
  
//   // selected = {x, y};
//   // console.log(x, y);
  
//   // let d = active == 1 ? buff1 : buff2;
//   // console.log(firstNeighbors(d, x, y));
//   // console.log(secondNeighbors(d, x, y));
//   // nextFrame();
// }

p.doubleClicked = () => {
  running = !running;
}