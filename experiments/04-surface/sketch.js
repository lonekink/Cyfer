let cols = 60; 
let rows = 15; 

let compositionSeed = 12345;
let quads = [];

function setup() {
  // 1. Regular Canvas for PNG generation
  createCanvas(windowWidth, windowHeight); 
  pixelDensity(1);
  createComposition();
}

function createComposition() {
  compositionSeed = floor(random(100000000));
  randomSeed(compositionSeed);
  noiseSeed(compositionSeed);
}

function draw() {
  // 2. Dark background matching --bg
  background('#101010'); 
  
  generateMesh();
  drawMesh();
}

function generateMesh() {
  quads = [];
  let pts = [];
  let time = frameCount * 0.015; 

  // Scale mapping slightly to fit window height dynamically
  let widthScale = width * 0.55;
  let heightScale = height * 0.6;

  for (let i = 0; i < cols; i++) {
    pts[i] = [];
    let u = i / (cols - 1); 

    for (let j = 0; j < rows; j++) {
      let v = j / (rows - 1); 

      let x = map(u, 0, 1, -widthScale, widthScale);
      let widthPinch = 1.0 - abs(u - 0.5) * 0.4;
      let z = map(v, 0, 1, -heightScale, heightScale) * widthPinch;

      // MACRO STRUCTURE: Flowing sine wave
      let y = sin(u * PI * 2.5 + compositionSeed - time * 2.0) * (heightScale * 0.5);

      // TWIST
      let twist = cos(u * PI * 1.5 + compositionSeed - time * 1.5) * map(v, 0, 1, -250, 250);
      y += twist;

      // TOPOGRAPHY
      let nx = x * 0.001;
      let nz = z * 0.001;
      let elevation = 0;
      let amp = 220;
      let freq = 1.0;

      for (let o = 0; o < 3; o++) {
        let n = noise(nx * freq + compositionSeed, nz * freq + compositionSeed, time * 0.6);
        n = 1.0 - abs(2.0 * n - 1.0); 
        n = n * n; 
        elevation += n * amp;
        amp *= 0.45;
        freq *= 2.2;
      }
      y -= elevation;

      pts[i][j] = project3D(x, y, z);
    }
  }

  for (let i = 0; i < cols - 1; i++) {
    for (let j = 0; j < rows - 1; j++) {
      let p1 = pts[i][j];
      let p2 = pts[i + 1][j];
      let p3 = pts[i + 1][j + 1];
      let p4 = pts[i][j + 1];
      let avgZ = (p1.z + p2.z + p3.z + p4.z) / 4;
      quads.push({ p1: p1, p2: p2, p3: p3, p4: p4, z: avgZ });
    }
  }
  quads.sort((a, b) => b.z - a.z);
}

function project3D(x, y, z) {
  let rotX = 0.55; 
  let rotY = -0.40; 

  let x1 = x * cos(rotY) - z * sin(rotY);
  let z1 = x * sin(rotY) + z * cos(rotY);

  let y2 = y * cos(rotX) - z1 * sin(rotX);
  let z2 = y * sin(rotX) + z1 * cos(rotX);

  let fov = 2000;
  let scale = fov / (fov + z2 + 800);

  let px = x1 * scale + width / 2;
  let py = y2 * scale + height / 2; 

  return { x: px, y: py, z: z2 };
}

function drawMesh() {
  // 3. Dark Fill matching --bg
  fill('#101010'); 
  
  // Line color: mostly white, but occasionally hits the lime accent
  if (frameCount % 120 > 15 && frameCount % 120 < 35) {
    stroke(214, 255, 56, 220); // --accent (#d6ff38)
  } else {
    stroke(239, 238, 233, 180); // --fg (#efeee9)
  }
  
  strokeWeight(0.65); 

  for (let i = 0; i < quads.length; i++) {
    let q = quads[i];
    beginShape();
    vertex(q.p1.x, q.p1.y);
    vertex(q.p2.x, q.p2.y);
    vertex(q.p3.x, q.p3.y);
    vertex(q.p4.x, q.p4.y);
    endShape(CLOSE);
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function keyPressed() {
  if (key === 'r' || key === 'R') {
    createComposition();
  }

  // Secret Z key: Save SVG
  if (key === 'z' || key === 'Z') {
    saveVector();
  }
}

// Function to temporarily generate and save SVG
function saveVector() {
  // Create an off-screen SVG canvas
  let s = createGraphics(width, height, SVG);
  
  // Re-draw the current mesh state into the SVG canvas
  s.fill('#101010');
  s.stroke(239, 238, 233);
  s.strokeWeight(0.65);

  for (let i = 0; i < quads.length; i++) {
    let q = quads[i];
    s.beginShape();
    s.vertex(q.p1.x, q.p1.y);
    s.vertex(q.p2.x, q.p2.y);
    s.vertex(q.p3.x, q.p3.y);
    s.vertex(q.p4.x, q.p4.y);
    s.endShape(CLOSE);
  }
  
  // Save and remove from memory
  save(s, '04-flowing-fabric.svg');
  s.remove();
}