let cols = 15; 
let rows = 20;
let pointsPerLine = 1000; 
let animationSpeed = 1; 

let flowLines = [];
let compositionSeed = 12345;
let currentAnimStep = 150;

// SPATIAL GRID FOR COLLISION DETECTION
let grid = [];
let cellSize = 100;
let gridCols, gridRows;

// CYFER ARCHIVE PALETTE
const BG_COLOR = '#101010';
const COLORS = [
  '#efeee9',            // White
  '#d6ff38',            // Lime Accent
  'rgb(235, 255, 156)', // Light Yellow
  'rgb(135, 156, 56)'   // Olive
];

// =====================================================
// SETUP
// =====================================================

function setup() {
  createCanvas(windowWidth, windowHeight, SVG);
  pixelDensity(1);
  createComposition();
}

// =====================================================
// CREATE NEW COMPOSITION
// =====================================================

function createComposition() {
  compositionSeed = floor(random(100000000));
  randomSeed(compositionSeed);
  noiseSeed(compositionSeed);

  background(BG_COLOR); 
  
  gridCols = ceil(width / cellSize);
  gridRows = ceil(height / cellSize);
  grid = new Array(gridCols * gridRows).fill().map(() => []);

  // Pre-calculate the entire PCB routing
  generateFlow();
  
  currentAnimStep = 0;
}

// =====================================================
// DIRECTIONAL FIELD (THE INVISIBLE CHIP ARCHITECTURE)
// =====================================================

function getDesiredAngle(x, y) {
  let n = noise(x * 2.0, y * 2.0, compositionSeed * 0.001);
  let n2 = noise(x * 4.0 + 100, y * 4.0 + 100);
  let angle = map(n + n2 * 0.3, 0.2, 1.1, -PI, PI);
  return angle;
}

// =====================================================
// GENERATE FLOW LINES (PRE-CALCULATION)
// =====================================================

function generateFlow() {
  flowLines = [];

  let lineId = 0;
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      
      let startX = map(i, 0, cols - 1, -0.1, 1.1); 
      let startY = map(j, 0, rows - 1, -0.1, 1.1); 

      if (j % 2 === 0) startX += (1.0 / cols) * 0.5;

      let px = startX * width;
      let py = startY * height;
      
      let rawAngle = getDesiredAngle(startX, startY);
      let quantizedAngle = round(rawAngle / (PI / 4)) * (PI / 4);

    // Distribute the colors across the traces
      let colorRoll = random();
      let c;
      if (colorRoll < 0.55) {
        c = COLORS[0]; // 55% White
      } else if (colorRoll < 0.75) {
        c = COLORS[2]; // 20% Light Yellow
      } else if (colorRoll < 0.90) {
        c = COLORS[3]; // 15% Olive
      } else {
        c = COLORS[1]; // 10% Lime Accent
      }

      flowLines.push({
        id: lineId++,
        x: startX,
        y: startY,
        color: c, 
        pts: [{ x: px, y: py }],
        active: true,
        angle: quantizedAngle,
        stepsSinceTurn: 0,
        turnThreshold: floor(random(10, 40))
      });
      
      addToGrid(px, py, lineId - 1);
    }
  }

  let stepSize = 0.0025; 

  for (let p = 0; p < pointsPerLine; p++) {
    for (let i = 0; i < flowLines.length; i++) {
      let l = flowLines[i];
      if (!l.active) continue;

      l.stepsSinceTurn++;
      if (l.stepsSinceTurn > l.turnThreshold) {
        let rawAngle = getDesiredAngle(l.x, l.y);
        l.angle = round(rawAngle / (PI / 4)) * (PI / 4);
        l.stepsSinceTurn = 0;
        l.turnThreshold = floor(random(15, 60));
      }

      l.x += cos(l.angle) * stepSize; 
      l.y += sin(l.angle) * stepSize; 
      
      let px = l.x * width;
      let py = l.y * height;

      let nearest = getNearest(px, py, l.id);

      if (nearest) {
        l.pts.push({ x: nearest.x, y: nearest.y });
        l.active = false; 
      } else {
        l.pts.push({ x: px, y: py });
        addToGrid(px, py, l.id);
      }
    }
  }
}

// =====================================================
// SPATIAL GRID SYSTEM
// =====================================================

function addToGrid(px, py, lineId) {
  let cx = floor(px / cellSize);
  let cy = floor(py / cellSize);
  if (cx >= 0 && cx < gridCols && cy >= 0 && cy < gridRows) {
    grid[cx + cy * gridCols].push({ x: px, y: py, lineId: lineId });
  }
}

