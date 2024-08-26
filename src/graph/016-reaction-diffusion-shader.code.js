const SEED_COUNT = 2000;
const SEED_SIZE = 5;

let SCALE = 1.0;
let DrA = 0.86, DrB = 0.35, Fr = 0.0418, Kr = 0.0596;

let rdKillFeed, rdDiffusion, rdPreview;
let showPreview = false, showHelp = false;
let font;

let rdVert = `
precision highp float;

attribute vec3 aPosition;
attribute vec2 aTexCoord;
attribute vec4 aVertexColor;

uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;

varying vec2 vTexCoord;
varying vec4 vVertexColor;

void main() {
  vec4 viewModelPosition = uModelViewMatrix * vec4(aPosition, 1.0);
  gl_Position = uProjectionMatrix * viewModelPosition;

  vVertexColor = aVertexColor;
  vTexCoord = aTexCoord;
}
`;
let rdFrag = `
#define DELTA_T 1.0
#define GRADIENT_NONE 0
#define GRADIENT_KILL_FEED 1
#define GRADIENT_DIFFUSION 2

precision highp float;

varying vec2 vTexCoord;

uniform vec2 uTextureScale;
uniform sampler2D uBufferTexture;
uniform float uDiffusionRateA;
uniform float uDiffusionRateB;
uniform float uFeedRate;
uniform float uKillRate;
uniform int uRateGradient;
uniform bool uWrapAround;

vec2 read(vec2 coords) {
  vec2 safeCoords = coords;

  if (uWrapAround == true) {
    safeCoords = fract(safeCoords);
  }
  vec4 raw = texture2D(uBufferTexture, safeCoords);

  return raw.xy;
}

vec2 offset(vec2 xy) {
  return vTexCoord + xy * uTextureScale;
}

float map(float n, float min, float max) {
  return min + n * (max - min);
}

void main() {
  float DrA = uDiffusionRateA;
  float DrB = uDiffusionRateB;
  float Fr = uFeedRate;
  float Kr = uKillRate;

  vec2 self = read(vTexCoord);
  vec2 conv = 0.05 * read(offset(vec2(-1.0, -1.0))) +
    0.2 * read(offset(vec2(0.0, -1.0))) +
    0.05 * read(offset(vec2(1.0, -1.0))) +
    0.2 * read(offset(vec2(-1.0, 0.0))) +
    0.2 * read(offset(vec2(1.0, 0.0))) +
    0.05 * read(offset(vec2(-1.0, 1.0))) + 
    0.2 * read(offset(vec2(0.0, 1.0))) +
    0.05 * read(offset(vec2(1.0, 1.0))) - self;

  if (uRateGradient == GRADIENT_KILL_FEED) {
    Kr = map(vTexCoord.x, 0.045, 0.07);
    Fr = map(vTexCoord.y, 0.01, 0.1);
  } else if (uRateGradient == GRADIENT_DIFFUSION) {
    DrA = map(vTexCoord.x, 0.01, 1.0);
    DrB = map(vTexCoord.y, 0.01, 1.0);
  }

  vec2 next = self + DELTA_T * vec2(
    (DrA * conv.x - self.x * self.y * self.y + Fr * (1.0 - self.x)),
    (DrB * conv.y + self.x * self.y * self.y - (Kr + Fr) * self.y)
  );

  gl_FragColor = vec4(clamp(next, 0.0, 1.0), 0.0, 1.0);
}
`;
let rdRenderFrag = `
precision highp float;

varying vec2 vTexCoord;

uniform sampler2D uBufferTexture;
uniform float uFrameCount;

vec3 hsb2rgb(vec3 c) {
  vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

vec2 read(vec2 coords) {
  vec2 safeCoords = fract(coords);
  vec4 raw = texture2D(uBufferTexture, safeCoords);

  return raw.xy;
}

void main() {
  vec2 self = read(vTexCoord);
  float t = 0.5 - (self.y - self.x) * 0.5;
  vec3 hsb = vec3(fract(t + uFrameCount * 0.001), 1.0, 1.0);

  gl_FragColor = vec4(hsb2rgb(hsb), 1.0);
}
`;

