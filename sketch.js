let capture;
let faceMesh;
let faces = [];
let options = { maxFaces: 1, refineLandmarks: false, flipHorizontal: false };

// 你指定的節點編號順序
let pointIndices = [409, 270, 269, 267, 0, 37, 39, 40, 185, 61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291];

function preload() {
  // 載入 FaceMesh 模型
  faceMesh = ml5.faceMesh(options);
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  capture = createCapture(VIDEO);
  capture.size(windowWidth * 0.5, windowHeight * 0.5);
  capture.hide();

  // 開始偵測臉部
  faceMesh.detectStart(capture, gotFaces);
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
  // 左右顛倒處理
  translate(x + imgW, y);
  scale(-1, 1);
  
  // 繪製影像
  image(capture, 0, 0, imgW, imgH);

  // 如果有偵測到臉部，則繪製線條
  if (faces.length > 0) {
    let face = faces[0];
    
    stroke(255, 0, 0); // 紅色線條
    strokeWeight(15);   // 線條粗細 15
    noFill();

    beginShape();
    for (let i = 0; i < pointIndices.length; i++) {
      let index = pointIndices[i];
      let keypoint = face.keypoints[index];
      if (keypoint) {
        // 由於 image 是在 (0,0) 開始繪製且寬高已縮放
        // 偵測到的座標也需要對應到顯示的比例
        let ptX = map(keypoint.x, 0, capture.width, 0, imgW);
        let ptY = map(keypoint.y, 0, capture.height, 0, imgH);
        vertex(ptX, ptY);
      }
    }
    // 若要封閉線條可使用 endShape(CLOSE)，若只需串接則用 endShape()
    endShape(); 
  }
  pop();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}