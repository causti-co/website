const CANVAS_SIZE = 512;
const ORIGIN_2D = 0;
const ORIGIN_3D = -CANVAS_SIZE/2;
const NOISE_SPEED = 0.005;
const ANGULAR_SPEED = 0.05;
const HUE_SPEED = 2;

let canvas;
let buffer3d;
let camera;

let noiseSeed;
let angle;
let hue;

p.setup = () => {
  canvas = p.createCanvas(CANVAS_SIZE, CANVAS_SIZE, p.WEBGL);
  canvas.background(0);

  buffer3d = p.createFramebuffer();
  buffer3d.begin();
  camera = buffer3d.createCamera();
  camera.setPosition(400, 0, 800);
  camera.lookAt(0, 0, 0);
  buffer3d.end();

  p.frameRate(60);
  p.colorMode(p.HSB, 360, 100, 100);

  noiseSeed = p.random(-1000, 1000);
  angle = p.random() * p.TAU;
  hue = Math.floor(p.random() * 360);
}

p.draw = () => {
  angle += ANGULAR_SPEED * p.noise(noiseSeed, p.frameCount * NOISE_SPEED) - ANGULAR_SPEED/2;
  hue = (hue + HUE_SPEED) % 360;

  buffer3d.begin();
  p.setCamera(camera);
  p.resetMatrix();
  p.fill(hue, 100, 100);
  p.stroke("black");
  p.clear();
  p.push();
  p.rotateX(p.frameCount * 0.05);
  p.box(128);
  p.pop();
  p.orbitControl();
  buffer3d.end();

  let v = p5.Vector.fromAngle(angle, 8);
  p.copy(canvas, ORIGIN_2D + v.x, ORIGIN_2D + v.y, CANVAS_SIZE, CANVAS_SIZE, ORIGIN_3D, ORIGIN_3D, CANVAS_SIZE, CANVAS_SIZE);
  p.image(buffer3d, ORIGIN_3D, ORIGIN_3D, CANVAS_SIZE, CANVAS_SIZE)
}