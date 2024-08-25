let conwayShader, renderShader;
let bufferA, bufferB;
let mic, fft;

let conwayVert = `
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
}`;
let conwayFrag = `
precision highp float;

varying vec2 vTexCoord;

uniform vec2 uTextureScale;
uniform sampler2D uBufferTexture;
uniform float uFrameCount;

// Safely reads data from the texture at the given coords
int read(vec2 coords) {
  // Wrap around by keeping the fractional part only
  vec2 safeCoords = fract(coords);
  vec4 raw = texture2D(uBufferTexture, safeCoords);

  // Red is life
  if (raw.r == 1.0) {
    return 1;
  } else {
    return 0;
  }
}

// Adds a screen-space offset to the texture-space coordinates
vec2 offset(vec2 xy) {
  // GLSL is nice sometimes
  return vTexCoord + xy * uTextureScale;
}

void main() {
  int self = read(vTexCoord);
  int neighbors = read(offset(vec2(-1.0, -1.0))) +
    read(offset(vec2(0.0, -1.0))) +
    read(offset(vec2(1.0, -1.0))) +
    read(offset(vec2(-1.0, 0.0))) +
    read(offset(vec2(1.0, 0.0))) +
    read(offset(vec2(-1.0, 1.0))) + 
    read(offset(vec2(0.0, 1.0))) +
    read(offset(vec2(1.0, 1.0)));

  // https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life#Rules
  if (self == 1 && neighbors != 2 && neighbors != 3) {
    self = 0;
  } else if (self == 0 && neighbors == 3) {
    self = 1;
  }

  if (self == 1) {
    // Red is life, Green is age
    vec4 raw = texture2D(uBufferTexture, vTexCoord);
    gl_FragColor = vec4(1.0, raw.g + 0.01 + fract(uFrameCount * 0.01), 0.0, 1.0);
  } else {
    gl_FragColor = vec4(vec3(0.0), 1.0);
  }
}`;
let renderFrag = `
precision highp float;

varying vec2 vTexCoord;

uniform sampler2D uBufferTexture;

vec2 read(vec2 coords) {
  vec2 safeCoords = fract(coords);
  vec4 raw = texture2D(uBufferTexture, safeCoords);

  return raw.rg;
}

vec3 hsb2rgb(vec3 c) {
  vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

void main() {
  vec2 self = read(vTexCoord);

  if (self.r == 1.0) {
    vec3 hsb = vec3(fract(0.917 + self.g), 0.59, 1.0);
    gl_FragColor = vec4(hsb2rgb(hsb), 1.0);
  } else {
    gl_FragColor = vec4(vec3(0.0), 1.0);
  }
}
`;

p.preload = () => {
  conwayShader = p.createShader(conwayVert, conwayFrag);
  renderShader = p.createShader(conwayVert, renderFrag);
}

p.setup = () => {
  p.createCanvas(clientWidth, clientHeight, p.WEBGL);
  p.setFrameRate(60);
  p.pixelDensity(1);
  p.noSmooth();
  p.noStroke();
  
  mic = new p5.AudioIn();
  mic.start();
  fft = new p5.FFT();
  fft.setInput(mic);

  let bufferOptions = {
    antialias: false,
    textureFiltering: p.NEAREST
  };
  bufferA = p.createFramebuffer(bufferOptions);
  bufferB = p.createFramebuffer(bufferOptions);

  p.shader(conwayShader);
  conwayShader.setUniform('uTextureScale', [1.0 / p.width, 1.0 / p.height]);
  p.resetShader();
}

p.draw = () => {
  let waveform = fft.waveform();
  
  // Set additional data into bufferA if needed
  bufferA.begin();
  p.stroke(255, 0, 0, 255);
  //p.strokeWeight(2);
  p.noFill();
  p.beginShape();
  for (let i = 0; i < waveform.length; i++){
    let x = p.map(i, 0, waveform.length, -p.width/2, p.width/2);
    let y = p.map(waveform[i], -1, 1, -p.height/2, p.height/2);
    p.vertex(x,y);
  }
  p.endShape();
  bufferA.end();
  // Render into bufferB using bufferA as texture
  bufferB.begin();
  p.shader(conwayShader);
  conwayShader.setUniform('uBufferTexture', bufferA.color);
  conwayShader.setUniform('uFrameCount', p.frameCount);
  // Update the entire buffer
  p.plane(p.width, p.height);
  bufferB.end();

  // Render bufferB into the canvas
  p.shader(renderShader);
  renderShader.setUniform('uBufferTexture', bufferB.color);
  p.plane(p.width, p.height);
  
  // Swap buffers
  [bufferA, bufferB] = [bufferB, bufferA];
}