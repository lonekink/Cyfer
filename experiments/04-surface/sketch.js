let cols = 60; 
let rows = 15; 

let compositionSeed = 12345;
let quads = [];

// =====================================================
// SETUP
// =====================================================

function setup() {
  // Use standard canvas so 'S' saves a PNG easily
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1);
  createComposition();
}

function createComposition() {
  compositionSeed = floor(random(100000000));
  randomSeed(compositionSeed);
  noiseSeed(compositionSeed);
}

// =====================================================
// ANIMATION LOOP
// =====================================================

function draw() {
  // Dark background matching your --bg variable
  background('#101010'); 

  generateMesh();
  drawMesh();
}

// =====================================================
// MESH GENERATION & 3D PROJECTION
// =====================================================

function generateMesh() {
  quads = [];
  let pts = [];
  
  // Subtle wave motion for the macro structure only
  let time = frameCount * 0.005; 

  // Scale maps to fill the screen and go beyond the edges
  let xScale = width * 0.95; 
  let zScale = width * 0.6;

  // 1. GENERATE THE 3D VERTICES
  for (let i = 0; i < cols; i++) {
    pts[i] = [];
    let u = i / (cols - 1); 

    for (let j = 0; j < rows; j++) {
      let v = j / (rows - 1); 

      // Push X and Z so it bleeds off the edges
      let x = map(u, 0, 1, -xScale, xScale);
      let widthPinch = 1.0 - abs(u - 0.5) * 0.3;
      let z = map(v, 0, 1, -zScale, zScale) * widthPinch;

      // MACRO STRUCTURE: Flowing sine wave (Very slow, like tectonic shifting)
      let y = sin(u * PI * 2.5 + compositionSeed - time) * 300;

      // TWIST: The ribbon banks and folds
      let twist = cos(u * PI * 1.5 + compositionSeed - time * 0.5) * map(v, 0, 1, -250, 250);
      y += twist;

      // TOPOGRAPHY / ROCKY WAVES
      let nx = x * 0.001;
      let nz = z * 0.001;
      let elevation = 0;
      let amp = 280; // Higher amplitude for taller mountains
      let freq = 1.2;

      for (let o = 0; o < 3; o++) {
        // NO TIME IN NOISE: This makes the rock static. 
        // The '1.0 - abs(...)' trick creates sharp ridges instead of soft hills.
        let n = noise(nx * freq + compositionSeed, nz * freq + compositionSeed);
        n = 1.0 - abs(2.0 * n - 1.0); 
        n = pow(n, 2.0); // Sharpen the peaks
        
        elevation += n * amp;
        amp *= 0.45;
        freq *= 2.2;
      }

      y -= elevation;

      // PROJECTION
      pts[i][j] = project3D(x, y, z);
    }
  }

  // 2. CONVERT VERTICES INTO POLYGONS (QUADS)
  for (let i = 0; i < cols - 1; i++) {
    for (let j = 0; j < rows - 1; j++) {
      let p1 = pts[i][j];
      let p2 = pts[i + 1][j];
      let p3 = pts[i + 1][j + 1];
      let p4 = pts[i][j + 1];

      let avgZ = (p1.z + p2.z + p3.z + p4.z) / 4;

      quads.push({
        p1: p1, p2: p2, p3: p3, p4: p4,
        z: avgZ
      });
    }
  }

  // 3. SORT QUADS BY DEPTH
  quads.sort((a, b) => b.z - a.z);
}

function project3D(x, y, z) {
  let rotX = 0.55; 
  let rotY = -0.40; 

  let x1 = x * cos(rotY) - z * sin(rotY);
  let z1 = x * sin(rotY) + z * cos(rotY);

  let y2 = y * cos(rotX) - z1 * sin(rotX);
  let z2 = y * sin(rotX) + z1 * cos(rotX);

  // Bring the fov down and camera closer to make it massive on screen
  let fov = 1200; 
  let scale = fov / (fov + z2 + 400);

  // Centered vertically, slightly offset so it bleeds top and bottom
  let px = x1 * scale + width / 2;
  let py = y2 * scale + height / 2 + 50; 

  return { x: px, y: py, z: z2 };
}

// =====================================================
// DRAW MESH
// =====================================================

function drawMesh() {
  // Dark fill to hide background quads
  fill('#101010'); 
  
  // Use your site's white/grey text color for the lines
  stroke(239, 238, 233, 180); 
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

// =====================================================
// KEYBOARD (R = Randomize, S = Save PNG, Z = Save SVG)
// =====================================================

function keyPressed() {
  if (key === 'r' || key === 'R') {
    createComposition();
  }

  if (key === 's' || key === 'S') {
    saveCanvas('04-mesh-topology', 'png');
  }

  if (key === 'z' || key === 'Z') {
    saveVector();
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

// =====================================================
// SECRET SVG EXPORT
// =====================================================
function saveVector() {
  // Create an offscreen SVG canvas
  let s = createGraphics(width, height, SVG);
  
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
  
  save(s, '04-mesh-topology.svg');
  s.remove();
}
