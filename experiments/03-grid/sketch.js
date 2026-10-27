// NULLFIELD / 03 — NOISE MATRIX
// Controls: R regenerates, S saves a PNG.

let seed = 1;

function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1);
  noLoop();
  renderGrid();
}

function renderGrid() {
  randomSeed(seed);
  noiseSeed(seed);
  background(16);
  const gap = max(14, min(width, height) / 34);
  const cols = floor(width / gap);
  const rows = floor(height / gap);
  noStroke();
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const n = noise(x * 0.11, y * 0.11);
      const size = map(n, 0, 1, 1, gap * 0.92);
      const roll = random();
      if (roll > 0.965) fill(214, 255, 56);
      else fill(239, 238, 233, map(n, 0, 1, 35, 190));
      if (roll > 0.25) rect(x * gap + gap / 2, y * gap + gap / 2, size, size);
      else circle(x * gap + gap / 2, y * gap + gap / 2, size);
    }
  }
}
function keyPressed() {
  if (key === 'r' || key === 'R') { seed++; renderGrid(); }
  if (key === 's' || key === 'S') saveCanvas('nullfield-noise-matrix', 'png');
}
function windowResized() { resizeCanvas(windowWidth, windowHeight); renderGrid(); }
