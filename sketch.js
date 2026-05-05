let capture;

function setup() {
  // 產生全螢幕畫布
  createCanvas(windowWidth, windowHeight);
  
  // 初始化攝影機
  capture = createCapture(VIDEO);
  capture.size(windowWidth * 0.5, windowHeight * 0.5);
  capture.hide();
}

function draw() {
  // 背景顏色 e7c6ff
  background('#e7c6ff');
  
  // --- 文字顯示部分 ---
  fill(0); // 設定文字顏色（預設為黑色）
  textSize(32); // 設定字體大小
  textAlign(CENTER, CENTER); // 設定左右與上下皆置中
  // 在畫布上方顯示文字，x 座標為寬度的一半（置中），y 座標可視需求調整
  text("教科414730860", width / 2, 50);

  // --- 影像處理部分 ---
  let imgW = width * 0.5;
  let imgH = height * 0.5;
  let x = (width - imgW) / 2;
  let y = (height - imgH) / 2;
  
  push();
  // 左右顛倒處理
  translate(x + imgW, y);
  scale(-1, 1);
  image(capture, 0, 0, imgW, imgH);
  pop();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}