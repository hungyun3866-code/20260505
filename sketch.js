let capture;
let faceMesh;
let faces = [];
let options = { maxFaces: 1, refineLandmarks: true, flipHorizontal: false };

// 節點定義
let lip1 = [409, 270, 269, 267, 0, 37, 39, 40, 185, 61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291];
let lip2 = [76, 77, 90, 180, 85, 16, 315, 404, 320, 307, 306, 408, 304, 303, 302, 11, 72, 73, 74, 184];
let eyeR = [33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246];
let eyeL = [362, 382, 381, 380, 374, 373, 390, 249, 263, 466, 388, 387, 386, 385, 384, 398];
// 臉部外圍輪廓
let faceOval = [10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379, 378, 400, 377, 152, 148, 176, 149, 150, 136, 172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109];

function preload() {
  faceMesh = ml5.faceMesh(options);
}

function setup() {
  // 強制設定畫布填滿螢幕
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
  // 底層背景色
  background('#e7c6ff');

  // 置中顯示文字
  fill(0);
  noStroke();
  textSize(32);
  textAlign(CENTER, CENTER);
  text("教科414730860", width / 2, 50);

  // 計算 50% 畫布大小
  let imgW = width * 0.5;
  let imgH = height * 0.5;
  let x = (width - imgW) / 2;
  let y = (height - imgH) / 2;

  if (faces.length > 0) {
    let face = faces[0];

    // --- 第一層：繪製鏡像影像 ---
    push();
    translate(x + imgW, y);
    scale(-1, 1);
    image(capture, 0, 0, imgW, imgH);
    pop();

    // --- 第二層：繪製遮罩 (把臉以外的地方遮掉) ---
    push();
    fill('#fdf0d5'); // 輪廓外背景色
    noStroke();
    
    beginShape();
    // 外部矩形 (逆時針畫大框)
    vertex(x, y);
    vertex(x, y + imgH);
    vertex(x + imgW, y + imgH);
    vertex(x + imgW, y);
    
    // 內部挖洞 (順時針繞行臉部輪廓，達成鏤空)
    beginContour();
    for (let i = 0; i < faceOval.length; i++) {
      let index = faceOval[i];
      let pt = face.keypoints[index];
      if (pt) {
        // 同步鏡像座標計算
        let mx = map(capture.width - pt.x, 0, capture.width, x, x + imgW);
        let my = map(pt.y, 0, capture.height, y, y + imgH);
        vertex(mx, my);
      }
    }
    endContour();
    endShape(CLOSE);
    pop();

    // --- 第三層：繪製特徵線條 (鏡像座標系) ---
    push();
    translate(x + imgW, y);
    scale(-1, 1);

    // 1. 臉部輪廓 (螢光藍, 粗 2)
    stroke(0, 255, 255);
    strokeWeight(2);
    noFill();
    renderLines(face, faceOval, imgW, imgH, true);

    // 2. 黑眼圈 (深灰, 粗 15)
    stroke(50);
    strokeWeight(15);
    renderLines(face, eyeR, imgW, imgH, true);
    renderLines(face, eyeL, imgW, imgH, true);

    // 3. 嘴唇 (紅色, 粗 1)
    stroke(255, 0, 0);
    strokeWeight(1);
    renderLines(face, lip1, imgW, imgH, false);
    renderLines(face, lip2, imgW, imgH, false);
    pop();
  } else {
    // 沒偵測到臉時，顯示一個空框
    fill('#fdf0d5');
    rect(x, y, imgW, imgH);
  }
}

function renderLines(faceData, indices, w, h, isClosed) {
  beginShape();
  for (let index of indices) {
    let pt = faceData.keypoints[index];
    if (pt) {
      let px = map(pt.x, 0, capture.width, 0, w);
      let py = map(pt.y, 0, capture.height, 0, h);
      vertex(px, py);
    }
  }
  if (isClosed) endShape(CLOSE);
  else endShape();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}