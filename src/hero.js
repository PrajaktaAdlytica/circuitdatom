import { attachScene } from './model.js';

const get = id => document.getElementById(id);
const film = document.querySelector('.film');
const stage = document.querySelector('.stage');
const marker = document.querySelector('.marker');
const play = get('play');
const state = {progress:0,reduced:window.cdMotionOff?.()||false};
const model = get('model');
const buttons = [...document.querySelectorAll('[data-chapter]')];
const copy = [
 ['Inspect the replacement','ORB-240 REV D · J14','Same package code','Compare the candidate with the board in scope.'],
 ['Separate the assembly','FIT REVIEW · OVERLAY','Four aligned layers','Shield, connector, solder-mask overlay and PCB.'],
 ['Compare the pin function','PIN 4 · FUNCTION MISMATCH','ENABLE → FAULT_N','The same pin position carries a different function.'],
 ['Check the board rule','SOLDER-MASK CLEARANCE','+0.20 mm over limit','3.40 mm candidate recommendation · 3.20 mm board maximum.'],
 ['Hand off to the engineer','ENGINEERING REVIEW','Rejected for Rev D','The simulated engineer records both findings. Open the case to inspect the cited evidence.']
];
const checkpoint = [0,.22,.48,.73,.95];
let active=-1, playing=false, elapsed=0, last=0, video=0, scrollTick=0;
const filmDuration=10600;
function show(value) {
  state.progress=value;
  get('track-fill').style.width=value*25+'%';
  const n=Math.min(4,Math.floor(value+.34));
  if(n===active)return;
  active=n;
  stage.dataset.step=String(n);
  const [caption,label,headline,detail]=copy[n];
  get('scene-caption').textContent=caption;
  get('finding-label').textContent=label;
  get('finding-value').textContent=headline;
  get('finding-detail').textContent=detail;
  marker.hidden=n!==2&&n!==3;
  buttons.forEach((b,i)=>i===n?b.setAttribute('aria-current','step'):b.removeAttribute('aria-current'));
  if(!state.reduced&&window.gsap){
    const axis=n===1?{y:10}:n===2?{x:-13}:n===3?{x:13}:{y:-10};
    gsap.fromTo(get('film-finding'),{...axis,opacity:.33},{x:0,y:0,opacity:1,duration:.44,overwrite:true,ease:'power2.out',clearProps:'transform,opacity'});
  }
}
function playState(){
  const label = playing?'Pause':state.progress>=3.99?'Replay':state.reduced?'Restart':'Play';
  play.querySelector('[data-label]').textContent=label;
  play.querySelector('[data-icon]').dataset.icon=playing?'pause':label==='Play'?'play':'arrow-counter-clockwise';
}
function stop(){playing=false;last=0;cancelAnimationFrame(video);playState()}
function tick(now){
  if(!playing)return;
  if(last)elapsed+=Math.min(now-last,50);
  last=now;
  const fraction=Math.min(1,elapsed/filmDuration);
  let index=checkpoint.findIndex((t,i)=>i>0&&fraction<t)-1;
  if(fraction>=checkpoint[4])index=4;
  index=Math.max(0,index);
  show(index===4?4:index+(fraction-checkpoint[index])/(checkpoint[index+1]-checkpoint[index]));
  if(fraction===1){stop();return}
  video=requestAnimationFrame(tick);
}
function start(){
  if(state.reduced){show(0);playState();return}
  const p=state.progress>=3.99?0:state.progress, i=Math.floor(p);
  elapsed=filmDuration*(checkpoint[i]+(p-i)*(checkpoint[i+1]-checkpoint[i]));
  show(p);playing=true;last=0;playState();
  cancelAnimationFrame(video);
  video=requestAnimationFrame(tick);
}
function measure(){
  const top=film.getBoundingClientRect().top+scrollY;
  const nav=getComputedStyle(document.documentElement).getPropertyValue('--nav').trim().replace('px','');
  return {start:top-Number(nav),span:Math.max(1,film.offsetHeight-stage.offsetHeight)};
}
buttons.forEach((button,i)=>button.addEventListener('click',()=>{
  stop();
  if(!state.reduced){
    const {start,span}=measure();
    window.cdScrollTo(start+i*span/4,{offset:0,immediate:true});
  }
  show(i);playState();
}));
play.addEventListener('click',()=>playing?stop():start());
get('skip-intro').addEventListener('click',event=>{
  event.preventDefault();stop();
  const target=get('problem');
  target.setAttribute('tabindex','-1');
  target.focus({preventScroll:true});
  window.cdScrollTo(target);
});
window.addEventListener('scroll',()=>{
  if(scrollTick||state.reduced)return;
  scrollTick=requestAnimationFrame(()=>{
    scrollTick=0;
    const {start,span}=measure();
    if(scrollY<start+4&&playing)return;
    stop();show(Math.min(4,Math.max(0,4*(scrollY-start)/span)));playState();
  });
},{passive:true});
window.addEventListener('circuitdatum:motion',()=>{
  state.reduced=window.cdMotionOff();
  stop();
  if(state.reduced)show(Math.round(state.progress));
});
document.addEventListener('visibilitychange',()=>{if(document.hidden)stop()});
const run=()=>{
  try {if(attachScene(model,marker,state))return;}
  catch(error){console.error('CircuitDatum scene unavailable',error);}
  model.dataset.failed='true';
  model.setAttribute('aria-label','Illustrative connector on an inspection bench. Live 3D rendering is unavailable.');
};
show(0);playState();
requestAnimationFrame(()=>{
  run();
  if(!state.reduced&&window.gsap){
    const opener=gsap.fromTo('.hero-content > *',{opacity:.5,y:14},{
      opacity:1,y:0,stagger:.11,duration:.65,ease:'power2.out',clearProps:'opacity,transform'
    });
    window.addEventListener('circuitdatum:motion',()=>opener.progress(1),{once:true});
  }
  if(!state.reduced&&!location.hash&&scrollY<5)start();
});
