let capture;
let faceMesh;
let faces = [];
let options = { maxFaces: 1, refineLandmarks: false, flipHorizontal: false };
let pointIndices = [409, 270, 269, 267, 0, 37, 39, 40, 185, 61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291];

function preload() {
  // 確保 ml5 已載入後才會執行這行
  faceMesh = ml5.faceMesh(options);
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  
  // 加上錯誤處理，觀察攝影機是否成功啟動
  capture = createCapture(VIDEO, (stream) => {
    console.log("攝影機已啟動");
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

  // 文字顯示 (教科414730860)
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

  if (faces && faces.length > 0) {
    let face = faces[0];
    stroke(255, 0, 0); // 紅色
    strokeWeight(15);   // 粗細 15
    noFill();

    beginShape();
    for (let i = 0; i < pointIndices.length; i++) {
      let index = pointIndices[i];
      let keypoint = face.keypoints[index];
      if (keypoint) {
        let ptX = map(keypoint.x, 0, capture.width, 0, imgW);
        let ptY = map(keypoint.y, 0, capture.height, 0, imgH);
        vertex(ptX, ptY);
      }
    }
    endShape(); 
  }
  pop();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}