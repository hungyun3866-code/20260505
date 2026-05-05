let capture;
let faceMesh;
let faces = [];
let options = { maxFaces: 1, refineLandmarks: true, flipHorizontal: false };

// --- 節點編號定義 (維持原本設定) ---
// 1. 嘴唇 (紅線)
let lipTop = [267, 269, 270, 409, 291, 375, 321, 405, 314, 17, 84, 181, 91, 146, 61, 185, 40, 39, 37, 0];
let lipBottom = [184, 74, 73, 72, 11, 302, 303, 304, 408, 306, 307, 320, 404, 315, 16, 85, 180, 90, 77, 76];

// 2. 眼睛 (黑眼圈效果，深灰)
let eyeR_Outer = [33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246];
let eyeL_Outer = [362, 382, 381, 380, 374, 373, 390, 249, 263, 466, 388, 387, 386, 385, 384, 398];

// 3. 臉部最外層輪廓 (裁切用)
let faceOval = [10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379, 378, 400, 377, 152, 148, 176, 149, 150, 136, 172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109];

function preload() {
  faceMesh = ml5.faceMesh(options);
}

function setup() {
  // 強制全螢幕畫布
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
  // 基礎背景色
  background(220);

  // 文字顯示：教科414730860
  fill(0);
  noStroke();
  textSize(32);
  textAlign(CENTER, CENTER);
  text("教科414730860", width / 2, 50);

  // 計算置中影像區域，維持正確比例 (約 50% 畫布大小)
  let imgW = width * 0.5;
  let imgH = height * 0.5;
  let x = (width - imgW) / 2;
  let y = (height - imgH) / 2;

  // --- 第一層：底層攝影機影像 (置中、鏡像) ---
  // 這是完整的背景
  push();
  translate(x + imgW, y); // 移動到右側，準備鏡像
  scale(-1, 1); // 水平翻轉
  image(capture, 0, 0, imgW, imgH);
  pop();

  // 如果偵測到臉，則繪製遮罩與線條
  if (faces.length > 0) {
    let face = faces[0];

    // --- 第二層：核心裁切步驟：只在臉部覆蓋顏色 ---
    // 我們利用 beginContour 實作「鏤空挖洞」
    push();
    fill('#fdf0d5'); // 您要求的指定顏色
    noStroke();
    
    // 繪製遮罩形狀
    beginShape();
    // 外部矩形 (反向绕行，逆時針)
    vertex(x, y);
    vertex(x, y + imgH);
    vertex(x + imgW, y + imgH);
    vertex(x + imgW, y);
    
    // 內部鏤空 (正向绕行，順時針)
    // **關鍵：我們必須手動計算鏡像後的座標，才能對齊底下的影像**
    beginContour();
    for (let i = 0; i < faceOval.length; i++) {
      let index = faceOval[i];
      let pt = face.keypoints[index];
      if (pt) {
        // 水平鏡像處理：計算鏡像點的 X 座標
        let mirrorX = capture.width - pt.x;
        // 將座標映射到畫布上
        let px = map(mirrorX, 0, capture.width, x, x + imgW);
        let py = map(pt.y, 0, capture.height, y, y + imgH);
        vertex(px, py);
      }
    }
    endContour();
    endShape(CLOSE);
    pop();

    // --- 第三層：重新進入鏡像座標系，繪製特徵線條 ---
    push();
    // 與第一層一致，線條才會貼合臉部
    translate(x + imgW, y);
    scale(-1, 1);

    // 1. 臉部輪廓線 (螢光藍, 粗 2)
    stroke(0, 255, 255); // Neon Cyan
    strokeWeight(2);
    noFill();
    renderLines(face, faceOval, imgW, imgH, true);

    // 2. 兩眼：深灰色, 粗 15 (黑眼圈效果)
    // 確保兩隻眼睛都會同時出現深灰粗線
    stroke(50); // Dark Gray
    strokeWeight(15);
    renderLines(face, eyeR_Outer, imgW, imgH, true);
    renderLines(face, eyeL_Outer, imgW, imgH, true);

    // 3. 嘴唇 (紅色, 粗 1)
    stroke(255, 0, 0); // Red
    strokeWeight(1);
    renderLines(face, lipTop, imgW, imgH, false);
    renderLines(face, lipBottom, imgW, imgH, false);
    pop();
  } else {
    // 沒偵測到臉時，顯示一個空框
    stroke(0);
    noFill();
    rect(x, y, imgW, imgH);
  }
}

/**
 * 通用繪圖函式，串接臉部索引點位
 * @param {Object} faceData ml5.js 偵測到的臉部資料
 * @param {Array} indices 要串接的點位索引陣列
 * @param {Number} w 顯示影像寬度
 * @param {Number} h 顯示影像高度
 * @param {Boolean} isClosed 是否封閉線段
 */
function renderLines(faceData, indices, w, h, isClosed) {
  let pts = faceData.keypoints;
  if (!pts) return;
  beginShape();
  for (let i = 0; i < indices.length; i++) {
    let index = indices[i];
    let keypoint = pts[index];
    if (keypoint) {
      // 將原始偵測座標映射到畫布顯示座標
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

// 確保畫布填滿全螢幕，並在視窗改變大小時自動調整
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
