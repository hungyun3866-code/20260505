let capture;
let faceMesh;
let faces = [];
let options = { maxFaces: 1, refineLandmarks: true, flipHorizontal: false };

// 節點定義
let lip1 = [409, 270, 269, 267, 0, 37, 39, 40, 185, 61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291];
let lip2 = [76, 77, 90, 180, 85, 16, 315, 404, 320, 307, 306, 408, 304, 303, 302, 11, 72, 73, 74, 184];
let eyeR = [33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246];
let eyeL = [362, 382, 381, 380, 374, 373, 390, 249, 263, 466, 388, 387, 386, 385, 384, 398];
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
  // 基礎背景顏色 e7c6ff
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

  // 1. 先畫出完整的攝影機影像（置中、鏡像）
  push();
  translate(x + imgW, y);
  scale(-1, 1);
  image(capture, 0, 0, imgW, imgH);

  if (faces.length > 0) {
    let face = faces[0];

    // --- 關鍵步驟：遮罩處理 ---
    // 我們要在影像上方蓋上一層 fdf0d5，但把臉部的位置挖空
    pop(); // 暫時跳出鏡像座標系，方便畫遮罩
    
    push();
    fill('#fdf0d5'); // 你要求的背景色
    noStroke();
    
    // 開始繪製遮罩形狀
    beginShape();
    // 外部：畫一個巨大的矩形包住整個影像區域
    vertex(x, y);
    vertex(x + imgW, y);
    vertex(x + imgW, y + imgH);
    vertex(x, y + imgH);
    
    // 內部：挖洞（Contour）
    beginContour();
    // 洞的座標必須與影像座標對應，且點的順序要與外部相反
    for (let i = faceOval.length - 1; i >= 0; i--) {
      let index = faceOval[i];
      let pt = face.keypoints[index];
      if (pt) {
        // 考慮鏡像：原本在左邊的點要變到右邊
        let mirrorX = capture.width - pt.x;
        let px = map(mirrorX, 0, capture.width, x, x + imgW);
        let py = map(pt.y, 0, capture.height, y, y + imgH);
        vertex(px, py);
      }
    }
    endContour();
    endShape(CLOSE);
    
    // --- 重新進入鏡像座標系繪製細節線條 ---
    translate(x + imgW, y);
    scale(-1, 1);

    // 畫臉部輪廓線 (螢光藍, 粗 2)
    stroke(0, 255, 255);
    strokeWeight(2);
    noFill();
    renderLines(face, faceOval, imgW, imgH, true);

    // 畫黑眼圈 (深灰, 粗 15)
    stroke(50);
    strokeWeight(15);
    renderLines(face, eyeR, imgW, imgH, true);
    renderLines(face, eyeL, imgW, imgH, true);

    // 畫嘴唇 (紅色, 粗 1)
    stroke(255, 0, 0);
    strokeWeight(1);
    renderLines(face, lip1, imgW, imgH, false);
    renderLines(face, lip2, imgW, imgH, false);
  }
  pop();
}

function renderLines(faceData, indices, w, h, isClosed) {
  let pts = faceData.keypoints;
  if (!pts) return;
  beginShape();
  for (let i = 0; i < indices.length; i++) {
    let keypoint = pts[indices[i]];
    if (keypoint) {
      let px = map(keypoint.x, 0, capture.width, 0, w);
      let py = map(keypoint.y, 0, capture.height, 0, h);
      vertex(px, py);
    }
  }
  if (isClosed) endShape(CLOSE);
  else endShape();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}