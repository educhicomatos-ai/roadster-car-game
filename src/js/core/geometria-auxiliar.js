/* ---------- geometry helpers for merged, vertex-coloured props ---------- */
var _pq=new THREE.Quaternion(), _pe=new THREE.Euler(), _ps=new THREE.Vector3(), _pp=new THREE.Vector3();
function part(g,x,y,z,sx,sy,sz,col,rx,ry,rz){
  _pe.set(rx||0,ry||0,rz||0); _pq.setFromEuler(_pe);
  var m=new THREE.Matrix4().compose(_pp.set(x,y,z),_pq,_ps.set(sx,sy,sz));
  return {g:g,m:m,c:(col instanceof THREE.Color)?col.clone():new THREE.Color(col)};
}
function mergeParts(parts){
  var pos=[],nor=[],col=[],uv=[],v=new THREE.Vector3();
  parts.forEach(function(p){
    var g=p.g.index?p.g.toNonIndexed():p.g, pa=g.attributes.position, na=g.attributes.normal, ua=g.attributes.uv;
    var nm=new THREE.Matrix3().getNormalMatrix(p.m);
    for(var i=0;i<pa.count;i++){
      v.fromBufferAttribute(pa,i).applyMatrix4(p.m); pos.push(v.x,v.y,v.z);
      v.fromBufferAttribute(na,i).applyMatrix3(nm).normalize(); nor.push(v.x,v.y,v.z);
      col.push(p.c.r,p.c.g,p.c.b);
      if(ua) uv.push(ua.getX(i),ua.getY(i)); else uv.push(0.004,0.004);
    }
  });
  var out=new THREE.BufferGeometry();
  out.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));
  out.setAttribute('normal',new THREE.Float32BufferAttribute(nor,3));
  out.setAttribute('color',new THREE.Float32BufferAttribute(col,3));
  out.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
  return out;
}
function softTex(inner,outer){
  var cv=document.createElement('canvas'); cv.width=cv.height=128; var g=cv.getContext('2d');
  var gr=g.createRadialGradient(64,64,0,64,64,64); gr.addColorStop(0,inner); gr.addColorStop(1,outer);
  g.fillStyle=gr; g.fillRect(0,0,128,128); return new THREE.CanvasTexture(cv);
}
function beamTex(){
  var cv=document.createElement('canvas'); cv.width=64; cv.height=256; var g=cv.getContext('2d');
  var h=g.createLinearGradient(0,0,64,0); h.addColorStop(0,'rgba(255,255,255,0)'); h.addColorStop(0.5,'rgba(255,255,255,1)'); h.addColorStop(1,'rgba(255,255,255,0)');
  g.fillStyle=h; g.fillRect(0,0,64,256);
  g.globalCompositeOperation='destination-in';
  var v=g.createLinearGradient(0,0,0,256); v.addColorStop(0,'rgba(0,0,0,0)'); v.addColorStop(1,'rgba(0,0,0,1)');
  g.fillStyle=v; g.fillRect(0,0,64,256); return new THREE.CanvasTexture(cv);
}

