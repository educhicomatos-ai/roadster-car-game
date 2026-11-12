/* ---------- model helpers ---------- */
var geoBox=new THREE.BoxGeometry(1,1,1), geoCyl=new THREE.CylinderGeometry(1,1,1,16);
var matCache={};
function lamb(color,opts){
  var key=color+(opts?JSON.stringify(opts):'');
  if(!matCache[key]) matCache[key]=new THREE.MeshLambertMaterial(Object.assign({color:color},opts||{}));
  return matCache[key];
}
var wheelMat=lamb(0x0c0d12);
function addBox(parent,w,h,d,x,y,z,mat){var m=new THREE.Mesh(geoBox,mat); m.scale.set(w,h,d); m.position.set(x,y,z); parent.add(m); return m;}
function addWheel(parent,x,y,z,r,w){var m=new THREE.Mesh(geoCyl,wheelMat); m.scale.set(r,w,r); m.rotation.z=Math.PI/2; m.position.set(x,y,z); parent.add(m); return m;}

