/* house-v2.js — إضافة تطوير "عش حبنا": تصادم حقيقي، تركيب منطقي، أفاتار بشري، جنينة، غرفة ملابس */
(function(){
const DN={'مصطفى':'توفا','فريال':'فلفلة'},OUTN=['معطف شتوي 🧥','بيجاما قطن 🛌','كنزة شتوية 🧶'],
OTOP={'فريال':['#7a3347','#f0b6c8','#c98f7a'],'مصطفى':['#34445a','#7e96c4','#6b4c3a']},OBOT=['#2a2d35',0,'#3d4350'],
HS={},BK={},SEAT=[],TR=[],SC=new THREE.Vector3(7,0,4),CAB=[[-4,9.5,-1.8,9.5],[-4,11.7,-1.8,11.7],[-4,9.5,-4,11.7],[-1.8,9.5,-1.8,10.2],[-1.8,11,-1.8,11.7]];
let COL=[],seat=-1,near=-1,PR=null,pAv=null,meAv=null,myO=0,inCab=false,SWA=0,SW=null,RT=null,sunM=null;
const GN=typeof gnd!=='undefined'?gnd:extGnd;
const rnd=i=>{const s=Math.sin(i*127.1)*43758.5;return s-Math.floor(s)};

if(typeof extGroup!=='undefined'){[river,gardenSwing,gBench,changeCab].forEach(o=>o&&extGroup.remove(o));trees.forEach(t=>extGroup.remove(t.g));trees.length=0}
window.checkWallCollision=()=>false;
{const rb=document.getElementById('replyBar');if(rb){rb.id='rbar';document.head.insertAdjacentHTML('beforeend','<style>#rbar{display:none;align-items:center;gap:6px;padding:4px 8px;font-size:11.5px;border-right:3px solid #ff2a5f;background:#240a14}#rbar span{flex:1;overflow:hidden;white-space:nowrap;text-overflow:ellipsis}</style>')}}
/* أحجام القطع + الوجه الخلفي (لتركيب الحائطي) */
CAT.forEach(c=>{try{G=new THREE.Group();curDrop=.38;c[5]();const b=new THREE.Box3().setFromObject(G);HS[c[0]]=[(b.max.x-b.min.x)/2,(b.max.z-b.min.z)/2];BK[c[0]]=b.min.z}catch(e){}});G=null;

/* ===== التصادم مع الحيطان (الأبواب والأرشات والهدم بتتفتح، الشبابيك والسور بتقفل) ===== */
function buildColl(){COL=CAB.map(s=>[...s,.06]);
 WALLS.forEach(w=>{const[id,x1,z1,x2,z2,ext,rail,op]=w,st=D.walls[id]||{},o=st.o||(op?op[0]:'n');if(o==='x')return;
  const L=Math.hypot(x2-x1,z2-z1),ux=(x2-x1)/L,uz=(z2-z1)/L;let sg=[[0,L]];
  if(!rail&&'dag'.includes(o)){const wd=op&&op[0]==o?op[2]:Math.min(OT[o][0],L-.12),al=op?Math.min(Math.max(op[1],wd/2+.05),L-wd/2-.05):L/2;sg=[[0,al-wd/2],[al+wd/2,L]]}
  sg.forEach(s=>COL.push([x1+ux*s[0],z1+uz*s[0],x1+ux*s[1],z1+uz*s[1],(ext?.22:.14)/2]))})}
function collide(x,z){const r=.26;
 for(let k=0;k<3;k++)for(const[a,b,c,d,h]of COL){const dx=c-a,dz=d-b,l2=dx*dx+dz*dz||1;let t=((x-a)*dx+(z-b)*dz)/l2;t=Math.max(0,Math.min(1,t));
  const px=a+dx*t,pz=b+dz*t,ex=x-px,ez=z-pz,dd=Math.hypot(ex,ez),m=r+h;
  if(dd<m){if(dd<1e-4){const n=Math.sqrt(l2);x+=-dz/n*m;z+=dx/n*m}else{x=px+ex/dd*m;z=pz+ez/dd*m}}}
 return[Math.max(-16,Math.min(30,x)),Math.max(-12,Math.min(24,z))]}

/* ===== تركيب منطقي: حائطي يلزق في الحيطة، سقفي في سنتر الأوضة، أرضي ما يدخلش في الحيطة ===== */
function wallSnap(x,z){let best=null;
 WALLS.forEach(w=>{const[id,x1,z1,x2,z2,ext,rail,op]=w,st=D.walls[id]||{},o=st.o||(op?op[0]:'n');if(rail||o==='x')return;
  const L=Math.hypot(x2-x1,z2-z1),ux=(x2-x1)/L,uz=(z2-z1)/L;let t=(x-x1)*ux+(z-z1)*uz;t=Math.max(.3,Math.min(L-.3,t));
  const px=x1+ux*t,pz=z1+uz*t,sd=(x-px)*-uz+(z-pz)*ux,sg=sd<0?-1:1,d=Math.abs(sd);
  if(!best||d<best.d)best={d,x:px+-uz*sg*((ext?.22:.14)/2+.008),z:pz+ux*sg*((ext?.22:.14)/2+.008),r:Math.atan2(-uz*sg,ux*sg)}});
 return best}
function fitFloor(it){let x=it.x,z=it.z;const hs=HS[it.t];
 if(!hs||/^(rug|runner|curt|plant|lamp|stool)/.test(it.t))return{x,z};
 const a=hs[0]*(it.sx||1),b=hs[1]*(it.sz||1),r=it.r||0,cs=Math.cos(r),sr=Math.sin(r);
 for(let k=0;k<3;k++)for(const[a0,b0,c0,d0,h]of COL){
  const dx=c0-a0,dz=d0-b0,L=Math.hypot(dx,dz)||1,tx=dx/L,tz=dz/L,nx=-tz,nz=tx;
  const sN=Math.abs(nx*cs-nz*sr)*a+Math.abs(nx*sr+nz*cs)*b,sT=Math.abs(tx*cs-tz*sr)*a+Math.abs(tx*sr+tz*cs)*b;
  const tp_=(x-a0)*tx+(z-b0)*tz,sd=(x-a0)*nx+(z-b0)*nz,pen=sN+h-Math.abs(sd);
  if(tp_>-sT+.02&&tp_<L+sT-.02&&pen>.001){const sg=sd<0?-1:1;x+=nx*sg*pen;z+=nz*sg*pen}}
 return{x:+x.toFixed(2),z:+z.toFixed(2)}}
const put0=put;
window.put=function(path,val){
 if(val&&typeof val==='object'&&/^items\/[^/]+$/.test(path)&&val.t&&CATM[val.t]){
  let x=val.x,z=val.z;const isNew=!D.items[path.slice(6)];
  if(WALL_MOUNT.has(val.t)){
   if(mode!=='orbit'&&isNew){RC.setFromCamera(new THREE.Vector2(0,0),CAM);const h=RC.intersectObjects(root.children,true).find(h=>{for(let o=h.object;o;o=o.parent)if(o.userData.wid)return 1});if(h){x=h.point.x;z=h.point.z}}
   const s=wallSnap(x,z);if(s)val=Object.assign({},val,{x:s.x,z:s.z,r:s.r})}
  else if(CEIL_MOUNT.has(val.t)){const R=Z.find(q=>x>q[2]&&x<q[4]&&z>q[3]&&z<q[5]);if(R&&isNew)val=Object.assign({},val,{x:sn((R[2]+R[4])/2),z:sn((R[3]+R[5])/2)})}
  else val=Object.assign({},val,fitFloor(val))}
 return put0(path,val)};
const mk0=mk;
window.mk=function(id,it){mk0(id,it);const g=IM[id];if(g&&WALL_MOUNT.has(it.t)&&BK[it.t]!==undefined){g.children.forEach(m=>m.position.z-=BK[it.t]);if(sel==id)hl()}};
const ap0=apply;window.apply=function(){ap0();buildColl()};
const sm0=setMode;window.setMode=function(m,k){sm0(m,k);CAM.fov=m==='orbit'?54:82;CAM.updateProjectionMatrix()};

/* ===== المشي: تصادم + قعدة + ربط الكاميرا ===== */
window.walkStep=function(dt){
 yaw+=(wT.yaw-yaw)*.28;pit+=(wT.pit-pit)*.28;
 if(seat>=0){const p=spotPos(seat);wx=wT.x=p.x;wz=wT.z=p.z;CAM.position.set(p.x,p.y+.8,p.z);if(mode=='walk')CAM.rotation.set(pit,yaw,0,'YXZ');return}
 const f=(keys.w||keys.ArrowUp?1:0)-(keys.s||keys.ArrowDown?1:0)-jv.y+mvb.f,s=(keys.d||keys.ArrowRight?1:0)-(keys.a||keys.ArrowLeft?1:0)+jv.x,v=fwd(),sp=2.4*dt;
 wT.x+=(v.x*f-v.z*s)*sp;wT.z+=(v.z*f+v.x*s)*sp;const c=collide(wT.x,wT.z);wT.x=c[0];wT.z=c[1];
 wx+=(wT.x-wx)*.28;wz+=(wT.z-wz)*.28;CAM.position.set(wx,1.62,wz);if(mode=='walk')CAM.rotation.set(pit,yaw,0,'YXZ')};
/* ===== شروق / نهار / غروب / ليل ===== */
const AMB=[[0xd7eaf8,0xffffff,0x998877,.78,0xfff4e0,1.08,[14,24,10],'☀️ نهار',0x7fb56a],[0xf6c89a,0xffd8b0,0x8a7060,.62,0xffb070,.9,[-16,6,8],'🌄 شروق',0x86b36e],
[0x3d1628,0xffb899,0x59253a,.64,0xff8c66,.85,[4,9,14],'🌇 غروب',0x5f7d45],[0x0b0e1a,0xdde0ff,0x221a24,.28,0x8899cc,.08,[8,20,8],'🌙 ليل',0x1d3526]];
window.light=function(){const a=AMB[ambMode];S.background.set(a[0]);S.fog=new THREE.Fog(a[0],40,125);hemi.color.set(a[1]);hemi.groundColor.set(a[2]);hemi.intensity=a[3];
 sun.color.set(a[4]);sun.intensity=a[5];sun.position.set(...a[6]);$('dn').textContent=a[7];GN.material.color.set(a[8]);
 for(const id in IM)IM[id].traverse(o=>{if(o.isPointLight)o.intensity=(ambMode>1)&&(D.items[id]||{}).on!==0?1.05*o.userData.k:0});
 updateCeilingVisibility();reqShadow()};
$('dn').onclick=()=>{ambMode=(ambMode+1)%4;light()};

/* ===== الأفاتار البشري ===== */
function mkAv(who,o,tag){
 const g=new THREE.Group(),her=who==='فريال',M2=(c,r)=>mat(c,{roughness:r||.85}),sk=M2(her?'#e6b995':'#7a4e32',.6),tc=M2(OTOP[who][o]),bc=M2(OBOT[o]||OTOP[who][o]),hr=M2('#14100e',.5),dk=M2('#111',.4),
 cyl=(a,b,h)=>new THREE.CylinderGeometry(a,b,h,14),sph=r=>new THREE.SphereGeometry(r,14,12),
 ad=(ge,m,x,y,z,p,sx,sy,sz)=>{const e=new THREE.Mesh(ge,m);e.position.set(x,y,z);if(sx)e.scale.set(sx,sy,sz);(p||g).add(e);return e};
 ad(cyl(.17,.2,.62),tc,0,1.12,0);ad(sph(.2),tc,0,1.4,0,g,1.15,.5,.75);if(o===0)ad(cyl(.215,.28,.75),tc,0,.7,0);
 const lb=(x,y,r,h,m,e)=>{const p=new THREE.Group();p.position.set(x,y,0);ad(cyl(r,r*.9,h),m,0,-h/2,0,p);ad(sph(r*1.1),e,0,-h,0,p,1,.8,1.3);g.add(p);return p},u=g.userData;
 u.L=lb(-.09,.86,.075,.82,bc,dk);u.R=lb(.09,.86,.075,.82,bc,dk);u.AL=lb(-.27,1.38,.058,.6,tc,sk);u.AR=lb(.27,1.38,.058,.6,tc,sk);
 ad(cyl(.05,.055,.12),sk,0,1.5,0);ad(sph(.125),sk,0,1.69,0,g,1,1.18,1.05);
 [-.05,.05].forEach(x=>{ad(sph(.011),dk,x,1.7,.13);ad(new THREE.TorusGeometry(.04,.006,6,16),dk,x,1.7,.135)});ad(new THREE.BoxGeometry(.03,.006,.006),dk,0,1.71,.135);
 if(her){const c=ad(new THREE.SphereGeometry(.14,16,10,0,6.283,0,1.75),hr,0,1.71,-.015,g,1.02,1.15,1.1);c.rotation.x=-.3;ad(cyl(.125,.085,.6),hr,0,1.4,-.075,g,1,1,.65)}
 else{for(let i=0;i<30;i++){const yy=1-(i+.5)/30*.8,rr=Math.sqrt(1-yy*yy),th=i*2.4;if(Math.sin(th)>.3&&yy<.6)continue;ad(sph(.05),hr,.14*rr*Math.cos(th),1.69+.16*yy,.14*rr*Math.sin(th))}
  const bd=ad(new THREE.SphereGeometry(.128,14,10,0,6.283,1.85,1.2),M2('#2a1d17',.9),0,1.69,0,g,1,1.18,1.05);bd.material.transparent=true;bd.material.opacity=.85}
 if(o!==1){const sc=ad(new THREE.TorusGeometry(.11,.04,8,16),M2(her?'#f1e3d0':'#b0453a'),0,1.5,0);sc.rotation.x=Math.PI/2}
 if(tag){const l=label((DN[who]||who)+' ♥️',0,0);l.position.set(0,2.15,0);l.scale.set(1.3,.32,1);g.add(l)}
 return g}
function pose(g,ph,am,sit){const u=g.userData;u.L.rotation.x=sit?-1.45:Math.sin(ph)*am;u.R.rotation.x=sit?-1.45:-Math.sin(ph)*am;u.AL.rotation.x=sit?-.4:-Math.sin(ph)*am*.8;u.AR.rotation.x=sit?-.4:Math.sin(ph)*am*.8}
function spotPos(i){const s=SEAT[i];return s.sw?{x:s.x,z:s.z-1.9*Math.sin(SWA),y:2.4-1.9*Math.cos(SWA),yaw:s.yaw}:s}
function stepAv(g,x,z,a,s){let px=x,pz=z,py=0,sit=0;if(s>=0&&SEAT[s]){const p=spotPos(s);px=p.x;pz=p.z;py=p.y-.86;sit=1;a=p.yaw}
 const dx=px-g.position.x,dz=pz-g.position.z,sp=Math.hypot(dx,dz);g.position.set(g.position.x+dx*.3,py,g.position.z+dz*.3);g.rotation.y=a+Math.PI;
 g.userData.ph=(g.userData.ph||0)+Math.min(sp,.2)*10;pose(g,g.userData.ph,Math.min(.7,sp*18),sit)}
function setOut(o){myO=o;try{localStorage.setItem('outfit_'+ME,o)}catch(e){}if(meAv){const p=meAv.position.clone();S.remove(meAv);meAv=mkAv(ME,o,1);meAv.position.copy(p);S.add(meAv)}outfitUI();toast('لبسك: '+OUTN[o])}
function outfitUI(){$('outfit').innerHTML='<b>👗 غرفة تغيير الملابس — اختار لبسك</b><div class="gr" style="justify-content:center">'+OUTN.map((n,i)=>`<button data-o="${i}" class="${i===myO?'on':''}">${n}</button>`).join('')+'</div>'}

/* ===== الجنينة: نهر، أشجار بتتهز، مرجيحة لاتنين، كراسي، غرفة ملابس ===== */
function buildGarden(){
 const gg=new THREE.Group();S.add(gg);GN.geometry=new THREE.PlaneGeometry(300,300);
 const M=(c,o)=>mat(c,Object.assign({roughness:.8},o||{})),
 bx=(w,h,d,x,y,z,c,p)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),M(c));m.position.set(x,y+h/2,z);m.castShadow=true;m.receiveShadow=true;(p||gg).add(m);return m},
 cy=(r,h,x,y,z,c,p)=>{const m=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,12),M(c));m.position.set(x,y+h/2,z);m.castShadow=true;(p||gg).add(m);return m},
 rv=w=>{const g=new THREE.PlaneGeometry(80,w,100,1),p=g.attributes.position;for(let i=0;i<p.count;i++)p.setY(i,p.getY(i)+Math.sin(p.getX(i)*.18)*1.5);return g},
 rz=X=>15-Math.sin((X-7)*.18)*1.5;
 /* النهر */
 const cn=document.createElement('canvas');cn.width=256;cn.height=64;const cx=cn.getContext('2d'),gr=cx.createLinearGradient(0,0,0,64);gr.addColorStop(0,'#5fb4d6');gr.addColorStop(.5,'#8fd3ea');gr.addColorStop(1,'#4a9cc2');cx.fillStyle=gr;cx.fillRect(0,0,256,64);
 cx.strokeStyle='rgba(255,255,255,.55)';cx.lineWidth=2;for(let i=0;i<14;i++){cx.beginPath();const y=rnd(i)*64,s=rnd(i+50)*200;cx.moveTo(s,y);cx.quadraticCurveTo(s+25,y-5,s+50,y);cx.stroke()}
 RT=new THREE.CanvasTexture(cn);RT.wrapS=RT.wrapT=THREE.RepeatWrapping;RT.repeat.set(14,1);RT.encoding=THREE.sRGBEncoding;
 const bank=new THREE.Mesh(rv(3.4),M('#8a7a62'));bank.rotation.x=-Math.PI/2;bank.position.set(7,-.04,15);gg.add(bank);
 const wat=new THREE.Mesh(rv(2.4),new THREE.MeshStandardMaterial({map:RT,roughness:.05,metalness:.25,transparent:true,opacity:.92}));wat.rotation.x=-Math.PI/2;wat.position.set(7,-.01,15);gg.add(wat);
 for(let i=0;i<46;i++){const X=-30+i*1.3,r=.12+.1*rnd(i),m=new THREE.Mesh(new THREE.SphereGeometry(r,7,6),M(i%3?'#8d8a84':'#a09c94'));m.position.set(X,r*.3-.05,rz(X)+(i%2?1.9:-1.9));m.scale.y=.7;gg.add(m)}
 bx(1.3,.08,4.2,7,.08,15,'#a07048');[-.62,.62].forEach(s=>{bx(.05,.05,4.2,7+s,.75,15,'#8a5a38');[-1.9,0,1.9].forEach(q=>bx(.07,.8,.07,7+s,0,15+q,'#8a5a38'))});
 /* ورد */
 const fl=new THREE.InstancedMesh(new THREE.SphereGeometry(.07,6,5),new THREE.MeshStandardMaterial({roughness:.6}),170),m4=new THREE.Matrix4(),cc=new THREE.Color(),cols=['#ff7aa2','#ffd166','#ffffff','#c77dff','#ff9a62'];
 for(let i=0;i<170;i++){const X=-14+rnd(i)*40,Z=8.6+rnd(i+999)*14,ok=Math.abs(Z-rz(X))>2.2;m4.setPosition(X,ok?.09:-5,Z);fl.setMatrixAt(i,m4);fl.setColorAt(i,cc.set(cols[i%5]))}gg.add(fl);
 /* أشجار بتتهز */
 [[-6,3],[-8,9],[-7,18],[13,10],[16,12.5],[19,8],[21,2],[15,19],[2,20],[-3,19],[22,14],[-9,-3],[18,-3],[7,-6]].forEach(([X,Z],i)=>{const t=new THREE.Group();t.position.set(X,0,Z);cy(.16,2.2,0,0,0,'#6b4a30',t);
  const f=new THREE.Group();f.position.y=2;[[0,.9,0,1.1,'#4f8f4a'],[.5,.5,.2,.8,'#5fa356'],[-.45,.65,-.2,.85,'#468443']].forEach(q=>{const m=new THREE.Mesh(new THREE.SphereGeometry(q[3],12,10),M(q[4]));m.position.set(q[0],q[1]+.5,q[2]);f.add(m)});
  t.add(f);t.scale.setScalar(.9+rnd(i)*.5);gg.add(t);TR.push([f,i])});
 /* سفرة وكراسي */
 cy(.55,.04,7.4,.7,10.5,'#d9c3a5');cy(.05,.7,7.4,0,10.5,'#5a4332');cy(.25,.03,7.4,0,10.5,'#5a4332');
 [[6.55,10.5,-Math.PI/2],[8.25,10.5,Math.PI/2],[7.4,9.65,Math.PI],[7.4,11.35,0]].forEach(([X,Z,y])=>{const c=new THREE.Group();c.position.set(X,0,Z);c.rotation.y=y+Math.PI;
  bx(.5,.05,.5,0,.42,0,'#b98856',c);bx(.5,.55,.05,0,.47,-.23,'#b98856',c);[[-.2,-.2],[.2,-.2],[-.2,.2],[.2,.2]].forEach(q=>bx(.04,.42,.04,q[0],0,q[1],'#6b4a30',c));gg.add(c);SEAT.push({x:X,z:Z,y:.47,yaw:y})});
 /* مرجيحة لاتنين */
 [2.2,3.8].forEach(X=>[-1,1].forEach(s=>{const p=cy(.045,2.61,X,0,10.5+s*.45,'#6b4a30');p.rotation.x=s*-.352}));
 const bm=cy(.05,1.8,3,2.45,10.5,'#6b4a30');bm.rotation.z=Math.PI/2;bm.position.y=2.45;
 SW=new THREE.Group();SW.position.set(3,2.4,10.5);gg.add(SW);bx(1.5,.07,.5,0,-1.97,0,'#c9ada7',SW);bx(1.5,.4,.05,0,-1.9,-.23,'#c9ada7',SW);[-.7,.7].forEach(X=>cy(.012,1.9,X,-1.9,0,'#d4af37',SW));
 SEAT.push({x:2.75,z:10.5,y:.5,yaw:Math.PI,sw:1},{x:3.25,z:10.5,y:.5,yaw:Math.PI,sw:1});
 /* غرفة تغيير الملابس */
 bx(2.2,.05,2.2,-2.9,0,10.6,'#b98856');bx(2.2,2.5,.12,-2.9,0,9.5,'#e8d9c4');bx(2.2,2.5,.12,-2.9,0,11.7,'#e8d9c4');bx(.12,2.5,2.2,-4,0,10.6,'#e8d9c4');
 bx(.12,2.5,.7,-1.8,0,9.85,'#e8d9c4');bx(.12,2.5,.7,-1.8,0,11.35,'#e8d9c4');bx(.12,.4,.8,-1.8,2.1,10.6,'#e8d9c4');bx(2.6,.15,2.6,-2.9,2.5,10.6,'#8b4a3a');
 bx(.5,2,1.4,-3.65,0,10.6,'#6e4226');bx(.03,1.5,.8,-3.38,.4,10.6,'#cfe8f5');['#7a3347','#34445a','#f0b6c8'].forEach((c,i)=>bx(.05,.9,.2,-3.38,.9,10.25+i*.35,c));
 LB.add(label('👗 غرفة الملابس',-2.9,10.6));
 /* شمس/قمر */
 sunM=new THREE.Mesh(new THREE.SphereGeometry(3.5,16,12),new THREE.MeshBasicMaterial({color:'#fff2b0',fog:false}));S.add(sunM)}

