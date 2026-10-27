// CYFER / 01 — FLOW FIELD
// Controls: R regenerates, S saves a PNG.

let walkers = [];
const walkerCount = 900;
const stepSize = 1.7;

function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1);
  stroke(239, 238, 233, 48);
  noFill();
  regenerate();
}

function draw() {
  for (let i = 0; i < walkers.length; i++) {
    const p = walkers[i];
    const angle = noise(p.x * 0.0025, p.y * 0.0025, p.z) * TAU * 2.4;
    const nx = p.x + cos(angle) * stepSize;
    const ny = p.y + sin(angle) * stepSize;
    line(p.x, p.y, nx, ny);
    p.x = nx; p.y = ny; p.z += 0.001;
    if (p.x < 0 || p.x > width || p.y < 0 || p.y > height) resetWalker(p);
  }
}

function regenerate() {
  background(16);
  walkers = Array.from({ length: walkerCount }, () => ({
    x: random(width), y: random(height), z: random(1000)
  }));
}

function resetWalker(p) {
  p.x = random(width); p.y = random(height); p.z = random(1000);
}
function keyPressed() {
  if (key === 'r' || key === 'R') regenerate();
  if (key === 's' || key === 'S') saveCanvas('nullfield-flow-field', 'png');
}
function windowResized() { resizeCanvas(windowWidth, windowHeight); regenerate(); }
