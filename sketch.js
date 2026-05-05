let capture;
let faceMesh;
let faces = [];
let options = { maxFaces: 1, refineLandmarks: true, flipHorizontal: false };

// 1. 嘴唇原有的兩組節點
let lipGroup1 = [409, 270, 269, 267, 0, 37, 39, 40, 185, 61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291];
let lipGroup2 = [76, 77, 90, 180, 85, 16, 315, 404, 320, 307, 306, 408, 304, 303, 302, 11, 72, 73, 74, 184];

// 2. 右眼區域節點 (FaceMesh 標定)
// 外圍編號 (以 247 為起點的邏輯序列)
let rightEyeOuter = [247, 30, 29, 27, 28, 56, 190, 243, 112, 26, 22, 23, 24, 110, 25];
// 內圈編號 (以 246 為起點的邏輯序列)
let rightEyeInner = [246, 161, 160, 159, 158, 157, 173, 133, 155, 154, 153, 145, 144, 163, 7];

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
    
    stroke(255, 0, 0); // 線條顏色：紅色
    strokeWeight(1);   // 線條粗細：1
    noFill();

    // 繪製嘴唇部分 (保留原有功能)
    drawLines(face, lipGroup1, imgW, imgH, false);
    drawLines(face, lipGroup2, imgW, imgH, false);

    // 繪製右眼外圍 (編號 247 相關序列，閉合迴圈)
    drawLines(face, rightEyeOuter, imgW, imgH, true);
    
    // 繪製右眼內圈 (編號 246 相關序列，閉合迴圈)
    drawLines(face, rightEyeInner, imgW, imgH, true);
  }
  pop();
}

/**
 * 繪圖邏輯封裝
 * @param {Object} faceData 辨識到的臉部資料
 * @param {Array} indices 節點編號陣列
 * @param {Number} w 顯示影像寬度
 * @param {Number} h 顯示影像高度
 * @param {Boolean} isClosed 是否封閉成圈
 */
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
    endShape(CLOSE); // 封閉迴圈
  } else {
    endShape();
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}