let capture;
let faceMesh;
let faces = [];
// 開啟細節辨識並關閉模型自動水平翻轉（因為我們手動在畫布上處理翻轉）
let options = { maxFaces: 1, refineLandmarks: true, flipHorizontal: false };

// --- 節點定義 ---
let lipGroup1 = [409, 270, 269, 267, 0, 37, 39, 40, 185, 61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291];
let lipGroup2 = [76, 77, 90, 180, 85, 16, 315, 404, 320, 307, 306, 408, 304, 303, 302, 11, 72, 73, 74, 184];
let rightEyeIndices = [33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246];
let leftEyeIndices = [362, 382, 381, 380, 374, 373, 390, 249, 263, 466, 388, 387, 386, 385, 384, 398];
let faceOvalIndices = [10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379, 378, 400, 377, 152, 148, 176, 149, 150, 136, 172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109];

function preload() {
  faceMesh = ml5.faceMesh(options);
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  capture = createCapture(VIDEO, (stream) => {
    console.log("Camera running");
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
  // 先位移再縮放以達成鏡像置中
  translate(x + imgW, y);
  scale(-1, 1);
  image(capture, 0, 0, imgW, imgH);

  if (faces.length > 0) {
    let face = faces[0];

    // 1. 臉部外層輪廓：螢光藍 (#00ffff)，粗細 2
    stroke('#00ffff');
    strokeWeight(2);
    noFill();
    drawPoints(face, faceOvalIndices, imgW, imgH, true);

    // 2. 兩眼：深灰色 (#333333)，粗細 15 (黑眼圈效果)
    stroke('#333333');
    strokeWeight(15);
    drawPoints(face, rightEyeIndices, imgW, imgH, true);
    drawPoints(face, leftEyeIndices, imgW, imgH, true);

    // 3. 嘴唇：紅色，粗細 1
    stroke(255, 0, 0);
    strokeWeight(1);
    drawPoints(face, lipGroup1, imgW, imgH, false);
    drawPoints(face, lipGroup2, imgW, imgH, false);
  }
  pop();
}

// 修正後的繪圖函式，確保抓得到 keypoints
function drawPoints(faceData, indices, w, h, isClosed) {
  if (!faceData.keypoints) return;
  
  beginShape();
  for (let index of indices) {
    let pt = faceData.keypoints[index];
    if (pt) {
      // 將座標從 640x480 對應到畫布上的影像大小
      let px = map(pt.x, 0, capture.width, 0, w);
      let py = map(pt.y, 0, capture.height, 0, h);
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