class ReactionDifussion {
  constructor(width, height, rateGradient = ReactionDifussion.GRADIENT_NONE, wrapAround = true) {
    let bufferOptions = {
      antialias: false,
      textureFiltering: p.NEAREST
    };
    if (width) bufferOptions.width = width;
    if (height) bufferOptions.height = height;
    this.bufferA = p.createFramebuffer(bufferOptions);
    this.bufferB = p.createFramebuffer(bufferOptions);
    this.width = this.bufferA.width;
    this.height = this.bufferA.height;
    this.rateGradient = rateGradient;
    this.wrapAround = wrapAround;
  }

  init() {
    this.bufferA.begin();
    p.background(255, 0, 0, 255);
    for (let n = 0; n < SEED_COUNT / SCALE; n++) {
      p.fill(255, 255, 0, 255);
      p.circle(p.random(-this.width * 0.5, this.width * 0.5), p.random(-this.height * 0.5, this.height * 0.5), SEED_SIZE);
    }
    this.bufferA.end();
  }

  next() {
    this.bufferB.begin();
    p.shader(ReactionDifussion.rdShader);
    ReactionDifussion.rdShader.setUniform('uTextureScale', [1.0 / this.width, 1.0 / this.height]);
    ReactionDifussion.rdShader.setUniform('uDiffusionRateA', DrA);
    ReactionDifussion.rdShader.setUniform('uDiffusionRateB', DrB);
    ReactionDifussion.rdShader.setUniform('uFeedRate', Fr);
    ReactionDifussion.rdShader.setUniform('uKillRate', Kr);
    ReactionDifussion.rdShader.setUniform('uRateGradient', this.rateGradient);
    ReactionDifussion.rdShader.setUniform('uWrapAround', this.wrapAround);
    ReactionDifussion.rdShader.setUniform('uBufferTexture', this.bufferA.color);
    p.noStroke();
    p.plane(this.width, this.height);
    this.bufferB.end();

    [this.bufferA, this.bufferB] = [this.bufferB, this.bufferA];
  }

  render() {
    p.shader(ReactionDifussion.rdRenderShader);
    ReactionDifussion.rdRenderShader.setUniform('uBufferTexture', this.bufferA.color);
    ReactionDifussion.rdRenderShader.setUniform('uFrameCount', p.frameCount);
    p.noStroke();
    p.plane(this.width, this.height);
    p.resetShader();
  }
  
  resize(width, height) {
    this.bufferA.resize(width, height);
    this.bufferB.resize(width, height);
    this.width = this.bufferA.width;
    this.height = this.bufferA.height;
  }

  static loadShaders() {
    this.rdShader = p.createShader(rdVert, rdFrag);
    this.rdRenderShader = p.createShader(rdVert, rdRenderFrag);
  }
}
ReactionDifussion.GRADIENT_NONE = 0
ReactionDifussion.GRADIENT_KILL_FEED = 1
ReactionDifussion.GRADIENT_DIFFUSION = 2;

p.preload = () => {
  ReactionDifussion.loadShaders();
  font = p.loadFont('/assets/fonts/BerkeleyMono-Bold.otf');
}

p.setup = () => {
  p.createCanvas(clientWidth, clientHeight, p.WEBGL);
  p.setFrameRate(120);
  p.pixelDensity(1);

  rdKillFeed = new ReactionDifussion(p.width * 0.5 / SCALE, p.height / SCALE, ReactionDifussion.GRADIENT_KILL_FEED, false);
  rdDiffusion = new ReactionDifussion(p.width * 0.5 / SCALE, p.height / SCALE, ReactionDifussion.GRADIENT_DIFFUSION, false);
  rdPreview = new ReactionDifussion(p.width / SCALE, p.height / SCALE);
  init();
}

