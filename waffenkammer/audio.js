/* Eigene synthetische Klangkulisse: keine externen Audiodateien. */
(()=>{
'use strict';
const button=document.createElement('button');
button.id='soundToggle';button.type='button';button.textContent='Ton einschalten';button.setAttribute('aria-label','Klangkulisse einschalten');button.setAttribute('aria-pressed','false');document.body.append(button);
let ctx,master,music,rail,fire,enabled=false,timer,step=0;
const notes=[130.81,164.81,196,261.63,220,196,164.81,146.83];
function tone(frequency,when,length,level,type='sine'){
 const osc=ctx.createOscillator(),gain=ctx.createGain();osc.type=type;osc.frequency.value=frequency;
 gain.gain.setValueAtTime(0,when);gain.gain.linearRampToValueAtTime(level,when+.12);gain.gain.exponentialRampToValueAtTime(.0001,when+length);
 osc.connect(gain);gain.connect(music);osc.start(when);osc.stop(when+length+.1);osc.onended=()=>{osc.disconnect();gain.disconnect();};
}
function noise(filterType,frequency,destination){
 const buffer=ctx.createBuffer(1,ctx.sampleRate*4,ctx.sampleRate),data=buffer.getChannelData(0);for(let i=0;i<data.length;i++)data[i]=Math.random()*2-1;
 const source=ctx.createBufferSource(),filter=ctx.createBiquadFilter();source.buffer=buffer;source.loop=true;filter.type=filterType;filter.frequency.value=frequency;source.connect(filter);filter.connect(destination);source.start();
}
function init(){
 const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)throw Error('Web Audio unavailable');ctx=new Audio();master=ctx.createGain();master.gain.value=0;master.connect(ctx.destination);
 music=ctx.createGain();music.gain.value=.38;music.connect(master);
 rail=ctx.createGain();rail.gain.value=0;rail.connect(master);noise('lowpass',380,rail);
 fire=ctx.createGain();fire.gain.value=0;fire.connect(master);noise('highpass',850,fire);
 // Langsame, weiche Akkorde; einzelne helle Glocken als Akzent.
 timer=setInterval(update,100);update();
}
let nextNote=0;
function update(){
 if(!ctx)return;
 const now=ctx.currentTime,visible=!document.hidden;
 master.gain.setTargetAtTime(enabled&&visible?.35:0,now,.18);
 const riding=typeof ride!=='undefined'&&ride.mode==='riding'&&!ride.paused&&!document.querySelector('dialog[open]')&&visible;
 const fast=riding&&['drop','curve'].includes(ride.phase);
 rail.gain.setTargetAtTime(riding?(fast?.14:.055)*( .72+.28*Math.sin(now*(fast?43:21))**8):0,now,.12);
 fire.gain.setTargetAtTime(typeof state!=='undefined'&&state.room&&visible?.035*(.7+Math.random()*.6):0,now,.3);
 if(enabled&&visible&&ctx.state==='running'&&now>=nextNote){
   const root=notes[step%notes.length];tone(root,now+.03,5,.14);tone(root/2,now+.03,6,.12);tone(root*1.5,now+.08,4.5,.055);
   if(step%2===0)tone(root*4,now+.25,3,.035);step++;nextNote=now+4;
 }
}
function label(){button.textContent=enabled?'Ton ausschalten':'Ton einschalten';button.setAttribute('aria-label',button.textContent);button.setAttribute('aria-pressed',String(enabled));}
async function activate(){try{if(!ctx)init();await ctx.resume();enabled=true;label();update();}catch{enabled=false;label();button.textContent='Ton nicht verfügbar';}}
button.addEventListener('click',()=>{if(!enabled){activate();return;}enabled=false;label();update();});
for(const id of ['entryOpen','entryFree'])document.getElementById(id)?.addEventListener('click',()=>{if(!ctx)activate();});
document.addEventListener('visibilitychange',()=>{if(!ctx)return;if(document.hidden){master.gain.setValueAtTime(0,ctx.currentTime);ctx.suspend().catch(()=>{});}else if(enabled){ctx.resume().then(update).catch(()=>{});}});
window.addEventListener('pagehide',()=>{clearInterval(timer);if(ctx)ctx.close().catch(()=>{});});
window.addEventListener('pageshow',event=>{if(event.persisted){ctx=undefined;enabled=false;nextNote=0;label();}});
})();
