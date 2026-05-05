let capture;
let faceMesh;
let faces = [];
let options = { maxFaces: 1, refineLandmarks: true, flipHorizontal: false };

// 1. 嘴唇節點 (保留原有)
let lipGroup1 = [409, 270, 269, 267, 0, 37, 39, 40, 185, 61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291];
let lipGroup2 = [76, 77, 90, 180, 85, 16, 315, 404, 320, 307, 306, 408, 304, 303, 302, 11, 72, 73, 74, 184];

// 2. 右眼區域 (修正後的標準序列)
let rightEyeOuter = [33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246];
let rightEyeInner = [130, 25, 110, 24, 23, 22, 26, 112, 243, 190, 56, 28, 27, 29, 30, 247];

// 3. 左眼區域 (修正後的標準序列)
let leftEyeOuter = [263, 249, 390, 373, 374, 380, 381, 382, 362, 398, 384, 385, 386, 387, 388, 466];
let leftEyeInner = [359, 255, 339, 254, 253, 252, 256, 341, 463, 414, 286, 258, 257, 259, 260, 467];

function preload() {
  faceMesh = ml5.faceMesh(options);
}

function setup() {
  // 確保畫布是全螢幕
  createCanvas(windowWidth, windowHeight);
  
  capture = createCapture(VIDEO, (stream) => {
    faceMesh.detectStart(capture, gotFaces);
  });
  
  // 讓攝影機擷取比例符合視窗比例
  capture.size(640, 480);
  capture.hide();
}

function gotFaces(results) {
  faces = results;
}

function draw() {
  // 背景顏色 e7c6ff
  background('#e7c6ff');

  // 文字置中顯示
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

  push();
  // 置中並處理左右顛倒
  translate(x + imgW, y);
  scale(-1, 1);
  
  // 顯示影像
  image(capture, 0, 0, imgW, imgH);

  if (faces.length > 0) {
    let face = faces[0];
    
    stroke(255, 0, 0); // 線條紅色
    strokeWeight(1);   // 線條粗細 1
    noFill();

    // 1. 繪製嘴唇
    drawLines(face, lipGroup1, imgW, imgH, false);
    drawLines(face, lipGroup2, imgW, imgH, false);

    // 2. 繪製右眼 (外+內)
    drawLines(face, rightEyeOuter, imgW, imgH, true);
    drawLines(face, rightEyeInner, imgW, imgH, true);

    // 3. 繪製左眼 (外+內)
    drawLines(face, leftEyeOuter, imgW, imgH, true);
    drawLines(face, leftEyeInner, imgW, imgH, true);
  }
  pop();
}

function drawLines(faceData, indices, w, h, isClosed) {
  beginShape();
  for (let i = 0; i < indices.length; i++) {
    let index = indices[i];
    let pt = faceData.keypoints[index];
    if (pt) {
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

// 關鍵：確保視窗改變大小時，畫布依然是全螢幕
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}