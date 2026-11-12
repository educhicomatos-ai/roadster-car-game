/* ---------- renderer / scene ---------- */
var canvas=$('gl'), renderer;
try{
  renderer=new THREE.WebGLRenderer({canvas:canvas,antialias:true,powerPreference:'high-performance'});
}catch(e){
  $('ovMsg').textContent='Este navegador não conseguiu iniciar o WebGL, então o jogo 3D não abre aqui.';
  $('start').disabled=true;
  return;
}
renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.75));
renderer.toneMapping=THREE.ACESFilmicToneMapping; renderer.toneMappingExposure=1.18;
renderer.shadowMap.enabled=true; renderer.shadowMap.type=THREE.PCFShadowMap;
var scene=new THREE.Scene();
var FOG=0xe2814f;
scene.fog=new THREE.Fog(FOG,70,520);
var camera=new THREE.PerspectiveCamera(62,1,0.1,2000);
camera.position.set(0,4,10);

function resize(){
  var p=canvas.parentElement, w=Math.max(1,p.clientWidth), h=Math.max(1,p.clientHeight);
  renderer.setSize(w,h,false);
  camera.aspect=w/h;
  camera.updateProjectionMatrix();
}
window.addEventListener('resize',resize);
resize();

var hemi=new THREE.HemisphereLight(0xffc08a,0x3a2a50,0.95); scene.add(hemi);
var sunLight=new THREE.DirectionalLight(0xffa45c,0.9); sunLight.position.set(-30,40,-120); scene.add(sunLight); scene.add(sunLight.target);
sunLight.castShadow=true;
(function(){var sh=sunLight.shadow; sh.mapSize.set(1024,1024); var sc=sh.camera; sc.left=-16; sc.right=16; sc.top=34; sc.bottom=-34; sc.near=5; sc.far=220; sh.bias=-0.0004; sh.normalBias=0.03; sc.updateProjectionMatrix();})();
var sdir=new THREE.Vector3();
function shadowFollow(tx,tz,sx,sy,sz){
  sdir.set(sx,Math.max(sy,Math.hypot(sx,sz)*0.55),sz).normalize();
  sunLight.position.set(tx+sdir.x*90,sdir.y*90,tz+sdir.z*90); sunLight.target.position.set(tx,0,tz); sunLight.target.updateMatrixWorld();
}
var fillLight=new THREE.DirectionalLight(0x9db4ff,0.45); fillLight.position.set(20,30,80); scene.add(fillLight);

