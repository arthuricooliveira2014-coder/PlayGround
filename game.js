const canvas=document.getElementById('game'),ctx=canvas.getContext('2d');
let W,H,dpr=1,last=0,started=false,won=false,dead=false;
const keys={},mouse={x:0,y:0,down:false};
const player={x:0,y:0,angle:0,r:.22,stamina:100};
const monsters=[];
let objective=0,power=100,near=null,flash=0;
function resize(){dpr=Math.min(devicePixelRatio||1,2);W=innerWidth;H=innerHeight;canvas.width=W*dpr;canvas.height=H*dpr;canvas.style.width=W+'px';canvas.style.height=H+'px';ctx.setTransform(dpr,0,0,dpr,0,0)}addEventListener('resize',resize);resize();
const map=[
'################',
'#......#.......#',
'#.####.#.###.#.#',
'#.#....#...#.#.#',
'#.#.######.#.#.#',
'#.#......#.#...#',
'#.######.#.###.#',
'#........#.....#',
'#.####.#####.#.#',
'#....#.....#.#.#',
'#.##.###.###.#.#',
'#..#...#...#...#',
'#.#####.#.###.#',
'#......#.....#.T',
'########.####.#',
'#...S...#.....#',
'################'];
function blocked(x,y){let r=Math.floor(y),c=Math.floor(x);return r<0||c<0||r>=map.length||c>=map[0].length||map[r][c]=='#'}
function find(ch){for(let y=0;y<map.length;y++)for(let x=0;x<map[y].length;x++)if(map[y][x]==ch)return{x:x+.5,y:y+.5}}
player.x=find('S').x;player.y=find('S').y;
const scanner={...find('.'),x:5.5,y:1.5,active:false};
const exit={x:15.5,y:13.5};
monsters.push({x:7.5,y:7.5,angle:0,phase:0},{x:12.5,y:11.5,angle:2,phase:1.7});
function wallDist(a){for(let d=.02;d<22;d+=.02){let x=player.x+Math.cos(a)*d,y=player.y+Math.sin(a)*d;if(blocked(x,y))return d}return 22}
function wallHit(x,y,a,max=22){for(let d=.02;d<max;d+=.025){let px=x+Math.cos(a)*d,py=y+Math.sin(a)*d;if(blocked(px,py))return d}return max}
function rotateAngle(){player.angle=(player.angle%(Math.PI*2)+Math.PI*2)%(Math.PI*2)}
function move(dx,dy){const nx=player.x+dx,ny=player.y+dy;if(!blocked(nx-player.r,player.y)&&!blocked(nx+player.r,player.y))player.x=nx;if(!blocked(player.x,ny-player.r)&&!blocked(player.x,ny+player.r))player.y=ny}
function update(dt){if(!started||dead||won)return;let forward=(keys.w||keys.arrowup?1:0)-(keys.s||keys.arrowdown?1:0);let side=(keys.d||keys.arrowright?1:0)-(keys.a||keys.arrowleft?1:0);if(touchMove.y)forward=-touchMove.y;if(touchMove.x)side=touchMove.x;const running=(keys.shift||touchMove.run)&&player.stamina>0&&forward!==0;if(running)player.stamina-=28*dt;else player.stamina=Math.min(100,player.stamina+18*dt);const speed=(running?3.25:2.05)*dt;move((Math.cos(player.angle)*forward+Math.cos(player.angle+Math.PI/2)*side)*speed,(Math.sin(player.angle)*forward+Math.sin(player.angle+Math.PI/2)*side)*speed);
  power=Math.max(0,power- (objective===1?1.1:.35)*dt);flash=Math.max(0,flash-dt);document.getElementById('powerbar').style.width=(power/100*100)+'%';
  if(objective===0&&Math.hypot(player.x-scanner.x,player.y-scanner.y)<.65)near='scanner';else if(objective===1&&Math.hypot(player.x-exit.x,player.y-exit.y)<.75)near='exit';else near=null;document.getElementById('interact').style.opacity=near?1:0;
  for(const m of monsters){m.phase+=dt;let ax=player.x-m.x,ay=player.y-m.y,dist=Math.hypot(ax,ay);let target=m.phase<.8?m.angle:Math.atan2(ay,ax);m.angle+=(Math.atan2(Math.sin(target-m.angle),Math.cos(target-m.angle))*.025);if(objective>0&&dist<7){const direct=wallHit(m.x,m.y,Math.atan2(ay,ax),dist)<dist-.15?false:true;if(!direct){m.x+=Math.cos(m.angle)*(.45+(dist<3?-.15:0))*dt;m.y+=Math.sin(m.angle)*(.45+(dist<3?-.15:0))*dt}}if(dist<.48)die()}
}
function die(){if(dead||won)return;dead=true;document.getElementById('hurt').classList.remove('hidden');setTimeout(reset,1500)}
function reset(){player.x=find('S').x;player.y=find('S').y;player.angle=0;scanner.active=false;objective=0;power=100;dead=false;won=false;document.getElementById('hurt').classList.add('hidden');document.getElementById('task').textContent='Find the red hand scanner';near=null}
function interact(){if(!near)return;if(near==='scanner'){scanner.active=true;objective=1;document.getElementById('task').textContent='Take the power core to the loading bay';flash=.45}if(near==='exit'){won=true;document.getElementById('complete').classList.remove('hidden')}}
function draw(){ctx.fillStyle='#080b0a';ctx.fillRect(0,0,W,H);const horizon=H*.51;ctx.fillStyle='#111916';ctx.fillRect(0,horizon,W,H-horizon);ctx.fillStyle='#090c0b';ctx.fillRect(0,0,W,horizon);
  // ceiling light and radial grime
  const grd=ctx.createRadialGradient(W*.5,horizon,20,W*.5,horizon,W*.7);grd.addColorStop(0,'rgba(223,207,159,.11)');grd.addColorStop(1,'rgba(0,0,0,.75)');ctx.fillStyle=grd;ctx.fillRect(0,0,W,H);
  const cols=200,sw=W/cols;for(let i=0;i<cols;i++){const a=player.angle+(i-cols/2)*.0019;const d=wallDist(a);let f=Math.cos((i-cols/2)*.0019);let hh=(H*.72)/(d*Math.max(.12,f));let x=i*sw;let shade=Math.max(12,180-d*25);ctx.fillStyle=`rgb(${shade*.55},${shade*.58},${shade*.50})`;ctx.fillRect(x,horizon-hh/2,sw+.7,hh);}
  // floor light strips
  ctx.fillStyle='rgba(170,163,121,.12)';for(let y=horizon;y<H;y+=Math.max(12,(y-horizon)*.14+12)){ctx.fillRect(0,y,W,1)}
  // sprites sorted by distance
  const sprites=[];for(const m of monsters)sprites.push({kind:'monster',...m,d:Math.hypot(m.x-player.x,m.y-player.y)});sprites.push({kind:'scanner',x:scanner.x,y:scanner.y,d:Math.hypot(scanner.x-player.x,scanner.y-player.y)});sprites.push({kind:'exit',x:exit.x,y:exit.y,d:Math.hypot(exit.x-player.x,exit.y-player.y)});sprites.sort((a,b)=>b.d-a.d);
  for(const s of sprites){let ang=Math.atan2(s.y-player.y,s.x-player.x)-player.angle;while(ang<-Math.PI)ang+=Math.PI*2;while(ang>Math.PI)ang-=Math.PI*2;if(Math.abs(ang)>1.25)continue;let dist=Math.max(.1,s.d);let size=Math.min(H*1.2,H*.68/dist);let sx=W/2+Math.tan(ang)*W*.68;if(s.kind==='scanner'){ctx.save();ctx.translate(sx,horizon+size*.18);ctx.rotate(.03);ctx.fillStyle=scanner.active?'#aab3a1':'#bc3829';ctx.fillRect(-size*.16,-size*.28,size*.32,size*.56);ctx.fillStyle='#dfd1a5';ctx.fillRect(-size*.09,-size*.17,size*.18,size*.12);ctx.restore()}else if(s.kind==='exit'){ctx.save();ctx.translate(sx,horizon);ctx.fillStyle='#1c2723';ctx.fillRect(-size*.28,-size*.62,size*.56,size*.62);ctx.fillStyle=objective?'#7c9c65':'#44201b';ctx.fillRect(-size*.21,-size*.52,size*.42,size*.44);ctx.fillStyle='#d5c795';ctx.fillRect(size*.08,-size*.24,size*.025,size*.025);ctx.restore()}else{ctx.save();ctx.translate(sx,horizon+size*.42);ctx.scale(1,1.15);ctx.fillStyle='#1a1110';ctx.beginPath();ctx.ellipse(0,-size*.42,size*.22,size*.31,0,0,7);ctx.fill();ctx.fillStyle='#c8bfa7';ctx.beginPath();ctx.arc(-size*.09,-size*.47,size*.035,0,7);ctx.arc(size*.09,-size*.47,size*.035,0,7);ctx.fill();ctx.fillStyle='#b94131';ctx.fillRect(-size*.14,-size*.39,size*.28,size*.025);ctx.fillStyle='#1a1110';ctx.fillRect(-size*.28,-size*.12,size*.56,size*.12);ctx.restore()}}
  // vignette
  let vg=ctx.createRadialGradient(W/2,H/2,H*.2,W/2,H/2,Math.max(W,H*.7));vg.addColorStop(.55,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(0,0,0,.82)');ctx.fillStyle=vg;ctx.fillRect(0,0,W,H);if(flash>0){ctx.fillStyle=`rgba(180,196,150,${flash*.8})`;ctx.fillRect(0,0,W,H)}
}
function frame(t){let dt=Math.min(.033,(t-last)/1000||0);last=t;update(dt);draw();requestAnimationFrame(frame)}requestAnimationFrame(frame);
addEventListener('keydown',e=>{keys[e.key.toLowerCase()]=true;if(e.key==='e'||e.key==='E')interact()});addEventListener('keyup',e=>keys[e.key.toLowerCase()]=false);
canvas.addEventListener('mousemove',e=>{if(started&&(document.pointerLockElement===canvas||mouse.down))player.angle+=e.movementX*.0023});canvas.addEventListener('click',()=>{if(started)canvas.requestPointerLock?.()});
const touchMove={x:0,y:0,run:false};const stick=document.getElementById('stick'),knob=document.getElementById('knob');let stickId=null;
stick.addEventListener('pointerdown',e=>{stickId=e.pointerId;stick.setPointerCapture(e.pointerId)});stick.addEventListener('pointermove',e=>{if(e.pointerId!==stickId)return;let r=stick.getBoundingClientRect(),dx=e.clientX-(r.left+r.width/2),dy=e.clientY-(r.top+r.height/2);let l=Math.hypot(dx,dy),max=38;if(l>max){dx=dx/l*max;dy=dy/l*max}knob.style.transform=`translate(${dx}px,${dy}px)`;touchMove.x=dx/max;touchMove.y=dy/max;touchMove.run=l>28});stick.addEventListener('pointerup',()=>{stickId=null;knob.style.transform='';touchMove.x=touchMove.y=0;touchMove.run=false});
let lookId=null,lastLX=0;canvas.addEventListener('pointerdown',e=>{if(e.pointerType==='touch'){lookId=e.pointerId;lastLX=e.clientX}});canvas.addEventListener('pointermove',e=>{if(e.pointerType==='touch'&&e.pointerId===lookId){player.angle+=(e.clientX-lastLX)*.006;lastLX=e.clientX}});canvas.addEventListener('pointerup',()=>lookId=null);
document.getElementById('action').addEventListener('click',interact);
document.getElementById('start').addEventListener('click',()=>{started=true;document.getElementById('menu').classList.add('hidden');document.getElementById('hud').classList.remove('hidden');document.getElementById('crosshair').classList.remove('hidden');document.getElementById('mobile').classList.remove('hidden');canvas.requestPointerLock?.()});
document.getElementById('again').addEventListener('click',()=>{document.getElementById('complete').classList.add('hidden');reset()});
