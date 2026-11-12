/* ---------- shared pieces ---------- */
var gB=new THREE.BoxGeometry(1,1,1), gCy=new THREE.CylinderGeometry(1,1,1,10), gCo=new THREE.ConeGeometry(1,1,9), gSp=new THREE.IcosahedronGeometry(1,1), gSp0=new THREE.IcosahedronGeometry(1,0);
var gBoxPlain=(function(){var g=new THREE.BoxGeometry(1,1,1), u=g.attributes.uv; for(var i=0;i<u.count;i++) u.setXY(i,0.004,0.004); return g;})();
var matV=new THREE.MeshLambertMaterial({vertexColors:true});
var matVB=new THREE.MeshBasicMaterial({vertexColors:true});
function facadeGeo(w,h,d,cw,ch){
  var g=new THREE.BoxGeometry(w,h,d), uv=g.attributes.uv;
  for(var f=0;f<6;f++) for(var k=0;k<4;k++){
    var i=f*4+k;
    if(f===2||f===3) uv.setXY(i,0.004,0.004);
    else uv.setXY(i,uv.getX(i)*((f<2)?d:w)/(cw*4),uv.getY(i)*h/(ch*4));
  }
  return g;
}
function makeWinTex(kind){
  var S=256, cell=S/4, cv=document.createElement('canvas'); cv.width=cv.height=S; var g=cv.getContext('2d'), ix, iy, x, y;
  if(kind==='day'){
    g.fillStyle='#ffffff'; g.fillRect(0,0,S,S);
    for(iy=0;iy<4;iy++) for(ix=0;ix<4;ix++){
      x=ix*cell; y=iy*cell;
      g.fillStyle='rgba(0,0,0,0.10)'; g.fillRect(x,y+cell-5,cell,5);
      var gr=g.createLinearGradient(0,y+10,0,y+cell-16); gr.addColorStop(0,'#86a0d0'); gr.addColorStop(1,'#2f3f66');
      g.fillStyle=gr; g.fillRect(x+13,y+10,cell-26,cell-26);
      g.fillStyle='rgba(255,255,255,0.35)'; g.fillRect(x+13,y+10,cell-26,3);
      g.fillStyle='#ffffff'; g.fillRect(x+cell/2-1,y+10,2,cell-26);
    }
  }else{
    g.fillStyle='#0b0818'; g.fillRect(0,0,S,S);
    var pal=['#ffd27a','#ffb0e8','#8ff0ff','#fff1c8','#b89bff'];
    for(iy=0;iy<4;iy++) for(ix=0;ix<4;ix++){
      g.fillStyle=Math.random()<0.4?pal[(Math.random()*pal.length)|0]:'#1b1434';
      g.fillRect(ix*cell+12,iy*cell+10,cell-24,cell-22);
    }
  }
  var t=new THREE.CanvasTexture(cv); t.wrapS=t.wrapT=THREE.RepeatWrapping; t.anisotropy=4; return t;
}
var matBldDay=new THREE.MeshLambertMaterial({map:makeWinTex('day'),vertexColors:true});
var matBldNight=new THREE.MeshBasicMaterial({map:makeWinTex('night'),vertexColors:true});

/* pools: nonlinear (scattered by density) and linear (one slot every L metres) */
var POOLS=[];
function addPool(o){
  o.items=[]; o.ptr=0;
  for(var i=0;i<o.n;i++){var m=o.mk(i); m.visible=false; scene.add(m); o.items.push({o:m,on:false,z:0,side:1});}
  POOLS.push(o); return o;
}
function addLinear(o){
  o.linear=true; o.N=Math.ceil((ENV_FAR+110)/o.L)+3; o.items=[];
  var sides=o.xs.length;
  for(var i=0;i<o.N*sides;i++){var m=o.mk(i); m.visible=false; scene.add(m); o.items.push({o:m,on:false,k:1e9,s:i%sides});}
  POOLS.push(o); return o;
}
function takeItem(pl){
  for(var i=0;i<pl.items.length;i++){
    var j=(pl.ptr+i)%pl.items.length;
    if(!pl.items[j].on){pl.ptr=(j+1)%pl.items.length; return pl.items[j];}
  }
  return null;
}
function placeItem(pl,z){
  var it=takeItem(pl); if(!it) return;
  var side=Math.random()<0.5?-1:1, off=rand(pl.near,pl.far);
  it.side=side; it.z=z; it.on=true; it.o.visible=true;
  it.o.position.set(side*off,pl.y||0,z); it.o.rotation.set(0,pl.noRot?0:rand(0,TAU),0);
  if(pl.setup) pl.setup(it,side);
}
function fillStrip(zA,zB){
  POOLS.forEach(function(pl){
    if(pl.linear) return;
    var n=(zA-zB)*pl.dens, cnt=Math.floor(n)+(Math.random()<n-Math.floor(n)?1:0);
    for(var i=0;i<cnt;i++){var z=zB+Math.random()*(zA-zB); if(bioAt(z)===pl.biome) placeItem(pl,z);}
  });
}
function linUpdate(pl){
  var L=pl.L, N=pl.N, S=pl.xs.length, kmax=Math.floor((c.z+90)/L), kmin=Math.ceil((c.z-ENV_FAR)/L), i, k, s, it;
  for(i=0;i<pl.items.length;i++){it=pl.items[i]; if(it.on&&(it.k>kmax||it.k<kmin)){it.on=false; it.o.visible=false;}}
  for(k=kmax;k>=kmin;k--){
    var z=k*L, ok=(bioAt(z)===pl.biome);
    for(s=0;s<S;s++){
      it=pl.items[(((k%N)+N)%N)*S+s];
      if(!ok){if(it.on){it.on=false; it.o.visible=false;} continue;}
      if(!it.on||it.k!==k){
        it.k=k; it.on=true; it.o.visible=true;
        it.o.position.set(pl.xs[s],pl.y||0,z+(pl.zo||0)); it.o.rotation.set(0,0,0); it.o.scale.set(1,1,1);
        if(pl.setup) pl.setup(it,k,s);
      }
    }
  }
}