p.draw = (skipText) => {
  p.clear();

  if (showPreview) {
    rdPreview.next();

    p.push();
    p.scale(SCALE);
    rdPreview.render();
    p.pop();
  } else {
    rdKillFeed.next();
    rdDiffusion.next();

    p.push();
    p.translate(-p.width * 0.25, 0, 0);
    p.scale(SCALE);
    rdKillFeed.render();
    p.pop();
    p.push();
    p.translate(p.width * 0.25, 0, 0);
    p.scale(SCALE);
    rdDiffusion.render();
    p.pop();
  }

  if (skipText) return;
  
  p.fill('white');
  p.textFont(font);
  p.textSize(24);

  p.push();
  p.translate(-p.width * 0.5, -p.height * 0.5);
  p.text(`Kr : ${Kr.toFixed(4)}`, 8, 20);
  p.text(`Fr : ${Fr.toFixed(4)}`, 8, 20 + 24);
  p.text(`DrA: ${DrA.toFixed(4)}`, 8, 20 + 48);
  p.text(`DrB: ${DrB.toFixed(4)}`, 8, 20 + 72);
  p.pop();

  p.push();
  p.translate(p.width * 0.5, -p.height * 0.5);
  p.text(`Scale: ${SCALE.toFixed(2)}`, -165, 20);
  p.pop();

  p.push();
  p.translate(p.width * 0.5, p.height * 0.5);
  p.text(`Press ? to toggle instructions.`, -450, -8);
  p.pop();

  p.push();
  p.translate(-p.width * 0.5, p.height * 0.5);
  if (showHelp) {
    if (showPreview) {
      p.text(`Press X to export as PNG.`, 8, -8 - 96);
      p.text(`Press P to go back.`, 8, -8 - 72);
      p.text(`Press S to re-seed.`, 8, -8 - 48);
      p.text(`Press + and - to adjust scale.`, 8, -8 - 24);
      p.text(`Press R to reset all parameters.`, 8, -8);
    } else {
      p.text(`Click on the left to set Kill (Kr) and Feed (Fr) Rates.`, 8, -8 - 120);
      p.text(`Click on the right to set Difussion rates (DrA, DrB).`, 8, -8 - 96);
      p.text(`Press P to preview the current parameters in full-screen mode.`, 8, -8 - 72);
      p.text(`Press S to re-seed.`, 8, -8 - 48);
      p.text(`Press + and - to adjust scale.`, 8, -8 - 24);
      p.text(`Press R to reset all parameters.`, 8, -8);
    }
  }
  p.pop();
}

p.mouseClicked = () => {
  if (p.width === 0 || p.height === 0) return;
  if (showPreview) return;

  if (p.mouseX < p.width * 0.5) {
    Kr = p.map(p.mouseX, 0, p.width * 0.5, 0.045, 0.07);
    Fr = p.map(p.mouseY, 0, p.height, 0.01, 0.1);

    rdDiffusion.init();
  } else {
    DrA = p.map(p.mouseX, p.width * 0.5, p.width, 0.01, 1.0);
    DrB = p.map(p.mouseY, 0, p.height, 0.01, 1.0);

    rdKillFeed.init();
  }
}

p.keyPressed = () => {
  switch (p.key) {
    case '?':
      showHelp = !showHelp;
      break;
    case 'R':
    case 'r':
      SCALE = 1.0;
      DrA = 0.86; DrB = 0.35; Fr = 0.0418; Kr = 0.0596;
      p.resize();
      init();
      break;
    case 'S':
    case 's':
      init();
      break;
    case 'P':
    case 'p':
      showPreview = !showPreview;
      init();
      break;
    case 'X':
    case 'x':
      if (!showPreview) return;
      p.draw(true);
      p.saveCanvas('reaction-difussion', 'png');
      break;
    case '-':
      SCALE = p.constrain(SCALE - 0.1, 0.5, 10.0);
      p.resize();
      init();
      break;
    case '+':
      SCALE = p.constrain(SCALE + 0.1, 0.5, 10.0);
      p.resize();
      init();
      break;
  }
}

p.resize = () => {
  rdKillFeed.resize(p.width * 0.5 / SCALE, p.height / SCALE);
  rdDiffusion.resize(p.width * 0.5 / SCALE, p.height / SCALE);
  rdPreview.resize(p.width / SCALE, p.height / SCALE);
}

function init() {
  if (showPreview) {
    rdPreview.init();
  } else {
    rdKillFeed.init();
    rdDiffusion.init();
  }
}