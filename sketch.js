let capture;
let faceMesh;
let faces = [];
// 建議增加一個變數來檢查模型是否載入完成
let isModelReady = false; 

let options = { maxFaces: 1, refineLandmarks: false, flipHorizontal: false };
let pointIndices = [409, 270, 269, 267, 0, 37, 39, 40, 185, 61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291];

function preload() {
  // 這裡會用到 ml5，所以 index.html 沒引導好就會報錯
  faceMesh = ml5.faceMesh(options);
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  // 加上回呼函式確保安全
  capture = createCapture(VIDEO, () => {
    console.log("Camera ready!");
    faceMesh.detectStart(capture, gotFaces);
  });
  capture.size(640, 480); // 先給一個固定基礎比例
  capture.hide();
}
// ... 其餘 draw() 內容不變