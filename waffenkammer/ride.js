'use strict';
const ride={mode:'entry',paused:false,index:0,phase:'approach',elapsed:0,duration:0,fromZ:0,fromYaw:0,toZ:0,toYaw:0,clock:performance.now()};
document.body.classList.add('at-entry');
function addRails(room=false){const length=room?1900:6500;for(const x of [-125,115])plane('rail',x,294,length,10,length,'rotateX(90deg)').setAttribute('aria-hidden','true');plane('sleepers',-170,297,length,340,length,'rotateX(90deg)').setAttribute('aria-hidden','true');}
function connectRoute(){buildRoom(true);addRails();}
connectRoute();
function rideUI(){const ready=ride.mode==='ready',active=ride.mode==='riding',arrived=ride.mode==='arrived';$('#rideHUD').hidden=!ready&&!active&&!arrived;$('#cart').hidden=!ready&&!active&&!arrived;$('#rideStart').hidden=!ready;$('#ridePause').hidden=!active;$('#rideNext').hidden=!active||ride.phase==='room';$('#rideExit').hidden=!arrived;$('#rideExit').textContent='Aussteigen und Waffen entdecken ↗';$('#rideInspect').hidden=!active||!['turn','gallery'].includes(ride.phase);$('#rideSkip').hidden=arrived;$('#ridePause').textContent=ride.paused?'Weiterfahren':'Pause';$('#ridePause').setAttribute('aria-pressed',String(ride.paused));document.body.classList.toggle('guided',ready||active||arrived);state.keys.clear();}
function openEntry(){if(ride.mode!=='entry')return;ride.mode='opening';$('#entry').classList.add('opening');$('#entryOpen').disabled=true;setTimeout(()=>{if(ride.mode==='opening')readyRide();},1900);}
function readyRide(){ride.mode='ready';$('#entry').hidden=true;document.body.classList.remove('at-entry');$('#rideCaption').textContent='Einsteigen. Die Legende zieht gleich links an dir vorbei.';rideUI();}
function segment(phase,z,yaw,duration){ride.phase=phase;ride.fromZ=state.targetZ;ride.fromYaw=state.targetYaw;ride.toZ=z;ride.toYaw=yaw;ride.elapsed=0;ride.duration=duration;rideUI();}
function startRide(){ride.mode='riding';ride.paused=false;ride.index=0;$('#rideCaption').textContent='Die Lore rollt los. Gleich dreht sich dein Sitz zur linken Wand.';segment('approach',650,0,3500);}
function openChamberDoor(){const door=$('#chamberDoor');if(door){door.classList.add('opening-chamber');door.style.transform='translate3d(-175px,-270px,-4570px) rotateY(-105deg)';door.style.pointerEvents='none';}}
const originalEnterRoom=enterRoom;
function arriveInside(){originalEnterRoom();state.z=state.targetZ=850;state.yaw=state.targetYaw=0;addRails(true);ride.mode='arrived';ride.paused=false;$('#rideCaption').textContent='Endstation: mitten in der Waffenkammer. Bitte den Unsinn mitnehmen.';rideUI();updateCamera();}
function nextPhase(){if(ride.phase==='approach'){segment('turn',900,-90,2600);}else if(ride.phase==='turn'){segment('gallery',3500,-90,30000);}else if(ride.phase==='gallery'){$('#rideCaption').textContent='Die Waffenkammer öffnet sich. Dein Sitz dreht sich nach vorn.';segment('forward',3950,0,3000);}else if(ride.phase==='forward'){openChamberDoor();$('#rideCaption').textContent='Bitte sitzen bleiben. Die Lore fährt in die Waffenkammer.';segment('room',5450,0,8500);}else if(ride.phase==='room')arriveInside();}
function rideUpdate(dt,dialogOpen){const now=performance.now();dt=Math.min(1000,Math.max(0,now-ride.clock));ride.clock=now;if(ride.mode!=='riding'||ride.paused||dialogOpen||document.hidden)return;ride.elapsed+=dt;const p=Math.min(1,ride.elapsed/ride.duration);const ease=ride.phase==='gallery'?p:p*p*(3-2*p);state.targetZ=ride.fromZ+(ride.toZ-ride.fromZ)*(state.reduced?(p===1?1:0):ease);state.targetYaw=ride.fromYaw+(ride.toYaw-ride.fromYaw)*(state.reduced?(p===1?1:0):ease);state.z=state.targetZ;state.yaw=state.targetYaw;if(['turn','gallery'].includes(ride.phase)){ride.index=Math.max(0,Math.min(gallery.length-1,Math.round((state.z-1151)/1000)));$('#rideCaption').textContent=`${ride.index+1} / ${gallery.length} · ${gallery[ride.index].title} · Zum Anhalten auf ein Bild klicken`;}if(p===1)nextPhase();}
function freeWalk(){const wasEntry=['entry','opening'].includes(ride.mode);const outsideRoom=!state.room;ride.mode='free';ride.paused=false;$('#entry').hidden=true;document.body.classList.remove('at-entry');rideUI();if(wasEntry){state.z=state.targetZ=0;state.yaw=state.targetYaw=0;}if(outsideRoom){const z=Math.min(4020,state.z),yaw=state.yaw;buildCorridor();addRails();state.z=state.targetZ=z;state.yaw=state.targetYaw=yaw;updateCamera();}}
$('#entryOpen').onclick=openEntry;$('#entryFree').onclick=freeWalk;$('#rideStart').onclick=startRide;
$('#ridePause').onclick=()=>{ride.paused=!ride.paused;rideUI();};
$('#rideNext').onclick=()=>{ride.paused=false;const next=ride.index+1;if(ride.phase==='approach'){segment('turn',900,-90,1800);}else if(next<gallery.length&&['turn','gallery'].includes(ride.phase)){const target=1151+next*1000;segment('gallery',3500,-90,Math.max(4000,(3500-target)/98*1000));state.z=state.targetZ=target;ride.fromZ=target;ride.fromYaw=-90;state.yaw=state.targetYaw=-90;ride.index=next;}else{segment('forward',3950,0,2500);$('#rideCaption').textContent='Weiter zur Waffenkammer.';}};
$('#rideInspect').onclick=()=>openGallery(gallery[ride.index]);$('#rideSkip').onclick=arriveInside;
$('#rideFree').onclick=freeWalk;$('#rideExit').onclick=()=>{ride.mode='free';rideUI();$('#arrival').textContent='Willkommen in der Waffenkammer. Wähle eine Wand oder ein Buch.';};
enterRoom=function(){ride.mode='free';$('#entry').hidden=true;document.body.classList.remove('at-entry');rideUI();originalEnterRoom();addRails(true);};
const originalReturnToGang=returnToGang;returnToGang=function(){originalReturnToGang();connectRoute();ride.mode='ready';ride.paused=false;$('#rideCaption').textContent='Noch eine Runde? Oder lieber zu Fuß erkunden?';rideUI();};
$('#enter').onclick=enterRoom;$('#skip').onclick=()=>state.room?returnToGang():enterRoom();rideUI();

