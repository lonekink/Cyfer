let cols = 60; 
let rows = 15; 

let compositionSeed = 12345;
let quads = [];

// =====================================================
// SETUP
// =====================================================

function setup() {
  // Original fixed SVG canvas structure
createCanvas(windowWidth, windowHeight, SVG);
  pixelDensity(1);
  createComposition();
  noLoop();
}

// =====================================================
// CREATE NEW COMPOSITION
// =====================================================

function createComposition() {
  compositionSeed = floor(random(100000000));
  randomSeed(compositionSeed);
  noiseSeed(compositionSeed);
}

// =====================================================
// ANIMATION LOOP
// =====================================================

function draw() {
  // Original soft, warm cartographic paper background
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
  
  // Very slow tectonic drift
let time = frameCount * 0.008; 

  // 1. GENERATE THE 3D VERTICES
  for (let i = 0; i < cols; i++) {
    pts[i] = [];
    let u = i / (cols - 1); 

    for (let j = 0; j < rows; j++) {
      let v = j / (rows - 1); 

      // Original bounds
     let x = map(u, 0, 1, -width * 1.2, width * 1.2);
      let widthPinch = 1.0 - abs(u - 0.5) * 0.4;
      let z = map(v, 0, 1, -350 * widthPinch, 350 * widthPinch);

      // MACRO STRUCTURE: Gentle rolling wave
      let y = sin(u * PI * 2.5 + compositionSeed - time) * 300;

      // TWIST
      let twist = cos(u * PI * 1.5 + compositionSeed - time * 0.5) * map(v, 0, 1, -250, 250);
      y += twist;

      // TOPOGRAPHY / ROCKY MOUNTAINS
      let nx = x * 0.001;
      let nz = z * 0.001;
      let elevation = 0;
      let amp = 300; 
      let freq = 1.0;

      for (let o = 0; o < 3; o++) {
        // Removed 'time' from noise to make rock static
      let n = noise(nx * freq + compositionSeed, nz * freq + compositionSeed, time * 0.15);        
        // Sharpened jagged peaks
        n = 1.0 - abs(2.0 * n - 1.0); 
        n = pow(n, 2.5); 
        
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

  // Original camera settings
  let fov = 2000;
  let scale = fov / (fov + z2 + 800);

  // Original offsets
  let px = x1 * scale + width / 2;
  let py = y2 * scale + height / 2 + 150; 

  return { x: px, y: py, z: z2 };
}

// =====================================================
// DRAW MESH
// =====================================================

function drawMesh() {
fill('#101010'); 
  stroke(239, 238, 233, 200); 
  strokeWeight(0.65); 

  for (let i = 0; i < quads.length; i++) {
    let q = quads[i];
    
    quad(q.p1.x, q.p1.y, q.p2.x, q.p2.y, q.p3.x, q.p3.y, q.p4.x, q.p4.y);

  }
}

// =====================================================
// KEYBOARD (R = Randomize, S = Save PNG, Z = Save SVG)
// =====================================================

function keyPressed() {
  if (key === 'r' || key === 'R') {
    createComposition();
  }

  // S saves standard PNG (as requested for the other sketches)
  if (key === 's' || key === 'S') {
    saveCanvas('04-mesh-topology', 'png');
  }

  // Secret Z saves SVG (original format)
  if (key === 'z' || key === 'Z') {
    let svg = document.querySelector('svg');
    let serializer = new XMLSerializer();
    let source = serializer.serializeToString(svg);
    let blob = new Blob([source], { type: 'image/svg+xml' });
    let url = URL.createObjectURL(blob);
    let a = document.createElement('a');

    a.href = url;
    a.download = '04-mesh-topology.svg'; 
    a.click();
    URL.revokeObjectURL(url);
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