/* ===== واجهة + حضور الشريك + حلقة التحديث ===== */
$('roomNav').insertAdjacentHTML('beforeend','<button data-go="gar">🌳 الجنينة</button><button data-go="cab">👗 غرفة الملابس</button>');
document.body.insertAdjacentHTML('beforeend','<div class="pn" id="outfit" style="bottom:70px;right:6px;left:6px;text-align:center"></div><button id="sitBtn" class="on" style="position:fixed;bottom:130px;left:50%;transform:translateX(-50%);z-index:7;display:none;padding:8px 18px;font-size:15px"></button>');
$('roomNav').addEventListener('click',e=>{const b=e.target.closest('[data-go]');if(!b)return;const p=b.dataset.go==='cab'?[-.9,10.6,Math.PI/2]:[3,8.9,Math.PI];
 activeRoom=null;seat=-1;wx=wT.x=p[0];wz=wT.z=p[1];yaw=wT.yaw=p[2];pit=wT.pit=-.05;setMode('walk',true);toast(b.dataset.go==='cab'?'غرفة تغيير الملابس 👗':'الجنينة 🌳 — اقرب من المرجيحة أو الكراسي واضغط اقعد')});
$('outfit').onclick=e=>{const b=e.target.closest('[data-o]');if(b)setOut(+b.dataset.o)};
$('sitBtn').onclick=()=>{
 if(seat>=0){const s=SEAT[seat];seat=-1;const c=collide(s.x-Math.sin(yaw)*1,s.z-Math.cos(yaw)*1);wx=wT.x=c[0];wz=wT.z=c[1]}
 else if(near>=0){seat=near;wT.yaw=yaw=SEAT[near].yaw;wT.pit=pit=-.05}};
{const w=document.querySelectorAll('#who [data-w]');if(w[0]){w[0].textContent='أنا توفا 🙋‍♂️';w[1].textContent='أنا فلفلة 🌸'}}
const iv=setInterval(()=>{if(!db||!ME)return;clearInterval(iv);const mine=db.ref(ROOT+'presence2/'+K(ME));mine.onDisconnect().remove();let last='';
 setInterval(()=>{const o={x:+wx.toFixed(2),z:+wz.toFixed(2),a:+yaw.toFixed(2),o:myO,s:seat},k=JSON.stringify(o);if(k!==last){last=k;mine.set(o)}},400);
 db.ref(ROOT+'presence2/'+K(YOU)).on('value',s=>{PR=s.val()})},500);

