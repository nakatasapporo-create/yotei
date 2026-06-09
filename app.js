// ======================
// データ管理
// ======================

let schedule =
JSON.parse(
localStorage.getItem("schedule")
) || [];

let currentIndex = 0;

let timerInterval = null;

let totalTime = 0;
let remainingTime = 0;

// ======================
// 初期化
// ======================

window.onload = () => {

renderSchedule();

updateDisplay();

enableSortable();

};

// ======================
// カード登録
// ======================

document
.getElementById("addCardBtn")
.addEventListener("click", addCard);

function addCard(){

const name =
document
.getElementById("cardName")
.value
.trim();

const time =
parseInt(
document
.getElementById("cardTime")
.value
);

const file =
document
.getElementById("imageInput")
.files[0];

if(!name || !time){

alert("カード名と時間を入力してください");

return;

}

if(!file){

alert("画像を選択してください");

return;

}

const reader =
new FileReader();

reader.onload = function(e){

schedule.push({

name:name,

time:time * 60,

image:e.target.result

});

saveSchedule();

renderSchedule();

};

reader.readAsDataURL(file);

}

// ======================
// 保存
// ======================

function saveSchedule(){

localStorage.setItem(
"schedule",
JSON.stringify(schedule)
);

}

// ======================
// 一覧表示
// ======================

function renderSchedule(){

const list =
document.getElementById(
"scheduleList"
);

list.innerHTML = "";

schedule.forEach((item,index)=>{

const li =
document.createElement("li");

li.innerHTML =
item.name +
" (" +
(item.time / 60) +
"分)";

li.dataset.index = index;

list.appendChild(li);

});

updateDisplay();

}

// ======================
// First Then表示
// ======================

function updateDisplay(){

if(schedule.length === 0){

return;

}

const current =
schedule[currentIndex];

const next =
schedule[currentIndex + 1];

document.getElementById(
"currentTitle"
).textContent =
current.name;

document.getElementById(
"currentImage"
).src =
current.image;

if(next){

document.getElementById(
"nextTitle"
).textContent =
next.name;

document.getElementById(
"nextImage"
).src =
next.image;

}else{

document.getElementById(
"nextTitle"
).textContent =
"おわり";

}

}

// ======================
// タイマー
// ======================

document
.getElementById("startBtn")
.addEventListener(
"click",
startTimer
);

function startTimer(){

if(schedule.length===0){

return;

}

clearInterval(
timerInterval
);

totalTime =
schedule[currentIndex].time;

remainingTime =
totalTime;

timerInterval =
setInterval(()=>{

remainingTime--;

updateTimer();

if(
remainingTime === 60
){

speak(
"あと1分です"
);

document.body.classList.add(
"warning"
);

}

if(
remainingTime <= 0
){

clearInterval(
timerInterval
);

speak(
"おしまいです"
);

document.body.classList.remove(
"warning"
);

document.body.classList.add(
"finished"
);

nextCard();

}

},1000);

}

// ======================
// タイマー表示
// ======================

function updateTimer(){

const min =
Math.floor(
remainingTime / 60
);

const sec =
remainingTime % 60;

document.getElementById(
"timerText"
).textContent =
String(min)
.padStart(2,"0")
+
":"
+
String(sec)
.padStart(2,"0");

const percent =
(
remainingTime /
totalTime
)
*
100;

document.getElementById(
"timerProgress"
).style.width =
percent + "%";

}

// ======================
// 次へ
// ======================

document
.getElementById("nextBtn")
.addEventListener(
"click",
nextCard
);

function nextCard(){

document.body.classList.remove(
"finished"
);

if(
currentIndex <
schedule.length - 1
){

currentIndex++;

updateDisplay();

}

}

// ======================
// 一時停止
// ======================

document
.getElementById("pauseBtn")
.addEventListener(
"click",
()=>{

clearInterval(
timerInterval
);

}
);

// ======================
// 音声
// ======================

function speak(text){

if(
"speechSynthesis"
in window
){

const msg =
new SpeechSynthesisUtterance(
text
);

msg.lang =
"ja-JP";

speechSynthesis.speak(
msg
);

}

}

// ======================
// 並び替え
// ======================

function enableSortable(){

new Sortable(

document.getElementById(
"scheduleList"
),

{

animation:150,

onEnd:function(evt){

const moved =
schedule.splice(
evt.oldIndex,
1
)[0];

schedule.splice(
evt.newIndex,
0,
moved
);

saveSchedule();

renderSchedule();

}

}

);

}

// ======================
// QRコード
// ======================

document
.getElementById("exportBtn")
.addEventListener(
"click",
createQR
);

function createQR(){

const canvas =
document.getElementById(
"qrCanvas"
);

QRCode.toCanvas(

canvas,

JSON.stringify(
schedule
),

function(error){

if(error){

console.error(
error
);

}

}

);

}

// ======================
// QR読み込み
// ======================

document
.getElementById("scanBtn")
.addEventListener(
"click",
startQRScan
);

async function startQRScan(){

const video =
document.getElementById(
"qrVideo"
);

const stream =
await navigator.mediaDevices
.getUserMedia({
video:{
facingMode:"environment"
}
});

video.srcObject =
stream;

video.play();

scanFrame(video);

}

function scanFrame(video){

const canvas =
document.createElement(
"canvas"
);

const ctx =
canvas.getContext("2d");

function tick(){

if(
video.readyState ===
video.HAVE_ENOUGH_DATA
){

canvas.width =
video.videoWidth;

canvas.height =
video.videoHeight;

ctx.drawImage(
video,
0,
0
);

const imageData =
ctx.getImageData(
0,
0,
canvas.width,
canvas.height
);

const code =
jsQR(
imageData.data,
canvas.width,
canvas.height
);

if(code){

try{

const imported =
JSON.parse(
code.data
);

schedule =
imported;

saveSchedule();

renderSchedule();

alert(
"設定を読み込みました"
);

video.srcObject
.getTracks()
.forEach(
track =>
track.stop()
);

return;

}
catch(e){

alert(
"QRデータが正しくありません"
);

}

}

}

requestAnimationFrame(
tick
);

}

tick();

}
