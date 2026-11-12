/* ---------- decals (side paint jobs) and accessories ---------- */
function starPath(c,cx,cy,R,r){c.beginPath(); for(var i=0;i<10;i++){var a=-Math.PI/2+i*Math.PI/5, rr=i%2?r:R; if(i) c.lineTo(cx+Math.cos(a)*rr,cy+Math.sin(a)*rr); else c.moveTo(cx+Math.cos(a)*rr,cy+Math.sin(a)*rr);} c.closePath();}
function boltPath(c,cx,cy,s,rot){
  var P=[[.55,0],[.2,.55],[.45,.55],[.35,1],[.8,.4],[.55,.4],[.7,0]];
  c.save(); c.translate(cx,cy); c.rotate(rot||0); c.beginPath();
  P.forEach(function(p,i){var x=(p[0]-.5)*s, y=(p[1]-.5)*s; if(i) c.lineTo(x,y); else c.moveTo(x,y);}); c.closePath(); c.restore();
}
function tongue(c,bx,by,tx,ty,wd,col,line){
  var dx=tx-bx, dy=ty-by, L=Math.hypot(dx,dy)||1, nx=-dy/L, ny=dx/L, h=wd/2;
  c.beginPath(); c.moveTo(bx+nx*h,by+ny*h);
  c.quadraticCurveTo(bx+dx*.6+nx*h*1.05,by+dy*.6+ny*h*1.05,tx+nx*wd*.3,ty+ny*wd*.3);
  c.quadraticCurveTo(bx+dx*.5-nx*h*.1,by+dy*.5-ny*h*.1,bx-nx*h,by-ny*h); c.closePath();
  c.fillStyle=col; c.fill(); if(line){c.lineWidth=line[1]; c.strokeStyle=line[0]; c.stroke();}
}
function flameSide(c,h,baseX,len,cols){
  cols=cols||['#e8321a','#ff9a1f','#ffe65a'];
  var ys=[.12,.3,.5,.7,.88], ls=[.8,1,.88,1.05,.72];
  ys.forEach(function(yy,i){var L=len*ls[i], by=h*yy, ty=h*(yy+(i%2?-.07:.07));
    tongue(c,baseX,by,baseX-L,ty,h*.4,cols[0]); tongue(c,baseX,by,baseX-L*.78,ty,h*.27,cols[1]); tongue(c,baseX,by,baseX-L*.55,ty,h*.14,cols[2]);});
}
function skullDraw(c,cx,cy,s){
  var u=s/100; c.save(); c.translate(cx,cy); c.lineWidth=5*u; c.strokeStyle='#141826'; c.fillStyle='#f4f1e6'; c.lineJoin='round';
  c.beginPath(); c.rect(-22*u,16*u,44*u,28*u); c.fill(); c.stroke();
  c.beginPath(); c.ellipse(0,-8*u,38*u,36*u,0,0,TAU); c.fill(); c.stroke();
  c.fillRect(-18*u,13*u,36*u,8*u);
  c.fillStyle='#141826';
  c.beginPath(); c.ellipse(-15*u,-6*u,10*u,12*u,0,0,TAU); c.fill(); c.beginPath(); c.ellipse(15*u,-6*u,10*u,12*u,0,0,TAU); c.fill();
  c.beginPath(); c.moveTo(0,8*u); c.lineTo(-6*u,20*u); c.lineTo(6*u,20*u); c.closePath(); c.fill();
  c.lineWidth=3*u; c.beginPath(); [-11,-3.7,3.7,11].forEach(function(x){c.moveTo(x*u,26*u); c.lineTo(x*u,44*u);}); c.stroke();
  c.restore();
}
function flagDraw(c,cx,cy,fh){
  var fw=fh*1.4; c.save(); c.translate(cx,cy);
  c.fillStyle='#009c3b'; c.fillRect(-fw/2,-fh/2,fw,fh);
  c.fillStyle='#ffdf00'; c.beginPath(); c.moveTo(0,-fh*.4); c.lineTo(fw*.43,0); c.lineTo(0,fh*.4); c.lineTo(-fw*.43,0); c.closePath(); c.fill();
  c.fillStyle='#002776'; c.beginPath(); c.arc(0,0,fh*.2,0,TAU); c.fill();
  c.strokeStyle='#fff'; c.lineWidth=fh*.04; c.beginPath(); c.arc(0,fh*.1,fh*.19,Math.PI*1.12,Math.PI*1.88); c.stroke();
  c.strokeStyle='#141826'; c.lineWidth=fh*.05; c.strokeRect(-fw/2,-fh/2,fw,fh); c.restore();
}
function flowerDraw(c,cx,cy,r,col){
  c.save(); c.translate(cx,cy); c.fillStyle=col; c.strokeStyle='#d8588f'; c.lineWidth=Math.max(1,r*.06);
  for(var i=0;i<5;i++){c.save(); c.rotate(i*TAU/5); c.beginPath(); c.ellipse(0,-r*.55,r*.32,r*.5,0,0,TAU); c.fill(); c.stroke(); c.restore();}
  c.fillStyle='#c2185b'; c.beginPath(); c.arc(0,0,r*.2,0,TAU); c.fill(); c.restore();
}
function slashDraw(c,x0,y0,x1,y1,wd){
  var mx=(x0+x1)/2, my=(y0+y1)/2, dx=x1-x0, dy=y1-y0, L=Math.hypot(dx,dy), nx=-dy/L, ny=dx/L;
  c.beginPath(); c.moveTo(x0,y0); c.quadraticCurveTo(mx+nx*wd,my+ny*wd,x1,y1); c.quadraticCurveTo(mx+nx*wd*.12,my+ny*wd*.12,x0,y0); c.closePath();
  c.fillStyle='#ff2a3a'; c.fill(); c.lineWidth=wd*.22; c.strokeStyle='#141826'; c.lineJoin='round'; c.stroke();
}
/* side layout: the car's front is at the right, w is the long side */
function decalSide(id,c,w,h){
  var i,x,k;
  c.lineJoin='round';
  if(id==='stripes'){
    c.fillStyle='#141826'; c.fillRect(0,h*.2,w,h*.2); c.fillStyle='#ff3b4a'; c.fillRect(0,h*.55,w,h*.2);
  }else if(id==='checker'){
    var q=h/3, cols=Math.ceil(w/q);
    for(i=0;i<cols;i++) for(k=0;k<3;k++){c.fillStyle=((i+k)%2)?'#f4f6fb':'#141826'; c.fillRect(i*q,k*q,q+1,q+1);}
  }else if(id==='stars'){
    for(i=0;i<6;i++){x=w*(.12+i*.16); starPath(c,x,h*.5,h*(.3+i*.03),h*(.13+i*.012)); c.fillStyle='#ffd23a'; c.fill(); c.lineWidth=h*.05; c.strokeStyle='#141826'; c.stroke();}
  }else if(id==='dots'){
    for(i=0;i<7;i++){x=w*(.08+i*.14); c.beginPath(); c.arc(x,h*.5,h*(.14+i*.045),0,TAU); c.fillStyle=(i%2)?'#ff3b6b':'#ffd23a'; c.fill(); c.lineWidth=h*.05; c.strokeStyle='#141826'; c.stroke();}
  }else if(id==='bolt'){
    for(i=0;i<3;i++){boltPath(c,w*(.3+i*.2),h*.5,h*(.8+i*.08),Math.PI/2); c.fillStyle='#ffe23a'; c.fill(); c.lineWidth=h*.05; c.strokeStyle='#141826'; c.stroke();}
  }else if(id==='flames'){
    flameSide(c,h,w*.97,w*.8);
  }else if(id==='claws'){
    [.28,.7].forEach(function(gx){for(k=0;k<3;k++){var o=(k-1)*h*.34; slashDraw(c,w*gx+o-h*.3,h*.04,w*gx+o+h*.4,h*.96,h*.17);}});
  }else if(id==='tribal'){
    c.fillStyle='#0b0c14'; c.fillRect(0,h*.47,w,h*.06);
    for(i=0;i<5;i++){x=w*(.3+.17*i); var kk=h*(.55+.12*i);
      tongue(c,x,h*.46,x-kk*1.5,h*.1,h*.22,'#0b0c14',['#e9edf4',h*.025]); tongue(c,x,h*.54,x-kk*1.5,h*.9,h*.22,'#0b0c14',['#e9edf4',h*.025]);}
  }else if(id==='brazil'){
    var fh=h*.92, fx=w*.66;
    [['0,156,59',.12],['255,223,0',.58]].forEach(function(b){
      var g=c.createLinearGradient(0,0,fx,0); g.addColorStop(0,'rgba('+b[0]+',0)'); g.addColorStop(1,'rgba('+b[0]+',1)');
      c.fillStyle=g; c.fillRect(0,h*b[1],fx,h*.3);});
    flagDraw(c,fx,h*.5,fh);
  }else if(id==='skull'){
    skullDraw(c,w*.5,h*.5,h*.98);
  }else if(id==='flameskull'){
    flameSide(c,h,w*.62,w*.55,['#2a7bff','#58c8ff','#e6faff']); skullDraw(c,w*.62,h*.5,h*.98);
  }else if(id==='sakura'){
    c.strokeStyle='#5a3a2a'; c.lineWidth=h*.07; c.lineCap='round'; c.beginPath(); c.moveTo(0,h*.8); c.quadraticCurveTo(w*.25,h*.4,w*.5,h*.65); c.quadraticCurveTo(w*.75,h*.9,w,h*.35); c.stroke();
    [[.12,.7,.2],[.3,.5,.3],[.48,.64,.34],[.68,.8,.24],[.86,.42,.3],[.97,.38,.16]].forEach(function(f){flowerDraw(c,w*f[0],h*f[1],h*f[2],'#ffc2dc');});
    c.fillStyle='#ffb3d1'; [[.2,.15],[.4,.2],[.58,.12],[.78,.2],[.92,.85],[.05,.2],[.6,.9]].forEach(function(p){c.beginPath(); c.ellipse(w*p[0],h*p[1],h*.07,h*.04,p[0]*6,0,TAU); c.fill();});
  }else if(id==='cyber'){
    c.fillStyle='rgba(10,14,40,.6)'; c.fillRect(0,h*.08,w,h*.84);
    c.lineWidth=h*.045; c.lineCap='round'; c.lineJoin='round'; c.shadowBlur=h*.12;
    [['#28e1ff',[[.02,.32],[.22,.32],[.28,.7],[.55,.7],[.6,.3],[.98,.3]]],['#ff2fd0',[[.04,.78],[.35,.78],[.42,.5],[.8,.5],[.86,.82],[.97,.82]]]].forEach(function(pl){
      c.strokeStyle=pl[0]; c.shadowColor=pl[0]; c.beginPath(); pl[1].forEach(function(p,j){if(j) c.lineTo(w*p[0],h*p[1]); else c.moveTo(w*p[0],h*p[1]);}); c.stroke();
      c.fillStyle=pl[0]; pl[1].forEach(function(p,j){if(j%2===0){c.beginPath(); c.arc(w*p[0],h*p[1],h*.06,0,TAU); c.fill();}});});
    c.shadowBlur=0;
  }else if(id==='holo'){
    var sp=h*.55, n=Math.ceil(w/sp);
    c.lineWidth=h*.16; c.lineCap='butt'; c.lineJoin='miter';
    for(i=0;i<n;i++){x=i*sp+h*.15; c.globalAlpha=.3+.7*(i/(n-1||1)); c.strokeStyle='#fff'; c.beginPath(); c.moveTo(x,h*.08); c.lineTo(x+h*.42,h*.5); c.lineTo(x,h*.92); c.stroke();}
    c.globalAlpha=1;
  }
}
/* hood layout: front is at the top */
function decalDraw(id,c,w,h,hood){
  if(!hood){decalSide(id,c,w,h); return;}
  if(id==='brazil'){c.fillStyle='rgba(0,0,0,0)'; flagDraw(c,w/2,h/2,Math.min(h*.8,w*.62)); return;}
  if(id==='skull'){skullDraw(c,w/2,h/2,Math.min(w,h)*.9); return;}
  if(id==='flameskull'){
    var s=Math.min(w,h)*.7; c.save(); c.translate(w/2,h*.4); c.rotate(-Math.PI/2); c.translate(0,-s/2); flameSide(c,s,0,h*.5,['#2a7bff','#58c8ff','#e6faff']); c.restore();
    skullDraw(c,w/2,h*.4,s); return;
  }
  c.save(); c.translate(w/2,h/2); c.rotate(-Math.PI/2); c.translate(-h/2,-w/2); decalSide(id,c,h,w); c.restore();
}
function accIcon(id,c,s){
  c.save(); c.scale(s/64,s/64); c.lineJoin='round'; c.lineCap='round';
  if(id==='antenna'){c.strokeStyle='#cfd5e2'; c.lineWidth=3; c.beginPath(); c.moveTo(22,58); c.lineTo(22,8); c.stroke(); c.fillStyle='#009c3b'; c.fillRect(22,8,28,18); c.fillStyle='#ffdf00'; c.beginPath(); c.moveTo(36,11); c.lineTo(46,17); c.lineTo(36,23); c.lineTo(26,17); c.closePath(); c.fill();}
  else if(id==='ears'){[[10,44,22,8,36,44],[28,44,42,8,54,44]].forEach(function(p){c.fillStyle='#141826'; c.strokeStyle='#cfd5e2'; c.lineWidth=2; c.beginPath(); c.moveTo(p[0],p[1]); c.lineTo(p[2],p[3]); c.lineTo(p[4],p[5]); c.closePath(); c.fill(); c.stroke(); c.fillStyle='#ff9ac8'; c.beginPath(); c.moveTo(p[0]+8,p[1]); c.lineTo(p[2],p[3]+16); c.lineTo(p[4]-8,p[5]); c.closePath(); c.fill();});}
  else if(id==='horns'){c.fillStyle='#d92b3a'; c.strokeStyle='#141826'; c.lineWidth=2; [[12,50,8,10,34,44],[52,50,56,10,30,44]].forEach(function(p){c.beginPath(); c.moveTo(p[0],p[1]); c.quadraticCurveTo(p[2],p[3],p[4]+(p[0]<30?-6:6),p[5]-4); c.lineTo(p[4],p[5]+6); c.closePath(); c.fill(); c.stroke();});}
  else if(id==='underglow'){var g=c.createRadialGradient(32,36,2,32,36,30); g.addColorStop(0,'rgba(40,225,255,.95)'); g.addColorStop(1,'rgba(40,225,255,0)'); c.fillStyle=g; c.fillRect(0,0,64,64); c.fillStyle='#10131f'; c.fillRect(20,12,24,40);}
  else if(id==='neon'){var g2=c.createLinearGradient(0,0,64,0); ['#ff3a3a','#ffd23a','#3aff7a','#3ad0ff','#b46aff'].forEach(function(cl,i){g2.addColorStop(i/4,cl);}); c.globalAlpha=.8; c.fillStyle=g2; c.fillRect(0,12,64,40); c.globalAlpha=1; c.fillStyle='#10131f'; c.fillRect(20,12,24,40);}
  else if(id==='halo'){c.strokeStyle='#ffe27a'; c.lineWidth=5; c.beginPath(); c.ellipse(32,16,20,7,0,0,TAU); c.stroke(); c.fillStyle='#cfd5e2'; c.beginPath(); c.arc(32,44,13,0,TAU); c.fill();}
  else if(id==='crown'){c.fillStyle='#ffc83a'; c.strokeStyle='#8a5a00'; c.lineWidth=2.5; c.beginPath(); c.moveTo(10,50); c.lineTo(8,18); c.lineTo(22,32); c.lineTo(32,12); c.lineTo(42,32); c.lineTo(56,18); c.lineTo(54,50); c.closePath(); c.fill(); c.stroke(); c.fillStyle='#d92b3a'; c.beginPath(); c.arc(32,42,4,0,TAU); c.fill();}
  else if(id==='wings'){c.fillStyle='#fff'; c.strokeStyle='#ffb02a'; c.lineWidth=2.5; [-1,1].forEach(function(sd){c.beginPath(); c.moveTo(32,44); c.quadraticCurveTo(32+sd*30,40,32+sd*28,8); c.quadraticCurveTo(32+sd*18,24,32+sd*10,20); c.quadraticCurveTo(32+sd*14,34,32,34); c.closePath(); c.fill(); c.stroke();});}
  c.restore();
}
var thumbCache={};
function lookThumb(cat,id){
  var key=cat+id; if(thumbCache[key]) return thumbCache[key];
  var cv=document.createElement('canvas'); cv.width=cv.height=64; var c=cv.getContext('2d');
  if(cat==='decal'){c.fillStyle='#cfd5e2'; c.fillRect(0,0,64,64); if(id!=='none') decalDraw(id,c,64,64,true);}
  else{c.fillStyle='#252d52'; c.fillRect(0,0,64,64); if(id!=='none') accIcon(id,c,64);}
  return (thumbCache[key]=cv.toDataURL());
}
var decalG=null, decalMats=[], accG=null, accObj={}, curDe=null, curAc=null;
function disposeGroup(g){
  if(!g) return; player.remove(g);
  g.traverse(function(o){if(o.geometry) o.geometry.dispose(); if(o.material){if(o.material.map) o.material.map.dispose(); o.material.dispose();}});
}
function buildDecals(){
  disposeGroup(decalG); decalG=null; decalMats=[];
  if(!curDe || curDe.id==='none') return;
  decalG=new THREE.Group();
  function mk(w,h,cw,ch,hood){
    var cv=document.createElement('canvas'); cv.width=cw; cv.height=ch; decalDraw(curDe.id,cv.getContext('2d'),cw,ch,hood);
    var tx=new THREE.CanvasTexture(cv); tx.anisotropy=4;
    var mt=new THREE.MeshBasicMaterial({map:tx,transparent:true,depthWrite:false,side:THREE.DoubleSide,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2});
    decalMats.push(mt); return new THREE.Mesh(new THREE.PlaneGeometry(w,h),mt);
  }
  var r=mk(2.0,0.42,760,160,false); r.position.set(0.957,0.56,0); r.rotation.y=Math.PI/2; decalG.add(r);
  var l=mk(2.0,0.42,760,160,false); l.position.set(-0.957,0.56,0); l.rotation.y=-Math.PI/2; l.scale.x=-1; decalG.add(l);
  var hd=mk(1.7,1.55,340,310,true); hd.position.set(0,0.806,-1.35); hd.rotation.x=-Math.PI/2; decalG.add(hd);
  player.add(decalG);
}
function buildAcc(){
  disposeGroup(accG); accG=null; accObj={};
  if(!curAc || curAc.id==='none') return;
  accG=new THREE.Group(); var id=curAc.id, i;
  var lam=function(col,em){return new THREE.MeshLambertMaterial({color:col,emissive:em||0});};
  var bas=function(col){return new THREE.MeshBasicMaterial({color:col});};
  if(id==='antenna'){
    var pole=new THREE.Mesh(new THREE.BoxGeometry(0.04,1.0,0.04),lam(0xcfd5e2)); pole.position.set(-0.72,1.3,1.35); accG.add(pole);
    var fl=new THREE.Group(); fl.position.set(-0.72,1.72,1.35);
    var fm=new THREE.Mesh(new THREE.PlaneGeometry(0.42,0.26),new THREE.MeshBasicMaterial({color:0x009c3b,side:THREE.DoubleSide})); fm.position.set(0,0,0.21); fm.rotation.y=Math.PI/2; fl.add(fm);
    var fd=new THREE.Mesh(new THREE.PlaneGeometry(0.2,0.12),new THREE.MeshBasicMaterial({color:0xffdf00,side:THREE.DoubleSide})); fd.position.set(0.005,0,0.21); fd.rotation.y=Math.PI/2; fl.add(fd);
    accG.add(fl); accObj.flag=fl;
  }else if(id==='ears'||id==='horns'){
    [-1,1].forEach(function(sd){
      var horn=id==='horns', ge=new THREE.ConeGeometry(horn?0.1:0.17,horn?0.5:0.36,horn?8:4);
      var m=new THREE.Mesh(ge,lam(horn?0xd92b3a:0x141826,horn?0x300606:0)); m.position.set(sd*0.45,1.19+(horn?0.22:0.17),0.3); m.rotation.z=-sd*(horn?0.45:0.12); accG.add(m);
      if(!horn){var inn=new THREE.Mesh(new THREE.ConeGeometry(0.09,0.22,4),bas(0xff9ac8)); inn.position.set(sd*0.45,1.19+0.13,0.3+0.08); inn.rotation.z=-sd*0.12; accG.add(inn);}
    });
  }else if(id==='underglow'||id==='neon'){
    var neon=id==='neon', cv=document.createElement('canvas'); cv.width=cv.height=128; var g=cv.getContext('2d');
    var gr=g.createRadialGradient(64,64,10,64,64,64); gr.addColorStop(0,neon?'rgba(255,255,255,.95)':'rgba(40,225,255,.95)'); gr.addColorStop(1,neon?'rgba(255,255,255,0)':'rgba(40,225,255,0)'); g.fillStyle=gr; g.fillRect(0,0,128,128);
    var ug=new THREE.Mesh(new THREE.PlaneGeometry(3.4,6.0),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(cv),transparent:true,depthWrite:false,blending:THREE.AdditiveBlending}));
    ug.rotation.x=-Math.PI/2; ug.position.set(0,0.06,0.2); accG.add(ug); accObj.glow=ug;
  }else if(id==='halo'){
    var hl=new THREE.Mesh(new THREE.TorusGeometry(0.5,0.045,8,32),bas(0xffe27a)); hl.rotation.x=Math.PI/2; hl.position.set(0,1.75,0.35); accG.add(hl); accObj.halo=hl;
  }else if(id==='crown'){
    var cr=new THREE.Group(); cr.position.set(0,1.26,0.35);
    var gm=lam(0xffc83a,0x402800), ring=new THREE.Mesh(new THREE.CylinderGeometry(0.38,0.34,0.16,16,1,true),new THREE.MeshLambertMaterial({color:0xffc83a,emissive:0x402800,side:THREE.DoubleSide})); cr.add(ring);
    for(i=0;i<6;i++){var a=i*TAU/6, sp=new THREE.Mesh(new THREE.ConeGeometry(0.07,0.24,6),gm); sp.position.set(Math.cos(a)*0.36,0.19,Math.sin(a)*0.36); cr.add(sp); var jw=new THREE.Mesh(new THREE.SphereGeometry(0.04,6,6),bas(i%2?0xd92b3a:0x3affc8)); jw.position.set(Math.cos(a)*0.36,0.33,Math.sin(a)*0.36); cr.add(jw);}
    accG.add(cr);
  }else if(id==='wings'){
    accObj.wings=[];
    [-1,1].forEach(function(sd){
      var wg=new THREE.Group(); wg.position.set(sd*0.5,1.0,0.7);
      [[1.1,0],[0.95,0.2],[0.78,0.4],[0.6,0.6]].forEach(function(f,k){
        var ft=new THREE.Mesh(new THREE.BoxGeometry(f[0],0.035,0.26),new THREE.MeshLambertMaterial({color:k%2?0xfff4d0:0xffffff,emissive:0x665a30})); ft.position.set(sd*f[0]/2,0,f[1]); wg.add(ft);
      });
      accG.add(wg); accObj.wings.push({g:wg,sd:sd});
    });
  }
  player.add(accG);
}
function accAnim(t){
  if(!accG) return;
  if(accObj.flag) accObj.flag.rotation.y=Math.sin(t*9)*0.3;
  if(accObj.halo){accObj.halo.position.y=1.75+Math.sin(t*3)*0.05; accObj.halo.rotation.z=Math.sin(t*2)*0.06;}
  if(accObj.glow){accObj.glow.material.opacity=0.7+0.3*Math.sin(t*4); if(curAc.id==='neon') accObj.glow.material.color.setHSL((t*0.15)%1,0.9,0.6);}
  if(accObj.wings) accObj.wings.forEach(function(w){w.g.rotation.z=w.sd*(0.25+0.22*Math.sin(t*5)); w.g.rotation.y=-w.sd*0.35;});
}