const r0=RN.render.bind(RN);
RN.render=function(sc,cm){const t=performance.now();if(typeof av!=='undefined')av.visible=false;if(typeof ptAv!=='undefined'&&ptAv)ptAv.visible=false;
 TR.forEach(([f,i])=>{f.rotation.z=Math.sin(t*.0007+i)*.035;f.rotation.x=Math.cos(t*.0005+i*2)*.025});
 if(RT)RT.offset.x=-(t*.00004)%1;SWA=Math.sin(t*.0012)*.22;if(SW)SW.rotation.x=SWA;
 if(sunM){sunM.position.copy(sun.position).normalize().multiplyScalar(110).add(SC);sunM.material.color.set(['#fff2b0','#ffb27a','#ff7a4a','#dfe6ff'][ambMode])}
 if(ME&&!meAv){try{myO=+(localStorage.getItem('outfit_'+ME)||0)}catch(e){}meAv=mkAv(ME,myO,1);meAv.position.set(wx,0,wz);S.add(meAv)}
 if(meAv){meAv.visible=mode==='orbit';stepAv(meAv,wx,wz,yaw,seat)}
 if(PR&&YOU){if(!pAv||pAv.userData.o!==PR.o){if(pAv)S.remove(pAv);pAv=mkAv(YOU,PR.o|0,1);pAv.userData.o=PR.o;pAv.position.set(PR.x,0,PR.z);S.add(pAv)}pAv.visible=true;stepAv(pAv,PR.x,PR.z,PR.a,PR.s===undefined?-1:PR.s)}else if(pAv)pAv.visible=false;
 const ic=mode!=='orbit'&&wx>-3.95&&wx<-1.85&&wz>9.55&&wz<11.65;if(ic!==inCab){inCab=ic;$('outfit').style.display=ic?'block':'none';if(ic){outfitUI();toast('👗 اختار لبسك من غرفة التغيير')}}
 const sb=$('sitBtn');
 if(mode!=='orbit'){let n=-1,bd=1.8;if(seat>=0)n=seat;else SEAT.forEach((s,i)=>{const d=Math.hypot(s.x-wx,s.z-wz);if(d<bd&&!(PR&&PR.s===i)){bd=d;n=i}});near=n;sb.style.display=n>=0?'block':'none';sb.textContent=seat>=0?'🧍 قوم':'🪑 اقعد'}else sb.style.display='none';
 r0(sc,cm)};

buildColl();buildGarden();light();reqShadow();
})();