// Räumlicher Auftakt: steiler Schacht und anschließende Kurve zur Galerie.
function dropPoint(u){const v=1-u;return{x:v*v*v*-3500+3*v*v*u*-2300+3*v*u*u*-2200+u*u*u*-1000,y:v*v*v*-3000+3*v*v*u*-3000,z:-1000};}
function dropTangent(u){const v=1-u;return{x:3*v*v*1200+6*v*u*100+3*u*u*1200,y:6*v*u*3000,z:0};}
function bendPoint(u){const a=-Math.PI/2+u*Math.PI/2;return{x:-1000+Math.cos(a)*1000,y:0,z:Math.sin(a)*1000};}
function buildCoasterIntro(){
 const ns=document.createElement('div');ns.className='coaster-intro';ns.style.transformStyle='preserve-3d';world.append(ns);
 const add=(a,b,i)=>{const dx=b.x-a.x,dy=b.y-a.y,dz=b.z-a.z,length=Math.hypot(dx,dy,dz)+3,heading=Math.atan2(dx,dz)*180/Math.PI,down=Math.atan2(dy,Math.hypot(dx,dz))*180/Math.PI;const group=document.createElement('div');group.className='object coaster-segment';group.style.cssText=`transform:translate3d(${a.x}px,${a.y}px,${-a.z}px) rotateY(${-heading}deg) rotateX(${down}deg)`;ns.append(group);
 const local=(cls,x,y,z,w,h,rot='')=>{const el=document.createElement('div');el.className='surface '+cls;el.style.cssText=`width:${w}px;height:${h}px;transform:translate3d(${x}px,${y}px,${-z}px) ${rot}`;group.append(el);return el;};
 local('stone',-460,-420,0,length,720,'rotateY(90deg)');local('stone',460,-420,length,length,720,'rotateY(-90deg)');local('floor',-460,300,length,920,length,'rotateX(90deg)');local('stone ceiling',-460,-420,0,920,length,'rotateX(-90deg)');for(const x of [-125,115])local('rail',x,294,length,10,length,'rotateX(90deg)');local('sleepers',-170,297,length,340,length,'rotateX(90deg)');
 if(i%5===0){torch(365,length*.5,'rotateY(-55deg)');const light=world.lastElementChild;group.append(light);}
 };
 add({x:-3800,y:-3000,z:-1000},dropPoint(0),0);
 for(let i=0;i<28;i++)add(dropPoint(i/28),dropPoint((i+1)/28),i+1);
 for(let i=0;i<20;i++)add(bendPoint(i/20),bendPoint((i+1)/20),i+29);
}
function resetCoasterCamera(){state.pathX=0;state.pathY=0;state.pitch=0;state.roll=0;document.body.classList.remove('coaster');}
function positionAtSummit(){const p=dropPoint(0);state.pathX=p.x;state.pathY=p.y;state.z=state.targetZ=p.z;state.yaw=state.targetYaw=90;state.pitch=0;state.roll=0;document.body.classList.add('coaster');updateCamera();}
const galleryRideUI=rideUI;rideUI=function(){galleryRideUI();$('#rideStart').hidden=true;if(ride.mode==='opening')$('#cart').hidden=false;if(['drop','curve'].includes(ride.phase)){$('#rideNext').hidden=true;$('#rideInspect').hidden=true;}};
const galleryStartRide=startRide;startRide=function(){if(state.reduced){resetCoasterCamera();state.z=state.targetZ=0;state.yaw=state.targetYaw=0;galleryStartRide();return;}positionAtSummit();ride.mode='riding';ride.paused=false;ride.phase='drop';ride.elapsed=0;ride.duration=6500;$('#rideCaption').textContent='Festhalten. Das Grau bleibt oben!';ride.clock=performance.now();rideUI();};
readyRide=function(){$('#entry').hidden=true;document.body.classList.remove('at-entry');startRide();};
const galleryOpenEntry=openEntry;openEntry=function(){galleryOpenEntry();rideUI();};
const galleryRideUpdate=rideUpdate;rideUpdate=function(dt,dialogOpen){if(!['drop','curve'].includes(ride.phase)||ride.mode!=='riding'){galleryRideUpdate(dt,dialogOpen);return;}const now=performance.now();dt=Math.min(1000,Math.max(0,now-ride.clock));ride.clock=now;if(ride.paused||dialogOpen||document.hidden)return;ride.elapsed+=dt;const t=Math.min(1,ride.elapsed/ride.duration);
 if(ride.phase==='drop'){const u=1-Math.cos(t*Math.PI/2),p=dropPoint(u),d=dropTangent(u);state.pathX=p.x;state.pathY=p.y;state.z=state.targetZ=p.z;state.yaw=state.targetYaw=90;const look=dropPoint(Math.min(1,u+.16)),aheadX=look.x-p.x,aheadY=look.y-p.y;state.pitch=-Math.atan2(aheadX===0?d.y:aheadY,aheadX===0?Math.hypot(d.x,d.z):Math.abs(aheadX))*180/Math.PI;state.roll=0;if(t===1){ride.phase='curve';ride.elapsed=0;ride.duration=3500;$('#rideCaption').textContent='Einmal um die Kurve – und hinein in die Legende.';rideUI();}}
 else{const p=bendPoint(t);state.pathX=p.x;state.pathY=0;state.z=state.targetZ=p.z;state.yaw=state.targetYaw=90*(1-t);state.pitch=0;state.roll=-8*Math.sin(Math.PI*t);if(t===1){resetCoasterCamera();state.z=state.targetZ=0;state.yaw=state.targetYaw=0;galleryStartRide();}}
};
const galleryFreeWalk=freeWalk;freeWalk=function(){const fromCoaster=document.body.classList.contains('coaster');resetCoasterCamera();if(fromCoaster){state.z=state.targetZ=0;state.yaw=state.targetYaw=0;}galleryFreeWalk();};
const galleryArriveInside=arriveInside;arriveInside=function(){resetCoasterCamera();galleryArriveInside();state.z=state.targetZ=1100;state.pitch=10;updateCamera();};
const galleryEnterRoom=enterRoom;enterRoom=function(){resetCoasterCamera();galleryEnterRoom();state.z=state.targetZ=1100;state.pitch=10;updateCamera();};
const galleryReturnToGang=returnToGang;returnToGang=function(){resetCoasterCamera();galleryReturnToGang();buildCoasterIntro();ride.mode='entry';ride.phase='entry';ride.paused=false;$('#entry').hidden=false;$('#entry').classList.remove('opening');$('#entryOpen').disabled=false;document.body.classList.add('at-entry');positionAtSummit();rideUI();};
$('#entryOpen').onclick=openEntry;$('#entryFree').onclick=freeWalk;$('#rideStart').onclick=startRide;$('#rideFree').onclick=freeWalk;$('#rideSkip').onclick=arriveInside;$('#enter').onclick=enterRoom;$('#skip').onclick=()=>state.room?returnToGang():enterRoom();
buildCoasterIntro();positionAtSummit();rideUI();




