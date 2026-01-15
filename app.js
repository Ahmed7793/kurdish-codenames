const WORDS = [
  "نان","ئاو","خانوو","بازاڕ","رێگا","کلیل","هاوڕێ","دوژمن","منداڵ","افرەت",
  "پیاو","سەرباز","شار","گوند","قوتابخانە","شاخ","ڕوبار","ترس","هێز","هیوا",
  "نهێنی","دەنگ","یاری","موزیک","هەڵپەڕکێ","تۆپ","ئاگر","سێبەر",
  "وڵات","سنوور","ئاڵا","جەنگ","ئاشتی","یاسا","دەسەڵات","شۆڕش",
  "سیخوڕ","جفرە","دۆسیە","تۆڕ","چاودێری","نامە","ناپاکی","تەڵە",
  "زریان","بیابان","دارستان","مانگ","خۆر","ئەستێرە","ڕەشەبا","بەرد",
  "بیرەوەری","مێشک","خەو","خەوی ترسناک","بێدەنگی","توڕەیی","گومان","بڕیار",
  "اوێنە","دەرگا","ماسک","دیوار","زنجیرە","برین"
];

const grid = document.getElementById("grid");
const newGameBtn = document.getElementById("newGame");
const spymasterToggle = document.getElementById("spymaster");
const redLeftEl = document.getElementById("redLeft");
const blueLeftEl = document.getElementById("blueLeft");

let state;

function shuffle(a){
  for(let i=a.length-1;i>0;i--){
    const j=Math.floor(Math.random()*(i+1));
    [a[i],a[j]]=[a[j],a[i]];
  }
}

function newGame(){
  const pool=[...new Set(WORDS)];
  shuffle(pool);
  const words=pool.slice(0,25);

  const startRed=Math.random()<0.5;
  const roles=[];
  for(let i=0;i<(startRed?9:8);i++) roles.push("red");
  for(let i=0;i<(startRed?8:9);i++) roles.push("blue");
  for(let i=0;i<7;i++) roles.push("neutral");
  roles.push("assassin");
  shuffle(roles);

  state={
    words,roles,
    revealed:Array(25).fill(false),
    left:{
      red:roles.filter(r=>r==="red").length,
      blue:roles.filter(r=>r==="blue").length
    }
  };
  render();
}

function render(){
  grid.innerHTML="";
  redLeftEl.textContent=state.left.red;
  blueLeftEl.textContent=state.left.blue;
  document.body.classList.toggle("spymaster", spymasterToggle.checked);

  state.words.forEach((w,i)=>{
    const c=document.createElement("div");
    c.className="card "+state.roles[i]+(state.revealed[i]?" revealed":"");
    c.textContent=w;
    c.onclick=()=>reveal(i);
    grid.appendChild(c);
  });
}

function reveal(i){
  if(state.revealed[i]) return;
  state.revealed[i]=true;
  const r=state.roles[i];
  if(r==="red") state.left.red--;
  if(r==="blue") state.left.blue--;
  if(r==="assassin") alert("💀 Assassin!");
  render();
}

newGameBtn.onclick=newGame;
spymasterToggle.onchange=render;
newGame();
