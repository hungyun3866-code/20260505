let capture;
let faceMesh;
let faces = [];
let options = { maxFaces: 1, refineLandmarks: true, flipHorizontal: false };

// 1. 嘴唇節點
let lipGroup1 = [409, 270, 269, 267, 0, 37, 39, 40, 185, 61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291];
let lipGroup2 = [76, 77, 90, 180, 85, 16, 315, 404, 320, 307, 306, 408, 304, 303, 302, 11, 72, 73, 74, 184];

// 2. 右眼區域節點
let rightEyeOuter = [247, 30, 29, 27, 28, 56, 190, 243, 112, 26, 22, 23, 24, 110, 25];
let rightEyeInner = [246, 161, 160, 159, 158, 157, 173, 133, 155, 154, 153, 145, 144, 163, 7];

// 3. 左眼區域節點 (新增)
let leftEyeOuter = [467, 260, 259, 257, 258, 286, 414, 463, 341, 256, 252, 253, 254, 339, 255];
let leftEyeInner = [466, 390, 388, 387, 386, 385, 384, 398, 362, 382, 381, 380, 374, 373, 390, 389];

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
    
    stroke(255, 0, 0); // 線條紅色
    strokeWeight(1);   // 線條粗細 1
    noFill();

    // 繪製嘴唇
    drawLines(face, lipGroup1, imgW, imgH, false);
    drawLines(face, lipGroup2, imgW, imgH, false);

    // 繪製右眼 (外圍與內圈)
    drawLines(face, rightEyeOuter, imgW, imgH, true);
    drawLines(face, rightEyeInner, imgW, imgH, true);

    // 繪製左眼 (外圍與內圈) - 新增
    drawLines(face, leftEyeOuter, imgW, imgH, true);
    drawLines(face, leftEyeInner, imgW, imgH, true);
  }
  pop();
}

function drawLines(faceData, indices, w, h, isClosed) {
  beginShape();
  for (let i = 0; i < indices.length; i++) {
    let pt = faceData.keypoints[indices[i]];
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

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}