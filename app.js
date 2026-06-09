/* =================================
みえるスケジュール
学校実運用版 app.js
Part1
================================= */

const TEACHER_PASSWORD = "1234";

let schedule =
JSON.parse(
localStorage.getItem("schedule")
) || [];

let currentIndex = 0;

let timerInterval = null;

let totalTime = 0;

let remainingTime = 0;

window.addEventListener(
"load",
init
);

function init(){

setupButtons();

renderSchedule();

updateDisplay();

enableSortable();

setupTeacherMode();

}

/* =================================
ボタン
================================= */

function setupButtons(){

document
.getElementById("addCardBtn")
?.addEventListener(
"click",
addCard
);

document
.getElementById("startBtn")
?.addEventListener(
"click",
startTimer
);

document
.getElementById("pauseBtn")
?.addEventListener(
"click",
pauseTimer
);

document
.getElementById("nextBtn")
?.addEventListener(
"click",
nextCard
);

document
.getElementById("resetBtn")
?.addEventListener(
"click",
resetAll
);

document
.getElementById("loadSampleBtn")
?.addEventListener(
"click",
loadSampleCards
);

}

/* =================================
保存
================================= */

function saveSchedule(){

localStorage.setItem(
"schedule",
JSON.stringify(schedule)
);

}

/* =================================
カード追加
================================= */

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

/* =================================
一覧表示
================================= */

function renderSchedule(){

const list =
document.getElementById(
"scheduleList"
);

if(!list) return;

list.innerHTML = "";

schedule.forEach(
(item,index)=>{

const li =
document.createElement("li");

li.innerHTML =

'<span>' +

item.name +

' (' +

(item.time / 60) +

'分)</span>' +

'<button class="deleteBtn" data-index="' +

index +

'">削除</button>';

list.appendChild(li);

});

document
.querySelectorAll(
".deleteBtn"
)
.forEach(btn=>{

btn.addEventListener(
"click",
deleteCard
);

});

updateDisplay();

}

/* =================================
削除
================================= */

function deleteCard(e){

const index =
parseInt(
e.target.dataset.index
);

if(
!confirm(
"削除しますか？"
)
){
return;
}

schedule.splice(
index,
1
);

saveSchedule();

renderSchedule();

}

/* =================================
初期カード
================================= */

function loadSampleCards(){

if(
!confirm(
"初期カードを作成しますか？"
)
){
return;
}

schedule = [

{
name:"あさのかい",
time:300,
image:""
},

{
name:"べんきょう",
time:900,
image:""
},

{
name:"トイレ",
time:300,
image:""
},

{
name:"きゅうしょく",
time:1800,
image:""
},

{
name:"かえりのかい",
time:300,
image:""
}

];

saveSchedule();

renderSchedule();

}

/* =================================
全削除
================================= */

function resetAll(){

if(
!confirm(
"すべて削除しますか？"
)
){
return;
}

schedule = [];

currentIndex = 0;

saveSchedule();

renderSchedule();

}
/* =================================
First Then表示
================================= */

function updateDisplay(){

const currentTitle =
document.getElementById(
"currentTitle"
);

const currentImage =
document.getElementById(
"currentImage"
);

const nextTitle =
document.getElementById(
"nextTitle"
);

const nextImage =
document.getElementById(
"nextImage"
);

if(
schedule.length === 0
){

currentTitle.textContent =
"カードなし";

nextTitle.textContent =
"-";

currentImage.removeAttribute(
"src"
);

nextImage.removeAttribute(
"src"
);

return;

}

if(
currentIndex >=
schedule.length
){

currentIndex = 0;

}

const current =
schedule[currentIndex];

currentTitle.textContent =
current.name;

if(current.image){

currentImage.src =
current.image;

}else{

currentImage.removeAttribute(
"src"
);

}

const next =
schedule[currentIndex + 1];

if(next){

nextTitle.textContent =
next.name;

if(next.image){

nextImage.src =
next.image;

}else{

nextImage.removeAttribute(
"src"
);

}

}
else{

nextTitle.textContent =
"おわり";

nextImage.removeAttribute(
"src"
);

}

}

/* =================================
タイマー
================================= */

function startTimer(){

if(
schedule.length === 0
){

alert(
"カードがありません"
);

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

function pauseTimer(){

clearInterval(
timerInterval
);

}

function updateTimer(){

const timerText =
document.getElementById(
"timerText"
);

const timerProgress =
document.getElementById(
"timerProgress"
);

const min =
Math.floor(
remainingTime / 60
);

const sec =
remainingTime % 60;

timerText.textContent =

String(min)
.padStart(2,"0")

*

":"

*

String(sec)
.padStart(2,"0");

const percent =

totalTime > 0

?

(
remainingTime /
totalTime
) * 100

:

100;

timerProgress.style.width =

percent + "%";

}

/* =================================
次へ
================================= */

function nextCard(){

clearInterval(
timerInterval
);

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

/* =================================
音声読み上げ
================================= */

function speak(text){

if(
!window.speechSynthesis
){
return;
}

const msg =

new SpeechSynthesisUtterance(
text
);

msg.lang =
"ja-JP";

speechSynthesis.cancel();

speechSynthesis.speak(
msg
);

}

/* =================================
ドラッグ並び替え
================================= */

function enableSortable(){

const list =
document.getElementById(
"scheduleList"
);

if(!list){
return;
}

new Sortable(

list,

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

/* =================================
教員モード
================================= */

function setupTeacherMode(){

const settingsBtn =
document.getElementById(
"settingsBtn"
);

const modal =
document.getElementById(
"passwordModal"
);

const passwordInput =
document.getElementById(
"passwordInput"
);

const okBtn =
document.getElementById(
"passwordOkBtn"
);

const cancelBtn =
document.getElementById(
"passwordCancelBtn"
);

const teacherView =
document.getElementById(
"teacherView"
);

if(
!settingsBtn
){
return;
}

let pressTimer;

/* 長押し開始 */

settingsBtn.addEventListener(
"mousedown",
startPress
);

settingsBtn.addEventListener(
"touchstart",
startPress
);

/* 長押し解除 */

settingsBtn.addEventListener(
"mouseup",
cancelPress
);

settingsBtn.addEventListener(
"mouseleave",
cancelPress
);

settingsBtn.addEventListener(
"touchend",
cancelPress
);

function startPress(){

pressTimer =
setTimeout(()=>{

modal.style.display =
"flex";

passwordInput.value = "";

passwordInput.focus();

},3000);

}

function cancelPress(){

clearTimeout(
pressTimer
);

}

/* OK */

okBtn.addEventListener(
"click",
()=>{

if(

passwordInput.value ===

TEACHER_PASSWORD

){

modal.style.display =
"none";

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
else{

alert(
"パスコードが違います"
);

passwordInput.value = "";

}

}
);

/* キャンセル */

cancelBtn.addEventListener(
"click",
()=>{

modal.style.display =
"none";

}
);

}

/* =================================
PWA
================================= */

if(

"serviceWorker"

in navigator

){

window.addEventListener(

"load",

()=>{

navigator.serviceWorker.register(

"./service-worker.js"

);

}

);

}
