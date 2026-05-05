let capture;
let faceMesh;
let faces = [];
let options = { maxFaces: 1, refineLandmarks: false, flipHorizontal: false };

// 第一組節點 (原本的輪廓)
let group1 = [409, 270, 269, 267, 0, 37, 39, 40, 185, 61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291];
// 第二組節點 (新增的序列)
let group2 = [76, 77, 90, 180, 85, 16, 315, 404, 320, 307, 306, 408, 304, 303, 302, 11, 72, 73, 74, 184];

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

  // 顯示文字
  fill(0);
  noStroke();
  textSize(32);
  textAlign(CENTER, CENTER);
  text("教科414730860", width / 2, 50);

  // 影像置中與鏡像
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
    
    stroke(255, 0, 0); // 紅色線條
    strokeWeight(1);   // 線條粗細改為 1
    noFill();

    // 繪製第一組線條
    drawLines(face, group1, imgW, imgH);
    
    // 繪製第二組線條
    drawLines(face, group2, imgW, imgH);
  }
  pop();
}

// 封裝繪圖邏輯以簡化代碼
function drawLines(faceData, indices, w, h) {
  beginShape();
  for (let i = 0; i < indices.length; i++) {
    let pt = faceData.keypoints[indices[i]];
    if (pt) {
      let px = map(pt.x, 0, capture.width, 0, w);
      let py = map(pt.y, 0, capture.height, 0, h);
      vertex(px, py);
    }
  }
  endShape();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}