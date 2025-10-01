// Utility to animate + update text
function updateDisplay(el, text, bg, color="white") {
  el.textContent = text;
  el.style.background = bg;
  el.style.color = color;
  el.classList.remove("pop");
  void el.offsetWidth; // reset animation
  el.classList.add("pop");
}

// ---------- Counter 1: for loop ----------
let c1, num1 = 1;
const el1 = document.getElementById("counter1");

function counterForLoop(i) {
  for (let j = i; j <= i; j++) {
    updateDisplay(el1, j, "rgba(255,255,255,0.1)");
  }
}

function startCounter1() {
  if (c1) return;
  c1 = setInterval(() => {
    counterForLoop(num1);
    num1++;
    if (num1 > 10) num1 = 1; // loop back
  }, 500);
}
function stopCounter1(){ clearInterval(c1); c1=null; }
function restartCounter1(){ stopCounter1(); num1=1; el1.textContent=0; }


// ---------- Counter 2: while loop ----------
let c2, sum=0, addNum=1;
const el2 = document.getElementById("counter2");

function counterWhileLoop() {
  let done = false;
  while (!done) {
    sum += addNum;
    updateDisplay(el2, sum, "rgba(255,255,255,0.1)");
    addNum++;
    done = true; // only one step
  }
}

function startCounter2() {
  if (c2) return;
  c2 = setInterval(() => {
    counterWhileLoop();
    if (sum >= 30) {
      sum = 0;
      addNum = 1;
    }
  }, 700);
}
function stopCounter2(){ clearInterval(c2); c2=null; }
function restartCounter2(){ stopCounter2(); sum=0; addNum=1; el2.textContent=0; }


// ---------- Color Loop: forEach ----------
const colors = ["red","orange","yellow","green","blue","indigo","violet"];
let c3, i=0;
const box = document.getElementById("colorBox");

function colorForEach(index) {
  colors.forEach((color, idx) => {
    if (idx === index) {
      updateDisplay(box, color, color, (color==="yellow")?"black":"white");
    }
  });
}

function startColors() {
  if (c3) return;
  c3 = setInterval(() => {
    colorForEach(i);
    i++;
    if (i >= colors.length) i = 0;
  }, 800);
}
function stopColors(){ clearInterval(c3); c3=null; }
function restartColors(){ stopColors(); i=0; box.textContent="Start"; box.style.background="rgba(255,255,255,0.1)"; }
