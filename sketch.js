let capture;
let faceMesh;
let faces = [];
// 1. 設定模型選項，開啟 refineLandmarks 以確保點位精確
let options = { maxFaces: 1, refineLandmarks: true, flipHorizontal: false };

// --- 節點編號定義 ---
// 嘴唇
let lipGroup1 = [409, 270, 269, 267, 0, 37, 39, 40, 185, 61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291];
let lipGroup2 = [76, 77, 90, 180, 85, 16, 315, 404, 320, 307, 306, 408, 304, 303, 302, 11, 72, 73, 74, 184];
// 右眼
let eyeR = [33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246];
// 左眼
let eyeL = [362, 382, 381, 380, 374, 373, 390, 249, 263, 466, 388, 387, 386, 385, 384, 398];
// 臉部最外圈輪廓
let faceOval = [10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379, 378, 400, 377, 152, 148, 176, 149, 150, 136, 172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109];

function preload() {
  // 載入 ml5 faceMesh 模型
  faceMesh = ml5.faceMesh(options);
}

function setup() {
  // 建立全螢幕畫布
  createCanvas(windowWidth, windowHeight);
  
  // 初始化攝影機擷取
  capture = createCapture(VIDEO, (stream) => {
    // 模型載入完成後開始偵測
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

  // 文字顯示部分
  fill(0);
  noStroke();
  textSize(32);
  textAlign(CENTER, CENTER);
  // 文字左右置中在畫布上方
  text("教科414730860", width / 2, 50);

  // --- 影像顯示部分 ---
  // 計算置中影像的座標
  let imgW = width * 0.5;
  let imgH = height * 0.5;
  let x = (width - imgW) / 2;
  let y = (height - imgH) / 2;

  push();
  // 將座標原點移到影像預計出現的位置
  translate(x, y);

  // 1. **先畫出完整的攝影機影像 (鏡像)**
  push();
  // 為了達成置中且鏡像的效果
  translate(imgW, 0); // 移到影像右側
  scale(-1, 1); // 水平翻轉
  image(capture, 0, 0, imgW, imgH);
  pop();

  // 2. **如果偵測到臉，則在臉部區域繪製顏色 `#fdf0d5`**
  if (faces.length > 0) {
    let face = faces[0];

    // **關鍵：只在臉部輪廓內填滿顏色**
    fill('#fdf0d5'); // 指定顏色
    noStroke();
    beginShape();
    for (let i = 0; i < faceOval.length; i++) {
      let index = faceOval[i];
      let pt = face.keypoints[index];
      if (pt) {
        // 將原始偵測座標對應到顯示影像的大小
        let px = map(pt.x, 0, capture.width, 0, imgW);
        let py = map(pt.y, 0, capture.height, 0, imgH);
        vertex(px, py);
      }
    }
    endShape(CLOSE);

    // 3. **重新進入鏡像座標系繪製細節線條 (與影像對齊)**
    push();
    translate(imgW, 0);
    scale(-1, 1);
    
    // 特徵線條顏色：紅色
    stroke(255, 0, 0);
    strokeWeight(1);
    noFill();

    // 繪製嘴唇線段
    drawLines(face, lipGroup1, imgW, imgH, false);
    drawLines(face, lipGroup2, imgW, imgH, false);

    // 繪製右眼閉合圈
    drawLines(face, eyeR, imgW, imgH, true);
    // 繪製左眼閉合圈
    drawLines(face, eyeL, imgW, imgH, true);
    pop();
  }
  pop();
}

/**
 * 通用繪圖函式，串接點位
 * @param {Object} faceData ml5.js 偵測到的臉部資料
 * @param {Array} indices 要串接的點位索引陣列
 * @param {Number} w 顯示影像寬度
 * @param {Number} h 顯示影像高度
 * @param {Boolean} isClosed 是否封閉線段
 */
function drawLines(faceData, indices, w, h, isClosed) {
  beginShape();
  for (let i = 0; i < indices.length; i++) {
    let index = indices[i];
    let keypoint = faceData.keypoints[index];
    if (keypoint) {
      let px = map(keypoint.x, 0, capture.width, 0, w);
      let py = map(keypoint.y, 0, capture.height, 0, h);
      vertex(px, py);
    }
  }
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