function lookItem(cat,id){var a=LOOK[cat].items; for(var i=0;i<a.length;i++) if(a[i].id===id) return a[i]; return a[0];}
function loadSave(){
  var d=freshSave(false);
  try{
    var r=JSON.parse(localStorage.getItem(SAVE_KEY)||'null');
    if(r){
      d.money=Math.max(0,Math.floor(Number(r.money)||0)); d.dev=!!r.dev;
      d.name=String(r.name||'').slice(0,12); d.pid=String(r.pid||'').slice(0,64); d.acct=String(r.acct||'').slice(0,64); d.ts=Number(r.ts)||0;
      d.pend=(r.pend&&r.pend.s>0)?{s:Math.floor(r.pend.s),d:Math.floor(r.pend.d)||0}:null;
      UPG.forEach(function(u){d.up[u.id]=clamp(Math.floor(Number(r.up&&r.up[u.id])||0),0,u.max||MAXL);});
      for(var cat in LOOK){
        var ids=LOOK[cat].items.map(function(x){return x.id;});
        var own=(r.own&&Array.isArray(r.own[cat]))?r.own[cat].filter(function(x){return ids.indexOf(x)>=0;}):[];
        if(own.indexOf(ids[0])<0) own.unshift(ids[0]);
        d.own[cat]=own;
        d.sel[cat]=(r.sel&&own.indexOf(r.sel[cat])>=0)?r.sel[cat]:ids[0];
      }
    }
  }catch(e){}
  return d;
}
var save=loadSave(), up=save.up;
function persist(){save.ts=Date.now(); try{localStorage.setItem(SAVE_KEY,JSON.stringify(save));}catch(e){} acQueue();}
function money(v){return save.dev?'∞':'$ '+Math.floor(v).toLocaleString('pt-BR');}
function upPrice(u){return Math.round(u.base*Math.pow(1.7,up[u.id])/10)*10;}
function applyUpgrades(){TANK=Math.round(600*(1+0.2*up.tank));}
var tailBase=0xff3b4a, curPa=null, curNe=null, curTr=null, hslC=new THREE.Color(), mixA=new THREE.Color(), mixB=new THREE.Color();
function fxHex(h,h2,fx,t){
  if(fx==='rainbow'){hslC.setHSL((t*0.12)%1,0.85,0.55); return hslC.getHex();}
  mixA.setHex(h); mixB.setHex(h2); mixA.lerp(mixB,0.5+0.5*Math.sin(t*2.2)); return mixA.getHex();
}
function applyLook(){
  curPa=lookItem('paint',save.sel.paint); curNe=lookItem('air',save.sel.air); curTr=lookItem('trim',save.sel.trim);
  player.userData.paint.color.setHex(curPa.c); player.userData.dark.color.setHex(curTr.c); tailBase=curTr.t||0xff3b4a; player.userData.tail.color.setHex(tailBase);
  airColor=curNe.c;
  curDe=lookItem('decal',save.sel.decal); curAc=lookItem('acc',save.sel.acc); buildDecals(); buildAcc();
}
function lookFx(t){
  if(!curPa) return;
  if(curPa.fx) player.userData.paint.color.setHex(fxHex(curPa.c,curPa.c2,curPa.fx,t));
  if(curNe.fx) airColor=fxHex(curNe.c,curNe.c2,curNe.fx,t);
  if(curTr.fx) tailBase=fxHex(curTr.t,curTr.t2,curTr.fx,t);
  if(curDe.fx && decalMats.length){var dh=fxHex(curDe.c,curDe.c2,curDe.fx,t); decalMats.forEach(function(m){m.color.setHex(dh);});}
  accAnim(t);
}
function refreshMoney(){
  ['homeMoney','garMoney'].forEach(function(id){$(id).textContent=money(save.money);});
  $('homeBest').textContent=best;
}
applyUpgrades(); applyLook();
c.air=TANK;

