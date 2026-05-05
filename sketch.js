let capture;
let faceMesh;
let faces = [];
let options = { maxFaces: 1, refineLandmarks: true, flipHorizontal: false };

// 嘴唇節點 (保留原有)
let lipGroup1 = [409, 270, 269, 267, 0, 37, 39, 40, 185, 61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291];
let lipGroup2 = [76, 77, 90, 180, 85, 16, 315, 404, 320, 307, 306, 408, 304, 303, 302, 11, 72, 73, 74, 184];

function preload() {
  faceMesh = ml5.faceMesh(options);
}

function setup() {
  // 全螢幕畫布
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
  scale(-1, 1); // 左右翻轉鏡像
  image(capture, 0, 0, imgW, imgH);

  if (faces.length > 0) {
    let face = faces[0];
    
    stroke(255, 0, 0); // 紅色
    strokeWeight(1);   // 粗細 1
    noFill();

    // 1. 繪製嘴唇
    drawLines(face.keypoints, lipGroup1, imgW, imgH, false);
    drawLines(face.keypoints, lipGroup2, imgW, imgH, false);

    // 2. 繪製右眼 (使用 ml5 內建對應索引)
    // 右眼外圍
    drawLines(face.rightEye.keypoints, null, imgW, imgH, true);
    // 右眼內圈 (如有 refineLandmarks)
    if(face.rightEyeLower0) drawLines(face.rightEyeLower0, null, imgW, imgH, true);

    // 3. 繪製左眼 (使用 ml5 內建對應索引)
    // 左眼外圍
    drawLines(face.leftEye.keypoints, null, imgW, imgH, true);
    // 左眼內圈 (如有 refineLandmarks)
    if(face.leftEyeLower0) drawLines(face.leftEyeLower0, null, imgW, imgH, true);
  }
  pop();
}

// 修正後的通用繪圖函式
function drawLines(points, indices, w, h, isClosed) {
  beginShape();
  // 如果有給 indices 就跑編號，沒給就跑整個點陣列
  let targetPoints = indices ? indices.map(i => points[i]) : points;
  
  for (let pt of targetPoints) {
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