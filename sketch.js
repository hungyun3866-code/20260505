let capture;
let faceMesh;
let faces = [];
let options = { maxFaces: 1, refineLandmarks: false, flipHorizontal: false };

// 你指定的 20 個臉部節點編號
let pointIndices = [409, 270, 269, 267, 0, 37, 39, 40, 185, 61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291];

function preload() {
  // 載入臉部辨識模型
  faceMesh = ml5.faceMesh(options);
}

function setup() {
  // 產生全螢幕畫布
  createCanvas(windowWidth, windowHeight);
  
  // 初始化攝影機
  capture = createCapture(VIDEO, (stream) => {
    console.log("攝影機啟動成功");
    // 攝影機準備好後才開始偵測
    faceMesh.detectStart(capture, gotFaces);
  });
  
  // 設定擷取影像的基礎解析度
  capture.size(640, 480);
  capture.hide();
}

function gotFaces(results) {
  // 儲存偵測結果
  faces = results;
}

function draw() {
  // 設定畫布背景顏色
  background('#e7c6ff');

  // --- 1. 顯示文字 ---
  fill(0);
  noStroke();
  textSize(32);
  textAlign(CENTER, CENTER);
  // 左右置中於畫布上
  text("教科414730860", width / 2, 50);

  // --- 2. 影像置中與鏡像處理 ---
  let imgW = width * 0.5; // 寬度為畫布 50%
  let imgH = height * 0.5; // 高度為畫布 50%
  let x = (width - imgW) / 2;
  let y = (height - imgH) / 2;

  push();
  // 處理左右顛倒（鏡像）
  translate(x + imgW, y);
  scale(-1, 1);
  
  // 繪製攝影機影像
  image(capture, 0, 0, imgW, imgH);

  // --- 3. 繪製臉部辨識紅線 ---
  if (faces.length > 0) {
    let face = faces[0];
    
    stroke(255, 0, 0); // 線條顏色：紅色
    strokeWeight(15);   // 線條粗細：15
    noFill();

    beginShape();
    for (let i = 0; i < pointIndices.length; i++) {
      let index = pointIndices[i];
      let keypoint = face.keypoints[index];
      
      if (keypoint) {
        // 將偵測到的座標映射到畫布上實際顯示的影像大小
        let ptX = map(keypoint.x, 0, capture.width, 0, imgW);
        let ptY = map(keypoint.y, 0, capture.height, 0, imgH);
        vertex(ptX, ptY);
      }
    }
    endShape(); // 依序連接指定的點
  }
  pop();
}

function windowResized() {
  // 視窗縮放時自動調整畫布大小
  resizeCanvas(windowWidth, windowHeight);
}