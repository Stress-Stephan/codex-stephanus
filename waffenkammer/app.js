'use strict';
const $=s=>document.querySelector(s), world=$('#world'), viewport=$('#viewport');
const state={room:false,z:0,yaw:0,targetZ:0,targetYaw:0,keys:new Set(),reduced:matchMedia('(prefers-reduced-motion: reduce)').matches,last:0};
const gallery=[
 {file:'legende-bote.jpeg',title:'Der Ruf nach dem Boten',copy:'Der Ruf nach dem Boten – das neue Originalbild der Legende.'},
 {file:'legende-gefaehrte.jpeg',title:'Der Gefährte',copy:'Der Gefährte – das neue Originalbild der Legende.'},
 {file:'legende-siegelbruch.jpeg',title:'Siegelbruch',copy:'Siegelbruch – die zuerst angehängte Bildvariante.'}
];
const books=Object.entries(WAFFEN).filter(([id])=>id==='AS'||id==='ST').flatMap(([series,data])=>data.titles.map((title,i)=>({id:series+String(i+1).padStart(2,'0'),series,title,number:i+1,img:`assets/${series}${String(i+1).padStart(2,'0')}_Cover_v2.jpg`,url:WAFFEN.links[series+String(i+1).padStart(2,'0')]||data.url,direct:!!WAFFEN.links[series+String(i+1).padStart(2,'0')]})));
let sceneDepthOffset=0;
function plane(cls,x,y,z,w,h,rotation=''){const el=document.createElement('div');el.className=`surface ${cls}`;el.style.cssText=`width:${w}px;height:${h}px;transform:translate3d(${x}px,${y}px,${-(z+sceneDepthOffset)}px) ${rotation}`;world.append(el);return el;}
function object(cls,x,y,z,w,h,rotation='',tag='div'){const el=document.createElement(tag);el.className=`object ${cls}`;el.style.cssText=`width:${w}px;height:${h}px;transform:translate3d(${x}px,${y}px,${-(z+sceneDepthOffset)}px) ${rotation}`;world.append(el);return el;}
function torch(x,z,rotation=''){const light=object('torch',x,-325,z,66,145,rotation);light.innerHTML='<span class="sconce"><i class="flame flame-outer"></i><i class="flame flame-inner"></i><i class="flame flame-core"></i><b class="wax"></b><b class="iron-cup"></b><b class="iron-stem"></b></span>';light.setAttribute('aria-hidden','true');}
function makeArch(z){const arch=object('arch natural-arch',-460,-420,z,920,720);const ns='http://www.w3.org/2000/svg';const svg=document.createElementNS(ns,'svg');svg.setAttribute('viewBox','0 0 920 720');svg.setAttribute('aria-hidden','true');const defs=document.createElementNS(ns,'defs'),pattern=document.createElementNS(ns,'pattern'),texture=document.createElementNS(ns,'image');pattern.id='arch-rock-'+z;pattern.setAttribute('patternUnits','userSpaceOnUse');pattern.setAttribute('width','920');pattern.setAttribute('height','920');texture.setAttribute('href','assets/naturstein.png');texture.setAttribute('width','920');texture.setAttribute('height','920');pattern.append(texture);defs.append(pattern);svg.append(defs);for(let i=0;i<19;i++){const a=Math.PI+i*Math.PI/19+.007,b=Math.PI+(i+1)*Math.PI/19-.007;const pt=(r,t)=>[460+Math.cos(t)*r,460+Math.sin(t)*r];const p=pt(457,a),q=pt(457,b),r=pt(416,b),t=pt(416,a);const stone=document.createElementNS(ns,'path');stone.setAttribute('d',`M${p} A457 457 0 0 1 ${q} L${r} A416 416 0 0 0 ${t} Z`);stone.setAttribute('fill','url(#arch-rock-'+z+')');stone.style.filter='brightness('+(0.75+(i%5)*.07)+')';stone.setAttribute('stroke','#201e16');stone.setAttribute('stroke-width','3');svg.append(stone);}for(const x of [3,877])for(let y=460;y<720;y+=65){const block=document.createElementNS(ns,'rect');block.setAttribute('x',x);block.setAttribute('y',y);block.setAttribute('width','40');block.setAttribute('height','62');block.setAttribute('rx','4');block.setAttribute('fill','url(#arch-rock-'+z+')');block.setAttribute('stroke','#242219');block.setAttribute('stroke-width','3');svg.append(block);}arch.append(svg);return arch;}
function buildCorridor(){
 world.replaceChildren();
 plane('stone',-460,-420,0,4600,720,'rotateY(90deg)');
 plane('stone',460,-420,4600,4600,720,'rotateY(-90deg)');
 plane('floor',-460,300,4600,920,4600,'rotateX(90deg)');
 plane('stone ceiling',-460,-420,0,920,4600,'rotateX(-90deg)');
 plane('stone',-460,-420,4600,285,720);plane('stone',175,-420,4600,285,720);plane('stone',-175,-420,4600,350,150);
 for(let z=400;z<=4400;z+=600){makeArch(z);torch(-418,z+170,'rotateY(45deg)');torch(360,z-140,'rotateY(-45deg)');}
 gallery.forEach((item,i)=>{const z=950+i*1000;const frame=object('painting wall-art',-443,-300,z,402,600,'rotateY(90deg)','button');frame.dataset.galleryIndex=i;frame.setAttribute('aria-label',`Bild betrachten: ${item.title}`);const img=document.createElement('img');img.src='assets/'+item.file;img.alt=item.title;const label=document.createElement('span');label.textContent=String(i+1).padStart(2,'0')+' · '+item.title;frame.append(img,label);frame.onclick=()=>openGallery(item);});
 const door=object('door',-175,-270,4570,350,570,'','button');door.id='chamberDoor';door.setAttribute('aria-label','Tür zur Waffenkammer öffnen');door.innerHTML='<span class="plaque"><small>DIE 30 WAFFEN<br>GEGEN DAS GRAU</small>Waffenkammer<br>des Schalks</span>';door.onclick=enterRoom;
 updateCamera();
}
function buildRoom(append=false){
 if(!append)world.replaceChildren();sceneDepthOffset=append?4600:0;
 plane('stone',-1350,-1000,0,3000,1300,'rotateY(90deg)');
 plane('stone',1350,-1000,3000,3000,1300,'rotateY(-90deg)');
 plane('stone',-1350,-1000,3000,2700,1300);
 plane('floor',-1350,300,3000,2700,3000,'rotateX(90deg)');
 plane('stone ceiling',-1350,-1000,0,2700,3000,'rotateX(-90deg)');
 const sign=object('room-sign',-620,-985,2980,1240,70);sign.innerHTML='DIE WAFFENKAMMER<small>30 KLEINE FLUCHTEN AUS DEM GRAU</small>';
 const mural=object('chamber-mural',-430,-990,2970,860,1290,'','button');mural.setAttribute('aria-label','Das große Schmiedebild betrachten');mural.innerHTML='<img src="assets/legende-schmied.jpeg" alt="Der Schmied mit dem Schalk – großes Bild gegenüber dem Eingang">';mural.onclick=()=>showDetail('assets/legende-schmied.jpeg','Die Schmiede','DIE WAFFENKAMMER','Das große Schmiedebild gegenüber dem Eingang.','https://stephan-universum.de/legende','Die Legende lesen');
 const forge=object('forge website-forge oven-only',250,-400,2300,700,700);forge.innerHTML='<img src="assets/schmiede-ofen.png" alt="Der freistehende Schmiedeofen der Website, ohne Figur und Amboss"><span class="forge-glow" aria-hidden="true"></span>';
 for(const [series,x,rotation,z] of [['AS',-1330,'rotateY(90deg)',1150],['ST',1330,'rotateY(-90deg)',2450]]){
  const wall=object('bookwall',x,-430,z,1300,730,rotation);
  books.filter(b=>b.series===series).forEach(book=>wall.append(bookButton(book,'book')));
  const label=object('room-sign',x,-525,z,1300,70,rotation);label.textContent=WAFFEN[series].name;
 }
 for(const x of [-1050,900])for(const z of [700,2100,2900])torch(x,z);
 sceneDepthOffset=0;
 updateCamera();
}
function bookButton(book,cls){const b=document.createElement('button');b.className=cls;b.setAttribute('aria-label',`${book.id}: ${book.title}`);const img=document.createElement('img');img.src=book.img;img.alt=book.title;img.loading=cls==='catalog-book'?'lazy':'eager';img.decoding='async';b.append(img);if(cls==='catalog-book'){const label=document.createElement('span');label.textContent=book.title;b.append(label);}b.onclick=()=>openBook(book);return b;}
function showDetail(img,title,eyebrow,copy,url,linkText){
 const content=$('#detailContent');content.replaceChildren();const image=document.createElement('img');image.src=img;image.alt=title;const info=document.createElement('div');const small=document.createElement('p');small.className='eyebrow';small.textContent=eyebrow;const h=document.createElement('h2');h.textContent=title;const p=document.createElement('p');p.textContent=copy;const a=document.createElement('a');a.className='primary';a.href=url;a.target='_blank';a.rel='noopener noreferrer';a.textContent=linkText+' ↗';info.append(small,h,p,a);content.append(image,info);$('#detail').showModal();state.keys.clear();
}
function openGallery(item){showDetail('assets/'+item.file,item.title,'BILDER DER LEGENDE',item.copy,'https://stephan-universum.de/legende','Die ganze Legende lesen');}
function openBook(book){showDetail(book.img,book.title,`${WAFFEN[book.series].name.toUpperCase()} · NR. ${book.number}`,book.series==='AS'?'Eine kleine absurde Geschichte zum Lesen, Ausmalen und Weiterdenken. Wähle deine Waffe gegen das Grau.':'A small escape into colour, quiet humour and a little absurdity.',book.url,book.direct?'Dieses Buch ansehen':'Buchreihe auf Amazon ansehen');}
function enterRoom(){state.room=true;state.z=state.targetZ=350;state.yaw=state.targetYaw=0;buildRoom();$('.chapter').classList.add('room');$('#chapterLabel').textContent='30 WAFFEN GEGEN DAS GRAU';$('#sceneTitle').textContent='Die Schmiede des Schalks.';$('#sceneCopy').textContent='';$('#skip').textContent='Zurück zum Bildergang ↗';$('#roomNav').hidden=false;$('#doorPrompt').hidden=true;$('#hint').innerHTML='Wand auswählen · Cover anklicken<br>W / S gehen · A / D umsehen';setRoomActive('forge');$('#location').textContent='Die Waffenkammer · Die Schmiede';$('#arrival').textContent='Wähle eine Wand und entdecke deine Waffe.';}
function returnToGang(){state.room=false;state.z=state.targetZ=0;state.yaw=state.targetYaw=0;buildCorridor();$('.chapter').classList.remove('room');$('#chapterLabel').textContent='DIE LEGENDE · DER BILDERGANG';$('#sceneTitle').innerHTML='Jede Waffe<br>hat eine Geschichte.';$('#sceneCopy').innerHTML='Folge den Bildern. Am Ende des Ganges<br>wartet die Waffenkammer des Schalks.';$('#skip').innerHTML='Direkt zur Waffenkammer <span>↗</span>';$('#roomNav').hidden=true;$('#arrival').textContent='';$('#hint').innerHTML='W / S gehen · A / D umsehen<br>Bilder anklicken und entdecken';}
function setRoomActive(view){document.querySelectorAll('[data-view]').forEach(b=>b.classList.toggle('active',b.dataset.view===view));}
function roomView(view){$('#arrival').textContent='';state.targetZ=view==='forge'?1100:1800;state.targetYaw=view==='left'?-90:view==='right'?90:0;setRoomActive(view);$('#location').textContent='Die Waffenkammer · '+(view==='forge'?'Die Schmiede':WAFFEN[view==='left'?'AS':'ST'].name);}
function updateCamera(){const scale=Math.max(.48,Math.min(1,innerWidth/1050)),sideShift=!state.room&&document.body.classList.contains('guided')&&!document.body.classList.contains('coaster')?Math.abs(state.yaw)/90*240:0,cameraX=(state.pathX||0)+sideShift,cameraY=state.pathY||0;viewport.style.perspective=`${700*scale}px`;world.style.transform=`translateZ(${700*scale}px) scale3d(${scale},${scale},${scale}) rotateZ(${state.roll||0}deg) rotateX(${state.pitch||0}deg) rotateY(${state.yaw}deg) translate3d(${-cameraX}px,${-cameraY}px,${state.z}px)`;}
function move(dir,delta){if(document.body.classList.contains('guided')||document.body.classList.contains('at-entry'))return;if(dir==='forward'||dir==='back')state.targetZ=Math.max(0,Math.min(state.room?2350:4020,state.targetZ+(dir==='forward'?1:-1)*delta));else state.targetYaw=Math.max(-85,Math.min(85,state.targetYaw+(dir==='right'?1:-1)*delta*.06));}
function tick(t){const dt=Math.min(40,t-(state.last||t));state.last=t;const dialogOpen=document.querySelector('dialog[open]');if(typeof rideUpdate==='function')rideUpdate(dt,!!dialogOpen);if(!dialogOpen)for(const key of state.keys)move(key,dt*.6);else state.keys.clear();const a=state.reduced?1:1-Math.exp(-dt/120);state.z+=(state.targetZ-state.z)*a;state.yaw+=(state.targetYaw-state.yaw)*a;updateCamera();if(!state.room){const pct=Math.round(state.z/4020*100);$('#progress').style.width=pct+'%';$('#doorPrompt').hidden=pct<94||document.body.classList.contains('guided');$('#location').textContent=pct<5?'Am Anfang der Legende':pct>94?'Vor der Waffenkammer':`Der Bildergang · ${pct} %`;$('.chapter').style.opacity=Math.max(.12,1-state.z/850);$('.chapter').style.visibility=state.z>900?'hidden':'visible';}else{$('.chapter').style.opacity='1';$('.chapter').style.visibility='visible';$('#progress').style.width='100%';}requestAnimationFrame(tick);}
const keyMap={w:'forward',ArrowUp:'forward',s:'back',ArrowDown:'back',a:'left',ArrowLeft:'left',d:'right',ArrowRight:'right'};
addEventListener('keydown',e=>{if(document.querySelector('dialog[open]'))return;const k=keyMap[e.key]||keyMap[e.key.toLowerCase()];if(k){e.preventDefault();if(!e.repeat)move(k,90);state.keys.add(k);}if(e.key==='Enter'&&!state.room&&state.z>3800)enterRoom();});
addEventListener('keyup',e=>{const k=keyMap[e.key]||keyMap[e.key.toLowerCase()];state.keys.delete(k);});
addEventListener('blur',()=>state.keys.clear());document.addEventListener('visibilitychange',()=>state.keys.clear());
document.querySelectorAll('[data-move]').forEach(b=>{b.addEventListener('pointerdown',e=>{e.preventDefault();b.setPointerCapture(e.pointerId);state.keys.add(b.dataset.move);move(b.dataset.move,90);});for(const event of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(event,()=>state.keys.delete(b.dataset.move));});
viewport.addEventListener('wheel',e=>{if(document.querySelector('dialog[open]'))return;e.preventDefault();move(e.deltaY>0?'forward':'back',Math.min(180,Math.abs(e.deltaY)*.9));},{passive:false});
$('#skip').onclick=()=>state.room?returnToGang():enterRoom();$('#enter').onclick=enterRoom;document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>roomView(b.dataset.view));
function renderCatalog(filter='all'){const grid=$('#catalogGrid');grid.replaceChildren(...books.filter(b=>filter==='all'||b.series===filter).map(b=>bookButton(b,'catalog-book')));}
$('#overview').onclick=()=>{renderCatalog();document.querySelectorAll('[data-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.filter==='all')));$('#catalog').showModal();state.keys.clear();};
document.querySelectorAll('[data-filter]').forEach(b=>b.onclick=()=>{renderCatalog(b.dataset.filter);document.querySelectorAll('[data-filter]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));});
$('#help').onclick=()=>{$('#instructions').showModal();state.keys.clear();};document.querySelectorAll('dialog .close').forEach(b=>b.onclick=()=>b.closest('dialog').close());
for(const d of document.querySelectorAll('dialog'))d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close();}});
function updateMotion(){document.body.classList.toggle('reduced',state.reduced);$('#motion').setAttribute('aria-pressed',String(state.reduced));$('#motion').textContent=state.reduced?'Ruhige Bewegung ausschalten':'Ruhige Bewegung einschalten';}
$('#motion').onclick=()=>{state.reduced=!state.reduced;updateMotion();};$('#restart').onclick=()=>{$('#instructions').close();returnToGang();};addEventListener('resize',updateCamera);
updateMotion();buildCorridor();requestAnimationFrame(tick);








