let capture;
let faceMesh;
let faces = [];
// 1. 設定模型選項，開啟 refineLandmarks 以確保眼睛周圍點位精確
let options = { maxFaces: 1, refineLandmarks: true, flipHorizontal: false };

// --- 節點編號定義 ---

// 2. 嘴唇（保留原有，共兩組線）
let lipGroup1 = [409, 270, 269, 267, 0, 37, 39, 40, 185, 61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291];
let lipGroup2 = [76, 77, 90, 180, 85, 16, 315, 404, 320, 307, 306, 408, 304, 303, 302, 11, 72, 73, 74, 184];

// 3. 右眼區域（畫面的左側，外圍+內圈）
let rightEyeOuter = [33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246];
let rightEyeInner = [130, 25, 110, 24, 23, 22, 26, 112, 243, 190, 56, 28, 27, 29, 30, 247];

// 4. 左眼區域（畫面的右側，外圍+內圈）- **此處已修正標準序列**
let leftEyeOuter = [263, 249, 390, 373, 374, 380, 381, 382, 362, 398, 384, 385, 386, 387, 388, 466];
let leftEyeInner = [359, 255, 339, 254, 253, 252, 256, 341, 463, 414, 286, 258, 257, 259, 260, 467];

function preload() {
  // 載入 ml5 faceMesh 模型
  faceMesh = ml5.faceMesh(options);
}

function setup() {
  // 第一步驟：產生全螢幕畫布
  createCanvas(windowWidth, windowHeight);
  
  // 初始化攝影機擷取
  capture = createCapture(VIDEO, (stream) => {
    // 攝影機準備好後才開始偵測
    faceMesh.detectStart(capture, gotFaces);
  });
  capture.size(640, 480); // 設定擷取解析度基礎
  capture.hide(); // 隱藏原始 HTML 影片元素
}

function gotFaces(results) {
  faces = results;
}

function draw() {
  // 背景顏色 e7c6ff
  background('#e7c6ff');

  // --- 文字顯示部分 ---
  fill(0);
  noStroke();
  textSize(32);
  textAlign(CENTER, CENTER);
  // 文字左右置中在畫布上方
  text("教科414730860", width / 2, 50);

  // --- 影像與畫線部分 ---
  // 計算置中且為 50% 畫布大小的影像尺寸
  let imgW = width * 0.5;
  let imgH = height * 0.5;
  let x = (width - imgW) / 2;
  let y = (height - imgH) / 2;

  push();
  // 將座標原點移到影像預計出現的右側，並進行水平翻轉（左右顛倒處理）
  translate(x + imgW, y);
  scale(-1, 1);
  
  // 繪製攝影機影像到指定位置與大小
  image(capture, 0, 0, imgW, imgH);

  // 如果偵測到臉部，則繪製線條
  if (faces.length > 0) {
    let face = faces[0];
    
    stroke(255, 0, 0); // 線條顏色：紅色
    strokeWeight(1);   // 線條粗細：1
    noFill();

    // 1. 繪製嘴唇線段
    drawLines(face, lipGroup1, imgW, imgH, false);
    drawLines(face, lipGroup2, imgW, imgH, false);

    // 2. 繪製右眼（畫面的左側）閉合圈
    drawLines(face, rightEyeOuter, imgW, imgH, true);
    drawLines(face, rightEyeInner, imgW, imgH, true);

    // 3. 繪製左眼（畫面的右側）閉合圈
    drawLines(face, leftEyeOuter, imgW, imgH, true);
    drawLines(face, leftEyeInner, imgW, imgH, true);
  }
  pop();
}

/**
 * 繪圖邏輯封裝函數
 * @param {Object} faceData - ml5 偵測到的臉部資料
 * @param {Array} indices - 要串接的節點編號陣列
 * @param {Number} displayW - 畫面上影像的寬度
 * @param {Number} displayH - 畫面上影像的高度
 * @param {Boolean} isClosed - 是否封閉線條（頭尾相連）
 */
function drawLines(faceData, indices, displayW, displayH, isClosed) {
  beginShape();
  for (let i = 0; i < indices.length; i++) {
    let index = indices[i];
    let keypoint = faceData.keypoints[index];
    
    if (keypoint) {
      // 將原始攝影機座標 (640x480) 映射到顯示的影像大小 (50% 畫布)
      let ptX = map(keypoint.x, 0, capture.width, 0, displayW);
      let ptY = map(keypoint.y, 0, capture.height, 0, displayH);
      vertex(ptX, ptY);
    }
  }
  // 如果要求封閉，則使用 CLOSE 參數
  if (isClosed) {
    endShape(CLOSE);
  } else {
    endShape();
  }
}

// 當視窗大小改變時，自動調整畫布為全螢幕
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}