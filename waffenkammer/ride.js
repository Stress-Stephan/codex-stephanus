'use strict';
// One continuous scene: arrival and return never rebuild the corridor.
const ride={mode:'entry',phase:'entry',paused:false,index:0,elapsed:0,duration:0,clock:performance.now()};
const HOME_URL='https://stephan-universum.de/';
const ROOM_ORIGIN=4600;
document.body.classList.add('at-entry','guided');
function addRails(){for(const x of [-125,115])plane('rail',x,294,6500,10,6500,'rotateX(90deg)');plane('sleepers',-170,297,6500,340,6500,'rotateX(90deg)');}
function connectRoute(){buildRoom(true);addRails();for(const el of world.children)el.classList.add('route-main');}
connectRoute();
function resetCoasterCamera(){state.pathX=0;state.pathY=0;state.pitch=0;state.roll=0;document.body.classList.remove('coaster');}
function showMainRoute(show){document.body.classList.toggle('shaft-only',!show);}
function positionAtSummit(){const p=dropPoint(0);state.pathX=p.x-650;state.pathY=p.y;state.z=state.targetZ=p.z;state.yaw=state.targetYaw=90;state.pitch=0;state.roll=0;document.body.classList.add('coaster');showMainRoute(false);updateCamera();}
function rideUI(){
 const active=ride.mode==='riding',inRoom=ride.mode==='arrived';
 $('#cart').hidden=ride.mode==='entry';$('#rideHUD').hidden=!active;$('#ridePause').hidden=!active;
 $('#ridePause').textContent=ride.paused?'Weiterfahren':'Pause';$('#ridePause').setAttribute('aria-pressed',String(ride.paused));
 $('#rideInspect').hidden=!active||!['turn','gallery'].includes(ride.phase);$('#rideSkip').hidden=!active||ride.phase.startsWith('return');
 $('#roomNav').hidden=!inRoom;state.keys.clear();
}
function segment(phase,z,yaw,duration){Object.assign(ride,{phase,elapsed:0,duration,fromZ:state.z,fromYaw:state.yaw,toZ:z,toYaw:yaw});rideUI();}
function openChamberDoor(){const door=$('#chamberDoor');if(door){door.classList.add('opening-chamber');door.style.transform='translate3d(-175px,-270px,-4570px) rotateY(-105deg)';door.style.pointerEvents='none';}}
function openEntry(){if(ride.mode!=='entry')return;ride.mode='opening';$('#entry').classList.add('opening');$('#entryOpen').disabled=true;rideUI();setTimeout(()=>{if(ride.mode==='opening'){$('#entry').hidden=true;document.body.classList.remove('at-entry');startRide();}},1900);}
function startRide(){ride.mode='riding';ride.paused=false;ride.clock=performance.now();$('#rideCaption').textContent='Festhalten. Das Grau bleibt oben!';if(state.reduced){$('#departureDarkness').style.opacity='0';resetCoasterCamera();showMainRoute(true);state.z=state.targetZ=0;state.yaw=state.targetYaw=0;segment('approach',650,0,1400);}else{positionAtSummit();ride.phase='launch';ride.elapsed=0;ride.duration=1500;rideUI();}}
function arriveInside(){
 $('#departureDarkness').hidden=true;
 resetCoasterCamera();showMainRoute(true);$('#entry').hidden=true;document.body.classList.remove('at-entry');openChamberDoor();
 state.room=true;state.z=state.targetZ=5700;state.yaw=state.targetYaw=0;state.pitch=10;ride.mode='arrived';ride.paused=false;
 $('#arrival').textContent='';$('#doorPrompt').hidden=true;setRoomActive('forge');rideUI();updateCamera();
}
enterRoom=arriveInside;
function nextPhase(){
 if(ride.phase==='approach')segment('turn',900,-90,1600);
 else if(ride.phase==='turn')segment('gallery',3500,-90,16000);
 else if(ride.phase==='gallery'){ $('#rideCaption').textContent='Die Waffenkammer öffnet sich.';segment('forward',3950,0,2200);}
 else if(ride.phase==='forward'){openChamberDoor();$('#rideCaption').textContent='Bitte sitzen bleiben. Wir fahren in die Waffenkammer.';segment('room',5700,0,6500);}
 else if(ride.phase==='room')arriveInside();
}
const mist=document.createElement('div');mist.id='returnMist';mist.setAttribute('aria-hidden','true');mist.hidden=true;document.body.append(mist);
const returnButton=document.createElement('button');returnButton.id='returnRide';returnButton.textContent='Zurück zur Website ↶';$('#roomNav').append(returnButton);
function beginReturn(){
 if(ride.mode!=='arrived')return;
 ride.mode='riding';ride.phase='return-align';ride.elapsed=0;ride.duration=1000;ride.paused=false;ride.clock=performance.now();
 ride.returnFrom={z:state.z,yaw:state.yaw,pitch:state.pitch||0};mist.removeAttribute('hidden');mist.style.opacity='0';
 $('#rideCaption').textContent='Die Lore bringt dich zurück zum Stephan-Universum.';rideUI();
}
function rideUpdate(dt,dialogOpen){
 const now=performance.now();dt=Math.min(1000,Math.max(0,now-ride.clock));ride.clock=now;
 if(ride.mode!=='riding'||ride.paused||dialogOpen||document.hidden)return;
 ride.elapsed+=dt;const t=Math.min(1,ride.elapsed/ride.duration),smooth=t*t*(3-2*t);
 if(ride.phase==='launch'){
   const darkness=1-Math.max(0,Math.min(1,(t-.35)/.5));
   $('#departureDarkness').style.opacity=String(darkness);
   const p=dropPoint(0);state.pathX=p.x-650+650*t*t;state.pitch=-23*t*t;
   if(t===1){$('#departureDarkness').hidden=true;ride.phase='drop';ride.elapsed=0;ride.duration=4200;}
 }else if(ride.phase==='drop'){
   const p=dropPoint(t),d=dropTangent(t),look=dropPoint(Math.min(1,t+.16));state.pathX=p.x;state.pathY=p.y;state.z=state.targetZ=p.z;
   const dx=look.x-p.x,dy=look.y-p.y;state.pitch=-Math.atan2(dx===0?d.y:dy,dx===0?Math.hypot(d.x,d.z):Math.abs(dx))*180/Math.PI;
   if(t===1){ride.phase='curve';ride.elapsed=0;ride.duration=1800;$('#rideCaption').textContent='Um die Kurve – hinein in die Legende.';}
 }else if(ride.phase==='curve'){
   const p=bendPoint(t);state.pathX=p.x;state.pathY=0;state.z=state.targetZ=p.z;state.yaw=state.targetYaw=90*(1-t);state.pitch=0;state.roll=-8*Math.sin(Math.PI*t);
   if(t>.7)showMainRoute(true);
   if(t===1){resetCoasterCamera();state.z=state.targetZ=0;state.yaw=state.targetYaw=0;segment('approach',650,0,1400);}
 }else if(ride.phase==='return-align'){
   const p=ride.returnFrom;state.z=state.targetZ=p.z+(5700-p.z)*smooth;state.yaw=state.targetYaw=p.yaw*(1-smooth);state.pitch=p.pitch*(1-smooth);
   if(t===1){ride.phase='return';ride.elapsed=0;ride.duration=9000;state.room=false;rideUI();}
 }else if(ride.phase==='return'){
   const progress=t<.15?t*t/.2775:(t-.075)/.925;state.z=state.targetZ=5700-3700*progress;state.yaw=state.targetYaw=0;
   const fog=Math.max(0,Math.min(1,(t-.45)/.4));mist.style.opacity=String(fog*fog*(3-2*fog));
   if(t===1){mist.style.opacity='1';ride.phase='return-fog';ride.mode='leaving';$('#ridePause').disabled=true;$('#rideCaption').textContent='Zurück zum Stephan-Universum …';setTimeout(()=>window.location.assign(HOME_URL),1200);}
 }else if(ride.phase==='return-fog'){
   if(t===1){ride.mode='leaving';window.location.assign(HOME_URL);}
 }else{
   const travel=ride.phase==='approach'&&!state.reduced?.2*t*t*t-1.1*t*t+1.9*t:['gallery','turn'].includes(ride.phase)?t:smooth;
   state.z=state.targetZ=ride.fromZ+(ride.toZ-ride.fromZ)*travel;state.yaw=state.targetYaw=ride.fromYaw+(ride.toYaw-ride.fromYaw)*smooth;
   if(['turn','gallery'].includes(ride.phase)){ride.index=Math.max(0,Math.min(gallery.length-1,Math.round((state.z-1151)/1000)));$('#rideCaption').textContent=`${ride.index+1} / ${gallery.length} · ${gallery[ride.index].title} · Zum Anhalten auf ein Bild klicken`;}
   if(t===1)nextPhase();
 }
}
$('#entryOpen').onclick=openEntry;$('#ridePause').onclick=()=>{ride.paused=!ride.paused;rideUI();};$('#rideInspect').onclick=()=>openGallery(gallery[ride.index]);$('#rideSkip').onclick=arriveInside;$('#enter').onclick=arriveInside;$('#skip').onclick=arriveInside;returnButton.onclick=beginReturn;
$('#restart').onclick=()=>window.location.reload();
// Room views stay seated, in the same connected coordinate system.
roomView=function(view){if(ride.mode!=='arrived')return;state.targetZ=ROOM_ORIGIN+(view==='forge'?1100:1800);state.targetYaw=view==='left'?-90:view==='right'?90:0;state.pitch=view==='forge'?10:0;setRoomActive(view);};
function dropPoint(u){const v=1-u;return{x:v*v*v*-3500+3*v*v*u*-2300+3*v*u*u*-2200+u*u*u*-1000,y:v*v*v*-3000+3*v*v*u*-3000,z:-1000};}
function dropTangent(u){const v=1-u;return{x:3*v*v*1200+6*v*u*100+3*u*u*1200,y:6*v*u*3000,z:0};}
function bendPoint(u){const a=-Math.PI/2+u*Math.PI/2;return{x:-1000+Math.cos(a)*1000,y:0,z:Math.sin(a)*1000};}
function buildCoasterIntro(){
 const ns=document.createElement('div');ns.className='coaster-intro';ns.style.transformStyle='preserve-3d';world.append(ns);
 const add=(a,b,i)=>{const dx=b.x-a.x,dy=b.y-a.y,dz=b.z-a.z,length=Math.hypot(dx,dy,dz)+3,heading=Math.atan2(dx,dz)*180/Math.PI,down=Math.atan2(dy,Math.hypot(dx,dz))*180/Math.PI;const group=document.createElement('div');group.className='object coaster-segment';group.style.cssText=`transform:translate3d(${a.x}px,${a.y}px,${-a.z}px) rotateY(${-heading}deg) rotateX(${down}deg)`;ns.append(group);
 const local=(cls,x,y,z,w,h,rot='')=>{const el=document.createElement('div');el.className='surface '+cls;el.style.cssText=`width:${w}px;height:${h}px;transform:translate3d(${x}px,${y}px,${-z}px) ${rot}`;group.append(el);return el;};
 const wallTop=i<3?170:-420,wallHeight=300-wallTop;local('stone',-460,wallTop,0,length,wallHeight,'rotateY(90deg)');local('stone',460,wallTop,length,length,wallHeight,'rotateY(-90deg)');local('floor',-460,300,length,920,length,'rotateX(90deg)');local('stone ceiling',-460,-420,0,920,length,'rotateX(-90deg)');for(const x of [-125,115])local('rail',x,294,length,10,length,'rotateX(90deg)');local('sleepers',-170,297,length,340,length,'rotateX(90deg)');
 if(i%5===0){torch(365,length*.5,'rotateY(-55deg)');const light=world.lastElementChild;group.append(light);}
 };
 add({x:-4400,y:-3000,z:-1000},dropPoint(0),0);
 for(let i=0;i<28;i++)add(dropPoint(i/28),dropPoint((i+1)/28),i+1);
 for(let i=0;i<20;i++)add(bendPoint(i/20),bendPoint((i+1)/20),i+29);
}

buildCoasterIntro();positionAtSummit();rideUI();