function getNearest(px, py, myLineId) {
  let cx = floor(px / cellSize);
  let cy = floor(py / cellSize);
  
  let minDist = 6.0; 
  let dMin = minDist * minDist;
  let closest = null;

  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      let nx = cx + i;
      let ny = cy + j;
      
      if (nx >= 0 && nx < gridCols && ny >= 0 && ny < gridRows) {
        let cell = grid[nx + ny * gridCols];
        for (let pt of cell) {
          if (pt.lineId !== myLineId) {
            let dsq = (pt.x - px) * (pt.x - px) + (pt.y - py) * (pt.y - py);
            if (dsq < dMin) {
              dMin = dsq;
              closest = pt;
            }
          }
        }
      }
    }
  }
  return closest;
}

// =====================================================
// ANIMATION DRAW LOOP
// =====================================================

function draw() {
  if (currentAnimStep >= pointsPerLine) return; 

  // Draw initial component pads on frame 0
  if (currentAnimStep === 0) {
    for (let i = 0; i < flowLines.length; i++) {
      let l = flowLines[i];
      let p0 = l.pts[0];
      
      fill(l.color);
      noStroke();
      rect(p0.x - 3, p0.y - 3, 6, 6); 
    }
  }

  // Draw all lines as continuous paths
  noFill();
  strokeWeight(1.2); 

  for (let i = 0; i < flowLines.length; i++) {
    let l = flowLines[i];
    
    if (currentAnimStep < l.pts.length) {
      stroke(l.color);
      noFill(); // Force no fill for this specific path
      
      // Use beginShape() WITHOUT endShape(CLOSE)
      beginShape();
      
      for (let p = 0; p <= currentAnimStep && p < l.pts.length; p++) {
        vertex(l.pts[p].x, l.pts[p].y);
      }
      
      endShape(); // <--- NO 'CLOSE' HERE. This is the fix.

      // Draw the terminating pad
      if (currentAnimStep + 1 === l.pts.length - 1) {
        let last = l.pts[l.pts.length - 1];
        fill(l.color);
        noStroke();
        rect(last.x - 2, last.y - 2, 4, 4); 
      }
    }
  }
  
  currentAnimStep += animationSpeed;
}

// =====================================================
// EXPORT
// =====================================================

function drawFlowForExport() {
  background(BG_COLOR);
  
  for (let i = 0; i < flowLines.length; i++) {
    let l = flowLines[i];
    if (l.pts.length < 2) continue;

    noFill();
    stroke(l.color); 
    strokeWeight(1.2); 

    beginShape();
    for (let p = 0; p < l.pts.length; p++) {
      vertex(l.pts[p].x, l.pts[p].y);
    }
    endShape();

    fill(l.color);
    noStroke();
    rect(l.pts[0].x - 3, l.pts[0].y - 3, 6, 6); 
    let last = l.pts[l.pts.length - 1];
    rect(last.x - 2, last.y - 2, 4, 4); 
  }
}

// =====================================================
// KEYBOARD (R = Randomize, S = PNG, Z = SVG)
// =====================================================

function keyPressed() {
  if (key === 'r' || key === 'R') {
    createComposition();
  }

  // S saves a PNG by taking a screenshot of the SVG
  if (key === 's' || key === 'S') {
    let svgElement = document.querySelector('svg');
    if (svgElement) {
      let svgData = new XMLSerializer().serializeToString(svgElement);
      let img = new Image();
      let svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      let url = URL.createObjectURL(svgBlob);
      
      img.onload = function() {
        // Draw it to a hidden standard canvas to convert to PNG
        let canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        let ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        
        // Trigger the download
        let pngUrl = canvas.toDataURL('image/png');
        let a = document.createElement('a');
        a.href = pngUrl;
        a.download = '05-trace-route.png';
        a.click();
        
        URL.revokeObjectURL(url);
      };
      img.src = url;
    }
  }

  // Z saves the raw SVG
  if (key === 'z' || key === 'Z') {
    drawFlowForExport();

    let svg = document.querySelector('svg');
    if (svg) {
      let serializer = new XMLSerializer();
      let source = serializer.serializeToString(svg);
      let blob = new Blob([source], { type: 'image/svg+xml' });
      let url = URL.createObjectURL(blob);
      let a = document.createElement('a');

      a.href = url;
      a.download = '05-trace-route.svg';
      a.click();
      URL.revokeObjectURL(url);
      
      // Restart animation post-save
      background(BG_COLOR);
      currentAnimStep = 0;
    }
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  createComposition();
}
