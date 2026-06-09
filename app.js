/* ==========================
データ
========================== */

let schedule =
JSON.parse(
localStorage.getItem("schedule")
) || [];

let currentIndex = 0;

let timerInterval = null;

let totalTime = 0;

let remainingTime = 0;

/* ==========================
起動
========================== */

window.addEventListener(
"load",
init
);

function init(){

renderSchedule();

enableSortable();

updateDisplay();

setupTeacherMode();

}

/* ==========================
カード登録
========================== */

document
.getElementById("addCardBtn")
.addEventListener(
"click",
addCard
);

function addCard(){

const name =
document
.getElementById("cardName")
.value
.trim();

const minutes =
parseInt(
document
.getElementById("cardTime")
.value
);

const file =
document
.getElementById("imageInput")
.files[0];

if(!name){

alert(
"カード名を入力してください"
);

return;

}

if(!minutes){

alert(
"時間を入力してください"
);

return;

}

if(!file){

alert(
"画像を選択してください"
);

return;

}

const reader =
new FileReader();

reader.onload =
function(e){

schedule.push({

name:name,

time:minutes * 60,

image:e.target.result

});

saveSchedule();

renderSchedule();

clearInputs();

};

reader.readAsDataURL(file);

}

/* ==========================
入力クリア
========================== */

function clearInputs(){

document.getElementById(
"cardName"
).value = "";

document.getElementById(
"cardTime"
).value = 5;

document.getElementById(
"imageInput"
).value = "";

}

/* ==========================
保存
========================== */

function saveSchedule(){

localStorage.setItem(
"schedule",
JSON.stringify(schedule)
);

}

/* ==========================
スケジュール表示
========================== */

function renderSchedule(){

const list =
document.getElementById(
"scheduleList"
);

list.innerHTML = "";

schedule.forEach(
(item,index)=>{

const li =
document.createElement("li");

li.textContent =
item.name +
" (" +
(item.time/60) +
"分)";

li.dataset.index =
index;

list.appendChild(li);

});

updateDisplay();

}

/* ==========================
First Then
========================== */

function updateDisplay(){

if(
schedule.length === 0
){

document.getElementById(
"currentTitle"
).textContent =
"カードなし";

document.getElementById(
"nextTitle"
).textContent =
"";

return;

}

const current =
schedule[currentIndex];

document.getElementById(
"currentTitle"
).textContent =
current.name;

document.getElementById(
"currentImage"
).src =
current.image;

const next =
schedule[currentIndex + 1];

if(next){

document.getElementById(
"nextTitle"
).textContent =
next.name;

document.getElementById(
"nextImage"
).src =
next.image;

}
else{

document.getElementById(
"nextTitle"
).textContent =
"おわり";

document.getElementById(
"nextImage"
).removeAttribute(
"src"
);

}

}

/* ==========================
タイマー
========================== */

document
.getElementById("startBtn")
.addEventListener(
"click",
startTimer
);

function startTimer(){

if(
schedule.length === 0
){

return;

}

clearInterval(
timerInterval
);

totalTime =
schedule[currentIndex].time;

remainingTime =
totalTime;

updateTimer();

timerInterval =
setInterval(()=>{

remainingTime--;

updateTimer();

if(
remainingTime === 60
){

document.body.classList.add(
"warning"
);

speak(
"あと1分です"
);

}

if(
remainingTime <= 0
){

clearInterval(
timerInterval
);

document.body.classList.remove(
"warning"
);

document.body.classList.add(
"finished"
);

speak(
"おしまいです"
);

setTimeout(()=>{

document.body.classList.remove(
"finished"
);

nextCard();

},1500);

}

},1000);

}

/* ==========================
一時停止
========================== */

document
.getElementById("pauseBtn")
.addEventListener(
"click",
pauseTimer
);

function pauseTimer(){

clearInterval(
timerInterval
);

}

/* ==========================
タイマー表示
========================== */

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
) * 100;

document.getElementById(
"timerProgress"
).style.width =
percent + "%";

}

/* ==========================
次へ
========================== */

document
.getElementById("nextBtn")
.addEventListener(
"click",
nextCard
);

function nextCard(){

if(
currentIndex <
schedule.length - 1
){

currentIndex++;

updateDisplay();

}
else{

speak(
"すべておわりました"
);

}

}

/* ==========================
音声
========================== */

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
msg);

}

}

/* ==========================
並び替え
========================== */

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

/* ==========================
教員モード
========================== */

function setupTeacherMode(){

const settingsBtn =
document.getElementById(
"settingsBtn"
);

const teacherView =
document.getElementById(
"teacherView"
);

let pressTimer;

settingsBtn.addEventListener(
"touchstart",
startPress
);

settingsBtn.addEventListener(
"mousedown",
startPress
);

settingsBtn.addEventListener(
"touchend",
cancelPress
);

settingsBtn.addEventListener(
"mouseup",
cancelPress
);

settingsBtn.addEventListener(
"mouseleave",
cancelPress
);

function startPress(){

pressTimer =
setTimeout(()=>{

toggleTeacherMode();

},3000);

}

function cancelPress(){

clearTimeout(
pressTimer
);

}

function toggleTeacherMode(){

if(
teacherView.style.display ===
"block"
){

teacherView.style.display =
"none";

speak(
"児童モード"
);

}
else{

teacherView.style.display =
"block";

speak(
"先生モード"
);

}

}

}
