// CYFER / 02 — ORBIT DRIFT
// Controls: Space pauses, R regenerates, S saves a PNG.

let bodies = [];
let paused = false;

function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1);
  regenerate();
}

function draw() {
  if (paused) return;
  background(16, 16, 16, 35);
  translate(width / 2, height / 2);
  noFill();
  stroke(239, 238, 233, 100);
  for (const b of bodies) {
    const a = frameCount * b.speed + b.phase;
    const x = cos(a) * b.radius;
    const y = sin(a * b.ratio) * b.radius * 0.58;
    circle(0, 0, b.radius * 2);
    stroke(214, 255, 56, 150);
    line(x, y, x * 1.07, y * 1.07);
    noStroke();
    fill(239, 238, 233, 180);
    circle(x, y, b.size);
    noFill();
    stroke(239, 238, 233, 100);
  }
}

function regenerate() {
  background(16);
  bodies = Array.from({ length: 11 }, (_, i) => ({
    radius: 25 + i * min(width, height) * 0.035,
    speed: random(-0.012, 0.012),
    phase: random(TAU),
    ratio: random(0.7, 1.4),
    size: random(2, 6)
  }));
}
function keyPressed() {
  if (key === ' ') paused = !paused;
  if (key === 'r' || key === 'R') regenerate();
  if (key === 's' || key === 'S') saveCanvas('nullfield-orbit-drift', 'png');
}
function windowResized() { resizeCanvas(windowWidth, windowHeight); regenerate(); }
