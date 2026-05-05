let capture;

function setup() {
  // 第一步驟：產生一個全螢幕的畫布
  createCanvas(windowWidth, windowHeight);
  
  // 初始化攝影機擷取
  capture = createCapture(VIDEO);
  capture.size(windowWidth * 0.5, windowHeight * 0.5);
  
  // 隱藏原始的 HTML5 影片元素，只在畫布上顯示
  capture.hide();
}

function draw() {
  // 設定畫布背景顏色為 e7c6ff
  background('#e7c6ff');
  
  // 計算影像顯示的寬高（畫布寬高的 50%）
  let imgW = width * 0.5;
  let imgH = height * 0.5;
  
  // 計算置中座標
  let x = (width - imgW) / 2;
  let y = (height - imgH) / 2;
  
  push();
  // 處理左右顛倒（鏡像）
  // 1. 將座標原點移到影像的正中間
  translate(x + imgW, y);
  // 2. 水平翻轉畫布
  scale(-1, 1);
  
  // 在翻轉後的座標系中繪製影像
  // 注意：因為 scale(-1, 1) 且原點已移動，此時繪製位置需調整
  image(capture, 0, 0, imgW, imgH);
  pop();
}

// 當視窗大小改變時，自動調整畫布大小
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}