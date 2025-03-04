const SQRT3 = Math.sqrt(3);
const SQRT3_2 = SQRT3 / 2;

const $outputContainer = document.getElementById("gibbs-output");
const $canvasContainer = document.getElementById("gibbs-container");
const $download = document.getElementById("download");
const $variableA = document.getElementById("variableA");
const $variableB = document.getElementById("variableB");
const $variableC = document.getElementById("variableC");
let p5instance;
let variableA = '', variableB = '', variableC = '';
let selected = null;

const sketch = (p) => {
  let x = 100;
  let y = 100;
  let font;

  p.preload = () => {
    font = p.loadFont('/assets/fonts/BerkeleyMono-Regular.otf');
  }

  p.setup = () => {
    p.createCanvas($outputContainer.clientWidth - 32, $outputContainer.clientHeight - 60);
  };

  p.draw = () => {
    const textSize = p.windowWidth > 1000 ? 24 : 16;
    const strokeWeight = 0.5;
    p.textSize(textSize);
    p.strokeWeight(strokeWeight);
    const textWidth = Math.max(p.textWidth(variableB), p.textWidth(variableC));
    const effWidth = p.width - textWidth * 2;
    const effHeight = p.height - textSize * 2;
    const size = Math.min(effWidth, effHeight);
    const center = {
      x: effWidth / 2 + textWidth,
      y: effHeight * 2 / 3 + textSize
    };
    const radius = size / 2;
    const vA = {
      x: center.x,
      y: center.y - radius
    };
    const vB = {
      x: center.x - SQRT3_2 * radius,
      y: center.y + 0.5 * radius
    };
    const vC = {
      x: center.x + SQRT3_2 * radius,
      y: center.y + 0.5 * radius
    };
    const lerp = {
      x: SQRT3_2 * radius,
      y: 1.5 * radius,
      z: SQRT3 * radius
    };

    p.background('white');
    p.stroke('black');
    p.strokeWeight(1);
    for (let i=1; i<=10; i++) {
      const offset = {
        x: p.lerp(0, lerp.x, i/10),
        y: p.lerp(0, lerp.y, i/10),
        z: p.lerp(0, lerp.z, i/10)
      };
      if (i == 10) p.strokeWeight(p.windowWidth > 1000 ? 4 : 2);
      p.line(vA.x - offset.x, vA.y + offset.y, vA.x + offset.x, vA.y + offset.y);
      p.line(vB.x + offset.x, vB.y - offset.y, vB.x + offset.z, vB.y);
      p.line(vC.x - offset.x, vC.y - offset.y, vC.x - offset.z, vC.y);
    }
  
    let textOffset = textSize * 2 / 3;

    p.fill('black');
    p.textFont(font);
    p.textSize(textSize);
    p.strokeWeight(strokeWeight);
    p.textAlign(p.CENTER, p.BOTTOM);
    p.text(variableA, vA.x, vA.y - textOffset);
    p.textAlign(p.RIGHT, p.TOP);
    p.text(variableB, vB.x - 0.5 * textOffset, vB.y);
    p.textAlign(p.LEFT, p.TOP);
    p.text(variableC, vC.x + 0.5 * textOffset, vC.y);

    if (selected) {
      p.fill('red');
      p.noStroke();
      p.circle(selected.x, selected.y, p.windowWidth > 1000 ? 20 : 10);

      let fA = Math.floor(selected.fA * 100);
      let fB = Math.floor(selected.fB * 100);
      let fC = Math.floor(selected.fC * 100);
      let delta = 100 - fA - fB - fC;
      if (fA >= fB && fA >= fC) fA += delta;
      else if (fB >= fA && fB >= fC) fB += delta;
      else fC += delta;

      p.strokeWeight(strokeWeight);
      p.textAlign(p.LEFT, p.BOTTOM);
      p.text(`${fA}%`, vA.x + p.lerp(0, lerp.x, 1.0 - selected.fA) + 10, vA.y + p.lerp(0, lerp.y, 1.0 - selected.fA));
      p.textAlign(p.RIGHT, p.BOTTOM);
      p.text(`${fB}%`, vB.x + p.lerp(0, lerp.x, 1.0 - selected.fB) - 10, vB.y - p.lerp(0, lerp.y, 1.0 - selected.fB));
      p.textAlign(p.CENTER, p.TOP);
      p.text(`${fC}%`, vC.x - p.lerp(0, lerp.z, 1.0 - selected.fC), vC.y + 10);
    }
  };

  p.windowResized = () => {
    p.resizeCanvas($outputContainer.clientWidth - 32, $outputContainer.clientHeight - 60);
    selected = null;
  }

  p.mouseClicked = () => {
    const textSize = p.windowWidth > 1000 ? 24 : 16;
    const strokeWeight = 0.5;
    p.textSize(textSize);
    p.strokeWeight(strokeWeight);
    const textWidth = Math.max(p.textWidth(variableB), p.textWidth(variableC));
    const effWidth = p.width - textWidth * 2;
    const effHeight = p.height - textSize * 2;
    const size = Math.min(effWidth, effHeight);
    const center = {
      x: effWidth / 2 + textWidth,
      y: effHeight * 2 / 3 + textSize
    };
    const radius = size / 2;
    const vA = {
      x: center.x,
      y: center.y - radius
    };
    const vB = {
      x: center.x - SQRT3_2 * radius,
      y: center.y + 0.5 * radius
    };
    const vC = {
      x: center.x + SQRT3_2 * radius,
      y: center.y + 0.5 * radius
    };

    let x = p.mouseX - vA.x;
    let y = p.mouseY - vA.y;
    const vAvect = {
      x: (center.x - vA.x) / radius,
      y: (center.y - vA.y) / radius
    };
    const fA = 1.0 - (x * vAvect.x + y * vAvect.y) / (1.5 * radius);

    x = p.mouseX - vB.x;
    y = p.mouseY - vB.y;
    const vBvect = {
      x: (center.x - vB.x) / radius,
      y: (center.y - vB.y) / radius
    };
    const fB = 1.0 - (x * vBvect.x + y * vBvect.y) / (1.5 * radius);

    x = p.mouseX - vC.x;
    y = p.mouseY - vC.y;
    const vCvect = {
      x: (center.x - vC.x) / radius,
      y: (center.y - vC.y) / radius
    };
    const fC = 1.0 - (x * vCvect.x + y * vCvect.y) / (1.5 * radius);

    if (0 <= fA && fA <= 1.0 && 0 <= fB && fB <= 1.0 && 0 <= fC && fC <= 1.0) {
      selected = {
        x: p.mouseX,
        y: p.mouseY,
        fA: fA,
        fB: fB,
        fC: fC
      };
      $download.removeAttribute('disabled');
    }
  }
}

function updateVariables() {
  variableA = $variableA.value;
  variableB = $variableB.value;
  variableC = $variableC.value;
}

function downloadPNG() {
  $download.blur();
  p5instance.saveCanvas("instagibbs", "png");
}

$variableA.addEventListener("change", updateVariables);
$variableB.addEventListener("change", updateVariables);
$variableC.addEventListener("change", updateVariables);
$download.addEventListener("click", downloadPNG);

updateVariables();
p5instance = new p5(sketch, $canvasContainer);