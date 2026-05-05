let capture;
let faceMesh;
let faces = [];
let options = { maxFaces: 1, refineLandmarks: true, flipHorizontal: false };

// --- 修正後的點位定義 ---
// 1. 嘴唇 (紅線, 粗 1)
let lip1 = [409, 270, 269, 267, 0, 37, 39, 40, 185, 61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291];
let lip2 = [76, 77, 90, 180, 85, 16, 315, 404, 320, 307, 306, 408, 304, 303, 302, 11, 72, 73, 74, 184];

// 2. 眼睛 (黑眼圈效果, 灰黑, 粗 15)
let eyeR = [33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246];
let eyeL = [362, 382, 381, 380, 374, 373, 390, 249, 263, 466, 388, 387, 386, 385, 384, 398];

// 3. 臉部輪廓 (螢光藍, 粗 2) - 重新排列的標準點位
let faceOval = [10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379, 378, 400, 377, 152, 148, 176, 149, 150, 136, 172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109];

function preload() {
  faceMesh = ml5.faceMesh(options);
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  capture = createCapture(VIDEO, (stream) => {
    faceMesh.detectStart(capture, gotFaces);
  });
  capture.size(640, 480);
  capture.hide();
}

function gotFaces(results) {
  faces = results;
}

function draw() {
  background('#e7c6ff');

  // 文字顯示
  fill(0);
  noStroke();
  textSize(32);
  textAlign(CENTER, CENTER);
  text("教科414730860", width / 2, 50);

  let imgW = width * 0.5;
  let imgH = height * 0.5;
  let x = (width - imgW) / 2;
  let y = (height - imgH) / 2;

  push();
  translate(x + imgW, y);
  scale(-1, 1);
  image(capture, 0, 0, imgW, imgH);

  if (faces.length > 0) {
    let face = faces[0];

    // --- 畫臉部輪廓：螢光藍 ---
    stroke(0, 255, 255); // 螢光藍
    strokeWeight(2);
    noFill();
    renderLines(face, faceOval, imgW, imgH, true);

    // --- 畫黑眼圈：深灰色 ---
    stroke(50); 
    strokeWeight(15);
    renderLines(face, eyeR, imgW, imgH, true);
    renderLines(face, eyeL, imgW, imgH, true);

    // --- 畫嘴唇：紅色 ---
    stroke(255, 0, 0);
    strokeWeight(1);
    renderLines(face, lip1, imgW, imgH, false);
    renderLines(face, lip2, imgW, imgH, false);
  }
  pop();
}

// 統一繪圖函式
function renderLines(faceData, indices, w, h, isClosed) {
  // 檢查 keypoints 是否存在 (這是線條沒出現的最常見原因)
  let pts = faceData.keypoints;
  if (!pts) return;

  beginShape();
  for (let i = 0; i < indices.length; i++) {
    let index = indices[i];
    let keypoint = pts[index];
    
    if (keypoint) {
      // 確保座標根據 capture 的原始尺寸映射到顯示尺寸
      let px = map(keypoint.x, 0, capture.width, 0, w);
      let py = map(keypoint.y, 0, capture.height, 0, h);
      vertex(px, py);
    }
  }
  if (isClosed) {
    endShape(CLOSE);
  } else {
    endShape();
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}